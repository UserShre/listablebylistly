import { useEffect } from 'react';

export const HeroBannerAd = () => {
  useEffect(() => {
    // Load Google AdSense script
    if (window.adsbygoogle === undefined) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1207458044982701';
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }
    // Push existing ads
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }, []);

  return (
    <div className="sticky top-0 z-50 bg-white shadow-md flex justify-center items-center py-2">
      {/* Horizontal Banner - 970x90 or 728x90 */}
      <ins
        className="adsbygoogle"
        style={{
          display: 'inline-block',
          width: '100%',
          maxWidth: '970px',
          height: '90px',
        }}
        data-ad-client="ca-pub-1207458044982701"
        data-ad-slot="6601970930"
        data-ad-format="horizontal"
      />
    </div>
  );
};
