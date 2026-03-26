import React, { useState } from "react";
import { SectionHead, Btn, Badge, Modal, Field, Table } from "../components/UI";
import { AppState } from "../types";
import { motion } from "motion/react";

export function BloodDonors({ state, dispatch, role, requester, t }: { state: AppState, dispatch: any, role: string, requester: string, t: any }) {
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState("All");
  const [f, setF] = useState({ name: "", blood: "A+", phone: "", address: "", lastDonation: "" });
  
  const groups = ["All", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
  const list = state.bloodDonors.filter(d => filter === "All" || d.blood === filter);

  const submit = () => {
    if (!f.name || !f.phone) return;
    dispatch({ type: "ADD_BLOOD_DONOR", p: { ...f, regBy: requester } });
    setModal(false); setF({ name: "", blood: "A+", phone: "", address: "", lastDonation: "" });
  };

  const bloodStats = ["O+", "A+", "B+", "AB-"].map(g => ({ g, count: state.bloodDonors.filter(d => d.blood === g).length }));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <SectionHead 
        title="Blood Donors" 
        sub={`${state.bloodDonors.length} registered donors in database`} 
        t={t}
        action={<Btn onClick={() => setModal(true)} icon="heart" color={t.red} t={t}>Register Donor</Btn>} 
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {bloodStats.map(s => (
          <div key={s.g} className="p-4 rounded-xl border text-center shadow-sm" style={{ background: t.card, borderColor: "#e11d4833" }}>
            <div className="font-black text-2xl" style={{ color: "#e11d48" }}>{s.g}</div>
            <div className="font-bold text-lg" style={{ color: t.text }}>{s.count}</div>
            <div className="text-[10px] uppercase font-bold tracking-wider" style={{ color: t.textMuted }}>donors</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {groups.map(g => (
          <button 
            key={g} 
            onClick={() => setFilter(g)}
            className="rounded-full px-4 py-1.5 text-xs font-bold transition-all border"
            style={{ 
              background: filter === g ? "#e11d48" : t.card, 
              color: filter === g ? "#fff" : t.textMuted, 
              borderColor: filter === g ? "#e11d48" : t.border 
            }}
          >
            {g}
          </button>
        ))}
      </div>

      <Table t={t} cols={["ID", "Name", "Blood", "Phone", "Address", "Last Donation", "Available", ...(role === "Admin" ? ["Toggle"] : [])]}
        rows={list.map(d => [
          <span className="font-bold" style={{ color: t.accent }}>#{d.id}</span>,
          <span className="font-semibold" style={{ color: t.text }}>{d.name}</span>,
          <Badge label={d.blood} type="red" t={t} />,
          d.phone, 
          <span className="text-xs truncate max-w-[120px] block">{d.address}</span>, 
          <span className="text-[10px]">{d.lastDonation || "—"}</span>,
          <Badge label={d.available ? "Yes" : "No"} type={d.available ? "green" : "red"} t={t} />,
          ...(role === "Admin" ? [
            <Btn size="sm" ghost color={d.available ? t.red : t.green} t={t}
              onClick={() => dispatch({ type: "TOGGLE_BLOOD", id: d.id })}>
              {d.available ? "Pause" : "Activate"}
            </Btn>
          ] : []),
        ])}
      />

      <Modal open={modal} onClose={() => setModal(false)} title="Register Blood Donor" t={t}>
        <div className="space-y-4">
          <Field label="Full Name" value={f.name} onChange={(v: string) => setF({ ...f, name: v })} required t={t} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Blood Group" value={f.blood} onChange={(v: string) => setF({ ...f, blood: v })} options={["A+","A-","B+","B-","O+","O-","AB+","AB-"]} t={t} />
            <Field label="Phone" value={f.phone} onChange={(v: string) => setF({ ...f, phone: v })} required t={t} />
          </div>
          <Field label="Address" value={f.address} onChange={(v: string) => setF({ ...f, address: v })} t={t} />
          <Field label="Last Donation Date" type="date" value={f.lastDonation} onChange={(v: string) => setF({ ...f, lastDonation: v })} t={t} />
          <Btn onClick={submit} color={t.red} t={t} icon="check" className="w-full mt-2">Register Donor</Btn>
        </div>
      </Modal>
    </motion.div>
  );
}
