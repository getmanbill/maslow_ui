import { useState, useCallback } from 'react'

const API_BASE = '/api'

const useMaslowAPI = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const apiCall = useCallback(async (endpoint, options = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.detail || `HTTP ${response.status}`)
      }
      
      setLoading(false)
      return data
    } catch (err) {
      setError(err.message)
      setLoading(false)
      throw err
    }
  }, [])

  // Connection management
  const connect = useCallback(() => apiCall('/connect', { method: 'POST' }), [apiCall])
  const disconnect = useCallback(() => apiCall('/disconnect', { method: 'POST' }), [apiCall])
  const getStatus = useCallback(() => apiCall('/status'), [apiCall])

  // Raw command sending
  const sendCommand = useCallback((command, waitTime = 2.0) => {
    return apiCall('/command', {
      method: 'POST',
      body: JSON.stringify({ command, wait_time: waitTime })
    })
  }, [apiCall])

  // Movement commands
  const jogAxis = useCallback((axis, distance, feedRate = 1000) => {
    return apiCall('/jog', {
      method: 'POST',
      body: JSON.stringify({ axis, distance, feed_rate: feedRate })
    })
  }, [apiCall])

  const homeAll = useCallback(() => apiCall('/home', { method: 'POST' }), [apiCall])
  const homeXY = useCallback(() => apiCall('/home/xy', { method: 'POST' }), [apiCall])
  const homeZ = useCallback(() => apiCall('/home/z', { method: 'POST' }), [apiCall])
  const setOriginXY = useCallback(() => apiCall('/set_origin/xy', { method: 'POST' }), [apiCall])
  const setOriginZ = useCallback(() => apiCall('/set_origin/z', { method: 'POST' }), [apiCall])
  const unlock = useCallback(() => apiCall('/unlock', { method: 'POST' }), [apiCall])
  const emergencyStop = useCallback(() => apiCall('/stop', { method: 'POST' }), [apiCall])

  // Maslow-specific commands
  const maslowCommands = {
    retractAll: useCallback(() => apiCall('/maslow/retract_all', { method: 'POST' }), [apiCall]),
    extendAll: useCallback(() => apiCall('/maslow/extend_all', { method: 'POST' }), [apiCall]),
    applyTension: useCallback(() => apiCall('/maslow/apply_tension', { method: 'POST' }), [apiCall]),
    releaseTension: useCallback(() => apiCall('/maslow/release_tension', { method: 'POST' }), [apiCall]),
    findAnchors: useCallback(() => apiCall('/maslow/find_anchors', { method: 'POST' }), [apiCall]),
    test: useCallback(() => apiCall('/maslow/test', { method: 'POST' }), [apiCall]),
    setZStop: useCallback(() => apiCall('/maslow/set_z_stop', { method: 'POST' }), [apiCall])
  }

  // Configuration
  const getConfig = useCallback(() => apiCall('/config/maslow'), [apiCall])
  const updateConfig = useCallback((config) => {
    return apiCall('/config/maslow', {
      method: 'POST',
      body: JSON.stringify({ config })
    })
  }, [apiCall])

  const getPreferences = useCallback(() => apiCall('/config/preferences'), [apiCall])

  // File management
  const getFiles = useCallback(() => apiCall('/files'), [apiCall])
  const uploadFile = useCallback((file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    return apiCall('/files/upload', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData
    })
  }, [apiCall])

  return {
    loading,
    error,
    connect,
    disconnect,
    getStatus,
    sendCommand,
    jogAxis,
    homeAll,
    homeXY,
    homeZ,
    setOriginXY,
    setOriginZ,
    unlock,
    emergencyStop,
    maslow: maslowCommands,
    getConfig,
    updateConfig,
    getPreferences,
    getFiles,
    uploadFile
  }
}

export default useMaslowAPI 