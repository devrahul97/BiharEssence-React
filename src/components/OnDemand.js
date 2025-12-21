import { useState } from "react";
import { useSelector } from "react-redux";
import { API_ENDPOINTS } from "../../utils/constants";
import { translations } from "../../utils/translations";

const OnDemand = () => {
    const isDark = useSelector((store) => store.theme.isDark);
    const currentLanguage = useSelector((store) => store.language.currentLanguage);
    const { user } = useSelector((store) => store.auth);
    const t = translations[currentLanguage] || translations.english;

    const [formData, setFormData] = useState({
        productName: "",
        productDescription: "",
        mobileNumber: user?.phone || "",
        address: "",
        estimatedPrice: "",
        paymentPreference: "later",
        additionalRequirements: ""
    });

    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmitRequest = async (e) => {
        e.preventDefault();
        
        if (!formData.productName || !formData.mobileNumber || !formData.address) {
            setErrorMessage("Please fill in all required fields!");
            return;
        }

        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_ENDPOINTS.ORDERS}/on-demand-request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    customerName: user?.name,
                    customerEmail: user?.email
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage("✅ Request submitted successfully! Our admin will contact you soon.");
                // Reset form
                setFormData({
                    productName: "",
                    productDescription: "",
                    mobileNumber: user?.phone || "",
                    address: "",
                    estimatedPrice: "",
                    paymentPreference: "later",
                    additionalRequirements: ""
                });
            } else {
                setErrorMessage(data.error || "Failed to submit request. Please try again.");
            }
        } catch (error) {
            setErrorMessage("Network error. Please check your connection and try again.");
            console.error("On-demand request error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen p-4 sm:p-6 md:p-8 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
            <div className="max-w-6xl mx-auto">
                <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    🚀 {t.onDemand || "On Demand"} Products
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                    {/* Information Section */}
                    <div className={`rounded-lg shadow-lg p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                            Request Custom Products
                        </h2>
                        <p className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Can't find what you're looking for? Request any product from Bihar and we'll arrange it for you!
                        </p>
                        
                        <div className="space-y-4">
                            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
                                <div className="flex items-start gap-3">
                                    <div className="text-3xl">📝</div>
                                    <div>
                                        <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                            Fill the Request
                                        </h3>
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Tell us what product you need and your contact details
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
                                <div className="flex items-start gap-3">
                                    <div className="text-3xl">💰</div>
                                    <div>
                                        <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                            Payment Option
                                        </h3>
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Choose to pay in advance or upon delivery
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
                                <div className="flex items-start gap-3">
                                    <div className="text-3xl">📞</div>
                                    <div>
                                        <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                            Admin Contact
                                        </h3>
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Our admin will call you to confirm and discuss details
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
                                <div className="flex items-start gap-3">
                                    <div className="text-3xl">🚚</div>
                                    <div>
                                        <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                            Fast Delivery
                                        </h3>
                                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Get your custom order delivered to your doorstep
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Request Form */}
                    <div className={`rounded-lg shadow-lg p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        <h2 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            Submit Product Request
                        </h2>

                        {successMessage && (
                            <div className="mb-4 p-4 bg-green-500 text-white rounded-lg">
                                {successMessage}
                            </div>
                        )}

                        {errorMessage && (
                            <div className="mb-4 p-4 bg-red-500 text-white rounded-lg">
                                {errorMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmitRequest} className="space-y-4">
                            <div>
                                <label className={`block mb-2 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    name="productName"
                                    value={formData.productName}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Fresh Bihar Mango, Madhubani Painting"
                                    className={`w-full p-3 rounded-lg border ${
                                        isDark
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300'
                                    }`}
                                    required
                                />
                            </div>

                            <div>
                                <label className={`block mb-2 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Product Description
                                </label>
                                <textarea
                                    name="productDescription"
                                    value={formData.productDescription}
                                    onChange={handleInputChange}
                                    placeholder="Describe the product in detail..."
                                    rows="3"
                                    className={`w-full p-3 rounded-lg border ${
                                        isDark
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300'
                                    }`}
                                />
                            </div>

                            <div>
                                <label className={`block mb-2 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Mobile Number *
                                </label>
                                <input
                                    type="tel"
                                    name="mobileNumber"
                                    value={formData.mobileNumber}
                                    onChange={handleInputChange}
                                    placeholder="+91 XXXXXXXXXX"
                                    className={`w-full p-3 rounded-lg border ${
                                        isDark
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300'
                                    }`}
                                    required
                                />
                            </div>

                            <div>
                                <label className={`block mb-2 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Delivery Address *
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="Full delivery address with pincode"
                                    rows="3"
                                    className={`w-full p-3 rounded-lg border ${
                                        isDark
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300'
                                    }`}
                                    required
                                />
                            </div>

                            <div>
                                <label className={`block mb-2 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Estimated Price (₹)
                                </label>
                                <input
                                    type="number"
                                    name="estimatedPrice"
                                    value={formData.estimatedPrice}
                                    onChange={handleInputChange}
                                    placeholder="Your budget estimate"
                                    className={`w-full p-3 rounded-lg border ${
                                        isDark
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300'
                                    }`}
                                />
                            </div>

                            <div>
                                <label className={`block mb-2 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Payment Preference *
                                </label>
                                <select
                                    name="paymentPreference"
                                    value={formData.paymentPreference}
                                    onChange={handleInputChange}
                                    className={`w-full p-3 rounded-lg border ${
                                        isDark
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-white border-gray-300'
                                    }`}
                                    required
                                >
                                    <option value="later">Pay on Delivery / Later</option>
                                    <option value="advance">Pay in Advance</option>
                                    <option value="partial">Partial Advance Payment</option>
                                </select>
                            </div>

                            <div>
                                <label className={`block mb-2 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Additional Requirements
                                </label>
                                <textarea
                                    name="additionalRequirements"
                                    value={formData.additionalRequirements}
                                    onChange={handleInputChange}
                                    placeholder="Any special requirements or preferences..."
                                    rows="3"
                                    className={`w-full p-3 rounded-lg border ${
                                        isDark
                                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                            : 'bg-white border-gray-300'
                                    }`}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
                                    loading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700'
                                }`}
                            >
                                {loading ? "Submitting..." : "🚀 Submit Request"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnDemand;