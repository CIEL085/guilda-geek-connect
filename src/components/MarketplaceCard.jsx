import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const MarketplaceCard = ({ onProductClick }) => {
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_official', true)
        .limit(3);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextProduct = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const prevProduct = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  if (loading || products.length === 0) {
    return null;
  }

  const currentProduct = products[currentIndex];

  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden border-primary/30 hover:shadow-glow transition-all duration-300">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-orbitron flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Novidades da Guilda
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Figures e colecionáveis selecionados pra você
            </p>
          </div>
          <Badge variant="outline" className="bg-gradient-primary text-primary-foreground border-0">
            Oficial
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="relative">
          {/* Product carousel */}
          <div className="relative h-64 overflow-hidden">
            <img
              src={currentProduct.image_url}
              alt={currentProduct.name}
              className="w-full h-full object-cover"
            />
            
            {/* Navigation arrows */}
            {products.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background"
                  onClick={prevProduct}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background"
                  onClick={nextProduct}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Product badge */}
            <div className="absolute top-2 left-2">
              <Badge className="bg-accent/90 backdrop-blur-sm">
                {currentProduct.category}
              </Badge>
            </div>
          </div>

          {/* Product info */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-orbitron font-bold mb-1">
                  {currentProduct.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {currentProduct.description}
                </p>
              </div>
              <div className="text-right ml-4">
                <div className="text-2xl font-bold text-primary font-orbitron">
                  R$ {Number(currentProduct.price).toFixed(2)}
                </div>
                <Badge variant="outline" className="mt-1">
                  {currentProduct.fandom}
                </Badge>
              </div>
            </div>

            <Button
              onClick={() => onProductClick(currentProduct)}
              className="w-full bg-gradient-primary hover:shadow-intense"
              variant="gradient-primary"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Ver Oferta
            </Button>

            {/* Pagination dots */}
            {products.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {products.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentIndex
                        ? "w-8 bg-primary"
                        : "w-2 bg-primary/30 hover:bg-primary/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};