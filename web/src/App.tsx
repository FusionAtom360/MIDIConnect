// import { useState } from 'react';
import { MIDILog } from "./components/midilog";
import { ActivateMIDI } from "./components/activatemidi";
// import './App.css';

function App() {
    return (
        <>
            <ActivateMIDI />
            <MIDILog messages={[]} />
        </>
    );
}

export default App
