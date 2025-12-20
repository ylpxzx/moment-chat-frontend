<template>
  <div ref="messageListRef" class="message-list flex-1 overflow-y-auto p-4 space-y-4">
    <!-- 系统消息 -->
    <div v-for="message in systemMessages" :key="message.id" class="flex justify-center">
      <div class="system-message px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-full">
        {{ message.content }}
      </div>
    </div>

    <!-- 用户消息 -->
    <div
      v-for="message in userMessages"
      :key="message.id"
      :class="[
        'message-item flex gap-3',
        message.userId === currentUserId ? 'justify-end' : 'justify-start',
      ]"
    >
      <!-- 对方头像 -->
      <div v-if="message.userId !== currentUserId" class="flex-shrink-0">
        <img
          :src="message.avatar"
          :alt="message.username"
          class="w-10 h-10 rounded-full object-cover"
        />
      </div>

      <!-- 消息内容 -->
      <div class="max-w-[70%]">
        <!-- 用户名（仅显示对方） -->
        <div v-if="message.userId !== currentUserId" class="text-xs text-gray-500 mb-1 ml-1">
          {{ message.username }}
        </div>

        <div class="flex items-end gap-2">
          <!-- 自己消息在右边 -->
          <div v-if="message.userId === currentUserId" class="order-2">
            <div class="relative">
              <!-- 消息气泡 -->
              <div
                :class="[
                  'message-bubble px-4 py-3 rounded-2xl',
                  message.userId === currentUserId
                    ? 'bg-primary text-white rounded-br-none'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none',
                ]"
              >
                <!-- 消息内容 -->
                <div class="message-content whitespace-pre-wrap break-words">
                  {{ message.content }}
                </div>

                <!-- 消息时间 -->
                <div
                  :class="[
                    'message-time text-xs mt-1',
                    message.userId === currentUserId ? 'text-primary-100' : 'text-gray-400',
                  ]"
                >
                  {{ formatTime(message.timestamp) }}
                </div>
              </div>

              <!-- 倒计时进度条 -->
              <div
                v-if="message.userId === currentUserId"
                class="absolute -bottom-1 left-0 right-0 h-1 bg-primary/20 rounded-full overflow-hidden"
              >
                <div
                  class="h-full bg-primary/50 progress-bar"
                  :style="{ animationDuration: '20s' }"
                ></div>
              </div>
            </div>
          </div>

          <!-- 自己头像 -->
          <div v-if="message.userId === currentUserId" class="order-1 flex-shrink-0">
            <img :src="currentUserAvatar" alt="我" class="w-10 h-10 rounded-full object-cover" />
          </div>
        </div>
      </div>
    </div>

    <!-- 用户正在输入提示 -->
    <div v-if="userTyping" class="typing-indicator flex items-center gap-2 text-gray-500 text-sm">
      <div class="typing-dots flex gap-1">
        <div class="dot w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
        <div
          class="dot w-1 h-1 bg-gray-400 rounded-full animate-pulse"
          style="animation-delay: 0.2s"
        ></div>
        <div
          class="dot w-1 h-1 bg-gray-400 rounded-full animate-pulse"
          style="animation-delay: 0.4s"
        ></div>
      </div>
      <span>{{ userTyping.username }} 正在输入...</span>
    </div>

    <!-- 空状态 -->
    <div
      v-if="messages.length === 0"
      class="empty-state flex flex-col items-center justify-center h-full text-gray-400"
    >
      <MessageSquare class="w-16 h-16 mb-4" />
      <p>还没有消息，开始聊天吧！</p>
      <p class="text-sm mt-2">消息会在20秒后自动消失</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { useChatStore } from '@/stores/chat'
import { MessageSquare } from 'lucide-vue-next'

// Props
const props = defineProps({
  messages: {
    type: Array,
    default: () => [],
  },
})

// Stores
const userStore = useUserStore()
const chatStore = useChatStore()

// Refs
const messageListRef = ref(null)

// Computed
const currentUserId = computed(() => userStore.userId)
const currentUserAvatar = computed(() => userStore.avatar)
const userTyping = computed(() => chatStore.userTyping)

const systemMessages = computed(() => {
  return props.messages.filter((msg) => msg.type === 'system')
})

const userMessages = computed(() => {
  return props.messages.filter((msg) => msg.type !== 'system')
})

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 自动滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

// 监听消息变化，自动滚动
watch(
  () => props.messages.length,
  () => {
    scrollToBottom()
  },
  { flush: 'post' },
)

// 监听用户输入状态
watch(userTyping, scrollToBottom)
</script>

<style scoped>
.message-list {
  scroll-behavior: smooth;
}

.message-bubble {
  position: relative;
  word-break: break-word;
}

.message-bubble::after {
  content: '';
  position: absolute;
  bottom: 0;
  width: 12px;
  height: 12px;
  background: inherit;
}

.justify-start .message-bubble::after {
  left: -6px;
  border-bottom-right-radius: 8px;
  border-left: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  clip-path: polygon(0 0, 100% 0, 100% 100%);
}

.justify-end .message-bubble::after {
  right: -6px;
  border-bottom-left-radius: 8px;
  border-right: 1px solid #4f46e5;
  border-bottom: 1px solid #4f46e5;
  clip-path: polygon(0 0, 100% 0, 0 100%);
}

.bg-primary::after {
  border-color: #4f46e5;
}

.typing-dots .dot {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.4;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-2px);
  }
}

.progress-bar {
  animation: progress 20s linear forwards;
}

@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
</style>
