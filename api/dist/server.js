import WebSocket, { WebSocketServer } from 'ws';
const wss = new WebSocketServer({ port: 8080 });
let senders = new Set();
let receivers = new Set();
let connectedUsers = 0;
let users = {}; // userId -> username mapping
let connections = new Map(); // ws -> userId mapping
wss.on("connection", (ws) => {
    connectedUsers++;
    broadcastParticipantCount();
    console.log("New client connected");
    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message.toString());
            if (data.type === "updateUsername") {
                users[data.userId] = data.username;
                connections.set(ws, data.userId);
                broadcastUserData();
                console.log(`User ID ${data.userId} is now known as ${data.username}`);
            }
            else if (data.type === "ping") {
                const ping = JSON.stringify({
                    type: "pingResponse",
                    clientSendTime: data.clientSendTime,
                    serverTime: Date.now(),
                });
                ws.send(ping);
            }
            else if (data.type === "subscribe") {
                const username = users[data.userId] || data.userId;
                if (data.action === "send") {
                    senders.add(ws);
                    console.log(`${username} subscribed as sender`);
                }
                else if (data.action === "receive") {
                    receivers.add(ws);
                    console.log(`${username} subscribed as receiver`);
                }
            }
            else if (data.type === "unsubscribe") {
                const username = users[data.userId] || data.userId;
                if (data.action === "send") {
                    senders.delete(ws);
                    console.log(`${username} unsubscribed as sender`);
                }
                else if (data.action === "receive") {
                    receivers.delete(ws);
                    console.log(`${username} unsubscribed as receiver`);
                }
            }
            else if (data.type === "midi" && senders.has(ws)) {
                const senderName = users[data.userId] || "Unknown";
                console.log(`MIDI from ${senderName} - Command: ${data.command}, Note: ${data.note}, Velocity: ${data.velocity}`);
                const midiMessage = { ...data, username: senderName };
                receivers.forEach((receiver) => {
                    if (receiver.readyState === WebSocket.OPEN) {
                        receiver.send(JSON.stringify(midiMessage));
                    }
                });
                console.log(`MIDI message forwarded to all receivers`);
            }
            else if (data.type === "chatMessage") {
                const senderName = users[data.userId] || "Unknown";
                console.log(`Chat message from ${senderName} - Message: ${data.message}`);
                const chatMessage = { type: "chatMessage", username: senderName, message: data.message };
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(chatMessage));
                    }
                });
                console.log(`Chat message forwarded to all receivers`);
            }
        }
        catch (err) {
            console.error("Invalid message format", err);
        }
    });
    ws.on("close", () => {
        const userId = connections.get(ws);
        console.log(userId);
        if (userId !== undefined) {
            delete users[userId];
            connections.delete(ws);
            console.log(`User ${userId} disconnected and removed from user list`);
            broadcastUserData();
        }
        else {
            console.log("A client disconnected without registering.");
        }
        senders.delete(ws);
        receivers.delete(ws);
        console.log("Client disconnected");
        connectedUsers--;
        broadcastParticipantCount();
    });
});
function broadcastParticipantCount() {
    const message = JSON.stringify({
        type: "participantCount",
        count: connectedUsers,
    });
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}
function broadcastUserData() {
    const message = JSON.stringify({ type: "userData", users: users });
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}
console.log("WebSocket server running on ws://localhost:8080");
//# sourceMappingURL=server.js.map