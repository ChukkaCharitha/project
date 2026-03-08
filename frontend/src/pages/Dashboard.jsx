import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

const API = 'https://knowledgeai-assisstent.onrender.com'

function AnimatedNumber({ value, duration = 1000 }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const steps = 30
    const increment = value / steps
    const stepTime = duration / steps
    const timer = setInterval(() => {
      start += increment
      if (start >= value) { setDisplay(value); clearInterval(timer) }
      else setDisplay(Math.floor(start))
    }, stepTime)
    return () => clearInterval(timer)
  }, [value])
  return <span>{display}</span>
}

function Particle({ style }) {
  return <div style={style} />
}

export default function Dashboard() {
  const [documents, setDocuments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [ready, setReady] = useState(false)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')
  const [selected, setSelected] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [particles] = useState(() => Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.4 + 0.1,
    color: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)]
  })))
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const d = theme === 'dark'

  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })
  const toggleTheme = () => { const t = d ? 'light' : 'dark'; setTheme(t); localStorage.setItem('theme', t) }

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return }
    fetchDocs()
  }, [])

  async function fetchDocs() {
    try {
      const res = await axios.get(`${API}/documents/`, { headers: getHeaders() })
      setDocuments(res.data)
    } catch { toast.error('Failed to load') }
    finally { setReady(true) }
  }

  async function uploadFile(file) {
    if (!file) return
    if (!file.name.match(/\.(pdf|txt)$/i)) { toast.error('Only PDF and TXT files supported'); return }
    setUploading(true); setUploadProgress(0)
    const fd = new FormData(); fd.append('file', file)
    const iv = setInterval(() => setUploadProgress(p => Math.min(p + 6, 88)), 200)
    try {
      await axios.post(`${API}/documents/upload`, fd, { headers: { ...getHeaders(), 'Content-Type': 'multipart/form-data' } })
      clearInterval(iv); setUploadProgress(100)
      setTimeout(() => { setUploading(false); setUploadProgress(0); toast.success(`✅ "${file.name}" uploaded!`); fetchDocs() }, 700)
    } catch (e) {
      clearInterval(iv); setUploading(false); setUploadProgress(0)
      toast.error(e.response?.data?.detail || 'Upload failed')
    }
  }

  async function deleteDoc(id, name) {
    if (!window.confirm(`Delete "${name}"?`)) return
    try {
      await axios.delete(`${API}/documents/${id}`, { headers: getHeaders() })
      setDocuments(prev => prev.filter(x => x.id !== id))
      if (selected?.id === id) setSelected(null)
      toast.success('🗑️ Deleted!')
    } catch { toast.error('Delete failed') }
  }

  const icon = n => n.toLowerCase().endsWith('.pdf') ? '📕' : '📄'
  const fmtDate = dt => new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const filteredDocs = documents.filter(d => d.filename.toLowerCase().includes(searchQuery.toLowerCase()))
  const pdfCount = documents.filter(x => x.filename.toLowerCase().endsWith('.pdf')).length
  const txtCount = documents.filter(x => x.filename.toLowerCase().endsWith('.txt')).length

  if (!ready) return (
    <div style={{ height: '100vh', background: d ? '#020817' : '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}} @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.5;}}`}</style>
      <div style={{ width: '52px', height: '52px', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#6366f1', fontFamily: 'sans-serif', fontSize: '14px', fontWeight: 600, animation: 'pulse 1.5s infinite' }}>Loading KnowledgeAI...</p>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        html,body{height:100%;overflow:hidden;}
        body{background:${d ? '#020817' : '#eef2ff'};transition:background 0.5s;font-family:'DM Sans',sans-serif;}

        /* Particles */
        @keyframes floatParticle{0%{transform:translateY(100vh) rotate(0deg);opacity:0;}10%{opacity:1;}90%{opacity:1;}100%{transform:translateY(-100px) rotate(720deg);opacity:0;}}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.5;}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
        @keyframes slideRight{from{opacity:0;transform:translateX(20px);}to{opacity:1;transform:translateX(0);}}
        @keyframes scaleIn{from{opacity:0;transform:scale(0.95);}to{opacity:1;transform:scale(1);}}
        @keyframes shimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}
        @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(99,102,241,0.3);}50%{box-shadow:0 0 40px rgba(99,102,241,0.7),0 0 60px rgba(139,92,246,0.4);}}
        @keyframes borderGlow{0%,100%{border-color:rgba(99,102,241,0.25);}50%{border-color:rgba(99,102,241,0.6);}}
        @keyframes countUp{from{transform:translateY(10px);opacity:0;}to{transform:translateY(0);opacity:1;}}
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:0.3;}}
        @keyframes progressShimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}

        .mesh{position:fixed;inset:0;pointer-events:none;z-index:0;
          background:${d
            ? 'radial-gradient(ellipse 80% 60% at 10% 10%,rgba(99,102,241,0.15) 0%,transparent 50%),radial-gradient(ellipse 60% 50% at 90% 90%,rgba(139,92,246,0.12) 0%,transparent 50%),radial-gradient(ellipse 40% 60% at 60% 30%,rgba(6,182,212,0.07) 0%,transparent 50%),radial-gradient(ellipse 30% 40% at 30% 80%,rgba(16,185,129,0.05) 0%,transparent 50%)'
            : 'radial-gradient(ellipse 80% 60% at 10% 10%,rgba(99,102,241,0.1) 0%,transparent 50%),radial-gradient(ellipse 60% 50% at 90% 90%,rgba(139,92,246,0.08) 0%,transparent 50%)'
          };}
        .grid-bg{position:fixed;inset:0;pointer-events:none;z-index:0;
          background-image:linear-gradient(${d ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.08)'} 1px,transparent 1px),
          linear-gradient(90deg,${d ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.08)'} 1px,transparent 1px);
          background-size:56px 56px;}

        .db{height:100vh;display:flex;flex-direction:column;color:${d ? '#e2e8f0' : '#1e293b'};position:relative;z-index:1;overflow:hidden;transition:color 0.4s;}

        /* NAV */
        .nav{height:60px;min-height:60px;flex-shrink:0;display:flex;align-items:center;justify-content:space-between;padding:0 28px;
          background:${d ? 'rgba(2,8,23,0.85)' : 'rgba(255,255,255,0.9)'};
          backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);
          border-bottom:1px solid ${d ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.15)'};
          transition:all 0.4s;animation:slideUp 0.4s ease;}
        .brand{display:flex;align-items:center;gap:10px;cursor:pointer;}
        .bi{width:36px;height:36px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;animation:glow 3s infinite;transition:transform 0.3s;}
        .bi:hover{transform:rotate(-10deg) scale(1.1);}
        .bn{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:${d ? '#fff' : '#0f172a'};letter-spacing:-0.5px;transition:color 0.4s;}
        .nav-center{display:flex;align-items:center;gap:6px;padding:6px 14px;background:${d ? 'rgba(30,41,59,0.6)' : 'rgba(241,245,249,0.9)'};border:1px solid ${d ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.2)'};border-radius:20px;font-size:12px;color:${d ? '#64748b' : '#64748b'};}
        .sdot{width:7px;height:7px;border-radius:50%;background:#10b981;box-shadow:0 0 8px rgba(16,185,129,0.7);animation:blink 2s infinite;display:inline-block;margin-right:4px;}
        .nav-right{display:flex;align-items:center;gap:8px;}
        .nb{padding:8px 18px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.25s;font-family:'DM Sans',sans-serif;letter-spacing:0.2px;}
        .nb-p{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;box-shadow:0 2px 14px rgba(99,102,241,0.4);}
        .nb-p:hover{transform:translateY(-2px);box-shadow:0 6px 24px rgba(99,102,241,0.55);}
        .nb-g{background:${d ? 'rgba(30,41,59,0.5)' : 'rgba(241,245,249,0.8)'};color:${d ? '#64748b' : '#475569'};border:1px solid ${d ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.2)'};}
        .nb-g:hover{color:${d ? '#94a3b8' : '#1e293b'};}
        .tb{width:38px;height:38px;border-radius:50%;background:${d ? 'rgba(30,41,59,0.6)' : 'rgba(241,245,249,0.9)'};border:1px solid ${d ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.2)'};cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center;transition:all 0.3s;}
        .tb:hover{transform:rotate(20deg) scale(1.1);}

        /* BODY */
        .body{flex:1;display:grid;grid-template-columns:1fr 390px;min-height:0;overflow:hidden;}

        /* LEFT */
        .left{padding:22px 26px;overflow-y:auto;overflow-x:hidden;border-right:1px solid ${d ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.12)'};display:flex;flex-direction:column;gap:18px;scrollbar-width:thin;scrollbar-color:rgba(99,102,241,0.2) transparent;}
        .left::-webkit-scrollbar{width:4px;}
        .left::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.2);border-radius:4px;}

        /* Page header */
        .ph{display:flex;align-items:flex-start;justify-content:space-between;animation:slideUp 0.4s ease 0.1s both;}
        .pt{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:${d ? '#fff' : '#0f172a'};letter-spacing:-1px;margin-bottom:4px;transition:color 0.4s;
          background:linear-gradient(135deg,${d ? '#fff' : '#0f172a'},#6366f1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .ps{font-size:13px;color:${d ? '#475569' : '#64748b'};transition:color 0.4s;}
        .hbadge{padding:6px 14px;background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.1));border:1px solid rgba(99,102,241,0.3);border-radius:20px;font-size:11px;color:#818cf8;font-weight:700;letter-spacing:0.5px;animation:borderGlow 3s infinite;}

        /* Stats */
        .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;animation:slideUp 0.4s ease 0.2s both;}
        .sc{background:${d ? 'rgba(15,23,42,0.7)' : 'rgba(255,255,255,0.9)'};border:1px solid ${d ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.15)'};border-radius:16px;padding:18px;transition:all 0.3s;cursor:default;position:relative;overflow:hidden;}
        .sc::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4);transform:scaleX(0);transition:transform 0.3s;transform-origin:left;}
        .sc:hover{border-color:rgba(99,102,241,0.35);transform:translateY(-4px);box-shadow:0 12px 40px ${d ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)'};}
        .sc:hover::before{transform:scaleX(1);}
        .sc-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
        .sc-ico{font-size:22px;}
        .sc-badge{font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;background:rgba(99,102,241,0.1);color:#818cf8;border:1px solid rgba(99,102,241,0.2);}
        .sn{font-family:'Syne',sans-serif;font-size:36px;font-weight:800;background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1;animation:countUp 0.5s ease;}
        .sl{font-size:12px;color:${d ? '#475569' : '#64748b'};margin-top:4px;font-weight:500;transition:color 0.4s;}

        /* Upload zone */
        .uz-wrap{animation:slideUp 0.4s ease 0.3s both;}
        .uz{border:2px dashed ${d ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.3)'};border-radius:18px;padding:28px;text-align:center;transition:all 0.35s;background:${d ? 'rgba(15,23,42,0.5)' : 'rgba(255,255,255,0.7)'};position:relative;cursor:pointer;overflow:hidden;}
        .uz::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(99,102,241,0.05),rgba(139,92,246,0.03));opacity:0;transition:opacity 0.3s;}
        .uz:hover,.uz.drag{border-color:rgba(99,102,241,0.6);background:${d ? 'rgba(99,102,241,0.07)' : 'rgba(99,102,241,0.03)'};}
        .uz:hover::after,.uz.drag::after{opacity:1;}
        .uz.drag{transform:scale(1.01);}
        .uz input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;}
        .u-ico{font-size:38px;display:block;margin-bottom:10px;animation:float 3s ease-in-out infinite;}
        .ut{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:${d ? '#fff' : '#0f172a'};margin-bottom:5px;transition:color 0.4s;}
        .us{font-size:12px;color:${d ? '#475569' : '#64748b'};margin-bottom:12px;transition:color 0.4s;}
        .badges{display:flex;justify-content:center;gap:8px;}
        .badge{padding:4px 14px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.25);border-radius:20px;font-size:11px;color:#818cf8;font-weight:700;letter-spacing:0.5px;transition:all 0.25s;}
        .badge:hover{background:rgba(99,102,241,0.2);}
        .prog-wrap{margin-top:14px;}
        .prog-label{display:flex;justify-content:space-between;font-size:11px;color:${d ? '#64748b' : '#94a3b8'};margin-bottom:6px;}
        .prog-bar{height:6px;background:${d ? 'rgba(30,41,59,0.8)' : 'rgba(226,232,240,0.8)'};border-radius:6px;overflow:hidden;}
        .prog-fill{height:100%;background:linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4,#6366f1);border-radius:6px;transition:width 0.3s ease;background-size:200%;animation:progressShimmer 1.5s infinite;}
        .uspin{width:32px;height:32px;border:3px solid rgba(99,102,241,0.2);border-top-color:#6366f1;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 10px;}
        .ai-proc{font-size:12px;color:#818cf8;font-weight:600;margin-top:6px;animation:pulse 1.5s infinite;}

        /* Search */
        .search-wrap{position:relative;animation:slideUp 0.4s ease 0.35s both;}
        .search-inp{width:100%;padding:11px 16px 11px 40px;background:${d ? 'rgba(15,23,42,0.7)' : 'rgba(255,255,255,0.9)'};border:1.5px solid ${d ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.18)'};border-radius:12px;color:${d ? '#e2e8f0' : '#1e293b'};font-size:13px;font-family:'DM Sans',sans-serif;outline:none;transition:all 0.25s;}
        .search-inp:focus{border-color:rgba(99,102,241,0.45);box-shadow:0 0 0 4px rgba(99,102,241,0.08);}
        .search-inp::placeholder{color:${d ? '#334155' : '#94a3b8'};}
        .search-ico{position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:14px;pointer-events:none;}

        /* Docs section */
        .sec-hd{display:flex;align-items:center;justify-content:space-between;animation:slideUp 0.4s ease 0.4s both;}
        .sec-t{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:${d ? '#e2e8f0' : '#1e293b'};transition:color 0.4s;}
        .cnt{font-size:11px;color:#818cf8;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2);padding:3px 10px;border-radius:20px;font-weight:600;}
        .doc-list{display:flex;flex-direction:column;gap:8px;}
        .dr{display:flex;align-items:center;gap:12px;padding:13px 16px;background:${d ? 'rgba(15,23,42,0.65)' : 'rgba(255,255,255,0.9)'};border:1.5px solid ${d ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.12)'};border-radius:14px;transition:all 0.25s;cursor:pointer;position:relative;overflow:hidden;}
        .dr::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(135deg,#6366f1,#8b5cf6);transform:scaleY(0);transition:transform 0.25s;transform-origin:bottom;}
        .dr:hover{border-color:rgba(99,102,241,0.35);transform:translateX(5px);background:${d ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.03)'};}
        .dr:hover::before{transform:scaleY(1);}
        .dr.active{border-color:rgba(99,102,241,0.45);background:${d ? 'rgba(99,102,241,0.09)' : 'rgba(99,102,241,0.05)'};}
        .dr.active::before{transform:scaleY(1);}
        .d-ico{font-size:20px;flex-shrink:0;}
        .d-info{flex:1;min-width:0;}
        .d-name{font-weight:600;color:${d ? '#e2e8f0' : '#1e293b'};font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px;transition:color 0.4s;}
        .d-meta{font-size:11px;color:${d ? '#334155' : '#94a3b8'};transition:color 0.4s;}
        .d-tb{font-size:9px;font-weight:800;color:#6366f1;background:rgba(99,102,241,0.1);padding:3px 8px;border-radius:5px;text-transform:uppercase;flex-shrink:0;letter-spacing:0.5px;}
        .delbtn{padding:5px 10px;background:rgba(239,68,68,0.08);color:#ef4444;border:1px solid rgba(239,68,68,0.15);border-radius:8px;font-size:11px;cursor:pointer;transition:all 0.2s;font-family:'DM Sans',sans-serif;flex-shrink:0;}
        .delbtn:hover{background:rgba(239,68,68,0.2);transform:scale(1.05);}
        .empty{text-align:center;padding:36px 16px;animation:scaleIn 0.4s ease;}
        .e-ico{font-size:44px;display:block;margin-bottom:12px;animation:float 2.5s ease-in-out infinite;}
        .e-t{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:${d ? '#e2e8f0' : '#1e293b'};margin-bottom:6px;transition:color 0.4s;}
        .e-s{font-size:12px;color:${d ? '#475569' : '#64748b'};transition:color 0.4s;}

        /* RIGHT PANEL */
        .right{display:flex;flex-direction:column;overflow:hidden;background:${d ? 'rgba(8,14,30,0.6)' : 'rgba(248,250,252,0.9)'};transition:all 0.4s;animation:slideRight 0.4s ease 0.2s both;}

        /* AI box */
        .ai-box{margin:18px 18px 0;background:linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.08));border:1px solid rgba(99,102,241,0.22);border-radius:16px;padding:18px;flex-shrink:0;position:relative;overflow:hidden;}
        .ai-box::before{content:'';position:absolute;top:-30px;right:-30px;width:80px;height:80px;background:radial-gradient(circle,rgba(99,102,241,0.15),transparent);border-radius:50%;}
        .ai-box-t{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:${d ? '#c7d2fe' : '#4338ca'};margin-bottom:7px;display:flex;align-items:center;gap:7px;transition:color 0.4s;}
        .ai-box-s{font-size:12px;color:${d ? '#64748b' : '#64748b'};line-height:1.6;margin-bottom:12px;transition:color 0.4s;}
        .ai-box-btn{width:100%;padding:11px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:11px;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.3s;font-family:'DM Sans',sans-serif;box-shadow:0 4px 14px rgba(99,102,241,0.35);letter-spacing:0.3px;}
        .ai-box-btn:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(99,102,241,0.55);}

        /* Grid fills remaining space */
        .rp-grid{flex:1;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:10px;padding:10px 18px;min-height:0;overflow:hidden;}
        .qcard{background:${d ? 'rgba(15,23,42,0.65)' : 'rgba(255,255,255,0.85)'};border:1px solid ${d ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.12)'};border-radius:14px;padding:14px;display:flex;flex-direction:column;transition:all 0.3s;overflow:hidden;min-height:0;position:relative;}
        .qcard:hover{border-color:rgba(99,102,241,0.22);box-shadow:0 4px 20px ${d ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.06)'};}
        .qcard-t{font-size:10px;font-weight:800;color:${d ? '#334155' : '#94a3b8'};text-transform:uppercase;letter-spacing:1.2px;margin-bottom:10px;transition:color 0.4s;}
        .qcard-body{flex:1;display:flex;flex-direction:column;gap:7px;overflow:hidden;}

        /* Activity */
        .act{display:flex;align-items:center;gap:8px;padding:8px 10px;background:${d ? 'rgba(15,23,42,0.5)' : 'rgba(255,255,255,0.7)'};border:1px solid ${d ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.1)'};border-radius:10px;transition:all 0.25s;flex-shrink:0;cursor:default;}
        .act:hover{border-color:rgba(99,102,241,0.2);transform:translateX(3px);}
        .act-d{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;}
        .act-t{font-size:11px;font-weight:500;color:${d ? '#94a3b8' : '#475569'};flex:1;transition:color 0.4s;}
        .act-tm{font-size:10px;color:${d ? '#334155' : '#94a3b8'};flex-shrink:0;transition:color 0.4s;}

        /* Quick actions */
        .qa-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;flex:1;}
        .qa{padding:0 8px;border-radius:10px;border:1px solid ${d ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.15)'};background:${d ? 'rgba(15,23,42,0.5)' : 'rgba(255,255,255,0.7)'};cursor:pointer;transition:all 0.25s;text-align:center;font-family:'DM Sans',sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;}
        .qa:hover{border-color:rgba(99,102,241,0.4);transform:translateY(-3px);box-shadow:0 6px 18px ${d ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)'};}
        .qa:active{transform:scale(0.97);}
        .qa-i{font-size:20px;}
        .qa-l{font-size:11px;font-weight:600;color:${d ? '#94a3b8' : '#475569'};transition:color 0.4s;}

        /* Tips */
        .tip{display:flex;gap:10px;padding:10px 12px;background:${d ? 'rgba(15,23,42,0.5)' : 'rgba(255,255,255,0.7)'};border:1px solid ${d ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.1)'};border-radius:10px;transition:all 0.25s;cursor:default;flex-shrink:0;}
        .tip:hover{border-color:rgba(99,102,241,0.25);transform:translateY(-2px);box-shadow:0 4px 14px ${d ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.06)'};}
        .tip-i{width:32px;height:32px;border-radius:9px;background:rgba(99,102,241,0.1);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;transition:all 0.3s;}
        .tip:hover .tip-i{background:rgba(99,102,241,0.2);transform:scale(1.1) rotate(-5deg);}
        .tip-t{font-size:12px;font-weight:700;color:${d ? '#c7d2fe' : '#4338ca'};margin-bottom:2px;transition:color 0.4s;}
        .tip-s{font-size:11px;color:${d ? '#475569' : '#64748b'};line-height:1.4;transition:color 0.4s;}
        .tip-a{font-size:10px;font-weight:700;color:#6366f1;cursor:pointer;margin-top:3px;display:inline-flex;align-items:center;gap:3px;transition:all 0.2s;}
        .tip-a:hover{gap:7px;color:#818cf8;}

        /* Usage */
        .usage-box{background:${d ? 'rgba(15,23,42,0.5)' : 'rgba(255,255,255,0.7)'};border:1px solid ${d ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.12)'};border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:7px;}
        .usage-row{display:flex;justify-content:space-between;align-items:center;}
        .usage-label{font-size:11px;color:${d ? '#64748b' : '#64748b'};font-weight:500;transition:color 0.4s;}
        .usage-val{font-size:11px;font-weight:700;color:#6366f1;}
        .usage-track{height:5px;background:${d ? 'rgba(30,41,59,0.8)' : 'rgba(226,232,240,0.8)'};border-radius:5px;overflow:hidden;}
        .usage-fill{height:100%;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:5px;transition:width 0.8s ease;}

        /* Footer status */
        .rp-footer{padding:10px 18px 14px;flex-shrink:0;}
        .status-bar{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:${d ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.8)'};border:1px solid ${d ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.15)'};border-radius:12px;}
        .status-left{display:flex;align-items:center;gap:6px;font-size:11px;color:${d ? '#64748b' : '#64748b'};}
        .status-right{font-size:11px;font-weight:700;color:#10b981;display:flex;align-items:center;gap:4px;}

        /* Doc detail */
        .det-wrap{display:flex;flex-direction:column;height:100%;padding:18px;gap:14px;animation:slideRight 0.3s ease;}
        .det-back{display:flex;align-items:center;gap:6px;font-size:12px;color:#6366f1;cursor:pointer;background:none;border:none;font-family:'DM Sans',sans-serif;transition:all 0.25s;padding:0;font-weight:600;}
        .det-back:hover{gap:10px;}
        .det-card{background:${d ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)'};border:1px solid rgba(99,102,241,0.18);border-radius:16px;padding:22px;text-align:center;flex-shrink:0;}
        .det-ico{font-size:48px;display:block;margin-bottom:12px;animation:float 3s ease-in-out infinite;}
        .det-name{font-family:'Syne',sans-serif;font-size:15px;font-weight:800;color:${d ? '#fff' : '#0f172a'};margin-bottom:5px;word-break:break-all;transition:color 0.4s;}
        .det-date{font-size:11px;color:${d ? '#475569' : '#64748b'};transition:color 0.4s;}
        .det-acts{display:flex;flex-direction:column;gap:9px;flex:1;justify-content:flex-end;}
        .det-btn{padding:13px;border-radius:12px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.25s;font-family:'DM Sans',sans-serif;display:flex;align-items:center;justify-content:center;gap:9px;width:100%;}
        .det-p{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;box-shadow:0 4px 16px rgba(99,102,241,0.35);}
        .det-p:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(99,102,241,0.5);}
        .det-s{background:${d ? 'rgba(30,41,59,0.6)' : 'rgba(241,245,249,0.8)'};color:${d ? '#94a3b8' : '#475569'};border:1px solid ${d ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.2)'};}
        .det-d{background:rgba(239,68,68,0.08);color:#ef4444;border:1px solid rgba(239,68,68,0.2);}
        .det-d:hover{background:rgba(239,68,68,0.18);}
      `}</style>

      {/* Background effects */}
      <div className="mesh" />
      <div className="grid-bg" />

      {/* Floating particles */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'fixed', width: p.size, height: p.size, borderRadius: '50%',
          background: p.color, left: `${p.x}%`, bottom: '-10px', opacity: 0,
          animation: `floatParticle ${p.duration}s ${p.delay}s infinite linear`,
          pointerEvents: 'none', zIndex: 0,
          boxShadow: `0 0 ${p.size * 2}px ${p.color}`
        }} />
      ))}

      <div className="db">
        {/* NAV */}
        <nav className="nav">
          <div className="brand" onClick={() => window.location.reload()}>
            <div className="bi">🧠</div>
            <span className="bn">KnowledgeAI</span>
          </div>
          <div className="nav-center">
            <span className="sdot" />
            AI Ready · {documents.length} doc{documents.length !== 1 ? 's' : ''} loaded
          </div>
          <div className="nav-right">
            <button className="tb" onClick={toggleTheme}>{d ? '☀️' : '🌙'}</button>
            <button className="nb nb-p" onClick={() => navigate('/chat')}>💬 Open Chat</button>
            <button className="nb nb-g" onClick={() => { localStorage.removeItem('token'); navigate('/login') }}>Sign Out</button>
          </div>
        </nav>

        <div className="body">
          {/* LEFT */}
          <div className="left">
            <div className="ph">
              <div>
                <h1 className="pt">Knowledge Base</h1>
                <p className="ps">Upload documents · AI answers instantly · Zero hallucinations</p>
              </div>
              <span className="hbadge">⚡ Groq LLaMA 3.3</span>
            </div>

            {/* Stats */}
            <div className="stats">
              {[
                { ico: '📁', n: documents.length, l: 'Total documents', badge: 'ALL' },
                { ico: '📕', n: pdfCount, l: 'PDF files', badge: 'PDF' },
                { ico: '📄', n: txtCount, l: 'Text files', badge: 'TXT' },
              ].map((s, i) => (
                <div className="sc" key={i}>
                  <div className="sc-top">
                    <span className="sc-ico">{s.ico}</span>
                    <span className="sc-badge">{s.badge}</span>
                  </div>
                  <div className="sn"><AnimatedNumber value={s.n} /></div>
                  <div className="sl">{s.l}</div>
                </div>
              ))}
            </div>

            {/* Upload */}
            <div className="uz-wrap">
              <div className={`uz ${dragOver ? 'drag' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); uploadFile(e.dataTransfer.files[0]) }}>
                <input ref={fileInputRef} type="file" accept=".pdf,.txt" disabled={uploading}
                  onChange={e => { if (e.target.files[0]) uploadFile(e.target.files[0]); e.target.value = '' }} />
                {uploading ? (
                  <>
                    <div className="uspin" />
                    <div className="ut">AI Processing your document...</div>
                    <div className="us">Extracting, chunking and indexing content</div>
                    <p className="ai-proc">🧠 Building knowledge vectors...</p>
                    <div className="prog-wrap">
                      <div className="prog-label"><span>Uploading & Processing</span><span>{uploadProgress}%</span></div>
                      <div className="prog-bar"><div className="prog-fill" style={{ width: `${uploadProgress}%` }} /></div>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="u-ico">☁️</span>
                    <div className="ut">{dragOver ? '🎯 Drop it here!' : 'Drop your file here'}</div>
                    <div className="us">Drag & drop or click to browse — PDF and TXT supported</div>
                    <div className="badges"><span className="badge">PDF</span><span className="badge">TXT</span></div>
                  </>
                )}
              </div>
            </div>

            {/* Search */}
            <div className="search-wrap">
              <span className="search-ico">🔍</span>
              <input className="search-inp" placeholder="Search your documents..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)} />
            </div>

            {/* Docs list */}
            <div className="sec-hd">
              <span className="sec-t">Your Documents</span>
              <span className="cnt">{filteredDocs.length} files</span>
            </div>

            {filteredDocs.length === 0 ? (
              <div className="empty">
                <span className="e-ico">{searchQuery ? '🔍' : '📂'}</span>
                <div className="e-t">{searchQuery ? 'No results found' : 'No documents yet'}</div>
                <div className="e-s">{searchQuery ? `No files match "${searchQuery}"` : 'Upload your first PDF or TXT file above!'}</div>
              </div>
            ) : (
              <div className="doc-list">
                {filteredDocs.map((doc, i) => (
                  <div className={`dr ${selected?.id === doc.id ? 'active' : ''}`} key={doc.id}
                    style={{ animationDelay: `${i * 0.05}s`, animation: 'slideUp 0.3s ease both' }}
                    onClick={() => setSelected(doc)}>
                    <span className="d-ico">{icon(doc.filename)}</span>
                    <div className="d-info">
                      <div className="d-name">{doc.filename}</div>
                      <div className="d-meta">📅 {fmtDate(doc.created_at)}</div>
                    </div>
                    <span className="d-tb">{doc.filename.split('.').pop()}</span>
                    <button className="delbtn" onClick={e => { e.stopPropagation(); deleteDoc(doc.id, doc.filename) }}>🗑</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="right">
            {selected ? (
              <div className="det-wrap">
                <button className="det-back" onClick={() => setSelected(null)}>← Back to overview</button>
                <div className="det-card">
                  <span className="det-ico">{icon(selected.filename)}</span>
                  <div className="det-name">{selected.filename}</div>
                  <div className="det-date">📅 Added {fmtDate(selected.created_at)}</div>
                </div>
                <div className="det-acts">
                  <button className="det-btn det-p" onClick={() => navigate('/chat')}>💬 Chat about this document</button>
                  <button className="det-btn det-s" onClick={() => navigate('/chat')}>🔍 Search in document</button>
                  <button className="det-btn det-d" onClick={() => deleteDoc(selected.id, selected.filename)}>🗑️ Delete document</button>
                </div>
              </div>
            ) : (
              <>
                <div className="ai-box">
                  <div className="ai-box-t">🤖 AI Assistant</div>
                  <div className="ai-box-s">Upload documents and I'll answer any question instantly using Groq LLaMA 3.3 — one of the fastest AI models.</div>
                  <button className="ai-box-btn" onClick={() => navigate('/chat')}>Start Chatting →</button>
                </div>

                <div className="rp-grid">
                  {/* Activity */}
                  <div className="qcard">
                    <div className="qcard-t">Recent Activity</div>
                    <div className="qcard-body">
                      {[
                        { ico: '🤖', t: 'AI answered questions', tm: 'Just now', c: '#6366f1' },
                        { ico: '📤', t: 'Document processed', tm: '2m ago', c: '#10b981' },
                        { ico: '🔍', t: 'KB updated', tm: '5m ago', c: '#f59e0b' },
                      ].map((a, i) => (
                        <div className="act" key={i}>
                          <div className="act-d" style={{ background: `${a.c}22` }}>{a.ico}</div>
                          <span className="act-t">{a.t}</span>
                          <span className="act-tm">{a.tm}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="qcard">
                    <div className="qcard-t">Quick Actions</div>
                    <div className="qa-grid">
                      {[
                        { i: '💬', l: 'Chat', fn: () => navigate('/chat') },
                        { i: '📤', l: 'Upload', fn: () => fileInputRef.current?.click() },
                        { i: '🔍', l: 'Search', fn: () => navigate('/chat') },
                        { i: '🔄', l: 'Refresh', fn: fetchDocs },
                      ].map(q => (
                        <button className="qa" key={q.l} onClick={q.fn}>
                          <span className="qa-i">{q.i}</span>
                          <span className="qa-l">{q.l}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="qcard">
                    <div className="qcard-t">Pro Tips</div>
                    <div className="qcard-body">
                      {[
                        { i: '🔍', t: 'Be specific', s: 'Detailed questions = better answers' },
                        { i: '📚', t: 'Multi-doc search', s: 'AI searches all docs at once' },
                      ].map((t, i) => (
                        <div className="tip" key={i}>
                          <div className="tip-i">{t.i}</div>
                          <div>
                            <div className="tip-t">{t.t}</div>
                            <div className="tip-s">{t.s}</div>
                            <span className="tip-a" onClick={() => navigate('/chat')}>Try → </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Storage + Tips */}
                  <div className="qcard">
                    <div className="qcard-t">Storage & Info</div>
                    <div className="qcard-body">
                      <div className="usage-box">
                        <div className="usage-row">
                          <span className="usage-label">Documents</span>
                          <span className="usage-val">{documents.length}/10</span>
                        </div>
                        <div className="usage-track">
                          <div className="usage-fill" style={{ width: `${Math.min((documents.length / 10) * 100, 100)}%` }} />
                        </div>
                      </div>
                      {[
                        { i: '💡', t: 'Natural language', s: 'Ask like a human!' },
                        { i: '⚡', t: 'LLaMA 3.3 70B', s: 'Ultra-fast AI model' },
                      ].map((t, i) => (
                        <div className="tip" key={i}>
                          <div className="tip-i">{t.i}</div>
                          <div>
                            <div className="tip-t">{t.t}</div>
                            <div className="tip-s">{t.s}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rp-footer">
                  <div className="status-bar">
                    <div className="status-left">
                      <span>⚡</span>
                      <span>Powered by Groq LLaMA 3.3 · Free tier</span>
                    </div>
                    <div className="status-right">
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 6px rgba(16,185,129,0.7)' }} />
                      Online
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}