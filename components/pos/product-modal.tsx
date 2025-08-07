import React, { useState, useRef } from 'react';
import { CardMedia, Switch } from '@mui/material';
import { Button } from '@/components/ui/button';

import { v4 as uuid } from 'uuid';
import 'react-color-palette/css';
import ColorPickerModal from '@/components/pos/color-picker-modal';
import { useApi } from '@/hooks/useApi';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Dialog, DialogContentWithoutClose } from '../ui/dialog';

const CustomTextField = ({ label, value, onChange }: any) => (
  <div className="flex items-center border-t border-border p-4">
    <p className="min-w-[36%] text-sm ">{label}</p>
    <Input
      placeholder={label}
      value={value}
      onChange={onChange}
      className="w-full rounded-lg border border-border"
    />
  </div>
);

const ProductModal = ({
  open,
  setOpenProductModal,
  selectedCategory,
  editProduct = null,
  imgUrl,
  getRelativeLuminance,
  setEditProduct, // fetchData
  handleFetchItems
}: any) => {
  const {
    code,
    color,
    photo,
    is_pop_up,
    price: editPrice,
    title,
    id: editId,
    stock,
    description
  } = editProduct || {};
  const [productName, setProductName] = useState(title || '');
  const [productCode, setProductCode] = useState(code || '');
  const [productStock, setProductStock] = useState(stock || '');
  const [productDescription, setProductDescription] = useState(
    description || ''
  );

  const [price, setPrice] = useState(editPrice || '');
  const [image, setImage] = useState(photo ? imgUrl + photo : null);
  const [fileObject, setFileObject] = useState<any>(null);
  const [forcePopup, setForcePopup] = useState(
    is_pop_up ? (is_pop_up === 0 ? false : true) : false
  );
  const [colorPickerModalOpen, setOpenColorPickerModal] = useState(false);
  const [productModalColor, setProductModalColor] = useState(color || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event?.target?.files) {
      setImage(URL.createObjectURL(event.target.files[0]));
      setFileObject(event.target.files[0]);
    }
  };
  const { AddProduct, addPhotoToProduct } = useApi();

  const handleAddProduct = async () => {
    let product: {
      barcode: string;
      description: any;
      is_deleted: boolean;
      order: number;
      uuid: string;
      price: number;
      updated_at: Date;
      created_at: Date;
      is_pop_up: number;
      is_printed: number;
      color: any;
      status: number;
      code: any;
      category_id: any;
      currentTimestamp: Date;
      note: string;
      isCancelled: boolean;
      addOns: any[];
      option_ids: any[];
      quantity: number;
      stock: number;
      parent_category: any;
      title: any;
      is_tax_inclusive: number;
      photo: any;
      id?: any;
    } = {
      barcode: '',
      description: productDescription,
      is_deleted: false,
      order: 0,
      uuid: uuid(),
      price: Number(price),
      updated_at: new Date(),
      created_at: new Date(),
      is_pop_up: forcePopup === true ? 1 : 0,
      is_printed: 0,
      color: productModalColor,
      status: 1,
      code: productCode,
      category_id: selectedCategory.id,
      currentTimestamp: new Date(),
      note: '',
      isCancelled: false,
      addOns: selectedCategory.add_ons ? selectedCategory.add_ons : [],
      option_ids: [],
      quantity: 0,
      stock: Number(productStock),
      parent_category: selectedCategory.category_id,
      title: productName,
      photo: photo,
      is_tax_inclusive: 0
    };

    const callback = async (error: any, product: any) => {
      if (!error) {
        if (fileObject) {
          const params = {
            id: product.id,
            image: fileObject
          };

          try {
            // Wait for the image upload to complete
            await addPhotoToProduct(params);
            // Refresh data after image upload completes
            await handleFetchItems();
          } catch (err) {
            console.error('Error uploading photo:', err);
          }
        }
      } else {
        console.error(error);
      }
      handleClose();
    };

    if (editId) {
      product.id = editId;
    }

    const created = await AddProduct(product);
    // Only call handleFetchItems here if there's no file to upload
    if (!fileObject) {
      await handleFetchItems();
    }
    if (created) {
      await callback(null, created);
    } else {
      callback('error', null);
    }
  };

  const resetColor = () => {
    setProductModalColor('');
  };

  const handleClose = () => {
    setOpenProductModal(false);
    setEditProduct(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContentWithoutClose className="h-[80vh] max-w-lg overflow-y-auto">
        <div className="w-full ">
          <div className="relative">
            <div className="pb-2">
              <p>Add Product</p>
              <p>Add product details here.</p>
            </div>
            <div className="overflow-auto">
              <div className="mb-4 flex flex-col items-center">
                {image ? (
                  <div>
                    <CardMedia
                      component="img"
                      image={image || 'https://via.placeholder.com/140'}
                      alt="Product Image"
                      className=" h-48 w-48 rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="relative flex h-48 w-48 flex-col items-center justify-center rounded-lg bg-gray-light">
                    <p className="text-xl">
                      {productCode ? productCode : 'AA'}
                    </p>
                    <p className="text-xs">
                      {productName ? productName : 'Product Name'}
                    </p>
                  </div>
                )}
                {!image && (
                  <Button
                    variant="outline"
                    className="mb-2 mt-2 w-48"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload Image
                    <input
                      type="file"
                      hidden
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                    />
                  </Button>
                )}
                {image && (
                  <Button
                    variant="outline"
                    className="mb-2 mt-2 w-48 "
                    onClick={() => setImage(null)}
                  >
                    Remove Image
                  </Button>
                )}
                <Button
                  className="w-48"
                  style={{
                    backgroundColor: productModalColor || undefined,
                    color: productModalColor
                      ? getRelativeLuminance(productModalColor)
                      : 'inherit'
                  }}
                  onClick={() =>
                    productModalColor
                      ? resetColor()
                      : setOpenColorPickerModal(true)
                  }
                >
                  {productModalColor ? 'Remove color' : 'Set Color'}
                </Button>
              </div>
              <CustomTextField
                label="Product Name"
                value={productName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setProductName(e.target.value)
                }
              />
              <CustomTextField
                label="Price"
                value={price}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPrice(e.target.value)
                }
              />
              <CustomTextField
                label="Code"
                value={productCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setProductCode(e.target.value)
                }
              />
              <CustomTextField
                label="Stock"
                value={productStock}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setProductStock(e.target.value)
                }
              />
              <CustomTextField
                label="Description"
                value={productDescription}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setProductDescription(e.target.value)
                }
              />
              <div className="flex items-center border-t border-border p-4">
                <p className="min-w-[36%] text-sm ">Ingredients</p>
                <Button className="">Add Ingredients</Button>
              </div>

              <div className="flex items-center border-t border-border p-4">
                <p className="min-w-72 text-sm ">Turn on force popup</p>
                <Switch
                  checked={forcePopup}
                  onChange={() => setForcePopup(!forcePopup)}
                  color="secondary"
                  sx={{
                    '& .MuiSwitch-switchBase': {
                      color: 'default'
                    },
                    '& .MuiSwitch-track': {
                      backgroundColor: 'default'
                    },
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#7af8c8' // Reset the color when checked, or choose another color
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#7af8c8' // Reset the background when checked, or choose another color
                    }
                  }}
                />
              </div>
              <div className="flex items-center border-t border-border p-4">
                <p className="min-w-[36%] text-sm ">
                  Select add-ons for force popup
                </p>
                <div className="mt-2 h-64 overflow-auto">
                  <div className="flex flex-wrap gap-2">
                    {selectedCategory?.add_ons &&
                      selectedCategory?.add_ons.map(
                        (addOn: any, index: number) => (
                          <Button
                            key={index}
                            className="flex flex-col items-center border border-solid border-gray bg-transparent text-xs "
                          >
                            {addOn.name}
                            <span className="text-[10px] text-primary">
                              {addOn.price > 0 ? `+ $${addOn.price}` : ''}
                            </span>
                          </Button>
                        )
                      )}
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute right-2 top-2 flex justify-between gap-4">
              <Button onClick={handleClose}>Cancel</Button>
              <Button onClick={handleAddProduct}>Save</Button>
            </div>
          </div>
        </div>
        {colorPickerModalOpen && (
          <ColorPickerModal
            open={colorPickerModalOpen}
            setOpenColorPickerModal={setOpenColorPickerModal}
            sendColor={setProductModalColor}
          />
        )}
      </DialogContentWithoutClose>
    </Dialog>
  );
};

export default ProductModal;
