'use client';
import { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useApi } from '@/hooks/useApi';
import ProductForm from '@/components/product-inventory-form';
import IngredientInventoryForm from '@/components/ingredient-inventory-form';
import axios from 'axios';
import CategoryInventoryForm from '@/components/category-inventory-form';
import LocationInventoryForm from '@/components/forms/inventory-location-form';
import SuppliersInventoryForm from '@/components/forms/SuppliersInventoryForm';
import MeasurementUnitForm from '@/components/forms/MeasurementUnitForm';
import UnitDescriptionForm from '@/components/forms/UnitDescriptionForm';
import OrderUnitDescriptionForm from '@/components/forms/OrderUnitDescForm';
import CategoryFormModal from '@/components/forms/CategoryFormModal';
import { toast } from '@/components/ui/use-toast';
import GroupModifierForm from '@/components/forms/groupModifierForm';
import Page from '../create-invoice/page';
import { Dialog, DialogOverlay } from '@/components/ui/dialog';
import IngredientsTab from './ingredientsTab';
import ProductsTab from './productsTab';
import InventoryOverview from './overviewTab';
import AddAddonModal from '@/components/forms/addon-form';
import { Heading } from '@/components/ui/heading';
import ModifiersTab from './modifiersTab';
import GroupModTab from './groupModTab';
import CategoriesTab from './categoriesTab';
import SuppliesTab from './suppliesTab';

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeForm, setActiveForm] = useState<string>('products');
  const [activeFilter, setActiveFilter] = useState('Categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [productsModal, setProductsModal] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [inventoryCategories, setInventoryCategories] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [groupModifiers, setGroupModifiers] = useState<any[]>([]);
  const [inventoryData, setInventoryData] = useState<any>({
    categories: [],
    locations: [],
    suppliers: [],
    measurementUnits: [],
    unitDescriptions: [],
    orderUnit: []
  });
  const [updateData, setUpdateData] = useState(false);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [isScanInvoiceModalOpen, setIsScanInvoiceModalOpen] = useState(false);
  const [addonsWithIngredients, setAddonsWithIngredients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // const handleScanInvoiceClick = () => {
  //   setIsIngredientModalOpen(false);
  //   // setIsModalOpen(false)
  //   setIsScanInvoiceModalOpen(true);
  // };
  const [selectedModifier, setSelectedModifier] = useState<any>(null);

  const handleBackInvoiceClick = () => {
    setIsScanInvoiceModalOpen(false);
    setIsIngredientModalOpen(true);
  };

  const handleProductSelect = (product: any) => {
    // setIsIngredientModalOpen(false);
    setSelectedItem(() => product);
    // setIsScanInvoiceModalOpen(false);
    setIsIngredientModalOpen(true);
  };
  const updateProductAsCreated = (productId: number) => {
    setProductsModal((prevProducts) =>
      prevProducts.map((product) =>
        product.name === productId ? { ...product, updated: true } : product
      )
    );
  };

  // const handleIngredientInventoryFormSubmit = (data: any) => {
  //   // Handle ingredient form submission
  //   console.log('Submitted data:', data);
  //   setIsIngredientModalOpen(false);
  // };

  const { data: session } = useSession();
  const {
    fetchInventoryIngredients,
    fetchIngredientsFromProduct,
    // fetchIngredientsFromCategory,
    fetchCategories,
    fetchInventoryProducts,
    fetchInventoryLocations,
    fetchInventorySuppliers,
    listMeasurementUnits,
    fetchUnitDescriptions,
    fetchOrderUnit,
    AddProduct,
    deleteInventoryCategory,
    deleteInventoryLocation,
    deleteInventorySupplier,
    deleteMeasurementUnit,
    deleteOrderUnit,
    fetchGroupModifiers,
    createGroupModifier,
    deleteGroupModifier,
    deleteProduct,
    deleteUnitDescription,
    saveIngredientInProduct,
    saveProductInventory,
    createInventoryCategory,
    createInventorySupplier,
    createMeasurementUnit,
    createUnitDescription,
    createOrderUnit,
    fetchAnalyticsInventoryProducts,
    createCategory,
    createAddOn: createModifier,
    deleteProductIngredients,
    fetchIngredientsFromAddon,
    // createProduct,
    createAddOn,
    createInventoryLocation
  } = useApi();

  const update_Data = () => setUpdateData(!updateData);
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          fetchedIngredients,
          fetchedCategories,
          fetchedLocations,
          fetchedSuppliers,
          fetchedMeasurementUnits,
          fetchedUnitDescriptions,
          fetchedOrderUnit,
          fetchedgroupModifiers,
          fetchedAnalyticsData,
          fetchedItemsCategories
        ] = await Promise.all([
          fetchInventoryIngredients(),
          fetchCategories(),
          fetchInventoryLocations(),
          fetchInventorySuppliers(),
          listMeasurementUnits(),
          fetchUnitDescriptions(),
          fetchOrderUnit(),
          fetchGroupModifiers(),
          fetchAnalyticsInventoryProducts(),
          axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}pos/product/menu`,
            {},
            { headers: { Authorization: `Bearer ${session?.user.token}` } }
          )
        ]);
        let fetchedProducts = [];
        let fetchedAddons = [];
        const allCategoryIds = fetchedItemsCategories.data.data.menu.map(
          (category: any) => category.id
        );
        const fetchedProductsPromises = allCategoryIds.map(
          async (categoryId: any) => {
            const products = await fetchInventoryProducts(categoryId);
            return products;
          }
        );
        const fetchedAddonsPromises = allCategoryIds.map(
          async (categoryId: any) => {
            const addons = await fetchIngredientsFromAddon(categoryId);
            return addons;
          }
        );
        const fetchedProductsArray = await Promise.all(fetchedProductsPromises);
        const fetchedAddonsArray = await Promise.all(fetchedAddonsPromises);
        fetchedProducts = fetchedProductsArray.flat();
        fetchedAddons = fetchedAddonsArray.flat();
        setAddonsWithIngredients(fetchedAddons);
        setProducts(fetchedProducts);
        setIngredients(fetchedIngredients);
        setCategories(fetchedItemsCategories.data.data.menu);
        setInventoryCategories(fetchedCategories);
        setGroupModifiers(fetchedgroupModifiers);
        setAnalyticsData(fetchedAnalyticsData);
        setInventoryData({
          categories: fetchedCategories,
          locations: fetchedLocations,
          suppliers: fetchedSuppliers,
          measurementUnits: fetchedMeasurementUnits,
          unitDescriptions: fetchedUnitDescriptions,
          orderUnit: fetchedOrderUnit
        });
        // calculateOverview(fetchedIngredients);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [updateData]);

  const openModal = (formType: string) => {
    setActiveForm(formType);
    setIsModalOpen(true);
  };

  const allProducts = categories.flatMap((category: any) => category.products);
  // const allAddons = categories.flatMap((category: any) => category.add_ons);

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setSearchTerm('');
  };

  const filteredIngredients = ingredients.filter(
    (item) =>
      item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!selectedCategory ||
        item.pos_inventory_item_categories?.id === selectedCategory)
  );

  const filteredProducts = products.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!selectedCategory || item.pos_product_category_id === selectedCategory)
  );

  const filteredAllCategories = categories.filter((category: any) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // const filteredAddons = categories.flatMap((category: any) =>
  //   category.add_ons.filter(
  //     (item: any) =>
  //       item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
  //       (!selectedCategory || item.pos_product_category_id === selectedCategory)
  //   )
  // );
  const filteredAddons = addonsWithIngredients.filter((item: any) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // console.log('filteredIngredients:', filteredIngredients);

  const removeItem = async (id: number) => {
    try {
      switch (activeForm) {
        case 'products':
          // await deleteProduct(id);
          break;
        case 'categories':
          // await createInventoryCategory(id);
          break;
        case 'ingredients':
          // await saveIngredientInProduct(id); // this is for adding ingredient to the product.
          // await deleteProductIngredients(id);
          // await saveProductInventory(id);
          await deleteProductIngredients(id);
          break;
        case 'group_mod':
          await deleteGroupModifier(id);
          // await createModifier(id);
          break;
        case 'supplies':
          switch (activeFilter) {
            case 'Categories':
              await deleteInventoryCategory(id);
              break;
            case 'Locations':
              await deleteInventoryLocation(id);
              break;
            case 'Measurement Units':
              await deleteMeasurementUnit(id);
              break;
            case 'Unit Descriptions':
              await deleteUnitDescription(id);
              break;
            case 'Order Unit Description':
              await deleteOrderUnit(id);
              break;
            case 'Suppliers':
              await deleteInventorySupplier(id);
              break;
            default:
              break;
          }
        // Add more cases for other types
        default:
          break;
      }
      setUpdateData(!updateData);
    } catch (err) {
      toast({
        title: 'Error',
        description: `Error removing ${activeForm}`,
        duration: 3000,
        variant: 'destructive'
      });
      console.error('Error removing item:', err);
    }
  };

  const handleSave = async (data: any) => {
    try {
      let result;
      switch (activeForm) {
        case 'products':
          result = await AddProduct(data);
          break;
        case 'categories':
          result = await createCategory(data);
          break;
        case 'ingredients':
          updateProductAsCreated(data?.product_name);
          result = await saveProductInventory(data);
          break;
        case 'modifiers':
          result = await createAddOn(data);
          break;
        case 'group_mod':
          result = await createGroupModifier(data);
          break;
        case 'supplies':
          switch (activeFilter) {
            case 'Categories':
              result = await createInventoryCategory(data);
              break;
            case 'Locations':
              result = await createInventoryLocation(data);
              break;
            case 'Measurement Units':
              result = await createMeasurementUnit(data);
              break;
            case 'Unit Descriptions':
              result = await createUnitDescription(data);
              break;
            case 'Order Unit Description':
              result = await createOrderUnit(data);
              break;
            default:
              result = await createInventorySupplier(data);
              break;
          }
          break;
        default:
          break;
      }
      setUpdateData(!updateData);
      return result;
    } catch (err) {
      toast({
        title: 'Error',
        // @ts-ignore
        description: err?.response?.data?.message || 'Error creating item',
        variant: 'destructive',
        duration: 3000
      });
      console.error(`Error creating ${activeForm}:`, err);
      throw err;
    }
  };

  const breadcrumbItems = [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Inventory', link: '/dashboard/inventory' }
  ];

  return (
    <PageContainer scrollable>
      <div className="h-full w-[90vw] space-y-4 sm:w-full ">
        {/* <Breadcrumbs items={breadcrumbItems} /> */}
        <div className="mb-4 flex items-center justify-between">
          <Heading
            title={`Inventory`}
            description="Manage your inventory"
            titleClass="text-xl"
            descriptionClass="text-sm"
          />
          {/* {activeForm === 'ingredients' && (
            <Button onClick={() => setIsScanInvoiceModalOpen(true)}>
              Scan Invoice
            </Button>
          )} */}
        </div>
        {/* <Button onClick={() => router.push('/dashboard/create-invoice')}>Read Invoice</Button> */}

        {isLoading ? (
          <div className="flex h-[75dvh] items-center justify-center">
            <Loader2 className="mr-2 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <Tabs defaultValue="products" value={activeForm}>
            <TabsList className="flex w-fit flex-wrap bg-background md:block md:flex-nowrap">
              {[
                'products',
                'categories',
                'group_mod',
                'modifiers',
                'ingredients',
                'supplies',
                'overview'
              ].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className={`flex-1 py-2 text-center hover:text-primary data-[state=active]:font-bold data-[state=active]:text-primary data-[state=active]:shadow-none`}
                  onClick={() => setActiveForm(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1).replace('_', ' ')}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="products" className="mt-4 w-full space-y-4 ">
              <ProductsTab
                title="Products"
                data={filteredProducts}
                onAdd={() => openModal('products')}
                onSearch={(term: any) => setSearchTerm(term)}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                setSelectedItem={setSelectedItem}
                allCategories={categories}
                ingredients={ingredients}
                handleSave={handleSave}
                setActiveForm={setActiveForm}
              />
            </TabsContent>

            <TabsContent value="categories" className="mt-4 w-full space-y-4">
              <CategoriesTab
                title="Categories"
                data={filteredAllCategories}
                onAdd={() => openModal('categories')}
                onSearch={(term: any) => setSearchTerm(term)}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                setSelectedItem={setSelectedItem}
                handleSave={handleSave}
              />
            </TabsContent>

            <TabsContent value="group_mod" className="mt-4 space-y-4 ">
              <GroupModTab
                title="Group Mods"
                data={groupModifiers}
                onAdd={() => openModal('group_mod')}
                setSelectedItem={setSelectedItem}
                removeItem={removeItem}
                handleSave={handleSave}
                selectedModifier={selectedModifier}
              />
            </TabsContent>

            <TabsContent value="modifiers" className="mt-4 space-y-4 ">
              <ModifiersTab
                title="Modifiers"
                data={filteredAddons}
                onAdd={() => openModal('modifiers')}
                onSearch={(term: any) => setSearchTerm(term)}
                searchTerm={searchTerm}
                handleSave={handleSave}
                selectedModifier={selectedModifier}
                setSelectedModifier={setSelectedModifier}
                // allCategories={categories}
                // selectedItem={selectedItem}
                // setSelectedItem={setSelectedItem}
              />
            </TabsContent>

            <TabsContent value="ingredients" className="mt-4 space-y-4 ">
              <IngredientsTab
                title="Ingredients"
                data={filteredIngredients}
                onAdd={() => {
                  setSelectedItem(() => null);
                  openModal('ingredients');
                  setIsIngredientModalOpen(true);
                }}
                onSearch={(term: any) => setSearchTerm(term)}
                searchTerm={searchTerm}
                setSelectedItem={setSelectedItem}
                setSearchTerm={setSearchTerm}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                categories={inventoryCategories}
                isCategoryDropdownOpen={isCategoryDropdownOpen}
                setIsCategoryDropdownOpen={setIsCategoryDropdownOpen}
                removeItem={removeItem}
                handleSave={handleSave}
                updateData={setUpdateData}
              />
            </TabsContent>

            <TabsContent value="supplies" className="mt-4 space-y-4 ">
              <SuppliesTab
                activeSubView={activeFilter}
                setActiveSubView={setActiveFilter}
                data={inventoryData}
                onAdd={() => openModal('supplies')}
                setSelectedItem={setSelectedItem}
                removeItem={removeItem}
              />
            </TabsContent>
            {/* <TabsContent value="overview" className="space-y-4 mt-16 md:pt-4">
    
              </TabsContent> */}
            <InventoryOverview analyticsData={analyticsData} />
          </Tabs>
        )}
      </div>

      {/* <Modal
        description="creating"
        title={`Create ${activeForm}`}
        isOpen={isModalOpen}
        onClose={closeModal}
      > */}
      <div className="min-w-[80vw]">
        {activeForm === 'products' && (
          <ProductForm
            isOpen={isModalOpen}
            onSubmit={handleSave}
            categories={categories}
            itemData={selectedItem}
            onClose={closeModal}
            ingredients={ingredients}
            saveIngredientInProduct={saveIngredientInProduct}
            setUpdatedData={setUpdateData}
          />
        )}
        {activeForm === 'categories' && (
          <CategoryFormModal
            isOpen={isModalOpen}
            onSubmit={handleSave}
            initialData={selectedItem}
            onClose={closeModal}
            setUpdatedData={setUpdateData}
          />
        )}
        {activeForm === 'group_mod' && (
          <GroupModifierForm
            isOpen={isModalOpen}
            onSubmit={handleSave}
            initialData={selectedItem}
            onClose={closeModal}
            setUpdatedData={setUpdateData}
          />
        )}
        {activeForm === 'modifiers' && (
          <AddAddonModal
            onSubmit={handleSave}
            initialData={selectedItem}
            isOpen={isModalOpen}
            onClose={closeModal}
            categories={categories}
            ingredients={ingredients}
          />
        )}
        {activeForm === 'ingredients' && (
          <>
            {/* Ingredient Modal */}
            <IngredientInventoryForm
              onSubmit={handleSave}
              isOpen={isIngredientModalOpen}
              itemData={selectedItem}
              onClose={() => {
                setIsModalOpen(false);
                setIsIngredientModalOpen(false);
              }}
              inventoryData={inventoryData}
              setUpdatedData={update_Data}
              setInventoryData={setInventoryData}
            />
          </>
        )}
        {/* Scan Invoice Modal */}

        {isScanInvoiceModalOpen && (
          <Dialog
            open={isScanInvoiceModalOpen}
            onOpenChange={() =>
              setIsScanInvoiceModalOpen(!isScanInvoiceModalOpen)
            }
            // modal={true}
          >
            <DialogOverlay
              style={isIngredientModalOpen ? { display: 'none' } : {}}
              className="h-full min-w-[95vw]"
            >
              <Page
                onSelectProduct={handleProductSelect}
                products={productsModal}
                setProducts={setProductsModal}
                handleBackInvoiceClick={handleBackInvoiceClick}
              />
            </DialogOverlay>
          </Dialog>
        )}
        {activeForm === 'supplies' && (
          <>
            {activeFilter === 'Categories' && (
              <CategoryInventoryForm
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleSave}
                initialData={selectedItem}
                setUpdatedData={setUpdateData}
              />
            )}
            {activeFilter === 'Locations' && (
              <LocationInventoryForm
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleSave}
                initialData={selectedItem}
                setUpdatedData={setUpdateData}
              />
            )}
            {activeFilter === 'Suppliers' && (
              <SuppliersInventoryForm
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleSave}
                initialData={selectedItem}
                setUpdatedData={setUpdateData}
              />
            )}
            {activeFilter === 'Measurement Units' && (
              <MeasurementUnitForm
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleSave}
                initialData={selectedItem}
                setUpdatedData={setUpdateData}
              />
            )}
            {activeFilter === 'Unit Descriptions' && (
              <UnitDescriptionForm
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleSave}
                initialData={selectedItem}
                setUpdatedData={setUpdateData}
              />
            )}
            {activeFilter === 'Order Unit Description' && (
              <OrderUnitDescriptionForm
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleSave}
                initialData={selectedItem}
                setUpdatedData={setUpdateData}
                inventoryData={inventoryData}
              />
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
}
