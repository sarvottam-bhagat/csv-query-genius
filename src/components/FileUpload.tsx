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
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    // Simulate CSV parsing and table info generation
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const lines = csvContent.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
        
        // Generate sample data
        const sampleData = lines.slice(1, 6).map(line => {
          const values = line.split(',');
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index]?.trim() || '';
          });
          return row;
        }).filter(row => Object.values(row).some(val => val !== ''));

        const tableInfo = {
          table_name: 'data',
          column_descriptions: headers.reduce((acc, header) => {
            acc[header] = 'TEXT'; // Simplified - in real app would detect types
            return acc;
          }, {} as Record<string, string>),
          sample_data: sampleData
        };

        onFileUpload(file, tableInfo);
        
        toast({
          title: "File uploaded successfully!",
          description: `Loaded ${headers.length} columns and ${sampleData.length} sample rows.`,
        });
      } catch (error) {
        toast({
          title: "Error parsing CSV",
          description: "Failed to parse the CSV file.",
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