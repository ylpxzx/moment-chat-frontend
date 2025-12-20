import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RoomView from '../views/RoomView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => HomeView,
    },
    {
      path: '/room/:roomId',
      name: 'Room',
      component: () => RoomView,
      props: true,
    },
  ],
})

export default router
