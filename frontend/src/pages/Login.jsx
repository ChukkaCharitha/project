import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')
  const [mounted, setMounted] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { setMounted(true) }, [])

  const toggleTheme = () => {
    const t = theme === 'dark' ? 'light' : 'dark'
    setTheme(t)
    localStorage.setItem('theme', t)
  }

  const handleLogin = async () => {
    if (!email || !password) return toast.error('Please fill all fields')
    setLoading(true)
    try {
      const res = await axios.post('http://127.0.0.1:8000/auth/login', { email, password })
      localStorage.setItem('token', res.data.access_token)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally { setLoading(false) }
  }

  const d = theme === 'dark'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        body { background: ${d ? '#020817' : '#f1f5f9'}; transition: background 0.4s; }

        .page { min-height:100vh; display:flex; font-family:'Inter',sans-serif; position:relative; overflow:hidden; background:${d?'#020817':'#f1f5f9'}; transition:background 0.4s; }

        /* Animated background particles */
        .bg-canvas { position:absolute; inset:0; overflow:hidden; pointer-events:none; }
        .particle { position:absolute; border-radius:50%; animation:float linear infinite; }
        @keyframes float {
          0% { transform:translateY(100vh) rotate(0deg); opacity:0; }
          10% { opacity:1; }
          90% { opacity:1; }
          100% { transform:translateY(-100px) rotate(720deg); opacity:0; }
        }

        /* Grid */
        .grid-bg { position:absolute; inset:0; background-image:linear-gradient(${d?'rgba(99,102,241,0.05)':'rgba(99,102,241,0.08)'} 1px,transparent 1px), linear-gradient(90deg,${d?'rgba(99,102,241,0.05)':'rgba(99,102,241,0.08)'} 1px,transparent 1px); background-size:60px 60px; }

        /* Left panel */
        .left { flex:1; display:flex; flex-direction:column; justify-content:center; padding:80px; position:relative; z-index:1; }
        .brand { display:flex; align-items:center; gap:12px; margin-bottom:60px; }
        .brand-icon { width:48px; height:48px; background:linear-gradient(135deg,#6366f1,#8b5cf6); border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:22px; box-shadow:0 0 40px rgba(99,102,241,0.4); animation:pulse 2s infinite; }
        @keyframes pulse { 0%,100%{box-shadow:0 0 40px rgba(99,102,241,0.4);} 50%{box-shadow:0 0 60px rgba(99,102,241,0.7);} }
        .brand-name { font-family:'Syne',sans-serif; font-size:22px; font-weight:800; color:${d?'#fff':'#1e293b'}; letter-spacing:-0.5px; transition:color 0.4s; }

        .hero { font-family:'Syne',sans-serif; font-size:58px; font-weight:800; line-height:1.05; letter-spacing:-2.5px; margin-bottom:24px; color:${d?'#fff':'#0f172a'}; transition:color 0.4s; }
        .hero .grad { background:linear-gradient(135deg,#6366f1,#06b6d4,#8b5cf6); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; background-size:200%; animation:gradMove 3s infinite; }
        @keyframes gradMove { 0%{background-position:0%} 50%{background-position:100%} 100%{background-position:0%} }

        .hero-sub { font-size:17px; color:${d?'#64748b':'#475569'}; line-height:1.7; max-width:420px; margin-bottom:52px; transition:color 0.4s; }

        .features { display:flex; flex-direction:column; gap:16px; }
        .feat { display:flex; align-items:center; gap:14px; padding:14px 18px; background:${d?'rgba(99,102,241,0.06)':'rgba(99,102,241,0.08)'}; border:1px solid ${d?'rgba(99,102,241,0.12)':'rgba(99,102,241,0.2)'}; border-radius:12px; transition:all 0.3s; cursor:default; }
        .feat:hover { background:${d?'rgba(99,102,241,0.12)':'rgba(99,102,241,0.15)'}; border-color:rgba(99,102,241,0.35); transform:translateX(6px); }
        .feat-icon { font-size:20px; width:36px; height:36px; background:${d?'rgba(99,102,241,0.15)':'rgba(99,102,241,0.12)'}; border-radius:9px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .feat-text { font-size:14px; color:${d?'#94a3b8':'#475569'}; font-weight:500; transition:color 0.4s; }

        /* Right panel - card */
        .right { width:500px; display:flex; align-items:center; justify-content:center; padding:40px; position:relative; z-index:1; }
        .card { width:100%; background:${d?'rgba(15,23,42,0.85)':'rgba(255,255,255,0.9)'}; border:1px solid ${d?'rgba(99,102,241,0.15)':'rgba(99,102,241,0.2)'}; border-radius:28px; padding:52px; backdrop-filter:blur(24px); box-shadow:${d?'0 0 80px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.05)':'0 20px 60px rgba(99,102,241,0.12)'}; opacity:${mounted?1:0}; transform:${mounted?'translateY(0)':'translateY(20px)'}; transition:opacity 0.6s, transform 0.6s, background 0.4s; }

        .card-title { font-family:'Syne',sans-serif; font-size:30px; font-weight:800; color:${d?'#fff':'#0f172a'}; margin-bottom:8px; letter-spacing:-0.5px; transition:color 0.4s; }
        .card-sub { font-size:14px; color:${d?'#475569':'#64748b'}; margin-bottom:40px; transition:color 0.4s; }

        .input-group { margin-bottom:22px; }
        .input-label { display:block; font-size:11px; font-weight:700; color:${d?'#475569':'#64748b'}; text-transform:uppercase; letter-spacing:1.2px; margin-bottom:8px; transition:color 0.4s; }
        .input-field { width:100%; padding:15px 18px; background:${d?'rgba(30,41,59,0.6)':'rgba(241,245,249,0.8)'}; border:1.5px solid ${d?'rgba(99,102,241,0.12)':'rgba(99,102,241,0.2)'}; border-radius:14px; color:${d?'#fff':'#0f172a'}; font-size:15px; font-family:'Inter',sans-serif; outline:none; transition:all 0.25s; }
        .input-field:focus { border-color:rgba(99,102,241,0.6); background:${d?'rgba(30,41,59,0.95)':'#fff'}; box-shadow:0 0 0 4px rgba(99,102,241,0.1); transform:translateY(-1px); }
        .input-field::placeholder { color:${d?'#334155':'#94a3b8'}; }

        .btn { width:100%; padding:16px; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; border:none; border-radius:14px; font-size:16px; font-weight:700; font-family:'Inter',sans-serif; cursor:pointer; margin-top:8px; transition:all 0.25s; box-shadow:0 4px 24px rgba(99,102,241,0.35); letter-spacing:0.3px; position:relative; overflow:hidden; }
        .btn::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,0.15),transparent); opacity:0; transition:opacity 0.2s; }
        .btn:hover { transform:translateY(-2px); box-shadow:0 8px 36px rgba(99,102,241,0.5); }
        .btn:hover::after { opacity:1; }
        .btn:active { transform:translateY(0); }
        .btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }

        .divider { display:flex; align-items:center; gap:16px; margin:28px 0; }
        .div-line { flex:1; height:1px; background:${d?'rgba(99,102,241,0.1)':'rgba(99,102,241,0.15)'}; }
        .div-text { font-size:11px; color:${d?'#334155':'#94a3b8'}; letter-spacing:1px; font-weight:600; }

        .link-text { text-align:center; font-size:14px; color:${d?'#475569':'#64748b'}; transition:color 0.4s; }
        .link-text a { color:#6366f1; text-decoration:none; font-weight:600; transition:all 0.2s; }
        .link-text a:hover { color:#818cf8; text-decoration:underline; }

        /* Theme toggle */
        .theme-btn { position:fixed; top:20px; right:20px; z-index:1000; width:48px; height:48px; border-radius:50%; background:${d?'rgba(15,23,42,0.9)':'rgba(255,255,255,0.9)'}; border:1px solid ${d?'rgba(99,102,241,0.2)':'rgba(99,102,241,0.3)'}; cursor:pointer; font-size:20px; display:flex; align-items:center; justify-content:center; transition:all 0.3s; box-shadow:0 4px 20px rgba(0,0,0,0.2); backdrop-filter:blur(10px); }
        .theme-btn:hover { transform:scale(1.1) rotate(15deg); box-shadow:0 6px 28px rgba(99,102,241,0.3); }

        .sp { display:inline-block; width:16px; height:16px; border:2.5px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.6s linear infinite; margin-right:10px; vertical-align:middle; }
        @keyframes spin { to{transform:rotate(360deg);} }

        @media(max-width:900px) { .left{display:none;} .right{width:100%;} }
      `}</style>

      {/* Floating particles */}
      <div className="bg-canvas">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random()*100}%`,
            width: `${4+Math.random()*8}px`,
            height: `${4+Math.random()*8}px`,
            background: ['#6366f1','#8b5cf6','#06b6d4','#3b82f6'][i%4],
            opacity: 0.3+Math.random()*0.4,
            animationDuration: `${8+Math.random()*12}s`,
            animationDelay: `${Math.random()*10}s`,
          }} />
        ))}
      </div>

      <div className="grid-bg" />

      <button className="theme-btn" onClick={toggleTheme}>{d ? '☀️' : '🌙'}</button>

      <div className="page">
        <div className="left">
          <div className="brand">
            <div className="brand-icon">🧠</div>
            <span className="brand-name">KnowledgeAI</span>
          </div>
          <h1 className="hero">Your docs,<br /><span className="grad">infinitely</span><br />smarter.</h1>
          <p className="hero-sub">Upload any document and chat with an AI that knows everything inside it. Instantly.</p>
          <div className="features">
            {[
              { icon:'📄', text:'Upload PDF & TXT documents instantly' },
              { icon:'🤖', text:'Ask questions in natural language' },
              { icon:'⚡', text:'Get instant AI-powered answers' },
              { icon:'🔒', text:'Secure, private & always available' },
            ].map(f => (
              <div className="feat" key={f.text}>
                <div className="feat-icon">{f.icon}</div>
                <span className="feat-text">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="right">
          <div className="card">
            <h2 className="card-title">Welcome back 👋</h2>
            <p className="card-sub">Sign in to your knowledge base</p>

            <div className="input-group">
              <label className="input-label">Email address</label>
              <input className="input-field" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input className="input-field" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>

            <button className="btn" onClick={handleLogin} disabled={loading}>
              {loading ? <><span className="sp" />Signing in...</> : 'Sign In →'}
            </button>

            <div className="divider"><div className="div-line" /><span className="div-text">NEW HERE?</span><div className="div-line" /></div>
            <p className="link-text">Don't have an account? <Link to="/register">Create one free</Link></p>
          </div>
        </div>
      </div>
    </>
  )
}