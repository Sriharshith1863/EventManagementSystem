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
// import { asyncHandler } from "./asyncHandler.js";
// import { ApiError } from "./ApiError.js";
// import { ApiResponse } from "./ApiResponse.js";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
// import errorHandler from "./errors.middlewares.js";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const port = 3000;

// ✅ Updated DB connection using connectionString
const db = new pg.Client({
  user: "YOUR_USERNAME",
  host: 'localhost',
  database: "YOUR_DATABASE_NAME",
  password: "YOUR_PASSWORD",
  port: "PORT_NUMBER",
});

const pool = new Pool({
  user: "YOUR_USERNAME",
  host: 'localhost',
  database: "YOUR_DATABASE_NAME",
  password: "YOUR_PASSWORD",
  port: "PORT_NUMBER",
});


db.connect();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "../dist")));
app.use(cookieParser());
// app.use(errorHandler());
// ================= LOCAL AUTH ====================

const verifyJWT = async (req, res, next) => {
  const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");
  console.log(req.cookies.accessToken);
  
  
  if(!token) {
      //throw new ApiError(401, "Unauthorized");
      return res.status(401).send({error: "Unauthorized"});
      // const error = new Error("unauthorized");
      // error.statusCode = 401
      // throw error;
  }
  try {
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); //ACCESS_TOKEN_SECRET is just some random hexadecimal string 
      const { rows } = await pool.query(
        'SELECT username, email, profile_image, role, dob FROM users WHERE username = $1',
        [decodedToken.username]
      );
      const user = rows[0];            
      if(!user) {
          //throw new ApiError(407, "Unauthorized");
          // const error = new Error("Unauthorized");
          // error.statusCode = 401;
          // throw error;
          return res.status(401).send({error: "Unauthorized"});
      }
      req.user = user
      next()
  } catch (error) {
      console.log("JWT Error:", error.name, error.message);
      // const error1 = new Error("Invalid access token");
      // error.statusCode = 401;
      // throw error1;
      return res
      .status(401)
      .send({error: "invalid credentials"});
  }
};

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
      const error = new Error("User doesn't exist");
      error.statusCode = 401;
      throw error;
      // return res
      // .status(401)
      // .send({error: "User doesn't exist"});
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    await pool.query('UPDATE users SET refreshToken = $1 WHERE username = $2', [refreshToken, username]);
    return {accessToken, refreshToken};
  } catch (error) {
      const error1 = new Error("Something went wrong while generating access and refresh token");
      error1.statusCode = 500;
      throw error1;
    //throw new ApiError(500, "Something went wrong while generating access and refresh token");
  }
}

const refreshAccessToken = async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if(!incomingRefreshToken) {
    const error1 = new Error("Refresh token is required");
    error1.statusCode = 401;
    throw error1;
    //throw new ApiError(401, "Refresh token is required");
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
      // const error1 = new Error("Invalid refresh token");
      // error1.statusCode = 401;
      // throw error1;
      return res.status(401).send({error: "Invalid refresh token"});
      //throw new ApiError(401, "Invalid refresh token");
    }

    if(incomingRefreshToken !== user?.refreshToken) {
      // const error1 = new Error("Invalid refresh token");
      // error1.statusCode = 401;
      // throw error1;
      res.status(401).send({error: "Invalid refresh token"});
      //throw new ApiError(401, "Invalid refresh token");
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
      .json(
        {data: {accessToken,
         refreshToken: newRefreshToken 
        }}
      )
      
  } catch (error) {
      // const error1 = new Error("Something went wrong while refreshing access token");
      // error1.statusCode = 500;
      // throw error1;
      return res.status(500).send({error: "Something went wrong while refreshing access token"});
    //throw new ApiError(500, "Something went wrong while refreshing access token");
  }
};

const logoutUser = async (req, res) => {
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
    .json({data: {}}).send("User logged out successfully");
};


// Sign Up
app.post('/api/signUp', async (req, res) => {
  const { username, email, password, confirmPassword, dob, role, login_type, phone_no } = req.body;
  console.log(phone_no);
  
  if(!phone_no) {
      // const error1 = new Error("phone number is must");
      // error1.statusCode = 400;
      // throw error1;
      return res.status(400).send("phone number is must")
    //throw new ApiError(400, "phone number is must");
  }

  if (!role || (role !== 'usr' && role !== 'org')) {
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

  const { rows } = await pool.query('SELECT * FROM users WHERE username = $1 or email = $2', [username, email]);
    if(rows.length !== 0) {
      console.log(rows);
      
      // const error1 = new Error("Username or email is already in use");
      // error1.statusCode = 400;
      // throw error1;
      return res.status(400).send({error: "Username or email is already in use"});
      //throw new ApiError(401, "Username or email is already in use");
    }
    if(password !== confirmPassword) {
      // const error1 = new Error("Retype your password");
      // error1.statusCode = 400;
      // throw error1;
      return res.status(400).send({error: "Retype your password"});
      //throw new ApiError(400, "Retype your password");
    }
    const  dob1 = new Date(dob);
  try {
    let hashedPassword;
    if(password) {
    hashedPassword = await bcrypt.hash(password, 10);
    }
    const result = await db.query(
      'INSERT INTO users(username, email, password, dob, role, login_type, phone_no) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [username, email, hashedPassword || null, dob1 || null, role, login_type, phone_no]
    );
    return res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal server error");
  }
});

// Login (local)
app.post('/api/login', async (req, res) => {
  const { username, password, role} = req.body;

  if (!username || !role) {
    return res.status(400).send("Username is required");
  }
  
  try {
    const result = await db.query(
      'SELECT * FROM users WHERE username = $1 AND login_type = $2 AND role = $3',
      [username, 'local', role]
    );
    if (result.rows.length === 0) {
      return res.status(401).send("Invalid credentials");
    }
    if(password) {
      const isPasswordValid = await bcrypt.compare(password, result.rows[0].password);
      if(!isPasswordValid) {
        return res.status(401).send("Invalid password");
      }
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


app.get("/current-user", verifyJWT, async (req, res) => {
  return res.status(200).json({
    user: req.user.username,
  });
});

app.get('/api/current-user-details', verifyJWT, async (req, res) => {
  console.log("got into the backend..................\n");
  
  const { username } = req.user;

  try {
    // Fetch user details
    const userResult = await pool.query(
      'SELECT username, email, dob, phone_no, role FROM users WHERE username = $1',
      [username]
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json( null).send('User not found');
    }
    //name, venue, datetime, organizer, contact1, contact2, email, description, cost, event_launched
    const eventResult = await pool.query(
      `SELECT e.event_id, e.name, e.venue, e.datetime, e.organizer, e.description, e.cost, e.contact1, e.contact2, e.email, e.event_launched
       FROM tickets t
       JOIN events e ON t.event_id = e.event_id
       WHERE t.username = $1`,
      [username]
    );

    user.events = eventResult.rows; // Attach events to user object
    console.log("Got user details with registered events");
    return res.status(200).json({user: user});

  } catch (err) {
    console.error('Error fetching user details and events:', err);
    return res.status(500).json(null).send('Internal server error');
  }
});

app.get("/api/refresh-access-token", refreshAccessToken);

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

// Edit Profile
app.put('/api/users/:username',verifyJWT, async (req, res) => {
  const { username } = req.params;
  const { email, dob,  phoneNo} = req.body;
  try {
    const result = await db.query(
      'UPDATE users SET email = $1, dob = $2, phone_no = $3 WHERE username = $4 RETURNING *',
      [email, dob, phoneNo, username]
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
app.post('/api/host/:username',verifyJWT, async (req, res) => {
  console.log("into the api....");
  const { username } = req.params;
  const { role } = req.user;
  const { event_id, name, venue, datetime, organizer, contact1, contact2, email, description, cost, age_limit, max_participants, image} = req.body;
  // Check if eventId is provided
  if(role !== "org") {
    // const error1 = new Error("only organiser can create events");
    // error1.statusCode = 400;
    // throw error1;
    return res.status(400).send({error: "only organiser can create events"});
    //throw new ApiError(400, "only organiser can create events");
  }
  console.log("got past this org check...");
  
  if (!event_id) {
    // const error1 = new Error("Event ID is required");
    // error1.statusCode = 400;
    // throw error1;
    return res.status(400).send({error: "Event ID is required"});
    //throw new ApiError(400,"Event ID is required");
  }
const parsedEventId = parseInt(event_id, 10);
const parsedAgeLimit = parseInt(age_limit, 10);
const parsedMaxParticipants = parseInt(max_participants, 10);

console.log({ event_id, age_limit, max_participants });
console.log({ parsedEventId, parsedAgeLimit, parsedMaxParticipants });
  const datetime1 = new Date(datetime);
  try {
    // Insert event into events table
    console.log("into the try block...");
    const eventResult = await db.query(
      `INSERT INTO events (event_id, name, venue, datetime, organizer, organizer_username, contact1, contact2, email, description, cost, image, event_launched)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [parseInt(event_id, 10), name, venue, datetime1, organizer, username, contact1, contact2 || null, email || null, description || null, parseFloat(cost), image, false]
    );
    console.log("inserted successfully");
    
    // Insert constraints into event_constraints table
    await db.query(
      `INSERT INTO event_constraints (event_id, constraint_type, constraint_value)
       VALUES ($1, 'AGE_LIMIT', $2), ($1, 'MAX_PARTICIPANTS', $3)`,
      [parseInt(event_id, 10), parseInt(age_limit, 10), parseInt(max_participants, 10)]
    );
    res.status(201).json({ event: eventResult.rows[0], message: "Event and constraints created successfully" });
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).send("Internal server error");
  }
});

// Get tickets for a user
app.get('/api/tickets/:username',verifyJWT, async (req, res) => {
  const { username } = req.params;
  const {role} = req.user;
  try {
  if(role !== 'usr') {
    console.log("this is a user only route!!");
    res.status(500).send("this is a user only route!!");
  }
    const result = await db.query('SELECT * FROM tickets WHERE username = $1', [username]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

// Get all tickets
app.get('/api/allTickets',verifyJWT, async (req, res) => {
  const {role} = req.user;
  try {
    if(role !== 'usr') {
    console.log("this is a user only route!!");
    res.status(500).send("this is a user only route!!");
  }
    const result = await db.query('SELECT * FROM tickets');
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
app.post('/api/events/:event_id/join/:username',verifyJWT, async (req, res) => {
  const { event_id, username } = req.params;
  const { ticket_id, payment_time, cost} = req.body;
  const { role } = req.user;
  if (!ticket_id) {
    return res.status(400).send("ticket_id is required");
  }
  if(role !== 'usr') {
    return res.status(400).send("this is a user only route");
  }
  try {
    // Optional: prevent duplicate join
    const check = await db.query(
      'SELECT * FROM tickets WHERE event_id = $1 AND username = $2',
      [parseInt(event_id, 10), username]
    );

    if (check.rows.length > 0) {
      return res.status(409).send("User already joined this event");
    }
    const payment_time1 = new Date(payment_time);
    const result = await db.query(
      'INSERT INTO tickets(ticket_id, event_id, username, payment_time, cost, to_display) VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
      [parseInt(ticket_id, 10), parseInt(event_id, 10), username, payment_time1 || null, parseFloat(cost) || null, true]
    );

    res.status(201).json({ ticket: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});


// view details button and view button in myEvents.
app.get('/api/events/:username/:eventId',verifyJWT, async (req, res) => {
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

// edit event
app.put('/api/host/:username/edit/:eventId',verifyJWT, async (req, res) => {
  const { username, eventId } = req.params;
  const { name, venue, datetime, organizer, contact1, contact2, email, description, cost, eventLaunched } = req.body;
  const dt1 = new Date(datetime);
  // Prepare the SQL query and values
  const result = await db.query(
    `UPDATE events
     SET name = $1, venue = $2, datetime = $3, organizer = $4, contact1 = $5, contact2 = $6, email = $7, description = $8, cost = $9, event_launched = $12
     WHERE event_id = $10 AND organizer_username = $11
     RETURNING *`,
    [name, venue, dt1, organizer, contact1, contact2, email, description, parseFloat(cost), parseInt(eventId, 10), username, eventLaunched]
  );

  // Check if the event was updated
  if (result.rows.length === 0) {
    return res.status(404).send("Event not found or you are not the organizer");
  }

  // Respond with the updated event
  res.status(200).json({ event: result.rows[0] });
});

// Upload profile picture (base64 or file or image URL)
app.post("/api/users/:username/photo", upload.single("photo"), verifyJWT, async (req, res) => {
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
app.post("/api/events/:eventId/image",verifyJWT, upload.single("image"), async (req, res) => {
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
app.get('/event/:eventId/participants',verifyJWT, async (req, res) => {
  const { eventId } = req.params;

  try {
    const result = await pool.query(
      `SELECT u.username AS name, 
              u.email AS contact, 
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

//disable a ticket in Mytickets page
app.put('/api/tickets/disable/:event_id',verifyJWT, async (req, res) => {
  const { event_id } = req.params;
  const {username} = req.user;
  try {
    const result = await db.query(
      'UPDATE tickets SET to_display = $3 WHERE event_id = $1 AND username = $2 RETURNING *',
      [parseInt(event_id, 10), username, false]
    );

    if (result.rowCount === 0) {
      return res.status(404).send("Ticket not found");
    }

    res.status(200).json({ message: "Ticket successfully deleted", disabledTicket: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

//delete ticket
app.delete('/api/tickets/delete/:ticket_id',verifyJWT, async (req, res) => {
  const { ticket_id } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM tickets WHERE ticket_id = $1 RETURNING *',
      [parseInt(ticket_id, 10)]
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
app.delete('/api/events/delete/:event_id',verifyJWT, async (req, res) => {
  const { event_id } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM events WHERE event_id = $1 RETURNING *',
      [parseInt(event_id, 10)]
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

