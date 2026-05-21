import React, { useEffect, useState, useContext } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Dashboard(){
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, loading: authLoading } = useContext(AuthContext)
  const nav = useNavigate()

  useEffect(()=>{
    if (authLoading) return
    if (!user) {
      nav('/login')
      return
    }
    fetchData()
  }, [user, authLoading])

  async function fetchData(){
    try {
      setLoading(true)
      const p = await api.get('/projects')
      setProjects(p.data.projects)
      const t = await api.get('/tasks')
      setTasks(t.data.tasks)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) return <div className="loading">Loading...</div>
  if (!user) return null

  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'Done').length
  const pendingTasks = tasks.filter(t => t.status !== 'Done').length
  const overdueTasks = tasks.filter(t => {
    if (t.status === 'Done') return false
    if (!t.dueDate) return false
    return new Date(t.dueDate) < new Date()
  }).length

  return (
    <div>
      <h1>Dashboard</h1>
      
      <div className="grid">
        <div className="stat-card">
          <div className="stat-value">{totalTasks}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{color: '#27ae60'}}>{completedTasks}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{color: '#f39c12'}}>{pendingTasks}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{color: '#e74c3c'}}>{overdueTasks}</div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      <div style={{ marginTop: 40 }}>
        <h2>Recent Projects</h2>
        {projects.length === 0 ? (
          <div className="empty-state">
            <p>No projects yet. <a href="/projects">Create one</a></p>
          </div>
        ) : (
          <div className="grid">
            {projects.slice(0, 3).map(p => (
              <div key={p._id} className="project-card" onClick={() => nav(`/projects/${p._id}`)}>
                <h3>{p.name}</h3>
                <p>{p.description || 'No description'}</p>
                <small>Created by: {p.createdBy?.name || 'Unknown'}</small>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 40 }}>
        <h2>My Tasks</h2>
        {tasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks assigned to you</p>
          </div>
        ) : (
          <div>
            {tasks.slice(0, 5).map(t => (
              <div key={t._id} className={`task-item ${t.status.toLowerCase().replace(' ', '-')}`}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0' }}>{t.title}</h4>
                  <small>Project: {t.projectId?.name || 'Unknown'}</small>
                  {t.dueDate && (
                    <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#7f8c8d' }}>
                      Due: {new Date(t.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span className={`task-status ${t.status.toLowerCase().replace(' ', '-')}`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
