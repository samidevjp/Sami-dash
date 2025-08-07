import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import FormLayout from './FormLayout';
import { useToast } from '../ui/use-toast';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import SignupProductAndOrder from './signup-product-order';
import { Modal } from '@/components/ui/modal';
type MenuImportFormProps = {
  onComplete: (menuData?: any) => void;
  initialData?: {
    categories: Array<{
      name: string;
      color: string;
      order: number;
    }>;
    products: Array<{
      title: string;
      price: number;
      code: string;
      stock: string;
      description: string;
      category_id: number;
      color?: string;
    }>;
  };
};
type ProductItem = {
  id: number;
  title: string;
  category_id: string;
  price: string;
  color: string;
  code?: string;
  stock?: string;
  description?: string;
};
export default function MenuImportForm({
  onComplete,
  initialData
}: MenuImportFormProps) {
  const [categories, setCategories] = useState<any[]>(() => {
    if (initialData?.categories) {
      return initialData.categories.map((cat, index) => ({
        id: index + 1,
        name: cat.name,
        color: cat.color,
        order: cat.order
      }));
    }
    return [];
  });
  const [products, setProducts] = useState<ProductItem[]>(() => {
    if (initialData?.products) {
      return initialData.products.map((prod, index) => ({
        id: index + 1,
        title: prod.title,
        price: prod.price.toString(),
        category_id: prod.category_id.toString(),
        color: prod.color || '#ffffff',
        description: prod.description || '',
        code: prod.code || '',
        stock: prod.stock || '0'
      }));
    }
    return [];
  });

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  // const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
  //   useState(false);
  // const [expandedCategories, setExpandedCategories] = useState<number[]>(() => {
  //   if (initialData?.categories) {
  //     return initialData.categories.map((_, index) => index + 1);
  //   }
  //   return [];
  // });
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: '#ffffff'
  });
  const [newProduct, setNewProduct] = useState<ProductItem>({
    id: 1,
    title: '',
    category_id: '',
    price: '',
    color: '#ffffff'
  });
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);
  // const [cartItems, setCartItems] = useState<
  //   Array<{ product: ProductItem; quantity: number }>
  // >([]);
  // Category --------------------------------
  useEffect(() => {
    if (categories.length > 0 || products.length > 0) {
      handleComplete();
    }
  }, [categories, products]);
  const resetProductIds = () => {
    setProducts((prev) =>
      prev.map((product, index) => ({
        ...product,
        id: index
      }))
    );
  };
  const removeCategory = (categoryId: number) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
    setProducts((prev) =>
      prev.filter((p) => p.category_id !== categoryId.toString())
    );
    resetProductIds();
  };
  const handleCategorySubmit = () => {
    if (!newCategory.name) return;
    if (isEditingCategory && editingCategory) {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === editingCategory.id ? { ...cat, ...newCategory } : cat
        )
      );
      setIsEditingCategory(false);
      setEditingCategory(null);
    } else {
      const newId =
        categories.length > 0
          ? Math.max(...categories.map((cat) => cat.id)) + 1
          : 1;
      const category = {
        id: newId,
        ...newCategory,
        order: categories.length
      };
      setCategories([...categories, category]);
    }
    setNewCategory({ name: '', color: '#ffffff' });
    setIsCategoryModalOpen(false);
  };
  // product --------------------------------
  const addNewProduct = () => {
    if (!newProduct.title || !newProduct.category_id || !newProduct.price) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }
    const newId =
      products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    setProducts((prev) => [...prev, { ...newProduct, id: newId }]);
    setNewProduct({
      id: 0,
      title: '',
      category_id: '',
      price: '',
      color: '#ffffff'
    });
    setIsProductModalOpen(false);
  };
  const removeProduct = (productId: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };
  const handleComplete = () => {
    if (categories.length === 0) {
      toast({
        title: 'Error',
        description: 'Please create at least one category',
        variant: 'destructive'
      });
      return;
    }
    const formattedData = {
      categories: categories.map((cat) => ({
        name: cat.name,
        color: cat.color,
        order: cat.order
      })),
      products: products.map((prod) => ({
        title: prod.title,
        price: parseFloat(prod.price),
        category_id: parseInt(prod.category_id),
        color: prod.color || '#000000',
        description: prod.description || '',
        code: prod.code || '',
        stock: prod.stock || '0'
      }))
    };
    onComplete(formattedData);
  };
  return (
    <>
      <FormLayout
        title="Menu Setup"
        description="Create your menu categories and add products to them. ( You can skip this step and import your menu later )"
        fullWidth
      >
        <div className="space-y-12 ">
          {/* Products Section */}
          <Card className="bg-white px-6 py-8">
            <div className="flex justify-between">
              <h3 className="mb-12 text-xl font-semibold">Products</h3>
              <div className="flex justify-end">
                {/* <Button
                  variant="outline"
                  disabled={categories.length === 0 || products.length === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPreviewModalOpen(true);
                  }}
                >
                  Preview POS Layout
                </Button> */}
                <Dialog open={showPreview} onOpenChange={setShowPreview}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={
                        categories.length === 0 || products.length === 0
                      }
                    >
                      Preview POS Layout
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    className="max-w-[1050px] border-none px-0 py-8 shadow-none"
                    aria-hidden={false}
                    style={{ maxWidth: '1050px!important' }}
                  >
                    <SignupProductAndOrder
                      products={products}
                      categories={categories}
                    />
                  </DialogContent>
                </Dialog>
                {/* {isPreviewModalOpen && (
                  <Modal
                    title="Preview POS Layout"
                    description=""
                    isOpen={isPreviewModalOpen}
                    onClose={() => {
                      console.log('Modal is closing');
                      setIsPreviewModalOpen(false);
                    }}
                  >
                    <div onClick={(e) => e.stopPropagation()}>
                      <SignupProductAndOrder
                        className="relative h-full w-full text-foreground"
                        products={products}
                        categories={categories}
                      />
                    </div>
                  </Modal>
                )} */}
              </div>
            </div>
            <div>
              {/* Categories List */}
              <div className="mb-16 border-t pt-8 md:px-4">
                <div className="mb-8 flex items-center gap-4">
                  <p>
                    <span className="font-semibold">Create Category</span>
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCategoryModalOpen(true)}
                    className="px-3"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {/* <div className="grid grid-cols-1 md:grid-cols-2 md:px-8"> */}
                <div className="grid max-h-96 grid-cols-1 overflow-y-auto md:max-h-72 md:grid-cols-2 md:px-8">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="group mb-4 grid grid-cols-1 gap-8 rounded-lg bg-secondary p-8 md:mb-2 md:grid-cols-2 md:gap-4 md:bg-white md:p-0 md:py-1"
                    >
                      <Label>
                        <p className="mb-2 text-muted-foreground md:hidden">
                          Category Name
                        </p>
                        <Input
                          value={category.name}
                          onChange={(e) => {
                            const updatedCategories = categories.map((cat) =>
                              cat.id === category.id
                                ? { ...cat, name: e.target.value }
                                : cat
                            );
                            setCategories(updatedCategories);
                          }}
                          className="bg-white"
                        />
                      </Label>
                      <div>
                        <div className="flex items-end justify-between gap-2 md:items-center md:justify-start">
                          <Label>
                            <p className="mb-2 text-muted-foreground md:hidden">
                              Category Colour
                            </p>
                            <Input
                              type="color"
                              value={category.color}
                              onChange={(e) => {
                                const updatedCategories = categories.map(
                                  (cat) =>
                                    cat.id === category.id
                                      ? { ...cat, color: e.target.value }
                                      : cat
                                );
                                setCategories(updatedCategories);
                              }}
                              className="w-20 bg-white md:w-12"
                            />
                          </Label>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              removeCategory(category.id);
                            }}
                            className="text-muted-foreground"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Products List */}
              {categories.length > 0 ? (
                <div className="border-t pt-8 md:px-4">
                  <div className="mb-8 flex items-center gap-4">
                    <p>
                      <span className="font-semibold">Create Product</span>
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsProductModalOpen(true)}
                      className="px-3"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="md:px-8">
                    <div className="group mb-2 hidden grid-cols-1 gap-4 md:grid md:grid-cols-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Product Name
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Category
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Product Colour
                        </p>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto md:max-h-none">
                      {products.map((product: any) => (
                        <div
                          key={product.id}
                          className="group mb-4 grid grid-cols-1 gap-8 rounded-lg bg-secondary p-8 md:mb-2 md:grid-cols-4 md:gap-4 md:bg-white md:p-0 md:py-1"
                        >
                          <Label>
                            <p className="mb-2 text-muted-foreground md:hidden">
                              Product Name
                            </p>
                            <Input
                              value={product.title}
                              onChange={(e) => {
                                const updatedProducts = products.map((p) =>
                                  p.id === product.id
                                    ? { ...p, title: e.target.value }
                                    : p
                                );
                                setProducts(updatedProducts);
                              }}
                              className="bg-white"
                            />
                          </Label>
                          <Label>
                            <p className="mb-2 text-muted-foreground md:hidden">
                              Category
                            </p>
                            <div className="flex gap-2">
                              <Select
                                value={product.category_id}
                                onValueChange={(value) => {
                                  const updatedProducts = products.map((p) =>
                                    p.id === product.id
                                      ? { ...p, category_id: value }
                                      : p
                                  );
                                  setProducts(updatedProducts);
                                }}
                              >
                                <SelectTrigger className="flex-1 bg-white">
                                  <SelectValue placeholder="Select category">
                                    <span>
                                      {
                                        categories.find(
                                          (c) =>
                                            c.id.toString() ===
                                            product.category_id
                                        )?.name
                                      }
                                    </span>
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((category) => (
                                    <SelectItem
                                      key={category.id}
                                      value={category.id.toString()}
                                    >
                                      {category.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </Label>
                          <Label>
                            <p className="mb-2 text-muted-foreground md:hidden">
                              Price
                            </p>
                            <Input
                              type="number"
                              value={product.price}
                              onChange={(e) => {
                                const updatedProducts = products.map((p) =>
                                  p.id === product.id
                                    ? { ...p, price: e.target.value }
                                    : p
                                );
                                setProducts(updatedProducts);
                              }}
                              className="bg-white"
                            />
                          </Label>
                          <Label>
                            <p className="mb-2 text-muted-foreground md:hidden">
                              Product Colour
                            </p>
                            <div className="flex justify-between gap-2">
                              <Input
                                type="color"
                                value={product.color}
                                onChange={(e) => {
                                  const updatedProducts = products.map((p) =>
                                    p.id === product.id
                                      ? { ...p, color: e.target.value }
                                      : p
                                  );
                                  setProducts(updatedProducts);
                                }}
                                className="w-20 bg-white"
                              />
                              <Button
                                variant="outline"
                                onClick={() => removeProduct(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-16 text-center">
                  <p className="text-muted-foreground">
                    Create a Category First to Add Products
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </FormLayout>
      {/* Category Creation Modal */}
      <Modal
        title="Create New Category"
        description="Create a new category for your products"
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Category Name</Label>
            <Input
              id="category-name"
              placeholder="Category name"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-color">Category Colour</Label>
            <Input
              id="category-color"
              type="color"
              value={newCategory.color}
              onChange={(e) =>
                setNewCategory({ ...newCategory, color: e.target.value })
              }
              className="w-20"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCategoryModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCategorySubmit}>Create Category</Button>
          </div>
        </div>
      </Modal>
      {/* Product Creation Modal */}
      <Modal
        title="Create New Product"
        description="Create a new product for your menu"
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product-name">Product Name</Label>
            <Input
              id="product-name"
              placeholder="Product name"
              value={newProduct.title}
              onChange={(e) =>
                setNewProduct({ ...newProduct, title: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-category">Category</Label>
            <Select
              value={newProduct.category_id}
              onValueChange={(value) => {
                const selected = categories.find(
                  (category) => category.id.toString() === value
                );

                setNewProduct({
                  ...newProduct,
                  category_id: value
                });
              }}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-price">Price</Label>
            <Input
              id="product-price"
              type="number"
              placeholder="0.00"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="product-color">Product Colour</Label>
            <Input
              id="product-color"
              type="color"
              value={newProduct.color}
              onChange={(e) =>
                setNewProduct({ ...newProduct, color: e.target.value })
              }
              className="w-20"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsProductModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={addNewProduct}>Create Product</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
