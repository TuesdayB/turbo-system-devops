//app.js

import express from 'express'

const app = express()

app.get('/', (req, res) => {
  res.send('Hello Express Part II: Updated Feb 12 2026')
})

//starts the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})
