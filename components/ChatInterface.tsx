'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Message } from '@/types';
import { OnboardingData } from './OnboardingFlow';

interface ChatInterfaceProps {
  userName: string;
  userProfile: OnboardingData;
  userId: string;
  onInputFocusChange?: (isFocused: boolean) => void;
}

export default function ChatInterface({ userName, userProfile, userId, onInputFocusChange }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isInputReadonly, setIsInputReadonly] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
          // No history, show welcome messages (multiple short messages)
          const now = new Date().toISOString();
          setMessages([
            {
              id: '1',
              user_id: 'system',
              role: 'assistant',
              content: `Hey ${userName}`,
              timestamp: now,
            },
            {
              id: '2',
              user_id: 'system',
              role: 'assistant',
              content: `I'm Chad`,
              timestamp: now,
            },
            {
              id: '3',
              user_id: 'system',
              role: 'assistant',
              content: `Your fitness buddy`,
              timestamp: now,
            },
            {
              id: '4',
              user_id: 'system',
              role: 'assistant',
              content: `I calculated your daily targets`,
              timestamp: now,
            },
            {
              id: '5',
              user_id: 'system',
              role: 'assistant',
              content: `Just text me what you're eating`,
              timestamp: now,
            },
            {
              id: '6',
              user_id: 'system',
              role: 'assistant',
              content: `I'll track everything for you`,
              timestamp: now,
            },
          ]);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        // Show welcome messages on error (multiple short messages)
        const now = new Date().toISOString();
        setMessages([
          {
            id: '1',
            user_id: 'system',
            role: 'assistant',
            content: `Hey ${userName}`,
            timestamp: now,
          },
          {
            id: '2',
            user_id: 'system',
            role: 'assistant',
            content: `I'm Chad`,
            timestamp: now,
          },
          {
            id: '3',
            user_id: 'system',
            role: 'assistant',
            content: `Your fitness buddy`,
            timestamp: now,
          },
          {
            id: '4',
            user_id: 'system',
            role: 'assistant',
            content: `I calculated your daily targets`,
            timestamp: now,
          },
          {
            id: '5',
            user_id: 'system',
            role: 'assistant',
            content: `Just text me what you're eating`,
            timestamp: now,
          },
          {
            id: '6',
            user_id: 'system',
            role: 'assistant',
            content: `I'll track everything for you`,
            timestamp: now,
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

      // Handle multiple messages from AI response
      const aiMessages = data.messages || [{
        id: (Date.now() + 1).toString(),
        user_id: 'system',
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
      }];

      setMessages(prev => [...prev, ...aiMessages]);
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

  const handleInputTouch = () => {
    // Remove readonly on touch/click BEFORE focus event
    setIsInputReadonly(false);
    // Programmatically focus the input after a brief delay to ensure readonly is removed
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  const handleInputFocus = () => {
    onInputFocusChange?.(true);
  };

  const handleInputBlur = () => {
    // Re-enable readonly when input loses focus to prevent QuickType on next focus
    setTimeout(() => setIsInputReadonly(true), 100);
    onInputFocusChange?.(false);
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
      {/* Top Nav Bar */}
      <div className="bg-black flex-shrink-0 px-4 py-2 flex items-center justify-between">
        <button className="text-[#3478F6] text-[17px] flex items-center">
          <svg width="13" height="21" viewBox="0 0 13 21" fill="none">
            <path d="M10.5 18L3 10.5L10.5 3" stroke="#3478F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="ml-1">Messages</span>
        </button>
        <button className="w-8 h-8 rounded-full flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="1.5" fill="#3478F6"/>
            <circle cx="10" cy="4" r="1.5" fill="#3478F6"/>
            <circle cx="10" cy="16" r="1.5" fill="#3478F6"/>
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 bg-black">
        {/* Contact Header (scrollable) */}
        <div className="flex flex-col items-center mb-6 pt-2">
          <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg mb-2">
            <Image
              src="/chad-logo.png"
              alt="Chad"
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="font-semibold text-white text-[16px]">Chad</div>
        </div>

        <div className="space-y-2">
        {messages.map((message, index) => (
          <div key={message.id}>
            {/* Timestamp */}
            {shouldShowTimestamp(index) && (
              <div className="text-center mb-2 mt-3">
                <span className="text-[11px] text-gray-500 font-medium">
                  {formatMessageGroupTime(message.timestamp)}
                </span>
              </div>
            )}

            {/* Message */}
            <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex flex-col max-w-[70%]`}>
                <div
                  className={`rounded-[18px] px-3.5 py-2 ${
                    message.role === 'user'
                      ? 'bg-[#3478F6] text-white rounded-br-[4px]'
                      : 'bg-[#3A3A3C] text-white rounded-bl-[4px]'
                  }`}
                >
                  <p className="text-[17px] leading-[22px]">
                    {message.content}
                  </p>
                </div>

                {/* Delivered receipt for most recent user message only */}
                {message.role === 'user' && isLastUserMessage(index) && (
                  <span className="text-[10px] text-gray-500 mt-0.5 text-right">
                    Delivered
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start mt-2">
            <div className="bg-[#3A3A3C] rounded-[18px] rounded-bl-[4px] px-3.5 py-2.5">
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
      <div className="bg-[#1C1C1E] px-2 py-2 flex-shrink-0">
        <div className="flex items-end space-x-2">
          {/* Plus button */}
          <button className="w-8 h-8 bg-[#2C2C2E] rounded-full flex items-center justify-center flex-shrink-0 mb-0.5">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4V16M4 10H16" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Input field */}
          <div className="flex-1 bg-[#2C2C2E] rounded-[18px] px-3.5 py-1.5 flex items-center min-h-[33px]">
            <input
              ref={inputRef}
              type="text"
              name="message"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              onTouchStart={handleInputTouch}
              onClick={handleInputTouch}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="iMessage"
              readOnly={isInputReadonly}
              autoComplete="off"
              autoCorrect="on"
              autoCapitalize="sentences"
              spellCheck="true"
              data-form-type="other"
              enterKeyHint="send"
              className="flex-1 bg-transparent outline-none text-white text-[17px] placeholder:text-[#8E8E93] leading-[21px]"
            />
          </div>

          {/* Mic or Send button */}
          {inputText.trim() ? (
            <button
              onClick={handleSend}
              disabled={isSending}
              className="w-8 h-8 bg-[#3478F6] rounded-full flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0 mb-0.5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          ) : (
            <button className="w-8 h-8 flex items-center justify-center flex-shrink-0 mb-0.5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 15C13.6569 15 15 13.6569 15 12V6C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6V12C9 13.6569 10.3431 15 12 15Z" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 10V12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12V10" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 19V22M8 22H16" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
