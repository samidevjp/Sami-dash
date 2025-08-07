import React, { useState } from 'react';
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

import { Dialog, DialogOverlay } from '../ui/dialog';
import { X } from 'lucide-react';
import axios from 'axios';
import { useApi } from '@/hooks/useApi';
import { StripePaymentLink } from '@/types';
import { Label } from '../ui/label';
interface PaymentLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  session?: any; // Optional, if you want to pass session directly
  stripeItems?: any[]; // Optional, if you want to pass merged items directly
  existingLinks: StripePaymentLink[]; // Existing payment links to display
  setExistingLinks: (links: StripePaymentLink[]) => void; // Function to update existing links
  setMergedItems: React.Dispatch<
    React.SetStateAction<{
      oneTime: any[];
      recurring: any[];
    }>
  >;
}
export default function PaymentLinkDialog({
  isOpen,
  onClose,
  session,
  stripeItems,
  existingLinks,
  setExistingLinks,
  setMergedItems
}: PaymentLinkDialogProps) {
  // const { data: session } = useSession();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [item, setItem] = useState<{
    title: string;
    price: string;
    quantity: number;
    imageFile?: File;
    imagePreview?: string; // for displaying image preview
    initImagePreview?: string; // for displaying initial image preview
    price_id?: string; // when user selects from suggestions
    product_id?: string; // when user selects from suggestions
  }>({ title: '', price: '', quantity: 1 });
  const [generateLinkLoading, setGenerateLinkLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [isPreset, setIsPreset] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [filteredSuggestions, setFilteredSuggestions] = useState<any[]>([]);

  const { createStripePaymentLink, uploadMedia } = useApi();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setItem({ ...item, title: val });
    setIsPreset(false);

    const matched =
      stripeItems?.filter((p) =>
        p.name.toLowerCase().includes(val.toLowerCase())
      ) ?? [];
    setFilteredSuggestions(matched);
  };

  const handleSelectSuggestion = (product: any) => {
    setItem({
      title: product.name,
      price: (product.price.unit_amount / 100).toString(),
      quantity: 1,
      price_id: product.price.id,
      product_id: product.id,
      imagePreview: product.images[0] || undefined,
      initImagePreview: product.images[0] || undefined
    });

    setIsPreset(true);
    setFilteredSuggestions([]);
  };
  const handleAddItem = async () => {
    if (!item.title || !item.price || !item.quantity) {
      toast({
        title: 'Error',
        description: 'All fields are required',
        variant: 'destructive'
      });
      return;
    }
    setUploadingImage(true);
    let imageUrl: string | undefined = undefined;
    try {
      if (item.imageFile) {
        const uploadResult = await uploadMedia(item.imageFile);
        imageUrl = uploadResult.imageUrl;
      } else if (item.imagePreview) {
        imageUrl = item.imagePreview;
      }
    } catch (error) {
      setUploadingImage(false);
    }

    let finalItem = { ...item, price: parseFloat(item.price), imageUrl };
    try {
      // --- CREATE NEW PRICE IF NOT EXISTS ---
      if (!item.price_id) {
        const response = await axios.post('/api/price/create', {
          title: item.title,
          unit_amount: parseFloat(item.price),
          accountId: session?.user?.stripeAccount,
          imageUrl
        });
        setMergedItems((prev: any) => ({
          ...prev,
          oneTime: [response.data, ...prev.oneTime]
        }));

        if (response.data?.price.id) {
          finalItem.price_id = response.data.price.id;
        } else {
          throw new Error('Failed to create product & price');
        }
      }
      // --- UPDATE IF IMAGE CHANGED/REMOVED ---
      else if (item?.imagePreview !== imageUrl) {
        const response = await axios.patch('/api/price/update', {
          id: item.product_id,
          title: item.title,
          imageUrl,
          accountId: session?.user?.stripeAccount
        });
        setMergedItems((prev: any) => ({
          ...prev,
          oneTime: prev.oneTime.map((p: any) =>
            p.id === response.data.product.id // ← response.data.product.id → response.data.id
              ? { ...p, images: response.data.product.images } // ← response.data.product.images → response.data.images
              : p
          )
        }));
      }
      // DELETE IMAGE IF NOT UPLOADED
      else if (
        item.initImagePreview !== undefined &&
        !item.imagePreview &&
        item.imagePreview !== item.initImagePreview
      ) {
        const response = await axios.patch('/api/price/update', {
          id: item.product_id,
          title: item.title,
          imageUrl: '',
          accountId: session?.user?.stripeAccount
        });
        setMergedItems((prev: any) => ({
          ...prev,
          oneTime: prev.oneTime.map((p: any) =>
            p.id === response.data.product.id // ← response.data.product.id → response.data.id
              ? { ...p, images: [] } // ← response.data.product.images → response.data.images
              : p
          )
        }));
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error?.response?.data?.message ||
          error.message ||
          'Failed to create/update price',
        variant: 'destructive'
      });
      return;
    } finally {
      setUploadingImage(false);
    }

    setItems([...items, finalItem]);
    setItem({ title: '', price: '', quantity: 1 });
    setIsPreset(false);
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
      const response = await createStripePaymentLink({
        account: session?.user?.stripeAccount as string,
        items: items.map((it) => ({
          price_id: it.price_id,
          quantity: it.quantity
        }))
      });

      if (response.url) {
        setGeneratedLink(response.url);
        toast({
          title: 'Success',
          description: 'Payment link generated',
          variant: 'success'
        });
        setExistingLinks([
          {
            id: response.payment_link_id as string,
            url: response.url as string,
            active: true,
            currency: 'aud',
            metadata: ''
          },
          ...existingLinks
        ]);
        setItems([]); // Clear items after generating link
      } else {
        throw new Error(response.error || 'Failed to generate link');
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

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'Image must be smaller than 2MB',
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

  const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

  return (
    <Dialog open={isOpen} modal={true}>
      <X
        onClick={() => {
          onClose();
        }}
        className="fixed left-4 top-4 cursor-pointer text-foreground"
        style={{ zIndex: 1000 }}
      />
      <DialogOverlay className="h-[100vh] min-w-[100vw] overflow-auto bg-background">
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
                <div className="flex flex-col items-stretch gap-2 sm:flex-row">
                  <div className="flex-1">
                    <label className="mb-1 block text-sm font-medium">
                      Item Name
                    </label>
                    <div className="relative">
                      <Input
                        value={item.title}
                        onChange={handleInputChange}
                        placeholder="Enter or select product"
                        className="w-full"
                      />
                      {filteredSuggestions.length > 0 &&
                        item.title.length > 0 && (
                          <div className="absolute z-10 mt-1 max-h-[50svh] w-full overflow-y-auto rounded-md border bg-background shadow">
                            {filteredSuggestions.map((product) => (
                              <div
                                key={product.id}
                                className="cursor-pointer px-3 py-2 text-sm hover:bg-muted"
                                onClick={() => handleSelectSuggestion(product)}
                              >
                                {product.name} - $
                                {(product.price.unit_amount / 100).toFixed(1)}
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                  <div className="w-full sm:w-28">
                    <label className="mb-1 block text-sm font-medium">
                      Price
                    </label>
                    <Input
                      placeholder="0.00"
                      type="number"
                      min="0"
                      value={item.price}
                      onChange={(e) =>
                        setItem({ ...item, price: e.target.value })
                      }
                      disabled={isPreset}
                    />
                  </div>
                  <div className="w-full sm:w-20">
                    <label className="mb-1 block text-sm font-medium">
                      Qty
                    </label>
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
                      <Icons.add className="h-4 w-4" /> Add
                    </Button>
                  </div>
                </div>
                {/* Image Upload Section */}
                <div className="mt-4 w-full">
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
                        Upload an image for this product (max 2MB). Supported
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

              {items.length > 0 && (
                <div className="mb-6">
                  <div className="mb-2 flex items-center gap-2 text-lg font-semibold">
                    <Icons.cart className="h-5 w-5 text-muted-foreground" />{' '}
                    Items to Include
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
                {generateLinkLoading
                  ? 'Generating...'
                  : 'Generate Payment Link'}
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
                    className="border-green-300 !p-0 hover:bg-green-100"
                  >
                    <Icons.page className="h-5 w-5 p-0 text-green-700" />
                  </Button>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogOverlay>
    </Dialog>
  );
}
