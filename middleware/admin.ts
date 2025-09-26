export default defineNuxtRouteMiddleware((to, from) => {
    const auth = useAuth()

    if (!auth.user || auth.user.role !== 'admin') {
        return navigateTo('/')
    }
})
