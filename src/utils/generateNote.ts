import STRINGS from "../constants/strings";
import { noteToMidi } from "./noteUtils";

export const generateRandomNote = (
  selectedClefs: ("treble" | "bass")[],
  trebleRange: [string, string],
  bassRange: [string, string],
  previousNote: string | null
): { note: string; clef: "treble" | "bass" } => {
  const clefsToUse = selectedClefs.length ? selectedClefs : ["treble"];
  const randomClef = clefsToUse[
    Math.floor(Math.random() * clefsToUse.length)
  ] as "treble" | "bass";

  let minNote = "A3";
  let maxNote = "C6";

  if (randomClef === "treble") {
    [minNote, maxNote] = trebleRange;
  } else {
    [minNote, maxNote] = bassRange;
  }

  const [minMidi, maxMidi] = [noteToMidi(minNote), noteToMidi(maxNote)];

  const filtered = STRINGS.NOTES_WITH_OCTAVES.filter((note) => {
    const midi = noteToMidi(note);
    return midi >= minMidi && midi <= maxMidi;
  });

  let newNote: string;
  do {
    newNote = filtered[Math.floor(Math.random() * filtered.length)];
  } while (newNote === previousNote && filtered.length > 1);

  return {
    note: newNote,
    clef: randomClef,
  };
};
