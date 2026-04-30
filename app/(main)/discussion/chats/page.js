// app/chat/page.jsx
'use client';

import { MoreVertical, Phone, Video, Info, Smile, Paperclip, Image, Send } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ChatPage() {
  const messages = [
    {
      id: 1,
      text: "Hey! How are you doing today?",
      sender: "them",
      timestamp: "10:30 AM",
    },
    {
      id: 2,
      text: "I'm doing great, thanks for asking! Just working on the new project.",
      sender: "me",
      timestamp: "10:32 AM",
    },
    {
      id: 3,
      text: "That sounds exciting! What project are you working on?",
      sender: "them",
      timestamp: "10:33 AM",
    },
    {
      id: 4,
      text: "Building a chat application with Next.js and Tailwind CSS.",
      sender: "me",
      timestamp: "10:35 AM",
    },
    {
      id: 5,
      text: "Nice! I'd love to see it when you're done.",
      sender: "them",
      timestamp: "10:36 AM",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto h-screen flex flex-col p-4">
        {/* Chat Container */}
        <Card className="flex-1 flex flex-col overflow-hidden shadow-xl">
          {/* Header */}
          <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>SJ</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-slate-800">Sarah Johnson</h2>
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Video className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Info className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white to-slate-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                {message.sender === 'them' && (
                  <Avatar className="w-8 h-8 mr-2 mt-1">
                    <AvatarFallback>SJ</AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[70%] ${message.sender === 'me' ? 'order-1' : ''}`}>
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      message.sender === 'me'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-800'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                  <p
                    className={`text-xs text-slate-400 mt-1 ${
                      message.sender === 'me' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {message.timestamp}
                  </p>
                </div>
                {message.sender === 'me' && (
                  <Avatar className="w-8 h-8 ml-2 mt-1">
                    <AvatarFallback>ME</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            <div className="flex justify-start">
              <Avatar className="w-8 h-8 mr-2">
                <AvatarFallback>SJ</AvatarFallback>
              </Avatar>
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full shrink-0">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full shrink-0">
                <Image className="w-4 h-4" />
              </Button>
              <div className="flex-1 relative">
                <Input
                  placeholder="Type a message..."
                  className="pr-10 rounded-full bg-slate-50 border-slate-200"
                  value=""
                  readOnly
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full h-8 w-8"
                >
                  <Smile className="w-4 h-4 text-slate-400" />
                </Button>
              </div>
              <Button className="rounded-full shrink-0 bg-blue-600 hover:bg-blue-700">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}