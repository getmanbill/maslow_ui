#!/usr/bin/env python3
"""
Maslow CNC Connection Tester
Tests various connection methods to the Maslow router
"""

import socket
import requests
import time
import subprocess
import sys
from urllib.parse import urlparse

def ping_test(ip):
    """Test basic ping connectivity"""
    print(f"🔍 Testing ping to {ip}...")
    try:
        result = subprocess.run(['ping', '-c', '3', ip], 
                              capture_output=True, text=True, timeout=15)
        if result.returncode == 0:
            print("✅ Ping successful!")
            print(f"   Output: {result.stdout.split('---')[1].strip()}")
            return True
        else:
            print("❌ Ping failed")
            return False
    except Exception as e:
        print(f"❌ Ping error: {e}")
        return False

def port_scan(ip, ports):
    """Test if specific ports are open"""
    print(f"\n🔍 Testing ports on {ip}...")
    open_ports = []
    
    for port in ports:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(5)
            result = sock.connect_ex((ip, port))
            if result == 0:
                print(f"✅ Port {port} is OPEN")
                open_ports.append(port)
            else:
                print(f"❌ Port {port} is CLOSED")
            sock.close()
        except Exception as e:
            print(f"❌ Port {port} error: {e}")
    
    return open_ports

def http_test(ip, timeout=10):
    """Test HTTP connection with various methods"""
    print(f"\n🔍 Testing HTTP connection to {ip}...")
    
    urls_to_test = [
        f"http://{ip}",
        f"http://{ip}/",
        f"http://{ip}:80",
        f"http://{ip}/index.html",
        f"https://{ip}",  # Just in case it's HTTPS
    ]
    
    for url in urls_to_test:
        print(f"   Trying: {url}")
        try:
            response = requests.get(url, timeout=timeout)
            print(f"   ✅ SUCCESS! Status: {response.status_code}")
            print(f"   Content-Type: {response.headers.get('content-type', 'Unknown')}")
            print(f"   Content-Length: {len(response.content)} bytes")
            if response.text:
                preview = response.text[:200].replace('\n', ' ')
                print(f"   Preview: {preview}...")
            return True
        except requests.exceptions.Timeout:
            print(f"   ⏰ Timeout after {timeout}s")
        except requests.exceptions.ConnectionError:
            print(f"   ❌ Connection refused/failed")
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    return False

def telnet_test(ip, port=23):
    """Test Telnet connection (port 23)"""
    print(f"\n🔍 Testing Telnet connection to {ip}:{port}...")
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex((ip, port))
        if result == 0:
            print("✅ Telnet port is open!")
            # Try to read initial response
            try:
                sock.settimeout(2)
                data = sock.recv(1024).decode('utf-8', errors='ignore')
                if data:
                    print(f"   Initial response: {data.strip()}")
            except:
                print("   (No initial response)")
            sock.close()
            return True
        else:
            print("❌ Telnet port is closed")
            sock.close()
            return False
    except Exception as e:
        print(f"❌ Telnet error: {e}")
        return False

def main():
    ip = "192.168.50.143"
    
    print("=" * 60)
    print("🔧 MASLOW CNC CONNECTION TESTER")
    print("=" * 60)
    print(f"Target IP: {ip}")
    print(f"Test time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Test 1: Basic ping
    ping_success = ping_test(ip)
    
    # Test 2: Port scan
    common_ports = [80, 443, 23, 8080, 3000, 8000]
    open_ports = port_scan(ip, common_ports)
    
    # Test 3: HTTP connection
    http_success = http_test(ip)
    
    # Test 4: Telnet
    telnet_success = telnet_test(ip)
    
    # Summary
    print("\n" + "=" * 60)
    print("📋 SUMMARY")
    print("=" * 60)
    print(f"Ping:    {'✅ Working' if ping_success else '❌ Failed'}")
    print(f"HTTP:    {'✅ Working' if http_success else '❌ Failed'}")
    print(f"Telnet:  {'✅ Working' if telnet_success else '❌ Failed'}")
    print(f"Open ports: {open_ports if open_ports else 'None detected'}")
    
    if not http_success and ping_success:
        print("\n🤔 TROUBLESHOOTING SUGGESTIONS:")
        print("• Device responds to ping but HTTP doesn't work")
        print("• Web server might not be running")
        print("• Try power cycling the Maslow")
        print("• Check if it's still in AP mode (look for 'maslow' WiFi)")
        if telnet_success:
            print("• Try connecting via Telnet for diagnostics")
    elif not ping_success:
        print("\n🤔 TROUBLESHOOTING SUGGESTIONS:")
        print("• Device not responding - check power and WiFi connection")
        print("• Verify IP address is correct")
        print("• Check if device created its own 'maslow' hotspot")

if __name__ == "__main__":
    main() 