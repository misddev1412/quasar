'use client';

import { useNavigationProgress } from '../hooks/useNavigationProgress';

export const NavigationProgressBar: React.FC = () => {
  useNavigationProgress();
  return null;
};

export default NavigationProgressBar;