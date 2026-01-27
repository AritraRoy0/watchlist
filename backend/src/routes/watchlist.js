import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, title, platform, status, created_at AS createdAt FROM watchlist_items WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    return res.json(rows);
  } catch {
    return res.status(500).json({ error: "Failed to load watchlist" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  const { title, platform, status } = req.body || {};
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    const [result] = await pool.execute(
      "INSERT INTO watchlist_items (user_id, title, platform, status) VALUES (?, ?, ?, ?)",
      [req.user.id, title, platform || null, status || "planned"]
    );
    return res.status(201).json({
      id: result.insertId,
      title,
      platform: platform || null,
      status: status || "planned",
    });
  } catch {
    return res.status(500).json({ error: "Failed to add item" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  try {
    const [result] = await pool.execute(
      "DELETE FROM watchlist_items WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Not found" });
    }
    return res.status(204).end();
  } catch {
    return res.status(500).json({ error: "Failed to delete item" });
  }
});

export default router;
