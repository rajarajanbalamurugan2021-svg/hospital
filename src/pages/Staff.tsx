import React, { useState } from "react";
import { SectionHead, Btn, Badge, Modal, Field, Table } from "../components/UI";
import { AppState } from "../types";
import { motion } from "motion/react";

export function StaffPage({ state, dispatch, t }: { state: AppState, dispatch: any, t: any }) {
  const [modal, setModal] = useState(false);
  const [f, setF] = useState({ name: "", role: "Nurse", dept: "", phone: "", shift: "Morning", pass: "" });
  
  const submit = () => {
    if (!f.name || !f.phone) return;
    dispatch({ type: "ADD_STAFF", p: f });
    setModal(false); setF({ name: "", role: "Nurse", dept: "", phone: "", shift: "Morning", pass: "" });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <SectionHead 
        title="Staff Management" 
        sub={`${state.staff.length} active staff members`} 
        t={t}
        action={<Btn onClick={() => setModal(true)} icon="plus" t={t}>Add Staff</Btn>} 
      />
      
      <Table t={t} cols={["ID", "Name", "Role", "Department", "Phone", "Shift", "Action"]}
        rows={state.staff.map(s => [
          <span className="font-bold" style={{ color: t.accent }}>#{s.id}</span>,
          <span className="font-semibold" style={{ color: t.text }}>{s.name}</span>,
          <Badge label={s.role} type="purple" t={t} />, 
          s.dept, 
          s.phone,
          <Badge label={s.shift} type="blue" t={t} />,
          <Btn size="sm" ghost color={t.red} t={t} icon="trash" onClick={() => dispatch({ type: "DEL_STAFF", id: s.id })} />
        ])}
      />

      <Modal open={modal} onClose={() => setModal(false)} title="Add Staff Member" t={t}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
          <div className="sm:col-span-2"><Field label="Full Name" value={f.name} onChange={(v: string) => setF({ ...f, name: v })} required t={t} /></div>
          <Field label="Role" value={f.role} onChange={(v: string) => setF({ ...f, role: v })} options={["Doctor","Nurse","Lab Tech","Pharmacist","Admin Staff","Support"]} t={t} />
          <Field label="Department" value={f.dept} onChange={(v: string) => setF({ ...f, dept: v })} t={t} />
          <Field label="Phone" value={f.phone} onChange={(v: string) => setF({ ...f, phone: v })} required t={t} />
          <Field label="Shift" value={f.shift} onChange={(v: string) => setF({ ...f, shift: v })} options={["Morning","Evening","Night"]} t={t} />
          <div className="sm:col-span-2"><Field label="Password" type="password" value={f.pass} onChange={(v: string) => setF({ ...f, pass: v })} required t={t} /></div>
        </div>
        <Btn onClick={submit} t={t} icon="check" className="w-full mt-2">Add Staff Member</Btn>
      </Modal>
    </motion.div>
  );
}
