import React, { useContext } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { AuthContext } from './context/AuthContext'

export default function App(){
  const { user, logout } = useContext(AuthContext)
  const nav = useNavigate()

  const handleLogout = () => {
    logout()
    nav('/login')
  }

  return (
    <div>
      <header>
        <nav>
          <div style={{ display: 'flex', gap: 20 }}>
            <Link to="/">Dashboard</Link>
            <Link to="/projects">Projects</Link>
          </div>
          <div className="user-info">
            {user ? (
              <>
                <span>{user.name} ({user.role})</span>
                <button onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/signup">Signup</Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <div className="container">
        <Outlet />
      </div>
    </div>
  )
}
