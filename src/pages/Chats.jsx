import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/BottomNav";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Chats = () => {
  const navigate = useNavigate();
  
  // Mock de conversas - substitua com dados reais do Supabase quando implementar
  const mockChats = [
    {
      id: 1,
      name: "Ana - Otaku de Carteirinha",
      lastMessage: "Você viu o último episódio?",
      time: "2min",
      unread: 2,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana"
    },
    {
      id: 2,
      name: "Carlos - RPG Master",
      lastMessage: "Bora marcar uma sessão?",
      time: "1h",
      unread: 0,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-primary/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/")}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-orbitron font-bold bg-gradient-neon bg-clip-text text-transparent">
                💬 Conversas
              </h1>
              <p className="text-sm text-muted-foreground">Suas conexões ativas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chats List */}
      <div className="container mx-auto px-4 py-6 space-y-4">
        {mockChats.length === 0 ? (
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-12 text-center">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground text-lg">Nenhuma conversa ainda</p>
            <p className="text-sm text-muted-foreground mt-2">
              Comece dando match com alguém especial!
            </p>
            <Button 
              className="mt-4 bg-gradient-primary"
              variant="gradient-primary"
              onClick={() => navigate("/")}
            >
              Ver Perfis
            </Button>
          </Card>
        ) : (
          mockChats.map((chat) => (
            <Card 
              key={chat.id}
              className="bg-card/50 backdrop-blur-sm border-primary/20 hover:shadow-glow transition-all cursor-pointer"
              onClick={() => {/* TODO: Abrir modal de chat */}}
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-3">
                <img 
                  src={chat.avatar} 
                  alt={chat.name}
                  className="w-12 h-12 rounded-full border-2 border-primary"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-orbitron">{chat.name}</CardTitle>
                    <span className="text-xs text-muted-foreground">{chat.time}</span>
                  </div>
                  <CardDescription className="flex items-center justify-between mt-1">
                    <span className="line-clamp-1">{chat.lastMessage}</span>
                    {chat.unread > 0 && (
                      <Badge className="bg-accent ml-2">{chat.unread}</Badge>
                    )}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Chats;
