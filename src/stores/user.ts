import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const username = ref('')
  const avatar = ref<any>('')
  const userId = ref('')

  // 默认头像列表
  const defaultAvatars = ref([
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Jocelyn',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Liam',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Sawyer',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Katherine',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Easton',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Christian',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Eliza',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Aiden',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Vivian',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Alexander',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Caleb',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Jack',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Brooklynn',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Andrea',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Maria',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Aidan',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Riley',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Jessica',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Sarah',
    'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Mackenzie',
  ])

  // 生成随机用户名
  const randomNames = [
    '皮卡丘队长',
    '咸鱼翻身',
    '柠檬不萌',
    '小猪佩奇',
    '橘子超人',
    '西瓜太郎',
    '土豆侠',
    '奶茶不加糖',
    '火锅小王子',
    '辣条女王',
    '可乐加冰',
    '薯片大侠',
    '小饼干',
    '泡面达人',
    '瓜子精',
    '糖果超甜',
    '小龙虾',
    '猫耳朵',
    '小熊软糖',
    '大脸猫',
    '神秘访客',
    '聊天达人',
    '匿名用户',
    '快乐小熊',
    '智慧猫头鹰',
    '旅行者',
    '星辰',
    '月光',
    '风行者',
    '海之蓝',
    '山之巅',
    '云之端',
    '稻里小嘻帅',
    '麦里小旋风',
  ]

  const generateRandomName = () => {
    return (
      (randomNames[Math.floor(Math.random() * randomNames.length)] ?? '用户') +
      Math.floor(Math.random() * 1000)
    )
  }

  const initUser = () => {
    // 从本地存储加载用户信息
    const savedUser = localStorage.getItem('burn-chat-user')

    if (savedUser) {
      const userData = JSON.parse(savedUser)
      username.value = userData.username
      avatar.value = userData.avatar
      userId.value = userData.userId
    } else {
      // 生成新用户
      username.value = generateRandomName()
      avatar.value = defaultAvatars.value[0]
      userId.value = Date.now().toString() + Math.random().toString(36).substr(2, 9)

      saveUser()
    }
  }

  const saveUser = () => {
    const userData = {
      username: username.value,
      avatar: avatar.value,
      userId: userId.value,
    }

    localStorage.setItem('burn-chat-user', JSON.stringify(userData))
  }

  const updateUsername = (newUsername: string) => {
    if (newUsername.trim()) {
      username.value = newUsername.trim()
      saveUser()
    }
  }

  const updateAvatar = (newAvatar: any) => {
    avatar.value = newAvatar
    saveUser()
  }

  const resetUser = () => {
    localStorage.removeItem('burn-chat-user')
    initUser()
  }

  // 初始化
  initUser()

  return {
    username,
    avatar,
    userId,
    defaultAvatars,
    updateUsername,
    updateAvatar,
    resetUser,
    generateRandomName,
  }
})
