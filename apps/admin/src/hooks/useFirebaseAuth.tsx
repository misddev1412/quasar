import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { firebaseService } from '../services/firebase.service';
import { trpc } from '../utils/trpc';

interface FirebaseAuthContextType {
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  initialized: boolean;
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signInWithFacebook: () => Promise<any>;
  signInWithTwitter: () => Promise<any>;
  signInWithGithub: () => Promise<any>;
  signOut: () => Promise<void>;
  loginWithFirebase: (idToken: string) => Promise<any>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | null>(null);

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
};

interface FirebaseAuthProviderProps {
  children: React.ReactNode;
}

export const FirebaseAuthProvider: React.FC<FirebaseAuthProviderProps> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Get active Firebase configuration from public endpoint (no auth required)
  // Using safe access with fallback for when endpoint isn't available yet
  let configData = null;
  let configError = null;

  try {
    // Try to use the public endpoint if available
    const result = ((trpc as any).publicAuth?.getFirebaseConfig?.useQuery?.() || { data: null, error: null });
    configData = result.data;
    configError = result.error;
  } catch (error) {
    // Endpoint not available yet - this is expected until backend restart
    console.warn('⚠️ Public Firebase endpoint not available yet. Backend needs restart.');
    configError = error;
  }

  // Log configuration status
  React.useEffect(() => {
    if (configData?.data) {
      console.log('✅ Firebase config loaded successfully:', {
        projectId: configData.data.projectId,
        authDomain: configData.data.authDomain
      });
    } else if (configError) {
      console.error('❌ Failed to fetch Firebase config:', configError);
    } else if (configData?.data === null) {
      console.warn('⚠️ No active Firebase configuration found');
    }
  }, [configData, configError]);

  // Firebase login mutation using tRPC
  const loginWithFirebaseMutation = trpc.adminAuth.loginWithFirebase.useMutation();

  type RegisterFCMTokenInput = {
    token: string;
    deviceInfo?: {
      platform?: 'web' | 'android' | 'ios';
      userAgent?: string;
      [key: string]: unknown;
    };
  };

  type RegisterFCMTokenMutation = {
    mutateAsync: (input: RegisterFCMTokenInput) => Promise<unknown>;
  };

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initializeFirebase = async () => {
      try {
        // Check if we have active Firebase config data
        const activeConfig = (configData as any)?.data;

        console.log('Firebase initialization check:', {
          hasConfigData: !!configData,
          hasActiveConfig: !!activeConfig,
          isAlreadyInitialized: firebaseService.isInitialized()
        });

        if (activeConfig && !firebaseService.isInitialized()) {
          console.log('🔥 useFirebaseAuth: Initializing Firebase with config:', activeConfig);
          try {
            await firebaseService.initialize(activeConfig);
            setInitialized(true);
            console.log('✅ useFirebaseAuth: Firebase initialization completed successfully');
          } catch (error) {
            console.error('❌ useFirebaseAuth: Firebase initialization failed:', error);
            setInitialized(false);
            throw error;
          }

          // Set up auth state listener
          unsubscribe = firebaseService.onAuthStateChanged((user) => {
            setFirebaseUser(user);
            setLoading(false);
          });
        } else if (!activeConfig) {
          console.warn('❌ No active Firebase configuration found');
          setLoading(false);
        } else {
          console.log('📝 Firebase already initialized');
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Failed to initialize Firebase:', error);
        setLoading(false);
      }
    };

    // Initialize Firebase when we get configuration data
    if (configData) {
      initializeFirebase();
    } else {
      // Set loading to false if no config data is available
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [configData]);

  const registerFCMTokenMutation: RegisterFCMTokenMutation =
    ((trpc as any).userNotification?.registerFCMToken?.useMutation?.() as RegisterFCMTokenMutation | undefined) ??
    {
      mutateAsync: async () => {
        console.warn('⚠️ userNotification.registerFCMToken mutation is not available yet.');
      },
    };

  // Handle FCM token registration when user is logged in
  useEffect(() => {
    const registerToken = async () => {
      if (firebaseUser && initialized && firebaseService.isMessagingSupported()) {
        try {
          const permission = await firebaseService.requestNotificationPermission();
          if (permission === 'granted') {
            const token = await firebaseService.getFCMToken();
            if (token) {
              await registerFCMTokenMutation.mutateAsync({
                token,
                deviceInfo: {
                  platform: 'web',
                  userAgent: navigator.userAgent
                }
              });
              console.log('✅ FCM token registered with backend');
            }
          }
        } catch (error) {
          console.error('❌ Failed to register FCM token:', error);
        }
      }
    };

    registerToken();
  }, [firebaseUser, initialized]);

  const signInWithEmail = async (email: string, password: string) => {
    if (!initialized) {
      throw new Error('Firebase not initialized');
    }

    const idToken = await firebaseService.signInWithEmail(email, password);
    return loginWithFirebaseMutation.mutateAsync({ firebaseIdToken: idToken });
  };

  const signInWithGoogle = async () => {
    if (!initialized) {
      throw new Error('Firebase not initialized');
    }

    const idToken = await firebaseService.signInWithGoogle();
    return loginWithFirebaseMutation.mutateAsync({ firebaseIdToken: idToken });
  };

  const signInWithFacebook = async () => {
    if (!initialized) {
      throw new Error('Firebase not initialized');
    }

    const idToken = await firebaseService.signInWithFacebook();
    return loginWithFirebaseMutation.mutateAsync({ firebaseIdToken: idToken });
  };

  const signInWithTwitter = async () => {
    if (!initialized) {
      throw new Error('Firebase not initialized');
    }

    const idToken = await firebaseService.signInWithTwitter();
    return loginWithFirebaseMutation.mutateAsync({ firebaseIdToken: idToken });
  };

  const signInWithGithub = async () => {
    if (!initialized) {
      throw new Error('Firebase not initialized');
    }

    const idToken = await firebaseService.signInWithGithub();
    return loginWithFirebaseMutation.mutateAsync({ firebaseIdToken: idToken });
  };

  const signOut = async () => {
    await firebaseService.signOut();
    // You might want to also clear local storage tokens here
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const loginWithFirebase = async (idToken: string) => {
    return loginWithFirebaseMutation.mutateAsync({ firebaseIdToken: idToken });
  };

  const value: FirebaseAuthContextType = {
    firebaseUser,
    loading,
    initialized,
    signInWithEmail,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    signInWithGithub,
    signOut,
    loginWithFirebase,
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};
