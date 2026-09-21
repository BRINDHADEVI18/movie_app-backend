import express from "express";
import axios from "axios";

const router = express.Router();
const TMDB_BASE = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY;

function shapeMovie(m) {
  return {
    id: m.id,
    title: m.title,
    overview: m.overview,
    posterPath: m.poster_path
      ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
      : null,
    releaseDate: m.release_date,
    voteAverage: m.vote_average,
    genreIds: m.genre_ids || []
  };
}

// GET /api/movies/popular?page=1
router.get("/popular", async (req, res) => {
  try {
    const page = req.query.page || 1;
    const response = await axios.get(`${TMDB_BASE}/movie/popular`, {
      params: { api_key: API_KEY, page }
    });
    res.json({
      results: response.data.results.map(shapeMovie),
      page: response.data.page,
      totalPages: response.data.total_pages
    });
  } catch (err) {
    console.error("Error fetching popular movies:", err.message);
    res.status(502).json({ error: "Failed to fetch movies. Please try again." });
  }
});

// GET /api/movies/search?query=batman&page=1
router.get("/search", async (req, res) => {
  try {
    const { query, page = 1 } = req.query;
    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Search query is required" });
    }
    const response = await axios.get(`${TMDB_BASE}/search/movie`, {
      params: { api_key: API_KEY, query, page }
    });
    res.json({
      results: response.data.results.map(shapeMovie),
      page: response.data.page,
      totalPages: response.data.total_pages
    });
  } catch (err) {
    console.error("Error searching movies:", err.message);
    res.status(502).json({ error: "Search failed. Please try again." });
  }
});

// GET /api/movies/genres/list
router.get("/genres/list", async (req, res) => {
  try {
    const response = await axios.get(`${TMDB_BASE}/genre/movie/list`, {
      params: { api_key: API_KEY }
    });
    res.json(response.data.genres);
  } catch (err) {
    console.error("Error fetching genres:", err.message);
    res.status(502).json({ error: "Failed to fetch genres" });
  }
});

// GET /api/movies/by-genre?genreId=28&page=1
router.get("/by-genre", async (req, res) => {
  try {
    const { genreId, page = 1 } = req.query;
    const response = await axios.get(`${TMDB_BASE}/discover/movie`, {
      params: { api_key: API_KEY, with_genres: genreId, page }
    });
    res.json({
      results: response.data.results.map(shapeMovie),
      page: response.data.page,
      totalPages: response.data.total_pages
    });
  } catch (err) {
    console.error("Error fetching movies by genre:", err.message);
    res.status(502).json({ error: "Failed to fetch movies by genre" });
  }
});

// GET /api/movies/:id  (keep this LAST — it's a catch-all pattern)
router.get("/:id", async (req, res) => {
  try {
    const response = await axios.get(`${TMDB_BASE}/movie/${req.params.id}`, {
      params: { api_key: API_KEY }
    });
    const m = response.data;
    res.json({
      id: m.id,
      title: m.title,
      overview: m.overview,
      posterPath: m.poster_path
        ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
        : null,
      releaseDate: m.release_date,
      voteAverage: m.vote_average,
      runtime: m.runtime,
      genres: m.genres
    });
  } catch (err) {
    console.error("Error fetching movie details:", err.message);
    res.status(404).json({ error: "Movie not found" });
  }
});

export default router;