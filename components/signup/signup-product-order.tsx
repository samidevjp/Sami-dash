'use client';
import { useState, useEffect } from 'react';
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

import { Button } from '@/components/ui/button';
import { GripVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useItems } from '@/hooks/useItems';
import SignupAddOnsSection from '@/components/signup/signup-addon-section';
import SignupOrderLists from '@/components/signup/signup-order-lists';
import SignupProductGrid from '@/components/signup/signup-product-grid';
import Image from 'next/image';
import tablet from '@/public/images/landing/features/common/device-tab@2x.png';
import { getRelativeLuminance } from '@/utils/common';
const currentTimestamp = String(Date.now() * 1000);
interface SignupProductAndOrderProps {
  products?: any;
  categories?: any;
}
function getSum(items: any) {
  if (!items) return 0;
  let sum = 0;
  items?.forEach((product: any) => {
    product?.addOns?.forEach((addOn: any) => {
      sum += addOn?.price * addOn?.quantity;
    });
    sum += product?.price * product?.quantity;
  });
  return sum;
}
export default function SignupProductAndOrder({
  products,
  categories
}: SignupProductAndOrderProps) {
  const [allCategories, setAllCategories] = useState<any[]>();
  const [selectedCategory, setSelectedCategory] = useState<any>();
  const [query, setQuery] = useState('');
  const { addItem, items, removeItem, addAddOnToItem, removeAddOnFromItem } =
    useItems();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const updateScale = () => {
      const windowWidth = window.innerWidth;
      if (windowWidth <= 940) {
        setScale(windowWidth / 940);
      } else {
        setScale(1);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);
  useEffect(() => {
    const categorizedData = categories.map((category: any) => {
      return {
        ...category,
        add_ons: [],
        products: products
          .filter(
            (product: { category_id: string }) =>
              product.category_id === String(category.id)
          )
          .map((product: any) => {
            return {
              ...product,
              pos_product_category_id: Number(category.id)
            };
          })
      };
    });
    setAllCategories(categorizedData);
    setSelectedCategory(categorizedData[0]);
  }, [categories, products]);
  const handleRemoveAddon = (addon: any, item: any) => {
    setSelectedAddons(selectedAddons.filter((a: any) => a.id !== addon.id));
    removeAddOnFromItem(item.id, addon.id);
  };
  const handleAddAddon = (addon: any, action: string) => {
    switch (action) {
      case 'add':
        addAddOnToItem(selectedProduct.id, addon);
        setSelectedAddons([...selectedAddons, addon]);
        break;
      default:
        break;
    }
  };

  const handleMouseUp = (val: any, target: string) => {
    if (target === 'product') {
      addProductToOrderList(val);
    } else if (target === 'addOn') {
      handleAddAddon(val, 'add');
    }
  };
  const [addOnType, setAddOnType] = useState(0);
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
  const addProductToOrderList = (product: any) => {
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
      is_deleted: false,
      is_pop_up: false,
      status: product.status,
      stock: product.stock,
      title: product.title,
      updated_at: product.updated_at,
      uuid: 'adg'
    };
    addItem(productItem);
  };
  const allProducts = allCategories?.flatMap(
    (category: any) => category.products
  );
  const filteredProducts = query
    ? allProducts?.filter(
        (product: any) =>
          product?.title.toLowerCase().includes(query.toLowerCase())
      )
    : allCategories
        ?.find((category: any) => category.id === selectedCategory?.id)
        ?.products?.sort((a: any, b: any) => a.order - b.order) || [];
  const calculateTotalPrice = (items: any) => {
    const selectedItemsTotal = getSum(items);
    return selectedItemsTotal;
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
      setAllCategories((items: any) => {
        const oldIndex = items.findIndex((item: any) => item.id === active.id);
        const newIndex = items.findIndex((item: any) => item.id === over.id);
        const updatedItems = arrayMove(items, oldIndex, newIndex);
        return updatedItems.map((item: any, index: number) => ({
          ...item,
          order: index
        }));
      });
    }
  };
  useEffect(() => {
    if (isChangingCategoryOrder) {
      setIsChangingCategoryOrder(false);
    }
  }, [allCategories]);
  return (
    <>
      <div style={{ height: 648 * scale }}>
        <div
          className={`relative m-auto w-[940px] rounded-[20%] `}
          style={{
            transformStyle: 'preserve-3d',
            transition: 'transform 0.1s ease-out',
            transform: `scale(${scale})`,
            transformOrigin: 'top left'
          }}
        >
          <Image alt="tablet" src={tablet} width={940} height={648} />
          <div className="absolute left-0 top-0 h-full w-full p-12">
            <div className="relative flex h-full w-full flex-col ">
              <div className="flex h-[98%] max-h-none flex-row space-x-4 space-y-0 overflow-visible">
                {/* Items List on the Left */}
                <div className="w-1/4 min-w-[246px] 2xl:w-1/4">
                  <div className="h-full overflow-auto rounded-lg">
                    <SignupOrderLists
                      guestName="John Doe"
                      items={items}
                      selectedProduct={selectedProduct}
                      setSelectedProduct={setSelectedProduct}
                      handleAddAddon={handleAddAddon}
                      handleRemoveAddon={handleRemoveAddon}
                      floorsName={'Floor 1'}
                      orderListProducts={[]}
                      removeItem={removeItem}
                      calculateTotalPrice={calculateTotalPrice}
                      onProfileClick={() => {}}
                      onTableClick={() => {}}
                    />
                  </div>
                </div>
                <div className="flex w-full flex-col lg:w-4/5 2xl:w-3/4">
                  <div className="mb-4">
                    <Input
                      className="w-full bg-secondary p-4"
                      placeholder="Search Product"
                      onChange={(e: any) => setQuery(e.target.value)}
                    />
                  </div>
                  <div>
                    <div className="flex gap-4">
                      <div className="flex h-full flex-1 flex-col">
                        <div className="mb-8 max-h-[370px] w-full overflow-auto lg:h-[55%]">
                          <SignupProductGrid
                            filteredProducts={filteredProducts}
                            imgUrl="https://wabi-staging.s3.ap-southeast-2.amazonaws.com/"
                            handleMouseDown={() => {}}
                            handleMouseUp={handleMouseUp}
                            getRelativeLuminance={getRelativeLuminance}
                            addProductToOrderList={addProductToOrderList}
                            setAllCategories={setAllCategories}
                            allCategories={allCategories}
                            selectedCategory={selectedCategory}
                          />
                        </div>
                        {/* Add-On Selector Section */}
                        <SignupAddOnsSection
                          handleAddOnToggle={handleAddOnToggle}
                          showAddOns={showAddOns}
                          addOnType={addOnType}
                          getAddOns={getAddOns}
                          handleMouseDown={() => {}}
                          handleMouseUp={handleMouseUp}
                          setOpenAllModsModal={() => {}}
                        />
                      </div>
                      {/* Categories on the Right for Larger Screens */}
                      <div className="h-[80%] max-h-[440px] w-28 flex-shrink-0 overflow-auto">
                        {allCategories && allCategories.length > 0 && (
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                          >
                            <SortableContext
                              items={allCategories?.map(
                                (category: any) => category.id
                              )}
                              strategy={verticalListSortingStrategy}
                            >
                              {allCategories?.map((category: any) => (
                                <SortableItem
                                  key={category.id}
                                  id={category.id}
                                  setSelectedCategory={setSelectedCategory}
                                  selectedCategory={selectedCategory}
                                  category={category}
                                />
                              ))}
                            </SortableContext>
                          </DndContext>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-2 right-2 flex flex-col space-y-4">
                <Button
                  title="Create Payment on Reader"
                  className="w-full"
                  variant="submit"
                  onClick={() => {}}
                >
                  Save Order
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
const SortableItem = ({
  id,
  setSelectedCategory,
  selectedCategory,
  category
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
        onDoubleClick={() => {}}
        variant="outline"
        className={`h-auto min-h-14 w-full rounded-lg border border-solid px-3 text-xs font-bold leading-tight ${
          selectedCategory?.id === category.id
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
