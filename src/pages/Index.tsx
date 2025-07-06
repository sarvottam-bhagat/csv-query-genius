import React, { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { DataPreview } from '@/components/DataPreview';
import { ChatInterface } from '@/components/ChatInterface';
import { ApiKeySetup } from '@/components/ApiKeySetup';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sword, Snowflake, Crown } from 'lucide-react';
import iceDragonBg from '@/assets/ice-dragon-bg.png';

interface TableInfo {
  table_name: string;
  column_descriptions: Record<string, string>;
  sample_data: Record<string, any>[];
  total_rows?: number;
}

const Index = () => {
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null);
  const [csvData, setCsvData] = useState<Record<string, any>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const handleFileUpload = (file: File, tableData: TableInfo) => {
    setIsLoading(true);
    
    // Parse the full CSV data for the database
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
        
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
        
        const fullData = lines.slice(1).map(line => {
          const values = parseCSVLine(line);
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index]?.replace(/^"|"$/g, '').trim() || '';
          });
          return row;
        }).filter(row => Object.values(row).some(val => val !== ''));

        setCsvData(fullData);
      } catch (error) {
        console.error('Error parsing full CSV:', error);
      }
    };
    
    reader.readAsText(file);
    
    // Set the table info and file
    setTimeout(() => {
      setCurrentFile(file);
      setTableInfo(tableData);
      setIsLoading(false);
    }, 1000);
  };

  const resetApp = () => {
    setCurrentFile(null);
    setTableInfo(null);
    setCsvData([]);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${iceDragonBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-winter-night/80 backdrop-blur-sm"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="border-b border-ice-blue/20 bg-card/30 backdrop-blur-md">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-glow flex items-center justify-center animate-ice-pulse">
                  <Sword className="h-6 w-6 text-winter-night" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-frost-white flex items-center gap-2">
                    <Crown className="h-6 w-6 text-ice-blue animate-frost-glow" />
                    Text to SQL Assistant
                    <Snowflake className="h-6 w-6 text-ice-blue animate-frost-glow" />
                  </h1>
                  <p className="text-muted-foreground">
                    Query your CSV data using natural language - powered by winter magic
                  </p>
                </div>
              </div>
              
              {currentFile && (
                <Button onClick={resetApp} variant="night" size="sm">
                  <Snowflake className="h-4 w-4 mr-2" />
                  New Session
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Step 0: API Key Setup */}
            <div className="animate-slide-up">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-glow flex items-center justify-center">
                  <span className="text-winter-night font-bold text-sm">0</span>
                </div>
                <h2 className="text-xl font-semibold text-frost-white">Configure AI Engine</h2>
              </div>
              <ApiKeySetup onApiKeySet={setApiKey} />
            </div>

            {/* Step 1: File Upload */}
            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-glow flex items-center justify-center">
                  <span className="text-winter-night font-bold text-sm">1</span>
                </div>
                <h2 className="text-xl font-semibold text-frost-white">Upload Your Data</h2>
              </div>
              <FileUpload
                onFileUpload={handleFileUpload}
                isLoading={isLoading}
                isUploaded={!!currentFile}
              />
            </div>

            {/* Step 2: Data Preview */}
            {tableInfo && (
              <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-glow flex items-center justify-center animate-ice-pulse">
                    <span className="text-winter-night font-bold text-sm">2</span>
                  </div>
                  <h2 className="text-xl font-semibold text-frost-white">Review Your Data</h2>
                </div>
                <DataPreview tableInfo={tableInfo} />
              </div>
            )}

            {/* Step 3: Chat Interface */}
            {tableInfo && (
              <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-glow flex items-center justify-center animate-ice-pulse">
                    <span className="text-winter-night font-bold text-sm">3</span>
                  </div>
                  <h2 className="text-xl font-semibold text-frost-white">Ask Questions</h2>
                </div>
                <ChatInterface 
                  tableInfo={tableInfo} 
                  csvData={csvData}
                  apiKey={apiKey}
                />
              </div>
            )}

            {/* Welcome Message */}
            {!currentFile && (
              <Card className="bg-card/30 backdrop-blur-sm border-ice-blue/20 shadow-card animate-fade-in">
                <CardContent className="text-center py-12">
                  <div className="max-w-2xl mx-auto">
                    <div className="mb-6">
                      <Sword className="h-16 w-16 text-ice-blue mx-auto mb-4 animate-frost-glow" />
                    </div>
                    <h3 className="text-2xl font-bold text-frost-white mb-4">
                      Welcome to the Winter Realm of Data
                    </h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      Harness the power of ancient magic to query your CSV data using natural language. 
                      Upload your data scroll and let the spirits of the North guide you through your data journey.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div className="p-4 bg-gradient-ice rounded-lg border border-ice-blue/30">
                        <Crown className="h-6 w-6 text-ice-blue mx-auto mb-2" />
                        <p className="text-frost-white font-medium">Configure AI</p>
                        <p className="text-muted-foreground">Set your magic key</p>
                      </div>
                      <div className="p-4 bg-gradient-ice rounded-lg border border-ice-blue/30">
                        <Crown className="h-6 w-6 text-ice-blue mx-auto mb-2" />
                        <p className="text-frost-white font-medium">Upload CSV</p>
                        <p className="text-muted-foreground">Begin your quest</p>
                      </div>
                      <div className="p-4 bg-gradient-ice rounded-lg border border-ice-blue/30">
                        <Snowflake className="h-6 w-6 text-ice-blue mx-auto mb-2" />
                        <p className="text-frost-white font-medium">Ask Questions</p>
                        <p className="text-muted-foreground">Speak your intent</p>
                      </div>
                      <div className="p-4 bg-gradient-ice rounded-lg border border-ice-blue/30">
                        <Sword className="h-6 w-6 text-ice-blue mx-auto mb-2" />
                        <p className="text-frost-white font-medium">Get Results</p>
                        <p className="text-muted-foreground">Claim your insights</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-ice-blue/20 bg-card/30 backdrop-blur-md mt-16">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">
                "Winter is coming, and with it, the power to understand your data." 
                <span className="text-ice-blue"> - The Three-Eyed Query</span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
