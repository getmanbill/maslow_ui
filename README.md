# Maslow CNC Interface

A modern, professional web-based interface for controlling Maslow CNC machines. Built with React frontend and Python FastAPI backend, featuring real-time WebSocket communication and a clean, intuitive user interface.

![Maslow Interface](screenshots/Screenshot%202025-08-23%20at%209.12.40%20AM.png)

## Features

### 🎛️ **Professional Manual Controls**
- **XY Axis Control**: Intuitive directional pad layout with visual feedback
- **Z Axis Control**: Dedicated vertical controls for precise height adjustment
- **Variable Jog Distances**: 0.1mm, 1mm, 10mm, 100mm precision options
- **Adjustable Feed Rate**: Configurable movement speed (1-5000 mm/min)
- **Home Functions**: Separate XY and Z axis homing capabilities
- **Origin Setting**: Set work coordinates for XY and Z axes independently

### 🔧 **Advanced Machine Control**
- **Real-time Status Monitoring**: Live machine state updates via WebSocket
- **Alarm Handling**: Automatic unlock functionality when machine is in alarm state
- **Connection Management**: Visual connection status with automatic reconnection
- **GRBL Integration**: Full compatibility with GRBL-based CNC controllers

### 🎨 **Modern User Interface**
- **Flat Icon Design**: Clean, professional Lucide React icons
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Color-coded Controls**: Intuitive visual organization (Orange: XY, Blue: Z, Green: Home)
- **Touch Optimized**: Larger buttons and spacing for touch devices

### 📡 **Real-time Communication**
- **WebSocket Integration**: Instant status updates and command responses
- **Serial Interface**: Direct communication with CNC controller
- **Error Handling**: Robust error management and user feedback

## Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast development and build tool
- **Lucide React** - Beautiful, consistent icons
- **CSS3** - Custom styling with CSS variables

### Backend
- **FastAPI** - High-performance Python web framework
- **WebSockets** - Real-time bidirectional communication
- **PySerial** - Serial communication with CNC controller
- **Asyncio** - Asynchronous programming support

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- Maslow CNC machine with GRBL firmware

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/getmanbill/maslow_ui.git
   cd maslow_ui
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r backend/requirements.txt
   ```

3. **Install Node.js dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Configure your machine**
   - Update `config/maslow.yaml` with your serial port settings
   - Adjust `config/preferences.json` for your specific setup

### Running the Application

**Easy Start (Recommended)**
```bash
python start_maslow.py
```

This will automatically start both the backend server and frontend development server.

**Manual Start**
```bash
# Terminal 1 - Backend
cd backend
python maslow_serial_server.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The interface will be available at `http://localhost:5173`

## Project Structure

```
maslow_ui/
├── backend/                 # Python FastAPI backend
│   ├── maslow_serial_server.py    # Main server application
│   └── requirements.txt           # Python dependencies
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/            # React components
│   │   │   ├── JogControls.jsx   # Main control interface
│   │   │   ├── StatusDisplay.jsx # Machine status display
│   │   │   └── ...
│   │   ├── hooks/                 # Custom React hooks
│   │   └── styles/                # CSS styling
│   ├── package.json              # Node.js dependencies
│   └── vite.config.js            # Vite configuration
├── config/                  # Configuration files
│   ├── maslow.yaml              # Machine settings
│   └── preferences.json         # User preferences
├── scripts/                 # Utility scripts
│   ├── diagnostics/             # Diagnostic tools
│   ├── serial/                  # Serial utilities
│   └── wifi/                    # WiFi management
└── documentation/          # Project documentation
```

## Configuration

### Serial Connection
Update `config/maslow.yaml`:
```yaml
serial:
  port: "/dev/cu.usbmodem12201"  # Your serial port
  baudrate: 115200
  timeout: 1.0
```

### User Preferences
Customize `config/preferences.json`:
```json
{
  "default_feed_rate": 1000,
  "default_jog_distance": 10,
  "auto_connect": true
}
```

## API Endpoints

### Machine Control
- `POST /api/jog` - Jog machine axes
- `POST /api/home` - Home all axes
- `POST /api/home/xy` - Home XY axes only
- `POST /api/home/z` - Home Z axis only
- `POST /api/unlock` - Unlock machine from alarm state

### Origin Setting
- `POST /api/set_origin/xy` - Set XY work origin
- `POST /api/set_origin/z` - Set Z work origin

### Status & Communication
- `GET /api/status` - Get current machine status
- `WebSocket /ws` - Real-time status updates

## Development

### Frontend Development
```bash
cd frontend
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

### Backend Development
```bash
cd backend
python maslow_serial_server.py --reload  # Auto-reload on changes
```

### Adding New Features
1. Backend: Add new endpoints in `maslow_serial_server.py`
2. Frontend: Create/modify components in `src/components/`
3. Styling: Update CSS in component-specific files

## Troubleshooting

### Common Issues

**Connection Problems**
- Verify serial port in `config/maslow.yaml`
- Check cable connections
- Ensure no other software is using the serial port

**Machine in Alarm State**
- Click the "UNLOCK" button when it appears
- Check for mechanical issues (limit switches, etc.)
- Review GRBL error codes in the console

**Interface Not Loading**
- Check that both backend and frontend servers are running
- Verify ports 8000 (backend) and 5173 (frontend) are available
- Check browser console for JavaScript errors

### Diagnostic Tools
- `scripts/diagnostics/test_maslow_connection.py` - Test serial connection
- `scripts/diagnostics/telnet_diagnostic.py` - Network diagnostics
- `scripts/serial/watch_serial.py` - Monitor serial communication

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Maslow CNC](https://www.maslowcnc.com/) - For the amazing CNC platform
- [GRBL](https://github.com/grbl/grbl) - For the CNC controller firmware
- [Lucide](https://lucide.dev/) - For the beautiful icon set
- [FastAPI](https://fastapi.tiangolo.com/) - For the excellent Python framework
- [React](https://react.dev/) - For the powerful frontend framework

## Support

For questions, issues, or contributions, please visit the [GitHub repository](https://github.com/getmanbill/maslow_ui) or open an issue.

---

**Built with ❤️ for the Maslow CNC community** 