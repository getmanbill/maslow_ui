import React, { useState, useEffect, useCallback } from 'react'
import './styles/App.css'

// Components
import ConnectionStatus from './components/ConnectionStatus'
import JogControls from './components/JogControls'
import StatusDisplay from './components/StatusDisplay'
import SerialConsole from './components/SerialConsole'
import MaslowSidebar from './components/MaslowSidebar'
import { AlertTriangle, X } from 'lucide-react'

// Hooks
import useWebSocket from './hooks/useWebSocket'
import useMaslowAPI from './hooks/useMaslowAPI'

const WS_URL = 'ws://localhost:8003/ws'

function App() {
  // WebSocket connection
  const { isConnected: isWSConnected, lastMessage, sendMessage } = useWebSocket(WS_URL)
  
  // API hook
  const api = useMaslowAPI()
  
  // State
  const [machineStatus, setMachineStatus] = useState({
    connected: false,
    status: 'Disconnected',
    position: { x: 0, y: 0, z: 0 },
    feed_rate: 0,
    spindle_speed: 0
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [serialMessages, setSerialMessages] = useState([])

  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage) return
    
    console.log('App - WebSocket message received:', {
      type: lastMessage.type,
      message: lastMessage,
      timestamp: new Date().toISOString()
    })
    
    // Add serial communication messages to history
    if (lastMessage.type === 'command_sent' || lastMessage.type === 'serial_response') {
      setSerialMessages(prev => [...prev, lastMessage])
    }
    
    switch (lastMessage.type) {
      case 'status_update':
        console.log('App - Updating machine status with:', lastMessage.status)
        setMachineStatus(lastMessage.status)
        break
      case 'connection_status':
        console.log('App - Connection status changed:', lastMessage.connected)
        setMachineStatus(prev => {
          const newStatus = {
            ...prev,
            connected: lastMessage.connected
          }
          console.log('App - New machine status after connection update:', newStatus)
          return newStatus
        })
        // Request full status update when connection status changes
        if (isWSConnected) {
          console.log('App - Requesting status update after connection change')
          sendMessage({ type: 'request_status' })
        }
        break
      case 'serial_response':
        console.log('Serial response:', lastMessage.data)
        break
      case 'command_sent':
        console.log('Command sent:', lastMessage.command)
        break
      case 'pong':
        // Keep-alive response
        break
      default:
        console.log('Unknown message type:', lastMessage.type)
    }
  }, [lastMessage, isWSConnected, sendMessage])

  // Handle manual command sending from console
  const handleSendCommand = useCallback(async (command) => {
    if (!machineStatus.connected && command !== '$X' && command !== '!') {
      setError('Machine not connected')
      return
    }
    
    try {
      await api.sendCommand(command)
    } catch (err) {
      setError(`Command failed: ${err.message}`)
      console.error('Command error:', err)
    }
  }, [api, machineStatus.connected])

  // Connection handlers
  const handleConnect = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.connect()
      console.log('Connected:', result)
    } catch (err) {
      setError(`Connection failed: ${err.message}`)
      console.error('Connection error:', err)
    } finally {
      setLoading(false)
    }
  }, [api])

  const handleDisconnect = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.disconnect()
      console.log('Disconnected:', result)
    } catch (err) {
      setError(`Disconnect failed: ${err.message}`)
      console.error('Disconnect error:', err)
    } finally {
      setLoading(false)
    }
  }, [api])

  // Jog handlers
  const handleJog = useCallback(async (axis, distance, feedRate) => {
    if (!machineStatus.connected) {
      setError('Machine not connected')
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      const result = await api.jogAxis(axis, distance, feedRate)
      console.log('Jog result:', result)
    } catch (err) {
      setError(`Jog failed: ${err.message}`)
      console.error('Jog error:', err)
    } finally {
      setLoading(false)
    }
  }, [api, machineStatus.connected])

  const handleHome = useCallback(async (axis = 'ALL') => {
    if (!machineStatus.connected) {
      setError('Machine not connected')
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      let result
      switch (axis) {
        case 'XY':
          result = await api.homeXY()
          console.log('XY Home result:', result)
          break
        case 'Z':
          result = await api.homeZ()
          console.log('Z Home result:', result)
          break
        default:
          result = await api.homeAll()
          console.log('Home All result:', result)
      }
    } catch (err) {
      setError(`${axis} Home failed: ${err.message}`)
      console.error(`${axis} Home error:`, err)
    } finally {
      setLoading(false)
    }
  }, [api, machineStatus.connected])

  // Maslow command handler
  const handleMaslowCommand = useCallback(async (commandName) => {
    if (!machineStatus.connected && commandName !== 'unlock' && commandName !== 'stop') {
      setError('Machine not connected')
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      let result
      switch (commandName) {
        case 'retract_all':
          result = await api.maslow.retractAll()
          break
        case 'extend_all':
          result = await api.maslow.extendAll()
          break
        case 'apply_tension':
          result = await api.maslow.applyTension()
          break
        case 'release_tension':
          result = await api.maslow.releaseTension()
          break
        case 'find_anchors':
          result = await api.maslow.findAnchors()
          break
        case 'test':
          result = await api.maslow.test()
          break
        case 'set_z_stop':
          result = await api.maslow.setZStop()
          break
        case 'stop':
          result = await api.emergencyStop()
          break
        case 'unlock':
          result = await api.unlock()
          break
        default:
          throw new Error(`Unknown command: ${commandName}`)
      }
      console.log(`${commandName} result:`, result)
    } catch (err) {
      setError(`${commandName} failed: ${err.message}`)
      console.error(`${commandName} error:`, err)
    } finally {
      setLoading(false)
    }
  }, [api, machineStatus.connected])

  const handleSetOrigin = useCallback(async (axis) => {
    if (!machineStatus.connected) {
      setError('Machine not connected')
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      let result
      switch (axis) {
        case 'XY':
          result = await api.setOriginXY()
          console.log('Set XY Origin result:', result)
          break
        case 'Z':
          result = await api.setOriginZ()
          console.log('Set Z Origin result:', result)
          break
        default:
          setError('Invalid axis for set origin')
          return
      }
    } catch (err) {
      setError(`Set ${axis} Origin failed: ${err.message}`)
      console.error(`Set ${axis} Origin error:`, err)
    } finally {
      setLoading(false)
    }
  }, [api, machineStatus.connected])

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>MASLOW CNC CONTROL</h1>
          <div className="version-info">Serial Interface v1.0</div>
        </div>
        
        <div className="header-center">
          {/* Emergency Stop Button */}
          <button
            className="emergency-stop-btn"
            onClick={() => handleMaslowCommand('stop')}
            title="Emergency Stop - Stops all motion immediately"
          >
            <span className="stop-icon">⏹</span>
            <span className="stop-text">EMERGENCY STOP</span>
          </button>
        </div>
        
        <ConnectionStatus
          isWebSocketConnected={isWSConnected}
          isSerialConnected={machineStatus.connected}
          serialStatus={machineStatus.status}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />
      </header>
      
      {/* Error Display */}
      {error && (
        <div className="error-message">
          <span className="error-icon">
            <AlertTriangle size={16} />
          </span>
          <span className="error-text">{error}</span>
          <button 
            className="error-close" 
            onClick={() => setError('')}
            title="Dismiss error"
          >
            <X size={14} />
          </button>
        </div>
      )}
      
      <main className="app-main">
        <div className="control-section">
          {/* Manual Jog Controls */}
          <JogControls
            onJog={handleJog}
            onHome={handleHome}
            onSetOrigin={handleSetOrigin}
            disabled={!machineStatus.connected || loading}
          />
        </div>
        
        <div className="status-section">
          <StatusDisplay 
            status={machineStatus.status} 
            position={machineStatus.position} 
            feedRate={machineStatus.feed_rate}
            onUnlock={() => handleMaslowCommand('unlock')}
            loading={loading}
          />
        </div>
        
        <div className="console-section">
          <SerialConsole
            messages={serialMessages}
            onSendCommand={handleSendCommand}
          />
        </div>
      </main>
      
      {/* Collapsible Maslow Controls Sidebar */}
      <MaslowSidebar
        onCommand={handleMaslowCommand}
        disabled={!machineStatus.connected}
        loading={loading}
      />
      
      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <div className="loading-text">Processing...</div>
        </div>
      )}
    </div>
  )
}

export default App 