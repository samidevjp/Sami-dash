import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

function GeneralModal({
  isOpen,
  onClose,
  title,
  formData,
  onSave,
  inventoryData
}: any) {
  const [formValues, setFormValues] = useState(formData);

  const handleChange = (field: string, value: any) => {
    setFormValues({
      ...formValues,
      [field]: value
    });
  };

  const handleSave = () => {
    onSave(formValues);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={`Create ${title}`}
    >
      <div className="space-y-4">
        <div>
          <Label>Product Name</Label>
          <Input
            value={formValues.product_name}
            onChange={(e) => handleChange('product_name', e.target.value)}
          />
        </div>

        <div>
          <Label>Product Number</Label>
          <Input
            value={formValues.product_number}
            onChange={(e) => handleChange('product_number', e.target.value)}
          />
        </div>

        <div>
          <Label>Supplier</Label>
          <Select
            onValueChange={(value) =>
              handleChange(
                'supplier',
                inventoryData.suppliers.find((s: any) => s.id === value)
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Supplier" />
            </SelectTrigger>
            <SelectContent>
              {inventoryData.suppliers?.map((supplier: any) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.supplier_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Category</Label>
          <Select
            onValueChange={(value) =>
              handleChange(
                'pos_inventory_item_categories',
                inventoryData.categories.find((c: any) => c.id === value)
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {inventoryData.categories?.map((category: any) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.item_category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Location</Label>
          <Select
            onValueChange={(value) =>
              handleChange(
                'location',
                inventoryData.locations?.find((l: any) => l.id === value)
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Location" />
            </SelectTrigger>
            <SelectContent>
              {inventoryData.locations.map((location: any) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.location_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>SKU</Label>
          <Input
            value={formValues.sku}
            onChange={(e) => handleChange('sku', e.target.value)}
          />
        </div>

        <div>
          <Label>Price</Label>
          <Input
            value={formValues.price}
            onChange={(e) => handleChange('price', e.target.value)}
          />
        </div>

        <Button onClick={handleSave} className="w-full rounded-full  ">
          Save
        </Button>
      </div>
    </Modal>
  );
}

export default GeneralModal;
