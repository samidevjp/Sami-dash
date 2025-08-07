import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

import { Ban, GripVertical, X } from 'lucide-react';

import _ from 'lodash';
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
import ModifierModal from '@/components/pos/modifier-modal';
import { Dialog } from '../ui/dialog';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';

interface AllModsModalProps {
  open: boolean;
  registeredProducts: any[];
  handleClose: () => void;
  handleAddModifier: (selectedAddOns: any) => void;
  propSelectedCategory: any;
}
const AllModsModal: React.FC<AllModsModalProps> = ({
  open,
  registeredProducts,
  handleClose,
  handleAddModifier,
  propSelectedCategory
}) => {
  const [selectedCategory, setSelectedCategory] =
    useState(propSelectedCategory);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [pageContentHeight, setPageContentHeight] = useState(0);
  const [openModifierModal, setOpenModifierModal] = useState(false);

  const headerRef = useRef<any>(null);
  const footerRef = useRef<any>(null);
  const contentRef = useRef<any>(null);
  const middleRef = useRef<any>(null);
  const rightRef = useRef<any>(null);
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        if (headerRef.current && footerRef.current && contentRef.current) {
          const headerHeight = headerRef.current.offsetHeight;
          const footerHeight = footerRef.current.offsetHeight;
          const cardHeight = contentRef.current.offsetHeight;
          setPageContentHeight(cardHeight - headerHeight - footerHeight);
        }
      });
    }
  }, [open]);

  useEffect(() => {
    getAddOns();
  }, [registeredProducts]);
  const handleCategoryClick = (category: any) => {
    setSelectedCategory(category);
  };

  const save = () => {
    handleAddModifier(selectedAddOns);
    handleClose();
  };

  const getAddOns = () => {
    if (!selectedCategory) return [];
    return selectedCategory.add_ons;
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!active || !over) return;
    if (active?.id !== over?.id) {
      setSelectedAddOns((items) => {
        const oldIndex = items.findIndex((item: any) => item.id === active.id);
        const newIndex = items.findIndex((item: any) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredAddOns = searchQuery
    ? registeredProducts.flatMap((category: any) =>
        category.add_ons.filter((addOn: any) =>
          addOn.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : getAddOns();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <div className="m-auto flex h-[90%] max-h-[90vh] w-[90%] flex-col overflow-auto rounded-lg border border-border bg-secondary">
        <div className="h-full w-full bg-gray-dark" ref={contentRef}>
          <div className="flex h-full flex-col p-0">
            <div
              className="flex items-center justify-between border-b border-solid border-border p-4"
              ref={headerRef}
            >
              <h2 className="text-lg font-semibold">All Modifiers</h2>

              <X className="cursor-pointer" onClick={handleClose} />
            </div>

            <div
              className="pageContent flex p-4"
              style={{ height: `${pageContentHeight}px` }}
            >
              <div>
                <p className="text-md pb-4 font-semibold">
                  Selected Modifier Group
                </p>
                <div
                  className="flex flex-col gap-y-3 overflow-auto pb-4"
                  style={{ maxHeight: `calc( ${pageContentHeight}px - 64px )` }}
                >
                  {registeredProducts.map((category: any) => (
                    <Button
                      key={category.id}
                      onClick={() => handleCategoryClick(category)}
                      className={[
                        selectedCategory?.id === category?.id
                          ? 'border border-primary bg-tertiary'
                          : 'bg-secondary',
                        'w-48',
                        'min-h-20 rounded-lg text-foreground'
                      ].join(' ')}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="w-2/4 overflow-auto px-4">
                <div ref={middleRef}>
                  <p className="text-md pb-4 font-semibold">Search Modifiers</p>
                  <Input
                    placeholder="Filter menu items"
                    onChange={handleSearchChange}
                    className="mb-4 bg-secondary"
                  />
                  <Button
                    onClick={() => setOpenModifierModal(true)}
                    className="bg-primary px-8 py-2"
                  >
                    + Add Item
                  </Button>

                  <div className="flex items-center gap-1 py-4">
                    <Checkbox
                      style={{ transform: 'scale(0.8)' }}
                      checked={
                        searchQuery === '' &&
                        _.differenceBy(getAddOns(), selectedAddOns, 'id')
                          .length === 0 &&
                        filteredAddOns.length > 0
                      }
                      disabled={
                        searchQuery !== '' || filteredAddOns.length === 0
                      }
                      onCheckedChange={() => {
                        if (
                          _.differenceBy(getAddOns(), selectedAddOns, 'id')
                            .length === 0
                        ) {
                          setSelectedAddOns((prevSelected) =>
                            _.differenceBy(prevSelected, getAddOns(), 'id')
                          );
                        } else {
                          setSelectedAddOns((prevSelected) =>
                            _.unionBy(prevSelected, getAddOns(), 'id')
                          );
                        }
                      }}
                    />
                    <p className="text-xs font-bold">Select All</p>
                  </div>
                </div>
                <div
                  className="overflow-y-auto"
                  style={{
                    height: `calc( 100% - ${middleRef?.current?.offsetHeight}px )`,
                    minWidth: '520px'
                  }}
                >
                  <div className="flex flex-wrap">
                    {filteredAddOns.map((addOn: any) => (
                      <ModifierItem
                        addOn={addOn}
                        key={addOn.id}
                        name={addOn.name}
                        setSelectedAddOns={setSelectedAddOns}
                        selectedAddOns={selectedAddOns}
                        price={addOn.price > 0 ? `$${addOn.price}` : ''}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grow px-4">
                <div ref={rightRef}>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-md font-semibold">Selected Items</p>
                    <Button
                      className="flex items-center gap-1 text-sm"
                      variant="danger"
                      onClick={() => setSelectedAddOns([])}
                    >
                      <Ban className="w-4" />
                      <p className="text-sm font-semibold">Remove All</p>
                    </Button>
                  </div>
                  <p className="text-xs">
                    You can drag to re-order selected items
                  </p>
                </div>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={selectedAddOns.map((item: any) => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <ul
                      style={{
                        height: `calc(100% - ${rightRef?.current?.offsetHeight}px)`
                      }}
                      className="mt-2 overflow-auto"
                    >
                      {selectedAddOns.map((addOn: any) => (
                        <SortableItem
                          key={addOn.id}
                          id={addOn.id}
                          name={addOn.name}
                          price={addOn.price > 0 ? `$${addOn.price}` : ''}
                        />
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              </div>
            </div>

            <div
              className="mt-auto flex justify-end border-t border-solid border-border p-4"
              ref={footerRef}
            >
              <Button onClick={() => save()}>Save</Button>
            </div>
          </div>
        </div>
        {openModifierModal && (
          <ModifierModal
            open={openModifierModal}
            setOpenModifierModal={setOpenModifierModal}
            registeredProducts={registeredProducts}
          />
        )}
      </div>
    </Dialog>
  );
};

const ModifierItem = ({
  name,
  price,
  addOn,
  setSelectedAddOns,
  selectedAddOns
}: any) => {
  const [checked, setChecked] = useState(
    selectedAddOns.some((item: any) => item.id === addOn.id)
  );
  useEffect(() => {
    setChecked(selectedAddOns.some((item: any) => item.id === addOn.id));
  }, [selectedAddOns]);

  const handleCheckboxChange = (addOn: any) => {
    setChecked(!checked);
    if (!checked) {
      const newAddOn = {
        category_id: addOn.pos_product_category_id,
        id: addOn.id,
        name: addOn.name,
        price: addOn.price,
        quantity: 1,
        status: addOn.status,
        type: addOn.type
      };
      setSelectedAddOns((prev: any) => {
        if (prev.find((item: any) => item.id === addOn.id)) {
          return prev.filter((item: any) => item.id !== addOn.id);
        } else {
          return [...prev, newAddOn];
        }
      });
    } else {
      setSelectedAddOns((prev: any) => {
        return prev.filter((item: any) => item.id !== addOn.id);
      });
    }
  };

  return (
    <div className="mb-2 flex w-1/3 items-center">
      <GripVertical />
      <div
        className={`boder-solid flex h-full grow cursor-pointer items-center gap-1 border ${
          checked ? 'border-primary bg-tertiary' : 'border-border bg-secondary'
        } rounded-lg px-1 py-3 text-sm `}
        onClick={() => handleCheckboxChange(addOn)}
      >
        <Checkbox
          className="rounded text-primary"
          style={{ transform: 'scale(0.8)' }}
          checked={checked}
        />
        <div className="flex grow items-center justify-between">
          <p className="text-xs font-bold">{name}</p>
          {price && (
            <span className="rounded-lg bg-gray-customGray px-1.5 py-1 text-xs">
              {price}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const SortableItem = ({ id, name, price }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <li ref={setNodeRef} style={style} className="mb-2 flex items-center p-0">
      <GripVertical {...attributes} {...listeners} className="border-0" />
      <div
        className={`boder-solid flex grow items-center gap-1 rounded-lg border border-primary bg-tertiary px-1 py-2 text-sm font-bold`}
      >
        <Checkbox
          className="rounded p-0 text-primary"
          style={{ transform: 'scale(0.8)' }}
          defaultChecked
        />
        <div className="flex grow items-center justify-between">
          <p className="text-sm font-bold">{name}</p>
          <span className="p-1">{price}</span>
        </div>
      </div>
    </li>
  );
};

export default AllModsModal;
