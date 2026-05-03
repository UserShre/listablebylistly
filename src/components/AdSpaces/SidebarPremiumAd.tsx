import { useEffect } from 'react';

export const SidebarPremiumAd = () => {
  useEffect(() => {
    // Load Google AdSense script if not loaded
    if (window.adsbygoogle === undefined) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID';
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }
    // Push ads
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }, []);

  return (
    <div className="fixed right-4 top-24 z-40 bg-white rounded-lg shadow-lg p-2 hidden lg:block">
      {/* Medium Rectangle - 300x250 (MOST PROFITABLE) */}
      <div className="border-2 border-gray-200 rounded">
        <ins
          className="adsbygoogle"
          style={{
            display: 'block',
            width: '300px',
            height: '250px',
          }}
          data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
          data-ad-slot="ad-sidebar-premium"
          data-ad-format="rectangle"
        />
      </div>
      <p className="text-xs text-gray-500 text-center mt-2">Advertisement</p>
    </div>
  );
};
