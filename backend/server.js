import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import { Pool } from "pg";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import dotenv from "dotenv";
import multer from "multer";
import { asyncHandler } from "./asyncHandler.js";
import { ApiError } from "./ApiError.js";
import { ApiResponse } from "./ApiResponse.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const port = 3000;

// ✅ Updated DB connection using connectionString
const db = new pg.Client({
  user: "postgres",
  host: 'localhost',
  database: "Event Management System",
  password: "chinnu@267",
  port: 5432,
});

const pool = new Pool({
  user: "postgres",
  host: 'localhost',
  database: "Event Management System",
  password: "chinnu@267",
  port: 5432,
});


db.connect();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../dist")));
app.use(cookieParser());

// ================= LOCAL AUTH ====================

const verifyJWT = asyncHandler(async (req, _, next) => {
  const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");
  console.log(req.cookies.accessToken);
  
  
  if(!token) {
      throw new ApiError(401, "Unauthorized");
  }
  try {
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); //ACCESS_TOKEN_SECRET is just some random hexadecimal string 
      const { rows } = await pool.query(
        'SELECT username, email, profile_image, role, dob FROM users WHERE username = $1',
        [decodedToken.username]
      );
      const user = rows[0];            
      if(!user) {
          throw new ApiError(401, "Unauthorized");
      }
      req.user = user
      next()
  } catch (error) {
      console.log("JWT Error:", error.name, error.message);
      throw new ApiError(401, "Invalid access token");
  }
});

function generateAccessToken(user) {
  //short lived access token
  return jwt.sign(
    {
      email: user.email,
      username: user.username,
      role: user.role,
      dob: user.dob
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

function generateRefreshToken(user) {
  return jwt.sign(
    {
      username: user.username,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

const generateAccessAndRefreshToken = async (username) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = rows[0];
    if(!user) {
      throw new ApiError(401, "User doesn't exist");
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    await pool.query('UPDATE users SET refreshToken = $1 WHERE username = $2', [refreshToken, username]);
    return {accessToken, refreshToken};
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating access and refresh token");
  }
}

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if(!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const { rows } = await pool.query(
      'SELECT username, email, profile_image, refreshToken, dob FROM users WHERE username = $1',
      [decodedToken.username]
    );
    const user = rows[0];
    if(!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if(incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    }

    const {accessToken, refreshToken: newRefreshToken} = 
    await generateAccessAndRefreshToken(user.username)

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(new ApiResponse(
        200,
        {accessToken,
         refreshToken: newRefreshToken 
        },
        "Access token refreshed successfully"
      ))
      
  } catch (error) {
    throw new ApiError(500, "Something went wrong while refreshing access token");
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  await pool.query('UPDATE users SET refreshToken = NULL WHERE username = $1', [req.user.username]);

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  }

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    //{} => to show that empty data is sent
    .json(new ApiResponse(200, {}, "User logged out successfully"))
});


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
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).send("Username, password, and role are required");
  }

  try {
    const result = await db.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2 AND login_type = $3 AND role = $4',
      [username, password, 'local',role]
    );

    if (result.rows.length === 0) {
      return res.status(401).send("Invalid credentials");
    }
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(result.rows[0].username);
    const options = {
      httpOnly: true, //this says only server can do any change we want
      secure: process.env.NODE_ENV === "production",
    }
    res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500)
    .send("Internal server error");
  }
});

app.post('/api/logout', verifyJWT, logoutUser);

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

    const {accessToken: accessToken1, refreshToken: refreshToken1} = await generateAccessAndRefreshToken(result.rows[0].username);
    const options = {
      httpOnly: true, //this says only server can do any change we want
      secure: process.env.NODE_ENV === "production",
    }

    res.status(200)
    .cookie("accessToken", accessToken1, options)
    .cookie("refreshToken", refreshToken1, options)
    .json({
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

// Edit Profile (Partial Update)
app.put('/api/users/:username', async (req, res) => {
  const { username } = req.params;
  const { email, dob, phone_no } = req.body;

  try {
    // Build dynamic query
    const fields = [];
    const values = [];
    let index = 1;

    if (email) {
      fields.push(`email = $${index++}`);
      values.push(email);
    }
    if (dob) {
      fields.push(`dob = $${index++}`);
      values.push(dob);
    }
    if (phone_no) {
      fields.push(`phone_no = $${index++}`);
      values.push(phone_no);
    }

    // If no fields are provided, return bad request
    if (fields.length === 0) {
      return res.status(400).send("No fields provided to update");
    }

    // Final query
    values.push(username);
    const query = `UPDATE users SET ${fields.join(", ")} WHERE username = $${index} RETURNING *`;

    const result = await db.query(query, values);

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
  const { eventId, name, venue, datetime, organizer, contact1, contact2, email, description, cost, ageLimit, maxParticipants } = req.body;
  // Check if eventId is provided
  if (!eventId) {
    return res.status(400).send("Event ID is required");
  }
  try {
    // Insert event into events table
    const eventResult = await db.query(
      `INSERT INTO events (event_id, name, venue, datetime, organizer, organizer_username, contact1, contact2, email, description, cost)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [eventId, name, venue, datetime, organizer, username, contact1, contact2 || null, email || null, description || null, cost]
    );

    // Insert constraints into event_constraints table
    await db.query(
      `INSERT INTO event_constraints (event_id, constraint_type, constraint_value)
       VALUES ($1, 'age_limit', $2), ($1, 'max_participants', $3)`,
      [eventId, ageLimit, maxParticipants]
    );
    res.status(201).json({ event: eventResult.rows[0], message: "Event and constraints created successfully" });
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

//join event
app.post('/api/events/:event_id/join/:username', async (req, res) => {
  const { event_id, username } = req.params;
  const { ticket_id, payment_time, cost } = req.body;

  if (!ticket_id) {
    return res.status(400).send("ticket_id is required");
  }

  try {
    // Optional: prevent duplicate join
    const check = await db.query(
      'SELECT * FROM tickets WHERE event_id = $1 AND username = $2',
      [event_id, username]
    );

    if (check.rows.length > 0) {
      return res.status(409).send("User already joined this event");
    }

    const result = await db.query(
      'INSERT INTO tickets(ticket_id, event_id, username, payment_time, cost) VALUES($1, $2, $3, $4, $5) RETURNING *',
      [ticket_id, event_id, username, payment_time || null, cost || null]
    );

    res.status(201).json({ ticket: result.rows[0] });
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

// Edit Event (Partial Update)
app.put('/api/host/:username/edit/:eventId', async (req, res) => {
  const { username, eventId } = req.params;
  const { name, venue, datetime, organizer, contact1, contact2, email, description, cost } = req.body;

  try {
    // Dynamically build query
    const fields = [];
    const values = [];
    let index = 1;

    if (name) {
      fields.push(`name = $${index++}`);
      values.push(name);
    }
    if (venue) {
      fields.push(`venue = $${index++}`);
      values.push(venue);
    }
    if (datetime) {
      fields.push(`datetime = $${index++}`);
      values.push(datetime);
    }
    if (organizer) {
      fields.push(`organizer = $${index++}`);
      values.push(organizer);
    }
    if (contact1) {
      fields.push(`contact1 = $${index++}`);
      values.push(contact1);
    }
    if (contact2) {
      fields.push(`contact2 = $${index++}`);
      values.push(contact2);
    }
    if (email) {
      fields.push(`email = $${index++}`);
      values.push(email);
    }
    if (description) {
      fields.push(`description = $${index++}`);
      values.push(description);
    }
    if (cost) {
      fields.push(`cost = $${index++}`);
      values.push(cost);
    }

    // If no fields are provided, return bad request
    if (fields.length === 0) {
      return res.status(400).send("No fields provided to update");
    }

    // Add eventId and username to the query
    values.push(eventId, username);
    const query = `
      UPDATE events 
      SET ${fields.join(", ")} 
      WHERE event_id = $${index++} AND organizer_username = $${index}
      RETURNING *`;

    const result = await db.query(query, values);

    // Check if the event was updated
    if (result.rows.length === 0) {
      return res.status(404).send("Event not found or you are not the organizer");
    }

    // Respond with the updated event
    res.status(200).json({ event: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});


// Upload profile picture (base64 or file or image URL)
app.post("/api/users/:username/photo", upload.single("photo"), async (req, res) => {
  const { username } = req.params;
  const { imageUrl } = req.body;

  let imageData;

  try {
    if (imageUrl) {
      // Fetch image from URL and convert to base64
      const response = await fetch(imageUrl);
      if (!response.ok) {
        return res.status(400).send("Invalid image URL");
      }
      const buffer = await response.arrayBuffer();
      imageData = Buffer.from(buffer).toString("base64");
    } else if (req.file) {
      // Get image from uploaded file (in memory)
      imageData = req.file.buffer.toString("base64");
    } else {
      return res.status(400).send("No image provided");
    }

    const result = await db.query(
      "UPDATE users SET profile_image = $1 WHERE username = $2 RETURNING *",
      [imageData, username]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("User not found");
    }

    res.status(200).json({ user: result.rows[0], message: "Profile image updated" });
  } catch (err) {
    console.error("Error updating profile image:", err);
    res.status(500).send("Internal server error");
  }
});

// Reusing multer
app.post("/api/events/:eventId/image", upload.single("image"), async (req, res) => {
  const { eventId } = req.params;
  const { imageUrl } = req.body;
  let imageData;

  try {
    if (imageUrl) {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        return res.status(400).send("Invalid image URL");
      }
      const buffer = await response.arrayBuffer();
      imageData = Buffer.from(buffer).toString("base64");
    } else if (req.file) {
      imageData = req.file.buffer.toString("base64");
    } else {
      return res.status(400).send("No image provided");
    }

    const result = await db.query(
      "UPDATE events SET image = $1 WHERE event_id = $2 RETURNING *",
      [imageData, eventId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Event not found");
    }

    res.status(200).json({ event: result.rows[0], message: "Event image updated" });
  } catch (err) {
    console.error("Error uploading event image:", err);
    res.status(500).send("Internal server error");
  }
});

// Endpoint to get participants list
app.get('/event/:eventId/participants', async (req, res) => {
  const { eventId } = req.params;

  try {
    const result = await pool.query(
      `SELECT u.username AS name, 
              u.phone_no AS contact, 
              t.ticket_id, 
              DATE(t.payment_time) AS purchase_date
       FROM tickets t
       JOIN users u ON t.username = u.username
       WHERE t.event_id = $1`,
      [eventId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No participants found for this event.' });
    }

    res.status(200).json({ participants: result.rows });
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//delete ticket
app.delete('/api/tickets/delete/:ticket_id', async (req, res) => {
  const { ticket_id } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM tickets WHERE ticket_id = $1 RETURNING *',
      [ticket_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).send("Ticket not found");
    }

    res.status(200).json({ message: "Ticket successfully deleted", deletedTicket: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

//delete event
app.delete('/api/events/delete/:event_id', async (req, res) => {
  const { event_id } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM events WHERE event_id = $1 RETURNING *',
      [event_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).send("Event not found");
    }

    res.status(200).json({ message: "Event successfully deleted", deletedEvent: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

