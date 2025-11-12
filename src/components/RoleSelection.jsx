import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Store } from "lucide-react";

export const RoleSelection = ({ onSelectRole }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-orbitron font-bold text-foreground mb-2">
            ⚔️ Escolha sua Aventura
          </h2>
          <p className="text-muted-foreground">
            Como você deseja explorar a Guilda?
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card 
            className="hover:shadow-glow transition-all duration-300 cursor-pointer border-primary/30 hover:border-primary group"
            onClick={() => onSelectRole('otaku')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-10 w-10 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl font-orbitron">Otaku</CardTitle>
              <CardDescription className="text-base">
                Usuário comum · Comprador
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-6">
                Encontre sua guilda perfeita, converse com outros aventureiros e explore o marketplace de colecionáveis.
              </p>
              <Button 
                variant="gradient-primary" 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRole('otaku');
                }}
              >
                Começar como Otaku
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-glow transition-all duration-300 cursor-pointer border-accent/30 hover:border-accent group"
            onClick={() => onSelectRole('vendedor')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Store className="h-10 w-10 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl font-orbitron">Vendedor</CardTitle>
              <CardDescription className="text-base">
                Mercador oficial · Lojista
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-6">
                Venda seus colecionáveis, negocie com compradores e faça parte do marketplace oficial da Guilda.
              </p>
              <Button 
                variant="outline" 
                className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRole('vendedor');
                }}
              >
                Começar como Vendedor
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};