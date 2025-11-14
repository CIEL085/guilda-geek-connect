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
import { MOCK_PROFILES, filterProfilesByPreferences } from "@/data/mockProfiles";

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

  // Check for email verification token in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const verifyToken = urlParams.get('verify');
    
    if (verifyToken) {
      const verifyEmail = async () => {
        try {
          const { data, error } = await supabase.functions.invoke('verify-email', {
            body: { token: verifyToken }
          });

          if (error) throw error;

          toast({
            title: data.message || "✨ Email verificado com sucesso!",
            description: "Você já pode fazer login na sua conta.",
            duration: 5000
          });

          // Remove token from URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Email verification error:', error);
          toast({
            title: "Erro na verificação",
            description: error.message || "Token inválido ou expirado.",
            variant: "destructive"
          });
        }
      };

      verifyEmail();
    }
  }, [toast]);

  // Load and filter profiles when preferences change
  useEffect(() => {
    if (currentView === "app" && userPreferences) {
      // Create a mock current user based on preferences
      const currentUser = {
        age: userPreferences.age || 25,
        latitude: userPreferences.latitude,
        longitude: userPreferences.longitude,
        city: userPreferences.location
      };

      // Filter profiles based on mutual preferences
      const filteredProfiles = filterProfilesByPreferences(
        MOCK_PROFILES,
        currentUser,
        userPreferences
      );

      setProfiles(filteredProfiles);
      setProfileIndex(0);
    } else {
      // Show all mock profiles when not in app view
      setProfiles(MOCK_PROFILES);
    }
  }, [currentView, userPreferences]);

  const loadProfiles = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .neq('user_id', user.id)
      .limit(20);

    if (data) {
      // Get current user's profile for filtering
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

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
            gender: profile.gender,
            city: profile.city,
            latitude: profile.latitude,
            longitude: profile.longitude,
            ageMin: profile.age_min || 18,
            ageMax: profile.age_max || 75,
            maxDistance: profile.max_distance || 50,
            image: photos?.[0]?.photo_url || 
                   "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop",
            interests: profile.interests || []
          };
        })
      );

      // Filter profiles based on mutual preferences
      if (currentUserProfile) {
        const currentUser = {
          age: currentUserProfile.age,
          latitude: currentUserProfile.latitude,
          longitude: currentUserProfile.longitude,
        };

        const preferences = {
          genderPreference: userPreferences.genderPreference,
          ageMin: currentUserProfile.age_min || 18,
          ageMax: currentUserProfile.age_max || 75,
          maxDistance: currentUserProfile.max_distance || 50
        };

        const filtered = filterProfilesByPreferences(
          profilesWithPhotos,
          currentUser,
          preferences
        );

        setProfiles(filtered);
      } else {
        setProfiles(profilesWithPhotos);
      }
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
  const handlePreferencesComplete = async (preferences) => {
    setUserPreferences(prev => ({ ...prev, ...preferences }));
    
    // If user is authenticated, save preferences to database
    if (user) {
      // Parse city to get coordinates (mock for now)
      const cityCoords = {
        "São Paulo, SP": { lat: -23.5505, lon: -46.6333 },
        "Rio de Janeiro, RJ": { lat: -22.9068, lon: -43.1729 },
        "Belo Horizonte, MG": { lat: -19.9167, lon: -43.9345 },
        "Brasília, DF": { lat: -15.8267, lon: -47.9218 },
        "Curitiba, PR": { lat: -25.4284, lon: -49.2733 },
        "Porto Alegre, RS": { lat: -30.0346, lon: -51.2177 },
        "Salvador, BA": { lat: -12.9714, lon: -38.5014 },
        "Recife, PE": { lat: -8.0476, lon: -34.8770 },
        "Fortaleza, CE": { lat: -3.7172, lon: -38.5433 },
        "Manaus, AM": { lat: -3.1190, lon: -60.0217 }
      };

      const coords = cityCoords[preferences.location] || { lat: -23.5505, lon: -46.6333 };

      await supabase
        .from('profiles')
        .update({
          city: preferences.location,
          latitude: coords.lat,
          longitude: coords.lon,
          age_min: preferences.ageMin,
          age_max: preferences.ageMax,
          max_distance: preferences.maxDistance,
          interests: preferences.interests
        })
        .eq('user_id', user.id);

      // Reload profiles with new preferences
      loadProfiles();
    }
    
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