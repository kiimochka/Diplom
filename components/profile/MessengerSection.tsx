// src/components/profile/MessengerSection.tsx
import React, { useState } from "react";
import ChatsPage from "../../pages/ChatsPage";
import ChatDialogPage from "../../pages/ChatDialogPage";

const MessengerSection: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const handleOpenChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const handleBackToList = () => {
    setSelectedChatId(null);
  };

  if (!selectedChatId) {
    // показываем список чатов
    return <ChatsPage onOpenChat={handleOpenChat} />;
  }

  // показываем сам диалог
  return <ChatDialogPage chatId={selectedChatId} onBack={handleBackToList} />;
};

export default MessengerSection;
