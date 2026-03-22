import pg from "pg";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.use(express.json());

app.listen(3000, (req, res) => {
  console.log("Server is running on port 3000");
});

app.get("/players-scores", async (req, res) => {
  try {
    const result1 = await pool.query(
      "SELECT players.name, games.title, scores.score FROM scores INNER JOIN players ON scores.player_id = players.id INNER JOIN games ON scores.game_id = games.id",
    );
    res.json(result1.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/top-players", async (req, res) => {
  try {
    const result2 = await pool.query(
      "SELECT players.name, SUM(scores.score) AS total_score FROM scores JOIN players ON scores.player_id = players.id GROUP BY players.name ORDER BY total_score DESC LIMIT 3",
    );
    res.json(result2.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/inactive-players", async (req, res) => {
  try {
    const result3 = await pool.query(
      "SELECT players.name FROM players LEFT JOIN scores ON players.id=scores.player_id WHERE scores.player_id IS NULL",
    );
    res.json(result3.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/popular-genres", async (req, res) => {
  try {
    const result3 = await pool.query(
      "SELECT games.genre, COUNT(scores.game_id) AS Genre_Count FROM games JOIN scores ON games.id=scores.game_id GROUP BY games.genre ORDER BY Genre_Count DESC",
    );
    res.json(result3.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/recent-players", async (req, res) => {
  try {
    const result3 = await pool.query(
      "SELECT players.name, players.join_date FROM players WHERE join_date >= CURRENT_DATE - INTERVAL '30 days'",
    );
    res.json(result3.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
