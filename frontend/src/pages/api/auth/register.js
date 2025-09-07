import db from '../../../lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (existingUser) return res.status(409).json({ error: "User exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const stmt = db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)');
  stmt.run(email, hashedPassword, name);

  res.status(201).json({ message: "User registered" });
}