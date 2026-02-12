import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';

export function ConnectionPanel() {
    return (
        <Card className="col-span-full lg:col-span-1">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Connection</h3>
                <Badge variant="red">Disconnected</Badge>
            </div>
            
            <div className="space-y-6">
                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                            <span className="text-xl material-symbols-outlined select-none">link</span>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">Quick Connect</p>
                            <p className="text-xs text-gray-400">Join or create a session</p>
                        </div>
                    </div>
                    
                    <Input 
                        placeholder="Enter room code (e.g., ABC-123)" 
                        className="mb-3"
                    />
                    
                    <div className="flex gap-2">
                        <Button variant="primary" className="flex-1">
                            Join Room
                        </Button>
                        <Button variant="secondary" className="flex-1">
                            Create Room
                        </Button>
                    </div>
                </div>
                
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Network Status</span>
                        <span className="text-red-400 font-medium">Offline</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Active Peers</span>
                        <span className="text-white font-medium">0</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Session Time</span>
                        <span className="text-white font-medium">00:00:00</span>
                    </div>
                </div>
                
                <div className="pt-4 border-t border-gray-700">
                    <p className="text-xs text-gray-500 mb-3">Connection Settings</p>
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm text-gray-300">
                            <input type="checkbox" className="rounded" defaultChecked />
                            Auto-reconnect
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-300">
                            <input type="checkbox" className="rounded" />
                            Low latency mode
                        </label>
                    </div>
                </div>
            </div>
        </Card>
    );
}
