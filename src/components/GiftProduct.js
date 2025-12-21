import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { addItem } from "../../utils/cartSlice";
import { translations } from "../../utils/translations";

const GiftProduct = () => {
    const isDark = useSelector((store) => store.theme.isDark);
    const currentLanguage = useSelector((store) => store.language.currentLanguage);
    const t = translations[currentLanguage] || translations.english;
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [giftForm, setGiftForm] = useState({
        recipientName: "",
        recipientEmail: "",
        recipientPhone: "",
        recipientAddress: "",
        message: "",
        deliveryDate: ""
    });

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    // Sample gift-worthy products
    const giftProducts = [
        {
            id: 1,
            name: "Bihar Special Sattu",
            price: 299,
            image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300",
            description: "Traditional sattu powder, perfect health gift"
        },
        {
            id: 2,
            name: "Madhubani Art Gift Box",
            price: 899,
            image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=300",
            description: "Beautiful handcrafted Madhubani art pieces"
        },
        {
            id: 3,
            name: "Bihar Dry Fruits Combo",
            price: 799,
            image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=300",
            description: "Premium dry fruits from Bihar"
        },
        {
            id: 4,
            name: "Traditional Sweet Box",
            price: 599,
            image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300",
            description: "Assorted traditional Bihar sweets"
        },
        {
            id: 5,
            name: "Handicraft Gift Set",
            price: 1299,
            image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300",
            description: "Beautiful Bihar handicrafts collection"
        },
        {
            id: 6,
            name: "Organic Honey & Tea",
            price: 499,
            image: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=300",
            description: "Pure Bihar honey with herbal tea"
        }
    ];

    const handleInputChange = (e) => {
        setGiftForm({
            ...giftForm,
            [e.target.name]: e.target.value
        });
    };

    const handleSendGift = () => {
        if (!selectedProduct) {
            alert("Please select a product to gift!");
            return;
        }

        if (!giftForm.recipientName || !giftForm.recipientEmail || !giftForm.recipientPhone) {
            alert("Please fill in all recipient details!");
            return;
        }

        // Add to cart with gift details
        const giftItem = {
            ...selectedProduct,
            quantity: 1,
            isGift: true,
            giftDetails: giftForm
        };

        dispatch(addItem(giftItem));
        setShowSuccess(true);

        // Reset form after 2 seconds
        setTimeout(() => {
            setShowSuccess(false);
            setSelectedProduct(null);
            setGiftForm({
                recipientName: "",
                recipientEmail: "",
                recipientPhone: "",
                recipientAddress: "",
                message: "",
                deliveryDate: ""
            });
        }, 2000);
    };

    return (
        <div className={`min-h-screen p-8 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        🎁 Gift a Product
                    </h1>
                    <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Share the joy of authentic Bihar products with your loved ones
                    </p>
                </div>

                {/* Success Message */}
                {showSuccess && (
                    <div className="mb-6 p-4 bg-green-500 text-white rounded-lg text-center animate-pulse">
                        ✅ Gift added to cart! Proceed to checkout to complete your gift order.
                    </div>
                )}

                {/* Product Selection */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Products Grid */}
                    <div>
                        <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            Select a Gift Product
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            {giftProducts.map((product) => (
                                <div
                                    key={product.id}
                                    onClick={() => setSelectedProduct(product)}
                                    className={`cursor-pointer rounded-lg overflow-hidden transition-all ${
                                        selectedProduct?.id === product.id
                                            ? 'ring-4 ring-green-500 scale-105'
                                            : 'hover:scale-105'
                                    } ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
                                >
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-32 object-cover"
                                    />
                                    <div className="p-3">
                                        <h3 className={`font-semibold text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                            {product.name}
                                        </h3>
                                        <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {product.description}
                                        </p>
                                        <p className="text-green-600 font-bold">₹{product.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Gift Form */}
                    <div className={`rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                        <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            Recipient Details
                        </h2>
                        
                        {selectedProduct && (
                            <div className={`mb-4 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
                                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Selected Gift:</p>
                                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    {selectedProduct.name} - ₹{selectedProduct.price}
                                </p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <input
                                type="text"
                                name="recipientName"
                                value={giftForm.recipientName}
                                onChange={handleInputChange}
                                placeholder="Recipient Name *"
                                className={`w-full p-3 rounded-lg border ${
                                    isDark
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300'
                                }`}
                            />

                            <input
                                type="email"
                                name="recipientEmail"
                                value={giftForm.recipientEmail}
                                onChange={handleInputChange}
                                placeholder="Recipient Email *"
                                className={`w-full p-3 rounded-lg border ${
                                    isDark
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300'
                                }`}
                            />

                            <input
                                type="tel"
                                name="recipientPhone"
                                value={giftForm.recipientPhone}
                                onChange={handleInputChange}
                                placeholder="Recipient Phone *"
                                className={`w-full p-3 rounded-lg border ${
                                    isDark
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300'
                                }`}
                            />

                            <textarea
                                name="recipientAddress"
                                value={giftForm.recipientAddress}
                                onChange={handleInputChange}
                                placeholder="Delivery Address (optional)"
                                rows="3"
                                className={`w-full p-3 rounded-lg border ${
                                    isDark
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300'
                                }`}
                            />

                            <textarea
                                name="message"
                                value={giftForm.message}
                                onChange={handleInputChange}
                                placeholder="Personal Gift Message (optional)"
                                rows="3"
                                className={`w-full p-3 rounded-lg border ${
                                    isDark
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300'
                                }`}
                            />

                            <input
                                type="date"
                                name="deliveryDate"
                                value={giftForm.deliveryDate}
                                onChange={handleInputChange}
                                min={new Date().toISOString().split('T')[0]}
                                className={`w-full p-3 rounded-lg border ${
                                    isDark
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300'
                                }`}
                            />

                            <button
                                onClick={handleSendGift}
                                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors"
                            >
                                🎁 Add Gift to Cart
                            </button>

                            <button
                                onClick={() => navigate('/cart')}
                                className={`w-full border-2 border-green-500 hover:bg-green-50 font-semibold py-3 rounded-lg transition-colors ${
                                    isDark ? 'text-green-400 hover:bg-gray-700' : 'text-green-600'
                                }`}
                            >
                                View Cart & Checkout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GiftProduct;
