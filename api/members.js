// Vercel Serverless Function for MongoDB
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  try {
    await client.connect();
    const db = client.db('family_tree');
    const collection = db.collection('family_members');

    // Handle different HTTP methods
    if (req.method === 'GET') {
      const members = await collection.find().toArray();
      return res.status(200).json(members);
    }
    else if (req.method === 'POST') {
      const { password, ...data } = req.body;
      if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const result = await collection.insertOne(data);
      return res.status(201).json({ ...data, _id: result.insertedId });
    }
    else if (req.method === 'PUT') {
      const { id, password, ...data } = req.body;
      if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
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
        return res.status(401).json({ error: 'Unauthorized' });
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
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
