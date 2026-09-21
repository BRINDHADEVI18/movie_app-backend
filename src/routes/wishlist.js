import express from "express";
import pool from "../db.js";

const router = express.Router();

// GET all wishlist items
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM wishlist ORDER BY added_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
});

// POST add to wishlist
router.post("/", async (req, res) => {
  try {
    const { movieId, title, posterPath, releaseDate, voteAverage } = req.body;

    const existing = await pool.query(
      "SELECT * FROM wishlist WHERE movie_id = $1",
      [movieId]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Already in wishlist" });
    }

    const result = await pool.query(
      `INSERT INTO wishlist (movie_id, title, poster_path, release_date, vote_average)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [movieId, title, posterPath, releaseDate, voteAverage]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add to wishlist" });
  }
});

// DELETE remove from wishlist
router.delete("/:movieId", async (req, res) => {
  try {
    await pool.query("DELETE FROM wishlist WHERE movie_id = $1", [req.params.movieId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove from wishlist" });
  }
});

export default router;