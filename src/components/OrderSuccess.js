import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";

const OrderSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isDark = useSelector((store) => store.theme.isDark);
    const { paymentId, orderId, amount, paymentMethod } = location.state || {};

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className={`p-8 rounded-lg shadow-lg text-center max-w-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="mb-4">
                    <svg className="w-20 h-20 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold text-green-600 mb-4">Order Successful!</h1>
                <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Thank you for your order. Your order has been placed successfully.
                </p>
                <div className={`p-4 rounded-md mb-6 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    {orderId && (
                        <>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Order ID</p>
                            <p className={`font-mono text-sm mb-3 ${isDark ? 'text-white' : ''}`}>{orderId}</p>
                        </>
                    )}
                    {paymentId && (
                        <>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Payment ID</p>
                            <p className={`font-mono text-sm mb-3 ${isDark ? 'text-white' : ''}`}>{paymentId}</p>
                        </>
                    )}
                    {paymentMethod && (
                        <>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Payment Method</p>
                            <p className={`font-semibold text-sm mb-3 ${isDark ? 'text-white' : ''}`}>{paymentMethod}</p>
                        </>
                    )}
                    {amount && (
                        <p className="text-lg font-bold text-green-600 mt-2">₹{amount}</p>
                    )}
                </div>
                <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Your order will be delivered within 10-20 minutes.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition-colors"
                >
                    Continue Shopping
                </button>
            </div>
        </div>
    );
};

export default OrderSuccess;
