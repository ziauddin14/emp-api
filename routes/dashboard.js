import express from 'express'
import getSummary from '../controllers/dashboardController.js'
const router = express.Router()
router.get('/body',  getSummary)

export default router