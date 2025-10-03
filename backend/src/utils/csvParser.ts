// CSV parsing utility to replace pandas functionality

import csv from 'csv-parser';
import { Readable } from 'stream';

export class CSVParser {
  /**
   * Parse CSV buffer into structured data similar to pandas DataFrame
   */
  public static async parseCSV(csvBuffer: Buffer): Promise<Record<string, any[]>> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = Readable.from(csvBuffer.toString());

      stream
        .pipe(csv())
        .on('data', (data) => {
          results.push(data);
        })
        .on('end', () => {
          // Convert array of objects to object of arrays (like pandas columns)
          const columns: Record<string, any[]> = {};
          
          if (results.length === 0) {
            resolve(columns);
            return;
          }

          // Initialize columns
          const columnNames = Object.keys(results[0]);
          columnNames.forEach(col => {
            columns[col] = [];
          });

          // Fill columns with data
          results.forEach(row => {
            columnNames.forEach(col => {
              columns[col].push(row[col]);
            });
          });

          resolve(columns);
        })
        .on('error', (error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        });
    });
  }

  /**
   * Validate CSV structure and size
   */
  public static validateCSV(csvBuffer: Buffer): { valid: boolean; error?: string } {
    try {
      const csvString = csvBuffer.toString();
      
      // Check file size (limit to 10MB)
      if (csvBuffer.length > 10 * 1024 * 1024) {
        return { valid: false, error: 'CSV file too large (max 10MB)' };
      }

      // Check if it looks like CSV
      const lines = csvString.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        return { valid: false, error: 'CSV must have at least header and one data row' };
      }

      // Basic CSV format check
      const firstLine = lines[0];
      if (!firstLine.includes(',') && !firstLine.includes('\t')) {
        return { valid: false, error: 'File does not appear to be a valid CSV' };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, error: `CSV validation error: ${error instanceof Error ? error.message : String(error)}` };
    }
  }
}