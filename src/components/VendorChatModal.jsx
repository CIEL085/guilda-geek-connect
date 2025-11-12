import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Store, ArrowLeft, DollarSign, Image, MapPin, CreditCard, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DemoPaymentModal } from "./DemoPaymentModal";

export const VendorChatModal = ({ isOpen, onClose, product, userId }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const scrollAreaRef = useRef(null);
  const { toast } = useToast();

  const quickReplies = [
    { icon: DollarSign, text: "Negociar preço" },
    { icon: Image, text: "Pedir mais fotos" },
    { icon: MapPin, text: "Confirmar frete" },
    { icon: CreditCard, text: "Simular pagamento (demo)" },
  ];

  useEffect(() => {
    if (isOpen && product && userId) {
      initializeConversation();
    }
  }, [isOpen, product, userId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const initializeConversation = async () => {
    try {
      // Check if conversation exists
      const { data: existingConv, error: convError } = await supabase
        .from('seller_conversations')
        .select('*')
        .eq('buyer_id', userId)
        .eq('product_id', product.id)
        .maybeSingle();

      let convId;
      
      if (existingConv) {
        convId = existingConv.id;
      } else {
        // Create new conversation
        const { data: newConv, error: createError } = await supabase
          .from('seller_conversations')
          .insert({
            buyer_id: userId,
            product_id: product.id,
            seller_id: product.seller_id || '00000000-0000-0000-0000-000000000000', // Official vendor
          })
          .select()
          .single();

        if (createError) throw createError;
        convId = newConv.id;

        // Send welcome message
        await supabase.from('seller_messages').insert({
          conversation_id: convId,
          sender_id: product.seller_id || '00000000-0000-0000-0000-000000000000',
          content: `👋 Saudações, aventureiro! Você abriu a conversa sobre *${product.name}*.\n\nEu sou o Vendedor Oficial da Guilda. Em que posso ajudar? (Preço, frete, endereço para entrega, formas de pagamento, reserva?)`,
          message_type: 'system'
        });
      }

      setConversationId(convId);
      await loadMessages(convId);

    } catch (error) {
      console.error('Error initializing conversation:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível iniciar a conversa",
      });
    }
  };

  const loadMessages = async (convId) => {
    try {
      const { data, error } = await supabase
        .from('seller_messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || !conversationId) return;

    setLoading(true);
    try {
      // Check if asking for payment
      const isPaymentRequest = messageText.toLowerCase().includes('pagamento') || 
                               messageText.toLowerCase().includes('pagar') ||
                               messageText === 'Simular pagamento (demo)';

      if (isPaymentRequest) {
        setShowPayment(true);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('vendor-chat', {
        body: {
          conversationId,
          userMessage: messageText,
          productInfo: product
        }
      });

      if (error) throw error;

      await loadMessages(conversationId);
      setInputMessage("");

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível enviar a mensagem",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReply = (text) => {
    sendMessage(text);
  };

  const handlePaymentComplete = async () => {
    setShowPayment(false);
    await loadMessages(conversationId);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl h-[600px] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <Avatar className="h-10 w-10 border-2 border-primary/30">
                <AvatarImage src={product?.image_url} />
                <AvatarFallback className="bg-gradient-primary">
                  <Store className="h-5 w-5 text-primary-foreground" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <DialogTitle className="text-lg font-orbitron">
                  Vendedor Oficial
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {product?.name}
                </p>
              </div>

              <Badge variant="outline" className="bg-gradient-primary text-primary-foreground border-0">
                Verificado
              </Badge>
            </div>
          </DialogHeader>

          {/* Security warning */}
          <div className="mx-6 mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              🚫 Por segurança, não forneça CPF, cartão ou dados bancários pelo chat. Use apenas os canais oficiais de pagamento.
            </p>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
            <div className="space-y-4 py-4">
              {messages.map((msg) => {
                const isUser = msg.sender_id === userId;
                const isSystem = msg.message_type === 'system';
                
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        isSystem
                          ? 'bg-primary/10 border border-primary/20 text-center w-full'
                          : isUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Quick replies */}
          <div className="px-6 py-2 border-t flex gap-2 flex-wrap">
            {quickReplies.map((reply) => (
              <Button
                key={reply.text}
                variant="outline"
                size="sm"
                onClick={() => handleQuickReply(reply.text)}
                disabled={loading}
                className="text-xs"
              >
                <reply.icon className="h-3 w-3 mr-1" />
                {reply.text}
              </Button>
            ))}
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage(inputMessage)}
                disabled={loading}
              />
              <Button
                onClick={() => sendMessage(inputMessage)}
                disabled={loading || !inputMessage.trim()}
                size="icon"
                className="bg-gradient-primary"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DemoPaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        product={product}
        conversationId={conversationId}
        userId={userId}
        onComplete={handlePaymentComplete}
      />
    </>
  );
};