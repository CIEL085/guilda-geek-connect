import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, Heart, ArrowLeft, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const ChatModal = ({ isOpen, onClose, match }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && match) {
      // Inicia conversa com mensagem de boas-vindas do match
      const welcomeMessage = {
        id: 'welcome-1',
        content: `Olá! Vi que você também curte ${match.interests?.[0] || 'cultura geek'}! 😊`,
        sender_id: match.id,
        created_at: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
      scrollToBottom();
    }
  }, [isOpen, match]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || loading || !match) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setLoading(true);

    // Adiciona mensagem do usuário
    const userMessage = {
      id: Date.now().toString(),
      content: messageContent,
      sender_id: user?.id || 'current-user',
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Envia mensagens para o Gemini
      const conversationHistory = [...messages, userMessage].map(msg => ({
        role: msg.sender_id === user?.id ? 'user' : 'assistant',
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('chat-match', {
        body: { 
          messages: conversationHistory,
          matchProfile: {
            name: match.name,
            gender: match.gender,
            interests: match.interests
          }
        }
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      // Adiciona resposta da IA
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        sender_id: match.id,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiResponse]);

      toast({
        title: "Mensagem enviada! 💬",
        description: "Sua mensagem foi entregue com sucesso."
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!match) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md h-[600px] flex flex-col p-0">
        <DialogHeader className="border-b p-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <Avatar className="w-10 h-10">
              <AvatarImage 
                src={match.image} 
                alt={match.name}
              />
              <AvatarFallback className="bg-gradient-primary text-white">
                {match.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <DialogTitle className="text-left text-lg">
                {match.name || 'Usuário'}
              </DialogTitle>
              <p className="text-xs text-muted-foreground">Online agora</p>
            </div>
            
            <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => {
              const isCurrentUser = message.sender_id === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isCurrentUser
                        ? 'bg-gradient-primary text-white'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      isCurrentUser ? 'text-white/70' : 'text-muted-foreground'
                    }`}>
                      {formatDistanceToNow(new Date(message.created_at), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-4 flex-shrink-0">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              disabled={loading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || loading}
              size="icon"
              className="bg-gradient-primary hover:shadow-glow"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};