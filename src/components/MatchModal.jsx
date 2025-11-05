import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, X } from 'lucide-react';

export const MatchModal = ({ isOpen, onClose, match, onStartChat }) => {
  if (!match) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-background via-background to-primary/10 border-2 border-primary/30 backdrop-blur-xl">
        <div className="flex flex-col items-center py-6 space-y-6">
          {/* Header com animação */}
          <div className="relative">
            <div className="absolute inset-0 animate-ping opacity-20">
              <Heart className="w-24 h-24 text-primary fill-primary" />
            </div>
            <Heart className="w-24 h-24 text-primary fill-primary animate-pulse" />
          </div>

          {/* Título */}
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-orbitron font-bold bg-gradient-neon bg-clip-text text-transparent">
              É UM MATCH!
            </h2>
            <p className="text-muted-foreground font-rajdhani text-lg">
              Vocês curtiram um ao outro! 💙✨
            </p>
          </div>

          {/* Avatar do Match */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-primary rounded-full blur-xl opacity-50 animate-pulse"></div>
            <Avatar className="w-32 h-32 border-4 border-primary shadow-neon-blue relative">
              <AvatarImage src={match.image} alt={match.name} />
              <AvatarFallback className="bg-gradient-primary text-white text-3xl font-bold">
                {match.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Nome e Info */}
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-orbitron font-bold text-foreground">
              {match.name}
            </h3>
            {match.interests && match.interests.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {match.interests.slice(0, 3).map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-xs font-rajdhani font-bold bg-primary/20 text-primary border border-primary/30 rounded-full animate-float"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-4 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-2 border-muted-foreground/30 hover:bg-muted/50 font-rajdhani font-bold"
            >
              <X className="w-4 h-4 mr-2" />
              Continuar vendo
            </Button>
            <Button
              onClick={() => {
                onStartChat();
                onClose();
              }}
              className="flex-1 bg-gradient-primary hover:shadow-intense font-orbitron font-bold text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Iniciar conversa
            </Button>
          </div>

          {/* Mensagem de incentivo */}
          <p className="text-center text-sm text-muted-foreground font-rajdhani">
            Que tal quebrar o gelo falando sobre {match.interests?.[0] || 'cultura geek'}?
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
