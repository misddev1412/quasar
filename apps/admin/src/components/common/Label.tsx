import React from 'react';
import clsx from 'clsx';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    className?: string;
    required?: boolean;
}

export const Label: React.FC<LabelProps> = ({ className, required, children, ...props }) => {
    return (
        <label
            className={clsx(
                'block text-sm font-medium text-gray-700 mb-1',
                className
            )}
            {...props}
        >
            {children}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
    );
};
