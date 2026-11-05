import React, { createContext, useContext, useState, useEffect } from 'react'

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

  // Keep state in sync if storage changes in another tab
  useEffect(() => {
    const syncUser = (e) => {
      if (e.key === 'bb_user') {
        try {
          setUser(e.newValue ? JSON.parse(e.newValue) : null)
        } catch {
          setUser(null)
        }
      }
    }
    window.addEventListener('storage', syncUser)
    return () => window.removeEventListener('storage', syncUser)
  }, [])

  const login = (email, password = '', name = '', role = '') => {
    const emailLower = (email || '').trim().toLowerCase()
    const isLibrarian =
      role === 'librarian' ||
      emailLower.includes('admin') ||
      emailLower.includes('librarian') ||
      emailLower === 'admin@bookbank.edu' ||
      emailLower === 'librarian@bookbank.local'

    if (isLibrarian) {
      // Librarian is not a member and has no loans or fines
      const librarianUser = {
        name: name.trim() || 'Librarian',
        email: emailLower || 'admin@bookbank.edu',
        role: 'librarian',
        memberId: null,
      }
      setUser(librarianUser)
      localStorage.setItem('bb_user', JSON.stringify(librarianUser))
      return librarianUser
    }

    // Student Login
    // Map test@university.edu or existing emails to member record
    let resolvedMemberId = null
    let resolvedName = name.trim() || email.split('@')[0]
    let resolvedStudentId = 'STU-001'
    let resolvedDept = 'General'

    try {
      const storeData = localStorage.getItem('bb_library_data_v2')
      if (storeData) {
        const parsed = JSON.parse(storeData)
        const found = (parsed.members || []).find(
          m => m.email.toLowerCase() === emailLower || (emailLower === 'test@university.edu' && m.id === 'STU-001')
        )
        if (found) {
          resolvedMemberId = found.id
          resolvedName = found.name
          resolvedStudentId = found.studentId || found.id
          resolvedDept = found.dept || 'General'
        }
      }
    } catch {
      // fallback
    }

    // Default to Aisha Patel for demo convenience if test@university.edu
    if (emailLower === 'test@university.edu' && !resolvedMemberId) {
      resolvedMemberId = 'STU-001'
      resolvedName = 'Aisha Patel'
      resolvedStudentId = 'STU-001'
      resolvedDept = 'Computer Science'
    }

    const loggedUser = {
      name: resolvedName,
      email: emailLower,
      studentId: resolvedStudentId,
      memberId: resolvedMemberId || resolvedStudentId,
      dept: resolvedDept,
      role: 'student',
    }

    setUser(loggedUser)
    localStorage.setItem('bb_user', JSON.stringify(loggedUser))
    return loggedUser
  }

  const register = (name, email, password, studentId = '', dept = 'General') => {
    // Registered accounts are always students
    const cleanId = studentId.trim().toUpperCase() || `STU-${String(Date.now()).slice(-3)}`
    const loggedUser = {
      name: name.trim() || (email ? email.split('@')[0] : 'Student'),
      email: email.trim().toLowerCase(),
      studentId: cleanId,
      memberId: cleanId,
      dept: dept.trim() || 'General',
      role: 'student',
    }
    setUser(loggedUser)
    localStorage.setItem('bb_user', JSON.stringify(loggedUser))
    return loggedUser
  }

  const logout = () => {
    const refreshToken = localStorage.getItem('bb_refresh')
    if (refreshToken) {
      try {
        fetch('http://localhost:8001/api/auth/logout/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        }).catch(() => {})
      } catch (e) {}
    }
    setUser(null)
    localStorage.removeItem('bb_user')
    localStorage.removeItem('bb_access')
    localStorage.removeItem('bb_refresh')
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
    return {
      user: null,
      login: () => {},
      register: () => {},
      logout: () => {},
    }
  }
  return context
}
