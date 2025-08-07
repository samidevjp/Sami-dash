import { useState } from 'react';
import {
  TableBody,
  TableCell,
  TableForFixedHeader,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Pencil, Trash, RefreshCcw } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

function ProductsTab({
  title,
  data,
  onAdd,
  onSearch,
  selectedCategory,
  setSelectedCategory,
  setSelectedItem,
  allCategories,
  handleSave,
  setActiveForm
}: any) {
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string | number>('');
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const handleDoubleClick = (item: any, field: string) => {
    setEditingItemId(item.id);
    setEditingField(field);
    setEditingValue(item[field]);
  };

  const calculateMargin = (cost: number, price: number) => {
    return (((price - cost) / price) * 100).toFixed(2);
  };

  const calculateGrossProfit = (cost: number, price: number) => {
    return (price - cost).toFixed(2);
  };

  const productCost = (ingredients: any) =>
    ingredients?.reduce((total: number, ingredient: any) => {
      // Calculate the cost based on the quantity
      const ingredientCostPerUnit = Number(ingredient.cost); // cost per unit(e.g., per liter)
      const quantityUsed = Number(ingredient.quantity) || 0; // quantity used(e.g., 0.08 liters)

      // Total cost for the ingredient
      const totalIngredientCost = (
        ingredientCostPerUnit * quantityUsed
      ).toFixed(2);
      return Number(totalIngredientCost) + total;
    }, 0);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingValue(e.target.value);
  };

  const sortedData = data.sort((a: any, b: any) => {
    const aStartsWithSymbol = /^[^a-zA-Z0-9]/.test(a.title);
    const bStartsWithSymbol = /^[^a-zA-Z0-9]/.test(b.title);

    if (aStartsWithSymbol && !bStartsWithSymbol) return 1;
    if (!aStartsWithSymbol && bStartsWithSymbol) return -1;
    return (a.title || '').localeCompare(b.title || '');
  });

  const handleDelete = () => {
    const updatedProduct = {
      ...selectedProduct,
      status: 0,
      category_id: selectedProduct.pos_product_category_id
    };
    handleSave(updatedProduct);
    closeModal();
  };

  const handleActivate = (item: any) => {
    const updatedProduct = {
      ...item,
      is_active: item.is_active === 1 ? 0 : 1,
      category_id: item.pos_product_category_id
    };

    handleSave(updatedProduct);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setIsRemoveModalOpen(false);
  };
  const handleEditProduct = (item: any) => {
    setSelectedItem(item);

    onAdd();
  };

  return (
    <>
      <div className="mb-4 grid max-w-96 grid-cols-2 gap-4 sm:grid-cols-3 md:mb-0">
        {['All', 'Active', 'Inactive'].map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? 'default' : 'outline'}
            onClick={() => setActiveFilter(filter)}
            className="flex h-full min-w-28 flex-col rounded-lg p-2 text-xs"
          >
            <p className="w-full text-left">{filter}</p>
            <p className="w-full text-right text-base">
              {filter === 'All'
                ? data.filter((group_mod: any) => group_mod.status === 1).length
                : filter === 'Active'
                ? data.filter(
                    (group_mod: any) =>
                      group_mod.is_active === 1 && group_mod.status === 1
                  ).length
                : data.filter(
                    (group_mod: any) =>
                      group_mod.is_active !== 1 && group_mod.status === 1
                  ).length}
            </p>
          </Button>
        ))}
      </div>
      <div className="flex flex-col justify-end gap-4 lg:flex-row">
        <div className="flex-1 items-center justify-between gap-4 md:flex">
          <Input
            placeholder={`Search ${title}`}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full rounded-lg px-4 py-2"
          />
          {allCategories && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="mt-4 md:mt-0">
                <Button className="w-full md:max-w-60" variant="outline">
                  {selectedCategory
                    ? allCategories.find((c: any) => c.id === selectedCategory)
                        ?.name
                    : 'Filter by Category'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="h-56 w-full overflow-y-auto">
                {allCategories.map((category: any) => (
                  <DropdownMenuItem
                    key={category.id}
                    onSelect={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem onSelect={() => setSelectedCategory('')}>
                  Clear Filter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {sortedData.length > 0 && (
          <Button
            onClick={onAdd}
            data-tutorial="create-product"
            className="mt-2 w-full rounded-lg px-4 py-2 md:mt-0 lg:w-auto"
            disabled={allCategories.length === 0}
          >
            + Create {title.slice(0, -1)}
          </Button>
        )}
      </div>

      <div className="w-full rounded-lg bg-secondary">
        <div className="w-full overflow-hidden rounded-t-lg">
          {allCategories.length > 0 ? (
            <div className="max-h-[500px] overflow-y-auto">
              <TableForFixedHeader className="lg:table-fixed">
                <TableHeader className="sticky top-0 bg-secondary">
                  <TableRow>
                    <TableHead className="w-1/4 p-4">Product Name</TableHead>
                    <TableHead className="w-1/12 p-4 text-center">
                      Cost
                    </TableHead>
                    <TableHead className="w-1/6 p-4">Price</TableHead>
                    <TableHead className="w-1/6 p-4 text-center">
                      Sold Today
                    </TableHead>
                    <TableHead className="w-1/6 p-4">Category</TableHead>
                    <TableHead className="w-1/6 p-4">Code</TableHead>
                    <TableHead className="w-1/6 p-4">
                      <div className="flex items-center gap-2">
                        Status
                        <RefreshCcw size={16} />
                      </div>
                    </TableHead>
                    <TableHead className="w-1/6 p-4 text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData
                    .filter((item: any) => {
                      if (activeFilter === 'Active')
                        return item.is_active === 1 && item.status === 1;
                      if (activeFilter === 'Inactive')
                        return item.is_active !== 1 && item.status === 1;
                      return item.status === 1;
                    })
                    .map((item: any) => (
                      <TooltipProvider key={item.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <TableRow
                              className="hover:bg-hoverTable"
                              key={item.id}
                            >
                              <TableCell className="px-4">
                                <div className="flex items-center gap-4">
                                  <div className="flex min-w-14 items-center gap-3">
                                    {item.color ? (
                                      <div
                                        className="h-2 w-2 rounded-full"
                                        style={{
                                          backgroundColor: item.color
                                        }}
                                      ></div>
                                    ) : (
                                      <div className="h-2 w-2 rounded-full bg-border" />
                                    )}
                                    {item.photo ? (
                                      <Image
                                        src={
                                          `${process.env.NEXT_PUBLIC_IMG_URL}` +
                                          item?.photo
                                        }
                                        width="40"
                                        height="40"
                                        alt={item.code ? item.code : item.title}
                                        className="h-8 w-8 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-border">
                                        <div>{item.code?.slice(0, 3)}</div>
                                      </div>
                                    )}
                                  </div>
                                  <Input
                                    type="text"
                                    value={
                                      editingItemId === item.id &&
                                      editingField === 'title'
                                        ? editingValue
                                        : item.title
                                    }
                                    onChange={(e) => {
                                      if (
                                        editingItemId !== item.id ||
                                        editingField !== 'title'
                                      ) {
                                        handleDoubleClick(item, 'title');
                                      }
                                      handleChange(e);
                                    }}
                                    onBlur={() => handleBlur(item)}
                                    className="w-full rounded-md border px-2 py-1"
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="px-4 text-center">
                                {productCost(item.ingredients)}
                              </TableCell>
                              <TableCell className="px-4">
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
                                  className="borde w-full rounded-md px-2 py-1"
                                />
                              </TableCell>
                              <TableCell className="px-4 text-center">
                                {item.sold_today || 0}
                              </TableCell>
                              <TableCell className="px-4">
                                {allCategories.find(
                                  (category: any) =>
                                    category.id === item.pos_product_category_id
                                )?.name || 'N/A'}
                              </TableCell>

                              <TableCell className="px-4">
                                {item.code || 'N/A'}
                              </TableCell>
                              <TableCell className="px-4">
                                <Badge
                                  onClick={() => {
                                    handleActivate(item);
                                  }}
                                  variant="secondary"
                                  className={`cursor-pointer rounded-full px-2 py-1 hover:opacity-80 ${
                                    item.is_active === 1
                                      ? 'border-green-500 bg-transparent text-green-500'
                                      : 'border-gray text-gray'
                                  }`}
                                >
                                  {item.is_active === 1 ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  variant="ghost"
                                  onClick={() => handleEditProduct(item)}
                                  className="p-2"
                                >
                                  <Pencil size={20} />
                                </Button>
                                <Button
                                  onClick={() => {
                                    setSelectedProduct(item);
                                    setIsRemoveModalOpen(true);
                                  }}
                                  variant="ghost"
                                  className="p-2"
                                >
                                  <Trash size={20} />
                                </Button>
                              </TableCell>
                            </TableRow>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="w-64 p-4">
                            <h3 className="mb-2 font-bold">{item.title}</h3>
                            <p>Cost: ${productCost(item.ingredients)}</p>
                            <p>Selling price: ${item.price}</p>
                            <p>
                              Margin:{' '}
                              {calculateMargin(
                                productCost(item.ingredients),
                                item.price
                              )}
                              %
                            </p>
                            <p>
                              Gross Profit: $
                              {calculateGrossProfit(
                                productCost(item.ingredients),
                                item.price
                              )}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                </TableBody>
              </TableForFixedHeader>
            </div>
          ) : (
            <div className="flex h-96 flex-col items-center justify-center gap-4">
              <div className="text-center">
                <p className="">Make sure to create a category first</p>
              </div>
              <Button
                onClick={() => {
                  setActiveForm('categories');
                }}
                className="w-40 rounded-lg px-4 py-2"
              >
                Go to Category →
              </Button>
            </div>
          )}
          {allCategories.length > 0 &&
            sortedData.filter((category: any) => category.status === 1)
              .length === 0 && (
              <div className="flex h-96 flex-col items-center justify-center gap-4">
                <div className="text-center">
                  <p>No {title} found </p>
                </div>
                <Button
                  onClick={onAdd}
                  data-tutorial="create-product"
                  className="w-40 rounded-lg px-4 py-2"
                  disabled={allCategories.length === 0}
                >
                  + Create {title.slice(0, -1)}
                </Button>
              </div>
            )}
        </div>
      </div>
      <Modal
        title="Remove Product"
        description={`Remove this product ${selectedProduct?.title}`}
        isOpen={isRemoveModalOpen}
        onClose={closeModal}
      >
        <div className="flex flex-col gap-4">
          <p className="mb-2">
            Are you sure you want to remove this product{' '}
            <span className="font-bold">{selectedProduct?.title}</span>?
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

export default ProductsTab;
