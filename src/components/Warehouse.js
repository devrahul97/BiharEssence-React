import { useEffect, useState } from "react";
import { fetchProducts, updateProductStock } from "../../utils/api";
import { fetchOrders } from "../../utils/ordersApi";

const Warehouse = () => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [newStock, setNewStock] = useState({});

    useEffect(() => {
        loadProducts();
        loadOrders();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await fetchProducts(1, 100); // Fetch all products for warehouse
            // Handle both array and object responses
            const productList = Array.isArray(data) ? data : data.products;
            setProducts(productList);
            setError(null);
        } catch (err) {
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const loadOrders = async () => {
        try {
            const ordersData = await fetchOrders();
            setOrders(ordersData);
        } catch (err) {
            console.error('Failed to load orders:', err);
        }
    };

    const handleUpdateStock = async (productId) => {
        try {
            const stockValue = parseInt(newStock[productId]);
            if (isNaN(stockValue) || stockValue < 0) {
                alert('Please enter a valid stock number');
                return;
            }

            await updateProductStock(productId, stockValue);
            setEditingId(null);
            setNewStock({});
            loadProducts(); // Refresh the list
            alert('Stock updated successfully!');
        } catch (error) {
            alert('Failed to update stock: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading warehouse data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button 
                        onClick={loadProducts}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const lowStockProducts = products.filter(p => p.stock < 20);

    // Calculate sales analytics
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);
    const yesterdayOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= yesterday && orderDate < today;
    });
    const weekOrders = orders.filter(o => new Date(o.createdAt) >= weekAgo);
    const monthOrders = orders.filter(o => new Date(o.createdAt) >= monthAgo);

    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const yesterdayRevenue = yesterdayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const weekRevenue = weekOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const monthRevenue = monthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const weekProductsSold = weekOrders.reduce((sum, o) => {
        return sum + (o.items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0);
    }, 0);

    const monthProductsSold = monthOrders.reduce((sum, o) => {
        return sum + (o.items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0);
    }, 0);

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Warehouse & Payment Dashboard</h1>
                    <p className="text-gray-600">Manage inventory and track sales performance</p>
                </div>

                {/* Inventory Stats */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold mb-3">📦 Inventory Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-gray-500 text-sm font-medium">Total Products</h3>
                            <p className="text-3xl font-bold text-blue-600">{products.length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-gray-500 text-sm font-medium">Total Stock Units</h3>
                            <p className="text-3xl font-bold text-green-600">{totalStock}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-gray-500 text-sm font-medium">Low Stock Alert</h3>
                            <p className="text-3xl font-bold text-orange-600">{lowStockProducts.length}</p>
                        </div>
                    </div>
                </div>

                {/* Payment & Revenue Stats */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold mb-3">💰 Payments Received</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-md text-white">
                            <h3 className="text-sm font-medium opacity-90">Today</h3>
                            <p className="text-3xl font-bold">₹{todayRevenue.toFixed(2)}</p>
                            <p className="text-sm opacity-75">{todayOrders.length} orders</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-md text-white">
                            <h3 className="text-sm font-medium opacity-90">Yesterday</h3>
                            <p className="text-3xl font-bold">₹{yesterdayRevenue.toFixed(2)}</p>
                            <p className="text-sm opacity-75">{yesterdayOrders.length} orders</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-md text-white">
                            <h3 className="text-sm font-medium opacity-90">This Week</h3>
                            <p className="text-3xl font-bold">₹{weekRevenue.toFixed(2)}</p>
                            <p className="text-sm opacity-75">{weekOrders.length} orders</p>
                        </div>
                        <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-6 rounded-lg shadow-md text-white">
                            <h3 className="text-sm font-medium opacity-90">This Month</h3>
                            <p className="text-3xl font-bold">₹{monthRevenue.toFixed(2)}</p>
                            <p className="text-sm opacity-75">{monthOrders.length} orders</p>
                        </div>
                    </div>
                </div>

                {/* Products Sold Stats */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold mb-3">📊 Products Sold</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
                            <h3 className="text-gray-500 text-sm font-medium">This Week</h3>
                            <p className="text-4xl font-bold text-purple-600">{weekProductsSold}</p>
                            <p className="text-sm text-gray-500 mt-1">units sold</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-pink-500">
                            <h3 className="text-gray-500 text-sm font-medium">This Month</h3>
                            <p className="text-4xl font-bold text-pink-600">{monthProductsSold}</p>
                            <p className="text-sm text-gray-500 mt-1">units sold</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" style={{display: 'none'}}>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-gray-500 text-sm font-medium">Total Products</h3>
                        <p className="text-3xl font-bold text-blue-600">{products.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-gray-500 text-sm font-medium">Total Stock Units</h3>
                        <p className="text-3xl font-bold text-green-600">{totalStock}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-gray-500 text-sm font-medium">Low Stock Alert</h3>
                        <p className="text-3xl font-bold text-orange-600">{lowStockProducts.length}</p>
                    </div>
                </div>

                {/* Low Stock Warning */}
                {lowStockProducts.length > 0 && (
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-orange-700">
                                    <strong>{lowStockProducts.length} products</strong> have low stock (less than 20 units)
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Products Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stock
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <img src={product.image} alt={product.name} className="h-10 w-10 rounded object-cover" />
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                    <div className="text-sm text-gray-500">{product.unit}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">{product.category}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-green-600">₹{product.price}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {editingId === product.id ? (
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={newStock[product.id] !== undefined ? newStock[product.id] : product.stock}
                                                    onChange={(e) => setNewStock({...newStock, [product.id]: e.target.value})}
                                                    className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                                                />
                                            ) : (
                                                <span className={`text-sm font-semibold ${product.stock < 20 ? 'text-orange-600' : 'text-gray-900'}`}>
                                                    {product.stock} units
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {product.inStock ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    In Stock
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                    Out of Stock
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {editingId === product.id ? (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleUpdateStock(product.id)}
                                                        className="text-green-600 hover:text-green-900 font-medium"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(null);
                                                            setNewStock({});
                                                        }}
                                                        className="text-gray-600 hover:text-gray-900 font-medium"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setEditingId(product.id)}
                                                    className="text-blue-600 hover:text-blue-900 font-medium"
                                                >
                                                    Update Stock
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">💡 Info</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Stock is automatically updated when customers place orders</li>
                        <li>• Products with less than 20 units are highlighted as low stock</li>
                        <li>• Out of stock products cannot be ordered by customers</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Warehouse;
