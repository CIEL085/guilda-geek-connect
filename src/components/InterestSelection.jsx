import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { InterestTags } from "@/components/InterestTags";

interface InterestSelectionProps {
  onComplete: (interests: string[]) => void;
  onBack: () => void;
}

export const InterestSelection = ({ onComplete, onBack }: InterestSelectionProps) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const handleTagToggle = (tag: string) => {
    setSelectedInterests(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleContinue = () => {
    if (selectedInterests.length >= 3) {
      onComplete(selectedInterests);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 shadow-intense">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Mostre seu lado otaku!</h2>
          <p className="text-muted-foreground">
            Selecione pelo menos 3 hashtags que representam seus gostos
          </p>
        </div>

        <div className="mb-8">
          <InterestTags 
            selectedTags={selectedInterests}
            onTagToggle={handleTagToggle}
            maxTags={15}
          />
        </div>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1"
            size="lg"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          
          <Button
            onClick={handleContinue}
            disabled={selectedInterests.length < 3}
            className="flex-1 bg-gradient-primary hover:shadow-intense"
            size="lg"
          >
            <span>Finalizar perfil</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Mínimo 3 hashtags para continuar • Máximo 15 hashtags
        </p>
      </Card>
    </div>
  );
};