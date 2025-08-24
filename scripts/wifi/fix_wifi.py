#!/usr/bin/env python3
"""
Fix WiFi SSID and Restart Connection
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

def fix_wifi(port="/dev/cu.usbmodem12201", baudrate=115200):
    """Fix the WiFi SSID and restart connection"""
    print("🔧 Fixing WiFi SSID...")
    
    try:
        ser = serial.Serial(port, baudrate, timeout=2)
        time.sleep(2)
        
        # Clear buffers
        ser.flushInput()
        ser.flushOutput()
        
        # Set correct SSID
        send_command(ser, "$Sta/SSID=bluecastleinn2")
        
        # Check if it's set correctly
        send_command(ser, "$Sta/SSID")
        
        # Restart WiFi connection
        print("\n🔄 Restarting WiFi connection...")
        send_command(ser, "$ESP444")  # WiFi restart command
        
        # Wait a bit and check status
        time.sleep(5)
        print("\n📊 Checking connection status...")
        send_command(ser, "$ESP420", wait_time=3)
        
        ser.close()
        print("\n✅ WiFi fix completed!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    fix_wifi() 