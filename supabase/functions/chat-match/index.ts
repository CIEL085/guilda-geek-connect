import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, matchProfile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Criar prompt personalizado baseado no perfil
    const interests = matchProfile.interests?.join(", ") || "anime, games";
    const gender = matchProfile.gender || "neutro";
    const name = matchProfile.name || "Usuário";
    
    const systemPrompt = `Você é ${name}, uma pessoa otaku apaixonada por cultura geek. 
Seus principais interesses são: ${interests}.
Você é ${gender === "masculino" ? "um rapaz animado" : gender === "feminino" ? "uma garota animada" : "uma pessoa animada"} que adora conversar sobre seus hobbies favoritos.
Seja descontraído(a), use emojis ocasionalmente, e mostre entusiasmo genuíno ao falar sobre ${interests}.
Responda de forma natural, como em um app de relacionamentos, demonstrando interesse na conversa.
Mantenha respostas curtas e envolventes (máximo 2-3 frases).
Seja autêntico(a) e carismático(a), fazendo perguntas sobre os gostos da outra pessoa também.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        temperature: 0.9,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit excedido. Tente novamente em alguns instantes." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes no Lovable AI." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro ao conectar com IA");
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content;

    return new Response(
      JSON.stringify({ message: aiMessage }), 
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in chat-match:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro ao processar mensagem" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
