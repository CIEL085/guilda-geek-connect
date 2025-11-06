import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MarketProductCard } from "@/components/MarketProductCard";
import { MarketProductDetail } from "@/components/MarketProductDetail";
import { mockProducts } from "@/data/mockProducts";
import { Search, Filter, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Market = () => {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const categories = ["Todos", "Figures", "HQs", "Props", "RPG", "Cards", "Merch"];

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.fandom.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-hero pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-primary/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
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
                🛒 Guilda Market
              </h1>
              <p className="text-sm text-muted-foreground">Artefatos escolhidos para você</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar artefatos lendários..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/50 border-primary/30 focus:border-primary"
            />
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`cursor-pointer whitespace-nowrap ${
                  selectedCategory === category 
                    ? "bg-gradient-primary shadow-glow" 
                    : "border-primary/30 hover:border-primary/60"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Nenhum artefato encontrado na sua busca.</p>
            <p className="text-sm text-muted-foreground mt-2">Tente ajustar os filtros ou buscar por outro termo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <MarketProductCard
                key={product.id}
                product={product}
                onViewDetails={setSelectedProduct}
              />
            ))}
          </div>
        )}
      </div>

      {/* Welcome Banner */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-gradient-hero border border-primary/30 rounded-lg p-6 text-center">
          <h2 className="text-xl font-orbitron font-bold mb-2">⚔️ Bem-vindo à Loja da Guilda!</h2>
          <p className="text-muted-foreground">
            Complete sua coleção lendária com itens exclusivos selecionados pela comunidade geek.
          </p>
        </div>
      </div>

      {/* Product Detail Modal */}
      <MarketProductDetail
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};

export default Market;
