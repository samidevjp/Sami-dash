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
import { GripHorizontal } from 'lucide-react';
const tailwindPaper =
  'bg-secondary text-center h-full flex items-center justify-center relative bg-cover flex-col transition-all';
const tailwindGridItem =
  'rounded overflow-hidden h-20 cursor-pointer w-[107px] transition-all hover:opacity-60 border border-border';
const SignupProductGridItem = ({
  product,
  imgUrl,
  id,
  getRelativeLuminance,
  addProductToOrderList,
  setEditProduct
}: any) => {
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
      className={` ${tailwindGridItem}  relative rounded-lg text-xs`}
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
              <p className="text-[8px]">{`$${product?.price?.toFixed(2)}`}</p>
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
              {/* {`$${product?.price.toFixed(2)}`} */}
              {`$${product?.price}`}
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
  getRelativeLuminance: any;
  addProductToOrderList: any;
  setAllCategories: any;
  allCategories: any;
  selectedCategory: any;
}
const SignupProductGrid = ({
  filteredProducts,
  imgUrl,
  handleMouseDown,
  handleMouseUp,
  getRelativeLuminance,
  addProductToOrderList,
  setAllCategories,
  selectedCategory
}: ProductGridProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );
  const handleChnageProductOrder = () => {};
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
        handleChnageProductOrder();
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
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(107px, 1fr))' }}
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
            <SignupProductGridItem
              key={index}
              product={product}
              id={product.id}
              imgUrl={imgUrl}
              handleMouseDown={handleMouseDown}
              handleMouseUp={handleMouseUp}
              getRelativeLuminance={getRelativeLuminance}
              addProductToOrderList={addProductToOrderList}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};
export default SignupProductGrid;
