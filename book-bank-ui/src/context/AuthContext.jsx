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
      (email.trim().toLowerCase() === 'admin@bookbank.edu' && password === 'admin123') ||
      email.trim().toLowerCase().includes('librarian')

    const resolvedName = isLibrarian
      ? 'Librarian'
      : (name.trim() || email.split('@')[0])

    // TODO: replace with the role returned by the real backend login response.
    const loggedUser = {
      name: resolvedName,
      email,
      role: isLibrarian ? 'librarian' : 'student',
    }
    setUser(loggedUser)
    localStorage.setItem('bb_user', JSON.stringify(loggedUser))
    return loggedUser
  }

  const register = (name, email, password, studentId = '') => {
    // Registered accounts are always students
    // TODO: replace with the role returned by the real backend login response.
    const loggedUser = {
      name: name.trim() || (email ? email.split('@')[0] : 'Student'),
      email,
      studentId,
      role: 'student',
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
    <AuthContext.Provider value={{ user, login, register, logout }}>
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
