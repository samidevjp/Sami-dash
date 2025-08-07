import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useApi } from '@/hooks/useApi';
import axios from 'axios';
import { Product, PreviewProps } from '../../types';
import { formatDateShort } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  ChevronDown,
  Package,
  Truck,
  CalendarCheck,
  Store
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import TabMenu from './TabMenu';
import OnlineStoreProductSection from './OnlineStoreProductSection';
import OnlineStorePreview from './OnlineStorePreview';
import FormFields from './FormFields';
import ProductForm from '@/components/product-inventory-form';
import AddAddonModal from '@/components/forms/addon-form';
import ModifiersTab from '@/app/dashboard/inventory/modifiersTab';
import ModifierGroupsSection from './ModifierGroupsSection';
interface Modifier {
  id: number;
  name: string;
  price: number;
  has_description: boolean;
}
interface OnlineStoreProps {
  businessProfile: any;
  products: any;
  setProducts: React.Dispatch<React.SetStateAction<any>>;
  onlineStoreSettings: any;
  setOnlineStoreSettings?: any;
  isLoading: boolean;
  setShouldRefetch: React.Dispatch<React.SetStateAction<boolean>>;
}
interface TabProps {
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}
const OnlineStoreContainer = ({
  businessProfile,
  products,
  setProducts,
  onlineStoreSettings,
  setOnlineStoreSettings,
  isLoading,
  setShouldRefetch
}: OnlineStoreProps) => {
  const {
    createOnlineCategory,
    uploadOnlineStorePhoto,
    getOnlineStoreSettings,
    updateOnlineStoreSettings,
    fetchIngredientsFromAddon,
    createAddOn,
    fetchInventoryIngredients,
    saveIngredientInProduct,
    AddProduct
  } = useApi();
  const { data: session } = useSession();
  const [selectedTab, setSelectedTab] =
    useState<TabProps['selectedTab']>('Branding');
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState<boolean>(false);
  const [uploadImageData, setUploadImageData] = useState<any>('');
  const [useLogo, setUseLogo] = useState<boolean>(false);
  const [brandImage, setBrandImage] = useState<string>();
  const [brandLogo, setBrandLogo] = useState<string>();
  const [updateCatgories, setUpdateCatgories] = useState<boolean>(false);
  const [logoPreview, setLogoPreview] =
    useState<PreviewProps['logoPreview']>('');
  const [uploadLogoData, setUploadLogoData] =
    useState<PreviewProps['uploadLogoData']>(null);
  const [existingProducts, setExistingProducts] = useState<Product[]>([]);
  const [onlineStoreData, setOnlineStoreData] = useState<any>();
  const [backgroundColor, setBackgroundColor] =
    useState<PreviewProps['backgroundColor']>('#ffffff');
  const [accentColor, setAccentColor] =
    useState<PreviewProps['accentColor']>('#333333');
  const [bookNowColor, setBookNowColor] =
    useState<PreviewProps['bookNowColor']>('#485df9');
  const [selectedFont, setSelectedFont] =
    useState<PreviewProps['selectedFont']>('');
  const [orderMethods, setOrderMethods] = useState<string[]>([]);
  const [autoAcceptOrders, setAutoAcceptOrders] = useState<boolean>(false);
  const [requirePaymentsOnline, setRequirePaymentsOnline] =
    useState<boolean>(false);
  const [allowPaymentsInPerson, setAllowPaymentsInPerson] =
    useState<boolean>(false);
  const [link, setLink] = useState<string>('');
  const [categories, setCategories] = useState<any[]>([]);
  const [inventoryCategories, setInventoryCategories] = useState<any[]>([]);
  const [pickupSettings, setPickupSettings] = useState({
    advance_days: 14,
    blocked_dates: [],
    time_slots: {
      start: '09:00',
      end: '17:00',
      interval: 30
    }
  });
  const [newBlockedDate, setNewBlockedDate] = useState<string>('');
  const [isClickCreateStore, setIsClickCreateStore] = useState<boolean>(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [selectedModifier, setSelectedModifier] = useState<any | null>(null);
  const [addonsWithIngredients, setAddonsWithIngredients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [updateData, setUpdateData] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalType, setModalType] = useState<'product' | 'addon' | null>(null);
  const [isVisibleOnStore, setIsVisibleOnStore] = useState<boolean>(false);
  useEffect(() => {
    if (onlineStoreSettings) {
      const link =
        process.env.NEXT_PUBLIC_ONLINE_STORE_LINK + onlineStoreSettings.domain;
      setLink(link);
      setOrderMethods(onlineStoreSettings.order_methods?.filter(Boolean) || []);
      setUseLogo(onlineStoreSettings.use_logo_instead === 1);
      setBrandLogo(
        onlineStoreSettings.brand_logo
          ? `${process.env.NEXT_PUBLIC_IMG_URL}${onlineStoreSettings.brand_logo}`
          : ''
      );
      setBrandImage(
        onlineStoreSettings.brand_image
          ? `${process.env.NEXT_PUBLIC_IMG_URL}${onlineStoreSettings.brand_image}`
          : ''
      );
      setBackgroundColor(onlineStoreSettings.bg_color || '#ffffff');
      setAccentColor(onlineStoreSettings.accent_color || '#333333');
      setBookNowColor(onlineStoreSettings.book_now_color || '#485df9');
      setSelectedFont(onlineStoreSettings.font);
      setRequirePaymentsOnline(onlineStoreSettings.payments_online === 1);
      setAllowPaymentsInPerson(onlineStoreSettings.payments_in_person === 1);
      setAutoAcceptOrders(onlineStoreSettings.auto_accept_orders === 1);
      setOnlineStoreData(onlineStoreSettings);
      setPickupSettings({
        advance_days: onlineStoreSettings.pickup_settings?.advance_days,
        blocked_dates: onlineStoreSettings.pickup_settings?.blocked_dates,
        time_slots: {
          start: onlineStoreSettings.pickup_settings?.time_slots?.start,
          end: onlineStoreSettings.pickup_settings?.time_slots?.end,
          interval: onlineStoreSettings.pickup_settings?.time_slots?.interval
        }
      });
    }
  }, [onlineStoreSettings]);
  const fetchExistingProducts = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}online-store/products`,
        {},
        {
          headers: {
            'X-TOKEN': onlineStoreSettings?.widget_token || '',
            'X-DOMAIN': onlineStoreSettings?.domain || ''
          }
        }
      );
      const data = response.data.data.products;
      setExistingProducts(data.products);
      setCategories(data.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };
  useEffect(() => {
    if (onlineStoreSettings?.widget_token) {
      fetchExistingProducts();
    }
  }, [onlineStoreSettings?.widget_token, updateCatgories]);
  const addCategory = async (newCategoryName: string) => {
    try {
      const response = await createOnlineCategory(newCategoryName);
      setUpdateCatgories(!updateCatgories);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create category',
        variant: 'destructive'
      });
    }
  };
  const createOnlineStore = async () => {
    const onlineStoreSettingsResponse = await getOnlineStoreSettings();
    setOnlineStoreSettings(onlineStoreSettingsResponse);
  };
  useEffect(() => {
    if (isClickCreateStore) {
      createOnlineStore();
    }
  }, [isClickCreateStore]);
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setBrandImage(imageUrl);
      setUploadImageData(file);
    }
  };
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const logoUrl = URL.createObjectURL(file);
      setBrandLogo(logoUrl);
      setUploadLogoData(file);
    }
  };
  // Save
  const handlesSave = async (isClickCreateStore?: boolean) => {
    try {
      if (!isClickCreateStore) {
        if (uploadImageData || uploadLogoData) {
          try {
            const response = await uploadOnlineStorePhoto(
              uploadImageData,
              uploadLogoData
            );
            if (response.status_code !== 200) {
              toast({
                title: 'Error - Image Upload',
                description: response?.message,
                variant: 'destructive'
              });
            }
          } catch (err) {
            toast({
              title: 'Error',
              description: 'Failed to upload image',
              variant: 'destructive'
            });
          }
        }
      }
      const params = {
        order_methods: orderMethods,
        payments_online: requirePaymentsOnline,
        payments_in_person: allowPaymentsInPerson,
        use_logo_instead: useLogo,
        bg_color: backgroundColor,
        accent_color: accentColor,
        has_button_font_color: false,
        book_now_color: bookNowColor,
        font: selectedFont,
        font_size: '12px',
        domain:
          businessProfile.business_name.split(' ')[0].toLowerCase() ===
          'vanilla'
            ? 'vanillacakes'
            : businessProfile.business_name.split(' ')[0].toLowerCase(),
        auto_accept_orders: autoAcceptOrders,
        pickup_settings: {
          advance_days: pickupSettings.advance_days,
          blocked_dates: pickupSettings.blocked_dates,
          time_slots: {
            start: pickupSettings.time_slots.start,
            end: pickupSettings.time_slots.end,
            interval: pickupSettings.time_slots.interval
          }
        },
        store_description: onlineStoreData?.store_description,
        products: existingProducts.map((product, index) => {
          const isExistingOnlineProduct = product.product_id !== undefined;
          return {
            id: isExistingOnlineProduct ? product.id : null,
            product_id: isExistingOnlineProduct
              ? product.product_id
              : product.id?.toString(),
            product_name: product.product_name || product.title,
            product_desc: product.product_desc || '',
            notes: product.notes || '',
            price: product.price.toString(),
            category_id:
              product.category_id?.toString() ||
              product.pos_product_category_id ||
              product.category_ids?.[0],
            category_ids: product.category_ids || [],
            prep_time: '48 Hours',
            availability: 'Always',
            unit_barcode: product.barcode || '',
            case_barcode: product.barcode || '',
            modifiers:
              product.modifiers?.map((mod: any) => ({
                id: mod.id,
                has_description: mod.has_description || false
              })) || [],
            daily_limit: product.daily_limit || 0,
            daily_sold: product.daily_sold || 0,
            photos: product.photos || [],
            sort_order: index
          };
        })
      };
      const response = await updateOnlineStoreSettings(params);
      setExistingProducts(
        response.data.online_store.products.sort(
          (a: any, b: any) => a.sort_order - b.sort_order
        )
      );
      toast({
        title: 'Success',
        description: 'Settings saved successfully',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive'
      });
    }
  };
  const getAllModifiers = (): Modifier[] => {
    const allModifiers = new Set();
    products?.forEach((category: any) => {
      category.add_ons?.forEach((modifier: any) => {
        allModifiers.add(
          JSON.stringify({
            id: modifier.id,
            name: modifier.name,
            price: modifier.price,
            has_description: modifier.has_description
          })
        );
      });
    });
    return Array.from(allModifiers).map((mod) => JSON.parse(mod as string));
  };
  const allModifiers = getAllModifiers();
  const loadAddonsWithIngredients = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}pos/product/menu`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session?.user.token}`
          }
        }
      );
      const menuCategories = response.data.data.menu;
      const allCategoryIds = menuCategories.map((category: any) => category.id);
      const fetchedAddonsArray = await Promise.all(
        allCategoryIds.map(async (categoryId: any) => {
          const result = await fetchIngredientsFromAddon(categoryId);
          return result;
        })
      );
      const fetchedAddons = fetchedAddonsArray.flat();
      setAddonsWithIngredients(fetchedAddons);
      setInventoryCategories(response.data.data.menu);
    } catch (error) {
      console.error('Error loading addons with ingredients:', error);
    }
  };
  const getInventoryIngredients = async () => {
    try {
      const response = await fetchInventoryIngredients();
      setIngredients(response);
    } catch (error) {
      console.error('Error fetching inventory ingredients:', error);
    }
  };
  useEffect(() => {
    loadAddonsWithIngredients();
  }, [session, updateData]);
  useEffect(() => {
    getInventoryIngredients();
  }, []);
  const filteredAddons = useMemo(() => {
    return addonsWithIngredients.filter(
      (item: any) => item?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [addonsWithIngredients, searchTerm]);
  const openModal = (formType: 'product' | 'addon') => {
    setModalType(formType);
  };
  const handleProductSave = async (data: any) => {
    try {
      const result = await AddProduct(data);
      setProducts((prev: any) =>
        prev.map((category: any) => ({
          ...category,
          products: category.products.map((p: any) =>
            p.id === result.id ? result : p
          )
        }))
      );
      setUpdateData((prev) => !prev);
      return result;
    } catch (err) {
      toast({
        title: 'Error',
        variant: 'destructive',
        duration: 3000
      });
      console.error('Error creating product:', err);
      throw err;
    }
  };
  const handleAddOnSave = async (data: any) => {
    try {
      const result = await createAddOn(data);
      setAddonsWithIngredients((prev: any[]) =>
        prev.map((item) =>
          item.id === result.id ? { ...item, ...result } : item
        )
      );
      setUpdateData((prev) => !prev);
      return result;
    } catch (err) {
      toast({
        title: 'Error',
        variant: 'destructive',
        duration: 3000
      });
      console.error('Error creating add-on:', err);
      throw err;
    }
  };
  const allProducts = products.flatMap(
    (category: any) => category.products || []
  );
  const filteredProducts = allProducts?.filter((item: any) => {
    const title = item?.title ?? '';
    const search = searchTerm ?? '';
    return (
      title.toLowerCase().includes(search.toLowerCase()) &&
      (!selectedCategory || item.pos_product_category_id === selectedCategory)
    );
  });
  const handleCloseForm = () => {
    setIsFormOpen(false);
  };
  useEffect(() => {
    if (!selectedProduct) return;
    const isVisible = existingProducts.some(
      (product) =>
        product.pos_product?.id?.toString() === selectedProduct?.id?.toString()
    );
    setIsVisibleOnStore(isVisible);
  }, [selectedProduct, existingProducts]);
  const handleMoreClick = (product: any) => {
    setIsFormOpen(true);
    setSelectedProduct(product);
  };
  const onToggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      const isSelected = prev.includes(categoryId);
      if (isSelected) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };
  return (
    <div className="relative z-10">
      <div className="sticky top-0 z-30 bg-background pr-6 pt-2">
        <div className="border-b">
          <TabMenu selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
        </div>
      </div>
      {selectedTab === 'Branding' && (
        <div className="z-20 pt-6 md:grid md:grid-cols-2">
          {/* Setting items*/}
          <div className="md:max-h-screen md:overflow-y-scroll md:border-r">
            <div className="border-b">
              <div className="py-8">
                <h2 className="text-xl font-semibold text-foreground">
                  Brand Elements
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Customize how your Wabi widget appears to customers with these
                  brand settings.
                </p>
              </div>
              <div className="space-y-8 px-2 pb-8 md:px-6">
                {/* Image and Logo Section */}
                <div className="mb-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">
                        Brand Image
                      </Label>
                      <Label
                        htmlFor="img-input"
                        className="group relative cursor-pointer"
                      >
                        <div className="h-24 w-24 overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/25 bg-secondary transition-colors hover:border-primary/50">
                          {brandImage ? (
                            <img
                              src={brandImage}
                              alt="Brand Preview"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <span className="text-2xl text-muted-foreground transition-colors group-hover:text-primary/70">
                                +
                              </span>
                            </div>
                          )}
                        </div>
                      </Label>
                    </div>
                    <Input
                      id="img-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">
                        Brand Logo
                      </Label>
                      <Label
                        htmlFor="logo-input"
                        className="group relative cursor-pointer"
                      >
                        <div className="h-24 w-24 overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/25 bg-secondary transition-colors hover:border-primary/50">
                          {brandLogo ? (
                            <img
                              src={brandLogo}
                              alt="Logo Preview"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <span className="text-2xl text-muted-foreground transition-colors group-hover:text-primary/70">
                                +
                              </span>
                            </div>
                          )}
                        </div>
                      </Label>
                    </div>
                    <Input
                      id="logo-input"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">
                      Use Logo Instead of Image
                    </Label>
                    <Switch
                      checked={useLogo !== undefined ? useLogo : false}
                      onCheckedChange={() => setUseLogo(!useLogo)}
                    />
                  </div>
                </div>
                {/* Colors and Font Section */}
                <div className="">
                  <h3 className="mb-4 text-sm font-semibold ">Color Scheme</h3>
                  <div className="mb-12 space-y-4 px-2 md:px-6">
                    <div className="flex items-center justify-between gap-4">
                      <Label className="text-xs text-muted-foreground">
                        Background Color
                      </Label>
                      <div className="flex items-center gap-3">
                        <div className="relative max-w-36 flex-1">
                          <Input
                            type="text"
                            value={backgroundColor}
                            onChange={(e) => {
                              const value = e.target.value;
                              setBackgroundColor(
                                value.startsWith('#') ? value : `#${value}`
                              );
                            }}
                            className="h-10 pl-12 text-sm"
                          />
                          <div
                            className="absolute bottom-0 left-0 top-0 w-10 rounded-l-md border-r"
                            style={{ backgroundColor }}
                          />
                        </div>
                        <Input
                          type="color"
                          value={backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="h-10 w-10 cursor-pointer overflow-hidden p-0"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <Label className="text-xs text-muted-foreground">
                        Font Color
                      </Label>
                      <div className="flex items-center gap-3">
                        <div className="relative max-w-36 flex-1">
                          <Input
                            type="text"
                            value={accentColor}
                            onChange={(e) => {
                              const value = e.target.value;
                              setAccentColor(
                                value.startsWith('#') ? value : `#${value}`
                              );
                            }}
                            className="h-10 pl-12 text-sm"
                          />
                          <div
                            className="absolute bottom-0 left-0 top-0 w-10 rounded-l-md border-r"
                            style={{ backgroundColor: accentColor }}
                          />
                        </div>
                        <Input
                          type="color"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="h-10 w-10 cursor-pointer overflow-hidden p-0"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <Label className="text-xs text-muted-foreground">
                        Button Color
                      </Label>
                      <div className="flex items-center gap-3">
                        <div className="relative max-w-36 flex-1">
                          <Input
                            type="text"
                            value={bookNowColor}
                            onChange={(e) => {
                              const value = e.target.value;
                              setBookNowColor(
                                value.startsWith('#') ? value : `#${value}`
                              );
                            }}
                            className="h-10 pl-12 text-sm"
                          />
                          <div
                            className="absolute bottom-0 left-0 top-0 w-10 rounded-l-md border-r"
                            style={{ backgroundColor: bookNowColor }}
                          />
                        </div>
                        <Input
                          type="color"
                          value={bookNowColor}
                          onChange={(e) => setBookNowColor(e.target.value)}
                          className="h-10 w-10 cursor-pointer overflow-hidden p-0"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Font Selection */}
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-sm font-semibold">Font Family</h3>
                    <div className="w-full max-w-48 flex-1">
                      <DropdownMenu
                        open={isFontDropdownOpen}
                        onOpenChange={setIsFontDropdownOpen}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="h-10 w-full justify-between"
                          >
                            <span className="text-sm">
                              {selectedFont || 'Select a Font'}
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                          {[
                            'Arial',
                            'Georgia',
                            'Times New Roman',
                            'Verdana',
                            'Helvetica',
                            'Courier New',
                            'Trebuchet MS',
                            'Lucida Sans Unicode',
                            'Tahoma',
                            'Comic Sans MS',
                            'Impact',
                            'Palatino Linotype'
                          ].map((font) => (
                            <DropdownMenuItem
                              key={font}
                              onSelect={() => setSelectedFont(font)}
                              className="text-sm"
                            >
                              {font}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="py-12">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-foreground">
                  Store Information
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Configure your store description
                </p>
              </div>
              <div className="space-y-8 px-2 md:px-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Store Description
                  </Label>
                  <Textarea
                    placeholder="Enter a description of your store"
                    value={onlineStoreData?.store_description || ''}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setOnlineStoreData((prev: any) => ({
                        ...prev,
                        store_description: newValue
                      }));
                    }}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Preview */}
          <div className="md:overflow-y-scroll">
            <OnlineStorePreview
              businessProfile={businessProfile}
              logoPreview={logoPreview}
              brandImage={brandImage || ''}
              brandLogo={brandLogo || ''}
              existingProducts={existingProducts}
              backgroundColor={backgroundColor}
              accentColor={accentColor}
              bookNowColor={bookNowColor}
              selectedFont={selectedFont}
              link={link}
              onlineCategories={categories}
            />
          </div>
        </div>
      )}
      {selectedTab === 'Products' && (
        <>
          <OnlineStoreProductSection
            onlineStoreData={onlineStoreData}
            products={products}
            setProducts={setProducts}
            onlineCategories={categories}
            setOnlineCategories={setCategories}
            setUploadImageData={setUploadImageData}
            setUploadLogoData={setUploadLogoData}
            existingProducts={existingProducts}
            setExistingProducts={setExistingProducts}
            token={onlineStoreSettings?.widget_token || ''}
            addCategory={addCategory}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            onEditProduct={handleMoreClick}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            onAdd={() => openModal('product')}
            setSelectedItem={setSelectedItem}
            inventoryCategories={inventoryCategories}
            handleProductSave={handleProductSave}
            addModifiersProps={{
              filteredAddons,
              openModal,
              setSearchTerm,
              searchTerm,
              handleAddOnSave,
              selectedModifier,
              setSelectedModifier,
              allModifiers
            }}
            handlesSave={handlesSave}
          />
          <FormFields
            products={allProducts}
            isOpen={isFormOpen}
            onClose={handleCloseForm}
            selectedProduct={selectedProduct}
            onlineStoreData={onlineStoreData}
            existingProducts={existingProducts}
            inventoryCategories={inventoryCategories}
            onlineCategories={categories}
            setSelectedProduct={setSelectedProduct}
            setExistingProducts={setExistingProducts}
            menuData={products}
            onSubmit={handleProductSave}
            setSelectedTab={setSelectedTab}
            isVisibleOnStore={isVisibleOnStore}
            setIsVisibleOnStore={setIsVisibleOnStore}
            addCategory={addCategory}
            setOnlineCategories={setCategories}
            token={onlineStoreSettings?.widget_token || ''}
            fetchExistingProducts={fetchExistingProducts}
            onToggleCategory={onToggleCategory}
            addModifiersProps={{
              filteredAddons,
              openModal,
              setSearchTerm,
              searchTerm,
              handleAddOnSave,
              selectedModifier,
              setSelectedModifier,
              allModifiers
            }}
          />
          <ProductForm
            isOpen={modalType === 'product'}
            onSubmit={handleProductSave}
            categories={inventoryCategories || []}
            itemData={selectedItem}
            onClose={() => setModalType(null)}
            ingredients={ingredients}
            saveIngredientInProduct={saveIngredientInProduct}
            setUpdatedData={setUpdateData}
            isOnlineStore={true}
            onRefetch={() => setShouldRefetch((prev) => !prev)}
            onlineStoreProps={{
              updateOnlineStoreSettings,
              existingProducts,
              setExistingProducts,
              onlineStoreData,
              onlineCategories: categories,
              selectedCategories,
              onToggleCategory: (categoryId: string) => {
                setSelectedCategories((prev) =>
                  prev.includes(categoryId)
                    ? prev.filter((id) => id !== categoryId)
                    : [...prev, categoryId]
                );
              }
            }}
          />
        </>
      )}
      {/* {selectedTab === 'Modifiers' && (
        <>
          <div className="z-20 pt-6 md:grid md:grid-cols-2">
            <div className="py-6 md:border-r md:px-6">
              <h2 className="text-xl font-semibold text-foreground">
                Modifiers
              </h2>
              <p className="mb-8 mt-2 text-sm text-muted-foreground">
                Create and manage product modifiers for your menu items.
              </p>
              <ModifiersTab
                title="Modifiers"
                data={filteredAddons}
                onAdd={() => openModal('modifiers')}
                onSearch={(term: any) => setSearchTerm(term)}
                searchTerm={searchTerm}
                handleSave={handleAddOnSave}
                selectedModifier={selectedModifier}
                setSelectedModifier={setSelectedModifier}
              />
            </div>
            <div className="py-6 md:px-6">
              <ModifierGroupsSection allModifiers={allModifiers} />
            </div>
          </div>
          {activeForm === 'modifiers' && (
            <AddAddonModal
              onSubmit={handleAddOnSave}
              initialData={selectedModifier}
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              categories={inventoryCategories || []}
              ingredients={ingredients}
              selectedModifier={selectedModifier}
            />
          )}
        </>
      )} */}
      {selectedTab === 'Settings' && (
        <div className="z-20 pt-6 md:grid md:grid-cols-2">
          <div className="md:border-r md:px-6">
            {/* Advance Days Setting */}
            <div className=" py-8">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-foreground">
                  Pickup Time Settings
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Configure when customers can schedule their pickups and manage
                  blocked dates.
                </p>
              </div>
              <div className="space-y-8 px-2 md:px-6">
                {/* Left Column: Basic Settings */}
                <div className="space-y-12">
                  {/* Advance Days Setting */}
                  <div className="">
                    <div className="mb-4 space-y-2">
                      <Label className="font-semibold">
                        Maximum Advance Booking
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        How far in advance customers can schedule their pickup
                      </p>
                    </div>
                    <div className="max-w-40">
                      <Select
                        value={pickupSettings?.advance_days?.toString()}
                        onValueChange={(value) =>
                          setPickupSettings((prev: any) => ({
                            ...prev,
                            advance_days: parseInt(value)
                          }))
                        }
                      >
                        <SelectTrigger className="h-10 w-full">
                          <SelectValue placeholder="Select days" />
                        </SelectTrigger>
                        <SelectContent>
                          {[7, 14, 30, 60, 90].map((days) => (
                            <SelectItem key={days} value={days.toString()}>
                              {days} days
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* Time Slots */}
                  <div className="">
                    <div className="mb-4 space-y-2">
                      <Label className="font-semibold">Operating Hours</Label>
                      <p className="text-xs text-muted-foreground">
                        Set your business hours for pickup orders
                      </p>
                    </div>
                    <div className="mb-4 grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Opens At
                        </Label>
                        <Input
                          type="time"
                          value={pickupSettings?.time_slots?.start}
                          onChange={(e) =>
                            setPickupSettings((prev: any) => ({
                              ...prev,
                              time_slots: {
                                ...prev.time_slots,
                                start: e.target.value
                              }
                            }))
                          }
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Closes At
                        </Label>
                        <Input
                          type="time"
                          value={pickupSettings?.time_slots?.end}
                          onChange={(e) =>
                            setPickupSettings((prev: any) => ({
                              ...prev,
                              time_slots: {
                                ...prev.time_slots,
                                end: e.target.value
                              }
                            }))
                          }
                          className="h-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Pickup Time Interval
                      </Label>
                      <div className="w-full max-w-40">
                        <Select
                          value={pickupSettings?.time_slots?.interval?.toString()}
                          onValueChange={(value) =>
                            setPickupSettings((prev: any) => ({
                              ...prev,
                              time_slots: {
                                ...prev.time_slots,
                                interval: parseInt(value)
                              }
                            }))
                          }
                        >
                          <SelectTrigger className="h-10 w-full">
                            <SelectValue placeholder="Select interval" />
                          </SelectTrigger>
                          <SelectContent>
                            {[15, 30, 45, 60].map((interval) => (
                              <SelectItem
                                key={interval}
                                value={interval.toString()}
                              >
                                {interval} minutes
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  {/*  Blocked Dates */}
                  <div className="">
                    <div className="mb-4 space-y-2">
                      <Label className="font-semibold">Blocked Dates</Label>
                      <p className="text-xs text-muted-foreground">
                        Select dates when pickup orders will not be available
                      </p>
                    </div>
                    <div className="">
                      <div className="mb-8 flex gap-4">
                        <div className="flex-1">
                          <Input
                            type="date"
                            value={newBlockedDate}
                            onChange={(e) => setNewBlockedDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="h-10"
                          />
                        </div>
                        <Button
                          onClick={() => {
                            if (newBlockedDate) {
                              setPickupSettings((prev: any) => ({
                                ...prev,
                                blocked_dates: [
                                  ...prev.blocked_dates,
                                  newBlockedDate
                                ]
                              }));
                              setNewBlockedDate('');
                            }
                          }}
                          className="h-10"
                        >
                          Block Date
                        </Button>
                      </div>
                      <div className="px-4">
                        <div className="space-y-3">
                          {/* <h3 className="text-xs">Blocked Dates List</h3> */}
                          {pickupSettings?.blocked_dates?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {pickupSettings?.blocked_dates?.map(
                                (date: any) => (
                                  <Badge
                                    key={date}
                                    variant="secondary"
                                    className="h-7 gap-1 bg-tertiary pl-2 pr-1 text-tertiary-foreground"
                                  >
                                    <span>
                                      {formatDateShort(new Date(date))}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        setPickupSettings((prev: any) => ({
                                          ...prev,
                                          blocked_dates:
                                            prev.blocked_dates.filter(
                                              (d: any) => d !== date
                                            )
                                        }))
                                      }
                                      className="h-5 w-5 rounded-full p-0 hover:bg-secondary"
                                    >
                                      ×
                                    </Button>
                                  </Badge>
                                )
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No dates blocked
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="md:px-6">
            {/* Payment Options Section */}
            <div className="border-b py-8">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-foreground">
                  Payment Options
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Configure how customers can pay for their orders
                </p>
              </div>
              <div className="space-y-8 px-2 md:px-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">
                      Online Payments
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Require customers to pay when placing their order
                    </p>
                  </div>
                  <Switch
                    checked={requirePaymentsOnline}
                    onCheckedChange={() =>
                      setRequirePaymentsOnline(!requirePaymentsOnline)
                    }
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">
                      In-Person Payments
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Allow customers to pay when collecting their order
                    </p>
                  </div>
                  <Switch
                    checked={allowPaymentsInPerson}
                    onCheckedChange={() =>
                      setAllowPaymentsInPerson(!allowPaymentsInPerson)
                    }
                  />
                </div>
                {/* Auto Accept Orders */}
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">
                      Auto Accept Orders
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically accept all incoming orders without manual
                      approval
                    </p>
                  </div>
                  <Checkbox
                    checked={autoAcceptOrders}
                    onCheckedChange={(checked) =>
                      setAutoAcceptOrders(checked as boolean)
                    }
                  />
                </div>
              </div>
            </div>
            {/* Order Methods Section */}
            <div className="py-8">
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-foreground">
                  Order Methods
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Select which ordering options you want to offer to your
                  customers
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 px-2 sm:grid-cols-2 md:px-6">
                {[
                  {
                    id: 'pickup',
                    label: 'Pick Up',
                    description: 'Customers collect orders from your location',
                    icon: <Store size={12} />,
                    available: true
                  },
                  {
                    id: 'scheduled',
                    label: 'Scheduled Orders',
                    description: 'Customers can schedule orders for later',
                    icon: <CalendarCheck size={12} />,
                    available: false
                  },
                  {
                    id: 'delivery',
                    label: 'Delivery',
                    description: 'Deliver orders to customer locations',
                    icon: <Truck size={12} />,
                    available: false
                  },
                  {
                    id: 'post',
                    label: 'Post',
                    description: 'Ship orders via postal service',
                    icon: <Package size={12} />,
                    available: false
                  }
                ].map((method) => (
                  <Label
                    key={method.id}
                    className={`relative space-y-2 rounded-lg border bg-secondary p-4 transition-colors  ${
                      orderMethods?.includes(method.id) ? 'border-primary' : ''
                    } ${
                      !method.available
                        ? 'cursor-not-allowed opacity-80'
                        : 'cursor-pointer hover:border-primary'
                    }`}
                  >
                    {!method.available && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg  bg-secondary/30 text-sm font-semibold text-muted-foreground backdrop-blur-sm">
                        Coming soon...
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-8">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <div className="flex h-5 w-5 items-center justify-center rounded-sm bg-background text-secondary-foreground">
                            {method.icon}
                          </div>
                          <p>{method.label}</p>
                        </div>
                        <p className=" text-xs text-muted-foreground">
                          {method.description}
                        </p>
                      </div>
                      <Checkbox
                        disabled={!method.available}
                        checked={orderMethods?.includes(method.id) ?? false}
                        onCheckedChange={() =>
                          setOrderMethods((prev: any) =>
                            prev?.includes(method.id)
                              ? prev.filter((m: string) => m !== method.id)
                              : [...(prev || []), method.id]
                          )
                        }
                      />
                    </div>
                  </Label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <AddAddonModal
        onSubmit={handleAddOnSave}
        initialData={selectedModifier}
        isOpen={modalType === 'addon'}
        onClose={() => setModalType(null)}
        categories={inventoryCategories || []}
        ingredients={ingredients}
        selectedModifier={selectedModifier}
      />
      {(selectedTab === 'Branding' || selectedTab === 'Settings') && (
        <div className="sticky bottom-0 left-0 z-30 flex w-full justify-center bg-background py-8">
          <Button
            variant="default"
            className="flex w-40 items-center justify-center"
            onClick={() => handlesSave()}
          >
            Save
          </Button>
        </div>
      )}
      {!onlineStoreSettings?.widget_token && !isLoading && (
        <div className="fixed top-0 z-50 flex h-full w-full flex-col items-center justify-center bg-accent/80 p-4 md:absolute">
          <p className="mb-4 text-center">
            You need to create a store before you can access the settings
          </p>
          <Button
            variant="submit"
            onClick={() => {
              setIsClickCreateStore(true);
            }}
          >
            Create Store
          </Button>
        </div>
      )}
    </div>
  );
};
export default OnlineStoreContainer;
