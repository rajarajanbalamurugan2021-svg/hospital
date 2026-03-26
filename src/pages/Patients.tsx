import React, { useState } from "react";
import { SectionHead, Btn, Icon, Table, Badge, Modal, Field } from "../components/UI";
import { AppState, Patient } from "../types";
import { motion } from "motion/react";

export function Patients({ state, dispatch, role, t }: { state: AppState, dispatch: any, role: string, t: any }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState<Patient | null>(null);
  const [credsModal, setCredsModal] = useState<Patient | null>(null);
  const [idError, setIdError] = useState("");

  const today = () => new Date().toISOString().slice(0, 10);

  const INIT_F = { id: "", name: "", age: "", gender: "Male", phone: "", address: "", blood: "A+", pass: "" };
  const [f, setF] = useState(INIT_F);
  const [ef, setEf] = useState({ pass: "", confirmPass: "" });

  const list = state.patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || String(p.id).includes(search)
  );

  const validateId = (id: string) => {
    if (!id) return "Patient ID is required.";
    if (!/^\d+$/.test(id)) return "ID must be numeric.";
    if (state.patients.find(p => p.id === +id)) return `ID ${id} is already taken.`;
    return "";
  };

  const submit = () => {
    const err = validateId(f.id);
    if (err) { setIdError(err); return; }
    if (!f.name || !f.phone) return;
    if (!f.pass) { setIdError("Password is required."); return; }
    const newPatient = { ...f, id: +f.id, age: +f.age, reg: today() };
    dispatch({ type: "ADD_PATIENT", p: newPatient });
    setModal(false);
    setCredsModal(newPatient as any);
    setF(INIT_F); setIdError("");
  };

  const saveEdit = () => {
    if (!ef.pass || !editModal) return;
    if (ef.pass !== ef.confirmPass) return;
    dispatch({ type: "UPD_PATIENT", id: editModal.id, upd: { pass: ef.pass } });
    setEditModal(null); setEf({ pass: "", confirmPass: "" });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <SectionHead 
        title="Patient Management" 
        sub={`${list.length} patients registered`} 
        t={t}
        action={role !== "Patient" && <Btn onClick={() => { setModal(true); setIdError(""); }} icon="plus" t={t}>Add Patient</Btn>} 
      />

      <div className="flex gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 rounded-xl px-4 py-2 border-1.5" style={{ background: t.input, borderColor: t.inputBorder }}>
          <Icon name="search" size={16} color={t.textMuted} />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by name or ID…"
            className="bg-transparent border-none outline-none text-sm flex-1"
            style={{ color: t.text }}
          />
        </div>
      </div>

      <Table t={t}
        cols={["ID", "Name", "Age", "Gender", "Blood", "Phone", "Address", "Registered", ...(role === "Admin" ? ["Actions"] : [])]}
        rows={list.map(p => [
          <span className="font-bold" style={{ color: t.accent }}>#{p.id}</span>,
          <span className="font-semibold" style={{ color: t.text }}>{p.name}</span>,
          p.age, p.gender,
          <Badge label={p.blood} type="red" t={t} />,
          p.phone, p.address, p.reg,
          ...(role === "Admin" ? [
            <div className="flex gap-1.5">
              <Btn size="sm" ghost color={t.purple} t={t} icon="shield" onClick={() => setCredsModal(p)}>ID</Btn>
              <Btn size="sm" ghost color={t.accent} t={t} icon="edit" onClick={() => { setEditModal(p); setEf({ pass: "", confirmPass: "" }); }}>Edit</Btn>
              <Btn size="sm" ghost color={t.red} t={t} icon="trash" onClick={() => dispatch({ type: "DEL_PATIENT", id: p.id })} />
            </div>
          ] : []),
        ])}
      />

      <Modal open={modal} onClose={() => { setModal(false); setIdError(""); }} title="Register New Patient" t={t}>
        <div className="p-4 rounded-xl border mb-4" style={{ background: t.accent + "0e", borderColor: t.accent + "33" }}>
          <div className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: t.accent }}>🔐 Login Credentials</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Field label="Patient Login ID" value={f.id} onChange={(v: string) => { setF({ ...f, id: v }); setIdError(""); }} required t={t} placeholder="e.g. 2050" />
              {idError && <div className="text-[10px] -mt-2 mb-2" style={{ color: t.red }}>{idError}</div>}
            </div>
            <Field label="Password" type="password" value={f.pass} onChange={(v: string) => setF({ ...f, pass: v })} required t={t} placeholder="Set a password" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
          <div className="sm:col-span-2"><Field label="Full Name" value={f.name} onChange={(v: string) => setF({ ...f, name: v })} required t={t} /></div>
          <Field label="Age" type="number" value={f.age} onChange={(v: string) => setF({ ...f, age: v })} t={t} />
          <Field label="Gender" value={f.gender} onChange={(v: string) => setF({ ...f, gender: v })} options={["Male", "Female", "Other"]} t={t} />
          <Field label="Phone" value={f.phone} onChange={(v: string) => setF({ ...f, phone: v })} required t={t} />
          <Field label="Blood Group" value={f.blood} onChange={(v: string) => setF({ ...f, blood: v })} options={["A+","A-","B+","B-","O+","O-","AB+","AB-"]} t={t} />
          <div className="sm:col-span-2"><Field label="Address" value={f.address} onChange={(v: string) => setF({ ...f, address: v })} t={t} /></div>
        </div>
        <Btn onClick={submit} t={t} icon="check" className="w-full mt-2">Register Patient</Btn>
      </Modal>

      <Modal open={!!credsModal} onClose={() => setCredsModal(null)} title="Patient Credentials" t={t}>
        {credsModal && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl border" style={{ background: `linear-gradient(135deg, ${t.purple}12, ${t.accent}0a)`, borderColor: t.purple + "33" }}>
              <div className="flex gap-4 items-center mb-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg" style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.purple})` }}>
                  <Icon name="user" size={26} color="#fff" />
                </div>
                <div>
                  <div className="font-extrabold text-lg" style={{ color: t.text }}>{credsModal.name}</div>
                  <div className="text-xs" style={{ color: t.textMuted }}>Age {credsModal.age} · {credsModal.blood} · {credsModal.gender}</div>
                </div>
              </div>
              <div className="space-y-2.5">
                {[
                  ["Login ID (Patient ID)", String(credsModal.id), t.accent],
                  ["Password", credsModal.pass || "—", t.purple],
                  ["Phone", credsModal.phone, t.textSub],
                  ["Address", credsModal.address, t.textSub],
                ].map(([label, val, color]) => (
                  <div key={label} className="p-3 rounded-xl border" style={{ background: t.bg, borderColor: t.border }}>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: t.textMuted }}>{label}</div>
                    <div className="text-base font-bold font-mono" style={{ color }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 rounded-xl border text-xs font-semibold" style={{ background: t.amber + "15", borderColor: t.amber + "33", color: t.amber }}>
              ⚠️ Share these credentials with the patient securely.
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!editModal} onClose={() => setEditModal(null)} title={`Edit Patient — #${editModal?.id}`} t={t}>
        {editModal && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border" style={{ background: t.card, borderColor: t.border }}>
              <div className="font-bold text-base" style={{ color: t.text }}>{editModal.name}</div>
              <div className="text-xs" style={{ color: t.textMuted }}>ID: #{editModal.id} · {editModal.phone}</div>
            </div>
            <div className="text-xs font-medium" style={{ color: t.textSub }}>Change login password for this patient:</div>
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
