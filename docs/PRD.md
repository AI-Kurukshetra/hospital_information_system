# Healthland Centriq — Critical Access HIS
## Product Requirements Document (PRD)
### Hackathon Edition | 5-Hour Build | AI Vibe Coded

---

## 1. Product Overview

**Product Name:** Healthland Centriq (Modernized)
**Type:** Cloud-native Hospital Information System for Critical Access Hospitals (≤25 beds)
**Tech Stack:** Next.js 16 (App Router) · Supabase (Postgres + Auth + Realtime) · Vercel · Node.js API Routes
**Target Users:** Nurses, Physicians, Admins, Billing Staff at rural critical access hospitals
**Differentiator:** Modern UX, AI-assisted clinical workflows, real-time dashboards — replacing legacy clunky HIS systems

---

## 2. Problem Statement

Critical Access Hospitals (CAHs) serve rural communities with ≤25 beds. They run on legacy HIS platforms (Healthland Centriq, CPSI, MEDITECH) that are:
- Hard to use, slow, desktop-only
- Expensive with poor support
- Lacking AI features and modern interoperability

**This product:** A cloud-native, AI-enhanced HIS that any CAH staff member can use from day one.

---

## 3. Users & Roles

| Role | Permissions | Key Workflows |
|------|-------------|---------------|
| **Admin** | Full access | Dashboard, reports, system config |
| **Physician** | Patient data, orders, EHR | Order entry, clinical notes, diagnoses |
| **Nurse** | Patient data, nursing notes, bed management | Admit/discharge, vitals, care notes |
| **Billing Staff** | Billing module only | Claims, invoices, insurance |
| **Receptionist** | Patient registration | Intake, demographics, insurance |

---

## 4. MVP Scope (5-Hour Hackathon Build)

> **Goal:** A functional, deployable HIS demo that covers the critical patient journey end-to-end: Register → Admit → Treat → Bill → Discharge

### MVP Feature Set (Strict — Build This Only)

| # | Feature | Sprint | Priority |
|---|---------|--------|----------|
| 1 | Auth (role-based login) | Sprint 0 | Critical |
| 2 | Patient Registration & Demographics | Sprint 1 | Critical |
| 3 | Bed Management Dashboard (real-time) | Sprint 1 | Critical |
| 4 | Basic EHR — Patient Chart + Vitals | Sprint 2 | Critical |
| 5 | Physician Order Entry (Meds/Lab/Imaging) | Sprint 2 | Critical |
| 6 | Clinical Notes (Nursing + Physician) | Sprint 3 | Critical |
| 7 | Basic Billing & Revenue Tracking | Sprint 3 | High |
| 8 | Admin Dashboard + Key Metrics | Sprint 4 | High |
| 9 | Vercel Deployment + Seed Data | Sprint 4 | Critical |

### Explicitly Out of MVP Scope
- Telemedicine, DICOM integration, FHIR/HL7
- Pharmacy dispensing hardware integration
- AI features (Phase 2)
- Mobile app
- Document scanning
- Multi-site sync

---

## 5. Phase-Wise Implementation Plan

### Phase 0 — Foundation (Sprint 0 · 30 min)
**Goal:** Running app skeleton with auth, DB, and routing

**Deliverables:**
- Already has the Next app scaffolded with supabse connectivity
- Supabase project connected (env vars set)
- Database schema applied (all core tables)
- Role-based auth via Supabase Auth + `user_roles` table
- Protected route middleware
- Global layout with sidebar navigation (role-aware)

**DB Tables to Create:**
```sql
organizations, departments, beds,
users (extends auth.users), user_roles,
patients, encounters, vitals,
orders, clinical_notes, billing_records, diagnoses
```

---

### Phase 1 — Patient Core (Sprint 1 · 75 min)
**Goal:** Register patients, see live bed availability

**Features:**
1. **Patient Registration Form**
   - Full demographics (name, DOB, gender, address, contact)
   - Insurance information (payer, policy #, group #)
   - Emergency contact
   - MRN auto-generation
   - Form validation with react-hook-form + zod

2. **Patient List / Search**
   - Searchable, filterable patient directory
   - Status badges (Registered / Admitted / Discharged)
   - Quick-action links to chart

3. **Bed Management Dashboard**
   - Visual floor map (grid of beds)
   - Real-time status via Supabase Realtime (Available / Occupied / Housekeeping / Maintenance)
   - Admit patient to bed → creates encounter
   - Discharge patient from bed
   - Department filter (ICU, ED, Med-Surg, etc.)

**API Routes:**
- `POST /api/patients` — register
- `GET /api/patients` — list + search
- `GET /api/beds` — all beds with status
- `PATCH /api/beds/[id]` — update bed status
- `POST /api/encounters` — admit patient

---

### Phase 2 — Clinical Workflows (Sprint 2 · 75 min)
**Goal:** Physicians and nurses can document and order

**Features:**
1. **Patient Chart (EHR)**
   - Encounter header (patient, physician, admission date, diagnosis)
   - Vitals section (BP, HR, Temp, O2, RR, Weight) — time-series list
   - Active orders panel
   - Clinical notes timeline
   - Problem list / Diagnoses (ICD-10 lookup — static list of top 100 codes)

2. **Vitals Entry**
   - Quick form to log new vitals
   - Abnormal value highlighting (red if out of range)

3. **Physician Order Entry (CPOE)**
   - Order types: Medication / Lab / Imaging / Other
   - Fields: order type, description, frequency, priority (Routine/STAT), notes
   - Orders list with status (Pending / In Progress / Completed / Cancelled)
   - Ordering provider auto-filled from session

4. **Clinical Notes**
   - Note type: Nursing Assessment / Physician Note / Progress Note / Discharge Summary
   - Rich text area (no WYSIWYG needed — plain textarea for hackathon)
   - Author + timestamp auto-captured
   - Notes timeline sorted newest first

**API Routes:**
- `GET/POST /api/encounters/[id]/vitals`
- `GET/POST /api/encounters/[id]/orders`
- `GET/POST /api/encounters/[id]/notes`
- `GET/POST /api/encounters/[id]/diagnoses`

---

### Phase 3 — Billing & Revenue (Sprint 3 · 45 min)
**Goal:** Basic financial tracking for the encounter

**Features:**
1. **Billing Record per Encounter**
   - Line items: service code (CPT simplified), description, quantity, unit price, total
   - Insurance payer pre-filled from patient registration
   - Claim status: Draft / Submitted / Paid / Denied
   - Total charges, expected reimbursement, patient responsibility

2. **Billing Dashboard**
   - List of all billing records with status
   - Filter by status, date range
   - Summary cards: Total Billed / Collected / Outstanding / Denied
   

**API Routes:**
- `GET/POST /api/billing`
- `PATCH /api/billing/[id]` — update claim status

---

### Phase 4 — Admin & Deployment (Sprint 4 · 30 min)
**Goal:** Ship to production, working demo

**Features:**
1. **Admin Dashboard**
   - KPI cards: Census (current patients), Bed Occupancy %, Revenue Today, Orders Today
   - Recent patient activity feed
   - Department breakdown table

2. **Seed Data**
   - 5 departments, 25 beds, 3 demo users (admin/physician/nurse), 10 sample patients with encounters

3. **Vercel Deployment**
   - Connect repo, set env vars, deploy
   - Vercel preview URL for demo

---

## 6. Post-MVP Phases (Add-On Roadmap)

### Phase 5 — AI Features (Post-Hackathon Week 1)
- AI Clinical Decision Support (Claude API) — flag abnormal vitals, suggest orders
- AI-powered nursing notes summarization
- Auto ICD-10 code suggestion from note text

### Phase 6 — Advanced Clinical (Week 2)
- Pharmacy Management module
- Lab Results integration (manual entry + file upload)
- ED Triage workflow
- Discharge Planning + care transitions

### Phase 7 — Revenue Cycle Pro (Week 3)
- Insurance eligibility verification (mock API)
- Claim scrubbing rules
- Denial management workflow
- Financial analytics charts

### Phase 8 — Interoperability (Month 2)
- FHIR R4 API endpoints
- Patient Portal
- HL7 message parsing for lab/radiology
- Multi-site organization support

---

## 7. Database Schema (Core)

```sql
-- Core lookup tables
organizations (id, name, type, address, npi)
departments (id, org_id, name, code, floor)
beds (id, dept_id, bed_number, status, type)

-- Users / Auth
user_profiles (id → auth.users, org_id, role, name, npi, dept_id)

-- Patients
patients (id, mrn, org_id, first_name, last_name, dob, gender,
          ssn_last4, address, phone, emergency_contact,
          insurance_payer, policy_number, group_number,
          created_at, updated_at)

-- Encounters
encounters (id, patient_id, bed_id, org_id, dept_id,
            attending_physician_id, admission_date, discharge_date,
            status [active|discharged], chief_complaint, created_at)

-- Clinical
vitals (id, encounter_id, recorded_by, bp_systolic, bp_diastolic,
        heart_rate, temperature, o2_sat, respiratory_rate, weight, recorded_at)

diagnoses (id, encounter_id, icd10_code, description,
           diagnosis_type [primary|secondary], added_by, added_at)

orders (id, encounter_id, order_type [medication|lab|imaging|other],
        description, frequency, priority [routine|stat],
        status [pending|in_progress|completed|cancelled],
        ordered_by, ordered_at, completed_at, notes)

clinical_notes (id, encounter_id, note_type, content,
                author_id, created_at)

-- Billing
billing_records (id, encounter_id, patient_id, payer,
                 claim_status [draft|submitted|paid|denied],
                 total_charges, expected_reimbursement,
                 patient_responsibility, submitted_at)

billing_line_items (id, billing_record_id, cpt_code, description,
                    quantity, unit_price, total)
```

---

## 8. Key Pages / Routes

```
/                          → Landing / Login
/dashboard                 → Admin dashboard (role-aware)
/patients                  → Patient list + search
/patients/new              → Registration form
/patients/[id]             → Patient profile
/patients/[id]/chart       → EHR chart (encounter view)
/beds                      → Bed management grid
/orders                    → Orders queue (all active orders)
/billing                   → Billing dashboard
/billing/[id]              → Encounter billing detail
/admin                     → System admin (users, departments)
```

---

## 9. UI Design Guidelines

- **Component Library:** shadcn/ui + Tailwind CSS
- **Color Palette:** Slate/Blue primary (clinical, trustworthy)
- **Icons:** Lucide React
- **Data Tables:** TanStack Table v8
- **Forms:** react-hook-form + zod
- **Realtime:** Supabase Realtime subscriptions for bed status
- **Charts:** Recharts for admin dashboard metrics
- **Toast/Alerts:** sonner

---

## 10. Success Criteria (Demo Checklist)

- [ ] Receptionist can register a new patient in < 2 minutes
- [ ] Nurse can see live bed availability and admit a patient
- [ ] Physician can create orders and clinical notes on a patient chart
- [ ] Bed status updates in real-time across two browser tabs
- [ ] Billing record auto-created on admission, staff can update status
- [ ] Admin dashboard shows live census and KPIs
- [ ] App is live on Vercel with demo credentials
- [ ] Seed data loads 10 patients, 25 beds, full demo scenario

---

## 11. Demo Script (5-min hackathon pitch)

1. **Login as Receptionist** → Register new patient "John Doe" (30s)
2. **Switch to Nurse** → Bed dashboard, assign John to Bed 12 (30s)
3. **Switch to Physician** → Open John's chart, add diagnosis, create STAT medication order, log vitals (60s)
4. **Nurse enters nursing assessment note** (20s)
5. **Show billing auto-draft** → mark submitted (20s)
6. **Admin Dashboard** → show John appeared in census, bed occupancy ticked up (20s)
7. **Open two tabs on bed dashboard** → discharge John on one tab, show real-time update on other (30s)

---

*Document Version: 1.0 | Created: 2026-03-14 | Hackathon: Healthland Centriq MVP*
