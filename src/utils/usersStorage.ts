import { mockUsers } from "../mockData";
import { User, USERS_STORAGE_KEY } from "../types";

export const readUsers = (): User[] => {
  if (typeof window === "undefined") return mockUsers;

  const usersById = new Map<string, User>();
  mockUsers.forEach((user) => usersById.set(user.id, user));

  const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
  if (!storedUsers) return Array.from(usersById.values());

  try {
    const parsedUsers = JSON.parse(storedUsers);
    if (!Array.isArray(parsedUsers)) return Array.from(usersById.values());

    parsedUsers.forEach((user) => {
      if (user && typeof user.id === "string") {
        usersById.set(user.id, { ...usersById.get(user.id), ...user });
      }
    });
  } catch {
    return Array.from(usersById.values());
  }

  return Array.from(usersById.values());
};

export const getUserById = (userId: string) =>
  readUsers().find((user) => user.id === userId) ?? null;
