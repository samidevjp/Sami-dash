import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface CustomerProductSelectionProps {
  customers: any[];
  selectedCustomer: string | null;
  handleCustomerSelect: (customerId: string) => void;
  mergedItems: any[];
  selectedItems: any[];
  handleRemoveItem: (index: number) => void;
  handleProductSelect: (item: any) => void;
  setShowCustomerModal: (show: boolean) => void;
  setShowProductModal: (show: boolean) => void;
  description: string;
  setDescription: (desc: string) => void;
  footer: string;
  setFooter: (footer: string) => void;
  customFields: { name: string; value: string }[];
  setCustomFields: (fields: { name: string; value: string }[]) => void;
  checkedStates: {
    memo: boolean;
    footer: boolean;
    customField: boolean;
  };
  setCheckedStates: (updater: any) => void;
}

export const CustomerProductSelection: React.FC<
  CustomerProductSelectionProps
> = ({
  customers,
  selectedCustomer,
  handleCustomerSelect,
  mergedItems,
  selectedItems,
  handleRemoveItem,
  handleProductSelect,
  setShowCustomerModal,
  setShowProductModal,
  description,
  setDescription,
  footer,
  setFooter,
  customFields,
  setCustomFields,
  checkedStates,
  setCheckedStates
}) => {
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [openQuantitySection, setOpenQuantitySection] = useState(false);
  const [addItem, setAddItem] = useState<any>(null);
  const selectedCustomerEmail = useMemo(() => {
    return (
      customers.find((c) => c.id === selectedCustomer)?.email ||
      'Select a Customer'
    );
  }, [selectedCustomer, customers]);

  const handleNewCustomer = () => {
    setIsCustomerDropdownOpen(false);
    setShowCustomerModal(true);
  };

  const handleNewProduct = () => {
    setIsProductDropdownOpen(false);
    setShowProductModal(true);
  };

  const handleSelectQuantity = (itemId: any) => {
    const item = mergedItems.find((i: any) => i.id === itemId);
    setAddItem({ ...item, quantity: 1 });
    setOpenQuantitySection(true);
  };

  const handleSaveProduct = () => {
    handleProductSelect(addItem);
    setOpenQuantitySection(false);
  };

  const handleCheckboxChange = (option: keyof typeof checkedStates) => {
    setCheckedStates((prev: any) => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleFieldChange = (
    idx: number,
    key: 'name' | 'value',
    value: string
  ) => {
    const updated = [...customFields];
    updated[idx][key] = value;
    setCustomFields(updated);
  };

  const removeCustomField = (idx: number) => {
    setCustomFields(customFields.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex-col items-center justify-between gap-2">
      {/* Customer */}
      <div className="mb-6 w-full">
        <h3 className="mb-6 text-xl font-medium">Customer</h3>
        <DropdownMenu
          open={isCustomerDropdownOpen}
          onOpenChange={setIsCustomerDropdownOpen}
        >
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{selectedCustomerEmail}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-48 w-full overflow-auto">
            {customers
              .filter((c) => c.email !== null)
              .map((c) => (
                <DropdownMenuItem
                  key={c.id}
                  onSelect={() => handleCustomerSelect(c.id)}
                >
                  {c.email}
                </DropdownMenuItem>
              ))}
            <DropdownMenuItem onSelect={handleNewCustomer}>
              + New Customer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Products */}
      <div className="mt-8 w-full border-t border-muted pt-8">
        <h3 className="mb-6 text-xl font-medium">Products</h3>

        {selectedItems.length > 0 && (
          <ul className="mb-8 mt-4 flex flex-col gap-4">
            {selectedItems.map((item, index) => (
              <li key={item.id} className="flex items-center gap-4 px-4">
                <dl className="flex w-full justify-between border-b border-muted pb-4 text-sm">
                  <dt>
                    {item.description || item.name} x {item.quantity || 1}
                  </dt>
                  <dd className="flex items-center gap-2">
                    $
                    {((item.price.unit_amount * item.quantity) / 100).toFixed(
                      2
                    )}
                    <Button
                      variant="outline"
                      className="px-2"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2 width={16} />
                    </Button>
                  </dd>
                </dl>
              </li>
            ))}
          </ul>
        )}

        {/* Quantity Section */}
        {openQuantitySection && addItem && (
          <>
            <div className="relative z-40 mb-8 px-4">
              <dl className="flex justify-between text-sm">
                <dt className="font-semibold">Item Details</dt>
                <dd>
                  ${(addItem.price.unit_amount / 100).toFixed(2)} x{' '}
                  {addItem.quantity} = $
                  {(
                    (addItem.price.unit_amount / 100) *
                    addItem.quantity
                  ).toFixed(2)}
                </dd>
              </dl>
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="w-2/3">Item</th>
                    <th className="w-1/3">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <Button
                        onClick={() => setIsProductDropdownOpen(true)}
                        variant="outline"
                        className="w-[95%] justify-start"
                      >
                        {addItem.name}
                      </Button>
                    </td>
                    <td>
                      <Input
                        type="number"
                        min={1}
                        value={addItem.quantity}
                        onChange={(e) =>
                          setAddItem({
                            ...addItem,
                            quantity: parseInt(e.target.value || '1')
                          })
                        }
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-4 flex justify-end gap-4">
                <Button
                  variant="secondary"
                  onClick={() => setOpenQuantitySection(false)}
                >
                  Cancel
                </Button>
                <Button variant="default" onClick={handleSaveProduct}>
                  Save
                </Button>
              </div>
            </div>
            <div className="absolute inset-0 bg-background/80" />
          </>
        )}

        {/* Add Product */}
        <DropdownMenu
          open={isProductDropdownOpen}
          onOpenChange={setIsProductDropdownOpen}
        >
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-1/2">
              <Plus width={16} height={16} className="mr-1" />
              Add Product
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-48 w-full overflow-auto">
            {mergedItems.map((item, idx) => (
              <DropdownMenuItem
                key={`${item.id}-${idx}`}
                onSelect={() => handleSelectQuantity(item.id)}
              >
                {item.name} - ${item.price?.unit_amount / 100}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem onSelect={handleNewProduct}>
              + New Product
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Additional Options */}
      <div className="mt-8 w-full border-t border-muted pt-8">
        <h3 className="mb-6 text-xl font-medium">Additional options</h3>
        <ul className="flex flex-col gap-8">
          {/* Memo */}
          <li>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={checkedStates.memo}
                onCheckedChange={() => handleCheckboxChange('memo')}
              />
              <p className="text-sm">Memo</p>
            </div>
            {checkedStates.memo && (
              <Textarea
                className="mt-2 w-full border bg-secondary p-2 text-sm"
                placeholder="Enter your Memo here..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            )}
          </li>

          {/* Footer */}
          <li>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={checkedStates.footer}
                onCheckedChange={() => handleCheckboxChange('footer')}
              />
              <p className="text-sm">Footer</p>
            </div>
            {checkedStates.footer && (
              <Textarea
                className="mt-2 w-full border bg-secondary p-2 text-sm"
                placeholder="Enter your Footer here..."
                value={footer}
                onChange={(e) => setFooter(e.target.value)}
              />
            )}
          </li>

          {/* Custom Field */}
          <li>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={checkedStates.customField}
                onCheckedChange={() => handleCheckboxChange('customField')}
              />
              <p className="text-sm">Custom Field</p>
            </div>
            {checkedStates.customField && (
              <>
                <ul className="mt-2 flex flex-col gap-4">
                  {customFields.map((field, idx) => (
                    <li key={idx} className="flex gap-4">
                      <Input
                        value={field.name}
                        onChange={(e) =>
                          handleFieldChange(idx, 'name', e.target.value)
                        }
                      />
                      <Input
                        value={field.value}
                        onChange={(e) =>
                          handleFieldChange(idx, 'value', e.target.value)
                        }
                      />
                      <Button
                        variant="outline"
                        className="px-2"
                        onClick={() => removeCustomField(idx)}
                      >
                        <Trash2 width={16} />
                      </Button>
                    </li>
                  ))}
                </ul>
                {customFields.length < 4 && (
                  <Button
                    variant="secondary"
                    className="mt-4"
                    onClick={() =>
                      setCustomFields([
                        ...customFields,
                        { name: '', value: '' }
                      ])
                    }
                  >
                    <Plus width={16} height={16} className="mr-1" />
                    Add Custom Field
                  </Button>
                )}
              </>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
};
