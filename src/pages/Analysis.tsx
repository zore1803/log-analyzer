import { useMemo } from 'react';
import React, { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Download, 
  Eye,
  Clock,
  MapPin,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { analyzeLogFiles } from '@/utils/logAnalyzer';

interface ThreatData {
  id: string;
  type: 'brute-force' | 'dos' | 'scan' | 'suspicious';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip: string;
  timestamp: string;
  description: string;
  attempts: number;
}

const Analysis = () => {
  const location = useLocation();
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [threats, setThreats] = useState<ThreatData[]>([]);
  const [topIPs, setTopIPs] = useState<Array<{ ip: string; attempts: number; location: string }>>([]);
  const [timelineData, setTimelineData] = useState<Array<{ time: string; attacks: number; scans: number }>>([]);

  // Redirect if no files were passed
  if (!location.state?.files) {
    return <Navigate to="/upload" replace />;
  }

  const files = location.state.files;

  const threatSummary = useMemo(() => {
    const summary = {
      total: threats.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    threats.forEach(threat => {
      summary[threat.severity]++;
    });

    return summary;
  }, [threats]);

  const threatDistribution = useMemo(() => {
    const distribution = {
      'Brute Force': 0,
      'Port Scanning': 0,
      'DoS Attempts': 0,
      'Suspicious Activity': 0
    };

    threats.forEach(threat => {
      switch (threat.type) {
        case 'brute-force':
          distribution['Brute Force']++;
          break;
        case 'scan':
          distribution['Port Scanning']++;
          break;
        case 'dos':
          distribution['DoS Attempts']++;
          break;
        case 'suspicious':
          distribution['Suspicious Activity']++;
          break;
      }
    });

    return [
      { name: 'Brute Force', value: distribution['Brute Force'], color: '#ef4444' },
      { name: 'Port Scanning', value: distribution['Port Scanning'], color: '#f97316' },
      { name: 'DoS Attempts', value: distribution['DoS Attempts'], color: '#eab308' },
      { name: 'Suspicious Activity', value: distribution['Suspicious Activity'], color: '#22c55e' }
    ].filter(item => item.value > 0); // Only show categories with threats
  }, [threats]);

  useEffect(() => {
    // Simulate analysis progress
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          performRealAnalysis();
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const performRealAnalysis = () => {
    console.log('Starting real analysis of uploaded files:', files);
    const analysisResult = analyzeLogFiles(files);
    
    setThreats(analysisResult.threats);
    setTopIPs(analysisResult.topIPs);
    setTimelineData(analysisResult.timeline);
    
    console.log('Analysis complete:', analysisResult.summary);
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'outline',
      low: 'default'
    } as const;
    return colors[severity as keyof typeof colors] || 'default';
  };

  // CSV Download Function
  const downloadCSV = () => {
    const csvData = [
      ['Security Analysis Report'],
      ['Generated on:', new Date().toLocaleString()],
      ['Files Analyzed:', files.length.toString()],
      [''],
      ['THREAT SUMMARY'],
      ['Total Threats:', threatSummary.total.toString()],
      ['Critical:', threatSummary.critical.toString()],
      ['High:', threatSummary.high.toString()],
      ['Medium:', threatSummary.medium.toString()],
      ['Low:', threatSummary.low.toString()],
      [''],
      ['DETAILED THREATS'],
      ['ID', 'Type', 'Severity', 'IP Address', 'Timestamp', 'Description', 'Attempts'],
      ...threats.map(threat => [
        threat.id,
        threat.type,
        threat.severity,
        threat.ip,
        threat.timestamp,
        threat.description,
        threat.attempts.toString()
      ]),
      [''],
      ['TOP OFFENDING IPs'],
      ['IP Address', 'Attempts', 'Location'],
      ...topIPs.map(ip => [ip.ip, ip.attempts.toString(), ip.location]),
      [''],
      ['THREAT DISTRIBUTION'],
      ['Threat Type', 'Count'],
      ...threatDistribution.map(threat => [threat.name, threat.value.toString()]),
      [''],
      ['TIMELINE DATA'],
      ['Time', 'Attacks', 'Scans'],
      ...timelineData.map(data => [data.time, data.attacks.toString(), data.scans.toString()])
    ];

    const csvContent = csvData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `security_analysis_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // PDF Download Function
  const downloadPDF = () => {
    const reportContent = `
      <html>
        <head>
          <title>Security Analysis Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .section h2 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 5px; }
            .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
            .summary-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
            .critical { background-color: #fee; border-color: #f00; }
            .high { background-color: #fef0e6; border-color: #f97316; }
            .medium { background-color: #fffbeb; border-color: #eab308; }
            .low { background-color: #f0fdf4; border-color: #22c55e; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; }
            .threat-critical { background-color: #fee; }
            .threat-high { background-color: #fef0e6; }
            .threat-medium { background-color: #fffbeb; }
            .threat-low { background-color: #f0fdf4; }
            .ip-address { font-family: monospace; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Security Analysis Report</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>Files Analyzed: ${files.length}</p>
          </div>

          <div class="section">
            <h2>Executive Summary</h2>
            <div class="summary-grid">
              <div class="summary-card">
                <h3>Total Threats</h3>
                <div style="font-size: 24px; font-weight: bold;">${threatSummary.total}</div>
              </div>
              <div class="summary-card critical">
                <h3>Critical</h3>
                <div style="font-size: 24px; font-weight: bold;">${threatSummary.critical}</div>
              </div>
              <div class="summary-card high">
                <h3>High</h3>
                <div style="font-size: 24px; font-weight: bold;">${threatSummary.high}</div>
              </div>
              <div class="summary-card medium">
                <h3>Medium</h3>
                <div style="font-size: 24px; font-weight: bold;">${threatSummary.medium}</div>
              </div>
              <div class="summary-card low">
                <h3>Low</h3>
                <div style="font-size: 24px; font-weight: bold;">${threatSummary.low}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Critical Threats</h2>
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>IP Address</th>
                  <th>Timestamp</th>
                  <th>Description</th>
                  <th>Attempts</th>
                </tr>
              </thead>
              <tbody>
                ${threats.map(threat => `
                  <tr class="threat-${threat.severity}">
                    <td>${threat.type}</td>
                    <td>${threat.severity.toUpperCase()}</td>
                    <td class="ip-address">${threat.ip}</td>
                    <td>${threat.timestamp}</td>
                    <td>${threat.description}</td>
                    <td>${threat.attempts}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Top Offending IP Addresses</h2>
            <table>
              <thead>
                <tr>
                  <th>IP Address</th>
                  <th>Attempts</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                ${topIPs.map(ip => `
                  <tr>
                    <td class="ip-address">${ip.ip}</td>
                    <td>${ip.attempts}</td>
                    <td>${ip.location}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Threat Distribution</h2>
            <table>
              <thead>
                <tr>
                  <th>Threat Type</th>
                  <th>Count</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                ${threatDistribution.map(threat => `
                  <tr>
                    <td>${threat.name}</td>
                    <td>${threat.value}</td>
                    <td>${threatSummary.total > 0 ? ((threat.value / threatSummary.total) * 100).toFixed(1) : 0}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Timeline Analysis</h2>
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Attacks</th>
                  <th>Scans</th>
                  <th>Total Events</th>
                </tr>
              </thead>
              <tbody>
                ${timelineData.map(data => `
                  <tr>
                    <td>${data.time}</td>
                    <td>${data.attacks}</td>
                    <td>${data.scans}</td>
                    <td>${data.attacks + data.scans}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p>This report was generated automatically by the Security Analysis System</p>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');
    
    if (newWindow) {
      newWindow.onload = () => {
        setTimeout(() => {
          newWindow.print();
          newWindow.close();
          URL.revokeObjectURL(url);
        }, 1000);
      };
    }
  };

  const handleDownloadReport = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      downloadCSV();
      toast({
        title: "CSV Report Downloaded",
        description: "Security analysis report has been downloaded as CSV file."
      });
    } else if (format === 'pdf') {
      downloadPDF();
      toast({
        title: "PDF Report Generated",
        description: "Security analysis report has been opened in a new window for printing/saving as PDF."
      });
    }
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-primary/5">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <CardTitle>Analyzing Log Files</CardTitle>
            <CardDescription>
              Processing {files.length} file(s) for security threats...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={analysisProgress} className="mb-4" />
            <div className="text-center text-sm text-muted-foreground">
              {Math.round(analysisProgress)}% Complete
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-background to-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Security Analysis Results</h1>
            <p className="text-muted-foreground">
              Analysis completed for {files.length} log file(s) - {threatSummary.total} threats detected
            </p>
          </div>
          <div className="flex gap-2 mt-4 lg:mt-0">
            <Button variant="outline" onClick={() => handleDownloadReport('csv')}>
              <Download className="w-4 h-4 mr-2" />
              CSV Report
            </Button>
            <Button onClick={() => handleDownloadReport('pdf')}>
              <Download className="w-4 h-4 mr-2" />
              PDF Report
            </Button>
          </div>
        </div>

        {/* Threat Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Threats</p>
                  <p className="text-3xl font-bold">{threatSummary.total}</p>
                </div>
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="text-3xl font-bold text-red-500">{threatSummary.critical}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">High</p>
                  <p className="text-3xl font-bold text-orange-500">{threatSummary.high}</p>
                </div>
                <Eye className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Medium</p>
                  <p className="text-3xl font-bold text-yellow-500">{threatSummary.medium}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Low</p>
                  <p className="text-3xl font-bold text-green-500">{threatSummary.low}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Timeline Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Attack Timeline</CardTitle>
              <CardDescription>Security events over the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  <Line type="monotone" dataKey="attacks" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="scans" stroke="#f97316" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Threat Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Threat Distribution</CardTitle>
              <CardDescription>Types of security threats detected</CardDescription>
            </CardHeader>
            <CardContent>
              {threatDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={threatDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {threatDistribution.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No threats detected in the analyzed files
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Offending IPs */}
          <Card>
            <CardHeader>
              <CardTitle>Top Offending IPs</CardTitle>
              <CardDescription>IP addresses with the most suspicious activity</CardDescription>
            </CardHeader>
            <CardContent>
              {topIPs.length > 0 ? (
                <div className="space-y-4">
                  {topIPs.map((ip, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-mono font-medium">{ip.ip}</div>
                          <div className="text-sm text-muted-foreground">{ip.location}</div>
                        </div>
                      </div>
                      <Badge variant="outline">{ip.attempts} attempts</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No suspicious IP activity detected
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Threats */}
          <Card>
            <CardHeader>
              <CardTitle>Detected Threats</CardTitle>
              <CardDescription>Detailed view of security events found in your logs</CardDescription>
            </CardHeader>
            <CardContent>
              {threats.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {threats.slice(0, 10).map((threat) => (
                    <div key={threat.id} className="p-4 rounded-lg border border-border/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={getSeverityBadge(threat.severity)}>
                          {threat.severity.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{threat.timestamp}</span>
                      </div>
                      <div className="font-medium">{threat.description}</div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-mono text-primary">{threat.ip}</span>
                        <span className="text-muted-foreground">{threat.attempts} events</span>
                      </div>
                    </div>
                  ))}
                  {threats.length > 10 && (
                    <div className="text-center text-sm text-muted-foreground py-2">
                      Showing 10 of {threats.length} threats. Download full report for complete details.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No Threats Detected</p>
                  <p className="text-sm">Your log files appear to be clean with no security threats identified.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
