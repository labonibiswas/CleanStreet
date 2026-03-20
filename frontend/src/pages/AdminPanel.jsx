import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Download, Users, FileText, Clock, CheckCircle,
  AlertTriangle, TrendingUp, BarChart2, PieChart as PieIcon,
  Zap, Search, Edit2, X, Check, Activity, Filter,
  MapPin, Calendar, Shield, Eye, UserCheck, Trash2,
  ArrowUpDown, ChevronRight, Bell, Hash, Tag
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from 'recharts';

/* ── Inject global styles (font, keyframes, scrollbar) ── */
if (!document.getElementById('adm-styles')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';
  document.head.appendChild(link);
  const s = document.createElement('style');
  s.id = 'adm-styles';
  s.textContent = `
    .adm, .adm * { font-family:'Plus Jakarta Sans',sans-serif; }
    @keyframes admFU    { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes admSpin  { to{transform:rotate(360deg)} }
    @keyframes admModal { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
    @keyframes admSlide { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
    .adm-fu  { animation:admFU .35s ease both }
    .adm-fu1 { animation:admFU .35s .05s ease both }
    .adm-fu2 { animation:admFU .35s .10s ease both }
    .adm-fu3 { animation:admFU .35s .15s ease both }
    .adm-fu4 { animation:admFU .35s .20s ease both }
    .adm-fu5 { animation:admFU .35s .25s ease both }
    .adm-spin  { animation:admSpin .85s linear infinite }
    .adm-modal { animation:admModal .2s ease both }
    .adm-slide { animation:admSlide .22s ease both }
    .adm-dl-btn { background:linear-gradient(135deg,#6366F1,#8B5CF6); transition:opacity .18s,transform .15s,box-shadow .15s }
    .adm-dl-btn:hover { opacity:.9; transform:translateY(-1px); box-shadow:0 6px 20px rgba(99,102,241,.35) }
    .adm-tab-active { background:linear-gradient(135deg,#6366F1,#8B5CF6)!important; color:#fff!important; box-shadow:0 2px 12px rgba(99,102,241,.28) }
    .adm-barf { transition:width .75s cubic-bezier(.4,0,.2,1) }
    .adm-act-row:hover { background:#F8FAFF }
    .adm-row-edit { background:#F5F7FF }
    ::-webkit-scrollbar { width:4px; height:4px }
    ::-webkit-scrollbar-track { background:#F1F5F9; border-radius:99px }
    ::-webkit-scrollbar-thumb { background:#CBD5E1; border-radius:99px }
  `;
  document.head.appendChild(s);
}

const BASE     = 'http://localhost:5000/api';
const STATUS_C = ['#6366F1','#10B981','#F59E0B'];
const TYPE_C   = ['#6366F1','#EC4899','#8B5CF6','#F59E0B','#10B981','#0EA5E9'];
const ROLE_C   = ['#64748B','#10B981','#EF4444'];
const MONTHS   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/* ── Tiny reusable components ── */
const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-[10px] px-3 py-2 text-xs font-semibold shadow-lg">
      {label && <p className="text-slate-400 mb-1 text-[11px]">{label}</p>}
      {payload.map((p,i) => <p key={i} style={{color:p.fill||p.stroke||'#6366F1'}} className="m-0">{p.name||p.dataKey}: {p.value}</p>)}
    </div>
  );
};

const Empty = ({ msg='No data available.', icon }) => (
  <div className="flex flex-col items-center justify-center min-h-[110px] gap-2">
    {icon || <AlertTriangle size={20} strokeWidth={1.5} color="#CBD5E1"/>}
    <span className="text-xs font-medium text-slate-400">{msg}</span>
  </div>
);

const Card = ({ children, className='', noPad=false }) => (
  <div className={`bg-white rounded-[18px] border border-slate-100 shadow-sm transition-all duration-200 hover:shadow-[0_4px_20px_rgba(99,102,241,.08)] ${noPad?'':'p-[22px]'} ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ icon, children }) => (
  <h3 className="flex items-center gap-2 text-[13px] font-bold text-slate-700 mb-4 mt-0">
    <span className="text-indigo-500 flex">{icon}</span>{children}
  </h3>
);

const PieLegend = ({ items, colors }) => (
  <div className="flex gap-[10px] justify-center flex-wrap mt-[10px]">
    {items.map((d,i) => (
      <div key={i} className="flex items-center gap-[5px] text-[11px] font-semibold text-slate-600">
        <span className="w-[7px] h-[7px] rounded-full inline-block" style={{background:colors[i%colors.length]}}/>
        {d.name}
      </div>
    ))}
  </div>
);

const Badge = ({ status, role }) => {
  const v = (status||role||'').toLowerCase();
  const cls = {
    'pending':   'bg-amber-50 text-amber-600 border-amber-100',
    'in review': 'bg-indigo-50 text-indigo-600 border-indigo-100',
    'resolved':  'bg-emerald-50 text-emerald-600 border-emerald-100',
    'citizen':   'bg-slate-100 text-slate-500 border-slate-200',
    'volunteer': 'bg-green-50 text-green-600 border-green-100',
    'admin':     'bg-red-50 text-red-600 border-red-100',
  }[v] || 'bg-slate-100 text-slate-500 border-slate-200';
  const label = role==='citizen' ? 'User' : (status||role||'').charAt(0).toUpperCase()+(status||role||'').slice(1);
  return <span className={`${cls} text-[10px] font-bold px-[9px] py-[3px] rounded-full uppercase tracking-[.05em] inline-block border`}>{label}</span>;
};

const TableSpin = () => (
  <div className="p-14 text-center">
    <div className="adm-spin w-8 h-8 border-[3px] border-indigo-100 border-t-indigo-500 rounded-full mx-auto"/>
  </div>
);

const TH = ({ children }) => (
  <th className="px-4 py-[11px] text-left text-[10px] font-bold text-slate-400 uppercase tracking-[.06em] whitespace-nowrap bg-slate-50">{children}</th>
);
const TD = ({ children, className='' }) => (
  <td className={`px-4 py-[11px] ${className}`}>{children}</td>
);

/* ── Button & input class constants ── */
const INPUT  = 'border-[1.5px] border-slate-200 rounded-[10px] px-3 py-[7px] text-[13px] font-medium outline-none bg-white transition-all focus:border-indigo-400 focus:shadow-[0_0_0_3px_rgba(99,102,241,.1)] placeholder:text-slate-300';
const SELECT = 'border-[1.5px] border-slate-200 rounded-[10px] px-[10px] py-[7px] text-[12px] font-semibold outline-none bg-white cursor-pointer text-slate-600 focus:border-indigo-400 transition-all';
const BTN_SAVE   = 'flex items-center gap-1 px-3 py-[6px] rounded-[8px] bg-indigo-500 hover:bg-indigo-600 text-white text-[11px] font-bold border-0 cursor-pointer disabled:opacity-60 transition-colors';
const BTN_CANCEL = 'flex items-center gap-1 px-[10px] py-[6px] rounded-[8px] border border-slate-200 bg-white text-slate-500 text-[11px] font-bold cursor-pointer hover:bg-slate-50 transition-colors';

/* ── Icon-only action button ── */
const IconBtn = ({ onClick, title, color='indigo', disabled=false, children, className='' }) => {
  const cols = {
    indigo: 'text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 border-indigo-100 hover:border-indigo-200',
    green:  'text-green-500  hover:text-green-700  hover:bg-green-50  border-green-100  hover:border-green-200',
    red:    'text-red-400    hover:text-red-600    hover:bg-red-50    border-red-100    hover:border-red-200',
    amber:  'text-amber-500  hover:text-amber-700  hover:bg-amber-50  border-amber-100  hover:border-amber-200',
    sky:    'text-sky-400    hover:text-sky-600    hover:bg-sky-50    border-sky-100    hover:border-sky-200',
  }[color];
  return (
    <button
      onClick={onClick} title={title} disabled={disabled}
      className={`w-[30px] h-[30px] flex items-center justify-center rounded-[8px] border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${cols} ${className}`}
    >
      {children}
    </button>
  );
};

/* ── Confirm/Warn Modal ── */
const ConfirmModal = ({ title, message, onConfirm, onCancel, loading=false, confirmLabel='Delete', danger=true }) => (
  <div className="fixed inset-0 z-[1100] flex items-center justify-center p-5" onClick={onCancel}>
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[3px]"/>
    <div className="adm-modal relative bg-white rounded-[20px] p-7 w-full max-w-[390px] shadow-2xl" onClick={e=>e.stopPropagation()}>
      <div className={`w-11 h-11 rounded-[14px] ${danger?'bg-red-50':'bg-amber-50'} flex items-center justify-center mb-4`}>
        <AlertTriangle size={20} className={danger?'text-red-500':'text-amber-500'}/>
      </div>
      <h3 className="text-[15px] font-extrabold text-slate-800 m-0 mb-2">{title}</h3>
      <p className="text-[13px] text-slate-500 m-0 mb-6 leading-[1.65]">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-[10px] rounded-[11px] border border-slate-200 bg-white text-slate-600 text-[13px] font-bold cursor-pointer hover:bg-slate-50 transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading}
          className={`flex-1 py-[10px] rounded-[11px] border-0 text-white text-[13px] font-bold cursor-pointer disabled:opacity-60 transition-colors flex items-center justify-center gap-2 ${danger?'bg-red-500 hover:bg-red-600':'bg-amber-500 hover:bg-amber-600'}`}>
          {loading ? <div className="adm-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"/> : confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

/* ════════════════════════════════════════════════════════════════ */
export default function AdminPanel() {
  const location = useLocation();
  const [tab, setTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    const urlTab = params.get("tab");
    return urlTab ? urlTab : 'Overview';
  });
  const [loading, setLd]    = useState(true);
  const [error, setErr]     = useState(null);
  const [showDl, setShowDl] = useState(false);
  const [dlLd, setDlLd]     = useState(null);

  const [stats, setStats]     = useState(null);
  const [roles, setRoles]     = useState(null);
  const [types, setTypes]     = useState([]);
  const [days7, setDays7]     = useState([]);
  const [reg30, setReg30]     = useState([]);
  const [monthly, setMonthly] = useState([]);

  /* users */
  const [users, setUsers]       = useState([]);
  const [usersLd, setUsersLd]   = useState(false);
  const [editId, setEditId]     = useState(null);
  const [editRole, setEditRole] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [uSearch, setUSearch]   = useState('');
  const [uRoleF, setURoleF]     = useState('All');
  const [delUser, setDelUser]   = useState(null);
  const [delUserLd, setDelUserLd] = useState(false);
  const [demoteWarning, setDemoteWarning]         = useState(null); // volunteer → user (has active complaints)
  const [demoteLd, setDemoteLd]                   = useState(false);
  const [upgradeWarning, setUpgradeWarning]       = useState(null); // user → volunteer
  const [upgradeLd, setUpgradeLd]                 = useState(false);
  const [promoteWarning, setPromoteWarning]       = useState(null); // any → admin
  const [promoteLd, setPromoteLd]                 = useState(false);
  const [adminDemoteWarning, setAdminDemoteWarning] = useState(null); // admin → lower role
  const [adminDemoteLd, setAdminDemoteLd]         = useState(false);

  /* complaints */
  const [comps, setComps]         = useState([]);
  const [compsLd, setCompsLd]     = useState(false);
  const [cSearch, setCSearch]     = useState('');
  const [cStatus, setCStatus]     = useState('All');
  const [cType, setCType]         = useState('All');
  const [expandedComp, setExpComp] = useState(null); // row expanded for editing
  const [editStatusVal, setEditStatusVal] = useState('');
  const [savingStatus, setSavingStatus]   = useState(null);
  const [delComp, setDelComp]     = useState(null);
  const [delCompLd, setDelCompLd] = useState(false);

  /* assign */
  const [assignModal, setAssignModal] = useState(null);
  const [volunteers, setVolunteers]   = useState([]);
  const [volLd, setVolLd]             = useState(false);
  const [assigningId, setAssigningId] = useState(null);

  /* activities */
  const [acts, setActs]       = useState([]);
  const [actsLd, setActsLd]   = useState(false);
  const [actFilter, setActFilter] = useState('All'); 
  const [actTypeF, setActTypeF]   = useState('All'); 
  const [actSearch, setActSearch] = useState('');

  const token = localStorage.getItem('token');
  const H = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    (async () => {
      try {
        setLd(true);
        const { data } = await axios.get(`${BASE}/admin/dashboard`, { headers: H });
        setStats(data.stats); setRoles(data.userRoles);
        setTypes(data.complaintTypes||[]); setDays7(data.last7Days||[]);
        setReg30(data.userRegistrations||[]); setMonthly(data.monthlyTrends||[]);
      } catch { setErr('Failed to load dashboard data.'); }
      finally { setLd(false); }
    })();
  }, []);

  useEffect(() => {
    if (tab !== 'Manage Users') return;
    (async () => {
      try { setUsersLd(true); const {data}=await axios.get(`${BASE}/admin/users`,{headers:H}); setUsers(data); }
      catch { setUsers([]); } finally { setUsersLd(false); }
    })();
  }, [tab]);

  const loadComplaints = useCallback(async () => {
    try { setCompsLd(true); const {data}=await axios.get(`${BASE}/admin/complaints`,{headers:H}); setComps(data); }
    catch { setComps([]); } finally { setCompsLd(false); }
  }, []);

  useEffect(() => { if (tab==='View Complaints') loadComplaints(); }, [tab]);

  useEffect(() => {
    if (tab !== 'Recent Activities') return;
    (async () => {
      try { setActsLd(true); const {data}=await axios.get(`${BASE}/admin/activities`,{headers:H}); setActs(data); }
      catch { setActs([]); } finally { setActsLd(false); }
    })();
  }, [tab]);

  /* ── Role save with checks ── */
  const initSaveRole = async (uid) => {
    const user = users.find(u => u._id===uid);
    if (!user) return;
    const prev = user.role;
    const next = editRole;
    if (prev === next) { setEditId(null); return; } // no change

    // ── Admin → lower role (demoting an admin) ──────────────────
    if (prev === 'admin') {
      setAdminDemoteWarning({ userId:uid, userName:user.fullName, toRole:next });
      return;
    }

    // ── Any → Admin (promoting to admin) ────────────────────────
    if (next === 'admin') {
      setPromoteWarning({ userId:uid, userName:user.fullName, fromRole:prev });
      return;
    }

    // ── Volunteer → User (demotion, may reset complaints) ───────
    if (prev === 'volunteer' && next === 'citizen') {
      try {
        const {data} = await axios.get(`${BASE}/admin/users/${uid}/volunteer-check`, {headers:H});
        if (data.activeCount > 0) {
          setDemoteWarning({ userId:uid, userName:user.fullName, resetCount:data.activeCount });
          return;
        }
      } catch { /* proceed silently */ }
      // no active complaints — still warn before demoting
      setDemoteWarning({ userId:uid, userName:user.fullName, resetCount:0 });
      return;
    }

    // ── User → Volunteer (upgrade) ───────────────────────────────
    if (prev === 'citizen' && next === 'volunteer') {
      setUpgradeWarning({ userId:uid, userName:user.fullName });
      return;
    }

    await doSaveRole(uid);
  };

  const doSaveRole = async (uid) => {
    const clearAll = () => {
      setDemoteWarning(null); setUpgradeWarning(null);
      setPromoteWarning(null); setAdminDemoteWarning(null);
      setEditId(null);
    };
    try {
      setSavingId(uid);
      setDemoteLd(true); setUpgradeLd(true); setPromoteLd(true); setAdminDemoteLd(true);
      const {data} = await axios.patch(`${BASE}/admin/users/${uid}/role`, {role:editRole}, {headers:H});
      const updated = data.user || data;
      setUsers(prev => prev.map(u => u._id===uid ? updated : u));
      clearAll();
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to update role.');
    } finally {
      setSavingId(null);
      setDemoteLd(false); setUpgradeLd(false); setPromoteLd(false); setAdminDemoteLd(false);
    }
  };

  /* ── Complaint status save ── */
  const saveStatus = async (cid) => {
    try {
      setSavingStatus(cid);
      const {data} = await axios.patch(`${BASE}/admin/complaints/${cid}/status`, {status:editStatusVal}, {headers:H});
      setComps(prev => prev.map(c => c._id===cid ? data : c));
      setExpComp(null);
    } catch { alert('Failed to update status.'); }
    finally { setSavingStatus(null); }
  };

  /* ── Delete user ── */
  const confirmDeleteUser = async () => {
    if (!delUser) return;
    try {
      setDelUserLd(true);
      await axios.delete(`${BASE}/admin/users/${delUser._id}`, {headers:H});
      setUsers(prev => prev.filter(u => u._id!==delUser._id));
      setDelUser(null);
    } catch (e) { alert(e?.response?.data?.message || 'Failed to delete user.'); }
    finally { setDelUserLd(false); }
  };

  /* ── Delete complaint ── */
  const confirmDeleteComp = async () => {
    if (!delComp) return;
    try {
      setDelCompLd(true);
      await axios.delete(`${BASE}/admin/complaints/${delComp._id}`, {headers:H});
      setComps(prev => prev.filter(c => c._id!==delComp._id));
      setDelComp(null);
    } catch (e) { alert(e?.response?.data?.message || 'Failed to delete complaint.'); }
    finally { setDelCompLd(false); }
  };

  /* ── Assign volunteer ── */
  const openAssign = async (complaint) => {
    setAssignModal(complaint); setVolunteers([]);
    try {
      setVolLd(true);
      const {data} = await axios.get(`${BASE}/admin/complaints/${complaint._id}/nearby-volunteers`, {headers:H});
      setVolunteers(data);
    } catch { setVolunteers([]); }
    finally { setVolLd(false); }
  };

  const doAssign = async (volunteerId) => {
    if (!assignModal) return;
    try {
      setAssigningId(volunteerId);
      const {data} = await axios.patch(`${BASE}/admin/complaints/${assignModal._id}/assign`, {volunteerId}, {headers:H});
      setComps(prev => prev.map(c => c._id===assignModal._id ? data : c));
      setAssignModal(null);
    } catch { alert('Failed to assign volunteer.'); }
    finally { setAssigningId(null); }
  };

  /* ── Downloads ── */
  const downloadCSV = async () => {
    try {
      setDlLd('csv');
      const {data} = await axios.get(`${BASE}/admin/report/csv`, {headers:H,responseType:'blob'});
      const url=URL.createObjectURL(new Blob([data])); const a=document.createElement('a');
      a.href=url; a.download=`clean-street-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click(); URL.revokeObjectURL(url); setShowDl(false);
    } catch { alert('Failed to download Excel.'); } finally { setDlLd(null); }
  };
  const downloadPDF = async () => {
    try {
      setDlLd('pdf');
      const {data} = await axios.get(`${BASE}/admin/report/pdf`, {headers:H,responseType:'blob'});
      const url=URL.createObjectURL(new Blob([data],{type:'application/pdf'})); const a=document.createElement('a');
      a.href=url; a.download=`clean-street-report-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click(); URL.revokeObjectURL(url); setShowDl(false);
    } catch { alert('Failed to download PDF.'); } finally { setDlLd(null); }
  };

  /* ── Derived ── */
  const statusPie    = [{name:'Pending',value:stats?.pendingComplaints||0},{name:'Resolved',value:stats?.resolvedComplaints||0},{name:'In Review',value:stats?.inReviewComplaints||0}];
  const typePie      = types.slice(0,4).map(t=>({name:t._id||'Other',value:t.count}));
  const rolePie      = roles?[{name:'Citizens',value:roles.citizens||0},{name:'Volunteers',value:roles.volunteers||0},{name:'Admins',value:roles.admins||0}]:[];
  const monthlyChart = monthly.map(m=>({month:MONTHS[(m._id??1)-1],count:m.count}));
  const top5         = [...types].sort((a,b)=>b.count-a.count).slice(0,5);
  const maxT         = top5[0]?.count||1;

  const filtUsers = users.filter(u => {
    const ms=!uSearch||u.fullName?.toLowerCase().includes(uSearch.toLowerCase())||u.email?.toLowerCase().includes(uSearch.toLowerCase());
    return ms&&(uRoleF==='All'||u.role===uRoleF);
  });
  const filtComps = comps.filter(c => {
    const ms=!cSearch||c.title?.toLowerCase().includes(cSearch.toLowerCase());
    return ms&&(cStatus==='All'||c.status===cStatus)&&(cType==='All'||c.issueType?.toLowerCase()===cType.toLowerCase());
  });

  /* ── Activity classification ── */
  const ACT_META = {
    status_change:    { icon:<Shield size={13}/>,      bg:'bg-indigo-50',  color:'text-indigo-500',  label:'Status Change',    group:'Admin' },
    role_change:      { icon:<ArrowUpDown size={13}/>, bg:'bg-violet-50',  color:'text-violet-500',  label:'Role Changed',     group:'Admin' },
    complaint_delete: { icon:<Trash2 size={13}/>,      bg:'bg-red-50',     color:'text-red-500',     label:'Complaint Deleted',group:'Admin' },
    assigned:         { icon:<UserCheck size={13}/>,   bg:'bg-cyan-50',    color:'text-cyan-600',    label:'Assignment',       group:'Volunteer' },
    new_complaint:    { icon:<FileText size={13}/>,    bg:'bg-green-50',   color:'text-green-600',   label:'New Complaint',    group:'User' },
    complaint_update: { icon:<Edit2 size={13}/>,       bg:'bg-amber-50',   color:'text-amber-600',   label:'Complaint Edited', group:'User' },
    new_user:         { icon:<Users size={13}/>,       bg:'bg-sky-50',     color:'text-sky-500',     label:'New Registration', group:'User' },
    profile_update:   { icon:<UserCheck size={13}/>,   bg:'bg-teal-50',    color:'text-teal-600',    label:'Profile Updated',  group:'User' },
  };

  const filtActs = acts.filter(a => {
    const meta = ACT_META[a.type] || {};
    const groupMatch = actFilter==='All' || meta.group===actFilter;
    const typeMatch  = actTypeF==='All'  || a.type===actTypeF;
    const searchMatch = !actSearch ||
      a.userName?.toLowerCase().includes(actSearch.toLowerCase()) ||
      a.description?.toLowerCase().includes(actSearch.toLowerCase()) ||
      a.issueTitle?.toLowerCase().includes(actSearch.toLowerCase());
    return groupMatch && typeMatch && searchMatch;
  });

  const adminActs     = filtActs.filter(a => ACT_META[a.type]?.group==='Admin');
  const volunteerActs = filtActs.filter(a => ACT_META[a.type]?.group==='Volunteer');
  const userActs      = filtActs.filter(a => ACT_META[a.type]?.group==='User');

  const TABS = [
    {key:'Overview',         label:'Overview',          count:null},
    {key:'Manage Users',     label:'Manage Users',      count:stats?.totalUsers??null},
    {key:'View Complaints',  label:'View Complaints',   count:stats?.totalComplaints??null},
    {key:'Recent Activities',label:'Recent Activities', count:null},
  ];

  /* ── Loading / Error ── */
  if (loading) return (
    <div className="adm min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="adm-spin w-10 h-10 border-[3px] border-indigo-100 border-t-indigo-500 rounded-full mx-auto mb-3"/>
        <p className="text-slate-400 font-semibold text-sm m-0">Loading dashboard…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="adm min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white rounded-[22px] p-10 border border-red-100 text-center max-w-[320px]">
        <AlertTriangle size={30} className="text-red-400 mx-auto mb-3"/>
        <p className="font-bold text-slate-800 mb-1">Something went wrong</p>
        <p className="text-[13px] text-slate-400 m-0">{error}</p>
      </div>
    </div>
  );

  /* ══════════════ OVERVIEW ══════════════ */
  const statCards = [
    {label:'Total Users',       value:stats?.totalUsers,       bg:'bg-violet-50',  ic:'text-violet-600', icon:<Users size={17}/>},
    {label:'Total Complaints',  value:stats?.totalComplaints,  bg:'bg-sky-50',     ic:'text-sky-600',    icon:<FileText size={17}/>},
    {label:'Pending',           value:stats?.pendingComplaints,bg:'bg-amber-50',   ic:'text-amber-600',  icon:<Clock size={17}/>},
    {label:'Resolved',          value:stats?.resolvedComplaints,bg:'bg-emerald-50',ic:'text-emerald-600',icon:<CheckCircle size={17}/>},
  ];

  const Overview = (
    <div className="flex flex-col gap-5">
      <div className="grid gap-[14px]" style={{gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))'}}>
        {statCards.map((s,i) => (
          <div key={i} className={`adm-fu${i+1} bg-white rounded-[18px] p-5 border border-slate-100 shadow-sm hover:shadow-[0_4px_18px_rgba(99,102,241,.08)] hover:-translate-y-px transition-all duration-200`}>
            <div className="flex items-center gap-[14px]">
              <div className={`w-[42px] h-[42px] rounded-[12px] ${s.bg} ${s.ic} flex items-center justify-center shrink-0`}>{s.icon}</div>
              <div>
                <p className="text-[28px] font-extrabold text-slate-800 leading-none m-0">{s.value??'—'}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[.07em] mt-1 mb-0">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="adm-fu2 flex items-center gap-[10px]">
        <div className="w-7 h-7 rounded-[9px] bg-indigo-50 flex items-center justify-center"><BarChart2 size={14} color="#6366F1"/></div>
        <div>
          <h2 className="text-[15px] font-extrabold text-slate-800 m-0">Analytics</h2>
          <p className="text-xs text-slate-400 m-0 font-medium">Visual breakdown of complaints and users</p>
        </div>
      </div>

      <div className="grid gap-[14px]" style={{gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))'}}>
        {[
          {title:'Complaint Status',   icon:<Clock size={13}/>,   data:statusPie,colors:STATUS_C,donut:true},
          {title:'Complaint Types',    icon:<PieIcon size={13}/>, data:typePie,  colors:TYPE_C,  donut:false},
          {title:'User Roles',         icon:<Users size={13}/>,   data:rolePie,  colors:ROLE_C,  donut:true},
        ].map((pc,i) => (
          <Card key={i} className={`adm-fu${i+3}`}>
            <CardTitle icon={pc.icon}>{pc.title}</CardTitle>
            {pc.data.every(d=>d.value===0)||pc.data.length===0 ? <Empty msg="No data yet."/> : (
              <>
                <div className="w-full h-[180px]"><ResponsiveContainer><PieChart>
                  <Pie data={pc.data} dataKey="value" outerRadius={72} innerRadius={pc.donut?34:0} paddingAngle={3}>
                    {pc.data.map((_,j)=><Cell key={j} fill={pc.colors[j%pc.colors.length]}/>)}
                  </Pie><Tooltip content={<Tip/>}/>
                </PieChart></ResponsiveContainer></div>
                <PieLegend items={pc.data} colors={pc.colors}/>
              </>
            )}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-[14px]">
        <Card className="adm-fu4">
          <CardTitle icon={<TrendingUp size={13}/>}>Complaints — Last 7 Days</CardTitle>
          {days7.length===0 ? <Empty msg="No complaints in the last 7 days."/> : (
            <div className="w-full h-[200px]"><ResponsiveContainer>
              <BarChart data={days7} barSize={22}>
                <defs><linearGradient id="g7" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366F1"/><stop offset="100%" stopColor="#8B5CF6"/></linearGradient></defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false}/>
                <XAxis dataKey="_id" tick={{fontSize:10,fill:'#94A3B8',fontWeight:600}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:'#94A3B8',fontWeight:600}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip content={<Tip/>}/>
                <Bar dataKey="count" name="Complaints" fill="url(#g7)" radius={[6,6,0,0]}/>
              </BarChart>
            </ResponsiveContainer></div>
          )}
        </Card>
        <Card className="adm-fu4">
          <CardTitle icon={<TrendingUp size={13}/>}>Registrations — Last 30 Days</CardTitle>
          {reg30.length===0 ? <Empty msg="No new registrations."/> : (
            <div className="w-full h-[200px]"><ResponsiveContainer>
              <LineChart data={reg30}>
                <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false}/>
                <XAxis dataKey="_id" tick={{fontSize:10,fill:'#94A3B8',fontWeight:600}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:'#94A3B8',fontWeight:600}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip content={<Tip/>}/>
                <Line type="monotone" dataKey="count" name="Registrations" stroke="#10B981" strokeWidth={2.5} dot={{r:4,fill:'#10B981',strokeWidth:0}}/>
              </LineChart>
            </ResponsiveContainer></div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-[14px]">
        <Card className="adm-fu5">
          <CardTitle icon={<BarChart2 size={13}/>}>Monthly Complaint Trends</CardTitle>
          {monthlyChart.length===0 ? <Empty msg="No monthly data yet."/> : (
            <div className="w-full h-[200px]"><ResponsiveContainer>
              <BarChart data={monthlyChart} barSize={28}>
                <defs><linearGradient id="gmo" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8B5CF6"/><stop offset="100%" stopColor="#6366F1"/></linearGradient></defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false}/>
                <XAxis dataKey="month" tick={{fontSize:10,fill:'#94A3B8',fontWeight:600}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:'#94A3B8',fontWeight:600}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip content={<Tip/>}/>
                <Bar dataKey="count" name="Complaints" fill="url(#gmo)" radius={[6,6,0,0]}/>
              </BarChart>
            </ResponsiveContainer></div>
          )}
        </Card>
        <Card className="adm-fu5">
          <CardTitle icon={<Zap size={13}/>}>Top 5 Complaint Types</CardTitle>
          {top5.length===0 ? <Empty msg="No complaint data."/> : (
            <div className="flex flex-col gap-[14px] pt-1">
              {top5.map((item,i)=>{
                const pct=Math.round((item.count/maxT)*100);
                const col=TYPE_C[i%TYPE_C.length];
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-semibold mb-[6px]">
                      <span className="text-slate-700 capitalize">{item._id||'Unknown'}</span>
                      <span className="text-[11px] font-bold px-2 py-[1px] rounded-full" style={{background:col+'20',color:col}}>{item.count}</span>
                    </div>
                    <div className="w-full h-[8px] bg-slate-100 rounded-full overflow-hidden">
                      <div className="adm-barf h-full rounded-full" style={{width:`${pct}%`,background:`linear-gradient(90deg,${col},${col}99)`}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );

  /* ══════════════ MANAGE USERS ══════════════ */
  const ManageUsers = (
    <div className="adm-fu flex flex-col gap-4">
      <div className="flex gap-[10px] flex-wrap items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-800 m-0">User Management</h2>
          <p className="text-xs text-slate-400 mt-[3px] mb-0 font-medium">{filtUsers.length} of {users.length} users shown</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search size={13} className="absolute left-[10px] top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
            <input className={`${INPUT} pl-[30px] w-[200px]`} value={uSearch} onChange={e=>setUSearch(e.target.value)} placeholder="Search users…"/>
          </div>
          <select className={SELECT} value={uRoleF} onChange={e=>setURoleF(e.target.value)}>
            <option value="All">All Roles</option>
            <option value="citizen">Users</option>
            <option value="volunteer">Volunteers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      <Card noPad className="overflow-hidden">
        {usersLd ? <TableSpin/> : filtUsers.length===0 ? <div className="p-12"><Empty msg="No users found."/></div> : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  {['#','User','Email','Role','Joined','Actions'].map(h=><TH key={h}>{h}</TH>)}
                </tr>
              </thead>
              <tbody>
                {filtUsers.map((u,idx)=>{
                  const isEdit  = editId===u._id;
                  const isAdmin = u.role==='admin';
                  const avatarColors = ['from-indigo-500 to-violet-500','from-sky-500 to-blue-500','from-pink-500 to-rose-500','from-emerald-500 to-green-500','from-amber-500 to-orange-500'];
                  const grad = avatarColors[idx%avatarColors.length];
                  return (
                    <tr key={u._id} className={`border-b border-slate-50 transition-colors ${isEdit?'adm-row-edit':'hover:bg-slate-50/70'}`}>
                      <TD><span className="text-[11px] font-bold text-slate-300">#{idx+1}</span></TD>
                      <TD>
                        <div className="flex items-center gap-[10px]">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white text-[11px] font-bold shrink-0`}>
                            {(u.fullName||u.username||'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-slate-800 m-0">{u.fullName||'—'}</p>
                            <p className="text-[11px] text-slate-400 m-0">@{u.username||'—'}</p>
                          </div>
                        </div>
                      </TD>
                      <TD><span className="text-[12px] text-slate-500 font-medium">{u.email}</span></TD>
                      <TD>
                        {isEdit ? (
                          <select className={`${SELECT} text-[11px] py-[5px]`} value={editRole} onChange={e=>setEditRole(e.target.value)}>
                            <option value="citizen">User</option>
                            <option value="volunteer">Volunteer</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : <Badge role={u.role}/>}
                      </TD>
                      <TD>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—'}
                        </span>
                      </TD>
                      <TD>
                        <div className="flex items-center gap-[5px]">
                          {isEdit ? (
                            <>
                              <button className={BTN_SAVE} onClick={()=>initSaveRole(u._id)} disabled={savingId===u._id}>
                                {savingId===u._id ? <div className="adm-spin w-[10px] h-[10px] border-2 border-white/30 border-t-white rounded-full"/> : <><Check size={11}/>Save</>}
                              </button>
                              <button className={BTN_CANCEL} onClick={()=>setEditId(null)}><X size={11}/></button>
                            </>
                          ) : (
                            <>
                              <IconBtn onClick={()=>{setEditId(u._id);setEditRole(u.role);}} title="Edit Role" color="indigo"><Edit2 size={13}/></IconBtn>
                              {!isAdmin && <IconBtn onClick={()=>setDelUser(u)} title="Delete User" color="red"><Trash2 size={13}/></IconBtn>}
                            </>
                          )}
                        </div>
                      </TD>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );

  /* ══════════════ VIEW COMPLAINTS ══════════════ */
  const ViewComplaints = (
    <div className="adm-fu flex flex-col gap-4">
      {/* ── Header + filters ── */}
      <div className="flex gap-[10px] flex-wrap items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-800 m-0">All Complaints</h2>
          <p className="text-xs text-slate-400 mt-[3px] mb-0 font-medium">{filtComps.length} of {comps.length} complaints shown</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search size={13} className="absolute left-[10px] top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
            <input className={`${INPUT} pl-[30px] w-[210px]`} value={cSearch} onChange={e=>setCSearch(e.target.value)} placeholder="Search complaints…"/>
          </div>
          <select className={SELECT} value={cStatus} onChange={e=>setCStatus(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Review">In Review</option>
            <option value="Resolved">Resolved</option>
          </select>
          <select className={SELECT} value={cType} onChange={e=>setCType(e.target.value)}>
            <option value="All">All Types</option>
            {[...new Set(comps.map(c=>c.issueType).filter(Boolean))].map(t=>(
              <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <Card noPad className="overflow-hidden">
        {compsLd ? <TableSpin/> : filtComps.length===0 ? <div className="p-12"><Empty msg="No complaints found."/></div> : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  {['#','Title & Address','Reported By','Type','Status','Assigned To','Progress','Date','Actions'].map(h=><TH key={h}>{h}</TH>)}
                </tr>
              </thead>
              <tbody>
                {filtComps.map((c,idx) => {
                  const isEdit = expandedComp===c._id;
                  return (
                    <tr key={c._id} className={`border-b border-slate-50 transition-colors ${isEdit ? 'bg-indigo-50/40' : 'hover:bg-slate-50/70'}`}>

                      {/* # */}
                      <TD><span className="text-[11px] font-bold text-slate-300">#{idx+1}</span></TD>

                      {/* Title + address */}
                      <TD>
                        <p className="text-[13px] font-bold text-slate-800 m-0 max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap">{c.title}</p>
                        {c.address && (
                          <p className="text-[10px] text-slate-400 m-0 mt-[2px] flex items-center gap-[3px] max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap">
                            <MapPin size={9}/>{c.address}
                          </p>
                        )}
                      </TD>

                      {/* Reported by */}
                      <TD><span className="text-[12px] text-slate-600 font-medium">{c.reportedBy?.fullName||<span className="text-slate-300 italic">Unknown</span>}</span></TD>

                      {/* Type */}
                      <TD><span className="text-[11px] text-slate-500 font-medium capitalize">{c.issueType||'—'}</span></TD>

                      {/* Status — dropdown in edit mode, badge otherwise */}
                      <TD>
                        {isEdit ? (
                          <div className="flex items-center gap-[6px]">
                            <select
                              className={`${SELECT} text-[11px] py-[5px] min-w-[100px]`}
                              value={editStatusVal}
                              onChange={e => setEditStatusVal(e.target.value)}
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Review">In Review</option>
                              <option value="Resolved">Resolved</option>
                            </select>
                            <button className={BTN_SAVE} onClick={()=>saveStatus(c._id)} disabled={savingStatus===c._id}>
                              {savingStatus===c._id
                                ? <div className="adm-spin w-[9px] h-[9px] border-2 border-white/30 border-t-white rounded-full"/>
                                : <Check size={11}/>}
                            </button>
                          </div>
                        ) : <Badge status={c.status}/>}
                      </TD>

                      {/* Assigned To — show name or assign button in edit mode */}
                      <TD>
                        {isEdit ? (
                          c.assignedTo ? (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-100 px-2 py-[4px] rounded-lg whitespace-nowrap">
                              <UserCheck size={11}/>{c.assignedTo.fullName}
                            </span>
                          ) : (
                            <button
                              onClick={()=>openAssign(c)}
                              className="flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-[5px] rounded-[8px] cursor-pointer hover:bg-green-100 transition-colors whitespace-nowrap"
                            >
                              <UserCheck size={11}/>Assign
                            </button>
                          )
                        ) : (
                          <span className={`text-[11px] font-medium ${c.assignedTo ? 'text-slate-600' : 'text-slate-300 italic'}`}>
                            {c.assignedTo?.fullName || 'Unassigned'}
                          </span>
                        )}
                      </TD>

                      {/* Progress bar */}
                      <TD>
                        <div className="flex items-center gap-[7px] min-w-[70px]">
                          <div className="flex-1 h-[5px] bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="adm-barf h-full rounded-full"
                              style={{
                                width: `${c.progress||0}%`,
                                background: c.progress===100 ? '#10B981' : c.progress > 0 ? '#6366F1' : '#CBD5E1'
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 shrink-0">{c.progress||0}%</span>
                        </div>
                      </TD>

                      {/* Date */}
                      <TD>
                        <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—'}
                        </span>
                      </TD>

                      {/* Actions — Eye always visible, Edit toggles inline mode, Delete always visible */}
                      <TD>
                        <div className="flex items-center gap-[4px]">
                          {/* Eye — always visible */}
                          <IconBtn onClick={()=>window.open(`/complaint/${c._id}`,'_blank')} title="View Details" color="sky">
                            <Eye size={13}/>
                          </IconBtn>

                          {/* Edit toggle — activates inline editing */}
                          <IconBtn
                            onClick={()=>{
                              if (isEdit) { setExpComp(null); }
                              else { setExpComp(c._id); setEditStatusVal(c.status); }
                            }}
                            title={isEdit ? 'Cancel Edit' : 'Edit'}
                            color={isEdit ? 'amber' : 'indigo'}
                          >
                            {isEdit ? <X size={13}/> : <Edit2 size={13}/>}
                          </IconBtn>

                          {/* Delete — always visible */}
                          <IconBtn onClick={()=>setDelComp(c)} title="Delete" color="red">
                            <Trash2 size={13}/>
                          </IconBtn>
                        </div>
                      </TD>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );

  /* ══════════════ RECENT ACTIVITIES (redesigned) ══════════════ */
  const groupColors = {
    Admin:     { bar:'bg-indigo-500', badge:'bg-indigo-50 text-indigo-600 border-indigo-100',    dot:'bg-indigo-400',  headerBg:'bg-indigo-50/60', text:'text-indigo-700' },
    Volunteer: { bar:'bg-cyan-500',   badge:'bg-cyan-50   text-cyan-700   border-cyan-100',      dot:'bg-cyan-400',    headerBg:'bg-cyan-50/60',   text:'text-cyan-700'  },
    User:      { bar:'bg-emerald-500',badge:'bg-emerald-50 text-emerald-700 border-emerald-100', dot:'bg-emerald-400', headerBg:'bg-emerald-50/60',text:'text-emerald-700'},
  };

  const timeAgo = (d) => {
    if (!d) return '';
    const diff = (Date.now()-new Date(d))/1000;
    if (diff<60)    return 'Just now';
    if (diff<3600)  return `${Math.floor(diff/60)}m ago`;
    if (diff<86400) return `${Math.floor(diff/3600)}h ago`;
    return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'});
  };

  const ActRow = ({ act, idx, borderLast }) => {
    const meta = ACT_META[act.type] || {icon:<Activity size={13}/>,bg:'bg-slate-100',color:'text-slate-500',label:'Activity',group:'User'};
    const gc   = groupColors[meta.group] || groupColors.User;
    return (
      <div className={`adm-act-row flex items-start gap-4 px-5 py-[13px] cursor-default transition-colors ${!borderLast?'border-b border-slate-50':''}`}>
        {/* Icon */}
        <div className={`w-[34px] h-[34px] rounded-[10px] ${meta.bg} ${meta.color} flex items-center justify-center shrink-0 mt-[1px]`}>
          {meta.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-[3px]">
            <span className="text-[13px] font-bold text-slate-800">{act.userName||'Unknown'}</span>
            <span className={`text-[10px] font-bold px-[8px] py-[2px] rounded-full border ${gc.badge} uppercase tracking-[.04em]`}>{meta.group}</span>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-[7px] py-[2px] rounded-full capitalize">{meta.label}</span>
          </div>
          <p className="text-[12px] text-slate-500 font-medium m-0 leading-[1.55]">{act.description||'—'}</p>
          {act.issueTitle && (
            <p className="text-[11px] text-indigo-500 font-semibold m-0 mt-[3px] flex items-center gap-[4px]">
              <FileText size={10}/>{act.issueTitle}
            </p>
          )}
        </div>

        {/* Time */}
        <span className="text-[11px] text-slate-400 font-medium shrink-0 mt-[2px] whitespace-nowrap">{timeAgo(act.createdAt)}</span>
      </div>
    );
  };

  const ActivitySection = ({ label, items, color }) => {
    const gc = groupColors[color] || groupColors.User;
    // ~3 items visible (each row ≈ 65px) + header
    return (
      <Card noPad className="overflow-hidden flex flex-col">
        {/* Header — not clickable, just informational */}
        <div className={`flex items-center gap-3 px-5 py-[13px] border-b border-slate-100 ${gc.headerBg}`}>
          <div className={`w-[3px] h-5 rounded-full ${gc.bar} shrink-0`}/>
          <span className={`text-[13px] font-extrabold flex-1 ${gc.text}`}>{label}</span>
          <span className={`text-[10px] font-bold px-[9px] py-[3px] rounded-full border ${gc.badge}`}>
            {items.length} action{items.length!==1?'s':''}
          </span>
        </div>
        {/* Scrollable feed — ~3 rows always visible, rest scrollable */}
        <div className="overflow-y-auto" style={{maxHeight:'195px'}}>
          {items.length===0
            ? <div className="py-7 px-5"><Empty msg={`No ${label.toLowerCase()} yet.`}/></div>
            : items.map((a,i)=><ActRow key={a._id||i} act={a} idx={i} borderLast={i===items.length-1}/>)
          }
        </div>
      </Card>
    );
  };

/* ══════════════ RECENT ACTIVITIES (Admin Only) ══════════════ */
  const RecentActivities = (
    <div className="adm-fu flex flex-col gap-4">
      {/* ── Header + Search only ── */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-800 m-0">Recent Activities</h2>
          <p className="text-xs text-slate-400 mt-[3px] mb-0 font-medium">
            {adminActs.length} total admin actions
          </p>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-[10px] top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
          <input className={`${INPUT} pl-[30px] w-[200px]`} value={actSearch} onChange={e=>setActSearch(e.target.value)} placeholder="Search activities…"/>
        </div>
      </div>

      {/* ── Summary stats strip ── */}
      {!actsLd && adminActs.length>0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {label:'Admin Actions', count:adminActs.length, ...groupColors.Admin},
          ].map((s,i)=>(
            <div key={i} className="bg-white rounded-[14px] border border-slate-100 px-4 py-3 flex items-center gap-3">
              <div className={`w-2 h-8 rounded-full ${s.bar} shrink-0`}/>
              <div>
                <p className="text-[22px] font-extrabold text-slate-800 m-0 leading-none">{s.count}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[.06em] mt-[3px] m-0">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Activity sections ── */}
      {actsLd ? (
        <Card><TableSpin/></Card>
      ) : adminActs.length===0 ? (
        <Card><Empty msg="No recent admin activities found." icon={<Bell size={22} strokeWidth={1.4} color="#CBD5E1"/>}/></Card>
      ) : (
        <ActivitySection label="Admin Actions" items={adminActs} color="Admin"/>
      )}
    </div>
  );

  /* ══════════════ ASSIGN MODAL ══════════════ */
  const AssignModal = assignModal && (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-5" onClick={()=>setAssignModal(null)}>
      <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-[3px]"/>
      <div className="adm-modal relative bg-white rounded-[22px] w-full max-w-[480px] shadow-2xl overflow-hidden" onClick={e=>e.stopPropagation()}>
        <div className="px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-[15px] font-extrabold text-slate-800 m-0 mb-1">Assign to Volunteer</h3>
              <p className="text-xs text-slate-400 m-0 font-medium">
                <span className="text-indigo-500 font-bold">{assignModal.title}</span>
                {assignModal.address && <> · {assignModal.address}</>}
              </p>
            </div>
            <button onClick={()=>setAssignModal(null)} className="bg-transparent border-0 cursor-pointer text-slate-400 p-1"><X size={18}/></button>
          </div>
        </div>
        <div className="max-h-[380px] overflow-y-auto p-4">
          {volLd ? (
            <div className="py-10 text-center">
              <div className="adm-spin w-7 h-7 border-[3px] border-cyan-100 border-t-cyan-500 rounded-full mx-auto mb-2"/>
              <p className="text-xs text-slate-400 font-medium m-0">Finding nearby volunteers…</p>
            </div>
          ) : volunteers.length===0 ? (
            <div className="py-8"><Empty msg="No volunteers found within 50 km."/></div>
          ) : (
            <>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[.06em] mb-3 pl-1">{volunteers.length} volunteer{volunteers.length>1?'s':''} nearby</p>
              {volunteers.map(v=>(
                <div key={v._id} className="flex items-center gap-3 p-3 mb-[6px] rounded-[12px] border border-transparent hover:border-green-100 hover:bg-green-50/50 transition-all">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[13px] font-bold shrink-0">
                    {(v.fullName||'V').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-slate-800 m-0">{v.fullName}</p>
                    <div className="flex items-center gap-2 mt-[2px]">
                      <span className="text-[11px] text-slate-400 font-medium truncate">{v.email}</span>
                      <span className="text-[10px] font-bold text-sky-600 bg-sky-100 px-[7px] py-[1px] rounded-full shrink-0 flex items-center gap-[3px]">
                        <MapPin size={8}/>{v.distKm} km
                      </span>
                    </div>
                  </div>
                  <button onClick={()=>doAssign(v._id)} disabled={!!assigningId}
                    className="flex items-center gap-[6px] px-3 py-[7px] rounded-[9px] bg-green-500 hover:bg-green-600 text-white text-[12px] font-bold border-0 cursor-pointer disabled:opacity-50 transition-colors shrink-0">
                    {assigningId===v._id
                      ? <div className="adm-spin w-3 h-3 border-2 border-white/30 border-t-white rounded-full"/>
                      : <><UserCheck size={12}/>Assign</>}
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
        <div className="px-6 py-3 border-t border-slate-100 text-right">
          <button onClick={()=>setAssignModal(null)} className="bg-transparent border-0 cursor-pointer text-[13px] font-semibold text-slate-400 hover:text-slate-600">Close</button>
        </div>
      </div>
    </div>
  );

  /* ══════════════ DOWNLOAD MODAL ══════════════ */
  const DlModal = (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-5" onClick={()=>setShowDl(false)}>
      <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-[3px]"/>
      <div className="adm-modal relative bg-white rounded-[22px] p-7 w-full max-w-[400px] shadow-2xl" onClick={e=>e.stopPropagation()}>
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-base font-extrabold text-slate-800 m-0">Download Report</h3>
          <button onClick={()=>setShowDl(false)} className="bg-transparent border-0 cursor-pointer text-slate-400 flex p-1"><X size={18}/></button>
        </div>
        <p className="text-[13px] text-slate-400 mb-5 font-medium">Choose your preferred format:</p>
        <div className="flex flex-col gap-[10px]">
          {[
            {id:'csv',label:'Excel (.xlsx)',sub:'3 sheets — Summary, Complaints, Users',emoji:'📊',acv:'bg-indigo-50 border-indigo-200',spinC:'border-t-indigo-500'},
            {id:'pdf',label:'PDF Report',   sub:'Formatted document — ready to print or share',emoji:'📄',acv:'bg-red-50 border-red-200',spinC:'border-t-red-500'},
          ].map(opt=>(
            <button key={opt.id} onClick={opt.id==='csv'?downloadCSV:downloadPDF} disabled={!!dlLd}
              className={`flex items-center gap-4 p-4 rounded-[13px] border-2 text-left transition-all ${dlLd===opt.id?opt.acv:'border-slate-100 bg-slate-50'} ${dlLd?'cursor-wait':'cursor-pointer hover:border-slate-200'}`}>
              <div className={`w-[38px] h-[38px] rounded-[10px] ${opt.acv} flex items-center justify-center shrink-0`}>
                {dlLd===opt.id ? <div className={`adm-spin w-[18px] h-[18px] border-2 border-slate-200 ${opt.spinC} rounded-full`}/> : <span className="text-lg">{opt.emoji}</span>}
              </div>
              <div>
                <p className="text-[13px] font-bold text-slate-800 m-0">{opt.label}</p>
                <p className="text-[11px] text-slate-400 m-0 mt-[2px]">{opt.sub}</p>
              </div>
            </button>
          ))}
        </div>
        <button onClick={()=>setShowDl(false)} className="w-full mt-4 py-[10px] bg-transparent border-0 cursor-pointer text-[13px] font-semibold text-slate-400">Cancel</button>
      </div>
    </div>
  );

  /* ══════════════ RENDER ══════════════ */
  return (
    <div className="adm min-h-screen bg-slate-50 px-[26px] pt-[26px] pb-[52px]">
      {showDl && DlModal}
      {AssignModal}

      {/* Delete user */}
      {delUser && (
        <ConfirmModal
          title={`Delete ${delUser.role==='volunteer'?'Volunteer':'User'}?`}
          message={delUser.role==='volunteer'
            ? `Deleting "${delUser.fullName}" will reset their active complaints back to Pending. Their filed complaints will remain. This cannot be undone.`
            : `Are you sure you want to delete "${delUser.fullName}"? Their filed complaints will remain (shown as Unknown). This cannot be undone.`}
          onConfirm={confirmDeleteUser}
          onCancel={()=>setDelUser(null)}
          loading={delUserLd}
          confirmLabel="Delete"
        />
      )}

      {/* Delete complaint */}
      {delComp && (
        <ConfirmModal
          title="Delete Complaint?"
          message={`Permanently delete "${delComp.title}"? This cannot be undone.`}
          onConfirm={confirmDeleteComp}
          onCancel={()=>setDelComp(null)}
          loading={delCompLd}
          confirmLabel="Delete"
        />
      )}

      {/* ── Volunteer → User: has active complaints ── */}
      {demoteWarning && (
        <ConfirmModal
          title={demoteWarning.resetCount > 0 ? "Volunteer Has Active Complaints" : "Demote to User?"}
          message={demoteWarning.resetCount > 0
            ? `"${demoteWarning.userName}" currently has ${demoteWarning.resetCount} active complaint(s) assigned to them. Demoting to User will unassign them and reset those complaints back to Pending. Continue?`
            : `"${demoteWarning.userName}" has no active complaints. They will lose volunteer access and can no longer be assigned complaints. Continue?`}
          onConfirm={()=>doSaveRole(demoteWarning.userId)}
          onCancel={()=>{setDemoteWarning(null);setEditId(null);}}
          loading={demoteLd}
          confirmLabel={demoteWarning.resetCount > 0 ? "Reset & Demote" : "Yes, Demote"}
          danger={demoteWarning.resetCount > 0}
        />
      )}

      {/* ── User → Volunteer: upgrade warning ── */}
      {upgradeWarning && (
        <ConfirmModal
          title="Upgrade to Volunteer?"
          message={`"${upgradeWarning.userName}" will be given volunteer access. They'll be able to accept and handle complaint assignments. You can demote them back to User at any time.`}
          onConfirm={()=>doSaveRole(upgradeWarning.userId)}
          onCancel={()=>{setUpgradeWarning(null);setEditId(null);}}
          loading={upgradeLd}
          confirmLabel="Yes, Upgrade"
          danger={false}
        />
      )}

      {/* ── Any → Admin: strong promotion warning ── */}
      {promoteWarning && (
        <ConfirmModal
          title="Grant Admin Access?"
          message={`You are about to give "${promoteWarning.userName}" full admin privileges — including managing all users, changing roles, deleting complaints, and downloading reports. This is a high-trust action. Are you absolutely sure?`}
          onConfirm={()=>doSaveRole(promoteWarning.userId)}
          onCancel={()=>{setPromoteWarning(null);setEditId(null);}}
          loading={promoteLd}
          confirmLabel="Yes, Grant Admin"
          danger={true}
        />
      )}

      {/* ── Admin → lower role: demotion warning ── */}
      {adminDemoteWarning && (
        <ConfirmModal
          title="Demote Admin?"
          message={`"${adminDemoteWarning?.userName}" will lose all admin privileges and become a ${adminDemoteWarning?.toRole === 'citizen' ? 'regular User' : 'Volunteer'}. They will no longer have access to this dashboard. Are you sure?`}
          onConfirm={()=>doSaveRole(adminDemoteWarning.userId)}
          onCancel={()=>{setAdminDemoteWarning(null);setEditId(null);}}
          loading={adminDemoteLd}
          confirmLabel={`Yes, Demote to ${adminDemoteWarning?.toRole === 'citizen' ? 'User' : 'Volunteer'}`}
          danger={true}
        />
      )}

      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <div className="adm-fu flex justify-between items-start mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-[22px] font-extrabold text-slate-900 m-0 leading-tight">Admin Dashboard</h1>
            <p className="text-[13px] text-slate-400 font-medium mt-[3px] mb-0">Clean Street · Management Console</p>
          </div>
          <button className="adm-dl-btn flex items-center gap-2 text-white border-0 cursor-pointer px-5 py-[10px] rounded-[13px] text-[13px] font-bold" onClick={()=>setShowDl(true)}>
            <Download size={14}/> Download Report
          </button>
        </div>

        {/* Tabs */}
        <div className="adm-fu1 flex gap-[3px] bg-white border border-slate-100 rounded-[14px] p-1 w-fit mb-6 shadow-sm flex-wrap">
          {TABS.map(t=>(
            <button key={t.key} onClick={()=>setTab(t.key)}
              className={`adm-tab flex items-center gap-[6px] px-4 py-[8px] rounded-[11px] border-0 cursor-pointer text-[13px] font-bold transition-all ${tab===t.key?'adm-tab-active':'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
              {t.label}
              {t.count!==null && (
                <span className={`text-[10px] font-bold px-[7px] py-[1px] rounded-full ${tab===t.key?'bg-white/25 text-white':'bg-slate-100 text-slate-500'}`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {tab==='Overview'          && Overview}
        {tab==='Manage Users'      && ManageUsers}
        {tab==='View Complaints'   && ViewComplaints}
        {tab==='Recent Activities' && RecentActivities}
      </div>
    </div>
  );
}