#!/usr/bin/env python3
"""
Watch Maslow Serial Output Continuously
Monitor for WiFi connection messages and status changes
"""

import serial
import time
import signal
import sys

def signal_handler(sig, frame):
    print('\n🛑 Stopping serial monitor...')
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

def watch_serial(port="/dev/cu.usbmodem12201", baudrate=115200):
    """Continuously monitor serial output"""
    print(f"🔍 Monitoring Maslow serial output at {port}...")
    print("Press Ctrl+C to stop")
    print("-" * 60)
    
    try:
        ser = serial.Serial(port, baudrate, timeout=1)
        time.sleep(2)
        
        # Clear any existing data
        ser.flushInput()
        ser.flushOutput()
        
        while True:
            try:
                if ser.in_waiting > 0:
                    data = ser.readline().decode('utf-8', errors='ignore').strip()
                    if data:
                        timestamp = time.strftime("%H:%M:%S")
                        print(f"[{timestamp}] {data}")
                else:
                    time.sleep(0.1)  # Small delay to prevent busy waiting
                    
            except KeyboardInterrupt:
                break
            except Exception as e:
                print(f"⚠️  Error reading: {e}")
                time.sleep(1)
        
        ser.close()
        print("🔌 Serial connection closed")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    watch_serial() 