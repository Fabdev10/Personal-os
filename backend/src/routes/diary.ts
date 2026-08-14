import { Router } from 'express'
import { createEntry, listEntries, getEntry, updateEntry, deleteEntry } from '../controllers/diaryController'

const router = Router()

router.get('/', listEntries)
router.post('/', createEntry)
router.get('/:id', getEntry)
router.put('/:id', updateEntry)
router.delete('/:id', deleteEntry)

export default router
