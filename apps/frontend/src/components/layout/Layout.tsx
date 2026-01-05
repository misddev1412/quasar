'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import ClientWrapper from '../ClientWrapper';
import NavigationProgressBar from '../NavigationProgressBar';
import { ChatWidget } from '../ChatWidget';
import FloatingIcons from '../common/FloatingIcons';
import LoyaltyTierBanner from '../storefront/LoyaltyTierBanner';
import { useVisitorTracker } from '../../hooks/useVisitorTracker';
import CookieConsentBanner from '../common/CookieConsentBanner';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [chatContext, setChatContext] = useState({
    country: '',
    language: '',
    deviceType: '',
    currentPage: '',
  });
  useVisitorTracker();

  useEffect(() => {
    // Get browser language
    const browserLanguage = navigator.language;

    // Get device type
    const userAgent = navigator.userAgent.toLowerCase();
    let deviceType = 'desktop';
    if (/mobile|android|iphone|ipad|ipod/i.test(userAgent)) {
      deviceType = 'mobile';
    } else if (/tablet|ipad/i.test(userAgent)) {
      deviceType = 'tablet';
    }

    // Get current page
    const currentPage = window.location.pathname;

    setChatContext({
      country: '', // Could use IP geolocation service
      language: browserLanguage.split('-')[0],
      deviceType,
      currentPage,
    });
  }, []);

  return (
    <ClientWrapper>
      <Suspense fallback={null}>
        <NavigationProgressBar />
      </Suspense>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <Header />
        <LoyaltyTierBanner />

        <main className="flex-1 w-full storefront-section-stage">{children}</main>

        <Footer />
      </div>

      {/* Chat Widget */}
      <ChatWidget context={chatContext} />

      {/* Floating Icons */}
      <FloatingIcons />

      <CookieConsentBanner />
    </ClientWrapper>
  );
};

export default Layout;
