import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlatform } from '@/contexts/PlatformContext';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { platformAPI } from '@/services/api';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { refreshPlatformSettings } = usePlatform();
  
  // Platform configuration state
  const [platformName, setPlatformName] = useState('EMSI Share');
  const [platformLogo, setPlatformLogo] = useState(null);
  const [databaseStats, setDatabaseStats] = useState({
    used: 1.2, // GB
    total: 5, // GB
    resources: {
      documents: 450, // MB
      videos: 650, // MB
      images: 80, // MB
      code: 20, // MB
    },
    pageSizes: {
      resources: 20,
      forumPosts: 15,
      events: 10,
      users: 25
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Load settings from database on component mount
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        // Load platform settings from API
        const settings = await platformAPI.getSettings();
        if (settings) {
          // Update platform name
          if (settings.platformName) {
            setPlatformName(settings.platformName);
          }
          
          // Update page sizes
          if (settings.pageSizes) {
            setDatabaseStats(prev => ({
              ...prev,
              pageSizes: {
                ...prev.pageSizes,
                ...settings.pageSizes
              }
            }));
          }
          
          // Update general settings
          if (settings.generalSettings) {
            // Set form values
            if (document.getElementById('enable-registration')) {
              (document.getElementById('enable-registration') as HTMLInputElement).checked = 
                settings.generalSettings.enableRegistration;
            }
            
            if (document.getElementById('maintenance-mode')) {
              (document.getElementById('maintenance-mode') as HTMLInputElement).checked = 
                settings.generalSettings.maintenanceMode;
            }
            
            if (document.getElementById('public-profiles')) {
              (document.getElementById('public-profiles') as HTMLInputElement).checked = 
                settings.generalSettings.publicProfiles;
            }
          }
          
          // Update security settings
          if (settings.securitySettings) {
            if (document.getElementById('password-policy')) {
              (document.getElementById('password-policy') as HTMLInputElement).checked = 
                settings.securitySettings.passwordPolicy;
            }
            
            if (document.getElementById('session-timeout')) {
              (document.getElementById('session-timeout') as HTMLInputElement).checked = 
                settings.securitySettings.sessionTimeout;
            }
          }
          
          // Load platform logo
          if (settings.logo) {
            setPlatformLogo(settings.logo);
          }
        }
        
        // Load database stats
        const stats = await platformAPI.getDatabaseStats();
        if (stats) {
          setDatabaseStats(prev => ({
            ...prev,
            used: stats.used || prev.used,
            total: stats.total || prev.total,
            resources: {
              ...prev.resources,
              ...stats.resources
            }
          }));
        }
      } catch (error) {
        console.error('Error loading platform settings:', error);
        toast({
          title: "Error loading settings",
          description: "Could not load platform settings from the database.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Prepare settings to save to database
      const settingsToSave = {
        platformName,
        pageSizes: databaseStats.pageSizes,
        generalSettings: {
          enableRegistration: true,
          maintenanceMode: false,
          publicProfiles: true,
        },
        securitySettings: {
          passwordPolicy: true,
          sessionTimeout: true,
        }
      };
      
      // Save settings to database
      await platformAPI.updateSettings(settingsToSave);
      
      // Save logo separately if it exists
      if (platformLogo) {
        await platformAPI.uploadLogo(platformLogo);
      }
      
      // Refresh platform settings in context to update all components
      await refreshPlatformSettings();
      
      toast({
        title: "Settings saved",
        description: "Your changes have been successfully saved to the database and will be applied for all users.",
      });
      
      // Reload the page to ensure all components get the new settings
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error saving settings",
        description: "Failed to save settings to the database. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.role !== 'admin' && user?.role !== 'administration') {
    return (
      <MainLayout>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">
            Configure system-wide settings and preferences.
          </p>
        </div>

        <Tabs defaultValue="platform">
          <TabsList className="grid w-full md:w-auto grid-cols-1 md:grid-cols-1">
            <TabsTrigger value="platform">Platform</TabsTrigger>
          </TabsList>
          
          <TabsContent value="platform" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Configuration</CardTitle>
                <CardDescription>
                  Configure platform settings and appearance.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {/* Platform Name */}
                  <div className="grid gap-2">
                    <Label htmlFor="platform-name">Platform Name</Label>
                    <input
                      id="platform-name"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={platformName}
                      onChange={(e) => setPlatformName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  
                  {/* Platform Logo */}
                  <div className="grid gap-2">
                    <Label htmlFor="platform-logo">Platform Logo</Label>
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-md border border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                        {platformLogo ? (
                          <img 
                            src={platformLogo} 
                            alt="Platform Logo" 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                            <circle cx="9" cy="9" r="2" />
                            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          id="logo-upload"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setPlatformLogo(event.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          disabled={isLoading}
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => document.getElementById('logo-upload')?.click()}
                          disabled={isLoading}
                        >
                          Upload Logo
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Database Size */}
                  <div className="grid gap-2">
                    <Label>Database Size</Label>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Used: {databaseStats.used} GB</span>
                        <span className="text-sm font-medium">Total: {databaseStats.total} GB</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${(databaseStats.used / databaseStats.total) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Resource Type Sizes */}
                  <div className="grid gap-2">
                    <Label>Resource Type Usage</Label>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Documents</span>
                          <span className="text-sm font-medium">{databaseStats.resources.documents} MB</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(databaseStats.resources.documents / 1000) * 100}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Videos</span>
                          <span className="text-sm font-medium">{databaseStats.resources.videos} MB</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(databaseStats.resources.videos / 1000) * 100}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Images</span>
                          <span className="text-sm font-medium">{databaseStats.resources.images} MB</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(databaseStats.resources.images / 1000) * 100}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Code</span>
                          <span className="text-sm font-medium">{databaseStats.resources.code} MB</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(databaseStats.resources.code / 1000) * 100}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Page Size Limits */}
                  <div className="grid gap-2">
                    <Label>Page Size Limits</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                        <span className="text-sm font-medium">Resources per page</span>
                        <input 
                          type="number" 
                          min="5" 
                          max="100" 
                          value={databaseStats.pageSizes.resources} 
                          onChange={(e) => setDatabaseStats(prev => ({
                            ...prev, 
                            pageSizes: {
                              ...prev.pageSizes,
                              resources: parseInt(e.target.value) || 20
                            }
                          }))}
                          className="w-16 text-right p-1 rounded border"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                        <span className="text-sm font-medium">Forum posts per page</span>
                        <input 
                          type="number" 
                          min="5" 
                          max="100" 
                          value={databaseStats.pageSizes.forumPosts} 
                          onChange={(e) => setDatabaseStats(prev => ({
                            ...prev, 
                            pageSizes: {
                              ...prev.pageSizes,
                              forumPosts: parseInt(e.target.value) || 15
                            }
                          }))}
                          className="w-16 text-right p-1 rounded border"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                        <span className="text-sm font-medium">Events per page</span>
                        <input 
                          type="number" 
                          min="5" 
                          max="100" 
                          value={databaseStats.pageSizes.events} 
                          onChange={(e) => setDatabaseStats(prev => ({
                            ...prev, 
                            pageSizes: {
                              ...prev.pageSizes,
                              events: parseInt(e.target.value) || 10
                            }
                          }))}
                          className="w-16 text-right p-1 rounded border"
                          disabled={isLoading}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                        <span className="text-sm font-medium">Users per page</span>
                        <input 
                          type="number" 
                          min="5" 
                          max="100" 
                          value={databaseStats.pageSizes.users} 
                          onChange={(e) => setDatabaseStats(prev => ({
                            ...prev, 
                            pageSizes: {
                              ...prev.pageSizes,
                              users: parseInt(e.target.value) || 25
                            }
                          }))}
                          className="w-16 text-right p-1 rounded border"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;