import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Phone, Video, Paperclip, Send } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Message } from "@shared/schema";

interface ChatInterfaceProps {
  conversationId: string;
  messages: Message[];
  isLoading: boolean;
  onSendMessage: () => void;
  newMessage: string;
  setNewMessage: (message: string) => void;
  currentUserId: string;
  currentUserType: string;
  getContactInfo: (userId: string, userType: string) => {
    name: string;
    initials: string;
    color: string;
  };
}

export function ChatInterface({
  conversationId,
  messages,
  isLoading,
  onSendMessage,
  newMessage,
  setNewMessage,
  currentUserId,
  currentUserType,
  getContactInfo,
}: ChatInterfaceProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  if (!conversationId) {
    return (
      <Card className="servicepro-card h-full flex items-center justify-center">
        <div className="text-center text-slate-500">
          <p>Select a conversation to start messaging</p>
        </div>
      </Card>
    );
  }

  // Get contact info from conversation ID
  const [userType, userId] = conversationId.split('-').slice(0, 2);
  const contact = getContactInfo(userId, userType);

  return (
    <Card className="servicepro-card flex flex-col h-full">
      {/* Chat Header */}
      <CardContent className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${contact.color}`}>
              <span className="font-medium text-sm">{contact.initials}</span>
            </div>
            <div>
              <p className="font-medium text-slate-800">{contact.name}</p>
              <p className="text-sm text-slate-600">
                {userType === 'client' ? 'Client' : 'Staff Member'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              data-testid="button-call"
            >
              <Phone className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              data-testid="button-video"
            >
              <Video className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Messages */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4" data-testid="messages-container">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-16 w-64" />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation by sending a message</p>
          </div>
        ) : (
          messages.map((message) => {
            const isFromCurrentUser = message.fromId === currentUserId && message.fromType === currentUserType;
            const senderInfo = isFromCurrentUser 
              ? { initials: 'ME', color: 'bg-slate-300' }
              : contact;

            return (
              <div 
                key={message.id} 
                className={`flex items-start space-x-3 ${isFromCurrentUser ? 'justify-end' : ''}`}
                data-testid={`message-${message.id}`}
              >
                {!isFromCurrentUser && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${senderInfo.color}`}>
                    <span className="font-medium text-xs">{senderInfo.initials}</span>
                  </div>
                )}
                <div className={`flex-1 ${isFromCurrentUser ? 'flex justify-end' : ''}`}>
                  <div 
                    className={`max-w-md p-3 rounded-lg ${
                      isFromCurrentUser 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {new Date(message.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
                {isFromCurrentUser && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${senderInfo.color}`}>
                    <span className="font-medium text-xs">{senderInfo.initials}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Message Input */}
      <CardContent className="p-6 border-t border-slate-200">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="icon"
            data-testid="button-attach"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              data-testid="input-message"
            />
          </div>
          <Button 
            className="servicepro-btn-primary"
            onClick={onSendMessage}
            disabled={!newMessage.trim()}
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
