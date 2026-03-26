import React from "react";
import { SectionHead, Stat, Icon, Badge } from "../components/UI";
import { AppState } from "../types";
import { motion } from "motion/react";

export function Dashboard({ state, role, t }: { state: AppState, role: string, t: any }) {
  const stats = [
    { label: "Patients", value: state.patients.length, icon: "users", color: t.accent },
    { label: "Doctors", value: state.doctors.length, icon: "stethoscope", color: t.green },
    { label: "Appointments", value: state.appointments.length, icon: "calendar", color: t.purple },
    { label: "Ambulances", value: state.ambulances.length, icon: "ambulance", color: t.red },
    { label: "Blood Donors", value: state.bloodDonors.length, icon: "heart", color: "#e11d48" },
    { label: "Organ Donors", value: state.organDonors.length, icon: "organ", color: t.orange },
    { label: "Medicines", value: state.medicines.length, icon: "pill", color: t.amber },
    { label: "Bills", value: state.bills.length, icon: "bill", color: t.textSub },
  ];
  const recentAppts = state.appointments.slice(-5).reverse();
  const availAmb = state.ambulances.filter(a => a.status === "Available").length;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <SectionHead 
        title={`Welcome back, ${role} 👋`} 
        sub={`GSR Hospital Management — ${new Date().toDateString()}`} 
        t={t} 
      />
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s, i) => (
          <motion.div 
            key={s.label} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.05 }}
          >
            <Stat {...s} t={t} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="p-5 rounded-2xl border shadow-sm" style={{ background: t.card, borderColor: t.border }}>
          <h3 className="m-0 mb-4 text-base font-bold" style={{ color: t.text }}>Recent Appointments</h3>
          <div className="space-y-1">
            {recentAppts.map(a => {
              const p = state.patients.find(x => x.id === a.patientId);
              const d = state.doctors.find(x => x.id === a.doctorId);
              return (
                <div key={a.id} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: t.border }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: t.accent + "1e" }}>
                    <Icon name="user" size={18} color={t.accent} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: t.text }}>{p?.name || "Unknown"}</div>
                    <div className="text-[11px]" style={{ color: t.textMuted }}>{d?.name || "—"} · {a.date}</div>
                  </div>
                  <Badge label={a.status} type={a.status === "Confirmed" ? "green" : a.status === "Pending" ? "amber" : "red"} t={t} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-5 rounded-2xl border shadow-sm" style={{ background: t.card, borderColor: t.border }}>
          <h3 className="m-0 mb-4 text-base font-bold" style={{ color: t.text }}>Ambulance Fleet</h3>
          <div className="space-y-1">
            {state.ambulances.map(a => (
              <div key={a.id} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: t.border }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" 
                  style={{ background: (a.status === "Available" ? t.green : a.status === "On-Duty" ? t.amber : t.red) + "1e" }}>
                  <Icon name="ambulance" size={18} color={a.status === "Available" ? t.green : a.status === "On-Duty" ? t.amber : t.red} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color: t.text }}>{a.vehicleNo}</div>
                  <div className="text-[11px]" style={{ color: t.textMuted }}>{a.location}</div>
                </div>
                <Badge label={a.status} type={a.status === "Available" ? "green" : a.status === "On-Duty" ? "amber" : "red"} t={t} />
              </div>
            ))}
          </div>
          <div className="mt-3 p-3 rounded-xl font-bold text-sm text-center" style={{ background: t.green + "12", color: t.green }}>
            {availAmb} / {state.ambulances.length} Available
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Blood: O+ Units", val: "62", color: "#e11d48" },
          { label: "Blood: A+ Units", val: "44", color: "#e11d48" },
          { label: "Unpaid Bills", val: state.bills.filter(b => b.status === "Unpaid").length, color: t.amber },
          { label: "Pending Food Orders", val: state.foodOrders.filter(o => o.status === "Pending").length, color: t.orange },
        ].map(c => (
          <div key={c.label} className="p-4 rounded-xl border" style={{ background: t.card, borderColor: c.color + "33" }}>
            <div className="font-black text-2xl" style={{ color: c.color }}>{c.val}</div>
            <div className="text-[11px] mt-0.5" style={{ color: t.textMuted }}>{c.label}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
