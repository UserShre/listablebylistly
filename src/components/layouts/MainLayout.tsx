import { HeroBannerAd, SidebarPremiumAd, InContentNativeAd, FooterLeaderboardAd } from '@/components/AdSpaces';
import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
  showInContentAds?: boolean;
}

export const MainLayout = ({ children, showInContentAds = true }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* AD SPACE 1: Hero Banner (Sticky Top) */}
      <HeroBannerAd />

      <div className="flex flex-1 relative">
        {/* Main Content */}
        <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
          {children}

          {/* AD SPACE 3: In-Content Native Ad (Between Sections) */}
          {showInContentAds && <InContentNativeAd placement="after-section" />}
        </main>

        {/* AD SPACE 2: Sidebar Premium (Sticky Right) - HIGHEST CPM */}
        <SidebarPremiumAd />
      </div>

      {/* AD SPACE 4: Footer Leaderboard */}
      <FooterLeaderboardAd />
    </div>
  );
};
