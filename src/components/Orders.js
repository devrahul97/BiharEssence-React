import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import { fetchOrders } from "../../utils/ordersApi";

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, isAuthenticated } = useSelector((store) => store.auth);
    const isDark = useSelector((store) => store.theme.isDark);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is authenticated
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        loadOrders();
    }, [isAuthenticated, navigate]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const allOrders = await fetchOrders();
            // Backend already filters by user_id and sorts by created_at DESC
            setOrders(allOrders);
            setError(null);
        } catch (err) {
            // Check if it's an authentication error
            if (err.message.includes('login') || err.message.includes('authenticated')) {
                navigate('/login');
                return;
            }
            setError('Failed to load orders');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : ''}`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Loading your orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : ''}`}>
                <div className="text-center">
                    <p className={`mb-4 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
                    <button 
                        onClick={loadOrders}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className={`min-h-screen p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="max-w-4xl mx-auto">
                    <h1 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : ''}`}>My Orders</h1>
                    <div className={`p-8 rounded-lg shadow-md text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="text-6xl mb-4">📦</div>
                        <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : ''}`}>No orders yet</h2>
                        <Link 
                            to="/"
                            className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
                        >
                            Start Shopping
                        </Link>
                
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-6xl mx-auto">
                <h1 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : ''}`}>My Orders ({orders.length})</h1>

                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.orderId} className={`rounded-lg shadow-md overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                            {/* Order Header */}
                            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                                    <div>
                                        <h3 className="font-bold text-lg">Order #{order.orderId}</h3>
                                        <p className="text-sm opacity-90">
                                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold">₹{order.totalAmount?.toFixed(2)}</p>
                                        <p className="text-sm opacity-90">{order.paymentMethod}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-4">
                                <h4 className={`font-semibold mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Items:</h4>
                                <div className="space-y-2">
                                    {order.items?.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                                            <div className="flex-1">
                                                <p className={`font-medium ${isDark ? 'text-white' : ''}`}>{item.name}</p>
                                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    ₹{item.price} × {item.quantity}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-semibold ${isDark ? 'text-white' : ''}`}>₹{(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Delivery Info */}
                                <div className="mt-4 pt-4 border-t">
                                    <h4 className={`font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Delivery Address:</h4>
                                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                        {order.customerInfo?.name}<br />
                                        {order.customerInfo?.address}<br />
                                        {order.customerInfo?.city}, {order.customerInfo?.pincode}<br />
                                        Phone: {order.customerInfo?.phone}
                                    </p>
                                </div>

                                {/* Order Status */}
                                <div className="mt-4 pt-4 border-t">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                            ✓ Order Confirmed
                                        </span>
                                        {order.paymentMethod === 'COD' && (
                                            <span className="inline-block px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                                                💰 Cash on Delivery
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Orders;
