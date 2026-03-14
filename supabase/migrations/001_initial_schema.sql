create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'critical_access_hospital',
  address text,
  npi text,
  created_at timestamptz not null default now()
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  code text not null,
  floor text,
  created_at timestamptz not null default now()
);

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  mrn text unique not null,
  org_id uuid not null references public.organizations(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  date_of_birth date,
  gender text,
  ssn_last4 text,
  address_line1 text,
  city text,
  state text,
  zip text,
  phone text,
  email text,
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relationship text,
  insurance_payer text,
  policy_number text,
  group_number text,
  plan_type text,
  status text not null default 'registered' check (status in ('registered', 'admitted', 'discharged')),
  allergies text default 'NKA',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.beds (
  id uuid primary key default gen_random_uuid(),
  dept_id uuid not null references public.departments(id) on delete cascade,
  bed_number text not null,
  status text not null default 'available' check (status in ('available', 'occupied', 'housekeeping', 'maintenance')),
  bed_type text not null default 'standard',
  patient_id uuid references public.patients(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  role text not null check (role in ('admin', 'physician', 'nurse', 'billing', 'receptionist')),
  full_name text not null,
  npi text,
  department_id uuid references public.departments(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.encounters (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  bed_id uuid references public.beds(id) on delete set null,
  org_id uuid not null references public.organizations(id) on delete cascade,
  dept_id uuid references public.departments(id) on delete set null,
  attending_physician_id uuid references public.user_profiles(id) on delete set null,
  admission_date timestamptz not null default now(),
  discharge_date timestamptz,
  status text not null default 'active' check (status in ('active', 'discharged', 'cancelled')),
  chief_complaint text,
  created_at timestamptz not null default now()
);

create table if not exists public.vitals (
  id uuid primary key default gen_random_uuid(),
  encounter_id uuid not null references public.encounters(id) on delete cascade,
  recorded_by uuid references public.user_profiles(id) on delete set null,
  bp_systolic integer,
  bp_diastolic integer,
  heart_rate integer,
  temperature numeric(4,1),
  o2_saturation integer,
  respiratory_rate integer,
  weight_kg numeric(5,1),
  recorded_at timestamptz not null default now()
);

create table if not exists public.diagnoses (
  id uuid primary key default gen_random_uuid(),
  encounter_id uuid not null references public.encounters(id) on delete cascade,
  icd10_code text not null,
  description text not null,
  diagnosis_type text not null default 'primary' check (diagnosis_type in ('primary', 'secondary')),
  added_by uuid references public.user_profiles(id) on delete set null,
  added_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  encounter_id uuid not null references public.encounters(id) on delete cascade,
  order_type text not null check (order_type in ('medication', 'lab', 'imaging', 'other')),
  description text not null,
  frequency text,
  priority text not null default 'routine' check (priority in ('routine', 'stat', 'urgent')),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  ordered_by uuid references public.user_profiles(id) on delete set null,
  ordered_at timestamptz not null default now(),
  completed_at timestamptz,
  notes text
);

create table if not exists public.clinical_notes (
  id uuid primary key default gen_random_uuid(),
  encounter_id uuid not null references public.encounters(id) on delete cascade,
  note_type text not null check (note_type in ('nursing_assessment', 'physician_note', 'progress_note', 'discharge_summary')),
  content text not null,
  author_id uuid references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.billing_records (
  id uuid primary key default gen_random_uuid(),
  encounter_id uuid not null unique references public.encounters(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete cascade,
  payer text,
  claim_status text not null default 'draft' check (claim_status in ('draft', 'submitted', 'paid', 'denied')),
  total_charges numeric(10,2) not null default 0,
  expected_reimbursement numeric(10,2) not null default 0,
  patient_responsibility numeric(10,2) not null default 0,
  submitted_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.billing_line_items (
  id uuid primary key default gen_random_uuid(),
  billing_record_id uuid not null references public.billing_records(id) on delete cascade,
  cpt_code text,
  description text not null,
  quantity integer not null default 1,
  unit_price numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0
);

create index if not exists departments_org_id_idx on public.departments (org_id);
create index if not exists patients_org_id_idx on public.patients (org_id);
create index if not exists beds_dept_id_idx on public.beds (dept_id);
create index if not exists encounters_patient_id_idx on public.encounters (patient_id);
create index if not exists encounters_org_id_idx on public.encounters (org_id);
create index if not exists vitals_encounter_id_idx on public.vitals (encounter_id);
create index if not exists diagnoses_encounter_id_idx on public.diagnoses (encounter_id);
create index if not exists orders_encounter_id_idx on public.orders (encounter_id);
create index if not exists clinical_notes_encounter_id_idx on public.clinical_notes (encounter_id);
create index if not exists billing_records_patient_id_idx on public.billing_records (patient_id);
create index if not exists billing_line_items_record_id_idx on public.billing_line_items (billing_record_id);

create or replace function public.auth_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.user_profiles
  where id = auth.uid()
$$;

create or replace function public.auth_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id
  from public.user_profiles
  where id = auth.uid()
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.generate_patient_mrn()
returns trigger
language plpgsql
as $$
begin
  if new.mrn is null or new.mrn = '' then
    new.mrn := 'MRN-' || to_char(current_date, 'YYYYMMDD') || '-' || lpad((floor(random() * 10000))::int::text, 4, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists patients_generate_mrn on public.patients;
create trigger patients_generate_mrn
before insert on public.patients
for each row
execute function public.generate_patient_mrn();

drop trigger if exists patients_set_updated_at on public.patients;
create trigger patients_set_updated_at
before update on public.patients
for each row
execute function public.set_updated_at();

drop trigger if exists beds_set_updated_at on public.beds;
create trigger beds_set_updated_at
before update on public.beds
for each row
execute function public.set_updated_at();

drop trigger if exists billing_records_set_updated_at on public.billing_records;
create trigger billing_records_set_updated_at
before update on public.billing_records
for each row
execute function public.set_updated_at();

alter table public.organizations enable row level security;
alter table public.departments enable row level security;
alter table public.beds enable row level security;
alter table public.user_profiles enable row level security;
alter table public.patients enable row level security;
alter table public.encounters enable row level security;
alter table public.vitals enable row level security;
alter table public.diagnoses enable row level security;
alter table public.orders enable row level security;
alter table public.clinical_notes enable row level security;
alter table public.billing_records enable row level security;
alter table public.billing_line_items enable row level security;

drop policy if exists "organizations_same_org_read" on public.organizations;
create policy "organizations_same_org_read"
on public.organizations
for select
to authenticated
using (id = public.auth_org_id());

drop policy if exists "organizations_admin_write" on public.organizations;
create policy "organizations_admin_write"
on public.organizations
for all
to authenticated
using (public.auth_role() = 'admin' and id = public.auth_org_id())
with check (public.auth_role() = 'admin' and id = public.auth_org_id());

drop policy if exists "departments_same_org_read" on public.departments;
create policy "departments_same_org_read"
on public.departments
for select
to authenticated
using (org_id = public.auth_org_id());

drop policy if exists "departments_admin_write" on public.departments;
create policy "departments_admin_write"
on public.departments
for all
to authenticated
using (public.auth_role() = 'admin' and org_id = public.auth_org_id())
with check (public.auth_role() = 'admin' and org_id = public.auth_org_id());

drop policy if exists "beds_same_org_read" on public.beds;
create policy "beds_same_org_read"
on public.beds
for select
to authenticated
using (
  exists (
    select 1
    from public.departments
    where departments.id = beds.dept_id
      and departments.org_id = public.auth_org_id()
  )
);

drop policy if exists "beds_same_org_write" on public.beds;
create policy "beds_same_org_write"
on public.beds
for all
to authenticated
using (
  exists (
    select 1
    from public.departments
    where departments.id = beds.dept_id
      and departments.org_id = public.auth_org_id()
  )
)
with check (
  exists (
    select 1
    from public.departments
    where departments.id = beds.dept_id
      and departments.org_id = public.auth_org_id()
  )
);

drop policy if exists "user_profiles_self_or_admin_read" on public.user_profiles;
create policy "user_profiles_self_or_admin_read"
on public.user_profiles
for select
to authenticated
using (
  id = auth.uid()
  or (
    public.auth_role() = 'admin'
    and org_id = public.auth_org_id()
  )
);

drop policy if exists "user_profiles_self_update" on public.user_profiles;
create policy "user_profiles_self_update"
on public.user_profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid() and org_id = public.auth_org_id());

drop policy if exists "user_profiles_admin_write" on public.user_profiles;
create policy "user_profiles_admin_write"
on public.user_profiles
for all
to authenticated
using (public.auth_role() = 'admin' and org_id = public.auth_org_id())
with check (public.auth_role() = 'admin' and org_id = public.auth_org_id());

drop policy if exists "patients_same_org_rw" on public.patients;
create policy "patients_same_org_rw"
on public.patients
for all
to authenticated
using (org_id = public.auth_org_id())
with check (org_id = public.auth_org_id());

drop policy if exists "encounters_same_org_rw" on public.encounters;
create policy "encounters_same_org_rw"
on public.encounters
for all
to authenticated
using (org_id = public.auth_org_id())
with check (org_id = public.auth_org_id());

drop policy if exists "vitals_same_org_rw" on public.vitals;
create policy "vitals_same_org_rw"
on public.vitals
for all
to authenticated
using (
  exists (
    select 1
    from public.encounters
    where encounters.id = vitals.encounter_id
      and encounters.org_id = public.auth_org_id()
  )
)
with check (
  exists (
    select 1
    from public.encounters
    where encounters.id = vitals.encounter_id
      and encounters.org_id = public.auth_org_id()
  )
);

drop policy if exists "diagnoses_same_org_rw" on public.diagnoses;
create policy "diagnoses_same_org_rw"
on public.diagnoses
for all
to authenticated
using (
  exists (
    select 1
    from public.encounters
    where encounters.id = diagnoses.encounter_id
      and encounters.org_id = public.auth_org_id()
  )
)
with check (
  exists (
    select 1
    from public.encounters
    where encounters.id = diagnoses.encounter_id
      and encounters.org_id = public.auth_org_id()
  )
);

drop policy if exists "orders_same_org_rw" on public.orders;
create policy "orders_same_org_rw"
on public.orders
for all
to authenticated
using (
  exists (
    select 1
    from public.encounters
    where encounters.id = orders.encounter_id
      and encounters.org_id = public.auth_org_id()
  )
)
with check (
  exists (
    select 1
    from public.encounters
    where encounters.id = orders.encounter_id
      and encounters.org_id = public.auth_org_id()
  )
);

drop policy if exists "clinical_notes_same_org_rw" on public.clinical_notes;
create policy "clinical_notes_same_org_rw"
on public.clinical_notes
for all
to authenticated
using (
  exists (
    select 1
    from public.encounters
    where encounters.id = clinical_notes.encounter_id
      and encounters.org_id = public.auth_org_id()
  )
)
with check (
  exists (
    select 1
    from public.encounters
    where encounters.id = clinical_notes.encounter_id
      and encounters.org_id = public.auth_org_id()
  )
);

drop policy if exists "billing_records_billing_admin_rw" on public.billing_records;
create policy "billing_records_billing_admin_rw"
on public.billing_records
for all
to authenticated
using (
  public.auth_role() in ('admin', 'billing')
  and exists (
    select 1
    from public.patients
    where patients.id = billing_records.patient_id
      and patients.org_id = public.auth_org_id()
  )
)
with check (
  public.auth_role() in ('admin', 'billing')
  and exists (
    select 1
    from public.patients
    where patients.id = billing_records.patient_id
      and patients.org_id = public.auth_org_id()
  )
);

drop policy if exists "billing_line_items_billing_admin_rw" on public.billing_line_items;
create policy "billing_line_items_billing_admin_rw"
on public.billing_line_items
for all
to authenticated
using (
  exists (
    select 1
    from public.billing_records
    join public.patients on patients.id = billing_records.patient_id
    where billing_records.id = billing_line_items.billing_record_id
      and patients.org_id = public.auth_org_id()
      and public.auth_role() in ('admin', 'billing')
  )
)
with check (
  exists (
    select 1
    from public.billing_records
    join public.patients on patients.id = billing_records.patient_id
    where billing_records.id = billing_line_items.billing_record_id
      and patients.org_id = public.auth_org_id()
      and public.auth_role() in ('admin', 'billing')
  )
);

alter publication supabase_realtime add table public.beds;
