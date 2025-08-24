#!/usr/bin/env python3
"""
Maslow Telnet Diagnostic Tool
Connect via Telnet to send commands and get status
"""

import socket
import time
import threading

def telnet_session(ip, port=23):
    """Interactive Telnet session with the Maslow"""
    print(f"🔗 Connecting to Maslow at {ip}:{port}...")
    
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(10)
        sock.connect((ip, port))
        print("✅ Connected!")
        
        # Function to read responses
        def read_responses():
            while True:
                try:
                    data = sock.recv(1024).decode('utf-8', errors='ignore')
                    if data:
                        print(f"📥 {data.strip()}")
                    else:
                        break
                except:
                    break
        
        # Start reading responses in background
        reader_thread = threading.Thread(target=read_responses, daemon=True)
        reader_thread.start()
        
        time.sleep(1)  # Let initial messages come through
        
        # Send diagnostic commands
        commands = [
            "$I",      # Get build info
            "$$",      # Get all settings
            "$#",      # Get coordinate system data
            "?",       # Get status
        ]
        
        for cmd in commands:
            print(f"📤 Sending: {cmd}")
            sock.send((cmd + "\n").encode())
            time.sleep(2)  # Wait for response
        
        # Keep connection open for a bit to see all responses
        print("⏳ Waiting for responses...")
        time.sleep(5)
        
        sock.close()
        print("🔌 Connection closed")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    telnet_session("192.168.50.143") 