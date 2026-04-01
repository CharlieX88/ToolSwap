import { useState, useEffect } from 'react'
import axios                   from 'axios'
import { useAuth }             from '../context/AuthContext'
import { useNavigate }         from 'react-router-dom'
import './Dashboard.css'

const STATUS_COLOR = {
  pending:   'orange',
  confirmed: 'green',
  completed: 'blue',
  cancelled: 'red'
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()

  const [stats,    setStats]    = useState(null)
  const [rented,   setRented]   = useState([])
  const [incoming, setIncoming] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [activeTab, setActiveTab] = useState('rented')

  useEffect(() => {
    fetchDashboard()
  }, [])

  async function fetchDashboard() {
    try {
      const res = await axios.get('/api/bookings/dashboard')
      setStats(res.data.stats)
      setRented(res.data.myBookings)
      setIncoming(res.data.incomingBookings)
    } catch (err) {
      setError('Could not load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  if (loading) return <p style={{ padding: '40px 20px', color: '#888' }}>Loading...</p>
  if (error)   return <p style={{ padding: '40px 20px', color: 'var(--red)' }}>{error}</p>

  return (
    <div className="dashboard container">

      {/* Header */}
      <div className="dash-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.name}</p>
        </div>
        <div className="dash-header-right">
          <div className="user-chip">
            <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.city || user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-outline">Logout</button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card card">
          <div className="stat-icon">📦</div>
          <div className="stat-val">{stats?.totalRented ?? 0}</div>
          <div className="stat-lbl">Tools Rented</div>
        </div>
        <div className="stat-card card green">
          <div className="stat-icon">✅</div>
          <div className="stat-val">{stats?.activeBookings ?? 0}</div>
          <div className="stat-lbl">Active Bookings</div>
        </div>
        <div className="stat-card card orange">
          <div className="stat-icon">⏳</div>
          <div className="stat-val">{stats?.pendingRequests ?? 0}</div>
          <div className="stat-lbl">Pending Requests</div>
        </div>
        <div className="stat-card card blue">
          <div className="stat-icon">🔧</div>
          <div className="stat-val">{stats?.myListings ?? 0}</div>
          <div className="stat-lbl">My Listings</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'rented' ? 'active' : ''}`}
          onClick={() => setActiveTab('rented')}
        >
          Tools I Rented ({rented.length})
        </button>
        <button
          className={`tab ${activeTab === 'incoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('incoming')}
        >
          Incoming Requests ({incoming.length})
        </button>
      </div>

      {/* Table */}
      <div className="table-wrap card">

        {activeTab === 'rented' && (
          rented.length === 0
            ? <p className="no-data">You haven't rented any tools yet.</p>
            : <table>
                <thead>
                  <tr>
                    <th>Tool</th><th>Category</th><th>Owner</th>
                    <th>Dates</th><th>Days</th><th>Total</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rented.map(b => (
                    <tr key={b._id}>
                      <td className="bold">{b.tool?.title}</td>
                      <td className="muted">{b.tool?.category}</td>
                      <td>{b.owner?.name}</td>
                      <td className="muted">{formatDate(b.startDate)} – {formatDate(b.endDate)}</td>
                      <td>{b.totalDays}d</td>
                      <td className="price">₹{b.totalPrice}</td>
                      <td><span className={`badge ${STATUS_COLOR[b.status]}`}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
        )}

        {activeTab === 'incoming' && (
          incoming.length === 0
            ? <p className="no-data">No one has requested your tools yet.</p>
            : <table>
                <thead>
                  <tr>
                    <th>Tool</th><th>Requested By</th><th>Email</th>
                    <th>Dates</th><th>Days</th><th>Earnings</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {incoming.map(b => (
                    <tr key={b._id}>
                      <td className="bold">{b.tool?.title}</td>
                      <td>{b.renter?.name}</td>
                      <td className="muted">{b.renter?.email}</td>
                      <td className="muted">{formatDate(b.startDate)} – {formatDate(b.endDate)}</td>
                      <td>{b.totalDays}d</td>
                      <td className="price">₹{b.totalPrice}</td>
                      <td><span className={`badge ${STATUS_COLOR[b.status]}`}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
        )}

      </div>
    </div>
  )
}