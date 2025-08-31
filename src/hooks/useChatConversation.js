import { useState, useRef, useCallback } from 'react';

const useChatConversation = () => {
  const [conversation, setConversation] = useState([]);
  const messageIdCounter = useRef(0);

  // Create a user message
  const createUserMessage = useCallback((content, redditLink = null, contentType = null) => {
    const userMessage = {
      id: `user_${Date.now()}_${++messageIdCounter.current}`,
      type: 'user',
      content,
      timestamp: new Date(),
      redditLink,
      contentType
    };
    
    setConversation(prev => [...prev, userMessage]);
    return userMessage;
  }, []);

  // Create an AI message placeholder
  const createAIMessage = useCallback((redditLink = null, contentType = null) => {
    const aiMessageId = `ai_${Date.now()}_${++messageIdCounter.current}`;
    const aiMessage = {
      id: aiMessageId,
      type: 'ai',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      redditLink,
      contentType
    };
    
    setConversation(prev => [...prev, aiMessage]);
    return aiMessageId;
  }, []);

  // Update an AI message
  const updateAIMessage = useCallback((messageId, updates) => {
    setConversation(prev => 
      prev.map(msg => 
        msg.id === messageId
          ? { ...msg, ...updates }
          : msg
      )
    );
  }, []);

  // Clear all conversations
  const clearConversation = useCallback(() => {
    setConversation([]);
    messageIdCounter.current = 0;
  }, []);

  // Get chat history for API (last 6 messages)
  const getChatHistory = useCallback(() => {
    return conversation
      .slice(-6)
      .map(msg => {
        if (msg.type === 'user') {
          return `User: ${msg.content}`;
        } else {
          return `Cassius: ${msg.content}`;
        }
      })
      .join('\n');
  }, [conversation]);

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