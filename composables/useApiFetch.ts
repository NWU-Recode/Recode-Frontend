// composables/useApiFetch.ts
import { useRuntimeConfig } from '#app'

export function useApiFetch() {
    const config = useRuntimeConfig()

    const getAccessToken = () => localStorage.getItem('access_token')
    const getRefreshToken = () => localStorage.getItem('refresh_token')

    const refreshAccessToken = async (): Promise<string> => {
        const refreshToken = getRefreshToken()
        if (!refreshToken) throw new Error('No refresh token available')

        const response = await $fetch<{ access_token: string }>(
            `${config.public.apiBase}/auth/refresh`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${refreshToken}`,
                },
            }
        )

        localStorage.setItem('access_token', response.access_token)
        return response.access_token
    }

    /**
     * Core API fetch wrapper
     */
    const apiFetch = async <T = any>(url: string, options: any = {}): Promise<T> => {
        let token = getAccessToken()

        const doFetch = async (accessToken?: string) => {
            return await $fetch<T>(`${config.public.apiBase}${url}`, {
                ...options,
                headers: {
                    ...(options.headers || {}),
                    Authorization: `Bearer ${accessToken ?? token}`,
                },
            })
        }

        try {
            if (!token) token = await refreshAccessToken()
            return await doFetch(token)
        } catch (err: any) {
            if (err?.response?.status === 401) {
                // retry with new token
                token = await refreshAccessToken()
                return await doFetch(token)
            }
            throw err
        }
    }

    return { apiFetch }
}
