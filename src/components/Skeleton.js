const ProductCardSkeleton = () => {
    return (
        <div className="w-64 p-4 m-4 bg-white rounded-lg shadow-lg animate-pulse">
            <div className="w-full h-48 bg-gray-200 rounded-md"></div>
            <div className="mt-3 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="flex items-center justify-between mt-3">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="mt-4 flex gap-2">
                    <div className="flex-1 h-10 bg-gray-200 rounded-md"></div>
                    <div className="flex-1 h-10 bg-gray-200 rounded-md"></div>
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
