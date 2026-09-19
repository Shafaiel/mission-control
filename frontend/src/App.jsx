import Sidebar from './components/Sidebar'
import Header from './components/Header'
import PageContainer from './components/PageContainer'
import Panel from './components/Panel'
import ChatPanel from './components/ChatPanel'
import TasksPanel from './components/TasksPanel'
import './App.css'

const navItems = [
  { label: 'Agents', icon: '🤖' },
  { label: 'Chat', icon: '💬' },
  { label: 'Tasks', icon: '✅' },
]

function App() {
  return (
    <div className="app">
      <Sidebar title="Mission Control" items={navItems} />
      <div className="app__main">
        <Header title="Dashboard" subtitle="Manage your agents, chats and tasks" />
        <PageContainer>
          <Panel title="Agents" description="Agent list and status will appear here." />
          <ChatPanel />
          <TasksPanel />
        </PageContainer>
      </div>
    </div>
  )
}

export default App
