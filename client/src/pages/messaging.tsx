import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Phone, Video, Paperclip, Send } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatInterface } from "@/components/messaging/chat-interface";
import { queryClient } from "@/lib/queryClient";
import type { Message, Client, Staff } from "@shared/schema";

export default function Messaging() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  // For demo purposes, we'll simulate being a staff member
  const currentUserId = "staff-1";
  const currentUserType = "staff";

  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ["/api/conversations", { userId: currentUserId, userType: currentUserType }],
    queryFn: async () => {
      const response = await fetch(`/api/conversations?userId=${currentUserId}&userType=${currentUserType}`);
      if (!response.ok) throw new Error('Failed to fetch conversations');
      return response.json();
    },
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: staff } = useQuery<Staff[]>({
    queryKey: ["/api/staff"],
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/conversations", selectedConversation, "messages"],
    enabled: !!selectedConversation,
    queryFn: async () => {
      const response = await fetch(`/api/conversations/${selectedConversation}/messages`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversation, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setNewMessage("");
    },
  });

  const getContactInfo = (userId: string, userType: string) => {
    if (userType === 'client') {
      const client = clients?.find(c => c.id === userId);
      return {
        name: client?.name || 'Unknown Client',
        initials: client?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'UK',
        color: 'bg-blue-100 text-blue-700'
      };
    } else {
      const staffMember = staff?.find(s => s.id === userId);
      return {
        name: staffMember?.name || 'Unknown Staff',
        initials: staffMember?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'US',
        color: 'bg-emerald-100 text-emerald-700'
      };
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const [userType, userId] = selectedConversation.split('-').slice(0, 2);
    
    sendMessageMutation.mutate({
      fromType: currentUserType,
      fromId: currentUserId,
      toType: userType,
      toId: userId,
      content: newMessage.trim(),
      conversationId: selectedConversation,
    });
  };

  const filteredConversations = conversations?.filter(conv => {
    const contact = getContactInfo(conv.userId, conv.userType);
    return contact.name.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  if (conversationsLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        <Skeleton className="h-full" />
        <div className="lg:col-span-2">
          <Skeleton className="h-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Message List */}
      <Card className="servicepro-card flex flex-col">
        <CardContent className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Messages</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <Input
              type="text"
              placeholder="Search messages..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search-messages"
            />
          </div>
        </CardContent>
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              <p>No conversations yet</p>
              <p className="text-sm">Messages will appear here when you start chatting</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const contact = getContactInfo(conversation.userId, conversation.userType);
              const isActive = selectedConversation === conversation.id;
              
              return (
                <div
                  key={conversation.id}
                  className={`p-4 border-b border-slate-100 cursor-pointer transition-colors ${
                    isActive ? 'bg-blue-50' : 'hover:bg-slate-50'
                  }`}
                  onClick={() => setSelectedConversation(conversation.id)}
                  data-testid={`conversation-${conversation.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${contact.color}`}>
                      <span className="font-medium text-sm">{contact.initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-slate-800 truncate">{contact.name}</p>
                        <p className="text-xs text-slate-600">
                          {new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                      <p className="text-sm text-slate-600 truncate">{conversation.lastMessage.content}</p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Chat Interface */}
      <div className="lg:col-span-2">
        {selectedConversation ? (
          <ChatInterface
            conversationId={selectedConversation}
            messages={messages || []}
            isLoading={messagesLoading}
            onSendMessage={handleSendMessage}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            currentUserId={currentUserId}
            currentUserType={currentUserType}
            getContactInfo={getContactInfo}
          />
        ) : (
          <Card className="servicepro-card h-full flex items-center justify-center">
            <div className="text-center text-slate-500">
              <p>Select a conversation to start messaging</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
