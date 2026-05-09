const express = require('express');
const router = express.Router();
const {
  createTask, getTasks, getTaskById, updateTask, deleteTask,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateTask, handleValidation } = require('../middleware/validationMiddleware');

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(authorize('Admin'), validateTask, handleValidation, createTask);

router.route('/:id')
  .get(getTaskById)
  .put(updateTask)  // Both Admin & Member (controller handles RBAC)
  .delete(authorize('Admin'), deleteTask);

module.exports = router;
