// Vercel Serverless Function for MongoDB
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// Sample data to insert if collection is empty
const SAMPLE_DATA = [
  {id: 1, name: 'Dada Ji', father: null, gender: 'M'},
  {id: 2, name: 'Ahmad', father: 1, gender: 'M'},
  {id: 3, name: 'Bilal', father: 1, gender: 'M'},
  {id: 4, name: 'Aisha', father: 1, gender: 'F'},
  {id: 5, name: 'Usman', father: 2, gender: 'M'},
  {id: 6, name: 'Fatima', father: 2, gender: 'F'},
  {id: 7, name: 'Hamza', father: 3, gender: 'M'}
];

export default async function handler(req, res) {
  try {
    await client.connect();
    const db = client.db('family_tree');
    const collection = db.collection('family_members');

    // Auto-insert sample data if collection is empty
    const count = await collection.countDocuments();
    if (count === 0) {
      await collection.insertMany(SAMPLE_DATA);
      console.log('Sample data inserted into family_members collection');
    }

    // Handle different HTTP methods
    if (req.method === 'GET') {
      const members = await collection.find().toArray();
      return res.status(200).json(members);
    }
    else if (req.method === 'POST') {
      const { password, members, ...data } = req.body;
      
      if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized - Invalid password' });
      }
      
      // Handle bulk import
      if (members && Array.isArray(members)) {
        await collection.deleteMany({});
        await collection.insertMany(members);
        return res.status(201).json({ success: true, message: 'Bulk import successful' });
      }
      
      // Handle single member
      const result = await collection.insertOne(data);
      return res.status(201).json({ ...data, _id: result.insertedId });
    }
    else if (req.method === 'PUT') {
      const { id, password, ...data } = req.body;
      if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized - Invalid password' });
      }
      const result = await collection.updateOne(
        { id: parseInt(id) },
        { $set: data }
      );
      return res.status(200).json({ success: true });
    }
    else if (req.method === 'DELETE') {
      const { id, password } = req.body;
      if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized - Invalid password' });
      }
      await collection.deleteOne({ id: parseInt(id) });
      await collection.updateMany(
        { father: parseInt(id) },
        { $set: { father: null } }
      );
      return res.status(200).json({ success: true });
    }
    else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('MongoDB Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}
