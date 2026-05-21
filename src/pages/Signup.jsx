import React, { useState, useContext } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Signup(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Member')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()
  const { login } = useContext(AuthContext)

  const submit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/signup', { name, email, password, role })
      login(data.user, data.token)
      nav('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto' }}>
      <div className="card">
        <h2>Sign Up</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Name</label>
            <input 
              required
              value={name} 
              onChange={e=>setName(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email"
              required
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Password (min 6 chars)</label>
            <input 
              type="password"
              required
              minLength="6"
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={role} onChange={e=>setRole(e.target.value)}>
              <option>Member</option>
              <option>Admin</option>
            </select>
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <p style={{ marginTop: 16, textAlign: 'center' }}>
          Already have an account? <a href="/login">Log in</a>
        </p>
      </div>
    </div>
  )
}
