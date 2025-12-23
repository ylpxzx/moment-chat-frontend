<template>
  <div class="room-header border-b border-gray-200 bg-white px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- 房间信息 -->
      <div class="flex items-center gap-3">
        <!-- 返回按钮（移动端） -->
        <button
          @click="$router.push('/')"
          class="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
          type="button"
        >
          <ArrowLeft class="w-5 h-5 text-gray-600" />
        </button>

        <!-- 房间状态 -->
        <div>
          <h1 class="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <MessageSquare class="w-5 h-5" />
            <span>房间: {{ roomIdDisplay }}</span>

            <!-- 连接状态 -->
            <span
              :class="[
                'connection-status inline-flex items-center gap-1 text-sm font-normal',
                connectionStatus === 'connected' ? 'text-success' : 'text-warning',
              ]"
            >
              <div
                :class="[
                  'w-2 h-2 rounded-full',
                  connectionStatus === 'connected' ? 'bg-success animate-pulse-slow' : 'bg-warning',
                ]"
              ></div>
              {{ connectionStatusText }}
            </span>
          </h1>

          <!-- 在线用户 -->
          <div class="flex items-center gap-4 mt-1 text-sm text-gray-600">
            <div class="flex items-center gap-2">
              <Users class="w-4 h-4" />
              <span>{{ userCount }} 人在线</span>
            </div>

            <!-- 复制房间号 -->
            <button
              @click="copyRoomId"
              class="flex items-center gap-1 hover:text-primary transition-colors"
              type="button"
            >
              <Copy class="w-4 h-4" />
              复制房间号
            </button>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex items-center gap-2">
        <!-- 用户头像 -->
        <div class="flex items-center gap-3 mr-4">
          <img
            :src="userStore.avatar"
            :alt="userStore.username"
            class="w-10 h-10 rounded-full border-2 border-white shadow"
          />
          <div class="hidden md:block">
            <div class="font-medium text-gray-800">{{ userStore.username }}</div>
            <div class="text-xs text-gray-500">我</div>
          </div>
        </div>

        <!-- 离开按钮 -->
        <button
          @click="leaveRoom"
          class="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          type="button"
        >
          <LogOut class="w-4 h-4" />
          <span class="hidden sm:inline">离开房间</span>
        </button>
      </div>
    </div>

    <!-- 在线用户列表 -->
    <div v-if="users.length > 0" class="mt-4 pt-4 border-t border-gray-100">
      <div class="flex items-center gap-2 text-sm text-gray-600 mb-2">
        <Users class="w-4 h-4" />
        <span>在线成员</span>
      </div>
      <div class="flex flex-wrap gap-3">
        <div
          v-for="user in users"
          :key="user.id"
          class="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg"
        >
          <img :src="user.avatar" :alt="user.username" class="w-8 h-8 rounded-full" />
          <span class="text-sm">{{ user.username }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useChatStore } from '@/stores/chat'
import { MessageSquare, Users, Copy, LogOut, ArrowLeft } from 'lucide-vue-next'

// Props
const props = defineProps({
  roomId: {
    type: String,
    required: true,
  },
})

// Router
const router = useRouter()

// Stores
const userStore = useUserStore()
const chatStore = useChatStore()

// Computed
const roomIdDisplay = computed(() => props.roomId)
const connectionStatus = computed(() => chatStore.connectionStatus)
const userCount = computed(() => chatStore.users.length) // +1 包括自己
const users = computed(() => chatStore.users)

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

// 复制房间号
const copyRoomId = async () => {
  try {
    await navigator.clipboard.writeText(props.roomId)

    // 显示成功提示
    window.$message?.success?.('房间号已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
    window.$message?.error?.('复制失败')
  }
}

// 离开房间
const leaveRoom = () => {
  chatStore.leaveRoom()
  router.push('/')
}
</script>

<style scoped>
.room-header {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
