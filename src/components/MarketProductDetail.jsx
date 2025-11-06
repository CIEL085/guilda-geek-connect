import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Star, Shield } from "lucide-react";

export const MarketProductDetail = ({ product, open, onClose }) => {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-orbitron text-primary">{product.name}</DialogTitle>
          <DialogDescription>
            <Badge className="bg-gradient-secondary mt-2">{product.category}</Badge>
            <Badge variant="outline" className="ml-2 text-accent border-accent/50">
              {product.fandom}
            </Badge>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-64 object-cover"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg border border-primary/20">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Vendedor Verificado</p>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-semibold">{product.sellerName}</span>
                <div className="flex items-center gap-1 ml-2">
                  <Star className="h-3 w-3 fill-accent text-accent" />
                  <span className="text-sm">4.9</span>
                </div>
              </div>
            </div>
            <p className="text-3xl font-bold font-orbitron text-primary">{product.price}</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2 font-orbitron">Descrição do Artefato</h3>
            <p className="text-muted-foreground leading-relaxed">{product.fullDescription}</p>
          </div>

          <div className="bg-gradient-hero p-4 rounded-lg border border-primary/30">
            <p className="text-sm text-center text-muted-foreground mb-3">
              🎲 <span className="font-semibold">Dica da Guilda:</span> Este item combina perfeitamente com seus interesses!
            </p>
          </div>

          <div className="flex gap-3">
            <Button 
              className="flex-1 bg-gradient-primary hover:shadow-intense"
              variant="gradient-primary"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Entrar em Contato
            </Button>
            <Button variant="outline" className="border-accent/50 hover:bg-accent/10">
              ❤️ Favoritar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
