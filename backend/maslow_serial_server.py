#!/usr/bin/env python3
"""
Maslow CNC Serial Server
FastAPI backend with WebSocket support for real-time communication
"""

import asyncio
import json
import os
import threading
import time
from pathlib import Path
from typing import Dict, List, Optional, Any
import logging

import serial
import serial.tools.list_ports
import yaml
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
SERIAL_PORT = os.getenv("MASLOW_SERIAL_PORT", "/dev/cu.usbmodem12201")
BAUD_RATE = 115200
CONFIG_DIR = Path(__file__).parent.parent / "config"
GCODE_DIR = Path(__file__).parent.parent / "gcode_files"

# Ensure directories exist
GCODE_DIR.mkdir(exist_ok=True)

# Pydantic models
class SerialCommand(BaseModel):
    command: str
    wait_time: Optional[float] = 2.0

class JogCommand(BaseModel):
    axis: str  # X, Y, Z
    distance: float
    feed_rate: Optional[int] = 1000

class MachineStatus(BaseModel):
    connected: bool
    status: str
    position: Dict[str, float]
    feed_rate: float
    spindle_speed: float

class ConfigUpdate(BaseModel):
    config: Dict[str, Any]

# Global variables
app = FastAPI(title="Maslow CNC Serial API", version="1.0.0")
serial_connection: Optional[serial.Serial] = None
connected_clients: List[WebSocket] = []
machine_status = {
    "connected": False,
    "status": "Disconnected",
    "position": {"x": 0.0, "y": 0.0, "z": 0.0},
    "feed_rate": 0.0,
    "spindle_speed": 0.0
}

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SerialManager:
    """Manages serial communication with the Maslow CNC"""
    
    def __init__(self):
        self.serial_port = None
        self.is_connected = False
        self.read_thread = None
        self.stop_reading = False
        self.message_queue = []
    
    def add_to_queue(self, message: dict):
        """Add message to queue for WebSocket broadcasting"""
        self.message_queue.append(message)
        
    def get_queued_messages(self) -> List[dict]:
        """Get and clear queued messages"""
        messages = self.message_queue.copy()
        self.message_queue.clear()
        return messages
        
    def find_serial_port(self) -> Optional[str]:
        """Find the Maslow serial port"""
        # Try the known port first
        if os.path.exists(SERIAL_PORT):
            return SERIAL_PORT
        
        # Search for USB serial devices
        ports = serial.tools.list_ports.comports()
        for port in ports:
            if "usb" in port.device.lower() or "acm" in port.device.lower():
                return port.device
        
        return None
    
    def connect(self) -> bool:
        """Connect to the serial port"""
        try:
            port = self.find_serial_port()
            if not port:
                logger.error("No serial port found")
                return False
            
            self.serial_port = serial.Serial(port, BAUD_RATE, timeout=1)
            time.sleep(2)  # Let connection settle
            
            # Clear buffers
            self.serial_port.flushInput()
            self.serial_port.flushOutput()
            
            self.is_connected = True
            machine_status["connected"] = True
            machine_status["status"] = "Connected"
            
            # Start reading thread
            self.stop_reading = False
            self.read_thread = threading.Thread(target=self._read_serial, daemon=True)
            self.read_thread.start()
            
            logger.info(f"Connected to Maslow at {port}")
            
            # Send initial status query
            self.send_command("?")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to serial port: {e}")
            self.is_connected = False
            machine_status["connected"] = False
            machine_status["status"] = f"Connection Error: {e}"
            return False
    
    def disconnect(self):
        """Disconnect from serial port"""
        self.stop_reading = True
        if self.serial_port and self.serial_port.is_open:
            self.serial_port.close()
        self.is_connected = False
        machine_status["connected"] = False
        machine_status["status"] = "Disconnected"
        logger.info("Disconnected from Maslow")
    
    def send_command(self, command: str, wait_time: float = 2.0) -> List[str]:
        """Send command to Maslow and return responses"""
        if not self.is_connected or not self.serial_port:
            raise Exception("Not connected to Maslow")
        
        responses = []
        try:
            # Send command
            self.serial_port.write((command + "\n").encode())
            logger.info(f"Sent command: {command}")
            
            # Add command to queue for WebSocket broadcasting
            self.add_to_queue({
                "type": "command_sent",
                "command": command,
                "timestamp": time.time()
            })
            
            # Wait for responses
            start_time = time.time()
            while time.time() - start_time < wait_time:
                if self.serial_port.in_waiting > 0:
                    response = self.serial_port.readline().decode('utf-8', errors='ignore').strip()
                    if response:
                        responses.append(response)
                        logger.info(f"Response: {response}")
                        # Add response to queue for WebSocket broadcasting
                        self.add_to_queue({
                            "type": "serial_response",
                            "data": response,
                            "timestamp": time.time()
                        })
                else:
                    time.sleep(0.1)
            
            return responses
            
        except Exception as e:
            logger.error(f"Error sending command '{command}': {e}")
            raise
    
    def _read_serial(self):
        """Continuously read from serial port"""
        while not self.stop_reading and self.is_connected:
            try:
                if self.serial_port and self.serial_port.in_waiting > 0:
                    data = self.serial_port.readline().decode('utf-8', errors='ignore').strip()
                    if data:
                        self._process_response(data)
                else:
                    time.sleep(0.1)
            except Exception as e:
                logger.error(f"Error reading serial: {e}")
                break
    
    def _process_response(self, response: str):
        """Process responses from Maslow"""
        logger.info(f"Received: {response}")
        
        # Parse status responses
        if response.startswith("<"):
            self._parse_status_response(response)
        
        # Add to queue for WebSocket broadcasting
        self.add_to_queue({
            "type": "serial_response",
            "data": response,
            "timestamp": time.time()
        })
    
    def _parse_status_response(self, response: str):
        """Parse status response from Maslow"""
        try:
            # Skip if response is too short or incomplete
            if len(response) < 5 or not response.startswith("<") or ">" not in response:
                return
            
            # Store old status for comparison
            old_status = machine_status.copy()
                
            # Example: <Idle|MPos:0.000,0.000,0.000|FS:0,0>
            if "|MPos:" in response:
                # Extract position
                pos_start = response.find("|MPos:") + 6
                pos_end = response.find("|", pos_start)
                if pos_end == -1:
                    pos_end = response.find(">", pos_start)
                
                if pos_end > pos_start:  # Ensure we have valid bounds
                    pos_str = response[pos_start:pos_end]
                    coords = pos_str.split(",")
                    
                    # Only parse if we have complete coordinate data
                    if len(coords) >= 3 and all(coord.strip() for coord in coords[:3]):
                        try:
                            machine_status["position"] = {
                                "x": float(coords[0].strip()) if coords[0].strip() and coords[0].strip() != 'nan' else 0.0,
                                "y": float(coords[1].strip()) if coords[1].strip() and coords[1].strip() != 'nan' else 0.0,
                                "z": float(coords[2].strip()) if coords[2].strip() and coords[2].strip() != 'nan' else 0.0
                            }
                        except ValueError:
                            # Skip this update if coordinate parsing fails
                            pass
            
            # Extract status (Idle, Run, Hold, etc.)
            if response.startswith("<"):
                status_end = response.find("|")
                if status_end > 1:
                    status = response[1:status_end].strip()
                    if status:  # Only update if we have a valid status
                        machine_status["status"] = status
                        logger.info(f"Status updated to: {status}")
            
            # Extract feed rate and spindle speed
            if "|FS:" in response:
                fs_start = response.find("|FS:") + 4
                fs_end = response.find("|", fs_start)
                if fs_end == -1:
                    fs_end = response.find(">", fs_start)
                
                if fs_end > fs_start:  # Ensure we have valid bounds
                    fs_str = response[fs_start:fs_end]
                    fs_parts = fs_str.split(",")
                    
                    # Only parse if we have complete feed rate data
                    if len(fs_parts) >= 2 and all(part.strip() for part in fs_parts[:2]):
                        try:
                            machine_status["feed_rate"] = float(fs_parts[0].strip())
                            machine_status["spindle_speed"] = float(fs_parts[1].strip())
                        except ValueError:
                            # Skip this update if feed rate parsing fails
                            pass
            
            # Check if status changed and log it
            if old_status["status"] != machine_status["status"]:
                logger.info(f"Machine status changed from '{old_status['status']}' to '{machine_status['status']}'")
                # Add to message queue for immediate broadcast
                self.add_to_queue({
                    "type": "status_update",
                    "status": machine_status
                })
                    
        except Exception as e:
            logger.error(f"Error parsing status response: {e}")

# Global serial manager
serial_manager = SerialManager()

async def broadcast_message(message: Dict):
    """Broadcast message to all connected WebSocket clients"""
    if connected_clients:
        disconnected = []
        for client in connected_clients:
            try:
                await client.send_json(message)
            except:
                disconnected.append(client)
        
        # Remove disconnected clients
        for client in disconnected:
            connected_clients.remove(client)

# API Routes

@app.on_event("startup")
async def startup_event():
    """Initialize serial connection and start background tasks on startup"""
    logger.info("Starting Maslow Serial Server...")
    serial_manager.connect()
    
    # Start background tasks
    asyncio.create_task(status_monitor())
    asyncio.create_task(message_queue_processor())

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up on shutdown"""
    logger.info("Shutting down Maslow Serial Server...")
    serial_manager.disconnect()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time communication"""
    await websocket.accept()
    connected_clients.append(websocket)
    
    # Send initial status
    await websocket.send_json({
        "type": "status_update",
        "status": machine_status
    })
    
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_json()
            
            if data.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
            elif data.get("type") == "request_status":
                await websocket.send_json({
                    "type": "status_update", 
                    "status": machine_status
                })
                
    except WebSocketDisconnect:
        connected_clients.remove(websocket)

@app.get("/api/status")
async def get_status():
    """Get current machine status"""
    return machine_status

@app.post("/api/connect")
async def connect_serial():
    """Connect to serial port"""
    success = serial_manager.connect()
    if success:
        await broadcast_message({
            "type": "connection_status",
            "connected": True
        })
        return {"success": True, "message": "Connected to Maslow"}
    else:
        return {"success": False, "message": "Failed to connect"}

@app.post("/api/disconnect")
async def disconnect_serial():
    """Disconnect from serial port"""
    serial_manager.disconnect()
    await broadcast_message({
        "type": "connection_status",
        "connected": False
    })
    return {"success": True, "message": "Disconnected from Maslow"}

@app.post("/api/command")
async def send_command(cmd: SerialCommand):
    """Send a command to the Maslow"""
    try:
        responses = serial_manager.send_command(cmd.command, cmd.wait_time)
        return {"success": True, "responses": responses}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Maslow-specific commands
@app.post("/api/maslow/retract_all")
async def retract_all():
    """Retract all anchor chains"""
    try:
        responses = serial_manager.send_command("G91 G0 Z-10")  # Adjust command as needed
        return {"success": True, "responses": responses}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/maslow/extend_all") 
async def extend_all():
    """Extend all anchor chains"""
    try:
        responses = serial_manager.send_command("G91 G0 Z10")  # Adjust command as needed
        return {"success": True, "responses": responses}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/maslow/apply_tension")
async def apply_tension():
    """Apply tension to chains"""
    try:
        responses = serial_manager.send_command("$Maslow/ApplyTension")  # Adjust command as needed
        return {"success": True, "responses": responses}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/maslow/release_tension")
async def release_tension():
    """Release chain tension"""
    try:
        responses = serial_manager.send_command("$Maslow/ReleaseTension")  # Adjust command as needed
        return {"success": True, "responses": responses}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/maslow/find_anchors")
async def find_anchor_locations():
    """Find anchor locations (calibration)"""
    try:
        responses = serial_manager.send_command("$Maslow/FindAnchors")  # Adjust command as needed
        return {"success": True, "responses": responses}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/maslow/test")
async def test_maslow():
    """Run Maslow test routine"""
    try:
        responses = serial_manager.send_command("$Maslow/Test")  # Adjust command as needed
        return {"success": True, "responses": responses}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/maslow/set_z_stop")
async def set_z_stop():
    """Set Z-axis stop position"""
    try:
        responses = serial_manager.send_command("$Maslow/SetZStop")  # Adjust command as needed
        return {"success": True, "responses": responses}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Movement commands
@app.post("/api/jog")
async def jog_axis(jog: JogCommand):
    """Jog an axis"""
    try:
        command = f"G91 G0 {jog.axis.upper()}{jog.distance} F{jog.feed_rate}"
        responses = serial_manager.send_command(command)
        return {"success": True, "responses": responses}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/home")
async def home_all():
    """Home all axes"""
    try:
        responses = serial_manager.send_command("$H")
        return {"success": True, "responses": responses}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/home/xy")
async def home_xy():
    """Home X and Y axes only"""
    try:
        responses = serial_manager.send_command("$HX$HY")
        return {"success": True, "responses": responses}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/home/z")
async def home_z():
    """Home Z axis only"""
    try:
        responses = serial_manager.send_command("$HZ")
        return {"success": True, "responses": responses}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/set_origin/xy")
async def set_xy_origin():
    """Set current XY position as work origin (0,0)"""
    try:
        responses = serial_manager.send_command("G10 L20 P1 X0 Y0")
        return {"success": True, "responses": responses}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/set_origin/z")
async def set_z_origin():
    """Set current Z position as work origin (0)"""
    try:
        responses = serial_manager.send_command("G10 L20 P1 Z0")
        return {"success": True, "responses": responses}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/unlock")
async def unlock_machine():
    """Unlock machine (clear alarms)"""
    try:
        responses = serial_manager.send_command("$X")
        return {"success": True, "responses": responses}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/stop")
async def emergency_stop():
    """Emergency stop"""
    try:
        # Send multiple stop commands for safety
        serial_manager.send_command("!")  # Feed hold
        serial_manager.send_command("~")  # Cycle start/resume
        serial_manager.send_command("\x18")  # Soft reset
        return {"success": True, "message": "Emergency stop executed"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Configuration management
@app.get("/api/config/maslow")
async def get_maslow_config():
    """Get Maslow configuration"""
    try:
        config_file = CONFIG_DIR / "maslow.yaml"
        if config_file.exists():
            with open(config_file, 'r') as f:
                config = yaml.safe_load(f)
            return {"success": True, "config": config}
        else:
            return {"success": False, "message": "Config file not found"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/config/maslow")
async def update_maslow_config(config_update: ConfigUpdate):
    """Update Maslow configuration"""
    try:
        config_file = CONFIG_DIR / "maslow.yaml"
        with open(config_file, 'w') as f:
            yaml.safe_dump(config_update.config, f, default_flow_style=False)
        return {"success": True, "message": "Configuration updated"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/config/preferences")
async def get_preferences():
    """Get UI preferences"""
    try:
        prefs_file = CONFIG_DIR / "preferences.json"
        if prefs_file.exists():
            with open(prefs_file, 'r') as f:
                prefs = json.load(f)
            return {"success": True, "preferences": prefs}
        else:
            return {"success": False, "message": "Preferences file not found"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# File management
@app.get("/api/files")
async def list_gcode_files():
    """List G-code files"""
    try:
        files = []
        for file_path in GCODE_DIR.glob("*.gcode"):
            stat = file_path.stat()
            files.append({
                "name": file_path.name,
                "size": stat.st_size,
                "modified": stat.st_mtime
            })
        return {"success": True, "files": files}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/files/upload")
async def upload_gcode_file(file: UploadFile = File(...)):
    """Upload a G-code file"""
    try:
        if not file.filename.endswith(('.gcode', '.nc', '.ngc')):
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        file_path = GCODE_DIR / file.filename
        with open(file_path, 'wb') as f:
            content = await file.read()
            f.write(content)
        
        return {"success": True, "message": f"File {file.filename} uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Status monitoring task
async def status_monitor():
    """Periodically update machine status"""
    while True:
        if serial_manager.is_connected:
            try:
                serial_manager.send_command("?", wait_time=0.5)
            except:
                pass
        
        # Broadcast status update
        await broadcast_message({
            "type": "status_update",
            "status": machine_status
        })
        
        await asyncio.sleep(3)  # Update every 3 seconds

# Message queue processor task
async def message_queue_processor():
    """Process queued messages and broadcast to WebSocket clients"""
    while True:
        if serial_manager:
            messages = serial_manager.get_queued_messages()
            for message in messages:
                await broadcast_message(message)
        
        await asyncio.sleep(0.1)  # Process queue every 100ms

# Start background tasks
# @app.on_event("startup")  # REMOVED - combined with main startup handler
# async def start_background_tasks():
#     asyncio.create_task(status_monitor())
#     asyncio.create_task(message_queue_processor())

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8003) 