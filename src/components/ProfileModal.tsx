import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { InterestTags } from '@/components/InterestTags';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Camera } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const [profile, setProfile] = useState({
    display_name: 'Usuário Teste',
    bio: 'Otaku apaixonado por animes e jogos!',
    age: '25',
    interests: ['#onepiece', '#naruto', '#gaming'] as string[]
  });
  const [photos, setPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face'
  ]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const uploadPhoto = async (file: File) => {
    if (!user) return;

    setUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPhotos(prev => [...prev, e.target!.result as string]);
          toast({
            title: "Foto adicionada!",
            description: "Sua foto foi enviada com sucesso."
          });
        }
      };
      reader.readAsDataURL(file);
      setUploading(false);
    }, 1000);
  };

  const removePhoto = async (photoUrl: string, index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "Foto removida",
      description: "A foto foi removida do seu perfil."
    });
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    if (photos.length < 3) {
      toast({
        variant: "destructive",
        title: "Fotos insuficientes",
        description: "Você precisa de pelo menos 3 fotos."
      });
      return;
    }

    setLoading(true);

    // Simulate save delay
    setTimeout(() => {
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas."
      });
      onClose();
      setLoading(false);
    }, 1000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      if (photos.length >= 8) {
        toast({
          variant: "destructive",
          title: "Limite atingido",
          description: "Você pode ter no máximo 8 fotos."
        });
        return;
      }
      uploadPhoto(files[0]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Meu Perfil
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Photo Gallery */}
          <div className="space-y-3">
            <Label>Fotos (mínimo 3, máximo 8)</Label>
            <div className="grid grid-cols-4 gap-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={photo}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => removePhoto(photo, index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  {index === 0 && (
                    <Badge className="absolute bottom-1 left-1 text-xs">Principal</Badge>
                  )}
                </div>
              ))}
              {photos.length < 8 && (
                <label className="aspect-square border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="text-center">
                    <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {uploading ? 'Enviando...' : 'Adicionar'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Nome</Label>
              <Input
                id="displayName"
                value={profile.display_name}
                onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="Seu nome"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                type="number"
                value={profile.age}
                onChange={(e) => setProfile(prev => ({ ...prev, age: e.target.value }))}
                placeholder="Sua idade"
                min="18"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Sobre você</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Conte um pouco sobre você, seus hobbies e o que procura..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Interesses</Label>
              <InterestTags
                selectedTags={profile.interests}
                onTagsChange={(tags) => setProfile(prev => ({ ...prev, interests: tags }))}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveProfile}
              className="flex-1 bg-gradient-secondary"
              disabled={loading || photos.length < 3}
            >
              {loading ? 'Salvando...' : 'Salvar Perfil'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};