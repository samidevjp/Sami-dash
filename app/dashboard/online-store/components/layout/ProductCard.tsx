import React from 'react';
import Image from 'next/image';

interface ProductCardProps {
  id: number;
  title: string;
  price: number;
  photo: string;
  pos_product_category_id: number;
  category_id: number;
}

export default function ProductCard({
  id,
  title,
  price,
  photo,
  pos_product_category_id,
  category_id
}: ProductCardProps) {
  return (
    <>
      <div className="card cursor-pointer overflow-hidden rounded-sm border border-gray-200 shadow-md">
        <Image
          src={
            photo
              ? `${process.env.NEXT_PUBLIC_IMG_URL}${photo}`
              : '/placeholder-img.png'
          }
          alt={title}
          width={100}
          height={100}
          className="h-16 w-full object-cover"
        />
        <div className="p-1">
          <h2 className="truncate font-semibold" style={{ fontSize: '0.5rem' }}>
            {title}
          </h2>
          <p className="" style={{ fontSize: '0.3rem' }}>
            ${price}
          </p>
        </div>
      </div>
    </>
  );
}
