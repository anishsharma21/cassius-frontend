import useChatContext from './useChatContext';

const useChatConversation = () => {
  const {
    conversation,
    setConversation,
    createUserMessage,
    createAIMessage,
    updateAIMessage,
    clearConversation,
    getChatHistory
  } = useChatContext();

  return {
    conversation,
    setConversation,
    createUserMessage,
    createAIMessage,
    updateAIMessage,
    clearConversation,
    getChatHistory
  };
};

export default useChatConversation;