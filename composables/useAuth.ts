import { useRouter, useRuntimeConfig } from '#app'
import { computed, ref } from 'vue'

export interface User {
  id: number
  email: string
  full_name: string
  avatar_url?: string
  role: 'student' | 'lecturer' | 'admin' | string // extend as needed
}

const user = ref<User | null>(null)
const loading = ref(false)
const error = ref<unknown | null>(null)

export function useAuth() {
  const router = useRouter()
  const config = useRuntimeConfig()

  const isAuthenticated = computed(() => !!user.value)
  const role = computed(() => user.value?.role ?? null)

  /**
   * Fetch the current user's profile using the access token
   */
  const fetchUser = async () => {
    loading.value = true
    error.value = null

    try {
      const token = localStorage.getItem('access_token')
      if (!token)
        throw new Error('No access token found')

      user.value = await $fetch<User>(`${config.public.apiBase}/profiles/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    }
    catch (err) {
      console.error('Error fetching user:', err)
      error.value = err
      user.value = null
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Logout user and clear stored tokens
   */
  const logout = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (token) {
        await $fetch(`${config.public.apiBase}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      }
    }
    catch (err) {
      console.error('Error logging out:', err)
    }
    finally {
      // Clear all auth state
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
