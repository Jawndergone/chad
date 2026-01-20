'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Message } from '@/types';
import { OnboardingData } from './OnboardingFlow';

interface ChatInterfaceProps {
  userName: string;
  userProfile: OnboardingData;
  userId: string;
}

export default function ChatInterface({ userName, userProfile, userId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load message history on mount
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/chat?userId=${userId}`);
        const data = await response.json();

        if (data.messages && data.messages.length > 0) {
          setMessages(
            data.messages.map((msg: any) => ({
              id: msg.id,
              user_id: msg.user_id,
              role: msg.role,
              content: msg.content,
              timestamp: msg.created_at,
            }))
          );
        } else {
          // No history, show welcome message
          setMessages([
            {
              id: '1',
              user_id: 'system',
              role: 'assistant',
              content: `Hey ${userName}! I'm Chad, your fitness buddy. I've calculated your daily targets based on your goals. Just text me what you're eating and I'll track everything for you! 💪`,
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        // Show welcome message on error
        setMessages([
          {
            id: '1',
            user_id: 'system',
            role: 'assistant',
            content: `Hey ${userName}! I'm Chad, your fitness buddy. I've calculated your daily targets based on your goals. Just text me what you're eating and I'll track everything for you! 💪`,
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadMessages();
  }, [userId, userName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      user_id: 'user-123', // TODO: Replace with actual user ID
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsSending(true);

    try {
      // Call AI API to get Chad's response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
          userProfile,
          userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        user_id: 'system',
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        user_id: 'system',
        role: 'assistant',
        content: "Oops! I'm having trouble connecting right now. Try again in a sec! 💪",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatMessageGroupTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const timeString = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    if (isToday) {
      return `Today ${timeString}`;
    } else if (isYesterday) {
      return `Yesterday ${timeString}`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const shouldShowTimestamp = (index: number) => {
    if (index === 0) return true;
    const currentMsg = messages[index];
    const prevMsg = messages[index - 1];
    const currentTime = new Date(currentMsg.timestamp);
    const prevTime = new Date(prevMsg.timestamp);
    const diffMinutes = (currentTime.getTime() - prevTime.getTime()) / (1000 * 60);
    return diffMinutes > 15; // Show timestamp if more than 15 minutes apart
  };

  const isLastUserMessage = (index: number) => {
    // Find the last message from user
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        return i === index;
      }
    }
    return false;
  };

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header */}
      <div className="bg-[#1C1C1E] border-b border-gray-800 pt-2 pb-3">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-2 overflow-hidden shadow-md">
              <Image
                src="/chad-logo.png"
                alt="Chad"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="font-semibold text-white text-sm">Chad</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 pt-8 pb-6 bg-black">
        <div className="space-y-4">
        {messages.map((message, index) => (
          <div key={message.id}>
            {/* Timestamp */}
            {shouldShowTimestamp(index) && (
              <div className="text-center mb-3 mt-2">
                <span className="text-[13px] text-gray-500">
                  {formatMessageGroupTime(message.timestamp)}
                </span>
              </div>
            )}

            {/* Message */}
            <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex flex-col max-w-[70%]`}>
                <div
                  className={`rounded-[20px] px-4 py-2.5 ${
                    message.role === 'user'
                      ? 'bg-[#3478F6] text-white rounded-br-[4px]'
                      : 'bg-[#3A3A3C] text-white rounded-bl-[4px]'
                  }`}
                >
                  <p className="text-[20px] leading-[25px]">
                    {message.content}
                  </p>
                </div>

                {/* Delivered receipt for most recent user message only */}
                {message.role === 'user' && isLastUserMessage(index) && (
                  <span className="text-[11px] text-gray-500 mt-0.5 text-right">
                    Delivered
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start mt-4">
            <div className="bg-[#3A3A3C] rounded-[20px] rounded-bl-[4px] px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[#2C2C2E] bg-[#1C1C1E] px-4 py-2.5">
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-[#2C2C2E] border border-[#3A3A3C] rounded-full px-4 py-2 flex items-center min-h-[36px]">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="iMessage"
              className="flex-1 bg-transparent outline-none text-white text-[17px] placeholder:text-[#636366]"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isSending}
            className="w-9 h-9 bg-[#3478F6] rounded-full flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
