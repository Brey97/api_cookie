
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { apiKeyMiddleware } = require("./apiKeyAuth.js");
require("dotenv").config();

const client = new Pool({
  host: process.env.HOSTBDDCOOKIE,
  port: process.env.PORTBDDCOOKIE,
  user: process.env.USERBDDCOOKIE,
  password: process.env.PASSWORDBDDCOOKIE,
  database: process.env.DATABASEBDDCOOKIE,
});


const app = express();
const PORT = process.env.PORT || 3000;
const table = process.env.TABLE;



app.use(cors());
app.use(express.json());


// --- Healthcheck ---
app.get('/health', async (req, res) => {
try {
const r = await client.query('SELECT 1 AS ok');
res.json({ status: 'ok', db: r.rows[0].ok === 1, time: new Date().toISOString() });
} catch (e) {
res.status(500).json({ status: 'down', error: e.message });
}
});


app.get('/getCookie', apiKeyMiddleware(['read']), async (req, res) => {
  try {
    // Si ta colonne s'appelle littéralement "date", pense à la quotter
    const sql = `SELECT * FROM ${table} ORDER BY "date" DESC LIMIT 1`;
    const { rows } = await client.query(sql); // <- pas d'arguments
    if (!rows.length) return res.status(404).json({ error: 'Ligne introuvable' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Erreur serveur' });
  }
});


// --- 404 générique ---
app.use((req, res) => {
res.status(404).json({ error: 'Route non trouvée' });
});


// --- Erreurs serveur ---
app.use((err, req, res, next) => {
console.error(err);
res.status(500).json({ error: 'Erreur serveur' });
});


app.listen(PORT, () => {
console.log(`Ecoute sur http://localhost:${PORT}`);
});