import React from 'react';
interface ProductInfoProps {
  productData: {
    title: string;
    price: number;
  };
  productCost: number;
}
const ProductInfo: React.FC<ProductInfoProps> = ({
  productData,
  productCost
}) => {
  return (
    <div className="w-full">
      <h3 className="mb-6 text-lg font-semibold">
        {productData.title || 'Product Name'}
      </h3>
      <div className="space-y-3 px-4">
        <p className=" flex items-end justify-between text-sm">
          <span className="mr-2 font-semibold">Cost:</span>$
          {productCost.toFixed(2)}
        </p>
        <p className="flex items-end justify-between text-sm">
          <span className="mr-2 font-semibold">Selling price:</span>$
          {productData.price}
        </p>
        <p className="flex items-end justify-between text-sm">
          <span className="mr-2 font-semibold">Margin:</span>
          {(
            ((productData.price - productCost) / productData.price) *
            100
          ).toFixed(2)}
          %
        </p>
        <p className="flex items-end justify-between text-sm text-green-600">
          <span className="mr-2 font-semibold">Gross Profit:</span>$
          {(productData.price - productCost).toFixed(2)}
        </p>
        <p className="flex items-end justify-between text-sm">
          <span className="mr-2 font-semibold">
            Optimal price <br />
            (230% of cost):
          </span>
          <span>${(productCost * 2.3).toFixed(2)}</span>
        </p>
      </div>
    </div>
  );
};
export default ProductInfo;
