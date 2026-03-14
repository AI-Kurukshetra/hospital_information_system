# Healthland Centriq — AI Vibe Coding Prompts
### Hackathon Build Guide | Next.js + Supabase + Vercel

---

> **How to use this file:** Copy each sprint prompt into Claude Code (or Cursor/Windsurf) in order. Each prompt builds on the previous. Run, verify, then move to the next sprint. Full build target: 5 hours.

---

## PRE-FLIGHT CHECKLIST (Do this before Sprint 0)

```
1. Create Supabase project at supabase.com → copy URL + anon key + service_role key
2. Create GitHub repo → clone locally
3. Have Vercel account ready (will deploy at end)
4. Node.js 20+ installed
```

---

## SPRINT 0 — Project Foundation (30 min)

### Prompt S0-A: Scaffold the Next.js App

```
Already has Next.js app with App Router for a Hospital Information System called "helthland".

Setup requirements if not setup yet. Ignore if already set:
- Use TypeScript
- Install and configure if not: shadcn/ui (use "new-york" style, slate base color), Tailwind CSS, lucide-react, react-hook-form, zod, @supabase/supabase-js, @supabase/ssr, sonner, recharts, @tanstack/react-table
- Create .env.local with placeholders: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- Create lib/supabase/client.ts (browser client) and lib/supabase/server.ts (server client using cookies)
- Create middleware.ts that protects all routes under /dashboard, /patients, /beds, /orders, /billing, /admin — redirect unauthenticated users to /login
- Create a root layout with a clean medical-grade sidebar navigation. Sidebar items (with lucide icons): Dashboard, Patients, Bed Management, Orders, Billing, Admin. Make it role-aware — show Admin link only for admin role.
- Global providers: Toaster (sonner), ThemeProvider
- Create a types/index.ts file with TypeScript interfaces for: Patient, Encounter, Bed, Order, ClinicalNote, Vitals, BillingRecord, UserProfile

The app should feel like a modern clinical system — clean, professional, slate/blue color palette. Not too flashy.
```

---

### Prompt S0-B: Supabase Database Schema

```
Create the complete Supabase database schema for Healthland Centriq HIS. Generate a SQL migration file at supabase/migrations/001_initial_schema.sql

Tables to create:

1. organizations (id uuid pk default gen_random_uuid(), name text, type text default 'critical_access_hospital', address text, npi text, created_at timestamptz default now())

2. departments (id uuid pk, org_id uuid references organizations, name text, code text, floor text, created_at timestamptz default now())

3. beds (id uuid pk, dept_id uuid references departments, bed_number text not null, status text default 'available' check (status in ('available','occupied','housekeeping','maintenance')), bed_type text default 'standard', patient_id uuid, created_at timestamptz default now(), updated_at timestamptz default now())

4. user_profiles (id uuid pk references auth.users, org_id uuid references organizations, role text check (role in ('admin','physician','nurse','billing','receptionist')), full_name text, npi text, department_id uuid references departments, created_at timestamptz default now())

5. patients (id uuid pk default gen_random_uuid(), mrn text unique not null, org_id uuid references organizations, first_name text not null, last_name text not null, date_of_birth date, gender text, ssn_last4 text, address_line1 text, city text, state text, zip text, phone text, email text, emergency_contact_name text, emergency_contact_phone text, insurance_payer text, policy_number text, group_number text, status text default 'registered' check (status in ('registered','admitted','discharged')), created_at timestamptz default now(), updated_at timestamptz default now())

6. encounters (id uuid pk default gen_random_uuid(), patient_id uuid references patients, bed_id uuid references beds, org_id uuid references organizations, dept_id uuid references departments, attending_physician_id uuid references user_profiles, admission_date timestamptz default now(), discharge_date timestamptz, status text default 'active' check (status in ('active','discharged','cancelled')), chief_complaint text, created_at timestamptz default now())

7. vitals (id uuid pk default gen_random_uuid(), encounter_id uuid references encounters, recorded_by uuid references user_profiles, bp_systolic int, bp_diastolic int, heart_rate int, temperature numeric(4,1), o2_saturation int, respiratory_rate int, weight_kg numeric(5,1), recorded_at timestamptz default now())

8. diagnoses (id uuid pk default gen_random_uuid(), encounter_id uuid references encounters, icd10_code text, description text, diagnosis_type text default 'primary' check (diagnosis_type in ('primary','secondary')), added_by uuid references user_profiles, added_at timestamptz default now())

9. orders (id uuid pk default gen_random_uuid(), encounter_id uuid references encounters, order_type text check (order_type in ('medication','lab','imaging','other')), description text not null, frequency text, priority text default 'routine' check (priority in ('routine','stat','urgent')), status text default 'pending' check (status in ('pending','in_progress','completed','cancelled')), ordered_by uuid references user_profiles, ordered_at timestamptz default now(), completed_at timestamptz, notes text)

10. clinical_notes (id uuid pk default gen_random_uuid(), encounter_id uuid references encounters, note_type text check (note_type in ('nursing_assessment','physician_note','progress_note','discharge_summary')), content text not null, author_id uuid references user_profiles, created_at timestamptz default now())

11. billing_records (id uuid pk default gen_random_uuid(), encounter_id uuid references encounters unique, patient_id uuid references patients, payer text, claim_status text default 'draft' check (claim_status in ('draft','submitted','paid','denied')), total_charges numeric(10,2) default 0, expected_reimbursement numeric(10,2) default 0, patient_responsibility numeric(10,2) default 0, submitted_at timestamptz, created_at timestamptz default now(), updated_at timestamptz default now())

12. billing_line_items (id uuid pk default gen_random_uuid(), billing_record_id uuid references billing_records, cpt_code text, description text, quantity int default 1, unit_price numeric(10,2), total numeric(10,2))

Enable Row Level Security on all tables. Create policies:
- user_profiles: users can read their own profile, admins can read all
- patients/encounters/beds/orders/notes/vitals: authenticated users in same org can read/write
- billing_records: billing role + admin can read/write

Create a trigger function that auto-generates MRN (format: MRN-YYYYMMDD-XXXX random 4 digits) on patient insert.
Create a trigger that updates beds.updated_at on update.
Enable Supabase Realtime on the beds table.

Also create supabase/seed.sql with:
- 1 organization: "Riverside Critical Access Hospital"
- 5 departments: Emergency, ICU, Med-Surg, Radiology, Lab
- 25 beds across departments (5 ED, 5 ICU, 15 Med-Surg)
- 3 demo auth users with profiles (admin@demo.com / physician@demo.com / nurse@demo.com all password: Demo1234!)
- 10 sample patients with realistic names, DOBs, insurance info
- 3 active encounters with vitals, orders, notes, and billing records
```

---

## SPRINT 1 — Patient Core + Bed Management (75 min)

### Prompt S1-A: Patient Registration

```
Build the Patient Registration feature for Healthland Centriq.

Create these files:
- app/(dashboard)/patients/page.tsx — Patient list page
- app/(dashboard)/patients/new/page.tsx — Registration form page
- app/(dashboard)/patients/[id]/page.tsx — Patient profile page
- components/patients/patient-form.tsx — The registration form component
- components/patients/patient-list.tsx — Searchable patient table
- components/patients/patient-card.tsx — Patient summary card
- app/api/patients/route.ts — GET (list/search) and POST (create)
- app/api/patients/[id]/route.ts — GET single patient

Patient Registration Form fields (use react-hook-form + zod validation):
Section 1 - Demographics: First Name*, Last Name*, Date of Birth*, Gender* (select: Male/Female/Other/Prefer not to say), SSN Last 4, Phone*, Email
Section 2 - Address: Address Line 1, City, State (dropdown), ZIP
Section 3 - Emergency Contact: Name, Phone, Relationship
Section 4 - Insurance: Payer Name*, Policy Number*, Group Number, Plan Type (select: Medicare/Medicaid/Commercial/Self-Pay)

On submit:
- POST to /api/patients
- Insert into Supabase patients table
- Auto-generate MRN (trigger handles this)
- Show success toast "Patient registered successfully — MRN: [mrn]"
- Redirect to /patients/[id]

Patient List page:
- Search bar (searches first_name, last_name, mrn, phone)
- Filter by status (All / Registered / Admitted / Discharged)
- Table columns: MRN, Name, DOB, Status (badge), Insurance, Actions (View Chart, Admit)
- Use TanStack Table for the data table
- Pagination (20 per page)
- "Register New Patient" button top right

Patient Profile page (/patients/[id]):
- Header with patient name, MRN, status badge, DOB, age calculated
- Two-column layout: left = demographics, right = insurance + emergency contact
- Recent encounters list at bottom
- "Admit Patient" button (if status is registered) → opens bed selection dialog
- "View Chart" button (if admitted) → links to /patients/[id]/chart

Use shadcn Card, Table, Badge, Button, Input, Select, Form components throughout.
Status badge colors: registered=blue, admitted=green, discharged=gray.
```

---

### Prompt S1-B: Bed Management Dashboard

```
Build the Bed Management Dashboard for Healthland Centriq with real-time updates.

Create these files:
- app/(dashboard)/beds/page.tsx — Bed management dashboard
- components/beds/bed-grid.tsx — Visual bed grid component
- components/beds/bed-card.tsx — Individual bed card
- components/beds/admit-patient-dialog.tsx — Dialog to admit patient to bed
- components/beds/discharge-dialog.tsx — Confirm discharge dialog
- app/api/beds/route.ts — GET all beds with current patient info
- app/api/beds/[id]/route.ts — PATCH bed status
- app/api/encounters/route.ts — POST create encounter (admission)

Bed Grid layout:
- Department tabs at top (All / Emergency / ICU / Med-Surg)
- Grid of bed cards (responsive: 3-4 cols desktop, 2 cols tablet)
- Stats bar: Total Beds, Available (green count), Occupied (red count), Housekeeping (yellow), Maintenance (gray)
- Occupancy % progress bar

Bed Card component:
- Bed number prominently displayed
- Status with color coding:
  - Available: green border + background, "Available" text
  - Occupied: red/rose border, patient name + admission time
  - Housekeeping: yellow border, broom icon
  - Maintenance: gray border, wrench icon
- If occupied: show patient name, admission date, attending physician
- Click actions:
  - Available bed → opens "Admit Patient" dialog
  - Occupied bed → shows "View Chart" + "Discharge Patient" buttons

Admit Patient Dialog:
- Search/select patient (only status=registered patients)
- Select attending physician (from user_profiles where role=physician)
- Select department (pre-filled from bed's department)
- Chief complaint textarea
- On confirm: POST /api/encounters, PATCH bed status to 'occupied', update patient status to 'admitted'
- Show success toast

Discharge Dialog:
- Confirm patient name + bed number
- On confirm: PATCH encounter status to 'discharged', PATCH bed status to 'housekeeping', update patient status to 'discharged'
- Show success toast

Real-time:
- Subscribe to Supabase Realtime on beds table
- When bed status changes anywhere, update the grid instantly without full page reload
- Show a subtle "Live" indicator badge in the header

Use shadcn Tabs, Dialog, Badge, Progress, Card, Button components.
```

---

## SPRINT 2 — EHR & Clinical Workflows (75 min)

### Prompt S2-A: Patient Chart (EHR View)

```
Build the Patient Chart (EHR) view for Healthland Centriq.

Create these files:
- app/(dashboard)/patients/[id]/chart/page.tsx — Main chart page
- components/chart/chart-header.tsx — Patient + encounter summary header
- components/chart/vitals-section.tsx — Vitals display + entry
- components/chart/vitals-form.tsx — Add new vitals form
- components/chart/diagnoses-section.tsx — Problem list / diagnoses
- components/chart/encounter-summary.tsx — Encounter details card
- app/api/encounters/[id]/vitals/route.ts — GET list + POST new vitals
- app/api/encounters/[id]/diagnoses/route.ts — GET + POST diagnoses
- lib/icd10.ts — Static array of top 50 common ICD-10 codes with descriptions

Chart Page layout (use tabs):
Tab 1: "Overview" — encounter summary, latest vitals snapshot, active orders count, recent notes preview
Tab 2: "Vitals" — vitals history table + add vitals button
Tab 3: "Orders" — (linked to Sprint 2-B)
Tab 4: "Notes" — (linked to Sprint 2-B)
Tab 5: "Billing" — link to billing record for this encounter

Chart Header (sticky at top):
- Patient name (large), MRN, DOB + Age, Gender
- Encounter info: Admission date, Attending physician, Department, Bed number
- Status badge (Active/Discharged)
- Allergies field (NKA or text) — simple text display

Vitals Section:
- Latest vitals card showing: BP (with up/down arrow if abnormal), HR, Temp, O2 Sat, RR, Weight
- Abnormal highlighting: BP >140/90 or <90/60 = red, HR >100 or <60 = red, O2 <95% = red, Temp >38.5C or <36C = red
- Vitals history table: timestamp, all values, recorded by
- "Record Vitals" button → opens inline form (no page navigation)
- Vitals form: all fields, submit to POST /api/encounters/[id]/vitals

Diagnoses Section:
- List of diagnoses with ICD-10 code, description, type badge (Primary/Secondary)
- "Add Diagnosis" button → opens dialog with:
  - ICD-10 search (searchable select from lib/icd10.ts list)
  - Diagnosis type (Primary/Secondary)
  - Submit to POST /api/encounters/[id]/diagnoses

ICD-10 quick list to include in lib/icd10.ts (top common codes):
J06.9 Acute upper respiratory infection, I10 Essential hypertension, E11.9 Type 2 diabetes,
N39.0 UTI, J18.9 Pneumonia, I21.9 Acute MI, J44.1 COPD exacerbation, K92.1 GI bleed,
A41.9 Sepsis, R07.9 Chest pain, R51 Headache, R05 Cough, R10.9 Abdominal pain,
M79.3 Panniculitis, S09.90XA Head injury, Z23 Immunization encounter,
E86.0 Dehydration, K57.30 Diverticulitis, I63.9 Cerebral infarction,
F32.9 Major depressive disorder, plus 30 more common ones.

Use shadcn Tabs, Card, Table, Badge, Dialog, Form, Select components.
```

---

### Prompt S2-B: Orders + Clinical Notes

```
Build the Physician Order Entry and Clinical Notes features for Healthland Centriq.

Create these files:
- components/chart/orders-section.tsx — Orders list + new order form
- components/chart/notes-section.tsx — Notes timeline + new note form
- components/orders/order-card.tsx — Individual order display card
- components/orders/new-order-form.tsx — Create order form
- app/(dashboard)/orders/page.tsx — Global orders queue (all active orders)
- app/api/encounters/[id]/orders/route.ts — GET + POST orders
- app/api/encounters/[id]/notes/route.ts — GET + POST notes
- app/api/orders/[id]/route.ts — PATCH order status

Orders Section (within chart tab):
- Filter bar: All / Medication / Lab / Imaging / Other | All / Pending / In Progress / Completed / Cancelled
- Orders displayed as cards with:
  - Order type icon (pill=medication, flask=lab, scan=imaging)
  - Priority badge: STAT (red), Urgent (orange), Routine (gray)
  - Description, frequency, notes
  - Status badge with color
  - "Mark Complete" button (for pending/in_progress orders)
  - "Cancel" button (for pending orders)
  - Ordered by + timestamp

New Order Form (inline, shows on "New Order" button click):
- Order Type: select (Medication / Lab / Imaging / Other)
- Priority: Radio (Routine / Urgent / STAT)
- Description: text input (show suggestions based on type:
    Medication examples: "Metoprolol 25mg PO BID", "Lisinopril 10mg PO daily", "Aspirin 81mg PO daily"
    Lab examples: "Complete Blood Count (CBC)", "Basic Metabolic Panel (BMP)", "Troponin", "Urinalysis"
    Imaging examples: "Chest X-Ray PA/Lateral", "CT Head without contrast", "EKG 12-lead")
- Frequency: text input with suggestions (Once, Daily, BID, TID, QID, Q4H, Q6H, PRN)
- Notes: textarea (optional)
- Submit → POST /api/encounters/[id]/orders → show success toast

Clinical Notes Section (within chart tab):
- Notes displayed as timeline (newest first)
- Each note shows: note type badge, author name + role, timestamp, full content
- Note type badge colors: nursing=blue, physician=purple, progress=green, discharge=orange
- Content in a styled card with subtle left border color-coded by type
- "Add Note" button → inline form below or modal

New Note Form:
- Note Type: select (Nursing Assessment / Physician Note / Progress Note / Discharge Summary)
- Content: large textarea (min 4 rows), placeholder text per type:
    Nursing Assessment: "Patient Assessment: Chief complaint is... Vital signs stable/unstable... Patient appears..."
    Physician Note: "History of Present Illness: Patient is a [age] [gender] presenting with..."
    Progress Note: "Subjective: Patient reports... Objective: Vitals... Assessment: ... Plan:..."
    Discharge Summary: "Discharge Diagnosis: ... Hospital Course: ... Discharge Condition: ... Follow-up:..."
- Auto-fill author from session, timestamp = now
- Submit → POST /api/encounters/[id]/notes → append to timeline without page reload

Global Orders Queue (/orders page):
- All active (pending + in_progress) orders across all patients
- Table: Patient Name, MRN, Order Type, Description, Priority, Status, Ordered By, Time
- Sort by priority (STAT first) then time
- STAT orders row highlighted in red background
- Quick status update button per row
- Filter by department, order type

Use shadcn Tabs, Card, Badge, Button, Textarea, Select, Form, Separator components.
```

---

## SPRINT 3 — Billing Module (45 min)

### Prompt S3-A: Billing

```
Build the Billing & Revenue Cycle Management module for Healthland Centriq.

Create these files:
- app/(dashboard)/billing/page.tsx — Billing dashboard
- app/(dashboard)/billing/[id]/page.tsx — Encounter billing detail
- components/billing/billing-summary-cards.tsx — KPI summary cards
- components/billing/billing-table.tsx — All billing records table
- components/billing/line-items-editor.tsx — Add/edit billing line items
- app/api/billing/route.ts — GET all + POST create
- app/api/billing/[id]/route.ts — GET single + PATCH update

Billing Dashboard (/billing):
- Summary cards row:
  - Total Billed (all time): dollar amount in blue
  - Collected (paid claims): green
  - Outstanding (submitted, not paid): yellow
  - Denied Claims: red count + amount
- Billing records table:
  - Columns: Patient Name, MRN, Encounter Date, Payer, Total Charges, Status (badge), Actions
  - Status badge: Draft=gray, Submitted=blue, Paid=green, Denied=red
  - Row click → /billing/[id]
  - Filter by status, date range
  - Sort by date desc by default

Encounter Billing Detail (/billing/[id]):
- Header: Patient name, MRN, Encounter dates, Payer info
- Claim status selector (Draft → Submit → Paid / Denied)
- On status change to "Submitted": set submitted_at = now, show confirmation
- Line Items section:
  - Table: CPT Code, Description, Qty, Unit Price, Total
  - "Add Line Item" button → inline row form
  - Common CPT code suggestions (dropdown):
    99213 Office visit established (moderate), 99214 Office visit established (high),
    99221 Initial hospital care, 99222 Initial hospital care moderate,
    85025 CBC with differential, 80053 Comprehensive metabolic panel,
    71046 Chest X-Ray 2 views, 93000 EKG with interpretation,
    99232 Subsequent hospital care, 99238 Hospital discharge
  - Auto-calculate line total on qty/price change
  - Auto-sum total charges
- Financial summary:
  - Total Charges
  - Expected Reimbursement (editable %)
  - Patient Responsibility = Total - Reimbursement
- Notes textarea for billing notes
- Save button

Auto-create billing record:
- When encounter is created (admission), auto-create a billing_record with status=draft, pre-fill payer from patient's insurance
- Add a default line item: 99221 (Initial Hospital Care) $850 x 1

Billing access control: Only users with role 'billing' or 'admin' can access /billing/* routes. Show "Access Denied" card for others.

Use shadcn Card, Table, Badge, Select, Button, Input, Form components.
```

---

## SPRINT 4 — Admin Dashboard + Deploy (30 min)

### Prompt S4-A: Admin Dashboard

```
Build the Admin Dashboard for Healthland Centriq.

Create:
- app/(dashboard)/dashboard/page.tsx — Main dashboard (role-aware)
- components/dashboard/kpi-cards.tsx — Key metric cards
- components/dashboard/census-table.tsx — Current patient census
- components/dashboard/bed-occupancy-chart.tsx — Bed occupancy by department (bar chart, Recharts)
- components/dashboard/recent-activity.tsx — Recent admissions/discharges feed
- components/dashboard/orders-summary.tsx — Pending orders count by type
- app/api/dashboard/stats/route.ts — Aggregated stats endpoint

Dashboard KPI Cards (pull from Supabase):
1. Current Census — count of active encounters (blue, bed icon)
2. Bed Occupancy % — (occupied/total)*100 (green if <80%, yellow 80-90%, red >90%)
3. Pending Orders — count of orders with status=pending (orange, clipboard icon)
4. Today's Admissions — encounters created today (purple, user-plus icon)
5. Today's Discharges — encounters discharged today (gray, user-minus icon)
6. Draft Billing Records — billing records with status=draft (red, dollar-sign icon)

Current Census Table:
- List of all active encounters
- Columns: Patient Name, MRN, Bed, Department, Attending, Admission Date, Length of Stay (days), Chief Complaint
- LOS > 3 days highlighted in yellow
- Quick link to chart

Bed Occupancy Chart:
- Horizontal bar chart per department
- Available (green) vs Occupied (red) vs Other (gray) stacked bars
- Show bed count labels

Recent Activity Feed:
- Last 10 admissions + discharges combined (newest first)
- Icon: arrow-right-to-line (admit) green, arrow-left-from-line (discharge) gray
- "John Doe admitted to Bed 12A — 2 hours ago"
- "Jane Smith discharged from Bed 8 — 4 hours ago"

Role-aware dashboard:
- Admin: sees all panels above
- Physician: sees their patients census, their pending orders, recent notes
- Nurse: sees bed grid summary, their assigned patients, pending orders for their dept
- Billing: sees billing KPIs (draft count, submitted count, total outstanding)
- Receptionist: sees bed availability count, registration queue

Use shadcn Card, Progress, Table, Badge components + Recharts BarChart.
Auto-refresh stats every 60 seconds.
```

---

### Prompt S4-B: Login Page + Deploy

```
Build the Login page and prepare for Vercel deployment for Healthland Centriq.

Create:
- app/login/page.tsx — Login page
- app/login/actions.ts — Server action for auth
- app/(dashboard)/layout.tsx — Dashboard layout with sidebar
- components/layout/sidebar.tsx — Navigation sidebar
- components/layout/user-menu.tsx — User dropdown in sidebar footer

Login Page design:
- Full-page centered layout, NOT inside dashboard sidebar
- Left half: branding panel (dark slate background)
  - Logo: stylized "H" in a medical cross shape
  - Product name "Healthland Centriq" in white
  - Tagline "Modern Hospital Information System for Critical Access Hospitals"
  - 3 bullet points with check icons: "Real-time bed management", "AI-ready clinical workflows", "Cloud-native, built for rural hospitals"
- Right half: white login form
  - "Welcome back" heading
  - "Sign in to your hospital system" subtext
  - Email input
  - Password input
  - "Sign In" button (full width, primary)
  - Demo credentials notice: gray box showing "Demo: admin@demo.com / Demo1234!"
  - Error state handling (invalid credentials toast)
- On success: redirect to /dashboard

Dashboard Sidebar:
- Hospital name at top (from org, or "Healthland Centriq")
- Navigation items with icons and active state highlighting:
  LayoutDashboard → /dashboard
  Users → /patients
  BedDouble → /beds
  ClipboardList → /orders
  Receipt → /billing (only for billing + admin roles)
  Settings → /admin (only for admin role)
- Bottom: user avatar, name, role badge, logout button

Vercel deployment prep:
- Create vercel.json with env var references
- Add .env.example file with all required env vars listed (no values)
- Add a README with: setup steps, demo credentials, feature list
- Ensure all Supabase calls use server-side client in Server Components and API routes
- Test build: next build should complete with no errors

The login page should look premium and trustworthy — this is healthcare software.
```

---

## BONUS PROMPTS (If Time Allows)

### Prompt BONUS-1: AI Clinical Decision Support (15 min)

```
Add AI-powered clinical alerts to Healthland Centriq using Claude API.

Create:
- app/api/ai/clinical-alert/route.ts — POST endpoint
- components/chart/ai-alert-banner.tsx — Alert display component

When a nurse submits new vitals, call Claude API (claude-sonnet-4-6) with:
- Patient age, gender, chief complaint
- Current vitals just entered
- Active diagnoses
- Active orders

Claude prompt: "You are a clinical decision support system for a critical access hospital. Analyze these patient vitals and context. Return a JSON response with: {alert_level: 'none'|'info'|'warning'|'critical', alerts: [{message: string, action: string}]}. Focus on: sepsis criteria, critical vital thresholds, medication contraindications based on diagnoses. Be concise and actionable."

Display:
- If alert_level = 'warning': show yellow banner on chart "AI Alert: [message] — [action]"
- If alert_level = 'critical': show red banner with bell icon + auto-play browser notification
- If alert_level = 'none': no banner
- Show "Powered by Claude AI" subtitle

Add ANTHROPIC_API_KEY to .env.local and vercel.json env references.
Use streaming response for the alert so it appears quickly.
```

### Prompt BONUS-2: Quick Stats API + Real-time Refresh

```
Add real-time dashboard refresh via Supabase Realtime to Healthland Centriq.

- Subscribe to Realtime changes on: encounters, orders, beds tables
- When any change happens, invalidate and refetch the dashboard stats
- Add a "Last updated: X seconds ago" indicator to the dashboard
- Add a manual "Refresh" button with loading spinner
- Show toast notification when a new STAT order is created anywhere in the system: "New STAT order: [description] for [patient name]"
- Subscribe to orders Realtime, filter for priority='stat' and status='pending'

This makes the admin dashboard feel like a live operations center.
```

---

## DEPLOYMENT CHECKLIST

```
Before going live:

Supabase:
[ ] Run 001_initial_schema.sql migration
[ ] Run seed.sql for demo data
[ ] Enable Realtime on beds table (Supabase Dashboard → Database → Replication)
[ ] Set up Row Level Security policies
[ ] Confirm auth.users have matching user_profiles rows

Vercel:
[ ] Connect GitHub repo
[ ] Set env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY (if using AI bonus)
[ ] Trigger deploy
[ ] Test login with demo credentials on live URL
[ ] Test bed real-time in two browser tabs

Demo Prep:
[ ] Confirm 10 patients loaded
[ ] Confirm 3 active encounters with data
[ ] Have demo script ready (see PRD.md section 11)
[ ] Open two tabs side-by-side for real-time demo
```

---

## SPRINT TIME BUDGET

| Sprint | Task | Time |
|--------|------|------|
| Sprint 0-A | Next.js scaffold + auth + layout | 20 min |
| Sprint 0-B | Supabase schema + seed | 10 min |
| Sprint 1-A | Patient registration + list | 40 min |
| Sprint 1-B | Bed management + real-time | 35 min |
| Sprint 2-A | Patient chart + vitals + diagnoses | 40 min |
| Sprint 2-B | Orders + clinical notes | 35 min |
| Sprint 3-A | Billing module | 45 min |
| Sprint 4-A | Admin dashboard | 20 min |
| Sprint 4-B | Login page + Vercel deploy | 10 min |
| **Buffer** | Bug fixes, polish, demo prep | **25 min** |
| **Total** | | **5h 00m** |

---

*Prompts Version: 1.0 | Hackathon: Healthland Centriq | Stack: Next.js + Supabase + Vercel*

---

## AGENT KIT INTEGRATION
### Using the Full Engineering Team from `helthland/agents/`

> The project has a full multi-agent squad in `helthland/agents/`. After each sprint prompt, route to the correct specialist agent for review, fixing, and testing. This section defines how every sprint prompt plugs into the agent kit.

---

### How the Agent Kit Works with These Prompts

The master orchestrator lives at `helthland/CLAUDE.md`. Each sprint prompt below maps to specific agents. The flow for every sprint is:

```
You run sprint prompt
  → Code is generated
  → AUTO-FIX: Find and fix any issues (see rules below)
  → QA Agent writes test cases
  → Security Agent reviews RLS + auth
  → DevOps Agent verifies deploy readiness
```

**Agent file paths:**
| Agent | File | When to invoke |
|-------|------|----------------|
| Product | `helthland/agents/product/CLAUDE.md` | PRD questions, scope decisions, acceptance criteria |
| Frontend | `helthland/agents/frontend/CLAUDE.md` | All Next.js pages, components, forms, realtime UI |
| Backend | `helthland/agents/backend/CLAUDE.md` | Server Actions, API routes, Supabase queries, Zod schemas |
| QA | `helthland/agents/qa/CLAUDE.md` | Test cases after every sprint — unit + integration + E2E |
| Security | `helthland/agents/security/CLAUDE.md` | RLS policy review, auth flows, IDOR checks |
| DevOps | `helthland/agents/devops/CLAUDE.md` | Vercel config, Supabase migrations, CI/CD |
| Architect | `helthland/agents/architect/CLAUDE.md` | Schema changes, API contract updates |
| Docs | `helthland/agents/docs/CLAUDE.md` | README, runbook, seed data docs |

---

### AUTO-FIX PROTOCOL — Run After Every Prompt

After each sprint prompt generates code, immediately check for and fix these issues before moving to the next sprint:

**TypeScript errors:**
```
Run: npx tsc --noEmit
Fix: All type errors before proceeding. Use Supabase generated types from
     `supabase gen types typescript --local > src/types/supabase.ts`
     Never use `any` — narrow types or use `unknown`.
```

**Build errors:**
```
Run: npm run build
Fix: Any import errors, missing modules, or RSC/client boundary violations.
     If a Client Component imports a Server-only module, move logic to a Server Action.
```

**Supabase RLS gaps:**
```
Check: Every new table created has RLS enabled + at least one SELECT policy.
Fix:   If RLS is missing, add it immediately — a table with no RLS is world-readable.
       Enable with: ALTER TABLE [table] ENABLE ROW LEVEL SECURITY;
```

**Auth missing in Server Actions:**
```
Check: Every Server Action starts with `supabase.auth.getUser()` check.
Fix:   If missing, add auth check as the very first line:
       const { data: { user } } = await supabase.auth.getUser()
       if (!user) return { success: false, error: "Unauthorized" }
```

**Missing loading/error states:**
```
Check: Every async page route has a loading.tsx and error.tsx sibling file.
Fix:   Add skeleton loading.tsx and friendly error.tsx for each async route segment.
```

**Realtime subscription cleanup:**
```
Check: Every useEffect that creates a Supabase channel returns a cleanup function.
Fix:   return () => { supabase.removeChannel(channel) }
```

**Environment variables:**
```
Check: No SUPABASE_SERVICE_ROLE_KEY or ANTHROPIC_API_KEY used in Client Components.
Fix:   Move to Server Action or API Route immediately if found.
```

---

### TEST CASES — Run After Every Sprint

After each sprint is built and auto-fixed, use the **QA Agent** (`helthland/agents/qa/CLAUDE.md`) to generate tests. Use this prompt template per sprint:

#### QA Prompt Template (paste after each sprint)

```
You are the QA Agent defined in helthland/agents/qa/CLAUDE.md.

Sprint just completed: [SPRINT NAME]
Features built: [LIST FEATURES]

Generate the full test suite for this sprint following the QA agent's testing philosophy:
1. Unit tests (Vitest) for all Server Actions
2. Component tests (Vitest + React Testing Library) for all forms and interactive components
3. Integration tests (Supabase local stack) for all RLS policies on new tables
4. E2E tests (Playwright) for the critical happy path and auth-gated routes

Follow the exact code patterns from helthland/agents/qa/CLAUDE.md.
Place tests at:
  - Unit: tests/unit/[feature]/
  - Integration: tests/integration/rls/[table].test.ts
  - E2E: tests/e2e/[feature].spec.ts
```

---

### Sprint → Agent Mapping

#### Sprint 0 (Foundation) — After S0-A + S0-B complete

**Product Agent check:**
```
Read helthland/agents/product/CLAUDE.md.
Verify the scaffolded routes match PRD section 8 (Key Pages).
Flag any missing routes from the PRD that were not scaffolded.
```

**QA Agent — Sprint 0 tests:**
```
Test: middleware.ts correctly redirects unauthenticated users for all protected routes.
Test: Supabase client (browser + server) initializes without errors.
Test: All 12 DB tables exist with correct columns and RLS enabled.
Test: Seed data loads — 10 patients, 25 beds, 3 users, 3 encounters present after seed.sql runs.

E2E: Unauthenticated user visiting /dashboard → redirected to /login
E2E: /login page renders email + password fields + demo credentials notice
```

**Security Agent check:**
```
Read helthland/agents/security/CLAUDE.md.
Verify RLS is enabled on all 12 tables.
Verify no service role key is referenced in any client-side file.
Verify middleware.ts covers all routes listed in PRD.
```

---

#### Sprint 1 (Patient Core + Beds) — After S1-A + S1-B complete

**QA Agent — Sprint 1 tests:**

Unit tests:
```
POST /api/patients — valid payload → returns 201 + patient with MRN
POST /api/patients — missing required field → returns 400 + field errors
POST /api/patients — unauthenticated → returns 401
GET  /api/patients — returns only patients from same org (RLS)
PATCH /api/beds/[id] — changes status from available to occupied
PATCH /api/beds/[id] — unauthenticated → returns 401
POST /api/encounters — creates encounter, updates bed status to occupied, updates patient status to admitted
```

Integration RLS tests:
```
patients table: User from Org A cannot read patients from Org B
patients table: Unauthenticated user gets 0 rows
beds table: User can read all beds in their org
beds table: User from different org cannot update bed status
encounters table: Physician can create encounter; billing staff cannot update patient demographics
```

E2E Playwright tests:
```
Register new patient → form submits → success toast shows MRN → redirected to /patients/[id]
Patient list page → search by last name → correct patient appears
Bed dashboard → available bed card → click → Admit Patient dialog opens
Admit patient to bed → bed card turns red/occupied → patient status badge changes to Admitted
Open /beds in two tabs → discharge patient in tab 1 → bed turns to Housekeeping in tab 2 within 3 seconds (realtime)
```

---

#### Sprint 2 (EHR + Orders + Notes) — After S2-A + S2-B complete

**QA Agent — Sprint 2 tests:**

Unit tests:
```
POST /api/encounters/[id]/vitals — valid values → saved, abnormal flags computed correctly
POST /api/encounters/[id]/vitals — BP 200/120 → flagged as abnormal (red)
POST /api/encounters/[id]/vitals — O2 sat 92 → flagged as abnormal
POST /api/encounters/[id]/orders — STAT order → saved with priority=stat
POST /api/encounters/[id]/orders — missing description → returns 400
POST /api/encounters/[id]/notes — note type not in enum → returns 400
PATCH /api/orders/[id] — mark complete → status changes to completed, completed_at set
```

Integration RLS tests:
```
vitals table: Nurse can insert vitals for encounter in their org
vitals table: User from different org cannot read or insert vitals
orders table: Physician can create orders; receptionist role cannot
clinical_notes table: Any authenticated org member can create notes
diagnoses table: Physician can add diagnosis; read by all org members
```

E2E Playwright tests:
```
Open patient chart → Overview tab shows latest vitals, active order count, recent note
Vitals tab → click Record Vitals → fill form → submit → new row appears in vitals history table
Enter BP 200/120 → value appears in red in latest vitals card
Add diagnosis ICD-10 I10 (Hypertension) → appears in problem list
Create STAT medication order for "Metoprolol 25mg PO BID" → appears at top of orders list with red STAT badge
Write physician note → note appears in timeline with purple badge
```

---

#### Sprint 3 (Billing) — After S3-A complete

**QA Agent — Sprint 3 tests:**

Unit tests:
```
GET /api/billing — admin/billing role → returns all billing records
GET /api/billing — nurse role → returns 403 Access Denied
PATCH /api/billing/[id] — status: submitted → submitted_at timestamp auto-set
PATCH /api/billing/[id] — invalid status value → returns 400
Auto-creation: POST /api/encounters → billing_record with status=draft auto-created
Line item total: unit_price * quantity = total (computed correctly)
Total charges: sum of all line item totals = billing_record.total_charges
```

Integration RLS tests:
```
billing_records: admin role can read/write all
billing_records: billing role can read/write all
billing_records: physician/nurse role gets 0 rows (RLS blocks)
billing_records: user from different org cannot access another org's billing
billing_line_items: RLS inherited from billing_records parent
```

E2E Playwright tests:
```
Login as admin → navigate to /billing → 4 summary cards visible
Click billing record → detail page shows patient name, payer, line items
Add line item CPT 85025 → total charges auto-updates
Change status to Submitted → submitted_at timestamp appears → toast confirmation
Login as nurse → navigate to /billing → "Access Denied" card shown
```

---

#### Sprint 4 (Dashboard + Deploy) — After S4-A + S4-B complete

**QA Agent — Sprint 4 tests:**

Unit tests:
```
GET /api/dashboard/stats — returns correct census count from active encounters
GET /api/dashboard/stats — bed occupancy % = occupied / total * 100
GET /api/dashboard/stats — today's admissions = encounters created since midnight today
Dashboard KPIs refresh every 60 seconds (check setInterval is set correctly)
```

E2E Playwright tests:
```
Login page renders correctly — branding panel left, form right
Login with admin@demo.com / Demo1234! → redirected to /dashboard
Dashboard KPI cards all show non-null values
Current census table shows patients admitted in seed data
Bed occupancy chart renders with department bars
Login as physician → billing nav item NOT visible in sidebar
Login as admin → billing AND admin nav items visible
Logout → session cleared → /dashboard redirects to /login
```

**DevOps Agent — Deploy verification:**
```
Read helthland/agents/devops/CLAUDE.md.
Verify: vercel.json has all required env var references
Verify: next build passes with 0 errors and 0 type errors
Verify: supabase/migrations/001_initial_schema.sql is idempotent (can run twice without error)
Verify: seed.sql uses ON CONFLICT DO NOTHING so re-runs don't fail
Verify: NEXT_PUBLIC_ env vars are only used for non-secret values
```

---

### Full Agent Kit Run — Post-All-Sprints Quality Gate

When all 4 sprints are done, run this final quality gate using the full agent team:

**Step 1 — Product Agent sign-off:**
```
Read helthland/agents/product/CLAUDE.md.
Review PRD.md section 10 (Success Criteria / Demo Checklist).
Verify every checkbox can be ticked based on what was built.
Flag any checklist item that is not yet implemented.
```

**Step 2 — Security Agent full audit:**
```
Read helthland/agents/security/CLAUDE.md.
Audit all 12 Supabase tables for RLS completeness.
Audit all Server Actions and API routes for auth checks.
Check for: IDOR vulnerabilities, missing validation, exposed secrets.
Output a security report with PASS / FAIL per check.
```

**Step 3 — QA Agent full regression:**
```
Read helthland/agents/qa/CLAUDE.md.
Run full test suite: npx vitest run && npx playwright test
Coverage target: ≥ 70% (adjusted for hackathon context)
All E2E tests passing = green light to demo.
```

**Step 4 — DevOps Agent production check:**
```
Read helthland/agents/devops/CLAUDE.md.
Verify Vercel deployment is live and accessible.
Verify seed data is present on production Supabase.
Verify Supabase Realtime is enabled on beds table.
Test login with demo credentials on the live URL.
```

**Step 5 — Docs Agent:**
```
Read helthland/agents/docs/CLAUDE.md.
Update README with: live URL, demo credentials, 5-minute demo script (from PRD section 11).
```

---

*Agent Kit Version: 1.0 | Agents path: helthland/agents/ | Orchestrator: helthland/CLAUDE.md* |Orchestrator: helthland/AGENTS.md*
