import React, { useState } from 'react';
import { UserPreferences, Goal, Duration } from '../types';
import { Settings, Calendar, Clock, Target, Save } from 'lucide-react';

interface FeedPreferencesProps {
    preferences: UserPreferences;
    onUpdate: (updates: Partial<UserPreferences>) => Promise<void>;
}

export default function FeedPreferences({ preferences, onUpdate }: FeedPreferencesProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleUpdate = async (updates: Partial<UserPreferences>) => {
        setIsSaving(true);
        try {
            await onUpdate(updates);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (error) {
            console.error('Erro ao atualizar preferências:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const goals: { value: Goal; label: string; description: string; icon: string }[] = [
        { value: 'Flexibilidade', label: 'Flexibilidade', description: 'Aumentar amplitude de movimento', icon: '🤸' },
        { value: 'Força', label: 'Força', description: 'Desenvolver resistência muscular', icon: '💪' },
        { value: 'Relaxamento', label: 'Relaxamento', description: 'Reduzir estresse e ansiedade', icon: '🧘' },
        { value: 'Alívio de Dor', label: 'Alívio de Dor', description: 'Aliviar desconfortos corporais', icon: '✨' },
    ];

    const durations: { value: Duration; label: string }[] = [
        { value: 15, label: '15 min' },
        { value: 30, label: '30 min' },
        { value: 45, label: '45 min' },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            {/* Header */}
            <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-sage-500 to-emerald-500 rounded-xl flex items-center justify-center">
                        <Settings className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Preferências do Feed
                        </h3>
                        <p className="text-sm text-gray-500">
                            Personalize sua jornada
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {showSuccess && (
                        <span className="text-sm text-green-600 font-medium">
                            ✓ Salvo
                        </span>
                    )}
                    <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="mt-6 space-y-6">
                    {/* Frequência */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                            <Calendar className="w-4 h-4" />
                            Frequência Semanal
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="2"
                                max="7"
                                value={preferences.frequency}
                                onChange={(e) => handleUpdate({ frequency: parseInt(e.target.value) })}
                                className="flex-1 h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-sage-600"
                                disabled={isSaving}
                            />
                            <div className="w-20 text-center">
                                <div className="text-2xl font-bold text-sage-600">
                                    {preferences.frequency}
                                </div>
                                <div className="text-xs text-stone-500">
                                    {preferences.frequency === 1 ? 'dia' : 'dias'}
                                </div>
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                            Recomendamos pelo menos 3 dias por semana para melhores resultados
                        </div>
                    </div>

                    {/* Duração das Sessões */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                            <Clock className="w-4 h-4" />
                            Duração das Sessões
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {durations.map(({ value, label }) => (
                                <button
                                    key={value}
                                    onClick={() => handleUpdate({ duration: value })}
                                    disabled={isSaving}
                                    className={`p-4 rounded-xl border-2 transition-all ${preferences.duration === value
                                        ? 'bg-sage-600 text-white border-sage-600 shadow-md transform scale-[1.02]'
                                        : 'border-stone-200 text-stone-600 hover:border-sage-300 bg-white'
                                        } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className={`text-lg font-bold ${preferences.duration === value ? 'text-white' : 'text-stone-700'
                                        }`}>
                                        {label}
                                    </div>
                                    <div className={`text-xs mt-1 ${preferences.duration === value ? 'text-sage-100' : 'text-stone-500'}`}>
                                        {value === 15 && 'Rápido'}
                                        {value === 30 && 'Ideal'}
                                        {value === 45 && 'Completo'}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Objetivo Principal */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                            <Target className="w-4 h-4" />
                            Objetivo Principal
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {goals.map(({ value, label, description, icon }) => (
                                <button
                                    key={value}
                                    onClick={() => handleUpdate({ goal: value })}
                                    disabled={isSaving}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${preferences.goal === value
                                        ? 'bg-sage-600 text-white border-sage-600 shadow-md transform scale-[1.02]'
                                        : 'border-stone-200 text-stone-600 hover:border-sage-300 bg-white'
                                        } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">{icon}</span>
                                        <div className="flex-1">
                                            <div className={`font-medium ${preferences.goal === value ? 'text-white' : 'text-stone-700'
                                                }`}>
                                                {label}
                                            </div>
                                            <div className={`text-xs mt-1 ${preferences.goal === value ? 'text-sage-100' : 'text-stone-500'}`}>
                                                {description}
                                            </div>
                                        </div>
                                        {preferences.goal === value && (
                                            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-gradient-to-br from-sage-50 to-emerald-50 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <Save className="w-5 h-5 text-sage-600 mt-0.5" />
                            <div className="text-sm text-sage-900">
                                <strong>Atualização Automática:</strong> Suas mudanças são salvas automaticamente
                                e o feed é atualizado imediatamente para refletir suas novas preferências.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
