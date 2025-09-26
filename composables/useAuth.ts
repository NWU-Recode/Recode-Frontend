import { useRouter, useRuntimeConfig } from '#app'
import { computed, ref, onMounted } from 'vue'

export interface User {
  id: number
  email: string
  full_name: string
  avatar_url?: string
  role: 'student' | 'lecturer' | 'admin' | string
}

// undefined = loading, null = not logged in
const user = ref<User | null | undefined>(undefined)
const loading = ref(false)
const error = ref<unknown | null>(null)

export function useAuth() {
  const router = useRouter()
  const config = useRuntimeConfig()

  const isAuthenticated = computed(() => !!user.value)
  const role = computed(() => user.value?.role ?? null)

  const fetchUser = async (): Promise<User | null> => {
    user.value = undefined
    loading.value = true
    error.value = null

    // Only access localStorage on the client
    const getClientToken = () => {
      if (process.client) {
        return {
          access: localStorage.getItem('access_token'),
          refresh: localStorage.getItem('refresh_token'),
        }
      }
      return { access: null, refresh: null }
    }

    const getNewToken = async (): Promise<string> => {
      const { refresh } = getClientToken()
      if (!refresh) throw new Error('No refresh token available')
      const refreshResponse = await $fetch<{ access_token: string }>(
          `${config.public.apiBase}/auth/refresh`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${refresh}` },
          }
      )
      if (process.client) localStorage.setItem('access_token', refreshResponse.access_token)
      return refreshResponse.access_token
    }

    try {
      let { access: token, refresh: refreshToken } = getClientToken()

      if (!token && !refreshToken) {
        user.value = null
        loading.value = false
        if (process.client) router.push('/login')
        return null
      }

      const attemptFetch = async (): Promise<User> => {
        return await $fetch<User>(`${config.public.apiBase}/profiles/me`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        })
      }

      try {
        if (!token) token = await getNewToken()
        user.value = await attemptFetch()
      } catch (err: any) {
        if (err?.response?.status === 401 && refreshToken) {
          token = await getNewToken()
          user.value = await attemptFetch()
        } else {
          throw err
        }
      }

      return user.value
    } catch (err) {
      console.error('Error fetching user:', err)
      user.value = null
      error.value = err
      if (process.client) router.push('/login')
      return null
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      if (process.client) {
        const token = localStorage.getItem('access_token')
        if (token) {
          await $fetch(`${config.public.apiBase}/auth/logout`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          })
        }
      }
    } catch (err) {
      console.error('Error logging out:', err)
    } finally {
      user.value = null
      error.value = null
      loading.value = false
      if (process.client) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        router.push('/login')
      }
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    role,
    fetchUser,
    logout,
  }
}