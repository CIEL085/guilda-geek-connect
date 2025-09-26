import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Heart, User, Users, ChevronRight, ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (preferences: any) => void;
}

const AVAILABLE_INTERESTS = [
  "#onepiece", "#naruto", "#dragonball", "#attackontitan", "#demonslayer",
  "#pokemon", "#zelda", "#finalfantasy", "#studioghibli", "#sailormoon",
  "#gaming", "#cosplay", "#manga", "#anime", "#jrpg", "#nintendo",
  "#playstation", "#xbox", "#pc", "#mobile", "#rpg", "#fighting",
  "#horror", "#romance", "#comedy", "#action", "#adventure", "#fantasy",
  "#scifi", "#mecha", "#kawaii", "#otaku", "#convention", "#collectibles"
];

export const PreferencesModal = ({ isOpen, onClose, onComplete }: PreferencesModalProps) => {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    genderPreference: '',
    location: '',
    interests: [] as string[]
  });
  const { toast } = useToast();

  const handleGenderSelect = (gender: string) => {
    setPreferences(prev => ({ ...prev, genderPreference: gender }));
  };

  const handleLocationChange = (location: string) => {
    setPreferences(prev => ({ ...prev, location }));
  };

  const toggleInterest = (interest: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleNext = () => {
    if (step === 1 && !preferences.genderPreference) {
      toast({
        title: "Selecione uma preferência",
        description: "Por favor, escolha seu interesse de gênero.",
        variant: "destructive"
      });
      return;
    }

    if (step === 2 && !preferences.location.trim()) {
      toast({
        title: "Informe sua localização",
        description: "Por favor, digite sua cidade.",
        variant: "destructive"
      });
      return;
    }

    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    if (preferences.interests.length === 0) {
      toast({
        title: "Selecione pelo menos um interesse",
        description: "Escolha alguns interesses para encontrar pessoas compatíveis.",
        variant: "destructive"
      });
      return;
    }

    onComplete(preferences);
    toast({
      title: "Perfil configurado!",
      description: "Suas preferências foram salvas com sucesso."
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Quem você quer conhecer?</h3>
              <p className="text-muted-foreground text-sm">Escolha sua preferência de gênero</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {[
                { value: 'women', label: 'Mulheres', icon: User },
                { value: 'men', label: 'Homens', icon: Users },
                { value: 'everyone', label: 'Todo mundo', icon: Heart }
              ].map(({ value, label, icon: Icon }) => (
                <Card
                  key={value}
                  className={`p-4 cursor-pointer transition-all hover:shadow-glow ${
                    preferences.genderPreference === value 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => handleGenderSelect(value)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-medium">{label}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Onde você está?</h3>
              <p className="text-muted-foreground text-sm">Informe sua localização para encontrar pessoas próximas</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Cidade</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={preferences.location}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  placeholder="Ex: São Paulo, SP"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Seus interesses geeks</h3>
              <p className="text-muted-foreground text-sm">Selecione pelo menos 3 interesses</p>
            </div>
            
            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
              {AVAILABLE_INTERESTS.map((interest) => (
                <Badge
                  key={interest}
                  variant={preferences.interests.includes(interest) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    preferences.interests.includes(interest)
                      ? "bg-gradient-primary hover:shadow-glow"
                      : "hover:border-primary"
                  }`}
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Badge>
              ))}
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              {preferences.interests.length} interesses selecionados
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Configurar Preferências
          </DialogTitle>
          <div className="flex justify-center mt-2">
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i <= step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          {renderStep()}
        </div>

        <div className="flex justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            {step === 1 ? 'Cancelar' : 'Voltar'}
          </Button>
          
          <Button
            onClick={handleNext}
            className="bg-gradient-secondary flex items-center gap-2"
          >
            {step === 3 ? 'Finalizar' : 'Próximo'}
            {step < 3 && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};