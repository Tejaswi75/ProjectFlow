const express = require('express');
const router = express.Router();
const {
  createProject, getProjects, getProjectById,
  updateProject, deleteProject, addMember, removeMember,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateProject, handleValidation } = require('../middleware/validationMiddleware');

router.use(protect); // All project routes require auth

router.route('/')
  .get(getProjects)
  .post(authorize('Admin'), validateProject, handleValidation, createProject);

router.route('/:id')
  .get(getProjectById)
  .put(authorize('Admin'), validateProject, handleValidation, updateProject)
  .delete(authorize('Admin'), deleteProject);

router.post('/:id/members', authorize('Admin'), addMember);
router.delete('/:id/members/:userId', authorize('Admin'), removeMember);

module.exports = router;
