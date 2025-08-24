#!/usr/bin/env python3
"""
Unlock Maslow from Alarm State
Send $X command to clear alarm and enable full functionality
"""

import serial
import time

def unlock_maslow(port="/dev/cu.usbmodem12201", baudrate=115200):
    """Send unlock command to clear alarm state"""
    print(f"🔗 Connecting to unlock Maslow...")
    
    try:
        ser = serial.Serial(port, baudrate, timeout=2)
        time.sleep(2)
        print("✅ Connected!")
        
        # Clear any existing data
        ser.flushInput()
        ser.flushOutput()
        
        # Send unlock command
        print("📤 Sending unlock command: $X")
        ser.write("$X\n".encode())
        time.sleep(2)
        
        # Read response
        response = ser.readline().decode('utf-8', errors='ignore').strip()
        print(f"📥 Response: {response}")
        
        # Check status after unlock
        print("📤 Checking status: ?")
        ser.write("?\n".encode())
        time.sleep(2)
        
        status = ser.readline().decode('utf-8', errors='ignore').strip()
        print(f"📥 Status: {status}")
        
        if "Alarm" not in status:
            print("✅ Alarm cleared! Machine should be ready.")
        else:
            print("⚠️  Still in alarm state. May need homing or other action.")
        
        ser.close()
        print("🔌 Connection closed")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    unlock_maslow() 