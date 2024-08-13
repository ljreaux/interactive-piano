import { useEffect, useState } from "react";
import { sounds, Sounds } from "../data/sounds";

const getAllNaturalNotes = ([firstNote, lastNote]: string[]) => {
  const firstNoteName = firstNote[0];
  const firstOctaveNumber = parseInt(firstNote[1]);

  const lastNoteName = lastNote[0];
  const lastOctaveNumber = parseInt(lastNote[1]);

  const firstNotePosition = naturalNotes.indexOf(firstNoteName);
  const lastNotePosition = naturalNotes.indexOf(lastNoteName);

  const allNaturalNotes: string[] = [];

  for (
    let octaveNumber = firstOctaveNumber;
    octaveNumber <= lastOctaveNumber;
    octaveNumber++
  ) {
    // Handle first octave
    if (
      octaveNumber === firstOctaveNumber ||
      firstOctaveNumber === lastOctaveNumber
    ) {
      naturalNotes.slice(firstNotePosition).forEach((noteName) => {
        allNaturalNotes.push(`${noteName}${octaveNumber}`);
      });

      // Handle last octave
    } else if (octaveNumber === lastOctaveNumber) {
      naturalNotes.slice(0, lastNotePosition + 1).forEach((noteName) => {
        allNaturalNotes.push(`${noteName}${octaveNumber}`);
      });
    } else {
      naturalNotes.forEach((noteName) => {
        allNaturalNotes.push(`${noteName}${octaveNumber}`);
      });
    }
  }
  return allNaturalNotes;
};

const naturalNotes = ["C", "D", "E", "F", "G", "A", "B"];
const naturalNotesSharps = ["C", "D", "F", "G", "A"];
const naturalNotesFlats = ["D", "E", "G", "A", "B"];

export default function Piano({
  range = ["C4", "C6"],
  options = {
    keyHeight: "medium",
    keyWidth: "medium",
    showLetters: true,
    roundedKeys: true,
  },
}: {
  range?: string[];
  options?: {
    keyHeight: Size;
    keyWidth: Size;
    showLetters?: boolean;
    roundedKeys?: boolean;
  };
}) {
  const keySizes = {
    small: { keyHeight: 200, keyWidth: 40 },
    medium: { keyHeight: 400, keyWidth: 80 },
    large: { keyHeight: 600, keyWidth: 100 },
  };

  const allNaturalNotes = getAllNaturalNotes(range);

  const whiteKeyWidth = keySizes[options.keyWidth].keyWidth;
  const pianoHeight = keySizes[options.keyHeight].keyHeight;
  const pianoWidth = whiteKeyWidth * allNaturalNotes.length;

  const viewBox = `0 0 ${pianoWidth} ${pianoHeight}`;
  let posX = 0;

  const keys: KeyProps[] = [];

  // white keys
  allNaturalNotes.forEach((note) => {
    const whiteKey = {
      width: whiteKeyWidth,
      height: pianoHeight,
      pos: { posX, posY: 380 },
      text: note,
      options: {
        showLetters: options.showLetters,
        rounded: options.roundedKeys,
      },
    };

    keys.push(whiteKey as KeyProps);
    posX += whiteKeyWidth;
  });

  // black keys
  let bkPosX = 60;
  allNaturalNotes.forEach((note, i, arr) => {
    if (i === arr.length - 1) return;
    naturalNotesSharps.forEach((sharp, j) => {
      const flatNoteName = `${naturalNotesFlats[j]}b${note[1]}`;
      const sharpNoteName = `${sharp}#${note[1]}`;
      const blackKey = {
        width: whiteKeyWidth / 2,
        height: pianoHeight * (3 / 5),
        pos: { posX: bkPosX, posY: 215 },
        text: sharpNoteName,
        type: "black-key",
        options: {
          dataAttr: {
            "data-sharp": sharpNoteName,
            "data-flat": flatNoteName,
          },
          showLetters: options.showLetters,
          rounded: options.roundedKeys,
        },
      };

      if (sharp === note[0]) keys.push(blackKey as KeyProps);
    });

    // double spacing where necessary
    if (note === "D" || note === "A") {
      bkPosX += whiteKeyWidth * 2;
    } else {
      bkPosX += whiteKeyWidth;
    }
  });

  return (
    <svg
      id="piano"
      width="100%"
      version="1.1"
      xmlns="http://w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox={viewBox}
    >
      {keys.map((key) => {
        return <Key {...key} />;
      })}
    </svg>
  );
}

const Key = ({
  width,
  height,
  pos,
  text,
  type = "white-key",
  options,
}: KeyProps) => {
  const [active, setActive] = useState(false);
  const [audio, setAudio] = useState<null | HTMLAudioElement>(null);

  useEffect(() => {
    const pathName: keyof Sounds =
      (text.length === 3 ? options?.dataAttr?.["data-flat"] : text) || "";

    const audioElement = new Audio(sounds[pathName]);
    setAudio(audioElement);
    audioElement.addEventListener("ended", () => setActive(false));
  }, []);

  const roundedRadius =
    options?.rounded && type === "white-key" ? 15 : options?.rounded ? 8 : 0;

  return (
    <g width={width} height={height}>
      <rect
        className={`${type} ${active ? "active" : ""}`}
        width={width}
        height={height}
        x={pos.posX}
        rx={roundedRadius}
        ry={roundedRadius}
        data-note-name={text}
        {...options?.dataAttr}
        onClick={() => {
          console.log(`Clicked on ${text}`);
          setActive(true);
          if (audio) {
            audio.play();
          }
        }}
      />
      <text
        x={pos.posX + width / 2}
        y={pos.posY}
        textAnchor="middle"
        className={`${type}-text`}
      >
        {options?.showLetters && text}
      </text>
      {options?.showLetters && options?.dataAttr && (
        <text
          x={pos.posX + width / 2}
          y={pos.posY + 20}
          textAnchor="middle"
          className={`${type}-text`}
        >
          {options.dataAttr["data-flat"]}
        </text>
      )}
    </g>
  );
};

type KeyProps = {
  width: number;
  height: number;
  pos: { posX: number; posY: number };
  text: string;
  type?: "black-key" | "white-key";
  options?: {
    dataAttr?: { "data-sharp": string; "data-flat": string };
    showLetters?: boolean;
    rounded?: boolean;
  };
};

type Size = "small" | "medium" | "large";
