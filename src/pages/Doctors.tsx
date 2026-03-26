import React, { useState } from "react";
import { SectionHead, Btn, Icon, Badge, Modal, Field } from "../components/UI";
import { AppState, Doctor } from "../types";
import { motion } from "motion/react";

export function Doctors({ state, dispatch, role, t }: { state: AppState, dispatch: any, role: string, t: any }) {
  const [modal, setModal] = useState(false);
  const [showCreds, setShowCreds] = useState<Doctor | null>(null);
  const [editModal, setEditModal] = useState<Doctor | null>(null);
  const [idError, setIdError] = useState("");

  const INIT_F = { id: "", name: "", spec: "", phone: "", schedule: "", pass: "" };
  const [f, setF] = useState(INIT_F);
  const [ef, setEf] = useState({ pass: "", confirmPass: "" });

  const validateId = (id: string) => {
    if (!id) return "Doctor ID is required.";
    if (!/^\d+$/.test(id)) return "ID must be numeric.";
    if (state.doctors.find(d => d.id === +id)) return `ID ${id} is already taken.`;
    return "";
  };

  const submit = () => {
    const err = validateId(f.id);
    if (err) { setIdError(err); return; }
    if (!f.name) { setIdError("Name is required."); return; }
    if (!f.pass) { setIdError("Password is required."); return; }
    dispatch({ type: "ADD_DOCTOR", p: { ...f, id: +f.id } });
    setModal(false); setF(INIT_F); setIdError("");
    setShowCreds({ ...f, id: +f.id } as any);
  };

  const saveEdit = () => {
    if (!ef.pass || ef.pass !== ef.confirmPass || !editModal) return;
    dispatch({ type: "UPD_DOCTOR", id: editModal.id, upd: { pass: ef.pass } });
    setEditModal(null); setEf({ pass: "", confirmPass: "" });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <SectionHead 
        title="Doctors" 
        sub={`${state.doctors.length} specialists available`} 
        t={t}
        action={role === "Admin" && <Btn onClick={() => { setModal(true); setIdError(""); }} icon="plus" t={t}>Add Doctor</Btn>} 
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.doctors.map((d, i) => (
          <motion.div 
            key={d.id} 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: i * 0.05 }}
            className="p-5 rounded-2xl border shadow-sm transition-all hover:shadow-md" 
            style={{ background: t.card, borderColor: d.available ? t.green + "44" : t.border }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-inner" style={{ background: t.green + "1e" }}>
                <Icon name="stethoscope" size={22} color={t.green} />
              </div>
              <Badge label={d.available ? "Available" : "Unavailable"} type={d.available ? "green" : "red"} t={t} />
            </div>
            <div className="font-bold text-base mb-0.5" style={{ color: t.text }}>{d.name}</div>
            <div className="text-xs font-bold mb-3" style={{ color: t.accent }}>{d.spec}</div>
            <div className="space-y-1.5 mb-4">
              <div className="text-xs flex items-center gap-2" style={{ color: t.textMuted }}>
                <Icon name="loc" size={12} color={t.textMuted} /> {d.phone}
              </div>
              <div className="text-xs flex items-center gap-2" style={{ color: t.textMuted }}>
                <Icon name="calendar" size={12} color={t.textMuted} /> {d.schedule}
              </div>
            </div>
            <div className="p-2 rounded-lg mb-4 flex items-center gap-2" style={{ background: t.accent + "12", border: `1px solid ${t.accent}33` }}>
              <Icon name="shield" size={12} color={t.accent} />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: t.accent }}>ID: #{d.id}</span>
            </div>
            {role === "Admin" && (
              <div className="flex gap-2 flex-wrap">
                <Btn size="sm" ghost color={d.available ? t.red : t.green} t={t}
                  onClick={() => dispatch({ type: "TOGGLE_DOCTOR", id: d.id })}>
                  {d.available ? "Unavailable" : "Available"}
                </Btn>
                <Btn size="sm" ghost color={t.purple} t={t} icon="shield" onClick={() => setShowCreds(d)}>Creds</Btn>
                <Btn size="sm" ghost color={t.accent} t={t} icon="edit" onClick={() => { setEditModal(d); setEf({ pass: "", confirmPass: "" }); }}>Edit</Btn>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <Modal open={modal} onClose={() => { setModal(false); setIdError(""); }} title="Add Doctor" t={t}>
        <div className="p-4 rounded-xl border mb-4" style={{ background: t.green + "0e", borderColor: t.green + "33" }}>
          <div className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: t.green }}>🔐 Login Credentials</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Field label="Doctor ID" value={f.id} onChange={(v: string) => { setF({ ...f, id: v }); setIdError(""); }} required t={t} placeholder="e.g. 401" />
              {idError && <div className="text-[10px] -mt-2 mb-2" style={{ color: t.red }}>{idError}</div>}
            </div>
            <Field label="Password" type="password" value={f.pass} onChange={(v: string) => setF({ ...f, pass: v })} required t={t} placeholder="Set a password" />
          </div>
        </div>
        <Field label="Full Name" value={f.name} onChange={(v: string) => setF({ ...f, name: v })} required t={t} />
        <Field label="Specialization" value={f.spec} onChange={(v: string) => setF({ ...f, spec: v })} t={t} />
        <Field label="Phone" value={f.phone} onChange={(v: string) => setF({ ...f, phone: v })} t={t} />
        <Field label="Schedule (e.g. Mon-Fri 09-17)" value={f.schedule} onChange={(v: string) => setF({ ...f, schedule: v })} t={t} />
        <Btn onClick={submit} t={t} icon="check" className="w-full mt-2">Add Doctor</Btn>
      </Modal>

      <Modal open={!!showCreds} onClose={() => setShowCreds(null)} title="Doctor Credentials" t={t}>
        {showCreds && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl border" style={{ background: `linear-gradient(135deg, ${t.green}12, ${t.accent}0a)`, borderColor: t.green + "33" }}>
              <div className="flex gap-4 items-center mb-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg" style={{ background: `linear-gradient(135deg, ${t.green}, ${t.accent})` }}>
                  <Icon name="stethoscope" size={26} color="#fff" />
                </div>
                <div>
                  <div className="font-extrabold text-lg" style={{ color: t.text }}>{showCreds.name}</div>
                  <div className="text-xs font-bold" style={{ color: t.green }}>{showCreds.spec}</div>
                </div>
              </div>
              <div className="space-y-2.5">
                {[
                  ["Doctor ID (Login Username)", String(showCreds.id), t.accent],
                  ["Login Password", showCreds.pass || "—", t.purple],
                  ["Phone", showCreds.phone, t.textSub],
                  ["Schedule", showCreds.schedule, t.textSub],
                ].map(([label, val, color]) => (
                  <div key={label} className="p-3 rounded-xl border" style={{ background: t.bg, borderColor: t.border }}>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: t.textMuted }}>{label}</div>
                    <div className="text-base font-bold font-mono" style={{ color }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 rounded-xl border text-xs font-semibold" style={{ background: t.amber + "15", borderColor: t.amber + "33", color: t.amber }}>
              ⚠️ Share these credentials with the doctor securely.
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!editModal} onClose={() => setEditModal(null)} title={`Edit Doctor — #${editModal?.id}`} t={t}>
        {editModal && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border" style={{ background: t.card, borderColor: t.border }}>
              <div className="font-bold text-base" style={{ color: t.text }}>{editModal.name}</div>
              <div className="text-xs" style={{ color: t.textMuted }}>ID: #{editModal.id} · {editModal.spec}</div>
            </div>
            <div className="text-xs font-medium" style={{ color: t.textSub }}>Change login password for this doctor:</div>
            <Field label="New Password" type="password" value={ef.pass} onChange={(v: string) => setEf({ ...ef, pass: v })} required t={t} />
            <Field label="Confirm Password" type="password" value={ef.confirmPass} onChange={(v: string) => setEf({ ...ef, confirmPass: v })} required t={t} />
            {ef.pass && ef.confirmPass && ef.pass !== ef.confirmPass && (
              <div className="text-xs -mt-2" style={{ color: t.red }}>Passwords do not match.</div>
            )}
            <Btn onClick={saveEdit} t={t} icon="check" className="w-full" disabled={!ef.pass || ef.pass !== ef.confirmPass}>Save Password</Btn>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
