'use client';

import React, { useEffect, useState } from 'react';
import { Heading } from '../../utils/toc';
import { List, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TableOfContentsProps {
    headings: Heading[];
    title?: string;
    isSidebar?: boolean;
    variant?: 'default' | 'minimal' | 'sidebar';
}

const TableOfContents: React.FC<TableOfContentsProps> = ({
    headings,
    title = 'Mục lục',
    isSidebar = false,
    variant = 'default'
}) => {
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            {
                rootMargin: '-80px 0% -70% 0%', // Adjusted for sticky header and better triggering
                threshold: 0
            }
        );

        headings.forEach((heading) => {
            const element = document.getElementById(heading.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [headings]);

    if (!headings || headings.length === 0) return null;

    let containerClasses = "";
    if (variant === 'sidebar' || isSidebar) {
        containerClasses = "bg-white/70 dark:bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm";
    } else if (variant === 'minimal') {
        containerClasses = "bg-gray-50/30 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800/50 rounded-2xl p-6 mb-8";
    } else {
        containerClasses = "bg-gray-50/50 dark:bg-gray-800/30 rounded-xl p-6 mb-10 border border-gray-200 dark:border-gray-700";
    }

    return (
        <div className={containerClasses}>
            <div className="flex items-center gap-3 mb-6 text-gray-900 dark:text-white font-bold text-lg">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
                    <List className="w-4 h-4" />
                </div>
                {title}
            </div>
            <nav className="relative">
                {/* Progress Line */}
                <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700 ml-[7px]" />

                <ul className="space-y-1 relative">
                    {headings.map((heading) => {
                        const isActive = activeId === heading.id;
                        return (
                            <li
                                key={heading.id}
                                className="relative"
                                style={{ paddingLeft: `${(heading.level - 2) * 1.25 + 1.5}rem` }}
                            >
                                {/* Active Indicator Dot */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="absolute left-[5px] top-[10px] w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 z-10"
                                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                    />
                                )}

                                <a
                                    href={`#${heading.id}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        const element = document.getElementById(heading.id);
                                        if (element) {
                                            // Offset for sticky header (approx 100px)
                                            const headerOffset = 100;
                                            const elementPosition = element.getBoundingClientRect().top;
                                            const offsetPosition = elementPosition + window.scrollY - headerOffset;

                                            window.scrollTo({
                                                top: offsetPosition,
                                                behavior: 'smooth'
                                            });

                                            window.history.pushState(null, '', `#${heading.id}`);
                                        }
                                    }}
                                    className={`group flex items-center py-2 text-sm transition-all duration-300 ${isActive
                                        ? 'text-blue-600 dark:text-blue-400 font-semibold'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                        }`}
                                >
                                    <span className="line-clamp-2">{heading.text}</span>
                                    <ChevronRight className={`w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100' : ''}`} />
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
};

export default TableOfContents;
