import { ref } from 'vue'

export function useRoom() {
  const loading = ref(false)
  const error = ref<any>(null)

  const checkRoomExists = async (roomId: string) => {
    try {
      loading.value = true
      const response = await fetch(`/api/v1/rooms/${roomId}/check`)
      const data = await response.json()
      return data.exists
    } catch (err) {
      error.value = '检查房间时发生错误'
      console.error(err)
      return false
    } finally {
      loading.value = false
    }
  }

  const getRoomInfo = async (roomId: string) => {
    try {
      loading.value = true
      const response = await fetch(`/api/v1/rooms/${roomId}/info`)
      if (!response.ok) throw new Error('房间不存在')
      return await response.json()
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createRoom = async () => {
    try {
      loading.value = true
      const response = await fetch('/api/v1/rooms', {
        method: 'POST',
      })
      const data = await response.json()
      return data.roomId
    } catch (err) {
      error.value = '创建房间时发生错误'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    checkRoomExists,
    getRoomInfo,
    createRoom,
  }
}
