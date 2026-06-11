import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "../types";
import { USERS_STORAGE_KEY } from "../mockData"; // или из constants.ts

interface AuthContextValue {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  deleteProfile: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "rideshare-user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // при загрузке читаем авторизованного пользователя
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: User = JSON.parse(stored);
        setUser(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const login = (newUser: User) => {
    // текущий залогиненный
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));

    // обновляем общий список пользователей
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    let users: User[] = [];

    if (stored) {
      try {
        users = JSON.parse(stored) as User[];
      } catch {
        users = [];
      }
    }

    const index = users.findIndex((u) => u.id === newUser.id);

    if (index >= 0) {
      users[index] = newUser; // обновить существующего
    } else {
      users.push(newUser); // добавить нового
    }

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const deleteProfile = () => {
    // MVP: просто выходим и чистим localStorage
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    // при желании можно ещё удалить его из USERS_STORAGE_KEY
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, deleteProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
