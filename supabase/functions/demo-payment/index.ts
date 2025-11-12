import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversationId, productId, totalPrice, buyerId } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Generate receipt ID
    const timestamp = Date.now();
    const receiptId = `GUILD-REC-${timestamp}`;

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create demo order
    const { data: order, error: orderError } = await supabaseClient
      .from('demo_orders')
      .insert({
        receipt_id: receiptId,
        buyer_id: buyerId,
        product_id: productId,
        conversation_id: conversationId,
        total_price: totalPrice,
        status: 'pending'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return new Response(
        JSON.stringify({ error: 'Erro ao processar pagamento demo' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get product info
    const { data: product } = await supabaseClient
      .from('products')
      .select('name')
      .eq('id', productId)
      .single();

    // Send system message to conversation
    await supabaseClient
      .from('seller_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: buyerId,
        content: `🎫 Pagamento demo recebido!\n\nPedido: ${product?.name}\nTotal: R$ ${totalPrice}\nRecibo: ${receiptId}\n\n(Demonstração — não foi cobrado)\n\nO vendedor será notificado para confirmar envio.`,
        message_type: 'system'
      });

    return new Response(
      JSON.stringify({ 
        success: true,
        receiptId,
        order,
        message: `🎉 Pagamento demo processado com sucesso!\n\nRecibo: ${receiptId}\nTotal: R$ ${totalPrice}\n\n✨ Esta é uma demonstração. Nenhum valor foi cobrado.`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in demo-payment function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});