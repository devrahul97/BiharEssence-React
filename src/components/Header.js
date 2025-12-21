import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import { logout } from "../../utils/authSlice";
import { API_ENDPOINTS } from "../../utils/constants";
import { resetLanguage, setLanguage } from "../../utils/languageSlice";
import { updateUserPreferences } from "../../utils/preferencesApi";
import { resetTheme, toggleTheme } from "../../utils/themeSlice";
import { translations } from "../../utils/translations";
import useOnlineStatus from "../../utils/useOnlineStatus";

const Header = () => {
  const [btnNameReact, setbtnNameReact] = useState("Login");
  const [onDemandCount, setOnDemandCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const onlineStatus = useOnlineStatus();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get cart items count
  const cartItems = useSelector((store) => store.cart.items);
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Get auth state
  const { isAuthenticated, user, role } = useSelector((store) => store.auth);

  // Get theme state
  const isDark = useSelector((store) => store.theme.isDark);

  // Get language state
  const currentLanguage = useSelector(
    (store) => store.language.currentLanguage
  );
  const t = translations[currentLanguage] || translations.english;

  // Fetch on-demand requests count for admin
  useEffect(() => {
    const fetchOnDemandCount = async () => {
      if (isAuthenticated && role === "admin") {
        try {
          const token = localStorage.getItem("token");

          if (!token) {
            console.warn("No authentication token found");
            return;
          }

          const response = await fetch(API_ENDPOINTS.ADMIN_ON_DEMAND, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            console.error(
              `Failed to fetch on-demand requests: ${response.status} ${response.statusText}`
            );
            setOnDemandCount(0);
            setPendingCount(0);
            return;
          }

          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            console.error("Response is not JSON:", await response.text());
            setOnDemandCount(0);
            setPendingCount(0);
            return;
          }

          const data = await response.json();
          if (data.success) {
            setOnDemandCount(data.requests.length);
            // Count pending requests
            const pending = data.requests.filter(
              (req) => req.status === "pending"
            ).length;
            setPendingCount(pending);
          }
        } catch (error) {
          console.error("Error fetching on-demand requests count:", error);
          // Reset counts on error
          setOnDemandCount(0);
          setPendingCount(0);
        }
      } else {
        // Reset counts when not admin
        setOnDemandCount(0);
        setPendingCount(0);
      }
    };

    fetchOnDemandCount();

    // Poll every 30 seconds to keep count updated
    const interval = setInterval(fetchOnDemandCount, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, role]);

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetTheme());
    dispatch(resetLanguage());
    navigate("/");
  };

  // Handle theme toggle
  const handleThemeToggle = async () => {
    const newTheme = !isDark;
    dispatch(toggleTheme());

    // Save to backend if user is authenticated
    if (isAuthenticated) {
      try {
        await updateUserPreferences({ theme: newTheme ? "dark" : "light" });
      } catch (error) {
        console.error("Failed to save theme preference:", error);
      }
    }
  };

  // Handle language change
  const handleLanguageChange = async (e) => {
    const newLanguage = e.target.value;
    dispatch(setLanguage(newLanguage));

    // Save to backend if user is authenticated
    if (isAuthenticated) {
      try {
        await updateUserPreferences({ language: newLanguage });
      } catch (error) {
        console.error("Failed to save language preference:", error);
      }
    }
  };

  // useEffect(() => {
  //     console.log("useEffect Called.")
  // }, [])

  //let btnName = "Login";

  // Render different headers for admin vs customer
  if (isAuthenticated && role === "admin") {
    return (
      <div
        className={`shadow-2xl ${
          isDark ? "bg-gray-800 text-white" : "bg-pink-100"
        }`}
      >
        <div className="flex justify-between items-center px-4 py-2">
          <div className="logo-container">
            <img
              className="w-32 sm:w-40 md:w-56"
              src="/Assets/BiharEssence.jpeg"
              alt="Logo"
            />
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-opacity-20 hover:bg-gray-500"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center">
            <ul className="flex p-2 m-4">
              <li className="px-4">
                <Link
                  to="/admin/dashboard"
                  className={isDark ? "hover:text-pink-400" : ""}
                >
                  Dashboard
                </Link>
              </li>
              <li className="px-4">
                <Link
                  to="/admin/dashboard?tab=on-demand"
                  className={`relative ${isDark ? "hover:text-pink-400" : ""}`}
                  title="View On-Demand Product Requests"
                >
                  📋 Requests
                  {onDemandCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold animate-pulse">
                      {onDemandCount}
                    </span>
                  )}
                  {pendingCount > 0 && (
                    <span className="ml-1 text-xs text-red-500 font-bold">
                      ({pendingCount} new)
                    </span>
                  )}
                </Link>
              </li>
              <li className="px-4">
                <Link to="/" className={isDark ? "hover:text-pink-400" : ""}>
                  View Shop
                </Link>
              </li>
              <li className="px-4">
                <select
                  value={currentLanguage}
                  onChange={handleLanguageChange}
                  className={`px-2 py-1 rounded cursor-pointer ${
                    isDark
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-200 text-black hover:bg-gray-300"
                  }`}
                  title={t.language}
                >
                  <option value="english">English</option>
                  <option value="hindi">हिंदी</option>
                </select>
              </li>
              <li className="px-4">
                <button
                  onClick={handleThemeToggle}
                  className={`px-3 py-1 rounded ${
                    isDark
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                  title={t.toggleTheme}
                >
                  {isDark ? "🌙" : "☀️"}
                </button>
              </li>
              <li
                className={`px-4 text-sm ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {user?.name || t.admin}
              </li>
              <li className="px-4">
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-800"
                >
                  {t.logout}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-300">
            <ul className="flex flex-col p-2">
              <li className="py-3 px-4 border-b border-gray-200">
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={isDark ? "hover:text-pink-400" : ""}
                >
                  Dashboard
                </Link>
              </li>
              <li className="py-3 px-4 border-b border-gray-200">
                <Link
                  to="/admin/dashboard?tab=on-demand"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`relative inline-flex items-center ${
                    isDark ? "hover:text-pink-400" : ""
                  }`}
                  title="View On-Demand Product Requests"
                >
                  📋 Requests
                  {onDemandCount > 0 && (
                    <span className="ml-2 bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      {onDemandCount}
                    </span>
                  )}
                  {pendingCount > 0 && (
                    <span className="ml-1 text-xs text-red-500 font-bold">
                      ({pendingCount} new)
                    </span>
                  )}
                </Link>
              </li>
              <li className="py-3 px-4 border-b border-gray-200">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={isDark ? "hover:text-pink-400" : ""}
                >
                  View Shop
                </Link>
              </li>
              <li className="py-3 px-4 border-b border-gray-200">
                <label className="block text-xs mb-1">{t.language}</label>
                <select
                  value={currentLanguage}
                  onChange={handleLanguageChange}
                  className={`w-full px-2 py-1 rounded cursor-pointer ${
                    isDark
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-200 text-black hover:bg-gray-300"
                  }`}
                >
                  <option value="english">English</option>
                  <option value="hindi">हिंदी</option>
                </select>
              </li>
              <li className="py-3 px-4 border-b border-gray-200">
                <button
                  onClick={handleThemeToggle}
                  className={`w-full px-3 py-2 rounded ${
                    isDark
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {isDark ? "🌙 Dark Mode" : "☀️ Light Mode"}
                </button>
              </li>
              <li
                className={`py-3 px-4 border-b border-gray-200 text-sm ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                👤 {user?.name || t.admin}
              </li>
              <li className="py-3 px-4">
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-red-600 hover:text-red-800 font-semibold"
                >
                  {t.logout}
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Customer header
  return (
    <div
      className={`shadow-2xl ${
        isDark ? "bg-gray-800 text-white" : "bg-pink-100"
      }`}
    >
      <div className="flex justify-between items-center px-4 py-2">
        <div className="logo-container">
          <img
            className="w-32 sm:w-40 md:w-56"
            src="/Assets/BiharEssence.jpeg"
            alt="Logo"
          />
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-opacity-20 hover:bg-gray-500"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center">
          <ul className="flex p-2 m-4">
            {isAuthenticated ? (
              <>
                <li className="px-4">
                  {" "}
                  {t?.onlineStatus || "Online Status"}:{" "}
                  {onlineStatus ? "✅" : "🔴"}
                </li>
                <li className="px-4">
                  <Link to="/" className={isDark ? "hover:text-pink-400" : ""}>
                    {t.home}
                  </Link>
                </li>
                <li className="px-4">
                  <Link
                    to="/on-demand"
                    className={isDark ? "hover:text-pink-400" : ""}
                  >
                    {t.onDemand}
                  </Link>
                </li>
                <li className="px-4">
                  <Link
                    to="/gift-product"
                    className={isDark ? "hover:text-pink-400" : ""}
                  >
                    {t.giftProduct || "🎁 Gift"}
                  </Link>
                </li>
                <li className="px-4">
                  <Link
                    to="/cart"
                    className={`relative ${
                      isDark ? "hover:text-pink-400" : ""
                    }`}
                  >
                    {t.cart}
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </li>
                <li className="px-4">
                  <Link
                    to="/orders"
                    className={isDark ? "hover:text-pink-400" : ""}
                  >
                    {t.myOrders}
                  </Link>
                </li>
                {role === "admin" && (
                  <li className="px-4">
                    <Link
                      to="/admin/dashboard"
                      className={`font-semibold ${
                        isDark
                          ? "text-yellow-400 hover:text-yellow-300"
                          : "text-blue-600 hover:text-blue-800"
                      }`}
                    >
                      Admin Panel
                    </Link>
                  </li>
                )}
                <li className="px-4">
                  <select
                    value={currentLanguage}
                    onChange={handleLanguageChange}
                    className={`px-2 py-1 rounded cursor-pointer ${
                      isDark
                        ? "bg-gray-700 text-white hover:bg-gray-600"
                        : "bg-gray-200 text-black hover:bg-gray-300"
                    }`}
                    title={t.language}
                  >
                    <option value="english">English</option>
                    <option value="hindi">हिंदी</option>
                  </select>
                </li>
                <li className="px-4">
                  <button
                    onClick={handleThemeToggle}
                    className={`px-3 py-1 rounded ${
                      isDark
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                    title={t.toggleTheme}
                  >
                    {isDark ? "🌙" : "☀️"}
                  </button>
                </li>
                <li
                  className={`px-4 text-sm ${
                    isDark ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {user?.name || t.user}
                </li>
                <li className="px-4">
                  <button
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-800"
                  >
                    {t.logout}
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="px-4">
                  <Link
                    to="/cart"
                    className={`relative ${
                      isDark ? "hover:text-pink-400" : ""
                    }`}
                  >
                    {t.cart}
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </li>
                <li className="px-4">
                  <select
                    value={currentLanguage}
                    onChange={handleLanguageChange}
                    className={`px-2 py-1 rounded cursor-pointer ${
                      isDark
                        ? "bg-gray-700 text-white hover:bg-gray-600"
                        : "bg-gray-200 text-black hover:bg-gray-300"
                    }`}
                    title={t.language}
                  >
                    <option value="english">English</option>
                    <option value="hindi">हिंदी</option>
                  </select>
                </li>
                <li className="px-4">
                  <Link to="/login">{t.login}</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-300">
          {isAuthenticated ? (
            <ul className="flex flex-col p-2">
              <li className="py-3 px-4 border-b border-gray-200 text-sm">
                {t?.onlineStatus || "Online Status"}:{" "}
                {onlineStatus ? "✅" : "🔴"}
              </li>
              <li className="py-3 px-4 border-b border-gray-200">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className={isDark ? "hover:text-pink-400" : ""}
                >
                  {t.home}
                </Link>
              </li>
              <li className="py-3 px-4 border-b border-gray-200">
                <Link
                  to="/on-demand"
                  onClick={() => setMobileMenuOpen(false)}
                  className={isDark ? "hover:text-pink-400" : ""}
                >
                  {t.onDemand}
                </Link>
              </li>
              <li className="py-3 px-4 border-b border-gray-200">
                <Link
                  to="/gift-product"
                  onClick={() => setMobileMenuOpen(false)}
                  className={isDark ? "hover:text-pink-400" : ""}
                >
                  {t.giftProduct || "🎁 Gift"}
                </Link>
              </li>
              <li className="py-3 px-4 border-b border-gray-200">
                <Link
                  to="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`relative inline-flex items-center ${
                    isDark ? "hover:text-pink-400" : ""
                  }`}
                >
                  {t.cart}
                  {cartCount > 0 && (
                    <span className="ml-2 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </li>
              <li className="py-3 px-4 border-b border-gray-200">
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className={isDark ? "hover:text-pink-400" : ""}
                >
                  {t.myOrders}
                </Link>
              </li>
              {role === "admin" && (
                <li className="py-3 px-4 border-b border-gray-200">
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`font-semibold ${
                      isDark
                        ? "text-yellow-400 hover:text-yellow-300"
                        : "text-blue-600 hover:text-blue-800"
                    }`}
                  >
                    Admin Panel
                  </Link>
                </li>
              )}
              <li className="py-3 px-4 border-b border-gray-200">
                <label className="block text-xs mb-1">{t.language}</label>
                <select
                  value={currentLanguage}
                  onChange={handleLanguageChange}
                  className={`w-full px-2 py-1 rounded cursor-pointer ${
                    isDark
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-200 text-black hover:bg-gray-300"
                  }`}
                >
                  <option value="english">English</option>
                  <option value="hindi">हिंदी</option>
                </select>
              </li>
              <li className="py-3 px-4 border-b border-gray-200">
                <button
                  onClick={handleThemeToggle}
                  className={`w-full px-3 py-2 rounded ${
                    isDark
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {isDark ? "🌙 Dark Mode" : "☀️ Light Mode"}
                </button>
              </li>
              <li
                className={`py-3 px-4 border-b border-gray-200 text-sm ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                👤 {user?.name || t.user}
              </li>
              <li className="py-3 px-4">
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-red-600 hover:text-red-800 font-semibold"
                >
                  {t.logout}
                </button>
              </li>
            </ul>
          ) : (
            <ul className="flex flex-col p-2">
              <li className="py-3 px-4 border-b border-gray-200">
                <Link
                  to="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`relative inline-flex items-center ${
                    isDark ? "hover:text-pink-400" : ""
                  }`}
                >
                  {t.cart}
                  {cartCount > 0 && (
                    <span className="ml-2 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </li>
              <li className="py-3 px-4 border-b border-gray-200">
                <label className="block text-xs mb-1">{t.language}</label>
                <select
                  value={currentLanguage}
                  onChange={handleLanguageChange}
                  className={`w-full px-2 py-1 rounded cursor-pointer ${
                    isDark
                      ? "bg-gray-700 text-white hover:bg-gray-600"
                      : "bg-gray-200 text-black hover:bg-gray-300"
                  }`}
                >
                  <option value="english">English</option>
                  <option value="hindi">हिंदी</option>
                </select>
              </li>
              <li className="py-3 px-4">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  {t.login}
                </Link>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
export default Header; // standard practice
