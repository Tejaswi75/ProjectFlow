const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// ─── @route  GET /api/dashboard ──────────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const isAdmin = req.user.role === 'Admin';

    // Base filters
    const taskFilter = isAdmin ? {} : { assignedTo: req.user._id };
    const projectFilter = isAdmin ? {} : { members: req.user._id };

    // ── Task Stats ────────────────────────────────────────────────────────────
    const [total, completed, inProgress, todo, overdue] = await Promise.all([
      Task.countDocuments(taskFilter),
      Task.countDocuments({ ...taskFilter, status: 'Completed' }),
      Task.countDocuments({ ...taskFilter, status: 'In Progress' }),
      Task.countDocuments({ ...taskFilter, status: 'Todo' }),
      Task.countDocuments({
        ...taskFilter,
        dueDate: { $lt: now },
        status: { $ne: 'Completed' },
      }),
    ]);

    // ── Project Stats ─────────────────────────────────────────────────────────
    const [totalProjects, activeProjects] = await Promise.all([
      Project.countDocuments(projectFilter),
      Project.countDocuments({ ...projectFilter, status: 'Active' }),
    ]);

    // ── Recent Tasks ──────────────────────────────────────────────────────────
    const recentTasks = await Task.find(taskFilter)
      .populate('assignedTo', 'name')
      .populate('projectId', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    // ── Tasks by Project (for chart) ─────────────────────────────────────────
    const tasksByProject = await Task.aggregate([
      ...(isAdmin ? [] : [{ $match: { assignedTo: req.user._id } }]),
      { $group: { _id: '$projectId', count: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } } } },
      { $lookup: { from: 'projects', localField: '_id', foreignField: '_id', as: 'project' } },
      { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } },
      { $project: { projectName: '$project.title', count: 1, completed: 1 } },
      { $limit: 6 },
    ]);

    // ── Member count (Admin only) ─────────────────────────────────────────────
    const totalMembers = isAdmin ? await User.countDocuments({ role: 'Member' }) : null;

    res.json({
      success: true,
      stats: {
        tasks: { total, completed, inProgress, todo, overdue },
        projects: { total: totalProjects, active: activeProjects },
        ...(isAdmin && { members: totalMembers }),
      },
      recentTasks,
      tasksByProject,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
