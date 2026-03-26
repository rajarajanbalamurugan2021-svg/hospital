export interface Doctor {
  id: number;
  name: string;
  spec: string;
  phone: string;
  schedule: string;
  available: boolean;
  pass: string;
}

export interface Patient {
  id: number;
  name: string;
  gender: string;
  phone: string;
  address: string;
  blood: string;
  reg: string;
  age: number;
  pass?: string;
}

export interface Staff {
  id: number;
  name: string;
  role: string;
  dept: string;
  phone: string;
  shift: string;
  pass: string;
}

export interface Ambulance {
  id: number;
  vehicleNo: string;
  driver: string;
  dPhone: string;
  location: string;
  status: "Available" | "On-Duty" | "Maintenance";
}

export interface AmbBooking {
  id: number;
  ambulanceId: number;
  requestedBy: string;
  pickup: string;
  dest: string;
  time: string;
  status: string;
}

export interface FoodItem {
  id: number;
  name: string;
  cat: string;
  price: number;
}

export interface FoodOrder {
  id: number;
  orderedBy: string;
  menuItemId: number;
  deliveryLocation: string;
  date: string;
  status: "Pending" | "Delivered";
}

export interface Medicine {
  id: number;
  name: string;
  cat: string;
  price: number;
  stock: number;
}

export interface MedicineOrder {
  id: number;
  orderedBy: string;
  medicineId: number;
  qty: number;
  date: string;
  status: "Pending" | "Dispensed";
}

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  date: string;
  time: string;
  reason: string;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  priority: "Emergency" | "Urgent" | "Normal" | "Routine";
}

export interface MedicalRecord {
  id: number;
  patientId: number;
  doctorId: number;
  date: string;
  diagnosis: string;
  prescription: string;
  notes: string;
}

export interface Bill {
  id: number;
  patientId: number;
  date: string;
  status: "Paid" | "Unpaid";
  consult: number;
  medicine: number;
  test: number;
  room: number;
  misc?: number;
  total: number;
  payMethod?: string;
  paidAt?: string;
  txnId?: string;
}

export interface BloodDonor {
  id: number;
  name: string;
  blood: string;
  phone: string;
  address: string;
  lastDonation: string;
  available: boolean;
  regBy: string;
}

export interface OrganDonor {
  id: number;
  name: string;
  phone: string;
  blood: string;
  organs: string;
  regDate: string;
  regBy: string;
  consent: boolean;
}

export interface AppState {
  doctors: Doctor[];
  patients: Patient[];
  staff: Staff[];
  ambulances: Ambulance[];
  ambBookings: AmbBooking[];
  foodMenu: FoodItem[];
  foodOrders: FoodOrder[];
  medicines: Medicine[];
  medicineOrders: MedicineOrder[];
  appointments: Appointment[];
  records: MedicalRecord[];
  bills: Bill[];
  bloodDonors: BloodDonor[];
  organDonors: OrganDonor[];
  nextPatientId: number;
  nextStaffId: number;
  nextDoctorId: number;
  nextApptId: number;
  nextRecordId: number;
  nextBillId: number;
  nextAmbId: number;
  nextAmbBookId: number;
  nextFoodOrderId: number;
  nextMedOrderId: number;
  nextBloodId: number;
  nextOrganId: number;
}
