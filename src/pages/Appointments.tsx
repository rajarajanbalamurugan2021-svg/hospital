import React, { useState, useEffect } from "react";
import { SectionHead, Btn, Icon, Badge, Modal, Field } from "../components/UI";
import { AppState, Appointment } from "../types";
import { motion } from "motion/react";

export function Appointments({ state, dispatch, role, loggedId, doctorId, t }: { state: AppState, dispatch: any, role: string, loggedId: number, doctorId: number, t: any }) {
  const [modal, setModal] = useState(false);
  const [f, setF] = useState({ patientId: "", doctorId: "", date: new Date().toISOString().slice(0, 10), time: "09:00", reason: "", priority: "Normal" as any });
  const [filterPriority, setFilterPriority] = useState("All");
  const [now_, setNow_] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow_(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const PRIORITIES = ["Emergency", "Urgent", "Normal", "Routine"];
  const PRIORITY_COLORS: Record<string, string> = { Emergency: "red", Urgent: "amber", Normal: "blue", Routine: "green" };
  const PRIORITY_ICONS: Record<string, string>  = { Emergency: "🚨", Urgent: "⚠️", Normal: "📅", Routine: "✅" };
  const PRIORITY_ORDER: Record<string, number>  = { Emergency: 0, Urgent: 1, Normal: 2, Routine: 3 };

  const apptDate = (a: Appointment) => { try { return new Date(`${a.date}T${a.time || "00:00"}`); } catch { return null; } };
  const minsUntil = (a: Appointment) => { const d = apptDate(a); if (!d) return null; return Math.round((d.getTime() - now_.getTime()) / 60000); };

  const effectivePriority = (a: Appointment) => {
    if (a.status === "Completed" || a.status === "Cancelled") return a.priority || "Normal";
    const mins = minsUntil(a);
    if (mins === null) return a.priority || "Normal";
    const base = a.priority || "Normal";
    if (mins <= 0)  return "Emergency";
    if (mins <= 15) {
      if (base === "Routine") return "Normal";
      if (base === "Normal")  return "Urgent";
      return base;
    }
    return base;
  };

  const countdownLabel = (a: Appointment) => {
    if (a.status === "Completed") return <span className="text-[11px] font-bold" style={{ color: t.green }}>✓ Done</span>;
    if (a.status === "Cancelled") return <span className="text-[11px]" style={{ color: t.textMuted }}>—</span>;
    const mins = minsUntil(a);
    if (mins === null) return null;
    if (mins < 0)  return <span className="text-[11px] font-extrabold" style={{ color: t.red }}>⏰ {Math.abs(mins)}m overdue</span>;
    if (mins === 0) return <span className="text-[11px] font-extrabold" style={{ color: t.red }}>🔴 NOW</span>;
    if (mins < 60)  return <span className="text-[11px] font-bold" style={{ color: t.amber }}>⏳ {mins}m</span>;
    const hrs = Math.floor(mins / 60), rem = mins % 60;
    if (hrs < 24)   return <span className="text-[11px]" style={{ color: t.textSub }}>🕐 {hrs}h {rem}m</span>;
    return <span className="text-[11px]" style={{ color: t.textMuted }}>📆 {Math.floor(hrs / 24)}d</span>;
  };

  const list = role === "Patient"
    ? state.appointments.filter(a => a.patientId === loggedId)
    : role === "Doctor"
    ? state.appointments.filter(a => a.doctorId === doctorId)
    : state.appointments;

  const filtered = filterPriority === "All" ? list : list.filter(a => effectivePriority(a) === filterPriority);

  const sorted = [...filtered].sort((a, b) => {
    const aActive = a.status !== "Completed" && a.status !== "Cancelled";
    const bActive = b.status !== "Completed" && b.status !== "Cancelled";
    if (aActive !== bActive) return aActive ? -1 : 1;
    const pDiff = (PRIORITY_ORDER[effectivePriority(a)] ?? 2) - (PRIORITY_ORDER[effectivePriority(b)] ?? 2);
    if (pDiff !== 0) return pDiff;
    return (apptDate(a)?.getTime() ?? 0) - (apptDate(b)?.getTime() ?? 0);
  });

  const active = list.filter(a => a.status !== "Completed" && a.status !== "Cancelled");
  const emergencyCount = active.filter(a => effectivePriority(a) === "Emergency").length;
  const overdueCount   = active.filter(a => { const m = minsUntil(a); return m !== null && m < 0; }).length;
  const upcomingCount  = active.filter(a => { const m = minsUntil(a); return m !== null && m >= 0 && m <= 60; }).length;

  const submit = () => {
    const pid = role === "Patient" ? loggedId : +f.patientId;
    if (!pid || !f.doctorId) return;
    dispatch({ type: "ADD_APPT", p: { patientId: pid, doctorId: +f.doctorId, date: f.date, time: f.time, reason: f.reason, priority: f.priority } });
    setModal(false); setF({ patientId: "", doctorId: "", date: new Date().toISOString().slice(0, 10), time: "09:00", reason: "", priority: "Normal" });
  };

  const statColor = (s: string) => s === "Confirmed" ? "green" : s === "Completed" ? "blue" : s === "Cancelled" ? "red" : "amber";
  const canDelete = role === "Admin" || role === "Doctor";
  const canChangeStatus = role === "Admin" || role === "Doctor";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <SectionHead 
        title="Appointments" 
        sub="Real-time priority queue" 
        t={t}
        action={<Btn onClick={() => setModal(true)} icon="plus" t={t}>Book Appointment</Btn>} 
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: "🚨 Emergency",    val: emergencyCount,   color: t.red,   glow: emergencyCount > 0 },
          { label: "⏰ Overdue",       val: overdueCount,     color: t.red,   glow: overdueCount > 0 },
          { label: "⏳ Next 60 min",  val: upcomingCount,    color: t.amber, glow: upcomingCount > 0 },
          { label: "📋 Active",        val: active.length,    color: t.accent,glow: false },
        ].map(s => (
          <div 
            key={s.label} 
            className="rounded-xl p-3 flex items-center gap-3 shadow-sm border transition-all"
            style={{ 
              background: s.glow ? s.color + "18" : t.card, 
              borderColor: s.glow ? s.color + "66" : t.border,
              boxShadow: s.glow ? `0 0 12px ${s.color}22` : "none"
            }}
          >
            <div className="font-black text-2xl leading-none" style={{ color: s.color }}>{s.val}</div>
            <div className="text-[10px] font-bold leading-tight uppercase tracking-wider" style={{ color: s.glow ? s.color : t.textMuted }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: t.green, boxShadow: `0 0 8px ${t.green}99` }} />
        <span className="text-xs" style={{ color: t.textMuted }}>Live · {now_.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {["All", ...PRIORITIES].map(p => (
          <button 
            key={p} 
            onClick={() => setFilterPriority(p)}
            className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all border-1.5"
            style={{ 
              background: filterPriority === p ? t.accent : t.card, 
              color: filterPriority === p ? "#fff" : t.textMuted, 
              borderColor: filterPriority === p ? t.accent : t.border 
            }}
          >
            {p !== "All" && PRIORITY_ICONS[p]} {p}
            {p !== "All" && <span className="ml-1 px-1.5 rounded-lg text-[10px]" style={{ background: filterPriority === p ? "#ffffff30" : t.bg }}>{list.filter(a => effectivePriority(a) === p).length}</span>}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border" style={{ borderColor: t.border }}>
        <table className="w-full border-collapse min-w-[700px]">
          <thead>
            <tr style={{ background: t.bg }}>
              {["Priority", "ID", "Patient", "Doctor", "Date & Time", "Countdown", "Reason", "Status", "Actions"].map((c, i) => (
                <th key={i} className="px-4 py-3 text-left text-[11px] font-bold tracking-wider uppercase whitespace-nowrap border-b" style={{ color: t.textMuted, borderColor: t.border }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-sm" style={{ color: t.textMuted }}>No appointments found</td></tr>
            ) : sorted.map((a, ri) => {
              const pat = state.patients.find(x => x.id === a.patientId);
              const doc = state.doctors.find(x => x.id === a.doctorId);
              const ep  = effectivePriority(a);
              const escalated = ep !== (a.priority || "Normal") && a.status !== "Completed" && a.status !== "Cancelled";
              const isOverdue = (() => { const m = minsUntil(a); return m !== null && m < 0; })();
              const rowBg = ep === "Emergency" && a.status !== "Completed" && a.status !== "Cancelled"
                ? t.red + "0a" : isOverdue ? t.amber + "06" : "transparent";
              return (
                <tr key={a.id} className={ri < sorted.length - 1 ? "border-b" : ""} style={{ borderColor: t.border, background: rowBg }}>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{PRIORITY_ICONS[ep]}</span>
                      <Badge label={ep} type={PRIORITY_COLORS[ep]} t={t} />
                      {escalated && <span className="text-[9px] font-extrabold px-1.5 rounded-md border" style={{ color: t.amber, background: t.amber + "22", borderColor: t.amber + "44" }}>AUTO↑</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold" style={{ color: t.accent }}>#{a.id}</td>
                  <td className="px-4 py-3 text-sm font-semibold whitespace-nowrap" style={{ color: t.text }}>{pat?.name || `#${a.patientId}`}</td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: t.textSub }}>{doc?.name || `#${a.doctorId}`}</td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <span className="font-semibold" style={{ color: t.text }}>{a.date}</span>
                    <span className="ml-1.5" style={{ color: t.textMuted }}>{a.time}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{countdownLabel(a)}</td>
                  <td className="px-4 py-3 text-sm truncate max-w-[160px]" style={{ color: t.textSub }}>{a.reason}</td>
                  <td className="px-4 py-3"><Badge label={a.status} type={statColor(a.status)} t={t} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {canChangeStatus && ["Confirmed","Completed","Cancelled"].map(s => (
                        <Btn key={s} size="sm" ghost color={s === "Confirmed" ? t.green : s === "Completed" ? t.accent : t.red} t={t}
                          onClick={() => dispatch({ type: "__ACTION__", action: { type: "UPD_APPT", id: a.id, status: s } })}>
                          {s[0]}
                        </Btn>
                      ))}
                      {canDelete && <Btn size="sm" ghost color={t.red} t={t} icon="trash" onClick={() => dispatch({ type: "__ACTION__", action: { type: "DEL_APPT", id: a.id } })} />}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Book Appointment" t={t}>
        <div className="mb-4">
          <label className="block text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: t.textSub }}>Priority Level <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-2 gap-2">
            {PRIORITIES.map(p => (
              <button 
                key={p} 
                onClick={() => setF({ ...f, priority: p as any })}
                className="flex items-center justify-center gap-2 rounded-xl p-2.5 font-bold text-sm transition-all border-1.5"
                style={{ 
                  background: f.priority === p ? t.badge[PRIORITY_COLORS[p]][0] : t.input, 
                  color: f.priority === p ? t.badge[PRIORITY_COLORS[p]][1] : t.textMuted, 
                  borderColor: f.priority === p ? t.badge[PRIORITY_COLORS[p]][1] : t.inputBorder 
                }}
              >
                {PRIORITY_ICONS[p]} {p}
              </button>
            ))}
          </div>
        </div>
        {role !== "Patient" && (
          <Field label="Patient" value={f.patientId} onChange={(v: string) => setF({ ...f, patientId: v })}
            options={state.patients.map(p => ({ v: p.id, l: `#${p.id} — ${p.name}` }))} required t={t} />
        )}
        <Field label="Doctor" value={f.doctorId} onChange={(v: string) => setF({ ...f, doctorId: v })}
          options={state.doctors.filter(d => d.available).map(d => ({ v: d.id, l: `${d.name} (${d.spec})` }))} required t={t} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date" type="date" value={f.date} onChange={(v: string) => setF({ ...f, date: v })} t={t} />
          <Field label="Time" type="time" value={f.time} onChange={(v: string) => setF({ ...f, time: v })} t={t} />
        </div>
        <Field label="Reason" value={f.reason} onChange={(v: string) => setF({ ...f, reason: v })} t={t} />
        <Btn onClick={submit} t={t} icon="check" className="w-full mt-2">Book Appointment</Btn>
      </Modal>
    </motion.div>
  );
}
