const express = require('express')
const router  = express.Router()
const Booking = require('../models/Booking')
const Tool    = require('../models/Tool')
const protect = require('../middleware/auth')

// GET /api/bookings/dashboard — dashboard ke liye data
router.get('/dashboard', protect, async (req, res) => {
  try {
    const userId = req.user._id

    // Jo maine rent kiye hain
    const myBookings = await Booking.find({ renter: userId })
      .populate('tool',  'title category pricePerDay')
      .populate('owner', 'name')
      .sort({ createdAt: -1 })

    // Mere tools pe aaye requests
    const incomingBookings = await Booking.find({ owner: userId })
      .populate('tool',   'title')
      .populate('renter', 'name email')
      .sort({ createdAt: -1 })

    // Mere listed tools ka count
    const myToolsCount = await Tool.countDocuments({ owner: userId })

    const stats = {
      totalRented:     myBookings.length,
      activeBookings:  myBookings.filter(b => b.status === 'confirmed').length,
      pendingRequests: incomingBookings.filter(b => b.status === 'pending').length,
      myListings:      myToolsCount
    }

    res.json({ stats, myBookings, incomingBookings })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/bookings — naya booking banao
router.post('/', protect, async (req, res) => {
  try {
    const { toolId, startDate, endDate } = req.body

    const tool = await Tool.findById(toolId)
    if (!tool) return res.status(404).json({ message: 'Tool not found' })

    const start      = new Date(startDate)
    const end        = new Date(endDate)
    const totalDays  = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    const totalPrice = totalDays * tool.pricePerDay

    const booking = await Booking.create({
      tool: toolId, renter: req.user._id, owner: tool.owner,
      startDate: start, endDate: end, totalDays, totalPrice
    })

    res.status(201).json({ booking })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router