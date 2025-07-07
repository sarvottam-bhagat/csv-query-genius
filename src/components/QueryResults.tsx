import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Database, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QueryResultsProps {
  results: any[];
  messageId: string;
}

export const QueryResults: React.FC<QueryResultsProps> = ({ results, messageId }) => {
  const { toast } = useToast();
  const [showAll, setShowAll] = useState(false);
  
  const INITIAL_ROWS = 5;
  const displayedResults = showAll ? results : results.slice(0, INITIAL_ROWS);
  const hasMoreRows = results.length > INITIAL_ROWS;

  const downloadCSV = () => {
    if (!results || results.length === 0) return;

    const headers = Object.keys(results[0]);
    const csvContent = [
      headers.join(','),
      ...results.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `query_results_${messageId}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download started",
      description: "Your query results are being downloaded as CSV.",
    });
  };

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-4">
        <Database className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">No results found</p>
      </div>
    );
  }

  const headers = Object.keys(results[0]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-ice-blue font-medium">
          {results.length} result{results.length !== 1 ? 's' : ''} found
          {!showAll && hasMoreRows && ` (showing first ${INITIAL_ROWS})`}
        </span>
        <Button
          onClick={downloadCSV}
          variant="night"
          size="sm"
          className="text-xs"
        >
          <Download className="h-3 w-3 mr-1" />
          Download CSV
        </Button>
      </div>
      
      <div className={`rounded-lg border border-ice-blue/20 bg-winter-night overflow-hidden ${showAll ? 'max-h-64 overflow-y-auto' : ''}`}>
        <Table>
          <TableHeader className="sticky top-0 bg-winter-night z-10">
            <TableRow className="border-ice-blue/20 hover:bg-gradient-ice">
              {headers.map((header) => (
                <TableHead key={header} className="text-ice-blue font-semibold text-xs">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedResults.map((row, index) => (
              <TableRow
                key={index}
                className="border-ice-blue/10 hover:bg-gradient-ice transition-colors"
              >
                {headers.map((header) => (
                  <TableCell key={header} className="text-frost-white text-xs">
                    {row[header] !== null && row[header] !== undefined 
                      ? String(row[header]) 
                      : '-'
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {hasMoreRows && (
        <div className="flex justify-center">
          <Button
            onClick={() => setShowAll(!showAll)}
            variant="night"
            size="sm"
            className="text-xs"
          >
            {showAll ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Show All {results.length} rows
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};