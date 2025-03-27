
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wrench } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { setupDatabaseFunctions } from '@/utils/setupDatabaseFunctions';

/**
 * Component to initialize the database functions system
 */
const DatabaseSetup: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  
  const handleSetup = async () => {
    setIsLoading(true);
    try {
      const result = await setupDatabaseFunctions();
      
      if (result.success) {
        toast({
          title: 'Setup Successful',
          description: result.message,
          variant: 'default',
        });
        setIsSetup(true);
      } else {
        toast({
          title: 'Setup Failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="border rounded-lg p-4 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
      <div className="flex items-start gap-3">
        <Wrench className="h-6 w-6 text-orange-500 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-orange-800 dark:text-orange-300">Database Function Setup</h3>
          <p className="mt-1 text-sm text-orange-700 dark:text-orange-400">
            Initialize the database functions system. This needs to be done once before using the other maintenance tools.
          </p>
          
          {isSetup ? (
            <div className="mt-2 p-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded">
              Function system initialized successfully.
            </div>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSetup}
              disabled={isLoading}
              className="mt-3 bg-white dark:bg-gray-800"
            >
              {isLoading ? 'Setting up...' : 'Initialize Function System'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseSetup;
