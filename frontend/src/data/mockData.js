export const mockTasks = [
  { id: 1, title: 'Summarize weekly support tickets', agent: 'Scribe', status: 'Done' },
  { id: 2, title: 'Categorize incoming feedback', agent: 'Sorter', status: 'In Progress' },
  { id: 3, title: 'Draft release notes', agent: 'Scribe', status: 'Todo' },
  { id: 4, title: 'Check broken links on website', agent: 'Scout', status: 'Todo' },
]

export const mockAgents = ['Scribe', 'Sorter', 'Scout']

export const mockMessages = [
  { id: 1, sender: 'You', text: 'Hi Scribe, can you summarize the tickets from this week?' },
  { id: 2, sender: 'Scribe', text: 'Sure. I found 12 tickets. Most are about login issues.' },
  { id: 3, sender: 'You', text: 'Great, please add a task to draft the release notes.' },
]
