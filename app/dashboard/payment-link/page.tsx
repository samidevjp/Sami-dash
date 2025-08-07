'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Icons } from '@/components/icons';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import PageContainer from '@/components/layout/page-container';
import { Label } from '@/components/ui/label';
import { useApi } from '@/hooks/useApi';

interface PaymentLink {
  id: string;
  url: string;
  active: boolean;
  currency: string;
  metadata: any;
  // Add other relevant fields from the Stripe PaymentLink object if needed
}

interface ItemWithImage {
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export default function PaymentLinkPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const { uploadMedia } = useApi();

  const [items, setItems] = useState<ItemWithImage[]>([]);
  const [item, setItem] = useState<{
    title: string;
    price: string;
    quantity: number;
    imageFile?: File;
    imagePreview?: string;
  }>({ title: '', price: '', quantity: 1 });
  const [generateLinkLoading, setGenerateLinkLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const [existingLinks, setExistingLinks] = useState<PaymentLink[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [hasMoreLinks, setHasMoreLinks] = useState(false);
  const [startingAfter, setStartingAfter] = useState<string | undefined>(
    undefined
  );

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Error',
          description: 'Please select an image file',
          variant: 'destructive'
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'Image must be smaller than 5MB',
          variant: 'destructive'
        });
        return;
      }

      const preview = URL.createObjectURL(file);
      setItem((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: preview
      }));
    }
  };

  const removeImage = () => {
    if (item.imagePreview) {
      URL.revokeObjectURL(item.imagePreview);
    }
    setItem((prev) => ({
      ...prev,
      imageFile: undefined,
      imagePreview: undefined
    }));
  };

  const handleAddItem = async () => {
    if (!item.title || !item.price || !item.quantity) {
      toast({
        title: 'Error',
        description: 'Title, price, and quantity are required',
        variant: 'destructive'
      });
      return;
    }

    setUploadingImage(true);
    try {
      let imageUrl = undefined;

      if (item.imageFile) {
        const uploadResult = await uploadMedia(item.imageFile);
        imageUrl = uploadResult.imageUrl;
      }

      const newItem: ItemWithImage = {
        title: item.title,
        price: parseFloat(item.price),
        quantity: item.quantity,
        imageUrl
      };

      setItems([...items, newItem]);

      // Clean up the local preview URL
      if (item.imagePreview) {
        URL.revokeObjectURL(item.imagePreview);
      }
      setItem({ title: '', price: '', quantity: 1 });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleGenerateLink = async () => {
    if (items.length === 0) {
      toast({
        title: 'Error',
        description: 'Add at least one item',
        variant: 'destructive'
      });
      return;
    }
    setGenerateLinkLoading(true);
    setGeneratedLink('');
    try {
      const response = await fetch('/api/payment/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account: session?.user?.stripeAccount,
          items: items.map(({ ...item }) => item)
        })
      });
      const data = await response.json();
      if (data.paymentLink) {
        setGeneratedLink(data.paymentLink);
        toast({
          title: 'Success',
          description: 'Payment link generated',
          variant: 'success'
        });
        // Refresh the list of links
        setExistingLinks([]); // Clear current links to force full refresh
        setStartingAfter(undefined);
        fetchPaymentLinks(true); // Pass true to reset and fetch from beginning
      } else {
        throw new Error(data.error || 'Failed to generate link');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setGenerateLinkLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      toast({
        title: 'Copied',
        description: 'Payment link copied to clipboard',
        variant: 'success'
      });
    }
  };

  const fetchPaymentLinks = async (reset = false) => {
    if (!session?.user?.stripeAccount) return;
    setListLoading(true);
    setListError(null);
    try {
      const response = await fetch('/api/payment/list-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account: session.user.stripeAccount,
          limit: 5, // Fetch 5 links at a time, adjust as needed
          starting_after: reset ? undefined : startingAfter
        })
      });
      const data = await response.json();
      if (response.ok) {
        setExistingLinks((prev) =>
          reset ? data.data : [...prev, ...data.data]
        );
        setHasMoreLinks(data.has_more);
        if (data.data.length > 0) {
          setStartingAfter(data.data[data.data.length - 1].id);
        }
      } else {
        throw new Error(data.error || 'Failed to fetch payment links');
      }
    } catch (error: any) {
      setListError(error.message);
      toast({
        title: 'Error',
        description: `Failed to fetch payment links: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.stripeAccount) {
      fetchPaymentLinks(true); // Initial fetch, reset
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.stripeAccount]);

  // Cleanup effect for object URLs
  useEffect(() => {
    return () => {
      // Clean up any remaining object URLs when component unmounts
      if (item.imagePreview) {
        URL.revokeObjectURL(item.imagePreview);
      }
    };
  }, []);

  const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

  return (
    <PageContainer scrollable>
      <div className="mx-auto max-w-4xl space-y-8 px-2 py-10 sm:px-4">
        <Card className="rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
              <Icons.page className="h-6 w-6 text-primary" /> Generate New
              Payment Link
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="mb-2 text-lg font-semibold">Add Items</div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col items-stretch gap-2 sm:flex-row">
                  <div className="flex-1">
                    <Label className="mb-1 block text-sm font-medium">
                      Item Name
                    </Label>
                    <Input
                      placeholder="e.g. Coffee"
                      value={item.title}
                      onChange={(e) =>
                        setItem({ ...item, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="w-full sm:w-28">
                    <Label className="mb-1 block text-sm font-medium">
                      Price
                    </Label>
                    <Input
                      placeholder="0.00"
                      type="number"
                      min="0"
                      value={item.price}
                      onChange={(e) =>
                        setItem({ ...item, price: e.target.value })
                      }
                    />
                  </div>
                  <div className="w-full sm:w-20">
                    <Label className="mb-1 block text-sm font-medium">
                      Qty
                    </Label>
                    <Input
                      placeholder="1"
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        setItem({ ...item, quantity: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="mt-2 flex items-end sm:mt-0">
                    <Button
                      onClick={handleAddItem}
                      disabled={uploadingImage}
                      variant="secondary"
                      className="flex h-10 w-full items-center gap-1"
                    >
                      {uploadingImage ? (
                        <Icons.spinner className="h-4 w-4 animate-spin" />
                      ) : (
                        <Icons.add className="h-4 w-4" />
                      )}
                      {uploadingImage ? 'Adding...' : 'Add'}
                    </Button>
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="w-full">
                  <Label className="mb-2 block text-sm font-medium">
                    Product Image (optional)
                  </Label>
                  <div className="flex items-start gap-4">
                    {item.imagePreview ? (
                      <div className="relative">
                        <img
                          src={item.imagePreview}
                          alt="Preview"
                          className="h-20 w-20 rounded-lg border object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                          onClick={removeImage}
                        >
                          <Icons.trash className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-secondary transition-colors hover:border-primary/50">
                          <span className="text-2xl text-muted-foreground">
                            +
                          </span>
                        </div>
                      </Label>
                    )}
                    <div className="flex-1">
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <p className="text-xs text-muted-foreground">
                        Upload an image for this product (max 5MB). Supported
                        formats: JPG, PNG, GIF
                      </p>
                      {!item.imagePreview && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() =>
                            document.getElementById('image-upload')?.click()
                          }
                        >
                          Choose Image
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {items.length > 0 && (
              <div className="mb-6">
                <div className="mb-2 flex items-center gap-2 text-lg font-semibold">
                  <Icons.cart className="h-5 w-5 text-muted-foreground" /> Items
                  to Include
                </div>
                <div className="overflow-x-auto rounded-lg border bg-card">
                  <Table className="min-w-full text-sm">
                    <TableHeader>
                      <TableRow className="bg-muted/60">
                        <TableHead className="px-3 py-2 font-medium">
                          Image
                        </TableHead>
                        <TableHead className="px-3 py-2 font-medium">
                          Name
                        </TableHead>
                        <TableHead className="px-3 py-2 font-medium">
                          Price
                        </TableHead>
                        <TableHead className="px-3 py-2 font-medium">
                          Qty
                        </TableHead>
                        <TableHead className="px-3 py-2 text-right font-medium">
                          Total
                        </TableHead>
                        <TableHead className="px-2 py-2"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((it, idx) => (
                        <TableRow
                          key={idx}
                          className="transition hover:bg-muted/30"
                        >
                          <TableCell className="px-3 py-2">
                            {it.imageUrl ? (
                              <img
                                src={it.imageUrl}
                                alt={it.title}
                                className="h-12 w-12 rounded-md object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                                <Icons.page className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="px-3 py-2">
                            {it.title}
                          </TableCell>
                          <TableCell className="px-3 py-2">
                            ${it.price.toFixed(2)}
                          </TableCell>
                          <TableCell className="px-3 py-2">
                            {it.quantity}
                          </TableCell>
                          <TableCell className="px-3 py-2 text-right">
                            ${(it.price * it.quantity).toFixed(2)}
                          </TableCell>
                          <TableCell className="px-2 py-2 text-right">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveItem(idx)}
                              title="Remove"
                            >
                              <Icons.trash className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <tfoot>
                      <TableRow className="border-t bg-muted/60">
                        <TableCell
                          colSpan={4}
                          className="px-3 py-2 text-right font-semibold"
                        >
                          Grand Total
                        </TableCell>
                        <TableCell className="px-3 py-2 text-right font-bold">
                          ${total.toFixed(2)}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </tfoot>
                  </Table>
                </div>
              </div>
            )}

            <Button
              onClick={handleGenerateLink}
              disabled={generateLinkLoading || items.length === 0}
              className="mb-4 flex w-full items-center gap-2"
              size="lg"
            >
              {generateLinkLoading ? (
                <Icons.spinner className="h-5 w-5 animate-spin" />
              ) : (
                <Icons.link className="h-5 w-5" />
              )}
              {generateLinkLoading ? 'Generating...' : 'Generate Payment Link'}
            </Button>

            {generatedLink && (
              <Alert
                variant="default"
                className="mt-6 flex items-start gap-3 border-green-200 bg-green-50 sm:items-center sm:gap-4"
              >
                <Icons.check className="mt-1 h-6 w-6 flex-shrink-0 text-green-600 sm:mt-0" />
                <div className="min-w-0 flex-1">
                  <AlertTitle className="font-semibold text-green-800">
                    Payment Link Generated!
                  </AlertTitle>
                  <AlertDescription className="text-sm text-green-700">
                    <a
                      href={generatedLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block break-all text-blue-600 underline hover:text-blue-700"
                    >
                      {generatedLink}
                    </a>
                  </AlertDescription>
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopy}
                  title="Copy Link"
                  className="border-green-300 hover:bg-green-100"
                >
                  <Icons.page className="h-5 w-5 text-green-700" />{' '}
                  {/* Placeholder, ideally a copy icon */}
                </Button>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
              <Icons.billing className="h-6 w-6 text-primary" /> Existing
              Payment Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            {listError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{listError}</AlertDescription>
              </Alert>
            )}
            {existingLinks.length === 0 && !listLoading && !listError && (
              <p className="py-4 text-center text-muted-foreground">
                No payment links found.
              </p>
            )}
            {existingLinks.length > 0 && (
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/60">
                      <TableHead>URL</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {existingLinks.map((link) => (
                      <TableRow
                        key={link.id}
                        className="transition hover:bg-muted/30"
                      >
                        <TableCell>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block max-w-xs truncate text-blue-600 hover:underline sm:max-w-sm md:max-w-md"
                          >
                            {link.url}
                          </a>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={link.active ? 'success' : 'secondary'}
                          >
                            {link.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>{link.currency.toUpperCase()}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigator.clipboard
                                .writeText(link.url)
                                .then(() => toast({ title: 'Copied!' }))
                            }
                          >
                            Copy Link
                          </Button>
                          {/* Add more actions like deactivate/view line items if needed */}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {listLoading && (
              <div className="flex justify-center py-4">
                <Icons.spinner className="h-6 w-6 animate-spin text-primary" />
                <p className="ml-2">Loading links...</p>
              </div>
            )}
            {hasMoreLinks && !listLoading && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => fetchPaymentLinks()}
                  disabled={listLoading}
                >
                  Load More
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
