/** Sample data for admin demo / exploration mode */

import type { ArtisanVerificationRow } from "@/lib/supabase/verification";
import type { TransactionWithCompletion } from "@/lib/supabase/completions";

export interface DemoAdminUser {
  id: string;
  full_name: string | null;
  role: string | null;
  state: string | null;
  trade: string | null;
  created_at: string;
}

export interface DemoAdminJob {
  id: string;
  title: string;
  category: string;
  state: string;
  status: string;
  created_at: string;
  budget_amount: number | null;
}

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

/** Sample NIN slip scan (public OCR test fixture) + face crop from same document */
const DEMO_ID_IMG = "/demo-nin-slip-full.jpg";
const DEMO_FACE_IMG = "/demo-nin-face.jpg";
const DEMO_PROOF_1 = "/Image%20client.jpg";
const DEMO_PROOF_2 = "/Image%20client%202.jpg";

export const DEMO_ADMIN_USERS: DemoAdminUser[] = [
  { id: "du1", full_name: "Adaeze Obi", role: "customer", state: "Lagos", trade: null, created_at: daysAgo(45) },
  { id: "du2", full_name: "Emeka Okafor", role: "artisan", state: "Lagos", trade: "Plumber", created_at: daysAgo(60) },
  { id: "du3", full_name: "Tunde Adeyemi", role: "artisan", state: "Abuja", trade: "Painting", created_at: daysAgo(38) },
  { id: "du4", full_name: "Chidi Nwosu", role: "artisan", state: "Lagos", trade: "Electrician", created_at: daysAgo(52) },
  { id: "du5", full_name: "Demo Client", role: "customer", state: "Lagos", trade: null, created_at: daysAgo(3) },
  { id: "du6", full_name: "Demo Artisan", role: "artisan", state: "Lagos", trade: "Auto Mechanic", created_at: daysAgo(5) },
  { id: "du7", full_name: "Yusuf Bello", role: "artisan", state: "Rivers", trade: "AC Technician", created_at: daysAgo(28) },
  { id: "du8", full_name: "Ngozi Anozie", role: "customer", state: "Enugu", trade: null, created_at: daysAgo(14) },
  { id: "du9", full_name: "Blessing Okoro", role: "artisan", state: "Lagos", trade: "Hair Stylist", created_at: daysAgo(7) },
  { id: "du10", full_name: "Suleiman Musa", role: "artisan", state: "Kano", trade: "Plumber", created_at: daysAgo(21) },
];

export const DEMO_ADMIN_JOBS: DemoAdminJob[] = [
  { id: "dj1", title: "Fix leaking kitchen pipe", category: "Plumber", state: "Lagos", status: "open", created_at: daysAgo(0), budget_amount: 15000 },
  { id: "dj2", title: "Paint 3-bedroom flat", category: "Painting", state: "Abuja", status: "open", created_at: daysAgo(1), budget_amount: null },
  { id: "dj3", title: "Install split AC unit", category: "AC Technician", state: "Rivers", status: "in_progress", created_at: daysAgo(3), budget_amount: 45000 },
  { id: "dj4", title: "Repair car alternator", category: "Auto Mechanic", state: "Lagos", status: "open", created_at: daysAgo(0), budget_amount: 20000 },
  { id: "dj5", title: "Install ceiling fans x3", category: "Electrician", state: "Oyo", status: "completed", created_at: daysAgo(7), budget_amount: 18000 },
  { id: "dj6", title: "Deep clean 3-bedroom apartment", category: "Cleaning Professional", state: "Lagos", status: "open", created_at: daysAgo(2), budget_amount: 25000 },
];

export const DEMO_ADMIN_TXNS: TransactionWithCompletion[] = [
  {
    id: "dt1",
    bid_id: "db1",
    job_id: "dj5",
    customer_id: "du1",
    artisan_id: "du2",
    amount: 18000,
    reference: "FXR-TXN-20260525001",
    status: "paid",
    created_at: daysAgo(25),
    released_at: daysAgo(24),
    admin_notes: "Work verified — fans installed and tested.",
    job: { title: "Install ceiling fans x3" },
    artisan: { full_name: "Emeka Okafor" },
    customer: { full_name: "Adaeze Obi" },
    completion: {
      id: "dc1",
      job_id: "dj5",
      bid_id: "db1",
      artisan_id: "du2",
      transaction_id: "dt1",
      notes: "Installed 3 ceiling fans in living room and bedrooms. All tested and balanced.",
      photo_urls: [DEMO_PROOF_1, DEMO_PROOF_2],
      status: "approved",
      submitted_at: daysAgo(26),
      reviewed_at: daysAgo(25),
      admin_notes: "Photos match job description.",
    },
  },
  {
    id: "dt2",
    bid_id: "db2",
    job_id: "dj2",
    customer_id: "du8",
    artisan_id: "du3",
    amount: 65000,
    reference: "FXR-TXN-20260510002",
    status: "paid",
    created_at: daysAgo(40),
    released_at: daysAgo(39),
    admin_notes: "Painting completed to standard.",
    job: { title: "Paint 3-bedroom flat" },
    artisan: { full_name: "Tunde Adeyemi" },
    customer: { full_name: "Ngozi Anozie" },
    completion: {
      id: "dc2",
      job_id: "dj2",
      bid_id: "db2",
      artisan_id: "du3",
      transaction_id: "dt2",
      notes: "Full interior repaint — walls, ceilings, and trim. Two coats applied.",
      photo_urls: [DEMO_PROOF_2],
      status: "approved",
      submitted_at: daysAgo(41),
      reviewed_at: daysAgo(40),
      admin_notes: null,
    },
  },
  {
    id: "dt3",
    bid_id: "db3",
    job_id: "dj3",
    customer_id: "du1",
    artisan_id: "du7",
    amount: 45000,
    reference: "FXR-TXN-20260607003",
    status: "proof_submitted",
    created_at: daysAgo(3),
    released_at: null,
    admin_notes: null,
    job: { title: "Install split AC unit" },
    artisan: { full_name: "Yusuf Bello" },
    customer: { full_name: "Adaeze Obi" },
    completion: {
      id: "dc3",
      job_id: "dj3",
      bid_id: "db3",
      artisan_id: "du7",
      transaction_id: "dt3",
      notes: "Split unit mounted, piped, and commissioned. Customer signed off on cooling test.",
      photo_urls: [DEMO_PROOF_1, DEMO_PROOF_2],
      status: "submitted",
      submitted_at: daysAgo(0),
      reviewed_at: null,
      admin_notes: null,
    },
  },
  {
    id: "dt4",
    bid_id: "db4",
    job_id: "dj1",
    customer_id: "du5",
    artisan_id: "du10",
    amount: 22000,
    reference: "FXR-TXN-20260418004",
    status: "paid",
    created_at: daysAgo(55),
    released_at: daysAgo(54),
    admin_notes: null,
    job: { title: "Fix leaking kitchen pipe" },
    artisan: { full_name: "Suleiman Musa" },
    customer: { full_name: "Demo Client" },
    completion: {
      id: "dc4",
      job_id: "dj1",
      bid_id: "db4",
      artisan_id: "du10",
      transaction_id: "dt4",
      notes: "Replaced faulty joint under sink. No leaks after pressure test.",
      photo_urls: [DEMO_PROOF_1],
      status: "approved",
      submitted_at: daysAgo(56),
      reviewed_at: daysAgo(55),
      admin_notes: null,
    },
  },
  {
    id: "dt5",
    bid_id: "db5",
    job_id: "dj6",
    customer_id: "du1",
    artisan_id: "du6",
    amount: 85000,
    reference: "FXR-TXN-20260609005",
    status: "in_escrow",
    created_at: daysAgo(1),
    released_at: null,
    admin_notes: null,
    job: { title: "Deep clean 3-bedroom apartment" },
    artisan: { full_name: "Demo Artisan" },
    customer: { full_name: "Adaeze Obi" },
    completion: null,
  },
];

export const DEMO_ADMIN_VERIFICATIONS: ArtisanVerificationRow[] = [
  {
    id: "dv1",
    artisan_id: "du9",
    nin: "28491037561",
    id_document_url: DEMO_ID_IMG,
    face_photo_url: DEMO_FACE_IMG,
    status: "pending",
    trade: "Hair Stylist",
    years_experience: "3–5 years",
    bio: "Professional hair stylist specialising in braids, weaves, and natural hair care across Lagos.",
    service_states: ["Lagos"],
    daily_rate: 12000,
    languages: ["English", "Yoruba"],
    admin_notes: null,
    submitted_at: daysAgo(0),
    reviewed_at: null,
    artisan: { full_name: "Blessing Okoro", state: "Lagos", trade: "Hair Stylist" },
  },
  {
    id: "dv2",
    artisan_id: "du10",
    nin: "90123456789",
    id_document_url: DEMO_ID_IMG,
    face_photo_url: DEMO_FACE_IMG,
    status: "pending",
    trade: "Plumber",
    years_experience: "6–10 years",
    bio: "Licensed plumber with experience in residential and commercial pipe work in northern Nigeria.",
    service_states: ["Kano", "Kaduna"],
    daily_rate: 15000,
    languages: ["English", "Hausa"],
    admin_notes: null,
    submitted_at: daysAgo(2),
    reviewed_at: null,
    artisan: { full_name: "Suleiman Musa", state: "Kano", trade: "Plumber" },
  },
  {
    id: "dv3",
    artisan_id: "du11",
    nin: "11223344556",
    id_document_url: DEMO_ID_IMG,
    face_photo_url: DEMO_FACE_IMG,
    status: "pending",
    trade: "Vehicle Spray Painter",
    years_experience: "3–5 years",
    bio: "Expert in vehicle respray, panel prep, and colour matching across Lagos.",
    service_states: ["Lagos"],
    daily_rate: 22000,
    languages: ["English", "Igbo"],
    admin_notes: null,
    submitted_at: daysAgo(1),
    reviewed_at: null,
    artisan: { full_name: "Chijioke Eze", state: "Lagos", trade: "Vehicle Spray Painter" },
  },
  {
    id: "dv4",
    artisan_id: "du2",
    nin: "66778899001",
    id_document_url: DEMO_ID_IMG,
    face_photo_url: DEMO_FACE_IMG,
    status: "approved",
    trade: "Plumber",
    years_experience: "10+ years",
    bio: "Verified plumber — approved after NIN and ID check.",
    service_states: ["Lagos"],
    daily_rate: 18000,
    languages: ["English"],
    admin_notes: "NIN and ID matched. Approved.",
    submitted_at: daysAgo(30),
    reviewed_at: daysAgo(28),
    artisan: { full_name: "Emeka Okafor", state: "Lagos", trade: "Plumber" },
  },
  {
    id: "dv5",
    artisan_id: "du3",
    nin: "55443322110",
    id_document_url: DEMO_ID_IMG,
    face_photo_url: DEMO_FACE_IMG,
    status: "approved",
    trade: "Painting",
    years_experience: "6–10 years",
    bio: "Interior and exterior painting specialist.",
    service_states: ["Abuja", "FCT"],
    daily_rate: 20000,
    languages: ["English", "Hausa"],
    admin_notes: "Documents verified manually.",
    submitted_at: daysAgo(35),
    reviewed_at: daysAgo(33),
    artisan: { full_name: "Tunde Adeyemi", state: "Abuja", trade: "Painting" },
  },
];

export function loadDemoAdminData() {
  return {
    users: DEMO_ADMIN_USERS,
    jobs: DEMO_ADMIN_JOBS,
    txns: DEMO_ADMIN_TXNS,
    verifications: DEMO_ADMIN_VERIFICATIONS,
  };
}
