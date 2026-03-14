create extension if not exists pgcrypto;

do $$
declare
  org_uuid uuid := '11111111-1111-1111-1111-111111111111';
  emergency_uuid uuid := '22222222-2222-2222-2222-222222222221';
  icu_uuid uuid := '22222222-2222-2222-2222-222222222222';
  medsurg_uuid uuid := '22222222-2222-2222-2222-222222222223';
  radiology_uuid uuid := '22222222-2222-2222-2222-222222222224';
  lab_uuid uuid := '22222222-2222-2222-2222-222222222225';
  admin_user uuid := '33333333-3333-3333-3333-333333333331';
  physician_user uuid := '33333333-3333-3333-3333-333333333332';
  nurse_user uuid := '33333333-3333-3333-3333-333333333333';
  billing_user uuid := '33333333-3333-3333-3333-333333333334';
  receptionist_user uuid := '33333333-3333-3333-3333-333333333335';
begin
  insert into public.organizations (id, name, address, npi)
  values (org_uuid, 'Riverside Critical Access Hospital', '120 Rural Route, Cedar Valley, MT 59001', '1234567890')
  on conflict (id) do update set name = excluded.name;

  insert into public.departments (id, org_id, name, code, floor)
  values
    (emergency_uuid, org_uuid, 'Emergency', 'ED', '1'),
    (icu_uuid, org_uuid, 'ICU', 'ICU', '2'),
    (medsurg_uuid, org_uuid, 'Med-Surg', 'MS', '2'),
    (radiology_uuid, org_uuid, 'Radiology', 'RAD', '1'),
    (lab_uuid, org_uuid, 'Lab', 'LAB', '1')
  on conflict (id) do update set name = excluded.name;

  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token
  )
  values
    (admin_user, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@demo.com', crypt('Demo1234!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"admin","full_name":"Maya Thompson"}', now(), now(), '', ''),
    (physician_user, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'physician@demo.com', crypt('Demo1234!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"physician","full_name":"Dr. Eli Harper"}', now(), now(), '', ''),
    (nurse_user, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nurse@demo.com', crypt('Demo1234!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"nurse","full_name":"Avery Collins"}', now(), now(), '', ''),
    (billing_user, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'billing@demo.com', crypt('Demo1234!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"billing","full_name":"Jordan Blake"}', now(), now(), '', ''),
    (receptionist_user, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'receptionist@demo.com', crypt('Demo1234!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"role":"receptionist","full_name":"Casey Morgan"}', now(), now(), '', '')
  on conflict (id) do update set email = excluded.email;

  insert into auth.identities (
    id, user_id, identity_data, provider, provider_id, created_at, updated_at
  )
  values
    (gen_random_uuid(), admin_user, jsonb_build_object('sub', admin_user::text, 'email', 'admin@demo.com'), 'email', admin_user::text, now(), now()),
    (gen_random_uuid(), physician_user, jsonb_build_object('sub', physician_user::text, 'email', 'physician@demo.com'), 'email', physician_user::text, now(), now()),
    (gen_random_uuid(), nurse_user, jsonb_build_object('sub', nurse_user::text, 'email', 'nurse@demo.com'), 'email', nurse_user::text, now(), now()),
    (gen_random_uuid(), billing_user, jsonb_build_object('sub', billing_user::text, 'email', 'billing@demo.com'), 'email', billing_user::text, now(), now()),
    (gen_random_uuid(), receptionist_user, jsonb_build_object('sub', receptionist_user::text, 'email', 'receptionist@demo.com'), 'email', receptionist_user::text, now(), now())
  on conflict do nothing;

  insert into public.user_profiles (id, org_id, role, full_name, npi, department_id)
  values
    (admin_user, org_uuid, 'admin', 'Maya Thompson', null, emergency_uuid),
    (physician_user, org_uuid, 'physician', 'Dr. Eli Harper', '1457398201', icu_uuid),
    (nurse_user, org_uuid, 'nurse', 'Avery Collins', null, medsurg_uuid),
    (billing_user, org_uuid, 'billing', 'Jordan Blake', null, null),
    (receptionist_user, org_uuid, 'receptionist', 'Casey Morgan', null, emergency_uuid)
  on conflict (id) do update set role = excluded.role, full_name = excluded.full_name;
end $$;

insert into public.beds (dept_id, bed_number, status, bed_type)
values
  ('22222222-2222-2222-2222-222222222221', 'ED-01', 'available', 'emergency'),
  ('22222222-2222-2222-2222-222222222221', 'ED-02', 'available', 'emergency'),
  ('22222222-2222-2222-2222-222222222221', 'ED-03', 'occupied', 'emergency'),
  ('22222222-2222-2222-2222-222222222221', 'ED-04', 'housekeeping', 'emergency'),
  ('22222222-2222-2222-2222-222222222221', 'ED-05', 'available', 'emergency'),
  ('22222222-2222-2222-2222-222222222222', 'ICU-01', 'occupied', 'icu'),
  ('22222222-2222-2222-2222-222222222222', 'ICU-02', 'available', 'icu'),
  ('22222222-2222-2222-2222-222222222222', 'ICU-03', 'available', 'icu'),
  ('22222222-2222-2222-2222-222222222222', 'ICU-04', 'maintenance', 'icu'),
  ('22222222-2222-2222-2222-222222222222', 'ICU-05', 'available', 'icu'),
  ('22222222-2222-2222-2222-222222222223', 'MS-01', 'available', 'med-surg'),
  ('22222222-2222-2222-2222-222222222223', 'MS-02', 'available', 'med-surg'),
  ('22222222-2222-2222-2222-222222222223', 'MS-03', 'occupied', 'med-surg'),
  ('22222222-2222-2222-2222-222222222223', 'MS-04', 'available', 'med-surg'),
  ('22222222-2222-2222-2222-222222222223', 'MS-05', 'available', 'med-surg'),
  ('22222222-2222-2222-2222-222222222223', 'MS-06', 'available', 'med-surg'),
  ('22222222-2222-2222-2222-222222222223', 'MS-07', 'available', 'med-surg'),
  ('22222222-2222-2222-2222-222222222223', 'MS-08', 'housekeeping', 'med-surg'),
  ('22222222-2222-2222-2222-222222222223', 'MS-09', 'available', 'med-surg'),
  ('22222222-2222-2222-2222-222222222223', 'MS-10', 'available', 'med-surg'),
  ('22222222-2222-2222-2222-222222222223', 'MS-11', 'available', 'med-surg'),
  ('22222222-2222-2222-2222-222222222223', 'MS-12', 'available', 'med-surg'),
  ('22222222-2222-2222-2222-222222222223', 'MS-13', 'available', 'med-surg'),
  ('22222222-2222-2222-2222-222222222223', 'MS-14', 'available', 'med-surg'),
  ('22222222-2222-2222-2222-222222222223', 'MS-15', 'available', 'med-surg');

insert into public.patients (
  id, mrn, org_id, first_name, last_name, date_of_birth, gender, phone, email,
  emergency_contact_name, emergency_contact_phone, insurance_payer, policy_number,
  group_number, plan_type, status, allergies, city, state, zip
)
values
  ('44444444-4444-4444-4444-444444444441', 'MRN-20260314-1001', '11111111-1111-1111-1111-111111111111', 'John', 'Carter', '1954-08-21', 'Male', '406-555-0101', 'john.carter@example.com', 'Emily Carter', '406-555-0191', 'Medicare', 'MCR1001', 'GRP01', 'Medicare', 'admitted', 'NKA', 'Cedar Valley', 'MT', '59001'),
  ('44444444-4444-4444-4444-444444444442', 'MRN-20260314-1002', '11111111-1111-1111-1111-111111111111', 'Maria', 'Lopez', '1978-11-03', 'Female', '406-555-0102', 'maria.lopez@example.com', 'Luis Lopez', '406-555-0192', 'BlueCross', 'BC1002', 'GRP02', 'Commercial', 'admitted', 'Penicillin', 'Pine Ridge', 'MT', '59002'),
  ('44444444-4444-4444-4444-444444444443', 'MRN-20260314-1003', '11111111-1111-1111-1111-111111111111', 'Henry', 'Bishop', '1949-02-14', 'Male', '406-555-0103', 'henry.bishop@example.com', 'Clara Bishop', '406-555-0193', 'Medicaid', 'MCD1003', 'GRP03', 'Medicaid', 'admitted', 'Latex', 'Maple Fork', 'MT', '59003'),
  ('44444444-4444-4444-4444-444444444444', 'MRN-20260314-1004', '11111111-1111-1111-1111-111111111111', 'Lena', 'Price', '1988-05-17', 'Female', '406-555-0104', 'lena.price@example.com', 'Ethan Price', '406-555-0194', 'Aetna', 'AET1004', 'GRP04', 'Commercial', 'registered', 'NKA', 'Riverside', 'MT', '59004'),
  ('44444444-4444-4444-4444-444444444445', 'MRN-20260314-1005', '11111111-1111-1111-1111-111111111111', 'Oliver', 'Nguyen', '1993-09-09', 'Male', '406-555-0105', 'oliver.nguyen@example.com', 'Mai Nguyen', '406-555-0195', 'Cigna', 'CG1005', 'GRP05', 'Commercial', 'registered', 'NKA', 'Cedar Valley', 'MT', '59005'),
  ('44444444-4444-4444-4444-444444444446', 'MRN-20260314-1006', '11111111-1111-1111-1111-111111111111', 'Aisha', 'Bennett', '1967-12-01', 'Female', '406-555-0106', 'aisha.bennett@example.com', 'Noah Bennett', '406-555-0196', 'Medicare', 'MCR1006', 'GRP06', 'Medicare', 'registered', 'Sulfa', 'Oak Run', 'MT', '59006'),
  ('44444444-4444-4444-4444-444444444447', 'MRN-20260314-1007', '11111111-1111-1111-1111-111111111111', 'Samuel', 'Reed', '2001-07-28', 'Male', '406-555-0107', 'samuel.reed@example.com', 'Grace Reed', '406-555-0197', 'Self Pay', 'SP1007', 'GRP07', 'Self-Pay', 'registered', 'NKA', 'Willow Creek', 'MT', '59007'),
  ('44444444-4444-4444-4444-444444444448', 'MRN-20260314-1008', '11111111-1111-1111-1111-111111111111', 'Nora', 'Hale', '1959-04-11', 'Female', '406-555-0108', 'nora.hale@example.com', 'Ivy Hale', '406-555-0198', 'Humana', 'HM1008', 'GRP08', 'Commercial', 'registered', 'NKA', 'Elk Point', 'MT', '59008'),
  ('44444444-4444-4444-4444-444444444449', 'MRN-20260314-1009', '11111111-1111-1111-1111-111111111111', 'Peter', 'Fox', '1972-03-24', 'Male', '406-555-0109', 'peter.fox@example.com', 'Nina Fox', '406-555-0199', 'Medicaid', 'MCD1009', 'GRP09', 'Medicaid', 'registered', 'Shellfish', 'Stone River', 'MT', '59009'),
  ('44444444-4444-4444-4444-444444444450', 'MRN-20260314-1010', '11111111-1111-1111-1111-111111111111', 'Clara', 'Young', '1984-10-19', 'Female', '406-555-0110', 'clara.young@example.com', 'Ben Young', '406-555-0200', 'BlueCross', 'BC1010', 'GRP10', 'Commercial', 'registered', 'NKA', 'Ash Meadow', 'MT', '59010')
on conflict (id) do nothing;

with bed_lookup as (
  select bed_number, id from public.beds
)
insert into public.encounters (
  id, patient_id, bed_id, org_id, dept_id, attending_physician_id, admission_date, status, chief_complaint
)
values
  ('55555555-5555-5555-5555-555555555551', '44444444-4444-4444-4444-444444444441', (select id from bed_lookup where bed_number = 'ED-03'), '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222221', '33333333-3333-3333-3333-333333333332', now() - interval '5 hours', 'active', 'Chest pain and dizziness'),
  ('55555555-5555-5555-5555-555555555552', '44444444-4444-4444-4444-444444444442', (select id from bed_lookup where bed_number = 'ICU-01'), '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333332', now() - interval '1 day', 'active', 'Sepsis monitoring'),
  ('55555555-5555-5555-5555-555555555553', '44444444-4444-4444-4444-444444444443', (select id from bed_lookup where bed_number = 'MS-03'), '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222223', '33333333-3333-3333-3333-333333333332', now() - interval '9 hours', 'active', 'Pneumonia with hypoxia')
on conflict (id) do nothing;

insert into public.vitals (
  encounter_id, recorded_by, bp_systolic, bp_diastolic, heart_rate, temperature, o2_saturation, respiratory_rate, weight_kg, recorded_at
)
values
  ('55555555-5555-5555-5555-555555555551', '33333333-3333-3333-3333-333333333333', 152, 95, 104, 37.8, 96, 18, 81.4, now() - interval '20 minutes'),
  ('55555555-5555-5555-5555-555555555552', '33333333-3333-3333-3333-333333333333', 98, 62, 112, 38.9, 92, 24, 70.2, now() - interval '15 minutes'),
  ('55555555-5555-5555-5555-555555555553', '33333333-3333-3333-3333-333333333333', 128, 82, 94, 38.3, 93, 22, 76.7, now() - interval '25 minutes');

insert into public.diagnoses (
  encounter_id, icd10_code, description, diagnosis_type, added_by
)
values
  ('55555555-5555-5555-5555-555555555551', 'R07.9', 'Chest pain, unspecified', 'primary', '33333333-3333-3333-3333-333333333332'),
  ('55555555-5555-5555-5555-555555555552', 'A41.9', 'Sepsis, unspecified organism', 'primary', '33333333-3333-3333-3333-333333333332'),
  ('55555555-5555-5555-5555-555555555553', 'J18.9', 'Pneumonia, unspecified organism', 'primary', '33333333-3333-3333-3333-333333333332')
on conflict do nothing;

insert into public.orders (
  encounter_id, order_type, description, frequency, priority, status, ordered_by, notes
)
values
  ('55555555-5555-5555-5555-555555555551', 'lab', 'Troponin', 'Once', 'stat', 'pending', '33333333-3333-3333-3333-333333333332', 'Repeat in 3 hours if elevated'),
  ('55555555-5555-5555-5555-555555555552', 'medication', 'Piperacillin-tazobactam IV', 'Q6H', 'urgent', 'in_progress', '33333333-3333-3333-3333-333333333332', 'Monitor renal function'),
  ('55555555-5555-5555-5555-555555555553', 'imaging', 'Chest X-Ray PA/Lateral', 'Once', 'routine', 'pending', '33333333-3333-3333-3333-333333333332', null);

insert into public.clinical_notes (
  encounter_id, note_type, content, author_id
)
values
  ('55555555-5555-5555-5555-555555555551', 'physician_note', 'History of Present Illness: 71-year-old male presenting with substernal chest pain. Plan includes serial troponins, telemetry, and blood pressure management.', '33333333-3333-3333-3333-333333333332'),
  ('55555555-5555-5555-5555-555555555552', 'nursing_assessment', 'Patient febrile with tachycardia. Blood cultures drawn. IV antibiotics initiated and sepsis bundle in progress.', '33333333-3333-3333-3333-333333333333'),
  ('55555555-5555-5555-5555-555555555553', 'progress_note', 'Patient reports reduced shortness of breath after nebulizer treatment. Continue oxygen monitoring and chest imaging follow-up.', '33333333-3333-3333-3333-333333333333');

insert into public.billing_records (
  id, encounter_id, patient_id, payer, claim_status, total_charges, expected_reimbursement, patient_responsibility, notes
)
values
  ('66666666-6666-6666-6666-666666666661', '55555555-5555-5555-5555-555555555551', '44444444-4444-4444-4444-444444444441', 'Medicare', 'draft', 1125.00, 900.00, 225.00, 'Initial admission claim'),
  ('66666666-6666-6666-6666-666666666662', '55555555-5555-5555-5555-555555555552', '44444444-4444-4444-4444-444444444442', 'BlueCross', 'submitted', 2450.00, 1850.00, 600.00, 'ICU sepsis case'),
  ('66666666-6666-6666-6666-666666666663', '55555555-5555-5555-5555-555555555553', '44444444-4444-4444-4444-444444444443', 'Medicaid', 'draft', 1520.00, 1200.00, 320.00, 'Respiratory admission')
on conflict (id) do nothing;

insert into public.billing_line_items (
  billing_record_id, cpt_code, description, quantity, unit_price, total
)
values
  ('66666666-6666-6666-6666-666666666661', '99221', 'Initial hospital care', 1, 850.00, 850.00),
  ('66666666-6666-6666-6666-666666666661', '93000', 'EKG with interpretation', 1, 275.00, 275.00),
  ('66666666-6666-6666-6666-666666666662', '99222', 'Initial hospital care moderate', 1, 1200.00, 1200.00),
  ('66666666-6666-6666-6666-666666666662', '85025', 'CBC with differential', 1, 125.00, 125.00),
  ('66666666-6666-6666-6666-666666666662', '80053', 'Comprehensive metabolic panel', 1, 160.00, 160.00),
  ('66666666-6666-6666-6666-666666666663', '99221', 'Initial hospital care', 1, 850.00, 850.00),
  ('66666666-6666-6666-6666-666666666663', '71046', 'Chest X-Ray 2 views', 1, 220.00, 220.00)
on conflict do nothing;
