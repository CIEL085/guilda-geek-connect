import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Bot, X, Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export const AIChatSupport = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Olá! Sou sua IA da Guilda, posso ajudar com dúvidas ou problemas na plataforma. 🤖'
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'Entendo sua dúvida! Para criar um perfil interessante, adicione hashtags dos seus animes e jogos favoritos. 🎮',
        'Para dar match com alguém, basta arrastar o card para a direita ou clicar no botão de coração! 💙',
        'Você pode editar seu perfil a qualquer momento clicando no ícone de usuário no canto superior direito. ⚙️',
        'Os matches funcionam quando duas pessoas curtem uma à outra. Aí vocês podem conversar! 💬',
        'Dica geek: use hashtags específicas como #jrpg ou #shounen para encontrar pessoas com gostos bem parecidos! 🎯'
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { role: 'assistant', content: randomResponse }]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 rounded-full w-16 h-16 shadow-neon-blue hover:shadow-neon-purple transition-all duration-300 bg-gradient-primary z-50"
          size="icon"
        >
          <Bot className="w-7 h-7" />
        </Button>
      )}

      {/* Chat window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-intense border-primary/30 bg-card/95 backdrop-blur-xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-primary/20 bg-gradient-primary">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-background/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-white">Assistente da Guilda</h3>
                <p className="text-xs text-white/80">Online</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-gradient-secondary text-white shadow-neon-pink'
                        : 'bg-muted/50 text-foreground border border-primary/20'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-primary/20">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua dúvida..."
                className="flex-1 bg-muted/50 border-primary/20 focus:border-primary"
              />
              <Button
                onClick={handleSend}
                size="icon"
                className="bg-gradient-primary hover:shadow-neon-blue"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};
