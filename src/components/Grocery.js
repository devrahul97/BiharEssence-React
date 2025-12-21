import { useSelector } from "react-redux";
import { translations } from "../../utils/translations";

const OnDemand = () => {
    const isDark = useSelector((store) => store.theme.isDark);
    const currentLanguage = useSelector((store) => store.language.currentLanguage);
    const t = translations[currentLanguage] || translations.english;

    return (
        <div className={`min-h-screen p-8 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
            <div className="max-w-6xl mx-auto">
                <h1 className={`text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    🚀 {t.onDemand || "On Demand"} Products
                </h1>
                <div className={`rounded-lg shadow-lg p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                        Express Delivery Service
                    </h2>
                    <p className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Get your essential products delivered fast! Order fresh vegetables, fruits, daily groceries, 
                        and Bihar specialty items with quick delivery to your doorstep.
                    </p>
                    
                    <div className="grid md:grid-cols-3 gap-6 mt-8">
                        <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
                            <div className="text-4xl mb-3">⚡</div>
                            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                Fast Delivery
                            </h3>
                            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                Get your orders within 30-60 minutes
                            </p>
                        </div>
                        
                        <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
                            <div className="text-4xl mb-3">🌾</div>
                            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                Fresh Products
                            </h3>
                            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                Fresh vegetables, fruits, and daily essentials
                            </p>
                        </div>
                        
                        <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
                            <div className="text-4xl mb-3">🛒</div>
                            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                Easy Ordering
                            </h3>
                            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                Browse, select, and order with just a few clicks
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            🚧 Feature coming soon! We're working hard to bring you the best on-demand delivery experience.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnDemand;