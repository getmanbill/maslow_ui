#!/usr/bin/env python3
"""
Update WiFi SSID to new 2.4GHz network
"""

import serial
import time

def send_command(ser, command, wait_time=3):
    """Send a command and read the response"""
    print(f"📤 Sending: {command}")
    ser.write((command + "\n").encode())
    time.sleep(wait_time)
    
    while ser.in_waiting > 0:
        line = ser.readline().decode('utf-8', errors='ignore').strip()
        if line:
            print(f"📥 {line}")

def update_wifi_ssid(port="/dev/cu.usbmodem12201", baudrate=115200):
    """Update WiFi SSID to the new 2.4GHz network"""
    print("🔧 Updating WiFi SSID to bluecastleinn2_2.4...")
    
    try:
        ser = serial.Serial(port, baudrate, timeout=2)
        time.sleep(2)
        
        # Clear buffers
        ser.flushInput()
        ser.flushOutput()
        
        print("1️⃣ Setting new SSID...")
        send_command(ser, "$Sta/SSID=bluecastleinn2_2.4")
        
        print("\n2️⃣ Verifying SSID...")
        send_command(ser, "$Sta/SSID")
        
        print("\n3️⃣ Checking password is still set...")
        send_command(ser, "$Sta/Password")
        
        print("\n4️⃣ Scanning for the new network...")
        send_command(ser, "$ESP410", wait_time=5)
        
        print("\n5️⃣ Attempting to connect...")
        send_command(ser, "$ESP444=RESTART")
        
        print("\n⏳ Waiting for restart and connection...")
        time.sleep(8)
        
        print("\n6️⃣ Checking final status...")
        send_command(ser, "$ESP420", wait_time=4)
        
        ser.close()
        print("\n✅ WiFi SSID update completed!")
        print("🌐 Your Maslow should now connect to the 2.4GHz network only!")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    update_wifi_ssid() 