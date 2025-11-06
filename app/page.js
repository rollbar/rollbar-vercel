'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import EventControls from '@/components/EventControls';
import TokenBanner from '@/components/TokenBanner';
import TokenSettings from '@/components/TokenSettings';
import Footer from '@/components/Footer';

/**
 * Home page - Main demo page with Rollbar event controls
 */
export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen hero-background">
      <Header />
      <main className="pt-[100px] px-5 pb-5">
        <div className="max-w-[1200px] mx-auto">
          <div className="hero-section mb-10">
            <h1 className="hero-title mt-[40px] mb-2.5">
              <span className="text-white">Ship Faster </span><br />
              <span className="gradient-text">
                with Confidence
              </span>
            </h1>
            <p className="text-white text-base mb-10">
              Use this Rollbar starter kit to kickstart error monitoring in your Next.js app. Integrate in minutes, ship with no worries.
            </p>
          </div>

          {/* Token configuration banner */}
          <TokenBanner onOpenSettings={() => setIsSettingsOpen(true)} />

          <EventControls />
        </div>
      </main>

      {/* Token settings modal (can be opened from banner) */}
      <TokenSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <Footer />
    </div>
  );
}
