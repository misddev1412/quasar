'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

class ProgressBar {
  private element: HTMLDivElement | null = null;
  private timeout: NodeJS.Timeout | null = null;
  private progressInterval: NodeJS.Timeout | null = null;
  private currentProgress = 0;
  private isActive = false;

  start() {
    if (this.isActive) return;
    this.isActive = true;
    this.currentProgress = 0;

    if (!this.element) {
      this.createElement();
    }

    if (this.element) {
      this.element.style.display = 'block';
      this.element.style.opacity = '1';
      this.setProgress(10);

      this.progressInterval = setInterval(() => {
        const increment = Math.random() * 10;
        const newProgress = Math.min(this.currentProgress + increment, 90);
        this.setProgress(newProgress);
      }, 200);
    }
  }

  done() {
    if (!this.isActive) return;

    this.clearTimers();
    this.setProgress(100);

    this.timeout = setTimeout(() => {
      if (this.element) {
        this.element.style.opacity = '0';
        setTimeout(() => {
          if (this.element) {
            this.element.style.display = 'none';
          }
          this.isActive = false;
        }, 300);
      }
    }, 100);
  }

  private setProgress(value: number) {
    this.currentProgress = value;
    if (this.element) {
      const bar = this.element.querySelector('.navigation-progress-bar') as HTMLDivElement;
      if (bar) {
        bar.style.width = `${value}%`;
      }
    }
  }

  private clearTimers() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  private createElement() {
    this.element = document.createElement('div');
    this.element.className = 'navigation-progress-container';
    this.element.innerHTML = `
      <div class="navigation-progress-bar"></div>
      <div class="navigation-progress-glow"></div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      .navigation-progress-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        z-index: 9999;
        pointer-events: none;
        display: none;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .navigation-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6);
        width: 0;
        transition: width 0.3s ease;
        box-shadow:
          0 0 10px rgba(59, 130, 246, 0.7),
          0 0 20px rgba(59, 130, 246, 0.5),
          0 0 30px rgba(59, 130, 246, 0.3);
        position: relative;
        overflow: hidden;
      }

      .navigation-progress-bar::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        width: 100px;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.3),
          transparent
        );
        animation: shimmer 1s ease-in-out infinite;
      }

      .navigation-progress-glow {
        position: absolute;
        top: 0;
        right: 0;
        width: 10px;
        height: 100%;
        background: white;
        filter: blur(5px);
        opacity: 0.8;
        transform: translateX(100%);
        animation: glow 1s ease-in-out infinite;
      }

      @keyframes shimmer {
        0% {
          transform: translateX(-100px);
        }
        100% {
          transform: translateX(100%);
        }
      }

      @keyframes glow {
        0%, 100% {
          opacity: 0.8;
        }
        50% {
          opacity: 0.3;
        }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(this.element);
  }

  destroy() {
    this.clearTimers();
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
    }
  }
}

let progressBar: ProgressBar | null = null;

export const useNavigationProgress = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!progressBar) {
      progressBar = new ProgressBar();
    }

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    progressBar.start();

    const timer = setTimeout(() => {
      progressBar?.done();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [pathname, searchParams]);

  useEffect(() => {
    return () => {
      if (progressBar) {
        progressBar.destroy();
        progressBar = null;
      }
    };
  }, []);
};