
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User as FirebaseUser, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import { ref, set, get, child } from "firebase/database";
import { auth, database } from "@/services/firebase";
import { User } from "@/types";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<User | null>;
  register: (email: string, password: string, phoneNumber?: string) => Promise<User | null>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user data from database
        try {
          const userRef = ref(database, `users/${firebaseUser.uid}`);
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            const userData = snapshot.val();
            const user: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              role: userData.role || 'customer',
              name: userData.name || firebaseUser.displayName || '',
              phoneNumber: userData.phoneNumber || '',
            };
            setCurrentUser(user);
            setIsAuthenticated(true);
          } else {
            // If user doesn't exist in the database yet (strange case)
            setCurrentUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast({
            title: "Error",
            description: "Failed to load user profile",
            variant: "destructive",
          });
        }
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  // Load all users (admin only feature)
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      const fetchUsers = async () => {
        try {
          const usersRef = ref(database, 'users');
          const snapshot = await get(usersRef);
          
          if (snapshot.exists()) {
            const usersData = snapshot.val();
            const usersList: User[] = Object.entries(usersData).map(([id, data]: [string, any]) => ({
              id,
              email: data.email,
              role: data.role,
              name: data.name || '',
              phoneNumber: data.phoneNumber || '',
            }));
            setUsers(usersList);
          }
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };
      fetchUsers();
    }
  }, [currentUser]);

  // Login function
  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get user role and data from database
      const userRef = ref(database, `users/${firebaseUser.uid}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const userData = snapshot.val();
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          role: userData.role || 'customer',
          name: userData.name || firebaseUser.displayName || '',
          phoneNumber: userData.phoneNumber || '',
        };
        setCurrentUser(user);
        setIsAuthenticated(true);
        return user;
      }
      
      return null;
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  };

  // Register function
  const register = async (email: string, password: string, phoneNumber?: string): Promise<User | null> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Create user in database with role customer
      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        role: 'customer',
        phoneNumber
      };
      
      // Save to database
      await set(ref(database, `users/${firebaseUser.uid}`), {
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber || '',
        createdAt: new Date().toISOString()
      });
      
      setCurrentUser(user);
      setIsAuthenticated(true);
      return user;
    } catch (error) {
      console.error("Registration error:", error);
      return null;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        register,
        logout,
        isAuthenticated,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
