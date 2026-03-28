import pg from "pg";
import dotenv from "dotenv";
import express from "express";
import { z } from "zod";

dotenv.config();

const app = express();
const { Pool } = pg;

const envschema = z.object({
  DB_USER: z.string(),
  DB_HOST: z.string(),
  DB_DATABASE: z.string(),
  DB_PASSWORD: z.string(),
  DB_PORT: z.coerce.number(),
});
const validateEnv = envschema.safeParse(process.env);

if (!validateEnv.success) {
  console.error(
    "Environment variable validation failed:",
    z.treeifyError(validateEnv.error),
  );
  process.exit(1);
}

const { DB_USER, DB_HOST, DB_DATABASE, DB_PASSWORD, DB_PORT } =
  validateEnv.data;

const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_DATABASE,
  password: DB_PASSWORD,
  port: DB_PORT,
});

const playerSchema = z.object({
  name: z
    .string()
    .min(2, "Name is required minimum 2 characters")
    .max(50, "Name must be less than 50 characters"),
  join_date: z.string(),
});

app.use(express.json());

app.listen(3000, (req, res) => {
  console.log("Server is running on port 3000");
});

app.get("/", (req, res) => {
  res.send("Welcome to the Gaming Platform API");
});

app.post("/players", async (req, res) => {
  const validateplayer = playerSchema.safeParse(req.body);

  if (!validateplayer.success) {
    return res.status(400).json({
      error: validateplayer.error.format(),
    });
  }

  const { name, join_date } = validateplayer.data;
  try {
    const result = await pool.query(
      "INSERT INTO players (name, join_date) VALUES ($1, $2) RETURNING *",
      [name, join_date],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res
      .status(400)
      .json({ error: err.errors ? err.errors[0].message : "Invalid input" });
  }
});

app.put("/players/:id", async (req, res) => {
  const playerId = req.params.id;
  const validateplayer = playerSchema.safeParse(req.body);

  if (!validateplayer.success) {
    return res.status(400).json({
      error: validateplayer.error.format(),
    });
  }
  const { name, join_date } = validateplayer.data;
  try {
    const result = await pool.query(
      "UPDATE players SET name = $1, join_date = $2 WHERE id = $3 RETURNING *",
      [name, join_date, playerId],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Player not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
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
