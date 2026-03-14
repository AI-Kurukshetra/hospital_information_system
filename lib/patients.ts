import { z } from "zod";

export const patientStatuses = ["registered", "admitted", "discharged"] as const;

export const patientFormSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required."),
  last_name: z.string().trim().min(1, "Last name is required."),
  date_of_birth: z.string().min(1, "Date of birth is required."),
  gender: z.string().min(1, "Gender is required."),
  ssn_last4: z
    .string()
    .trim()
    .max(4, "SSN Last 4 must be 4 digits or fewer.")
    .optional()
    .or(z.literal("")),
  phone: z.string().trim().min(1, "Phone number is required."),
  email: z.string().trim().email("Enter a valid email.").optional().or(z.literal("")),
  address_line1: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().optional().or(z.literal("")),
  state: z.string().trim().optional().or(z.literal("")),
  zip: z.string().trim().optional().or(z.literal("")),
  emergency_contact_name: z.string().trim().optional().or(z.literal("")),
  emergency_contact_phone: z.string().trim().optional().or(z.literal("")),
  emergency_contact_relationship: z.string().trim().optional().or(z.literal("")),
  insurance_payer: z.string().trim().min(1, "Payer name is required."),
  policy_number: z.string().trim().min(1, "Policy number is required."),
  group_number: z.string().trim().optional().or(z.literal("")),
  plan_type: z.string().trim().min(1, "Plan type is required."),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;

export const usStates = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
] as const;

export const planTypes = ["Medicare", "Medicaid", "Commercial", "Self-Pay"] as const;

export const genderOptions = [
  "Male",
  "Female",
  "Other",
  "Prefer not to say",
] as const;
