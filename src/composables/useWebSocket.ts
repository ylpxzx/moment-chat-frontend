import { ref } from 'vue'

export function useWebSocket() {
  const socket = ref<any>(null)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5

  const connect = (roomId: string, userInfo: any, callbacks: any = {}) => {
    // 构建WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws/rooms/${roomId}`
    socket.value = new WebSocket(wsUrl)

    socket.value.onopen = () => {
      console.log('WebSocket connected')
      reconnectAttempts.value = 0

      // 发送加入房间消息
      send('join', userInfo)

      if (callbacks.onConnect) {
        callbacks.onConnect()
      }
    }

    socket.value.onmessage = (event: any) => {
      try {
        const data = JSON.parse(event.data)
        if (callbacks.onMessage) {
          callbacks.onMessage(data)
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    socket.value.onclose = (event: any) => {
      console.log('WebSocket disconnected:', event.code, event.reason)

      if (callbacks.onDisconnect) {
        callbacks.onDisconnect()
      }

      // 尝试重连
      if (reconnectAttempts.value < maxReconnectAttempts) {
        reconnectAttempts.value++
        setTimeout(() => {
          console.log(
            `Attempting to reconnect (${reconnectAttempts.value}/${maxReconnectAttempts})...`,
          )
          connect(roomId, userInfo, callbacks)
        }, 3000)
      }
    }

    socket.value.onerror = (error: any) => {
      console.error('WebSocket error:', error)
    }
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.close()
      socket.value = null
    }
  }

  const send = (type: string, payload: any) => {
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      socket.value.send(JSON.stringify({ type, ...payload }))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  const sendMessage = (type: string, content: any) => {
    send(type, { content })
  }

  return {
    connect,
    disconnect,
    send,
    sendMessage,
  }
}
