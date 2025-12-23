// Temporarily disabled mobile login - will be re-enabled later
// import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import { setUser } from "../../utils/authSlice";
import { API_ENDPOINTS } from "../../utils/constants";
// import { auth } from "../../utils/firebaseConfig";
import { setLanguage } from "../../utils/languageSlice";
import { setTheme } from "../../utils/themeSlice";
import { translations } from "../../utils/translations";
import Snackbar from "./Snackbar";

const Login = ({ adminRoute = false }) => {
  // Temporarily disabled mobile login
  // const [loginMethod, setLoginMethod] = useState("email"); // "email" or "mobile"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [mobile, setMobile] = useState("");
  // const [otp, setOtp] = useState("");
  // const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // const [otpTimer, setOtpTimer] = useState(0);
  // const [confirmationResult, setConfirmationResult] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get current language
  const currentLanguage =
    useSelector((store) => store.language.currentLanguage) || "english";
  const isDark = useSelector((store) => store.theme.isDark);
  const t = translations[currentLanguage] || translations.english;

  // Handle language change
  const handleLanguageChange = (e) => {
    dispatch(setLanguage(e.target.value));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Trim inputs to remove extra spaces
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password: trimmedPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store token
      localStorage.setItem("token", data.token);

      // Update Redux state with user data
      dispatch(setUser(data.user));

      // Show welcome snackbar with user's name
      const userName = data.user.name || data.user.email.split("@")[0];
      setSnackbarMessage(`⭐ ${userName}, you're logged in!`);
      setShowSnackbar(true);
      setLoginSuccess(true);

      // Track login analytics
      try {
        await fetch(API_ENDPOINTS.ANALYTICS_LOGIN, { method: "POST" });
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

      // Navigate after showing snackbar
      setTimeout(() => {
        // Check for return URL
        const returnUrl = localStorage.getItem("returnUrl");
        if (returnUrl) {
          localStorage.removeItem("returnUrl");
          navigate(returnUrl);
        } else {
          // Navigate based on role
          if (data.user.role === "admin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/");
          }
        }
      }, 1200); // Quick redirect - just enough to see the message
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Temporarily disabled mobile login features
  /*
    // Setup reCAPTCHA verifier
    useEffect(() => {
        if (loginMethod === "mobile" && !window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                    'size': 'invisible',
                    'callback': () => {
                        // reCAPTCHA solved, allow signInWithPhoneNumber
                    },
                    'expired-callback': () => {
                        setError("reCAPTCHA expired. Please try again.");
                    }
                });
            } catch (error) {
                console.error("reCAPTCHA error:", error);
            }
        }
    }, [loginMethod]);

    const handleSendOTP = async () => {
        setError("");
        
        // Validate mobile number
        if (!mobile || mobile.length !== 10) {
            setError("Please enter a valid 10-digit mobile number");
            return;
        }

        setLoading(true);

        try {
            // Check if Firebase is configured
            const isFirebaseConfigured = auth.app.options.apiKey !== "YOUR_API_KEY";
            
            if (isFirebaseConfigured) {
                // Try Firebase Phone Authentication
                const phoneNumber = `+91${mobile}`;
                const appVerifier = window.recaptchaVerifier;
                const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
                
                setConfirmationResult(confirmation);
                setOtpSent(true);
                setOtpTimer(30);
                
                // Start countdown timer
                const interval = setInterval(() => {
                    setOtpTimer(prev => {
                        if (prev <= 1) {
                            clearInterval(interval);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } else {
                throw new Error("Firebase not configured");
            }

        } catch (err) {
            // Fallback to Demo Mode for office laptops or unconfigured Firebase
            console.log("⚠️ Using Demo Mode (Firebase unavailable)");
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setOtpSent(true);
            setOtpTimer(30);
            
            // Generate demo OTP
            const demoOTP = "123456";
            console.log("📱 Demo OTP:", demoOTP);
            alert(`Demo Mode Active\n\nOTP: ${demoOTP}\n\nNote: Firebase Phone Auth is not configured or blocked.\nUse this OTP to test the feature.`);
            
            // Set demo confirmation result
            setConfirmationResult({ isDemoMode: true, demoOTP });
            
            // Start countdown timer
            const demoInterval = setInterval(() => {
                setOtpTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(demoInterval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError("");

        if (!otp || otp.length !== 6) {
            setError("Please enter a valid 6-digit OTP");
            return;
        }

        if (!confirmationResult) {
            setError("Please request OTP first");
            return;
        }

        setLoading(true);

        try {
            // Check if using demo mode
            if (confirmationResult.isDemoMode) {
                // Demo mode verification
                if (otp === confirmationResult.demoOTP) {
                    // Create demo user data
                    const userData = {
                        user: {
                            id: `demo_${Date.now()}`,
                            name: "Mobile User",
                            email: `${mobile}@biharessence.com`,
                            mobile: mobile,
                            role: adminRoute ? 'admin' : 'customer'
                        },
                        token: `demo_token_${Date.now()}`
                    };

                    localStorage.setItem('token', userData.token);
                    dispatch(setUser(userData.user));

                    const returnUrl = localStorage.getItem('returnUrl');
                    if (returnUrl) {
                        localStorage.removeItem('returnUrl');
                        navigate(returnUrl);
                    } else {
                        navigate(userData.user.role === 'admin' ? '/admin/dashboard' : '/');
                    }
                } else {
                    throw new Error("Invalid demo OTP");
                }
            } else {
                // Firebase verification
                const result = await confirmationResult.confirm(otp);
                const firebaseUser = result.user;
                
                // Get Firebase ID token
                const idToken = await firebaseUser.getIdToken();
                
                // Create user data
                const userData = {
                    user: {
                        id: firebaseUser.uid,
                        name: firebaseUser.displayName || "Mobile User",
                        email: firebaseUser.email || `${mobile}@biharessence.com`,
                        mobile: mobile,
                        role: adminRoute ? 'admin' : 'customer'
                    },
                    token: idToken
                };

                // Store token
                localStorage.setItem('token', idToken);

                // Update Redux state
                dispatch(setUser(userData.user));

                // Check for return URL
                const returnUrl = localStorage.getItem('returnUrl');
                if (returnUrl) {
                    localStorage.removeItem('returnUrl');
                    navigate(returnUrl);
                } else {
                    // Navigate based on role
                    if (userData.user.role === 'admin') {
                        navigate('/admin/dashboard');
                    } else {
                        navigate('/');
                    }
                }
            }
        } catch (err) {
            console.error("OTP verification error:", err);
            if (err.code === 'auth/invalid-verification-code' || err.message === "Invalid demo OTP") {
                setError("Invalid OTP. Please try again.");
            } else if (err.code === 'auth/code-expired') {
                setError("OTP has expired. Please request a new one.");
            } else {
                setError("Verification failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };
    */

  // Check if form is valid
  const isFormValid = email.trim() !== "" && password.trim() !== "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        {loginSuccess ? (
          // Success state - show while waiting to navigate
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Login Successful!
            </h2>
            <p className="text-gray-600">Redirecting you now...</p>
          </div>
        ) : (
          <>
            {/* Language Selector */}
            <div className="flex justify-end mb-4">
              <select
                value={currentLanguage}
                onChange={handleLanguageChange}
                className="px-3 py-1 rounded cursor-pointer bg-gray-200 text-black hover:bg-gray-300"
                title={t.language}
              >
                <option value="english">English</option>
                <option value="hindi">हिंदी</option>
              </select>
            </div>

            <h1 className="text-3xl font-bold text-center mb-6">
              {adminRoute ? t.adminLogin : t.customerLogin}
            </h1>

            {/* Temporarily disabled mobile login toggle
                <div className="flex gap-2 mb-6">
                    <button
                        type="button"
                        onClick={() => {
                            setLoginMethod("email");
                            setError("");
                            setOtpSent(false);
                        }}
                        className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                            loginMethod === "email"
                                ? "bg-green-500 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                        📧 Email Login
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setLoginMethod("mobile");
                            setError("");
                        }}
                        className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                            loginMethod === "mobile"
                                ? "bg-green-500 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                        📱 Mobile OTP
                    </button>
                </div>
                End of temporarily disabled mobile login toggle */}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* Email Login Form - Active */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t.email}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t.password}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!isFormValid || loading}
                className={`w-full py-3 rounded-lg font-bold transition-colors ${
                  isFormValid && !loading
                    ? "bg-green-500 text-white hover:bg-green-600 cursor-pointer"
                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                }`}
              >
                {loading ? t.processing || "Logging in..." : t.login}
              </button>
            </form>

            {/* Temporarily disabled mobile OTP login UI
                {loginMethod === "mobile" ? (
                    <div className="space-y-4">
                        Mobile Number Input
                        {!otpSent ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Mobile Number</label>
                                    <div className="flex gap-2">
                                        <span className="flex items-center px-3 py-2 border border-gray-300 rounded-l-md bg-gray-100 text-gray-700 font-semibold">
                                            +91
                                        </span>
                                        <input
                                            type="tel"
                                            value={mobile}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '');
                                                if (value.length <= 10) {
                                                    setMobile(value);
                                                }
                                            }}
                                            placeholder="Enter 10-digit mobile number"
                                            maxLength="10"
                                            className="flex-1 border border-gray-300 rounded-r-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                    {mobile && mobile.length === 10 && (
                                        <p className="text-green-600 text-xs mt-1">✓ Valid mobile number</p>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleSendOTP}
                                    disabled={mobile.length !== 10 || loading}
                                    className={`w-full py-3 rounded-lg font-bold transition-colors ${
                                        mobile.length === 10 && !loading
                                            ? 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
                                            : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                    }`}
                                >
                                    {loading ? 'Sending OTP...' : 'Send OTP'}
                                </button>
                                
                                reCAPTCHA container - invisible
                                <div id="recaptcha-container"></div>
                            </>
                        ) : (
                            <form onSubmit={handleVerifyOTP} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Enter OTP</label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '');
                                            if (value.length <= 6) {
                                                setOtp(value);
                                            }
                                        }}
                                        placeholder="Enter 6-digit OTP"
                                        maxLength="6"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-center text-2xl tracking-widest font-bold focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                    <p className="text-gray-600 text-xs mt-2">
                                        OTP sent to +91 {mobile}
                                    </p>
                                </div>

                                {otpTimer > 0 ? (
                                    <p className="text-center text-sm text-gray-600">
                                        Resend OTP in <span className="font-bold text-green-600">{otpTimer}s</span>
                                    </p>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setOtpSent(false);
                                            setOtp("");
                                        }}
                                        className="w-full text-green-600 hover:text-green-700 font-semibold text-sm"
                                    >
                                        Resend OTP
                                    </button>
                                )}

                                <button
                                    type="submit"
                                    disabled={otp.length !== 6 || loading}
                                    className={`w-full py-3 rounded-lg font-bold transition-colors ${
                                        otp.length === 6 && !loading
                                            ? 'bg-green-500 text-white hover:bg-green-600 cursor-pointer'
                                            : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                    }`}
                                >
                                    {loading ? 'Verifying...' : 'Verify & Login'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setOtpSent(false);
                                        setOtp("");
                                        setMobile("");
                                    }}
                                    className="w-full text-gray-600 hover:text-gray-800 text-sm"
                                >
                                    ← Change Mobile Number
                                </button>
                            </form>
                        )}
                    </div>
                )
                End of temporarily disabled mobile OTP login UI */}

            {!adminRoute && (
              <div className="mt-6 text-center text-gray-600">
                {t.dontHaveAccount}{" "}
                <Link
                  to="/signup"
                  className="text-green-500 hover:text-green-600 font-semibold"
                >
                  {t.signUp}
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* Snackbar notification */}
      <Snackbar
        message={snackbarMessage}
        show={showSnackbar}
        onClose={() => setShowSnackbar(false)}
        type="success"
        duration={3000}
      />
    </div>
  );
};

export default Login;
