
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Upload, BarChart3, Download, Eye, Zap, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Home = () => {
  const features = [
    {
      icon: Eye,
      title: 'Threat Detection',
      description: 'Advanced algorithms detect brute-force attacks, scanning activity, and DoS patterns in real-time.'
    },
    {
      icon: BarChart3,
      title: 'Visual Analytics',
      description: 'Interactive charts and graphs provide clear insights into attack patterns and system vulnerabilities.'
    },
    {
      icon: Shield,
      title: 'IP Blacklist Check',
      description: 'Cross-reference suspicious IPs with public security databases and threat intelligence feeds.'
    },
    {
      icon: Download,
      title: 'Detailed Reports',
      description: 'Generate comprehensive incident reports in CSV or PDF format for security documentation.'
    },
    {
      icon: Zap,
      title: 'Fast Processing',
      description: 'Efficiently processes large log files with optimized parsing and analysis algorithms.'
    },
    {
      icon: Lock,
      title: 'Secure & Private',
      description: 'Your log files are processed securely with no data retention or unauthorized access.'
    }
  ];

  const stats = [
    { label: 'Threats Detected', value: '10,000+' },
    { label: 'Log Files Analyzed', value: '50,000+' },
    { label: 'Security Reports', value: '25,000+' },
    { label: 'Response Time', value: '<5min' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234ade80' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    Advanced Log
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Analysis Platform
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Detect intrusions, analyze threats, and secure your infrastructure with our 
                  cutting-edge log file analyzer designed for cybersecurity professionals.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="cyber-glow">
                  <Link to="/upload">
                    <Upload className="w-5 h-5 mr-2" />
                    Start Analysis
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/about">
                    Learn More
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-primary">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="pulse-border border-2 rounded-xl p-8 bg-card/50 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    System Status: Active
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Recent Threat Detection</div>
                    <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
                      <div className="text-sm font-mono">
                        [ALERT] Brute-force detected from 192.168.1.100
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Failed SSH attempts: 47 in 5 minutes
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">Analysis Progress</div>
                    <div className="bg-secondary rounded-full h-2">
                      <div className="bg-primary rounded-full h-2 w-3/4 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Comprehensive Security Analysis
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our platform provides advanced threat detection capabilities to protect your infrastructure 
              from sophisticated cyber attacks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all duration-300 group">
                <CardHeader className="space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Ready to Secure Your Infrastructure?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your log files and get instant security insights with our advanced analysis engine.
          </p>
          <Button asChild size="lg" className="cyber-glow">
            <Link to="/upload">
              <Upload className="w-5 h-5 mr-2" />
              Upload Log Files Now
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
