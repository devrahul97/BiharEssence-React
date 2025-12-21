import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, role } = useSelector((store) => store.auth);
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        } else if (adminOnly && role !== 'admin') {
            navigate('/');
        } else {
            setIsChecking(false);
        }
    }, [isAuthenticated, role, adminOnly, navigate]);

    // Show loading state to prevent flash before redirect
    if (isChecking || !isAuthenticated) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (adminOnly && role !== 'admin') {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return children;
};

export default ProtectedRoute;
