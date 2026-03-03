import { useState, useMemo } from 'react'
import './App.css'

function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Build a React project 🚀', done: false, priority: 'high' },
    { id: 2, text: 'Push code to GitHub',        done: false, priority: 'medium' },
    { id: 3, text: 'Learn JavaScript basics',    done: true,  priority: 'low' },
  ])
  const [input, setInput]       = useState('')
  const [priority, setPriority] = useState('medium')
  const [filter, setFilter]     = useState('all')

  const add = () => {
    const text = input.trim()
    if (!text) return
    setTodos(prev => [{ id: Date.now(), text, done: false, priority }, ...prev])
    setInput('')
  }

  const toggle    = id => setTodos(prev => prev.map(t => t.id === id ? {...t, done: !t.done} : t))
  const remove    = id => setTodos(prev => prev.filter(t => t.id !== id))
  const clearDone = ()  => setTodos(prev => prev.filter(t => !t.done))

  const filtered = useMemo(() => {
    if (filter === 'active')    return todos.filter(t => !t.done)
    if (filter === 'completed') return todos.filter(t =>  t.done)
    return todos
  }, [todos, filter])

  const doneCount = todos.filter(t => t.done).length
  const progress  = todos.length ? Math.round((doneCount / todos.length) * 100) : 0

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
        {filtered.length === 0 ? (
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
