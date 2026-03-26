import React, { useState, useRef, useEffect } from "react";
import { SectionHead, Btn, Icon, Badge, Modal, Field, Table } from "../components/UI";
import { AppState, Ambulance as AmbType } from "../types";
import { motion } from "motion/react";

function AmbMap({ ambulances, t }: { ambulances: AmbType[], t: any }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const resize = () => {
      c.width = c.offsetWidth; c.height = 260;
      const ctx = c.getContext("2d");
      if (ctx) draw(ctx, c.width, c.height);
    };
    const draw = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
      ctx.fillStyle = t.bg; ctx.fillRect(0, 0, W, H);
      // Grid
      ctx.strokeStyle = t.border; ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      // Roads
      ctx.strokeStyle = t.borderLight + "cc"; ctx.lineWidth = 3;
      [[0.25, 0, 0.25, 1], [0.5, 0, 0.5, 1], [0.75, 0, 0.75, 1],
       [0, 0.33, 1, 0.33], [0, 0.66, 1, 0.66]].forEach(([x1, y1, x2, y2]) => {
        ctx.beginPath(); ctx.moveTo(W * x1, H * y1); ctx.lineTo(W * x2, H * y2); ctx.stroke();
      });
      // Hospital marker
      const hx = W * 0.5, hy = H * 0.5;
      ctx.fillStyle = t.accent + "25"; ctx.strokeStyle = t.accent; ctx.lineWidth = 2;
      ctx.beginPath(); 
      (ctx as any).roundRect(hx - 26, hy - 26, 52, 52, 10); 
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = t.accent; ctx.font = "bold 22px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("H", hx, hy);
      ctx.fillStyle = t.textMuted; ctx.font = "10px sans-serif"; ctx.fillText("GSR HOSPITAL", hx, hy + 34);
      // Ambulances
      const cols: Record<string, string> = { "Available": t.green, "On-Duty": t.amber, "Maintenance": t.red };
      const pos = [[0.15, 0.2], [0.72, 0.28], [0.35, 0.75], [0.82, 0.68], [0.1, 0.65]];
      ambulances.forEach((a, i) => {
        if (i >= pos.length) return;
        const [px, py] = pos[i]; const ax = W * px, ay = H * py;
        const color = cols[a.status] || t.textMuted;
        if (a.status === "On-Duty") {
          ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(hx, hy);
          ctx.strokeStyle = color + "55"; ctx.lineWidth = 1.5; ctx.setLineDash([5, 5]); ctx.stroke(); ctx.setLineDash([]);
        }
        ctx.beginPath(); ctx.arc(ax, ay, 16, 0, Math.PI * 2);
        ctx.fillStyle = color + "30"; ctx.fill();
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = color; ctx.font = "bold 9px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(a.vehicleNo.slice(-3), ax, ay);
        ctx.fillStyle = t.textSub; ctx.font = "9px sans-serif";
        ctx.fillText(a.status, ax, ay + 22);
      });
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    return () => ro.disconnect();
  }, [ambulances, t]);
  return <canvas ref={ref} className="w-full h-[260px] rounded-xl block" />;
}

export function Ambulance({ state, dispatch, role, requester, t }: { state: AppState, dispatch: any, role: string, requester: string, t: any }) {
  const [bookModal, setBookModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [bf, setBf] = useState({ ambulanceId: "", pickup: "", dest: "" });
  const [af, setAf] = useState({ vehicleNo: "", driver: "", dPhone: "", location: "" });
  
  const myBookings = state.ambBookings.filter(b => b.requestedBy === requester);
  const availAmb = state.ambulances.filter(a => a.status === "Available");

  const book = () => {
    if (!bf.ambulanceId || !bf.pickup) return;
    dispatch({ type: "BOOK_AMB", p: { ambulanceId: +bf.ambulanceId, requestedBy: requester, pickup: bf.pickup, dest: bf.dest } });
    setBookModal(false); setBf({ ambulanceId: "", pickup: "", dest: "" });
  };

  const addAmb = () => {
    if (!af.vehicleNo || !af.driver) return;
    dispatch({ type: "ADD_AMB", p: af });
    setAddModal(false); setAf({ vehicleNo: "", driver: "", dPhone: "", location: "" });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <SectionHead 
        title="Ambulance Management" 
        sub="Live fleet tracking & emergency booking" 
        t={t}
        action={
          <div className="flex gap-2">
            <Btn onClick={() => setBookModal(true)} color={t.red} t={t} icon="ambulance">Book Ambulance</Btn>
            {role === "Admin" && <Btn onClick={() => setAddModal(true)} ghost t={t} icon="plus">Add</Btn>}
          </div>
        }
      />

      <div className="p-5 rounded-2xl border shadow-sm mb-6" style={{ background: t.card, borderColor: t.border }}>
        <div className="flex items-center gap-2 mb-4">
          <Icon name="loc" size={16} color={t.accent} />
          <span className="font-bold text-base" style={{ color: t.text }}>Live Fleet Map — Chennai</span>
          <div className="w-2 h-2 rounded-full bg-green-500 ml-2 animate-pulse" />
          <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">LIVE</span>
        </div>
        <AmbMap ambulances={state.ambulances} t={t} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {state.ambulances.map(a => {
          const color = a.status === "Available" ? t.green : a.status === "On-Duty" ? t.amber : t.red;
          return (
            <div key={a.id} className="p-4 rounded-2xl border shadow-sm" style={{ background: t.card, borderColor: color + "33" }}>
              <div className="flex justify-between items-start mb-4">
                <span className="font-black text-base" style={{ color: t.accent }}>{a.vehicleNo}</span>
                <Badge label={a.status} type={a.status === "Available" ? "green" : a.status === "On-Duty" ? "amber" : "red"} t={t} />
              </div>
              <div className="space-y-1.5 mb-4">
                <div className="text-sm font-bold" style={{ color: t.text }}>🧑‍✈️ {a.driver}</div>
                <div className="text-xs" style={{ color: t.textMuted }}>📞 {a.dPhone}</div>
                <div className="text-xs" style={{ color: t.textMuted }}>📍 {a.location}</div>
              </div>
              {role === "Admin" && (
                <div className="flex gap-1.5 flex-wrap">
                  {["Available", "On-Duty", "Maintenance"].map(s => (
                    <Btn key={s} size="sm" ghost color={s === "Available" ? t.green : s === "On-Duty" ? t.amber : t.red} t={t}
                      onClick={() => dispatch({ type: "UPD_AMB", id: a.id, upd: { status: s } })}>{s[0]}</Btn>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {myBookings.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-base" style={{ color: t.text }}>My Emergency Bookings</h3>
          <Table t={t} cols={["ID", "Ambulance", "Pickup", "Destination", "Time", "Status"]}
            rows={myBookings.map(b => {
              const a = state.ambulances.find(x => x.id === b.ambulanceId);
              return [
                <span className="font-bold" style={{ color: t.accent }}>#{b.id}</span>,
                <span className="font-semibold" style={{ color: t.text }}>{a?.vehicleNo || `#${b.ambulanceId}`}</span>,
                b.pickup, b.dest, b.time,
                <Badge label={b.status} type="green" t={t} />,
              ];
            })}
          />
        </div>
      )}

      <Modal open={bookModal} onClose={() => setBookModal(false)} title="🚑 Book an Ambulance" t={t}>
        {availAmb.length === 0 ? (
          <div className="text-center p-8 font-bold" style={{ color: t.red }}>No ambulances currently available.</div>
        ) : (
          <div className="space-y-4">
            <Field label="Select Ambulance" value={bf.ambulanceId} onChange={(v: string) => setBf({ ...bf, ambulanceId: v })}
              options={availAmb.map(a => ({ v: a.id, l: `${a.vehicleNo} — ${a.driver} (${a.location})` }))} required t={t} />
            <Field label="Pickup Location" value={bf.pickup} onChange={(v: string) => setBf({ ...bf, pickup: v })} required t={t} placeholder="Enter full address" />
            <Field label="Destination" value={bf.dest} onChange={(v: string) => setBf({ ...bf, dest: v })} t={t} placeholder="Hospital / destination" />
            <Btn onClick={book} color={t.red} t={t} icon="ambulance" className="w-full">Confirm Emergency Booking</Btn>
          </div>
        )}
      </Modal>

      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add Ambulance" t={t}>
        <div className="space-y-3">
          <Field label="Vehicle Number" value={af.vehicleNo} onChange={(v: string) => setAf({ ...af, vehicleNo: v })} required t={t} />
          <Field label="Driver Name" value={af.driver} onChange={(v: string) => setAf({ ...af, driver: v })} required t={t} />
          <Field label="Driver Phone" value={af.dPhone} onChange={(v: string) => setAf({ ...af, dPhone: v })} t={t} />
          <Field label="Current Location" value={af.location} onChange={(v: string) => setAf({ ...af, location: v })} t={t} />
          <Btn onClick={addAmb} t={t} icon="check" className="w-full mt-2">Add Ambulance</Btn>
        </div>
      </Modal>
    </motion.div>
  );
}
