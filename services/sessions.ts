import { supabase } from './supabase';
import { SessionRecord } from '../types';

export const sessionsService = {
    // Buscar todas as sessões do usuário
    getAll: async (userId: string): Promise<SessionRecord[]> => {
        const { data, error } = await supabase
            .from('session_records')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false });

        if (error) {
            console.error('Erro ao buscar sessões:', error);
            throw error;
        }

        return (data || []).map(session => ({
            id: session.id,
            userId: session.user_id,
            planId: session.plan_id,
            date: session.date,
            routineName: session.routine_name,
            duration: session.duration,
            feedback: session.feedback,
        }));
    },

    // Buscar sessões por plano
    getByPlan: async (planId: string): Promise<SessionRecord[]> => {
        const { data, error } = await supabase
            .from('session_records')
            .select('*')
            .eq('plan_id', planId)
            .order('date', { ascending: false });

        if (error) {
            console.error('Erro ao buscar sessões do plano:', error);
            throw error;
        }

        return (data || []).map(session => ({
            id: session.id,
            userId: session.user_id,
            planId: session.plan_id,
            date: session.date,
            routineName: session.routine_name,
            duration: session.duration,
            feedback: session.feedback,
        }));
    },

    // Criar nova sessão
    create: async (session: Omit<SessionRecord, 'id'>): Promise<SessionRecord> => {
        const { data, error } = await supabase
            .from('session_records')
            .insert({
                user_id: session.userId,
                plan_id: session.planId,
                date: session.date,
                routine_name: session.routineName,
                duration: session.duration,
                feedback: session.feedback,
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar sessão:', error);
            throw error;
        }

        return {
            id: data.id,
            userId: data.user_id,
            planId: data.plan_id,
            date: data.date,
            routineName: data.routine_name,
            duration: data.duration,
            feedback: data.feedback,
        };
    },

    // Atualizar sessão
    update: async (sessionId: string, updates: Partial<SessionRecord>): Promise<void> => {
        const dbUpdates: any = {};

        if (updates.routineName !== undefined) dbUpdates.routine_name = updates.routineName;
        if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
        if (updates.feedback !== undefined) dbUpdates.feedback = updates.feedback;

        const { error } = await supabase
            .from('session_records')
            .update(dbUpdates)
            .eq('id', sessionId);

        if (error) {
            console.error('Erro ao atualizar sessão:', error);
            throw error;
        }
    },

    // Deletar sessão
    delete: async (sessionId: string): Promise<void> => {
        const { error } = await supabase
            .from('session_records')
            .delete()
            .eq('id', sessionId);

        if (error) {
            console.error('Erro ao deletar sessão:', error);
            throw error;
        }
    },

    // Buscar estatísticas do usuário
    getStats: async (userId: string) => {
        const { data, error } = await supabase
            .rpc('user_stats')
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error('Erro ao buscar estatísticas:', error);
            return {
                totalSessions: 0,
                totalMinutes: 0,
                lastSessionDate: null,
                firstSessionDate: null,
            };
        }

        const stats = data as { total_sessions: number; total_minutes: number; last_session_date: string | null; first_session_date: string | null } | null;

        return {
            totalSessions: stats?.total_sessions || 0,
            totalMinutes: stats?.total_minutes || 0,
            lastSessionDate: stats?.last_session_date || null,
            firstSessionDate: stats?.first_session_date || null,
        };
    },

    // Calcular streak (dias consecutivos)
    getStreak: async (userId: string): Promise<number> => {
        const { data, error } = await supabase
            .rpc('calculate_streak', { p_user_id: userId });

        if (error) {
            console.error('Erro ao calcular streak:', error);
            return 0;
        }

        return data || 0;
    },
};
