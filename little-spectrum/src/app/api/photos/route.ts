import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isParticipant, loadState, submitAnswer } from "@/lib/data/sessions";
import { cleanupOrphanPhotos, PhotoError, processImage, removePhotoFiles, uploadPhotoFile } from "@/lib/photos/server";
import { throttle } from "@/lib/ratelimit";
import { createServiceClient } from "@/lib/supabase/server";
import { UUID_RE } from "@/lib/data/gardens";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!throttle(`upload:${user.id}`, 30, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "That is a lot of photos for one hour. Try again later." }, { status: 429 });
  }
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Could not read the upload." }, { status: 400 });
  }
  const sessionId = String(form.get("sessionId") ?? "");
  const caption = String(form.get("caption") ?? "");
  const file = form.get("file");
  if (!UUID_RE.test(sessionId) || !(file instanceof Blob)) {
    return NextResponse.json({ error: "Missing photo or session." }, { status: 400 });
  }
  const state = await loadState(sessionId);
  if (!state || !isParticipant(state, user.id) || state.game !== "color-quest") {
    return NextResponse.json({ error: "This game is not yours to play." }, { status: 403 });
  }
  if (state.status !== "active")
    return NextResponse.json({ error: "This round is already revealed." }, { status: 409 });
  if (state.submissions.some((s) => s.userId === user.id)) {
    return NextResponse.json({ error: "Your photo is already in." }, { status: 409 });
  }

  const db = createServiceClient();
  try {
    const processed = await processImage(Buffer.from(await file.arrayBuffer()));
    await cleanupOrphanPhotos(sessionId, user.id);
    const { data: row, error } = await db
      .from("photos")
      .insert({
        session_id: sessionId,
        user_id: user.id,
        storage_path: `sessions/${sessionId}/${user.id}-${crypto.randomUUID()}.jpg`,
        width: processed.width,
        height: processed.height,
        bytes: processed.data.length,
        status: "pending",
      })
      .select("id, storage_path")
      .single();
    if (error || !row) throw new PhotoError("Could not record the photo.", 500);
    try {
      await uploadPhotoFile(row.storage_path, processed.data);
      await db.from("photos").update({ status: "ready" }).eq("id", row.id);
      const result = await submitAnswer(user.id, sessionId, { photoId: row.id, caption });
      if (!result.ok) throw new PhotoError(result.error, 400);
    } catch (inner) {
      await removePhotoFiles([row.storage_path]);
      await db.from("photos").delete().eq("id", row.id);
      throw inner;
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof PhotoError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Something went wrong with that photo. Please try again." }, { status: 500 });
  }
}
