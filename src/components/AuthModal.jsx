import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, Store } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const AuthModal = ({ isOpen, onClose, onComplete, onNeedVerification }) => {
  const [step, setStep] = useState('auth'); // 'auth' | 'role'
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    
    if (isSignUp) {
      // For signup, move to role selection
      setStep('role');
    } else {
      // For login, proceed directly
      await handleLogin();
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check email verification
      const { data: profile } = await supabase
        .from('profiles')
        .select('email_verified')
        .eq('user_id', data.user.id)
        .single();

      if (!profile?.email_verified) {
        toast({
          variant: "destructive",
          title: "Email não verificado",
          description: "Por favor, verifique seu email antes de fazer login.",
        });
        setLoading(false);
        return;
      }

      toast({
        title: "✨ Bem-vindo de volta!",
        description: "Login realizado com sucesso",
      });
      
      onComplete?.();
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: error.message || "Email ou senha incorretos",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!selectedRole) {
      toast({
        variant: "destructive",
        title: "Selecione um tipo",
        description: "Escolha se você é Otaku ou Vendedor",
      });
      return;
    }

    setLoading(true);
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (authError) throw authError;

      // Update profile with vendor status
      const vendorStatus = selectedRole === 'vendedor' ? 'pending' : 'active';
      
      await supabase
        .from('profiles')
        .update({ 
          vendor_status: vendorStatus
        })
        .eq('user_id', authData.user.id);

      // Insert user role
      await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: selectedRole
        });

      // Send verification email via edge function
      console.log('Sending verification email...');
      const { error: emailError } = await supabase.functions.invoke('send-verification-email', {
        body: {
          email: email,
          userId: authData.user.id,
          name: fullName
        }
      });

      if (emailError) {
        console.error('Error sending verification email:', emailError);
      }

      toast({
        title: "🎉 Conta criada!",
        description: "Verifique seu email para ativar sua conta. O email pode demorar alguns minutos para chegar.",
        duration: 8000
      });

      // Close modal and show verification message
      onClose();
      
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: error.message || "Não foi possível criar a conta",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderAuthForm = () => (
    <form onSubmit={handleAuthSubmit} className="space-y-4">
      {isSignUp && (
        <div className="space-y-2">
          <Label htmlFor="fullName">Nome Completo</Label>
          <Input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Seu nome completo"
            required={isSignUp}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          minLength={6}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-secondary"
        disabled={loading}
      >
        {loading ? 'Carregando...' : (isSignUp ? 'Continuar' : 'Entrar')}
      </Button>

      <div className="text-center">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setStep('auth');
          }}
          className="text-sm text-muted-foreground"
        >
          {isSignUp 
            ? 'Já tem uma conta? Entre aqui' 
            : 'Não tem conta? Cadastre-se aqui'
          }
        </Button>
      </div>
    </form>
  );

  const renderRoleSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-muted-foreground">
          Como você deseja explorar a Guilda?
        </p>
      </div>

      <div className="grid gap-4">
        <button
          onClick={() => setSelectedRole('otaku')}
          className={`p-6 rounded-lg border-2 transition-all text-left ${
            selectedRole === 'otaku'
              ? 'border-primary bg-primary/10'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-orbitron font-bold text-lg mb-1">Otaku</h3>
              <p className="text-sm text-muted-foreground">
                Usuário comum · Comprador · Encontre sua guilda
              </p>
            </div>
            {selectedRole === 'otaku' && (
              <Badge className="bg-gradient-primary">Selecionado</Badge>
            )}
          </div>
        </button>

        <button
          onClick={() => setSelectedRole('vendedor')}
          className={`p-6 rounded-lg border-2 transition-all text-left ${
            selectedRole === 'vendedor'
              ? 'border-accent bg-accent/10'
              : 'border-border hover:border-accent/50'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center">
              <Store className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-orbitron font-bold text-lg mb-1">Vendedor</h3>
              <p className="text-sm text-muted-foreground">
                Mercador oficial · Lojista · Venda colecionáveis
              </p>
            </div>
            {selectedRole === 'vendedor' && (
              <Badge className="bg-accent text-accent-foreground">Selecionado</Badge>
            )}
          </div>
        </button>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setStep('auth')}
          className="flex-1"
        >
          Voltar
        </Button>
        <Button
          onClick={handleSignUp}
          disabled={!selectedRole || loading}
          className="flex-1 bg-gradient-primary"
        >
          {loading ? 'Criando conta...' : 'Criar Conta'}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {step === 'role' ? '⚔️ Escolha sua Aventura' : (isSignUp ? 'Criar Conta' : 'Entrar na Guilda')}
          </DialogTitle>
        </DialogHeader>

        {step === 'auth' ? renderAuthForm() : renderRoleSelection()}
      </DialogContent>
    </Dialog>
  );
};