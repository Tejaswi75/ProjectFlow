const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// ─── @route  POST /api/projects ───────────────────────────────────────────────
exports.createProject = async (req, res) => {
  try {
    const { title, description, memberIds } = req.body;

    // Validate member IDs if provided
    let members = [];
    if (memberIds && memberIds.length > 0) {
      const validUsers = await User.find({ _id: { $in: memberIds } });
      members = validUsers.map((u) => u._id);
    }

    // Always include creator as a member
    if (!members.includes(req.user._id.toString())) {
      members.unshift(req.user._id);
    }

    const project = await Project.create({
      title,
      description,
      createdBy: req.user._id,
      members,
    });

    await project.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'members', select: 'name email role' },
    ]);

    res.status(201).json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @route  GET /api/projects ────────────────────────────────────────────────
exports.getProjects = async (req, res) => {
  try {
    let query;
    if (req.user.role === 'Admin') {
      query = Project.find(); // Admins see all projects
    } else {
      query = Project.find({ members: req.user._id }); // Members see only their projects
    }

    const projects = await query
      .populate('createdBy', 'name email')
      .populate('members', 'name email role')
      .sort({ createdAt: -1 });

    // Add task counts to each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (p) => {
        const taskCount = await Task.countDocuments({ projectId: p._id });
        const completedCount = await Task.countDocuments({ projectId: p._id, status: 'Completed' });
        return { ...p.toObject(), taskCount, completedCount };
      })
    );

    res.json({ success: true, count: projects.length, projects: projectsWithCounts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @route  GET /api/projects/:id ───────────────────────────────────────────
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email role');

    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    // Access check: Admin or member
    const isMember = project.members.some((m) => m._id.toString() === req.user._id.toString());
    if (req.user.role !== 'Admin' && !isMember) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @route  PUT /api/projects/:id ───────────────────────────────────────────
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    const { title, description, status } = req.body;
    if (title) project.title = title;
    if (description !== undefined) project.description = description;
    if (status) project.status = status;

    await project.save();
    await project.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'members', select: 'name email role' },
    ]);

    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @route  DELETE /api/projects/:id ────────────────────────────────────────
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    // Delete all tasks under this project
    await Task.deleteMany({ projectId: project._id });
    await project.deleteOne();

    res.json({ success: true, message: 'Project and all its tasks deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @route  POST /api/projects/:id/members ──────────────────────────────────
exports.addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (project.members.includes(userId)) {
      return res.status(400).json({ success: false, message: 'User is already a member.' });
    }

    project.members.push(userId);
    await project.save();
    await project.populate('members', 'name email role');

    res.json({ success: true, message: 'Member added.', project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── @route  DELETE /api/projects/:id/members/:userId ────────────────────────
exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

    // Prevent removing creator
    if (project.createdBy.toString() === req.params.userId) {
      return res.status(400).json({ success: false, message: 'Cannot remove project creator.' });
    }

    project.members = project.members.filter((m) => m.toString() !== req.params.userId);
    await project.save();

    res.json({ success: true, message: 'Member removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
