import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import { setUser } from "../../utils/authSlice";
import { API_ENDPOINTS } from "../../utils/constants";
import { setLanguage } from "../../utils/languageSlice";
import { setTheme } from "../../utils/themeSlice";
import { translations } from "../../utils/translations";

const Signup = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentLanguage = useSelector((store) => store.language.currentLanguage) || 'english';
    const isDark = useSelector((store) => store.theme.isDark);
    const t = translations[currentLanguage] || translations.english;

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [validationWarnings, setValidationWarnings] = useState({
        name: "",
        phone: ""
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Validation for name - only letters and spaces
        if (name === "name") {
            const hasInvalidChars = /[^a-zA-Z\s]/.test(value);
            if (hasInvalidChars) {
                setValidationWarnings({
                    ...validationWarnings,
                    name: "Only letters and spaces are allowed in name"
                });
            } else {
                setValidationWarnings({
                    ...validationWarnings,
                    name: ""
                });
            }
            const sanitizedValue = value.replace(/[^a-zA-Z\s]/g, "");
            setFormData({ ...formData, [name]: sanitizedValue });
            return;
        }

        // Validation for phone - only numbers, max 10 digits
        if (name === "phone") {
            const hasInvalidChars = /[^0-9]/.test(value);
            if (hasInvalidChars) {
                setValidationWarnings({
                    ...validationWarnings,
                    phone: "Only numbers are allowed in phone"
                });
            } else {
                setValidationWarnings({
                    ...validationWarnings,
                    phone: ""
                });
            }
            const sanitizedValue = value.replace(/[^0-9]/g, "").slice(0, 10);
            setFormData({ ...formData, [name]: sanitizedValue });
            return;
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        // Validate password strength
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
          const response = await fetch(API_ENDPOINTS.SIGNUP, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: formData.name,
              email: formData.email,
              password: formData.password,
              phone: formData.phone,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Signup failed");
          }

          // Store token
          localStorage.setItem("token", data.token);

          // Update Redux state with user data
          dispatch(setUser(data.user));

          // Track signup analytics
          try {
            await fetch(API_ENDPOINTS.ANALYTICS_SIGNUP, { method: "POST" });
          } catch (err) {
            // Silently fail if analytics not available
          }

          // Load user's theme and language preferences
          if (data.user.theme) {
            dispatch(setTheme(data.user.theme));
          }
          if (data.user.language) {
            dispatch(setLanguage(data.user.language));
          }

          // Navigate to products page
          navigate("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = formData.name && formData.email && formData.password && 
                        formData.confirmPassword && formData.password === formData.confirmPassword &&
                        formData.password.length >= 6;

    return (
        <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-4`}>
            <div className={`max-w-md w-full p-8 rounded-lg shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <h1 className={`text-3xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {t.signUp || 'Create Account'}
                </h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t.fullName || 'Full Name'} *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            pattern="[A-Za-z\s]+"
                            title="Name should only contain letters and spaces"
                            placeholder="Enter your full name"
                            className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                            required
                        />
                        {validationWarnings.name && (
                            <p className="text-orange-500 text-xs mt-1 flex items-center gap-1">
                                <span>⚠️</span>
                                <span>{validationWarnings.name}</span>
                            </p>
                        )}
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t.emailAddress || 'Email Address'} *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email"
                            className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                            required
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t.phoneNumber || 'Phone Number'}
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            pattern="[0-9]{10}"
                            maxLength="10"
                            placeholder="Enter 10-digit phone number"
                            className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                        />
                        {validationWarnings.phone && (
                            <p className="text-orange-500 text-xs mt-1 flex items-center gap-1">
                                <span>⚠️</span>
                                <span>{validationWarnings.phone}</span>
                            </p>
                        )}
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t.password || 'Password'} *
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Enter password (min 6 characters)"
                            minLength="6"
                            className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                            required
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t.confirmPassword || 'Confirm Password'} *
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Confirm your password"
                            className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!isFormValid || loading}
                        className={`w-full py-3 rounded-md font-semibold transition-colors ${
                            isFormValid && !loading
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        {loading ? (t.processing || 'Creating Account...') : (t.signUp || 'Sign Up')}
                    </button>
                </form>

                <div className={`mt-6 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t.alreadyHaveAccount || 'Already have an account?'}{' '}
                    <Link to="/login" className="text-green-500 hover:text-green-600 font-semibold">
                        {t.login || 'Login'}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
