import React, { useEffect, useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { AuthContext } from '../context/AuthContext'

export default function ProjectDetail(){
  const { id } = useParams()
  const nav = useNavigate()
  const { user, loading: authLoading } = useContext(AuthContext)
  
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskAssignedTo, setTaskAssignedTo] = useState('')
  const [taskDueDate, setTaskDueDate] = useState('')

  useEffect(()=>{
    if (authLoading) return
    if (!user) {
      nav('/login')
      return
    }
    fetchData()
  }, [user, authLoading, id])

  async function fetchData(){
    try {
      setLoading(true)
      const p = await api.get(`/projects/${id}`)
      setProject(p.data.project)
      const t = await api.get(`/tasks?projectId=${id}`)
      setTasks(t.data.tasks)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  async function createOrUpdateTask(e){
    e.preventDefault()
    setError('')
    try {
      if (editingTask) {
        const res = await api.put(`/tasks/${editingTask._id}`, {
          title: taskTitle,
          description: taskDescription,
          assignedTo: taskAssignedTo || null,
          dueDate: taskDueDate || null
        })
        setTasks(tasks.map(t => t._id === editingTask._id ? res.data.task : t))
        setSuccess('Task updated successfully!')
      } else {
        const res = await api.post('/tasks', {
          title: taskTitle,
          description: taskDescription,
          projectId: id,
          assignedTo: taskAssignedTo || null,
          dueDate: taskDueDate || null
        })
        setTasks([...tasks, res.data.task])
        setSuccess('Task created successfully!')
      }
      resetTaskForm()
      setShowTaskModal(false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task')
    }
  }

  async function updateTaskStatus(taskId, status){
    try {
      const res = await api.put(`/tasks/${taskId}`, { status })
      setTasks(tasks.map(t => t._id === taskId ? res.data.task : t))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task')
    }
  }

  async function deleteTask(taskId){
    if (!window.confirm('Delete this task?')) return
    try {
      await api.delete(`/tasks/${taskId}`)
      setTasks(tasks.filter(t => t._id !== taskId))
      setSuccess('Task deleted')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task')
    }
  }

  function resetTaskForm(){
    setTaskTitle('')
    setTaskDescription('')
    setTaskAssignedTo('')
    setTaskDueDate('')
    setEditingTask(null)
  }

  function openEditTask(task){
    setEditingTask(task)
    setTaskTitle(task.title)
    setTaskDescription(task.description || '')
    setTaskAssignedTo(task.assignedTo?._id || '')
    setTaskDueDate(task.dueDate ? task.dueDate.split('T')[0] : '')
    setShowTaskModal(true)
  }

  if (authLoading || loading) return <div className="loading">Loading...</div>
  if (!user) return null
  if (!project) return <div className="error">Project not found</div>

  return (
    <div>
      <button onClick={() => nav('/projects')} style={{ marginBottom: 16 }}>← Back to Projects</button>
      
      <div className="card">
        <h1>{project.name}</h1>
        <p>{project.description || 'No description'}</p>
        <div style={{ marginTop: 12, fontSize: 14, color: '#7f8c8d' }}>
          <div>Created by: {project.createdBy?.name}</div>
          <div>Members: {project.members?.length || 0}</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Tasks ({tasks.length})</h2>
        <button className="btn-success" onClick={() => { resetTaskForm(); setShowTaskModal(true) }}>+ Add Task</button>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {tasks.length === 0 ? (
        <div className="empty-state">
          <p>No tasks yet. Create one to get started!</p>
        </div>
      ) : (
        <div>
          {tasks.map(task => (
            <div key={task._id} className={`task-item ${task.status.toLowerCase().replace(' ', '-')}`}>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px 0' }}>{task.title}</h4>
                {task.description && <p style={{ margin: '4px 0', fontSize: 14, color: '#7f8c8d' }}>{task.description}</p>}
                <div style={{ fontSize: 12, color: '#7f8c8d', marginTop: 4 }}>
                  <span>Assigned to: {task.assignedTo?.name || 'Unassigned'}</span>
                  {task.dueDate && <span style={{ marginLeft: 16 }}>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select 
                  value={task.status}
                  onChange={e => updateTaskStatus(task._id, e.target.value)}
                  style={{ padding: '6px', borderRadius: 4 }}
                >
                  <option>Todo</option>
                  <option>In Progress</option>
                  <option>Done</option>
                </select>
                <button className="btn-small" onClick={() => openEditTask(task)}>Edit</button>
                <button className="btn-small btn-danger" onClick={() => deleteTask(task._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showTaskModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
              <button className="close-btn" onClick={() => { setShowTaskModal(false); resetTaskForm() }}>×</button>
            </div>
            {error && <div className="error">{error}</div>}
            <form onSubmit={createOrUpdateTask}>
              <div className="form-group">
                <label>Task Title *</label>
                <input 
                  required
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={taskDescription}
                  onChange={e => setTaskDescription(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Assign To (User ID)</label>
                <input 
                  placeholder="Leave blank for unassigned"
                  value={taskAssignedTo}
                  onChange={e => setTaskAssignedTo(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input 
                  type="date"
                  value={taskDueDate}
                  onChange={e => setTaskDueDate(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" style={{ flex: 1 }}>{editingTask ? 'Update Task' : 'Create Task'}</button>
                <button type="button" onClick={() => { setShowTaskModal(false); resetTaskForm() }} style={{ flex: 1, background: '#95a5a6' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}