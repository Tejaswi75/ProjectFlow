/**
 * Seed script — creates demo Admin and Member accounts
 * Run: node seed.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

dotenv.config();

const DEMO_USERS = [
  { name: 'Admin User', email: 'admin@demo.com', password: 'admin123', role: 'Admin' },
  { name: 'Alice Member', email: 'member@demo.com', password: 'member123', role: 'Member' },
  { name: 'Bob Developer', email: 'bob@demo.com', password: 'bob12345', role: 'Member' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing demo data
    await User.deleteMany({ email: { $in: DEMO_USERS.map(u => u.email) } });
    
    // Create users
    const users = await User.create(DEMO_USERS);
    const admin = users.find(u => u.role === 'Admin');
    const member1 = users.find(u => u.email === 'member@demo.com');
    const member2 = users.find(u => u.email === 'bob@demo.com');
    
    console.log(`✅ Created ${users.length} demo users`);

    // Create a demo project
    const project = await Project.create({
      title: 'Demo Project',
      description: 'This is a demo project to showcase ProjectFlow features.',
      createdBy: admin._id,
      members: [admin._id, member1._id, member2._id],
    });

    // Create demo tasks
    await Task.create([
      { title: 'Set up project structure', description: 'Initialize the repo and configure tooling.', projectId: project._id, assignedTo: admin._id, status: 'Completed', priority: 'High', createdBy: admin._id },
      { title: 'Design database schema', description: 'Plan all Mongoose models.', projectId: project._id, assignedTo: member1._id, status: 'Completed', priority: 'High', createdBy: admin._id },
      { title: 'Build authentication API', description: 'JWT signup/login endpoints.', projectId: project._id, assignedTo: member2._id, status: 'In Progress', priority: 'High', createdBy: admin._id },
      { title: 'Create frontend components', description: 'Dashboard and project pages.', projectId: project._id, assignedTo: member1._id, status: 'In Progress', priority: 'Medium', createdBy: admin._id, dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      { title: 'Write API documentation', description: 'Document all endpoints.', projectId: project._id, status: 'Todo', priority: 'Low', createdBy: admin._id },
      { title: 'Deploy to production', description: 'Railway + Vercel deployment.', projectId: project._id, status: 'Todo', priority: 'Medium', createdBy: admin._id, dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }, // Overdue for demo
    ]);

    console.log('✅ Created demo project and tasks');
    console.log('\n🎉 Seed complete!\n');
    console.log('Demo credentials:');
    DEMO_USERS.forEach(u => console.log(`  ${u.role}: ${u.email} / ${u.password}`));

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
