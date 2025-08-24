#!/usr/bin/env python3
"""
Maslow Serial Connection Tool
Connect via USB serial to diagnose and interact with Maslow
"""

import serial
import time
import threading

def serial_session(port="/dev/cu.usbmodem12201", baudrate=115200):
    """Interactive serial session with the Maslow"""
    print(f"🔗 Connecting to Maslow via {port} at {baudrate} baud...")
    
    try:
        ser = serial.Serial(port, baudrate, timeout=1)
        time.sleep(2)  # Let connection settle
        print("✅ Connected!")
        
        # Clear any existing data
        ser.flushInput()
        ser.flushOutput()
        
        # Function to read responses continuously
        def read_responses():
            while True:
                try:
                    if ser.in_waiting > 0:
                        data = ser.readline().decode('utf-8', errors='ignore').strip()
                        if data:
                            print(f"📥 {data}")
                except:
                    break
        
        # Start reading responses in background
        reader_thread = threading.Thread(target=read_responses, daemon=True)
        reader_thread.start()
        
        time.sleep(2)  # Let initial messages come through
        
        # Send diagnostic commands
        commands = [
            "$I",           # Get build info
            "$$",           # Get all settings  
            "?",            # Get status
            "$ESP420",      # Get WiFi status (FluidNC command)
            "$Localfs/List" # List files (FluidNC command)
        ]
        
        for cmd in commands:
            print(f"📤 Sending: {cmd}")
            ser.write((cmd + "\n").encode())
            time.sleep(3)  # Wait for response
        
        # Keep connection open to see all responses
        print("⏳ Waiting for more responses...")
        time.sleep(10)
        
        ser.close()
        print("🔌 Serial connection closed")
        
    except serial.SerialException as e:
        print(f"❌ Serial Error: {e}")
        print("💡 Try: sudo chmod 666 /dev/cu.usbmodem12201")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    serial_session() 