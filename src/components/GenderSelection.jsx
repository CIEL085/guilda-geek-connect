import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Heart, Users, ArrowRight } from "lucide-react";

export const GenderSelection = ({ onComplete }) => {
  const [selectedInterests, setSelectedInterests] = useState([]);

  const genderOptions = [
    { id: "women", label: "Mulheres", icon: "♀" },
    { id: "men", label: "Homens", icon: "♂" },
    { id: "non-binary", label: "Pessoas Não-Binárias", icon: "⚧" },
    { id: "everyone", label: "Todos os Gêneros", icon: "🌈" }
  ];

  const toggleInterest = (interest) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleContinue = () => {
    if (selectedInterests.length > 0) {
      onComplete(selectedInterests);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8 shadow-intense">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Quem te interessa?</h2>
          <p className="text-muted-foreground">
            Selecione quem você gostaria de conhecer na Guilda
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {genderOptions.map((option) => (
            <div
              key={option.id}
              className={`relative cursor-pointer transition-all duration-300 ${
                selectedInterests.includes(option.id)
                  ? "transform scale-105"
                  : "hover:scale-102"
              }`}
              onClick={() => toggleInterest(option.id)}
            >
              <Card
                className={`p-4 border-2 transition-all duration-300 ${
                  selectedInterests.includes(option.id)
                    ? "border-primary bg-primary/5 shadow-glow"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{option.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{option.label}</h3>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      selectedInterests.includes(option.id)
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    }`}
                  >
                    {selectedInterests.includes(option.id) && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        <Button
          onClick={handleContinue}
          disabled={selectedInterests.length === 0}
          className="w-full bg-gradient-primary hover:shadow-intense text-lg py-6"
          size="lg"
        >
          <span>Continuar</span>
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Você pode alterar essas preferências a qualquer momento no seu perfil
        </p>
      </Card>
    </div>
  );
};