import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Phone, Video, Paperclip, Send, Users, MessageSquare, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatInterface } from "@/components/messaging/chat-interface";
import { queryClient } from "@/lib/queryClient";
import type { Message, User } from "@shared/schema";

export default function Messaging() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [currentView, setCurrentView] = useState<"conversations" | "directory">("conversations");
  const [directorySearchTerm, setDirectorySearchTerm] = useState("");

  // For demo purposes, we'll simulate different user roles
  // In real app, this would come from auth context
  const currentUserId = "user-1";
  const currentUserRole = "office_staff"; // office_staff, property_manager, technician, admin

  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ["/api/conversations", { userId: currentUserId, userType: "user" }],
    queryFn: async () => {
      const response = await fetch(`/api/conversations?userId=${currentUserId}&userType=user`);
      if (!response.ok) throw new Error('Failed to fetch conversations');
      return response.json();
    },
  });

  // Fetch all users for directory
  const { data: allUsers } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
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

  // Determine which users current user can message based on role
  const getMessagingPermissions = (currentRole: string) => {
    switch (currentRole) {
      case 'office_staff':
      case 'admin':
        // Office staff and admin can message technicians and inspectors
        return ['technician', 'inspector', 'office_staff', 'admin'];
      case 'property_manager':
        // Property managers can only message office staff and admin
        return ['office_staff', 'admin'];
      case 'technician':
      case 'inspector':
        // Technicians and inspectors can message office staff and admin
        return ['office_staff', 'admin', 'technician', 'inspector'];
      default:
        return [];
    }
  };

  const allowedRoles = getMessagingPermissions(currentUserRole);
  
  // Filter users based on messaging permissions
  const messagingDirectory = allUsers?.filter(user => 
    user.id !== currentUserId && // Don't show current user
    allowedRoles.includes(user.role) &&
    user.status === 'active'
  ) || [];

  const getContactInfo = (userId: string, userType: string = 'user') => {
    const user = allUsers?.find(u => u.id === userId);
    const fullName = user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
    const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase();
    
    const roleColors: Record<string, string> = {
      'admin': 'bg-purple-100 text-purple-700',
      'office_staff': 'bg-blue-100 text-blue-700',
      'property_manager': 'bg-green-100 text-green-700',
      'technician': 'bg-orange-100 text-orange-700',
      'inspector': 'bg-red-100 text-red-700'
    };
    
    return {
      name: fullName,
      initials: initials || 'UK',
      color: roleColors[user?.role || 'technician'] || 'bg-slate-100 text-slate-700',
      role: user?.role || 'unknown',
      department: user?.department || ''
    };
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const [userType, userId] = selectedConversation.split('-').slice(0, 2);
    
    sendMessageMutation.mutate({
      fromType: 'user',
      fromId: currentUserId,
      toType: 'user',
      toId: userId,
      content: newMessage.trim(),
      conversationId: selectedConversation,
    });
  };

  const startConversation = (userId: string) => {
    const conversationId = `user-${userId}-${Date.now()}`;
    setSelectedConversation(conversationId);
    setCurrentView('conversations');
  };

  const filteredConversations = conversations?.filter((conv: any) => {
    const contact = getContactInfo(conv.userId, conv.userType);
    return contact.name.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  const filteredDirectory = messagingDirectory.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`;
    return fullName.toLowerCase().includes(directorySearchTerm.toLowerCase()) ||
           user.role.toLowerCase().includes(directorySearchTerm.toLowerCase()) ||
           (user.department && user.department.toLowerCase().includes(directorySearchTerm.toLowerCase()));
  });

  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      'admin': 'Administrator',
      'office_staff': 'Office Staff',
      'property_manager': 'Property Manager',
      'technician': 'Technician',
      'inspector': 'Inspector'
    };
    return roleNames[role] || role;
  };

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
      {/* Message List & Directory */}
      <Card className="servicepro-card flex flex-col">
        <CardHeader className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-lg font-bold text-slate-800">Messages</CardTitle>
            <Badge variant="outline" className="text-xs">
              {getRoleDisplayName(currentUserRole)}
            </Badge>
          </div>
          
          <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as "conversations" | "directory")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="conversations" className="text-xs">
                <MessageSquare className="w-4 h-4 mr-1" />
                Chats
              </TabsTrigger>
              <TabsTrigger value="directory" className="text-xs">
                <Users className="w-4 h-4 mr-1" />
                Directory
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="conversations" className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <Input
                  type="text"
                  placeholder="Search conversations..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search-messages"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="directory" className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <Input
                  type="text"
                  placeholder="Search directory..."
                  className="pl-10"
                  value={directorySearchTerm}
                  onChange={(e) => setDirectorySearchTerm(e.target.value)}
                  data-testid="input-search-directory"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardHeader>
        
        <div className="flex-1 overflow-y-auto">
          {currentView === 'conversations' ? (
            filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No conversations yet</p>
                <p className="text-sm mb-4">Start messaging from the Directory tab</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentView('directory')}
                  data-testid="button-go-to-directory"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Start New Chat
                </Button>
              </div>
            ) : (
              filteredConversations.map((conversation: any) => {
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
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-slate-600 truncate">{conversation.lastMessage.content}</p>
                          <Badge variant="secondary" className="text-xs ml-2">
                            {getRoleDisplayName(contact.role)}
                          </Badge>
                        </div>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                );
              })
            )
          ) : (
            // Directory View
            <div className="p-4">
              {filteredDirectory.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  <Users className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>No contacts available</p>
                  <p className="text-sm">You can message {allowedRoles.map(r => getRoleDisplayName(r)).join(', ')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-slate-600 mb-4">
                    You can message: {allowedRoles.map(r => getRoleDisplayName(r)).join(', ')}
                  </p>
                  {filteredDirectory.map((user) => {
                    const contact = getContactInfo(user.id);
                    return (
                      <div
                        key={user.id}
                        className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => startConversation(user.id)}
                        data-testid={`directory-user-${user.id}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${contact.color}`}>
                            <span className="font-medium text-xs">{contact.initials}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-slate-800">{contact.name}</p>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {getRoleDisplayName(user.role)}
                              </Badge>
                              {user.department && (
                                <span className="text-xs text-slate-500">{user.department}</span>
                              )}
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" data-testid={`button-message-${user.id}`}>
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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
            currentUserType="user"
            getContactInfo={getContactInfo}
          />
        ) : (
          <Card className="servicepro-card h-full flex items-center justify-center">
            <div className="text-center text-slate-500">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-lg mb-2">Select a conversation to start messaging</p>
              <p className="text-sm mb-4">Choose from your conversations or start a new chat from the directory</p>
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('directory')}
                data-testid="button-start-new-chat"
              >
                <Plus className="w-4 h-4 mr-2" />
                Start New Chat
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
