import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { createOrder } from "../../utils/api";
import { clearCart } from "../../utils/cartSlice";
import { API_ENDPOINTS } from "../../utils/constants";
import { translations } from "../../utils/translations";

const Checkout = () => {
    const cartItems = useSelector((store) => store.cart.items);
    const currentLanguage = useSelector((store) => store.language.currentLanguage) || 'english';
    const isDark = useSelector((store) => store.theme.isDark);
    const isAuthenticated = useSelector((store) => store.auth.isAuthenticated);
    const t = translations[currentLanguage] || translations.english;
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            setTimeout(() => {
                alert("Please login to proceed with checkout");
            }, 0);
        }
    }, [isAuthenticated, navigate]);

    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        pincode: "",
        label: "Home"
    });

    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [isProcessing, setIsProcessing] = useState(false);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [validationWarnings, setValidationWarnings] = useState({
        name: "",
        city: "",
        phone: "",
        pincode: ""
    });

    // Fetch saved addresses
    useEffect(() => {
        if (isAuthenticated) {
            fetchAddresses();
        }
    }, [isAuthenticated]);

    const fetchAddresses = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoadingAddresses(false);
                return;
            }
            
            const response = await fetch(API_ENDPOINTS.ADDRESSES, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                // If endpoint doesn't exist yet (table not created), silently fail
                console.log('Address feature not available yet - please run database migration');
                setLoadingAddresses(false);
                return;
            }
            
            const data = await response.json();
            if (data.success) {
                setSavedAddresses(data.addresses || []);
                // Auto-select default address
                const defaultAddr = data.addresses?.find(addr => addr.is_default);
                if (defaultAddr) {
                    setSelectedAddressId(defaultAddr.id);
                } else if (data.addresses?.length > 0) {
                    setSelectedAddressId(data.addresses[0].id);
                }
            }
        } catch (error) {
            // Silently fail if address feature not implemented yet
            console.log('Address management not available - using manual entry');
        } finally {
            setLoadingAddresses(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Validation for name and city - only letters and spaces
        if (name === "name" || name === "city") {
            // Check if input contains invalid characters
            const hasInvalidChars = /[^a-zA-Z\s]/.test(value);
            if (hasInvalidChars) {
                setValidationWarnings({
                    ...validationWarnings,
                    [name]: `Only letters and spaces are allowed in ${name === "name" ? "name" : "city name"}`
                });
            } else {
                setValidationWarnings({
                    ...validationWarnings,
                    [name]: ""
                });
            }
            
            // Remove any numbers or special characters except spaces
            const sanitizedValue = value.replace(/[^a-zA-Z\s]/g, "");
            setFormData({
                ...formData,
                [name]: sanitizedValue
            });
            return;
        }
        
        // Validation for phone - only numbers, max 10 digits
        if (name === "phone") {
            const hasInvalidChars = /[^0-9]/.test(value);
            if (hasInvalidChars) {
                setValidationWarnings({
                    ...validationWarnings,
                    phone: "Only numbers are allowed in phone number"
                });
            } else {
                setValidationWarnings({
                    ...validationWarnings,
                    phone: ""
                });
            }
            
            const sanitizedValue = value.replace(/[^0-9]/g, "").slice(0, 10);
            setFormData({
                ...formData,
                [name]: sanitizedValue
            });
            return;
        }
        
        // Validation for pincode - only numbers
        if (name === "pincode") {
            // Check if input contains non-numeric characters
            const hasInvalidChars = /[^0-9]/.test(value);
            if (hasInvalidChars) {
                setValidationWarnings({
                    ...validationWarnings,
                    pincode: "Only numbers are allowed in pincode"
                });
            } else {
                setValidationWarnings({
                    ...validationWarnings,
                    pincode: ""
                });
            }
            
            const sanitizedValue = value.replace(/[^0-9]/g, "");
            setFormData({
                ...formData,
                [name]: sanitizedValue
            });
            return;
        }
        
        // For other fields, no special validation
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const saveAddress = async () => {
        // Validate form
        if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
            alert('Please fill all address fields');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const url = isEditingAddress 
                ? `${API_ENDPOINTS.ADDRESSES}/${editingAddressId}`
                : API_ENDPOINTS.ADDRESSES;
            
            const method = isEditingAddress ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    label: formData.label,
                    name: formData.name,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    pincode: formData.pincode,
                    is_default: savedAddresses.length === 0 // First address is default
                })
            });

            const data = await response.json();
            if (data.success) {
                await fetchAddresses();
                setShowAddressForm(false);
                setIsEditingAddress(false);
                setEditingAddressId(null);
                // Reset form
                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    address: "",
                    city: "",
                    pincode: "",
                    label: "Home"
                });
                alert(isEditingAddress ? 'Address updated!' : 'Address saved!');
            }
        } catch (error) {
            console.error('Error saving address:', error);
            alert('Failed to save address');
        }
    };

    const deleteAddress = async (addressId) => {
        if (!confirm('Are you sure you want to delete this address?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_ENDPOINTS.ADDRESSES}/${addressId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                await fetchAddresses();
                if (selectedAddressId === addressId) {
                    setSelectedAddressId(null);
                }
                alert('Address deleted');
            }
        } catch (error) {
            console.error('Error deleting address:', error);
            alert('Failed to delete address');
        }
    };

    const setDefaultAddress = async (addressId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_ENDPOINTS.ADDRESSES}/${addressId}/default`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                await fetchAddresses();
            }
        } catch (error) {
            console.error('Error setting default address:', error);
        }
    };

    const editAddress = (address) => {
        setFormData({
            name: address.name,
            email: formData.email,
            phone: address.phone,
            address: address.address,
            city: address.city,
            pincode: address.pincode,
            label: address.label
        });
        setIsEditingAddress(true);
        setEditingAddressId(address.id);
        setShowAddressForm(true);
    };

    // Calculate totals
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryFee = subtotal > 500 ? 0 : 30;
    const total = subtotal + deliveryFee;

    const handleCashOnDelivery = async () => {
        // Get selected address or use form data
        let customerInfo;
        if (selectedAddressId) {
            const selectedAddr = savedAddresses.find(addr => addr.id === selectedAddressId);
            if (!selectedAddr) {
                alert('Please select a delivery address');
                return;
            }
            customerInfo = {
                name: selectedAddr.name,
                email: formData.email,
                phone: selectedAddr.phone,
                address: selectedAddr.address,
                city: selectedAddr.city,
                pincode: selectedAddr.pincode
            };
        } else {
            // Validate form
            if (!formData.name || !formData.email || !formData.phone || !formData.address) {
                alert(t.fillAllFields);
                return;
            }
            customerInfo = formData;
        }

        setIsProcessing(true);

        try {
            // Create order in backend
            const orderData = {
                items: cartItems,
                customerInfo: customerInfo,
                paymentMethod: 'Cash on Delivery',
                totalAmount: total
            };

            const response = await createOrder(orderData);
            
            // Clear cart after successful order
            dispatch(clearCart());
            
            // Navigate to success page
            navigate('/order-success', { 
                state: { 
                    orderId: response.order.orderId,
                    amount: total,
                    paymentMethod: 'Cash on Delivery'
                } 
            });
        } catch (error) {
            alert(error.message || 'Failed to place order. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleRazorpayPayment = async () => {
        // Get selected address or use form data
        let customerInfo;
        if (selectedAddressId) {
            const selectedAddr = savedAddresses.find(addr => addr.id === selectedAddressId);
            if (!selectedAddr) {
                alert('Please select a delivery address');
                return;
            }
            customerInfo = {
                name: selectedAddr.name,
                email: formData.email,
                phone: selectedAddr.phone,
                address: selectedAddr.address,
                city: selectedAddr.city,
                pincode: selectedAddr.pincode
            };
        } else {
            // Validate form
            if (!formData.name || !formData.email || !formData.phone || !formData.address) {
                alert(t.fillAllFields);
                return;
            }
            customerInfo = formData;
        }

        setIsProcessing(true);

        const isScriptLoaded = await loadRazorpayScript();

        if (!isScriptLoaded) {
            alert("Razorpay SDK failed to load. Please check your internet connection.");
            setIsProcessing(false);
            return;
        }

        // Razorpay options
        const options = {
            key: "rzp_test_YOUR_KEY_HERE", // Replace with your Razorpay key
            amount: total * 100, // Amount in paise
            currency: "INR",
            name: "BiharEssence",
            description: "Grocery Order Payment",
            image: "https://example.com/your_logo.png", // Your logo
            handler: function (response) {
                // Payment successful
                alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
                
                // Clear cart after successful payment
                dispatch(clearCart());
                
                // Navigate to success page or home
                navigate('/order-success', { 
                    state: { 
                        paymentId: response.razorpay_payment_id,
                        amount: total 
                    } 
                });
            },
            prefill: {
                name: customerInfo.name,
                email: customerInfo.email,
                contact: customerInfo.phone,
            },
            theme: {
                color: "#22c55e",
            },
            modal: {
                ondismiss: function() {
                    setIsProcessing(false);
                }
            }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
        setIsProcessing(false);
    };

    if (cartItems.length === 0) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : ''}`}>
                <div className="text-center">
                    <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : ''}`}>{t.cartIsEmpty}</h2>
                    <button 
                        onClick={() => navigate('/')}
                        className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
                    >
                        {t.continueShopping}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen p-3 sm:p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-6xl mx-auto">
                <h1 className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 ${isDark ? 'text-white' : ''}`}>{t.checkout}</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Delivery Details Form */}
                    <div className={`lg:col-span-2 p-4 sm:p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        <h2 className={`text-lg sm:text-xl font-bold mb-4 ${isDark ? 'text-white' : ''}`}>{t.deliveryInformation}</h2>
                        
                        {/* Saved Addresses */}
                        {!loadingAddresses && savedAddresses.length > 0 && !showAddressForm && (
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className={`font-semibold ${isDark ? 'text-white' : ''}`}>Select Delivery Address</h3>
                                    <button
                                        onClick={() => setShowAddressForm(true)}
                                        className="text-green-500 hover:text-green-600 text-sm font-medium"
                                    >
                                        + Add New Address
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {savedAddresses.map((addr) => (
                                        <div
                                            key={addr.id}
                                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                                selectedAddressId === addr.id
                                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-green-300'
                                            }`}
                                            onClick={() => setSelectedAddressId(addr.id)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex gap-3 flex-1">
                                                    <input
                                                        type="radio"
                                                        checked={selectedAddressId === addr.id}
                                                        onChange={() => setSelectedAddressId(addr.id)}
                                                        className="mt-1"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`font-semibold ${isDark ? 'text-white' : ''}`}>{addr.name}</span>
                                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{addr.label}</span>
                                                            {addr.is_default && (
                                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Default</span>
                                                            )}
                                                        </div>
                                                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{addr.address}</p>
                                                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{addr.city}, {addr.pincode}</p>
                                                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Phone: {addr.phone}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            editAddress(addr);
                                                        }}
                                                        className="text-blue-500 hover:text-blue-600 text-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteAddress(addr.id);
                                                        }}
                                                        className="text-red-500 hover:text-red-600 text-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                    {!addr.is_default && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDefaultAddress(addr.id);
                                                            }}
                                                            className="text-green-500 hover:text-green-600 text-sm"
                                                        >
                                                            Set Default
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Address Form (for new users or adding new address) */}
                        {(showAddressForm || savedAddresses.length === 0) && (
                            <>
                                {savedAddresses.length > 0 && (
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className={`font-semibold ${isDark ? 'text-white' : ''}`}>
                                            {isEditingAddress ? 'Edit Address' : 'Add New Address'}
                                        </h3>
                                        <button
                                            onClick={() => {
                                                setShowAddressForm(false);
                                                setIsEditingAddress(false);
                                                setEditingAddressId(null);
                                            }}
                                            className="text-gray-500 hover:text-gray-700 text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                                <form className="space-y-4">
                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : ''}`}>Address Label</label>
                                        <select
                                            name="label"
                                            value={formData.label}
                                            onChange={handleInputChange}
                                            className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                                        >
                                            <option value="Home">Home</option>
                                            <option value="Office">Office</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : ''}`}>{t.fullName} *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            pattern="[A-Za-z\s]+"
                                            title="Name should only contain letters and spaces"
                                            placeholder="Enter your full name"
                                            className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                                            required
                                        />
                                        {validationWarnings.name && (
                                            <p className="text-orange-500 text-xs mt-1 flex items-center gap-1">
                                                <span>⚠️</span>
                                                <span>{validationWarnings.name}</span>
                                            </p>
                                        )}
                                    </div>

                                    {savedAddresses.length === 0 && (
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : ''}`}>{t.emailAddress} *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                                                required
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : ''}`}>{t.phoneNumber} *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            pattern="[0-9]{10}"
                                            maxLength="10"
                                            title="Phone number should be exactly 10 digits"
                                            placeholder="Enter 10-digit phone number"
                                            className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                                            required
                                        />
                                        {validationWarnings.phone && (
                                            <p className="text-orange-500 text-xs mt-1 flex items-center gap-1">
                                                <span>⚠️</span>
                                                <span>{validationWarnings.phone}</span>
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : ''}`}>{t.fullAddress} *</label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            rows="3"
                                            className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : ''}`}>{t.city} *</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                pattern="[A-Za-z\s]+"
                                                title="City name should only contain letters and spaces"
                                                placeholder="Enter your city"
                                                className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                                                required
                                            />
                                            {validationWarnings.city && (
                                                <p className="text-orange-500 text-xs mt-1 flex items-center gap-1">
                                                    <span>⚠️</span>
                                                    <span>{validationWarnings.city}</span>
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : ''}`}>{t.pincode} *</label>
                                            <input
                                                type="text"
                                                name="pincode"
                                                value={formData.pincode}
                                                onChange={handleInputChange}
                                                pattern="[0-9]{6}"
                                                maxLength="6"
                                                title="Pincode should be exactly 6 digits"
                                                placeholder="Enter 6-digit pincode"
                                                className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                                                required
                                            />
                                            {validationWarnings.pincode && (
                                                <p className="text-orange-500 text-xs mt-1 flex items-center gap-1">
                                                    <span>⚠️</span>
                                                    <span>{validationWarnings.pincode}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={saveAddress}
                                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 font-semibold"
                                    >
                                        {isEditingAddress ? 'Update Address' : 'Save Address'}
                                    </button>
                                </form>
                            </>
                        )}

                        <div className="mt-6">
                            <h3 className={`font-bold text-base sm:text-lg mb-3 ${isDark ? 'text-white' : ''}`}>{t.orderItems}</h3>
                            <div className="space-y-3">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex items-center gap-2 sm:gap-3 border-b pb-3">
                                        <img src={item.image} alt={item.name} className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded" />
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-semibold text-sm sm:text-base ${isDark ? 'text-white' : ''}`}>{item.name}</p>
                                            <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t.quantity}: {item.quantity} × ₹{item.price}</p>
                                        </div>
                                        <p className={`font-bold text-sm sm:text-base ${isDark ? 'text-white' : ''}`}>₹{item.price * item.quantity}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary & Payment */}
                    <div className="lg:col-span-1">
                        <div className={`p-4 sm:p-6 rounded-lg shadow-md lg:sticky lg:top-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                            <h2 className={`text-lg sm:text-xl font-bold mb-4 ${isDark ? 'text-white' : ''}`}>{t.orderSummary}</h2>
                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between">
                                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t.subtotal}:</span>
                                    <span className={`font-semibold ${isDark ? 'text-white' : ''}`}>₹{subtotal}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t.deliveryFee}:</span>
                                    <span className={`font-semibold ${isDark ? 'text-white' : ''}`}>
                                        {deliveryFee === 0 ? 
                                            <span className="text-green-600">{t.free}</span> : 
                                            `₹${deliveryFee}`
                                        }
                                    </span>
                                </div>
                                <div className="border-t pt-3">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span className={isDark ? 'text-white' : ''}>{t.total}:</span>
                                        <span className="text-green-600">₹{total}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method Selection */}
                            <div className="mt-6 border-t pt-4">
                                <h3 className={`font-bold text-lg mb-3 ${isDark ? 'text-white' : ''}`}>{t.paymentMethod}</h3>
                                <div className="space-y-3">
                                    <label className={`flex items-center p-3 border rounded-lg ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="cod"
                                            checked={paymentMethod === "cod"}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="mr-3"
                                        />
                                        <div className="flex-1">
                                            <p className={`font-semibold ${isDark ? 'text-white' : ''}`}>{t.cashOnDelivery}</p>
                                        </div>
                                    </label>
                                    
                                    <label className={`flex items-center p-3 border rounded-lg ${isDark ? 'border-gray-600 hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="razorpay"
                                            checked={paymentMethod === "razorpay"}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="mr-3"
                                        />
                                        <div className="flex-1">
                                            <p className={`font-semibold ${isDark ? 'text-white' : ''}`}>{t.payOnline}</p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <button
                                onClick={paymentMethod === "cod" ? handleCashOnDelivery : handleRazorpayPayment}
                                disabled={isProcessing}
                                className="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? t.processing : paymentMethod === "cod" ? t.placeOrder : t.payNow}
                            </button>

                            <button
                                onClick={() => navigate('/cart')}
                                className={`w-full mt-3 py-3 rounded-lg font-bold transition-colors ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                            >
                                {t.cart}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
