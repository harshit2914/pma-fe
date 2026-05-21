import React, { createContext, useState, useEffect } from 'react'
import api, { setAuthToken } from '../services/api'

export const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const token = localStorage.getItem('pm_token')
    const u = localStorage.getItem('pm_user')
    if (token && u) {
      setAuthToken(token)
      setUser(JSON.parse(u))
    }
    setLoading(false)
  }, [])

  const login = (user, token) => {
    setAuthToken(token)
    localStorage.setItem('pm_token', token)
    localStorage.setItem('pm_user', JSON.stringify(user))
    setUser(user)
  }

  const logout = () => {
    setAuthToken(null)
    localStorage.removeItem('pm_token')
    localStorage.removeItem('pm_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
