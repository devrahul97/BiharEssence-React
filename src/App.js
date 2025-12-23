
 import { lazy, StrictMode, Suspense, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Provider, useDispatch, useSelector } from "react-redux";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router";
import appStore from "../utils/appStore";
import { logout } from "../utils/authSlice";
import { API_ENDPOINTS } from "../utils/constants";
import { initDevToolsProtection } from "../utils/devToolsProtection";
import AdminDashboard from "./components/AdminDashboard";
import Body from "./components/Body";
import Checkout from "./components/Checkout";
import Contact from "./components/Contact";
import Error from "./components/Error";

import Header from "./components/Header";
import Login from "./components/Login";
import OrderSuccess from "./components/OrderSuccess";
import Orders from "./components/Orders";
import Products from "./components/Products";
import ProtectedRoute from "./components/ProtectedRoute";
import RestaurantMenu from "./components/RestaurantMenu";
import ReviewPopup from "./components/ReviewPopup";
import Signup from "./components/Signup";

import Warehouse from "./components/Warehouse";
// it means if you click on About then only js file of About page will be Loaded, you can verify in the network tab.
// if you  click on cart page then cart.js will be Loaded in the the network tab.
// this is also known as Chunking.

const OnDemand = lazy(() => import("./components/OnDemand"));
const GiftProduct = lazy(() => import("./components/GiftProduct"));
const About = lazy(() => import("./components/About"));
const Cart = lazy(() => import("./components/Cart"));

// styles
const StyleCard = () => {
  backgroundcolor: "black";
};

const AppLayoutContent = () => {
  const isDark = useSelector((store) => store.theme.isDark);
  const isAuthenticated = useSelector((store) => store.auth.isAuthenticated);
  const dispatch = useDispatch();

  // Track site visit on first load
  useEffect(() => {
    const trackVisit = async () => {
      try {
        await fetch(API_ENDPOINTS.ANALYTICS_VISIT, { method: "POST" });
      } catch (error) {
        console.log("Analytics not available");
      }
    };
    trackVisit();

    // Initialize DevTools protection (only in production)
    initDevToolsProtection();
  }, []);

  // Validate token on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && isAuthenticated) {
      // Basic token validation - check if it's expired or malformed
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          // Token expired, logout user
          dispatch(logout());
        }
      } catch (error) {
        // Invalid token format, logout user
        dispatch(logout());
      }
    }
  }, [dispatch, isAuthenticated]);

  return (
    <div
      className={`app min-h-screen ${
        isDark ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      <Header />
      <ReviewPopup />
      <Outlet />
    </div>
  );
};

 const AppLayout = () => {
   return (
     <Provider store={appStore}>
       <AppLayoutContent />
     </Provider>
   );
 };

 // Configuration: means that some information that will define that what will happen on Specific route.
 const appRouter = createBrowserRouter([
   {
     path: "/",
     element: <AppLayout />,
     children: [
       {
         path: "/",
         element: <Products />,
       },
       {
         path: "/login",
         element: <Login />,
       },
       {
         path: "/signup",
         element: <Signup />,
       },
       {
         path: "/admin/login",
         element: <Login adminRoute={true} />,
       },
       {
         path: "/admin/dashboard",
         element: (
           <ProtectedRoute adminOnly={true}>
             <AdminDashboard />
           </ProtectedRoute>
         ),
       },
       {
         path: "/admin/dashboard/edit/:id",
         element: (
           <ProtectedRoute adminOnly={true}>
             <AdminDashboard />
           </ProtectedRoute>
         ),
       },
       {
         path: "/old-restaurants",
         element: (
           <ProtectedRoute>
             <Body />
           </ProtectedRoute>
         ),
       },
       {
         path: "/about",
         element: (
           <ProtectedRoute>
             <Suspense fallback={<h1>Loading..</h1>}>
               <About />
             </Suspense>
           </ProtectedRoute>
         ),
       },
       {
         path: "/contact",
         element: (
           <ProtectedRoute>
             <Contact />
           </ProtectedRoute>
         ),
       },
       {
         path: "/contact/Rahul",
         element: (
           <ProtectedRoute>
             <Contact />
           </ProtectedRoute>
         ),
       },
       {
         path: "/cart",
         element: (
           <Suspense fallback={<h1>Loading..</h1>}>
             <Cart />
           </Suspense>
         ),
       },
       {
         path: "/checkout",
         element: (
           <ProtectedRoute>
             <Checkout />
           </ProtectedRoute>
         ),
       },
       {
         path: "/order-success",
         element: (
           <ProtectedRoute>
             <OrderSuccess />
           </ProtectedRoute>
         ),
       },
       {
         path: "/orders",
         element: (
           <ProtectedRoute>
             <Orders />
           </ProtectedRoute>
         ),
       },
       {
         path: "/restaurants/:resId", // resId is dynamic, it can change according to restaurant
         element: (
           <ProtectedRoute>
             <RestaurantMenu />
           </ProtectedRoute>
         ),
       },
       {
         path: "/on-demand",
         element: (
           <ProtectedRoute>
             <Suspense fallback={<h1>Loading..</h1>}>
               <OnDemand />
             </Suspense>
           </ProtectedRoute>
         ),
       },
       {
         path: "/gift-product",
         element: (
           <ProtectedRoute>
             <Suspense fallback={<h1>Loading..</h1>}>
               <GiftProduct />
             </Suspense>
           </ProtectedRoute>
         ),
       },
       {
         path: "/warehouse",
         element: (
           <ProtectedRoute adminOnly={true}>
             <Warehouse />
           </ProtectedRoute>
         ),
       },
     ],
     errorElement: <Error />,
   },
 ]);

 const root = ReactDOM.createRoot(document.getElementById("root"));

 root.render(
   <StrictMode>
     <Provider store={appStore}>
       <RouterProvider router={appRouter} />
     </Provider>
   </StrictMode>
 );

// JSX



