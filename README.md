# MIDIConnect

A web-based application for real-time MIDI communication between remote clients. MIDIConnect enables users to send and receive MIDI events over the internet with low latency, supporting both physical MIDI devices and a virtual instrument interface.

Live Demo: https://midiconnect.web.app

## Features

- Real-time MIDI transmission over WebSockets

- Browser-based MIDI input and output

- Virtual instrument for MIDI playback

- Time-synchronized event scheduling to reduce latency inconsistencies

- Client–server architecture with centralized routing

## Architecture Overview

The application uses a centralized Node.js server to relay MIDI messages between connected clients. MIDI events are timestamped and scheduled on the client side to ensure consistent playback across varying network conditions.

## Usage

- Connect a MIDI device or use the built-in virtual instrument.

- Open the application in multiple clients.

- Play MIDI input on one client to transmit events to others in real time.

## Limitations

- Requires browser support for the Web MIDI API

- Network latency may vary depending on connection quality

- Not intended for critical or studio-grade synchronization

## Future Improvements

- Peer-to-peer routing options

- Authentication and session management

- Improved latency compensation

- Persistent session rooms
