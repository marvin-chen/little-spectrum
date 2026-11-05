import { PHOTO_PROMPTS } from "@/content/photoPrompts";
import { COLOR_NAMES, type ColorKey } from "@/lib/colors";
import { MAX_CAPTION } from "@/lib/photos/limits";
import { signedPhotoUrls } from "@/lib/photos/server";
import {
  allSubmitted,
  cleanText,
  findSubmission,
  isRecord,
  pendingParticipants,
  pickUnused,
  roundSubmissions,
  simultaneousEarlyRevealCheck,
  simultaneousTurnStatus,
  type GameEngine,
  type PhotoRef,
  type SessionState,
} from "./engine";

export type ColorQuestPrompt = { id: string; text: string; featuredColor?: ColorKey };
export type ColorQuestResult = {
  photos: Array<{ userId: string; photoId: string; caption: string | null }>;
  missing: string[];
};

export type PhotoView = {
  photoId: string;
  userId: string;
  caption: string | null;
  url: string | null;
  width: number | null;
  height: number | null;
  removed: boolean;
};

export type ColorQuestView = {
  phase: "upload" | "waiting" | "revealed";
  prompt: string;
  featuredColor: ColorKey | null;
  featuredColorName: string | null;
  myPhoto: PhotoView | null;
  submitted: string[];
  gallery: PhotoView[] | null;
  missing: string[];
};

function photoOf(state: SessionState, id: string): PhotoRef | undefined {
  return state.photos.find((p) => p.id === id);
}

function myPhotoRef(state: SessionState, userId: string): { photoId: string; caption: string | null } | null {
  const submission = findSubmission(state, userId, "answer");
  if (!isRecord(submission?.payload) || typeof submission.payload.photoId !== "string") return null;
  return { photoId: submission.payload.photoId, caption: (submission.payload.caption as string | null) ?? null };
}

export const colorQuest: GameEngine<ColorQuestView> = {
  key: "color-quest",

  pickPrompt(recentPromptIds, _participants, random) {
    const prompt = pickUnused(PHOTO_PROMPTS, recentPromptIds, random);
    return {
      promptId: prompt.id,
      prompt: { id: prompt.id, text: prompt.text, featuredColor: prompt.featuredColor } satisfies ColorQuestPrompt,
      secret: null,
    };
  },

  validateSubmission(state, userId, input) {
    if (!isRecord(input)) return { ok: false, error: "Nothing to submit." };
    if (findSubmission(state, userId, "answer")) return { ok: false, error: "Your photo is already in." };
    const photoId = typeof input.photoId === "string" ? input.photoId : "";
    const photo = photoOf(state, photoId);
    if (!photo || photo.userId !== userId || photo.status !== "ready") {
      return { ok: false, error: "That photo is not ready. Try uploading again." };
    }
    const caption = input.caption == null || input.caption === "" ? null : cleanText(input.caption, MAX_CAPTION);
    if (input.caption && !caption) return { ok: false, error: `Captions can be up to ${MAX_CAPTION} characters.` };
    return { ok: true, kind: "answer", payload: { photoId, caption } };
  },

  isRoundComplete(state) {
    return allSubmitted(state);
  },

  earlyRevealCheck(state) {
    return simultaneousEarlyRevealCheck(state);
  },

  computeReveal(state) {
    const photos = roundSubmissions(state)
      .filter((s) => s.kind === "answer" && isRecord(s.payload) && typeof s.payload.photoId === "string")
      .map((s) => {
        const payload = s.payload as { photoId: string; caption?: string | null };
        return { userId: s.userId, photoId: payload.photoId, caption: payload.caption ?? null };
      });
    const result: ColorQuestResult = { photos, missing: pendingParticipants(state).map((p) => p.userId) };
    return { result, final: true };
  },

  view(state, userId): ColorQuestView {
    const prompt = state.prompt as ColorQuestPrompt;
    const revealed = state.status === "revealed";
    const mine = myPhotoRef(state, userId);
    const toView = (entry: { userId: string; photoId: string; caption: string | null }): PhotoView => {
      const photo = photoOf(state, entry.photoId);
      return {
        photoId: entry.photoId,
        userId: entry.userId,
        caption: entry.caption,
        url: null,
        width: photo?.width ?? null,
        height: photo?.height ?? null,
        removed: !photo,
      };
    };
    const result = revealed ? (state.result as ColorQuestResult) : null;
    return {
      phase: revealed ? "revealed" : mine ? "waiting" : "upload",
      prompt: prompt.text,
      featuredColor: prompt.featuredColor ?? null,
      featuredColorName: prompt.featuredColor ? COLOR_NAMES[prompt.featuredColor] : null,
      myPhoto: mine ? toView({ userId, ...mine }) : null,
      submitted: roundSubmissions(state).map((s) => s.userId),
      gallery: result ? result.photos.map(toView) : null,
      missing: result?.missing ?? [],
    };
  },

  async hydrateView(state, userId, view) {
    const v = view;
    const wanted = new Set<string>();
    const paths = new Map<string, string>();
    const consider = (p: PhotoView | null) => {
      if (!p || p.removed) return;
      const ref = photoOf(state, p.photoId);
      if (ref) {
        wanted.add(ref.storagePath);
        paths.set(p.photoId, ref.storagePath);
      }
    };
    consider(v.myPhoto);
    for (const p of v.gallery ?? []) consider(p);
    const urls = await signedPhotoUrls([...wanted]);
    const withUrl = (p: PhotoView | null): PhotoView | null =>
      p ? { ...p, url: p.removed ? null : (urls.get(paths.get(p.photoId) ?? "") ?? null) } : null;
    return { ...v, myPhoto: withUrl(v.myPhoto), gallery: v.gallery ? v.gallery.map((p) => withUrl(p)!) : null };
  },

  turnStatus(state, userId) {
    return simultaneousTurnStatus(state, userId, { one: "photo", many: "photos" });
  },
};
