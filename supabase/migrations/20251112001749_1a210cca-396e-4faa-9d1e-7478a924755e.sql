-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('otaku', 'vendedor');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Add email verification fields to profiles
ALTER TABLE public.profiles ADD COLUMN email_verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN verification_token TEXT;
ALTER TABLE public.profiles ADD COLUMN vendor_status TEXT DEFAULT 'pending'; -- 'pending', 'pending_verification', 'verified'

-- Create products table for marketplace
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT,
  fandom TEXT,
  image_url TEXT,
  is_official BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create seller_conversations table
CREATE TABLE public.seller_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES auth.users(id) NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  seller_id UUID REFERENCES auth.users(id) NOT NULL,
  negotiated_price NUMERIC,
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.seller_conversations ENABLE ROW LEVEL SECURITY;

-- Create seller_messages table for vendor chat
CREATE TABLE public.seller_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.seller_conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- 'text', 'quick_reply', 'system'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.seller_messages ENABLE ROW LEVEL SECURITY;

-- Create demo_orders table
CREATE TABLE public.demo_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id TEXT UNIQUE NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  conversation_id UUID REFERENCES public.seller_conversations(id),
  total_price NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'shipped'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.demo_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roles on signup"
  ON public.user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for products
CREATE POLICY "Anyone can view products"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Vendors can insert their products"
  ON public.products FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'vendedor'));

CREATE POLICY "Vendors can update their own products"
  ON public.products FOR UPDATE
  USING (auth.uid() = seller_id);

-- RLS Policies for seller_conversations
CREATE POLICY "Users can view their own seller conversations"
  ON public.seller_conversations FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create conversations"
  ON public.seller_conversations FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Participants can update conversations"
  ON public.seller_conversations FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- RLS Policies for seller_messages
CREATE POLICY "Users can view messages in their conversations"
  ON public.seller_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.seller_conversations
      WHERE id = seller_messages.conversation_id
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON public.seller_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.seller_conversations
      WHERE id = seller_messages.conversation_id
      AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
  );

-- RLS Policies for demo_orders
CREATE POLICY "Users can view their own orders"
  ON public.demo_orders FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "Users can create their own orders"
  ON public.demo_orders FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Trigger to update updated_at on products
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update updated_at on seller_conversations
CREATE TRIGGER update_seller_conversations_updated_at
  BEFORE UPDATE ON public.seller_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some official demo products
INSERT INTO public.products (name, description, price, category, fandom, image_url, is_official, seller_id) VALUES
  ('Action Figure Naruto Shippuden', 'Action Figure premium do Naruto em pose icônica', 149.90, 'Figures', 'Naruto', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500', true, NULL),
  ('Coleção Mangá One Piece Vol 1-10', 'Box completo com os 10 primeiros volumes de One Piece', 299.90, 'Mangás', 'One Piece', 'https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=500', true, NULL),
  ('Funko Pop! Demon Slayer - Tanjiro', 'Funko Pop exclusivo do Tanjiro Kamado', 89.90, 'Figures', 'Demon Slayer', 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=500', true, NULL);