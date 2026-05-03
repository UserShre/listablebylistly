import { useEffect } from 'react';

export const FooterLeaderboardAd = () => {
  useEffect(() => {
    // Load Google AdSense script if not loaded
    if (window.adsbygoogle === undefined) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1207458044982701';
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }
    // Push ads
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }, []);

  return (
    <div className="bg-gray-100 py-4 flex justify-center border-t border-gray-300">
      {/* Leaderboard - 728x90 */}
      <ins
        className="adsbygoogle"
        style={{
          display: 'inline-block',
          width: '728px',
          height: '90px',
        }}
        data-ad-client="ca-pub-1207458044982701"
        data-ad-slot="9046059037"
        data-ad-format="horizontal"
      />
    </div>
  );
};
