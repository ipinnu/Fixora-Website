import { createClient } from "./client";

export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export interface VerificationProfilePayload {
  trade: string;
  years: string;
  bio: string;
  serviceStates: string[];
  dailyRate: string;
  languages: string[];
}

export interface ArtisanVerificationRow {
  id: string;
  artisan_id: string;
  nin: string;
  id_document_url: string;
  face_photo_url: string | null;
  status: "pending" | "approved" | "rejected";
  trade: string | null;
  years_experience: string | null;
  bio: string | null;
  service_states: string[] | null;
  daily_rate: number | null;
  languages: string[] | null;
  admin_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  artisan?: { full_name: string | null; state: string | null; trade: string | null };
}

export async function submitArtisanVerification(
  nin: string,
  idFile: File,
  faceFile: File | null,
  profile: VerificationProfilePayload,
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to submit verification." };

  const ts = Date.now();
  const idPath = `${user.id}/id_${ts}.jpg`;
  const { error: idUploadError } = await supabase.storage
    .from("verification-docs")
    .upload(idPath, idFile, { upsert: true });

  if (idUploadError) return { error: idUploadError.message };

  let facePhotoUrl: string | null = null;
  if (faceFile) {
    const facePath = `${user.id}/face_${ts}.jpg`;
    const { error: faceUploadError } = await supabase.storage
      .from("verification-docs")
      .upload(facePath, faceFile, { upsert: true });
    if (faceUploadError) return { error: faceUploadError.message };
    facePhotoUrl = supabase.storage.from("verification-docs").getPublicUrl(facePath).data.publicUrl;
  }

  const idDocumentUrl = supabase.storage.from("verification-docs").getPublicUrl(idPath).data.publicUrl;

  const { error: verificationError } = await supabase.from("artisan_verifications").upsert({
    artisan_id: user.id,
    nin,
    id_document_url: idDocumentUrl,
    face_photo_url: facePhotoUrl,
    status: "pending",
    trade: profile.trade,
    years_experience: profile.years,
    bio: profile.bio,
    service_states: profile.serviceStates,
    daily_rate: profile.dailyRate ? Number(profile.dailyRate) : null,
    languages: profile.languages,
    admin_notes: null,
    reviewed_at: null,
    submitted_at: new Date().toISOString(),
  }, { onConflict: "artisan_id" });

  if (verificationError) return { error: verificationError.message };

  const { error: profileError } = await supabase.from("profiles").update({
    verification_status: "pending",
    trade: profile.trade,
    bio: profile.bio,
    years_experience: profile.years,
    daily_rate: profile.dailyRate ? Number(profile.dailyRate) : null,
    service_states: profile.serviceStates,
    languages: profile.languages,
  }).eq("id", user.id);

  if (profileError) return { error: profileError.message };

  return { error: null };
}

export async function fetchArtisanVerificationStatus(): Promise<VerificationStatus> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "unverified";

  const { data } = await supabase
    .from("profiles")
    .select("verification_status")
    .eq("id", user.id)
    .single();

  const status = data?.verification_status as VerificationStatus | undefined;
  if (status === "pending" || status === "verified" || status === "rejected") return status;
  return "unverified";
}

export async function fetchAllVerifications(): Promise<ArtisanVerificationRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("artisan_verifications")
    .select("*, artisan:profiles(full_name, state, trade)")
    .order("submitted_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as ArtisanVerificationRow[];
}

export async function reviewVerification(
  verificationId: string,
  artisanId: string,
  decision: "approved" | "rejected",
  adminNotes?: string,
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const now = new Date().toISOString();

  const { error: vError } = await supabase
    .from("artisan_verifications")
    .update({
      status: decision,
      admin_notes: adminNotes ?? null,
      reviewed_at: now,
    })
    .eq("id", verificationId);

  if (vError) return { error: vError.message };

  const profileStatus = decision === "approved" ? "verified" : "rejected";
  const { error: pError } = await supabase
    .from("profiles")
    .update({ verification_status: profileStatus })
    .eq("id", artisanId);

  if (pError) return { error: pError.message };

  return { error: null };
}
