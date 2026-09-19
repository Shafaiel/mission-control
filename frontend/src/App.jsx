import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import PageContainer from './components/PageContainer'
import AgentsPanel from './components/AgentsPanel'
import ChatPanel from './components/ChatPanel'
import TasksPanel from './components/TasksPanel'
import './components/Panel.css'
import './App.css'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '\u{1F3E0}' },
  { id: 'agents', label: 'Agents', icon: '\u{1F916}' },
  { id: 'chat', label: 'Chat', icon: '\u{1F4AC}' },
  { id: 'tasks', label: 'Tasks', icon: '\u2705' },
]

const subtitles = {
  dashboard: 'Overview of your agents, chats and tasks',
  agents: 'The agents you can manage',
  chat: 'Talk to your agents',
  tasks: 'Create and track tasks',
}

function App() {
  const [view, setView] = useState('dashboard')
  const current = navItems.find((item) => item.id === view)

  return (
    <div className="app">
      <Sidebar title="Mission Control" items={navItems} active={view} onSelect={setView} />
      <div className="app__main">
        <Header title={current.label} subtitle={subtitles[view]} />
        <PageContainer>
          {(view === 'dashboard' || view === 'agents') && <AgentsPanel />}
          {(view === 'dashboard' || view === 'chat') && <ChatPanel />}
          {(view === 'dashboard' || view === 'tasks') && <TasksPanel />}
        </PageContainer>
      </div>
    </div>
  )
}

export default App
