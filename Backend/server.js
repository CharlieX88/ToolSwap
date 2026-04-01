const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

// Routes register karo
app.use('/api/auth',     require('./routes/auth'))
app.use('/api/tools',    require('./routes/tools'))
app.use('/api/bookings', require('./routes/bookings'))

// Basic health check
app.get('/', (req, res) => {
  res.json({ message: 'ToolSwap API running' })
})


// MongoDB connect karo, phir server start karo
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((err) => console.log('DB Error:', err.message))