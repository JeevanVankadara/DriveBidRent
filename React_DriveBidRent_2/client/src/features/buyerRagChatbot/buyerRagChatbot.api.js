import axiosInstance from '../../utils/axiosInstance.util';

export const askBuyerRagChatbot = async ({ message, history }) => {
  const response = await axiosInstance.post('/buyer/rag-chatbot/query', {
    message,
    history
  });

  return response.data;
};
