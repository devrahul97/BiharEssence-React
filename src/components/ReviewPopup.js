import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ReviewPopup = () => {
    const [showPopup, setShowPopup] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const [hoveredStar, setHoveredStar] = useState(0);
    const isDark = useSelector((store) => store.theme.isDark);

    useEffect(() => {
      // Check if user has disabled the popup
      const hideReviewPopup = localStorage.getItem("hideReviewPopup");
      if (!hideReviewPopup) {
        setShowPopup(true);
      }
    }, []);

    const handleClose = () => {
      if (dontShowAgain) {
        localStorage.setItem("hideReviewPopup", "true");
      }
      setShowPopup(false);
    };

    const handleSubmitReview = (rating) => {
      // You can add API call here to submit the review
      alert(`Thank you for your ${rating}-star review! 🙏`);
      if (dontShowAgain) {
        localStorage.setItem("hideReviewPopup", "true");
      }
      setShowPopup(false);
    };

    if (!showPopup) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className={`relative max-w-md w-full rounded-lg shadow-2xl p-6 ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className={`absolute top-3 right-3 text-2xl font-bold hover:scale-110 transition-transform ${
              isDark
                ? "text-gray-400 hover:text-white"
                : "text-gray-500 hover:text-black"
            }`}
          >
            ✕
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <h2
              className={`text-2xl font-bold mb-2 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              Love Bihar Essence? 💛
            </h2>
            <p
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              We'd love to hear your feedback!
            </p>
          </div>

          {/* Rating Stars */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleSubmitReview(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className="text-4xl hover:scale-125 transition-transform focus:outline-none"
              >
                {star <= hoveredStar ? "⭐" : "☆"}
              </button>
            ))}
          </div>

          <p
            className={`text-center text-xs mb-4 ${
              isDark ? "text-gray-500" : "text-gray-500"
            }`}
          >
            Click a star to rate us (1-5)
          </p>

          {/* Don't Show Again Checkbox */}
          <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-300">
            <input
              type="checkbox"
              id="dontShowAgain"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 cursor-pointer"
            />
            <label
              htmlFor="dontShowAgain"
              className={`text-sm cursor-pointer ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Don't show this to me again
            </label>
          </div>
        </div>
      </div>
    );
};

export default ReviewPopup;
