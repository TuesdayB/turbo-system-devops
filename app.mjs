//app.js

import express from 'express'

const app = express()

app.get('/', (req, res) => {
  res.send('Hello Express: DEV')
  res.send('did it work?????????')
})

//starts the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})
