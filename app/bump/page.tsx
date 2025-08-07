'use client';
import React, {
  useState,
  useEffect,
  useCallback,
  useLayoutEffect
} from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Menu } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { useApi } from '@/hooks/useApi';
import { useEmployee } from '@/hooks/useEmployee';
import { v4 as uuid } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import { formatDateShort } from '@/lib/utils';
import { useFloor } from '@/hooks/floorStore';
import { SortableCard as OriginalSortableCard } from '@/components/bump/sortable-card';
const SortableCard = React.memo(OriginalSortableCard);
import { DocketModal } from '@/components/bump/docket-modal';

import { useRouter } from 'next/navigation';
import { BumpOrder, BumpOrderProduct, Category, Floor, Table } from '@/types';
import Cookies from 'js-cookie';
import { Input } from '@/components/ui/input';
import { AllDayItemsModal } from '@/components/bump/allday-items-modal';

function createParam2FromOrder(order: BumpOrder, isFinishDocket = false) {
  return {
    id: order.id,
    uuid: order.uuid || uuid(),
    booking_id: order?.booking?.id || 0,
    status: order.status,
    completedTimestamp: order.completedTimestamp,
    order_type: order.order_type,
    order_date: order.order_date,
    bump_order_products: order.bump_order_products?.map(
      (product: BumpOrderProduct) => ({
        id: product.id,
        quantity: product.quantity,
        status: isFinishDocket ? 'inactive' : product.status,
        uuid: product.uuid,
        bump_order_add_ons: product.bump_order_add_ons.map((addon: any) => ({
          id: addon.id,
          quantity: addon.quantity,
          name: addon.name
        }))
      })
    ),
    order_number: order.order_number,
    order_index: order.order_index,
    phone_order_id: order.phone_order_id,
    guest: order.guest
      ? {
          id: order.guest.id,
          seating_preference: order.guest.seating_preference || '',
          special_relationship: order.guest.special_relationship || '',
          last_name: order.guest.last_name || '',
          company: order.guest.company || '',
          phone: order.guest.phone || ''
        }
      : null,
    customer: order.customer,
    employee_id: order.employee_id
  };
}

export default function BumpPage() {
  const [orders, setOrders] = useState<BumpOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'completed' | 'open'>('open');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<
    string[] | undefined
  >(undefined);
  const [selectedFloors, setSelectedFloors] = useState<string[] | undefined>(
    undefined
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { getFloors, fetchBumpScreen, addProductToBumpOrder } = useApi();
  const { table, setTable, floor, setFloor } = useFloor();
  const { data: session } = useSession();
  const router = useRouter();
  const [isMutating, setIsMutating] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [docketModalOpen, setDocketModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<BumpOrder | null>(null);
  const [selectedOrderTypes, setSelectedOrderTypes] = useState<string[]>([
    'walkin',
    'takeaway',
    'phoneorder'
  ]);
  const orderTypeOptions = [
    { label: 'Walk In', value: 'walkin' },
    { label: 'Take Away', value: 'takeaway' },
    { label: 'Phone Order', value: 'phoneorder' }
  ];
  const [filteredOrders, setFilteredOrders] = useState<BumpOrder[]>([]);

  useEffect(() => {
    if (table === null) {
      handleFetchFloors();
    }
  }, [table]);

  const handleFetchFloors = async () => {
    try {
      const response = await getFloors();
      if (response.code === 'OK') {
        setTable(
          response.data.floors.map((floor: Floor) => floor.tables).flat()
        );
        setFloor(response.data.floors);
      } else {
        console.error('Failed to fetch floors:', response.data.error);
        return [];
      }
    } catch (error) {
      console.error('Error fetching floors:', error);
      return [];
    }
  };

  const { allEmployees } = useEmployee();

  // order_number:1 = take away
  // order_number:2 = phone order or walk in
  const sortOrders = useCallback((orders: BumpOrder[]) => {
    return orders.sort((a: BumpOrder, b: BumpOrder) => {
      if (a.order_index === b.order_index) {
        return (
          new Date(a.order_date).getTime() - new Date(b.order_date).getTime()
        );
      }

      return a.order_index - b.order_index;
    });
  }, []);

  const showDocketModal = (order: BumpOrder) => {
    setDocketModalOpen(true);
    setSelectedOrder(order);
  };
  useEffect(() => {
    if (selectedCategories !== undefined) {
      Cookies.set(
        'selectedBumpCategories',
        JSON.stringify(selectedCategories),
        {
          expires: 30
        }
      );
    }
  }, [selectedCategories]);

  useEffect(() => {
    const fetchOpenOrders = async () => {
      if (isMutating) return;
      try {
        const date = formatDateShort(new Date());
        const response = await fetchBumpScreen(date);
        const newOrders: BumpOrder[] = response.data.bump_orders;

        const enrichedOrders = newOrders.map((order: BumpOrder) => ({
          ...order,
          table_name: order.booking
            ? table
                ?.flat()
                .find(
                  (t: Table) =>
                    t.id ===
                    Number(
                      order?.booking?.table_id ? order.booking.table_id[0] : 0
                    )
                )?.name || ''
            : ''
        }));

        mergeAndUpdateOrders(enrichedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}pos/product/menu`,
          {},
          { headers: { Authorization: `Bearer ${session?.user?.token}` } }
        );
        const menu = response.data.data.menu;
        setCategories(menu);

        const saved = Cookies.get('selectedBumpCategories');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              setSelectedCategories(parsed);
              return;
            }
          } catch (e) {
            console.error('Cookie parse failed:', e);
          }
        }

        setSelectedCategories(menu.map((cat: Category) => cat.id.toString()));
      } catch (err) {
        console.error('An error occurred:', err);
      }
    };

    fetchOpenOrders();
    fetchCategories();
    const intervalId = setInterval(fetchOpenOrders, 7000);
    return () => clearInterval(intervalId);
  }, [session?.user?.token, table]);
  useEffect(() => {
    if (floor?.length === 0) return;

    const saved = Cookies.get('selectedBumpFloors');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSelectedFloors(parsed);
          return;
        }
      } catch (e) {
        console.error('Floor cookie parse failed:', e);
      }
    }

    const allFloorIds = floor?.map((f: Floor) => f.id.toString());
    setSelectedFloors(allFloorIds);
  }, [floor]);
  useEffect(() => {
    if (selectedFloors !== undefined) {
      Cookies.set('selectedBumpFloors', JSON.stringify(selectedFloors), {
        expires: 30
      });
    }
  }, [selectedFloors]);
  const normalizeOrderType = (type: string) =>
    type.trim().toLowerCase().replace(/\s+/g, '');
  useEffect(() => {
    if (
      !selectedCategories ||
      !selectedFloors ||
      selectedFloors.length === 0 ||
      !table ||
      !selectedOrderTypes ||
      selectedOrderTypes.length === 0
    )
      return;

    const result = orders
      .filter((order) => {
        const normalizedType = normalizeOrderType(order.order_type);

        if (!selectedOrderTypes.includes(normalizedType)) return false;

        const tableIds = order.booking?.table_id ?? [];
        const isTableOrder = Array.isArray(tableIds) && tableIds.length > 0;

        const matchesFloor = !isTableOrder
          ? true
          : tableIds.some((tid: number) => {
              const matchedTable = table.find((t) => t.id === Number(tid));
              return (
                matchedTable &&
                selectedFloors.includes(matchedTable.floor_id.toString())
              );
            });

        if (!matchesFloor) return false;

        const filteredProducts = order.bump_order_products?.filter(
          (product: BumpOrderProduct) =>
            selectedCategories.includes(
              product?.pos_product_category_id?.toString()
            )
        );

        return filteredProducts && filteredProducts.length > 0;
      })
      .map((order) => {
        const filteredProducts = order.bump_order_products?.filter(
          (product: BumpOrderProduct) =>
            selectedCategories.includes(
              product?.pos_product_category_id?.toString()
            )
        );
        return {
          ...order,
          bump_order_products: filteredProducts,
          original_bump_order_products: order.bump_order_products
        };
      });

    setFilteredOrders(result);
  }, [selectedCategories, selectedFloors, orders, table, selectedOrderTypes]);

  const finishBumpDocket = async (orderToBump: BumpOrder) => {
    try {
      const isDisplayAllProducts =
        orderToBump.original_bump_order_products?.length ===
        orderToBump.bump_order_products?.length;

      let updatedOrder: BumpOrder;
      let param2;

      if (isDisplayAllProducts) {
        updatedOrder = {
          ...orderToBump,
          bump_order_products: orderToBump.original_bump_order_products?.map(
            (product) => ({
              ...product,
              status: 'inactive'
            })
          ) as BumpOrderProduct[],
          original_bump_order_products:
            orderToBump.original_bump_order_products,
          status: 'inactive',
          completedTimestamp: new Date().toString()
        };

        param2 = createParam2FromOrder(updatedOrder, true);
      } else {
        const updatedOriginalProducts =
          orderToBump.original_bump_order_products?.map((product) => {
            const shouldInactivate = orderToBump?.bump_order_products?.some(
              (visibleProduct) => visibleProduct.uuid === product.uuid
            );
            return {
              ...product,
              status: shouldInactivate ? 'inactive' : product.status
            };
          }) as BumpOrderProduct[];

        updatedOrder = {
          ...orderToBump,
          bump_order_products: updatedOriginalProducts,
          original_bump_order_products:
            orderToBump.original_bump_order_products,
          status: 'active',
          completedTimestamp: orderToBump.completedTimestamp
        };

        param2 = createParam2FromOrder(updatedOrder, false);
      }

      const prevOrderSnapshot = JSON.parse(JSON.stringify(orderToBump));
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );

      const response = await addProductToBumpOrder(param2);

      if (response.code === 'OK') {
        toast({
          title: 'Order bumped',
          variant: 'success'
        });
      } else {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderToBump.id ? prevOrderSnapshot : order
          )
        );
        console.error('Failed to bump order:', response.data.error);
      }
    } catch (error) {
      console.error('Error bumping order:', error);
    }
  };

  const revertOrder = async (order: BumpOrder) => {
    try {
      if (!order || !('original_bump_order_products' in order)) return;

      const original = order.original_bump_order_products as BumpOrderProduct[];
      const visible = order.bump_order_products as BumpOrderProduct[];

      const updatedProducts = original?.map((product) => {
        const isVisible = visible.some((p) => p.uuid === product.uuid);
        return {
          ...product,
          status: isVisible ? 'active' : product.status
        };
      });

      const updatedOrder = {
        ...order,
        bump_order_products: updatedProducts,
        original_bump_order_products: original,
        status: 'active',
        completedTimestamp: undefined
      };

      const prevOrderSnapshot = JSON.parse(JSON.stringify(order));

      const param2 = createParam2FromOrder(updatedOrder, false);
      setOrders((prevOrders) =>
        prevOrders.map((o) => (o.id === order.id ? updatedOrder : o))
      );
      const response = await addProductToBumpOrder(param2);

      if (response.code !== 'OK') {
        setOrders((prevOrders) =>
          prevOrders.map((o) => (o.id === order.id ? prevOrderSnapshot : o))
        );
        console.error('Failed to revert order:', response.data.error);
      }
    } catch (error) {
      setOrders((prevOrders) =>
        prevOrders.map((o) => (o.id === order.id ? order : o))
      );
      console.error('Error reverting order:', error);
    }
  };
  const mergeAndUpdateOrders = (serverOrders: BumpOrder[]) => {
    setOrders((prevOrders) => {
      return sortOrders(
        serverOrders.map((serverOrder) => {
          const localOrder = prevOrders.find((o) => o.id === serverOrder.id);
          if (!localOrder) return serverOrder;

          const mergedProducts = serverOrder.bump_order_products?.map(
            (sp: BumpOrderProduct) => {
              const localProduct = localOrder.bump_order_products?.find(
                (lp: BumpOrderProduct) => lp.uuid === sp.uuid
              );
              return localProduct ? { ...sp, status: localProduct.status } : sp;
            }
          );

          return {
            ...serverOrder,
            bump_order_products: mergedProducts,
            original_bump_order_products:
              localOrder.original_bump_order_products,
            status:
              serverOrder.status === 'inactive' ||
              localOrder.status === 'inactive'
                ? 'inactive'
                : 'active',
            completedTimestamp:
              serverOrder.status === 'inactive' ||
              localOrder.status === 'inactive'
                ? localOrder.completedTimestamp || new Date().toString()
                : serverOrder.completedTimestamp
          };
        })
      );
    });
  };
  const toggleProductStatus = async (
    orderId: number,
    productUuid: string,
    isFinish = false
  ) => {
    setIsMutating(true);

    const prevOrder = orders.find((o) => o.id === orderId);
    if (!prevOrder) return;

    const productToToggle = prevOrder.bump_order_products.find(
      (p: BumpOrderProduct) => p.uuid === productUuid
    );
    if (!productToToggle) return;

    let newProductStatus: string;
    if (isFinish) {
      newProductStatus = 'inactive';
    } else {
      newProductStatus =
        productToToggle.status === 'active' ? 'inactive' : 'active';
    }

    const updatedProducts: BumpOrderProduct[] =
      prevOrder.bump_order_products.map((product: BumpOrderProduct) =>
        product.uuid === productUuid
          ? { ...product, status: newProductStatus }
          : product
      );

    const updatedOrder = {
      ...prevOrder,
      bump_order_products: updatedProducts,
      original_bump_order_products: prevOrder.original_bump_order_products
    };

    setOrders((prevOrders) =>
      prevOrders.map((o) => (o.id === orderId ? updatedOrder : o))
    );

    const allProductsFinished = updatedProducts.every(
      (product: BumpOrderProduct) => product.status === 'inactive'
    );

    if (allProductsFinished) {
      const payload = {
        ...updatedOrder,
        status: 'inactive',
        completedTimestamp: new Date().toString()
      };
      const param2 = createParam2FromOrder(payload);

      try {
        const response = await addProductToBumpOrder(param2);
        if (response.code === 'OK') {
          toast({ title: 'Order bumped', variant: 'success' });
          const synced = {
            ...updatedOrder,
            status: 'inactive',
            completedTimestamp: payload.completedTimestamp
          };
          setOrders((prev) => prev.map((o) => (o.id === orderId ? synced : o)));
          if (selectedOrder?.id === orderId) setSelectedOrder(synced);
        }
      } catch (e) {
        console.error('Failed bump:', e);
      }
    } else {
      const payload = {
        ...updatedOrder,
        status: 'active',
        completedTimestamp: prevOrder.completedTimestamp
      };
      const param2 = createParam2FromOrder(payload);
      try {
        const response = await addProductToBumpOrder(param2);
        if (response.code === 'OK') {
        }
      } catch (e) {
        console.error('Failed update:', e);
      }
    }

    setTimeout(() => setIsMutating(false), 500);
  };

  const filteredBySearchText = filteredOrders.filter((order) => {
    const search = searchText.replace(/\s/g, '').toLowerCase();
    if (!search) return true;
    const guestName = `${
      order.guest?.first_name + order.guest?.last_name || ''
    }`;
    if (guestName?.toLowerCase().includes(search)) {
      return true;
    }
    if (order.table_name?.replace(/\s/g, '').toLowerCase().includes(search)) {
      return true;
    }

    const matchInProducts = order.bump_order_products?.some(
      (product: BumpOrderProduct) =>
        product.title?.replace(/\s/g, '').toLowerCase().includes(search)
    );

    return matchInProducts;
  });
  const openOrders = filteredBySearchText.filter((order) => {
    if (order.status === 'sent' || order.status === 'inactive') return false;

    const visibleProducts = order.bump_order_products;
    return visibleProducts.some((p: BumpOrderProduct) => p.status === 'active');
  });

  const completedOrders = filteredBySearchText.filter(
    (order) =>
      order.status === 'sent' ||
      order.status === 'inactive' ||
      order.bump_order_products.every(
        (p: BumpOrderProduct) => p.status === 'inactive' || p.status === 'sent'
      )
  );
  const currentOrders = activeTab === 'open' ? openOrders : completedOrders;

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAllDayModal, setShowAllDayModal] = useState(false);
  useLayoutEffect(() => {
    const htmlElement = document.documentElement;
    setIsDarkMode(htmlElement.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      setIsDarkMode(htmlElement.classList.contains('dark'));
    });

    observer.observe(htmlElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const logoSrc = isDarkMode ? '/WhiteLogo.png' : '/BlackLogo.png';
  return (
    <div className="flex h-screen flex-col bg-muted text-foreground">
      <div className="flex flex-1">
        <div
          className={`bg-secondary transition-all duration-300 ${
            isSidebarOpen ? 'w-64 ' : 'w-0 opacity-0 '
          } overflow-hidden`}
        >
          <div className="p-4">
            <div className="mb-4">
              <Image
                width={60}
                height={50}
                src={logoSrc}
                alt="Wabi logo"
                className="cursor-pointer"
                onClick={() => router.push('/dashboard')}
              />
            </div>
            <div
              className={`mb-4 rounded-lg  border-dashed transition-colors duration-200`}
            >
              <h2 className="mb-2 text-lg font-semibold ">Floors</h2>
              <Separator className="mb-2 bg-border" />
              <div className="flex w-full items-center">
                <Checkbox
                  id="select-all-floors"
                  checked={selectedFloors?.length === floor?.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      const allIds = floor?.map((f: Floor) => f.id.toString());
                      setSelectedFloors(allIds);
                    } else {
                      setSelectedFloors([]);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => e.stopPropagation()}
                  className="ml-0"
                />
                <label
                  htmlFor="select-all-floors"
                  className=" cursor-pointer py-2 pl-3 pr-4 text-sm font-semibold text-muted-foreground transition-opacity duration-200 hover:opacity-80"
                >
                  <span className="border-b border-dashed border-muted-foreground">
                    Select All
                  </span>
                </label>
              </div>
              <div className="max-h-[40vh] space-y-2 overflow-y-auto">
                {floor?.map((f) => (
                  <div
                    key={f.id}
                    className={`rounded-lg border bg-background transition-colors duration-200
                    ${
                      selectedFloors?.includes(f.id.toString())
                        ? 'border-primary '
                        : 'border-border  hover:bg-accent'
                    }`}
                  >
                    <div className="flex w-full items-center">
                      <Checkbox
                        id={'floor-' + f.id}
                        checked={selectedFloors?.includes(f.id.toString())}
                        onCheckedChange={(checked) => {
                          setSelectedFloors(
                            checked
                              ? selectedFloors?.length
                                ? [...selectedFloors, f.id.toString()]
                                : [f.id.toString()]
                              : selectedFloors?.filter(
                                  (id) => id !== f.id.toString()
                                )
                          );
                        }}
                        className="ml-4"
                      />
                      <label
                        htmlFor={'floor-' + f.id}
                        className="w-full flex-1 cursor-pointer py-2 pl-3 pr-4  text-sm font-medium "
                      >
                        {f.floor_name}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <h2 className="mb-2 text-lg font-semibold">Categories</h2>
            <Separator className="mb-2 bg-border" />
            <div className="flex w-full items-center">
              <Checkbox
                id="select-all"
                checked={selectedCategories?.length === categories.length}
                onCheckedChange={(checked) => {
                  if (checked) {
                    const allIds = categories.map((cat) => cat.id.toString());
                    setSelectedCategories(allIds);
                  } else {
                    setSelectedCategories([]);
                  }
                }}
                className="ml-0"
              />
              <label
                htmlFor="select-all"
                className=" cursor-pointer py-2 pl-3 pr-4 text-sm font-semibold text-muted-foreground transition-opacity duration-200 hover:opacity-80"
              >
                <span className="border-b border-dashed border-muted-foreground">
                  Select All
                </span>
              </label>
            </div>
            <div className="max-h-[40vh] space-y-2 overflow-y-auto">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`rounded-lg border bg-background transition-colors duration-200
                    ${
                      selectedCategories?.includes(category.id.toString())
                        ? 'border-primary '
                        : 'border-border  hover:bg-accent'
                    }`}
                >
                  <div className="flex w-full items-center">
                    <Checkbox
                      id={'category-' + category.id}
                      checked={selectedCategories?.includes(
                        category.id.toString()
                      )}
                      onCheckedChange={(checked) => {
                        setSelectedCategories(
                          checked
                            ? selectedCategories?.length
                              ? [...selectedCategories, category.id.toString()]
                              : [category.id.toString()]
                            : selectedCategories?.filter(
                                (id) => id !== category.id.toString()
                              )
                        );
                      }}
                      className="ml-4"
                    />
                    <label
                      htmlFor={'category-' + category.id}
                      className="w-full flex-1 cursor-pointer py-2 pl-3 pr-4  text-sm font-medium "
                    >
                      {category.name}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 px-4">
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as 'open' | 'completed')
            }
            className="flex-1"
          >
            <div className="mb-4 flex items-center justify-between pt-4">
              <Button
                className="text-background-reverse hover:bg-background-reverse border  bg-background shadow-lg"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu size={24} />
              </Button>
              <TabsList className="bg-background">
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="open">Open</TabsTrigger>
              </TabsList>
              <div className="">
                <Button
                  variant="secondary"
                  onClick={() => setShowAllDayModal(true)}
                >
                  Show All Day Items
                </Button>
              </div>
            </div>
            <div className="items-center justify-between gap-2 md:flex">
              <div className="mt-2 flex flex-wrap gap-4 max-md:w-[400px] max-md:overflow-x-auto">
                {orderTypeOptions.map(({ label, value }) => (
                  <div key={value} className="flex items-center">
                    <Checkbox
                      id={`order-type-${value}`}
                      checked={selectedOrderTypes.includes(value)}
                      onCheckedChange={(checked) => {
                        setSelectedOrderTypes((prev) =>
                          checked
                            ? [...prev, value]
                            : prev.filter((t) => t !== value)
                        );
                      }}
                    />
                    <label
                      htmlFor={`order-type-${value}`}
                      className=" cursor-pointer py-2 pl-3 pr-4 text-sm font-semibold text-muted-foreground transition-opacity duration-200 hover:opacity-80"
                    >
                      <span className="border-b border-dashed border-muted-foreground">
                        {label}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
              <div className=" md:w-[250px]">
                <Input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search by name, table, or product"
                  className="bg-background"
                />
              </div>
            </div>
            <TabsContent value={activeTab} className="flex-1 overflow-hidden">
              <ScrollArea className="h-[calc(100vh-152px)]">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {currentOrders.map((order) => (
                    <SortableCard
                      showDocketModal={showDocketModal}
                      key={order.id}
                      order={order}
                      finishBumpDocket={finishBumpDocket}
                      revertOrder={revertOrder}
                      toggleProductStatus={toggleProductStatus}
                      allEmployees={allEmployees}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <AllDayItemsModal
        showAllDayModal={showAllDayModal}
        setShowAllDayModal={setShowAllDayModal}
        currentOrders={currentOrders}
        setSearchText={setSearchText}
        categories={categories}
        allOrders={orders}
      />
      <DocketModal
        currentOrders={currentOrders}
        selectedOrder={selectedOrder}
        docketModalOpen={docketModalOpen}
        setDocketModalOpen={setDocketModalOpen}
        onClose={() => setDocketModalOpen(false)}
        toggleProductStatus={toggleProductStatus}
      />
    </div>
  );
}
