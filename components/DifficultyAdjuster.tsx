import React, { useState } from 'react';
import { TrainingPlan, Difficulty } from '../types';
import { TrendingUp, AlertCircle, CheckCircle, X } from 'lucide-react';

interface DifficultyAdjusterProps {
    plan: TrainingPlan;
    onAdjust: (newDifficulty: Difficulty, reason?: string) => Promise<void>;
}

export default function DifficultyAdjuster({ plan, onAdjust }: DifficultyAdjusterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
    const [reason, setReason] = useState('');
    const [isAdjusting, setIsAdjusting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const currentDifficulty = plan.currentDifficulty || plan.metadata?.level || 'Iniciante';

    const difficulties: { value: Difficulty; label: string; description: string; icon: string }[] = [
        {
            value: 'Iniciante',
            label: 'Iniciante',
            description: 'Poses básicas e suaves, ideal para começar',
            icon: '🌱'
        },
        {
            value: 'Intermediário',
            label: 'Intermediário',
            description: 'Poses moderadas com mais desafios',
            icon: '🌿'
        },
        {
            value: 'Avançado',
            label: 'Avançado',
            description: 'Poses complexas e intensas',
            icon: '🌳'
        },
    ];

    const handleConfirm = async () => {
        if (!selectedDifficulty || selectedDifficulty === currentDifficulty) return;

        setIsAdjusting(true);
        try {
            await onAdjust(selectedDifficulty, reason || undefined);
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                setIsOpen(false);
                setSelectedDifficulty(null);
                setReason('');
            }, 2000);
        } catch (error) {
            console.error('Erro ao ajustar dificuldade:', error);
            alert('Erro ao ajustar dificuldade. Tente novamente.');
        } finally {
            setIsAdjusting(false);
        }
    };

    const getDifficultyChange = () => {
        if (!selectedDifficulty) return null;

        const levels = ['Iniciante', 'Intermediário', 'Avançado'];
        const currentIndex = levels.indexOf(currentDifficulty);
        const newIndex = levels.indexOf(selectedDifficulty);

        if (newIndex > currentIndex) return 'increase';
        if (newIndex < currentIndex) return 'decrease';
        return 'same';
    };

    const change = getDifficultyChange();

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="w-full p-4 bg-sage-600 text-white rounded-xl font-medium hover:bg-sage-700 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
                <TrendingUp className="w-5 h-5" />
                Ajustar Dificuldade
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">
                                Ajustar Dificuldade
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                                disabled={isAdjusting}
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Current Difficulty */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="text-sm text-gray-600 mb-1">Dificuldade Atual</div>
                                <div className="text-lg font-bold text-gray-900">{currentDifficulty}</div>
                                {plan.completedSessions && plan.totalPlannedSessions && (
                                    <div className="text-sm text-gray-500 mt-2">
                                        Progresso: {plan.completedSessions} de {plan.totalPlannedSessions} sessões
                                    </div>
                                )}
                            </div>

                            {/* Difficulty Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Nova Dificuldade
                                </label>
                                <div className="space-y-2">
                                    {difficulties.map(({ value, label, description, icon }) => (
                                        <button
                                            key={value}
                                            onClick={() => setSelectedDifficulty(value)}
                                            disabled={isAdjusting || value === currentDifficulty}
                                            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedDifficulty === value
                                                ? 'bg-sage-600 text-white border-sage-600 shadow-md transform scale-[1.02]'
                                                : value === currentDifficulty
                                                    ? 'border-stone-200 bg-stone-50 opacity-50 cursor-not-allowed'
                                                    : 'border-stone-200 text-stone-600 hover:border-sage-300 bg-white'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="text-2xl">{icon}</span>
                                                <div className="flex-1">
                                                    <div className={`font-medium ${selectedDifficulty === value ? 'text-white' : 'text-stone-700'
                                                        }`}>
                                                        {label}
                                                        {value === currentDifficulty && (
                                                            <span className="ml-2 text-xs opacity-70">(Atual)</span>
                                                        )}
                                                    </div>
                                                    <div className={`text-xs mt-1 ${selectedDifficulty === value ? 'text-sage-100' : 'text-stone-500'}`}>
                                                        {description}
                                                    </div>
                                                </div>
                                                {selectedDifficulty === value && (
                                                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <CheckCircle className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Reason (Optional) */}
                            {selectedDifficulty && selectedDifficulty !== currentDifficulty && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Motivo (Opcional)
                                    </label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Ex: Estou achando muito fácil / Preciso de mais desafio"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                        rows={3}
                                        disabled={isAdjusting}
                                    />
                                </div>
                            )}

                            {/* Warning */}
                            {change && change !== 'same' && (
                                <div className={`rounded-xl p-4 ${change === 'increase'
                                    ? 'bg-orange-50 border border-orange-200'
                                    : 'bg-blue-50 border border-blue-200'
                                    }`}>
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className={`w-5 h-5 mt-0.5 ${change === 'increase' ? 'text-orange-600' : 'text-blue-600'
                                            }`} />
                                        <div className={`text-sm ${change === 'increase' ? 'text-orange-900' : 'text-blue-900'
                                            }`}>
                                            <strong>
                                                {change === 'increase' ? 'Aumentando Dificuldade' : 'Reduzindo Dificuldade'}
                                            </strong>
                                            <p className="mt-1">
                                                {change === 'increase'
                                                    ? 'Seus exercícios futuros serão mais desafiadores. Seu progresso atual será mantido.'
                                                    : 'Seus exercícios futuros serão mais suaves. Seu progresso atual será mantido.'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Success Message */}
                            {showSuccess && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <div className="text-sm text-green-900 font-medium">
                                            Dificuldade ajustada com sucesso!
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
                            <button
                                onClick={() => setIsOpen(false)}
                                disabled={isAdjusting}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={!selectedDifficulty || selectedDifficulty === currentDifficulty || isAdjusting}
                                className="flex-1 px-6 py-3 bg-sage-600 text-white rounded-xl font-medium hover:bg-sage-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                {isAdjusting ? 'Ajustando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
