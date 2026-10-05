import React, { useState, useEffect } from 'react'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://smart-campus-service-management-7.onrender.com'
export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const u = localStorage.getItem('sc_user')
      return u ? JSON.parse(u) : null
    } catch {
      return null
    }
  })

  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState({
    tickets: 0,
    events: 0,
    notices: 0,
    lostfound: 0
  })

  const [tickets, setTickets] = useState([])
  const [events, setEvents] = useState([])
  const [notices, setNotices] = useState([])
  const [lostFound, setLostFound] = useState([])

  const [toast, setToast] = useState(null)

  const [authModal, setAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('login')

  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authName, setAuthName] = useState('')
  const [authDept, setAuthDept] = useState('')

  const showToast = (message, type = 'info') => {
    setToast({ message, type })

    setTimeout(() => {
      setToast(null)
    }, 3500)
  }


  const apiFetch = async (url, options = {}) => {
    const token = localStorage.getItem('sc_jwt')

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const fullUrl = `${API_BASE_URL}${url}`

    console.log('API Request:', fullUrl)

    let res

    try {
      res = await fetch(fullUrl, {
        ...options,
        headers
      })
    } catch (error) {
      console.error('Network error:', error)
      throw new Error(
        'Unable to connect to the server. Please try again.'
      )
    }

    if (res.status === 401) {
      localStorage.removeItem('sc_jwt')
      localStorage.removeItem('sc_user')

      setCurrentUser(null)

      throw new Error(
        'Invalid email/password or session expired.'
      )
    }

    if (res.status === 204) {
      return null
    }

    const contentType =
      res.headers.get('content-type') || ''

    let data

    try {
      if (contentType.includes('application/json')) {
        data = await res.json()
      } else {
        data = await res.text()
      }
    } catch (error) {
      console.error('Response parsing error:', error)
      throw new Error('Invalid response received from server.')
    }

    if (!res.ok) {
      if (typeof data === 'string') {
        throw new Error(data || 'Request failed')
      }

      throw new Error(
        data?.message ||
        data?.error ||
        'Request failed'
      )
    }

    return data
  }

  

  const loadData = async () => {
    if (!currentUser) return

    try {
      const [
        tRes,
        eRes,
        nRes,
        lfRes
      ] = await Promise.allSettled([
        apiFetch('/api/tickets?size=50'),
        apiFetch('/api/events'),
        apiFetch('/api/notices'),
        apiFetch('/api/lost-found')
      ])

      const tList =
        tRes.status === 'fulfilled'
          ? (tRes.value?.content || tRes.value || [])
          : []

      const eList =
        eRes.status === 'fulfilled'
          ? (eRes.value || [])
          : []

      const nList =
        nRes.status === 'fulfilled'
          ? (nRes.value || [])
          : []

      const lfList =
        lfRes.status === 'fulfilled'
          ? (lfRes.value || [])
          : []

      setTickets(Array.isArray(tList) ? tList : [])
      setEvents(Array.isArray(eList) ? eList : [])
      setNotices(Array.isArray(nList) ? nList : [])
      setLostFound(Array.isArray(lfList) ? lfList : [])

      setStats({
        tickets: Array.isArray(tList) ? tList.length : 0,
        events: Array.isArray(eList) ? eList.length : 0,
        notices: Array.isArray(nList) ? nList.length : 0,
        lostfound: Array.isArray(lfList) ? lfList.length : 0
      })
    } catch (err) {
      console.error('Load data error:', err)
    }
  }

  useEffect(() => {
    loadData()
  }, [currentUser])


  const handleLogin = async (e) => {
    e.preventDefault()

    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: authEmail.trim(),
          password: authPassword
        })
      })

      console.log('Login response:', data)

      if (!data || !data.token) {
        throw new Error(
          data?.message ||
          'Login failed. Token not received from server.'
        )
      }

      localStorage.setItem('sc_jwt', data.token)

      const user = {
        name: data.name,
        email: data.email,
        role: data.role
      }

      localStorage.setItem(
        'sc_user',
        JSON.stringify(user)
      )

      setCurrentUser(user)

      setAuthModal(false)

      setAuthEmail('')
      setAuthPassword('')

      showToast(
        `Welcome back, ${data.name || 'User'}!`,
        'success'
      )
    } catch (err) {
      console.error('Login error:', err)

      showToast(
        err.message || 'Login failed.',
        'error'
      )
    }
  }



  const handleRegister = async (e) => {
    e.preventDefault()

    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: authName.trim(),
          email: authEmail.trim(),
          password: authPassword,
          department: authDept.trim()
        })
      })

      console.log('Register response:', data)

      if (!data || !data.token) {
        throw new Error(
          data?.message ||
          'Registration failed. Token not received from server.'
        )
      }

      localStorage.setItem('sc_jwt', data.token)

      const user = {
        name: data.name,
        email: data.email,
        role: data.role
      }

      localStorage.setItem(
        'sc_user',
        JSON.stringify(user)
      )

      setCurrentUser(user)

      setAuthModal(false)

      setAuthName('')
      setAuthEmail('')
      setAuthPassword('')
      setAuthDept('')

      showToast(
        `Account created! Welcome ${data.name || 'User'}!`,
        'success'
      )
    } catch (err) {
      console.error('Register error:', err)

      showToast(
        err.message || 'Registration failed.',
        'error'
      )
    }
  }

 

  const handleLogout = () => {
    localStorage.removeItem('sc_jwt')
    localStorage.removeItem('sc_user')

    setCurrentUser(null)

    setTickets([])
    setEvents([])
    setNotices([])
    setLostFound([])

    setStats({
      tickets: 0,
      events: 0,
      notices: 0,
      lostfound: 0
    })

    showToast(
      'Logged out successfully.',
      'info'
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'var(--bg)'
      }}
    >


      <header
        style={{
          background: '#fff',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          padding: '0.85rem 1.25rem'
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background:
                  'linear-gradient(135deg, #4f46e5, #0ea5e9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1.2rem'
              }}
            >
              <i className="fa-solid fa-graduation-cap"></i>
            </div>

            <div>
              <h1
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: 'var(--dark)'
                }}
              >
                Smart Campus
              </h1>

              <span
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)'
                }}
              >
                React Client
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}
          >
            {currentUser ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <span
                  style={{
                    background: '#f1f5f9',
                    padding: '4px 10px',
                    borderRadius: 9999,
                    fontSize: '0.82rem',
                    fontWeight: 600
                  }}
                >
                  {currentUser.name} ({currentUser.role})
                </span>

                <button
                  onClick={handleLogout}
                  style={{
                    border: 'none',
                    background: '#fee2e2',
                    color: '#b91c1c',
                    padding: '5px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.8rem'
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('login')
                  setAuthModal(true)
                }}
                style={{
                  background: 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>


      <main
        style={{
          maxWidth: 1280,
          width: '100%',
          margin: '0 auto',
          padding: '1.5rem 1.25rem',
          flex: 1
        }}
      >


        <div
          style={{
            background:
              'linear-gradient(135deg, #312e81 0%, #4338ca 50%, #6366f1 100%)',
            borderRadius: 16,
            padding: '1.75rem',
            color: '#fff',
            marginBottom: '1.75rem'
          }}
        >
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              marginBottom: 6
            }}
          >
            {currentUser
              ? `Welcome back, ${currentUser.name}!`
              : 'Smart Campus Portal'}
          </h2>

          <p
            style={{
              color: '#e0e7ff',
              fontSize: '0.9rem'
            }}
          >
            Connected to Smart Campus Spring Boot API.
            Manage tickets, events, notices, and lost & found items.
          </p>
        </div>


        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}
        >

          <div
            style={{
              background: '#fff',
              padding: '1.25rem',
              borderRadius: 12,
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem'
              }}
            >
              <i className="fa-solid fa-ticket"></i>
            </div>

            <div>
              <div
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800
                }}
              >
                {stats.tickets}
              </div>

              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600
                }}
              >
                Total Tickets
              </div>
            </div>
          </div>

          <div
            style={{
              background: '#fff',
              padding: '1.25rem',
              borderRadius: 12,
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem'
              }}
            >
              <i className="fa-solid fa-calendar-check"></i>
            </div>

            <div>
              <div
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800
                }}
              >
                {stats.events}
              </div>

              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600
                }}
              >
                Campus Events
              </div>
            </div>
          </div>

          <div
            style={{
              background: '#fff',
              padding: '1.25rem',
              borderRadius: 12,
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: '#faf5ff',
                color: '#9333ea',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem'
              }}
            >
              <i className="fa-solid fa-bullhorn"></i>
            </div>

            <div>
              <div
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800
                }}
              >
                {stats.notices}
              </div>

              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600
                }}
              >
                Active Notices
              </div>
            </div>
          </div>

          <div
            style={{
              background: '#fff',
              padding: '1.25rem',
              borderRadius: 12,
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: '#fffbeb',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem'
              }}
            >
              <i className="fa-solid fa-magnifying-glass"></i>
            </div>

            <div>
              <div
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800
                }}
              >
                {stats.lostfound}
              </div>

              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  fontWeight: 600
                }}
              >
                Lost & Found
              </div>
            </div>
          </div>

        </div>


        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: '1.5rem',
            flexWrap: 'wrap'
          }}
        >
          {[
            'dashboard',
            'tickets',
            'events',
            'notices',
            'lostfound'
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background:
                  activeTab === tab
                    ? 'var(--primary)'
                    : '#fff',
                color:
                  activeTab === tab
                    ? '#fff'
                    : 'var(--text-main)',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {tab.charAt(0).toUpperCase() +
                tab.slice(1)}
            </button>
          ))}
        </div>


        <div>


          {activeTab === 'tickets' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1rem'
              }}
            >
              {tickets.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>
                  No tickets found.
                </p>
              ) : (
                tickets.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      background: '#fff',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: '1.25rem'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 8
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.72rem',
                          background: '#e0e7ff',
                          color: '#4338ca',
                          padding: '2px 8px',
                          borderRadius: 9999,
                          fontWeight: 700
                        }}
                      >
                        {t.category}
                      </span>

                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'var(--text-muted)'
                        }}
                      >
                        #{t.id}
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        marginBottom: 4
                      }}
                    >
                      {t.title}
                    </h3>

                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)',
                        marginBottom: 12
                      }}
                    >
                      {t.description}
                    </p>

                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                        borderTop: '1px solid #f1f5f9',
                        paddingTop: 8
                      }}
                    >
                      Status: <strong>{t.status}</strong> |
                      Priority: <strong>{t.priority}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}


          {activeTab === 'events' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1rem'
              }}
            >
              {events.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>
                  No events scheduled.
                </p>
              ) : (
                events.map((e) => (
                  <div
                    key={e.id}
                    style={{
                      background: '#fff',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: '1.25rem'
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        marginBottom: 4
                      }}
                    >
                      {e.title}
                    </h3>

                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)',
                        marginBottom: 8
                      }}
                    >
                      {e.description}
                    </p>

                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)'
                      }}
                    >
                      📍 {e.venue} | 👥{' '}
                      {e.registeredCount || 0} / {e.capacity}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}


          {activeTab === 'notices' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1rem'
              }}
            >
              {notices.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>
                  No notices posted.
                </p>
              ) : (
                notices.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      background: '#fff',
                      border: '1px solid var(--border)',
                      borderLeft:
                        '4px solid var(--primary)',
                      borderRadius: 12,
                      padding: '1.25rem'
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        marginBottom: 4
                      }}
                    >
                      {n.title}
                    </h3>

                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)',
                        whiteSpace: 'pre-line'
                      }}
                    >
                      {n.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}


          {activeTab === 'lostfound' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1rem'
              }}
            >
              {lostFound.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>
                  No lost or found items.
                </p>
              ) : (
                lostFound.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: '#fff',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      padding: '1.25rem'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.72rem',
                        background:
                          item.type === 'LOST'
                            ? '#fee2e2'
                            : '#ecfdf5',
                        color:
                          item.type === 'LOST'
                            ? '#b91c1c'
                            : '#047857',
                        padding: '2px 8px',
                        borderRadius: 9999,
                        fontWeight: 700
                      }}
                    >
                      {item.type}
                    </span>

                    <h3
                      style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        margin: '6px 0 4px 0'
                      }}
                    >
                      {item.itemName}
                    </h3>

                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)'
                      }}
                    >
                      {item.description ||
                        'No description'}
                    </p>

                    <div
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                        marginTop: 8
                      }}
                    >
                      📍 {item.location}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}


          {activeTab === 'dashboard' && (
            <div
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: '1.5rem',
                border: '1px solid var(--border)'
              }}
            >
              <h3
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  marginBottom: 8
                }}
              >
                Quick Access Overview
              </h3>

              <p
                style={{
                  fontSize: '0.88rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.6
                }}
              >
                Select any tab above to interact with campus
                services. For full administrative controls,
                sign in using the demo accounts
                (admin@campus.com / staff@campus.com).
              </p>
            </div>
          )}

        </div>
      </main>


      {authModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.6)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem'
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              width: '100%',
              maxWidth: 440,
              padding: '1.5rem',
              boxShadow: 'var(--shadow-lg)'
            }}
          >

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}
            >
              <h3
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700
                }}
              >
                {authMode === 'login'
                  ? 'Sign In'
                  : 'Register'}
              </h3>

              <button
                onClick={() => setAuthModal(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: '1.3rem',
                  cursor: 'pointer'
                }}
              >
                &times;
              </button>
            </div>


            {authMode === 'login' && (
              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  marginBottom: '1rem'
                }}
              >
                <button
                  onClick={() => {
                    setAuthEmail('admin@campus.com')
                    setAuthPassword('admin123')
                  }}
                  style={{
                    flex: 1,
                    padding: '4px',
                    fontSize: '0.75rem',
                    background: '#f1f5f9',
                    border:
                      '1px dashed #cbd5e1',
                    borderRadius: 6,
                    cursor: 'pointer'
                  }}
                >
                  Fill Admin
                </button>

                <button
                  onClick={() => {
                    setAuthEmail('staff@campus.com')
                    setAuthPassword('staff123')
                  }}
                  style={{
                    flex: 1,
                    padding: '4px',
                    fontSize: '0.75rem',
                    background: '#f1f5f9',
                    border:
                      '1px dashed #cbd5e1',
                    borderRadius: 6,
                    cursor: 'pointer'
                  }}
                >
                  Fill Staff
                </button>
              </div>
            )}

            <form
              onSubmit={
                authMode === 'login'
                  ? handleLogin
                  : handleRegister
              }
            >

              {authMode === 'register' && (
                <>
                  <div
                    style={{
                      marginBottom: 10
                    }}
                  >
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        marginBottom: 4
                      }}
                    >
                      Full Name
                    </label>

                    <input
                      type="text"
                      value={authName}
                      onChange={(e) =>
                        setAuthName(e.target.value)
                      }
                      required
                      style={{
                        width: '100%',
                        padding: '8px',
                        border:
                          '1px solid var(--border)',
                        borderRadius: 6
                      }}
                    />
                  </div>

                  <div
                    style={{
                      marginBottom: 10
                    }}
                  >
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        marginBottom: 4
                      }}
                    >
                      Department
                    </label>

                    <input
                      type="text"
                      value={authDept}
                      onChange={(e) =>
                        setAuthDept(e.target.value)
                      }
                      style={{
                        width: '100%',
                        padding: '8px',
                        border:
                          '1px solid var(--border)',
                        borderRadius: 6
                      }}
                    />
                  </div>
                </>
              )}

              <div
                style={{
                  marginBottom: 10
                }}
              >
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    marginBottom: 4
                  }}
                >
                  Email
                </label>

                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) =>
                    setAuthEmail(e.target.value)
                  }
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border:
                      '1px solid var(--border)',
                    borderRadius: 6
                  }}
                />
              </div>

              <div
                style={{
                  marginBottom: 14
                }}
              >
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    marginBottom: 4
                  }}
                >
                  Password
                </label>

                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) =>
                    setAuthPassword(e.target.value)
                  }
                  required
                  style={{
                    width: '100%',
                    padding: '8px',
                    border:
                      '1px solid var(--border)',
                    borderRadius: 6
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {authMode === 'login'
                  ? 'Sign In'
                  : 'Create Account'}
              </button>

            </form>


            <div
              style={{
                textAlign: 'center',
                marginTop: 14,
                fontSize: '0.82rem',
                color: 'var(--text-muted)'
              }}
            >
              {authMode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register')
                      setAuthName('')
                      setAuthDept('')
                    }}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'var(--primary)',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Register
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login')
                    }}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'var(--primary)',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

      {/* TOAST */}

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            background: '#fff',
            borderLeft:
              `4px solid ${
                toast.type === 'success'
                  ? 'var(--success)'
                  : toast.type === 'info'
                    ? 'var(--primary)'
                    : 'var(--danger)'
              }`,
            padding: '12px 18px',
            borderRadius: 8,
            boxShadow: 'var(--shadow-lg)',
            fontWeight: 600,
            fontSize: '0.88rem',
            zIndex: 200
          }}
        >
          {toast.message}
        </div>
      )}

    </div>
  )
}
