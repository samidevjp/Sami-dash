import React, { useState } from 'react';
import { CardMedia, Switch } from '@mui/material';
import { Button } from '@/components/ui/button';

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
  setEditProduct // fetchData
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

  const [productModalColor, setProductModalColor] = useState(color || '');
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event?.target?.files) {
      setImage(URL.createObjectURL(event.target.files[0]));
      setFileObject(event.target.files[0]);
    }
  };

  const handleAddProduct = () => {
    console.log('Add product');
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
                  <Button variant="outline" className="mb-2 mt-2 w-48 ">
                    Upload Image
                    <input type="file" hidden onChange={handleImageUpload} />
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
      </DialogContentWithoutClose>
    </Dialog>
  );
};

export default ProductModal;
