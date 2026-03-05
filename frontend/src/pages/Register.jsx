import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function Register() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')
  const navigate = useNavigate()

  useEffect(() => { setMounted(true) }, [])

  const toggleTheme = () => {
    const t = theme === 'dark' ? 'light' : 'dark'
    setTheme(t)
    localStorage.setItem('theme', t)
  }

  const handleRegister = async () => {
    if (!email || !username || !password) return toast.error('Fill all fields')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      await axios.post('https://knowledgeai-assisstent.onrender.com/auth/register', { email, username, password })
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally { setLoading(false) }
  }

  const d = theme === 'dark'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        body { background:${d?'#020817':'#f1f5f9'}; transition:background 0.4s; }

        .page { min-height:100vh; display:flex; align-items:center; justify-content:center; font-family:'Inter',sans-serif; position:relative; overflow:hidden; background:${d?'#020817':'#f1f5f9'}; transition:background 0.4s; padding:40px 20px; }

        .bg-canvas { position:absolute; inset:0; overflow:hidden; pointer-events:none; }
        .particle { position:absolute; border-radius:50%; animation:float linear infinite; }
        @keyframes float { 0%{transform:translateY(100vh) rotate(0deg);opacity:0;} 10%{opacity:1;} 90%{opacity:1;} 100%{transform:translateY(-100px) rotate(720deg);opacity:0;} }
        .grid-bg { position:absolute; inset:0; background-image:linear-gradient(${d?'rgba(99,102,241,0.04)':'rgba(99,102,241,0.07)'} 1px,transparent 1px),linear-gradient(90deg,${d?'rgba(99,102,241,0.04)':'rgba(99,102,241,0.07)'} 1px,transparent 1px); background-size:60px 60px; }

        .theme-btn { position:fixed; top:20px; right:20px; z-index:1000; width:46px; height:46px; border-radius:50%; background:${d?'rgba(15,23,42,0.9)':'rgba(255,255,255,0.9)'}; border:1px solid ${d?'rgba(99,102,241,0.2)':'rgba(99,102,241,0.3)'}; cursor:pointer; font-size:18px; display:flex; align-items:center; justify-content:center; transition:all 0.3s; box-shadow:0 4px 20px rgba(0,0,0,0.15); backdrop-filter:blur(10px); }
        .theme-btn:hover { transform:scale(1.1) rotate(15deg); }

        .wrap { position:relative; z-index:1; width:100%; max-width:980px; display:grid; grid-template-columns:340px 1fr; border-radius:28px; overflow:hidden; box-shadow:${d?'0 0 100px rgba(99,102,241,0.12)':'0 20px 80px rgba(99,102,241,0.1)'}; opacity:${mounted?1:0}; transform:${mounted?'translateY(0)':'translateY(24px)'}; transition:opacity 0.6s,transform 0.6s; }

        /* Side panel */
        .side { background:${d?'linear-gradient(160deg,#0f172a,#1e1b4b)':'linear-gradient(160deg,#4338ca,#6366f1)'}; padding:52px 40px; display:flex; flex-direction:column; transition:background 0.4s; position:relative; overflow:hidden; }
        .side::before { content:''; position:absolute; top:-100px; right:-100px; width:300px; height:300px; background:rgba(99,102,241,0.15); border-radius:50%; filter:blur(60px); }
        .side::after { content:''; position:absolute; bottom:-80px; left:-60px; width:200px; height:200px; background:rgba(139,92,246,0.15); border-radius:50%; filter:blur(50px); }

        .brand { display:flex; align-items:center; gap:10px; margin-bottom:48px; position:relative; z-index:1; }
        .bi { width:42px; height:42px; background:rgba(255,255,255,0.15); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.2); }
        .bn { font-family:'Syne',sans-serif; font-size:19px; font-weight:800; color:#fff; }

        .side-title { font-family:'Syne',sans-serif; font-size:34px; font-weight:800; color:#fff; line-height:1.15; letter-spacing:-1px; margin-bottom:16px; position:relative; z-index:1; }
        .side-sub { font-size:14px; color:rgba(255,255,255,0.6); line-height:1.7; margin-bottom:40px; position:relative; z-index:1; }

        .steps { display:flex; flex-direction:column; gap:18px; position:relative; z-index:1; }
        .step { display:flex; align-items:flex-start; gap:14px; padding:14px 16px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:14px; transition:all 0.3s; cursor:default; }
        .step:hover { background:rgba(255,255,255,0.1); transform:translateX(4px); }
        .step-num { width:28px; height:28px; border-radius:8px; background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.25); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:#fff; flex-shrink:0; }
        .step-body { padding-top:1px; }
        .step-title { font-size:13px; font-weight:600; color:#fff; margin-bottom:3px; }
        .step-sub { font-size:12px; color:rgba(255,255,255,0.5); }

        /* Form side */
        .form-side { background:${d?'rgba(15,23,42,0.95)':'rgba(255,255,255,0.97)'}; padding:52px 48px; transition:background 0.4s; }
        .ft { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; color:${d?'#fff':'#0f172a'}; margin-bottom:6px; letter-spacing:-0.5px; transition:color 0.4s; }
        .fs { font-size:14px; color:${d?'#475569':'#64748b'}; margin-bottom:36px; transition:color 0.4s; }

        .input-group { margin-bottom:20px; }
        .input-label { display:block; font-size:11px; font-weight:700; color:${d?'#475569':'#64748b'}; text-transform:uppercase; letter-spacing:1.2px; margin-bottom:8px; transition:color 0.4s; }
        .input-field { width:100%; padding:14px 18px; background:${d?'rgba(30,41,59,0.6)':'rgba(241,245,249,0.8)'}; border:1.5px solid ${d?'rgba(99,102,241,0.12)':'rgba(99,102,241,0.2)'}; border-radius:12px; color:${d?'#fff':'#0f172a'}; font-size:15px; font-family:'Inter',sans-serif; outline:none; transition:all 0.25s; }
        .input-field:focus { border-color:rgba(99,102,241,0.6); background:${d?'rgba(30,41,59,0.95)':'#fff'}; box-shadow:0 0 0 4px rgba(99,102,241,0.1); transform:translateY(-1px); }
        .input-field::placeholder { color:${d?'#334155':'#94a3b8'}; }

        .btn { width:100%; padding:15px; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; border:none; border-radius:12px; font-size:15px; font-weight:700; font-family:'Inter',sans-serif; cursor:pointer; margin-top:8px; transition:all 0.25s; box-shadow:0 4px 24px rgba(99,102,241,0.3); position:relative; overflow:hidden; }
        .btn::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,0.15),transparent); opacity:0; transition:opacity 0.2s; }
        .btn:hover { transform:translateY(-2px); box-shadow:0 8px 36px rgba(99,102,241,0.45); }
        .btn:hover::after { opacity:1; }
        .btn:disabled { opacity:0.6; cursor:not-allowed; transform:none; }

        .lt { text-align:center; font-size:14px; color:${d?'#475569':'#64748b'}; margin-top:20px; transition:color 0.4s; }
        .lt a { color:#6366f1; text-decoration:none; font-weight:600; transition:all 0.2s; }
        .lt a:hover { color:#818cf8; text-decoration:underline; }

        .sp { display:inline-block; width:15px; height:15px; border:2.5px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%; animation:spin 0.6s linear infinite; margin-right:10px; vertical-align:middle; }
        @keyframes spin { to{transform:rotate(360deg);} }

        @media(max-width:760px) { .wrap{grid-template-columns:1fr;} .side{display:none;} }
      `}</style>

      <div className="bg-canvas">
        {[...Array(10)].map((_,i) => (
          <div key={i} className="particle" style={{
            left:`${Math.random()*100}%`,
            width:`${4+Math.random()*8}px`,
            height:`${4+Math.random()*8}px`,
            background:['#6366f1','#8b5cf6','#06b6d4','#3b82f6'][i%4],
            opacity:0.25+Math.random()*0.3,
            animationDuration:`${8+Math.random()*12}s`,
            animationDelay:`${Math.random()*10}s`,
          }}/>
        ))}
      </div>
      <div className="grid-bg"/>
      <button className="theme-btn" onClick={toggleTheme}>{d?'☀️':'🌙'}</button>

      <div className="page">
        <div className="wrap">
          <div className="side">
            <div className="brand"><div className="bi">🧠</div><span className="bn">KnowledgeAI</span></div>
            <h2 className="side-title">Start for free today</h2>
            <p className="side-sub">Join thousands building smarter knowledge bases with AI-powered document chat.</p>
            <div className="steps">
              {[
                {n:'01', title:'Create your account', sub:'Takes less than a minute'},
                {n:'02', title:'Upload your documents', sub:'PDF, TXT and more supported'},
                {n:'03', title:'Chat with AI instantly', sub:'Get answers from your docs'},
              ].map(s => (
                <div className="step" key={s.n}>
                  <div className="step-num">{s.n}</div>
                  <div className="step-body"><div className="step-title">{s.title}</div><div className="step-sub">{s.sub}</div></div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-side">
            <h2 className="ft">Create your account ✨</h2>
            <p className="fs">Free forever. No credit card required.</p>

            <div className="input-group">
              <label className="input-label">Email address</label>
              <input className="input-field" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleRegister()}/>
            </div>
            <div className="input-group">
              <label className="input-label">Username</label>
              <input className="input-field" placeholder="cooluser123" value={username} onChange={e=>setUsername(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleRegister()}/>
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input className="input-field" type="password" placeholder="Min. 6 characters" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleRegister()}/>
            </div>

            <button className="btn" onClick={handleRegister} disabled={loading}>
              {loading ? <><span className="sp"/>Creating account...</> : 'Create Account →'}
            </button>
            <p className="lt">Already have an account? <Link to="/login">Sign in</Link></p>
          </div>
        </div>
      </div>
    </>
  )
}