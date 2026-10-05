import { useCallback, useEffect, useId, useRef, useState } from 'react';

export type MidiDevice = {
    id: string;
    name: string;
    type: 'input' | 'output';
};

export type MidiLogEntry = {
    id: number;
    text: string;
};

export type ChatMessage = {
    id: number;
    username: string;
    message: string;
};

type IncomingMessage = {
    type?: string;
    count?: number;
    serverTime?: number;
    clientSendTime?: number;
    users?: Record<string, string>;
    username?: string;
    message?: string;
    userId?: string;
    command?: number;
    note?: number;
    velocity?: number;
    timestamp?: number;
};

const SOCKET_URL = import.meta.env.VITE_MIDI_SOCKET_URL ?? 'wss://midi-app-cz4r.onrender.com';

export function useMidiConnection(username: string) {
    const socketRef = useRef<WebSocket | null>(null);
    const midiAccessRef = useRef<MIDIAccess | null>(null);
    const inputRef = useRef<MIDIInput | null>(null);
    const outputRef = useRef<MIDIOutput | null>(null);
    const generatedId = useId();
    const userIdRef = useRef(`user-${generatedId.replaceAll(':', '')}`);
    const reconnectRef = useRef<number | undefined>(undefined);
    const pingIntervalRef = useRef<number | undefined>(undefined);
    const clockOffsetRef = useRef(0);
    const latencySamplesRef = useRef<number[]>([]);
    const logIdRef = useRef(0);
    const chatIdRef = useRef(0);
    const [status, setStatus] = useState<'connected' | 'disconnected'>('disconnected');
    const [peerCount, setPeerCount] = useState(0);
    const [latency, setLatency] = useState(0);
    const [devices, setDevices] = useState<MidiDevice[]>([]);
    const [logs, setLogs] = useState<MidiLogEntry[]>([]);
    const [chat, setChat] = useState<ChatMessage[]>([]);
    const [sendEnabled, setSendEnabled] = useState(false);
    const [receiveEnabled, setReceiveEnabled] = useState(false);
    const [realtime, setRealtime] = useState(() => localStorage.getItem('realtime') === 'true');
    const [loopback, setLoopback] = useState(false);
    const [virtualPlayback, setVirtualPlayback] = useState(false);

    const addLog = useCallback((text: string) => {
        setLogs((current) => [{ id: logIdRef.current++, text }, ...current].slice(0, 200));
    }, []);

    const send = useCallback((message: object) => {
        const socket = socketRef.current;
        if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
            return true;
        }
        return false;
    }, []);

    const sendChat = useCallback((message: string) => {
        const trimmed = message.trim();
        if (trimmed && send({ type: 'chatMessage', userId: userIdRef.current, message: trimmed })) {
            setChat((current) => [...current, { id: chatIdRef.current++, username: username || 'User', message: trimmed }]);
        }
    }, [send, username]);

    const handleIncomingMidi = useCallback((data: IncomingMessage) => {
        if (data.userId === userIdRef.current && !loopback) return;
        if (!receiveEnabled || data.command === undefined || data.note === undefined || data.velocity === undefined) return;

        const output = outputRef.current;
        if (output) {
            const deliver = () => output.send([data.command!, data.note!, data.velocity!]);
            if (realtime || data.timestamp === undefined) {
                deliver();
            } else {
                const delay = data.timestamp - (Date.now() + clockOffsetRef.current);
                window.setTimeout(deliver, Math.max(0, delay));
            }
            addLog(`MIDI from ${data.username ?? 'peer'} to ${output.name} - Command: ${data.command}, Note: ${data.note}, Velocity: ${data.velocity}`);
        }
    }, [addLog, loopback, realtime, receiveEnabled]);

    const handleMidiMessage = useCallback((event: MIDIMessageEvent) => {
        if (!sendEnabled || !inputRef.current || !event.data) return;
        const [command, note, velocity] = event.data;
        if (command === 254 || note === undefined || velocity === undefined) return;
        addLog(`MIDI from ${inputRef.current.name} - Command: ${command}, Note: ${note}, Velocity: ${velocity}`);
        send({
            type: 'midi',
            command,
            note,
            velocity,
            userId: userIdRef.current,
            timestamp: Date.now() + clockOffsetRef.current,
        });
    }, [addLog, send, sendEnabled]);

    const refreshDevices = useCallback(async () => {
        if (!navigator.requestMIDIAccess) {
            addLog('WebMIDI is not supported in this browser.');
            return;
        }
        const access = midiAccessRef.current ?? await navigator.requestMIDIAccess();
        midiAccessRef.current = access;
        setDevices([
            ...Array.from(access.inputs.values()).map((device) => ({ id: device.id, name: device.name ?? 'Unnamed input', type: 'input' as const })),
            ...Array.from(access.outputs.values()).map((device) => ({ id: device.id, name: device.name ?? 'Unnamed output', type: 'output' as const })),
        ]);
    }, [addLog]);

    useEffect(() => {
        let disposed = false;
        const connect = () => {
            if (disposed) return;
            const socket = new WebSocket(SOCKET_URL);
            socketRef.current = socket;
            socket.onopen = () => {
                setStatus('connected');
                send({ type: 'updateUsername', userId: userIdRef.current, username: username || userIdRef.current });
                ping();
                pingIntervalRef.current = window.setInterval(ping, 5000);
            };
            socket.onmessage = (event) => {
                const data = JSON.parse(event.data) as IncomingMessage;
                if (data.type === 'participantCount') setPeerCount(data.count ?? 0);
                else if (data.type === 'pingResponse' && data.clientSendTime !== undefined) {
                    const sample = Date.now() - data.clientSendTime;
                    latencySamplesRef.current = [...latencySamplesRef.current, sample].slice(-20);
                    setLatency(Math.floor(latencySamplesRef.current.reduce((sum, value) => sum + value, 0) / latencySamplesRef.current.length));
                    if (data.serverTime !== undefined) clockOffsetRef.current = data.serverTime - Date.now();
                } else if (data.type === 'chatMessage' && data.message) {
                    setChat((current) => [...current, { id: chatIdRef.current++, username: data.username ?? 'User', message: data.message! }]);
                } else {
                    handleIncomingMidi(data);
                }
            };
            socket.onclose = () => {
                setStatus('disconnected');
                if (pingIntervalRef.current !== undefined) window.clearInterval(pingIntervalRef.current);
                if (!disposed) reconnectRef.current = window.setTimeout(connect, 5000);
            };
            socket.onerror = () => socket.close();
        };
        const ping = () => send({ type: 'ping', clientSendTime: Date.now() });
        connect();
        return () => {
            disposed = true;
            if (reconnectRef.current !== undefined) window.clearTimeout(reconnectRef.current);
            if (pingIntervalRef.current !== undefined) window.clearInterval(pingIntervalRef.current);
            inputRef.current?.removeEventListener('midimessage', handleMidiMessage);
            socketRef.current?.close();
        };
    }, [handleIncomingMidi, handleMidiMessage, send, username]);

    useEffect(() => {
        send({ type: sendEnabled ? 'subscribe' : 'unsubscribe', action: 'send', userId: userIdRef.current });
        send({ type: receiveEnabled ? 'subscribe' : 'unsubscribe', action: 'receive', userId: userIdRef.current });
    }, [receiveEnabled, send, sendEnabled]);

    useEffect(() => {
        if (!navigator.requestMIDIAccess) return;
        navigator.requestMIDIAccess().then((access) => {
            midiAccessRef.current = access;
            setDevices([
                ...Array.from(access.inputs.values()).map((device) => ({ id: device.id, name: device.name ?? 'Unnamed input', type: 'input' as const })),
                ...Array.from(access.outputs.values()).map((device) => ({ id: device.id, name: device.name ?? 'Unnamed output', type: 'output' as const })),
            ]);
        }).catch(() => {
            addLog('Could not access MIDI devices.');
        });
    }, [addLog]);

    const selectInput = useCallback((id: string) => {
        inputRef.current?.removeEventListener('midimessage', handleMidiMessage);
        inputRef.current = midiAccessRef.current?.inputs.get(id) ?? null;
        inputRef.current?.addEventListener('midimessage', handleMidiMessage);
    }, [handleMidiMessage]);

    const selectOutput = useCallback((id: string) => {
        outputRef.current = midiAccessRef.current?.outputs.get(id) ?? null;
    }, []);

    return {
        status, peerCount, latency, devices, logs, chat, sendEnabled, receiveEnabled, realtime, loopback, virtualPlayback,
        setSendEnabled, setReceiveEnabled, setRealtime: (value: boolean) => { setRealtime(value); localStorage.setItem('realtime', String(value)); },
        setLoopback, setVirtualPlayback, refreshDevices, selectInput, selectOutput, sendChat,
    };
}
