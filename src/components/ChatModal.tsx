import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, Heart, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Match {
  id: string;
  matched_user_id: string;
  profiles: {
    display_name: string;
    profile_photos: Array<{ photo_url: string; is_primary: boolean }>;
  };
}

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  profiles: {
    display_name: string;
    profile_photos: Array<{ photo_url: string; is_primary: boolean }>;
  };
  messages: Array<{
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
  }>;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

export const ChatModal = ({ isOpen, onClose }: ChatModalProps) => {
  const [currentView, setCurrentView] = useState<'matches' | 'conversation'>('matches');
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Sample matches data for testing
  const sampleMatches = [
    {
      id: '1',
      matched_user_id: 'user1',
      profiles: {
        display_name: 'Sakura',
        profile_photos: [{ photo_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=500&fit=crop&crop=face', is_primary: true }]
      }
    },
    {
      id: '2',
      matched_user_id: 'user2',
      profiles: {
        display_name: 'Akira',
        profile_photos: [{ photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face', is_primary: true }]
      }
    }
  ];

  // Sample conversations with messages
  const [sampleConversations, setSampleConversations] = useState([
    {
      id: 'conv1',
      user1_id: user?.id,
      user2_id: 'user1',
      profiles: {
        display_name: 'Sakura',
        profile_photos: [{ photo_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=500&fit=crop&crop=face', is_primary: true }]
      },
      messages: [
        {
          id: 'msg1',
          content: 'Oi! Vi que você curte One Piece também! 🏴‍☠️',
          sender_id: 'user1',
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 'msg2',
          content: 'Oi Sakura! Sim, sou super fã! Qual é o seu arco favorito?',
          sender_id: user?.id,
          created_at: new Date(Date.now() - 82800000).toISOString()
        }
      ]
    }
  ]);

  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startConversation = async (matchedUserId: string) => {
    const match = sampleMatches.find(m => m.matched_user_id === matchedUserId);
    if (!match) return;

    const newConversation = {
      id: `conv_${matchedUserId}`,
      user1_id: user?.id,
      user2_id: matchedUserId,
      profiles: match.profiles,
      messages: []
    };

    setSelectedConversation(newConversation);
    setMessages([]);
    setCurrentView('conversation');
  };

  const loadMessages = (conversationId: string) => {
    const conversation = sampleConversations.find(c => c.id === conversationId);
    if (conversation) {
      setMessages(conversation.messages);
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedConversation || !newMessage.trim()) return;

    setLoading(true);

    const newMsg = {
      id: `msg_${Date.now()}`,
      content: newMessage.trim(),
      sender_id: user.id,
      created_at: new Date().toISOString()
    };

    // Simulate message sending
    setTimeout(() => {
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      setLoading(false);
      
      toast({
        title: "Mensagem enviada!",
        description: "Sua mensagem foi enviada com sucesso."
      });

      // Simulate response after 2 seconds
      setTimeout(() => {
        const responseMsg = {
          id: `msg_${Date.now() + 1}`,
          content: "Interessante! Vamos conversar mais sobre isso! 😊",
          sender_id: selectedConversation.user2_id,
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, responseMsg]);
      }, 2000);
    }, 500);
  };

  const getOtherUser = (conversation: any) => {
    return conversation.profiles;
  };

  const getPrimaryPhoto = (photos: Array<{ photo_url: string; is_primary: boolean }>) => {
    const primary = photos?.find(p => p.is_primary);
    return primary?.photo_url || photos?.[0]?.photo_url || '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {currentView === 'conversation' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentView('matches')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                {currentView === 'matches' ? 'Seus Matches' : 'Chat'}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        {currentView === 'matches' ? (
          <ScrollArea className="flex-1">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                  Novos Matches
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {sampleMatches.map((match) => (
                    <button
                      key={match.id}
                      onClick={() => startConversation(match.matched_user_id)}
                      className="flex flex-col items-center p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={getPrimaryPhoto(match.profiles.profile_photos)} />
                        <AvatarFallback>
                          {match.profiles.display_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium mt-1 truncate w-full">
                        {match.profiles.display_name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                  Conversas
                </h3>
                <div className="space-y-2">
                  {sampleConversations.map((conversation) => {
                    const otherUser = getOtherUser(conversation);
                    const lastMessage = conversation.messages?.[conversation.messages.length - 1];
                    
                    return (
                      <button
                        key={conversation.id}
                        onClick={() => {
                          setSelectedConversation(conversation);
                          loadMessages(conversation.id);
                          setCurrentView('conversation');
                        }}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors w-full text-left"
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={getPrimaryPhoto(otherUser.profile_photos)} />
                          <AvatarFallback>
                            {otherUser.display_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{otherUser.display_name}</p>
                          {lastMessage && (
                            <p className="text-sm text-muted-foreground truncate">
                              {lastMessage.content}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex-1 flex flex-col">
            {selectedConversation && (
              <div className="flex items-center gap-3 pb-3 border-b">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={getPrimaryPhoto(getOtherUser(selectedConversation).profile_photos)} />
                  <AvatarFallback>
                    {getOtherUser(selectedConversation).display_name[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">
                  {getOtherUser(selectedConversation).display_name}
                </span>
              </div>
            )}

            <ScrollArea className="flex-1 py-4">
              <div className="space-y-3 px-1">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.sender_id === user?.id
                          ? 'bg-gradient-secondary text-white'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatDistanceToNow(new Date(message.created_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="flex gap-2 pt-3 border-t">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button 
                onClick={sendMessage}
                disabled={loading || !newMessage.trim()}
                className="bg-gradient-secondary"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};