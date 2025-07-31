'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { ResultsTable } from '@/components/ResultsTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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

  const handleFileAnalysis = async (file: File) => {
    setIsAnalyzing(true);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/analyze-csv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error analyzing file:', error);
      alert('Error analyzing file. Please make sure the backend is running.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              🔐 PII Detection Tool
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Upload CSV files to scan for personally identifiable information
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Upload CSV File</CardTitle>
              <CardDescription>
                Select a CSV file to analyze for potential PII data in columns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload onFileSelect={handleFileAnalysis} isAnalyzing={isAnalyzing} />
            </CardContent>
          </Card>

          {results && (
            <Card>
              <CardHeader>
                <CardTitle>Analysis Results</CardTitle>
                <CardDescription>
                  PII detection results for each column in your CSV file
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResultsTable results={results} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}