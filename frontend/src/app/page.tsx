'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Upload, FileSpreadsheet, ChevronDown, ChevronRight } from "lucide-react";

export interface ColumnAnalysis {
  column_name: string;
  sample_values: string[];
  is_pii: boolean;
  confidence: number;
  reasoning: string;
}

export interface FileAnalysis {
  filename: string;
  columns: ColumnAnalysis[];
  summary: {
    total_columns: number;
    pii_columns: number;
    safe_columns: number;
    overall_status: string;
    confidence: number;
  };
  cost_info: any;
}

export interface MultiFileAnalysis {
  files: FileAnalysis[];
  summary: {
    total_files: number;
    total_columns: number;
    pii_columns: number;
    safe_columns: number;
    overall_status: string;
    confidence: number;
  };
  total_cost_info: any;
}

export default function Home() {
  const [results, setResults] = useState<MultiFileAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [estimatedCost, setEstimatedCost] = useState<any>(null);
  const [actualCost, setActualCost] = useState<any>(null);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

  const estimateCost = async (files: File[]) => {
    try {
      let totalColumnCount = 0;
      
      // Calculate total columns across all files
      for (const file of files) {
        const text = await file.text();
        const lines = text.split('');
        const columnCount = lines[0]?.split(',').length || 1;
        totalColumnCount += columnCount;
      }
      
      const response = await fetch('http://localhost:8000/estimate-cost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          column_count: totalColumnCount,
          avg_samples_per_column: 5,
          avg_sample_length: 20
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setEstimatedCost(data.estimated_cost);
      }
    } catch (error) {
      console.error('Error estimating cost:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(files);
      setEstimatedCost(null);
      setActualCost(null);
      setResults(null);
      estimateCost(files);
    }
  };

  const toggleFileExpansion = (filename: string) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(filename)) {
      newExpanded.delete(filename);
    } else {
      newExpanded.add(filename);
    }
    setExpandedFiles(newExpanded);
  };

  const handleAnalyze = async () => {
    if (selectedFiles.length === 0) return;

    setIsAnalyzing(true);
    setResults(null);

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      // Determine API URL - use localhost for browser requests in Docker deployment
      // The environment variable is only used for server-side rendering
      const apiUrl = 'http://localhost:8000';
      console.log('Sending request to:', `${apiUrl}/analyze-csv`);
      
      const response = await fetch(`${apiUrl}/analyze-csv`, {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Analysis failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Analysis results:', data);
      // Handle new multi-file API response format
      setResults(data);
      
      // Set actual cost if available
      if (data.total_cost_info) {
        setActualCost(data.total_cost_info);
      }
    } catch (error) {
      console.error('Error analyzing file:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        alert('Cannot connect to backend. Please ensure the backend is running on port 8000.');
      } else {
        alert(`Error analyzing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Header with sidebar trigger */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex flex-1 items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-[#7F1D1D]" />
          <h1 className="text-lg font-semibold">CSV Export Analysis</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
              <CardDescription>
                Scan one or multiple CSV exports for personally identifiable information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-accent/50 hover:bg-accent">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-[#7F1D1D]" />
                    <p className="mb-2 text-sm">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">Multiple CSV files supported</p>
                  </div>
                  <input
                    type="file"
                    accept=".csv"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Selected Files ({selectedFiles.length})</h4>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-accent">
                      <span className="text-sm font-medium">
                        {file.name}
                      </span>
                      <Badge variant="secondary">
                        {(file.size / 1024).toFixed(1)} KB
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* Cost Display */}
              {estimatedCost && (
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Estimated Cost</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Input Tokens: {estimatedCost.input_tokens}</div>
                    <div>Output Tokens: {estimatedCost.output_tokens}</div>
                    <div>Total Cost: ${estimatedCost.total_cost_usd?.toFixed(6)}</div>
                    <div>Total Tokens: {estimatedCost.total_tokens}</div>
                  </div>
                </div>
              )}

              {actualCost && (
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <h4 className="text-sm font-semibold text-green-900 mb-2">Actual Cost</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Input Tokens: {actualCost.input_tokens}</div>
                    <div>Output Tokens: {actualCost.output_tokens}</div>
                    <div className="font-bold">Total Cost: ${actualCost.total_cost_usd?.toFixed(6)}</div>
                    <div>Total Tokens: {actualCost.total_tokens}</div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleAnalyze}
                disabled={selectedFiles.length === 0 || isAnalyzing}
                className="w-full bg-[#7F1D1D] hover:bg-[#5F1515] text-white"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze CSV'}
              </Button>
            </CardContent>
          </Card>

          {/* Combined Results */}
          {results && (
            <>
              {/* Overall Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Overall Analysis Summary</CardTitle>
                  <CardDescription>
                    Combined results across {results.summary.total_files} file{results.summary.total_files > 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-4 rounded-lg border">
                      <div className="text-2xl font-bold text-blue-600">{results.summary.total_files}</div>
                      <div className="text-sm text-muted-foreground">Files Analyzed</div>
                    </div>
                    <div className="text-center p-4 rounded-lg border">
                      <div className="text-2xl font-bold">{Math.round(results.summary.confidence * 100)}%</div>
                      <div className="text-sm text-muted-foreground">Confidence</div>
                    </div>
                    <div className="text-center p-4 rounded-lg border">
                      <Badge variant={results.summary.overall_status === 'SAFE' ? 'secondary' : 'destructive'} className="text-lg px-4 py-2">
                        {results.summary.overall_status === 'SAFE' ? 'SAFE' : 'PII DETECTED'}
                      </Badge>
                    </div>
                    <div className="text-center p-4 rounded-lg border">
                      <div className="text-2xl font-bold text-red-600">{results.summary.pii_columns}</div>
                      <div className="text-sm text-muted-foreground">PII Columns</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Individual File Results */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">File Details</h3>
                {results.files.map((file, index) => (
                  <Card key={index}>
                    <CardHeader 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleFileExpansion(file.filename)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{file.filename}</CardTitle>
                          <CardDescription>
                            {file.summary.total_columns} columns • {file.summary.pii_columns} PII detected
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={file.summary.overall_status === 'SAFE' ? 'secondary' : 'destructive'}>
                            {file.summary.overall_status === 'SAFE' ? 'SAFE' : 'PII DETECTED'}
                          </Badge>
                          <div className="text-sm font-medium">{Math.round(file.summary.confidence * 100)}%</div>
                          <div className="text-sm">
                            {expandedFiles.has(file.filename) ? '▼' : '▶'}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {expandedFiles.has(file.filename) && (
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b">
                                <th className="px-4 py-2 text-left font-medium">Column</th>
                                <th className="px-4 py-2 text-left font-medium">Status</th>
                                <th className="px-4 py-2 text-left font-medium">Confidence</th>
                                <th className="px-4 py-2 text-left font-medium">Reasoning</th>
                              </tr>
                            </thead>
                            <tbody>
                              {file.columns.map((column, colIndex) => (
                                <tr key={colIndex} className="border-b hover:bg-muted/50">
                                  <td className="px-4 py-2 font-medium">
                                    {column.column_name}
                                  </td>
                                  <td className="px-4 py-2">
                                    <Badge variant={column.is_pii ? "destructive" : "secondary"}>
                                      {column.is_pii ? 'PII Detected' : 'Safe'}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-2">
                                    {Math.round(column.confidence * 100)}%
                                  </td>
                                  <td className="px-4 py-2 text-sm text-muted-foreground">
                                    {column.reasoning}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}