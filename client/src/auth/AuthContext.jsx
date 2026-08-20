import {createContext, useContext, useEffect, useState} from 'react'
import {http} from '../api/http'

const AuthCtx = createContext(null)

export function AuthProvider({children}) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadUser() {
    const token = localStorage.getItem('token')
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const res = await http.get('/auth/profile')
      setUser(res.data.user)
    } catch (e) {
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUser()
  }, [])

  const login = async (token) => {
    localStorage.setItem('token', token)
    setLoading(true)
    await loadUser()
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthCtx.Provider value={{user, loading, login, logout, reload: loadUser}}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
