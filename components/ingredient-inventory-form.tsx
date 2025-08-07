import React, { useEffect, useState } from 'react';
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
import Image from 'next/image';
import axios from 'axios';
import { toast } from './ui/use-toast';
import { useSession } from 'next-auth/react';
import CategoryInventoryForm from './category-inventory-form';
import SuppliersInventoryForm from './forms/SuppliersInventoryForm';
import LocationInventoryForm from './forms/inventory-location-form';
import { useApi } from '@/hooks/useApi';
import UnitDescriptionForm from './forms/UnitDescriptionForm';
import OrderUnitDescriptionForm from './forms/OrderUnitDescForm';
import { Card, CardContent, CardHeader } from './ui/card';
import { Textarea } from './ui/textarea';

interface IngredientInventoryFormProps {
  isOpen: boolean;
  onSubmit: (data: any) => any;
  onClose: () => void;
  itemData: any;
  inventoryData: any;
  setUpdatedData: any;
  setInventoryData?: any;
  supplierName?: any;
  supplierStockNumber?: any;
}

export default function IngredientInventoryForm({
  isOpen,
  onSubmit,
  onClose,
  itemData,
  inventoryData,
  setUpdatedData,
  setInventoryData
}: IngredientInventoryFormProps) {
  const [productData, setProductData] = useState({
    size: '',
    supplier: null,
    is_enable: true,
    last_cost: '',
    location: null,
    // avg_cost: '',
    par_level_unit: '',
    product_number: '',
    barcode: '',
    pos_inventory_item_categories: null as any,
    pos_inventory_item_stock: null as any,
    minimum_level: '',
    measurement_desc: '',
    order_unit_desc: '',
    item_category: '',
    notes: '',
    cost_per_unit: '',
    unit_desc: '',
    measurement_unit: null as any,
    gst: 0,
    stock_unit: '',
    product_name: '',
    stock_amount: '',
    order_unit: '',
    sku: '',
    colour: '',
    photo: '',
    quantity: 0
  });
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isOrderUnitDescModalOpen, setIsOrderUnitDescModalOpen] =
    useState(false);
  const [isUnitDescModalOpen, setIsUnitDescModalOpen] = useState(false);

  const {
    createInventorySupplier,
    createInventoryCategory,
    createInventoryLocation,
    createMeasurementUnit,
    createOrderUnit,
    createUnitDescription
  } = useApi();
  const [ingredientPhoto, setIngredientPhoto] = useState<any>(null);
  const { data: session } = useSession();

  const removeProductData = () => {
    setProductData({
      supplier: null,
      is_enable: true,
      last_cost: '',
      location: null,
      // avg_cost: '',
      par_level_unit: '',
      size: '',
      product_number: '',
      barcode: '',
      pos_inventory_item_categories: null,
      minimum_level: '',
      measurement_desc: '',
      order_unit_desc: '',
      item_category: '',
      notes: '',
      unit_desc: '',
      measurement_unit: null,
      gst: 0,
      pos_inventory_item_stock: null as any,
      stock_unit: '',
      product_name: '',
      stock_amount: '',
      order_unit: '',
      sku: '',
      colour: '',
      photo: '',
      quantity: 0,
      cost_per_unit: ''
    });
  };

  useEffect(() => {
    if (itemData === null) {
      removeProductData();
    } else {
      setProductData((prevData) => ({
        ...prevData,
        supplier: itemData?.supplier_id || null,
        is_enable: itemData?.is_enable || true,
        last_cost: itemData?.last_cost || itemData?.price || '',
        location: itemData?.location?.id || null,
        // avg_cost: itemData?.avg_cost || itemData?.price || '',
        par_level_unit: itemData?.par_level_unit || '',
        size: itemData?.size || '',
        product_number: itemData?.product_number || '',
        barcode: itemData?.barcode || '',
        pos_inventory_item_categories:
          itemData?.pos_inventory_item_categories?.id || null,
        minimum_level: itemData?.minimum_level || '',
        measurement_desc: itemData?.measurement_desc || '',
        order_unit_desc: itemData?.order_unit_desc || '',
        item_category: itemData?.item_category || '',
        notes: itemData?.notes || '',
        cost_per_unit: itemData?.cost_per_unit || itemData?.price || '',
        unit_desc: itemData?.unit_desc || '',
        measurement_unit: itemData?.measurement_unit?.id || null,
        gst: itemData?.gst || 0,
        stock_unit: itemData?.stock_unit || '',
        product_name: itemData?.product_name || itemData?.name || '',
        stock_amount: itemData?.stock_amount || itemData?.quantity || '0',
        pos_inventory_item_stock: itemData?.pos_inventory_item_stock || null,
        order_unit: itemData?.order_unit || '',
        sku: itemData?.sku || '',
        colour: itemData?.colour || '',
        supplier_id: itemData?.supplier_id || null
      }));
    }
  }, [itemData]);

  const handleChange = (e: any) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (field: string, value: any) => {
    setProductData({ ...productData, [field]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setIngredientPhoto(file);
    }
  };

  const handleSubmit = async () => {
    const requiredFields = [
      { name: 'measurement_unit', label: 'Measurement Unit' },
      { name: 'size', label: 'Size' }
    ];

    const missingFields = requiredFields.filter(
      (field) => !productData[field.name as keyof typeof productData]
    );

    if (missingFields.length > 0) {
      const missingFieldLabels = missingFields
        .map((field) => field.label)
        .join(', ');
      toast({
        title: 'Missing Required Fields',
        description: `Please fill in the following fields: ${missingFieldLabels}.`,
        variant: 'destructive'
      });
      return;
    }

    try {
      const measurementUnit = inventoryData.measurementUnits.find(
        (mu: any) => mu.id === productData.measurement_unit
      );
      const formattedData = {
        ...productData,
        supplier: inventoryData.suppliers.find(
          (s: any) => s.id === productData.supplier
        ),
        location: inventoryData.locations.find(
          (l: any) => l.id === productData.location
        ),
        pos_inventory_item_categories: inventoryData.categories.find(
          (c: any) => c.id === productData.pos_inventory_item_categories
        ),
        measurement_unit: measurementUnit,
        created_at: itemData?.created_at || new Date().toISOString(),
        photo: itemData?.photo || '',
        updated_at: new Date().toISOString(),
        user_id: itemData?.user_id || session?.user.id,
        measurement_desc: measurementUnit?.abbreviation || null,
        cost_per_unit: productData.cost_per_unit || '',
        stock_amount: productData.stock_amount || ''
      };
      if (itemData?.id) {
        // @ts-ignore
        formattedData.id = itemData?.id;
      }
      const response = await onSubmit(formattedData);

      if (ingredientPhoto) {
        await saveImageApi(response?.data?.prod_item?.id);
      }
      setUpdatedData((prev: any) => !prev);

      toast({
        title: 'Ingredient Created/Updated successfully',
        description: 'Ingredient Created/Updated successfully',
        variant: 'success'
      });

      onClose();
    } catch (err) {
      console.error('Error creating/updating ingredient:', err);
      toast({
        title: 'Error',
        description:
          // @ts-ignore
          err?.response?.data?.message || 'Error creating/updating ingredient',
        variant: 'destructive'
      });
    }
  };

  const addNewSupllier = async (newSupplier: any) => {
    try {
      const response = await createInventorySupplier(newSupplier);
      setUpdatedData((prev: any) => !prev);
      toast({
        title: 'Supplier added successfully',
        type: 'background',
        description: 'Supplier added successfully',
        variant: 'success'
      });
    } catch (err) {
      toast({
        title: 'Error',
        type: 'background',
        description:
          // @ts-ignore
          err?.response?.data?.message || 'Error creating ingredient',
        variant: 'destructive'
      });
      console.error(err);
    }
  };

  const addNewInventoryCategory = async (newCategory: any) => {
    try {
      const response = await createInventoryCategory(newCategory);
      setUpdatedData((prev: any) => !prev);
      toast({
        title: 'Category added successfully',
        type: 'background',
        description: 'Category added successfully',
        variant: 'success'
      });
    } catch (err) {
      toast({
        title: 'Error',
        type: 'background',
        description:
          // @ts-ignore
          err?.response?.data?.message || 'Error creating ingredient',
        variant: 'destructive'
      });
      console.error(err);
    }
  };

  const addNewOrderUnitDesc = async (newOrderUnitDesc: any) => {
    try {
      const response = await createOrderUnit(newOrderUnitDesc);
      setUpdatedData((prev: any) => !prev);
      toast({
        title: 'Order Unit Description added successfully',
        type: 'background',
        description: 'Order Unit Description added successfully',
        variant: 'success'
      });
    } catch (err) {
      toast({
        title: 'Error',
        type: 'background',
        description:
          // @ts-ignore
          err?.response?.data?.message || 'Error creating ingredient',
        variant: 'destructive'
      });
      console.error(err);
    }
  };

  const addNewUnitDesc = async (newUnitDesc: any) => {
    try {
      const response = await createUnitDescription(newUnitDesc);
      setUpdatedData((prev: any) => !prev);
      toast({
        title: 'Unit Description added successfully',
        type: 'background',
        description: 'Unit Description added successfully',
        variant: 'success'
      });
    } catch (err) {
      toast({
        title: 'Error',
        type: 'background',
        description:
          // @ts-ignore
          err?.response?.data?.message || 'Error creating ingredient',
        variant: 'destructive'
      });
      console.error(err);
    }
  };

  const addNewInventoryLocation = async (newLocation: any) => {
    try {
      const response = await createInventoryLocation(newLocation);
      setUpdatedData((prev: any) => !prev);
      toast({
        title: 'Location added successfully',
        type: 'background',
        description: 'Location added successfully',
        className: 'bg-green-500 text-white'
      });
    } catch (err) {
      toast({
        title: 'Error',
        type: 'background',
        description:
          // @ts-ignore
          err?.response?.data?.message || 'Error creating ingredient',
        variant: 'destructive'
      });
      console.error(err);
    }
  };

  const saveImageApi = async (id?: any) => {
    const formData = new FormData();
    formData.append('image', ingredientPhoto);
    formData.append('id', id ? id : itemData ? itemData.id : 0);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}pos/inventory/item/photo/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${session?.user.token}`
          }
        }
      );
      setUpdatedData((prev: any) => !prev);
      toast({
        title: 'Image uploaded successfully',
        type: 'background',
        description: 'Image uploaded successfully',
        variant: 'success'
      });
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        type: 'background',
        description:
          // @ts-ignore
          err?.response?.data?.message || 'Error creating ingredient',
        variant: 'destructive'
      });
    }
  };

  return (
    <div
      className={`fixed right-0 top-0 z-50 h-full w-full transform overflow-y-scroll bg-background shadow-lg transition-transform duration-300 ease-in-out md:w-2/3 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="relative">
        <div className="sticky top-0 z-30 bg-background p-6">
          <button onClick={onClose} className="">
            &times; Close
          </button>
          <h2 className="text-xl font-bold">Edit Ingredient</h2>
        </div>
        <div className="h-[100dvh - 200px] flex flex-col gap-4 overflow-y-scroll px-6 md:flex-row">
          {/* Left side - Image and basic info */}
          <div className="w-full bg-background py-4 md:w-1/3">
            <Card className="bg-secondary">
              <CardHeader>
                <div className="mb-4 flex items-center justify-center">
                  {ingredientPhoto ? (
                    <Image
                      src={URL.createObjectURL(ingredientPhoto)}
                      width="200"
                      height="200"
                      alt={productData.product_name || ''}
                      className="rounded-lg"
                    />
                  ) : itemData?.photo ? (
                    <Image
                      src={`${
                        process.env.NEXT_PUBLIC_IMG_URL + itemData.photo
                      }`}
                      className="rounded-lg"
                      width="200"
                      height="200"
                      alt={itemData?.product_name}
                    />
                  ) : (
                    <div className="flex h-[200px] w-[200px] items-center justify-center rounded-lg bg-gray-200">
                      <p className="text-center text-black">
                        {itemData
                          ? itemData.product_number
                          : productData.product_number}
                      </p>
                    </div>
                  )}
                </div>
                <input type="file" onChange={handleFileChange} />
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h2 className="mb-2 text-xl font-bold">
                    {productData.product_name}
                  </h2>
                  <p>Size: {productData.size}</p>
                  <p>
                    Stock level:{' '}
                    {productData.pos_inventory_item_stock?.remaining_stock_unit}
                  </p>
                  <p>Cost per unit: ${productData.cost_per_unit}</p>
                </div>

                <p>
                  Category:{' '}
                  {
                    inventoryData.categories.find(
                      (c: any) =>
                        c.id === productData.pos_inventory_item_categories
                    )?.item_category
                  }
                </p>
                <p>
                  Location:{' '}
                  {
                    inventoryData.locations.find(
                      (l: any) => l.id === productData.location
                    )?.location_name
                  }
                </p>
                <p>
                  Supplier:{' '}
                  {
                    inventoryData.suppliers.find(
                      (s: any) => s.id === productData.supplier
                    )?.supplier_name
                  }
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right side - Form fields */}
          <div className="w-full overflow-y-auto py-4 md:w-2/3">
            <Card className="bg-secondary">
              <CardHeader>
                <h2 className="mb-4 text-2xl font-bold">General Information</h2>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Label htmlFor="product_name">Name</Label>
                  <Input
                    id="product_name"
                    name="product_name"
                    placeholder="Product Name"
                    onChange={handleChange}
                    value={productData.product_name}
                    className="mt-2 w-full"
                  />
                </div>

                <div className="mb-4">
                  <Label htmlFor="notes">Note</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Notes"
                    onChange={handleChange}
                    value={productData.notes}
                    className="mt-2 h-[100px] w-full"
                  />
                </div>

                <div className="mb-4 grid  grid-cols-3 items-center gap-4">
                  <div>
                    <Label htmlFor="size">Size</Label>
                    <Input
                      id="size"
                      name="size"
                      placeholder="Size"
                      onChange={handleChange}
                      value={productData.size}
                      className="w-full"
                    />
                  </div>
                  <div className="relative z-10">
                    <Label htmlFor="measurement_unit">Measurement Unit</Label>
                    <Select
                      onValueChange={(value) =>
                        handleSelectChange('measurement_unit', value)
                      }
                      value={productData.measurement_unit}
                    >
                      <SelectTrigger id="measurement_unit">
                        <SelectValue placeholder="Select Unit" />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        className="z-[1000] h-[200px] overflow-y-auto"
                      >
                        {inventoryData.measurementUnits?.map((unit: any) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.unit_of_measurement}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="relative z-10">
                    <Label htmlFor="unit_desc">Unit Description</Label>
                    <Select
                      onValueChange={(value) => {
                        if (value === '0') {
                          setIsUnitDescModalOpen(true);
                        } else {
                          handleSelectChange('unit_desc', value);
                        }
                      }}
                      value={productData.unit_desc?.toString() || undefined}
                    >
                      <SelectTrigger id="unit_desc">
                        <SelectValue placeholder="Select Description" />
                      </SelectTrigger>
                      <SelectContent position="popper" className="h- z-[1000]">
                        {inventoryData.unitDescriptions?.map((desc: any) => (
                          <SelectItem key={desc.id} value={desc.unit_desc}>
                            {desc.unit_desc}
                          </SelectItem>
                        ))}
                        <SelectItem value="0">Add New Description</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div className="relative z-10">
                    <Label htmlFor="location">Location</Label>
                    <Select
                      onValueChange={(value) => {
                        if (value === '0') {
                          setIsLocationModalOpen(true);
                        } else {
                          handleSelectChange('location', value);
                        }
                      }}
                      value={productData.location || undefined}
                    >
                      <SelectTrigger id="location">
                        <SelectValue placeholder="Select Location" />
                      </SelectTrigger>
                      <SelectContent position="popper" className="h- z-[1000]">
                        {inventoryData.locations?.map((location: any) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.location_name}
                          </SelectItem>
                        ))}
                        <SelectItem value="0">Add New Location</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="relative z-10">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Select
                      onValueChange={(value) => {
                        if (value === '0') {
                          setIsSupplierModalOpen(true);
                        } else {
                          handleSelectChange('supplier', value);
                        }
                      }}
                      value={productData.supplier || undefined}
                    >
                      <SelectTrigger id="supplier">
                        <SelectValue placeholder="Select Supplier" />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        className="z-[1000] h-[200px] overflow-y-auto"
                      >
                        {inventoryData.suppliers?.map((supplier: any) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.supplier_name}
                          </SelectItem>
                        ))}
                        <SelectItem value="0">Add New Supplier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4 bg-secondary">
              <CardHeader>
                <h3 className="mb-2 text-xl font-bold">Pricing and Stock</h3>
              </CardHeader>
              <CardContent>
                <div className="mb-4 grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cost_per_unit">Cost per unit ($)</Label>
                    <Input
                      id="cost_per_unit"
                      name="cost_per_unit"
                      placeholder="Cost per Unit"
                      onChange={handleChange}
                      value={productData.cost_per_unit}
                      className="mt-2 w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock_amount">Stock Level</Label>
                    <Input
                      id="stock_amount"
                      name="stock_amount"
                      placeholder="Stock Amount"
                      onChange={handleChange}
                      value={productData.stock_amount}
                      className="mt-2 w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="par_level_unit">Par Level</Label>
                    <Input
                      id="par_level_unit"
                      name="par_level_unit"
                      placeholder="Par Level Unit"
                      onChange={handleChange}
                      value={productData.par_level_unit}
                      className="mt-2 w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="sticky bottom-0 left-0 right-0 z-50 bg-background p-4 shadow-md">
          <div className="flex justify-center">
            <Button onClick={handleSubmit} className="my-2 w-52 rounded-full">
              Update
            </Button>
          </div>
        </div>
      </div>

      {isCategoryModalOpen && (
        <CategoryInventoryForm
          isOpen={isCategoryModalOpen}
          onSubmit={(newCategory: any) => {
            addNewInventoryCategory(newCategory);
            setIsCategoryModalOpen(false);
          }}
          onClose={() => setIsCategoryModalOpen(false)}
          setUpdatedData={setUpdatedData}
        />
      )}
      {isSupplierModalOpen && (
        <SuppliersInventoryForm
          isOpen={isSupplierModalOpen}
          onSubmit={(newSupplier: any) => {
            addNewSupllier(newSupplier);
            setIsSupplierModalOpen(false);
          }}
          onClose={() => setIsSupplierModalOpen(false)}
          setUpdatedData={setUpdatedData}
        />
      )}
      {isLocationModalOpen && (
        <LocationInventoryForm
          isOpen={isLocationModalOpen}
          onSubmit={(newLocation: any) => {
            addNewInventoryLocation(newLocation);
            setIsLocationModalOpen(false);
          }}
          onClose={() => setIsLocationModalOpen(false)}
          setUpdatedData={setUpdatedData}
        />
      )}
      {isOrderUnitDescModalOpen && (
        <OrderUnitDescriptionForm
          isOpen={isOrderUnitDescModalOpen}
          onSubmit={(newOrderUnitDesc: any) => {
            addNewOrderUnitDesc(newOrderUnitDesc);
            setIsOrderUnitDescModalOpen(false);
          }}
          onClose={() => setIsOrderUnitDescModalOpen(false)}
          setUpdatedData={setUpdatedData}
          inventoryData={inventoryData}
        />
      )}
      {isUnitDescModalOpen && (
        <UnitDescriptionForm
          isOpen={isUnitDescModalOpen}
          onSubmit={(newUnitDesc: any) => {
            addNewUnitDesc(newUnitDesc);
            setIsUnitDescModalOpen(false);
          }}
          onClose={() => setIsUnitDescModalOpen(false)}
          setUpdatedData={setUpdatedData}
        />
      )}
    </div>
  );
}
