import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';

const LayoutDemo: React.FC = () => {
  const { theme } = useTheme();
  const { primaryGradient, secondaryGradient } = theme;

  const cards = [
    {
      title: 'Total Users',
      value: '14,231',
      change: '+12.5%',
      positive: true,
      icon: (
        <div className={cn(
          'w-12 h-12 rounded-lg flex items-center justify-center text-white bg-gradient-to-br',
          primaryGradient.from,
          primaryGradient.via,
          primaryGradient.to
        )}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
      )
    },
    {
      title: 'Visits',
      value: '45,454',
      change: '+32.7%',
      positive: true,
      icon: (
        <div className={cn(
          'w-12 h-12 rounded-lg flex items-center justify-center text-white bg-gradient-to-br',
          secondaryGradient.from,
          secondaryGradient.via,
          secondaryGradient.to
        )}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path>
            <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path>
            <path d="M18 12a2 2 0 0 0 0 4h2v-4Z"></path>
          </svg>
        </div>
      )
    },
    {
      title: 'Content Items',
      value: '2,540',
      change: '-4.3%',
      positive: false,
      icon: (
        <div className={cn(
          'w-12 h-12 rounded-lg flex items-center justify-center text-white bg-gradient-to-br',
          'from-warning-500',
          'via-warning-600',
          'to-warning-700'
        )}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        </div>
      )
    },
    {
      title: 'Orders',
      value: '1,570',
      change: '+10.2%',
      positive: true,
      icon: (
        <div className={cn(
          'w-12 h-12 rounded-lg flex items-center justify-center text-white bg-gradient-to-br',
          'from-success-500',
          'via-success-600',
          'to-success-700'
        )}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">Dashboard</h1>
        <p className="text-neutral-500">Welcome back! Here's an overview of your data</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500 mb-1">{card.title}</p>
                <h3 className="text-2xl font-bold text-neutral-900">{card.value}</h3>
                <div className={cn(
                  'mt-2 text-sm font-medium',
                  card.positive ? 'text-success-600' : 'text-error-600'
                )}>
                  {card.change}
                </div>
              </div>
              {card.icon}
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 lg:col-span-2 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">Statistics Chart</h2>
            <div className="flex space-x-2">
              <button className={cn(
                'px-3 py-1 rounded-md text-sm font-medium bg-primary-50 text-primary-700'
              )}>Daily</button>
              <button className={cn(
                'px-3 py-1 rounded-md text-sm font-medium text-neutral-500 hover:bg-neutral-100'
              )}>Weekly</button>
              <button className={cn(
                'px-3 py-1 rounded-md text-sm font-medium text-neutral-500 hover:bg-neutral-100'
              )}>Monthly</button>
            </div>
          </div>
          <div className="w-full h-80 bg-neutral-100 rounded-lg flex items-center justify-center">
            <p className="text-neutral-500">Chart Area</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">Active Users</h2>
            <button className="text-sm text-neutral-500 hover:text-primary-600">View All</button>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((_, index) => (
              <div key={index} className="flex items-center py-2">
                <div className={cn(
                  'w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-white',
                  index % 2 === 0 ? cn(primaryGradient.from, primaryGradient.via, primaryGradient.to) : 
                  cn(secondaryGradient.from, secondaryGradient.via, secondaryGradient.to)
                )}>
                  <span className="font-medium">U{index + 1}</span>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-neutral-900">User {index + 1}</p>
                  <p className="text-sm text-neutral-500">Last login: Today {index + 8}:00</p>
                </div>
                <div className="ml-auto text-sm font-medium text-success-600">Online</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutDemo; 