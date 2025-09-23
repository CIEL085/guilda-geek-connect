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
  const [matches, setMatches] = useState<Match[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && isOpen) {
      loadMatches();
      loadConversations();
    }
  }, [user, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMatches = async () => {
    if (!user) return;

    // Get mutual matches (both users liked each other)
    const { data: myLikes } = await supabase
      .from('matches')
      .select('matched_user_id')
      .eq('user_id', user.id)
      .eq('liked', true);

    if (!myLikes?.length) {
      setMatches([]);
      return;
    }

    const likedUserIds = myLikes.map(like => like.matched_user_id);

    const { data: mutualMatches } = await supabase
      .from('matches')
      .select(`
        id,
        matched_user_id
      `)
      .eq('user_id', user.id)
      .eq('liked', true)
      .in('matched_user_id', likedUserIds);
      
    // Get profile data separately 
    const matchesWithProfiles = await Promise.all(
      (mutualMatches || []).map(async (match) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', match.matched_user_id)
          .single();
          
        const { data: photos } = await supabase
          .from('profile_photos')
          .select('photo_url, is_primary')
          .eq('user_id', match.matched_user_id)
          .order('is_primary', { ascending: false });
          
        return {
          ...match,
          profiles: {
            display_name: profile?.display_name || '',
            profile_photos: photos || []
          }
        };
      })
    );

    if (matchesWithProfiles) {
      // Filter for actual mutual matches
      const mutualIds = await Promise.all(
        matchesWithProfiles.map(async (match) => {
          const { data: theirLike } = await supabase
            .from('matches')
            .select('id')
            .eq('user_id', match.matched_user_id)
            .eq('matched_user_id', user.id)
            .eq('liked', true)
            .maybeSingle();

          return theirLike ? match : null;
        })
      );

      setMatches(mutualIds.filter(Boolean) as Match[]);
    }
  };

  const loadConversations = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('conversations')
      .select(`
        id,
        user1_id,
        user2_id,
        messages(
          id,
          content,
          sender_id,
          created_at
        )
      `)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    // Get profiles separately
    const conversationsWithProfiles = await Promise.all(
      (data || []).map(async (conv) => {
        const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', otherUserId)
          .single();
          
        const { data: photos } = await supabase
          .from('profile_photos')
          .select('photo_url, is_primary')
          .eq('user_id', otherUserId)
          .order('is_primary', { ascending: false });

        return {
          ...conv,
          profiles: {
            display_name: profile?.display_name || '',
            profile_photos: photos || []
          }
        };
      })
    );

    if (conversationsWithProfiles) {
      setConversations(conversationsWithProfiles as any);
    }
  };

  const startConversation = async (matchedUserId: string) => {
    if (!user) return;

    // Check if conversation already exists
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('*')
      .or(
        `and(user1_id.eq.${user.id},user2_id.eq.${matchedUserId}),and(user1_id.eq.${matchedUserId},user2_id.eq.${user.id})`
      )
      .maybeSingle();

    let conversationId;

    if (existingConv) {
      conversationId = existingConv.id;
    } else {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          user1_id: user.id,
          user2_id: matchedUserId
        })
        .select()
        .single();

      conversationId = newConv?.id;
    }

    if (conversationId) {
      // Load the full conversation
      const { data } = await supabase
        .from('conversations')
        .select(`
          id,
          user1_id,
          user2_id
        `)
        .eq('id', conversationId)
        .single();
        
      // Get other user's profile
      const otherUserId = data?.user1_id === user.id ? data?.user2_id : data?.user1_id;
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', otherUserId)
        .single();
        
      const { data: photos } = await supabase
        .from('profile_photos')
        .select('photo_url, is_primary')
        .eq('user_id', otherUserId)
        .order('is_primary', { ascending: false });
        
      const conversationWithProfile = {
        ...data,
        profiles: {
          display_name: profile?.display_name || '',
          profile_photos: photos || []
        }
      };

      if (conversationWithProfile) {
        setSelectedConversation(conversationWithProfile as any);
        loadMessages(conversationId);
        setCurrentView('conversation');
      }
    }
  };

  const loadMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedConversation || !newMessage.trim()) return;

    setLoading(true);

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        content: newMessage.trim()
      });

    if (!error) {
      setNewMessage('');
      loadMessages(selectedConversation.id);
    } else {
      toast({
        variant: "destructive",
        title: "Erro ao enviar",
        description: "Não foi possível enviar a mensagem."
      });
    }

    setLoading(false);
  };

  const getOtherUser = (conversation: Conversation) => {
    return conversation.user1_id === user?.id 
      ? conversation.profiles 
      : conversation.profiles;
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
                  {matches.map((match) => (
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
                  {conversations.map((conversation) => {
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