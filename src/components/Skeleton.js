const ProductCardSkeleton = () => {
    return (
      <div className="w-full sm:w-64 p-3 m-2 sm:m-3 bg-white rounded-lg shadow-lg animate-pulse">
        <div className="w-full h-32 sm:h-40 bg-gray-200 rounded-md"></div>
        <div className="mt-2 space-y-2">
          <div className="h-4 sm:h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          <div className="flex items-center justify-between mt-3 gap-1 sm:gap-2">
            <div className="flex items-baseline gap-1 sm:gap-2">
              <div className="h-5 sm:h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-10"></div>
            </div>
            <div className="h-7 sm:h-8 bg-gray-200 rounded-lg w-16 sm:w-20"></div>
          </div>
        </div>
      </div>
    );
};

export const ProductListSkeleton = ({ count = 8 }) => {
    return (
        <div className="flex flex-wrap justify-center">
            {Array(count).fill(0).map((_, index) => (
                <ProductCardSkeleton key={index} />
            ))}
        </div>
    );
};

export default ProductCardSkeleton;
