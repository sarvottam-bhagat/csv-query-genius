// Simple in-memory database simulation using SQL.js would be ideal,
// but for this demo we'll create a simpler query executor that works with our data

interface TableInfo {
  table_name: string;
  column_descriptions: Record<string, string>;
  sample_data: Record<string, any>[];
  total_rows?: number;
}

export class DatabaseService {
  private data: Record<string, any>[] = [];
  private tableName = 'data';

  loadData(tableInfo: TableInfo, csvData: Record<string, any>[]) {
    this.data = csvData;
    this.tableName = tableInfo.table_name;
  }

  executeQuery(sqlQuery: string): any[] {
    try {
      // This is a simplified query executor for demo purposes
      // In a real app, you'd use SQL.js or similar
      
      const upperQuery = sqlQuery.toUpperCase().trim();
      
      // Handle COUNT queries
      if (upperQuery.includes('COUNT(*)')) {
        return [{ count: this.data.length }];
      }
      
      // Handle SELECT * queries
      if (upperQuery.includes('SELECT *')) {
        let result = [...this.data];
        
        // Handle LIMIT
        const limitMatch = upperQuery.match(/LIMIT\s+(\d+)/);
        if (limitMatch) {
          const limit = parseInt(limitMatch[1]);
          result = result.slice(0, limit);
        }
        
        return result;
      }
      
      // Handle SELECT with specific columns
      const selectMatch = sqlQuery.match(/SELECT\s+(.+?)\s+FROM/i);
      if (selectMatch) {
        const columns = selectMatch[1].split(',').map(col => col.trim());
        let result = this.data.map(row => {
          const newRow: any = {};
          columns.forEach(col => {
            if (col === '*') {
              Object.assign(newRow, row);
            } else {
              // Handle functions like COUNT, MAX, MIN, AVG
              if (col.includes('COUNT(')) {
                newRow['count'] = this.data.length;
              } else if (col.includes('MAX(')) {
                const field = col.match(/MAX\(([^)]+)\)/i)?.[1];
                if (field) {
                  const values = this.data.map(r => Number(r[field])).filter(v => !isNaN(v));
                  newRow['max_' + field] = Math.max(...values);
                }
              } else if (col.includes('MIN(')) {
                const field = col.match(/MIN\(([^)]+)\)/i)?.[1];
                if (field) {
                  const values = this.data.map(r => Number(r[field])).filter(v => !isNaN(v));
                  newRow['min_' + field] = Math.min(...values);
                }
              } else if (col.includes('AVG(')) {
                const field = col.match(/AVG\(([^)]+)\)/i)?.[1];
                if (field) {
                  const values = this.data.map(r => Number(r[field])).filter(v => !isNaN(v));
                  newRow['avg_' + field] = values.reduce((a, b) => a + b, 0) / values.length;
                }
              } else {
                // Regular column
                const cleanCol = col.replace(/`/g, '').trim();
                if (row[cleanCol] !== undefined) {
                  newRow[cleanCol] = row[cleanCol];
                }
              }
            }
          });
          return newRow;
        });
        
        // Handle WHERE clauses (basic)
        const whereMatch = upperQuery.match(/WHERE\s+(.+?)(?:\s+ORDER|\s+GROUP|\s+LIMIT|$)/i);
        if (whereMatch) {
          const whereClause = whereMatch[1].trim();
          console.log('🔍 WHERE clause:', whereClause);
          
          result = result.filter(row => {
            // Very basic WHERE clause handling
            // In a real app, you'd use a proper SQL parser
            const conditions = whereClause.split(/\s+AND\s+/i);
            return conditions.every(condition => {
              console.log('🔍 Processing condition:', condition);
              
              // Better parsing for conditions with = operator
              const equalMatch = condition.match(/(\w+)\s*=\s*'([^']+)'/i);
              if (equalMatch) {
                const [, field, value] = equalMatch;
                const fieldValue = row[field.trim()];
                console.log('🔍 Comparing:', { field: field.trim(), fieldValue, value });
                return String(fieldValue).trim() === value.trim();
              }
              
              // Fallback to original parsing for other operators
              const [field, operator, value] = condition.split(/\s*(=|!=|<|>|<=|>=|LIKE)\s*/i);
              if (field && operator && value) {
                const fieldValue = row[field.trim()];
                const compareValue = value.replace(/['"]/g, '');
                
                switch (operator.toUpperCase()) {
                  case '=':
                    return String(fieldValue).trim() === compareValue.trim();
                  case '!=':
                    return fieldValue != compareValue;
                  case '>':
                    return Number(fieldValue) > Number(compareValue);
                  case '<':
                    return Number(fieldValue) < Number(compareValue);
                  case '>=':
                    return Number(fieldValue) >= Number(compareValue);
                  case '<=':
                    return Number(fieldValue) <= Number(compareValue);
                  case 'LIKE':
                    const pattern = compareValue.replace(/%/g, '');
                    return String(fieldValue).toLowerCase().includes(pattern.toLowerCase());
                  default:
                    return true;
                }
              }
              return true;
            });
          });
        }
        
        // Handle DISTINCT
        if (upperQuery.includes('DISTINCT')) {
          const seen = new Set();
          result = result.filter(row => {
            const key = JSON.stringify(row);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
        }
        
        // Handle LIMIT
        const limitMatch = upperQuery.match(/LIMIT\s+(\d+)/);
        if (limitMatch) {
          const limit = parseInt(limitMatch[1]);
          result = result.slice(0, limit);
        }
        
        return result;
      }
      
      // Fallback: return all data
      return this.data.slice(0, 10);
      
    } catch (error) {
      console.error('Query execution error:', error);
      throw new Error(`Failed to execute query: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}