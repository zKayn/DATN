'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestedProducts?: any[];
}

export default function ChatAI() {
  const router = useRouter();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Xin chào! 👋 Tôi là trợ lý AI của \n LP SHOP. Tôi có thể giúp bạn:\n\n• Tìm sản phẩm phù hợp\n• Tư vấn về giá cả, size, màu sắc\n• Giải đáp chính sách cửa hàng\n\nBạn cần tôi hỗ trợ gì?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const conversationHistory = newMessages.slice(1).map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: data.data.message,
            suggestedProducts: data.data.suggestedProducts
          }
        ]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: 'Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này. Vui lòng thử lại sau.'
          }
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Xin lỗi, đã xảy ra lỗi kết nối. Vui lòng thử lại sau.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    '🏃 Giày chạy bộ Nike',
    '💪 Quần áo tập gym',
    '↩️ Chính sách đổi trả',
    '📏 Hướng dẫn chọn size'
  ];

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary-600 via-accent-600 to-secondary-600 text-white rounded-full shadow-lg shadow-glow-gold hover:shadow-2xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center z-50"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-6 md:right-6 md:w-[420px] md:h-[650px] w-full h-full bg-white md:rounded-3xl shadow-2xl flex flex-col z-50 border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-primary-600 via-accent-600 to-secondary-600 text-white p-5 flex items-center justify-between relative overflow-hidden shadow-glow-gold">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="relative">
                <div className="w-11 h-11 bg-white/25 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-white"></span>
              </div>
              <div>
                <h3 className="font-bold text-lg">LP SHOP AI</h3>
                <p className="text-xs text-white/90 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Đang trực tuyến
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200 relative z-10"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((message, index) => (
              <div key={index} className="animate-fadeIn">
                <div className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-600 to-accent-700 flex items-center justify-center flex-shrink-0 shadow-md shadow-glow-gold">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                    </div>
                  )}
                  <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-3 md:px-4 py-2 md:py-3 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-br-sm shadow-glow-red'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden">
                      {user?.anhDaiDien || user?.avatar ? (
                        <Image
                          src={user.anhDaiDien || user.avatar || ''}
                          alt={user.hoTen || user.ten || 'User'}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>

                {/* Suggested Products */}
                {message.suggestedProducts && message.suggestedProducts.length > 0 && (
                  <div className="mt-3 ml-6 md:ml-10 space-y-2">
                    <p className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      Sản phẩm gợi ý
                    </p>
                    {message.suggestedProducts.map((product) => (
                      <div
                        key={product._id}
                        onClick={() => {
                          router.push(`/san-pham/${product.slug || product._id}`);
                          setIsOpen(false);
                        }}
                        className="bg-white rounded-xl p-3 shadow-md border border-gray-100 hover:shadow-lg hover:border-accent-200 transition-all duration-200 cursor-pointer group"
                      >
                        <div className="flex gap-2 md:gap-3">
                          {product.hinhAnh && product.hinhAnh[0] && (
                            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                              <img
                                src={product.hinhAnh[0]}
                                alt={product.ten}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-accent-600 transition-colors">
                              {product.ten}
                            </h4>
                            <div className="flex items-center gap-2">
                              {product.giaKhuyenMai ? (
                                <>
                                  <span className="text-base font-bold text-primary-600">
                                    {product.giaKhuyenMai.toLocaleString('vi-VN')}₫
                                  </span>
                                  <span className="text-xs text-gray-400 line-through">
                                    {product.gia.toLocaleString('vi-VN')}₫
                                  </span>
                                </>
                              ) : (
                                <span className="text-base font-bold text-primary-600">
                                  {product.gia.toLocaleString('vi-VN')}₫
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-1">
                              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs text-green-600 font-medium">Còn hàng</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 justify-start animate-fadeIn">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-600 to-accent-700 flex items-center justify-center flex-shrink-0 shadow-md shadow-glow-gold">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </div>
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-accent-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-accent-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-accent-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="px-3 md:px-4 py-2 md:py-3 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
              <p className="text-xs font-semibold text-gray-600 mb-2">Gợi ý câu hỏi:</p>
              <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(question);
                      inputRef.current?.focus();
                    }}
                    className="text-xs px-3 py-2 bg-gradient-to-r from-accent-50 to-accent-100 text-accent-700 rounded-xl hover:from-accent-100 hover:to-accent-200 transition-all duration-200 border border-accent-200 font-medium"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 md:p-4 border-t border-gray-200 bg-white safe-area-bottom">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi..."
                disabled={loading}
                className="flex-1 px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent disabled:bg-gray-100 text-sm placeholder:text-gray-400"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="w-11 h-11 md:w-12 md:h-12 bg-gradient-to-br from-accent-500 to-accent-600 text-white rounded-2xl hover:from-accent-600 hover:to-accent-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg shadow-glow-gold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">Powered by Gemini AI</p>
          </div>
        </div>
      )}
    </>
  );
}
