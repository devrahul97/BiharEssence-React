import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import { API_ENDPOINTS } from "../../utils/constants";

const Analytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('7'); // 7, 14, 30 days
    const isDark = useSelector((store) => store.theme.isDark);

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_ENDPOINTS.ANALYTICS_STATS}?range=${dateRange}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (data.success) {
                setAnalytics(data.data);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Loading analytics...</div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="text-center p-8">
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    Analytics data not available. Please run the database migration.
                </p>
            </div>
        );
    }

    // Prepare chart data
    const visitData = analytics.visits.map(v => ({
        date: new Date(v.visit_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        visits: parseInt(v.visit_count)
    }));

    const activityData = analytics.activity.map(a => ({
        date: new Date(a.activity_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        signups: parseInt(a.signups_count),
        logins: parseInt(a.logins_count)
    }));

    return (
        <div className="space-y-6">
            {/* Header with Date Range Filter */}
            <div className="flex justify-between items-center">
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    📊 Analytics Dashboard
                </h2>
                <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className={`px-4 py-2 rounded-lg border ${
                        isDark 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                    }`}
                >
                    <option value="7">Last 7 Days</option>
                    <option value="14">Last 14 Days</option>
                    <option value="30">Last 30 Days</option>
                </select>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Total Visits
                            </p>
                            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {analytics.totals.totalVisits.toLocaleString()}
                            </p>
                        </div>
                        <div className="text-4xl">👁️</div>
                    </div>
                </div>

                <div className={`p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Total Users
                            </p>
                            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {analytics.totals.totalUsers.toLocaleString()}
                            </p>
                        </div>
                        <div className="text-4xl">👥</div>
                    </div>
                </div>

                <div className={`p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Total Orders
                            </p>
                            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {analytics.totals.totalOrders.toLocaleString()}
                            </p>
                        </div>
                        <div className="text-4xl">🛒</div>
                    </div>
                </div>

                <div className={`p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Unique Visitors
                            </p>
                            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {analytics.totals.totalUniqueVisitors.toLocaleString()}
                            </p>
                        </div>
                        <div className="text-4xl">✨</div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Site Visits Chart */}
                <div className={`p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        📈 Site Visits Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={visitData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                            <XAxis 
                                dataKey="date" 
                                stroke={isDark ? '#9ca3af' : '#6b7280'}
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis 
                                stroke={isDark ? '#9ca3af' : '#6b7280'}
                                style={{ fontSize: '12px' }}
                            />
                            <Tooltip 
                                contentStyle={{
                                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                                    borderRadius: '8px',
                                    color: isDark ? '#ffffff' : '#000000'
                                }}
                            />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="visits" 
                                stroke="#10b981" 
                                strokeWidth={2}
                                name="Visits"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* User Activity Chart */}
                <div className={`p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        👥 User Activity
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={activityData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
                            <XAxis 
                                dataKey="date" 
                                stroke={isDark ? '#9ca3af' : '#6b7280'}
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis 
                                stroke={isDark ? '#9ca3af' : '#6b7280'}
                                style={{ fontSize: '12px' }}
                            />
                            <Tooltip 
                                contentStyle={{
                                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                                    borderRadius: '8px',
                                    color: isDark ? '#ffffff' : '#000000'
                                }}
                            />
                            <Legend />
                            <Bar dataKey="signups" fill="#3b82f6" name="Signups" />
                            <Bar dataKey="logins" fill="#10b981" name="Logins" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Growth Insights */}
            <div className={`p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    💡 Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Avg. Daily Visits
                        </p>
                        <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {visitData.length > 0 
                                ? Math.round(visitData.reduce((sum, d) => sum + d.visits, 0) / visitData.length)
                                : 0
                            }
                        </p>
                    </div>
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Total New Users
                        </p>
                        <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {activityData.reduce((sum, d) => sum + d.signups, 0)}
                        </p>
                    </div>
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Total Logins
                        </p>
                        <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {activityData.reduce((sum, d) => sum + d.logins, 0)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
