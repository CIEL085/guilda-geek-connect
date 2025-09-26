import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Mock authentication for testing - simulate logged in user
  const mockUser = {
    id: 'test-user-123',
    email: 'teste@exemplo.com',
    created_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: { full_name: 'Usuário Teste' },
    aud: 'authenticated',
    confirmed_at: new Date().toISOString(),
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    last_sign_in_at: new Date().toISOString(),
    role: 'authenticated',
    updated_at: new Date().toISOString()
  };

  const mockSession = {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    expires_in: 3600,
    token_type: 'bearer',
    user: mockUser
  };

  const [user] = useState(mockUser);
  const [session] = useState(mockSession);
  const [loading] = useState(false);

  const signUp = async (email, password, fullName) => {
    // Mock signup - always succeeds for testing
    return { error: null };
  };

  const signIn = async (email, password) => {
    // Mock signin - always succeeds for testing
    return { error: null };
  };

  const signOut = async () => {
    // Mock signout - just reload page
    window.location.reload();
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};