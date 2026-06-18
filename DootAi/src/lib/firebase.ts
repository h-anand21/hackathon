import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Prevent re-initializing the Firebase app on hot-reloads
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const realAuth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

let guestUser: any = null;
if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem('dootai_guest_session');
    if (stored) {
      guestUser = JSON.parse(stored);
    }
  } catch (e) {}
}

const listeners = new Set<any>();

// Real state change listener
if (typeof window !== 'undefined') {
  realAuth.onAuthStateChanged((user) => {
    if (user) {
      guestUser = null;
      localStorage.removeItem('dootai_guest_session');
      listeners.forEach(l => l(user));
    }
  });
}

const auth = new Proxy(realAuth, {
  get(target, prop, receiver) {
    if (prop === 'currentUser') {
      return guestUser || target.currentUser;
    }
    if (prop === 'onAuthStateChanged') {
      return (callback: any, onError?: any) => {
        listeners.add(callback);
        // Call immediately with current state
        const current = guestUser || target.currentUser;
        setTimeout(() => {
          try {
            callback(current);
          } catch (err) {
            if (onError) onError(err);
          }
        }, 0);
        
        return () => {
          listeners.delete(callback);
        };
      };
    }
    if (prop === 'signOut') {
      return async () => {
        guestUser = null;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('dootai_guest_session');
        }
        await target.signOut();
        listeners.forEach(l => l(null));
      };
    }
    if (prop === 'signInAsGuest') {
      return async (mockData: any) => {
        guestUser = mockData;
        if (typeof window !== 'undefined') {
          localStorage.setItem('dootai_guest_session', JSON.stringify(mockData));
        }
        listeners.forEach(l => l(mockData));
      };
    }
    
    const value = Reflect.get(target, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(target);
    }
    return value;
  }
}) as unknown as Auth & { signInAsGuest?: (mockData: any) => Promise<void> };

export { app, auth, googleProvider };
