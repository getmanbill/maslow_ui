import { useState, useEffect, useRef, useCallback } from 'react'

const useWebSocket = (url) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const [connectionError, setConnectionError] = useState(null)
  const reconnectTimeoutRef = useRef(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url)
      
      ws.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        setConnectionError(null)
        reconnectAttempts.current = 0
        
        // Send initial ping
        ws.send(JSON.stringify({ type: 'ping' }))
      }
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          setLastMessage(message)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }
      
      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        setIsConnected(false)
        setSocket(null)
        
        // Attempt to reconnect unless it was a manual close
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
          console.log(`Attempting to reconnect in ${timeout}ms...`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++
            connect()
          }, timeout)
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          setConnectionError('Failed to reconnect after multiple attempts')
        }
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnectionError('WebSocket connection error')
      }
      
      setSocket(ws)
    } catch (error) {
      console.error('Error creating WebSocket:', error)
      setConnectionError('Failed to create WebSocket connection')
    }
  }, [url])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    if (socket) {
      socket.close(1000, 'Manual disconnect')
    }
    
    setSocket(null)
    setIsConnected(false)
    reconnectAttempts.current = 0
  }, [socket])

  const sendMessage = useCallback((message) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message))
      return true
    }
    console.warn('Cannot send message: WebSocket not connected')
    return false
  }, [socket, isConnected])

  // Connect on mount
  useEffect(() => {
    connect()
    
    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (socket) {
        socket.close(1000, 'Component unmounting')
      }
    }
  }, [connect])

  // Keep connection alive with periodic pings
  useEffect(() => {
    if (isConnected && socket) {
      const pingInterval = setInterval(() => {
        sendMessage({ type: 'ping' })
      }, 30000) // Ping every 30 seconds
      
      return () => clearInterval(pingInterval)
    }
  }, [isConnected, socket, sendMessage])

  return {
    socket,
    isConnected,
    lastMessage,
    connectionError,
    sendMessage,
    connect,
    disconnect
  }
}

export default useWebSocket 