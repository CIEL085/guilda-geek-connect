import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, CreditCard, CheckCircle, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const DemoPaymentModal = ({ isOpen, onClose, product, conversationId, userId, onComplete }) => {
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [receiptId, setReceiptId] = useState("");
  const { toast } = useToast();

  const freight = 15.00; // Mock freight cost
  const totalPrice = Number(product?.price || 0) + freight;

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('demo-payment', {
        body: {
          conversationId,
          productId: product.id,
          totalPrice,
          buyerId: userId
        }
      });

      if (error) throw error;

      setReceiptId(data.receiptId);
      setSuccess(true);

      toast({
        title: "🎉 Pagamento Demo Processado!",
        description: data.message,
      });

      // Notify parent
      setTimeout(() => {
        onComplete?.();
        handleClose();
      }, 3000);

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        variant: "destructive",
        title: "Erro no pagamento",
        description: error.message || "Não foi possível processar o pagamento demo",
      });
      setProcessing(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setProcessing(false);
    setReceiptId("");
    onClose();
  };

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-primary-foreground animate-pulse" />
            </div>
            <DialogTitle className="text-2xl font-orbitron text-center">
              Pagamento Confirmado!
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-center mb-2">Recibo de Pedido</p>
              <p className="text-lg font-mono font-bold text-center text-primary">
                {receiptId}
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Produto:</span>
                <span className="font-medium">{product?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-bold text-primary">R$ {totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Truck className="h-4 w-4 text-amber-500" />
              <p className="text-xs text-muted-foreground">
                O vendedor será notificado para confirmar envio
              </p>
            </div>

            <Badge variant="outline" className="w-full justify-center py-2 text-xs">
              ✨ Demonstração — Nenhum valor foi cobrado
            </Badge>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center">
            <CreditCard className="h-8 w-8 text-primary-foreground" />
          </div>
          <DialogTitle className="text-2xl font-orbitron text-center">
            Pagamento Demo
          </DialogTitle>
          <DialogDescription className="text-center">
            Guilda Coins — Simulação de checkout
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product summary */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
            <img
              src={product?.image_url}
              alt={product?.name}
              className="h-16 w-16 rounded object-cover"
            />
            <div className="flex-1">
              <p className="font-medium text-sm line-clamp-2">{product?.name}</p>
              <Badge variant="outline" className="mt-1">
                {product?.fandom}
              </Badge>
            </div>
          </div>

          {/* Price breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Produto</span>
              <span className="font-medium">R$ {Number(product?.price || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Frete estimado</span>
              <span className="font-medium">R$ {freight.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold text-primary text-lg">
                R$ {totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Demo warning */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs text-center text-muted-foreground">
              ⚡ <strong>Demonstração</strong> — Não será cobrado valor real
            </p>
          </div>

          {/* Payment button */}
          <Button
            onClick={handlePayment}
            disabled={processing}
            className="w-full bg-gradient-primary"
            variant="gradient-primary"
            size="lg"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                Confirmar Pagamento com Guilda Coins
              </>
            )}
          </Button>

          <Button
            onClick={handleClose}
            disabled={processing}
            variant="outline"
            className="w-full"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};