
interface ThreatData {
  id: string;
  type: 'brute-force' | 'dos' | 'scan' | 'suspicious';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip: string;
  timestamp: string;
  description: string;
  attempts: number;
}

interface AnalysisResult {
  threats: ThreatData[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  topIPs: Array<{ ip: string; attempts: number; location: string }>;
  timeline: Array<{ time: string; attacks: number; scans: number }>;
}

export const analyzeLogFiles = (files: Array<{ content?: string; name: string }>): AnalysisResult => {
  const threats: ThreatData[] = [];
  const ipCounts: Record<string, number> = {};
  const timelineCounts: Record<string, { attacks: number; scans: number }> = {};

  // Initialize timeline for 24 hours
  for (let i = 0; i < 24; i += 4) {
    const time = `${i.toString().padStart(2, '0')}:00`;
    timelineCounts[time] = { attacks: 0, scans: 0 };
  }

  files.forEach((file, fileIndex) => {
    if (!file.content) return;

    console.log(`Analyzing file: ${file.name}`);
    const lines = file.content.split('\n');
    
    lines.forEach((line, lineIndex) => {
      if (!line.trim()) return;

      const threatId = `${fileIndex}-${lineIndex}`;
      
      // Extract IP addresses from the line
      const ipMatch = line.match(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/);
      const ip = ipMatch ? ipMatch[0] : 'unknown';
      
      // Extract timestamp (try different formats)
      const timestampMatch = line.match(/\d{4}-\d{2}-\d{2}[\s\T]\d{2}:\d{2}:\d{2}/) || 
                            line.match(/\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}/) ||
                            line.match(/\d{2}\/\w{3}\/\d{4}:\d{2}:\d{2}:\d{2}/);
      
      const timestamp = timestampMatch ? timestampMatch[0] : new Date().toISOString().slice(0, 19).replace('T', ' ');

      // Update IP counts
      if (ip !== 'unknown') {
        ipCounts[ip] = (ipCounts[ip] || 0) + 1;
      }

      // Check for brute force attacks
      if (line.toLowerCase().includes('failed') && 
          (line.toLowerCase().includes('login') || 
           line.toLowerCase().includes('password') || 
           line.toLowerCase().includes('authentication'))) {
        
        threats.push({
          id: threatId,
          type: 'brute-force',
          severity: ipCounts[ip] > 10 ? 'critical' : ipCounts[ip] > 5 ? 'high' : 'medium',
          ip,
          timestamp,
          description: `Failed authentication attempt detected from ${ip}`,
          attempts: ipCounts[ip] || 1
        });

        // Update timeline
        const hour = new Date(timestamp).getHours();
        const timeSlot = `${Math.floor(hour / 4) * 4}`.padStart(2, '0') + ':00';
        if (timelineCounts[timeSlot]) {
          timelineCounts[timeSlot].attacks++;
        }
      }

      // Check for port scanning
      if (line.toLowerCase().includes('scan') ||
          (line.includes('TCP') && line.includes('SYN')) ||
          line.match(/port\s+\d+/i)) {
        
        threats.push({
          id: threatId + '-scan',
          type: 'scan',
          severity: 'high',
          ip,
          timestamp,
          description: `Port scanning activity detected from ${ip}`,
          attempts: 1
        });

        // Update timeline
        const hour = new Date(timestamp).getHours();
        const timeSlot = `${Math.floor(hour / 4) * 4}`.padStart(2, '0') + ':00';
        if (timelineCounts[timeSlot]) {
          timelineCounts[timeSlot].scans++;
        }
      }

      // Check for DoS attacks
      if (line.toLowerCase().includes('dos') ||
          line.toLowerCase().includes('flood') ||
          (line.includes('HTTP') && line.includes('500')) ||
          line.match(/\b(timeout|refused|unavailable)\b/i)) {
        
        threats.push({
          id: threatId + '-dos',
          type: 'dos',
          severity: 'critical',
          ip,
          timestamp,
          description: `Potential DoS attack detected from ${ip}`,
          attempts: 1
        });

        // Update timeline
        const hour = new Date(timestamp).getHours();
        const timeSlot = `${Math.floor(hour / 4) * 4}`.padStart(2, '0') + ':00';
        if (timelineCounts[timeSlot]) {
          timelineCounts[timeSlot].attacks++;
        }
      }

      // Check for suspicious activity
      if (line.toLowerCase().includes('suspicious') ||
          line.toLowerCase().includes('malware') ||
          line.toLowerCase().includes('virus') ||
          line.match(/\b(blocked|denied|rejected)\b/i)) {
        
        threats.push({
          id: threatId + '-suspicious',
          type: 'suspicious',
          severity: 'medium',
          ip,
          timestamp,
          description: `Suspicious activity detected from ${ip}`,
          attempts: 1
        });
      }
    });
  });

  // Calculate summary
  const summary = {
    total: threats.length,
    critical: threats.filter(t => t.severity === 'critical').length,
    high: threats.filter(t => t.severity === 'high').length,
    medium: threats.filter(t => t.severity === 'medium').length,
    low: threats.filter(t => t.severity === 'low').length
  };

  // Get top IPs
  const topIPs = Object.entries(ipCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([ip, attempts]) => ({
      ip,
      attempts,
      location: ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.') ? 'Internal' : 'External'
    }));

  // Convert timeline to array
  const timeline = Object.entries(timelineCounts).map(([time, counts]) => ({
    time,
    attacks: counts.attacks,
    scans: counts.scans
  }));

  console.log(`Analysis complete: ${threats.length} threats found`);
  
  return {
    threats,
    summary,
    topIPs,
    timeline
  };
};
