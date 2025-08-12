"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Check } from 'lucide-react';

const SettingsPage = () => {
  const [selectedTheme, setSelectedTheme] = useState('dark');
  const [websiteName, setWebsiteName] = useState('My Website');
  const [websiteDescription, setWebsiteDescription] = useState('A simple, fast website');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const themes = [
    { 
      id: 'dark', 
      name: 'Dark', 
      colors: ['#000000', '#374151', '#9ca3af'],
      bg: 'bg-black',
      cardBg: 'bg-black',
      border: 'border-gray-800',
      text: 'text-white',
      textSecondary: 'text-gray-400',
      textTertiary: 'text-gray-300',
      inputBg: 'bg-black',
      inputBorder: 'border-gray-800',
      inputFocus: 'focus:border-gray-600',
      hover: 'hover:border-gray-700',
      selectedBg: 'bg-gray-900',
      selectedBorder: 'border-white',
      previewBg: 'bg-gray-950',
      button: 'bg-white text-black hover:bg-gray-200'
    },
    { 
      id: 'gray', 
      name: 'Gray', 
      colors: ['#171717', '#525252', '#a3a3a3'],
      bg: 'bg-neutral-900',
      cardBg: 'bg-neutral-900',
      border: 'border-neutral-700',
      text: 'text-white',
      textSecondary: 'text-neutral-400',
      textTertiary: 'text-neutral-300',
      inputBg: 'bg-neutral-900',
      inputBorder: 'border-neutral-700',
      inputFocus: 'focus:border-neutral-500',
      hover: 'hover:border-neutral-600',
      selectedBg: 'bg-neutral-800',
      selectedBorder: 'border-white',
      previewBg: 'bg-neutral-800',
      button: 'bg-white text-black hover:bg-gray-200'
    },
    { 
      id: 'light', 
      name: 'Light', 
      colors: ['#ffffff', '#e5e7eb', '#6b7280'],
      bg: 'bg-white',
      cardBg: 'bg-white',
      border: 'border-gray-200',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      textTertiary: 'text-gray-700',
      inputBg: 'bg-white',
      inputBorder: 'border-gray-200',
      inputFocus: 'focus:border-gray-400',
      hover: 'hover:border-gray-300',
      selectedBg: 'bg-gray-50',
      selectedBorder: 'border-gray-900',
      previewBg: 'bg-gray-50',
      button: 'bg-black text-white hover:bg-gray-800'
    },
    { 
      id: 'claude', 
      name: 'Claude', 
      colors: ['#ea580c', '#f59e0b', '#fbbf24'],
      bg: 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50',
      cardBg: 'bg-white/80 backdrop-blur-sm shadow-lg shadow-orange-100/50',
      border: 'border-orange-200/60',
      text: 'text-orange-950',
      textSecondary: 'text-orange-700',
      textTertiary: 'text-orange-800',
      inputBg: 'bg-white/90',
      inputBorder: 'border-orange-200/60',
      inputFocus: 'focus:border-orange-400 focus:ring-1 focus:ring-orange-400/30',
      hover: 'hover:border-orange-300/80',
      selectedBg: 'bg-gradient-to-br from-orange-100/80 to-amber-100/80',
      selectedBorder: 'border-orange-500',
      previewBg: 'bg-gradient-to-br from-orange-100/60 to-amber-100/60',
      button: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-200'
    },
  ];

  const currentTheme = themes.find(t => t.id === selectedTheme) || themes[0];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === 'string') {
          setLogoPreview(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${currentTheme.bg} ${currentTheme.text}`}>
      <div className="max-w-2xl mx-auto py-16 px-6">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-2xl font-medium mb-2">Settings</h1>
          <p className={`text-sm ${currentTheme.textSecondary}`}>Manage your website configuration</p>
        </div>

        {/* General Section */}
        <div className="space-y-8">
          <Card className={`${currentTheme.cardBg} border ${currentTheme.border} transition-colors duration-300`}>
            <CardHeader className="pb-4">
              <CardTitle className={`text-lg font-medium ${currentTheme.text}`}>General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Website Name */}
              <div className="space-y-2">
                <Label className={`text-sm ${currentTheme.textTertiary}`}>Website Name</Label>
                <Input
                  value={websiteName}
                  onChange={(e) => setWebsiteName(e.target.value)}
                  className={`${currentTheme.inputBg} ${currentTheme.inputBorder} ${currentTheme.text} ${currentTheme.inputFocus} h-10 transition-colors duration-300`}
                  placeholder="Enter website name"
                />
              </div>

              {/* Website Description */}
              <div className="space-y-2">
                <Label className={`text-sm ${currentTheme.textTertiary}`}>Description</Label>
                <Textarea
                  value={websiteDescription}
                  onChange={(e) => setWebsiteDescription(e.target.value)}
                  className={`${currentTheme.inputBg} ${currentTheme.inputBorder} ${currentTheme.text} ${currentTheme.inputFocus} resize-none h-20 transition-colors duration-300`}
                  placeholder="Enter website description"
                />
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label className={`text-sm ${currentTheme.textTertiary}`}>Logo</Label>
                <div className="relative">
                  <label className={`flex items-center justify-center w-full h-32 border ${currentTheme.border} border-dashed rounded-md cursor-pointer ${currentTheme.hover} transition-colors duration-300 ${currentTheme.inputBg}`}>
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="max-h-20 max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center">
                        <Upload className={`h-6 w-6 mx-auto mb-2 ${currentTheme.textSecondary}`} />
                        <span className={`text-sm ${currentTheme.textSecondary}`}>Upload logo</span>
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageSelect}
                    />
                  </label>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Theme Section */}
          <Card className={`${currentTheme.cardBg} border ${currentTheme.border} transition-colors duration-300`}>
            <CardHeader className="pb-4">
              <CardTitle className={`text-lg font-medium ${currentTheme.text}`}>Theme</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme.id)}
                    className={`relative flex flex-col items-center p-3 rounded-md border transition-colors duration-300 ${
                      selectedTheme === theme.id
                        ? `${currentTheme.selectedBorder} ${currentTheme.selectedBg}`
                        : `${currentTheme.border} ${currentTheme.hover}`
                    }`}
                  >
                    <div className="flex justify-center gap-1 mb-2">
                      {theme.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className={`text-xs ${currentTheme.textTertiary}`}>{theme.name}</span>
                    {selectedTheme === theme.id && (
                      <Check className={`h-3 w-3 absolute top-1 right-1 ${currentTheme.text}`} />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preview Section */}
          <Card className={`${currentTheme.cardBg} border ${currentTheme.border} transition-colors duration-300`}>
            <CardHeader className="pb-4">
              <CardTitle className={`text-lg font-medium ${currentTheme.text}`}>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`border ${currentTheme.border} rounded-md p-6 ${currentTheme.previewBg} transition-colors duration-300`}>
                <div className="flex items-center gap-3 mb-3">
                  {logoPreview && (
                    <img src={logoPreview} alt="Logo" className="h-8 w-8 object-contain" />
                  )}
                  <div>
                    <h3 className={`font-medium ${currentTheme.text}`}>{websiteName}</h3>
                    <p className={`text-sm ${currentTheme.textSecondary}`}>{websiteDescription}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {currentTheme.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-3 h-3 rounded-full border border-white/30"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className={`text-xs ${currentTheme.textSecondary}`}>
                    {currentTheme.name} theme
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Save Button */}
        <div className={`mt-8 pt-6 border-t ${currentTheme.border} transition-colors duration-300`}>
          <Button className={`${currentTheme.button} h-10 px-4 font-medium transition-colors duration-300`}>
            Save Changes
          </Button>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;