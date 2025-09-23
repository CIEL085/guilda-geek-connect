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
    display_name: '',
    bio: '',
    age: '',
    interests: [] as string[]
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && isOpen) {
      loadProfile();
      loadPhotos();
    }
  }, [user, isOpen]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setProfile({
        display_name: data.display_name || '',
        bio: data.bio || '',
        age: data.age?.toString() || '',
        interests: data.interests || []
      });
    }
  };

  const loadPhotos = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profile_photos')
      .select('photo_url')
      .eq('user_id', user.id)
      .order('created_at');

    if (data) {
      setPhotos(data.map(photo => photo.photo_url));
    }
  };

  const uploadPhoto = async (file: File) => {
    if (!user) return;

    setUploading(true);
    const fileName = `${user.id}/${Date.now()}_${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, file);

    if (uploadError) {
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: "Não foi possível enviar a foto."
      });
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(fileName);

    const { error: dbError } = await supabase
      .from('profile_photos')
      .insert({
        user_id: user.id,
        photo_url: data.publicUrl,
        is_primary: photos.length === 0
      });

    if (!dbError) {
      setPhotos(prev => [...prev, data.publicUrl]);
      toast({
        title: "Foto adicionada!",
        description: "Sua foto foi enviada com sucesso."
      });
    }

    setUploading(false);
  };

  const removePhoto = async (photoUrl: string, index: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('profile_photos')
      .delete()
      .eq('user_id', user.id)
      .eq('photo_url', photoUrl);

    if (!error) {
      setPhotos(prev => prev.filter((_, i) => i !== index));
      toast({
        title: "Foto removida",
        description: "A foto foi removida do seu perfil."
      });
    }
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

    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        display_name: profile.display_name,
        bio: profile.bio,
        age: profile.age ? parseInt(profile.age) : null,
        interests: profile.interests
      });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar o perfil."
      });
    } else {
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas."
      });
      onClose();
    }

    setLoading(false);
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