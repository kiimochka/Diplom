// src/pages/ChatDialogPage.tsx
import React, { useEffect, useRef, useState, FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import {
  CHATS_STORAGE_KEY,
  Chat,
  ChatMessage,
  TRIPS_STORAGE_KEY,
  Trip,
  USERS_STORAGE_KEY,
  User,
} from "../types";
import { Arrow, People } from "../icons/IconsIndex";

type ChatDialogPageProps = {
  chatId: string;
  onBack: () => void;
};

const ChatDialogPage: React.FC<ChatDialogPageProps> = ({ chatId, onBack }) => {
  const { user } = useAuth();

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [text, setText] = useState("");
  const messageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!user || !chatId) return;

    const storedChats = localStorage.getItem(CHATS_STORAGE_KEY);
    if (storedChats) {
      try {
        const allChats = JSON.parse(storedChats) as Chat[];
        const found = allChats.find((c) => c.id === chatId) || null;
        setChat(found);
      } catch {
        setChat(null);
      }
    }

    const storedMessages = localStorage.getItem("rideshare-chat-messages");
    if (storedMessages) {
      try {
        const allMessages = JSON.parse(storedMessages) as ChatMessage[];
        setMessages(allMessages.filter((m) => m.chatId === chatId));
      } catch {
        setMessages([]);
      }
    }
  }, [user, chatId]);

  // отдельный useEffect для trip и otherUser, когда chat уже найден
  useEffect(() => {
    if (!chat) return;

    const storedTrips = localStorage.getItem(TRIPS_STORAGE_KEY);
    if (storedTrips) {
      try {
        const trips = JSON.parse(storedTrips) as Trip[];
        const t = trips.find((tr) => tr.id === chat.tripId) || null;
        setTrip(t);
      } catch {
        setTrip(null);
      }
    }

    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers && user) {
      try {
        const users = JSON.parse(storedUsers) as User[];
        const otherId =
          chat.driverId === user.id ? chat.passengerId : chat.driverId;
        setOtherUser(users.find((u) => u.id === otherId) || null);
      } catch {
        setOtherUser(null);
      }
    }
  }, [chat, user]);

  useEffect(() => {
    if (chat) {
      messageInputRef.current?.focus();
    }
  }, [chat]);

  if (!user) {
    return <p>Для доступа к чату нужно войти.</p>;
  }
  if (!chat) {
    return <p>Чат не найден.</p>;
  }

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      chatId: chat.id,
      senderId: user.id,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    const storedMessages = localStorage.getItem("rideshare-chat-messages");
    let allMessages: ChatMessage[] = [];
    if (storedMessages) {
      try {
        allMessages = JSON.parse(storedMessages) as ChatMessage[];
      } catch {
        allMessages = [];
      }
    }
    const updatedMessages = [...allMessages, newMessage];
    localStorage.setItem(
      "rideshare-chat-messages",
      JSON.stringify(updatedMessages),
    );
    setMessages((prev) => [...prev, newMessage]);

    const storedChats = localStorage.getItem(CHATS_STORAGE_KEY);
    let allChats: Chat[] = [];
    if (storedChats) {
      try {
        allChats = JSON.parse(storedChats) as Chat[];
      } catch {
        allChats = [];
      }
    }

    const updatedChats = allChats.map((c) =>
      c.id === chat.id
        ? {
            ...c,
            lastMessage: newMessage.text,
            lastMessageAt: newMessage.createdAt,
          }
        : c,
    );
    localStorage.setItem(CHATS_STORAGE_KEY, JSON.stringify(updatedChats));

    setChat((prev) =>
      prev
        ? {
            ...prev,
            lastMessage: newMessage.text,
            lastMessageAt: newMessage.createdAt,
          }
        : prev,
    );

    setText("");
  };

  return (
    <div className="chat-dialog-page">
      <div className="chat-header">
        <button type="button" className="chat-header-back" onClick={onBack}>
          <Arrow aria-hidden="true" />
        </button>

        <div className="chat-header-avatar">
          <div className="avatar-circle">
            <People aria-hidden="true" />
          </div>
        </div>
        <div className="chat-header-info">
          <div className="chat-header-name">
            {otherUser?.fullName || "Пользователь"}
          </div>
          {trip && (
            <div className="chat-header-trip">
              {trip.fromCity} → {trip.toCity}
            </div>
          )}
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((m) => {
          const isMine = m.senderId === user.id;
          return (
            <div
              key={m.id}
              className={`chat-message ${isMine ? "mine" : "theirs"}`}
            >
              <div className="chat-message-text">{m.text}</div>
            </div>
          );
        })}
      </div>

      <form className="chat-input" onSubmit={handleSend}>
        <input
          ref={messageInputRef}
          type="text"
          placeholder="Напишите сообщение..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">Отправить</button>
      </form>
    </div>
  );
};

export default ChatDialogPage;
