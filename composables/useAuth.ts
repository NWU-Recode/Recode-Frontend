import { useRouter, useRuntimeConfig } from '#app'
import { computed, ref } from 'vue'

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
    user.value = undefined // <-- mark as loading
    loading.value = true
    error.value = null

    const getNewToken = async (): Promise<string> => {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) throw new Error('No refresh token available')
      const refreshResponse = await $fetch<{ access_token: string }>(
          `${config.public.apiBase}/auth/refresh`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${refreshToken}` },
          }
      )
      localStorage.setItem('access_token', refreshResponse.access_token)
      return refreshResponse.access_token
    }

    try {
      let token = localStorage.getItem('access_token')
      const refreshToken = localStorage.getItem('refresh_token')

      // 🚨 If there are no tokens at all → log them out immediately
      if (!token && !refreshToken) {
        user.value = null
        loading.value = false  // ✅ stop loading
        router.push('/login')
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
      router.push('/login')
      return null
    } finally {
      loading.value = false  // ✅ always stop loading
    }
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (token) {
        await $fetch(`${config.public.apiBase}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
      }
    } catch (err) {
      console.error('Error logging out:', err)
    } finally {
      user.value = null
      error.value = null
      loading.value = false
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      router.push('/login')
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
