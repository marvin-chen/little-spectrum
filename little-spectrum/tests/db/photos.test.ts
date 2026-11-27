import { describe, expect, it } from "vitest";
import { anonymousUser, createGarden, service, token, type TestUser } from "./helpers";

// Ada and Bo are in one session. Both have submitted and both have a photo.
async function sessionWithPhotos(): Promise<{
  ada: TestUser;
  bo: TestUser;
  sessionId: string;
  adaPhoto: string;
  boPhoto: string;
}> {
  const [ada, bo] = await Promise.all([anonymousUser("Ada"), anonymousUser("Bo")]);
  const invite = token();
  const gardenId = await createGarden(ada, 2, invite);
  await service().rpc("join_garden", { p_user: bo.id, p_token: invite });
  const { data: sessionId, error } = await service().rpc("create_session", {
    p_user: ada.id,
    p_garden: gardenId,
    p_game: "hue-knew",
    p_participants: [ada.id, bo.id],
    p_prompt: { id: "cozy-chaotic", left: "Cozy", right: "Chaotic" },
    p_secret: { target: 42 },
    p_clue_giver: ada.id,
    p_predictions: {},
  });
  if (error) throw new Error(error.message);
  await service().rpc("submit_answer", {
    p_user: ada.id,
    p_session: sessionId,
    p_round: 1,
    p_kind: "clue",
    p_payload: { clue: "blanket" },
  });
  await service().rpc("submit_answer", {
    p_user: bo.id,
    p_session: sessionId,
    p_round: 1,
    p_kind: "answer",
    p_payload: { guess: 40 },
  });
  const { data: photos, error: photoError } = await service()
    .from("photos")
    .insert(
      [ada, bo].map((u) => ({
        session_id: sessionId,
        user_id: u.id,
        storage_path: `sessions/${sessionId}/${u.id}.jpg`,
        status: "ready",
      })),
    )
    .select("id, user_id");
  if (photoError) throw new Error(photoError.message);
  const photoOf = (user: TestUser) => photos.find((p) => p.user_id === user.id)!.id as string;
  return { ada, bo, sessionId: sessionId as string, adaPhoto: photoOf(ada), boPhoto: photoOf(bo) };
}

async function rows(sessionId: string) {
  const { data: photos } = await service().from("photos").select("user_id").eq("session_id", sessionId);
  const { data: submissions } = await service().from("submissions").select("user_id").eq("session_id", sessionId);
  return { photos: photos ?? [], submissions: submissions ?? [] };
}

describe("deleting a photo", () => {
  it("withdraws the submission while the round is active and returns the file to remove", async () => {
    const { bo, sessionId, boPhoto } = await sessionWithPhotos();
    const { data: path, error } = await service().rpc("delete_photo", {
      p_user: bo.id,
      p_session: sessionId,
      p_photo: boPhoto,
    });
    expect(error).toBeNull();
    expect(path).toBe(`sessions/${sessionId}/${bo.id}.jpg`);
    const after = await rows(sessionId);
    expect(after.photos.map((p) => p.user_id)).not.toContain(bo.id);
    expect(after.submissions.map((s) => s.user_id)).not.toContain(bo.id);
  });

  it("keeps the submission once the round is revealed", async () => {
    const { bo, sessionId, boPhoto } = await sessionWithPhotos();
    await service().rpc("reveal_round", {
      p_session: sessionId,
      p_round: 1,
      p_result: { target: 42 },
      p_final: true,
      p_early: false,
      p_expected_submissions: 2,
    });
    const { error } = await service().rpc("delete_photo", { p_user: bo.id, p_session: sessionId, p_photo: boPhoto });
    expect(error).toBeNull();
    const after = await rows(sessionId);
    expect(after.photos.map((p) => p.user_id)).not.toContain(bo.id);
    expect(after.submissions.map((s) => s.user_id)).toContain(bo.id);
  });

  it("refuses someone else's photo and changes nothing", async () => {
    const { bo, sessionId, adaPhoto } = await sessionWithPhotos();
    const { error } = await service().rpc("delete_photo", { p_user: bo.id, p_session: sessionId, p_photo: adaPhoto });
    expect(error?.message).toContain("photo_not_found");
    const after = await rows(sessionId);
    expect(after.photos).toHaveLength(2);
    expect(after.submissions).toHaveLength(2);
  });

  it("is not callable by signed-in users", async () => {
    const { bo, sessionId, boPhoto } = await sessionWithPhotos();
    const { error } = await bo.client.rpc("delete_photo", { p_user: bo.id, p_session: sessionId, p_photo: boPhoto });
    expect(error).toBeTruthy();
    expect((await rows(sessionId)).photos).toHaveLength(2);
  });
});
