import React, { useEffect, useState, useContext } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Projects(){
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { user, loading: authLoading } = useContext(AuthContext)
  const nav = useNavigate()

  useEffect(()=>{
    if (authLoading) return
    if (!user) {
      nav('/login')
      return
    }
    fetchProjects()
  }, [user, authLoading])

  async function fetchProjects(){
    try {
      setLoading(true)
      const p = await api.get('/projects')
      setProjects(p.data.projects)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  async function createProject(e){
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const res = await api.post('/projects', { name, description })
      setProjects([...projects, res.data.project])
      setName('')
      setDescription('')
      setShowModal(false)
      setSuccess('Project created successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project')
    }
  }

  if (authLoading || loading) return <div className="loading">Loading...</div>
  if (!user) return null

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Projects</h1>
        {user.role === 'Admin' && (
          <button className="btn-success" onClick={() => setShowModal(true)}>+ New Project</button>
        )}
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {projects.length === 0 ? (
        <div className="empty-state">
          <p>No projects found</p>
          {user.role === 'Admin' && <button onClick={() => setShowModal(true)}>Create first project</button>}
        </div>
      ) : (
        <div className="grid">
          {projects.map(p => (
            <div key={p._id} className="project-card" onClick={() => nav(`/projects/${p._id}`)}>
              <h3>{p.name}</h3>
              <p>{p.description || 'No description'}</p>
              <div style={{ marginTop: 12, fontSize: 12, color: '#7f8c8d' }}>
                <div>Created by: {p.createdBy?.name || 'Unknown'}</div>
                <div>Members: {p.members?.length || 0}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Project</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="error">{error}</div>}
            <form onSubmit={createProject}>
              <div className="form-group">
                <label>Project Name *</label>
                <input 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="4"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" style={{ flex: 1 }}>Create Project</button>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, background: '#95a5a6' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}