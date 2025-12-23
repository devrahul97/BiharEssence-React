import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams, useSearchParams } from "react-router";
import Select from 'react-select';
import { API_ENDPOINTS, PRODUCT_CATEGORIES } from "../../utils/constants";
import Analytics from "./Analytics";

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [onDemandRequests, setOnDemandRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState("analytics"); // 'analytics', 'products', 'orders', or 'on-demand'
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [previousStock, setPreviousStock] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Food",
    image: "",
    unit: "",
    in_stock: true,
    stock: 0,
  });

  const isDark = useSelector((store) => store.theme.isDark);
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const [searchParams] = useSearchParams();
  const observer = useRef();

  // Check for tab parameter in URL
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "on-demand") {
      setActiveTab("on-demand");
    }
  }, [searchParams]);

  // Check if we're in edit mode from URL
  useEffect(() => {
    if (editId && products.length > 0) {
      const productToEdit = products.find((p) => p.id === parseInt(editId));
      if (productToEdit) {
        handleEditProduct(productToEdit);
      } else if (!loading) {
        // Product not found and loading is complete, navigate back
        navigate("/admin/dashboard");
      }
    }
  }, [editId, products, loading]);

  // Infinite scroll - observe last product row
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

  useEffect(() => {
    fetchProducts(page);
  }, [page, searchQuery, categoryFilter]);

  // Reset to page 1 when search or category changes
  useEffect(() => {
    setPage(1);
    setProducts([]);
    setHasMore(true);
  }, [searchQuery, categoryFilter]);

  useEffect(() => {
    fetchOrders();
    fetchOnDemandRequests();
  }, []);

  const fetchProducts = async (pageNum) => {
    try {
      const token = localStorage.getItem("token");
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // Build query params
      const params = new URLSearchParams({
        page: pageNum,
        limit: 20,
      });
      if (searchQuery) params.append("search", searchQuery);
      if (categoryFilter.length > 0)
        params.append("category", categoryFilter.join(","));

      const response = await fetch(
        `${API_ENDPOINTS.ADMIN_PRODUCTS}?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        if (pageNum === 1) {
          setProducts(data.products);
        } else {
          // Prevent duplicates by filtering out products that already exist
          setProducts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newProducts = data.products.filter(
              (p) => !existingIds.has(p.id)
            );
            return [...prev, ...newProducts];
          });
        }
        // Check if there are more products
        setHasMore(data.products.length === 20);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.ADMIN_ORDERS, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchOnDemandRequests = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("No authentication token found");
        setOnDemandRequests([]);
        return;
      }

      const response = await fetch(API_ENDPOINTS.ADMIN_ON_DEMAND, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error(
          `Failed to fetch on-demand requests: ${response.status} ${response.statusText}`
        );
        setOnDemandRequests([]);
        return;
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Response is not JSON:", await response.text());
        setOnDemandRequests([]);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setOnDemandRequests(data.requests);
      } else {
        setOnDemandRequests([]);
      }
    } catch (error) {
      console.error("Error fetching on-demand requests:", error);
      setOnDemandRequests([]);
    }
  };

  const updateOnDemandStatus = async (requestId, status, adminNotes) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_ENDPOINTS.ADMIN_ON_DEMAND}/${requestId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status, adminNotes }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        alert("Status updated successfully!");
        fetchOnDemandRequests(); // Refresh the list
      }
    } catch (error) {
      console.error("Error updating request status:", error);
      alert("Failed to update status");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // If in_stock is unchecked, save current stock and set to 0
    if (name === "in_stock" && !checked) {
      setPreviousStock(formData.stock);
      setFormData((prev) => ({
        ...prev,
        in_stock: false,
        stock: 0,
      }));
    }
    // If in_stock is checked again, restore previous stock
    else if (name === "in_stock" && checked) {
      setFormData((prev) => ({
        ...prev,
        in_stock: true,
        stock: previousStock,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const url = editingProduct
        ? `${API_ENDPOINTS.ADMIN_PRODUCTS}/${editingProduct.id}`
        : API_ENDPOINTS.ADMIN_PRODUCTS;

      const response = await fetch(url, {
        method: editingProduct ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        setShowAddForm(false);
        setEditingProduct(null);
        setOriginalFormData(null);
        setFormData({
          name: "",
          description: "",
          price: "",
          category: "Food",
          image: "",
          unit: "",
          in_stock: true,
          stock: 0,
        });
        // Navigate back to dashboard if editing
        if (editingProduct) {
          navigate("/admin/dashboard");
        }
        // Reset to page 1 and refetch
        setPage(1);
        setProducts([]);
        fetchProducts(1);
      } else {
        alert(data.error || "Operation failed");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error saving product");
    }
  };

  const handleEdit = (product) => {
    navigate(`/admin/dashboard/edit/${product.id}`);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    const initialData = {
      name: product.name,
      description: product.description || "",
      price: product.price,
      category: product.category,
      image: product.image || "",
      unit: product.unit || "",
      in_stock: product.in_stock,
      stock: product.stock || 0,
    };
    setFormData(initialData);
    setOriginalFormData(initialData);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_ENDPOINTS.ADMIN_PRODUCTS}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        // Reset to page 1 and refetch
        setPage(1);
        setProducts([]);
        fetchProducts(1);
      } else {
        alert(data.error || "Delete failed");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error deleting product");
    }
  };

  const categories = PRODUCT_CATEGORIES;

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            View Customer Site
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            className={`p-6 rounded-lg shadow-lg ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="text-3xl font-bold">{products.length}</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </div>
          <div
            className={`p-6 rounded-lg shadow-lg ${
              isDark ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-3xl font-bold">{orders.length}</p>
              </div>
              <div className="text-4xl">🛒</div>
            </div>
          </div>
          <div
            className={`p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow ${
              isDark
                ? "bg-gradient-to-r from-orange-900 to-orange-800"
                : "bg-gradient-to-r from-orange-500 to-orange-400"
            }`}
            onClick={() => setActiveTab("on-demand")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white">On-Demand Requests</p>
                <p className="text-3xl font-bold text-white">
                  {onDemandRequests.length}
                </p>
                {onDemandRequests.filter((r) => r.status === "pending").length >
                  0 && (
                  <p className="text-xs text-yellow-200 mt-1">
                    {
                      onDemandRequests.filter((r) => r.status === "pending")
                        .length
                    }{" "}
                    pending
                  </p>
                )}
              </div>
              <div className="text-4xl animate-pulse">📋</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-300">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-6 py-3 font-semibold ${
                activeTab === "analytics"
                  ? "border-b-2 border-green-600 text-green-600"
                  : isDark
                  ? "text-gray-400"
                  : "text-gray-600"
              }`}
            >
              📊 Analytics
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`px-6 py-3 font-semibold ${
                activeTab === "products"
                  ? "border-b-2 border-green-600 text-green-600"
                  : isDark
                  ? "text-gray-400"
                  : "text-gray-600"
              }`}
            >
              Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-6 py-3 font-semibold ${
                activeTab === "orders"
                  ? "border-b-2 border-green-600 text-green-600"
                  : isDark
                  ? "text-gray-400"
                  : "text-gray-600"
              }`}
            >
              Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("on-demand")}
              className={`px-6 py-3 font-semibold relative ${
                activeTab === "on-demand"
                  ? "border-b-2 border-green-600 text-green-600"
                  : isDark
                  ? "text-gray-400"
                  : "text-gray-600"
              }`}
            >
              On-Demand Requests ({onDemandRequests.length})
              {onDemandRequests.filter((r) => r.status === "pending").length >
                0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold animate-pulse">
                  {
                    onDemandRequests.filter((r) => r.status === "pending")
                      .length
                  }
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Analytics Tab */}
        {activeTab === "analytics" && <Analytics />}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Product Management</h2>
                <button
                  onClick={() => {
                    setShowAddForm(!showAddForm);
                    setEditingProduct(null);
                    setOriginalFormData(null);
                    if (showAddForm && editId) {
                      navigate("/admin/dashboard");
                    }
                    setFormData({
                      name: "",
                      description: "",
                      price: "",
                      category: "Food",
                      image: "",
                      unit: "",
                      in_stock: true,
                      stock: 0,
                    });
                  }}
                  className={`px-6 py-3 text-white rounded-lg font-semibold ${
                    showAddForm
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {showAddForm ? "Cancel" : "+ Add New Product"}
                </button>
              </div>

              {/* Search and Filter Section */}
              <div className="flex gap-4 items-center mb-6">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="🔍 Search products by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark
                        ? "bg-gray-800 border-gray-600 text-white"
                        : "bg-white border-gray-300"
                    }`}
                  />
                </div>
                <div style={{ minWidth: "250px" }}>
                  <Select
                    isMulti
                    options={PRODUCT_CATEGORIES.map((cat) => ({
                      value: cat,
                      label: cat,
                    }))}
                    value={categoryFilter.map((cat) => ({
                      value: cat,
                      label: cat,
                    }))}
                    onChange={(selected) =>
                      setCategoryFilter(
                        selected ? selected.map((item) => item.value) : []
                      )
                    }
                    placeholder="Select categories..."
                    styles={{
                      control: (base) => ({
                        ...base,
                        backgroundColor: isDark ? "#1f2937" : "white",
                        borderColor: isDark ? "#4b5563" : "#d1d5db",
                        color: isDark ? "white" : "black",
                      }),
                      menu: (base) => ({
                        ...base,
                        backgroundColor: isDark ? "#1f2937" : "white",
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused
                          ? isDark
                            ? "#374151"
                            : "#f3f4f6"
                          : isDark
                          ? "#1f2937"
                          : "white",
                        color: isDark ? "white" : "black",
                      }),
                      multiValue: (base) => ({
                        ...base,
                        backgroundColor: isDark ? "#374151" : "#e5e7eb",
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
                {(searchQuery || categoryFilter.length > 0) && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setCategoryFilter([]);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 whitespace-nowrap"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Add/Edit Product Form */}
            {showAddForm && (
              <div
                className={`mb-8 p-6 rounded-lg ${
                  isDark ? "bg-gray-800" : "bg-white"
                } shadow-lg`}
              >
                <h3 className="text-xl font-bold mb-4">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h3>
                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div>
                    <label className="block mb-2 font-semibold">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-2 rounded border ${
                        isDark
                          ? "bg-gray-700 border-gray-600"
                          : "bg-white border-gray-300"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-2 rounded border ${
                        isDark
                          ? "bg-gray-700 border-gray-600"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className={`w-full px-4 py-2 rounded border ${
                        isDark
                          ? "bg-gray-700 border-gray-600"
                          : "bg-white border-gray-300"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">Unit</label>
                    <input
                      type="text"
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      placeholder="e.g., 500g, 1kg, piece"
                      className={`w-full px-4 py-2 rounded border ${
                        isDark
                          ? "bg-gray-700 border-gray-600"
                          : "bg-white border-gray-300"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      min="0"
                      disabled={!formData.in_stock}
                      className={`w-full px-4 py-2 rounded border ${
                        isDark
                          ? "bg-gray-700 border-gray-600"
                          : "bg-white border-gray-300"
                      } ${
                        !formData.in_stock
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    />
                    {!formData.in_stock && (
                      <p className="text-sm text-red-500 mt-1">
                        Stock is set to 0 when out of stock
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="font-semibold">Stock Status:</label>
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.in_stock) {
                          // Going out of stock: save current stock
                          setPreviousStock(formData.stock);
                          setFormData((prev) => ({
                            ...prev,
                            in_stock: false,
                            stock: 0,
                          }));
                        } else {
                          // Going back in stock: restore previous stock
                          setFormData((prev) => ({
                            ...prev,
                            in_stock: true,
                            stock: previousStock,
                          }));
                        }
                      }}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        formData.in_stock ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          formData.in_stock ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span
                      className={`font-semibold ${
                        formData.in_stock ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {formData.in_stock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block mb-2 font-semibold">
                      Image URL
                    </label>
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                      className={`w-full px-4 py-2 rounded border ${
                        isDark
                          ? "bg-gray-700 border-gray-600"
                          : "bg-white border-gray-300"
                      }`}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block mb-2 font-semibold">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className={`w-full px-4 py-2 rounded border ${
                        isDark
                          ? "bg-gray-700 border-gray-600"
                          : "bg-white border-gray-300"
                      }`}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={
                        editingProduct &&
                        originalFormData &&
                        JSON.stringify(formData) ===
                          JSON.stringify(originalFormData)
                      }
                      className={`px-6 py-3 rounded-lg font-semibold ${
                        editingProduct &&
                        originalFormData &&
                        JSON.stringify(formData) ===
                          JSON.stringify(originalFormData)
                          ? "bg-gray-400 cursor-not-allowed text-gray-200"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                    >
                      {editingProduct ? "Update Product" : "Add Product"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Products Table - Only show if not adding/editing */}
            {!showAddForm && (
              <div
                className={`rounded-lg overflow-hidden shadow-lg ${
                  isDark ? "bg-gray-800" : "bg-white"
                }`}
              >
                {loading ? (
                  <div className="p-8 text-center">Loading products...</div>
                ) : products.length === 0 ? (
                  <div className="p-8 text-center">No products found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={isDark ? "bg-gray-700" : "bg-gray-100"}>
                        <tr>
                          <th className="px-4 py-3 text-left">ID</th>
                          <th className="px-4 py-3 text-left">Name</th>
                          <th className="px-4 py-3 text-left">Category</th>
                          <th className="px-4 py-3 text-left">Price</th>
                          <th className="px-4 py-3 text-left">Stock</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product, index) => (
                          <tr
                            key={product.id}
                            ref={
                              products.length === index + 1
                                ? lastProductRef
                                : null
                            }
                            className={`border-t ${
                              isDark ? "border-gray-700" : "border-gray-200"
                            }`}
                          >
                            <td className="px-4 py-3">{product.id}</td>
                            <td className="px-4 py-3">{product.name}</td>
                            <td className="px-4 py-3">{product.category}</td>
                            <td className="px-4 py-3">₹{product.price}</td>
                            <td className="px-4 py-3">{product.stock || 0}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 rounded text-sm ${
                                  product.in_stock
                                    ? "bg-green-200 text-green-800"
                                    : "bg-red-200 text-red-800"
                                }`}
                              >
                                {product.in_stock ? "In Stock" : "Out of Stock"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleEdit(product)}
                                className="px-3 py-1 bg-blue-600 text-white rounded mr-2 hover:bg-blue-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Loading More Indicator - Only show if not in form mode */}
            {!showAddForm && loadingMore && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
              </div>
            )}

            {/* End of Products Message - Only show if not in form mode */}
            {!showAddForm && !hasMore && products.length > 0 && (
              <div className="text-center py-8">
                <p className={isDark ? "text-gray-400" : "text-gray-500"}>
                  All products loaded
                </p>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Order Management</h2>
            <div
              className={`rounded-lg overflow-hidden shadow-lg ${
                isDark ? "bg-gray-800" : "bg-white"
              }`}
            >
              {loading ? (
                <div className="p-8 text-center">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="p-8 text-center">No orders found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={isDark ? "bg-gray-700" : "bg-gray-100"}>
                      <tr>
                        <th className="px-4 py-3 text-left">Order ID</th>
                        <th className="px-4 py-3 text-left">Customer</th>
                        <th className="px-4 py-3 text-left">Email</th>
                        <th className="px-4 py-3 text-left">Amount</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr
                          key={order.id}
                          className={`border-t ${
                            isDark ? "border-gray-700" : "border-gray-200"
                          }`}
                        >
                          <td className="px-4 py-3 font-mono text-sm">
                            {order.order_id}
                          </td>
                          <td className="px-4 py-3">{order.customer_name}</td>
                          <td className="px-4 py-3">{order.customer_email}</td>
                          <td className="px-4 py-3">₹{order.total_amount}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded text-sm ${
                                order.status === "pending"
                                  ? "bg-yellow-200 text-yellow-800"
                                  : order.status === "completed"
                                  ? "bg-green-200 text-green-800"
                                  : "bg-gray-200 text-gray-800"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* On-Demand Requests Tab */}
        {activeTab === "on-demand" && (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              On-Demand Product Requests
            </h2>
            <div
              className={`rounded-lg overflow-hidden shadow-lg ${
                isDark ? "bg-gray-800" : "bg-white"
              }`}
            >
              {loading ? (
                <div className="p-8 text-center">Loading requests...</div>
              ) : onDemandRequests.length === 0 ? (
                <div className="p-8 text-center">
                  <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                    No on-demand requests yet
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={isDark ? "bg-gray-700" : "bg-gray-100"}>
                      <tr>
                        <th className="px-4 py-3 text-left">ID</th>
                        <th className="px-4 py-3 text-left">Customer</th>
                        <th className="px-4 py-3 text-left">Product Name</th>
                        <th className="px-4 py-3 text-left">Mobile</th>
                        <th className="px-4 py-3 text-left">Address</th>
                        <th className="px-4 py-3 text-left">Est. Price</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {onDemandRequests.map((request) => (
                        <tr
                          key={request.id}
                          className={`border-t ${
                            isDark ? "border-gray-700" : "border-gray-200"
                          }`}
                        >
                          <td className="px-4 py-3">{request.id}</td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-semibold">
                                {request.customer_name || request.user_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {request.customer_email || request.user_email}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold">
                              {request.product_name}
                            </div>
                            {request.product_description && (
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {request.product_description}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">{request.mobile_number}</td>
                          <td className="px-4 py-3">
                            <div className="max-w-xs truncate">
                              {request.address}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {request.estimated_price
                              ? `₹${request.estimated_price}`
                              : "Not specified"}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={request.status}
                              onChange={(e) => {
                                const newStatus = e.target.value;
                                const notes = prompt(
                                  "Add admin notes (optional):"
                                );
                                updateOnDemandStatus(
                                  request.id,
                                  newStatus,
                                  notes || ""
                                );
                              }}
                              className={`px-2 py-1 rounded text-sm ${
                                request.status === "pending"
                                  ? "bg-yellow-200 text-yellow-800"
                                  : request.status === "contacted"
                                  ? "bg-blue-200 text-blue-800"
                                  : request.status === "processing"
                                  ? "bg-purple-200 text-purple-800"
                                  : request.status === "fulfilled"
                                  ? "bg-green-200 text-green-800"
                                  : "bg-red-200 text-red-800"
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="contacted">Contacted</option>
                              <option value="processing">Processing</option>
                              <option value="fulfilled">Fulfilled</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {new Date(request.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                const details = `
Product: ${request.product_name}
Description: ${request.product_description || "N/A"}
Customer: ${request.customer_name || request.user_name}
Email: ${request.customer_email || request.user_email}
Mobile: ${request.mobile_number}
Address: ${request.address}
Payment Preference: ${request.payment_preference}
Estimated Price: ${
                                  request.estimated_price
                                    ? `₹${request.estimated_price}`
                                    : "Not specified"
                                }
Additional Requirements: ${request.additional_requirements || "None"}
Status: ${request.status}
Admin Notes: ${request.admin_notes || "None"}
Requested on: ${new Date(request.created_at).toLocaleString()}
                                                                `.trim();
                                alert(details);
                              }}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
