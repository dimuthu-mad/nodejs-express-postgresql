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

app.listen(3000, (req, res) => {
  console.log("Server is running on port 3000");
});

app.get("/", async (req, res) => {
  res.send("Hello World!");
});
