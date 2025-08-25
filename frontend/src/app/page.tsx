'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Upload, FileSpreadsheet } from "lucide-react";

export interface ColumnAnalysis {
  column_name: string;
  sample_values: string[];
  is_pii: boolean;
  confidence: number;
  reasoning: string;
}

export default function Home() {
  const [results, setResults] = useState<ColumnAnalysis[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [estimatedCost, setEstimatedCost] = useState<any>(null);
  const [actualCost, setActualCost] = useState<any>(null);

  const estimateCost = async (file: File) => {
    try {
      // Parse CSV to estimate column count
      const text = await file.text();
      const lines = text.split('\n');
      const columnCount = lines[0]?.split(',').length || 1;
      
      const response = await fetch('http://localhost:8000/estimate-cost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          column_count: columnCount,
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
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setEstimatedCost(null);
      setActualCost(null);
      estimateCost(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

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
      // Handle new API response format with columns and total_cost_info
      const results = data.columns || data;
      setResults(results);
      
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
                Scan your CSV exports for personally identifiable information
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
                    <p className="text-xs text-muted-foreground">CSV files only</p>
                  </div>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {selectedFile && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-accent">
                  <span className="text-sm font-medium">
                    {selectedFile.name}
                  </span>
                  <Badge variant="secondary">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </Badge>
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
                disabled={!selectedFile || isAnalyzing}
                className="w-full bg-[#7F1D1D] hover:bg-[#5F1515] text-white"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze CSV'}
              </Button>
            </CardContent>
          </Card>

          {/* Results Card */}
          {results && (
            <Card>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription>
                  PII detection results for your CSV file
                </CardDescription>
              </CardHeader>
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
                      {results.map((result, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="px-4 py-2 font-medium">
                            {result.column_name}
                          </td>
                          <td className="px-4 py-2">
                            <Badge variant={result.is_pii ? "destructive" : "secondary"}>
                              {result.is_pii ? 'PII Detected' : 'Safe'}
                            </Badge>
                          </td>
                          <td className="px-4 py-2">
                            {Math.round(result.confidence * 100)}%
                          </td>
                          <td className="px-4 py-2 text-sm text-muted-foreground">
                            {result.reasoning}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}