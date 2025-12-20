import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'

export const useChatStore = defineStore('chat', () => {
  // 状态
  const messages = ref<any[]>([])
  const currentRoom = ref<string | null>(null)
  const users = ref<any[]>([])
  const connectionStatus = ref('disconnected')
  const userTyping = ref<any>(null)

  // WebSocket
  const { connect, disconnect, sendMessage } = useWebSocket()

  // Getter
  const userCount = computed(() => users.value.length)
  const roomExists = computed(() => currentRoom.value !== null)

  // Actions
  const createRoom = async () => {
    try {
      const response = await fetch('/api/v1/rooms', {
        method: 'POST',
      })
      const data = await response.json()
      currentRoom.value = data.roomId
      return data.roomId
    } catch (error) {
      console.error('Failed to create room:', error)
      throw error
    }
  }

  const joinRoom = async (roomId: string, userInfo: any) => {
    currentRoom.value = roomId
    connectionStatus.value = 'connecting'

    // 连接WebSocket
    connect(roomId, userInfo, {
      onMessage: handleWebSocketMessage,
      onConnect: () => {
        connectionStatus.value = 'connected'
      },
      onDisconnect: () => {
        connectionStatus.value = 'disconnected'
      },
    })
  }

  const leaveRoom = () => {
    disconnect()
    currentRoom.value = null
    messages.value = []
    users.value = []
    connectionStatus.value = 'disconnected'
  }

  const sendTextMessage = (content: string) => {
    if (!content.trim()) return

    sendMessage('text', content)
  }

  const sendTypingStatus = (isTyping: boolean) => {
    sendMessage('typing', isTyping ? 'start' : 'stop')
  }

  const addMessage = (message: any) => {
    // 添加消息
    messages.value.push({
      ...message,
      id: message.id || Date.now().toString(),
      timestamp: message.timestamp || Date.now(),
      expiresAt: message.expiresAt || Date.now() + 20000,
    })

    // // 20秒后自动移除消息
    setTimeout(() => {
      removeMessage(message.id)
    }, 20000)

    // 如果有用户正在输入，清除状态
    if (userTyping.value?.userId === message.userId) {
      userTyping.value = null
    }
  }

  const removeMessage = (messageId: string) => {
    const index = messages.value.findIndex((msg) => msg.id === messageId)
    if (index !== -1) {
      messages.value.splice(index, 1)
    }
  }

  const addUser = (user: any) => {
    if (!users.value.find((u) => u.id === user.id)) {
      users.value.push(user)
    }
  }

  const removeUser = (userId: string) => {
    const index = users.value.findIndex((user) => user.id === userId)
    if (index !== -1) {
      users.value.splice(index, 1)
    }
  }

  const setUserTyping = (userId: string, username: string) => {
    userTyping.value = { userId, username }

    // 3秒后清除输入状态
    setTimeout(() => {
      if (userTyping.value?.userId === userId) {
        userTyping.value = null
      }
    }, 3000)
  }

  // WebSocket消息处理
  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'new_message':
        console.log('新消息：', data)
        addMessage(data.payload)
        break
      case 'user_join':
        addUser({
          id: data.payload.userId,
          username: data.payload.username,
          avatar: data.payload.avatar,
        })
        break
      case 'user_leave':
        removeUser(data.payload.userId)
        break
      case 'user_typing':
        setUserTyping(data.payload.userId, data.payload.username)
        break
      case 'system':
        addMessage({
          id: Date.now().toString(),
          type: 'system',
          content: data.payload.content,
          timestamp: Date.now(),
        })
        break
    }
  }

  // 清理过期的消息（每秒运行一次）
  setInterval(() => {
    const now = Date.now()
    messages.value = messages.value.filter((msg) => {
      return msg.expiresAt > now
    })
  }, 1000)

  return {
    // 状态
    messages,
    currentRoom,
    users,
    connectionStatus,
    userTyping,

    // Getter
    userCount,
    roomExists,

    // Actions
    createRoom,
    joinRoom,
    leaveRoom,
    sendTextMessage,
    sendTypingStatus,
    addMessage,
    removeMessage,
    addUser,
    removeUser,
  }
})
