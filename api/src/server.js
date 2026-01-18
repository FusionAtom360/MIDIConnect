"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ws_1 = __importStar(require("ws"));
var wss = new ws_1.WebSocketServer({ port: 8080 });
var senders = new Set();
var receivers = new Set();
var connectedUsers = 0;
var users = {}; // userId -> username mapping
var connections = new Map(); // ws -> userId mapping
wss.on("connection", function (ws) {
    connectedUsers++;
    broadcastParticipantCount();
    console.log("New client connected");
    ws.on("message", function (message) {
        try {
            var data = JSON.parse(message.toString());
            if (data.type === "updateUsername") {
                users[data.userId] = data.username;
                connections.set(ws, data.userId);
                broadcastUserData();
                console.log("User ID ".concat(data.userId, " is now known as ").concat(data.username));
            }
            else if (data.type === "ping") {
                var ping = JSON.stringify({
                    type: "pingResponse",
                    clientSendTime: data.clientSendTime,
                    serverTime: Date.now(),
                });
                ws.send(ping);
            }
            else if (data.type === "subscribe") {
                var username = users[data.userId] || data.userId;
                if (data.action === "send") {
                    senders.add(ws);
                    console.log("".concat(username, " subscribed as sender"));
                }
                else if (data.action === "receive") {
                    receivers.add(ws);
                    console.log("".concat(username, " subscribed as receiver"));
                }
            }
            else if (data.type === "unsubscribe") {
                var username = users[data.userId] || data.userId;
                if (data.action === "send") {
                    senders.delete(ws);
                    console.log("".concat(username, " unsubscribed as sender"));
                }
                else if (data.action === "receive") {
                    receivers.delete(ws);
                    console.log("".concat(username, " unsubscribed as receiver"));
                }
            }
            else if (data.type === "midi" && senders.has(ws)) {
                var senderName = users[data.userId] || "Unknown";
                console.log("MIDI from ".concat(senderName, " - Command: ").concat(data.command, ", Note: ").concat(data.note, ", Velocity: ").concat(data.velocity));
                var midiMessage_1 = __assign(__assign({}, data), { username: senderName });
                receivers.forEach(function (receiver) {
                    if (receiver.readyState === ws_1.default.OPEN) {
                        receiver.send(JSON.stringify(midiMessage_1));
                    }
                });
                console.log("MIDI message forwarded to all receivers");
            }
            else if (data.type === "chatMessage") {
                var senderName = users[data.userId] || "Unknown";
                console.log("Chat message from ".concat(senderName, " - Message: ").concat(data.message));
                var chatMessage_1 = { type: "chatMessage", username: senderName, message: data.message };
                wss.clients.forEach(function (client) {
                    if (client.readyState === ws_1.default.OPEN) {
                        client.send(JSON.stringify(chatMessage_1));
                    }
                });
                console.log("Chat message forwarded to all receivers");
            }
        }
        catch (err) {
            console.error("Invalid message format", err);
        }
    });
    ws.on("close", function () {
        var userId = connections.get(ws);
        console.log(userId);
        if (userId !== undefined) {
            delete users[userId];
            connections.delete(ws);
            console.log("User ".concat(userId, " disconnected and removed from user list"));
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
    var message = JSON.stringify({
        type: "participantCount",
        count: connectedUsers,
    });
    wss.clients.forEach(function (client) {
        if (client.readyState === ws_1.default.OPEN) {
            client.send(message);
        }
    });
}
function broadcastUserData() {
    var message = JSON.stringify({ type: "userData", users: users });
    wss.clients.forEach(function (client) {
        if (client.readyState === ws_1.default.OPEN) {
            client.send(message);
        }
    });
}
console.log("WebSocket server running on ws://localhost:8080");
