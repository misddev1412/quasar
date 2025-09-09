import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
  signOut, 
  User as FirebaseUser,
  sendSignInLinkToEmail,
  ActionCodeSettings
} from 'firebase/auth';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
}

export class FirebaseService {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private googleProvider: GoogleAuthProvider;
  private facebookProvider: FacebookAuthProvider;
  private twitterProvider: TwitterAuthProvider;
  private githubProvider: GithubAuthProvider;
  private initialized = false;

  constructor() {
    // Google provider
    this.googleProvider = new GoogleAuthProvider();
    this.googleProvider.setCustomParameters({
      prompt: 'select_account'
    });

    // Facebook provider
    this.facebookProvider = new FacebookAuthProvider();
    this.facebookProvider.setCustomParameters({
      display: 'popup'
    });

    // Twitter provider
    this.twitterProvider = new TwitterAuthProvider();

    // GitHub provider
    this.githubProvider = new GithubAuthProvider();
    this.githubProvider.setCustomParameters({
      allow_signup: 'true'
    });
  }

  async initialize(config: FirebaseConfig): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      console.log('🔥 Attempting Firebase initialization with config:', JSON.stringify(config, null, 2));
      this.app = initializeApp(config);
      this.auth = getAuth(this.app);
      this.initialized = true;
      console.log('✅ Firebase initialized successfully');
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
      console.error('❌ Config that failed:', JSON.stringify(config, null, 2));
      throw error; // Throw original error to see Firebase's specific message
    }
  }

  async signInWithEmail(email: string, password: string): Promise<string> {
    if (!this.auth) {
      throw new Error('Firebase not initialized');
    }

    // If no password provided, send email link for passwordless authentication
    if (!password || password.trim() === '') {
      await this.sendSignInLinkToEmail(email);
      throw new Error('Email sent! Check your inbox for the login link.');
    }

    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      return idToken;
    } catch (error: any) {
      console.error('Firebase email sign-in failed:', error);
      throw new Error(this.getFirebaseErrorMessage(error.code));
    }
  }

  async sendSignInLinkToEmail(email: string): Promise<void> {
    if (!this.auth) {
      throw new Error('Firebase not initialized');
    }

    const actionCodeSettings: ActionCodeSettings = {
      // URL you want to redirect back to after sign in
      url: `${window.location.origin}/auth/login`,
      // This must be true for email link sign-in
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(this.auth, email, actionCodeSettings);
      // Store the email locally so we can complete the sign-in process
      window.localStorage.setItem('emailForSignIn', email);
    } catch (error: any) {
      console.error('Firebase email link send failed:', error);
      throw new Error(this.getFirebaseErrorMessage(error.code));
    }
  }

  async signInWithGoogle(): Promise<string> {
    if (!this.auth) {
      throw new Error('Firebase not initialized');
    }

    try {
      const userCredential = await signInWithPopup(this.auth, this.googleProvider);
      const idToken = await userCredential.user.getIdToken();
      return idToken;
    } catch (error: any) {
      console.error('Firebase Google sign-in failed:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in cancelled by user');
      }
      throw new Error(this.getFirebaseErrorMessage(error.code));
    }
  }

  async signInWithFacebook(): Promise<string> {
    if (!this.auth) {
      throw new Error('Firebase not initialized');
    }

    try {
      const userCredential = await signInWithPopup(this.auth, this.facebookProvider);
      const idToken = await userCredential.user.getIdToken();
      return idToken;
    } catch (error: any) {
      console.error('Firebase Facebook sign-in failed:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in cancelled by user');
      }
      throw new Error(this.getFirebaseErrorMessage(error.code));
    }
  }

  async signInWithTwitter(): Promise<string> {
    if (!this.auth) {
      throw new Error('Firebase not initialized');
    }

    try {
      const userCredential = await signInWithPopup(this.auth, this.twitterProvider);
      const idToken = await userCredential.user.getIdToken();
      return idToken;
    } catch (error: any) {
      console.error('Firebase Twitter sign-in failed:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in cancelled by user');
      }
      throw new Error(this.getFirebaseErrorMessage(error.code));
    }
  }

  async signInWithGithub(): Promise<string> {
    if (!this.auth) {
      throw new Error('Firebase not initialized');
    }

    try {
      const userCredential = await signInWithPopup(this.auth, this.githubProvider);
      const idToken = await userCredential.user.getIdToken();
      return idToken;
    } catch (error: any) {
      console.error('Firebase GitHub sign-in failed:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in cancelled by user');
      }
      throw new Error(this.getFirebaseErrorMessage(error.code));
    }
  }

  async signOut(): Promise<void> {
    if (!this.auth) {
      throw new Error('Firebase not initialized');
    }

    try {
      await signOut(this.auth);
    } catch (error: any) {
      console.error('Firebase sign-out failed:', error);
      throw new Error('Sign-out failed');
    }
  }

  getCurrentUser(): FirebaseUser | null {
    if (!this.auth) {
      return null;
    }
    return this.auth.currentUser;
  }

  async getCurrentUserIdToken(): Promise<string | null> {
    const user = this.getCurrentUser();
    if (!user) {
      return null;
    }

    try {
      return await user.getIdToken();
    } catch (error) {
      console.error('Failed to get ID token:', error);
      return null;
    }
  }

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    if (!this.auth) {
      throw new Error('Firebase not initialized');
    }

    return this.auth.onAuthStateChanged(callback);
  }

  private getFirebaseErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No user found with this email address';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Please try again later';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      case 'auth/popup-blocked':
        return 'Popup was blocked by the browser';
      case 'auth/cancelled-popup-request':
        return 'Sign-in was cancelled';
      default:
        return 'Authentication failed. Please try again';
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export a singleton instance
export const firebaseService = new FirebaseService();