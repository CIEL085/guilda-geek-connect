import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const EmailVerificationModal = ({ isOpen, onClose, email, token, onVerified }) => {
  const [manualToken, setManualToken] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleVerify = async (verificationToken) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-email', {
        body: { token: verificationToken }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "✨ Email verificado!",
          description: data.message,
        });
        onVerified?.(data.isVendor);
        onClose();
      } else {
        throw new Error(data.error || 'Erro ao verificar email');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        variant: "destructive",
        title: "Erro na verificação",
        description: error.message || "Token inválido ou expirado",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary-foreground" />
          </div>
          <DialogTitle className="text-2xl font-orbitron text-center">
            Verifique seu Email
          </DialogTitle>
          <DialogDescription className="text-center">
            Enviamos um link de confirmação para:
            <br />
            <strong className="text-foreground">{email}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Demo quick verification */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm text-muted-foreground mb-3 text-center">
              🎮 <strong>Modo Demo:</strong> Clique abaixo para confirmar agora
            </p>
            <Button
              onClick={() => handleVerify(token)}
              disabled={loading}
              className="w-full bg-gradient-primary"
              variant="gradient-primary"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmar Agora (Demo)
                </>
              )}
            </Button>
          </div>

          {/* Manual token input */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou insira o token manualmente
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Input
              placeholder="TOKEN123..."
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              className="text-center font-mono"
            />
            <Button
              onClick={() => handleVerify(manualToken)}
              disabled={loading || !manualToken}
              variant="outline"
              className="w-full"
            >
              Verificar Token
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Não recebeu o email? Verifique sua caixa de spam ou aguarde alguns minutos.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};