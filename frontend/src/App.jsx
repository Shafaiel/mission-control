import Sidebar from './components/Sidebar'
import Header from './components/Header'
import PageContainer from './components/PageContainer'
import Panel from './components/Panel'
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
          <Panel title="Chat" description="Chat space will appear here." />
          <Panel title="Tasks" description="Task list will appear here." />
        </PageContainer>
      </div>
    </div>
  )
}

export default App
