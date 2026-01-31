import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

/**
 * GET all watchlist items for user
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        title,
        content_type AS contentType,
        status,
        rating,
        notes,
        image_url AS imageUrl,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM watchlist_items
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [req.user.id]
    );

    return res.json(rows);
  } catch (err) {
    console.error("Load watchlist failed:", err);
    return res.status(500).json({ error: "Failed to load watchlist" });
  }
});

/**
 * ADD watchlist item
 */
router.post("/", requireAuth, async (req, res) => {
  const {
    title,
    contentType,
    status,
    rating,
    notes,
    imageUrl,
  } = req.body || {};

  if (!title || !contentType) {
    return res.status(400).json({
      error: "Title and contentType are required",
    });
  }

  try {
    const [result] = await pool.execute(
      `
      INSERT INTO watchlist_items
        (user_id, title, content_type, status, rating, notes, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        req.user.id,
        title,
        contentType,
        status || "want_to_watch",
        rating ?? null,
        notes || null,
        imageUrl || null,
      ]
    );

    return res.status(201).json({
      id: result.insertId,
      title,
      contentType,
      status: status || "want_to_watch",
      rating: rating ?? null,
      notes: notes || null,
      imageUrl: imageUrl || null,
    });
  } catch (err) {
    console.error("Add watchlist item failed:", err);
    return res.status(500).json({ error: "Failed to add item" });
  }
});

/**
 * DELETE watchlist item
 */
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
  } catch (err) {
    console.error("Delete watchlist item failed:", err);
    return res.status(500).json({ error: "Failed to delete item" });
  }
});

export default router;
