import React from "react";
import { 
  X, Check, Search, Plus, Bell, Menu, LogOut, 
  Home, User, Users, Stethoscope, Calendar, 
  FileText, CreditCard, Truck, Utensils, Pill, 
  Heart, Shield, MapPin, Edit, Trash2, ChevronRight,
  Sun, Moon, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const Icon = ({ name, size = 18, color, className }: { name: string, size?: number, color?: string, className?: string }) => {
  const icons: Record<string, any> = {
    home: Home,
    user: User,
    users: Users,
    stethoscope: Stethoscope,
    calendar: Calendar,
    file: FileText,
    bill: CreditCard,
    ambulance: Truck,
    food: Utensils,
    pill: Pill,
    heart: Heart,
    organ: Activity,
    sun: Sun,
    moon: Moon,
    logout: LogOut,
    plus: Plus,
    search: Search,
    x: X,
    check: Check,
    chevron: ChevronRight,
    menu: Menu,
    bell: Bell,
    loc: MapPin,
    edit: Edit,
    trash: Trash2,
    shield: Shield,
    chart: Activity
  };
  const LucideIcon = icons[name] || Home;
  return <LucideIcon size={size} color={color} className={className} />;
};

export const Badge = ({ label, type = "blue", t }: { label: string, type?: string, t: any }) => {
  const [bg, fg] = t.badge[type] || t.badge.blue;
  return (
    <span 
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide whitespace-nowrap"
      style={{ background: bg, color: fg }}
    >
      {label}
    </span>
  );
};

export function CustomPill({ label, color, className }: any) {
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${className}`}
      style={{ background: color + "22", color, borderColor: color + "44" }}
    >
      {label}
    </span>
  );
}

export const Field = ({ label, type = "text", value, onChange, options, required, t, placeholder }: any) => {
  return (
    <div className="mb-3 w-full">
      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: t.textSub }}>
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      {options ? (
        <select 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors border-1.5 appearance-none cursor-pointer"
          style={{ background: t.input, borderColor: t.inputBorder, color: t.text }}
        >
          <option value="">— Select —</option>
          {options.map((o: any) => <option key={o.v ?? o} value={o.v ?? o}>{o.l ?? o}</option>)}
        </select>
      ) : (
        <input 
          type={type} 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          placeholder={placeholder} 
          className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors border-1.5"
          style={{ background: t.input, borderColor: t.inputBorder, color: t.text }}
          required={required}
          inputMode={type === "number" ? "numeric" : type === "tel" ? "tel" : undefined} 
        />
      )}
    </div>
  );
};

export const Modal = ({ open, onClose, title, children, t, wide }: any) => {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0"
            style={{ background: t.overlay }}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            style={{ background: t.card, border: `1px solid ${t.border}`, maxWidth: wide ? 640 : 500 }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10" style={{ background: t.card, borderColor: t.border }}>
              <span className="font-extrabold text-base" style={{ color: t.text }}>{title}</span>
              <button onClick={onClose} className="p-2 rounded-lg transition-colors" style={{ color: t.textMuted }}>
                <Icon name="x" size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const Table = ({ cols, rows, t }: any) => (
  <div className="overflow-x-auto rounded-xl border" style={{ borderColor: t.border }}>
    <table className="w-full border-collapse min-w-[500px]">
      <thead>
        <tr style={{ background: t.bg }}>
          {cols.map((c: string, i: number) => (
            <th key={i} className="px-4 py-3 text-left text-[11px] font-bold tracking-wider uppercase whitespace-nowrap border-b" style={{ color: t.textMuted, borderColor: t.border }}>{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={cols.length} className="px-4 py-8 text-center text-sm" style={{ color: t.textMuted }}>No records found</td></tr>
        ) : rows.map((row: any, ri: number) => (
          <tr key={ri} className={ri < rows.length - 1 ? "border-b" : ""} style={{ borderColor: t.border }}>
            {row.map((cell: any, ci: number) => (
              <td key={ci} className="px-4 py-3 text-sm align-middle" style={{ color: t.textSub }}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const Stat = ({ label, value, icon, color, t }: any) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="rounded-2xl p-4 flex items-center gap-4 shadow-lg border"
    style={{ background: t.card, borderColor: t.border }}
  >
    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + "1e" }}>
      <Icon name={icon} size={22} color={color} />
    </div>
    <div>
      <div className="font-extrabold text-2xl leading-none" style={{ color: t.text }}>{value}</div>
      <div className="text-xs mt-1" style={{ color: t.textMuted }}>{label}</div>
    </div>
  </motion.div>
);

export const SectionHead = ({ title, sub, action, t }: any) => (
  <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
    <div>
      <h2 className="m-0 font-extrabold text-xl" style={{ color: t.text }}>{title}</h2>
      {sub && <p className="mt-1 text-sm" style={{ color: t.textMuted }}>{sub}</p>}
    </div>
    {action}
  </div>
);

export const Btn = ({ onClick, children, color, ghost, size = "md", t, icon, disabled, className }: any) => {
  const c = color || t.accent;
  const padding = size === "sm" ? "px-3.5 py-1.5" : "px-4.5 py-2.5";
  const fontSize = size === "sm" ? "text-xs" : "text-sm";
  
  return (
    <motion.button 
      whileTap={{ scale: 0.96 }}
      onClick={onClick} 
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-xl font-bold transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed border-1.5 ${padding} ${fontSize} ${className}`}
      style={{ 
        background: ghost ? "transparent" : c, 
        color: ghost ? c : "#fff", 
        borderColor: c 
      }}
    >
      {icon && <Icon name={icon} size={size === "sm" ? 14 : 16} />}{children}
    </motion.button>
  );
};
