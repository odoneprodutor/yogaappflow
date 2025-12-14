import { supabase } from './supabase';
import { TrainingPlan, Difficulty } from '../types';

export const plansService = {
    // Buscar todos os planos do usuário
    getAll: async (userId: string): Promise<TrainingPlan[]> => {
        const { data, error } = await supabase
            .from('training_plans')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar planos:', error);
            throw error;
        }

        return (data || []).map(plan => ({
            id: plan.id,
            name: plan.name,
            description: plan.description || '',
            stage: plan.stage,
            status: plan.status,
            progress: plan.progress,
            completedSessions: plan.completed_sessions,
            totalPlannedSessions: plan.total_sessions,
            schedule: plan.schedule,
            weeks: plan.weeks,
            reasoning: plan.reasoning,
        }));
    },

    // Buscar plano por ID
    getById: async (planId: string): Promise<TrainingPlan | null> => {
        const { data, error } = await supabase
            .from('training_plans')
            .select('*')
            .eq('id', planId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            console.error('Erro ao buscar plano:', error);
            throw error;
        }

        return {
            id: data.id,
            name: data.name,
            description: data.description || '',
            stage: data.stage,
            status: data.status,
            progress: data.progress,
            completedSessions: data.completed_sessions,
            totalPlannedSessions: data.total_sessions,
            schedule: data.schedule,
            weeks: data.weeks,
            reasoning: data.reasoning,
        };
    },

    // Criar novo plano
    create: async (userId: string, plan: TrainingPlan): Promise<TrainingPlan> => {
        const { data, error } = await supabase
            .from('training_plans')
            .insert({
                user_id: userId,
                name: plan.name,
                stage: plan.stage,
                status: plan.status || 'active',
                progress: plan.progress || 0,
                completed_sessions: plan.completedSessions || 0,
                total_sessions: plan.totalPlannedSessions || 0,
                description: plan.description || '',
                schedule: plan.schedule,
                weeks: plan.weeks,
                reasoning: plan.reasoning,
            })
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar plano:', error);
            throw error;
        }

        return {
            id: data.id,
            name: data.name,
            description: data.description || '',
            stage: data.stage,
            status: data.status,
            progress: data.progress,
            completedSessions: data.completed_sessions,
            totalPlannedSessions: data.total_sessions,
            schedule: data.schedule,
            weeks: data.weeks,
            reasoning: data.reasoning,
        };
    },

    // Atualizar plano
    update: async (planId: string, updates: Partial<TrainingPlan>): Promise<void> => {
        const dbUpdates: any = {};

        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.stage !== undefined) dbUpdates.stage = updates.stage;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
        if (updates.completedSessions !== undefined) dbUpdates.completed_sessions = updates.completedSessions;
        if (updates.totalPlannedSessions !== undefined) dbUpdates.total_sessions = updates.totalPlannedSessions;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.schedule !== undefined) dbUpdates.schedule = updates.schedule;
        if (updates.weeks !== undefined) dbUpdates.weeks = updates.weeks;
        if (updates.reasoning !== undefined) dbUpdates.reasoning = updates.reasoning;

        const { error } = await supabase
            .from('training_plans')
            .update(dbUpdates)
            .eq('id', planId);

        if (error) {
            console.error('Erro ao atualizar plano:', error);
            throw error;
        }
    },

    // Deletar plano
    delete: async (planId: string): Promise<void> => {
        const { error } = await supabase
            .from('training_plans')
            .delete()
            .eq('id', planId);

        if (error) {
            console.error('Erro ao deletar plano:', error);
            throw error;
        }
    },

    // Buscar plano ativo
    getActive: async (userId: string): Promise<TrainingPlan | null> => {
        const { data, error } = await supabase
            .from('training_plans')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            console.error('Erro ao buscar plano ativo:', error);
            throw error;
        }

        return {
            id: data.id,
            name: data.name,
            description: data.description || '',
            stage: data.stage,
            status: data.status,
            progress: data.progress,
            completedSessions: data.completed_sessions,
            totalPlannedSessions: data.total_sessions,
            schedule: data.schedule,
            weeks: data.weeks,
            reasoning: data.reasoning,
        };
    },

    adjustDifficulty: async (
        planId: string,
        newDifficulty: Difficulty,
        reason?: string
    ): Promise<void> => {
        // 1. Buscar plano atual para obter hitórico
        const { data: plan, error: fetchError } = await supabase
            .from('training_plans')
            .select('*')
            .eq('id', planId)
            .single();

        if (fetchError) throw fetchError;

        // 2. Criar registro de histórico
        // Nota: O banco já tem a coluna difficulty_history como JSONB
        const historyEntry = {
            date: new Date().toISOString(),
            oldDifficulty: plan.current_difficulty || plan.metadata?.level || 'Iniciante',
            newDifficulty,
            reason
        };

        const currentHistory = Array.isArray(plan.difficulty_history) ? plan.difficulty_history : [];
        const newHistory = [...currentHistory, historyEntry];

        // 3. Atualizar plano
        // Em um app real, aqui chamaríamos uma Edge Function para recalcular o schedule
        const { error: updateError } = await supabase
            .from('training_plans')
            .update({
                current_difficulty: newDifficulty,
                difficulty_history: newHistory,
                updated_at: new Date().toISOString()
            })
            .eq('id', planId);

        if (updateError) {
            console.error('Erro ao ajustar dificuldade:', updateError);
            throw updateError;
        }
    },
};
