import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: Verificar se as variáveis estão sendo carregadas
console.log('🔍 Supabase Config:');
console.log('   URL:', supabaseUrl);
console.log('   Key:', supabaseAnonKey ? '✅ Definida' : '❌ Não definida');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERRO: Variáveis de ambiente do Supabase não encontradas!');
  console.error('   Certifique-se de que o arquivo .env existe e contém:');
  console.error('   VITE_SUPABASE_URL=...');
  console.error('   VITE_SUPABASE_ANON_KEY=...');
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
