'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true,
    analytical: false,
    other: false
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const acceptAllCookies = () => {
    localStorage.setItem(
      'cookie-consent',
      JSON.stringify({ ...cookiePreferences, analytical: true, other: true })
    );
    setShowConsent(false);
  };

  const denyAllCookies = () => {
    localStorage.setItem(
      'cookie-consent',
      JSON.stringify({ ...cookiePreferences, analytical: false, other: false })
    );
    setShowConsent(false);
  };

  const saveSettings = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(cookiePreferences));
    setShowSettings(false);
    setShowConsent(false);
  };

  const CookieSettings = () => (
    <Dialog open={showSettings} onOpenChange={setShowSettings}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cookie settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="necessary">Necessary cookies</Label>
            <Switch
              id="necessary"
              checked={cookiePreferences.necessary}
              disabled
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="analytical">Analytical cookies</Label>
            <Switch
              id="analytical"
              checked={cookiePreferences.analytical}
              onCheckedChange={(checked) =>
                setCookiePreferences({
                  ...cookiePreferences,
                  analytical: checked
                })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="other">Other cookies</Label>
            <Switch
              id="other"
              checked={cookiePreferences.other}
              onCheckedChange={(checked) =>
                setCookiePreferences({ ...cookiePreferences, other: checked })
              }
            />
          </div>
        </div>
        <Button onClick={saveSettings}>Save settings</Button>
      </DialogContent>
    </Dialog>
  );

  if (!showConsent) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background p-4 shadow-md">
        <div className="container mx-auto">
          <h2 className="mb-2 text-lg font-semibold">
            About cookies on this site
          </h2>
          <p className="mb-4 text-sm">
            We use cookies to collect and analyse information on site
            performance and usage, to provide social media features and to
            enhance and customise content and advertisements.{' '}
            <button
              className="text-blue-600 underline"
              onClick={() => setShowSettings(true)}
            >
              Learn more
            </button>
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={denyAllCookies}>
              Deny all
            </Button>
            <Button variant="outline" onClick={() => setShowSettings(true)}>
              Cookie settings
            </Button>
            <Button onClick={acceptAllCookies}>Allow all cookies</Button>
          </div>
        </div>
      </div>
      <CookieSettings />
    </>
  );
}
