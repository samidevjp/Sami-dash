import React, { useEffect, useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { Button } from '@/components/ui/button';
import { useItems } from '@/hooks/useItems';
import { Dialog, DialogTitle, DialogContent } from '../ui/dialog';
import { Textarea } from '../ui/textarea';

const currentTimestamp = String(Date.now() * 1000);

interface AddonModalProps {
  open: boolean;
  setOpenAddonModal: (open: boolean) => void;
  productOnAddOnModal: any;
  setSelectedProduct: (product: any) => void;
  selectedProduct: any;
  setProductOnAddOnModal: (product: any) => void;
  allCategories: any;
}
const AddonModal = ({
  open,
  setOpenAddonModal,
  productOnAddOnModal,
  setSelectedProduct,
  selectedProduct,
  setProductOnAddOnModal,
  allCategories
}: AddonModalProps) => {
  const { addItem, items } = useItems();
  const [targetProduct, setTargetProduct] = useState<any>();
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<any>([]);
  const [note, setNote] = useState('');
  const onDelete = (addOn: any) => {
    setSelectedAddOns((prev: any) => {
      return prev.filter((item: any) => item.id !== addOn.id);
    });
  };

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState(0);
  const [addOns, setAddOns] = useState<any>([]);
  useEffect(() => {
    setQuantity(targetProduct?.quantity || 1);
    setSelectedAddOns(targetProduct?.addOns || []);
    setNote(targetProduct?.note || '');
    setTitle(targetProduct?.title || '');
    setPrice(targetProduct?.price || 0);
    setAddOns(
      allCategories?.find(
        (rproduct: any) =>
          rproduct.id === targetProduct?.pos_product_category_id ||
          rproduct.id === targetProduct?.category_id
      )?.add_ons || []
    );
  }, [targetProduct]);

  const manageCount = (addOn: any, number: number) => {
    setSelectedAddOns((prev: any) => {
      const updatedAddOns = prev.map((item: any) => {
        if (item.id === addOn.id) {
          return {
            ...item,
            quantity: Math.max(1, item.quantity + number)
          };
        }
        return item;
      });
      return updatedAddOns;
    });
  };

  useEffect(() => {
    if (productOnAddOnModal) {
      const matchingItem = items.find(
        (item: any) => item.id === productOnAddOnModal.id
      );

      if (matchingItem) {
        setTargetProduct(matchingItem);
      } else {
        setTargetProduct(productOnAddOnModal || selectedProduct);
      }
    } else {
      setTargetProduct(selectedProduct);
    }
  }, [items, productOnAddOnModal, selectedProduct]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setNote(value);
  };
  const handleAddOnClick = (addOn: any) => {
    const newAddOn = {
      category_id: addOn.pos_product_category_id,
      id: addOn.id,
      name: addOn.name,
      price: addOn.price,
      quantity: 1,
      status: addOn.status,
      type: addOn.type
    };
    setSelectedAddOns((prev: any) => {
      if (prev.find((item: any) => item.id === addOn.id)) {
        return prev.filter((item: any) => item.id !== addOn.id);
      } else {
        return [...prev, newAddOn];
      }
    });
  };

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev: any) => Math.max(1, prev + amount));
  };

  const handleAddOrder = () => {
    const productItem = {
      addOns: selectedAddOns,
      category_id:
        targetProduct?.pos_product_category_id || targetProduct?.category_id,
      code: targetProduct.code,
      created_at: targetProduct.created_at,
      currentTimestamp: targetProduct?.currentTimestamp || currentTimestamp,
      description: targetProduct.description,
      id: targetProduct.id,
      is_printed: 0,
      note: note,
      order: targetProduct.order,
      price: targetProduct.price,
      quantity: quantity,
      isCancelled: false,
      is_deleted: false,
      is_pop_up: targetProduct?.is_pop_up || true,
      status: targetProduct.status,
      stock: targetProduct.stock,
      title: targetProduct.title,
      updated_at: targetProduct.updated_at,
      uuid: targetProduct?.uuid || uuid()
    };
    setSelectedProduct(targetProduct);
    addItem(productItem, true);
    setTargetProduct(null);
    setProductOnAddOnModal(null);
    setOpenAddonModal(false);
  };

  return (
    <Dialog open={open} onOpenChange={() => setOpenAddonModal(false)}>
      <DialogTitle>Add-Ons</DialogTitle>
      <DialogContent className="m-auto flex min-h-[90vh] min-w-[90dvw] flex-col overflow-auto rounded-lg sm:min-w-[70vw]">
        <div className="flex items-center justify-between border-b border-solid border-border pb-4">
          <div className="flex items-center">
            <p className="text-base font-bold">{title}</p>
            <p className="ml-4 rounded-lg bg-secondary px-4 py-2 text-base">
              ${(quantity * price).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex w-full">
          <div className="addon-modal w-1/2 border-r border-solid border-border p-2">
            <div className="flex justify-between">
              <div className="flex items-center gap-x-4">
                <p className="text-base font-medium">Quantity</p>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleQuantityChange(-1)}
                    variant="outline"
                    className="h-6 w-6 rounded-full bg-secondary p-0"
                  >
                    <Minus size={14} />
                  </Button>
                  <p>{quantity}</p>
                  <Button
                    variant="outline"
                    onClick={() => handleQuantityChange(1)}
                    className="h-6 w-6 rounded-full bg-secondary p-0"
                  >
                    <Plus size={14} />
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-base font-medium">Note</p>

              <Textarea
                rows={4}
                onChange={(e: any) => handleChange(e)}
                className="mt-2 border border-border "
                value={note}
              />
            </div>
            <p className="mt-4 text-base font-medium">Select Add-Ons</p>
            <div className="mt-4 h-64 overflow-auto pb-1">
              <div className="flex flex-wrap gap-x-[2%] gap-y-2">
                {addOns &&
                  addOns.map((addOn: any, index: number) => (
                    <Button
                      key={index}
                      style={{
                        minWidth: '32%',
                        maxWidth: '32%',
                        backgroundColor: addOn.color || 'transparent'
                      }}
                      variant="tertiary"
                      className={`flex h-10 flex-col items-center justify-center rounded-lg border px-1 text-xs leading-tight ${
                        selectedAddOns.find((item: any) => item.id === addOn.id)
                          ? 'border-primary '
                          : 'border-border'
                      }`}
                      onClick={() => handleAddOnClick(addOn)}
                    >
                      {addOn.name}
                      <span
                        style={{
                          fontSize: '10px'
                        }}
                        className="text-primary"
                      >
                        {addOn.price > 0 ? `+ $${addOn.price}` : ''}
                      </span>
                    </Button>
                  ))}
              </div>
            </div>
          </div>
          <div className="h-[480px] w-1/2 overflow-auto p-2">
            <p className="text-base font-medium">Selected Add-Ons</p>
            <div className="mt-2">
              {selectedAddOns.length > 0 ? (
                <ul>
                  {selectedAddOns.map((addOn: any, index: number) => (
                    <div
                      key={index}
                      className="mb-1 flex items-center justify-between p-1"
                    >
                      <Button
                        onClick={() => onDelete(addOn)}
                        variant="outline"
                        className="h-7 w-7 rounded-full bg-secondary p-0"
                      >
                        <Minus size={16} />
                      </Button>

                      <div
                        style={{ width: 'calc( 100% - 46px)' }}
                        className="flex items-center justify-between rounded-lg border border-primary p-2 text-sm"
                      >
                        <p>{addOn.name}</p>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => manageCount(addOn, -1)}
                            variant="outline"
                            className="h-6 w-6 rounded-full bg-secondary p-0"
                          >
                            <Minus size={14} />
                          </Button>
                          <p className="mx-2">{addOn.quantity}</p>
                          <Button
                            variant="outline"
                            onClick={() => manageCount(addOn, 1)}
                            className="h-6 w-6 rounded-full bg-secondary p-0"
                          >
                            <Plus size={14} />
                          </Button>
                          <p>${addOn?.price?.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </ul>
              ) : (
                <p>No add-ons selected</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end border-t border-border pt-4">
          <Button onClick={() => handleAddOrder()} className="bg-primary ">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddonModal;
