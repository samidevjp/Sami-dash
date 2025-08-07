import React, { useState } from 'react';
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
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useApi } from '@/hooks/useApi';
import { GripHorizontal, Plus } from 'lucide-react';

const tailwindPaper =
  'bg-secondary text-center h-full flex items-center justify-center relative bg-cover flex-col transition-all';
const tailwindGridItem =
  'rounded overflow-hidden h-[47dvw] sm:h-20 cursor-pointer sm:w-[118px] transition-all hover:opacity-60 border border-border';
const ProductGridItem = ({
  product,
  imgUrl,
  id,
  getRelativeLuminance,
  addProductToOrderList,
  setEditProduct,
  setOpenProductModal
}: any) => {
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

  const getPriceDisplay = () => {
    if (product.price_type === 2) {
      const unit = getMeasurementUnit(product.measurement_type || 2);
      const baseWeight = product.based_weight || 100;
      return `$${product.price.toFixed(2)} / ${baseWeight.toFixed(1)}${unit}`;
    }
    return `$${product.price.toFixed(2)}`;
  };
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const productStyle = product.photo
    ? { backgroundImage: `url(${imgUrl + product.photo})` }
    : product.color
    ? { backgroundColor: product.color }
    : {};

  const styles = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const [isLongPress, setIsLongPress] = useState(false);
  const [longPressTimeout, setLongPressTimeout] =
    useState<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    setIsLongPress(false);

    const timeout = setTimeout(() => {
      setIsLongPress(true);
      setEditProduct(product);
      setOpenProductModal(true);
    }, 1000);

    setLongPressTimeout(timeout);
  };

  const handleTouchEnd = () => {
    clearTimeout(longPressTimeout as NodeJS.Timeout);
    if (!isLongPress) {
      addProductToOrderList(product);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={` ${tailwindGridItem} relative w-[49%] rounded-lg text-xs`}
      style={styles}
    >
      <GripHorizontal
        size={16}
        className="absolute left-1 top-1 z-10 text-gray-400 focus:outline-none"
        {...attributes}
        {...listeners}
      />
      <div
        className={tailwindPaper}
        style={productStyle}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
      >
        {product.photo ? (
          <div className="text-white">
            <p className="text-xl font-bold ">{product.code}</p>
            <div className="absolute bottom-0 left-0 flex w-full items-center justify-between gap-1 bg-black/[.6] p-1 pl-2">
              <p
                className="font-bold"
                style={{
                  fontSize: `${product.title.length > 10 ? '8px' : ''}`
                }}
              >
                {product.title}
              </p>
              <p className="text-[8px]">{getPriceDisplay()}</p>
            </div>
          </div>
        ) : (
          <div
            style={{
              color: product.color && getRelativeLuminance(product.color)
            }}
          >
            <p className="text-xl font-bold">{product.code}</p>
            <p className="text-[10px] font-bold">{product.title}</p>
            <p className={`absolute bottom-1 right-1 text-[8px] font-bold`}>
              {getPriceDisplay()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
interface ProductGridProps {
  filteredProducts: any;
  imgUrl: string;
  handleMouseDown: any;
  handleMouseUp: any;
  setOpenProductModal: any;
  getRelativeLuminance: any;
  addProductToOrderList: any;
  setEditProduct: any;
  allCategories: any;
  setAllCategories: any;
  selectedCategory: any;
}
const ProductGrid = ({
  filteredProducts,
  imgUrl,
  handleMouseDown,
  handleMouseUp,
  setOpenProductModal,
  getRelativeLuminance,
  addProductToOrderList,
  setEditProduct,
  setAllCategories,
  selectedCategory
}: ProductGridProps) => {
  const { changeProductOrder } = useApi();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleChnageProductOrder = async (param: any) => {
    try {
      const response = await changeProductOrder(param);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!active || !over) return;
    if (active.id !== over.id) {
      setAllCategories((categories: any) => {
        const targetCategory = categories.find(
          (category: any) => category.id === selectedCategory.id
        );
        if (!targetCategory) return categories;
        const products = targetCategory.products;
        const oldIndex = products.findIndex(
          (item: any) => item.id === active.id
        );
        const newIndex = products.findIndex((item: any) => item.id === over.id);
        const updatedProducts = arrayMove(products, oldIndex, newIndex);
        const updateArray = updatedProducts.map((item: any, index: number) => ({
          ...item,
          order: index
        }));
        handleChnageProductOrder({ products: updateArray });
        return categories.map((category: any) => {
          if (category.id === selectedCategory.id) {
            return {
              ...category,
              products: updateArray
            };
          }
          return category;
        });
      });
    }
  };
  return (
    <div
      className="flex h-full flex-wrap content-start gap-2 overflow-auto sm:grid"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(118px, 1fr))' }}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredProducts.map((product: any) => product.id)}
        >
          {filteredProducts?.map((product: any, index: number) => (
            <ProductGridItem
              key={index}
              product={product}
              id={product.id}
              imgUrl={imgUrl}
              handleMouseDown={handleMouseDown}
              handleMouseUp={handleMouseUp}
              getRelativeLuminance={getRelativeLuminance}
              addProductToOrderList={addProductToOrderList}
              setEditProduct={setEditProduct}
              setOpenProductModal={setOpenProductModal}
            />
          ))}
        </SortableContext>
      </DndContext>

      <div className={`${tailwindGridItem} w-[49%] rounded-lg text-xs`}>
        <div
          className={tailwindPaper}
          onClick={() => setOpenProductModal(true)}
        >
          <Plus />
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;
