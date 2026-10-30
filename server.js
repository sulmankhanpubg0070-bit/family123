require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '1234';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
let db;
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/family_tree';

async function connectToMongoDB() {
  try {
    const client = new MongoClient(mongoURI);
    await client.connect();
    db = client.db();
    console.log('✅ Connected to MongoDB');
    
    // Create collection if not exists
    await db.createCollection('family_members');
    
    // Insert sample data if collection is empty
    const count = await db.collection('family_members').countDocuments();
    if (count === 0) {
      const sampleData = [
        { id: 1, name: 'Dada Ji', father: null, gender: 'M' },
        { id: 2, name: 'Ahmad', father: 1, gender: 'M' },
        { id: 3, name: 'Bilal', father: 1, gender: 'M' },
        { id: 4, name: 'Aisha', father: 1, gender: 'F' },
        { id: 5, name: 'Usman', father: 2, gender: 'M' },
        { id: 6, name: 'Fatima', father: 2, gender: 'F' },
        { id: 7, name: 'Hamza', father: 3, gender: 'M' }
      ];
      await db.collection('family_members').insertMany(sampleData);
      console.log('📝 Sample data inserted');
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Authentication middleware
const authenticate = (req, res, next) => {
  const password = req.headers['x-admin-password'] || req.query.password;
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// API Endpoints

// GET /api/members - Get all family members
app.get('/api/members', async (req, res) => {
  try {
    const members = await db.collection('family_members').find().toArray();
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// GET /api/members/:id - Get single member
app.get('/api/members/:id', async (req, res) => {
  try {
    const member = await db.collection('family_members').findOne({ 
      id: parseInt(req.params.id) 
    });
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

// POST /api/members - Add new member (requires auth)
app.post('/api/members', authenticate, async (req, res) => {
  try {
    const { name, father, gender } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    const newMember = {
      id: Date.now(),
      name: name.trim(),
      father: father ? parseInt(father) : null,
      gender: gender || 'M'
    };
    
    await db.collection('family_members').insertOne(newMember);
    res.status(201).json(newMember);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// PUT /api/members/:id - Update member (requires auth)
app.put('/api/members/:id', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, father, gender } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (father !== undefined) updateData.father = father ? parseInt(father) : null;
    if (gender !== undefined) updateData.gender = gender;
    
    const result = await db.collection('family_members').updateOne(
      { id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    const updatedMember = await db.collection('family_members').findOne({ id });
    res.json(updatedMember);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// DELETE /api/members/:id - Delete member (requires auth)
app.delete('/api/members/:id', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Remove member as father from other members
    await db.collection('family_members').updateMany(
      { father: id },
      { $set: { father: null } }
    );
    
    const result = await db.collection('family_members').deleteOne({ id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

// POST /api/members/import - Import data (requires auth)
app.post('/api/members/import', authenticate, async (req, res) => {
  try {
    const data = req.body;
    
    if (!Array.isArray(data)) {
      return res.status(400).json({ error: 'Data must be an array' });
    }
    
    // Clear existing data
    await db.collection('family_members').deleteMany({});
    
    // Insert new data
    await db.collection('family_members').insertMany(data);
    
    res.json({ message: 'Data imported successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to import data' });
  }
});

// GET /api/stats - Get statistics
app.get('/api/stats', async (req, res) => {
  try {
    const total = await db.collection('family_members').countDocuments();
    const males = await db.collection('family_members').countDocuments({ gender: 'M' });
    const females = await db.collection('family_members').countDocuments({ gender: 'F' });
    const roots = await db.collection('family_members').countDocuments({ father: null });
    
    res.json({ total, males, females, roots });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Connect and start server
connectToMongoDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API Endpoints:`);
    console.log(`   GET  /api/members`);
    console.log(`   GET  /api/members/:id`);
    console.log(`   POST /api/members (auth required)`);
    console.log(`   PUT  /api/members/:id (auth required)`);
    console.log(`   DELETE /api/members/:id (auth required)`);
    console.log(`   POST /api/members/import (auth required)`);
    console.log(`   GET  /api/stats`);
    console.log(`   GET  /api/health`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
