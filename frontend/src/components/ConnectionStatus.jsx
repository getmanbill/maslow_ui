import React from 'react'
import './ConnectionStatus.css'

const ConnectionStatus = ({ 
  isWebSocketConnected, 
  isSerialConnected, 
  serialStatus = 'Disconnected',
  onConnect,
  onDisconnect
}) => {
  const getStatusColor = (connected) => {
    return connected ? 'online' : 'offline'
  }

  const getStatusText = (wsConnected, serialConnected, status) => {
    if (!wsConnected) return 'Backend Disconnected'
    if (!serialConnected) return 'Serial Disconnected'
    return status || 'Connected'
  }

  return (
    <div className="connection-status">
      <div className="status-indicators">
        <div className="status-item">
          <span className={`status-led ${getStatusColor(isWebSocketConnected)}`}></span>
          <span className="status-label">WS</span>
        </div>

        <div className="status-item">
          <span className={`status-led ${getStatusColor(isSerialConnected)}`}></span>
          <span className="status-label">SERIAL</span>
        </div>
        
        <div className="status-text">
          {getStatusText(isWebSocketConnected, isSerialConnected, serialStatus)}
        </div>
      </div>

      <div className="connection-controls">
        {isSerialConnected ? (
          <button
            className="btn btn-disconnect" 
            onClick={onDisconnect}
            disabled={!isWebSocketConnected}
          >
            DISCONNECT
          </button>
        ) : (
          <button
            className="btn btn-connect" 
            onClick={onConnect}
            disabled={!isWebSocketConnected}
          >
            CONNECT
          </button>
        )}
      </div>
    </div>
  )
}

export default ConnectionStatus 