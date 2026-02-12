import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

const mockDevices = [];
    // { id: '1', name: 'Arturia KeyLab 88', type: 'input', connected: true },
    // { id: '2', name: 'Moog Subsequent 37', type: 'input', connected: true },
    // { id: '3', name: 'Roland TR-8S', type: 'input', connected: false },
    // { id: '4', name: 'Ableton Live MIDI Out', type: 'output', connected: true }];

export function MidiDeviceList() {
    const localDevices = mockDevices;
    const localCount = localDevices.length;
    return (
        <Card className="col-span-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white">MIDI Devices</h3>
                </div>
                <Button variant="secondary" size="sm">
                    <span className="mr-2 material-symbols-outlined !text-sm">refresh</span>
                    Refresh
                </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Local Devices */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm font-semibold text-white">Local Devices</span>
                        <Badge variant={localCount > 0 ? "blue" : "gray"}>{localCount}</Badge>
                    </div>
                    
                    {localCount === 0 ? (
                        <div className="min-h-[200px] flex items-center justify-center p-8 bg-gray-900/30 rounded-lg border border-dashed border-gray-700">
                            <div className="text-center">
                                <div className="text-4xl mb-3 material-symbols-outlined select-none">devices</div>
                                <p className="text-gray-400 text-sm mb-2">No local devices available</p>
                                <p className="text-gray-500 text-xs">Connect a MIDI device or enable virtual devices</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {localDevices.map((device) => (
                                <div 
                                    key={device.id}
                                    className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-gray-600 transition group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                <span className="text-lg material-symbols-outlined select-none">{device.type === 'input' ? 'piano' : 'speaker'}</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-white">{device.name}</p>
                                                </div>
                                                <p className="text-xs text-gray-400 capitalize">{device.type}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <Badge variant={device.connected ? 'green' : 'gray'}>
                                                {device.connected ? 'Connected' : 'Offline'}
                                            </Badge>
                                            <button className="opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-white cursor-pointer">
                                                <span className="material-symbols-outlined !text-md">settings</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Remote Devices */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm font-semibold text-white">Remote Devices</span>
                        <Badge variant="gray">0</Badge>
                    </div>
                    
                    <div className="min-h-[200px] flex items-center justify-center p-8 bg-gray-900/30 rounded-lg border border-dashed border-gray-700">
                        <div className="text-center">
                            <div className="text-4xl mb-3 material-symbols-outlined select-none">plug_connect</div>
                            <p className="text-gray-400 text-sm mb-2">No remote devices connected</p>
                            <p className="text-gray-500 text-xs">Connect to a peer to see their devices</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Device Routing */}
            <div className="mt-6 pt-6 border-t border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-white">Active Routes</h4>
                    <Button variant="secondary" size="sm">
                        <span className="mr-1">+</span> Add Route
                    </Button>
                </div>
                
                <div className="p-4 bg-gray-900/30 rounded-lg border border-gray-700 text-center">
                    <p className="text-sm text-gray-500">No active routes configured</p>
                </div>
            </div>
        </Card>
    );
}
