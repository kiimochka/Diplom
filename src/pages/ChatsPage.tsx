import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  CHATS_STORAGE_KEY,
  Chat,
  TRIPS_STORAGE_KEY,
  Trip,
  User,
  USERS_STORAGE_KEY,
} from "../types";

type ChatsPageProps = {
  onOpenChat: (chatId: string) => void;
};

const ChatsPage: React.FC<ChatsPageProps> = ({ onOpenChat }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!user) return;

    const storedChats = localStorage.getItem(CHATS_STORAGE_KEY);
    if (storedChats) {
      try {
        const allChats = JSON.parse(storedChats) as Chat[];
        setChats(
          allChats.filter(
            (c) => c.driverId === user.id || c.passengerId === user.id,
          ),
        );
      } catch {
        setChats([]);
      }
    }

    const storedTrips = localStorage.getItem(TRIPS_STORAGE_KEY);
    if (storedTrips) {
      try {
        setTrips(JSON.parse(storedTrips) as Trip[]);
      } catch {
        setTrips([]);
      }
    }

    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
      try {
        setUsers(JSON.parse(storedUsers) as User[]);
      } catch {
        setUsers([]);
      }
    }
  }, [user]);

  if (!user) {
    return <p>Для доступа к чатам нужно войти.</p>;
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  return (
    <div className="chats-page">
      <h1 className="support-title">Чаты</h1>
      <div className="chats-list">
        {chats.length === 0 && <p>У вас пока нет чатов.</p>}

        {chats.map((chat) => {
          const trip = trips.find((t) => t.id === chat.tripId);
          const otherUserId =
            chat.driverId === user.id ? chat.passengerId : chat.driverId;
          const otherUser = users.find((u) => u.id === otherUserId);

          return (
            <button
              key={chat.id}
              type="button"
              className="chat-item"
              onClick={() => onOpenChat(chat.id)}
            >
              <div className="chat-avatar">
                <div className="avatar-circle">
                  {otherUser?.fullName?.[0]?.toUpperCase() || "?"}
                </div>
              </div>

              <div className="chat-main">
                <div className="chat-top-row">
                  <div className="chat-name">
                    {otherUser?.fullName || "Пользователь"}
                  </div>
                  <div className="chat-date">
                    {chat.lastMessageAt ? formatDate(chat.lastMessageAt) : ""}
                  </div>
                </div>

                <div className="chat-bottom-row">
                  <div className="chat-trip">
                    {trip
                      ? `${trip.fromCity} → ${trip.toCity}`
                      : "Маршрут недоступен"}
                  </div>
                  <div className="chat-last-message">
                    {chat.lastMessage || "Без сообщений"}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ChatsPage;
