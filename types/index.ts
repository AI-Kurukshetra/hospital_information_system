export type UserRole =
  | "admin"
  | "physician"
  | "nurse"
  | "billing"
  | "receptionist";

export interface UserProfile {
  id: string;
  org_id: string | null;
  role: UserRole;
  full_name: string;
  npi: string | null;
  department_id: string | null;
  email?: string | null;
}

export interface Patient {
  id: string;
  mrn: string;
  org_id: string | null;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  gender: string | null;
  ssn_last4: string | null;
  address_line1: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  email: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  insurance_payer: string | null;
  policy_number: string | null;
  group_number: string | null;
  status: "registered" | "admitted" | "discharged";
  created_at: string;
  updated_at: string;
}

export interface Bed {
  id: string;
  dept_id: string;
  bed_number: string;
  status: "available" | "occupied" | "housekeeping" | "maintenance";
  bed_type: string;
  patient_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  org_id: string;
  name: string;
  code: string;
  floor: string | null;
  created_at?: string;
}

export interface Encounter {
  id: string;
  patient_id: string;
  bed_id: string | null;
  org_id: string | null;
  dept_id: string | null;
  attending_physician_id: string | null;
  admission_date: string;
  discharge_date: string | null;
  status: "active" | "discharged" | "cancelled";
  chief_complaint: string | null;
  created_at: string;
}

export interface Vitals {
  id: string;
  encounter_id: string;
  recorded_by: string | null;
  bp_systolic: number | null;
  bp_diastolic: number | null;
  heart_rate: number | null;
  temperature: number | null;
  o2_saturation: number | null;
  respiratory_rate: number | null;
  weight_kg: number | null;
  recorded_at: string;
}

export interface Diagnosis {
  id: string;
  encounter_id: string;
  icd10_code: string;
  description: string;
  diagnosis_type: "primary" | "secondary";
  added_by: string | null;
  added_at: string;
}

export interface Order {
  id: string;
  encounter_id: string;
  order_type: "medication" | "lab" | "imaging" | "other";
  description: string;
  frequency: string | null;
  priority: "routine" | "stat" | "urgent";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  ordered_by: string | null;
  ordered_at: string;
  completed_at: string | null;
  notes: string | null;
}

export interface ClinicalNote {
  id: string;
  encounter_id: string;
  note_type:
    | "nursing_assessment"
    | "physician_note"
    | "progress_note"
    | "discharge_summary";
  content: string;
  author_id: string | null;
  created_at: string;
}

export interface BillingRecord {
  id: string;
  encounter_id: string;
  patient_id: string;
  payer: string | null;
  claim_status: "draft" | "submitted" | "paid" | "denied";
  total_charges: number;
  expected_reimbursement: number;
  patient_responsibility: number;
  submitted_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BillingLineItem {
  id: string;
  billing_record_id: string;
  cpt_code: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface BedBoardItem {
  id: string;
  dept_id: string;
  department_name: string;
  department_code: string;
  bed_number: string;
  bed_type: string;
  status: Bed["status"];
  patient_id: string | null;
  patient_name: string | null;
  patient_mrn: string | null;
  encounter_id: string | null;
  admission_date: string | null;
  attending_physician_id: string | null;
  attending_physician_name: string | null;
  chief_complaint: string | null;
}

export interface PatientLookup {
  id: string;
  full_name: string;
  mrn: string;
  status: Patient["status"];
}

export interface PhysicianLookup {
  id: string;
  full_name: string;
  department_id: string | null;
}
