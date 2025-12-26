<template>
  <div class="room-view">
    <!-- 房间头部 -->
    <div class="room-header">
      <div class="header-content">
        <!-- 返回按钮（移动端） -->
        <button @click="$router.push('/')" class="back-btn" type="button">←</button>

        <!-- 房间信息 -->
        <div class="room-info">
          <h1 class="room-title">
            <span class="room-icon">💬</span>
            房间: {{ roomIdDisplay }}
          </h1>
          <div class="room-stats">
            <span class="online-count">
              <span class="dot" :class="connectionStatusClass"></span>
              {{ connectionStatusText }}
            </span>
            <span class="user-count"> 👥 {{ roomInfo?.userList?.length }} 人在线 </span>
          </div>
        </div>

        <!-- 用户信息 -->
        <div class="user-info">
          <div class="user-avatar">
            <img :src="userStore.avatar" alt="用户头像" />
          </div>
          <div class="user-details">
            <div class="username">{{ userStore.username }}</div>
            <div class="user-label">我</div>
          </div>
        </div>
      </div>

      <!-- 在线用户列表 -->
      <div v-if="roomInfo?.userList?.length > 0" class="online-users">
        <div class="users-label">
          <span class="users-icon">👥</span>
          <span>在线成员</span>
        </div>
        <div class="users-list">
          <div v-for="user in roomInfo?.userList" :key="user.id" class="user-badge">
            <img :src="user.avatar" :alt="user.username" class="user-avatar-sm" />
            <span class="user-name-sm">{{ user.username }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 聊天区域 -->
    <div class="chat-container">
      <!-- 消息列表 -->
      <div class="message-list" ref="messageListRef">
        <!-- 系统消息 -->
        <div v-for="message in systemMessages" :key="message.id" class="system-message">
          <div class="system-bubble">
            {{ message.content }}
          </div>
        </div>

        <!-- 用户消息 -->
        <div
          v-for="message in userMessages"
          :key="message.id"
          :class="[
            'message-item',
            message.userId === currentUserId ? 'message-right' : 'message-left',
          ]"
        >
          <!-- 对方消息 -->
          <div v-if="message.userId !== currentUserId" class="message-other">
            <div class="flex justify-center items-center">
              <img :src="message.avatar" class="avatar" />
            </div>
            <div class="message-content">
              <div class="flex justify-between message-username">
                <div>{{ message.username }}</div>
                <div>{{ formatTime(message.timestamp) }}</div>
              </div>
              <div class="message-bubble other-bubble">
                {{ message.content }}
              </div>
            </div>
          </div>

          <!-- 自己消息 -->
          <div v-else class="message-self">
            <div>
              <div class="flex justify-between message-username">
                <div>{{ formatTime(message.timestamp) }}</div>
                <div>
                  <span class="countdown">{{ getRemainingTime(message) }}s</span>
                </div>
              </div>
              <div class="message-bubble self-bubble">
                {{ message.content }}
                <div class="progress-bar" :style="progressStyle(message)"></div>
              </div>
            </div>
            <div class="flex justify-center items-center">
              <img :src="userStore.avatar" class="avatar" />
            </div>
          </div>
        </div>

        <!-- 用户正在输入提示 -->
        <div v-if="userTyping" class="typing-indicator">
          <div class="typing-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
          <span class="typing-text">{{ userTyping.username }} 正在输入...</span>
        </div>

        <!-- 空状态 -->
        <div v-if="messages.length === 0" class="empty-state">
          <div class="empty-icon">💬</div>
          <div class="empty-text">
            <p>还没有消息，开始聊天吧！</p>
            <p class="empty-note">消息会在20秒后自动消失</p>
          </div>
        </div>
      </div>

      <!-- 消息输入 -->
      <div class="message-input-area">
        <div class="input-container">
          <!-- 输入框 -->
          <div class="input-wrapper">
            <textarea
              ref="textareaRef"
              v-model="messageInput"
              @input="handleInput"
              @keydown.enter.exact.prevent="sendMessage"
              @keydown.enter.shift.exact.prevent="messageInput += '\n'"
              placeholder="输入消息...（支持表情）"
              maxlength="500"
              rows="1"
            ></textarea>
            <div class="char-count">{{ messageInput.length }}/500</div>
          </div>

          <!-- 表情按钮 -->
          <button @click="toggleEmoji" class="emoji-btn" type="button">😊</button>

          <!-- 发送按钮 -->
          <button
            @click="sendMessage"
            :disabled="!canSend"
            :class="['send-btn', canSend ? 'send-active' : 'send-inactive']"
            type="button"
          >
            <span class="send-icon">📤</span>
          </button>
        </div>

        <!-- 功能提示 -->
        <div class="input-hint">
          <span>按 Enter 发送，Shift + Enter 换行</span>
          <span>消息将在20秒后自动销毁</span>
        </div>

        <!-- 表情选择器 -->
        <div v-if="showEmojiPicker" class="emoji-picker">
          <div class="emoji-header">
            <span>选择表情</span>
            <button @click="toggleEmoji" class="close-emoji">×</button>
          </div>
          <div class="emoji-grid">
            <span
              v-for="emoji in emojiList"
              :key="emoji"
              @click="addEmoji(emoji)"
              class="emoji-item"
            >
              {{ emoji }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 离开确认对话框 -->
    <div v-if="showLeaveConfirm" class="modal-overlay">
      <div class="confirm-modal">
        <div class="modal-header">
          <h3>离开房间</h3>
        </div>
        <div class="modal-body">
          <p>确定要离开房间吗？所有未读消息将会丢失。</p>
        </div>
        <div class="modal-footer">
          <button @click="cancelLeave" class="btn-cancel">取消</button>
          <button @click="confirmLeave" class="btn-leave">离开</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useChatStore } from '@/stores/chat'

// Route
const route = useRoute()
const router = useRouter()

// Stores
const userStore = useUserStore()
const chatStore = useChatStore()

// Refs
const roomId = ref(route.params.roomId)
const messageInput = ref('')
const showEmojiPicker = ref(false)
const showLeaveConfirm = ref(false)
const messageListRef = ref(null)
const textareaRef = ref(null)

// Emoji列表
const emojiList = [
  '😀',
  '😂',
  '🥰',
  '😎',
  '🤔',
  '😢',
  '😡',
  '👍',
  '👎',
  '❤️',
  '🔥',
  '✨',
  '🎉',
  '💯',
  '🤝',
  '🙏',
  '😊',
  '😇',
  '🤣',
  '😍',
  '🥳',
  '😭',
  '😤',
  '👏',
  '🙌',
  '👌',
  '🤞',
  '✌️',
  '💪',
  '🧠',
  '👀',
  '👂',
  '👃',
  '👄',
  '💋',
  '💔',
  '💕',
  '💖',
  '💙',
  '💚',
  '💛',
  '🧡',
  '💜',
  '🖤',
  '🤍',
  '🤎',
  '💝',
  '💞',
]

// Computed
const roomIdDisplay = computed(() => roomId.value)
const connectionStatus = computed(() => chatStore.connectionStatus)
// const userCount = computed(() => chatStore.users.length)
const users = computed(() => chatStore.users)
const roomInfo = computed(() => chatStore.roomInfo)
const messages = computed(() => chatStore.messages)
const userTyping = computed(() => chatStore.userTyping)
const currentUserId = computed(() => userStore.userId)
console.log('store数据:', roomInfo)

const connectionStatusClass = computed(() => {
  switch (connectionStatus.value) {
    case 'connected':
      return 'dot-connected'
    case 'connecting':
      return 'dot-connecting'
    default:
      return 'dot-disconnected'
  }
})

const connectionStatusText = computed(() => {
  switch (connectionStatus.value) {
    case 'connected':
      return '已连接'
    case 'connecting':
      return '连接中...'
    case 'disconnected':
      return '已断开'
    default:
      return connectionStatus.value
  }
})

const systemMessages = computed(() => {
  return messages.value.filter((msg) => msg.type === 'system')
})

const userMessages = computed(() => {
  return messages.value.filter((msg) => msg.type !== 'system')
})

const canSend = computed(() => {
  return messageInput.value.trim().length > 0
})

// 方法
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getRemainingTime = (message) => {
  const now = Date.now()
  const expiresAt = message.timestamp + 20000
  const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000))
  return remaining
}

const progressStyle = (message) => {
  const remaining = getRemainingTime(message)
  const percentage = (remaining / 20) * 100
  return {
    width: `${percentage}%`,
    animationDuration: `${remaining}s`,
  }
}

const toggleEmoji = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

const addEmoji = (emoji) => {
  messageInput.value += emoji
  showEmojiPicker.value = false
  textareaRef.value?.focus()
}

const sendMessage = () => {
  if (!canSend.value) return
  chatStore.sendTextMessage(messageInput.value.trim())
  messageInput.value = ''

  // 重置输入框高度
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
      textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
    }
  })
}

const handleInput = () => {
  // 自动调整高度
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 120) + 'px'
  }
}

const leaveRoom = () => {
  showLeaveConfirm.value = true
}

const cancelLeave = () => {
  showLeaveConfirm.value = false
}

const confirmLeave = () => {
  chatStore.leaveRoom()
  showLeaveConfirm.value = false
  router.push('/')
}

// 自动滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

// 监听消息变化
watch(
  messages,
  () => {
    scrollToBottom()
  },
  { deep: true },
)

// 页面加载时检查房间
onMounted(async () => {
  if (!roomId.value || roomId.value.length !== 6) {
    window.$message?.error?.('无效的房间号')
    router.push('/')
    return
  }

  if (chatStore.currentRoom !== roomId.value) {
    try {
      await chatStore.joinRoom(roomId.value, {
        username: userStore.username,
        avatar: userStore.avatar,
        user_id: userStore.userId,
      })
    } catch (error) {
      window.$message?.error?.('加入房间失败')
      router.push('/')
    }
  }

  // 监听页面离开
  window.addEventListener('beforeunload', handleBeforeUnload)
})

// 页面卸载时清理
onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

const handleBeforeUnload = (event) => {
  if (chatStore.connectionStatus === 'connected') {
    event.preventDefault()
    event.returnValue = '确定要离开吗？所有消息将会丢失。'
  }
}

// 监听路由离开
import { onBeforeRouteLeave } from 'vue-router'
onBeforeRouteLeave((to, from, next) => {
  if (chatStore.connectionStatus === 'connected') {
    showLeaveConfirm.value = true
    next(false)
  } else {
    next()
  }
})
</script>

<style scoped>
.room-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0088ff;
}

/* 房间头部 */
.room-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 15px 25px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

.back-btn {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #667eea;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.back-btn:hover {
  background-color: #f7fafc;
}

.room-info {
  flex: 1;
}

.room-title {
  font-size: 1.4rem;
  color: #333;
  margin: 0 0 5px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.room-icon {
  font-size: 1.2rem;
}

.room-stats {
  display: flex;
  gap: 15px;
  font-size: 0.9rem;
  color: #666;
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 5px;
}

.dot-connected {
  background-color: #48bb78;
  animation: pulse 2s infinite;
}

.dot-connecting {
  background-color: #ed8936;
}

.dot-disconnected {
  background-color: #e53e3e;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #667eea;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-details {
  display: none;
}

/* 在线用户列表 */
.online-users {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e2e8f0;
}

.users-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.users-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.user-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: #f7fafc;
  border-radius: 15px;
  border: 1px solid #e2e8f0;
}

.user-avatar-sm {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name-sm {
  font-size: 0.85rem;
  color: #4a5568;
}

/* 聊天区域 */
.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: white;
  margin: 20px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

/* 消息列表 */
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* 系统消息 */
.system-message {
  display: flex;
  justify-content: center;
}

.system-bubble {
  background: rgba(0, 0, 0, 0.1);
  color: #666;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
}

/* 消息项 */
.message-item {
  display: flex;
}

.message-right {
  display: flex;
  justify-content: end;
}

.message-left {
  justify-content: flex-start;
}

/* 对方消息 */
.message-other {
  display: flex;
  gap: 10px;
  width: 100%;
}

.message-other .avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  /* align-self: flex-end; */
}

.message-username {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 4px;
  margin-left: 5px;
}

.other-bubble {
  background: white;
  color: #333;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 16px;
  position: relative;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

/* 自己消息 */
.message-self {
  display: flex;
  gap: 10px;
  justify-content: end;
}

.message-self .avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  /* align-self: flex-end; */
}

.self-bubble {
  background: #0088ff;
  color: white;
  border-radius: 10px;
  padding: 12px 16px;
  position: relative;
  box-shadow: 0 2px 5px rgba(102, 126, 234, 0.3);
}

.message-content {
  word-break: break-word;
  white-space: pre-wrap;
  line-height: 1.4;
}

.message-time {
  font-size: 0.75rem;
  margin-top: 5px;
  opacity: 0.8;
  display: flex;
  align-items: center;
  justify-content: end;
  gap: 5px;
}

.countdown {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
}

.progress-bar {
  position: absolute;
  bottom: -2px;
  left: 0;
  height: 2px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 1px;
  animation: progress linear forwards;
}

@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* 正在输入提示 */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: white;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  max-width: fit-content;
  margin: 10px 0;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dots .dot {
  width: 6px;
  height: 6px;
  background: #667eea;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.typing-dots .dot:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dots .dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.typing-text {
  font-size: 0.9rem;
  color: #666;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #a0aec0;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.empty-text p {
  margin: 5px 0;
}

.empty-note {
  font-size: 0.9rem;
  opacity: 0.7;
}

/* 消息输入区域 */
.message-input-area {
  border-top: 1px solid #e2e8f0;
  background: white;
  padding: 15px 20px;
  position: relative;
}

.input-container {
  display: flex;
  gap: 10px;
}

.emoji-btn {
  background: none;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 15px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
}

.emoji-btn:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.input-wrapper {
  flex: 1;
  position: relative;
}

.input-wrapper textarea {
  width: 100%;
  padding: 12px 16px;
  /* padding-bottom: 25px; */
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  line-height: 1.4;
  resize: none;
  outline: none;
  transition: border-color 0.3s;
  min-height: 44px;
  max-height: 120px;
  font-family: inherit;
}

.input-wrapper textarea:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.char-count {
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: 0.8rem;
  color: #a0aec0;
}

.send-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
}

.send-active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.send-active:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.send-inactive {
  background: #e2e8f0;
  color: #a0aec0;
  cursor: not-allowed;
}

.input-hint {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #a0aec0;
  margin-top: 8px;
}

/* 表情选择器 */
.emoji-picker {
  width: 400px;
  position: absolute;
  bottom: 100%;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
  z-index: 100;
}

.emoji-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  color: #4a5568;
}

.close-emoji {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #a0aec0;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-emoji:hover {
  color: #666;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 5px;
  padding: 10px;
  max-height: 200px;
  overflow-y: auto;
  width: 400px;
}

.emoji-item {
  padding: 8px;
  text-align: center;
  cursor: pointer;
  border-radius: 5px;
  font-size: 1.2rem;
  transition: background-color 0.2s;
}

.emoji-item:hover {
  background-color: #f7fafc;
}

/* 确认对话框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirm-modal {
  background: white;
  border-radius: 15px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 400px;
  overflow: hidden;
}

.modal-header {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.modal-body {
  padding: 25px 20px;
  color: #4a5568;
  line-height: 1.5;
}

.modal-footer {
  padding: 15px 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  background: #f7fafc;
}

.btn-cancel,
.btn-leave {
  padding: 10px 25px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel {
  background: white;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.btn-cancel:hover {
  background: #f7fafc;
}

.btn-leave {
  background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
  color: white;
}

.btn-leave:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(245, 101, 101, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .room-view {
    background: white;
  }

  .chat-container {
    margin: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .back-btn {
    display: block;
  }

  .user-details {
    display: block;
  }

  .username {
    font-size: 0.9rem;
    font-weight: 600;
    color: #333;
  }

  .user-label {
    font-size: 0.8rem;
    color: #a0aec0;
  }

  .online-users {
    display: none;
  }

  .message-other,
  .message-self {
    max-width: 85%;
  }

  .emoji-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (max-width: 480px) {
  .room-header {
    padding: 10px 15px;
  }

  .room-title {
    font-size: 1.2rem;
  }

  .room-stats {
    flex-direction: column;
    gap: 5px;
  }

  .message-list {
    padding: 15px 10px;
  }

  .message-input-area {
    padding: 10px 15px;
  }

  .input-hint {
    flex-direction: column;
    gap: 5px;
  }

  .emoji-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>
