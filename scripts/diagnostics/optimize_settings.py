#!/usr/bin/env python3
"""
Optimize Flash Settings
Adjust settings for better performance and less log spam
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

def optimize_settings(port="/dev/cu.usbmodem12201", baudrate=115200):
    """Optimize flash settings for better performance"""
    print("🔧 Optimizing Flash Settings...")
    
    try:
        ser = serial.Serial(port, baudrate, timeout=2)
        time.sleep(2)
        
        # Clear buffers
        ser.flushInput()
        ser.flushOutput()
        
        optimizations = [
            ("Reduce log spam", "$Message/Level=Info"),
            ("Allow web during motion", "$HTTP/BlockDuringMotion=OFF"),
        ]
        
        for description, command in optimizations:
            print(f"\n🔧 {description}...")
            send_command(ser, command)
        
        print("\n📊 Checking current settings...")
        send_command(ser, "$Message/Level")
        send_command(ser, "$HTTP/BlockDuringMotion")
        
        print("\n💾 Settings updated! They'll take effect on next restart.")
        
        ser.close()
        print("\n✅ Optimization completed!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    optimize_settings() 