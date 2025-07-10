
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'uploaded' | 'error';
  progress: number;
  content?: string;
}

const Upload = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const navigate = useNavigate();

  const supportedTypes = [
    { type: 'Apache Access Logs', extension: '.log', description: 'Common log format (CLF) and Combined log format' },
    { type: 'SSH Authentication Logs', extension: '.log', description: 'SSH connection attempts and authentication logs' },
    { type: 'System Logs', extension: '.log', description: 'General system and security event logs' },
    { type: 'Custom Text Logs', extension: '.txt', description: 'Custom formatted log files' }
  ];

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = async (fileList: File[]) => {
    const newFiles: UploadedFile[] = fileList.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type || 'text/plain',
      status: 'uploading',
      progress: 0,
      content: ''
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Read and process each file
    for (const file of fileList) {
      const fileId = newFiles.find(f => f.name === file.name)?.id;
      if (fileId) {
        await processFile(file, fileId);
      }
    }
  };

  const processFile = async (file: File, fileId: string) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        
        // Update file with actual content
        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, content, status: 'uploaded', progress: 100 }
            : f
        ));
      };
      
      reader.onerror = () => {
        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'error', progress: 0 }
            : f
        ));
      };
      
      // Simulate progress while reading
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 90) {
          clearInterval(progressInterval);
          return;
        }
        
        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, progress: Math.min(progress, 90) }
            : f
        ));
      }, 200);
      
      // Actually read the file
      reader.readAsText(file);
      
    } catch (error) {
      console.error('Error processing file:', error);
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, status: 'error', progress: 0 }
          : f
      ));
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleAnalyze = () => {
    const uploadedFiles = files.filter(file => file.status === 'uploaded');
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files ready",
        description: "Please wait for files to finish uploading before starting analysis.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Analysis started",
      description: `Starting security analysis on ${uploadedFiles.length} file(s).`
    });
    
    // Navigate to analysis page with file data
    navigate('/analysis', { state: { files: uploadedFiles } });
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-background to-primary/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Upload Log Files
          </h1>
          <p className="text-xl text-muted-foreground">
            Securely upload your server log files for comprehensive security analysis
          </p>
        </div>

        <div className="space-y-8">
          {/* Upload Area */}
          <Card className="border-2 border-dashed border-border">
            <CardContent className="p-0">
              <div
                className={`p-12 text-center transition-all duration-300 ${
                  isDragOver ? 'bg-primary/10 border-primary' : 'hover:bg-muted/30'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
              >
                <UploadIcon className="w-16 h-16 text-primary mx-auto mb-6" />
                <h3 className="text-2xl font-semibold mb-4">
                  Drop log files here or click to browse
                </h3>
                <p className="text-muted-foreground mb-6">
                  Supports Apache, SSH, and custom log formats. Maximum file size: 100MB
                </p>
                <Button asChild size="lg">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept=".log,.txt"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                    Choose Files
                  </label>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Supported File Types */}
          <Card>
            <CardHeader>
              <CardTitle>Supported Log Types</CardTitle>
              <CardDescription>
                Our analyzer supports various log formats commonly used in cybersecurity monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {supportedTypes.map((type, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 rounded-lg border border-border/50">
                    <File className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">{type.type}</div>
                      <div className="text-sm text-muted-foreground">
                        {type.description}
                      </div>
                      <div className="text-xs text-primary mt-1">{type.extension}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Files */}
          {files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Files ({files.length})</CardTitle>
                <CardDescription>
                  Files ready for security analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center space-x-4 p-4 rounded-lg border border-border/50">
                    <div className="flex-shrink-0">
                      {file.status === 'uploaded' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : file.status === 'error' ? (
                        <AlertCircle className="w-5 h-5 text-destructive" />
                      ) : (
                        <File className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{file.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)}
                      </div>
                      {file.status === 'uploading' && (
                        <Progress value={file.progress} className="mt-2" />
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                <div className="pt-4 border-t border-border">
                  <Button 
                    onClick={handleAnalyze}
                    size="lg"
                    className="w-full"
                    disabled={files.filter(f => f.status === 'uploaded').length === 0}
                  >
                    Start Security Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
