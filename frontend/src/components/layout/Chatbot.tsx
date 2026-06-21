import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Sprout } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'
import type { ChatMessage } from '@/types'

const QUICK_TEMPLATES = [
  'Lịch tưới hôm nay?',
  'Lá cây bị đốm trắng là bệnh gì?',
  'Cây cà chua cần bao nhiêu nước?',
]

interface ChatBubbleProps {
  message: ChatMessage
}

function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={cn(
        'flex w-full',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-card border border-border text-foreground rounded-bl-md'
        )}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        <p
          className={cn(
            'text-xs mt-1.5',
            isUser ? 'text-primary-foreground/60' : 'text-muted-foreground'
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 bg-card border border-border rounded-2xl rounded-bl-md w-fit">
      <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  )
}

export default function Chatbot() {
  const { chatHistory, sendChatMessage, activeGarden } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      inputRef.current?.focus()
    }
  }, [chatHistory, isOpen, isTyping])

  const handleSend = () => {
    if (!inputValue.trim()) return
    sendChatMessage(inputValue.trim())
    setInputValue('')
    setIsTyping(true)
    setTimeout(() => setIsTyping(false), 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickTemplate = (template: string) => {
    setInputValue(template)
    sendChatMessage(template)
    setIsTyping(true)
    setTimeout(() => setIsTyping(false), 2000)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full',
          'bg-primary text-primary-foreground shadow-lg',
          'hover:bg-primary/90 hover:scale-105',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
          'transition-all duration-200',
          'flex items-center justify-center',
          !isOpen && 'animate-bounce'
        )}
        aria-label={isOpen ? 'Đóng chatbot' : 'Mở chatbot'}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] max-h-[500px] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-slide-down">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sprout className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">
                  Trợ lý vườn thông minh
                </h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs text-muted-foreground">
                    {activeGarden?.name || 'Vườn của bạn'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Context Badge */}
          <div className="px-4 py-2 border-b border-border bg-muted/30">
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 text-xs text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Đang tư vấn: {activeGarden?.name || 'Vườn của bạn'}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px] max-h-[300px]">
            {chatHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Sprout className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-medium text-foreground mb-1">
                  Xin chào! 👋
                </h4>
                <p className="text-sm text-muted-foreground mb-4 max-w-[250px]">
                  Tôi có thể giúp bạn về cây trồng, lịch tưới, và các vấn đề về vườn
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-[280px]">
                  {QUICK_TEMPLATES.map((template, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickTemplate(template)}
                      className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs hover:bg-primary/20 transition-colors"
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {chatHistory.map((message) => (
                  <ChatBubble key={message.id} message={message} />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Quick Templates (when has messages) */}
          {chatHistory.length > 0 && (
            <div className="px-4 py-2 border-t border-border bg-muted/20">
              <div className="flex flex-wrap gap-2">
                {QUICK_TEMPLATES.map((template, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickTemplate(template)}
                    className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs hover:bg-primary/20 transition-colors whitespace-nowrap"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 px-4 py-2.5 rounded-full bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card',
                  inputValue.trim()
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
