import { useState, useEffect } from 'react'
import { useParams, Link }     from 'react-router-dom'
import axios                   from 'axios'
import { useAuth }             from '../context/AuthContext'
import './ToolDetail.css'

export default function ToolDetail() {
  const { id }     = useParams()
  const { user }   = useAuth()

  const [tool,    setTool]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  // Booking form state
  const [startDate, setStartDate] = useState('')
  const [endDate,   setEndDate]   = useState('')
  const [bookMsg,   setBookMsg]   = useState('')
  const [bookErr,   setBookErr]   = useState('')
  const [bookLoad,  setBookLoad]  = useState(false)

  useEffect(() => {
    async function fetchTool() {
      try {
        const res = await axios.get(`/api/tools/${id}`)
        setTool(res.data.tool)
      } catch {
        setError('Tool not found')
      } finally {
        setLoading(false)
      }
    }
    fetchTool()
  }, [id])

  // Calculate total price
  function calcTotal() {
    if (!startDate || !endDate || !tool) return null
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
    return days > 0 ? { days, total: days * tool.pricePerDay } : null
  }

  async function handleBook(e) {
    e.preventDefault()
    setBookErr('')
    setBookMsg('')
    setBookLoad(true)
    try {
      await axios.post('/api/bookings', { toolId: id, startDate, endDate })
      setBookMsg('Booking request sent! Owner will confirm shortly.')
      setStartDate('')
      setEndDate('')
    } catch (err) {
      setBookErr(err.response?.data?.message || 'Booking failed')
    } finally {
      setBookLoad(false)
    }
  }

  if (loading) return <p style={{ padding: '40px 20px', color: '#888' }}>Loading...</p>
  if (error)   return <p style={{ padding: '40px 20px', color: 'var(--red)' }}>{error}</p>

  const calc    = calcTotal()
  const isOwner = user && tool.owner?._id === user._id

  return (
    <div className="detail-page container">

      <div className="detail-grid">

        {/* Left side */}
        <div className="detail-left">

          {/* Tool image */}
          <div className="detail-img">
            {tool.imageUrl
              ? <img src={tool.imageUrl} alt={tool.title} />
              : <span>🔧</span>
            }
          </div>

          {/* Tool info */}
          <div className="detail-info card">
            <div className="detail-top">
              <div>
                <span className="tool-cat">{tool.category}</span>
                <h1>{tool.title}</h1>
              </div>
              <div className="detail-price">
                <span>₹{tool.pricePerDay}</span>
                <small>/day</small>
              </div>
            </div>

            <div className="detail-badges">
              <span className={`avail-tag ${tool.isAvailable ? 'green' : 'red'}`}>
                {tool.isAvailable ? '✓ Available' : '✗ Unavailable'}
              </span>
              <span className="cond-tag">{tool.condition}</span>
            </div>

            <p className="detail-desc">{tool.description}</p>

            <div className="detail-owner">
              <div className="owner-av">{tool.owner?.name?.charAt(0).toUpperCase()}</div>
              <div>
                <p className="owner-name">{tool.owner?.name}</p>
                <p className="owner-city">📍 {tool.owner?.city || tool.city}</p>
              </div>
              {isOwner && (
                <Link to="/my-tools" className="btn btn-outline" style={{ marginLeft: 'auto' }}>
                  Manage
                </Link>
              )}
            </div>
          </div>

        </div>

        {/* Right side — booking form */}
        <div className="detail-right">
          <div className="booking-card card">
            <h3>Book This Tool</h3>
            <div className="booking-price">₹{tool.pricePerDay}<small>/day</small></div>

            {!tool.isAvailable ? (
              <p className="error-msg">This tool is currently unavailable.</p>
            ) : isOwner ? (
              <p style={{ color: 'var(--muted)', fontSize: '13px' }}>This is your listing.</p>
            ) : !user ? (
              <Link to="/login" className="btn btn-primary full-btn">Login to Book</Link>
            ) : (
              <form onSubmit={handleBook}>
                <div className="field">
                  <label>Start Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label>End Date</label>
                  <input
                    type="date"
                    min={startDate || new Date().toISOString().split('T')[0]}
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    required
                  />
                </div>

                {calc && (
                  <div className="booking-total">
                    <span>{calc.days} days × ₹{tool.pricePerDay}</span>
                    <strong>₹{calc.total}</strong>
                  </div>
                )}

                {bookErr && <p className="error-msg">{bookErr}</p>}
                {bookMsg && <p className="success-msg">{bookMsg}</p>}

                <button type="submit" className="btn btn-primary full-btn" disabled={bookLoad}>
                  {bookLoad ? 'Sending...' : 'Request Booking'}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}