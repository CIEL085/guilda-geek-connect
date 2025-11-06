import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

export const MarketProductCard = ({ product, onViewDetails }) => {
  return (
    <Card className="overflow-hidden hover:shadow-glow transition-all duration-300 bg-card/50 backdrop-blur-sm border-primary/20">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
        />
        <Badge className="absolute top-2 right-2 bg-gradient-primary">
          {product.category}
        </Badge>
      </div>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-orbitron line-clamp-1">{product.name}</CardTitle>
        <CardDescription className="line-clamp-2">{product.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-accent border-accent/50">
            {product.fandom}
          </Badge>
        </div>
        <p className="text-2xl font-bold font-orbitron text-primary">{product.price}</p>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => onViewDetails(product)}
          className="w-full bg-gradient-primary hover:shadow-intense"
          variant="gradient-primary"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Ver Oferta
        </Button>
      </CardFooter>
    </Card>
  );
};
