import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { addItem, updateQuantity } from "../../utils/cartSlice";
import { translations } from "../../utils/translations";

const ProductCard = ({ product }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentLanguage = useSelector((store) => store.language.currentLanguage) || 'english';
    const isDark = useSelector((store) => store.theme.isDark);
    const role = useSelector((store) => store.auth.role);
    const cartItems = useSelector((store) => store.cart.items);
    const t = translations[currentLanguage] || translations.english;

    // Get quantity from cart
    const cartItem = cartItems.find(item => item.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    const handleAdd = () => {
        dispatch(addItem(product));
    };

    const handleIncrement = () => {
        dispatch(updateQuantity({ id: product.id, quantity: quantity + 1 }));
    };

    const handleDecrement = () => {
        if (quantity > 0) {
            dispatch(updateQuantity({ id: product.id, quantity: quantity - 1 }));
        }
    };

    const handleEditProduct = () => {
        navigate(`/admin/dashboard/edit/${product.id}`);
    };

    return (
        <div className={`w-full sm:w-64 p-3 m-2 sm:m-3 rounded-lg shadow-lg hover:shadow-xl transition-shadow ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <img 
                className="w-full h-32 sm:h-40 object-cover rounded-md" 
                src={product.image} 
                alt={product.name}
            />
            <div className="mt-2">
                <h3 className={`font-bold text-sm sm:text-base ${isDark ? 'text-white' : ''}`}>{product.name}</h3>
                <p className={`text-xs mt-1 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{product.description}</p>
                
                {/* Price and Add Button in same row */}
                <div className="flex items-center justify-between mt-3 gap-1 sm:gap-2">
                    <div className="flex items-baseline gap-1 sm:gap-2">
                        <p className="text-base sm:text-lg font-bold text-green-600">₹{product.price}</p>
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{product.unit}</span>
                    </div>
                    
                    {/* Add to Cart Button - Compact */}
                    <div>
                        {quantity === 0 ? (
                            <button 
                                onClick={handleAdd}
                                disabled={!product.in_stock}
                                className={`py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 shadow-md ${
                                    product.in_stock 
                                        ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                {product.in_stock ? 'ADD' : 'OUT'}
                            </button>
                        ) : (
                            <div className="flex items-center bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-1 shadow-md">
                                <button 
                                    onClick={handleDecrement}
                                    className="bg-green-600 text-white w-7 h-7 rounded-md font-bold text-lg hover:bg-green-700 transition-all"
                                >
                                    −
                                </button>
                                <span className="text-white font-bold text-sm px-2">
                                    {quantity}
                                </span>
                                <button 
                                    onClick={handleIncrement}
                                    className="bg-green-600 text-white w-7 h-7 rounded-md font-bold text-lg hover:bg-green-700 transition-all"
                                >
                                    +
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {role === 'admin' && (
                    <button 
                        onClick={handleEditProduct}
                        className="w-full mt-2 bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 transition-colors font-semibold text-xs sm:text-sm"
                    >
                        ✏️ Edit
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
