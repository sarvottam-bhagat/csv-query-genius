import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Key, Settings, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiKeySetupProps {
  onApiKeySet: (apiKey: string) => void;
}

export const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if API key is already stored
    const storedKey = localStorage.getItem('openai_api_key');
    if (storedKey) {
      setHasStoredKey(true);
      onApiKeySet(storedKey);
    }
  }, [onApiKeySet]);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key required",
        description: "Please enter your OpenAI API key.",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      toast({
        title: "Invalid API Key",
        description: "OpenAI API keys should start with 'sk-'.",
        variant: "destructive",
      });
      return;
    }

    // Store securely in localStorage
    localStorage.setItem('openai_api_key', apiKey);
    setHasStoredKey(true);
    onApiKeySet(apiKey);
    setIsOpen(false);
    setApiKey(''); // Clear input for security
    
    toast({
      title: "API Key saved!",
      description: "Your OpenAI API key has been stored securely in your browser.",
    });
  };

  const handleRemoveApiKey = () => {
    localStorage.removeItem('openai_api_key');
    setHasStoredKey(false);
    onApiKeySet('');
    
    toast({
      title: "API Key removed",
      description: "Your API key has been removed from storage.",
    });
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-ice-blue/20 shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-frost-white">
          <Key className="h-5 w-5 text-ice-blue" />
          OpenAI API Configuration
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Configure your OpenAI API key to enable real SQL query generation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {hasStoredKey ? (
              <>
                <CheckCircle className="h-5 w-5 text-primary animate-ice-pulse" />
                <div>
                  <p className="text-frost-white font-medium">API Key Configured</p>
                  <p className="text-sm text-muted-foreground">Ready for AI-powered queries</p>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-yellow-500 animate-frost-glow" />
                <div>
                  <p className="text-frost-white font-medium">API Key Required</p>
                  <p className="text-sm text-muted-foreground">Add your OpenAI API key to enable AI features</p>
                </div>
              </>
            )}
          </div>
          
          <div className="flex gap-2">
            {hasStoredKey && (
              <Button onClick={handleRemoveApiKey} variant="night" size="sm">
                Remove Key
              </Button>
            )}
            
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="ice" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  {hasStoredKey ? 'Update Key' : 'Add API Key'}
                </Button>
              </DialogTrigger>
              
              <DialogContent className="bg-card border-ice-blue/20">
                <DialogHeader>
                  <DialogTitle className="text-frost-white flex items-center gap-2">
                    <Key className="h-5 w-5 text-ice-blue" />
                    Configure OpenAI API Key
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Your API key will be stored securely in your browser's local storage.
                    It will never be sent to our servers.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="bg-gradient-ice rounded-lg p-4 border border-ice-blue/30">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-ice-blue mt-0.5" />
                      <div className="text-sm">
                        <p className="text-frost-white font-medium mb-1">Security Notice</p>
                        <ul className="text-muted-foreground space-y-1">
                          <li>• Your API key is stored locally in your browser</li>
                          <li>• It's never sent to our servers</li>
                          <li>• Only you have access to it</li>
                          <li>• Clear your browser data to remove it</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-frost-white">
                      OpenAI API Key
                    </label>
                    <Input
                      type="password"
                      placeholder="sk-proj-..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="bg-winter-night border-ice-blue/30 text-frost-white"
                    />
                    <p className="text-xs text-muted-foreground">
                      Get your API key from{' '}
                      <a 
                        href="https://platform.openai.com/api-keys" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-ice-blue hover:underline"
                      >
                        OpenAI Platform
                      </a>
                    </p>
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button onClick={() => setIsOpen(false)} variant="night">
                      Cancel
                    </Button>
                    <Button onClick={handleSaveApiKey} variant="dragon">
                      Save API Key
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};