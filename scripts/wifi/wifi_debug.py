#!/usr/bin/env python3
"""
WiFi Debug via Serial
Send commands to check and configure WiFi settings
"""

import serial
import time

def send_command(ser, command, wait_time=2):
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

def wifi_debug(port="/dev/cu.usbmodem12201", baudrate=115200):
    """Debug WiFi settings via serial"""
    print("🔧 WiFi Debug via Serial")
    print("=" * 50)
    
    try:
        ser = serial.Serial(port, baudrate, timeout=2)
        time.sleep(2)
        
        # Clear buffers
        ser.flushInput()
        ser.flushOutput()
        
        # Check current WiFi settings
        commands = [
            "$ESP420",                    # WiFi status
            "$Sta/SSID",                 # Check current SSID
            "$Sta/Password",             # Check current password (will show as set/unset)
            "$WiFi/Mode",                # Check WiFi mode
            "$ESP410",                   # List available networks
        ]
        
        for cmd in commands:
            send_command(ser, cmd)
            print("-" * 30)
        
        # Interactive mode
        print("\n🎯 Interactive Mode - Enter commands or 'quit':")
        print("Useful commands:")
        print("  $Sta/SSID=bluecastleinn2")
        print("  $Sta/Password=yourpassword")
        print("  $WiFi/Mode=STA")
        print("  $$                        (show all settings)")
        print("  $ESP420                   (WiFi status)")
        print("  $ESP410                   (scan networks)")
        print("  $X                        (unlock/reset)")
        
        while True:
            try:
                user_cmd = input("\n> ").strip()
                if user_cmd.lower() in ['quit', 'exit', 'q']:
                    break
                elif user_cmd:
                    send_command(ser, user_cmd)
            except KeyboardInterrupt:
                break
        
        ser.close()
        print("\n🔌 Serial connection closed")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    wifi_debug() 