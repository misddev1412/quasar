'use client';

import { useState } from 'react';
import { trpc } from '@/utils/trpc';
import { useToast } from '@/contexts/ToastContext';

export default function NewsletterSubscription() {
    const [email, setEmail] = useState('');
    const { showToast } = useToast();

    const subscribeMutation = trpc.clientNewsletter.subscribe.useMutation({
        onSuccess: () => {
            showToast('Subscribed successfully!', 'success');
            setEmail('');
        },
        onError: (error) => {
            showToast(error.message || 'Failed to subscribe', 'error');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            showToast('Please enter your email address', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }

        subscribeMutation.mutate({ email });
    };

    return (
        <section className="bg-gray-100 dark:bg-gray-800 py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Stay Updated
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                    Subscribe to our newsletter to receive the latest news and updates directly in your inbox.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 dark:placeholder-gray-400"
                        disabled={subscribeMutation.isLoading}
                    />
                    <button
                        type="submit"
                        disabled={subscribeMutation.isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50"
                    >
                        {subscribeMutation.isLoading ? 'Subscribing...' : 'Subscribe'}
                    </button>
                </form>
            </div>
        </section>
    );
}
