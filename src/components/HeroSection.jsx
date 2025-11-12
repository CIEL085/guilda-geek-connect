import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Gamepad2, BookOpen, Users, Sparkles } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { MarketplaceCard } from "@/components/MarketplaceCard";

export const HeroSection = ({ onEnter, onProductClick }) => {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="container mx-auto max-w-4xl relative z-10">
        {/* Hero Content */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="inline-flex flex-col items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-neon shadow-neon-blue neon-pulse"></div>
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-white" />
              </div>
              <h1 className="text-6xl md:text-8xl font-bold font-orbitron bg-gradient-neon bg-clip-text text-transparent neon-pulse">
                GUILDA
              </h1>
            </div>
            <p className="text-2xl md:text-3xl font-orbitron text-primary mb-3 font-bold tracking-wide">
              Encontre seu Player 2
            </p>
            <p className="text-xl text-accent mb-2 font-semibold">
              Conecte-se pela paixão geek
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Descubra pessoas que compartilham sua paixão por animes, mangás, jogos e cultura geek.
              Faça matches baseados nos seus interesses e encontre sua tribo digital!
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <Button
              size="lg"
              className="bg-gradient-secondary hover:shadow-neon-pink text-lg px-10 py-7 rounded-full font-orbitron font-bold text-white neon-pulse hover:scale-110 transition-all duration-300"
              onClick={onEnter}
            >
              <Heart className="mr-2 h-6 w-6" />
              COMEÇAR AVENTURA
            </Button>
          </div>

          {/* Marketplace Card */}
          <div className="mb-16">
            <MarketplaceCard onProductClick={onProductClick} />
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="p-6 text-center shadow-neon-blue hover:shadow-intense transition-all duration-300 hover:-translate-y-2 border-2 border-primary/30 bg-card/80 backdrop-blur-sm group">
            <div className="w-16 h-16 rounded-full bg-gradient-primary mx-auto mb-4 flex items-center justify-center shadow-neon-blue group-hover:scale-110 transition-transform">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-orbitron font-bold mb-2 text-primary">Matches Inteligentes</h3>
            <p className="text-muted-foreground">
              Algoritmo que conecta pessoas com gostos semelhantes em animes e jogos
            </p>
          </Card>

          <Card className="p-6 text-center shadow-neon-purple hover:shadow-intense transition-all duration-300 hover:-translate-y-2 border-2 border-secondary/30 bg-card/80 backdrop-blur-sm group">
            <div className="w-16 h-16 rounded-full bg-gradient-secondary mx-auto mb-4 flex items-center justify-center shadow-neon-purple group-hover:scale-110 transition-transform">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-orbitron font-bold mb-2 text-secondary">Perfil Otaku</h3>
            <p className="text-muted-foreground">
              Mostre seus animes favoritos, jogos e interesses através de hashtags
            </p>
          </Card>

          <Card className="p-6 text-center shadow-neon-pink hover:shadow-intense transition-all duration-300 hover:-translate-y-2 border-2 border-accent/30 bg-card/80 backdrop-blur-sm group">
            <div className="w-16 h-16 rounded-full bg-gradient-primary mx-auto mb-4 flex items-center justify-center shadow-neon-pink group-hover:scale-110 transition-transform">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-orbitron font-bold mb-2 text-accent">Comunidade Geek</h3>
            <p className="text-muted-foreground">
              Converse e compartilhe experiências com outros fãs da cultura pop
            </p>
          </Card>
        </div>

        {/* Popular Interests */}
        <div className="mt-16 text-center">
          <h3 className="text-3xl font-orbitron font-bold mb-6 text-primary">
            Interesses Populares
          </h3>
          <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
            {[
              "#onepiece", "#naruto", "#dragonball", "#attackontitan",
              "#demonslayer", "#gaming", "#cosplay", "#manga",
              "#pokemon", "#studioghibli", "#jrpg", "#anime"
            ].map((tag, index) => (
              <span
                key={tag}
                className="px-5 py-2 rounded-full bg-primary/10 text-primary border-2 border-primary/30 hover:bg-primary/20 hover:shadow-neon-blue transition-all cursor-pointer font-semibold hover:scale-110"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};