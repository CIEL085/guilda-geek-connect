import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { MapPin, Heart, User, Users, ChevronRight, ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { filterCities } from '@/data/brazilianCities';

const AVAILABLE_INTERESTS = [
  "#onepiece", "#naruto", "#dragonball", "#attackontitan", "#demonslayer",
  "#pokemon", "#zelda", "#finalfantasy", "#studioghibli", "#sailormoon",
  "#gaming", "#cosplay", "#manga", "#anime", "#jrpg", "#nintendo",
  "#playstation", "#xbox", "#pc", "#mobile", "#rpg", "#fighting",
  "#horror", "#romance", "#comedy", "#action", "#adventure", "#fantasy",
  "#scifi", "#mecha", "#kawaii", "#otaku", "#convention", "#collectibles"
];

export const PreferencesModal = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({
    genderPreference: '',
    location: '',
    interests: [],
    ageMin: 18,
    ageMax: 75,
    maxDistance: 50
  });
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();

  const handleGenderSelect = (gender) => {
    setPreferences(prev => ({ ...prev, genderPreference: gender }));
  };

  const handleLocationChange = (location) => {
    setPreferences(prev => ({ ...prev, location }));
    const suggestions = filterCities(location);
    setCitySuggestions(suggestions);
    setShowSuggestions(suggestions.length > 0 && location.trim().length >= 2);
  };

  const selectCity = (city) => {
    setPreferences(prev => ({ ...prev, location: city }));
    setShowSuggestions(false);
    setCitySuggestions([]);
  };

  const toggleInterest = (interest) => {
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

    if (step < 4) {
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
                  onFocus={() => {
                    if (preferences.location.trim().length >= 2) {
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    // Delay para permitir o clique na sugestão
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  placeholder="Ex: São Paulo, SP"
                  className="pl-10"
                  autoComplete="off"
                />
                
                {/* Dropdown de sugestões */}
                {showSuggestions && citySuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-primary/30 rounded-md shadow-glow max-h-48 overflow-y-auto z-50">
                    {citySuggestions.map((city, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-primary/10 cursor-pointer transition-colors border-b border-border/20 last:border-b-0"
                        onClick={() => selectCity(city)}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-primary" />
                          <span className="text-sm">{city}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Preferências de Idade</h3>
              <p className="text-muted-foreground text-sm">Qual faixa etária você prefere?</p>
            </div>
            
            <div className="space-y-6 px-2">
              <div>
                <Label className="text-sm font-medium mb-4 block">
                  Idade: {preferences.ageMin} - {preferences.ageMax} anos
                </Label>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Idade Mínima: {preferences.ageMin}</Label>
                    <Slider
                      value={[preferences.ageMin]}
                      onValueChange={(value) => setPreferences(prev => ({ ...prev, ageMin: value[0] }))}
                      min={18}
                      max={75}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Idade Máxima: {preferences.ageMax}</Label>
                    <Slider
                      value={[preferences.ageMax]}
                      onValueChange={(value) => setPreferences(prev => ({ ...prev, ageMax: value[0] }))}
                      min={18}
                      max={75}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-4 block">
                  Distância máxima: {preferences.maxDistance} km
                </Label>
                <Slider
                  value={[preferences.maxDistance]}
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, maxDistance: value[0] }))}
                  min={1}
                  max={500}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Mostrar perfis até {preferences.maxDistance} km de distância
                </p>
              </div>
            </div>
          </div>
        );

      case 4:
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