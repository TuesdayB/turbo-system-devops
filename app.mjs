//app.mjs
//we are in ES6, use this. 
import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile } from 'fs/promises';  // For async file reading
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uri = process.env.MONGO_URI;

// const myVar = 'injected from server'; // Declare your variable

app.use(express.static(join(__dirname, 'public')));
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

app.get('/behindthescenes', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'bts.html'));
})

app.get('/login', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'login.html'));
})

app.get('/register', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'registration.html'));
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
      path: '/inject',
      description: 'Serve HTML with server-side variable injection'
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

// CRUD Operations
//CREATE - Add user
// app.post('/api/auth/newUser', async (req, res) => {
//   try {
//     const { username, password, confirmPassword } = req.body;

//     const db = client.db('quiltmachine');
//     const collection = db.collection('users');

//     //check if username is already in db
//     //check if passwords match

//     // const quiltRecord = {
//     //   quiltName,
//     //   quiltWidth,
//     //   quiltHeight,
//     //   squareSize,
//     //   timestamp: new Date()
//     // };

//   //   const result = await collection.insertOne(quiltRecord);
//   //   res.json({ message: 'Quilt Saved!', id: result.insertedId });
//   } catch (error) {
//     console.error('Error creating user:', error);
//     res.status(500).json({ error: 'Failed to save user' });
//   }
// });

// // CREATE - Add quilt
// app.post('/api/quilts', async (req, res) => {
//   try {
//     const { quiltName, quiltWidth, quiltHeight, squareSize } = req.body;

//     if (!quiltName || !quiltWidth || !quiltHeight || !squareSize) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     const db = client.db('quiltmachine');
//     const collection = db.collection('quilts');

//     const quiltRecord = {
//       quiltName,
//       quiltWidth,
//       quiltHeight,
//       squareSize,
//       timestamp: new Date()
//     };

//     const result = await collection.insertOne(quiltRecord);
//     res.json({ message: 'Quilt Saved!', id: result.insertedId });
//   } catch (error) {
//     console.error('Error creating quilt:', error);
//     res.status(500).json({ error: 'Failed to save quilt' });
//   }
// });

// // READ - Get all saved quilts
// app.get('/api/quilts', async (req, res) => {
//   try {
//     const db = client.db('quiltmachine');
//     const collection = db.collection('quilts');

//     const records = await collection.find({}).toArray();
//     res.json(records);
//   } catch (error) {
//     console.error('Error reading quilt list:', error);
//     res.status(500).json({ error: 'Failed to get quilts' });
//   }
// });

// // UPDATE - Update record
// app.put('/api/quilts/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { quiltName, quiltWidth, quiltHeight, squareSize } = req.body;

//     const db = client.db('quiltmachine');
//     const collection = db.collection('quilts');
//     console.log(id);
//     const result = await collection.updateOne(
//       { _id: new ObjectId(id) },
//       { $set: { quiltName, quiltWidth, quiltHeight, squareSize } }
//     );

//     if (result.matchedCount === 0) {
//       return res.status(404).json({ error: 'Record not found' });
//     }

//     res.json({ message: 'Quilts updated!' });
//   } catch (error) {
//     console.error('Error updating quilts:', error);
//     res.status(500).json({ error: 'Failed to update quilt' });
//   }
// });

// // DELETE - Delete quilt record
// app.delete('/api/quilts/:id', async (req, res) => {
//   try {
//     const { id } = req.params;

//     const db = client.db('quiltmachine');
//     const collection = db.collection('quilts');

//     const result = await collection.deleteOne({ _id: new ObjectId(id) });

//     if (result.deletedCount === 0) {
//       return res.status(404).json({ error: 'Record not found' });
//     }

//     res.json({ message: 'Quilt deleted!' });
//   } catch (error) {
//     console.error('Error deleting quilt:', error);
//     res.status(500).json({ error: 'Failed to delete quilt' });
//   }
// });



//start the server. 
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})