import { useCallback } from 'react';
import useChatContext from './useChatContext';

const useChatAPI = () => {
  const {
    generateAIResponse: contextGenerateAIResponse,
    handleGeneratedReply,
    handleStreamingChunk,
    handleStreamingComplete,
    resetStreamingState,
    isStreaming,
    streamLocation
  } = useChatContext();

  // Wrap the context generateAIResponse to maintain compatibility
  const generateAIResponse = useCallback(async (userPrompt, aiMessageId, redditLink = null, contentType = null) => {
    return await contextGenerateAIResponse(userPrompt, aiMessageId, redditLink, contentType);
  }, [contextGenerateAIResponse]);


  return {
    generateAIResponse,
    handleGeneratedReply,
    handleStreamingChunk,
    handleStreamingComplete,
    resetStreamingState,
    isStreaming,
    streamLocation
  };
};

export default useChatAPI;