import { createRouter, createWebHistory } from 'vue-router'
import { isLoggedIn } from '../utils/api.js'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Plan from '../views/Plan.vue'
import Workout from '../views/Workout.vue'
import Stats from '../views/Stats.vue'
import Profile from '../views/Profile.vue'
import CheckIn from '../views/CheckIn.vue'
import PlanEdit from '../views/PlanEdit.vue'
import Exercises from '../views/Exercises.vue'

const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/', name: 'Home', component: Home, meta: { requiresAuth: true } },
  { path: '/plan', name: 'Plan', component: Plan, meta: { requiresAuth: true } },
  { path: '/plan/:id/edit', name: 'PlanEdit', component: PlanEdit, meta: { requiresAuth: true, hideTabBar: true } },
  { path: '/exercises', name: 'Exercises', component: Exercises, meta: { requiresAuth: true, hideTabBar: true } },
  { path: '/workout/:id', name: 'Workout', component: Workout, meta: { requiresAuth: true } },
  { path: '/stats', name: 'Stats', component: Stats, meta: { requiresAuth: true } },
  { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/checkin', name: 'CheckIn', component: CheckIn, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    next('/login')
  } else if (to.path === '/login' && isLoggedIn()) {
    next('/')
  } else {
    next()
  }
})

export default router
