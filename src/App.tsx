import { Header } from './components/layout/Header';
import { ConnectionPanel } from './components/features/ConnectionPanel';
import { LatencyMonitor } from './components/features/LatencyMonitor';
import { MidiDeviceList } from './components/features/MidiDeviceList';
import { SessionActivity } from './components/features/SessionActivity';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
      <Header />

      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ConnectionPanel />
          <LatencyMonitor />
        </div>

        <div className="mb-6">
          <MidiDeviceList />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SessionActivity />

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                <div className="text-3xl font-bold text-blue-400">0</div>
                <div className="text-xs text-gray-400 mt-1">Total Sessions</div>
              </div>
              <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                <div className="text-3xl font-bold text-green-400">4</div>
                <div className="text-xs text-gray-400 mt-1">Devices Found</div>
              </div>
              <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                <div className="text-3xl font-bold text-purple-400">12ms</div>
                <div className="text-xs text-gray-400 mt-1">Avg Latency</div>
              </div>
              <div className="text-center p-4 bg-gray-900/50 rounded-lg">
                <div className="text-3xl font-bold text-yellow-400">0</div>
                <div className="text-xs text-gray-400 mt-1">Active Routes</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-800 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-8 text-center text-sm text-gray-500">
          <p>MIDI Network Collaboration • Built with React, TypeScript, and WebRTC</p>
          <p><a href="https://github.com/FusionAtom360/MIDIConnect" className="hover:underline">https://github.com/FusionAtom360/MIDIConnect</a></p>
        </div>
      </footer>
    </div>
  );
}

export default App;
