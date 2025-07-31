'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, ShieldAlert, Info } from 'lucide-react';
import { ColumnAnalysis } from '@/app/page';

interface ResultsTableProps {
  results: ColumnAnalysis[];
}

export function ResultsTable({ results }: ResultsTableProps) {
  const piiCount = results.filter(r => r.is_pii).length;
  const totalCount = results.length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Total Columns</p>
                <p className="text-2xl font-bold">{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">PII Detected</p>
                <p className="text-2xl font-bold text-red-600">{piiCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-500">Safe Columns</p>
                <p className="text-2xl font-bold text-green-600">{totalCount - piiCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left p-4 font-medium text-gray-700 dark:text-gray-300">
                Column Name
              </th>
              <th className="text-left p-4 font-medium text-gray-700 dark:text-gray-300">
                Status
              </th>
              <th className="text-left p-4 font-medium text-gray-700 dark:text-gray-300">
                Confidence
              </th>
              <th className="text-left p-4 font-medium text-gray-700 dark:text-gray-300">
                Sample Values
              </th>
              <th className="text-left p-4 font-medium text-gray-700 dark:text-gray-300">
                Reasoning
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    {result.is_pii ? (
                      <ShieldAlert className="h-4 w-4 text-red-500" />
                    ) : (
                      <Shield className="h-4 w-4 text-green-500" />
                    )}
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {result.column_name}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <Badge variant={result.is_pii ? 'destructive' : 'secondary'}>
                    {result.is_pii ? 'PII Detected' : 'Safe'}
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          result.confidence > 0.7
                            ? 'bg-red-500'
                            : result.confidence > 0.4
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${result.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {Math.round(result.confidence * 100)}%
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="space-y-1">
                    {result.sample_values.slice(0, 3).map((value, i) => (
                      <div
                        key={i}
                        className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded max-w-xs truncate"
                      >
                        {value}
                      </div>
                    ))}
                    {result.sample_values.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{result.sample_values.length - 3} more...
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                    {result.reasoning}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}