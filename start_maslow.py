#!/usr/bin/env python3
"""
Maslow CNC Serial Interface Startup Script
Launches both the FastAPI backend and Vite frontend
"""

import subprocess
import sys
import os
import time
import webbrowser
import signal
import threading
from pathlib import Path

# Get the directory where this script is located
SCRIPT_DIR = Path(__file__).parent.absolute()
BACKEND_DIR = SCRIPT_DIR / "backend"
FRONTEND_DIR = SCRIPT_DIR / "frontend"

class MaslowLauncher:
    def __init__(self):
        self.backend_process = None
        self.frontend_process = None
        self.running = True
        self.frontend_port = 3003  # Default port, will be updated from Vite output
        
    def check_dependencies(self):
        """Check if required dependencies are installed"""
        print("🔍 Checking dependencies...")
        
        # Check Python dependencies
        try:
            import fastapi
            import uvicorn
            import serial
            print("✅ Python dependencies found")
        except ImportError as e:
            print(f"❌ Missing Python dependency: {e}")
            print("Installing Python dependencies...")
            subprocess.run([sys.executable, "-m", "pip", "install", "-r", str(BACKEND_DIR / "requirements.txt")])
        
        # Check if Node.js is available
        try:
            result = subprocess.run(["node", "--version"], capture_output=True, text=True)
            if result.returncode == 0:
                print(f"✅ Node.js found: {result.stdout.strip()}")
            else:
                raise FileNotFoundError
        except FileNotFoundError:
            print("❌ Node.js not found. Please install Node.js to run the frontend.")
            sys.exit(1)
        
        # Check if frontend dependencies are installed
        if not (FRONTEND_DIR / "node_modules").exists():
            print("📦 Installing frontend dependencies...")
            subprocess.run(["npm", "install"], cwd=FRONTEND_DIR, check=True)
        else:
            print("✅ Frontend dependencies found")
    
    def find_serial_port(self):
        """Find the Maslow serial port"""
        import serial.tools.list_ports
        
        # Try the known port first
        known_port = "/dev/cu.usbmodem12201"
        if os.path.exists(known_port):
            return known_port
        
        # Search for USB serial devices
        ports = serial.tools.list_ports.comports()
        for port in ports:
            if "usb" in port.device.lower() or "acm" in port.device.lower():
                return port.device
        
        return None
    
    def start_backend(self):
        """Start the FastAPI backend server"""
        print("🚀 Starting backend server...")
        
        # Find serial port
        serial_port = self.find_serial_port()
        if serial_port:
            print(f"📡 Found serial port: {serial_port}")
            os.environ["MASLOW_SERIAL_PORT"] = serial_port
        else:
            print("⚠️  No serial port found - backend will start without serial connection")
        
        # Start backend
        cmd = [
            sys.executable, "-m", "uvicorn", 
            "maslow_serial_server:app",
            "--host", "0.0.0.0",
            "--port", "8003",
            "--reload"
        ]
        
        self.backend_process = subprocess.Popen(
            cmd,
            cwd=BACKEND_DIR,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True
        )
        
        # Wait for backend to start
        time.sleep(3)
        print("✅ Backend server started on http://localhost:8003")
    
    def start_frontend(self):
        """Start the Vite frontend development server"""
        print("🎨 Starting frontend server...")
        
        cmd = ["npm", "run", "dev"]
        
        self.frontend_process = subprocess.Popen(
            cmd,
            cwd=FRONTEND_DIR,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True
        )
        
        # Wait for frontend to start and parse the port from output
        frontend_started = False
        start_time = time.time()
        
        while not frontend_started and time.time() - start_time < 30:  # 30 second timeout
            line = self.frontend_process.stdout.readline()
            if line:
                print(f"[FRONTEND] {line.strip()}")
                # Parse port from Vite output like "➜  Local:   http://localhost:3004/"
                if "Local:" in line and "localhost:" in line:
                    try:
                        # Extract port from URL
                        import re
                        match = re.search(r'localhost:(\d+)', line)
                        if match:
                            self.frontend_port = int(match.group(1))
                            print(f"🎯 Detected frontend port: {self.frontend_port}")
                            frontend_started = True
                    except (ValueError, AttributeError):
                        pass
            time.sleep(0.1)
        
        if not frontend_started:
            print("⚠️ Frontend startup detection timed out, using default port 3003")
            self.frontend_port = 3003
        
        print(f"✅ Frontend server started on http://localhost:{self.frontend_port}")
    
    def open_browser(self):
        """Open the interface in the default browser"""
        print("🌐 Opening browser...")
        time.sleep(2)
        browser_url = f"http://localhost:{self.frontend_port}"
        print(f"🔗 Opening: {browser_url}")
        webbrowser.open(browser_url)
    
    def monitor_processes(self):
        """Monitor backend and frontend processes"""
        def monitor_backend():
            if self.backend_process:
                for line in iter(self.backend_process.stdout.readline, ''):
                    if self.running:
                        print(f"[BACKEND] {line.strip()}")
                    else:
                        break
        
        def monitor_frontend():
            if self.frontend_process:
                for line in iter(self.frontend_process.stdout.readline, ''):
                    if self.running:
                        print(f"[FRONTEND] {line.strip()}")
                    else:
                        break
        
        # Start monitoring threads
        if self.backend_process:
            threading.Thread(target=monitor_backend, daemon=True).start()
        if self.frontend_process:
            threading.Thread(target=monitor_frontend, daemon=True).start()
    
    def signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        print("\n🛑 Shutting down Maslow interface...")
        self.running = False
        
        if self.backend_process:
            self.backend_process.terminate()
            print("✅ Backend server stopped")
        
        if self.frontend_process:
            self.frontend_process.terminate()
            print("✅ Frontend server stopped")
        
        sys.exit(0)
    
    def run(self):
        """Main run method"""
        # Set up signal handlers
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
        
        print("=" * 60)
        print("🔧 MASLOW CNC SERIAL INTERFACE")
        print("=" * 60)
        
        try:
            self.check_dependencies()
            self.start_backend()
            self.start_frontend()
            self.open_browser()
            self.monitor_processes()
            
            print("\n" + "=" * 60)
            print("✅ Maslow interface is running!")
            print(f"🌐 Frontend: http://localhost:{self.frontend_port}")
            print("🔧 Backend API: http://localhost:8003")
            print("📡 WebSocket: ws://localhost:8003/ws")
            print("\nPress Ctrl+C to stop")
            print("=" * 60)
            
            # Keep the main thread alive
            while self.running:
                time.sleep(1)
                
                # Check if processes are still running
                if self.backend_process and self.backend_process.poll() is not None:
                    print("❌ Backend process died")
                    break
                    
                if self.frontend_process and self.frontend_process.poll() is not None:
                    print("❌ Frontend process died")
                    break
        
        except KeyboardInterrupt:
            self.signal_handler(signal.SIGINT, None)
        except Exception as e:
            print(f"❌ Error: {e}")
            self.signal_handler(signal.SIGTERM, None)

if __name__ == "__main__":
    launcher = MaslowLauncher()
    launcher.run() 