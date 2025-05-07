import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Event Management System",
  password: "chinnu@267",
  port: 5432,
});

db.connect();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../dist")));

// Sign Up
app.post('/api/signUp', async (req, res) => {
  const { username, email, password, dob, role } = req.body;
  if (!role || (role !== 'user' && role !== 'organizer')) {
    return res.status(400).send("Role must be either 'user' or 'organizer'");
  }
  try {
    const result = await db.query(
      'INSERT INTO users(username, email, password, dob, role) VALUES($1, $2, $3, $4, $5) RETURNING *',
      [username, email, password, dob, role]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (result.rows.length === 0) {
      return res.status(401).send("Invalid credentials");
    }
    res.status(200).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

// Edit Profile
app.put('/api/users/:username', async (req, res) => {
  const { username } = req.params;
  const { email, dob, password } = req.body;
  try {
    const result = await db.query(
      'UPDATE users SET email = $1, dob = $2, password = $3 WHERE username = $4 RETURNING *',
      [email, dob, password, username]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("User not found");
    }
    res.status(200).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

// Get all events
app.get('/api/home', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM events');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

// Host event (Organizer creates an event)
app.post('/api/host/:username', async (req, res) => {
  const { username } = req.params;
  const { eventId, name, venue, datetime, organizer, contact1, contact2, email, description, cost } = req.body;
  // Check if eventId is provided
  if (!eventId) {
    return res.status(400).send("Event ID is required");
  }
  try {
    const result = await db.query(
      `INSERT INTO events (event_id, name, venue, datetime, organizer, organizer_username, contact1, contact2, email, description, cost)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [eventId, name, venue, datetime, organizer, username, contact1, contact2 || null, email || null, description || null, cost]
    );
    res.status(201).json({ event: result.rows[0] });
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).send("Internal server error");
  }
});

// Get tickets for a user
app.get('/api/tickets/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const result = await db.query('SELECT * FROM tickets WHERE username = $1', [username]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

// Get events for an organizer
app.get('/api/events/org/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const result = await db.query('SELECT * FROM events WHERE organizer_username = $1', [username]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

// view details button
app.get('/api/events/:username/:eventId', async (req, res) => {
  const { username, eventId } = req.params;

  try {
    const result = await db.query(
      'SELECT * FROM events WHERE organizer_username = $1 AND event_id = $2',
      [username, eventId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Event not found");
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching event details:", err);
    res.status(500).send("Internal server error");
  }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

