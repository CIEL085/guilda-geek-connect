import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, X, MessageCircle, User } from "lucide-react";
import { ProfileCard } from "@/components/ProfileCard";
import { HeroSection } from "@/components/HeroSection";
import { AuthForm } from "@/components/AuthForm";
import { GenderSelection } from "@/components/GenderSelection";
import { InterestSelection } from "@/components/InterestSelection";

const Index = () => {
  const [currentView, setCurrentView] = useState<"hero" | "auth" | "gender" | "interests" | "app">("hero");
  const [profileIndex, setProfileIndex] = useState(0);
  const [userPreferences, setUserPreferences] = useState<{
    userData?: any;
    genderInterests?: string[];
    tags?: string[];
  }>({});

  // Sample profiles for demo
  const sampleProfiles = [
    {
      id: 1,
      name: "Sakura",
      age: 24,
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop",
      interests: ["#onepiece", "#naruto", "#gaming", "#cosplay"]
    },
    {
      id: 2,
      name: "Akira",
      age: 26,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
      interests: ["#dragonball", "#pokemon", "#manga", "#anime"]
    },
    {
      id: 3,
      name: "Yuki",
      age: 22,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=500&fit=crop",
      interests: ["#sailormoon", "#studioghibli", "#jrpg", "#kawaii"]
    }
  ];

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "right") {
      // Like animation could be added here
      console.log("Liked!", sampleProfiles[profileIndex]?.name);
    }
    setProfileIndex((prev) => (prev + 1) % sampleProfiles.length);
  };

  const handleAuthComplete = (userData: any) => {
    setUserPreferences(prev => ({ ...prev, userData }));
    setCurrentView("gender");
  };

  const handleGenderComplete = (genderInterests: string[]) => {
    setUserPreferences(prev => ({ ...prev, genderInterests }));
    setCurrentView("interests");
  };

  const handleInterestComplete = (tags: string[]) => {
    setUserPreferences(prev => ({ ...prev, tags }));
    setCurrentView("app");
  };

  const handleBackToGender = () => {
    setCurrentView("gender");
  };

  // Render different views based on current state
  if (currentView === "hero") {
    return <HeroSection onEnter={() => setCurrentView("auth")} />;
  }

  if (currentView === "auth") {
    return <AuthForm onComplete={handleAuthComplete} />;
  }

  if (currentView === "gender") {
    return <GenderSelection onComplete={handleGenderComplete} />;
  }

  if (currentView === "interests") {
    return (
      <InterestSelection 
        onComplete={handleInterestComplete}
        onBack={handleBackToGender}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="flex items-center justify-between p-6 bg-background/80 backdrop-blur-md border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-primary"></div>
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Guilda
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center max-w-md mx-auto">
          {/* Profile Card */}
          <div className="mb-8 w-full">
            <ProfileCard
              profile={sampleProfiles[profileIndex]}
              onSwipe={handleSwipe}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-6">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full w-16 h-16 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground shadow-glow"
              onClick={() => handleSwipe("left")}
            >
              <X className="h-6 w-6" />
            </Button>
            
            <Button
              variant="default"
              size="lg"
              className="rounded-full w-16 h-16 bg-gradient-secondary hover:shadow-intense shadow-glow"
              onClick={() => handleSwipe("right")}
            >
              <Heart className="h-6 w-6" />
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Descubra otakus próximos de você
            </p>
            <div className="flex justify-center gap-6 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">12</p>
                <p className="text-sm text-muted-foreground">Matches</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">8</p>
                <p className="text-sm text-muted-foreground">Conversas</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;