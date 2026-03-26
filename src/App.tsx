import React, { useState, useEffect, useReducer, useRef, useCallback } from "react";
import { T, INITIAL_STATE } from "./constants";
import { AppState } from "./types";
import { Icon, Field } from "./components/UI";
import { saveLocal, loadLocal, broadcastLocal, subscribeToLocalSync } from "./lib/sync";
import { motion, AnimatePresence } from "motion/react";

// Pages
import { Dashboard } from "./pages/Dashboard";
import { Patients } from "./pages/Patients";
import { StaffPage } from "./pages/Staff";
import { Doctors } from "./pages/Doctors";
import { Appointments } from "./pages/Appointments";
import { MedRecords } from "./pages/MedRecords";
import { Billing } from "./pages/Billing";
import { Ambulance } from "./pages/Ambulance";
import { Food } from "./pages/Food";
import { Medicine } from "./pages/Medicine";
import { BloodDonors } from "./pages/BloodDonors";
import { OrganDonors } from "./pages/OrganDonors";

/* ═══════════════════════════════════════════════════════════════
   STATE REDUCER
═══════════════════════════════════════════════════════════════ */
function reducer(state: AppState, action: any): AppState {
  const s = { ...state };
  const now = () => new Date().toISOString().slice(0, 16).replace("T", " ");
  const today = () => new Date().toISOString().slice(0, 10);

  switch (action.type) {
    case "__REPLACE__":
      return action.state;
    case "ADD_PATIENT":
      return { ...s, patients: [...s.patients, action.p], nextPatientId: s.nextPatientId + 1 };
    case "DEL_PATIENT":
      return { ...s, patients: s.patients.filter(p => p.id !== action.id) };
    case "UPD_PATIENT":
      return { ...s, patients: s.patients.map(p => p.id === action.id ? { ...p, ...action.upd } : p) };
    case "ADD_STAFF":
      return { ...s, staff: [...s.staff, { ...action.p, id: s.nextStaffId }], nextStaffId: s.nextStaffId + 1 };
    case "DEL_STAFF":
      return { ...s, staff: s.staff.filter(s2 => s2.id !== action.id) };
    case "ADD_DOCTOR":
      return { ...s, doctors: [...s.doctors, { ...action.p, available: true }], nextDoctorId: s.nextDoctorId + 1 };
    case "UPD_DOCTOR":
      return { ...s, doctors: s.doctors.map(d => d.id === action.id ? { ...d, ...action.upd } : d) };
    case "TOGGLE_DOCTOR":
      return { ...s, doctors: s.doctors.map(d => d.id === action.id ? { ...d, available: !d.available } : d) };
    case "ADD_APPT":
      return { ...s, appointments: [...s.appointments, { ...action.p, id: s.nextApptId, status: "Pending" }], nextApptId: s.nextApptId + 1 };
    case "UPD_APPT":
      return { ...s, appointments: s.appointments.map(a => a.id === action.id ? { ...a, status: action.status } : a) };
    case "DEL_APPT":
      return { ...s, appointments: s.appointments.filter(a => a.id !== action.id) };
    case "ADD_RECORD":
      return { ...s, records: [...s.records, { ...action.p, id: s.nextRecordId, date: today() }], nextRecordId: s.nextRecordId + 1 };
    case "DEL_RECORD":
      return { ...s, records: s.records.filter(r => r.id !== action.id) };
    case "ADD_BILL":
      return { ...s, bills: [...s.bills, { ...action.p, id: s.nextBillId, date: today(), status: "Unpaid" }], nextBillId: s.nextBillId + 1 };
    case "PAY_BILL":
      return { ...s, bills: s.bills.map(b => b.id === action.id ? { ...b, status: "Paid", payMethod: action.method, paidAt: now(), txnId: action.txnId } : b) };
    case "ADD_AMB":
      return { ...s, ambulances: [...s.ambulances, { ...action.p, id: s.nextAmbId, status: "Available" }], nextAmbId: s.nextAmbId + 1 };
    case "UPD_AMB":
      return { ...s, ambulances: s.ambulances.map(a => a.id === action.id ? { ...a, ...action.upd } : a) };
    case "BOOK_AMB": {
      const amb = s.ambulances.find(a => a.id === action.p.ambulanceId);
      if (!amb || amb.status !== "Available") return s;
      return {
        ...s,
        ambBookings: [...s.ambBookings, { ...action.p, id: s.nextAmbBookId, time: now(), status: "Confirmed" }],
        nextAmbBookId: s.nextAmbBookId + 1,
        ambulances: s.ambulances.map(a => a.id === action.p.ambulanceId ? { ...a, status: "On-Duty" } : a),
      };
    }
    case "ORDER_FOOD":
      return { ...s, foodOrders: [...s.foodOrders, { ...action.p, id: s.nextFoodOrderId, date: now(), status: "Pending" }], nextFoodOrderId: s.nextFoodOrderId + 1 };
    case "DELIVER_FOOD":
      return { ...s, foodOrders: s.foodOrders.map(o => o.id === action.id ? { ...o, status: "Delivered" } : o) };
    case "ADD_FOOD_ITEM":
      return { ...s, foodMenu: [...s.foodMenu, action.p] };
    case "ORDER_MED": {
      const med = s.medicines.find(m => m.id === action.p.medicineId);
      if (!med || med.stock < action.p.qty) return s;
      return {
        ...s,
        medicineOrders: [...s.medicineOrders, { ...action.p, id: s.nextMedOrderId, date: now(), status: "Pending" }],
        nextMedOrderId: s.nextMedOrderId + 1,
        medicines: s.medicines.map(m => m.id === action.p.medicineId ? { ...m, stock: m.stock - action.p.qty } : m),
      };
    }
    case "DISPENSE_MED":
      return { ...s, medicineOrders: s.medicineOrders.map(o => o.id === action.id ? { ...o, status: "Dispensed" } : o) };
    case "ADD_MEDICINE":
      return { ...s, medicines: [...s.medicines, action.p] };
    case "ADD_BLOOD_DONOR":
      return { ...s, bloodDonors: [...s.bloodDonors, { ...action.p, id: s.nextBloodId, available: true }], nextBloodId: s.nextBloodId + 1 };
    case "TOGGLE_BLOOD":
      return { ...s, bloodDonors: s.bloodDonors.map(d => d.id === action.id ? { ...d, available: !d.available } : d) };
    case "ADD_ORGAN_DONOR":
      return { ...s, organDonors: [...s.organDonors, { ...action.p, id: s.nextOrganId, regDate: today(), consent: true }], nextOrganId: s.nextOrganId + 1 };
    case "DEL_ORGAN_DONOR":
      return { ...s, organDonors: s.organDonors.filter(d => d.id !== action.id) };
    default: return s;
  }
}

/* ═══════════════════════════════════════════════════════════════
   LOGIN SCREEN
═══════════════════════════════════════════════════════════════ */
function Login({ onLogin, theme, setTheme, t, liveState }: any) {
  const [role, setRole] = useState("Admin");
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const tryLogin = () => {
    setErr("");
    if (role === "Admin") {
      if (user === "admin" && pass === "admin123") { onLogin("Admin", -1, -1, -1); }
      else setErr("Invalid admin credentials.");
    } else if (role === "Staff") {
      const db = liveState?.staff || INITIAL_STATE.staff;
      const found = db.find((s: any) => String(s.id) === user && s.pass === pass);
      if (found) onLogin("Staff", -1, found.id, -1);
      else setErr("Invalid staff ID or password.");
    } else if (role === "Doctor") {
      const db = liveState?.doctors || INITIAL_STATE.doctors;
      const found = db.find((d: any) => String(d.id) === user && d.pass === pass);
      if (found) onLogin("Doctor", -1, -1, found.id);
      else setErr("Invalid doctor ID or password.");
    } else {
      const db = liveState?.patients || INITIAL_STATE.patients;
      const found = db.find((p: any) => String(p.id) === user && p.pass === pass);
      if (found) onLogin("Patient", found.id, -1, -1);
      else setErr("Invalid patient ID or password.");
    }
  };

  const roles = [
    { r: "Admin", icon: "shield", color: t.accent }, 
    { r: "Doctor", icon: "stethoscope", color: t.green }, 
    { r: "Staff", icon: "users", color: t.orange }, 
    { r: "Patient", icon: "user", color: t.purple }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: t.bg }}>
      {/* Background Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-[700px] h-[700px] rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${t.accent}, transparent 70%)` }} />
        <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${t.purple}, transparent 70%)` }} />
      </div>

      <button 
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed top-6 right-6 z-10 flex items-center gap-2 px-4 py-2 rounded-xl border-1.5 font-bold text-sm shadow-sm transition-all"
        style={{ background: t.card, borderColor: t.border, color: t.text }}
      >
        <Icon name={theme === "dark" ? "sun" : "moon"} size={16} color={t.amber} />
        {theme === "dark" ? "Light" : "Dark"}
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex w-20 h-20 rounded-3xl items-center justify-center mb-4 shadow-2xl" style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.purple})` }}>
            <span className="text-4xl">🏥</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: t.text }}>GSR HOSPITAL</h1>
          <p className="text-sm font-medium mt-1 opacity-60" style={{ color: t.text }}>Smart Hospital Management System</p>
        </div>

        <div className="rounded-3xl p-8 border shadow-2xl" style={{ background: t.card, borderColor: t.border }}>
          <div className="mb-6">
            <p className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-60" style={{ color: t.text }}>Login As</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {roles.map(({ r, icon, color }) => (
                <button 
                  key={r} 
                  onClick={() => { setRole(r); setErr(""); }}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all"
                  style={{ 
                    background: role === r ? color + "18" : t.input, 
                    color: role === r ? color : t.textMuted, 
                    borderColor: role === r ? color : t.inputBorder 
                  }}
                >
                  <Icon name={icon} size={20} color={role === r ? color : t.textMuted} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{r}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Field label={role === "Patient" ? "Patient ID" : "Username / ID"} value={user} onChange={setUser} t={t} placeholder={role === "Admin" ? "admin" : "Enter ID"} />
            <Field label="Password" type="password" value={pass} onChange={setPass} t={t} placeholder="••••••••" />
          </div>

          {err && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-3 rounded-xl border mt-4 text-xs font-bold" style={{ background: t.red + "15", borderColor: t.red + "33", color: t.red }}>
              {err}
            </motion.div>
          )}

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={tryLogin}
            className="w-full mt-6 py-4 rounded-2xl font-black text-base shadow-xl transition-all text-white"
            style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.purple})` }}
          >
            Sign In →
          </motion.button>
        </div>

        <p className="text-center text-[10px] font-bold uppercase tracking-widest mt-6 opacity-40" style={{ color: t.text }}>
          GSR Hospital, Cuddalore, Tamil Nadu · Emergency: 104
        </p>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN APP SHELL
═══════════════════════════════════════════════════════════════ */
export default function App() {
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem("gsr_theme") || "dark"; } catch { return "dark"; } });
  const t = (T as any)[theme];
  
  const syncReducer = useCallback((state: AppState, action: any) => {
    if (action.type === "__REPLACE__") return action.state;
    const next = reducer(state, action.action || action);
    saveLocal(next);
    broadcastLocal(next);
    return next;
  }, []);

  const [state, dispatch] = useReducer(syncReducer, null, () => loadLocal() || INITIAL_STATE);

  useEffect(() => {
    return subscribeToLocalSync((newState) => {
      dispatch({ type: "__REPLACE__", state: newState });
    });
  }, []);

  useEffect(() => { try { localStorage.setItem("gsr_theme", theme); } catch {} }, [theme]);

  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("Admin");
  const [patientId, setPatientId] = useState(-1);
  const [staffId, setStaffId] = useState(-1);
  const [doctorId, setDoctorId] = useState(-1);
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      if (w >= 1024) setMobileNavOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const NAV_CONFIG = {
    Admin: [
      { id: "dashboard", label: "Dashboard", icon: "home" },
      { id: "patients", label: "Patients", icon: "users" },
      { id: "staff", label: "Staff", icon: "shield" },
      { id: "doctors", label: "Doctors", icon: "stethoscope" },
      { id: "appointments", label: "Appointments", icon: "calendar" },
      { id: "records", label: "Med Records", icon: "file" },
      { id: "billing", label: "Billing", icon: "bill" },
      { id: "ambulance", label: "Ambulance", icon: "ambulance" },
      { id: "food", label: "Food", icon: "food" },
      { id: "medicine", label: "Medicine", icon: "pill" },
      { id: "blood", label: "Blood Donors", icon: "heart" },
      { id: "organ", label: "Organ Donors", icon: "organ" },
    ],
    Staff: [
      { id: "dashboard", label: "Dashboard", icon: "home" },
      { id: "patients", label: "Patients", icon: "users" },
      { id: "records", label: "Med Records", icon: "file" },
      { id: "ambulance", label: "Ambulance", icon: "ambulance" },
      { id: "food", label: "Food", icon: "food" },
      { id: "medicine", label: "Medicine", icon: "pill" },
      { id: "blood", label: "Blood Donors", icon: "heart" },
      { id: "organ", label: "Organ Donors", icon: "organ" },
    ],
    Doctor: [
      { id: "dashboard", label: "Dashboard", icon: "home" },
      { id: "patients", label: "Patients", icon: "users" },
      { id: "appointments", label: "Appointments", icon: "calendar" },
      { id: "records", label: "Med Records", icon: "file" },
      { id: "medicine", label: "Medicine", icon: "pill" },
      { id: "blood", label: "Blood Donors", icon: "heart" },
      { id: "organ", label: "Organ Donors", icon: "organ" },
    ],
    Patient: [
      { id: "dashboard", label: "Dashboard", icon: "home" },
      { id: "doctors", label: "Doctors", icon: "stethoscope" },
      { id: "appointments", label: "Appointments", icon: "calendar" },
      { id: "records", label: "My Records", icon: "file" },
      { id: "billing", label: "My Bills", icon: "bill" },
      { id: "ambulance", label: "Ambulance", icon: "ambulance" },
      { id: "food", label: "Food", icon: "food" },
      { id: "medicine", label: "Medicine", icon: "pill" },
      { id: "blood", label: "Blood Donors", icon: "heart" },
      { id: "organ", label: "Organ Donors", icon: "organ" },
    ]
  };

  const nav = (NAV_CONFIG as any)[role] || NAV_CONFIG.Patient;
  const requester = role === "Patient" ? `PATIENT-${patientId}` : role === "Staff" ? `STAFF-${staffId}` : role === "Doctor" ? `DOCTOR-${doctorId}` : "ADMIN";

  const handleLogin = (r: string, pid: number, sid: number, did: number) => {
    setRole(r); setPatientId(pid); setStaffId(sid); setDoctorId(did);
    setLoggedIn(true); setPage("dashboard");
  };

  if (!loggedIn) return <Login onLogin={handleLogin} theme={theme} setTheme={setTheme} t={t} liveState={state} />;

  const pageProps = { state, dispatch, role, loggedId: patientId > 0 ? patientId : staffId, doctorId, requester, t };

  const renderPage = () => {
    switch (page) {
      case "dashboard":    return <Dashboard {...pageProps} />;
      case "patients":     return <Patients {...pageProps} />;
      case "staff":        return <StaffPage {...pageProps} />;
      case "doctors":      return <Doctors {...pageProps} />;
      case "appointments": return <Appointments {...pageProps} />;
      case "records":      return <MedRecords {...pageProps} />;
      case "billing":      return <Billing {...pageProps} />;
      case "ambulance":    return <Ambulance {...pageProps} />;
      case "food":         return <Food {...pageProps} />;
      case "medicine":     return <Medicine {...pageProps} />;
      case "blood":        return <BloodDonors {...pageProps} />;
      case "organ":        return <OrganDonors {...pageProps} />;
      default: return null;
    }
  };

  const SidebarContent = ({ compact }: { compact: boolean }) => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-5 flex items-center gap-3 border-b" style={{ borderColor: t.sidebarBorder }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-2xl shadow-lg" style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.purple})` }}>🏥</div>
        {!compact && (
          <div className="overflow-hidden">
            <div className="font-black text-sm tracking-tight truncate" style={{ color: t.text }}>GSR HOSPITAL</div>
            <div className="text-[10px] font-bold uppercase tracking-widest opacity-50" style={{ color: t.text }}>{role} Panel</div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {nav.map((n: any) => {
          const active = page === n.id;
          return (
            <button 
              key={n.id} 
              onClick={() => { setPage(n.id); setMobileNavOpen(false); }}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all group ${active ? "shadow-sm" : ""}`}
              style={{ 
                background: active ? t.accent + "18" : "transparent", 
                color: active ? t.accent : t.textMuted 
              }}
            >
              <Icon name={n.icon} size={20} color={active ? t.accent : t.textMuted} className="shrink-0 transition-transform group-hover:scale-110" />
              {!compact && <span className="text-sm font-bold truncate">{n.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-2 border-t space-y-1" style={{ borderColor: t.sidebarBorder }}>
        <button 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-sm font-bold"
          style={{ color: t.textMuted }}
        >
          <Icon name={theme === "dark" ? "sun" : "moon"} size={20} color={t.amber} className="shrink-0" />
          {!compact && (theme === "dark" ? "Light Mode" : "Dark Mode")}
        </button>
        <button 
          onClick={() => setLoggedIn(false)}
          className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-sm font-bold"
          style={{ color: t.red }}
        >
          <Icon name="logout" size={20} color={t.red} className="shrink-0" />
          {!compact && "Logout"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: t.bg, color: t.text }}>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${t.scrollbar}; border-radius: 10px; }
        @media (max-width: 640px) {
          .modal-box { border-radius: 24px 24px 0 0 !important; max-height: 92vh !important; }
        }
      `}</style>

      {/* Desktop Sidebar */}
      {!isMobile && (
        <motion.div 
          animate={{ width: sidebarOpen ? 240 : 80 }}
          className="h-full border-r shrink-0 overflow-hidden"
          style={{ background: t.sidebar, borderColor: t.sidebarBorder }}
        >
          <SidebarContent compact={!sidebarOpen} />
        </motion.div>
      )}

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobile && mobileNavOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setMobileNavOpen(false)} 
              className="fixed inset-0 z-[100]" 
              style={{ background: t.overlay }} 
            />
            <motion.div 
              initial={{ x: -280 }} 
              animate={{ x: 0 }} 
              exit={{ x: -280 }}
              className="fixed inset-y-0 left-0 w-[280px] z-[101] shadow-2xl"
              style={{ background: t.sidebar }}
            >
              <SidebarContent compact={false} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 shrink-0 flex items-center justify-between px-4 border-b z-10" style={{ background: t.surface, borderColor: t.border }}>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => isMobile ? setMobileNavOpen(true) : setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl transition-colors"
              style={{ color: t.textMuted }}
            >
              <Icon name="menu" size={24} />
            </button>
            <h1 className="text-base font-black tracking-tight truncate max-w-[150px] sm:max-w-none" style={{ color: t.text }}>
              {nav.find((n: any) => n.id === page)?.label || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {!isMobile && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl border-1.5" style={{ background: t.input, borderColor: t.inputBorder }}>
                <Icon name="search" size={16} color={t.textMuted} />
                <input placeholder="Search records..." className="bg-transparent border-none outline-none text-sm w-32 focus:w-48 transition-all" style={{ color: t.text }} />
              </div>
            )}
            
            <button className="p-2 rounded-xl relative" style={{ color: t.textMuted }}>
              <Icon name="bell" size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border-2" style={{ borderColor: t.surface }} />
            </button>

            <div className="flex items-center gap-3 pl-2 border-l" style={{ borderColor: t.border }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-md" style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.purple})` }}>
                <Icon name={role === "Admin" ? "shield" : role === "Doctor" ? "stethoscope" : role === "Staff" ? "users" : "user"} size={18} color="#fff" />
              </div>
              {!isMobile && (
                <div className="text-left">
                  <div className="text-xs font-black leading-none" style={{ color: t.text }}>
                    {role === "Admin" ? "Administrator" : role === "Doctor" ? `Dr. #${doctorId}` : role === "Staff" ? `Staff #${staffId}` : `Patient #${patientId}`}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-50 mt-1" style={{ color: t.text }}>{role}</div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar pb-24 sm:pb-6">
          {renderPage()}
        </main>

        {/* Mobile Bottom Nav */}
        {isMobile && (
          <nav className="fixed bottom-0 inset-x-0 h-16 border-t flex items-center justify-around px-2 z-50 pb-safe" style={{ background: t.surface, borderColor: t.border }}>
            {nav.slice(0, 4).map((n: any) => {
              const active = page === n.id;
              return (
                <button 
                  key={n.id} 
                  onClick={() => setPage(n.id)}
                  className="flex flex-col items-center gap-1 flex-1"
                  style={{ color: active ? t.accent : t.textMuted }}
                >
                  <Icon name={n.icon} size={22} color={active ? t.accent : t.textMuted} />
                  <span className="text-[9px] font-black uppercase tracking-widest">{n.label.split(" ")[0]}</span>
                </button>
              );
            })}
            <button 
              onClick={() => setMobileNavOpen(true)}
              className="flex flex-col items-center gap-1 flex-1"
              style={{ color: t.textMuted }}
            >
              <Icon name="menu" size={22} />
              <span className="text-[9px] font-black uppercase tracking-widest">More</span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
