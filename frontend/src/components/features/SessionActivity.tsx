import { useState } from 'react';
import { Card } from '../ui/Card';
import type { ChatMessage, MidiLogEntry } from '../../hooks/useMidiConnection';

type SessionActivityProps = {
    logs: MidiLogEntry[];
    chat: ChatMessage[];
    onSend: (message: string) => void;
};

export function SessionActivity({ logs, chat, onSend }: SessionActivityProps) {
    const [message, setMessage] = useState('');
    return (
        <Card className="col-span-full lg:col-span-1">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Activity Log</h3>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {logs.length === 0 ? <p className="text-sm text-gray-500">No MIDI activity yet.</p> : logs.map((entry) => (
                    <div key={entry.id} className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                        <p className="text-sm text-gray-400"><span className="font-medium text-white">MIDI:</span> {entry.text}</p>
                    </div>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Send a message..."
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                onSend(message);
                                setMessage('');
                            }
                        }}
                        className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-sm font-medium" onClick={() => { onSend(message); setMessage(''); }}>
                        Send
                    </button>
                </div>
                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                    {chat.map((entry) => <p key={entry.id} className="text-sm text-gray-400"><span className="font-medium text-white">{entry.username}:</span> {entry.message}</p>)}
                </div>
            </div>
        </Card>
    );
}
