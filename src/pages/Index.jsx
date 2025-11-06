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
import { PreferencesModal } from "@/components/PreferencesModal";
import { ProfileModal } from "@/components/ProfileModal";
import { ChatModal } from "@/components/ChatModal";
import { MatchModal } from "@/components/MatchModal";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { AIChatSupport } from "@/components/AIChatSupport";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [currentView, setCurrentView] = useState("hero");
  const [profileIndex, setProfileIndex] = useState(0);
  const [userPreferences, setUserPreferences] = useState({});
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [preferencesModalOpen, setPreferencesModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [matches, setMatches] = useState([]);
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();

  // Sample profiles for demo
  const sampleProfiles = [
    {
      id: 1,
      name: "Sakura",
      age: 24,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=500&fit=crop&crop=face",
      interests: ["#onepiece", "#naruto", "#gaming", "#cosplay"]
    },
    {
      id: 2,
      name: "Akira",
      age: 26,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face",
      interests: ["#dragonball", "#pokemon", "#manga", "#anime"]
    },
    {
      id: 3,
      name: "Yuki",
      age: 22,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&crop=face",
      interests: ["#sailormoon", "#studioghibli", "#jrpg", "#kawaii"]
    },
    {
      id: 4,
      name: "Ryu",
      age: 28,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face",
      interests: ["#streetfighter", "#tekken", "#fightinggames", "#arcade"]
    },
    {
      id: 5,
      name: "Luna",
      age: 25,
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop&crop=face",
      interests: ["#pokemon", "#zelda", "#nintendo", "#cute"]
    },
    {
      id: 6,
      name: "Kenji",
      age: 27,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&crop=face",
      interests: ["#finalfantasy", "#jrpg", "#squareenix", "#music"]
    }
  ];

  useEffect(() => {
    // Use sample profiles for testing since we're not using real auth
    setProfiles(sampleProfiles);
  }, []);

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

  const handleSwipe = async (direction) => {
    if (!profiles[profileIndex]) return;

    const currentProfile = profiles[profileIndex];
    
    if (direction === "right") {
      // Adiciona aos matches e abre modal de match
      setMatches(prev => [...prev, currentProfile]);
      setSelectedMatch(currentProfile);
      setMatchModalOpen(true);
    } else {
      toast({
        title: "Perfil descartado",
        description: `Você passou ${currentProfile.name}`,
        duration: 2000
      });
    }
    
    // Move to next profile (cycle through the sample profiles)
    setProfileIndex((prev) => (prev + 1) % profiles.length);
  };

  const handleStartChat = () => {
    if (selectedMatch) {
      setChatModalOpen(true);
    }
  };

  const handleAuthComplete = (userData) => {
    setUserPreferences(prev => ({ ...prev, userData }));
    setCurrentView("gender");
  };

  const handleGenderComplete = (genderInterests) => {
    setUserPreferences(prev => ({ ...prev, genderInterests }));
    setCurrentView("interests");
  };

  const handleInterestComplete = (tags) => {
    setUserPreferences(prev => ({ ...prev, tags }));
    setCurrentView("app");
  };

  const handleBackToGender = () => {
    setCurrentView("gender");
  };

  // Handle auth modal completion - open preferences modal next
  const handleAuthModalComplete = () => {
    setAuthModalOpen(false);
    setPreferencesModalOpen(true);
  };

  // Handle preferences modal completion - go to main app
  const handlePreferencesComplete = (preferences) => {
    setUserPreferences(prev => ({ ...prev, ...preferences }));
    setPreferencesModalOpen(false);
    setCurrentView("app");
  };

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
          onComplete={handleAuthModalComplete}
        />
        <PreferencesModal 
          isOpen={preferencesModalOpen} 
          onClose={() => setPreferencesModalOpen(false)}
          onComplete={handlePreferencesComplete}
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

  const handleUnmatch = (matchId) => {
    setMatches(prev => prev.filter(m => m.id !== matchId));
    setSelectedMatch(null);
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Header */}
      <header className="flex items-center justify-between p-6 bg-card/30 backdrop-blur-xl border-b border-primary/30 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-neon shadow-neon-blue"></div>
          <h1 className="text-3xl font-orbitron font-bold bg-gradient-neon bg-clip-text text-transparent">
            GUILDA
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              if (matches.length > 0) {
                setSelectedMatch(matches[matches.length - 1]);
                setChatModalOpen(true);
              } else {
                toast({
                  title: "Nenhum match ainda",
                  description: "Curta alguns perfis primeiro!",
                  duration: 3000
                });
              }
            }}
            className="hover:bg-primary/20 hover:shadow-neon-blue transition-all relative"
          >
            <MessageCircle className="h-6 w-6 text-primary" />
            {matches.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center text-xs font-bold text-white animate-pulse">
                {matches.length}
              </span>
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setProfileModalOpen(true)}
            className="hover:bg-secondary/20 hover:shadow-neon-purple transition-all"
          >
            <User className="h-6 w-6 text-secondary" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={signOut}
            className="hover:bg-accent/20 hover:shadow-neon-pink transition-all"
          >
            <LogOut className="h-6 w-6 text-accent" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col items-center max-w-md mx-auto">
          {/* Profile Card */}
          <div className="mb-8 w-full">
            {profiles.length > 0 ? (
              <ProfileCard
                profile={profiles[profileIndex] || profiles[0]}
                onSwipe={handleSwipe}
              />
            ) : (
              <Card className="aspect-[3/4] flex items-center justify-center border-2 border-primary/30 bg-card/80 backdrop-blur-sm">
                <p className="text-muted-foreground text-center font-orbitron">
                  Carregando perfis...
                </p>
              </Card>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-8">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full w-20 h-20 border-2 border-destructive text-destructive hover:bg-destructive hover:text-white shadow-neon-pink hover:shadow-intense hover:scale-110 transition-all duration-300"
              onClick={() => handleSwipe("left")}
            >
              <X className="h-8 w-8" />
            </Button>
            
            <Button
              variant="default"
              size="lg"
              className="rounded-full w-20 h-20 bg-gradient-primary hover:shadow-neon-blue shadow-glow hover:scale-110 transition-all duration-300"
              onClick={() => handleSwipe("right")}
            >
              <Heart className="h-8 w-8" />
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-12 text-center">
            <p className="text-foreground font-orbitron font-bold text-lg mb-6">
              Descubra otakus próximos de você
            </p>
            <div className="flex justify-center gap-8">
              <div className="text-center p-4 rounded-xl bg-primary/10 border-2 border-primary/30 backdrop-blur-sm min-w-[100px]">
                <p className="text-4xl font-orbitron font-bold text-primary neon-pulse">{matches.length}</p>
                <p className="text-sm text-muted-foreground font-semibold mt-1">Matches</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-accent/10 border-2 border-accent/30 backdrop-blur-sm min-w-[100px]">
                <p className="text-4xl font-orbitron font-bold text-accent neon-pulse">{matches.length}</p>
                <p className="text-sm text-muted-foreground font-semibold mt-1">Conversas</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* AI Chat Support */}
      <AIChatSupport />

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Modals */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        onComplete={handleAuthModalComplete}
      />
      <PreferencesModal 
        isOpen={preferencesModalOpen} 
        onClose={() => setPreferencesModalOpen(false)}
        onComplete={handlePreferencesComplete}
      />
      <ProfileModal 
        isOpen={profileModalOpen} 
        onClose={() => setProfileModalOpen(false)} 
      />
      <MatchModal
        isOpen={matchModalOpen}
        onClose={() => setMatchModalOpen(false)}
        match={selectedMatch}
        onStartChat={handleStartChat}
      />
      <ChatModal 
        isOpen={chatModalOpen} 
        onClose={() => {
          setChatModalOpen(false);
        }}
        match={selectedMatch}
        onUnmatch={handleUnmatch}
      />
    </div>
  );
};

export default Index;