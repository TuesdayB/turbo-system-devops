//class notes issue 9

import express from 'express'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express()

app.use(express.static(join(__dirname, 'public')));
app.use(express.json()); 
//middlewares aka endpoints aka 'get to slash' {http verb} to slash {you name your endpoint}
app.get('/', (req, res) => {
  res.send('Hello Express')
  //res.sendFile(join(__dirname, 'public', 'index.html'))
})
app.get('/api/json',(req,res)=>{
  const myVar = 'Hello from server!';
  res.json({ myVar });
})

app.post('/api/body', (req, res) => {
  console.log("The Body: ", req.body);
  console.log("client request with body:", req.body.name); 
  res.json({"name": req.query.name});
});

//starts the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})
