import type { MIDIMessage } from "../types/midi";

type MIDILogProps = {
  messages: MIDIMessage[];
};

export function MIDILog({ messages }: MIDILogProps) {
  return (
    <ul>
      {messages.map((msg, i) => (
        <li key={i}>{msg.type}</li>
      ))}
    </ul>
  );
}
