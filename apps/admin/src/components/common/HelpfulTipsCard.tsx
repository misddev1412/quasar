import React from 'react';
import { FiInfo } from 'react-icons/fi';

interface HelpfulTipsCardProps {
  title: string;
  items: string[];
  className?: string;
}

const HelpfulTipsCard: React.FC<HelpfulTipsCardProps> = ({ title, items, className = '' }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className={`rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 ${className}`.trim()}>
      <div className="p-5 md:p-6">
        <div className="flex items-start gap-4">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300">
            <FiInfo className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">{title}</h4>
            <ul className="mt-2.5 list-disc space-y-1.5 pl-5 text-sm leading-6 text-blue-800 dark:text-blue-200">
              {items.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpfulTipsCard;
