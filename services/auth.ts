import { User } from '../types';
import { supabase } from './supabase';

export const authService = {
  // Login
  login: async (email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message || 'Email ou senha inválidos.');
    }

    if (!data.user) {
      throw new Error('Erro ao fazer login.');
    }

    // Buscar dados adicionais do usuário na tabela profiles (se existir)
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', data.user.id)
      .single();

    return {
      id: data.user.id,
      name: profile?.name || data.user.email?.split('@')[0] || 'Usuário',
      email: data.user.email || '',
      isAdmin: (data.user.email || '').startsWith('admin'),
    };
  },

  // Cadastro
  signup: async (name: string, email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      throw new Error(error.message || 'Erro ao criar conta.');
    }

    if (!data.user) {
      throw new Error('Erro ao criar conta.');
    }

    // Criar perfil do usuário na tabela profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: data.user.id,
          name,
          email,
        },
      ]);

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError);
    }

    return {
      id: data.user.id,
      name,
      email,
      isAdmin: email.startsWith('admin'),
    };
  },

  // Logout
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message || 'Erro ao fazer logout.');
    }
  },

  // Verificar sessão atual ao recarregar página
  getCurrentUser: async (): Promise<User | null> => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return null;
    }

    // Buscar dados adicionais do usuário na tabela profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', session.user.id)
      .single();

    return {
      id: session.user.id,
      name: profile?.name || session.user.email?.split('@')[0] || 'Usuário',
      email: session.user.email || '',
      isAdmin: (session.user.email || '').startsWith('admin'),
    };
  },
};