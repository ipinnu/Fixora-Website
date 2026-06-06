import { createClient } from "./client";

export interface JobPayload {
  title: string;
  category: string;
  state: string;
  lga: string;
  description: string;
  timeline: string;
  amount: string;
  photoPreviews: string[]; // object URLs from the form
  photoFiles: File[];
}

export async function submitJob(payload: JobPayload): Promise<{ jobId: string | null; error: string | null }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Insert job row
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .insert({
      customer_id:   user?.id ?? null,
      title:         payload.title,
      category:      payload.category,
      state:         payload.state,
      lga:           payload.lga || null,
      description:   payload.description || null,
      timeline:      payload.timeline || null,
      budget_amount: payload.amount ? Number(payload.amount) : null,
    })
    .select("id")
    .single();

  if (jobError) return { jobId: null, error: jobError.message };

  // 2. Upload photos to Storage and insert job_photos rows
  if (payload.photoFiles.length > 0) {
    await Promise.all(
      payload.photoFiles.map(async (file, i) => {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${job.id}/${Date.now()}_${i}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("job-photos")
          .upload(path, file, { upsert: false });

        if (uploadError) return;

        const { data: { publicUrl } } = supabase.storage
          .from("job-photos")
          .getPublicUrl(path);

        await supabase.from("job_photos").insert({ job_id: job.id, url: publicUrl });
      })
    );
  }

  return { jobId: job.id, error: null };
}
