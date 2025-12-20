<template>
  <div class="message-input-container border-t border-gray-200 bg-white p-4">
    <div class="flex items-end gap-2">
      <!-- 表情选择器 -->
      <EmojiPicker @select="onEmojiSelect" />

      <!-- 输入框 -->
      <div class="flex-1 relative">
        <textarea
          ref="textareaRef"
          v-model="message"
          @input="handleInput"
          @keydown.enter.exact.prevent="sendMessage"
          @keydown.enter.shift.exact.prevent="message += '\n'"
          :placeholder="placeholder"
          :maxlength="maxLength"
          class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          rows="1"
          style="min-height: 44px; max-height: 120px"
        />

        <!-- 字数统计 -->
        <div class="absolute bottom-2 right-3 text-xs text-gray-400">
          {{ message.length }}/{{ maxLength }}
        </div>
      </div>

      <!-- 发送按钮 -->
      <button
        @click="sendMessage"
        :disabled="!canSend"
        :class="[
          'send-button flex-shrink-0 p-3 rounded-full transition-all',
          canSend
            ? 'bg-primary hover:bg-primary-dark text-white shadow-md hover:shadow-lg'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed',
        ]"
        type="button"
      >
        <SendHorizontal class="w-5 h-5" />
      </button>
    </div>

    <!-- 功能提示 -->
    <div class="mt-2 text-xs text-gray-500 flex justify-between">
      <div>按 Enter 发送，Shift + Enter 换行</div>
      <div>消息将在20秒后自动销毁</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { SendHorizontal } from 'lucide-vue-next'
import EmojiPicker from './EmojiPicker.vue'
import { useChatStore } from '@/stores/chat'

// Emits
const emit = defineEmits(['send'])

// Refs
const message = ref('')
const textareaRef = ref(null)
const isTyping = ref(false)
let typingTimeout = null

// Computed
const canSend = computed(() => {
  return message.value.trim().length > 0
})

const placeholder = computed(() => {
  return '输入消息...（支持表情）'
})

const maxLength = computed(() => 500)

// 发送消息
const sendMessage = () => {
  if (!canSend.value) return
  const content = message.value.trim()
  emit('send', content)
  message.value = ''

  // 重置输入框高度
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
      textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
    }
  })

  // 停止输入状态
  stopTyping()
}

// 处理输入
const handleInput = () => {
  // 自动调整高度
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 120) + 'px'
  }

  // 发送输入状态
  if (message.value.trim() && !isTyping.value) {
    startTyping()
  } else if (!message.value.trim() && isTyping.value) {
    stopTyping()
  }

  // 重置定时器
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }

  typingTimeout = setTimeout(() => {
    if (isTyping.value) {
      stopTyping()
    }
  }, 3000)
}

// 开始输入
const startTyping = () => {
  isTyping.value = true
  const chatStore = useChatStore()
  chatStore.sendTypingStatus(true)
}

// 停止输入
const stopTyping = () => {
  isTyping.value = false
  const chatStore = useChatStore()
  chatStore.sendTypingStatus(false)
}

// 选择表情
const onEmojiSelect = (emoji) => {
  message.value += emoji
  textareaRef.value.focus()
}

// 清理
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }
  stopTyping()
})
</script>

<style scoped>
.send-button {
  transition: all 0.2s ease;
}

.send-button:active:not(:disabled) {
  transform: scale(0.95);
}

textarea {
  font-family: inherit;
  line-height: 1.5;
}

textarea::placeholder {
  color: #9ca3af;
}
</style>
