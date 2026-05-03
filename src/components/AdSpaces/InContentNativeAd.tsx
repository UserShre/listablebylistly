import { useEffect } from 'react';

interface InContentNativeAdProps {
  placement?: 'after-section' | 'between-list' | 'after-content';
}

export const InContentNativeAd = ({ placement = 'after-section' }: InContentNativeAdProps) => {
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
    <div className={`my-8 p-4 bg-gray-50 rounded-lg flex justify-center ${placement}`}>
      {/* Native Ad - Blends with content */}
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          maxWidth: '728px',
          height: '90px',
        }}
        data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
        data-ad-slot="ad-in-content"
        data-ad-format="horizontal"
      />
    </div>
  );
};
