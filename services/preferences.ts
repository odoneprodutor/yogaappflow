import { supabase } from './supabase';
import { UserPreferences, Difficulty } from '../types';

export const preferencesService = {
    // Buscar preferências do usuário
    get: async (userId: string): Promise<UserPreferences | null> => {
        const { data, error } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // Nenhum registro encontrado
                return null;
            }
            console.error('Erro ao buscar preferências:', error);
            throw error;
        }

        return {
            userId: data.user_id,
            level: data.level,
            goal: data.goal,
            duration: data.duration,
            frequency: data.frequency,
            age: data.age,
            weight: data.weight,
            discomforts: data.discomforts || [],
            hasOnboarded: data.has_onboarded,
            startDate: data.start_date,
        };
    },

    // Salvar ou atualizar preferências
    save: async (userId: string, preferences: UserPreferences): Promise<void> => {
        const { error } = await supabase
            .from('user_preferences')
            .upsert({
                user_id: userId,
                level: preferences.level,
                goal: preferences.goal,
                duration: preferences.duration,
                frequency: preferences.frequency,
                age: preferences.age,
                weight: preferences.weight,
                discomforts: preferences.discomforts,
                has_onboarded: preferences.hasOnboarded,
                start_date: preferences.startDate,
            }, {
                onConflict: 'user_id'
            });

        if (error) {
            console.error('Erro ao salvar preferências:', error);
            throw error;
        }
    },

    // Deletar preferências
    delete: async (userId: string): Promise<void> => {
        const { error } = await supabase
            .from('user_preferences')
            .delete()
            .eq('user_id', userId);

        if (error) {
            console.error('Erro ao deletar preferências:', error);
            throw error;
        }
    },

    updateProgressionMode: async (userId: string, mode: 'automatic' | 'manual'): Promise<void> => {
        const { error } = await supabase
            .from('user_preferences')
            .update({ progression_mode: mode })
            .eq('user_id', userId);

        if (error) {
            console.error('Error updating progression mode:', error);
            throw error;
        }
    },

    updateManualLevel: async (userId: string, level: Difficulty): Promise<void> => {
        const { error } = await supabase
            .from('user_preferences')
            .update({
                manual_level: level,
                level: level
            })
            .eq('user_id', userId);

        if (error) {
            console.error('Error updating manual level:', error);
            throw error;
        }
    },
};
