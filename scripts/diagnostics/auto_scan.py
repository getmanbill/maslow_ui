#!/usr/bin/env python3
"""
Auto Scan - Run diagnostic commands automatically
"""

import serial
import time

def send_command(ser, command, wait_time=3):
    """Send a command and read the response"""
    print(f"📤 Sending: {command}")
    ser.write((command + "\n").encode())
    time.sleep(wait_time)
    
    responses = []
    while ser.in_waiting > 0:
        line = ser.readline().decode('utf-8', errors='ignore').strip()
        if line:
            print(f"📥 {line}")
            responses.append(line)
    
    return responses

def auto_scan(port="/dev/cu.usbmodem12201", baudrate=115200):
    """Run all diagnostic commands automatically"""
    print("🔧 Auto Diagnostic Scan")
    print("=" * 50)
    
    try:
        ser = serial.Serial(port, baudrate, timeout=2)
        time.sleep(2)
        
        # Clear buffers
        ser.flushInput()
        ser.flushOutput()
        
        commands = [
            ("Unlock/Reset", "$X"),
            ("All Settings", "$$"),
            ("WiFi Status", "$ESP420"),
            ("Network Scan", "$ESP410"),
            ("Current Status", "?"),
            ("SSID Check", "$Sta/SSID"),
            ("WiFi Mode", "$WiFi/Mode"),
        ]
        
        for description, cmd in commands:
            print(f"\n{'='*20} {description} {'='*20}")
            send_command(ser, cmd)
        
        ser.close()
        print("\n✅ Diagnostic scan completed!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    auto_scan() 