'use client';
import { useState, useEffect, useContext } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  useSortable,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getFullname } from '@/utils/Utility';

import { Button } from '@/components/ui/button';
import { Dialog, DialogOverlay } from '@/components/ui/dialog';
import { formatDate, getSum, responseOK } from '@/lib/utils';
import { GripVertical, LayoutGrid, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { TableContext } from '@/hooks/useBookings';
import { useApi } from '@/hooks/useApi';
import { useBooking } from '@/hooks/bookingStore';
import { useEmployee } from '@/hooks/useEmployee';
import { useItems } from '@/hooks/useItems';
import { usePrinterSettings } from '@/hooks/usePrinterSettings';

import { useToast } from '@/components/ui/use-toast';
import { v4 as uuid } from 'uuid';
import AddonModal from '@/components/pos/addon-modal';
import AddOnsSection from '@/components/pos/addon-section';
import AllModsModal from '@/components/pos/all-mods-modal';
import CategoryFormModal from '@/components/forms/CategoryFormModal';
import GuestInfoModal from '@/components/pos/guest-info-modal';
import ModifierModal from '@/components/pos/modifier-modal';
import OrderLists from '@/components/pos/order-lists';
import PaymentModal from '@/components/pos/payment-modal';
import PhoneOrderList from '@/components/pos/phone-order-list';
import ProductGrid from '@/components/pos/product-grid';
import ProductModal from '@/components/pos/product-modal';
import TableSelectionModal from '@/components/pos/table-selection-modal';
import { WeightInputModal } from '@/components/pos/weight-input-modal';
import { PAYMENTORDERSTATUS } from '@/utils/enum';
import { useRouter } from 'next/navigation';
import { getRelativeLuminance } from '@/utils/common';
import { db } from '@/lib/db';

import { useInternetConnection } from '@/providers/InternetConnectionProvider';
const currentTimestamp = String(Date.now() * 1000);

interface ProductAndOrderProps {
  selectedTableId?: number | null;
  onClose: () => void;
  updateData?: () => void;
  propAllCategories?: any;
  propSetAllCategories?: (categories: any) => void;
  tables?: any;
  setUpdateCategories?: (prev: any) => void;
  pageType?: number;
  selectedPhoneOrder?: any;
  setSelectedPhoneOrder?: (phoneOrder: any) => void;
  fetchPhoneOrder?: () => void;
  booking?: any;
  localOrders?: any[];
  setLocalOrders?: ((orders: any[]) => void) | undefined;

  // handleFetchItems?: () => void;
}

export default function ProductAndOrder({
  selectedTableId = null,
  onClose,
  updateData,
  propAllCategories = null,
  propSetAllCategories,
  tables = null,
  setUpdateCategories,
  pageType = PAYMENTORDERSTATUS.pos,
  selectedPhoneOrder,
  setSelectedPhoneOrder,
  fetchPhoneOrder, // handleFetchItems
  booking = null,
  localOrders,
  setLocalOrders
}: ProductAndOrderProps) {
  const { isOnline } = useInternetConnection();

  const { toast } = useToast();
  const router = useRouter();
  const { setBooking } = useBooking();
  useEffect(() => {
    if (booking && pageType === PAYMENTORDERSTATUS.pos) {
      setBookingData(booking);
    }
  }, [booking, pageType]);

  const [bookingData, setBookingData] = useState<any>(null);
  const [showCategories, setShowCategories] = useState(false);
  const { currentEmployee, clearCurrentEmployee } = useEmployee();
  const [allCategories, setAllCategories] = useState<any[]>(
    propAllCategories ? propAllCategories : []
  );
  const [initialCategoryData, setInitialCategoryData] = useState<any>(null);

  useEffect(() => {
    setAllCategories(propAllCategories);
  }, [propAllCategories]);

  const [selectedCategory, setSelectedCategory] = useState<any>(
    propAllCategories ? propAllCategories[0] : null
  );

  const { floorsName, activeBookings } = useContext(TableContext);

  useEffect(() => {
    if (booking === null || bookingData === null) {
      const targetBooking = activeBookings.find((b: any) =>
        b.table.some((t: any) => t.id === selectedTableId)
      );
      setBookingData(targetBooking);
    }
  }, [activeBookings, selectedTableId]);
  const [searchProductStr, setSearchProductStr] = useState('');
  const {
    addItem,
    items,
    removeItem,
    removeAllItems,
    addAddOnToItem,
    removeAddOnFromItem
  } = useItems();
  const {
    createOrder,
    addBookingOrder,
    createBooking,
    createCategory,
    addProductToBumpOrder,
    getProducts,
    changeProductCategoryOrder
  } = useApi();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);

  const [customer, setCustomer] = useState<any>({
    name: selectedPhoneOrder?.customer?.name
      ? selectedPhoneOrder.customer.name
      : '',
    phone: selectedPhoneOrder?.customer?.phone
      ? selectedPhoneOrder.customer.phone
      : '',
    email: selectedPhoneOrder?.customer?.email
      ? selectedPhoneOrder.customer.email
      : ''
  });

  const handleRemoveAddon = (addon: any, item: any) => {
    setSelectedAddons(selectedAddons.filter((a: any) => a.id !== addon.id));
    removeAddOnFromItem(item.id, addon.id);
  };

  const handleAddAddon = (addon: any, action: string) => {
    switch (action) {
      case 'add':
        if (!selectedProduct?.id) {
          toast({
            title: 'Error',
            variant: 'destructive',
            description: 'Please select a product first'
          });
          return;
        }
        addAddOnToItem(selectedProduct.id, addon);
        setSelectedAddons([...selectedAddons, addon]);
        break;

      default:
        break;
    }
  };
  const [longPressTimeout, setLongPressTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [openProductModal, setOpenProductModal] = useState(false);
  const [editAddon, setEditAddon] = useState(null);
  const [openModifierModal, setOpenModifierModal] = useState(false);
  const [productOnAddOnModal, setProductOnAddOnModal] = useState();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [openAddonModal, setOpenAddonModal] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [selectedWeightProduct, setSelectedWeightProduct] = useState<any>(null);

  const handleFetchItems = async () => {
    try {
      const response = await getProducts();

      setAllCategories(
        response.data.menu.sort((a: any, b: any) => a.order - b.order) || []
      );
      selectedCategory
        ? setSelectedCategory(
            response.data.menu.find(
              (category: any) => category.id === selectedCategory.id
            )
          )
        : setSelectedCategory(response.data.menu[0]);
    } catch (err) {
      console.error('An error occurred:', err);
    }
  };

  const handleFetchItemsOnQuickSale = async () => {
    try {
      const response = await getProducts();
      setAllCategories(response.data.menu);
      setSelectedCategory(response.data.menu[0]);
    } catch (err) {
      console.error('An error occurred:', err);
    }
  };

  // quick sale doesn't need these codes, only pos
  const [orderListProducts, setOrderListProducts] = useState(
    bookingData?.products
      ? bookingData?.products.sort((a: any, b: any) => {
          return a.currentTimestamp - b.currentTimestamp;
        })
      : selectedPhoneOrder?.products
      ? selectedPhoneOrder?.products.sort((a: any, b: any) => {
          return a.currentTimestamp - b.currentTimestamp;
        })
      : []
  );
  useEffect(() => {
    if (pageType === PAYMENTORDERSTATUS.pos) {
      setOrderListProducts(
        bookingData?.products
          ? bookingData?.products.sort((a: any, b: any) => {
              return a.currentTimestamp - b.currentTimestamp;
            })
          : []
      );
    }
  }, [bookingData]);

  const handleLongPress = (val: any, target: string) => {
    if (target === 'product') {
      setEditProduct(val);
      setOpenProductModal(true);
    } else if (target === 'addOn') {
      setEditAddon(val);
      setOpenModifierModal(true);
    }
  };
  const handleMouseDown = (val: any, target: string) => {
    setIsLongPress(false);
    const timeout = setTimeout(() => {
      setIsLongPress(true);
      handleLongPress(val, target);
    }, 500);
    setLongPressTimeout(timeout);
  };

  const handleMouseUp = (val: any, target: string) => {
    clearTimeout(longPressTimeout as NodeJS.Timeout);
    if (!isLongPress) {
      if (target === 'product') {
        addProductToOrderList(val);
      } else if (target === 'addOn') {
        handleAddAddon(val, 'add');
      }
    }
  };

  const { printOrderByCategory, getPrinterUrls } = usePrinterSettings();
  const handleMakeOrder = async () => {
    if (items.length === 0) {
      toast({
        title: 'Error',
        variant: 'destructive',
        description: 'No Items Selected'
      });
      return;
    }

    try {
      const orderParam: any = {
        pos_device_id: 1,
        order_date: formatDate(new Date()),
        uuid: uuid(),
        products: items.map((item) => ({
          ...item,
          price_type: item?.price_type || 1,
          uuid: uuid(),
          is_printed: false,
          isCancelled: false,
          is_deleted: false,
          currentTimestamp: Date.now() * 1000,
          option_ids: []
        })),
        employee_id: currentEmployee?.id,
        take_away: true,
        customer: {
          email: customer.email || 'noname@email.com',
          uuid: uuid(),
          phone: customer.phone || '---',
          name: customer.name || 'No Name'
        }
      };

      // If it's a phone order, add the existing products to the new order
      if (selectedPhoneOrder) {
        orderParam.products = mergeProduct(
          items.map((item) => ({
            ...item,
            uuid: uuid(),
            price_type: item.price_type,
            is_printed: false,
            isCancelled: false,
            is_deleted: false,
            currentTimestamp: Date.now() * 1000,
            option_ids: []
          }))
        );
        orderParam.uuid = selectedPhoneOrder.uuid;
        orderParam.id = selectedPhoneOrder.id;
        orderParam.order_date = selectedPhoneOrder.order_date;
        orderParam.customer = selectedPhoneOrder.customer;
      }

      const response = await createOrder(orderParam);

      const bumpProducts = items.map((item: any) => ({
        uuid: uuid(),
        id: item.id,
        created_at: item.created_at,
        quantity: item.quantity,
        note: item.note || '',
        total_weight: item.total_weight,
        based_weight: item.based_weight,
        price_type: item.price_type,
        bump_order_add_ons: item.addOns.map((addOn: any) => ({
          id: addOn.id,
          quantity: addOn.quantity
        })),
        status: 'active'
      }));
      const param2 = {
        uuid: uuid(),
        booking_id: 0,
        status: 'active',
        order_type: 'phone order',
        order_date: formatDate(new Date()),
        bump_order_products: bumpProducts,
        order_number: response.data.phoneOrder.id,
        order_index: -1,
        phone_order_id: response.data.phoneOrder.id,
        guest: {
          first_name: customer.name.split(' ')[0] || '',
          last_name: customer.name.split(' ')[1] || ''
        },
        customer: {
          first_name: customer.name.split(' ')[0] || '',
          last_name: customer.name.split(' ')[1] || ''
        },
        employee_id: currentEmployee?.id
      };
      const response2 = await addProductToBumpOrder(param2);
      if (responseOK(response2)) {
        // If the order is successfully added to the bump screen, send it to the bump screen
      }

      if (fetchPhoneOrder) fetchPhoneOrder();

      // Print the order
      try {
        const printResponse = await printOrderByCategory({
          orderId: response.data.phoneOrder.id,
          items: items,
          total: items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
          customer: customer,
          employeeName:
            currentEmployee?.first_name + ' ' + currentEmployee?.last_name,
          isReceipt: false
        });

        if (printResponse.success) {
          toast({
            title: 'Success',
            variant: 'success',
            description:
              "Order created and at least one print window opened. Check your browser for blocked pop-ups if you don't see all print windows."
          });
        } else {
          // If no print windows were opened, show a toast with clickable links
          const serverIP = localStorage.getItem('serverIP');
          const orderDetails = {
            orderId: response.data.phoneOrder.id,
            employeeName:
              currentEmployee?.first_name + ' ' + currentEmployee?.last_name,
            items: items,
            total: items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            ),
            customer: customer
          };
          const printUrls = getPrinterUrls(serverIP!, items, orderDetails);

          toast({
            title: 'Warning',
            variant: 'destructive',
            description: (
              <div>
                <p>
                  Failed to open print windows. Click the buttons below to print
                  manually:
                </p>
                {printUrls.map((url, index) => (
                  <Button
                    key={index}
                    className="mr-2 mt-2"
                    onClick={() =>
                      window.open(
                        url,
                        '_blank',
                        'noopener,noreferrer,width=200,height=100'
                      )
                    }
                  >
                    Print Order {index + 1}
                  </Button>
                ))}
              </div>
            ),
            duration: 10000
          });
        }
      } catch (err) {
        toast({
          title: 'No printers Configured',
          variant: 'destructive'
        });
      }

      removeAllItems();
      setCustomer({ name: '', phone: '', email: '' });
      const pinPreference = localStorage.getItem('pinPreference');
      if (pinPreference === 'true') {
        clearCurrentEmployee();

        router.push('/pin?route=quick-sale');
      }
      onClose();
    } catch (error) {
      console.error('An error occurred:', error);
      toast({
        title: 'Error',
        variant: 'destructive',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to create order or print'
      });
    }
  };

  const handleAddOrderToBooking = async () => {
    if (!bookingData) {
      toast({
        title: 'Error',
        variant: 'destructive',
        description: 'No booking data available. Please select a table first.'
      });
      return;
    }

    const updatedOrderListProducts = orderListProducts.map((product: any) => ({
      ...product,
      isCancelled: false,
      is_deleted: false,
      is_pop_up: false,
      price_type: product.price_type
    }));
    const itemsUpdated = items.map((item: any) => ({
      ...item,
      isCancelled: false,
      is_deleted: false,
      is_pop_up: false,
      price_type: item.price_type || 1
    }));
    const param: any = {
      status: bookingData.status || 0,
      table_id: selectedTableId,
      booking_id: bookingData.id,
      guest: bookingData.guest,
      products: [...updatedOrderListProducts, ...itemsUpdated],
      pos_device_id: 7,
      employee_id: currentEmployee?.id
    };

    if (bookingData.uuid) {
      param.booking_uuid = bookingData.uuid;
    }
    if (bookingData.order_uuid) {
      param.uuid = bookingData.order_uuid;
    } else {
      param.uuid = uuid();
    }

    try {
      const response = await addBookingOrder(param);
      toast({
        title: 'Success',
        variant: 'success',
        description: 'Order added to booking'
      });
      const audio = new Audio('/sounds/success.mp3');
      audio.volume = 0.3;
      audio.play();

      const bumpProducts = items.map((item: any) => {
        const base = {
          uuid: uuid(),
          id: item.id,
          created_at: item.created_at,
          quantity: item.quantity,
          note: item.note || '',
          price_type: item.price_type,
          bump_order_add_ons: item.addOns.map((addOn: any) => ({
            id: addOn.id,
            quantity: addOn.quantity
          })),
          status: 'active'
        };
        if (item.price_type === 2) {
          return {
            ...base,
            total_weight: item.total_weight,
            based_weight: item.based_weight
          };
        }
        return base;
      });
      const param2 = {
        uuid: uuid(),
        booking_id: bookingData.id,
        status: 'active',
        order_type: 'walk in',
        order_date: formatDate(new Date()),
        bump_order_products: bumpProducts,
        order_number: bookingData.order_id || 0,
        order_index: -1,
        phone_order_id: 1,
        guest: {
          id: bookingData.guest.id,
          seating_preference: bookingData.guest.seating_preference || '',
          special_relationship: bookingData.guest.special_relationship || '',
          last_name: bookingData.guest.last_name || 'In',
          company: bookingData.guest.company || 'Wabi',
          phone: bookingData.guest.phone || '12345'
        },
        customer: null,
        employee_id: currentEmployee?.id
      };
      const response2 = await addProductToBumpOrder(param2);
      setBooking({
        ...bookingData,
        products: [...orderListProducts, ...items]
      });
      onClose();
      if (updateData) updateData();
      const pinPreference = localStorage.getItem('pinPreference');
      if (pinPreference === 'true') {
        clearCurrentEmployee();
        router.push('/pin?route=pos');
      }
    } catch (error) {
      console.error('An error occurred:', error);
      toast({
        title: 'Error',
        variant: 'destructive',
        // @ts-ignore
        description: error.message || ''
      });
    }
  };

  const handleSaveOrderToLocal = async () => {
    const order = {
      products: items,
      tableId: selectedTableId,
      status: 'pending',
      createdAt: Date.now()
    };
    try {
      await db.orders.add(order);

      toast({
        title: 'Local Save',
        variant: 'warning',
        description:
          "Order saved locally and will be synced once you're back online."
      });
    } catch (error) {
      console.error('Error saving order to local storage:', error);
      toast({
        title: 'Error',
        variant: 'destructive',
        description: 'Failed to save order to local storage'
      });
    }
    onClose();
    removeAllItems();
  };

  const handleSaveOrder = async () => {
    if (isOnline) {
      await handleAddOrderToBooking();
    } else {
      await handleSaveOrderToLocal();
    }
  };

  useEffect(() => {
    if (
      pageType === PAYMENTORDERSTATUS.quicksale ||
      window.location.pathname === '/quick-sale'
    ) {
      handleFetchItemsOnQuickSale();
    }
    removeAllItems();
  }, []);

  const [addOnType, setAddOnType] = useState(0); // 0 for plus, 1 for minus
  const [showAddOns, setShowAddOns] = useState(false);
  const handleAddOnToggle = (type: number) => {
    setAddOnType(type);
    if (addOnType === type) {
      setShowAddOns(!showAddOns);
    }
  };
  const getAddOns = () => {
    if (!selectedCategory) return [];
    return selectedCategory.add_ons.filter(
      (add_on: any) => add_on.type === addOnType
    );
  };

  const [openAllModsModal, setOpenAllModsModal] = useState(false);

  const openAddonModalHandler = (product: any) => {
    setProductOnAddOnModal(product);
    setSelectedAddons(
      allCategories?.find(
        (rproduct: any) => rproduct.id === product.pos_product_category_id
      )?.add_ons
    );

    setOpenAddonModal(true);
  };

  const addProductToOrderList = (product: any) => {
    if (product.is_pop_up === 1) {
      openAddonModalHandler(product);
      return;
    }

    // Check if product is weight-based (price_type: 2)
    if (product.price_type === 2) {
      setSelectedWeightProduct(product);
      setIsWeightModalOpen(true);
      return;
    }

    setSelectedProduct(product);

    const productItem = {
      addOns: [],
      category_id: product.pos_product_category_id,
      code: product.code,
      created_at: product.created_at,
      currentTimestamp: currentTimestamp,
      description: product.description,
      id: product.id,
      is_printed: 0,
      note: '',
      order: product.order,
      price: product.price,
      quantity: 1,
      isCancelled: false,
      price_type: product.price_type || 1,
      is_deleted: false,
      is_pop_up: false,
      status: product.status,
      stock: product.stock,
      title: product.title,
      updated_at: product.updated_at,
      uuid: uuid()
    };
    addItem(productItem);
  };

  const getMeasurementUnit = (measurementType: number) => {
    const kg = 1;
    const g = 2;
    const oz = 3;
    const lb = 4;

    switch (measurementType) {
      case kg:
        return 'kg';
      case g:
        return 'g';
      case oz:
        return 'oz';
      case lb:
        return 'lb';
      default:
        return 'g';
    }
  };

  const handleWeightConfirm = (weight: number) => {
    if (!selectedWeightProduct) return;

    setSelectedProduct(selectedWeightProduct);

    const unit = getMeasurementUnit(
      selectedWeightProduct.measurement_type || 2
    );

    const productItem = {
      addOns: [],
      based_weight: selectedWeightProduct.based_weight,
      category_id: selectedWeightProduct.pos_product_category_id,
      code: selectedWeightProduct.code,
      created_at: selectedWeightProduct.created_at,
      currentTimestamp: currentTimestamp,
      description: selectedWeightProduct.description,
      id: selectedWeightProduct.id,
      is_printed: 0,
      note: `Weight: ${weight}${unit}`,
      order: selectedWeightProduct.order,
      price: selectedWeightProduct.price,
      quantity: 1,
      total_weight: weight,
      isCancelled: false,
      price_type: selectedWeightProduct.price_type,
      is_deleted: false,
      is_pop_up: false,
      status: selectedWeightProduct.status,
      stock: selectedWeightProduct.stock,
      title: selectedWeightProduct.title,
      updated_at: selectedWeightProduct.updated_at,
      uuid: uuid()
    };
    addItem(productItem);
  };

  const allProducts = allCategories?.flatMap(
    (category: any) => category.products
  );
  const handleAddModifier = (selectedAddOns: any) => {
    selectedAddOns.forEach((addOn: any) => {
      handleAddAddon(addOn, 'add');
    });
  };

  const filteredProducts = searchProductStr
    ? allProducts.filter((product: any) =>
        product.title.toLowerCase().includes(searchProductStr.toLowerCase())
      )
    : allCategories
        ?.find((category: any) => category.id === selectedCategory?.id)
        ?.products.sort((a: any, b: any) => a.order - b.order) || [];

  const calculateTotalPrice = (items: any) => {
    if (pageType === PAYMENTORDERSTATUS.pos) {
      const bookingDataTotal = getSum(bookingData?.products);
      const selectedItemsTotal = getSum(items);
      return selectedItemsTotal + bookingDataTotal;
    } else if (pageType === PAYMENTORDERSTATUS.quicksale) {
      return getSum(items);
    } else if (pageType === PAYMENTORDERSTATUS.phoneOrder) {
      return getSum(selectedPhoneOrder?.products) + getSum(items);
    }
  };

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleSelectNewTable = async (newTable: any) => {
    const params = {
      start_date: booking.start_date,
      partial_seated: booking.partial_seated,
      reservation_note: booking.reservation_note,
      uuid: booking.uuid,
      booking_taken: booking.booking_taken,
      table_lock: booking.table_lock,
      status: booking.status,
      table_ids: [newTable.id],
      no_limit: booking.no_limit,
      table_id: newTable.id,
      end_date: booking.end_date,
      id: booking.id,
      created_at: booking.created_at,
      finished_date: booking.finished_date,
      guest: booking.guest,
      table: [newTable],
      party_size: booking.party_size,
      shift_id: booking.shift_id,
      type: booking.type
    };
    try {
      const updatedBooking = await createBooking(params);

      if (updateData) updateData();
      setBookingData({
        ...bookingData,
        table: [newTable],
        table_ids: newTable.id
      });
      setIsTableModalOpen(false);
      toast({
        title: 'Success',
        description: 'Table updated successfully',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error updating table:', error);
      toast({
        title: 'Error',
        description: 'Failed to update table',
        variant: 'destructive'
      });
    }
  };

  const [isOpenCategoryForm, setIsOpenCategoryForm] = useState<boolean>(false);
  const handleEditCategory = async (data: any) => {
    const result = await createCategory(data);
  };
  const handlePayment = () => {
    setIsPaymentModalOpen(true);
  };

  const handleSaveGuestInfo = async (guestInfo: any) => {
    const params = {
      start_date: booking.start_date,
      partial_seated: booking.partial_seated,
      reservation_note: booking.reservation_note,
      uuid: booking.uuid,
      booking_taken: booking.booking_taken,
      table_lock: booking.table_lock,
      status: booking.status,
      no_limit: booking.no_limit,
      end_date: booking.end_date,
      table: booking.table,
      id: booking.id,
      table_ids: [booking.table[0].id],
      table_id: booking.table[0].id,
      created_at: booking.created_at,
      finished_date: booking.finished_date,
      guest: {
        ...booking.guest,
        first_name: guestInfo.first_name,
        last_name: guestInfo.last_name,
        phone: guestInfo.phone
      },
      party_size: booking.party_size,
      shift_id: booking.shift_id,
      type: booking.type
    };
    try {
      const updatedBooking = await createBooking(params);
      if (updateData) updateData();

      setBookingData({
        ...bookingData,
        guest: {
          ...booking.guest,
          first_name: guestInfo.first_name,
          last_name: guestInfo.last_name,
          phone: guestInfo.phone
        }
      });
      setIsProfileModalOpen(false);
      toast({
        title: 'Success',
        description: 'Guest information updated successfully',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error updating guest information:', error);
      toast({
        title: 'Error',
        description: 'Failed to update guest information',
        variant: 'destructive'
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );
  const [isChangingCategoryOrder, setIsChangingCategoryOrder] =
    useState<boolean>(false);
  const handleDragEnd = (event: any) => {
    setIsChangingCategoryOrder(true);
    const { active, over } = event;
    if (!active || !over) return;
    if (active?.id !== over?.id) {
      propSetAllCategories
        ? propSetAllCategories((items: any) => {
            const oldIndex = items.findIndex(
              (item: any) => item.id === active.id
            );
            const newIndex = items.findIndex(
              (item: any) => item.id === over.id
            );
            const updatedItems = arrayMove(items, oldIndex, newIndex);
            return updatedItems.map((item: any, index: number) => ({
              ...item,
              order: index
            }));
          })
        : setAllCategories((items: any) => {
            const oldIndex = items.findIndex(
              (item: any) => item.id === active.id
            );
            const newIndex = items.findIndex(
              (item: any) => item.id === over.id
            );
            const updatedItems = arrayMove(items, oldIndex, newIndex);
            return updatedItems.map((item: any, index: number) => ({
              ...item,
              order: index
            }));
          });
    }
  };

  const handleChangeProductategoryOrder = async () => {
    try {
      const params = {
        categories: allCategories
      };
      const response = await changeProductCategoryOrder(params);
    } catch (error) {
      console.error(error);
    }
  };
  const mergeProduct = (products: any) => {
    if (selectedPhoneOrder?.products?.length > 0) {
      return [...selectedPhoneOrder.products, ...products];
    } else {
      return products;
    }
  };

  const backToPhoneOrderList = () => {
    setIsPaymentModalOpen(false);
    onClose();
    if (fetchPhoneOrder) fetchPhoneOrder();
  };

  useEffect(() => {
    if (isChangingCategoryOrder) {
      handleChangeProductategoryOrder();
      setIsChangingCategoryOrder(false);
    }
  }, [allCategories]);

  const sendToBumpScreen = async (order: any) => {
    try {
      const bumpProducts = items.map((item: any) => {
        const base = {
          uuid: uuid(),
          id: item.id,
          created_at: item.created_at,
          quantity: item.quantity,
          note: item.note || '',
          price_type: item.price_type,
          bump_order_add_ons: item.addOns.map((addOn: any) => ({
            id: addOn.id,
            quantity: addOn.quantity
          })),
          status: 'active'
        };
        if (item.price_type === 2) {
          return {
            ...base,
            total_weight: item.total_weight,
            based_weight: item.based_weight
          };
        }
        return base;
      });
      const param2 = {
        uuid: uuid(),
        booking_id: 0,
        status: 'active',
        order_type: 'phone order',
        order_date: formatDate(new Date()),
        bump_order_products: bumpProducts,
        order_number: order.id,
        order_index: -1,
        phone_order_id: order.id,
        guest: {
          first_name: customer.name.split(' ')[0] || '',
          last_name: customer.name.split(' ')[1] || ''
        },
        customer: {
          first_name: customer.name.split(' ')[0] || '',
          last_name: customer.name.split(' ')[1] || ''
        },
        employee_id: currentEmployee?.id
      };
      const response2 = await addProductToBumpOrder(param2);
      removeAllItems();
      setCustomer({ name: '', phone: '', email: '' });
    } catch (error) {
      console.error('Error sending to Bump screen:', error);
    }
  };

  return (
    <div className="flex h-full w-full flex-col ">
      <div className="flex h-[98%] flex-grow flex-col space-y-4 overflow-auto lg:flex-row lg:space-x-4 lg:space-y-0 lg:overflow-visible">
        {/* Items List on the Left */}
        <div className="xlw-1/3 w-full lg:w-1/4 lg:min-w-[280px] 2xl:w-1/4">
          <div className="h-full overflow-auto rounded-lg">
            {/* POS */}
            {pageType === PAYMENTORDERSTATUS.pos && (
              <OrderLists
                guestName={getFullname(bookingData?.guest)}
                items={items}
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                handleAddAddon={handleAddAddon}
                handleRemoveAddon={handleRemoveAddon}
                bookingData={bookingData}
                setBookingData={setBookingData}
                floorsName={floorsName}
                orderListProducts={orderListProducts}
                removeItem={removeItem}
                calculateTotalPrice={calculateTotalPrice}
                table={bookingData?.table[0]}
                onProfileClick={() => setIsProfileModalOpen(true)}
                onTableClick={() => setIsTableModalOpen(true)}
                updateData={updateData}
                setOpenAddonModal={setOpenAddonModal}
                localOrders={localOrders}
              />
            )}
            {pageType !== PAYMENTORDERSTATUS.pos && (
              <PhoneOrderList
                customer={customer}
                setCustomer={setCustomer}
                handlePayment={handlePayment}
                items={items}
                handleAddAddon={handleAddAddon}
                handleRemoveAddon={handleRemoveAddon}
                pageType={pageType}
                orderListProducts={orderListProducts}
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                removeItem={removeItem}
                calculateTotalPrice={calculateTotalPrice}
                selectedPhoneOrder={
                  selectedPhoneOrder ? selectedPhoneOrder : null
                }
                setSelectedPhoneOrder={
                  setSelectedPhoneOrder ? setSelectedPhoneOrder : () => {}
                }
                setOpenAddonModal={setOpenAddonModal}
                fetchPhoneOrder={fetchPhoneOrder ? fetchPhoneOrder : () => {}}
              />
            )}
          </div>
        </div>

        <div className="mt-4 lg:hidden">
          <Button
            className="block bg-gray-800"
            onClick={() => setShowCategories(!showCategories)}
          >
            {showCategories ? 'Hide Categories' : 'Show Categories'}
          </Button>
          <div
            className={`flex flex-col space-y-2 ${
              showCategories ? 'block' : 'hidden'
            }`}
          >
            <Input
              className="my-4 w-full p-4"
              placeholder="Search Product"
              onChange={(e) => setSearchProductStr(e.target.value)}
            />
            <div className={`flex h-auto w-full overflow-y-scroll`}>
              <div className="flex min-w-32 gap-2 lg:flex-col">
                {allCategories?.map((category: any) => (
                  <Button
                    key={category.id}
                    onClick={() => setSelectedCategory(category)}
                    className={`min-h-16 min-w-28 rounded-lg border border-solid border-border text-xs font-bold ${
                      selectedCategory?.id === category.id
                        ? 'border-primary bg-primary'
                        : 'border-gray bg-gray-darker'
                    }`}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Main Product List and Add-Ons in the Center */}
        <div className="flex w-full flex-col lg:w-4/5 2xl:w-3/4">
          <div className="mb-4 hidden lg:block">
            <Input
              className="w-full bg-secondary p-4"
              placeholder="Search Product"
              onChange={(e) => setSearchProductStr(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex h-full flex-1 flex-col">
              <div className="mb-8 w-full overflow-auto lg:h-[55%] lg:max-h-[432px] lg:min-h-[432px] ">
                <ProductGrid
                  filteredProducts={filteredProducts}
                  imgUrl={process.env.NEXT_PUBLIC_IMG_URL as string}
                  handleMouseDown={handleMouseDown}
                  handleMouseUp={handleMouseUp}
                  setOpenProductModal={setOpenProductModal}
                  getRelativeLuminance={getRelativeLuminance}
                  addProductToOrderList={addProductToOrderList}
                  setEditProduct={setEditProduct}
                  setAllCategories={
                    propSetAllCategories
                      ? propSetAllCategories
                      : setAllCategories
                  }
                  allCategories={allCategories}
                  selectedCategory={selectedCategory}
                />
              </div>
              {/* Add-On Selector Section */}

              <AddOnsSection
                handleAddOnToggle={handleAddOnToggle}
                showAddOns={showAddOns}
                addOnType={addOnType}
                getAddOns={getAddOns}
                handleMouseDown={handleMouseDown}
                handleMouseUp={handleMouseUp}
                setOpenModifierModal={setOpenModifierModal}
                setOpenAllModsModal={setOpenAllModsModal}
              />
            </div>
            {/* Categories on the Right for Larger Screens */}
            <div className="hidden h-[80%] max-h-[508px] w-28 flex-shrink-0 overflow-auto lg:block">
              {allCategories && allCategories.length > 0 && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={allCategories?.map((category: any) => category.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {allCategories?.map((category: any) => (
                      <SortableItem
                        key={category.id}
                        category={category}
                        id={category.id}
                        selectedCategory={selectedCategory}
                        setIsOpenCategoryForm={setIsOpenCategoryForm}
                        setSelectedCategory={setSelectedCategory}
                        setInitialCategoryData={setInitialCategoryData}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
              <Button
                onClick={() => {
                  setInitialCategoryData(null);
                  setIsOpenCategoryForm(true);
                }}
                variant="outline"
                className={`h-auto min-h-14 w-full rounded-lg border border-solid border-border bg-secondary px-3 text-xs font-bold leading-tight `}
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>

          <CategoryFormModal
            isOpen={isOpenCategoryForm}
            onSubmit={handleEditCategory}
            initialData={initialCategoryData}
            onClose={() => setIsOpenCategoryForm(false)}
            setUpdatedData={
              setUpdateCategories
                ? () => setUpdateCategories((prev: any) => !prev)
                : () => {}
            }
          />
        </div>
      </div>

      {/* Bottom buttons */}
      {pageType === PAYMENTORDERSTATUS.pos ? (
        <div className="fixed bottom-4 right-4 flex flex-col space-y-4">
          <div
            className="flex cursor-pointer flex-col items-center"
            onClick={onClose}
          >
            <LayoutGrid />
            <p className="text-sm">Floor Plan</p>
          </div>
          <>
            {selectedTableId && (
              <>
                <Button
                  title="Create Payment on Reader"
                  className="w-full"
                  variant="submit"
                  onClick={handleSaveOrder}
                >
                  Save Order
                </Button>
              </>
            )}
          </>
        </div>
      ) : (
        <div className="fixed bottom-4 right-4 flex flex-col space-y-4">
          {pageType === PAYMENTORDERSTATUS.phoneOrder && (
            <Button onClick={onClose} variant="outline">
              Back
            </Button>
          )}
          <Button className="w-full" onClick={handleMakeOrder}>
            Send Order
          </Button>
        </div>
      )}

      {/* Modals */}
      {openAddonModal && (
        <AddonModal
          open={openAddonModal}
          setOpenAddonModal={setOpenAddonModal}
          productOnAddOnModal={productOnAddOnModal}
          setSelectedProduct={setSelectedProduct}
          selectedProduct={selectedProduct}
          allCategories={allCategories}
          setProductOnAddOnModal={setProductOnAddOnModal}
        />
      )}
      {openProductModal && (
        <ProductModal
          open={openProductModal}
          setOpenProductModal={setOpenProductModal}
          selectedCategory={selectedCategory}
          editProduct={editProduct}
          setEditProduct={setEditProduct}
          imgUrl={process.env.NEXT_PUBLIC_IMG_URL}
          getRelativeLuminance={getRelativeLuminance}
          handleFetchItems={handleFetchItems}
        />
      )}
      {openModifierModal && (
        <ModifierModal
          open={openModifierModal}
          setOpenModifierModal={setOpenModifierModal}
          editAddon={editAddon}
          setEditAddon={setEditAddon}
          registeredProducts={allCategories}
          propSelectedCategoryId={selectedCategory.id}
          handleFetchItems={handleFetchItems}
        />
      )}
      {openAllModsModal && (
        <Dialog
          open={openAllModsModal}
          onOpenChange={() => setOpenAllModsModal(false)}
        >
          <DialogOverlay className="flex backdrop-blur-3xl">
            <AllModsModal
              open={openAllModsModal}
              registeredProducts={allCategories}
              handleClose={() => setOpenAllModsModal(false)}
              handleAddModifier={handleAddModifier}
              propSelectedCategory={selectedCategory}
            />
          </DialogOverlay>
        </Dialog>
      )}
      {/* if it is not POS, then it is phone order or quick sale */}
      {isPaymentModalOpen && (
        <PaymentModal
          guestName={customer.name}
          total={calculateTotalPrice(items) as number}
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onClosePhoneOrder={backToPhoneOrderList}
          items={mergeProduct(items)}
          tableId=""
          isQuickSale={pageType === PAYMENTORDERSTATUS.quicksale ? true : false}
          isPhoneOrder={
            pageType === PAYMENTORDERSTATUS.phoneOrder ? true : false
          }
          phoneOrder={selectedPhoneOrder}
          finishQuickSaleOrder={(order: any) => sendToBumpScreen(order)}
          onPaymentComplete={onClose}
        />
      )}

      {pageType === PAYMENTORDERSTATUS.pos && (
        <TableSelectionModal
          isOpen={isTableModalOpen}
          onClose={() => setIsTableModalOpen(false)}
          onSelectTable={handleSelectNewTable}
          tables={tables}
        />
      )}

      <GuestInfoModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveGuestInfo}
        initialGuestInfo={bookingData?.guest}
      />

      <WeightInputModal
        isOpen={isWeightModalOpen}
        onClose={() => {
          setIsWeightModalOpen(false);
          setSelectedWeightProduct(null);
        }}
        onConfirm={handleWeightConfirm}
        product={selectedWeightProduct}
      />
    </div>
  );
}
const SortableItem = ({
  id,
  category,
  selectedCategory,
  setIsOpenCategoryForm,
  setSelectedCategory,
  setInitialCategoryData
}: any) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="relative mb-2"
    >
      <GripVertical
        size={16}
        className="absolute left-1 top-1/2 z-10 -translate-y-1/2 transform text-gray-400 focus:outline-none"
        {...attributes}
        {...listeners}
      />
      <Button
        onMouseDown={() => setSelectedCategory(category)}
        onDoubleClick={() => {
          setInitialCategoryData(category);
          setIsOpenCategoryForm(true);
        }}
        variant="outline"
        className={`h-auto min-h-14 w-full rounded-lg border border-solid px-3 text-xs font-bold leading-tight ${
          selectedCategory?.id === category?.id
            ? 'border-primary'
            : 'border-border bg-secondary'
        }`}
        style={
          category.color
            ? {
                backgroundColor: category.color,
                color: getRelativeLuminance(category.color)
              }
            : {}
        }
      >
        {category.name}
      </Button>
    </div>
  );
};
