const Task = require('../models/Task');
const Project = require('../models/Project');

// ─── @route  POST /api/tasks ──────────────────────────────────────────────────
exports.createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, status, priority, dueDate } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    // Verify assignee is a project member
    if (assignedTo) {
      const isMember = project.members.some((m) => m.toString() === assignedTo);
      if (!isMember) {
        return res.status(400).json({ success: false, message: 'Assignee must be a project member.' });
      }
    }

    const task = await Task.create({
      title, description, projectId, assignedTo: assignedTo || null,
      status: status || 'Todo', priority: priority || 'Medium',
      dueDate: dueDate || null, createdBy: req.user._id,
    });

    await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'projectId', select: 'title' },
      { path: 'createdBy', select: 'name email' },
    ]);

    res.status(201).json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @route  GET /api/tasks ───────────────────────────────────────────────────
exports.getTasks = async (req, res) => {
  try {
    const { projectId, status, priority } = req.query;
    let filter = {};

    if (projectId) filter.projectId = projectId;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    if (req.user.role !== 'Admin') {
      filter.assignedTo = req.user._id;
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tasks.length, tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @route  GET /api/tasks/:id ───────────────────────────────────────────────
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title members')
      .populate('createdBy', 'name email');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    // Members can only see their own tasks
    if (req.user.role !== 'Admin' && task.assignedTo?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @route  PUT /api/tasks/:id ───────────────────────────────────────────────
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    // Members can only update their own tasks' status
    if (req.user.role !== 'Admin') {
      if (task.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'You can only update your own tasks.' });
      }
      // Members can only change status
      if (req.body.status) task.status = req.body.status;
    } else {
      // Admins can update everything
      const { title, description, assignedTo, status, priority, dueDate } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (assignedTo !== undefined) task.assignedTo = assignedTo;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
    }

    await task.save();
    await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'projectId', select: 'title' },
      { path: 'createdBy', select: 'name email' },
    ]);

    res.json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @route  DELETE /api/tasks/:id ───────────────────────────────────────────
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
