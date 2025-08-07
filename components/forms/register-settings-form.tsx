'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ChevronRight } from 'lucide-react';

interface RegisterSettingsFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
}

export default function RegisterSettingsForm({
  onSubmit,
  initialData
}: RegisterSettingsFormProps) {
  const [applyToAllEmployees, setApplyToAllEmployees] = useState(false);

  const registerOptions = [
    { id: 'edit-tips', label: 'Edit Tips' },
    { id: 'cash-amounts', label: 'Cash Amounts' },
    { id: 'tax-settings', label: 'Tax Settings' },
    { id: 'discount-amounts', label: 'Discount Amounts' },
    { id: 'complimentary-amounts', label: 'Complimentary amounts' },
    { id: 'on-account', label: 'On account' }
  ];

  const handleSave = () => {
    onSubmit({
      applyToAllEmployees,
      registerOptions
    });
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="grid grid-cols-2 gap-8">
        {/* Left side - Custom Register */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Register</CardTitle>
            <p className="text-sm text-muted-foreground">
              Select what you want displayed in your register. You can simply
              turn features on and off to suit your business needs.
            </p>
          </CardHeader>
          <Separator className="my-2" />
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="apply-all">
                  Apply these settings to all employees
                </Label>
                <Switch
                  id="apply-all"
                  checked={applyToAllEmployees}
                  onCheckedChange={setApplyToAllEmployees}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right side - Tabs */}
        <div>
          <Tabs defaultValue="register" className="w-full">
            <TabsList className="mb-8 grid w-full grid-cols-2">
              <TabsTrigger value="register">Register Settings</TabsTrigger>
              <TabsTrigger value="cash">Cash Drawer</TabsTrigger>
            </TabsList>

            <TabsContent value="register">
              <Card>
                <CardContent className="space-y-4 pt-6">
                  {registerOptions.map((option) => (
                    <div
                      key={option.id}
                      className="flex cursor-pointer items-center justify-between rounded-lg bg-secondary/20 p-4 transition-colors hover:bg-secondary/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-destructive/20 text-destructive">
                          <div className="h-4 w-4" />
                        </div>
                        <span>{option.label}</span>
                      </div>
                      <ChevronRight className="text-muted-foreground" />
                    </div>
                  ))}

                  <div className="mt-8 flex justify-between">
                    <Button variant="outline">Preview Register</Button>
                    <Button onClick={handleSave}>Save</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
