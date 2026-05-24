

const refreshToken = async () => {
    const refresh_token = localStorage.getItem('refresh_token')
    if (!refresh_token) return null

    const response = await fetch('http://localhost:9128/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token })
    })

    const data = await response.json()
    if (!response.ok) return null

    localStorage.setItem('token', data.token)
    localStorage.setItem('refresh_token', data.refresh_token)
    return data.token
}

const fetchConToken = async (url, options = {}) => {
    let token = localStorage.getItem('token')

    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`
        }
    })

    // si expira trata de renovar
    if (response.status === 401) {
        token = await refreshToken()

        if (!token) {
            // si no se puede renovar manda al login
            localStorage.removeItem('token')
            localStorage.removeItem('refresh_token')
            window.location.href = '/login'
            return null
        }

        // fetch con nuevo token
        return fetch(url, {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${token}`
            }
        })
    }

    return response
}

export default fetchConToken