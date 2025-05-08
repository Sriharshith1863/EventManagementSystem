import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

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

// ================= LOCAL AUTH ====================

// Sign Up
app.post('/api/signUp', async (req, res) => {
  const { username, email, password, dob, role, login_type } = req.body;

  if (!role || (role !== 'user' && role !== 'organizer')) {
    return res.status(400).send("Role must be either 'user' or 'organizer'");
  }

  if (!login_type || (login_type !== 'local' && login_type !== 'google')) {
    return res.status(400).send("Login type must be either 'local' or 'google'");
  }

  if (login_type === 'local') {
    if (!password || !dob) {
      return res.status(400).send("Password and DoB are required for local sign up");
    }
  }

  try {
    const result = await db.query(
      'INSERT INTO users(username, email, password, dob, role, login_type) VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
      [username, email, password || null, dob || null, role, login_type]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

// Login (local)
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  try {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1 AND password = $2 AND login_type = $3',
      [email, password, 'local']
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

// ================ GOOGLE OAUTH ===================

// Step 1: Exchange code for tokens & fetch user profile
app.post("/api/v1/users/oauth-token", async (req, res) => {
  const { code } = req.body;

  if (!code) return res.status(400).send("Missing authorization code");
  console.log("Received authorization code:", code);
  console.log("Redirect URI:", "http://localhost:5173/about");
  try {
    // Step 1: Exchange code for access & refresh tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: process.env.GCP_CLIENT_ID,
        client_secret: process.env.GCP_CLIENT_SECRET,
        redirect_uri: "http://localhost:5173/about"
      }),
    });
    const tokenData = await tokenRes.json();
    console.log("Token response:", tokenData);
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in;

    if (!accessToken) {
      console.error("Failed to get access token:", tokenData);
      return res.status(401).send("Token exchange failed");
    }

    // Step 2: Get user profile info
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    const profile = await profileRes.json();
    
    // Extract from email
    const email = profile.email; // e.g., 'koushikchennupati.2890@gmail.com'
    const username = email.split('@')[0];
    const picture = profile.picture;
    
    // Now you can use username, name, email, picture as needed
    

    // Step 3: Upsert user in DB
    const result = await db.query(
      `INSERT INTO users(username, email, role, login_type)
       VALUES($1, $2, $3, 'google')
       ON CONFLICT (email) DO UPDATE SET username = EXCLUDED.username
       RETURNING *`,
      [username, email, 'user']  // defaulting to 'user' role for OAuth
    );

    res.status(200).json({
      Username: username,
      Useremail: email,
      Userpicture: picture,
      dbUser: result.rows[0],
      accessToken,
      refreshToken,
      expiresIn
    });

  } catch (err) {
    console.error("OAuth callback error:", err);
    res.status(500).send("OAuth processing failed");
  }
});

// (Optional) Refresh Token
app.post("/api/v1/users/oauth-refresh", async (req, res) => {
  const { refresh_token } = req.body;

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GCP_CLIENT_ID,
        client_secret: process.env.GCP_CLIENT_SECRET,
        refresh_token,
        grant_type: "refresh_token"
      }),
    });

    const tokenData = await tokenRes.json();
    res.status(200).json(tokenData);
  } catch (err) {
    console.error("Refresh token failed", err);
    res.status(500).send("Failed to refresh token");
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

// view details button and view button in myEvents.
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

app.put('/api/host/:username/edit/:eventId', async (req, res) => {
  const { username, eventId } = req.params;
  const { name, venue, datetime, organizer, contact1, contact2, email, description, cost } = req.body;

  // Prepare the SQL query and values
  const result = await db.query(
    `UPDATE events
     SET name = $1, venue = $2, datetime = $3, organizer = $4, contact1 = $5, contact2 = $6, email = $7, description = $8, cost = $9
     WHERE event_id = $10 AND organizer_username = $11
     RETURNING *`,
    [name, venue, datetime, organizer, contact1, contact2, email, description, cost, eventId, username]
  );

  // Check if the event was updated
  if (result.rows.length === 0) {
    return res.status(404).send("Event not found or you are not the organizer");
  }

  // Respond with the updated event
  res.status(200).json({ event: result.rows[0] });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

