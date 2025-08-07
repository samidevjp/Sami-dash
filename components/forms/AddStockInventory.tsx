'use client';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { isSimilarName } from '@/lib/utils';
import Image from 'next/image';
import { toast } from '../ui/use-toast';
import { Minus, Plus } from 'lucide-react';

function AddStockInventory({
  ingredient,
  isOpen,
  onClose,
  invoiceQuantity,
  setProducts
}: any) {
  const [newStock, setNewStock] = useState(invoiceQuantity || 0);
  const { data: session } = useSession();

  const handleStockChange = (e: any) => {
    setNewStock(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}pos/inventory/item/addstock`,
        {
          pos_product_inventory_items_id: ingredient?.id,
          new_stock: newStock
        },
        {
          headers: {
            Authorization: `Bearer ${session?.user.token}`
          }
        }
      );
      toast({
        title: 'Stock added successfully',
        description: 'Stock has been added to the inventory',
        variant: 'success'
      });
      if (setProducts) {
        setProducts((prev: any) => {
          const updatedProducts = [...prev];
          const productIndex = updatedProducts.findIndex((product: any) =>
            isSimilarName(product.name, ingredient?.product_name)
          );

          if (productIndex !== -1) {
            updatedProducts[productIndex].updated = true;
          }

          return updatedProducts;
        });
      }
      onClose();
    } catch (error) {
      console.error('Error adding stock:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Stock for {ingredient?.product_name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center">
          {ingredient?.photo ? (
            <Image
              src={`${process.env.NEXT_PUBLIC_IMG_URL}` + ingredient?.photo}
              alt={ingredient?.code ? ingredient?.code : ingredient?.title}
              width="64"
              height="64"
              className="h-16 w-16 rounded-full"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-b from-red-600 to-yellow-400">
              <div>{ingredient?.code}</div>
            </div>
          )}
          <div className="mt-4 text-center">
            <p>
              Category:{' '}
              {ingredient?.pos_inventory_item_categories?.item_category ||
                'Unknown'}
            </p>
            <p>
              Stock Location: {ingredient?.location?.location_name || 'Unknown'}
            </p>
            <p>
              Current Stock:{' '}
              {ingredient?.pos_inventory_item_stock
                ? ingredient?.pos_inventory_item_stock?.total_stock_unit
                : 'Unknown'}
            </p>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              className="h-6 w-6 rounded-full bg-secondary p-0"
              variant="outline"
              onClick={() => setNewStock(Math.max(0, newStock - 10))}
            >
              <Minus size={14} />
            </Button>
            <Input
              className="w-16 text-center"
              type="number"
              value={newStock}
              onChange={handleStockChange}
            />
            <Button
              className="h-6 w-6 rounded-full bg-secondary p-0"
              variant="outline"
              onClick={() => setNewStock(Number(newStock) + 10)}
            >
              <Plus size={14} />
            </Button>
          </div>
        </div>
        <div className="flex flex-row items-center justify-between gap-4">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="submit">
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddStockInventory;
