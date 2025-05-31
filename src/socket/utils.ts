export const normalizeNoteName = (note: string) =>
  note
    .trim()
    .toUpperCase()
    .replace(/[^A-G#B]/g, "");
