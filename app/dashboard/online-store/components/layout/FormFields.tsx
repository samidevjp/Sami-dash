import React, {
  useEffect,
  useState,
  ChangeEvent,
  useRef,
  useMemo
} from 'react';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { v4 as uuid } from 'uuid';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { X, Trash2, Pencil, Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Product, ProductDetails } from '../../types';
import { useApi } from '@/hooks/useApi';
import { Checkbox } from '@/components/ui/checkbox';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableCategory } from './SortableCategory';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Modal } from '@/components/ui/modal';
import ModifiersTab from '@/app/dashboard/inventory/modifiersTab';
import ModifierGroupsSection from './ModifierGroupsSection';
interface FormFieldsProps {
  products: any;
  isOpen: boolean;
  onClose: () => void;
  selectedProduct: any;
  onlineStoreData: any;
  menuData: any;
  existingProducts: any;
  inventoryCategories: any[];
  onlineCategories: any;
  setSelectedProduct: (product: any) => void;
  setExistingProducts: (products: Product[]) => void;
  onSubmit: (data: any) => Promise<any>;
  setSelectedTab: (tab: string) => void;
  isVisibleOnStore: boolean;
  setIsVisibleOnStore: (setIsVisibleOnStore: boolean) => void;
  addCategory: (newCategoryName: string) => void;
  setOnlineCategories: React.Dispatch<React.SetStateAction<any[]>>;
  token: string;
  fetchExistingProducts: () => void;
  onToggleCategory: (categoryId: string) => void;
  addModifiersProps?: any;
}
const FormFields: React.FC<FormFieldsProps> = ({
  products,
  isOpen,
  onClose,
  selectedProduct,
  onlineStoreData,
  menuData,
  existingProducts,
  inventoryCategories,
  onlineCategories,
  setExistingProducts,
  setSelectedProduct,
  onSubmit,
  setSelectedTab,
  isVisibleOnStore,
  setIsVisibleOnStore,
  addCategory,
  setOnlineCategories,
  token,
  fetchExistingProducts,
  onToggleCategory,
  addModifiersProps
}) => {
  const formRef = useRef<HTMLDivElement>(null);
  const {
    updateOnlineStoreSettings,
    sortOnlineStoreCategories,
    deleteOnlineCategory,
    getModifierGroups,
    uploadProductImages,
    reorderProductImages,
    deleteProductImage,
    addProductImage
  } = useApi();
  const [modifierGroups, setModifierGroups] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [productImage, setProductImage] =
    useState<ProductDetails['productImage']>(' ');
  const [selectedModifiers, setSelectedModifiers] = useState<any[]>([]);
  const [selectedInventoryCategory, setSelectedInventoryCategory] =
    useState<any>();
  const [newImages, setNewImages] = useState<File[]>([]); // New images to upload
  const [deletedImageIds, setDeletedImageIds] = useState<(number | string)[]>(
    []
  );
  const [currentImages, setCurrentImages] = useState<any[]>([]); // Current state of images
  const [hasImageChanges, setHasImageChanges] = useState(false); // Track if there are pending changes
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedModifierGroups, setSelectedModifierGroups] = useState<
    Array<{ id: number }>
  >([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddModifiersModalOpen, setIsAddModifiersModalOpen] = useState(false);
  const [isModifierGroupsModalOpen, setIsModifierGroupsModalOpen] =
    useState(false);
  useEffect(() => {
    setNewCategoryName('');
  }, [isCategoryDialogOpen]);
  // Initialize current images when product changes
  useEffect(() => {
    if (!isOpen || !selectedProduct) return;
    const initialImages = (selectedProduct.photos || []).filter(
      (img: any) =>
        img.image_path !== selectedProduct.pos_product?.photo &&
        img.photo !== selectedProduct.pos_product?.photo
    );
    setCurrentImages(initialImages);
    setCurrentImages(initialImages);
    setNewImages([]);
    setDeletedImageIds([]);
    setHasImageChanges(false);
    // Clear preview URLs for new images
    imagePreviewUrls.forEach((url) => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    setImagePreviewUrls([]);
  }, [isOpen]);
  // Cleanup effect for object URLs
  useEffect(() => {
    return () => {
      // Cleanup object URLs on unmount
      imagePreviewUrls.forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );
  const handleCategoryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOnlineCategories((items) => {
        const oldIndex = items.findIndex(
          (item) => item.id.toString() === active.id
        );
        const newIndex = items.findIndex(
          (item) => item.id.toString() === over.id
        );
        if (oldIndex !== -1 && newIndex !== -1) {
          // Create a new array with the updated order
          const newArray = arrayMove(items, oldIndex, newIndex);
          // Update each item's sort_order based on its new position
          const updatedArray = newArray.map((item, index) => ({
            ...item,
            sort_order: index
          }));
          setHasUnsavedChanges(true);
          return updatedArray;
        }
        return items;
      });
    }
  };
  const saveCategories = async () => {
    try {
      const data = await sortOnlineStoreCategories({
        categories: onlineCategories.map((cat: any) => ({
          id: cat.id,
          sort_order: cat.sort_order
        }))
      });
      if (data.status === 'success') {
        toast({
          title: 'Success',
          description: 'Category order updated successfully!',
          variant: 'success'
        });
        setHasUnsavedChanges(false);
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to update category order',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error updating category order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update category order',
        variant: 'destructive'
      });
    }
  };
  const handleDeleteCategory = async (categoryId: number) => {
    try {
      const data = await deleteOnlineCategory(categoryId, token);
      if (data.status === 'success') {
        toast({
          title: 'Success',
          description: 'Category deleted successfully',
          variant: 'success'
        });
        const updatedCategories = onlineCategories.filter(
          (cat: any) => cat.id !== categoryId
        );
        setOnlineCategories(updatedCategories);
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to delete category',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive'
      });
    }
  };
  useEffect(() => {
    if (!isOpen) return;
    const initialCategories = [];
    if (selectedProduct?.category_ids?.length > 0) {
      initialCategories.push(...selectedProduct?.category_ids.map(String));
    } else if (selectedProduct?.category_id) {
      initialCategories.push(String(selectedProduct?.category_id));
    }
    setSelectedCategories(initialCategories);
    setSelectedInventoryCategory(
      selectedProduct?.pos_product_category_id?.toString() || ''
    );
  }, [isOpen, selectedProduct]);
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const isSelected = prev.includes(categoryId);
      if (isSelected) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };
  const getAllModifiers = () => {
    const allModifiers = new Set();
    menuData?.forEach((category: any) => {
      category.add_ons?.forEach((modifier: any) => {
        allModifiers.add(
          JSON.stringify({
            id: modifier.id,
            name: modifier.name,
            price: modifier.price,
            has_description: modifier.has_description
          })
        );
      });
    });
    return Array.from(allModifiers).map((mod) => JSON.parse(mod as string));
  };
  const fetchModifierGroups = async () => {
    try {
      const response = await getModifierGroups();
      setModifierGroups(response.data.groups);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch modifier groups',
        variant: 'destructive'
      });
    }
  };
  useEffect(() => {
    fetchModifierGroups();
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen || !selectedProduct) return;
    setProductImage(
      selectedProduct?.photo || selectedProduct?.pos_product?.photo
    );
    setSelectedModifiers(
      selectedProduct?.modifiers?.map((mod: any) => ({
        id: mod.id || mod,
        name: mod.name,
        price: mod.price,
        has_description: mod.has_description
      })) || []
    );
    setSelectedModifierGroups(
      selectedProduct?.modifier_groups?.map((group: any) => ({
        id: group.id
      })) || []
    );
  }, [isOpen, selectedProduct]);
  const handleImagesChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImagesCount =
      (selectedProduct.use_pos_image && selectedProduct.pos_product?.photo
        ? 1
        : 0) +
      currentImages.filter(
        (img) => !deletedImageIds.includes(img.id || img.image_path)
      ).length +
      newImages.length;
    if (files.length + totalImagesCount > 5) {
      toast({
        title: 'Error',
        description: 'Maximum 5 images allowed in total including POS image',
        variant: 'destructive'
      });
      return;
    }
    if (files.length + totalImagesCount > 5) {
      toast({
        title: 'Error',
        description: 'Maximum 5 images allowed in total',
        variant: 'destructive'
      });
      return;
    }
    // Validate file size and type
    for (const file of files) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: `File ${file.name} is too large. Maximum size is 2MB.`,
          variant: 'destructive'
        });
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast({
          title: 'Error',
          description: `File ${file.name} is not a valid image. Only JPEG and PNG are allowed.`,
          variant: 'destructive'
        });
        return;
      }
    }
    // Add new images to local state
    setNewImages((prev) => [...prev, ...files]);
    // Create preview URLs for new images
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    setHasImageChanges(true);
    // Clear the input
    e.target.value = '';
  };
  const handleImageDragStart = (index: number) => {
    setIsDragging(true);
    setDraggedIndex(index);
  };
  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    // Simple approach: work with only the visible images
    const visibleImages = currentImages.filter(
      (img) => !deletedImageIds.includes(img.id || img.image_path)
    );
    // Reorder the visible images
    const reorderedImages = [...visibleImages];
    const [draggedImage] = reorderedImages.splice(draggedIndex, 1);
    reorderedImages.splice(index, 0, draggedImage);
    // Replace the currentImages with the reordered visible images
    // (deleted images are tracked separately in deletedImageIds)
    setCurrentImages(reorderedImages);
    setDraggedIndex(index);
    setHasImageChanges(true);
  };
  const handleImageDragEnd = async () => {
    setIsDragging(false);
    setDraggedIndex(null);
    // Don't call API here - will be handled in save
  };
  const handleDeleteImage = async (
    imageId?: number | string,
    previewIndex?: number
  ) => {
    if (imageId) {
      // Mark existing image for deletion
      setDeletedImageIds((prev) => {
        const updated = [...prev, imageId];
        return updated;
      });
    } else if (previewIndex !== undefined) {
      // Remove new image from local state
      setNewImages((prev) => {
        const updated = prev.filter((_, index) => index !== previewIndex);
        return updated;
      });
      // Remove preview URL and revoke object URL
      setImagePreviewUrls((prev) => {
        const urlToRevoke = prev[previewIndex];
        if (urlToRevoke) {
          URL.revokeObjectURL(urlToRevoke);
        }
        const updated = prev.filter((_, index) => index !== previewIndex);
        return updated;
      });
    }
    setHasImageChanges(true);
  };
  const handleUsePosImageToggle = (
    checked: boolean,
    selectedProduct: any,
    currentImages: any[],
    deletedImageIds: any[],
    newImages: File[],
    setSelectedProduct: (fn: (prev: any) => any) => void,
    toast: any
  ) => {
    const totalImagesCount =
      (checked ? 1 : 0) +
      currentImages.filter(
        (img) => !deletedImageIds.includes(img.id || img.image_path)
      ).length +
      newImages.length;
    if (totalImagesCount > 5) {
      toast({
        title: 'Image Limit Exceeded',
        description:
          'You can only display up to 5 images. Please remove one before enabling POS image.',
        variant: 'destructive'
      });
      return;
    }
    setSelectedProduct((prev: any) => ({
      ...prev,
      use_pos_image: !!checked,
      photos: prev.photos || selectedProduct?.photos || [],
      pos_product: prev.pos_product || selectedProduct?.pos_product || null
    }));
  };
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const isSelected = prev.includes(categoryId);
      if (isSelected) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };
  const handleSaveProduct = async () => {
    if (isSaving) return;
    setIsSaving(true);
    if (selectedCategories.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'At least one category must be selected.',
        variant: 'destructive'
      });
      return;
    }
    try {
      // Handle image operations if there are changes
      if (hasImageChanges) {
        // 1. Delete marked images
        for (const imageId of deletedImageIds) {
          // Only delete images that have numeric IDs (actual database records)
          if (typeof imageId === 'number') {
            try {
              await deleteProductImage(imageId);
            } catch (error) {
              console.error('Failed to delete image:', imageId, error);
            }
          }
        }
        // 2. Upload new images if any
        if (newImages.length > 0) {
          const formData = new FormData();
          formData.append('product_id', selectedProduct.id.toString());
          newImages.forEach((image, index) => {
            formData.append(`photos[${index}]`, image);
          });
          try {
            await addProductImage(formData);
          } catch (error) {
            toast({
              title: 'Error',
              description: 'Failed to upload some images',
              variant: 'destructive'
            });
            throw error;
          }
        }
        // 3. Reorder images if needed (after upload/delete operations)
        const remainingImages = currentImages.filter(
          (img) =>
            !deletedImageIds.includes(img.id || img.image_path) &&
            typeof img.id === 'number' // Only reorder images with numeric IDs
        );
        if (remainingImages.length > 0) {
          const reorderData = remainingImages.map(
            (photo: any, index: number) => ({
              id: photo.id,
              order: index
            })
          );
          try {
            await reorderProductImages(reorderData);
          } catch (error) {
            console.error('Failed to reorder images:', error);
          }
        }
      }
      const modifiers = selectedModifiers.map((mod) => ({
        id: mod.id,
        has_description: mod.has_description || false
      }));
      const productsUpdated = [...existingProducts];
      const productsUpdatedModifiers = productsUpdated.map((product) => ({
        ...product,
        modifiers: product.modifiers.map((mod: any) => ({
          id: typeof mod === 'object' ? mod.id : mod,
          has_description: mod.has_description || false
        }))
      }));
      const existingProductIndex = productsUpdatedModifiers.findIndex(
        (p: any) => {
          if (selectedProduct.pos_product) {
            return (
              p.product_id?.toString() ===
              selectedProduct.pos_product.id?.toString()
            );
          }
          return p.id?.toString() === selectedProduct.id?.toString();
        }
      );
      const updatedProduct = {
        id:
          existingProductIndex !== -1
            ? productsUpdatedModifiers[existingProductIndex].id
            : null,
        product_id: selectedProduct.product_id,
        product_name:
          selectedProduct.product_name || selectedProduct.title || '',
        product_desc: selectedProduct.product_desc || '',
        notes: selectedProduct.notes || '',
        allow_notes: selectedProduct.allow_notes ?? false,
        price: selectedProduct.price?.toString(),
        category_id: selectedCategories[0] || null, // First category as primary
        category_ids: selectedCategories, // All selected categories
        prep_time: selectedProduct.prep_time || '48 Hours',
        availability: 'Always',
        modifiers,
        unit_barcode: '',
        case_barcode: '',
        modifier_groups: selectedModifierGroups,
        daily_limit: selectedProduct.daily_limit || 0,
        photos:
          existingProductIndex !== -1
            ? productsUpdatedModifiers[existingProductIndex].photos
            : [],
        use_pos_image: selectedProduct?.use_pos_image || false
      };
      if (existingProductIndex !== -1) {
        productsUpdated[existingProductIndex] = {
          ...productsUpdated[existingProductIndex],
          ...updatedProduct
        };
      } else {
        productsUpdated.push(updatedProduct);
      }
      const onlineStoreSettingsData = {
        ...onlineStoreData,
        products: productsUpdated
      };
      const selectedInventoryProductData = products.find(
        (p: any) => p.id?.toString() === selectedProduct.product_id?.toString()
      );
      // Saving to POS
      const formattedData = {
        ...selectedInventoryProductData,
        id: selectedProduct.product_id,
        uuid: selectedInventoryProductData?.uuid || uuid(),
        title:
          selectedProduct.pos_product?.title ||
          selectedProduct.product_name ||
          '',
        price: selectedProduct.pos_product.price?.toString(),
        category_id: Number(
          selectedInventoryProductData?.pos_product_category_id
        ),
        pos_product_category_id:
          selectedInventoryProductData?.pos_product_category_id || ''
      };
      await updateOnlineStoreSettings(onlineStoreSettingsData);
      onSubmit(formattedData);
      toast({
        title: 'Success',
        description: 'Product saved successfully',
        variant: 'success'
      });
      setExistingProducts(productsUpdated);
      // Refresh product data to get updated images
      fetchExistingProducts();
      onClose();
      // Refresh modifier groups after saving
      await fetchModifierGroups();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save product',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };
  const handleDeleteProduct = async () => {
    try {
      const updatedProducts = existingProducts.filter((product: any) => {
        if (selectedProduct?.pos_product) {
          return (
            product.product_id?.toString() !==
            selectedProduct?.pos_product.id?.toString()
          );
        }
        return product.id?.toString() !== selectedProduct?.id?.toString();
      });
      const response = await updateOnlineStoreSettings({
        ...onlineStoreData,
        products: updatedProducts
      });
      setExistingProducts(response.data.online_store.products);
      toast({
        title: 'Product Deleted',
        description: 'Product has been removed successfully',
        variant: 'success'
      });
      setSelectedProduct(null);
      onClose();
    } catch (err) {
      console.error('Delete Online Product Error:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive'
      });
    }
  };
  const handleCopyModifiersToCategory = async () => {
    {
      if (!selectedProduct || !selectedModifiers.length) {
        toast({
          title: 'Error',
          description: 'Please select modifiers first',
          variant: 'destructive'
        });
        return;
      }
      const updatedProducts = existingProducts.map((product: any) => {
        if (
          product.product_category_id === selectedProduct?.product_category_id
        ) {
          return {
            ...product,
            modifiers: selectedModifiers.map((mod) => ({
              id: mod.id,
              name: mod.name || '',
              price: mod.price ?? 0,
              has_description: mod.has_description || false
            }))
          };
        }
        return product;
      });
      setExistingProducts(updatedProducts);
      toast({
        variant: 'success',
        title: 'Success',
        description: 'Modifiers copied to all products in this category'
      });
    }
  };
  return (
    <div
      ref={formRef}
      className={`fixed right-0 top-0 z-50 h-full w-full transform overflow-y-auto bg-background shadow-lg transition-transform duration-300 ease-in-out lg:w-2/3 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-9 w-9 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
            <h2 className="text-lg font-semibold">Edit Product</h2>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (
                window.confirm('Are you sure you want to delete this product?')
              ) {
                handleDeleteProduct();
              }
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove from Store
          </Button>
        </div>
      </div>
      <div className="container max-w-5xl py-6">
        <div className="grid gap-6 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-6">
              <Card variant="secondary">
                <CardHeader>
                  <h3 className="font-semibold">Product Preview</h3>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Display existing images  */}
                      {selectedProduct?.use_pos_image &&
                        selectedProduct?.pos_product?.photo && (
                          <div className="group relative h-16 w-16 overflow-hidden rounded-lg border bg-gray-100">
                            <Image
                              src={`${process.env.NEXT_PUBLIC_IMG_URL}${selectedProduct.pos_product.photo}`}
                              alt="POS Product"
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      {currentImages
                        .filter(
                          (img) =>
                            !deletedImageIds.includes(img.id || img.image_path)
                        )
                        .map((photo: any, index: number) => (
                          <div
                            key={`existing-${photo.id || photo.image_path}`}
                            className="group relative h-16 w-16 overflow-hidden rounded-lg border bg-gray-100"
                            draggable
                            onDragStart={() => handleImageDragStart(index)}
                            onDragOver={(e) => handleImageDragOver(e, index)}
                            onDragEnd={handleImageDragEnd}
                          >
                            <Image
                              src={`${process.env.NEXT_PUBLIC_IMG_URL}${photo.image_path}`}
                              alt={`Product ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            <button
                              onClick={() =>
                                handleDeleteImage(photo.id || photo.image_path)
                              }
                              className="absolute right-1 top-1 z-10 rounded-full bg-destructive p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      {/* Display new image previews */}
                      {imagePreviewUrls.map((url, index) => (
                        <div
                          key={`new-${index}`}
                          className="group relative h-16 w-16 overflow-hidden rounded-lg border-2 border-dashed border-blue-300 bg-gray-200"
                        >
                          <Image
                            src={url}
                            alt={`New Product ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            onClick={() => handleDeleteImage(undefined, index)}
                            className="absolute right-1 top-1 z-10 rounded-full bg-destructive p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="absolute bottom-1 left-1 rounded bg-blue-500 px-1 text-xs text-white">
                            NEW
                          </div>
                        </div>
                      ))}
                      {/* Add button - show if total images (existing + new - deleted) < 5 */}
                      {(() => {
                        const existingCount = currentImages.filter(
                          (img) =>
                            !deletedImageIds.includes(img.id || img.image_path)
                        ).length;
                        const totalCount = existingCount + newImages.length;
                        return (
                          totalCount < 5 && (
                            <Label
                              htmlFor="multi-file-input"
                              className="cursor-pointer"
                            >
                              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-300 text-white hover:bg-gray-400">
                                <span className="text-2xl font-bold">+</span>
                              </div>
                              <Input
                                id="multi-file-input"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImagesChange}
                                className="hidden"
                              />
                            </Label>
                          )
                        );
                      })()}
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {`Images used: ${
                        (selectedProduct?.use_pos_image &&
                        selectedProduct?.pos_product?.photo
                          ? 1
                          : 0) +
                        currentImages.filter(
                          (img) =>
                            !deletedImageIds.includes(img.id || img.image_path)
                        ).length +
                        newImages.length
                      } / 5`}
                    </div>
                    {/* Show pending changes indicator */}
                    {hasImageChanges && (
                      <div className="rounded bg-amber-50 p-2 text-sm text-amber-600">
                        You have unsaved image changes. Click &quot;Save
                        Changes&quot; to apply them.
                      </div>
                    )}
                    {selectedProduct?.pos_product?.photo && (
                      <div className="flex items-center gap-2">
                        <div className="group relative h-11 w-11 overflow-hidden rounded-lg border bg-gray-100">
                          <Image
                            src={`${process.env.NEXT_PUBLIC_IMG_URL}${selectedProduct.pos_product.photo}`}
                            alt="POS Product"
                            fill
                            className="object-cover"
                          />
                          <div className="absolute bottom-1 left-1 rounded bg-gray-700 px-1 text-xs text-white">
                            POS
                          </div>
                        </div>
                        <div className="">
                          <Label
                            htmlFor="use-pos-image"
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                          >
                            <Checkbox
                              id="use-pos-image"
                              checked={!!selectedProduct?.use_pos_image}
                              onCheckedChange={(checked: boolean) =>
                                handleUsePosImageToggle(
                                  checked,
                                  selectedProduct,
                                  currentImages,
                                  deletedImageIds,
                                  newImages,
                                  setSelectedProduct,
                                  toast
                                )
                              }
                            />
                            <p>Use POS Product Image</p>
                          </Label>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Product Info Preview */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">
                      {selectedProduct?.product_name || 'Product Name'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      ${selectedProduct?.price || '0.00'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedProduct?.product_desc ||
                        'No description available'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          {/* Right Column - Form Fields */}
          <div className="lg:col-span-4">
            <div className="mb-8 space-y-6">
              {/* General Information */}
              <Card variant="secondary">
                <CardHeader>
                  <h3 className="font-semibold">General Information</h3>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-4">
                    <div className="mb-4 w-1/2 space-y-2">
                      <Label htmlFor="productName">POS Product Name</Label>
                      <Input
                        disabled
                        id="productName"
                        value={selectedProduct?.pos_product?.title || ''}
                        onChange={(e) =>
                          setSelectedProduct((prev: any) => ({
                            ...prev,
                            pos_product: {
                              ...prev?.pos_product,
                              title: e.target.value
                            }
                          }))
                        }
                      />
                    </div>
                    <div className="mb-4 w-1/2 space-y-2">
                      <Label htmlFor="productOnlineName">
                        Online Product Name
                      </Label>
                      <Input
                        id="productOnlineName"
                        value={selectedProduct?.product_name || ''}
                        onChange={(e) =>
                          setSelectedProduct((prev: any) => ({
                            ...prev,
                            product_name: e.target.value
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="mb-4 w-1/2 space-y-2">
                      <Label htmlFor="productPrice">POS Price</Label>
                      <Input
                        disabled
                        id="productPrice"
                        placeholder="POS Price"
                        value={selectedProduct?.pos_product?.price || ''}
                        onChange={(e) =>
                          setSelectedProduct((prev: any) => ({
                            ...prev!,
                            pos_product: {
                              ...prev?.pos_product,
                              price: e.target.value
                            }
                          }))
                        }
                      />
                    </div>
                    <div className="mb-4 w-1/2 space-y-2">
                      <Label htmlFor="productOnlinePrice">Online Price</Label>
                      <Input
                        id="productOnlinePrice"
                        placeholder="Product Price"
                        value={selectedProduct?.price || ''}
                        onChange={(e) =>
                          setSelectedProduct((prev: any) => ({
                            ...prev!,
                            price: e.target.value
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="mb-16 space-y-2">
                    <Label htmlFor="description">
                      Description{' '}
                      <span className="text-muted-foreground">
                        (shown on your online store)
                      </span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Enter product description..."
                      value={selectedProduct?.product_desc || ''}
                      onChange={(e) => {
                        setSelectedProduct((prev: any) => ({
                          ...prev!,
                          product_desc: e.target.value
                        }));
                      }}
                    />
                  </div>
                  {/* Category online */}
                  <div className="mb-6">
                    {/* Section: Create New Category */}
                    <div className="">
                      <div className="mb-8 flex justify-between">
                        <div className="">
                          <h2 className="mb-2 font-semibold text-foreground">
                            Categories
                          </h2>
                          <p className="text-xs font-medium text-muted-foreground">
                            Select Online Store Category
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setIsCategoryDialogOpen(true)}
                          className=""
                          size={'sm'}
                        >
                          <Pencil size={16} className="mr-2" />
                          Manage Categories
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-8 px-4">
                        {onlineCategories?.map((category: any) => (
                          <Label
                            key={category.id}
                            htmlFor={`category-${category.id}`}
                            className="flex cursor-pointer items-center space-x-2"
                          >
                            <Checkbox
                              id={`category-${category.id}`}
                              checked={selectedCategories.includes(
                                category.id.toString()
                              )}
                              onCheckedChange={() =>
                                handleCategoryChange(category.id.toString())
                              }
                            />
                            <p>{category.category_name}</p>
                          </Label>
                        ))}
                      </div>
                      {selectedCategories.length === 0 && (
                        <p className="text-sm text-red-500">
                          At least one category is required.
                        </p>
                      )}
                      <Dialog
                        open={isCategoryDialogOpen}
                        onOpenChange={setIsCategoryDialogOpen}
                      >
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Manage Categories</DialogTitle>
                            <DialogDescription>
                              Drag and drop to reorder categories. Click delete
                              to remove a category. You can also add a new
                              category.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="mt-6 space-y-4">
                            <div>
                              <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                                Create New Category
                              </h3>
                              <div className="flex items-center gap-3">
                                <Input
                                  placeholder="Enter category name..."
                                  value={newCategoryName}
                                  onChange={(e) =>
                                    setNewCategoryName(e.target.value)
                                  }
                                  className="flex-1"
                                />
                                <Button
                                  onClick={async () => {
                                    addCategory(newCategoryName);
                                    setNewCategoryName('');
                                  }}
                                  disabled={!newCategoryName}
                                  className="min-w-[120px]"
                                >
                                  Create
                                </Button>
                              </div>
                            </div>
                            <div className="max-h-[50dvh] overflow-y-auto">
                              <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleCategoryDragEnd}
                              >
                                <SortableContext
                                  items={onlineCategories.map((c: any) =>
                                    c.id.toString()
                                  )}
                                  strategy={verticalListSortingStrategy}
                                >
                                  {[...onlineCategories]
                                    .sort(
                                      (a, b) =>
                                        (a.sort_order || 0) -
                                        (b.sort_order || 0)
                                    )
                                    .map((category: any) => (
                                      <div className="mb-4" key={category.id}>
                                        <SortableCategory
                                          key={category.id}
                                          category={category}
                                          onDelete={handleDeleteCategory}
                                          existingProducts={existingProducts}
                                        />
                                      </div>
                                    ))}
                                </SortableContext>
                              </DndContext>
                            </div>
                            {hasUnsavedChanges && (
                              <div className="flex justify-end border-t pt-4">
                                <Button onClick={saveCategories}>
                                  Save Changes
                                </Button>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Modifiers */}
              <Card variant="secondary">
                <CardHeader className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="">
                      <h3 className="font-semibold">Modifiers</h3>
                      <p className="text-sm text-muted-foreground">
                        Add and manage product modifiers
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant={'outline'}
                        size="sm"
                        onClick={() => setIsAddModifiersModalOpen(true)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Manage Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyModifiersToCategory}
                      >
                        Copy to Category
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="">
                    {/* Modifier Selector */}
                    <div className="mb-4">
                      <div className="w-1/2">
                        <Select
                          onValueChange={(value) => {
                            const modifier = getAllModifiers().find(
                              (mod: any) => mod.id.toString() === value
                            );
                            if (
                              modifier &&
                              !selectedModifiers.some(
                                (m) => m.id === modifier.id
                              )
                            ) {
                              setSelectedModifiers([
                                ...selectedModifiers,
                                {
                                  ...modifier,
                                  has_description: false
                                }
                              ]);
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="+ Select a modifier" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {getAllModifiers().map((modifier: any) => (
                              <SelectItem
                                key={modifier?.id}
                                value={modifier?.id?.toString()}
                              >
                                <span className="flex items-center justify-between">
                                  <span>{modifier?.name}</span>
                                  {modifier?.price > 0 && (
                                    <span className="ml-2 text-muted-foreground">
                                      ${modifier?.price}
                                    </span>
                                  )}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {/* Selected Modifiers */}
                    <div className="">
                      <div className="max-h-[300px] overflow-y-auto p-1">
                        {selectedModifiers.length === 0 ? (
                          <div className="flex h-16 items-center justify-center text-sm text-muted-foreground">
                            No modifiers selected
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {selectedModifiers.map((modifier) => (
                              <div
                                key={modifier.id}
                                className="group flex flex-col rounded-md border bg-background p-2 transition-colors hover:bg-accent/50"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold">
                                    {modifier.name}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                      ${modifier.price}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        setSelectedModifiers(
                                          selectedModifiers.filter(
                                            (m) => m.id !== modifier.id
                                          )
                                        )
                                      }
                                      className="h-6 w-6 p-0 opacity-100 group-hover:opacity-80"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="mt-1 flex items-center space-x-2">
                                  <Checkbox
                                    id={`has-description-${modifier.id}`}
                                    checked={modifier.has_description}
                                    onCheckedChange={(checked) => {
                                      setSelectedModifiers((prev) =>
                                        prev.map((mod) =>
                                          mod.id === modifier.id
                                            ? {
                                                ...mod,
                                                has_description: !!checked
                                              }
                                            : mod
                                        )
                                      );
                                    }}
                                  />
                                  <Label
                                    htmlFor={`has-description-${modifier.id}`}
                                    className="text-xs text-muted-foreground"
                                  >
                                    Allow description
                                  </Label>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Modifier Groups */}
              <Card variant="secondary">
                <CardContent className="pt-8">
                  <div className="mb-8 flex justify-between">
                    <div className="">
                      <h3 className="font-semibold">Modifier Groups</h3>
                      <p className="text-sm text-muted-foreground">
                        Select modifier groups for this product
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsModifierGroupsModalOpen(true)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Manage Modifier Groups
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-x-8 gap-y-4">
                    <Modal
                      onClose={() => setIsModifierGroupsModalOpen(false)}
                      title="Manage Modifier Groups"
                      description="Select modifier groups for this product"
                      isOpen={isModifierGroupsModalOpen}
                    >
                      <ModifierGroupsSection
                        allModifiers={addModifiersProps.allModifiers}
                        fetchModifierGroups={fetchModifierGroups}
                        modifierGroups={modifierGroups}
                        setModifierGroups={setModifierGroups}
                      />
                    </Modal>
                    {modifierGroups.map((group) => (
                      <Label
                        key={group.id}
                        className="flex cursor-pointer items-center space-x-2"
                      >
                        <Checkbox
                          id={`group-${group.id}`}
                          checked={selectedModifierGroups.some(
                            (g) => g.id === group.id
                          )}
                          onCheckedChange={(checked) => {
                            setSelectedModifierGroups((prev) => {
                              if (checked) {
                                return [...prev, { id: group.id }];
                              } else {
                                return prev.filter((g) => g.id !== group.id);
                              }
                            });
                          }}
                        />
                        <Label
                          htmlFor={`group-${group.id}`}
                          className="text-sm"
                        >
                          {group.name}
                        </Label>
                      </Label>
                    ))}
                    {modifierGroups.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No modifier groups available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              {/* Additional Settings */}
              <Card variant="secondary">
                <CardHeader>
                  <h3 className="font-semibold">Additional Settings</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dailyLimit">Daily Limit</Label>
                    <Input
                      id="dailyLimit"
                      type="number"
                      min="0"
                      value={selectedProduct?.daily_limit || 0}
                      onChange={(e) =>
                        setSelectedProduct((prev: any) => ({
                          ...prev!,
                          daily_limit: parseInt(e.target.value) || 0
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Set to 0 for unlimited
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allowNotes"
                        checked={!!selectedProduct?.allow_notes}
                        onCheckedChange={(checked) =>
                          setSelectedProduct((prev: any) => ({
                            ...prev!,
                            allow_notes: !!checked
                          }))
                        }
                      />
                      <Label htmlFor="allowNotes" className="text-sm">
                        Allow customer notes
                      </Label>
                    </div>
                    {!!selectedProduct?.allow_notes && (
                      <Textarea
                        value={selectedProduct?.notes || ''}
                        onChange={(e) =>
                          setSelectedProduct((prev: any) => ({
                            ...prev!,
                            notes: e.target.value
                          }))
                        }
                        placeholder="Default notes (optional)"
                        rows={2}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <Modal
          onClose={() => setIsAddModifiersModalOpen(false)}
          title="Add Modifier"
          description="Create a new modifier"
          isOpen={isAddModifiersModalOpen}
        >
          <ModifiersTab
            title="Modifiers"
            data={addModifiersProps.filteredAddons}
            onAdd={() => addModifiersProps.openModal('addon')}
            onSearch={(term: any) => addModifiersProps.setSearchTerm(term)}
            searchTerm={addModifiersProps.searchTerm}
            handleSave={addModifiersProps.handleAddOnSave}
            selectedModifier={addModifiersProps.selectedModifier}
            setSelectedModifier={addModifiersProps.setSelectedModifier}
          />
        </Modal>
        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end space-x-4 border-t bg-background py-6">
          {hasImageChanges && (
            <div className="mr-auto flex items-center rounded bg-amber-50 px-3 py-1 text-sm text-amber-600">
              <span className="mr-2">⚠️</span>
              You have unsaved image changes
            </div>
          )}
          <Button
            variant="outline"
            onClick={onClose}
            disabled={hasImageChanges}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveProduct}
            disabled={isSaving}
            className="w-40"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};
export default FormFields;
