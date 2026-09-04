import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('bb_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const login = (email, password, name = '') => {
    const isLibrarian =
      email.toLowerCase().includes('librarian') ||
      (email === 'admin@bookbank.edu' && password === 'admin123')

    // Use the explicitly supplied name; fall back to a sensible default
    const resolvedName =
      name.trim() ||
      (email === 'admin@bookbank.edu' ? 'Librarian Admin' : (isLibrarian ? 'Marian Paroo' : email.split('@')[0]))

    const loggedUser = {
      name: resolvedName,
      email,
      role: isLibrarian ? 'librarian' : 'student',
    }
    setUser(loggedUser)
    localStorage.setItem('bb_user', JSON.stringify(loggedUser))
    return loggedUser
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('bb_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    // Return a mock default if called outside provider for robustness
    return {
      user: null,
      login: () => {},
      logout: () => {}
    }
  }
  return context
}
