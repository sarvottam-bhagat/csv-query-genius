import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Database, ChevronDown, ChevronRight } from 'lucide-react';

interface DataPreviewProps {
  tableInfo: {
    table_name: string;
    column_descriptions: Record<string, string>;
    sample_data: Record<string, any>[];
  } | null;
}

export const DataPreview: React.FC<DataPreviewProps> = ({ tableInfo }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!tableInfo) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="w-full bg-card/50 backdrop-blur-sm border-ice-blue/20 shadow-card animate-slide-up">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gradient-ice transition-all duration-300">
            <CardTitle className="flex items-center justify-between text-frost-white">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-ice-blue" />
                Data Preview
              </div>
              <Button variant="ghost" size="sm">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-ice-blue" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-ice-blue" />
                )}
              </Button>
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              View your data structure and sample rows
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Schema Information */}
            <div>
              <h3 className="text-lg font-semibold text-frost-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-ice-blue rounded-full animate-ice-pulse"></span>
                Table Schema
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(tableInfo.column_descriptions).map(([column, type]) => (
                  <div
                    key={column}
                    className="flex justify-between items-center p-3 bg-gradient-steel rounded-lg border border-steel-gray/30"
                  >
                    <span className="font-medium text-frost-white">{column}</span>
                    <span className="text-ice-blue text-sm bg-winter-night px-2 py-1 rounded">
                      {type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Data */}
            <div>
              <h3 className="text-lg font-semibold text-frost-white mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-ice-blue rounded-full animate-ice-pulse"></span>
                Sample Data
              </h3>
              <div className="rounded-lg border border-ice-blue/20 bg-gradient-night overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-ice-blue/20 hover:bg-gradient-ice">
                      {Object.keys(tableInfo.column_descriptions).map((column) => (
                        <TableHead key={column} className="text-ice-blue font-semibold">
                          {column}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableInfo.sample_data.map((row, index) => (
                      <TableRow
                        key={index}
                        className="border-ice-blue/10 hover:bg-gradient-ice transition-colors"
                      >
                        {Object.keys(tableInfo.column_descriptions).map((column) => (
                          <TableCell key={column} className="text-frost-white">
                            {row[column] || '-'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};