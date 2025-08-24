import React, { useState, useEffect, useRef } from 'react'
import './SerialConsole.css'

const SerialConsole = ({ messages = [], onSendCommand }) => {
  const [commandInput, setCommandInput] = useState('')
  const [isAutoScroll, setIsAutoScroll] = useState(true)
  const [maxLines, setMaxLines] = useState(100)
  const consoleRef = useRef(null)
  const endRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isAutoScroll && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isAutoScroll])

  // Handle scroll to detect if user scrolled up
  const handleScroll = () => {
    if (consoleRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = consoleRef.current
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10
      setIsAutoScroll(isAtBottom)
    }
  }

  // Handle command submission
  const handleSubmit = (e) => {
    e.preventDefault()
    if (commandInput.trim() && onSendCommand) {
      onSendCommand(commandInput.trim())
      setCommandInput('')
    }
  }

  // Format message based on type
  const formatMessage = (message) => {
    const timestamp = new Date(message.timestamp * 1000).toLocaleTimeString()
    
    switch (message.type) {
      case 'command_sent':
        return {
          time: timestamp,
          direction: 'TX',
          content: message.command,
          className: 'message-command'
        }
      case 'serial_response':
        return {
          time: timestamp,
          direction: 'RX',
          content: message.data,
          className: 'message-response'
        }
      default:
        return {
          time: timestamp,
          direction: 'SYS',
          content: JSON.stringify(message),
          className: 'message-system'
        }
    }
  }

  // Clear console
  const handleClear = () => {
    // This would need to be handled by parent component
    // For now, we'll just scroll to bottom
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Keep only the most recent messages
  const displayMessages = messages.slice(-maxLines)

  return (
    <div className="serial-console">
      <div className="console-header">
        <h3>SERIAL CONSOLE</h3>
        <div className="console-controls">
          <div className="control-group">
            <label>Max Lines:</label>
            <select 
              value={maxLines} 
              onChange={(e) => setMaxLines(Number(e.target.value))}
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={500}>500</option>
            </select>
          </div>
          
          <button 
            className={`auto-scroll-btn ${isAutoScroll ? 'active' : ''}`}
            onClick={() => setIsAutoScroll(!isAutoScroll)}
          >
            {isAutoScroll ? '📌 AUTO' : '📌 MANUAL'}
          </button>
          
          <button 
            className="clear-btn"
            onClick={handleClear}
          >
            CLEAR
          </button>
        </div>
      </div>

      <div 
        className="console-output"
        ref={consoleRef}
        onScroll={handleScroll}
      >
        {displayMessages.length === 0 ? (
          <div className="console-empty">
            <span>Waiting for serial communication...</span>
          </div>
        ) : (
          displayMessages.map((message, index) => {
            const formatted = formatMessage(message)
            return (
              <div key={index} className={`console-line ${formatted.className}`}>
                <span className="line-time">{formatted.time}</span>
                <span className="line-direction">{formatted.direction}</span>
                <span className="line-content">{formatted.content}</span>
              </div>
            )
          })
        )}
        <div ref={endRef} />
      </div>

      <form className="console-input" onSubmit={handleSubmit}>
        <div className="input-group">
          <span className="input-prompt">TX&gt;</span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder="Enter G-code or FluidNC command..."
            className="command-input"
          />
          <button type="submit" className="send-btn">
            SEND
          </button>
        </div>
        <div className="input-help">
          Common commands: <code>?</code> (status), <code>$X</code> (unlock), <code>$H</code> (home), <code>$$</code> (settings)
        </div>
      </form>
    </div>
  )
}

export default SerialConsole 