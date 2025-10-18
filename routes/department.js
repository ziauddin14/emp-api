import express from 'express'
import authMiddleware from '../middlewares/authMiddleware.js'
import { addDepartment, deleteDepartment, editDepartment, getDepartments, updateDepartment } from '../controllers/departmentController.js'
const router = express.Router()

router.get('/',  getDepartments)
router.post('/add',  addDepartment)
router.get('/single',  editDepartment )
router.put('/:id',  updateDepartment )
router.delete('/single',  deleteDepartment )


export default router