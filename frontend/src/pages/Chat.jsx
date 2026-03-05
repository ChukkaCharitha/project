import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('Thinking...')
  const [docs, setDocs] = useState([])
  const [ready, setReady] = useState(false)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')
  const [copied, setCopied] = useState(null)
  const navigate = useNavigate()
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const d = theme === 'dark'
  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })
  const toggleTheme = () => { const t = d ? 'light' : 'dark'; setTheme(t); localStorage.setItem('theme', t) }

  const loadingTexts = ['Searching your documents...', 'Analyzing relevant chunks...', 'Generating answer...', 'Almost ready...']

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return }
    axios.get('http://127.0.0.1:8000/documents/', { headers: getHeaders() })
      .then(r => setDocs(r.data)).catch(() => {}).finally(() => setReady(true))
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  useEffect(() => {
    if (!loading) return
    let i = 0
    const iv = setInterval(() => { i = (i + 1) % loadingTexts.length; setLoadingText(loadingTexts[i]) }, 1800)
    return () => clearInterval(iv)
  }, [loading])

  const sendMessage = async () => {
    if (!question.trim() || loading) return
    const q = question.trim()
    setMessages(prev => [...prev, { role: 'user', text: q, time: new Date() }])
    setQuestion(''); setLoading(true)
    try {
      const res = await axios.post('http://127.0.0.1:8000/chat/ask', { question: q }, { headers: getHeaders() })
      setMessages(prev => [...prev, { role: 'ai', text: res.data.answer, time: new Date() }])
    } catch {
      toast.error('Failed to get answer')
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, something went wrong. Please try again.', time: new Date(), error: true }])
    } finally { setLoading(false); setTimeout(() => inputRef.current?.focus(), 100) }
  }

  const copyMsg = (text, i) => { navigator.clipboard.writeText(text); setCopied(i); toast.success('Copied!'); setTimeout(() => setCopied(null), 2000) }
  const fmtTime = dt => dt?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const icon = n => n.toLowerCase().endsWith('.pdf') ? '📕' : '📄'

  const suggestions = [
    { ico: '📋', t: 'Summarize the document' },
    { ico: '🔑', t: 'What are the key points?' },
    { ico: '💡', t: 'Explain the main topic' },
    { ico: '📊', t: 'List all important facts' },
    { ico: '❓', t: 'What questions does this answer?' },
    { ico: '🎯', t: '3-bullet summary please' },
  ]

  if (!ready) return (
    <div style={{ height: '100vh', background: d ? '#020817' : '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
        <p style={{ color: '#6366f1', fontFamily: 'sans-serif', fontSize: '14px', fontWeight: 600 }}>Loading AI Chat...</p>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        html,body{height:100%;overflow:hidden;}
        body{background:${d ? '#020817' : '#f0f4ff'};transition:background 0.4s;}
        .mesh{position:fixed;inset:0;pointer-events:none;background:${d
          ? 'radial-gradient(ellipse 60% 50% at 10% 10%,rgba(99,102,241,0.1) 0%,transparent 55%),radial-gradient(ellipse 50% 40% at 90% 90%,rgba(139,92,246,0.08) 0%,transparent 55%)'
          : 'radial-gradient(ellipse 60% 50% at 10% 10%,rgba(99,102,241,0.06) 0%,transparent 55%)'};}
        .grid{position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(${d ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.05)'} 1px,transparent 1px),linear-gradient(90deg,${d ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.05)'} 1px,transparent 1px);background-size:48px 48px;}

        /* ROOT */
        .cr{height:100vh;display:flex;font-family:'DM Sans',sans-serif;color:${d ? '#e2e8f0' : '#1e293b'};position:relative;z-index:1;overflow:hidden;transition:color 0.4s;}

        /* SIDEBAR */
        .sb{width:260px;flex-shrink:0;display:flex;flex-direction:column;background:${d ? 'rgba(10,16,35,0.9)' : 'rgba(255,255,255,0.92)'};border-right:1px solid ${d ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.15)'};backdrop-filter:blur(20px);overflow:hidden;transition:all 0.4s;}
        .sb-top{padding:16px;flex-shrink:0;}
        .back{width:100%;display:flex;align-items:center;gap:6px;padding:8px 12px;background:${d ? 'rgba(30,41,59,0.5)' : 'rgba(241,245,249,0.8)'};color:${d ? '#64748b' : '#475569'};border:1px solid ${d ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.2)'};border-radius:9px;font-size:12px;cursor:pointer;transition:all 0.25s;font-family:'DM Sans',sans-serif;margin-bottom:14px;}
        .back:hover{color:${d ? '#94a3b8' : '#1e293b'};transform:translateX(-2px);}
        .brand{display:flex;align-items:center;gap:8px;margin-bottom:16px;}
        .bi{width:30px;height:30px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;}
        .bn{font-family:'Syne',sans-serif;font-size:15px;font-weight:800;color:${d ? '#fff' : '#0f172a'};transition:color 0.4s;}
        .sb-label{font-size:9px;font-weight:700;color:${d ? '#334155' : '#94a3b8'};text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;transition:color 0.4s;}
        .dp{display:flex;align-items:center;gap:8px;padding:9px 11px;background:${d ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.9)'};border:1px solid ${d ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.15)'};border-radius:9px;margin-bottom:5px;cursor:pointer;transition:all 0.2s;}
        .dp:hover{border-color:rgba(99,102,241,0.3);transform:translateX(2px);}
        .dp-ico{font-size:14px;}
        .dp-name{font-size:11px;font-weight:500;color:${d ? '#94a3b8' : '#475569'};flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:color 0.4s;}
        .dp-badge{font-size:9px;color:#818cf8;background:rgba(99,102,241,0.1);padding:2px 5px;border-radius:3px;font-weight:700;text-transform:uppercase;}
        .no-docs{font-size:12px;color:${d ? '#334155' : '#94a3b8'};padding:8px 0;transition:color 0.4s;}
        .no-docs span{color:#6366f1;cursor:pointer;}

        /* Sidebar stats — fills space */
        .sb-stats{flex:1;margin:0 16px;background:linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.07));border:1px solid rgba(99,102,241,0.18);border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:8px;}
        .ss-t{font-size:11px;font-weight:700;color:${d ? '#818cf8' : '#4338ca'};margin-bottom:4px;transition:color 0.4s;}
        .ss-row{display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid ${d ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.1)'};}
        .ss-row:last-child{border-bottom:none;}
        .ss-k{font-size:11px;color:${d ? '#475569' : '#64748b'};transition:color 0.4s;}
        .ss-v{font-size:12px;font-weight:700;color:${d ? '#c7d2fe' : '#4338ca'};transition:color 0.4s;}

        /* Sidebar model info */
        .sb-model{margin:12px 16px;padding:10px 12px;background:${d ? 'rgba(15,23,42,0.5)' : 'rgba(255,255,255,0.7)'};border:1px solid ${d ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.15)'};border-radius:10px;display:flex;flex-direction:column;gap:4px;}
        .sm-row{display:flex;justify-content:space-between;align-items:center;}
        .sm-k{font-size:10px;color:${d ? '#334155' : '#94a3b8'};transition:color 0.4s;}
        .sm-v{font-size:10px;font-weight:600;color:${d ? '#64748b' : '#475569'};transition:color 0.4s;}

        .sb-bot{padding:12px 16px;border-top:1px solid ${d ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.1)'};flex-shrink:0;}
        .tb{width:100%;padding:9px;border-radius:9px;background:${d ? 'rgba(30,41,59,0.5)' : 'rgba(241,245,249,0.8)'};border:1px solid ${d ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.2)'};cursor:pointer;font-size:12px;color:${d ? '#64748b' : '#475569'};font-family:'DM Sans',sans-serif;font-weight:500;display:flex;align-items:center;justify-content:center;gap:7px;transition:all 0.3s;}
        .tb:hover{color:${d ? '#94a3b8' : '#1e293b'};}

        /* MAIN */
        .main{flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden;}

        /* Top nav */
        .cnav{height:58px;flex-shrink:0;display:flex;align-items:center;justify-content:space-between;padding:0 24px;background:${d ? 'rgba(2,8,23,0.9)' : 'rgba(255,255,255,0.92)'};border-bottom:1px solid ${d ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.15)'};backdrop-filter:blur(20px);transition:all 0.4s;}
        .ct{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;color:${d ? '#fff' : '#0f172a'};transition:color 0.4s;}
        .chips{display:flex;gap:7px;}
        .chip{padding:4px 11px;border-radius:20px;font-size:11px;font-weight:600;border:1px solid;display:flex;align-items:center;gap:4px;}
        .chip-g{color:#10b981;border-color:rgba(16,185,129,0.25);background:rgba(16,185,129,0.08);}
        .chip-b{color:#818cf8;border-color:rgba(99,102,241,0.25);background:rgba(99,102,241,0.08);}

        /* Chat body */
        .cbody{flex:1;overflow-y:auto;padding:24px;display:flex;flex-direction:column;gap:18px;scrollbar-width:thin;scrollbar-color:rgba(99,102,241,0.2) transparent;}
        .cbody::-webkit-scrollbar{width:4px;}
        .cbody::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.2);border-radius:4px;}

        /* Welcome */
        .welcome{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100%;text-align:center;padding:20px;animation:fadeUp 0.5s ease;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
        .w-orb{width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;font-size:30px;margin-bottom:18px;box-shadow:0 0 50px rgba(99,102,241,0.4);animation:orbPulse 3s infinite;}
        @keyframes orbPulse{0%,100%{box-shadow:0 0 50px rgba(99,102,241,0.4);}50%{box-shadow:0 0 80px rgba(99,102,241,0.7);}}
        .w-title{font-family:'Syne',sans-serif;font-size:24px;font-weight:800;color:${d ? '#fff' : '#0f172a'};letter-spacing:-0.5px;margin-bottom:8px;transition:color 0.4s;}
        .w-sub{font-size:13px;color:${d ? '#475569' : '#64748b'};margin-bottom:24px;line-height:1.6;max-width:420px;transition:color 0.4s;}
        .sug-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%;max-width:540px;}
        .sug{padding:11px 14px;background:${d ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.9)'};border:1px solid ${d ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.2)'};border-radius:12px;font-size:12px;color:${d ? '#94a3b8' : '#475569'};cursor:pointer;transition:all 0.25s;font-family:'DM Sans',sans-serif;text-align:left;display:flex;align-items:center;gap:9px;}
        .sug:hover{border-color:rgba(99,102,241,0.45);color:${d ? '#c7d2fe' : '#4338ca'};background:${d ? 'rgba(99,102,241,0.07)' : 'rgba(99,102,241,0.03)'};transform:translateY(-2px);box-shadow:0 4px 14px ${d ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.07)'};}
        .sug:active{transform:scale(0.97);}
        .sug-ico{font-size:16px;flex-shrink:0;}

        /* Messages */
        .mrow{display:flex;gap:10px;animation:fadeUp 0.3s ease;align-items:flex-start;}
        .mrow.user{flex-direction:row-reverse;}
        .av{width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;}
        .av.user{background:linear-gradient(135deg,#6366f1,#8b5cf6);}
        .av.ai{background:${d ? 'rgba(15,23,42,0.8)' : 'rgba(241,245,249,0.9)'};border:1px solid ${d ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.18)'};}
        .mwrap{max-width:68%;display:flex;flex-direction:column;gap:4px;}
        .mrow.user .mwrap{align-items:flex-end;}
        .bubble{padding:12px 16px;border-radius:16px;font-size:13px;line-height:1.75;word-break:break-word;}
        .bubble.user{background:linear-gradient(135deg,#6366f1,#7c3aed);color:#fff;border-radius:16px 4px 16px 16px;box-shadow:0 4px 18px rgba(99,102,241,0.3);}
        .bubble.ai{background:${d ? 'rgba(15,23,42,0.85)' : '#fff'};border:1px solid ${d ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.15)'};color:${d ? '#cbd5e1' : '#334155'};border-radius:4px 16px 16px 16px;box-shadow:${d ? '0 4px 18px rgba(0,0,0,0.12)' : '0 4px 18px rgba(99,102,241,0.05)'};}
        .bubble.error{border-color:rgba(239,68,68,0.3);}
        .mfooter{display:flex;align-items:center;gap:7px;}
        .mtime{font-size:10px;color:${d ? '#334155' : '#94a3b8'};transition:color 0.4s;}
        .macts{display:flex;gap:5px;opacity:0;transition:opacity 0.2s;}
        .mrow:hover .macts{opacity:1;}
        .mact{padding:3px 7px;border-radius:5px;background:${d ? 'rgba(30,41,59,0.8)' : 'rgba(241,245,249,0.9)'};border:1px solid ${d ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.15)'};color:${d ? '#64748b' : '#94a3b8'};font-size:10px;cursor:pointer;transition:all 0.2s;font-family:'DM Sans',sans-serif;}
        .mact:hover{border-color:rgba(99,102,241,0.3);}

        /* Typing */
        .typing-row{display:flex;gap:10px;align-items:flex-start;animation:fadeUp 0.3s ease;}
        .typing-bub{padding:12px 16px;background:${d ? 'rgba(15,23,42,0.85)' : '#fff'};border:1px solid ${d ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.15)'};border-radius:4px 16px 16px 16px;display:flex;flex-direction:column;gap:7px;}
        .typing-status{font-size:11px;color:#818cf8;font-weight:600;display:flex;align-items:center;gap:6px;}
        .dots{display:flex;gap:4px;}
        .dot{width:7px;height:7px;border-radius:50%;animation:bounce 1.2s infinite;}
        .dot:nth-child(1){background:#6366f1;animation-delay:0s;}
        .dot:nth-child(2){background:#8b5cf6;animation-delay:0.15s;}
        .dot:nth-child(3){background:#06b6d4;animation-delay:0.3s;}
        @keyframes bounce{0%,60%,100%{transform:translateY(0);}30%{transform:translateY(-7px);}}

        /* Input */
        .iarea{padding:14px 24px 16px;background:${d ? 'rgba(2,8,23,0.92)' : 'rgba(255,255,255,0.95)'};border-top:1px solid ${d ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.12)'};backdrop-filter:blur(20px);flex-shrink:0;transition:all 0.4s;}
        .iglassrow{display:flex;gap:10px;align-items:flex-end;}
        .iglass{flex:1;background:${d ? 'rgba(15,23,42,0.8)' : 'rgba(248,250,252,0.9)'};border:1.5px solid ${d ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.2)'};border-radius:16px;padding:11px 16px;transition:all 0.25s;}
        .iglass:focus-within{border-color:rgba(99,102,241,0.45);box-shadow:0 0 0 4px rgba(99,102,241,0.08);}
        .ita{width:100%;background:none;border:none;outline:none;color:${d ? '#e2e8f0' : '#1e293b'};font-size:13px;font-family:'DM Sans',sans-serif;resize:none;max-height:100px;line-height:1.6;transition:color 0.4s;}
        .ita::placeholder{color:${d ? '#334155' : '#94a3b8'};}
        .sbtn{width:44px;height:44px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;border-radius:12px;color:#fff;font-size:16px;cursor:pointer;transition:all 0.25s;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 4px 14px rgba(99,102,241,0.35);}
        .sbtn:hover{transform:translateY(-2px) scale(1.05);box-shadow:0 6px 22px rgba(99,102,241,0.5);}
        .sbtn:disabled{opacity:0.4;cursor:not-allowed;transform:none;}
        .ihint{display:flex;justify-content:space-between;align-items:center;margin-top:7px;}
        .hint{font-size:10px;color:${d ? '#1e293b' : '#cbd5e1'};transition:color 0.4s;}
        .hstatus{font-size:10px;color:#10b981;display:flex;align-items:center;gap:4px;}
        .hdot{width:5px;height:5px;border-radius:50%;background:#10b981;animation:blink 2s infinite;}
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:0.3;}}
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>

      <div className="mesh" /><div className="grid" />
      <div className="cr">
        {/* SIDEBAR */}
        <div className="sb">
          <div className="sb-top">
            <button className="back" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
            <div className="brand"><div className="bi">🧠</div><span className="bn">KnowledgeAI</span></div>
            <div className="sb-label">Loaded Documents</div>
            {docs.length === 0
              ? <div className="no-docs">No docs loaded. <span onClick={() => navigate('/dashboard')}>Upload →</span></div>
              : docs.map(doc => (
                <div className="dp" key={doc.id}>
                  <span className="dp-ico">{icon(doc.filename)}</span>
                  <span className="dp-name">{doc.filename}</span>
                  <span className="dp-badge">{doc.filename.split('.').pop()}</span>
                </div>
              ))
            }
          </div>

          <div className="sb-stats">
            <div className="ss-t">📊 Session Statistics</div>
            {[
              { k: 'Messages sent', v: messages.filter(m => m.role === 'user').length },
              { k: 'AI responses', v: messages.filter(m => m.role === 'ai').length },
              { k: 'Docs available', v: docs.length },
              { k: 'AI Status', v: '● Online' },
              { k: 'Model', v: 'LLaMA 3.3 70B' },
              { k: 'Provider', v: 'Groq (Free)' },
            ].map(r => (
              <div className="ss-row" key={r.k}>
                <span className="ss-k">{r.k}</span>
                <span className="ss-v">{r.v}</span>
              </div>
            ))}
          </div>

          <div className="sb-model">
            <div className="sm-row"><span className="sm-k">⚡ Powered by</span><span className="sm-v">Groq LLaMA 3.3</span></div>
            <div className="sm-row"><span className="sm-k">🔒 Privacy</span><span className="sm-v">Local token only</span></div>
          </div>

          <div className="sb-bot">
            <button className="tb" onClick={toggleTheme}>{d ? '☀️' : '🌙'} {d ? 'Light Mode' : 'Dark Mode'}</button>
          </div>
        </div>

        {/* MAIN */}
        <div className="main">
          <nav className="cnav">
            <span className="ct">AI Chat</span>
            <div className="chips">
              <span className="chip chip-g">● AI Online</span>
              <span className="chip chip-b">📚 {docs.length} docs</span>
              {messages.length > 0 && <span className="chip chip-b">💬 {messages.length} msgs</span>}
            </div>
          </nav>

          <div className="cbody">
            {messages.length === 0 && (
              <div className="welcome">
                <div className="w-orb">🧠</div>
                <h2 className="w-title">Ask anything from your docs</h2>
                <p className="w-sub">I've analyzed all {docs.length} document{docs.length !== 1 ? 's' : ''}. Ask anything and I'll find the answer instantly.</p>
                <div className="sug-grid">
                  {suggestions.map(s => (
                    <button className="sug" key={s.t} onClick={() => { setQuestion(s.t); inputRef.current?.focus() }}>
                      <span className="sug-ico">{s.ico}</span>{s.t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div className={`mrow ${msg.role}`} key={i}>
                <div className={`av ${msg.role}`}>{msg.role === 'user' ? '👤' : '🤖'}</div>
                <div className="mwrap">
                  <div className={`bubble ${msg.role} ${msg.error ? 'error' : ''}`}>{msg.text}</div>
                  <div className="mfooter">
                    <span className="mtime">{fmtTime(msg.time)}</span>
                    <div className="macts">
                      <button className="mact" onClick={() => copyMsg(msg.text, i)}>{copied === i ? '✅' : '📋'} Copy</button>
                      {msg.role === 'ai' && <button className="mact" onClick={() => { const prev = messages[i - 1]; if (prev) { setQuestion(prev.text); inputRef.current?.focus() } }}>🔄 Retry</button>}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="typing-row">
                <div className="av ai">🤖</div>
                <div className="typing-bub">
                  <div className="typing-status">
                    <div className="dots"><div className="dot" /><div className="dot" /><div className="dot" /></div>
                    {loadingText}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="iarea">
            <div className="iglassrow">
              <div className="iglass">
                <textarea ref={inputRef} className="ita" placeholder="Ask a question about your documents..." value={question} rows={1}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }} />
              </div>
              <button className="sbtn" onClick={sendMessage} disabled={loading || !question.trim()}>➤</button>
            </div>
            <div className="ihint">
              <span className="hint">↵ Enter to send · ⇧ Shift+Enter for new line</span>
              <span className="hstatus"><span className="hdot" />AI Ready</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}