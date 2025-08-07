import React, { useEffect, useState, useRef } from 'react';

import moment from 'moment';
import { Product } from '../../types';
import { toast } from '@/components/ui/use-toast';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';

import {
  TableForFixedHeader,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { SortableProductCard } from './SortableProductCard';
import { SortableCategory } from './SortableCategory';

import { Plus, Pencil, Minus } from 'lucide-react';
import Image from 'next/image';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useApi } from '@/hooks/useApi';
import ModifiersTab from '@/app/dashboard/inventory/modifiersTab';
import ModifierGroupsSection from './ModifierGroupsSection';

import { Modal } from '@/components/ui/modal';

interface OnlineStoreProductSectionProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onlineCategories: any[];
  setOnlineCategories: React.Dispatch<React.SetStateAction<any[]>>;
  onlineStoreData: any;
  setUploadImageData: (value: File) => void;
  setUploadLogoData: (value: File) => void;
  existingProducts: Product[];
  setExistingProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  addCategory: (newCategoryName: string) => void;
  token: string;
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  onEditProduct: (product: Product) => void;
  setSelectedProduct: React.Dispatch<React.SetStateAction<Product | null>>;
  selectedProduct: Product | null;
  onAdd: any;
  setSelectedItem: React.Dispatch<React.SetStateAction<Product | null>>;
  inventoryCategories: any[];
  handleProductSave: (product: any) => void;
  addModifiersProps?: any;
  handlesSave: (isClickCreateStore?: boolean) => Promise<void>;
}

const OnlineStoreProductSection: React.FC<OnlineStoreProductSectionProps> = ({
  products,
  setProducts,
  onlineCategories,
  setOnlineCategories,
  onlineStoreData,
  setUploadImageData,
  setUploadLogoData,
  existingProducts,
  setExistingProducts,
  addCategory,
  token,
  selectedCategories,
  setSelectedCategories,
  onEditProduct,
  selectedProduct,
  setSelectedProduct,
  onAdd,
  setSelectedItem,
  inventoryCategories,
  handleProductSave,
  addModifiersProps,
  handlesSave
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loadingExistingProducts, setLoadingExistingProducts] = useState(true);
  const [searchExistingTerm, setSearchExistingTerm] = useState<string>('');
  const [selectedExistingCategory, setExistingSelectedCategory] =
    useState<string>('All');
  const [modifierGroups, setModifierGroups] = useState<any[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isModifierDialogOpen, setIsModifierDialogOpen] = useState(false);
  const [isOpenCategoryModal, setIsOpenCategoryModal] = useState(false);
  const inventorySectionRef = useRef<HTMLDivElement | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [filteredExistingProducts, setFilteredExistingProducts] = useState<
    Product[] | null
  >(null);
  const {
    updateOnlineStoreSettings,
    deleteOnlineCategory,
    sortOnlineStoreCategories,
    getModifierGroups
  } = useApi();

  useEffect(() => {
    setLoadingExistingProducts(true);
    setFilteredExistingProducts(null);

    const timeout = setTimeout(() => {
      let filtered = existingProducts;

      if (selectedExistingCategory !== 'All') {
        filtered = filtered.filter(
          (product: any) =>
            product.category_names?.some(
              (name: string) =>
                name.toLowerCase() === selectedExistingCategory.toLowerCase()
            )
        );
      }

      if (searchExistingTerm.trim() !== '') {
        filtered = filtered.filter(
          (product: any) =>
            product.product_name
              ?.toLowerCase()
              .includes(searchExistingTerm.toLowerCase())
        );
      }

      setFilteredExistingProducts(filtered);
      setLoadingExistingProducts(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [existingProducts, selectedExistingCategory, searchExistingTerm]);

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
          const newArray = arrayMove(items, oldIndex, newIndex);

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
        categories: onlineCategories.map((cat) => ({
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
          (cat) => cat.id !== categoryId
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
    const excludedProducts = products.map((category: any) => ({
      ...category,
      products:
        category.products?.filter(
          (product: any) =>
            !existingProducts.some(
              (existingProduct) =>
                existingProduct.product_id === product.id ||
                existingProduct.id === product.id
            )
        ) || []
    }));

    const categoryFilteredProducts =
      selectedCategory === 'All'
        ? excludedProducts
        : excludedProducts.filter(
            (category: any) => category.name === selectedCategory
          );

    const searchedAndFilteredProducts = categoryFilteredProducts
      .map(
        (category: any) =>
          category.products?.filter((product: any) =>
            product.title.toLowerCase().includes(searchTerm.toLowerCase())
          ) || []
      )
      .flat();

    setFilteredProducts(searchedAndFilteredProducts);
  }, [selectedCategory, searchTerm, existingProducts, products]);

  const handleAddProduct = async (product: any) => {
    if (!selectedCategories.length) {
      toast({
        title: 'Error',
        description: 'Please select an online store category first',
        variant: 'destructive'
      });
      return;
    }

    if (!existingProducts.some((p) => (p.product_id || p.id) === product.id)) {
      const productWithCategory = {
        ...product,
        product_id: product.id,
        product_name: product.title || product.product_name || '',
        product_desc: product.description || product.product_desc || '',
        unit_barcode: '',
        case_barcode: '',
        availability: 'Always',
        prep_time: product.prep_time || 0,
        photos:
          product.photos ||
          (product.photo ? [{ image_path: product.photo }] : []),
        category_id: selectedCategories[0],
        category_ids: selectedCategories,
        use_pos_image: false
      };

      const newExistingProducts = [...existingProducts, productWithCategory];

      try {
        const response = await updateOnlineStoreSettings({
          ...onlineStoreData,
          products: newExistingProducts
        });

        setExistingProducts(response.data.online_store.products);

        toast({
          title: 'Success',
          description: 'Product has been added to the store',
          variant: 'success'
        });
      } catch (error) {
        console.error('Add Product Error:', error);
        toast({
          title: 'Error',
          description: 'Failed to add product to store',
          variant: 'destructive'
        });
      }
    }
  };
  const handleDeleteProduct = async (targetProduct: Product) => {
    try {
      const updatedProducts = existingProducts.filter((product: any) => {
        const selectedId = targetProduct?.pos_product?.id || targetProduct?.id;
        const currentId = product?.product_id || product?.id;
        return currentId?.toString() !== selectedId?.toString();
      });

      const response = await updateOnlineStoreSettings({
        ...onlineStoreData,
        products: updatedProducts
      });

      setExistingProducts(response.data.online_store.products);

      toast({
        title: 'Success',
        description: 'Product has been removed successfully',
        variant: 'success'
      });
    } catch (error) {
      console.error('Delete Online Product Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive'
      });
    }
  };
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setExistingProducts((items) => {
        const oldIndex = items.findIndex(
          (item) => item.id.toString() === active.id
        );
        const newIndex = items.findIndex(
          (item) => item.id.toString() === over.id
        );

        if (oldIndex !== -1 && newIndex !== -1) {
          const newArray = arrayMove(items, oldIndex, newIndex);
          const updatedArray = newArray.map((item, index) => ({
            ...item,
            sort_order: index
          }));
          return updatedArray;
        }
        return items;
      });
    }
  };
  useEffect(() => {
    setNewCategoryName('');
  }, [isCategoryDialogOpen]);

  const onToggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const isSelected = prev.includes(categoryId);
      if (isSelected) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleEditProduct = (item: any) => {
    setSelectedProduct(item);
    setSelectedItem(item);
    onAdd();
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
  const handleActivate = (item: any) => {
    try {
      const updatedProduct = {
        ...item,
        is_active: item.is_active === 1 ? 0 : 1,
        category_id: item.pos_product_category_id
      };

      handleProductSave(updatedProduct);
      toast({
        title: 'Success',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error activating product:', error);
      toast({
        title: 'Error',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <div className="py-8">
        <div className="mb-10 items-center justify-between gap-4 md:flex">
          <div className="">
            <h2 className="text-xl font-semibold text-foreground">
              Manage Online Products
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add products to your online store
            </p>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-48">
                  <Pencil size={16} className="mr-2" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={onAdd}>
                  <Plus size={16} className="mr-2" />
                  Create Product
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsCategoryDialogOpen(true)}>
                  <Pencil size={16} className="mr-2" />
                  Manage Categories
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsModifierDialogOpen(true)}>
                  <Pencil size={16} className="mr-2" />
                  Manage Modifiers
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="secondary"
              onClick={() => {
                inventorySectionRef.current?.scrollIntoView({
                  behavior: 'smooth'
                });
              }}
              className="w-48"
            >
              <Plus size={16} className="mr-2" />
              Add from Inventory
            </Button>
          </div>
        </div>

        <Dialog
          open={isCategoryDialogOpen}
          onOpenChange={setIsCategoryDialogOpen}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Manage Categories</DialogTitle>
              <DialogDescription>
                Drag and drop to reorder categories. Click delete to remove a
                category. You can also add a new category.
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
                    onChange={(e) => setNewCategoryName(e.target.value)}
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
                    items={onlineCategories.map((c) => c.id.toString())}
                    strategy={verticalListSortingStrategy}
                  >
                    {[...onlineCategories]
                      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
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
                  <Button onClick={saveCategories}>Save Changes</Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
        <Dialog
          open={isModifierDialogOpen}
          onOpenChange={setIsModifierDialogOpen}
        >
          <DialogContent className="w-full md:max-w-[1200px]">
            <>
              <div className="z-20 pt-6 md:grid md:grid-cols-2">
                <div className="py-6 md:border-r md:px-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    Modifiers
                  </h2>
                  <p className="mb-8 mt-2 text-sm text-muted-foreground">
                    Create and manage product modifiers for your menu items.
                  </p>
                  <ModifiersTab
                    title="Modifiers"
                    data={addModifiersProps.filteredAddons}
                    onAdd={() => addModifiersProps.openModal('addon')}
                    onSearch={(term: any) => setSearchTerm(term)}
                    searchTerm={searchTerm}
                    handleSave={addModifiersProps.handleAddOnSave}
                    selectedModifier={addModifiersProps.selectedModifier}
                    setSelectedModifier={addModifiersProps.setSelectedModifier}
                  />
                </div>
                <div className="py-6 md:px-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    Modifier Group
                  </h2>
                  <p className="mb-8 mt-2 text-sm text-muted-foreground">
                    Create and manage product modifier group for your menu
                    items.
                  </p>
                  <ModifierGroupsSection
                    allModifiers={addModifiersProps.allModifiers}
                    fetchModifierGroups={fetchModifierGroups}
                  />
                </div>
              </div>
            </>
          </DialogContent>
        </Dialog>
        <div className="mb-40">
          {/* Existing */}
          <div className="">
            <div className="border-b px-4 py-3">
              <h2 className="text-lg font-semibold">Existing Products</h2>
            </div>
            <div className="my-6 flex items-end gap-4">
              <div className="w-full max-w-sm">
                <Label
                  htmlFor="existing-category-select"
                  className="mb-1 block text-sm font-medium"
                >
                  Filter by Online Category
                </Label>
                <Select
                  value={selectedExistingCategory}
                  onValueChange={(value) => setExistingSelectedCategory(value)}
                >
                  <SelectTrigger
                    id="existing-category-select"
                    className="w-full"
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    <SelectItem value="All">All</SelectItem>
                    {onlineCategories.map((category: any) => (
                      <SelectItem
                        key={category.id}
                        value={category.category_name}
                      >
                        {category.category_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full max-w-sm">
                <Input
                  id="existing-search"
                  type="text"
                  placeholder="Search by name..."
                  value={searchExistingTerm}
                  onChange={(e) => setSearchExistingTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="relative max-h-[400px] overflow-y-auto">
              <TableForFixedHeader>
                <TableHeader className="sticky top-0 bg-secondary">
                  <TableRow>
                    <TableHead className="w-1/6">Product</TableHead>
                    <TableHead className="text-center">Cost</TableHead>
                    <TableHead className="text-center">POS Price</TableHead>
                    <TableHead className="text-center">Online Price</TableHead>
                    <TableHead className="text-center">
                      Online Category
                    </TableHead>
                    <TableHead className="text-center">Modifiers</TableHead>
                    <TableHead className="text-center">
                      Modifier Groups
                    </TableHead>
                    <TableHead className="text-center">Daily Limit</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-center">Updated At</TableHead>
                    <TableHead className="text-center">Edit</TableHead>
                    <TableHead className="text-center">
                      Remove from Store
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredExistingProducts === null ||
                  loadingExistingProducts ? (
                    <TableRow>
                      <TableCell
                        colSpan={12}
                        className="py-6 text-center text-muted-foreground"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Loader className="h-5 w-5 animate-spin text-muted" />
                          <span>Loading products...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredExistingProducts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={12}
                        className="py-6 text-center text-muted-foreground"
                      >
                        No products found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExistingProducts.map((item: Product) => (
                      <TableRow
                        key={item.id}
                        onClick={() => onEditProduct(item)}
                        className="cursor-pointer"
                      >
                        <TableCell className="">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 overflow-hidden rounded-full bg-muted">
                              <Image
                                src={
                                  item.photos?.[0]?.image_path
                                    ? `${process.env.NEXT_PUBLIC_IMG_URL}${item.photos[0].image_path}`
                                    : '/placeholder-img.png'
                                }
                                width={40}
                                height={40}
                                alt={item.title}
                                className="h-full object-cover"
                              />
                            </div>
                            <span className="truncate">
                              {item.product_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          ${item?.pos_product?.cost || '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          ${item?.pos_product?.price || '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          ${item.price}
                        </TableCell>
                        <TableCell className="">
                          <div className="flex justify-center gap-1">
                            {Array.isArray(item.category_ids) &&
                            item.category_ids.length > 0 ? (
                              onlineCategories
                                .filter((category: any) =>
                                  item.category_ids
                                    .map(String)
                                    .includes(String(category.id))
                                )
                                .map((category: any) => (
                                  <Badge key={category.id}>
                                    {category.category_name}
                                  </Badge>
                                ))
                            ) : item.category_id ? (
                              (() => {
                                const matched = onlineCategories.find(
                                  (cat: any) =>
                                    String(cat.id) === String(item.category_id)
                                );
                                return matched ? (
                                  <Badge key={matched.id}>
                                    {matched.category_name}
                                  </Badge>
                                ) : (
                                  <p className="text-center text-muted-foreground">
                                    -
                                  </p>
                                );
                              })()
                            ) : (
                              <span className="text-center text-muted-foreground">
                                -
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="">
                          <div className="text-center">
                            {Array.isArray(item.modifiers) &&
                            item.modifiers.length > 0
                              ? item.modifiers?.map((mod: any) => (
                                  <Badge key={mod.id} variant="secondary">
                                    {mod.price && mod.price > 0
                                      ? `${mod.name} ($${mod.price})`
                                      : mod.name}
                                  </Badge>
                                ))
                              : '-'}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {Array.isArray(item.modifier_groups) &&
                          item.modifier_groups.length > 0
                            ? item.modifier_groups.map((group: any) => (
                                <Badge key={group.id} variant="secondary">
                                  {group.name}
                                </Badge>
                              ))
                            : '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.daily_limit ?? '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.pos_product?.stock ?? '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.pos_product?.updated_at
                            ? moment(item.pos_product.updated_at).format(
                                'MMM D, YYYY'
                              )
                            : '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              onEditProduct(item);
                            }}
                          >
                            <Pencil size={16} />
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant={'outline'}
                            size="sm"
                            className="p-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProductToDelete(item);
                              setIsDeleteModalOpen(true);
                            }}
                          >
                            <Minus size={12} /> Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </TableForFixedHeader>
            </div>
          </div>
          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setProductToDelete(null);
            }}
            title="Remove Product"
            description="Are you sure you want to remove this product from the store?"
          >
            <div className="mt-6 flex justify-center gap-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setProductToDelete(null);
                }}
                className="w-32"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="w-32"
                onClick={() => {
                  if (productToDelete) {
                    handleDeleteProduct(productToDelete);
                  }
                  setIsDeleteModalOpen(false);
                  setProductToDelete(null);
                }}
              >
                Remove
              </Button>
            </div>
          </Modal>
          {/* Products from Inventory */}
          <div className="mt-16" ref={inventorySectionRef}>
            <div className="mb-6 border-b px-4 py-3">
              <h2 className="text-lg font-semibold">Products from Inventory</h2>
            </div>
            <div className="mb-6 flex items-end gap-4">
              <div className="w-full max-w-sm">
                <Label
                  htmlFor="category-select"
                  className="mb-1 block text-sm font-medium"
                >
                  Filter by Category
                </Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => setSelectedCategory(value)}
                >
                  <SelectTrigger id="category-select" className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    <SelectItem value="All">All</SelectItem>
                    {products.map((category: any) => (
                      <SelectItem key={category.name} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-sm"
              />
            </div>
            <div className="relative max-h-[400px] overflow-y-auto">
              <TableForFixedHeader>
                <TableHeader className="sticky top-0 bg-secondary">
                  <TableRow>
                    <TableHead className="w-1/6">Product</TableHead>
                    <TableHead className="text-center">Cost</TableHead>
                    <TableHead className="text-center">Price</TableHead>
                    <TableHead className=" text-center">Category</TableHead>
                    <TableHead className="text-center">Code</TableHead>
                    <TableHead className=" text-center">Stock</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Last Updated</TableHead>
                    <TableHead className="text-center">Edit</TableHead>
                    <TableHead className="w-1/6">Add to Store</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="py-6 text-center text-muted-foreground"
                      >
                        No products found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((item: Product) => (
                      <TableRow
                        key={item.id}
                        onClick={() => {
                          handleEditProduct(item);
                        }}
                        className="cursor-pointer"
                      >
                        <TableCell className="flex items-center gap-3 py-2">
                          {item.color ? (
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{
                                backgroundColor: item.color
                              }}
                            ></div>
                          ) : (
                            <div className="h-2 w-2 rounded-full bg-border" />
                          )}
                          <div className="h-10 w-10 overflow-hidden rounded-full bg-muted">
                            <Image
                              src={
                                item.photo
                                  ? `${process.env.NEXT_PUBLIC_IMG_URL}${item.photo}`
                                  : '/placeholder-img.png'
                              }
                              width={40}
                              height={40}
                              alt={item.title}
                              className="h-full object-cover"
                            />
                          </div>
                          <span className="truncate">{item.title}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          ${item.cost || '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          ${item.price}
                        </TableCell>
                        <TableCell className="text-center">
                          {inventoryCategories.find(
                            (category: any) =>
                              category.id === item.pos_product_category_id
                          )?.name || '-'}
                        </TableCell>
                        <TableCell>
                          <p className="text-center">{item.code || '-'}</p>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.stock ? (
                            <span
                              className={`${item.stock > 0 ? '' : 'danger'}`}
                            >
                              {item.stock}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="px-4 text-center">
                          <Badge
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActivate(item);
                            }}
                            variant="secondary"
                            className={`cursor-pointer rounded-full px-2 py-1 hover:opacity-80 ${
                              item.is_active === 1
                                ? 'border-green-500 bg-transparent text-green-500'
                                : 'border-gray text-gray'
                            }`}
                          >
                            {item.is_active === 1 ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-center">
                          {item.updated_at
                            ? new Date(item.updated_at).toLocaleDateString(
                                'en-AU',
                                {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                }
                              )
                            : '-'}
                        </TableCell>
                        <TableCell className="space-x-2 text-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              handleEditProduct(item);
                            }}
                          >
                            <Pencil size={16} />
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant={'outline'}
                            size="sm"
                            className=" p-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (item.is_active === 0) {
                                toast({
                                  title: 'Error',
                                  variant: 'destructive',
                                  description:
                                    'Please activate the product first'
                                });
                              }
                              if (item.is_active === 1) {
                                setSelectedProduct(item);
                                setIsOpenCategoryModal(true);
                              }
                            }}
                          >
                            <Plus size={16} /> Add to Store
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </TableForFixedHeader>
              <Modal
                isOpen={isOpenCategoryModal}
                onClose={() => setIsOpenCategoryModal(false)}
                title="Add Product to Online Store"
                description="Select categories to add this product to your online store."
              >
                {/* Section: Create New Category */}
                <div className="">
                  <div className="mb-8 mt-4 flex flex-wrap gap-4">
                    {onlineCategories?.map((category: any) => (
                      <Label
                        key={category.id}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={selectedCategories.includes(
                            category.id.toString()
                          )}
                          onCheckedChange={() =>
                            onToggleCategory(category.id.toString())
                          }
                        />
                        <span>{category.category_name}</span>
                      </Label>
                    ))}
                  </div>
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setIsCategoryDialogOpen(true)}
                      className="w-full"
                    >
                      <Pencil size={16} className="mr-2" />
                      Manage Categories
                    </Button>
                  </div>
                  <Dialog
                    open={isCategoryDialogOpen}
                    onOpenChange={setIsCategoryDialogOpen}
                  >
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Manage Categories</DialogTitle>
                        <DialogDescription>
                          Drag and drop to reorder categories. Click delete to
                          remove a category. You can also add a new category.
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
                              items={onlineCategories.map((c) =>
                                c.id.toString()
                              )}
                              strategy={verticalListSortingStrategy}
                            >
                              {[...onlineCategories]
                                .sort(
                                  (a, b) =>
                                    (a.sort_order || 0) - (b.sort_order || 0)
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
                <div className="mt-8 flex justify-center gap-4">
                  <Button
                    variant="secondary"
                    onClick={() => setIsOpenCategoryModal(false)}
                    className="w-40"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      handleAddProduct(selectedProduct);
                      setIsOpenCategoryModal(false);
                    }}
                    className="w-40"
                    disabled={!selectedCategories.length}
                  >
                    Add
                  </Button>
                </div>
              </Modal>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default OnlineStoreProductSection;
