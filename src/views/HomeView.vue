<template>
  <div class="home-view">
    <div class="container">
      <!-- Logo/标题 -->
      <div class="logo-section">
        <div class="logo">🔥</div>
        <h1 class="title">闪聊</h1>
        <p class="subtitle">消息20秒后自动消失的隐私聊天应用</p>
      </div>

      <!-- 主卡片 -->
      <div class="main-card">
        <!-- 用户信息设置 -->
        <div class="user-section">
          <h2 class="section-title">你的信息</h2>

          <!-- 头像选择 -->
          <div class="avatar-section">
            <label class="section-label">选择头像</label>
            <div class="avatar-grid">
              <div
                v-for="(avatar, index) in userStore.defaultAvatars"
                :key="index"
                @click="userStore.updateAvatar(avatar)"
                :class="['avatar-option', avatar === userStore.avatar ? 'avatar-selected' : '']"
              >
                <img :src="avatar" alt="头像" class="avatar-image" />
              </div>
            </div>
          </div>

          <!-- 用户名输入 -->
          <div class="username-section">
            <label for="username" class="section-label"> 用户名 </label>
            <div class="input-group">
              <input
                id="username"
                v-model="usernameInput"
                type="text"
                class="username-input"
                placeholder="输入你的用户名"
                maxlength="20"
              />
              <button @click="generateRandomName" class="random-btn" type="button">随机生成</button>
            </div>
            <div class="input-hint">提示：为了保护隐私，建议使用昵称</div>
          </div>
        </div>

        <!-- 房间操作 -->
        <div class="room-section">
          <!-- 创建新房间 -->
          <div class="action-section">
            <button
              @click="createNewRoom"
              :disabled="isCreatingRoom"
              :class="['action-btn', 'primary-btn', isCreatingRoom ? 'loading' : '']"
              type="button"
            >
              <span v-if="!isCreatingRoom">创建新房间</span>
              <span v-else>创建中...</span>
            </button>
          </div>

          <!-- 分隔线 -->
          <div class="divider">
            <span>或</span>
          </div>

          <!-- 加入房间 -->
          <div class="join-section">
            <label for="roomId" class="section-label"> 输入房间号加入 </label>
            <div class="input-group">
              <input
                id="roomId"
                v-model="roomIdInput"
                type="text"
                :class="['room-input', roomError ? 'input-error' : '']"
                placeholder="输入6位房间号"
                maxlength="6"
                @input="formatRoomId"
              />
              <button
                @click="joinRoom"
                :disabled="!canJoin || isCheckingRoom"
                :class="[
                  'join-btn',
                  'success-btn',
                  !canJoin || isCheckingRoom ? 'btn-disabled' : '',
                ]"
                type="button"
              >
                <span v-if="!isCheckingRoom">加入</span>
                <span v-else>检查中...</span>
              </button>
            </div>
            <div v-if="roomError" class="error-message">⚠️ {{ roomError }}</div>
          </div>
        </div>

        <!-- 功能说明 -->
        <div class="features-section">
          <h3 class="section-title">使用说明</h3>
          <ul class="features-list">
            <li class="feature-item">
              <span class="feature-icon">✓</span>
              <span class="feature-text">消息发送后20秒自动消失</span>
            </li>
            <li class="feature-item">
              <span class="feature-icon">✓</span>
              <span class="feature-text">支持表情符号输入</span>
            </li>
            <li class="feature-item">
              <span class="feature-icon">✓</span>
              <span class="feature-text">无需注册，保护隐私</span>
            </li>
            <li class="feature-item">
              <span class="feature-icon">✓</span>
              <span class="feature-text">房间24小时无活动自动关闭</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- 页脚 -->
      <div class="footer">
        <p>© 2025 闪聊 | 保护隐私的临时聊天工具</p>
        <p class="footer-note">数据不会永久保存，请勿发送敏感信息</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRoom } from '@/composables/useRoom'
import { useUserStore } from '@/stores/user'
import { useChatStore } from '@/stores/chat'

// Router
const router = useRouter()

// Stores
const userStore = useUserStore()
const chatStore = useChatStore()

// Composable
const { createRoom: createRoomApi, checkRoomExists } = useRoom()

// Refs
const usernameInput = ref(userStore.username)
const roomIdInput = ref('')
const roomError = ref('')
const isCreatingRoom = ref(false)
const isCheckingRoom = ref(false)

// Computed
const canJoin = computed(() => {
  return roomIdInput.value.length === 6 && usernameInput.value.trim()
})

// 方法
const generateRandomName = () => {
  usernameInput.value = userStore.generateRandomName()
}

const formatRoomId = () => {
  roomIdInput.value = roomIdInput.value.replace(/[^A-Za-z0-9]/g, '')
}

const createNewRoom = async () => {
  if (!usernameInput.value.trim()) {
    window.$message?.warning?.('请先设置用户名')
    return
  }

  // 更新用户名
  userStore.updateUsername(usernameInput.value)

  isCreatingRoom.value = true
  try {
    const roomId = await createRoomApi()

    // 加入房间
    await joinRoomWithId(roomId)

    window.$message?.success?.('房间创建成功！')
  } catch (error) {
    console.error('创建房间失败:', error)
    window.$message?.error?.('创建房间失败，请重试')
  } finally {
    isCreatingRoom.value = false
  }
}

const joinRoom = async () => {
  if (!canJoin.value) {
    if (!usernameInput.value.trim()) {
      roomError.value = '请先设置用户名'
    } else if (roomIdInput.value.length !== 6) {
      roomError.value = '房间号必须是6位字符'
    }
    return
  }

  // 更新用户名
  userStore.updateUsername(usernameInput.value)

  isCheckingRoom.value = true
  roomError.value = ''

  try {
    // 检查房间是否存在
    const exists = await checkRoomExists(roomIdInput.value)

    if (!exists) {
      roomError.value = '房间不存在或已过期'
      return
    }

    // 加入房间
    await joinRoomWithId(roomIdInput.value)
  } catch (error) {
    console.error('加入房间失败:', error)
    roomError.value = '检查房间时发生错误'
  } finally {
    isCheckingRoom.value = false
  }
}

const joinRoomWithId = async (roomId) => {
  try {
    await chatStore.joinRoom(roomId, {
      username: userStore.username,
      avatar: userStore.avatar,
      user_id: userStore.userId,
    })

    // 跳转到房间页面
    router.push(`/room/${roomId}`)
  } catch (error) {
    console.error('加入房间失败:', error)
    window.$message?.error?.('加入房间失败，请重试')
  }
}

// 监听用户名输入
watch(usernameInput, (newVal) => {
  if (newVal.trim()) {
    userStore.updateUsername(newVal)
  }
})

// 监听房间号输入
watch(roomIdInput, (newVal) => {
  if (newVal === '') {
    roomError.value = ''
  }
})

// 页面加载时检查URL参数
onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const roomId = urlParams.get('room')

  if (roomId && roomId.length === 6) {
    roomIdInput.value = roomId
  }
})
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  width: 100%;
  max-width: 500px;
  text-align: center;
}

/* Logo区域 */
.logo-section {
  margin-bottom: 30px;
}

.logo {
  font-size: 4rem;
  margin-bottom: 10px;
  color: white;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
}

.title {
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  margin-bottom: 30px;
}

/* 主卡片 */
.main-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  margin-bottom: 30px;
}

/* 用户信息部分 */
.user-section {
  margin-bottom: 30px;
}

.section-title {
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: left;
}

.section-label {
  display: block;
  color: #666;
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 10px;
  text-align: left;
}

/* 头像选择 */
.avatar-section {
  margin-bottom: 25px;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
}

.avatar-option {
  padding: 4px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.avatar-option:hover {
  transform: scale(1.05);
  border-color: #e2e8f0;
}

.avatar-selected {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.avatar-image {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

/* 用户名输入 */
.username-section {
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}

.username-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s;
}

.username-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.random-btn {
  padding: 12px 20px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #4a5568;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.random-btn:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.input-hint {
  color: #a0aec0;
  font-size: 0.85rem;
  text-align: left;
  margin-top: 5px;
}

/* 房间操作部分 */
.room-section {
  margin-bottom: 30px;
}

.action-section {
  margin-bottom: 20px;
}

.action-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.primary-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.primary-btn:hover:not(.loading) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.primary-btn.loading {
  opacity: 0.8;
  cursor: not-allowed;
}

/* 分隔线 */
.divider {
  position: relative;
  margin: 25px 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e2e8f0;
}

.divider span {
  position: relative;
  display: inline-block;
  padding: 0 15px;
  background: white;
  color: #a0aec0;
  font-size: 0.9rem;
}

/* 加入房间部分 */
.join-section {
  margin-top: 20px;
}

.room-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 1px;
  /* text-transform: uppercase; */
  text-align: center;
  outline: none;
  transition: all 0.3s;
}

.room-input:focus {
  border-color: #48bb78;
  box-shadow: 0 0 0 3px rgba(72, 187, 120, 0.2);
}

.room-input.input-error {
  border-color: #f56565;
  box-shadow: 0 0 0 3px rgba(245, 101, 101, 0.2);
}

.join-btn {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.success-btn {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
}

.success-btn:hover:not(.btn-disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(72, 187, 120, 0.3);
}

.btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #f56565;
  font-size: 0.9rem;
  text-align: left;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 功能说明 */
.features-section {
  padding-top: 25px;
  border-top: 1px solid #e2e8f0;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  color: #4a5568;
}

.feature-icon {
  color: #48bb78;
  font-weight: bold;
  font-size: 1.2rem;
}

.feature-text {
  font-size: 0.95rem;
}

/* 页脚 */
.footer {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  line-height: 1.5;
}

.footer-note {
  margin-top: 5px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
}

/* 响应式设计 */
@media (max-width: 640px) {
  .container {
    padding: 10px;
  }

  .main-card {
    padding: 25px;
  }

  .logo {
    font-size: 3rem;
  }

  .title {
    font-size: 2rem;
  }

  .avatar-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .input-group {
    flex-direction: column;
  }

  .random-btn,
  .join-btn {
    width: 100%;
  }
}
</style>
