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
  options = { keyHeight: "medium", keyWidth: "medium" },
}: {
  range?: string[];
  options?: {
    keyHeight: Size;
    keyWidth: Size;
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
    };

    keys.push(whiteKey);
    posX += whiteKeyWidth;
  });

  // black keys
  let bkPosX = 60;
  allNaturalNotes.forEach((note, i, arr) => {
    if (i === arr.length - 1) return;
    naturalNotesSharps.forEach((sharp, j) => {
      const flatNoteName = `${naturalNotesFlats[j]}b`;
      const sharpNoteName = `${sharp}#`;
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
        },
      };
      console.log(bkPosX);
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
  return (
    <g width={width} height={height}>
      <rect
        className={type}
        width={width}
        height={height}
        x={pos.posX}
        data-note-name={text}
        {...options?.dataAttr}
      />
      <text
        x={pos.posX + width / 2}
        y={pos.posY}
        textAnchor="middle"
        className={`${type}-text`}
      >
        {text}
      </text>
      {options && (
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
    dataAttr: { "data-sharp": string; "data-flat": string };
  };
};

type Size = "small" | "medium" | "large";
