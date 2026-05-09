const { body, validationResult } = require('express-validator');

// ─── Handle validation errors ─────────────────────────────────────────────────
exports.handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── Auth validators ──────────────────────────────────────────────────────────
exports.validateSignup = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['Admin', 'Member']).withMessage('Role must be Admin or Member'),
];

exports.validateLogin = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// ─── Project validators ───────────────────────────────────────────────────────
exports.validateProject = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }),
  body('description').optional().isLength({ max: 500 }),
  body('status').optional().isIn(['Active', 'Completed', 'On Hold']),
];

// ─── Task validators ──────────────────────────────────────────────────────────
exports.validateTask = [
  body('title').trim().notEmpty().withMessage('Task title is required').isLength({ max: 100 }),
  body('description').optional().isLength({ max: 1000 }),
  body('projectId').notEmpty().withMessage('Project ID is required').isMongoId(),
  body('status').optional().isIn(['Todo', 'In Progress', 'Completed']),
  body('priority').optional().isIn(['Low', 'Medium', 'High']),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
];
