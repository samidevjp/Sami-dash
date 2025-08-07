import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { EllipsisVertical, GripVertical } from 'lucide-react';

interface SortableProductCardProps {
  product: any;
  onMoreClick: () => void;
}

export function SortableProductCard({
  product,
  onMoreClick
}: SortableProductCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: product.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center gap-4 p-3 transition-colors hover:bg-accent/5 ${
        isDragging ? 'ring-2 ring-primary ring-offset-2' : ''
      }`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab rounded-md p-1 transition-colors hover:bg-accent/10"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Product Image */}
      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
        <Image
          width={48}
          height={48}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          alt={product.product_name || product.title}
          src={
            product.photos && product.photos[0]
              ? `${process.env.NEXT_PUBLIC_IMG_URL}${product.photos[0].image_path}`
              : product.photo
              ? `${process.env.NEXT_PUBLIC_IMG_URL}${product.photo}`
              : '/placeholder-img.png'
          }
        />
      </div>

      {/* Product Details */}
      <div className="flex flex-1 items-center gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-medium">
            {product.product_name || product.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>${product.price}</span>
            {product.category_name && (
              <>
                <span className="text-muted-foreground/50">•</span>
                <span className="truncate">{product.category_name}</span>
              </>
            )}
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2">
          {product.is_available && (
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Available
            </span>
          )}
          {product.is_featured && (
            <span className="bg-warning/10 text-warning inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
              Featured
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onMoreClick();
        }}
        className="ml-2 h-8 w-8 p-0 opacity-100 transition-opacity group-hover:opacity-80"
      >
        <EllipsisVertical className="h-4 w-4" />
        <span className="sr-only">More options</span>
      </Button>
    </div>
  );
}
