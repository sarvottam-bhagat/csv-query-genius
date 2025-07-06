interface TableInfo {
  table_name: string;
  column_descriptions: Record<string, string>;
  sample_data: Record<string, any>[];
  total_rows?: number;
}

export class OpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private formatTableInfo(tableInfo: TableInfo): string {
    let info = `Table name: ${tableInfo.table_name}\n`;
    info += `Total rows: ${tableInfo.total_rows || 'Unknown'}\n\n`;
    
    info += "Columns and their types:\n";
    for (const [col, dtype] of Object.entries(tableInfo.column_descriptions)) {
      info += `- ${col}: ${dtype}\n`;
    }
    
    info += "\nSample data (first few rows):\n";
    tableInfo.sample_data.slice(0, 3).forEach((row, index) => {
      info += `Row ${index + 1}: ${JSON.stringify(row)}\n`;
    });
    
    return info;
  }

  async generateSQLQuery(tableInfo: TableInfo, question: string): Promise<string> {
    const formattedInfo = this.formatTableInfo(tableInfo);
    
    const prompt = `You are an expert SQL query generator. Given the following table information and question, generate a SQL query that answers the question.

Table Information:
${formattedInfo}

Question: ${question}

Important guidelines:
- Generate only the SQL query without any explanation, markdown formatting, or code blocks
- Use SQLite syntax (this is an in-memory SQLite database)
- Be precise with column names (they are case-sensitive)
- Use appropriate SQL functions and operators
- For text searches, use LIKE with wildcards when appropriate
- For aggregations, include appropriate GROUP BY clauses
- Keep the query efficient and readable

SQL Query:`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const sqlQuery = data.choices[0]?.message?.content?.trim();
      
      if (!sqlQuery) {
        throw new Error('No SQL query generated');
      }

      // Clean the response of any markdown formatting or code blocks
      let cleanedQuery = sqlQuery
        .replace(/```sql\n?/g, '')
        .replace(/```sqlite\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      // Remove any leading/trailing quotes
      cleanedQuery = cleanedQuery.replace(/^['"`]|['"`]$/g, '');

      return cleanedQuery;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  // Test the API key
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}