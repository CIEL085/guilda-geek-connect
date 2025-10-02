import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Gamepad2, BookOpen, Users } from "lucide-react";
import heroImage from "@/assets/guilda-hero-bwr.jpg";

export const HeroSection = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Hero Content */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-primary shadow-glow"></div>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Guilda
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground mb-2">
              Conecte-se com otakus próximos de você
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Descubra pessoas que compartilham sua paixão por animes, mangás, jogos e cultura geek.
              Faça matches baseados nos seus interesses e encontre sua tribo!
            </p>
          </div>

          <div className="flex justify-center mb-16">
            <Button
              size="lg"
              className="bg-gradient-secondary hover:shadow-intense text-lg px-8 py-6 rounded-full"
              onClick={onEnter}
            >
              <Heart className="mr-2 h-5 w-5" />
              Começar agora
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="p-6 text-center shadow-card hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-full bg-gradient-primary mx-auto mb-4 flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Matches Inteligentes</h3>
            <p className="text-muted-foreground">
              Algoritmo que conecta pessoas com gostos semelhantes em animes e jogos
            </p>
          </Card>

          <Card className="p-6 text-center shadow-card hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-full bg-gradient-secondary mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Perfil Otaku</h3>
            <p className="text-muted-foreground">
              Mostre seus animes favoritos, jogos e interesses através de hashtags
            </p>
          </Card>

          <Card className="p-6 text-center shadow-card hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-full bg-gradient-primary mx-auto mb-4 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Comunidade Geek</h3>
            <p className="text-muted-foreground">
              Converse e compartilhe experiências com outros fãs da cultura pop
            </p>
          </Card>
        </div>

        {/* Popular Interests */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold mb-6 text-foreground">
            Interesses Populares
          </h3>
          <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
            {[
              "#onepiece", "#naruto", "#dragonball", "#attackontitan",
              "#demonslayer", "#gaming", "#cosplay", "#manga",
              "#pokemon", "#studioghibli", "#jrpg", "#anime"
            ].map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
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