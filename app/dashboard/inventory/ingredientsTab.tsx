import { useEffect, useState } from 'react';
import {
  TableBody,
  TableCell,
  TableForFixedHeader,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Pencil, Trash } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AddStockInventory from '@/components/forms/AddStockInventory';

function IngredientsTab({
  title,
  data,
  onAdd,
  onSearch,
  searchTerm,
  setSearchTerm,
  setSelectedItem,
  selectedCategory,
  setSelectedCategory,
  categories,
  isCategoryDropdownOpen,
  setIsCategoryDropdownOpen,
  removeItem,
  handleSave,
  updateData
}: any) {
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<string | number>('');
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<any>(null);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  const handleDoubleClick = (item: any) => {
    setEditingItemId(item.id);
    setEditingValue(item.last_cost);
  };

  const handleBlur = (item: any) => {
    if (editingValue !== item.last_cost) {
      const updatedItem = { ...item, last_cost: editingValue };
      handleSave(updatedItem);
    }
    setEditingItemId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingValue(e.target.value);
  };

  const handleOpenIngredientModal = (item: any) => {
    setSelectedIngredient(item);
    setIsIngredientModalOpen(true);
  };

  const handleCloseIngredientModal = () => {
    setIsIngredientModalOpen(false);
    setSelectedIngredient(null);
    updateData((prev: any) => !prev);
  };

  const getStockStatus = (item: any) => {
    const totalStock = Number(
      item.pos_inventory_item_stock?.total_stock_unit || 0
    );
    const parLevel = Number(item.par_level_unit || 0);

    if (totalStock === 0 || totalStock < 0) {
      return 'No Stock';
    } else if (totalStock < parLevel) {
      return 'Low Stock';
    } else {
      return 'In Stock';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'inStock';
      case 'Low Stock':
        return 'warning';
      case 'No Stock':
        return 'noStock';
      default:
        return 'default';
    }
  };

  const sortedData = data.sort((a: any, b: any) =>
    a.product_name.localeCompare(b.product_name)
  );

  const handleInactivate = () => {
    const updatedProduct = {
      ...selectedIngredient,
      status: 0,
      category_id: selectedIngredient.pos_product_category_id
    };

    handleSave(updatedProduct);
    closeModal();
  };

  const closeModal = () => {
    setSelectedIngredient(null);
    setIsRemoveModalOpen(false);
  };
  useEffect(() => {
    console.log(selectedIngredient, 'selectedIngredient');
  }, [selectedIngredient]);

  return (
    <>
      <div className="flex flex-col justify-end gap-4 lg:flex-row">
        <div className="flex flex-1 items-center justify-between gap-4">
          <Input
            placeholder={`Search ${title}`}
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full rounded-lg px-4 py-2"
          />
          <DropdownMenu
            open={isCategoryDropdownOpen}
            onOpenChange={setIsCategoryDropdownOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full max-w-60">
                {selectedCategory
                  ? categories.find((c: any) => c.id === selectedCategory)
                      ?.item_category
                  : 'Filter by Category'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              {categories.map((category: any) => (
                <DropdownMenuItem
                  key={category.id}
                  onSelect={() => setSelectedCategory(category.id)}
                >
                  {category.item_category}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onSelect={() => setSelectedCategory('')}>
                Clear Filter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button
          onClick={onAdd}
          className="w-full rounded-lg px-4 py-2 md:mt-0 md:w-auto"
        >
          + Create {title.slice(0, -1)}
        </Button>
      </div>
      <div className="w-full rounded-lg bg-secondary shadow">
        <div className="w-full overflow-hidden rounded-t-lg">
          <div className="max-h-[400px] overflow-y-auto">
            <TableForFixedHeader className="md:table-fixed">
              <TableHeader className="sticky top-0 bg-secondary">
                <TableRow>
                  <TableHead className="w-1/5 px-4">Ingredient Name</TableHead>
                  <TableHead className="w-1/6 px-4">Cost Unit</TableHead>
                  <TableHead className="w-1/6 px-4">Stock Level</TableHead>
                  <TableHead className="w-1/6 px-4">Stock Level Cost</TableHead>
                  <TableHead className="w-1/6 px-4">Measurement Unit</TableHead>
                  <TableHead className="w-1/6 px-4">Supplier</TableHead>
                  <TableHead className="w-1/6 px-4">Status</TableHead>
                  <TableHead className="w-1/6 px-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((item: any) => (
                  <TableRow
                    className="hover:bg-hoverTable"
                    key={item.id}
                    onClick={() => handleOpenIngredientModal(item)}
                  >
                    <TableCell className="w-1/5 px-4">
                      {/* <div className="flex items-center gap-4"> */}
                      {/* {item.photo ? (
                          <Image
                            src={
                              `${process.env.NEXT_PUBLIC_IMG_URL}` + item?.photo
                            }
                            width="40"
                            height="40"
                            alt={item.code ? item.code : item.title}
                            className="h-10 min-h-10 w-10 min-w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 min-w-10 items-center justify-center rounded-full bg-gradient-to-b from-red-600 to-yellow-400">
                            <div>{item.code}</div>
                          </div>
                        )} */}
                      <div className="cursor-pointer">{item.product_name}</div>
                      {/* </div> */}
                    </TableCell>
                    <TableCell className="w-1/6 px-4">
                      ${item.last_cost}
                    </TableCell>
                    <TableCell className="w-1/6 px-4">
                      {item.pos_inventory_item_stock?.total_stock_unit || 0}
                    </TableCell>
                    <TableCell className="w-1/6 px-4">
                      $
                      {(
                        item.pos_inventory_item_stock?.remaining_stock_unit *
                        item?.last_cost
                      ).toFixed(2)}
                    </TableCell>
                    <TableCell className="w-1/6 px-4">
                      {item.measurement_unit?.unit_of_measurement || 'N/A'}
                    </TableCell>
                    <TableCell className="w-1/6 px-4">
                      {item?.supplier?.supplier_name || 'N/A'}
                    </TableCell>
                    <TableCell className="w-1/6 px-4">
                      <Badge
                        variant={getStatusBadgeVariant(getStockStatus(item))}
                        className="rounded-full px-2 py-1"
                      >
                        {getStockStatus(item)}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-1/6">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAdd();
                          setSelectedItem(item);
                        }}
                        variant="ghost"
                        className="p-2"
                      >
                        <Pencil size={20} />
                      </Button>
                      {/* <Button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering row click
                          removeItem(item.id);
                        }}
                        variant="ghost"
                        className="p-2"
                      >
                        <Trash />
                      </Button> */}
                      <Button
                        onClick={(e) => {
                          setSelectedIngredient(item);
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
        </div>
      </div>

      {selectedIngredient && (
        <AddStockInventory
          ingredient={selectedIngredient}
          isOpen={isIngredientModalOpen}
          onClose={handleCloseIngredientModal}
          invoiceQuantity={0}
        />
      )}
      <Modal
        title="Remove Ingredient"
        description={`Remove this Ingredient ${selectedIngredient?.product_name}`}
        isOpen={isRemoveModalOpen}
        onClose={closeModal}
      >
        <div className="flex flex-col gap-4">
          <p className="mb-2">
            Are you sure you want to remove this ingredient{' '}
            <span className="font-bold">
              {selectedIngredient?.product_name}
            </span>
            ?
          </p>
          <div className="flex justify-end gap-4">
            <Button onClick={closeModal} variant="secondary">
              Cancel
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                removeItem(selectedIngredient.id);
              }}
              variant="danger"
            >
              Remove
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default IngredientsTab;
