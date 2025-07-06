import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileUpload: (file: File, tableInfo: any) => void;
  isLoading: boolean;
  isUploaded: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isLoading, isUploaded }) => {
  const { toast } = useToast();

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File upload triggered');
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', file.name, file.type, file.size);

    if (!file.name.toLowerCase().endsWith('.csv')) {
      console.log('Invalid file type:', file.name);
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    console.log('Starting CSV parsing...');
    const reader = new FileReader();
    
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      toast({
        title: "Error reading file",
        description: "Failed to read the CSV file.",
        variant: "destructive",
      });
    };
    
    reader.onload = (e) => {
      try {
        console.log('File read successfully');
        const csvContent = e.target?.result as string;
        console.log('CSV content length:', csvContent?.length);
        
        if (!csvContent) {
          throw new Error('Empty file content');
        }

        // Handle different line endings and split properly
        const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
        console.log('Lines found:', lines.length);
        
        if (lines.length === 0) {
          throw new Error('No data found in CSV');
        }

        // Parse headers with better CSV handling (handle quoted fields)
        const parseCSVLine = (line: string): string[] => {
          const result = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };

        const headers = parseCSVLine(lines[0]).map(h => 
          h.replace(/^"|"$/g, '').trim().toLowerCase().replace(/\s+/g, '_')
        );
        
        console.log('Headers:', headers);
        
        // Generate sample data with better parsing
        const sampleData = lines.slice(1, Math.min(6, lines.length)).map(line => {
          const values = parseCSVLine(line);
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index]?.replace(/^"|"$/g, '').trim() || '';
          });
          return row;
        }).filter(row => Object.values(row).some(val => val !== ''));

        console.log('Sample data:', sampleData);

        // Detect column types based on sample data
        const detectType = (values: any[]): string => {
          const nonEmptyValues = values.filter(v => v !== '' && v != null);
          if (nonEmptyValues.length === 0) return 'TEXT';
          
          const isNumeric = nonEmptyValues.every(v => !isNaN(Number(v)) && isFinite(Number(v)));
          if (isNumeric) return 'NUMERIC';
          
          const isDate = nonEmptyValues.some(v => !isNaN(Date.parse(v)));
          if (isDate) return 'DATE';
          
          return 'TEXT';
        };

        const columnDescriptions = headers.reduce((acc, header) => {
          const columnValues = sampleData.map(row => row[header]);
          acc[header] = detectType(columnValues);
          return acc;
        }, {} as Record<string, string>);

        const tableInfo = {
          table_name: 'data',
          column_descriptions: columnDescriptions,
          sample_data: sampleData,
          total_rows: lines.length - 1 // Exclude header
        };

        console.log('Table info created:', tableInfo);
        onFileUpload(file, tableInfo);
        
        toast({
          title: "File uploaded successfully!",
          description: `Loaded ${headers.length} columns and ${sampleData.length} sample rows from ${tableInfo.total_rows} total rows.`,
        });
      } catch (error) {
        console.error('CSV parsing error:', error);
        toast({
          title: "Error parsing CSV",
          description: `Failed to parse the CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(file);
  }, [onFileUpload, toast]);

  return (
    <Card className="w-full bg-card/50 backdrop-blur-sm border-ice-blue/20 shadow-card animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-frost-white">
          <Upload className="h-5 w-5 text-ice-blue" />
          Upload Your Data
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Upload a CSV file to start querying your data with natural language
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-ice-blue/30 rounded-lg p-8 transition-all duration-300 hover:border-ice-blue/50 hover:bg-gradient-ice">
          {isUploaded ? (
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4 animate-ice-pulse" />
              <p className="text-frost-white font-medium">Data loaded successfully!</p>
              <p className="text-muted-foreground text-sm mt-2">Ready to query your data</p>
            </div>
          ) : (
            <>
              <FileText className="h-12 w-12 text-ice-blue mb-4 animate-frost-glow" />
              <div className="text-center mb-4">
                <p className="text-frost-white font-medium mb-2">Choose a CSV file</p>
                <p className="text-muted-foreground text-sm">Drag and drop or click to upload</p>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isLoading}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload">
                <Button 
                  variant="ice" 
                  size="lg" 
                  disabled={isLoading}
                  className="cursor-pointer"
                >
                  {isLoading ? 'Processing...' : 'Upload CSV'}
                </Button>
              </label>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};