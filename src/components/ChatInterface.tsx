import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, User, Bot, Trash2, AlertTriangle } from 'lucide-react';
import { QueryResults } from './QueryResults';
import { useToast } from '@/hooks/use-toast';
import { OpenAIService } from '@/services/openai';
import { DatabaseService } from '@/services/database';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  query?: string;
  results?: any[];
  error?: string;
  timestamp: number;
}

interface ChatInterfaceProps {
  tableInfo: {
    table_name: string;
    column_descriptions: Record<string, string>;
    sample_data: Record<string, any>[];
    total_rows?: number;
  } | null;
  csvData?: Record<string, any>[];
  apiKey: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ tableInfo, csvData = [], apiKey }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const databaseService = useRef(new DatabaseService());
  const openAIService = useRef<OpenAIService | null>(null);

  // Initialize services when data changes
  useEffect(() => {
    if (tableInfo && csvData.length > 0) {
      databaseService.current.loadData(tableInfo, csvData);
    }
    
    if (apiKey) {
      openAIService.current = new OpenAIService(apiKey);
    }
  }, [tableInfo, csvData, apiKey]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !tableInfo || isLoading) return;

    if (!apiKey) {
      toast({
        title: "API Key required",
        description: "Please configure your OpenAI API key first.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      console.log('Generating SQL query for:', input);
      
      // Generate SQL query using OpenAI
      const sqlQuery = await openAIService.current!.generateSQLQuery(tableInfo, input);
      console.log('Generated SQL:', sqlQuery);
      
      // Execute query using our database service
      const results = databaseService.current.executeQuery(sqlQuery);
      console.log('Query results:', results);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I've generated and executed a SQL query for your question:`,
        query: sqlQuery,
        results: results,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      toast({
        title: "Query executed successfully!",
        description: `Found ${results.length} result(s)`,
      });
      
    } catch (error) {
      console.error('Error processing query:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I encountered an error while processing your query:",
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error processing query",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast({
      title: "Chat cleared",
      description: "All messages have been removed.",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!tableInfo) {
    return (
      <Card className="w-full bg-card/50 backdrop-blur-sm border-ice-blue/20 shadow-card">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Upload a CSV file to start chatting with your data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-card/50 backdrop-blur-sm border-ice-blue/20 shadow-card animate-slide-up">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-frost-white">
            <MessageCircle className="h-5 w-5 text-ice-blue animate-frost-glow" />
            Chat with Your Data
            {!apiKey && (
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            )}
          </CardTitle>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearChat}>
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Chat Messages */}
        <ScrollArea ref={scrollAreaRef} className="h-96 w-full rounded-lg border border-ice-blue/20 bg-gradient-night p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Bot className="h-8 w-8 text-ice-blue mx-auto mb-2 animate-ice-pulse" />
                  <p className="text-muted-foreground">Ask me anything about your data!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Try: "How many rows are there?" or "What are the column names?"
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="animate-fade-in">
                  {message.role === 'user' ? (
                    <div className="flex items-start gap-3 justify-end">
                      <div className="bg-gradient-ice rounded-lg p-3 max-w-[80%] border border-ice-blue/30">
                        <p className="text-frost-white">{message.content}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-glow flex items-center justify-center animate-ice-pulse">
                        <Bot className="h-4 w-4 text-winter-night" />
                      </div>
                      <div className="bg-gradient-steel rounded-lg p-3 max-w-[80%] border border-steel-gray/30 space-y-3">
                        <p className="text-frost-white">{message.content}</p>
                        
                        {message.error && (
                          <div className="bg-destructive/20 border border-destructive/30 rounded p-3">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                              <p className="text-destructive text-sm font-medium">Error</p>
                            </div>
                            <p className="text-destructive text-sm mt-1">{message.error}</p>
                          </div>
                        )}
                        
                        {message.query && (
                          <div className="bg-winter-night rounded p-2 border border-ice-blue/20">
                            <p className="text-ice-blue text-xs font-medium mb-1">Generated SQL:</p>
                            <code className="text-ice-blue text-sm">{message.query}</code>
                          </div>
                        )}
                        
                        {message.results && (
                          <QueryResults 
                            results={message.results} 
                            messageId={message.id}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex items-start gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-gradient-glow flex items-center justify-center animate-ice-pulse">
                  <Bot className="h-4 w-4 text-winter-night" />
                </div>
                <div className="bg-gradient-steel rounded-lg p-3 border border-steel-gray/30">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-ice-blue rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-ice-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-ice-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <span className="text-frost-white ml-2">Generating query...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={apiKey ? "Ask a question about your data..." : "Configure API key to start chatting..."}
            disabled={isLoading || !apiKey}
            className="flex-1 bg-winter-night border-ice-blue/30 text-frost-white placeholder:text-muted-foreground focus:border-ice-blue focus:ring-ice-blue"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading || !apiKey}
            variant="dragon"
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};