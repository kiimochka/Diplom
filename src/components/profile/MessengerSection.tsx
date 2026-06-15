// src/components/profile/MessengerSection.tsx
import React, { useEffect, useState } from "react";
import ChatsPage from "../../pages/ChatsPage";
import ChatDialogPage from "../../pages/ChatDialogPage";

type MessengerSectionProps = {
  initialChatId?: string | null;
};

const MessengerSection: React.FC<MessengerSectionProps> = ({
  initialChatId = null,
}) => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(
    initialChatId,
  );

  useEffect(() => {
    if (initialChatId) {
      setSelectedChatId(initialChatId);
    }
  }, [initialChatId]);

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
