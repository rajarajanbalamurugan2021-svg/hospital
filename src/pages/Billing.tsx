import React, { useState } from "react";
import { SectionHead, Btn, Icon, Badge, Modal, Field, Table } from "../components/UI";
import { AppState, Bill } from "../types";
import { motion } from "motion/react";

const PAYMENT_METHODS = [
  { id: "cash",   label: "Cash",        icon: "💵", color: "#22d3a0" },
  { id: "card",   label: "Card",        icon: "💳", color: "#3b9eff" },
  { id: "upi",    label: "UPI",         icon: "📱", color: "#a78bfa" },
  { id: "online", label: "Net Banking", icon: "🌐", color: "#fb923c" },
  { id: "cheque", label: "Cheque",      icon: "🧾", color: "#f59e0b" },
];

export function Billing({ state, dispatch, role, loggedId, t }: { state: AppState, dispatch: any, role: string, loggedId: number, t: any }) {
  const [genModal,  setGenModal]  = useState(false);
  const [payModal,  setPayModal]  = useState<Bill | null>(null);
  const [viewModal, setViewModal] = useState<Bill | null>(null);
  const [f, setF] = useState({ patientId: "", consult: "", medicine: "", test: "", room: "", misc: "" });
  const [payMethod, setPayMethod] = useState("cash");
  const [txnId, setTxnId]         = useState("");
  const [txnError, setTxnError]   = useState("");

  const list = role === "Patient" ? state.bills.filter(b => b.patientId === loggedId) : state.bills;
  const totalRevenue = state.bills.filter(b => b.status === "Paid").reduce((a, b) => a + b.total, 0);
  const pendingAmount = state.bills.filter(b => b.status === "Unpaid").reduce((a, b) => a + b.total, 0);

  const submitBill = () => {
    if (!f.patientId) return;
    const consult = +f.consult||0, medicine = +f.medicine||0, test = +f.test||0, room = +f.room||0, misc = +f.misc||0;
    dispatch({ type: "ADD_BILL", p: { patientId: +f.patientId, consult, medicine, test, room, misc, total: consult+medicine+test+room+misc } });
    setGenModal(false); setF({ patientId:"", consult:"", medicine:"", test:"", room:"", misc:"" });
  };

  const confirmPayment = () => {
    if (!payMethod || !payModal) return;
    const needsTxn = ["card","upi","online","cheque"].includes(payMethod);
    if (needsTxn && !txnId.trim()) { setTxnError("Transaction ID is required."); return; }
    const finalTxn = needsTxn ? txnId.trim() : `CASH-${payModal.id}-${Date.now().toString(36).toUpperCase()}`;
    dispatch({ type: "PAY_BILL", id: payModal.id, method: payMethod, txnId: finalTxn });
    setViewModal({ ...payModal, status:"Paid", payMethod, paidAt: new Date().toLocaleString(), txnId: finalTxn });
    setPayModal(null); setTxnId(""); setTxnError("");
  };

  const methodLabel = (id: string) => PAYMENT_METHODS.find(m => m.id === id)?.label || id;
  const methodIcon  = (id: string) => PAYMENT_METHODS.find(m => m.id === id)?.icon  || "💰";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <SectionHead 
        title="Billing & Payments" 
        sub={`₹${totalRevenue.toLocaleString()} collected · ₹${pendingAmount.toLocaleString()} pending`} 
        t={t}
        action={role === "Admin" && <Btn onClick={() => setGenModal(true)} icon="plus" t={t}>Generate Bill</Btn>} 
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {[
          { l: "Total Bills",    v: list.length,                                    c: t.accent },
          { l: "Paid",          v: list.filter(b=>b.status==="Paid").length,        c: t.green  },
          { l: "Unpaid",        v: list.filter(b=>b.status==="Unpaid").length,      c: t.red    },
          { l: "Revenue (₹)",   v: `₹${totalRevenue.toLocaleString()}`,             c: t.green  },
          { l: "Pending (₹)",   v: `₹${pendingAmount.toLocaleString()}`,            c: t.amber  },
        ].map(c => (
          <div key={c.l} className="p-4 rounded-xl border text-center shadow-sm" style={{ background: t.card, borderColor: c.c + "33" }}>
            <div className={`font-black ${c.l.includes("₹") ? "text-lg" : "text-2xl"}`} style={{ color: c.c }}>{c.v}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: t.textMuted }}>{c.l}</div>
          </div>
        ))}
      </div>

      <Table t={t}
        cols={["Bill ID","Patient","Date","Amount","Method","Status","Actions"]}
        rows={list.map(b => {
          const p = state.patients.find(x => x.id === b.patientId);
          return [
            <span className="font-bold" style={{ color: t.accent }}>#{b.id}</span>,
            <span className="font-semibold" style={{ color: t.text }}>{p?.name || `#${b.patientId}`}</span>,
            <span className="text-xs" style={{ color: t.textMuted }}>{b.date}</span>,
            <span className="font-bold" style={{ color: t.text }}>₹{b.total}</span>,
            <div className="flex items-center gap-1.5 text-xs" style={{ color: t.textSub }}>
              {b.payMethod ? <span>{methodIcon(b.payMethod)} {methodLabel(b.payMethod)}</span> : "—"}
            </div>,
            <Badge label={b.status} type={b.status==="Paid"?"green":"amber"} t={t} />,
            <div className="flex gap-1.5">
              <Btn size="sm" ghost color={t.accent} t={t} icon="file" onClick={() => setViewModal(b)}>Receipt</Btn>
              {role === "Admin" && b.status !== "Paid" && (
                <Btn size="sm" color={t.green} t={t} icon="check" onClick={() => { setPayModal(b); setPayMethod("cash"); setTxnId(""); setTxnError(""); }}>Pay</Btn>
              )}
            </div>
          ];
        })}
      />

      <Modal open={genModal} onClose={() => setGenModal(false)} title="Generate Bill" t={t}>
        <Field label="Patient" value={f.patientId} onChange={(v: string) => setF({...f,patientId:v})}
          options={state.patients.map(p => ({ v:p.id, l:`#${p.id} — ${p.name}` }))} required t={t} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Consultation (₹)" type="number" value={f.consult}   onChange={(v: string)=>setF({...f,consult:v})}   t={t} />
          <Field label="Medicine (₹)"     type="number" value={f.medicine}  onChange={(v: string)=>setF({...f,medicine:v})}  t={t} />
          <Field label="Tests (₹)"        type="number" value={f.test}      onChange={(v: string)=>setF({...f,test:v})}      t={t} />
          <Field label="Room Charge (₹)"  type="number" value={f.room}      onChange={(v: string)=>setF({...f,room:v})}      t={t} />
          <div className="col-span-2">
            <Field label="Misc / Other (₹)" type="number" value={f.misc}   onChange={(v: string)=>setF({...f,misc:v})}      t={t} />
          </div>
        </div>
        <div className="p-4 rounded-xl mb-4 flex justify-between items-center shadow-inner" style={{ background: t.accent + "12" }}>
          <span className="text-sm font-bold" style={{ color: t.textSub }}>Total Amount</span>
          <span className="text-2xl font-black" style={{ color: t.accent }}>₹{((+f.consult||0)+(+f.medicine||0)+(+f.test||0)+(+f.room||0)+(+f.misc||0)).toLocaleString()}</span>
        </div>
        <Btn onClick={submitBill} t={t} icon="check" className="w-full">Generate Bill</Btn>
      </Modal>

      <Modal open={!!payModal} onClose={() => setPayModal(null)} title="Process Payment" t={t}>
        {payModal && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl border shadow-inner" style={{ background: t.bg, borderColor: t.border }}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>Bill #{payModal.id}</span>
                <span className="text-2xl font-black" style={{ color: t.text }}>₹{payModal.total?.toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {[["Consultation","consult"],["Medicine","medicine"],["Tests","test"],["Room","room"],["Misc","misc"]].map(([label,key]) =>
                  (payModal as any)[key] > 0 ? (
                    <div key={key} className="flex justify-between text-xs">
                      <span style={{ color: t.textMuted }}>{label}</span>
                      <span className="font-bold" style={{ color: t.textSub }}>₹{(payModal as any)[key]}</span>
                    </div>
                  ) : null
                )}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: t.textSub }}>Select Payment Method</div>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map(pm => (
                  <button 
                    key={pm.id} 
                    onClick={() => { setPayMethod(pm.id); setTxnError(""); }}
                    className="flex items-center gap-2.5 rounded-xl p-3 font-bold text-sm transition-all border-2"
                    style={{ 
                      background: payMethod === pm.id ? pm.color + "20" : t.input, 
                      color: payMethod === pm.id ? pm.color : t.textMuted, 
                      borderColor: payMethod === pm.id ? pm.color : t.inputBorder 
                    }}
                  >
                    <span className="text-xl">{pm.icon}</span>
                    <span className="truncate">{pm.label}</span>
                    {payMethod === pm.id && <span className="ml-auto text-base">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {["card","upi","online","cheque"].includes(payMethod) && (
              <div className="space-y-2">
                <Field
                  label={payMethod==="upi" ? "UPI Transaction ID" : payMethod==="card" ? "Approval Code" : payMethod==="cheque" ? "Cheque Number" : "Reference"}
                  value={txnId} onChange={(v: string) => { setTxnId(v); setTxnError(""); }} required t={t}
                  placeholder="Enter reference ID" 
                />
                {txnError && <div className="text-xs -mt-2" style={{ color: t.red }}>{txnError}</div>}
              </div>
            )}

            <Btn onClick={confirmPayment} color={t.green} t={t} icon="check" className="w-full">Confirm Payment</Btn>
          </div>
        )}
      </Modal>

      <Modal open={!!viewModal} onClose={() => setViewModal(null)} title="Payment Receipt" t={t}>
        {viewModal && (() => {
          const p = state.patients.find(x => x.id === viewModal.patientId);
          const pm = PAYMENT_METHODS.find(m => m.id === viewModal.payMethod);
          return (
            <div className="space-y-5">
              <div className="text-center p-6 rounded-2xl border shadow-inner" style={{ background: `linear-gradient(135deg, ${t.accent}12, ${t.purple}0a)`, borderColor: t.accent + "22" }}>
                <div className="text-4xl mb-3">🏥</div>
                <div className="font-black text-lg tracking-wider" style={{ color: t.text }}>GSR HOSPITAL</div>
                <div className="text-[10px] uppercase font-bold tracking-widest mt-1" style={{ color: t.textMuted }}>Cuddalore, Tamil Nadu</div>
                <div className="mt-4 inline-block px-4 py-1 rounded-full border-2" style={{ background: viewModal.status==="Paid" ? t.green+"20" : t.amber+"20", borderColor: viewModal.status==="Paid" ? t.green+"44" : t.amber+"44" }}>
                  <span className="font-black text-sm" style={{ color: viewModal.status==="Paid" ? t.green : t.amber }}>
                    {viewModal.status==="Paid" ? "✓ PAID" : "⚠ UNPAID"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  ["Patient", p?.name || `#${viewModal.patientId}`],
                  ["Bill ID", `#${viewModal.id}`],
                  ["Bill Date", viewModal.date],
                  ["Paid At", viewModal.paidAt || "—"],
                ].map(([l,v]) => (
                  <div key={l} className="p-3 rounded-xl border" style={{ background: t.bg, borderColor: t.border }}>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: t.textMuted }}>{l}</div>
                    <div className="text-sm font-bold truncate" style={{ color: t.text }}>{v}</div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl border" style={{ background: t.bg, borderColor: t.border }}>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: t.textMuted }}>Charges Breakdown</div>
                <div className="space-y-2">
                  {[["Consultation",viewModal.consult],["Medicine",viewModal.medicine],["Tests",viewModal.test],["Room",viewModal.room],["Misc",viewModal.misc]].map(([l,v]) =>
                    (v as number) > 0 ? (
                      <div key={l} className="flex justify-between py-1.5 border-b last:border-0" style={{ borderColor: t.border }}>
                        <span className="text-sm" style={{ color: t.textSub }}>{l}</span>
                        <span className="font-bold text-sm" style={{ color: t.text }}>₹{v?.toLocaleString()}</span>
                      </div>
                    ) : null
                  )}
                </div>
                <div className="flex justify-between pt-4 mt-2 border-t-2" style={{ borderColor: t.border }}>
                  <span className="font-bold text-base" style={{ color: t.text }}>Total</span>
                  <span className="font-black text-xl" style={{ color: t.accent }}>₹{viewModal.total?.toLocaleString()}</span>
                </div>
              </div>

              {viewModal.status === "Paid" && (
                <div className="p-4 rounded-xl border flex items-center gap-4" style={{ background: t.green+"12", borderColor: t.green+"33" }}>
                  <div className="text-3xl">{pm?.icon || "💰"}</div>
                  <div>
                    <div className="font-bold text-sm" style={{ color: t.green }}>Paid via {pm?.label || viewModal.payMethod}</div>
                    {viewModal.txnId && (
                      <div className="text-[10px] font-mono mt-1" style={{ color: t.textMuted }}>
                        Ref: <span className="font-bold" style={{ color: t.textSub }}>{viewModal.txnId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </motion.div>
  );
}
