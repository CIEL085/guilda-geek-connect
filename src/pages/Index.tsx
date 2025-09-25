import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, X, MessageCircle, User, LogOut } from "lucide-react";
import { ProfileCard } from "@/components/ProfileCard";
import { HeroSection } from "@/components/HeroSection";
import { AuthForm } from "@/components/AuthForm";
import { GenderSelection } from "@/components/GenderSelection";
import { InterestSelection } from "@/components/InterestSelection";
import { AuthModal } from "@/components/AuthModal";
import { ProfileModal } from "@/components/ProfileModal";
import { ChatModal } from "@/components/ChatModal";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [currentView, setCurrentView] = useState<"hero" | "auth" | "gender" | "interests" | "app">("hero");
  const [profileIndex, setProfileIndex] = useState(0);
  const [userPreferences, setUserPreferences] = useState<{
    userData?: any;
    genderInterests?: string[];
    tags?: string[];
  }>({});
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [profiles, setProfiles] = useState<any[]>([]);
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();

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

  useEffect(() => {
    if (user && currentView === "app") {
      loadProfiles();
    }
  }, [user, currentView]);

  const loadProfiles = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .neq('user_id', user.id)
      .limit(20);

    if (data) {
      // Get photos separately
      const profilesWithPhotos = await Promise.all(
        data.map(async (profile) => {
          const { data: photos } = await supabase
            .from('profile_photos')
            .select('photo_url, is_primary')
            .eq('user_id', profile.user_id)
            .order('is_primary', { ascending: false });

          return {
            id: profile.user_id,
            name: profile.display_name,
            age: profile.age,
            image: photos?.[0]?.photo_url || 
                   "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop",
            interests: profile.interests || []
          };
        })
      );
      setProfiles(profilesWithPhotos);
    }
  };

  const handleSwipe = async (direction: "left" | "right") => {
    if (!user || !profiles[profileIndex]) return;

    const currentProfile = profiles[profileIndex];
    
    // Record the swipe
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', currentProfile.id)
      .single();

    if (existingProfile) {
      await supabase
        .from('matches')
        .upsert({
          user_id: user.id,
          matched_user_id: currentProfile.id,
          liked: direction === "right"
        });
    }

    if (direction === "right") {
      toast({
        title: "Match enviado! 💙",
        description: `Você curtiu ${currentProfile.name}!`
      });
    }
    
    setProfileIndex((prev) => (prev + 1) % profiles.length);
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

  // Skip authentication for testing - go directly to app
  useEffect(() => {
    if (!loading) {
      setCurrentView("app");
    }
  }, [loading]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-primary mx-auto mb-4"></div>
          <p className="text-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Render different views based on current state
  if (currentView === "hero") {
    return (
      <>
        <HeroSection onEnter={() => setAuthModalOpen(true)} />
        
        {/* Modals - render here to ensure they're always available */}
        <AuthModal 
          isOpen={authModalOpen} 
          onClose={() => setAuthModalOpen(false)} 
        />
      </>
    );
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
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setChatModalOpen(true)}
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setProfileModalOpen(true)}
          >
            <User className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={signOut}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center max-w-md mx-auto">
          {/* Profile Card */}
          <div className="mb-8 w-full">
            {profiles.length > 0 ? (
              <ProfileCard
                profile={profiles[profileIndex] || profiles[0]}
                onSwipe={handleSwipe}
              />
            ) : (
              <Card className="aspect-[3/4] flex items-center justify-center">
                <p className="text-muted-foreground text-center">
                  Carregando perfis...
                </p>
              </Card>
            )}
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

      {/* Modals */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
      <ProfileModal 
        isOpen={profileModalOpen} 
        onClose={() => setProfileModalOpen(false)} 
      />
      <ChatModal 
        isOpen={chatModalOpen} 
        onClose={() => setChatModalOpen(false)} 
      />
    </div>
  );
};

export default Index;