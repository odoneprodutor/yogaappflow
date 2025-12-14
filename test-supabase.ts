import { supabase } from './services/supabase';

// Script de diagnóstico para testar conexão com Supabase
async function testSupabaseConnection() {
    console.log('🔍 Iniciando diagnóstico do Supabase...\n');

    // 1. Verificar variáveis de ambiente
    console.log('1️⃣ Verificando variáveis de ambiente:');
    console.log('   VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('   VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Definida' : '❌ Não definida');
    console.log('');

    // 2. Testar conexão básica
    console.log('2️⃣ Testando conexão com Supabase:');
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
            console.error('   ❌ Erro ao conectar:', error.message);
        } else {
            console.log('   ✅ Conexão estabelecida com sucesso!');
            console.log('   Sessão atual:', data.session ? 'Logado' : 'Não logado');
        }
    } catch (err) {
        console.error('   ❌ Erro de rede:', err);
    }
    console.log('');

    // 3. Testar criação de usuário
    console.log('3️⃣ Testando criação de usuário de teste:');
    const testEmail = `teste-${Date.now()}@yogaflow.com`;
    const testPassword = 'senha123';

    try {
        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
            options: {
                data: {
                    name: 'Teste Diagnóstico',
                },
            },
        });

        if (error) {
            console.error('   ❌ Erro ao criar usuário:', error.message);
            console.error('   Código:', error.status);
        } else if (data.user) {
            console.log('   ✅ Usuário criado com sucesso!');
            console.log('   ID:', data.user.id);
            console.log('   Email:', data.user.email);

            // 4. Testar criação de perfil
            console.log('');
            console.log('4️⃣ Testando criação de perfil:');
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: data.user.id,
                        name: 'Teste Diagnóstico',
                        email: testEmail,
                    },
                ]);

            if (profileError) {
                console.error('   ❌ Erro ao criar perfil:', profileError.message);
                console.error('   Código:', profileError.code);
                console.error('   Detalhes:', profileError.details);
            } else {
                console.log('   ✅ Perfil criado com sucesso!');
            }

            // 5. Limpar dados de teste
            console.log('');
            console.log('5️⃣ Limpando dados de teste...');
            await supabase.auth.signOut();
            console.log('   ✅ Logout realizado');
        }
    } catch (err) {
        console.error('   ❌ Erro inesperado:', err);
    }

    console.log('\n✅ Diagnóstico concluído!');
    console.log('📊 Verifique os resultados acima.');
}

// Executar diagnóstico
testSupabaseConnection();
