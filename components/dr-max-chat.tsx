"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Loader2, AlertCircle } from "lucide-react";

interface DrMaxChatProps {
  petInfo?: {
    name: string;
    breed: string;
    age: string;
    symptoms: string;
  };
}

export function DrMaxChat({ petInfo }: DrMaxChatProps) {
  const [isResettingInput, setIsResettingInput] = useState(false);
  
  const { messages, input, handleInputChange, handleSubmit: handleChatSubmit, isLoading, error } = useChat({
    api: "/api/dr-max/chat",
    onFinish: () => {
      // 确保消息发送完成后输入框可用
      setIsResettingInput(false);
    },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input?.trim() || isLoading) return;
    
    setIsResettingInput(true);
    handleChatSubmit(e);
  };

  // 在消息变化时检查是否需要清空输入框
  useEffect(() => {
    if (!isLoading && isResettingInput && input?.trim() === "") {
      setIsResettingInput(false);
    }
  }, [isLoading, input, isResettingInput]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* 头部 */}
      <div className="border-b bg-card p-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">🐕</span>
          </div>
          <div>
            <h1 className="font-semibold">Dr. Max</h1>
            <p className="text-xs text-muted-foreground">宠物健康咨询助手</p>
            {petInfo && (
              <p className="text-xs text-muted-foreground">
                {petInfo.name ? `${petInfo.name}` : ''} {petInfo.breed ? `(${petInfo.breed})` : ''}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <div className="space-y-4">
              <div className="text-6xl">🐕</div>
              <div>
                <h2 className="text-2xl font-semibold mb-2">欢迎咨询 Dr. Max</h2>
                <p className="text-muted-foreground">
                  我是一名专业的宠物医生，可以帮助您了解宠物健康问题。
                  <br />
                  请开始提出您关于宠物健康的问题。
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Dr. Max 正在思考...</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-center">
                <Card className="bg-red-50 border-red-200 p-3 flex items-start gap-2 max-w-sm">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700">
                    <p className="font-semibold">出错了</p>
                    <p className="text-xs mt-1">
                      {error instanceof Error ? error.message : "无法连接到 Dr. Max"}
                    </p>
                  </div>
                </Card>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="border-t bg-card p-4 shadow-lg">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="请输入您的问题..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isLoading || !input || !input.trim()}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Dr. Max 仅能回答宠物健康相关的问题
        </p>
      </div>
    </div>
  );
}
