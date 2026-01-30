import { Router } from "express";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = Router();
const secret = process.env.JWT_SECRET;

function issueToken(userId) {
  return jwt.sign({ sub: userId }, secret, { expiresIn: "7d" });
}

router.post("/register", async (req, res) => {
  const { email, password, fullName } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(1)
    const userId = randomUUID();
    console.log(2)
    await pool.execute(
      "INSERT INTO users (id, email, password_hash, full_name) VALUES (?, ?, ?, ?)",
      [userId, email.toLowerCase(), passwordHash, fullName || null]
    );
    console.log(3)

    const token = issueToken(userId);
    console.log(4)
    return res.json({ token });
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email already exists" });
    }
    console.log(email)
    console.log(email)
    console.log(email)
    return res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const [rows] = await pool.execute(
      "SELECT id, password_hash FROM users WHERE email = ? LIMIT 1",
      [email.toLowerCase()]
    );

    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = issueToken(user.id);
    return res.json({ token });
  } catch {
    return res.status(500).json({ error: "Login failed" });
  }
});

export default router;
