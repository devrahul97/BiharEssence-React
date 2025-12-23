import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import Select from 'react-select';
import { fetchProducts } from "../../utils/api";
import { translations } from "../../utils/translations";
import ProductCard from "./ProductCard";
import { ProductListSkeleton } from "./Skeleton";

const Products = () => {
  const currentLanguage =
    useSelector((store) => store.language.currentLanguage) || "english";
  const isDark = useSelector((store) => store.theme.isDark);
  const t = translations[currentLanguage] || translations.english;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [viewMode, setViewMode] = useState("category"); // 'category' or 'all'
  const [categoryProducts, setCategoryProducts] = useState({}); // Store all products by category
  const [loadingCategories, setLoadingCategories] = useState(new Set()); // Track which categories are loading
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Pull to refresh states
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const currentY = useRef(0);

  // Banner messages with images
  const bannerMessages = [
    {
      text: "By buying products, you are helping Bihari people to grow",
      subtitle: "Support local farmers and their families",
      image:
        "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80",
    },
    {
      text: "Support local artisans and farmers of Bihar",
      subtitle: "Empowering communities through your purchase",
      image:
        "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&q=80",
    },
    {
      text: "Every purchase empowers Bihar's economy",
      subtitle: "Quality products, direct from Bihar to your doorstep",
      image:
        "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200&q=80",
    },
    {
      text: "Authentic Bihar, Delivered to Your Home",
      subtitle: "Preserving traditions, supporting livelihoods",
      image:
        "https://images.unsplash.com/photo-1416339442236-8ceb164046f8?w=1200&q=80",
    },
  ];

  // Auto-rotate banner
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % bannerMessages.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  // Pull to refresh handlers
  const handleTouchStart = (e) => {
    if (window.scrollY === 0 && window.innerWidth < 768) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling) return;

    currentY.current = e.touches[0].clientY;
    const distance = currentY.current - startY.current;

    if (distance > 0 && distance < 150) {
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 80) {
      setPullDistance(0);
      setIsPulling(false);
      // Refresh products
      setPage(1);
      setProducts([]);
      setLoading(true);
    } else {
      setPullDistance(0);
      setIsPulling(false);
    }
  };

  const observer = useRef();
  const lastProductRef = useCallback(
    (node) => {
      if (loadingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loadingMore, hasMore]
  );

  // Fetch products from backend
  useEffect(() => {
    const loadProducts = async () => {
      try {
        if (page === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const data = await fetchProducts(page, 8);

        if (page === 1) {
          setProducts(data.products);
        } else {
          // Filter out duplicates by checking if product.id already exists
          setProducts((prev) => {
            const newProducts = data.products.filter(
              (newProduct) =>
                !prev.some(
                  (existingProduct) => existingProduct.id === newProduct.id
                )
            );
            return [...prev, ...newProducts];
          });
        }

        setHasMore(data.hasMore);
        setError(null);
      } catch (err) {
        setError(t.failedToLoad);
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    loadProducts();
  }, [page]);

  // Get unique categories
  const categories = ["All", ...new Set(products.map((p) => p.category))];

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchText.toLowerCase()) ||
      product.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory =
      selectedCategory.length === 0 ||
      selectedCategory.includes(product.category);
    return matchesSearch && matchesCategory;
  });

  // Group products by category
  const groupedProducts = {};
  filteredProducts.forEach((product) => {
    if (!groupedProducts[product.category]) {
      groupedProducts[product.category] = [];
    }
    groupedProducts[product.category].push(product);
  });

  const handleSeeAll = async (category) => {
    const isExpanded = expandedCategories.has(category);

    if (isExpanded) {
      // Collapse category
      setExpandedCategories((prev) => {
        const newSet = new Set(prev);
        newSet.delete(category);
        return newSet;
      });
    } else {
      // Expand category - fetch all products for this category
      setExpandedCategories((prev) => new Set(prev).add(category));

      // Only fetch if we haven't already loaded all products for this category
      if (!categoryProducts[category]) {
        setLoadingCategories((prev) => new Set(prev).add(category));

        try {
          // Fetch all products for this category
          const response = await fetch(
            `http://localhost:5000/api/products?category=${category}&limit=1000`
          );
          const data = await response.json();

          if (data.success) {
            setCategoryProducts((prev) => ({
              ...prev,
              [category]: data.products,
            }));
          }
        } catch (error) {
          console.error("Error fetching category products:", error);
        } finally {
          setLoadingCategories((prev) => {
            const newSet = new Set(prev);
            newSet.delete(category);
            return newSet;
          });
        }
      }
    }
  };

  const handleViewAllProducts = () => {
    setViewMode("all");
    setExpandedCategories(new Set());
    setSelectedCategory([]);
  };

  const handleViewByCategory = () => {
    setViewMode("category");
    setExpandedCategories(new Set());
  };

  if (loading && page === 1) {
    return (
      <div
        className={`min-h-screen p-4 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
      >
        <div className="max-w-7xl mx-auto">
          <div
            className={`h-12 rounded w-96 mb-6 animate-pulse ${
              isDark ? "bg-gray-700" : "bg-gray-200"
            }`}
          ></div>
          <div
            className={`p-4 rounded-lg shadow-md mb-6 ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div
                className={`flex-1 h-10 rounded animate-pulse ${
                  isDark ? "bg-gray-700" : "bg-gray-200"
                }`}
              ></div>
              <div
                className={`w-40 h-10 rounded animate-pulse ${
                  isDark ? "bg-gray-700" : "bg-gray-200"
                }`}
              ></div>
            </div>
          </div>
          <ProductListSkeleton count={8} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-gray-900" : ""
        }`}
      >
        <div className="text-center">
          <p className={`mb-4 ${isDark ? "text-red-400" : "text-red-600"}`}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
          >
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen md:p-4 ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      } relative`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      {isPulling && pullDistance > 0 && (
        <div
          className="fixed top-16 left-0 right-0 flex justify-center z-40 transition-opacity md:hidden"
          style={{ opacity: pullDistance / 80 }}
        >
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              isDark ? "bg-gray-800" : "bg-white"
            } shadow-lg`}
          >
            <div
              className="animate-spin text-2xl"
              style={{ transform: `rotate(${pullDistance * 4}deg)` }}
            >
              🔄
            </div>
            <span
              className={`text-sm font-semibold ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              {pullDistance > 80 ? "Release to refresh" : "Pull to refresh"}
            </span>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        <h1
          className={`text-3xl font-bold md:mb-6 px-4 pt-4 md:px-0 md:pt-0 ${
            isDark ? "text-white" : ""
          }`}
        >
          BiharEssence - {t.quickCommerce}
        </h1>

        {/* Rotating Banner - Sticky on Mobile */}
        <div className="overflow-hidden rounded-lg sm:rounded-xl shadow-2xl md:mb-6 sticky top-16 z-30">
          <div
            className="relative h-48 sm:h-64 md:h-80 bg-cover bg-center transition-all duration-700 ease-in-out"
            style={{
              backgroundImage: `url('${bannerMessages[currentBannerIndex].image}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Dark overlay for text visibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>

            {/* Content */}
            <div className="relative h-full flex flex-col justify-center px-4 sm:px-8 md:px-16">
              <div className="max-w-2xl">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 animate-fadeIn">
                  {bannerMessages[currentBannerIndex].text}
                </h2>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-3 sm:mb-6">
                  {bannerMessages[currentBannerIndex].subtitle}
                </p>
                <div className="flex gap-3">
                  <span className="bg-green-500 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-semibold shadow-lg hover:bg-green-600 transition-all cursor-pointer text-sm sm:text-base">
                    Shop Now
                  </span>
                </div>
              </div>
            </div>

            {/* Progress dots */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
              {bannerMessages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBannerIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentBannerIndex
                      ? "bg-white w-8"
                      : "bg-white/50 hover:bg-white/75 w-2"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Search and Filter - Sticky on Mobile */}
        <div
          className={`p-4 rounded-lg shadow-md md:relative md:top-0 md:z-auto md:mb-6 sticky top-64 z-20 ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder={t.searchProducts}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className={`flex-1 border rounded-md px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "border-gray-300"
              }`}
            />
            <div style={{ minWidth: "250px" }}>
              <Select
                isMulti
                options={categories
                  .filter((c) => c !== "All")
                  .map((cat) => ({ value: cat, label: cat }))}
                value={selectedCategory.map((cat) => ({
                  value: cat,
                  label: cat,
                }))}
                onChange={(selected) =>
                  setSelectedCategory(
                    selected ? selected.map((item) => item.value) : []
                  )
                }
                placeholder={`${
                  t.filterByCategory || "Filter by categories"
                }...`}
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: isDark ? "#374151" : "white",
                    borderColor: isDark ? "#4b5563" : "#d1d5db",
                    color: isDark ? "white" : "black",
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: isDark ? "#374151" : "white",
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isFocused
                      ? isDark
                        ? "#4b5563"
                        : "#f3f4f6"
                      : isDark
                      ? "#374151"
                      : "white",
                    color: isDark ? "white" : "black",
                  }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: isDark ? "#4b5563" : "#e5e7eb",
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: isDark ? "white" : "black",
                  }),
                  multiValueRemove: (base) => ({
                    ...base,
                    color: isDark ? "#9ca3af" : "#6b7280",
                    ":hover": {
                      backgroundColor: isDark ? "#ef4444" : "#fca5a5",
                      color: "white",
                    },
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: isDark ? "white" : "black",
                  }),
                  input: (base) => ({
                    ...base,
                    color: isDark ? "white" : "black",
                  }),
                }}
              />
            </div>
          </div>
        </div>

        {/* View Toggle Buttons - Sticky on Mobile */}
        <div
          className={`flex flex-col sm:flex-row gap-2 sm:gap-4 md:mb-6 md:relative md:top-0 md:z-auto sticky top-96 z-10 py-3 ${
            isDark ? "bg-gray-900" : "bg-gray-50"
          }`}
        >
          <button
            onClick={handleViewByCategory}
            className={`px-4 sm:px-6 py-2 rounded-lg font-semibold transition-all text-sm sm:text-base ${
              viewMode === "category"
                ? "bg-green-600 text-white shadow-lg"
                : isDark
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            📂 View by Category
          </button>
          <button
            onClick={handleViewAllProducts}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              viewMode === "all"
                ? "bg-green-600 text-white shadow-lg"
                : isDark
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            📋 View All Products
          </button>
        </div>

        {/* Products Display - Category View */}
        {viewMode === "category" ? (
          <div className="space-y-8">
            {Object.keys(groupedProducts).map((category) => {
              const categoryProducts = groupedProducts[category];
              const isExpanded = expandedCategories.has(category);
              const displayProducts = isExpanded
                ? categoryProducts
                : categoryProducts.slice(0, 4);

              return (
                <div
                  key={category}
                  className={`rounded-lg p-6 shadow-lg ${
                    isDark ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  {/* Category Header */}
                  <div className="flex justify-between items-center mb-4">
                    <h2
                      className={`text-2xl font-bold ${
                        isDark ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {category} ({categoryProducts.length})
                    </h2>
                    {categoryProducts.length > 4 && (
                      <button
                        onClick={() => handleSeeAll(category)}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-semibold shadow-md transition-all"
                      >
                        {isExpanded
                          ? "← Show Less"
                          : `See All (${categoryProducts.length}) →`}
                      </button>
                    )}
                  </div>

                  {/* Products Grid */}
                  <div className="flex flex-wrap justify-center">
                    {displayProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* All Products View */
          <>
            <div className="flex flex-wrap justify-center">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => {
                  if (filteredProducts.length === index + 1) {
                    return (
                      <div key={product.id} ref={lastProductRef}>
                        <ProductCard product={product} />
                      </div>
                    );
                  } else {
                    return <ProductCard key={product.id} product={product} />;
                  }
                })
              ) : (
                <div className="text-center py-12">
                  <p
                    className={`text-lg ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {t.noProductsFound}
                  </p>
                </div>
              )}
            </div>

            {/* Loading More Indicator - Skeleton Cards */}
            {loadingMore && (
              <div className="flex flex-wrap justify-center">
                <ProductListSkeleton count={8} />
              </div>
            )}

            {/* No More Products Message */}
            {!hasMore && products.length > 0 && (
              <div className="text-center py-8">
                <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                  {t.reachedEnd}
                </p>
              </div>
            )}
          </>
        )}

        {/* About Us Section */}
        <div
          className={`mt-12 rounded-lg p-8 shadow-md ${
            isDark
              ? "bg-gradient-to-r from-gray-800 to-gray-700"
              : "bg-gradient-to-r from-green-50 to-blue-50"
          }`}
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2
              className={`text-3xl font-bold mb-4 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              {t.aboutUs}
            </h2>
            <p
              className={`text-lg mb-4 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {t.aboutDescription1}
            </p>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              {t.aboutDescription2}
            </p>
            <div
              className={`mt-6 flex justify-center gap-8 text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              <div>
                <p className="font-bold text-2xl text-green-600">100+</p>
                <p>{t.products}</p>
              </div>
              <div>
                <p className="font-bold text-2xl text-blue-600">24/7</p>
                <p>{t.support}</p>
              </div>
              <div>
                <p className="font-bold text-2xl text-orange-600">{t.fast}</p>
                <p>{t.delivery}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
