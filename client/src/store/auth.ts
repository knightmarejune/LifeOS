import { create } from 'zustand';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User,
  getIdToken
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  login: async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  },
  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  },
}));

// Initialize listener
onAuthStateChanged(auth, (user) => {
  useAuthStore.setState({ user, loading: false });
});

export const getAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  return await getIdToken(user);
};
