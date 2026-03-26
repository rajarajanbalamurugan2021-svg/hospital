import React, { useState } from "react";
import { SectionHead, Btn, Badge, Modal, Field, Table } from "../components/UI";
import { AppState } from "../types";
import { motion } from "motion/react";

export function Food({ state, dispatch, role, requester, t }: { state: AppState, dispatch: any, role: string, requester: string, t: any }) {
  const [orderModal, setOrderModal] = useState(false);
  const [addItemModal, setAddItemModal] = useState(false);
  const [of_, setOf] = useState({ menuItemId: "", deliveryLocation: "" });
  const [nf, setNf] = useState({ name: "", cat: "Breakfast", price: "" });
  
  const myOrders = state.foodOrders.filter(o => o.orderedBy === requester);
  const allOrders = state.foodOrders;

  const submit = () => {
    if (!of_.menuItemId) return;
    dispatch({ type: "ORDER_FOOD", p: { orderedBy: requester, menuItemId: +of_.menuItemId, deliveryLocation: of_.deliveryLocation } });
    setOrderModal(false); setOf({ menuItemId: "", deliveryLocation: "" });
  };

  const addItem = () => {
    if (!nf.name || !nf.price) return;
    const newId = Math.max(0, ...state.foodMenu.map(m => m.id)) + 1;
    dispatch({ type: "ADD_FOOD_ITEM", p: { id: newId, name: nf.name, cat: nf.cat, price: +nf.price } });
    setAddItemModal(false); setNf({ name: "", cat: "Breakfast", price: "" });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <SectionHead 
        title="Food Management" 
        sub="Hospital menu & patient meal orders" 
        t={t}
        action={
          <div className="flex gap-2">
            {role === "Admin" && <Btn onClick={() => setAddItemModal(true)} ghost icon="plus" t={t}>Add Item</Btn>}
            <Btn onClick={() => setOrderModal(true)} icon="food" t={t}>Order Food</Btn>
          </div>
        } 
      />

      <div className="mb-6">
        <h3 className="font-bold text-base mb-4" style={{ color: t.text }}>Menu</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {state.foodMenu.map(m => (
            <div key={m.id} className="p-4 rounded-xl border shadow-sm" style={{ background: t.card, borderColor: t.border }}>
              <div className="flex justify-between items-start mb-3">
                <Badge label={m.cat} type={m.cat === "Breakfast" ? "amber" : m.cat === "Lunch" ? "green" : m.cat === "Dinner" ? "purple" : "blue"} t={t} />
                <span className="font-black text-sm" style={{ color: t.green }}>₹{m.price}</span>
              </div>
              <div className="font-bold text-sm" style={{ color: t.text }}>{m.name}</div>
            </div>
          ))}
        </div>
      </div>

      {role === "Admin" && allOrders.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-base mb-4" style={{ color: t.text }}>All Food Orders</h3>
          <Table t={t} cols={["ID", "Ordered By", "Item", "Delivery To", "Date", "Status", "Action"]}
            rows={allOrders.map(o => {
              const item = state.foodMenu.find(m => m.id === o.menuItemId);
              return [
                <span className="font-bold" style={{ color: t.accent }}>#{o.id}</span>,
                <span className="text-xs font-bold">{o.orderedBy}</span>,
                <span className="font-semibold">{item?.name || "?"}</span>,
                o.deliveryLocation,
                <span className="text-[10px]">{o.date}</span>,
                <Badge label={o.status} type={o.status === "Delivered" ? "green" : "amber"} t={t} />,
                o.status !== "Delivered" && <Btn size="sm" color={t.green} t={t} onClick={() => dispatch({ type: "DELIVER_FOOD", id: o.id })}>Deliver</Btn>,
              ];
            })}
          />
        </div>
      )}

      {myOrders.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-base" style={{ color: t.text }}>My Orders</h3>
          <Table t={t} cols={["ID", "Item", "Delivery To", "Date", "Status"]}
            rows={myOrders.map(o => {
              const item = state.foodMenu.find(m => m.id === o.menuItemId);
              return [
                <span className="font-bold" style={{ color: t.accent }}>#{o.id}</span>,
                <span className="font-semibold">{item?.name || "?"}</span>,
                o.deliveryLocation,
                <span className="text-[10px]">{o.date}</span>,
                <Badge label={o.status} type={o.status === "Delivered" ? "green" : "amber"} t={t} />,
              ];
            })}
          />
        </div>
      )}

      <Modal open={orderModal} onClose={() => setOrderModal(false)} title="Order Food" t={t}>
        <div className="space-y-4">
          <Field label="Menu Item" value={of_.menuItemId} onChange={(v: string) => setOf({ ...of_, menuItemId: v })}
            options={state.foodMenu.map(m => ({ v: m.id, l: `${m.name} (${m.cat}) — ₹${m.price}` }))} required t={t} />
          <Field label="Delivery Location" value={of_.deliveryLocation} onChange={(v: string) => setOf({ ...of_, deliveryLocation: v })} t={t} placeholder="Ward / Room No." />
          <Btn onClick={submit} t={t} icon="check" className="w-full">Place Order</Btn>
        </div>
      </Modal>

      <Modal open={addItemModal} onClose={() => setAddItemModal(false)} title="Add Food Item" t={t}>
        <div className="space-y-4">
          <Field label="Item Name" value={nf.name} onChange={(v: string) => setNf({ ...nf, name: v })} required t={t} placeholder="e.g. Masala Dosa" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category" value={nf.cat} onChange={(v: string) => setNf({ ...nf, cat: v })} options={["Breakfast", "Lunch", "Dinner", "Snack", "Juice", "Soup"]} t={t} />
            <Field label="Price (₹)" type="number" value={nf.price} onChange={(v: string) => setNf({ ...nf, price: v })} required t={t} />
          </div>
          <Btn onClick={addItem} t={t} icon="check" className="w-full">Add to Menu</Btn>
        </div>
      </Modal>
    </motion.div>
  );
}
