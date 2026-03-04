import { useState, useMemo, useEffect } from 'react'
import './App.css'

function App() {
  const [todos, setTodos] = useState([])
  const [input, setInput]       = useState('')
  const [priority, setPriority] = useState('medium')
  const [filter, setFilter]     = useState('all')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const add = async () => {
    const text = input.trim()
    if (!text) return
    setError(null)
    try {
      const res = await fetch('/api/addTask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, priority })
      })
      if (!res.ok) throw new Error(`Add failed: ${res.status}`)
      const created = await res.json()
      setTodos(prev => [created, ...prev])
      setInput('')
    } catch (err) {
      console.error(err)
      setError('Failed to add task')
    }
  }

  const toggle = id => setTodos(prev => prev.map(t => t.id === id ? {...t, done: !t.done} : t))

  const remove = async id => {
    setError(null)
    try {
      const res = await fetch(`/api/deleteTask/${id}`, { method: 'DELETE' })
      if (res.status !== 204 && res.status !== 200) {
        // try to parse any returned body
        let body = null
        try { body = await res.json() } catch (e) {}
        throw new Error(`Delete failed: ${res.status} ${body && body.error ? body.error : ''}`)
      }
      setTodos(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      console.error(err)
      setError('Failed to delete task')
    }
  }
  const clearDone = ()  => setTodos(prev => prev.filter(t => !t.done))

  const filtered = useMemo(() => {
    if (filter === 'active')    return todos.filter(t => !t.done)
    if (filter === 'completed') return todos.filter(t =>  t.done)
    return todos
  }, [todos, filter])

  const doneCount = todos.filter(t => t.done).length
  const progress  = todos.length ? Math.round((doneCount / todos.length) * 100) : 0

  useEffect(() => {
    let mounted = true
    ;(async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/getTasks')
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)
        const data = await res.json()
        if (mounted) setTodos(data)
      } catch (err) {
        console.error(err)
        if (mounted) setError('Failed to load tasks')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  return (
    <div className="card root-card">
      <h1 className="title">My <span>To-Do</span> List</h1>
      <p className="subtitle">Stay organised. Get things done. ✨</p>

      <div className="input-row">
        <input className="input-box" placeholder="Add a new task..."
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()} />
        <button className="add-btn" onClick={add}>＋</button>
      </div>

      <select className="priority-select" value={priority} onChange={e => setPriority(e.target.value)}>
        <option value="low">🟢 Low Priority</option>
        <option value="medium">🟡 Medium Priority</option>
        <option value="high">🔴 High Priority</option>
      </select>

      <div className="stats">
        {[["Total", todos.length], ["Active", todos.length - doneCount], ["Done", doneCount], ["Progress", progress + "%"]].map(([label, val]) => (
          <div className="stat-box" key={label}>
            <div className="stat-num">{val}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="progress-wrap">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="filters">
        {['all','active','completed'].map(f => (
          <button key={f} className={`filter-btn ${filter===f?"active":""}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="todo-list">
          {loading ? (
            <div className="empty">Loading tasks…</div>
          ) : filtered.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">✅</div>
                {filter==='completed' ? "No completed tasks yet." : filter==='active' ? "All tasks done! 🎉" : "No tasks yet. Add one above!"}
              </div>
            ) : filtered.map(todo => (
          <div key={todo.id} className={`todo-item ${todo.done?"done-item":""}`}>
            <button className={`check-btn ${todo.done?"checked":""}`} onClick={() => toggle(todo.id)}>
              {todo.done ? "✓" : ""}
            </button>
            <span className={`todo-text ${todo.done?"done-text":""}`}>{todo.text}</span>
            <span className={`badge ${todo.priority}`}>{todo.priority}</span>
            <button className="del-btn" onClick={() => remove(todo.id)}>🗑</button>
          </div>
        ))}
      </div>

      {doneCount > 0 && (
        <button className="clear-btn" onClick={clearDone}>
          🗑 Clear {doneCount} completed task{doneCount > 1 ? 's' : ''}
        </button>
      )}
    </div>
  )
}

export default App
