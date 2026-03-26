import React, { useState } from "react";
import { SectionHead, Btn, Badge, Modal, Field, Table } from "../components/UI";
import { AppState } from "../types";
import { motion } from "motion/react";

export function Medicine({ state, dispatch, role, requester, t }: { state: AppState, dispatch: any, role: string, requester: string, t: any }) {
  const [orderModal, setOrderModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [of_, setOf] = useState({ medicineId: "", qty: 1 });
  const [af, setAf] = useState({ id: Date.now(), name: "", cat: "", price: "", stock: "" });
  
  const myOrders = state.medicineOrders.filter(o => o.orderedBy === requester);
  const allOrders = state.medicineOrders;

  const submit = () => {
    if (!of_.medicineId) return;
    dispatch({ type: "ORDER_MED", p: { orderedBy: requester, medicineId: +of_.medicineId, qty: +of_.qty } });
    setOrderModal(false); setOf({ medicineId: "", qty: 1 });
  };

  const addMed = () => {
    if (!af.name) return;
    dispatch({ type: "ADD_MEDICINE", p: { ...af, id: Date.now(), price: +af.price, stock: +af.stock } });
    setAddModal(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <SectionHead 
        title="Pharmacy & Medicine" 
        sub="Inventory management & prescription fulfillment" 
        t={t}
        action={
          <div className="flex gap-2">
            <Btn onClick={() => setOrderModal(true)} icon="pill" t={t}>Order Meds</Btn>
            {role === "Admin" && <Btn onClick={() => setAddModal(true)} ghost t={t} icon="plus">Add</Btn>}
          </div>
        } 
      />

      <div className="mb-6">
        <h3 className="font-bold text-base mb-4" style={{ color: t.text }}>Medicine Inventory</h3>
        <Table t={t} cols={["ID", "Name", "Category", "Price", "Stock", "Status"]}
          rows={state.medicines.map(m => [
            <span className="font-bold" style={{ color: t.accent }}>#{m.id}</span>,
            <span className="font-semibold" style={{ color: t.text }}>{m.name}</span>,
            <Badge label={m.cat} type="purple" t={t} />,
            `₹${m.price}`,
            <span className="font-bold" style={{ color: m.stock < 50 ? t.red : m.stock < 100 ? t.amber : t.green }}>{m.stock}</span>,
            <Badge label={m.stock === 0 ? "Out of Stock" : m.stock < 50 ? "Low Stock" : "In Stock"} type={m.stock === 0 ? "red" : m.stock < 50 ? "amber" : "green"} t={t} />,
          ])}
        />
      </div>

      {role === "Admin" && allOrders.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-base mb-4" style={{ color: t.text }}>All Medicine Orders</h3>
          <Table t={t} cols={["ID", "Ordered By", "Medicine", "Qty", "Date", "Status", "Action"]}
            rows={allOrders.map(o => {
              const m = state.medicines.find(x => x.id === o.medicineId);
              return [
                <span className="font-bold" style={{ color: t.accent }}>#{o.id}</span>,
                <span className="text-xs font-bold">{o.orderedBy}</span>,
                <span className="font-semibold">{m?.name || "?"}</span>,
                o.qty,
                <span className="text-[10px]">{o.date}</span>,
                <Badge label={o.status} type={o.status === "Dispensed" ? "green" : "amber"} t={t} />,
                o.status !== "Dispensed" && <Btn size="sm" color={t.green} t={t} onClick={() => dispatch({ type: "DISPENSE_MED", id: o.id })}>Dispense</Btn>,
              ];
            })}
          />
        </div>
      )}

      {myOrders.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-base" style={{ color: t.text }}>My Orders</h3>
          <Table t={t} cols={["ID", "Medicine", "Qty", "Date", "Status"]}
            rows={myOrders.map(o => {
              const m = state.medicines.find(x => x.id === o.medicineId);
              return [
                <span className="font-bold" style={{ color: t.accent }}>#{o.id}</span>,
                <span className="font-semibold">{m?.name || "?"}</span>,
                o.qty,
                <span className="text-[10px]">{o.date}</span>,
                <Badge label={o.status} type={o.status === "Dispensed" ? "green" : "amber"} t={t} />,
              ];
            })}
          />
        </div>
      )}

      <Modal open={orderModal} onClose={() => setOrderModal(false)} title="Order Medicine" t={t}>
        <div className="space-y-4">
          <Field label="Medicine" value={of_.medicineId} onChange={(v: string) => setOf({ ...of_, medicineId: v })}
            options={state.medicines.filter(m => m.stock > 0).map(m => ({ v: m.id, l: `${m.name} — ₹${m.price} (${m.stock} left)` }))} required t={t} />
          <Field label="Quantity" type="number" value={of_.qty} onChange={(v: string) => setOf({ ...of_, qty: +v })} t={t} />
          <Btn onClick={submit} t={t} icon="check" className="w-full">Place Order</Btn>
        </div>
      </Modal>

      <Modal open={addModal} onClose={() => setAddModal(false)} title="Add Medicine" t={t}>
        <div className="space-y-4">
          <Field label="Name" value={af.name} onChange={(v: string) => setAf({ ...af, name: v })} required t={t} />
          <Field label="Category" value={af.cat} onChange={(v: string) => setAf({ ...af, cat: v })} options={["Analgesic","Antibiotic","Cardiac","Electrolyte","Antiallergic","Antacid","Vitamin","Other"]} t={t} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (₹)" type="number" value={af.price} onChange={(v: string) => setAf({ ...af, price: v })} t={t} />
            <Field label="Stock" type="number" value={af.stock} onChange={(v: string) => setAf({ ...af, stock: v })} t={t} />
          </div>
          <Btn onClick={addMed} t={t} icon="check" className="w-full mt-2">Add Medicine</Btn>
        </div>
      </Modal>
    </motion.div>
  );
}
