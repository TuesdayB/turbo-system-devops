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

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uri = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

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
// app.get('/inject', (req, res) => {
//   // Inject a server variable into barry.html: templating view like ejs or pug
//   readFile(join(__dirname, 'public', 'index.html'), 'utf8')
//     .then(html => {
//       // Replace a placeholder in the HTML (e.g., {{myVar}})
//       const injectedHtml = html.replace('{{myVar}}', myVar);
//       res.send(injectedHtml);
//     })
//     .catch(err => {
//       res.status(500).send('Error loading page');
//     });
// })

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
      path: '/behindthescenes',
      description: 'Serve behind-the-scenes HTML page'
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
      path: '/api/quilts',
      description: 'CREATE - Add new quilt record',
      bodyExample: {
        "quiltName": "testquilt",
        "quiltWidth": 5,
        "quiltHeight": 6,
        "squareSize": 10
      }
    },
    {
      method: 'GET',
      path: '/api/quilts',
      description: 'READ - Get all quilt records'
    },
    {
      method: 'PUT',
      path: '/api/quilts/:id',
      description: 'UPDATE - Update existing quilt record',
      bodyExample: {
        "quiltName": "testquilt",
        "quiltWidth": 6,
        "quiltHeight": 5,
        "squareSize": 8
      }
    },
    {
      method: 'DELETE',
      path: '/api/quilts/:id',
      description: 'DELETE - Remove quilt record'
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

    res.status(201).json({
      message: 'Page created successfully',
      comicId: result.insertedId,
      page: { ...page, _id: result.insertedId }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create comic page: ' + error.message });
  }
});

// READ - Get all pages (PROTECTED)
app.get('/api/comics', authenticateToken, async (req, res) => {
  try {
    const comics = await db.collection('comics').find({}).toArray();
    console.log(`📋 ${req.user.username} viewed ${comics.length} comics`);
    res.json(comics); // Return just the array for frontend simplicity
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comics: ' + error.message });
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

//CRUD Operations: Comments

//start the server. 
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})