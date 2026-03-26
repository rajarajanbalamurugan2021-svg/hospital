import React, { useState } from "react";
import { SectionHead, Btn, Icon, Badge, Modal, Field, Table } from "../components/UI";
import { AppState, MedicalRecord } from "../types";
import { motion } from "motion/react";

export function MedRecords({ state, dispatch, role, loggedId, doctorId, t }: { state: AppState, dispatch: any, role: string, loggedId: number, doctorId: number, t: any }) {
  const [modal, setModal] = useState(false);
  const [viewRecord, setViewRecord] = useState<MedicalRecord | null>(null);
  const [filter, setFilter] = useState("");
  const [f, setF] = useState({ patientId: "", doctorId: "", diagnosis: "", prescription: "", notes: "" });

  const list = role === "Patient"
    ? state.records.filter(r => r.patientId === loggedId)
    : role === "Doctor"
    ? state.records.filter(r => r.doctorId === doctorId)
    : state.records.filter(r => !filter || String(r.patientId).includes(filter) || (state.patients.find(p => p.id === r.patientId)?.name || "").toLowerCase().includes(filter.toLowerCase()));

  const canAdd = role === "Admin" || role === "Doctor" || role === "Staff";
  const canDelete = role === "Admin";

  const submit = () => {
    if (!f.patientId || !f.diagnosis) return;
    const docId = role === "Doctor" ? doctorId : +f.doctorId;
    dispatch({ type: "ADD_RECORD", p: { patientId: +f.patientId, doctorId: docId, diagnosis: f.diagnosis, prescription: f.prescription, notes: f.notes } });
    setModal(false); setF({ patientId: "", doctorId: "", diagnosis: "", prescription: "", notes: "" });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <SectionHead 
        title="Medical Records" 
        sub={`${list.length} records found`} 
        t={t}
        action={canAdd && <Btn onClick={() => setModal(true)} icon="plus" t={t}>Add Record</Btn>} 
      />

      {role !== "Patient" && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-2 border-1.5 mb-4 shadow-sm" style={{ background: t.input, borderColor: t.inputBorder }}>
          <Icon name="search" size={16} color={t.textMuted} />
          <input 
            value={filter} 
            onChange={e => setFilter(e.target.value)} 
            placeholder="Filter by Patient ID or Name…" 
            className="bg-transparent border-none outline-none text-sm flex-1"
            style={{ color: t.text }}
          />
        </div>
      )}

      <div className="space-y-3">
        {list.map(r => {
          const p = state.patients.find(x => x.id === r.patientId);
          const d = state.doctors.find(x => x.id === r.doctorId);
          return (
            <div key={r.id} className="p-5 rounded-2xl border shadow-sm" style={{ background: t.card, borderColor: t.border }}>
              <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                <div>
                  <div className="font-bold text-base" style={{ color: t.text }}>{p?.name || `Patient #${r.patientId}`}</div>
                  <div className="text-xs mt-1" style={{ color: t.textMuted }}>
                    Record #{r.id} · {r.date}
                    {p && <span className="ml-2">· Age {p.age} · {p.blood} · {p.gender}</span>}
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge label={d?.name || `Dr. #${r.doctorId}`} type="green" t={t} />
                  <Btn size="sm" ghost color={t.accent} t={t} icon="file" onClick={() => setViewRecord(r)}>View</Btn>
                  {canDelete && <Btn size="sm" ghost color={t.red} t={t} icon="trash" onClick={() => dispatch({ type: "DEL_RECORD", id: r.id })} />}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[["Diagnosis", r.diagnosis, t.red], ["Prescription", r.prescription, t.green], ["Notes", r.notes, t.textMuted]].map(([l, v, c]) => (
                  <div key={l as string}>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: t.textMuted }}>{l as string}</div>
                    <div className="text-sm font-medium" style={{ color: c as string }}>{v as string || "—"}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {list.length === 0 && <div className="text-center p-12 text-sm" style={{ color: t.textMuted }}>No records found</div>}
      </div>

      <Modal open={!!viewRecord} onClose={() => setViewRecord(null)} title="Patient Medical Record" t={t} wide>
        {viewRecord && (() => {
          const p = state.patients.find(x => x.id === viewRecord.patientId);
          const d = state.doctors.find(x => x.id === viewRecord.doctorId);
          const allPatientRecords = state.records.filter(r => r.patientId === viewRecord.patientId);
          return (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl border flex flex-wrap items-center gap-4 shadow-inner" style={{ background: `linear-gradient(135deg, ${t.accent}18, ${t.purple}10)`, borderColor: t.accent + "33" }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md" style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.purple})` }}>
                  <Icon name="user" size={26} color="#fff" />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <div className="font-black text-xl" style={{ color: t.text }}>{p?.name || `Patient #${viewRecord.patientId}`}</div>
                  <div className="text-xs mt-1" style={{ color: t.textMuted }}>
                    ID: #{p?.id} · Age: {p?.age} · {p?.gender} · Blood: <span className="font-bold" style={{ color: t.red }}>{p?.blood}</span>
                  </div>
                  <div className="text-xs" style={{ color: t.textMuted }}>📞 {p?.phone} · 📍 {p?.address}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>Registered</div>
                  <div className="font-bold text-sm" style={{ color: t.text }}>{p?.reg}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>Current Record — {viewRecord.date}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[["🩺 Diagnosis", viewRecord.diagnosis, t.red], ["💊 Prescription", viewRecord.prescription, t.green]].map(([l, v, c]) => (
                    <div key={l as string} className="p-4 rounded-xl border shadow-sm" style={{ background: t.bg, borderColor: t.border }}>
                      <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: t.textMuted }}>{l as string}</div>
                      <div className="text-base font-bold" style={{ color: c as string }}>{v as string || "—"}</div>
                    </div>
                  ))}
                </div>
                {viewRecord.notes && (
                  <div className="p-4 rounded-xl border shadow-sm" style={{ background: t.bg, borderColor: t.border }}>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: t.textMuted }}>📝 Notes</div>
                    <div className="text-sm font-medium leading-relaxed" style={{ color: t.textSub }}>{viewRecord.notes}</div>
                  </div>
                )}
                <div className="text-xs font-bold" style={{ color: t.textMuted }}>
                  Attending: <span style={{ color: t.green }}>{d?.name || `Dr. #${viewRecord.doctorId}`}</span> · {d?.spec}
                </div>
              </div>

              {allPatientRecords.length > 1 && (
                <div className="space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>Visit History ({allPatientRecords.length} visits)</div>
                  <div className="space-y-2">
                    {allPatientRecords.map(r => {
                      const dr = state.doctors.find(x => x.id === r.doctorId);
                      return (
                        <div key={r.id} className="flex gap-3 items-start py-2 border-b last:border-0" style={{ borderColor: t.border }}>
                          <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ background: r.id === viewRecord.id ? t.accent : t.border }} />
                          <div className="flex-1">
                            <div className="text-sm font-bold" style={{ color: t.text }}>{r.diagnosis}</div>
                            <div className="text-[10px]" style={{ color: t.textMuted }}>{r.date} · {dr?.name}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Medical Record" t={t}>
        <div className="space-y-3">
          <Field label="Patient" value={f.patientId} onChange={(v: string) => setF({ ...f, patientId: v })}
            options={state.patients.map(p => ({ v: p.id, l: `#${p.id} — ${p.name}` }))} required t={t} />
          {role !== "Doctor" && (
            <Field label="Doctor" value={f.doctorId} onChange={(v: string) => setF({ ...f, doctorId: v })}
              options={state.doctors.map(d => ({ v: d.id, l: d.name }))} t={t} />
          )}
          <Field label="Diagnosis" value={f.diagnosis} onChange={(v: string) => setF({ ...f, diagnosis: v })} required t={t} />
          <Field label="Prescription" value={f.prescription} onChange={(v: string) => setF({ ...f, prescription: v })} t={t} />
          <Field label="Notes" value={f.notes} onChange={(v: string) => setF({ ...f, notes: v })} t={t} />
          <Btn onClick={submit} t={t} icon="check" className="w-full mt-2">Save Medical Record</Btn>
        </div>
      </Modal>
    </motion.div>
  );
}
