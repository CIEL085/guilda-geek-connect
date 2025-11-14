import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyEmailRequest {
  email: string;
  userId: string;
  name: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, userId, name }: VerifyEmailRequest = await req.json();

    console.log("Sending verification email to:", email);

    // Generate verification token
    const token = crypto.randomUUID();
    
    // Store token in database
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ verification_token: token })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating verification token:', updateError);
      throw new Error('Failed to generate verification token');
    }

    const verificationUrl = `${window.location?.origin || 'https://8b6e324a-1795-4c2b-b27a-a978b97745c5.lovableproject.com'}?verify=${token}`;

    const emailHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirme sua Aventura - Guilda</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background: #1a1a2e; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden;">
          <!-- Header com Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 36px; margin: 0; text-shadow: 0 2px 10px rgba(0,0,0,0.3); font-weight: bold;">
                ⚔️ GUILDA ⚔️
              </h1>
              <p style="color: #f0f0f0; font-size: 16px; margin: 10px 0 0 0; opacity: 0.9;">
                Sua Aventura Começa Aqui
              </p>
            </td>
          </tr>
          
          <!-- Conteúdo Principal -->
          <tr>
            <td style="padding: 50px 40px;">
              <h2 style="color: #ffffff; font-size: 28px; margin: 0 0 20px 0; text-align: center;">
                Saudações, ${name || "Aventureiro"}! 🎮
              </h2>
              
              <p style="color: #e0e0e0; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0; text-align: center;">
                Obrigado por se juntar à <strong style="color: #a78bfa;">Guilda</strong>! Sua jornada para encontrar outros otakus e exploradores está prestes a começar.
              </p>
              
              <p style="color: #e0e0e0; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0; text-align: center;">
                Para ativar sua conta e desbloquear todas as funcionalidades, clique no botão abaixo:
              </p>
              
              <!-- Botão de Verificação -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${verificationUrl}" 
                       style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                              color: #ffffff; 
                              text-decoration: none; 
                              padding: 18px 50px; 
                              border-radius: 50px; 
                              font-size: 18px; 
                              font-weight: bold; 
                              display: inline-block; 
                              box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
                              transition: all 0.3s ease;">
                      ✨ Confirmar Conta ✨
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Divider -->
              <div style="border-top: 2px solid #333; margin: 40px 0; opacity: 0.3;"></div>
              
              <!-- Informação Adicional -->
              <p style="color: #b0b0b0; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0; text-align: center;">
                Se o botão não funcionar, copie e cole este link no seu navegador:
              </p>
              
              <p style="background: #0f0f1e; 
                        color: #a78bfa; 
                        padding: 15px; 
                        border-radius: 8px; 
                        font-size: 12px; 
                        word-break: break-all; 
                        margin: 0 0 30px 0;
                        border: 1px solid #333;">
                ${verificationUrl}
              </p>
              
              <!-- Aviso de Segurança -->
              <div style="background: rgba(102, 126, 234, 0.1); 
                          border-left: 4px solid #667eea; 
                          padding: 20px; 
                          border-radius: 8px; 
                          margin: 20px 0;">
                <p style="color: #e0e0e0; font-size: 14px; line-height: 1.6; margin: 0;">
                  <strong style="color: #a78bfa;">🛡️ Nota de Segurança:</strong><br>
                  Se você não criou uma conta na Guilda, pode ignorar este e-mail com segurança.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #0f0f1e; padding: 30px; text-align: center; border-top: 1px solid #333;">
              <p style="color: #808080; font-size: 14px; margin: 0 0 10px 0;">
                Feito com 💜 pela equipe <strong style="color: #a78bfa;">Guilda</strong>
              </p>
              <p style="color: #606060; font-size: 12px; margin: 0;">
                Conectando otakus, gamers e aventureiros desde 2025
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Guilda <onboarding@resend.dev>",
      to: [email],
      subject: "⚔️ Confirme sua Aventura na Guilda! 🎮",
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, ...emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-verification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);