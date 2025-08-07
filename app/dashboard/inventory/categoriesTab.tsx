import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Modal } from '@/components/ui/modal';

import {
  TableBody,
  TableCell,
  TableForFixedHeader,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Pencil, Trash } from 'lucide-react';

export default function CategoriesTab({
  title,
  data,
  onAdd,
  onSearch,
  searchTerm,
  // setSearchTerm,
  setSelectedItem,
  handleSave
}: any) {
  const sortedData = data.sort((a: any, b: any) =>
    a.name.localeCompare(b.name)
  );
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [editingValues, setEditingValues] = useState<{ [key: number]: string }>(
    {}
  );
  const handleChange = (id: number, value: string) => {
    setEditingValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleBlur = (category: any) => {
    if (editingValues[category.id] === undefined) return;
    if (editingValues[category.id] !== category.name) {
      const updatedCategory = { ...category, name: editingValues[category.id] };
      handleSave(updatedCategory);
    }
  };

  const handleInactivate = () => {
    const updatedCategory = { ...selectedCategory, status: 0 };
    handleSave(updatedCategory);
    closeModal();
  };

  const closeModal = () => {
    setSelectedCategory(null);
    setIsRemoveModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-col justify-end md:flex-row">
        <div className="w-full items-center justify-between gap-4 md:flex">
          <Input
            placeholder={`Search ${title}`}
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full flex-1 rounded-lg px-4 py-2"
          />
          {sortedData.length > 0 && (
            <Button
              onClick={onAdd}
              className="mt-2 w-full rounded-lg px-4 py-2 md:mt-0 md:w-auto"
              data-tutorial="create-category"
            >
              + Create Category
            </Button>
          )}
        </div>
      </div>
      <div className="w-full rounded-lg bg-secondary">
        <div className="w-full overflow-hidden rounded-t-lg">
          <div className="max-h-[500px] overflow-y-auto">
            {sortedData.length > 0 ? (
              <TableForFixedHeader className="md:table-fixed">
                <TableHeader className="sticky top-0 bg-secondary">
                  <TableRow>
                    <TableHead className="w-1/3 p-4">Category Name</TableHead>
                    <TableHead className="w-1/12 p-4 text-center">
                      Products
                    </TableHead>
                    <TableHead className="w-1/12 p-4 text-center">
                      Add Ons
                    </TableHead>
                    <TableHead className="w-1/6 p-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((category: any) => (
                    <TableRow className="hover:bg-hoverTable" key={category.id}>
                      <TableCell className="px-4">
                        <div className="flex items-center gap-3">
                          {category.color ? (
                            <div
                              className="h-2 min-h-2 w-2 min-w-2 rounded-full"
                              style={{
                                backgroundColor: category.color
                              }}
                            />
                          ) : (
                            <div className="h-2 min-h-2 w-2 min-w-2 rounded-full bg-border" />
                          )}
                          <Input
                            type="text"
                            value={editingValues[category.id] ?? category.name}
                            onChange={(e) =>
                              handleChange(category.id, e.target.value)
                            }
                            onBlur={() => handleBlur(category)}
                            className="w-full rounded-md border border-gray-300 px-2 py-1"
                          />{' '}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 text-center">
                        {category.products.length}
                      </TableCell>
                      <TableCell className="px-4 text-center">
                        {category.add_ons.length}
                      </TableCell>
                      {/* <TableCell className="px-4">
                        <Badge
                          variant={
                            category.status === 1 ? 'default' : 'secondary'
                          }
                          className="rounded-full px-2 py-1"
                        >
                          {category.status === 1 ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell> */}
                      <TableCell>
                        <Button
                          onClick={() => {
                            onAdd();
                            setSelectedItem(category);
                          }}
                          variant="ghost"
                          className="p-2"
                        >
                          <Pencil size={20} />
                        </Button>
                        <Button
                          variant="ghost"
                          className="p-2"
                          onClick={() => {
                            setSelectedCategory(category);
                            setIsRemoveModalOpen(true);
                          }}
                        >
                          <Trash size={20} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableForFixedHeader>
            ) : (
              <div className="flex h-96 flex-col items-center justify-center gap-4">
                <div className="text-center">
                  <p>No {title} found </p>
                </div>
                <Button
                  onClick={onAdd}
                  data-tutorial="create-product"
                  className="w-44 rounded-lg px-4 py-2"
                >
                  + Create Category
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Modal
        title="Remove Category"
        description={`Remove this category ${selectedCategory?.name}`}
        isOpen={isRemoveModalOpen}
        onClose={closeModal}
      >
        <div className="flex flex-col gap-4">
          <p className="mb-2">
            Are you sure you want to remove this category{' '}
            <span className="font-bold">{selectedCategory?.name}</span>?
          </p>
          <p className="mb-4 text-sm">
            Removing this category will also remove{' '}
            <span className="font-bold">
              {selectedCategory?.products.length}
            </span>{' '}
            related products. If you do not want to remove them, please change
            the category of the products first.
          </p>
          <div className="flex justify-end gap-4">
            <Button onClick={closeModal} variant="secondary">
              Cancel
            </Button>
            <Button onClick={handleInactivate} variant="danger">
              Remove
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
