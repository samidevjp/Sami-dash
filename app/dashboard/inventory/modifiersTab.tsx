// import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  TableBody,
  TableCell,
  TableForFixedHeader,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Pencil, Trash } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '@/components/ui/modal';

export default function ModifiersTab({
  title,
  data,
  onAdd,
  onSearch,
  handleSave,
  selectedModifier,
  setSelectedModifier,
  searchTerm // selectedItem,
  // setSelectedItem,
}: any) {
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string | number>('');
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const handleDoubleClick = (item: any, field: string) => {
    setEditingItemId(item.id);
    setEditingField(field);
    setEditingValue(item[field]);
  };

  const handleBlur = (item: any) => {
    if (editingValue !== item[editingField as string]) {
      const updatedItem = {
        ...item,
        [editingField as string]: editingValue,
        category_id: item.pos_product_category_id
      };
      handleSave(updatedItem);
    }
    setEditingItemId(null);
    setEditingField(null);
  };
  const getDisplayValue = (item: any, field: string) => {
    if (editingItemId === item.id && editingField === field) {
      return editingValue;
    }
    return item[field];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingValue(e.target.value);
  };

  const sortedData = data.sort((a: any, b: any) => {
    const aStartsWithSymbol = /^[^a-zA-Z0-9]/.test(a.name);
    const bStartsWithSymbol = /^[^a-zA-Z0-9]/.test(b.name);
    if (aStartsWithSymbol && !bStartsWithSymbol) return 1;
    if (!aStartsWithSymbol && bStartsWithSymbol) return -1;
    return a.name.localeCompare(b.name);
  });
  const filteredData = sortedData
    .filter((category: any) => category.status === 1)
    .filter((item: any) =>
      item.name.toLowerCase().includes(searchTerm?.toLowerCase())
    );

  const closeModal = () => {
    setSelectedModifier(null);
    setIsRemoveModalOpen(false);
  };

  const handleDelete = () => {
    const updatedProduct = {
      ...selectedModifier,
      status: 0,
      category_id: selectedModifier.pos_product_category_id
    };
    handleSave(updatedProduct);
    closeModal();
  };

  return (
    <>
      <div className="mb-4 flex flex-col justify-end gap-4 md:flex-row">
        <Input
          placeholder={`Search ${title}`}
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full flex-1 rounded-lg px-4 py-2"
        />
        {sortedData.filter((category: any) => category.status === 1).length >
          0 && (
          <Button
            onClick={onAdd}
            className="w-full rounded-lg px-4 py-2 md:mt-0 md:w-auto"
          >
            + Create {title.slice(0, -1)}
          </Button>
        )}
      </div>

      <div className="w-full rounded-lg bg-secondary shadow">
        <div className="w-full overflow-hidden rounded-t-lg">
          <div className="overflow-hidden rounded-lg">
            {sortedData.filter((category: any) => category.status === 1)
              .length > 0 ? (
              <div className="max-h-[500px] overflow-y-auto">
                <TableForFixedHeader className="md:table-fixed">
                  <TableHeader className="sticky top-0 bg-secondary">
                    <TableRow>
                      <TableHead className="w-1/5 px-4">
                        Modifier Name
                      </TableHead>
                      <TableHead className="w-1/6 px-4">Price</TableHead>
                      <TableHead className="w-1/6 px-4">Cost</TableHead>
                      {/* <TableHead className="w-1/6 px-4">Status</TableHead> */}
                      <TableHead className="w-1/6 px-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item: any) => (
                      <TableRow className="hover:bg-hoverTable" key={item.id}>
                        <TableCell className="w-1/5 px-4">
                          <Input
                            type="text"
                            value={getDisplayValue(item, 'name')}
                            onChange={(e) => {
                              if (
                                editingItemId !== item.id ||
                                editingField !== 'name'
                              ) {
                                handleDoubleClick(item, 'name');
                              }
                              handleChange(e);
                            }}
                            onBlur={() => handleBlur(item)}
                            className="w-full rounded-md border border-gray-300 px-2 py-1"
                          />
                        </TableCell>
                        <TableCell className="w-1/6 px-4">
                          <Input
                            type="text"
                            value={
                              editingItemId === item.id &&
                              editingField === 'price'
                                ? editingValue
                                : `${item.price}`
                            }
                            onChange={(e) => {
                              if (
                                editingItemId !== item.id ||
                                editingField !== 'price'
                              ) {
                                handleDoubleClick(item, 'price');
                              }
                              handleChange(e);
                            }}
                            onBlur={() => handleBlur(item)}
                            className="w-full rounded-md border border-gray-300 px-2 py-1"
                          />
                        </TableCell>
                        <TableCell className="w-1/6 px-4">
                          $
                          {item.ingredients
                            .reduce((totalCost: number, ingredient: any) => {
                              return (
                                totalCost +
                                Number(ingredient.quantity) *
                                  Number(ingredient.cost)
                              );
                            }, 0)
                            .toFixed(2)}
                        </TableCell>
                        {/* <TableCell className="w-1/6 px-4">
                            <Badge
                              variant={
                                item.status === 1 ? 'default' : 'secondary'
                              }
                              className="rounded-full px-2 py-1"
                            >
                              {item.status === 1 ? 'Available' : 'Inactive'}
                            </Badge>
                          </TableCell> */}
                        <TableCell className="w-1/6">
                          <Button
                            onClick={() => {
                              setSelectedModifier(item);
                              onAdd();
                            }}
                            variant="ghost"
                            className="p-2"
                          >
                            <Pencil size={20} />
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedModifier(item);
                              setIsRemoveModalOpen(true);
                            }}
                            variant="ghost"
                            className="p-2"
                          >
                            <Trash size={20} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableForFixedHeader>
              </div>
            ) : (
              <div className="flex h-96 flex-col items-center justify-center gap-4">
                <div className="text-center">
                  <p>No {title} found </p>
                </div>
                <Button
                  onClick={onAdd}
                  data-tutorial="create-product"
                  className="w-40 rounded-lg px-4 py-2"
                >
                  + Create {title.slice(0, -1)}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Modal
        title="Remove Modifier"
        description={`Remove ${selectedModifier?.name}`}
        isOpen={isRemoveModalOpen}
        onClose={closeModal}
      >
        <div className="flex flex-col gap-4">
          <p className="mb-2">
            Are you sure you want to remove this modifier{' '}
            <span className="font-bold">{selectedModifier?.name}</span>?
          </p>
          <div className="flex justify-end gap-4">
            <Button onClick={closeModal} variant="secondary">
              Cancel
            </Button>
            <Button onClick={handleDelete} variant="danger">
              Remove
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
