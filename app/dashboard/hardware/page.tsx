'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { usePrinterSettings } from '@/hooks/usePrinterSettings';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Category {
  id: string;
  name: string;
}

interface PrinterConfig {
  printerName: string;
  printerType: string;
  printerIp: string;
  printerCategories: Category[];
  doublePrint: boolean;
}

export default function PrinterSettings() {
  const { data: session } = useSession();
  const {
    printerConfigs,
    savePrinterSettings,
    deletePrinterSettings,
    serverIP,
    setServerIP
  } = usePrinterSettings();
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const { toast } = useToast();

  const [newPrinter, setNewPrinter] = useState<PrinterConfig>({
    printerName: '',
    printerType: '',
    printerIp: '',
    printerCategories: [],
    doublePrint: false
  });

  const [editingPrinter, setEditingPrinter] = useState<string | null>(null);

  useEffect(() => {
    handleFetchItems();
  }, []);

  const handleFetchItems = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}pos/product/menu`,
        {},
        { headers: { Authorization: `Bearer ${session?.user.token}` } }
      );

      const fetchedCategories = response.data.data.menu.map((item: any) => ({
        id: item.id,
        name: item.name
      }));
      setCategories(fetchedCategories);
    } catch (err) {
      console.error('An error occurred:', err);
      toast({
        title: 'Error fetching categories',
        description: 'There was an error fetching the categories.',
        variant: 'destructive'
      });
    }
  };

  const handleTestPrint = async () => {
    if (!selectedPrinter) {
      toast({
        title: 'No printer selected',
        description: 'Please select a printer for the test print.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const testMessage = 'This is a test print.';
      const printerAddress = printerConfigs.find(
        (p) => p.printerName === selectedPrinter
      )?.printerIp;

      if (!printerAddress) {
        throw new Error('Selected printer address not found');
      }

      const printWindow = window.open(
        `http://${serverIP}:3001/test-print?printerIP=${printerAddress}&testString=${testMessage}`,
        '_blank',
        'noopener,noreferrer'
      );
      printWindow?.focus();

      toast({
        title: 'Test print sent',
        description: 'Test print job sent successfully',
        variant: 'success'
      });
    } catch (error) {
      console.error('Test printing error:', error);
      toast({
        title: 'Test print failed',
        description: 'There was an error sending the test print job.',
        variant: 'destructive'
      });
    }
  };

  const handleSavePrinter = () => {
    if (editingPrinter) {
      // Update existing printer
      const updatedConfigs = printerConfigs.map((p) =>
        p.printerName === editingPrinter ? newPrinter : p
      );
      savePrinterSettings(newPrinter, updatedConfigs);
      setEditingPrinter(null);
    } else {
      // Add new printer
      savePrinterSettings(newPrinter);
    }
    setNewPrinter({
      printerName: '',
      printerType: '',
      printerIp: '',
      printerCategories: [],
      doublePrint: false
    });
    toast({
      variant: 'success',
      title: editingPrinter ? 'Printer updated' : 'Printer saved',
      description: editingPrinter
        ? 'The printer has been updated successfully.'
        : 'The printer has been saved successfully.'
    });
  };

  const handleDeletePrinter = (printerIp: string) => {
    deletePrinterSettings(printerIp);
    toast({
      title: 'Printer deleted',
      description: 'The printer has been deleted successfully.',
      variant: 'success'
    });
  };

  const handleSaveServerIP = () => {
    localStorage.setItem('serverIP', serverIP);
    setServerIP(serverIP);
    toast({
      title: 'Server IP saved',
      description: 'The server IP has been saved successfully.',
      variant: 'success'
    });
  };

  const handleEditPrinter = (printerName: string) => {
    const printerToEdit = printerConfigs.find(
      (p) => p.printerName === printerName
    );
    if (printerToEdit) {
      setNewPrinter(printerToEdit);
      setEditingPrinter(printerName);
    }
  };

  return (
    <PageContainer scrollable>
      <h1 className="mb-6 text-2xl font-bold">Printer Settings</h1>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <Card className="order-2 md:order-1">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Total Printers: {printerConfigs.length}</p>
              <p>Server IP: {serverIP || 'Not set'}</p>
              <Button onClick={handleTestPrint} className="mt-4 w-full">
                Quick Test Print
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="order-1 md:order-2">
          <Tabs defaultValue="add-printer" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="add-printer">
                {editingPrinter ? 'Edit Printer' : 'Add Printer'}
              </TabsTrigger>
              <TabsTrigger value="saved-printers">Saved Printers</TabsTrigger>
              <TabsTrigger value="server-settings">Server Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="add-printer">
              <CardHeader>
                <CardTitle>
                  {editingPrinter ? 'Edit Printer' : 'Add New Printer'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSavePrinter();
                  }}
                  className="space-y-4"
                >
                  <Input
                    placeholder="Printer Nickname"
                    value={newPrinter.printerName}
                    onChange={(e) =>
                      setNewPrinter({
                        ...newPrinter,
                        printerName: e.target.value
                      })
                    }
                    required
                  />
                  <Input
                    placeholder="Printer IP"
                    value={newPrinter.printerIp}
                    onChange={(e) =>
                      setNewPrinter({
                        ...newPrinter,
                        printerIp: e.target.value
                      })
                    }
                    required
                  />
                  <Select
                    value={newPrinter.printerType}
                    onValueChange={(value) =>
                      setNewPrinter({ ...newPrinter, printerType: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select printer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="order">Order</SelectItem>
                      <SelectItem value="bill">Bill</SelectItem>
                      <SelectItem value="orderAndBill">
                        Order and Bill
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">Categories</h3>
                    <ScrollArea className="h-40 rounded-md border p-2">
                      <div className="grid grid-cols-2 gap-2">
                        {categories.map((category) => (
                          <div
                            key={category.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`category-${category.id}`}
                              checked={newPrinter.printerCategories.some(
                                (c) => c.id === category.id
                              )}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setNewPrinter({
                                    ...newPrinter,
                                    printerCategories: [
                                      ...newPrinter.printerCategories,
                                      category
                                    ]
                                  });
                                } else {
                                  setNewPrinter({
                                    ...newPrinter,
                                    printerCategories:
                                      newPrinter.printerCategories.filter(
                                        (c) => c.id !== category.id
                                      )
                                  });
                                }
                              }}
                            />
                            <label htmlFor={`category-${category.id}`}>
                              {category.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="doublePrint"
                      checked={newPrinter.doublePrint}
                      onCheckedChange={(checked) =>
                        setNewPrinter({
                          ...newPrinter,
                          doublePrint: checked as boolean
                        })
                      }
                    />
                    <label htmlFor="doublePrint">Double Print</label>
                  </div>
                  <Button type="submit" className="w-full">
                    {editingPrinter ? 'Update Printer' : 'Save Printer'}
                  </Button>
                  {editingPrinter && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setEditingPrinter(null);
                        setNewPrinter({
                          printerName: '',
                          printerType: '',
                          printerIp: '',
                          printerCategories: [],
                          doublePrint: false
                        });
                      }}
                    >
                      Cancel Edit
                    </Button>
                  )}
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="saved-printers">
              <CardHeader>
                <CardTitle>Saved Printers</CardTitle>
              </CardHeader>
              <CardContent>
                {printerConfigs.length > 0 ? (
                  <div className="space-y-4">
                    {printerConfigs.map((printer, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold">
                                {printer.printerName}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {printer.printerIp}
                              </p>
                            </div>
                            <Badge>{printer.printerType}</Badge>
                          </div>
                          <Separator className="my-2" />
                          <p className="text-sm">
                            <strong>Categories:</strong>{' '}
                            {printer.printerCategories
                              .map((c) => c.name)
                              .join(', ')}
                          </p>
                          <p className="text-sm">
                            <strong>Double Print:</strong>{' '}
                            {printer.doublePrint ? 'Yes' : 'No'}
                          </p>
                          <div className="mt-4 flex space-x-2">
                            <Button
                              onClick={() =>
                                handleEditPrinter(printer.printerName)
                              }
                              variant="outline"
                              size="sm"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() =>
                                setSelectedPrinter(printer.printerName)
                              }
                              variant="outline"
                              size="sm"
                            >
                              Test Print
                            </Button>
                            <Button
                              onClick={() =>
                                handleDeletePrinter(printer.printerIp)
                              }
                              variant="destructive"
                              size="sm"
                            >
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p>No printers saved yet.</p>
                )}
              </CardContent>
            </TabsContent>

            <TabsContent value="server-settings">
              <CardHeader>
                <CardTitle>Print Server Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Input
                    value={serverIP}
                    onChange={(e) => setServerIP(e.target.value)}
                    placeholder="Print Server IP"
                    className="flex-grow"
                  />
                  <Button onClick={handleSaveServerIP}>Save</Button>
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </PageContainer>
  );
}
