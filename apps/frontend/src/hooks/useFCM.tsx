import { useEffect, useState } from 'react';
import { firebaseService } from '../services/firebase.service';
import { useAuth } from '../contexts/AuthContext';
import { notificationService } from '../services/notification.service';
import { trpc } from '../utils/trpc';

export const useFCM = () => {
    const { user, isAuthenticated } = useAuth();
    const [initialized, setInitialized] = useState(false);

    // Fetch Firebase config
    const { data: configData } = (trpc as any).publicAuth?.getFirebaseConfig?.useQuery?.() || { data: null };

    // Initialize Firebase
    useEffect(() => {
        const initFirebase = async () => {
            const activeConfig = configData?.data;

            if (activeConfig && !firebaseService.isInitialized()) {
                try {
                    await firebaseService.initialize(activeConfig);
                    setInitialized(true);
                } catch (error) {
                    console.error('❌ FCM: Firebase initialization failed:', error);
                }
            } else if (firebaseService.isInitialized()) {
                setInitialized(true);
            }
        };

        if (configData) {
            initFirebase();
        }
    }, [configData]);

    // Register Token
    useEffect(() => {
        const registerToken = async () => {
            if (isAuthenticated && user && initialized && firebaseService.isMessagingSupported()) {
                try {
                    const permission = await firebaseService.requestNotificationPermission();
                    if (permission === 'granted') {
                        const token = await firebaseService.getFCMToken();
                        if (token) {
                            await notificationService.registerFCMToken(token, {
                                platform: 'web',
                                userAgent: navigator.userAgent
                            });
                        }
                    }
                } catch (error) {
                    console.error('❌ FCM: Failed to register token:', error);
                }
            }
        };

        registerToken();
    }, [isAuthenticated, user, initialized]);

    return { initialized };
};
