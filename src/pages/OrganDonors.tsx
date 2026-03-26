import React, { useState } from "react";
import { SectionHead, Btn, Badge, Modal, Field, CustomPill } from "../components/UI";
import { AppState } from "../types";
import { motion } from "motion/react";

export function OrganDonors({ state, dispatch, role, requester, t }: { state: AppState, dispatch: any, role: string, requester: string, t: any }) {
  const [modal, setModal] = useState(false);
  const [f, setF] = useState({ name: "", phone: "", blood: "A+", organs: "", consent: true });
  
  const submit = () => {
    if (!f.name || !f.organs) return;
    dispatch({ type: "ADD_ORGAN_DONOR", p: { ...f, regBy: requester } });
    setModal(false); setF({ name: "", phone: "", blood: "A+", organs: "" });
  };

  const organTypes = ["Kidney", "Liver", "Heart", "Cornea", "Lungs", "Pancreas"];
  const organCounts = organTypes.map(o => ({ o, c: state.organDonors.filter(d => d.organs.includes(o)).length }));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <SectionHead 
        title="Organ Donors" 
        sub="Life-saving organ donation registry" 
        t={t}
        action={<Btn onClick={() => setModal(true)} icon="organ" color={t.purple} t={t}>Register Donor</Btn>} 
      />

      <div className="p-5 rounded-2xl border shadow-sm mb-6" style={{ background: t.card, borderColor: t.purple + "33" }}>
        <h3 className="font-bold text-sm mb-4 uppercase tracking-wider" style={{ color: t.textMuted }}>Organ Registry Summary</h3>
        <div className="flex flex-wrap gap-6">
          {organCounts.map(({ o, c }) => (
            <div key={o} className="text-center">
              <div className="font-black text-2xl" style={{ color: t.purple }}>{c}</div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: t.textMuted }}>{o}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.organDonors.map(d => (
          <div key={d.id} className="p-5 rounded-2xl border shadow-sm" style={{ background: t.card, borderColor: t.purple + "33" }}>
            <div className="flex justify-between items-start mb-4">
              <span className="font-bold text-base" style={{ color: t.text }}>{d.name}</span>
              <Badge label={d.consent ? "Consented" : "Pending"} type={d.consent ? "green" : "amber"} t={t} />
            </div>
            <div className="text-xs mb-1.5" style={{ color: t.textMuted }}>📞 {d.phone} · <span className="font-bold" style={{ color: t.red }}>{d.blood}</span></div>
            <div className="text-[10px] font-bold mb-4" style={{ color: t.textMuted }}>Registered: {d.regDate}</div>
            <div className="flex flex-wrap gap-1.5">
              {d.organs.split(",").map(o => <CustomPill key={o} label={o.trim()} color={t.purple} />)}
            </div>
            {role === "Admin" && (
              <button 
                onClick={() => dispatch({ type: "DEL_ORGAN_DONOR", id: d.id })}
                className="mt-4 text-[10px] font-black uppercase tracking-widest transition-colors hover:text-red-500"
                style={{ color: t.textMuted }}
              >
                Remove Entry
              </button>
            )}
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Register Organ Donor" t={t}>
        <div className="space-y-4">
          <Field label="Full Name" value={f.name} onChange={(v: string) => setF({ ...f, name: v })} required t={t} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone" value={f.phone} onChange={(v: string) => setF({ ...f, phone: v })} t={t} />
            <Field label="Blood Group" value={f.blood} onChange={(v: string) => setF({ ...f, blood: v })} options={["A+","A-","B+","B-","O+","O-","AB+","AB-"]} t={t} />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: t.textSub }}>Organs to Donate</label>
            <div className="flex flex-wrap gap-2">
              {organTypes.map(o => {
                const sel = f.organs.includes(o);
                return (
                  <button 
                    key={o} 
                    onClick={() => {
                      const arr = f.organs ? f.organs.split(",").map(x => x.trim()).filter(Boolean) : [];
                      const next = sel ? arr.filter(x => x !== o) : [...arr, o];
                      setF({ ...f, organs: next.join(",") });
                    }} 
                    className="rounded-xl px-4 py-2 text-xs font-bold transition-all border-1.5"
                    style={{ 
                      background: sel ? t.purple + "22" : t.input, 
                      color: sel ? t.purple : t.textMuted, 
                      borderColor: sel ? t.purple : t.inputBorder 
                    }}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
          </div>
          <Btn onClick={submit} color={t.purple} t={t} icon="check" className="w-full mt-2">Register as Organ Donor</Btn>
        </div>
      </Modal>
    </motion.div>
  );
}
