import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export function LatencyMonitor({ latency }: { latency: number }) {
  const qualityBars = [42, 55, 48, 67, 52, 74, 61, 45, 70, 58, 64, 51, 76, 63, 57, 69, 47, 73, 60, 54, 66, 49, 71, 56, 62, 68, 53, 75, 59, 65];
  return (
    <Card className="col-span-full lg:col-span-1">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Performance</h3>
        <Badge variant={latency < 50 ? 'green' : 'yellow'}>{latency < 50 ? 'Optimal' : 'High'}</Badge>
      </div>
      
      <div className="space-y-6">
        {/* Latency Gauge */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Round-trip Latency</span>
            <span className="text-2xl font-bold text-green-400">{latency}ms</span>
          </div>
          <div className="w-full h-3 bg-gray-900/50 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: `${Math.min(100, latency)}%` }}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0ms</span>
            <span>50ms</span>
            <span>100ms</span>
          </div>
        </div>
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Jitter</div>
            <div className="text-xl font-bold text-white">±2ms</div>
          </div>
          
          <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Packet Loss</div>
            <div className="text-xl font-bold text-white">0.0%</div>
          </div>
          
          <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Messages/sec</div>
            <div className="text-xl font-bold text-white">0</div>
          </div>
          
          <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Bandwidth</div>
            <div className="text-xl font-bold text-white">0 KB/s</div>
          </div>
        </div>
        
        {/* Connection Quality */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-400">Connection Quality</span>
            <span className="text-xs text-gray-500">Last 60s</span>
          </div>
          
          <div className="h-24 flex items-end gap-1">
            {qualityBars.map((height, i) => (
              <div 
                key={i}
                className="flex-1 bg-green-500/30 rounded-t"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
