import { Router } from 'express'
import { listTasks, createTask, setTaskStatus, deleteTask } from '../taskService.js'

const router = Router()

router.get('/', async (req, res) => {
  res.json(await listTasks())
})

router.post('/', async (req, res) => {
  res.status(201).json(await createTask(req.body ?? {}))
})

router.patch('/:id', async (req, res) => {
  res.json(await setTaskStatus(req.params.id, req.body?.status))
})

router.delete('/:id', async (req, res) => {
  res.json(await deleteTask(req.params.id))
})

export default router
