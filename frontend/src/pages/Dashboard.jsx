import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

const API = 'http://127.0.0.1:8000'

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const timer = setInterval(() => {
      start += Math.ceil((value - start) / 5) || 1
      if (start >= value) { setDisplay(value); clearInterval(timer) }
      else setDisplay(start)
    }, 40)
    return () => clearInterval(timer)
  }, [value])
  return <span>{display}</span>
}

export default function Dashboard() {
  const [documents, setDocuments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [ready, setReady] = useState(false)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()
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
    if (!file.name.match(/\.(pdf|txt)$/i)) { toast.error('Only PDF and TXT'); return }
    setUploading(true); setUploadProgress(0)
    const fd = new FormData(); fd.append('file', file)
    const iv = setInterval(() => setUploadProgress(p => Math.min(p + 8, 85)), 180)
    try {
      await axios.post(`${API}/documents/upload`, fd, { headers: { ...getHeaders(), 'Content-Type': 'multipart/form-data' } })
      clearInterval(iv); setUploadProgress(100)
      setTimeout(() => { setUploading(false); setUploadProgress(0); toast.success(`Uploaded!`); fetchDocs() }, 500)
    } catch (e) { clearInterval(iv); setUploading(false); setUploadProgress(0); toast.error(e.response?.data?.detail || 'Upload failed') }
  }

  async function deleteDoc(id, name) {
    if (!window.confirm(`Delete "${name}"?`)) return
    try {
      await axios.delete(`${API}/documents/${id}`, { headers: getHeaders() })
      setDocuments(prev => prev.filter(x => x.id !== id))
      if (selected?.id === id) setSelected(null)
      toast.success('Deleted!')
    } catch { toast.error('Delete failed') }
  }

  const icon = n => n.toLowerCase().endsWith('.pdf') ? '📕' : '📄'
  const fmtDate = dt => new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  if (!ready) return (
    <div style={{ height: '100vh', background: d ? '#020817' : '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
        <p style={{ color: '#6366f1', fontFamily: 'sans-serif', fontSize: '14px', fontWeight: 600 }}>Loading KnowledgeAI...</p>
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
        .mesh{position:fixed;inset:0;pointer-events:none;
          background:${d
            ? 'radial-gradient(ellipse 70% 50% at 15% 15%,rgba(99,102,241,0.13) 0%,transparent 55%),radial-gradient(ellipse 60% 45% at 85% 85%,rgba(139,92,246,0.1) 0%,transparent 55%),radial-gradient(ellipse 40% 50% at 55% 25%,rgba(6,182,212,0.06) 0%,transparent 50%)'
            : 'radial-gradient(ellipse 70% 50% at 15% 15%,rgba(99,102,241,0.08) 0%,transparent 55%),radial-gradient(ellipse 60% 45% at 85% 85%,rgba(139,92,246,0.06) 0%,transparent 55%)'
          };}
        .grid{position:fixed;inset:0;pointer-events:none;
          background-image:linear-gradient(${d ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.06)'} 1px,transparent 1px),
          linear-gradient(90deg,${d ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.06)'} 1px,transparent 1px);
          background-size:48px 48px;}

        /* ROOT — fixed full height */
        .db{height:100vh;display:flex;flex-direction:column;font-family:'DM Sans',sans-serif;color:${d ? '#e2e8f0' : '#1e293b'};position:relative;z-index:1;overflow:hidden;}

        /* NAV — fixed height */
        .nav{height:58px;min-height:58px;flex-shrink:0;display:flex;align-items:center;justify-content:space-between;padding:0 28px;
          background:${d ? 'rgba(2,8,23,0.85)' : 'rgba(255,255,255,0.9)'};
          backdrop-filter:blur(24px);border-bottom:1px solid ${d ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.15)'};
          transition:all 0.4s;}
        .brand{display:flex;align-items:center;gap:9px;}
        .bi{width:32px;height:32px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 0 18px rgba(99,102,241,0.4);}
        .bn{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;color:${d ? '#fff' : '#0f172a'};transition:color 0.4s;}
        .nav-pill{display:flex;align-items:center;gap:6px;padding:5px 12px;background:${d ? 'rgba(30,41,59,0.6)' : 'rgba(241,245,249,0.9)'};border:1px solid ${d ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.2)'};border-radius:20px;font-size:12px;color:${d ? '#64748b' : '#64748b'};}
        .sdot{width:7px;height:7px;border-radius:50%;background:#10b981;box-shadow:0 0 8px rgba(16,185,129,0.6);animation:blink 2s infinite;}
        @keyframes blink{0%,100%{opacity:1;}50%{opacity:0.3;}}
        .nav-right{display:flex;align-items:center;gap:8px;}
        .nb{padding:7px 16px;border-radius:9px;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.25s;font-family:'DM Sans',sans-serif;}
        .nb-p{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;box-shadow:0 2px 12px rgba(99,102,241,0.35);}
        .nb-p:hover{transform:translateY(-1px);box-shadow:0 4px 20px rgba(99,102,241,0.5);}
        .nb-g{background:${d ? 'rgba(30,41,59,0.5)' : 'rgba(241,245,249,0.8)'};color:${d ? '#64748b' : '#475569'};border:1px solid ${d ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.2)'};}
        .tb{width:34px;height:34px;border-radius:50%;background:${d ? 'rgba(30,41,59,0.6)' : 'rgba(241,245,249,0.9)'};border:1px solid ${d ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.2)'};cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:all 0.3s;}
        .tb:hover{transform:rotate(20deg) scale(1.1);}

        /* BODY — fills remaining height exactly */
        .body{flex:1;display:grid;grid-template-columns:1fr 380px;min-height:0;overflow:hidden;}

        /* LEFT — scrollable internally */
        .left{padding:20px 24px;overflow-y:auto;overflow-x:hidden;border-right:1px solid ${d ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.12)'};display:flex;flex-direction:column;gap:16px;}
        .left::-webkit-scrollbar{width:4px;}
        .left::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.2);border-radius:4px;}

        .ph{display:flex;align-items:flex-start;justify-content:space-between;}
        .pt{font-family:'Syne',sans-serif;font-size:26px;font-weight:800;color:${d ? '#fff' : '#0f172a'};letter-spacing:-0.8px;margin-bottom:3px;transition:color 0.4s;}
        .ps{font-size:12px;color:${d ? '#475569' : '#64748b'};transition:color 0.4s;}
        .hbadge{padding:5px 12px;background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.1));border:1px solid rgba(99,102,241,0.25);border-radius:20px;font-size:11px;color:#818cf8;font-weight:700;}

        /* Stats row */
        .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;}
        .sc{background:${d ? 'rgba(15,23,42,0.7)' : 'rgba(255,255,255,0.9)'};border:1px solid ${d ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.15)'};border-radius:14px;padding:14px 16px;transition:all 0.3s;cursor:default;position:relative;overflow:hidden;}
        .sc::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(99,102,241,0.04),transparent);opacity:0;transition:opacity 0.3s;}
        .sc:hover{border-color:rgba(99,102,241,0.3);transform:translateY(-2px);box-shadow:0 6px 24px ${d ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.08)'};}
        .sc:hover::after{opacity:1;}
        .sc-ico{font-size:18px;margin-bottom:8px;display:block;}
        .sn{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .sl{font-size:11px;color:${d ? '#475569' : '#64748b'};margin-top:2px;font-weight:500;transition:color 0.4s;}

        /* Upload zone */
        .uz{border:2px dashed ${d ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.3)'};border-radius:16px;padding:20px;text-align:center;transition:all 0.3s;background:${d ? 'rgba(15,23,42,0.5)' : 'rgba(255,255,255,0.7)'};position:relative;cursor:pointer;overflow:hidden;}
        .uz:hover,.uz.drag{border-color:rgba(99,102,241,0.6);background:${d ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.03)'};}
        .uz.drag{transform:scale(1.01);}
        .uz input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;}
        .u-ico{font-size:32px;display:block;margin-bottom:8px;animation:floatIco 3s ease-in-out infinite;}
        @keyframes floatIco{0%,100%{transform:translateY(0);}50%{transform:translateY(-8px);}}
        .ut{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:${d ? '#fff' : '#0f172a'};margin-bottom:4px;transition:color 0.4s;}
        .us{font-size:12px;color:${d ? '#475569' : '#64748b'};margin-bottom:10px;transition:color 0.4s;}
        .badges{display:flex;justify-content:center;gap:8px;}
        .badge{padding:3px 12px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.25);border-radius:20px;font-size:11px;color:#818cf8;font-weight:700;}
        .prog-wrap{margin-top:10px;}
        .prog-row{display:flex;justify-content:space-between;font-size:11px;color:${d ? '#64748b' : '#94a3b8'};margin-bottom:4px;}
        .prog-bar{height:5px;background:${d ? 'rgba(30,41,59,0.8)' : 'rgba(226,232,240,0.8)'};border-radius:5px;overflow:hidden;}
        .prog-fill{height:100%;background:linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4);border-radius:5px;transition:width 0.3s;background-size:200%;animation:shimmer 1.5s infinite;}
        @keyframes shimmer{0%{background-position:200%;}100%{background-position:-200%;}}
        .uspin{width:28px;height:28px;border:3px solid rgba(99,102,241,0.2);border-top-color:#6366f1;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 8px;}
        @keyframes spin{to{transform:rotate(360deg);}}

        /* Docs */
        .sec-hd{display:flex;align-items:center;justify-content:space-between;}
        .sec-t{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:${d ? '#e2e8f0' : '#1e293b'};transition:color 0.4s;}
        .cnt{font-size:11px;color:#818cf8;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2);padding:2px 8px;border-radius:20px;font-weight:600;}
        .doc-list{display:flex;flex-direction:column;gap:7px;}
        .dr{display:flex;align-items:center;gap:10px;padding:11px 14px;background:${d ? 'rgba(15,23,42,0.65)' : 'rgba(255,255,255,0.9)'};border:1.5px solid ${d ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.12)'};border-radius:12px;transition:all 0.25s;cursor:pointer;}
        .dr:hover{border-color:rgba(99,102,241,0.35);transform:translateX(3px);}
        .dr.active{border-color:rgba(99,102,241,0.45);background:${d ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.04)'};}
        .d-ico{font-size:18px;flex-shrink:0;}
        .d-info{flex:1;min-width:0;}
        .d-name{font-weight:600;color:${d ? '#e2e8f0' : '#1e293b'};font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color 0.4s;}
        .d-meta{font-size:10px;color:${d ? '#334155' : '#94a3b8'};margin-top:1px;transition:color 0.4s;}
        .d-tb{font-size:9px;font-weight:700;color:#6366f1;background:rgba(99,102,241,0.1);padding:2px 6px;border-radius:4px;text-transform:uppercase;flex-shrink:0;}
        .delbtn{padding:4px 8px;background:rgba(239,68,68,0.08);color:#ef4444;border:1px solid rgba(239,68,68,0.15);border-radius:6px;font-size:10px;cursor:pointer;transition:all 0.2s;font-family:'DM Sans',sans-serif;flex-shrink:0;}
        .delbtn:hover{background:rgba(239,68,68,0.2);}
        .empty{text-align:center;padding:28px 16px;}
        .e-ico{font-size:36px;display:block;margin-bottom:10px;animation:floatIco 2s ease-in-out infinite;}
        .e-t{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:${d ? '#1e293b' : '#e2e8f0'};margin-bottom:4px;}
        .e-s{font-size:12px;color:${d ? '#1e293b' : '#94a3b8'};}

        /* RIGHT PANEL — fixed height, no scroll */
        .right{display:flex;flex-direction:column;overflow:hidden;background:${d ? 'rgba(10,16,35,0.5)' : 'rgba(248,250,252,0.85)'};transition:all 0.4s;}

        /* Right panel sections — each flex child, fills height */
        .rp-top{padding:16px 18px;flex-shrink:0;}
        .rp-mid{flex:1;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:10px;padding:0 18px;min-height:0;}
        .rp-bot{padding:10px 18px 16px;flex-shrink:0;}

        /* AI box */
        .ai-box{background:linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.08));border:1px solid rgba(99,102,241,0.22);border-radius:14px;padding:16px;}
        .ai-box-t{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:${d ? '#c7d2fe' : '#4338ca'};margin-bottom:6px;display:flex;align-items:center;gap:6px;transition:color 0.4s;}
        .ai-box-s{font-size:12px;color:${d ? '#64748b' : '#64748b'};line-height:1.5;margin-bottom:10px;transition:color 0.4s;}
        .ai-box-btn{width:100%;padding:9px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:9px;font-size:12px;font-weight:700;cursor:pointer;transition:all 0.25s;font-family:'DM Sans',sans-serif;box-shadow:0 2px 10px rgba(99,102,241,0.3);}
        .ai-box-btn:hover{transform:translateY(-1px);box-shadow:0 4px 18px rgba(99,102,241,0.45);}

        /* Panel label */
        .plabel{font-size:10px;font-weight:700;color:${d ? '#334155' : '#94a3b8'};text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px;transition:color 0.4s;}

        /* Quadrant cards — fill their grid cell */
        .qcard{background:${d ? 'rgba(15,23,42,0.65)' : 'rgba(255,255,255,0.85)'};border:1px solid ${d ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.12)'};border-radius:14px;padding:14px;display:flex;flex-direction:column;transition:all 0.3s;overflow:hidden;min-height:0;}
        .qcard:hover{border-color:rgba(99,102,241,0.25);}
        .qcard-t{font-size:10px;font-weight:700;color:${d ? '#334155' : '#94a3b8'};text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;transition:color 0.4s;}
        .qcard-body{flex:1;display:flex;flex-direction:column;gap:7px;overflow:hidden;}

        /* Activity items */
        .act{display:flex;align-items:center;gap:8px;padding:7px 9px;background:${d ? 'rgba(15,23,42,0.5)' : 'rgba(255,255,255,0.7)'};border:1px solid ${d ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.1)'};border-radius:9px;transition:all 0.2s;flex-shrink:0;}
        .act:hover{border-color:rgba(99,102,241,0.2);transform:translateX(2px);}
        .act-d{width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0;}
        .act-t{font-size:11px;font-weight:500;color:${d ? '#94a3b8' : '#475569'};flex:1;transition:color 0.4s;}
        .act-tm{font-size:10px;color:${d ? '#334155' : '#94a3b8'};flex-shrink:0;transition:color 0.4s;}

        /* Quick actions grid */
        .qa-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;flex:1;}
        .qa{padding:10px 8px;border-radius:10px;border:1px solid ${d ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.15)'};background:${d ? 'rgba(15,23,42,0.5)' : 'rgba(255,255,255,0.7)'};cursor:pointer;transition:all 0.25s;text-align:center;font-family:'DM Sans',sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;}
        .qa:hover{border-color:rgba(99,102,241,0.35);transform:translateY(-2px);box-shadow:0 4px 14px ${d ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.07)'};}
        .qa-i{font-size:18px;}
        .qa-l{font-size:11px;font-weight:600;color:${d ? '#94a3b8' : '#475569'};transition:color 0.4s;}

        /* Tips */
        .tip{display:flex;gap:10px;padding:10px 12px;background:${d ? 'rgba(15,23,42,0.5)' : 'rgba(255,255,255,0.7)'};border:1px solid ${d ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.1)'};border-radius:10px;transition:all 0.25s;cursor:default;flex-shrink:0;}
        .tip:hover{border-color:rgba(99,102,241,0.25);transform:translateY(-1px);}
        .tip-i{width:30px;height:30px;border-radius:8px;background:rgba(99,102,241,0.1);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;transition:all 0.3s;}
        .tip:hover .tip-i{background:rgba(99,102,241,0.2);}
        .tip-t{font-size:12px;font-weight:700;color:${d ? '#c7d2fe' : '#4338ca'};margin-bottom:2px;transition:color 0.4s;}
        .tip-s{font-size:11px;color:${d ? '#475569' : '#64748b'};line-height:1.4;transition:color 0.4s;}
        .tip-a{font-size:10px;font-weight:700;color:#6366f1;cursor:pointer;margin-top:2px;display:inline-flex;align-items:center;gap:3px;transition:all 0.2s;}
        .tip-a:hover{gap:6px;}

        /* Usage */
        .usage-box{background:${d ? 'rgba(15,23,42,0.65)' : 'rgba(255,255,255,0.85)'};border:1px solid ${d ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.15)'};border-radius:12px;padding:12px 16px;display:flex;flex-direction:column;gap:6px;}
        .usage-row{display:flex;justify-content:space-between;align-items:center;}
        .usage-label{font-size:11px;color:${d ? '#64748b' : '#64748b'};font-weight:500;transition:color 0.4s;}
        .usage-val{font-size:11px;font-weight:700;color:#6366f1;}
        .usage-track{height:5px;background:${d ? 'rgba(30,41,59,0.8)' : 'rgba(226,232,240,0.8)'};border-radius:5px;overflow:hidden;}
        .usage-fill{height:100%;width:${Math.min((documents.length / 10) * 100, 100)}%;background:linear-gradient(90deg,#6366f1,#8b5cf6);border-radius:5px;transition:width 0.5s ease;}

        /* Doc detail panel */
        .det-wrap{display:flex;flex-direction:column;height:100%;padding:16px 18px;gap:12px;}
        .det-back{display:flex;align-items:center;gap:6px;font-size:12px;color:#6366f1;cursor:pointer;background:none;border:none;font-family:'DM Sans',sans-serif;transition:all 0.2s;padding:0;flex-shrink:0;}
        .det-back:hover{gap:10px;}
        .det-card{background:${d ? 'rgba(99,102,241,0.07)' : 'rgba(99,102,241,0.04)'};border:1px solid rgba(99,102,241,0.15);border-radius:14px;padding:20px;text-align:center;flex-shrink:0;}
        .det-ico{font-size:44px;display:block;margin-bottom:10px;animation:floatIco 3s ease-in-out infinite;}
        .det-name{font-family:'Syne',sans-serif;font-size:15px;font-weight:800;color:${d ? '#fff' : '#0f172a'};margin-bottom:4px;word-break:break-all;transition:color 0.4s;}
        .det-date{font-size:11px;color:${d ? '#475569' : '#64748b'};transition:color 0.4s;}
        .det-acts{display:flex;flex-direction:column;gap:8px;flex:1;justify-content:flex-end;}
        .det-btn{padding:12px;border-radius:11px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.25s;font-family:'DM Sans',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px;border:none;width:100%;}
        .det-p{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;box-shadow:0 3px 14px rgba(99,102,241,0.3);}
        .det-p:hover{transform:translateY(-1px);box-shadow:0 5px 20px rgba(99,102,241,0.45);}
        .det-s{background:${d ? 'rgba(30,41,59,0.6)' : 'rgba(241,245,249,0.8)'};color:${d ? '#94a3b8' : '#475569'};border:1px solid ${d ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.2)'} !important;}
        .det-d{background:rgba(239,68,68,0.08);color:#ef4444;border:1px solid rgba(239,68,68,0.2) !important;}
        .det-d:hover{background:rgba(239,68,68,0.15);}
      `}</style>

      <div className="mesh" /><div className="grid" />
      <div className="db">
        {/* NAV */}
        <nav className="nav">
          <div className="brand"><div className="bi">🧠</div><span className="bn">KnowledgeAI</span></div>
          <div className="nav-pill"><span className="sdot" /><span>AI Ready · {documents.length} docs</span></div>
          <div className="nav-right">
            <button className="tb" onClick={toggleTheme}>{d ? '☀️' : '🌙'}</button>
            <button className="nb nb-p" onClick={() => navigate('/chat')}>💬 Open Chat</button>
            <button className="nb nb-g" onClick={() => { localStorage.removeItem('token'); navigate('/login') }}>Sign Out</button>
          </div>
        </nav>

        {/* BODY */}
        <div className="body">
          {/* LEFT */}
          <div className="left">
            <div className="ph">
              <div><h1 className="pt">Knowledge Base</h1><p className="ps">Upload docs · AI answers instantly · Zero hallucinations</p></div>
              <span className="hbadge">⚡ Groq LLaMA 3.3</span>
            </div>

            <div className="stats">
              {[
                { ico: '📁', n: documents.length, l: 'Total documents' },
                { ico: '📕', n: documents.filter(x => x.filename.toLowerCase().endsWith('.pdf')).length, l: 'PDF files' },
                { ico: '📄', n: documents.filter(x => x.filename.toLowerCase().endsWith('.txt')).length, l: 'Text files' },
              ].map((s, i) => (
                <div className="sc" key={i}>
                  <span className="sc-ico">{s.ico}</span>
                  <div className="sn"><AnimatedNumber value={s.n} /></div>
                  <div className="sl">{s.l}</div>
                </div>
              ))}
            </div>

            <div className={`uz ${dragOver ? 'drag' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); uploadFile(e.dataTransfer.files[0]) }}>
              <input type="file" accept=".pdf,.txt" disabled={uploading} onChange={e => { if (e.target.files[0]) uploadFile(e.target.files[0]); e.target.value = '' }} />
              {uploading ? (
                <><div className="uspin" /><div className="ut">AI Processing...</div><div className="us">Indexing your document</div>
                  <div className="prog-wrap"><div className="prog-row"><span>Uploading</span><span>{uploadProgress}%</span></div><div className="prog-bar"><div className="prog-fill" style={{ width: `${uploadProgress}%` }} /></div></div></>
              ) : (
                <><span className="u-ico">☁️</span><div className="ut">Drop your file here</div><div className="us">Drag & drop or click to browse</div><div className="badges"><span className="badge">PDF</span><span className="badge">TXT</span></div></>
              )}
            </div>

            <div className="sec-hd"><span className="sec-t">Your Documents</span><span className="cnt">{documents.length} files</span></div>

            {documents.length === 0 ? (
              <div className="empty"><span className="e-ico">📂</span><div className="e-t" style={{ color: d ? '#e2e8f0' : '#1e293b' }}>No documents yet</div><div className="e-s" style={{ color: d ? '#475569' : '#64748b' }}>Upload your first file above!</div></div>
            ) : (
              <div className="doc-list">
                {documents.map(doc => (
                  <div className={`dr ${selected?.id === doc.id ? 'active' : ''}`} key={doc.id} onClick={() => setSelected(doc)}>
                    <span className="d-ico">{icon(doc.filename)}</span>
                    <div className="d-info"><div className="d-name">{doc.filename}</div><div className="d-meta">📅 {fmtDate(doc.created_at)}</div></div>
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
                {/* TOP: AI box */}
                <div className="rp-top">
                  <div className="ai-box">
                    <div className="ai-box-t">🤖 AI Assistant</div>
                    <div className="ai-box-s">Upload documents and I'll answer any question from them instantly using Groq LLaMA 3.3.</div>
                    <button className="ai-box-btn" onClick={() => navigate('/chat')}>Start Chatting →</button>
                  </div>
                </div>

                {/* MID: 2x2 grid filling space */}
                <div className="rp-mid">
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
                        { i: '📤', l: 'Upload', fn: () => document.querySelector('.uz input').click() },
                        { i: '🔍', l: 'Search', fn: () => navigate('/chat') },
                        { i: '📊', l: 'Stats', fn: () => {} },
                      ].map(q => (
                        <button className="qa" key={q.l} onClick={q.fn}>
                          <span className="qa-i">{q.i}</span><span className="qa-l">{q.l}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="qcard">
                    <div className="qcard-t">Pro Tips</div>
                    <div className="qcard-body">
                      {[
                        { i: '🔍', t: 'Ask specific questions', s: 'More specific = better answers' },
                        { i: '📚', t: 'Upload multiple docs', s: 'AI searches all at once' },
                      ].map((t, i) => (
                        <div className="tip" key={i}>
                          <div className="tip-i">{t.i}</div>
                          <div><div className="tip-t">{t.t}</div><div className="tip-s">{t.s}</div><span className="tip-a" onClick={() => navigate('/chat')}>Try →</span></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Storage & More Tips */}
                  <div className="qcard">
                    <div className="qcard-t">Storage & Tips</div>
                    <div className="qcard-body">
                      <div className="usage-box">
                        <div className="usage-row"><span className="usage-label">Documents used</span><span className="usage-val">{documents.length}/10</span></div>
                        <div className="usage-track"><div className="usage-fill" /></div>
                      </div>
                      {[
                        { i: '💡', t: 'Natural language', s: 'Ask like a human!' },
                        { i: '⚡', t: 'Instant answers', s: 'LLaMA 3.3 is fast' },
                      ].map((t, i) => (
                        <div className="tip" key={i}>
                          <div className="tip-i">{t.i}</div>
                          <div><div className="tip-t">{t.t}</div><div className="tip-s">{t.s}</div></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* BOT: usage bar */}
                <div className="rp-bot">
                  <div className="usage-box">
                    <div className="usage-row"><span className="usage-label">⚡ Powered by Groq LLaMA 3.3 · Free tier active</span><span className="usage-val">● Online</span></div>
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