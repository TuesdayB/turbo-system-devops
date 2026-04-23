//app.mjs
//we are in ES6, use this. 
import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile } from 'fs/promises';  // For async file reading
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
// import { sendEmail } from './mail.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uri = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const subscribers = null;

app.use(express.static(join(__dirname, '/public')));
app.use(express.json());

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function connectToMongo() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}
connectToMongo();
const db = client.db('quiltmachine');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: `${process.env.EMAIL}`, //change to match your gmail! 
    pass: process.env.EMAIL_PASS
  }
});

// middlewares aka endpoints aka 'get to slash' {http verb} to slash {you name ur endpoint}
app.get('/', (req, res) => {
  // res.send('Hello Express'); //string response
  res.sendFile(join(__dirname, 'public', 'index.html'));
})
app.get('/comic', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'comic.html'));
})
app.get('/announcements', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'announcements.html'));
})
app.get('/login', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'login.html'));
})
app.get('/register', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'registration.html'));
})
app.get('/admin', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'adminpanel.html'));
})

// API Health/Endpoints Documentation
app.get('/api/health', (req, res) => {
  const endpoints = [
    {
      method: 'GET',
      path: '/',
      description: 'Serve the main HTML page'
    },
    {
      method: 'GET',
      path: '/comic',
      description: 'Serve comic HTML page'
    },
    {
      method: 'GET',
      path: '/announcements',
      description: 'Serve announcements HTML page'
    },
    {
      method: 'GET',
      path: '/admin',
      description: 'Serve admin panel HTML page'
    },
    {
      method: 'GET',
      path: '/login',
      description: 'Serve HTML login page'
    },
    {
      method: 'GET',
      path: '/register',
      description: 'Serve HTML registration page'
    },

    {
      method: 'GET',
      path: '/api/health',
      description: 'Show all available API endpoints'
    },
    {
      method: 'POST',
      path: '/api/auth/register',
      description: 'CREATE - Add new user',
      bodyExample: {
        "username": "testuser",
        "password": hashedPassword,
        "dateCreated": ISODate,
        "hasAdmin": false
      }
    },
    {
      method: 'POST',
      path: '/api/auth/login',
      description: 'User log-in',
      tokenExample: {
        "userId": id,
        "username": "testuser",
      }
    },
    {
      method: 'GET',
      path: '/api/auth/me',
      description: 'READ - Get user information from db'
    },
    {
      method: 'POST',
      path: '/api/comics',
      description: 'CREATE - New comic page',
      bodyExample: {
        "title": "Page 1",
        "index": 1,
        "pageLink": "https://image.com/img.png",
        "postedBy": "testuser",
        "postedAt": ISODate
      }
    },
    {
      method: 'GET',
      path: '/api/comics',
      description: 'READ - Get all pages'
    },
    {
      method: 'GET',
      path: '/api/comics/:id',
      description: 'READ - Get a single page'
    },
    {
      method: 'PUT',
      path: '/api/comics/:id',
      description: 'UPDATE - Update existing comic page by id',
      bodyExample: {
        "title": "Page 1",
        "index": 1,
        "pageLink": "https://image.com/img.png",
        "postedBy": "testuser",
        "postedAt": ISODate
      }
    },
    {
      method: 'DELETE',
      path: '/api/comics/:id',
      description: 'DELETE - Remove comic'
    },
    {
      method: 'POST',
      path: '/api/announcements',
      description: 'CREATE - New announcement',
      bodyExample: {
        "title": "Announcement",
        "bodyText": "this is an announcement",
        "postedBy": "testuser",
        "postedAt": ISODate
      }
    },
    {
      method: 'GET',
      path: '/api/announcements',
      description: 'READ - Get all announcements'
    },
    {
      method: 'PUT',
      path: '/api/announcements/:id',
      description: 'UPDATE - Update existing announcement by id',
      bodyExample: {
        "title": "Announcement",
        "bodyText": "this is an announcement",
        "postedBy": "testuser",
        "postedAt": ISODate
      }
    },
    {
      method: 'DELETE',
      path: '/api/announcements/:id',
      description: 'DELETE - Remove announcement'
    },
    {
      method: 'POST',
      path: '/api/comments',
      description: 'CREATE - New comment',
      bodyExample: {
        "pageId": comicpageid,
        "bodyText": "this is a comment",
        "postedBy": "testuser",
        "postedAt": ISODate
      }
    },
    {
      method: 'GET',
      path: '/api/comments/:pageId',
      description: 'READ - Get all comments on a page'
    },
    {
      method: 'PUT',
      path: '/api/comments/:id',
      description: 'UPDATE - Update existing comment by id',
      bodyExample: {
        "bodyText": "this is a comment",
        "postedBy": "testuser",
        "postedAt": ISODate
      }
    },
    {
      method: 'DELETE',
      path: '/api/comments/:id',
      description: 'DELETE - Remove comment'
    },
        {
      method: 'POST',
      path: '/api/subscribe',
      description: 'CREATE - New subscriber',
      bodyExample: {
        "email": "example@email.com",
        "dateAdded": ISODate
      }
    },
        {
      method: 'GET',
      path: '/api/subscribe',
      description: 'READ - Get all subscribers'
    },
        {
      method: 'GET',
      path: '/api/subscribe/:email',
      description: 'READ - Get a single subscriber'
    }
  ];

  res.json({
    status: 'healthy',
    server: 'CIS 486 DevOps Server',
    timestamp: new Date().toISOString(),
    endpoints: endpoints
  });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access token required',
      message: 'You must be logged in to access this resource'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        error: 'Invalid or expired token',
        message: 'Please log in again'
      });
    }

    req.user = user; // Contains: { userId, username, iat, exp }

    next();
  });
}

function parseISODate(ISODate) {
  const dateObject = new Date(ISODate);
  let text = dateObject.toLocaleString();
  return text;
}

async function sendEmail(pageId) {
  let emailArray = [];
  try {
    emailArray = await db.collection('subscribers').find({}).toArray();
  } catch (error) {
    console.error('Error getting subscribers:', error);
  }
  for (const email of emailArray) {
    console.log(email.email);
    try {
      await transporter.sendMail({
        from: `"Space Station 76" <${process.env.EMAIL}>`,
        to: email.email,
        subject: 'New page posted!',
        text: 'Read it here: https://spacestation76.barrycumbie.com/comic?page=' + pageId
      });
      console.log('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}

//CREATE - Add new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (password != confirmPassword) {
      return res.status(400).json({ error: 'Password fields must match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const existingUser = await db.collection('users').findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = {
      username,
      password: hashedPassword,
      dateCreated: new Date(),
      hasAdmin: false
    };
    const result = await db.collection('users').insertOne(user);

    console.log(`✅ New user registered: ${username}`);

    res.status(201).json({
      message: 'User registered successfully',
      userId: result.insertedId,
      username: username
    });
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    res.status(500).json({ error: 'Failed to register user: ' + error.message });
  }
});

//User log-in
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await db.collection('users').findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const tokenPayload = {
      userId: user._id,
      username: user.username
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

    console.log(`✅ User logged in: ${username}`);

    res.json({
      message: 'Login successful',
      token: token,
      user: { id: user._id, username: user.username }
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({ error: 'Failed to login: ' + error.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    // console.log('User from token:', req.user);
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(req.user.userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user info: ' + error.message });
  }
});

//CRUD Operations: Comics
//CREATE - New comic page
app.post('/api/comics', authenticateToken, async (req, res) => {
  try {
    const { title, index, pageLink } = req.body;

    // Simple validation
    if (!title || !index || !pageLink) {
      return res.status(400).json({ error: 'Title, page index, and page link are all required' });
    }

    const existingPageIndex = await db.collection('comics').findOne({ index });
    if (existingPageIndex) {
      return res.status(400).json({ error: `Page ${index} already exists` });
    }

    const page = {
      title,
      index,
      pageLink,
      postedBy: req.user.username,
      postedAt: new Date()
    }

    const result = await db.collection('comics').insertOne(page);
    console.log(`✅ Comic published by ${req.user.username}: ${title}`);
    sendEmail(page.index);
    res.status(201).json({
      message: 'Page created successfully',
      comicId: result.insertedId,
      page: { ...page, _id: result.insertedId }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create comic page: ' + error.message });
  }
});

// READ - Get all pages
app.get('/api/comics', async (req, res) => {
  try {
    const comics = await db.collection('comics').find({}).sort({ index: 1 }).toArray();

    res.json(comics); // Return just the array for frontend simplicity
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comics: ' + error.message });
  }
});

//READ - Get a single page
app.get('/api/comics/:index', async (req, res) => {
  try {
    const { index } = req.params;

    const comicPage = await db.collection('comics').findOne({ index: parseInt(index) });
    const pageCount = await db.collection('comics').countDocuments({});

    const readableDate = parseISODate(comicPage.postedAt);

    comicPage.readableDate = readableDate;
    comicPage.totalPages = pageCount;

    res.json(comicPage);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comic: ' + error.message });
  }
});

// UPDATE - Update a comic by ID (PROTECTED)
app.put('/api/comics/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, index, pageLink } = req.body;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid comic ID' });
    }

    const updateData = { updatedBy: req.user.username, updatedAt: new Date() };
    if (title) updateData.title = title;
    if (index) updateData.index = parseInt(index);
    if (pageLink) updateData.pageLink = pageLink;

    const result = await db.collection('comics').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    console.log(`✏️ Comic page updated by ${req.user.username}: ${id}`);

    res.json({
      message: 'Page updated successfully',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update page: ' + error.message });
  }
});

// DELETE - Delete a page by ID (PROTECTED)
app.delete('/api/comics/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid comic ID' });
    }

    const result = await db.collection('comics').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Page not found' });
    }

    console.log(`🗑️ Page deleted by ${req.user.username}: ${id}`);

    res.json({
      message: 'Page deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete page: ' + error.message });
  }
});

//CRUD Operations: Announcements
//CREATE - New announcement
app.post('/api/announcements', authenticateToken, async (req, res) => {
  try {
    const { title, bodyText } = req.body;

    // Simple validation
    if (!title || !bodyText) {
      return res.status(400).json({ error: 'Title and body text are both required' });
    }

    const announcement = {
      title,
      bodyText,
      postedBy: req.user.username,
      postedAt: new Date()
    }

    const result = await db.collection('announcements').insertOne(announcement);
    console.log(`✅ Announcement published by ${req.user.username}: ${title}`);

    res.status(201).json({
      message: 'Announcement created successfully',
      announcementId: result.insertedId,
      announcement: { ...announcement, _id: result.insertedId }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create announcement: ' + error.message });
  }
});

// READ - Get all announcements
app.get('/api/announcements', async (req, res) => {
  try {
    const announcements = await db.collection('announcements').find({}).sort({ postedAt: -1 }).toArray();

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch announcements: ' + error.message });
  }
});

// UPDATE - Update an announcement by ID (PROTECTED)
app.put('/api/announcements/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, bodyText } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid announcement ID' });
    }

    const updateData = { updatedBy: req.user.username, updatedAt: new Date() };
    if (title) updateData.title = title;
    if (bodyText) updateData.bodyText = bodyText;

    const result = await db.collection('announcements').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    console.log(`✏️ Announcement updated by ${req.user.username}: ${id}`);

    res.json({
      message: 'Announcement updated successfully',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update announcement: ' + error.message });
  }
});

// DELETE - Delete an announcement by ID (PROTECTED)
app.delete('/api/announcements/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid announcement ID' });
    }

    const result = await db.collection('announcements').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    console.log(`🗑️ Announcement deleted by ${req.user.username}: ${id}`);

    res.json({
      message: 'Announcement deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete announcement: ' + error.message });
  }
});

//CRUD Operations: Comments
// CREATE - Create comment
app.post('/api/comments', authenticateToken, async (req, res) => {
  try {
    const { pageId, commentBody } = req.body;

    // Simple validation
    if (!commentBody) {
      return res.status(400).json({ error: 'Comment body required' });
    }

    const comment = {
      pageId,
      commentBody,
      postedBy: req.user.username,
      postedAt: new Date()
    }

    const result = await db.collection('comments').insertOne(comment);
    console.log(`✅ Comment published by ${req.user.username}: ${commentBody}`);

    res.status(201).json({
      message: 'Comment created successfully',
      commentId: result.insertedId,
      comment: { ...comment, _id: result.insertedId }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create comment: ' + error.message });
  }

});

//READ - Get a page's comments
app.get('/api/comments/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;

    const pageComments = await db.collection('comments').find({ pageId: pageId }).toArray();

    res.json(pageComments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comic: ' + error.message });
  }
});

// UPDATE - Update a comment by ID (PROTECTED)
app.put('/api/comments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { commentBody } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid comment ID' });
    }

    const updateData = { updatedAt: new Date() };
    if (commentBody) updateData.commentBody = commentBody;

    const result = await db.collection('comments').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    console.log(`✏️ Comment updated by ${req.user.username}: ${id}`);

    res.json({
      message: 'Comment updated successfully',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update comment: ' + error.message });
  }
});

// DELETE - Delete a comment by ID (PROTECTED)
app.delete('/api/comments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid comment ID' });
    }

    const result = await db.collection('comments').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    console.log(`🗑️ Comment deleted by ${req.user.username}: ${id}`);

    res.json({
      message: 'Comment deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment: ' + error.message });
  }
});

//CREATE - Add new subscriber
app.post('/api/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    // Simple validation
    if (!email) {
      return res.status(400).json({ error: 'Info required' });
    }

    const subscriber = {
      email,
      dateAdded: new Date()
    }

    const result = await db.collection('subscribers').insertOne(subscriber);
    console.log(`✅ New subscriber: ${email}`);

    res.status(201).json({
      message: 'Subscribed successfully',
      subscriberId: result.insertedId,
      subscriber: { ...subscriber, _id: result.insertedId }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to subscribe: ' + error.message });
  }

});

//READ - Get a single subscriber
app.get('/api/subscribe/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const subscriberEmail = await db.collection('subscribers').findOne({ email: email });

    res.json(subscriberEmail);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subscriber: ' + error.message });
  }
});

// DELETE - Delete a subscriber
app.delete('/api/subscribe/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const result = await db.collection('subscribers').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Subscriber found' });
    }

    console.log(`🗑️ Unsubscribed: ${id}`);

    res.json({
      message: 'Unsubscribed successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unsubscribe: ' + error.message });
  }
});

//start the server. 
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})