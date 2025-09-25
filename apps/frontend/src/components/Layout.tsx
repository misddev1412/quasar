'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Header from './layout/Header';
import Footer from './layout/Footer';
import ClientWrapper from './ClientWrapper';
import NavigationProgressBar from './NavigationProgressBar';
import { ChatWidget } from './ChatWidget';

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

        <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">{children}</main>

        <Footer />
      </div>

      {/* Chat Widget */}
      <ChatWidget context={chatContext} />
    </ClientWrapper>
  );
};

export default Layout;
