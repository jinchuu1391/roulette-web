import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/room/:roomId',
      name: 'room',
      beforeEnter: (to, from, next) => {
        if (!sessionStorage.getItem('nickname')) {
          next({ name: 'nickname', params: { roomId: to.params.roomId } })
        } else {
          next()
        }
      },
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/RoomView.vue'),
    },
    {
      path: '/nickname/:roomId',
      name: 'nickname',
      component: () => import('../views/NicknameView.vue'),
    },
  ],
})

export default router
