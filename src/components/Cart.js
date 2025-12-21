import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { clearCart, removeItem, updateQuantity } from "../../utils/cartSlice";
import { translations } from "../../utils/translations";

const Cart = () => {
  const cartItems = useSelector((store) => store.cart.items);
  const currentLanguage =
    useSelector((store) => store.language.currentLanguage) || "english";
  const isDark = useSelector((store) => store.theme.isDark);
  const isAuthenticated = useSelector((store) => store.auth.isAuthenticated);
  const t = translations[currentLanguage] || translations.english;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRemoveItem = (id) => {
    dispatch(removeItem(id));
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    dispatch(updateQuantity({ id, quantity: newQuantity }));
  };

  const handleClearCart = () => {
    if (window.confirm(t.clearCartConfirm)) {
      dispatch(clearCart());
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Store intended destination and navigate to login
      localStorage.setItem("returnUrl", "/checkout");
      alert(t.loginToCheckout || "Please login to proceed with checkout");
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  // Calculate total
  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const deliveryFee = totalAmount > 0 ? (totalAmount > 500 ? 0 : 30) : 0;
  const grandTotal = totalAmount + deliveryFee;

  if (cartItems.length === 0) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center p-4 ${
          isDark ? "bg-gray-900" : ""
        }`}
      >
        <div className="text-center">
          <h1
            className={`text-3xl font-bold mb-4 ${
              isDark ? "text-white" : "text-gray-800"
            }`}
          >
            {t.cartIsEmpty}
          </h1>
          <p className={`mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {t.addItemsToStart}
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            {t.startShopping}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-4 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <h1
            className={`text-2xl sm:text-3xl font-bold ${
              isDark ? "text-white" : ""
            }`}
          >
            {t.shoppingCart} ({cartItems.length} {t.items})
          </h1>
          <button
            onClick={handleClearCart}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base w-full sm:w-auto"
          >
            {t.clearCart}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className={`p-3 sm:p-4 rounded-lg shadow-md ${
                  isDark ? "bg-gray-800" : "bg-white"
                }`}
              >
                {/* Mobile Layout - Vertical */}
                <div className="flex flex-col sm:hidden gap-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h3
                        className={`font-bold text-base ${
                          isDark ? "text-white" : ""
                        }`}
                      >
                        {item.name}
                      </h3>
                      <p
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {item.description}
                      </p>
                      <p
                        className={`text-xs ${
                          isDark ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        {item.unit}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                        className={`px-3 py-1 rounded-md ${
                          isDark
                            ? "bg-gray-700 hover:bg-gray-600"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                      >
                        -
                      </button>
                      <span
                        className={`font-bold text-base w-8 text-center ${
                          isDark ? "text-white" : ""
                        }`}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                        className={`px-3 py-1 rounded-md ${
                          isDark
                            ? "bg-gray-700 hover:bg-gray-600"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-green-600 font-bold text-sm mb-1">
                        ₹{item.price}
                      </p>
                      <p
                        className={`font-bold text-base ${
                          isDark ? "text-white" : ""
                        }`}
                      >
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-500 text-sm hover:text-red-700 text-center py-1"
                  >
                    {t.remove}
                  </button>
                </div>

                {/* Desktop Layout - Horizontal */}
                <div className="hidden sm:flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3
                      className={`font-bold text-lg ${
                        isDark ? "text-white" : ""
                      }`}
                    >
                      {item.name}
                    </h3>
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {item.description}
                    </p>
                    <p
                      className={`text-sm ${
                        isDark ? "text-gray-500" : "text-gray-500"
                      }`}
                    >
                      {item.unit}
                    </p>
                    <p className="text-green-600 font-bold mt-2">
                      ₹{item.price}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity - 1)
                      }
                      className={`px-3 py-1 rounded-md ${
                        isDark
                          ? "bg-gray-700 hover:bg-gray-600"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      -
                    </button>
                    <span
                      className={`font-bold text-lg w-8 text-center ${
                        isDark ? "text-white" : ""
                      }`}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                      className={`px-3 py-1 rounded-md ${
                        isDark
                          ? "bg-gray-700 hover:bg-gray-600"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold text-lg ${
                        isDark ? "text-white" : ""
                      }`}
                    >
                      ₹{item.price * item.quantity}
                    </p>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 text-sm hover:text-red-700 mt-2"
                    >
                      {t.remove}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
              <h2 className="text-xl font-bold mb-4">{t.orderSummary}</h2>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.subtotal}:</span>
                  <span className="font-semibold">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t.deliveryFee}:</span>
                  <span className="font-semibold">
                    {deliveryFee === 0 ? (
                      <span className="text-green-600">{t.free}</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>
                {totalAmount < 500 && totalAmount > 0 && (
                  <p className="text-sm text-orange-600">
                    {t.addMoreForFreeDelivery} ₹{500 - totalAmount}{" "}
                    {t.moreForFreeDelivery}
                  </p>
                )}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t.total}:</span>
                    <span className="text-green-600">₹{grandTotal}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition-colors"
              >
                {t.proceedToCheckout}
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full mt-3 bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors"
              >
                {t.continueShopping}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
