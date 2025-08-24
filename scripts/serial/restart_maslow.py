#!/usr/bin/env python3
"""
Restart Maslow via Serial
Send restart command and monitor the boot process
"""

import serial
import time

def send_command(ser, command, wait_time=2):
    """Send a command and read the response"""
    print(f"📤 Sending: {command}")
    ser.write((command + "\n").encode())
    time.sleep(wait_time)
    
    while ser.in_waiting > 0:
        line = ser.readline().decode('utf-8', errors='ignore').strip()
        if line:
            print(f"📥 {line}")

def restart_maslow(port="/dev/cu.usbmodem12201", baudrate=115200):
    """Restart the Maslow and monitor boot process"""
    print("🔄 Restarting Maslow...")
    
    try:
        ser = serial.Serial(port, baudrate, timeout=2)
        time.sleep(2)
        
        # Clear buffers
        ser.flushInput()
        ser.flushOutput()
        
        # Send restart command
        print("📤 Sending restart command...")
        send_command(ser, "$ESP444=RESTART")
        
        # Wait for restart
        print("\n⏳ Waiting for restart...")
        time.sleep(3)
        
        # Monitor boot messages for 10 seconds
        print("👀 Monitoring boot process...")
        start_time = time.time()
        while time.time() - start_time < 10:
            if ser.in_waiting > 0:
                line = ser.readline().decode('utf-8', errors='ignore').strip()
                if line:
                    timestamp = time.strftime("%H:%M:%S")
                    print(f"[{timestamp}] {line}")
        
        # Check final status
        print("\n📊 Final status check...")
        send_command(ser, "$ESP420", wait_time=3)
        
        ser.close()
        print("\n✅ Restart completed!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    restart_maslow() 