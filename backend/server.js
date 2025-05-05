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

app.post('/api/signup', async (req, res) => {
  const { name, email, password, dob, role } = req.body; 
  if (!role || (role !== 'user' && role !== 'organizer')) {
    return res.status(400).send("Role must be either 'user' or 'organizer'");
  }
  try {
    const result = await db.query(
      'INSERT INTO users(name, email, password, dob, role) VALUES($1, $2, $3, $4, $5) RETURNING *',
      [name, email, password, dob, role] // Include 'role' in query
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

// Create event
app.post('/api/events', async (req, res) => {
  const { name, image, venue, startDate, endDate, cost } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO events(name, image, venue, start_date, end_date, cost) VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, image, venue, startDate, endDate, cost]
    );
    res.status(201).json({ event: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

// Get all events
app.get('/api/events', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM events');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

// Book ticket
app.post('/api/tickets', async (req, res) => {
  const { userId, eventId, paymentDetails } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO tickets(user_id, event_id, payment_details) VALUES($1, $2, $3) RETURNING *',
      [userId, eventId, paymentDetails]
    );
    res.status(201).json({ ticket: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

// Get tickets for a user
app.get('/api/tickets/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await db.query('SELECT * FROM tickets WHERE user_id = $1', [userId]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.get('/events', (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});