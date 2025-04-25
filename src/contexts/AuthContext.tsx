
import { createContext, useContext, useState, ReactNode } from "react";
import { User } from "@/types";

// Mock admin credentials for demonstration
const ADMIN_CREDENTIALS = {
  email: "admin@railway.com",
  password: "admin123",
};

// Sample initial users for demonstration
const INITIAL_USERS: User[] = [
  {
    id: "admin-1",
    email: "admin@railway.com",
    role: "admin",
    name: "Admin User",
  },
  {
    id: "customer-1",
    email: "customer@example.com",
    role: "customer",
    name: "Sample Customer",
    phoneNumber: "123-456-7890",
  },
];

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
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Mock login function - In a real app, this would call an API
  const login = async (email: string, password: string): Promise<User | null> => {
    // Simple admin validation
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const adminUser = users.find(user => user.email === email && user.role === "admin");
      if (adminUser) {
        setCurrentUser(adminUser);
        setIsAuthenticated(true);
        return adminUser;
      }
    }

    // Find customer user (in a real app, we would verify password hash)
    const user = users.find(user => user.email === email && user.role === "customer");
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      return user;
    }

    return null;
  };

  // Mock register function - In a real app, this would call an API
  const register = async (
    email: string, 
    password: string,
    phoneNumber?: string
  ): Promise<User | null> => {
    // Check if user already exists
    if (users.some(user => user.email === email)) {
      return null;
    }

    // Create new user
    const newUser: User = {
      id: `customer-${users.length + 1}`,
      email,
      role: "customer",
      phoneNumber,
    };

    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    
    return newUser;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
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
      {children}
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
