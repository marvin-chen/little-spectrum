import { QUESTIONS } from "@/content/questions";
import {
  allSubmitted,
  findSubmission,
  isRecord,
  participant,
  pickUnused,
  roundSubmissions,
  simultaneousEarlyRevealCheck,
  simultaneousTurnStatus,
  type GameEngine,
  type SessionState,
} from "./engine";

export type TrueColorsPrompt = { id: string; text: string; options: [string, string, string, string] };

export type TrueColorsPrediction = {
  predictorId: string;
  targetId: string;
  predicted: number;
  actual: number | null;
  correct: boolean | null;
};

export type TrueColorsResult = {
  answers: Array<{ userId: string; answer: number }>;
  predictions: TrueColorsPrediction[];
  correct: number;
  scorable: number;
  missing: string[];
};

export type TrueColorsView = {
  phase: "answer" | "waiting" | "revealed";
  question: string;
  options: [string, string, string, string];
  predictsUserId: string | null;
  myAnswer: number | null;
  myPrediction: number | null;
  submitted: string[];
  result: TrueColorsResult | null;
};

type Picks = { answer: number; prediction: number };

// Everyone predicts the next person in sorted order, and the last person wraps around to the first.
export function assignPredictions(participantIds: string[]): Record<string, string> {
  const ordered = [...participantIds].sort((a, b) => a.localeCompare(b));
  const assignment: Record<string, string> = {};
  ordered.forEach((id, index) => {
    assignment[id] = ordered[(index + 1) % ordered.length];
  });
  return assignment;
}

function picksOf(state: SessionState, userId: string): Picks | null {
  const payload = findSubmission(state, userId, "answer")?.payload;
  if (!isRecord(payload)) return null;
  return { answer: Number(payload.answer), prediction: Number(payload.prediction) };
}

function isOption(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 3;
}

export const trueColors: GameEngine = {
  key: "true-colors",

  pickPrompt(recentPromptIds, participants, random) {
    const question = pickUnused(QUESTIONS, recentPromptIds, random);
    return {
      promptId: question.id,
      prompt: { id: question.id, text: question.text, options: question.options } satisfies TrueColorsPrompt,
      secret: null,
      predictions: assignPredictions(participants.map((p) => p.userId)),
    };
  },

  validateSubmission(state, userId, input) {
    if (findSubmission(state, userId, "answer")) {
      return { ok: false, error: "Your picks are already locked in." };
    }
    if (!isRecord(input)) return { ok: false, error: "Nothing to submit." };
    const answer = Number(input.answer);
    const prediction = Number(input.prediction);
    if (!isOption(answer)) return { ok: false, error: "Pick one of the four answers for yourself." };
    if (!isOption(prediction)) return { ok: false, error: "Pick one of the four answers as your prediction." };
    return { ok: true, kind: "answer", payload: { answer, prediction } satisfies Picks };
  },

  isRoundComplete(state) {
    return allSubmitted(state);
  },

  earlyRevealCheck(state) {
    return simultaneousEarlyRevealCheck(state);
  },

  computeReveal(state) {
    const answers = roundSubmissions(state)
      .filter((s) => s.kind === "answer" && isRecord(s.payload))
      .map((s) => ({ userId: s.userId, answer: Number((s.payload as Record<string, unknown>).answer) }));
    const answerBy = new Map(answers.map((a) => [a.userId, a.answer]));
    const predictions: TrueColorsPrediction[] = [];
    for (const p of state.participants) {
      const picks = picksOf(state, p.userId);
      if (!picks || !p.predictsUserId) continue;
      const actual = answerBy.get(p.predictsUserId) ?? null;
      predictions.push({
        predictorId: p.userId,
        targetId: p.predictsUserId,
        predicted: picks.prediction,
        actual,
        correct: actual === null ? null : actual === picks.prediction,
      });
    }
    const scorable = predictions.filter((p) => p.correct !== null);
    const result: TrueColorsResult = {
      answers,
      predictions,
      correct: scorable.filter((p) => p.correct).length,
      scorable: scorable.length,
      missing: state.participants.filter((p) => !answerBy.has(p.userId)).map((p) => p.userId),
    };
    return { result, final: true };
  },

  view(state, userId): TrueColorsView {
    const prompt = state.prompt as TrueColorsPrompt;
    const revealed = state.status === "revealed";
    const mine = picksOf(state, userId);
    return {
      phase: revealed ? "revealed" : mine ? "waiting" : "answer",
      question: prompt.text,
      options: prompt.options,
      predictsUserId: participant(state, userId)?.predictsUserId ?? null,
      myAnswer: mine?.answer ?? null,
      myPrediction: mine?.prediction ?? null,
      submitted: roundSubmissions(state)
        .filter((s) => s.kind === "answer")
        .map((s) => s.userId),
      result: revealed ? (state.result as TrueColorsResult) : null,
    };
  },

  turnStatus(state, userId) {
    return simultaneousTurnStatus(state, userId, { one: "picks", many: "picks", pluralSubject: true });
  },
};
