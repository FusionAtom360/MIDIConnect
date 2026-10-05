type PianoDockProps = {
    isOpen: boolean;
    activeNotes: number[];
};

type WhiteKey = {
    note: number;
    label: string;
};

type BlackKey = {
    note: number;
    leftIndex: number;
    label?: string;
};

const WHITE_KEYS: WhiteKey[] = [
    { note: 21, label: "A0" },
    { note: 23, label: "B0" },
    { note: 24, label: "C1" },
    { note: 26, label: "D1" },
    { note: 28, label: "E1" },
    { note: 29, label: "F1" },
    { note: 31, label: "G1" },
    { note: 33, label: "A1" },
    { note: 35, label: "B1" },
    { note: 36, label: "C2" },
    { note: 38, label: "D2" },
    { note: 40, label: "E2" },
    { note: 41, label: "F2" },
    { note: 43, label: "G2" },
    { note: 45, label: "A2" },
    { note: 47, label: "B2" },
    { note: 48, label: "C3" },
    { note: 50, label: "D3" },
    { note: 52, label: "E3" },
    { note: 53, label: "F3" },
    { note: 55, label: "G3" },
    { note: 57, label: "A3" },
    { note: 59, label: "B3" },
    { note: 60, label: "C4" },
    { note: 62, label: "D4" },
    { note: 64, label: "E4" },
    { note: 65, label: "F4" },
    { note: 67, label: "G4" },
    { note: 69, label: "A4" },
    { note: 71, label: "B4" },
    { note: 72, label: "C5" },
    { note: 74, label: "D5" },
    { note: 76, label: "E5" },
    { note: 77, label: "F5" },
    { note: 79, label: "G5" },
    { note: 81, label: "A5" },
    { note: 83, label: "B5" },
    { note: 84, label: "C6" },
    { note: 86, label: "D6" },
    { note: 88, label: "E6" },
    { note: 89, label: "F6" },
    { note: 91, label: "G6" },
    { note: 93, label: "A6" },
    { note: 95, label: "B6" },
    { note: 96, label: "C7" },
    { note: 98, label: "D7" },
    { note: 100, label: "E7" },
    { note: 101, label: "F7" },
    { note: 103, label: "G7" },
    { note: 105, label: "A7" },
    { note: 107, label: "B7" },
    { note: 108, label: "C8" },

];

const BLACK_KEYS: BlackKey[] = [
    { note: 22, leftIndex: 0, label: "A#0/Bb0" },
    { note: 25, leftIndex: 2, label: "C#1/Db1" },
    { note: 27, leftIndex: 3, label: "D#1/Eb1" },
    { note: 30, leftIndex: 5, label: "F#1/Gb1" },
    { note: 32, leftIndex: 6, label: "G#1/Ab1" },
    { note: 34, leftIndex: 7, label: "A#1/Bb1" },
    { note: 37, leftIndex: 9, label: "C#2/Db2" },
    { note: 39, leftIndex: 10, label: "D#2/Eb2" },
    { note: 42, leftIndex: 12, label: "F#2/Gb2" },
    { note: 44, leftIndex: 13, label: "G#2/Ab2" },
    { note: 46, leftIndex: 14, label: "A#2/Bb2" },
    { note: 49, leftIndex: 16, label: "C#3/Db3" },
    { note: 51, leftIndex: 17, label: "D#3/Eb3" },
    { note: 54, leftIndex: 19, label: "F#3/Gb3" },
    { note: 56, leftIndex: 20, label: "G#3/Ab3" },
    { note: 58, leftIndex: 21, label: "A#3/Bb3" },
    { note: 61, leftIndex: 23, label: "C#4/Db4" },
    { note: 63, leftIndex: 24, label: "D#4/Eb4" },
    { note: 66, leftIndex: 26, label: "F#4/Gb4" },
    { note: 68, leftIndex: 27, label: "G#4/Ab4" },
    { note: 70, leftIndex: 28, label: "A#4/Bb4" },
    { note: 73, leftIndex: 30, label: "C#5/Db5" },
    { note: 75, leftIndex: 31, label: "D#5/Eb5" },
    { note: 78, leftIndex: 33, label: "F#5/Gb5" },
    { note: 80, leftIndex: 34, label: "G#5/Ab5" },
    { note: 82, leftIndex: 35, label: "A#5/Bb5" },
    { note: 85, leftIndex: 37, label: "C#6/Db6" },
    { note: 87, leftIndex: 38, label: "D#6/Eb6" },
    { note: 90, leftIndex: 40, label: "F#6/Gb6" },
    { note: 92, leftIndex: 41, label: "G#6/Ab6" },
    { note: 94, leftIndex: 42, label: "A#6/Bb6" },
    { note: 97, leftIndex: 44, label: "C#7/Db7" },
    { note: 99, leftIndex: 45, label: "D#7/Eb7" },
    { note: 102, leftIndex: 47, label: "F#7/Gb7" },
    { note: 104, leftIndex: 48, label: "G#7/Ab7" },
    { note: 106, leftIndex: 49, label: "A#7/Bb7" },
];

export function PianoDock({ isOpen, activeNotes }: PianoDockProps) {
    const activeSet = new Set(activeNotes);
    const translateClass = isOpen ? "translate-y-0" : "translate-y-full";

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-500 ease-out ${translateClass}`}
            aria-hidden={!isOpen}
        >
            <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-900 border-t border-gray-800 shadow-2xl">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="text-xs text-gray-500">C4 to C8</div>
                </div>

                <div className="relative px-6 pb-6">
                    <div className="relative h-28">
                        <div className="flex h-full">
                            {WHITE_KEYS.map((key) => {
                                const isActive = activeSet.has(key.note);
                                return (
                                    <div
                                        key={key.note}
                                        className={`flex-1 relative border border-gray-800 rounded-b-md shadow-inner transition-colors ${isActive
                                                ? "bg-gradient-to-b from-gray-200 via-green-600 to-green-800"
                                                : "bg-gradient-to-b from-white via-gray-100 to-gray-200"
                                            }`}
                                    >
                                        <span
                                            className={`absolute bottom-2 left-2 text-[10px] font-semibold ${isActive ? "text-blue-600" : "text-gray-500"
                                                }`}
                                        >
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="absolute top-0 left-0 right-0 h-16">
                            {BLACK_KEYS.map((key) => {
                                const isActive = activeSet.has(key.note);
                                const leftPercent = ((key.leftIndex + 1.0) / WHITE_KEYS.length) * 100;
                                return (
                                    <div
                                        key={key.note}
                                        className={`absolute h-16 -translate-x-1/2 rounded-b-md border border-gray-900 shadow-xl transition-colors ${isActive
                                                ? "bg-gradient-to-b from-gray-900 via-green-900 to-green-600"
                                                : "bg-gradient-to-b from-gray-900 via-gray-800 to-black"
                                            }`}
                                        style={{ left: `${leftPercent}%`, width: `${100 / (WHITE_KEYS.length * 1.5)}%` }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
