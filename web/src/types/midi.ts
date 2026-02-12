export type NoteOnMessage = {
    type: 'NoteOn';
    channel: number; // 0–15
    note: number; // 0–127
    velocity: number; // 0–127
    timestamp: number;
};

export type NoteOffMessage = {
    type: 'NoteOff';
    channel: number; // 0–15
    note: number; // 0–127
    timestamp: number;
};

export type MIDIMessage =
    | NoteOnMessage
    | NoteOffMessage;
