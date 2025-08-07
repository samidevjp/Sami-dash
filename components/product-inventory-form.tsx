import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useApi } from '@/hooks/useApi';
import { v4 as uuid } from 'uuid';
import axios from 'axios';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Modal } from './ui/modal';
import { toast } from './ui/use-toast';
import { Table, TableBody, TableCell, TableHeader, TableRow } from './ui/table';
import { Switch } from '@/components/ui/switch';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import ColorPickerModal from '@/components/pos/color-picker-modal';
import ProductInfo from './productInfo';
import { responseOK } from '@/lib/utils';
import { resizeImage } from '@/lib/utils';

interface ProductFormProps {
  isOpen: boolean;
  onSubmit: (data: any) => Promise<any>;
  onClose: () => void;
  itemData?: any;
  categories: any[];
  ingredients: any[];
  saveIngredientInProduct: (data: any) => Promise<any>;
  setUpdatedData: (data: any) => void;
  onRefetch?: () => void;
  isOnlineStore?: boolean;
  onlineStoreProps?: any;
}
export default function ProductForm({
  isOpen,
  onSubmit,
  onClose,
  itemData,
  categories,
  ingredients,
  saveIngredientInProduct,
  setUpdatedData,
  onRefetch,
  isOnlineStore = false,
  onlineStoreProps = {}
}: ProductFormProps) {
  const { data: session } = useSession();
  const { fetchIngredientsFromProduct } = useApi();
  const [productData, setProductData] = useState({
    addOns: [],
    title: '',
    price: 0,
    code: '',
    stock: 0,
    description: '',
    color: '',
    parent_category: null,
    quantity: 0,
    isCancelled: false,
    is_deleted: false,
    pos_product_category_id: '',
    currentTimeStamp: new Date().toISOString(),
    category_id: 0,
    // @ts-ignore
    based_weight: 0,
    // @ts-ignore
    incremental_weight: 0,
    // @ts-ignore
    minimum_weight: 0,
    // @ts-ignore
    maximum_weight: 0,
    note: '',
    barcode: '',
    created_at: new Date().toISOString(),
    is_printed: 0,
    is_pop_up: 0,
    option_ids: [],
    uuid: 0,
    order: 0,
    photo: '',
    status: 1,
    updated_at: new Date().toISOString()
  });
  const [loading, setLoading] = useState(false);
  const [isIngredientsModalOpen, setIsIngredientsModalOpen] = useState(false);
  const [ingredientQuantities, setIngredientQuantities] = useState<{
    [key: string]: number;
  }>({});
  const [showColor, setShowColor] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<any>([]);
  const [filterText, setFilterText] = useState('');
  const [isAddOnlineStore, setisAddOnlineStore] = useState(false);
  const handleQuantityChange = (ingredientId: string, value: number) => {
    setIngredientQuantities((prevQuantities) => ({
      ...prevQuantities,
      [ingredientId]: value
    }));
  };
  const [productPhoto, setProductPhoto] = useState<any>();
  const [isRemovePhotoModalOpen, setIsRemovePhotoModalOpen] = useState(false);
  const ProductData = async () => {
    const product = await fetchIngredientsFromProduct(itemData.id);
    // console.log('product', product);
    if (product.ingredients && product.ingredients.length > 0) {
      const initialSelectedIngredients: any[] = [];
      const initialIngredientQuantities: any = {};
      product.ingredients.forEach((productIngredient: any) => {
        const matchingIngredient = ingredients.find(
          (ingredient: any) =>
            ingredient.id === productIngredient.pos_product_inventory_id
        );
        if (matchingIngredient) {
          initialSelectedIngredients.push(matchingIngredient);
          initialIngredientQuantities[matchingIngredient.id] =
            productIngredient.quantity;
        }
      });
      setSelectedIngredients(initialSelectedIngredients);
      setIngredientQuantities(initialIngredientQuantities);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (itemData) {
        ProductData();
        setProductData({
          title: itemData.title || '',
          price: itemData.price || 0,
          code: itemData.code || '',
          stock: itemData.stock || 0,
          description: itemData.description || '',
          color: itemData.color || '',
          parent_category: itemData.parent_category || null,
          note: itemData.note || '',
          pos_product_category_id: itemData.pos_product_category_id || 0,
          category_id: itemData.pos_product_category_id || 0,
          barcode: itemData.barcode || '',
          created_at: itemData.created_at || '',
          is_pop_up: itemData.is_pop_up || 0,
          // @ts-ignore
          based_weight: itemData.based_weight || 0,
          // @ts-ignore
          incremental_weight: itemData.incremental_weight || 0,
          // @ts-ignore
          minimum_weight: itemData.minimum_weight || 0,
          // @ts-ignore
          maximum_weight: itemData.maximum_weight || 0,
          option_ids: itemData.option_ids || [],
          order: itemData.order || 0,
          photo: itemData.photo || '',
          status: itemData.status || 1,
          updated_at: new Date().toISOString(),
          uuid: itemData.uuid || uuid(),
          is_printed: itemData.is_printed || 0,
          is_deleted: itemData.is_deleted || false,
          isCancelled: itemData.isCancelled || false,
          quantity: itemData.quantity || 0,
          currentTimeStamp: new Date().toISOString(),
          addOns: itemData.addOns || []
        });
      }
      setLoading(false);
    };
    fetchData();
  }, [itemData, ingredients]);
  const handleChange = (e: any) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };
  const handleSelectChange = (field: string, value: any) => {
    setProductData({ ...productData, [field]: value });
  };
  const handleRemovePhoto = () => {
    setProductPhoto(null);
    setProductData((prev) => ({ ...prev, photo: '' }));
  };
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formattedData = {
        ...productData,
        price: Number(productData.price),
        color: productData.color,
        uuid: itemData?.uuid || uuid(),
        pos_product_category_id: Number(productData.category_id),
        is_tax_inclusive: 0,
        option_ids: []
      } as any;

      if (itemData) {
        formattedData.id = itemData.id;
        formattedData.photo =
          productData.photo === '' ? '' : itemData.photo || '';
      }

      // console.log('itemData', itemData);
      // console.log('formattedData', formattedData);
      const newItemData = await onSubmit(formattedData);
      // console.log('newItemData', newItemData);
      if (isAddOnlineStore) {
        const updatedOnlineProduct = {
          id: itemData?.id || newItemData.id,
          product_id: itemData?.id || newItemData.id,
          product_name: productData.title,
          product_desc: productData.description || '',
          price: Number(productData.price),
          category_id: onlineStoreProps.selectedCategories[0] || null,
          category_ids: onlineStoreProps.selectedCategories,
          category_names: onlineStoreProps.selectedCategories.map((id: any) => {
            const match = onlineStoreProps.onlineCategories.find(
              (c: any) => c.id === Number(id)
            );
            return match?.category_name || '';
          }),
          availability: 'Always',
          prep_time: '',
          unit_barcode: '',
          case_barcode: '',
          daily_limit: 0,
          notes: productData.note || '',
          allow_notes: true,
          modifiers: [],
          modifier_groups: [],
          photos: itemData?.photo
            ? [{ image_path: itemData.photo, display_order: 0 }]
            : []
        };
        const updatedProducts = [...onlineStoreProps.existingProducts];
        const existingIndex = updatedProducts.findIndex(
          (p: any) =>
            p.product_id?.toString() ===
            updatedOnlineProduct.product_id?.toString()
        );
        if (existingIndex !== -1) {
          updatedProducts[existingIndex] = {
            ...updatedProducts[existingIndex],
            ...updatedOnlineProduct
          };
        } else {
          updatedProducts.push(updatedOnlineProduct);
        }
        const updatedOnlineStoreSettings = {
          ...onlineStoreProps.onlineStoreData,
          products: updatedProducts
        };
        try {
          await onlineStoreProps.updateOnlineStoreSettings(
            updatedOnlineStoreSettings
          );
          toast({
            title: 'Online Store Product Saved',
            description: 'The product has been added to your online store',
            variant: 'success'
          });
          onlineStoreProps.setExistingProducts(updatedProducts);
        } catch (error: any) {
          console.error('Online store update failed:', error);
          toast({
            title: 'Online Store Error',
            description: error.message || 'Failed to save online store data',
            variant: 'destructive'
          });
        }
      }
      const quantityforIngredients = Object.entries(ingredientQuantities).map(
        ([key, value]) => ({
          ingredient_id: key,
          quantity: value
        })
      );
      // console.log({ quantityforIngredients });
      const ingredientsWithQuantity = selectedIngredients.map(
        (ingredient: any) => {
          const quantity = quantityforIngredients.find(
            (item) => Number(item.ingredient_id) === ingredient.id
          );
          return {
            ...ingredient,
            quantity: quantity?.quantity || 0
          };
        }
      );
      ingredientsWithQuantity.forEach((ingredient: any) => {
        console.log({
          pos_product_id: itemData ? itemData?.id : newItemData.id,
          ingredients: {
            id: ingredient.id,
            quantity: ingredient.quantity,
            quantity_unit: ingredient.measurement_unit,
            measurement_unit: ingredient.measurement_unit,
            cost: Number(ingredient.avg_cost)
          }
        });
      });
      const saved = await saveIngredientInProduct({
        pos_product_id: itemData ? itemData?.id : newItemData.id,
        ingredients: ingredientsWithQuantity.map((ingredient: any) => {
          return {
            pos_product_inventory_id: ingredient.id,
            quantity: ingredient.quantity,
            measurement_unit: ingredient.measurement_unit,
            quantity_unit: ingredient.measurement_unit,
            cost: Number(ingredient.avg_cost),
            isDeleted: false
          };
        })
      });
      if (productPhoto) {
        saveImageApi(newItemData);
      }
      setLoading(false);
      setUpdatedData((prev: any) => !prev);
      setProductPhoto(null);
      setProductData({
        addOns: [],
        title: '',
        price: 0,
        code: '',
        stock: 0,
        description: '',
        color: '',
        parent_category: null,
        quantity: 0,
        isCancelled: false,
        is_deleted: false,
        pos_product_category_id: '',
        currentTimeStamp: new Date().toISOString(),
        category_id: 0,
        note: '',
        barcode: '',
        // @ts-ignore
        based_weight: 0,
        // @ts-ignore
        incremental_weight: 0,
        // @ts-ignore
        minimum_weight: 0,
        // @ts-ignore
        maximum_weight: 0,
        created_at: new Date().toISOString(),
        is_printed: 0,
        is_pop_up: 0,
        option_ids: [],
        uuid: 0,
        order: 0,
        photo: '',
        status: 1,
        updated_at: new Date().toISOString()
      });
      setLoading(false);
      toast({
        title: 'Success',
        description: itemData
          ? itemData.is_active === 1
            ? 'Product activated successfully'
            : 'Product deactivated successfully'
          : 'Product created successfully',
        variant: 'success'
      });
    } catch (err) {
      console.log(err);
      setLoading(false);
      toast({
        title: 'Error',
        // @ts-ignore
        description: err.data.response.data.message || 'Error saving product',
        variant: 'destructive'
      });
    }
    if (onRefetch) onRefetch();
    setLoading(false);
    onClose();
  };
  const handleClose = () => {
    setIngredientQuantities({});
    setSelectedIngredients([]);
    setProductPhoto(null);
    setisAddOnlineStore(false);
    setProductData({
      addOns: [],
      title: '',
      price: 0,
      code: '',
      stock: 0,
      description: '',
      color: '',
      parent_category: null,
      quantity: 0,
      isCancelled: false,
      is_deleted: false,
      pos_product_category_id: '',
      currentTimeStamp: new Date().toISOString(),
      category_id: 0,
      note: '',
      barcode: '',
      // @ts-ignore
      based_weight: 0,
      // @ts-ignore
      incremental_weight: 0,
      // @ts-ignore
      minimum_weight: 0,
      // @ts-ignore
      maximum_weight: 0,
      created_at: new Date().toISOString(),
      is_printed: 0,
      is_pop_up: 0,
      option_ids: [],
      uuid: 0,
      order: 0,
      photo: '',
      status: 1,
      updated_at: new Date().toISOString()
    });
    onClose();
  };
  const handleOpenIngredientsModal = () => {
    setIsIngredientsModalOpen(true);
  };
  const handleSelectIngredient = (ingredient: string) => {
    if (selectedIngredients.includes(ingredient)) {
      setSelectedIngredients(
        selectedIngredients.filter((item: any) => item !== ingredient)
      );
    } else {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };
  const saveImageApi = async (newItemData?: any) => {
    if (!productPhoto) return;
    const maxSizeMB = 0.5;
    const maxWidth = 800;

    let imageToUpload = productPhoto;

    if (productPhoto.size > maxSizeMB * 1024 * 1024) {
      try {
        imageToUpload = await resizeImage(productPhoto, maxSizeMB, maxWidth);
      } catch (resizeError) {
        console.error('Image resize failed:', resizeError);
        toast({
          title: 'Resize Failed',
          description: 'Could not resize the image before upload.',
          variant: 'destructive'
        });
        return;
      }
    }

    const formData = new FormData();
    formData.append('image', imageToUpload);
    formData.append('id', itemData ? itemData.id : newItemData.id || 0);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}pos/product/photo/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${session?.user.token}`
          }
        }
      );
      if (responseOK(response)) {
        toast({
          title: 'Image uploaded successfully',
          type: 'background',
          description: 'Image uploaded successfully',
          variant: 'success'
        });
      }
    } catch (err) {
      console.error(err);
    }
  };
  const productCost = selectedIngredients.reduce(
    (total: number, ingredient: any) => {
      // Calculate the cost based on the quantity
      const ingredientCostPerUnit = Number(ingredient.avg_cost); // cost per unit (e.g., per liter)
      const quantityUsed = ingredientQuantities[ingredient.id] || 0; // quantity used (e.g., 0.08 liters)
      // Total cost for the ingredient
      const totalIngredientCost = (
        ingredientCostPerUnit * quantityUsed
      ).toFixed(2);
      // Add to the total cost
      return Number(totalIngredientCost) + total;
    },
    0
  );
  const handleRemoveIngredient = (ingredientId: string) => {
    setSelectedIngredients((prev: any) =>
      prev.filter((ingredient: any) => ingredient.id !== ingredientId)
    );
    setIngredientQuantities((prevQuantities) => {
      const updatedQuantities = { ...prevQuantities };
      delete updatedQuantities[ingredientId];
      return updatedQuantities;
    });
  };
  const filteredIngredients = ingredients.filter((ingredient: any) =>
    ingredient.product_name.toLowerCase().includes(filterText.toLowerCase())
  );
  return (
    <>
      <Modal
        onClose={() => {
          handleClose();
        }}
        title={itemData ? 'Edit Product' : 'Create Product'}
        description={
          itemData
            ? 'Edit product details here.'
            : 'Create product details here.'
        }
        isOpen={isOpen}
        className="max-w-3xl"
      >
        <div className="max-h-[80vh] overflow-y-auto rounded-lg px-4">
          <div className="mb-16 flex flex-col gap-6 md:grid md:grid-cols-3">
            <div className=""></div>
            {/* Product Image Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="box-border flex h-full max-h-[200px] w-full items-center justify-center overflow-hidden rounded-lg border bg-gray-200 shadow">
                {productPhoto ? (
                  <Image
                    src={URL.createObjectURL(productPhoto)}
                    width="200"
                    height="200"
                    alt="Product"
                    className="rounded-lg"
                  />
                ) : productData.photo === '' ? (
                  <div className="flex h-[200px] w-[200px] items-center justify-center rounded-lg bg-gray-200">
                    <p className="text-center text-black">
                      {productData.code || 'No Image'}
                    </p>
                  </div>
                ) : itemData?.photo ? (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_IMG_URL + itemData.photo}`}
                    width="200"
                    height="200"
                    alt={itemData?.product_name}
                    className="rounded-lg"
                  />
                ) : (
                  <div className="flex h-[200px] w-[200px] items-center justify-center rounded-lg bg-gray-200">
                    <p className="text-center text-black">
                      {productData.code || 'No Image'}
                    </p>
                  </div>
                )}
              </div>
              {(productPhoto || itemData?.photo) && (
                <Button
                  variant="danger"
                  onClick={() => setIsRemovePhotoModalOpen(true)}
                  className="w-full"
                >
                  Remove Image
                </Button>
              )}
              <Input
                type="file"
                onChange={(e) => {
                  setProductPhoto(e.target?.files?.[0]);
                }}
                className="cursor-pointer"
              />
              <Button
                style={{ backgroundColor: productData.color }}
                onClick={() => setShowColor(!showColor)}
                className="w-full"
              >
                Set Color
              </Button>
              <ColorPickerModal
                open={showColor}
                setOpenColorPickerModal={setShowColor}
                sendColor={(color: any) => handleSelectChange('color', color)}
              />
            </div>
            <ProductInfo productData={productData} productCost={productCost} />
          </div>
          <div className="justify-between border-b py-6 sm:flex">
            <Label htmlFor="title" className="flex items-center gap-4">
              <p>Product Name</p>
            </Label>
            <div className="w-full sm:max-w-[500px]">
              <Input
                id="title"
                name="title"
                placeholder="Product Name"
                onChange={handleChange}
                value={productData.title}
                required
                className="mt-2 h-12 w-full"
              />
              <span className="text-xs text-red-500">
                * This field is required
              </span>
            </div>
          </div>
          <div className="justify-between border-b py-6 sm:flex">
            <Label htmlFor="category_id" className="flex items-center gap-4">
              <p>Category</p>
            </Label>
            <div className="mt-2 w-full sm:max-w-[500px]">
              <Select
                onValueChange={(value) =>
                  handleSelectChange('category_id', value)
                }
                defaultValue={itemData ? itemData.pos_product_category_id : 0}
              >
                <SelectTrigger className="h-12 flex-1" id="category_id">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="max-h-[50vh] flex-1 overflow-y-auto">
                  {categories?.map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs text-red-500">
                * This field is required
              </span>
            </div>
          </div>
          <div className="justify-between border-b py-6 sm:flex">
            <Label htmlFor="price" className="flex items-center gap-4">
              Price
            </Label>
            <div className="w-full sm:max-w-[500px]">
              <Input
                id="price"
                name="price"
                placeholder="Price"
                onChange={handleChange}
                value={productData.price}
                required
                className="mt-2 h-12 w-full"
              />
              <span className="text-xs text-red-500">
                * This field is required
              </span>
            </div>
          </div>
          <div className="items-center justify-between border-b py-6 sm:flex">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              name="code"
              placeholder="Code"
              onChange={handleChange}
              value={productData.code}
              className="h-12 w-full sm:max-w-[500px]"
            />
          </div>
          <div className="items-center justify-between border-b py-6 sm:flex">
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              name="stock"
              placeholder="Stock"
              onChange={handleChange}
              value={productData.stock}
              className="h-12 w-full sm:max-w-[500px]"
            />
          </div>
          <div className="items-center justify-between border-b py-6 sm:flex">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              placeholder="Description"
              onChange={handleChange}
              value={productData.description}
              className="h-12 w-full sm:max-w-[500px]"
            />
          </div>
          {isOnlineStore && (
            <div className="border-b py-6">
              <div className="flex items-center gap-4">
                <Label htmlFor="">Add to Online Store</Label>
                <Switch
                  checked={isAddOnlineStore}
                  onCheckedChange={() => setisAddOnlineStore(!isAddOnlineStore)}
                />
              </div>
              {isAddOnlineStore && (
                <>
                  <div className="mx-4 mt-4 flex flex-wrap gap-6">
                    {onlineStoreProps.onlineCategories?.map((category: any) => (
                      <Label
                        key={category.id}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={onlineStoreProps.selectedCategories.includes(
                            category.id.toString()
                          )}
                          onCheckedChange={() =>
                            onlineStoreProps.onToggleCategory(
                              category.id.toString()
                            )
                          }
                        />
                        {category.category_name}
                      </Label>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          <div className="flex w-full flex-col justify-around py-6">
            <div className="mb-4 flex items-center justify-between">
              <Label htmlFor="ingredients">Ingredients</Label>
              <Button
                id="ingredients"
                name="ingredients"
                onClick={handleOpenIngredientsModal}
                className="rounded-full px-6 py-2"
              >
                + Select Ingredients
              </Button>
            </div>
            <div className="min-h-40 rounded-lg bg-secondary p-4">
              <div className="flex flex-wrap">
                {selectedIngredients.length > 0 ? (
                  <>
                    {selectedIngredients.map((ingredient: any) => (
                      <div
                        key={ingredient.id}
                        className="m-2 rounded-full  border-2 bg-transparent p-2 text-xs text-foreground"
                      >
                        {ingredient.product_name}{' '}
                        {ingredientQuantities[ingredient.id]}
                        {ingredient.measurement_unit?.abbreviation}
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-xs italic text-gray-500">
                    No ingredients selected
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="sticky bottom-0 w-full bg-background p-2">
            <div className="flex justify-center">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-40 rounded-full px-6 py-2"
              >
                {loading
                  ? 'Saving...'
                  : itemData
                  ? 'Save Changes'
                  : 'Create Product'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        onClose={() => setIsIngredientsModalOpen(false)}
        title="Select Ingredients"
        description="Ingredients"
        isOpen={isIngredientsModalOpen}
      >
        <div className="flex h-full w-full flex-col p-4">
          <Input
            type="text"
            placeholder="Search ingredients..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="mb-4 w-full"
          />
          <div className="flex max-h-[60vh] w-full flex-col overflow-y-scroll">
            {ingredients.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">
                No ingredients available.
              </p>
            ) : filteredIngredients.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">
                No ingredients found for
                <span className="font-semibold">{filterText}</span>
              </p>
            ) : (
              <>
                <div className="md:hidden">
                  {ingredients
                    .filter((ingredient: any) =>
                      ingredient.product_name
                        .toLowerCase()
                        .includes(filterText.toLowerCase())
                    )
                    ?.map((ingredient: any) => (
                      <div
                        key={ingredient.id}
                        className="mb-2 rounded-lg bg-secondary p-4"
                      >
                        <div className="mb-2 flex items-center">
                          <input
                            type="checkbox"
                            id={ingredient.id}
                            name={ingredient.product_name}
                            checked={selectedIngredients.includes(ingredient)}
                            onChange={() => handleSelectIngredient(ingredient)}
                            className="mr-2"
                          />
                          <label
                            htmlFor={ingredient.id}
                            className="font-semibold"
                          >
                            {ingredient.product_name}
                          </label>
                        </div>
                        <div className="text-sm text-gray-600">
                          Price: ${ingredient.avg_cost}
                        </div>
                        <div className="text-sm text-gray-600">
                          Measurement: {ingredient.measurement_desc}
                        </div>
                        <div className="mt-2">
                          <label className="text-sm">Quantity per Item:</label>
                          <Input
                            value={ingredientQuantities[ingredient.id] || ''}
                            placeholder="Quantity in number"
                            type="number"
                            step="0.001"
                            onChange={(e) =>
                              handleQuantityChange(
                                ingredient.id,
                                parseFloat(e.target.value)
                              )
                            }
                            className="mt-1 w-full"
                          />
                        </div>
                      </div>
                    ))}
                </div>
                <div className="hidden md:block">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableCell>Ingredient</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Measurement Desc</TableCell>
                        <TableCell>Quantity per Item</TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ingredients
                        .filter((ingredient: any) =>
                          ingredient.product_name
                            .toLowerCase()
                            .includes(filterText.toLowerCase())
                        )
                        ?.map((ingredient: any) => (
                          <TableRow key={ingredient.id}>
                            <TableCell>
                              <div className="flex items-center">
                                <Checkbox
                                  name={ingredient.product_name}
                                  checked={selectedIngredients.includes(
                                    ingredient
                                  )}
                                  onCheckedChange={() =>
                                    handleSelectIngredient(ingredient)
                                  }
                                />
                                <label
                                  htmlFor={ingredient.id}
                                  className="ml-2 flex-1 text-foreground"
                                >
                                  {ingredient.product_name}
                                </label>
                              </div>
                            </TableCell>
                            <TableCell>{ingredient.avg_cost}</TableCell>
                            <TableCell>{ingredient.measurement_desc}</TableCell>
                            <TableCell>
                              <Input
                                value={
                                  ingredientQuantities[ingredient.id] || ''
                                }
                                placeholder="Quantity in number"
                                type="number"
                                step={0.01}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    ingredient.id,
                                    Number(e.target.value)
                                  )
                                }
                                className="w-full"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
                <div className=""></div>
              </>
            )}
          </div>
          <div className="border-t">
            <div
              className={`flex max-h-36 flex-wrap gap-2 overflow-y-scroll ${
                selectedIngredients.length > 0 && 'pt-4'
              }`}
            >
              {selectedIngredients.map((ingredient: any) => (
                <div
                  key={ingredient.id}
                  className="flex items-center gap-2 rounded-full border-2 px-2 py-1 text-sm"
                >
                  {ingredient.product_name}
                  <button
                    type="button"
                    className="ml-2"
                    onClick={() => handleRemoveIngredient(ingredient.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="space-y-2 py-6">
              <p className="flex items-end justify-between">
                <span className="mr-2 font-semibold">Product cost:</span>$
                {selectedIngredients.reduce(
                  (total: number, ingredient: any) => {
                    const ingredientCostPerUnit = Number(ingredient.avg_cost); // cost per unit (e.g., per liter)
                    const quantityUsed =
                      ingredientQuantities[ingredient.id] || 0; // quantity used (e.g., 0.08 liters)
                    // Total cost for the ingredient
                    const totalIngredientCost = (
                      ingredientCostPerUnit * quantityUsed
                    ).toFixed(2);
                    // Add to the total cost
                    return Number(totalIngredientCost) + total;
                  },
                  0
                )}
              </p>
              <p className="flex items-end justify-between">
                <span className="mr-2 font-semibold">Product price:</span>$
                {productData.price}
              </p>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isRemovePhotoModalOpen}
        onClose={() => setIsRemovePhotoModalOpen(false)}
        title="Remove Product Image"
        description="Are you sure you want to remove this product image?"
      >
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => setIsRemovePhotoModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              handleRemovePhoto();
              setIsRemovePhotoModalOpen(false);
            }}
          >
            Remove
          </Button>
        </div>
      </Modal>
    </>
  );
}
