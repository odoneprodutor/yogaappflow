import React, { useState } from 'react';
import { UserPreferences, Difficulty } from '../types';
import { TrendingUp, Hand, Zap, Award } from 'lucide-react';

interface ProgressionSettingsProps {
    preferences: UserPreferences;
    onUpdate: (updates: Partial<UserPreferences>) => void;
}

export default function ProgressionSettings({ preferences, onUpdate }: ProgressionSettingsProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const mode = preferences.progressionMode || 'automatic';
    const successRate = preferences.successRate || 0;

    const handleModeChange = (newMode: 'automatic' | 'manual') => {
        onUpdate({ progressionMode: newMode });
    };

    const handleManualLevelChange = (level: Difficulty) => {
        onUpdate({
            manualLevel: level,
            level: level // Atualizar também o nível atual
        });
    };

    const getSuccessRateColor = () => {
        if (successRate >= 80) return 'text-green-600';
        if (successRate >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getSuccessRateMessage = () => {
        if (successRate >= 80) return 'Excelente! Você está pronto para avançar.';
        if (successRate >= 60) return 'Bom trabalho! Continue praticando.';
        return 'Continue se esforçando. A prática leva à perfeição!';
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            {/* Header */}
            <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-sage-500 to-emerald-500 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Controle de Progressão
                        </h3>
                        <p className="text-sm text-gray-500">
                            {mode === 'automatic' ? 'Modo Automático' : 'Modo Manual'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {mode === 'automatic' && (
                        <div className={`text-sm font-medium ${getSuccessRateColor()}`}>
                            {successRate.toFixed(0)}% sucesso
                        </div>
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
                    {/* Mode Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Modo de Progressão
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {/* Automatic Mode */}
                            <button
                                onClick={() => handleModeChange('automatic')}
                                className={`p-4 rounded-xl border-2 transition-all ${mode === 'automatic'
                                    ? 'bg-sage-600 text-white border-sage-600 shadow-md transform scale-[1.02]'
                                    : 'border-stone-200 text-stone-600 hover:border-sage-300 bg-white'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Zap className={`w-5 h-5 ${mode === 'automatic' ? 'text-sage-100' : 'text-stone-400'}`} />
                                    <div className="text-left">
                                        <div className={`font-medium ${mode === 'automatic' ? 'text-white' : 'text-stone-700'}`}>
                                            Automático
                                        </div>
                                        <div className={`text-xs ${mode === 'automatic' ? 'text-sage-100' : 'text-stone-500'}`}>
                                            Sistema decide
                                        </div>
                                    </div>
                                </div>
                            </button>

                            {/* Manual Mode */}
                            <button
                                onClick={() => handleModeChange('manual')}
                                className={`p-4 rounded-xl border-2 transition-all ${mode === 'manual'
                                    ? 'bg-sage-600 text-white border-sage-600 shadow-md transform scale-[1.02]'
                                    : 'border-stone-200 text-stone-600 hover:border-sage-300 bg-white'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Hand className={`w-5 h-5 ${mode === 'manual' ? 'text-sage-100' : 'text-stone-400'}`} />
                                    <div className="text-left">
                                        <div className={`font-medium ${mode === 'manual' ? 'text-white' : 'text-stone-700'}`}>
                                            Manual
                                        </div>
                                        <div className={`text-xs ${mode === 'manual' ? 'text-sage-100' : 'text-stone-500'}`}>
                                            Você escolhe
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Automatic Mode Details */}
                    {mode === 'automatic' && (
                        <div className="bg-gradient-to-br from-sage-50 to-emerald-50 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <Award className="w-5 h-5 text-sage-600 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-sage-900 mb-1">
                                        Aproveitamento Recente: {successRate.toFixed(0)}%
                                    </h4>
                                    <p className="text-sm text-sage-700 mb-3">
                                        {getSuccessRateMessage()}
                                    </p>
                                    <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${successRate >= 80
                                                ? 'bg-green-500'
                                                : successRate >= 60
                                                    ? 'bg-yellow-500'
                                                    : 'bg-red-500'
                                                }`}
                                            style={{ width: `${successRate}%` }}
                                        />
                                    </div>
                                    <div className="mt-3 text-xs text-sage-600">
                                        <strong>Como funciona:</strong> O sistema analisa suas últimas 7 sessões.
                                        Esta métrica reflete seu aproveitamento recente e consistência.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Manual Mode Details */}
                    {mode === 'manual' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Selecione seu Nível
                            </label>
                            <div className="space-y-2">
                                {(['Iniciante', 'Intermediário', 'Avançado'] as Difficulty[]).map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => handleManualLevelChange(level)}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${(preferences.manualLevel || preferences.level) === level
                                            ? 'bg-sage-600 text-white border-sage-600 shadow-md transform scale-[1.02]'
                                            : 'border-stone-200 text-stone-600 hover:border-sage-300 bg-white'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className={`font-medium ${(preferences.manualLevel || preferences.level) === level
                                                    ? 'text-white'
                                                    : 'text-stone-700'
                                                    }`}>
                                                    {level}
                                                </div>
                                                <div className={`text-xs mt-1 ${(preferences.manualLevel || preferences.level) === level ? 'text-sage-100' : 'text-stone-500'}`}>
                                                    {level === 'Iniciante' && 'Poses básicas e suaves'}
                                                    {level === 'Intermediário' && 'Poses moderadas com desafios'}
                                                    {level === 'Avançado' && 'Poses complexas e intensas'}
                                                </div>
                                            </div>
                                            {(preferences.manualLevel || preferences.level) === level && (
                                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
