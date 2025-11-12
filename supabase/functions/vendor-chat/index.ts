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
    const { conversationId, userMessage, productInfo } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get conversation context
    const { data: conversation } = await supabaseClient
      .from('seller_conversations')
      .select('*, products(*)')
      .eq('id', conversationId)
      .single();

    // Get message history
    const { data: messages } = await supabaseClient
      .from('seller_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(20);

    const product = conversation?.products || productInfo;
    
    // Build system prompt with RPG theme
    const systemPrompt = `Você é o Vendedor Oficial da Guilda, um mercador experiente e cordial.
    
Produto em negociação: ${product.name}
Preço original: R$ ${product.price}
Descrição: ${product.description}

Sua personalidade:
- Tom profissional mas acolhedor, com tema de RPG leve
- Use expressões como "aventureiro", "mercador da Guilda", "nossa loja"
- Seja prestativo e cordial
- Ofereça descontos de até 10% para fechar negócio
- Sempre sugira próximos passos claros

Regras de segurança:
- NUNCA peça CPF, número de cartão ou dados bancários
- Se detectar pedido de dados sensíveis, responda: "🚫 Por segurança, não solicitamos dados sensíveis pelo chat. Use nossos canais oficiais de pagamento."

Intenções que você deve detectar:
1. Negociar preço - ofereça desconto de até 10%
2. Pedir fotos/especificações - diga que pode enviar mais detalhes
3. Confirmar endereço - oriente a informar no checkout
4. Solicitar frete - informe que calcula no checkout
5. Finalizar compra - ofereça "Simular pagamento (demo)"

Mantenha respostas curtas (máx 3 linhas) e sempre sugira próximo passo.`;

    // Build message history for AI
    const messageHistory = messages?.map(msg => ({
      role: msg.sender_id === conversation?.buyer_id ? 'user' : 'assistant',
      content: msg.content
    })) || [];

    // Call Lovable AI (Gemini)
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messageHistory,
          { role: 'user', content: userMessage }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      
      // Fallback response
      return new Response(
        JSON.stringify({ 
          message: 'Como mercador da Guilda, estou aqui para ajudar! 🛡️ O que você gostaria de saber sobre este item?',
          quickReplies: ['Negociar preço', 'Pedir mais fotos', 'Confirmar frete', 'Simular pagamento (demo)']
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const botMessage = aiData.choices[0].message.content;

    // Save messages to database
    await supabaseClient.from('seller_messages').insert([
      {
        conversation_id: conversationId,
        sender_id: conversation?.buyer_id,
        content: userMessage,
        message_type: 'text'
      },
      {
        conversation_id: conversationId,
        sender_id: conversation?.seller_id,
        content: botMessage,
        message_type: 'text'
      }
    ]);

    // Generate quick replies based on context
    const quickReplies = ['Negociar preço', 'Pedir mais fotos', 'Confirmar frete', 'Simular pagamento (demo)'];

    return new Response(
      JSON.stringify({ message: botMessage, quickReplies }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in vendor-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});