export function ActivateMIDI() {
    navigator.requestMIDIAccess()
        .then((midiAccess) => {
            console.log('MIDI Access obtained:', midiAccess);
            for (const input of midiAccess.inputs.values()) {
                input.onmidimessage = (event) => {
                    console.log(event.data); // Uint8Array [status, data1, data2]
                };
            }
        })
        .catch((error) => {
            console.error('Failed to get MIDI access:', error);
        });

    return null;
}
