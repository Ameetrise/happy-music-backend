export function noteToMidi(note: string | undefined): number {
  if (!note) {
    console.warn("noteToMidi received undefined");
    return -1;
  }

  const regex = /^([A-G])(#|b)?(\d)$/;
  const match = note.match(regex);

  if (!match) {
    console.warn(`Invalid note format: ${note}`);
    return -1;
  }

  const [, noteChar, accidental = "", octaveStr] = match;
  const semitoneMap: Record<string, number> = {
    C: 0,
    "C#": 1,
    D: 2,
    "D#": 3,
    E: 4,
    F: 5,
    "F#": 6,
    G: 7,
    "G#": 8,
    A: 9,
    "A#": 10,
    B: 11,
  };

  const semitone = semitoneMap[noteChar + accidental] ?? 0;
  const octave = parseInt(octaveStr);
  return 12 * (octave + 1) + semitone;
}
