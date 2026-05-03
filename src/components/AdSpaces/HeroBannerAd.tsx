import { X } from 'lucide-react';
import { useState } from 'react';

export function HeroBannerAd() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 mb-8 rounded-lg shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg mb-1">💰 Limited Time Offer</h3>
          <p className="text-sm opacity-90">Get 50% off on Premium Plans - Click Now!</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-white text-blue-600 px-6 py-2 rounded font-semibold hover:bg-gray-100 transition">
            Learn More
          </button>
          <button
            onClick={() => setVisible(false)}
            className="text-white hover:text-gray-200 transition"
            aria-label="Close ad"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      {/* Google AdSense or similar ad network code would go here */}
      <div className="mt-2 text-xs opacity-75">Sponsored</div>
    </div>
  );
}
