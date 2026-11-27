import type { SessionView } from "../sessionView";

/** Simulates only the viewer's own changes. No hidden answers or scoring state is needed. */
export function localSubmission(session: SessionView, userId: string, input: Record<string, unknown>): SessionView {
  const view = { ...(session.view as Record<string, unknown>) };
  if ("clue" in input) {
    view.clue = input.clue;
    view.phase = "guess";
  } else {
    view.phase = "waiting";
    switch (session.game) {
      case "hue-knew":
        view.myGuess = input.guess;
        break;
      case "hue-clue":
        view.myGuess = { col: input.col, row: input.row };
        break;
      case "true-colors":
        view.myAnswer = input.answer;
        view.myPrediction = input.prediction;
        break;
      case "same-wavelength":
        view.myWord = input.word;
        break;
      case "palette-picks":
        view.myOrder = input.order;
        break;
      case "color-quest":
        view.myPhoto = input.photo;
        break;
    }
    // Clue-game views retain their own phase convention after a guess.
    if (session.game === "hue-knew" || session.game === "hue-clue") view.phase = "guess";
    if (Array.isArray(view.submitted)) view.submitted = [...new Set([...view.submitted, userId])];
    if (Array.isArray(view.guessers))
      view.guessers = view.guessers.map((p) => (p.userId === userId ? { ...p, submitted: true } : p));
  }
  return { ...session, view, turn: { needsYou: false, line: "Your preview submission is in. Waiting for friends." } };
}
