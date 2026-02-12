import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

const mockActivity = [
    { id: 1, type: 'message', user: 'You', text: 'Connected to session', time: '2m ago' },
    { id: 2, type: 'device', user: 'System', text: 'Arturia KeyLab 88 detected', time: '5m ago' },
    { id: 3, type: 'connection', user: 'System', text: 'WebRTC connection established', time: '8m ago' },
];

export function SessionActivity() {
    return (
        <Card className="col-span-full lg:col-span-1">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Activity Log</h3>
                <button className="text-xs text-gray-400 hover:text-white transition">
                    Clear
                </button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {mockActivity.map((activity) => (
                    <div
                        key={activity.id}
                        className="p-3 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-gray-600 transition"
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs material-symbols-outlined select-none">
                                    {activity.type === 'message' ? 'chat' :
                                        activity.type === 'device' ? 'piano' : 'link'}
                                </span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-white">{activity.user}</span>
                                    <span className="text-xs text-gray-500">{activity.time}</span>
                                </div>
                                <p className="text-sm text-gray-400">{activity.text}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Send a message..."
                        className="flex-1 px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-sm font-medium">
                        Send
                    </button>
                </div>
            </div>
        </Card>
    );
}
