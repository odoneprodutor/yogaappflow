import React, { useState, useEffect, useRef } from 'react';
import { Routine, Pose } from '../types';
import { VideoPlayerToggle } from './VideoPlayerToggle';
import { Button } from './ui';
import { Play, Pause, SkipForward, SkipBack, X, CheckCircle, RotateCcw } from 'lucide-react';

interface RoutinePlayerProps {
  routine: Routine;
  onExit: () => void;
  onComplete: () => void;
}

export const RoutinePlayer: React.FC<RoutinePlayerProps> = ({ routine, onExit, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(routine.poses[0].durationDefault);
  const [isFinished, setIsFinished] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentPose = routine.poses[currentIndex];
  const nextPose = routine.poses[currentIndex + 1];

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  const clearTransition = () => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    setIsTransitioning(false);
  };

  const handleFinish = () => {
    clearTransition();
    setIsFinished(true);
    setIsActive(false);
  };

  const handleNext = () => {
    clearTransition();
    if (currentIndex < routine.poses.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setTimeLeft(routine.poses[nextIdx].durationDefault);
      setIsActive(true);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    clearTransition();
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      setTimeLeft(routine.poses[prevIdx].durationDefault);
      setIsActive(false);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  // Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);

      // Auto Advance check
      if (currentIndex < routine.poses.length - 1) {
        if (autoAdvance) {
          setIsTransitioning(true);
          // Set delay for transition
          transitionTimerRef.current = setTimeout(() => {
            handleNext();
          }, 2000);
        }
      } else {
        handleFinish();
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, autoAdvance, currentIndex]);

  // Calculate progress
  const progress = ((routine.poses.length - currentIndex) / routine.poses.length) * 100;
  const timeProgress = ((currentPose.durationDefault - timeLeft) / currentPose.durationDefault) * 100;

  if (isFinished) {
    return (
      <div className="fixed inset-0 bg-sage-50 z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={48} className="text-green-600" />
        </div>
        <h2 className="text-4xl font-light text-sage-900 mb-2">Namastê</h2>
        <p className="text-stone-500 max-w-md mb-8">
          Parabéns por completar seu fluxo de {routine.name}. Vamos registrar como você se sente?
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={onExit}>Voltar ao Menu</Button>
          <Button onClick={onComplete}>Concluir & Dar Feedback</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-zen-offwhite z-50 flex flex-col">
      {/* Top Bar */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-stone-100 bg-white/80 backdrop-blur-sm">
        <button onClick={onExit} className="text-stone-400 hover:text-stone-800 transition-colors">
          <X size={24} />
        </button>
        <div className="text-sm font-medium text-stone-500">
          Pose {currentIndex + 1} de {routine.poses.length}
        </div>
        <div className="w-6" /> {/* Spacer */}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto py-12 px-6 flex flex-col lg:flex-row gap-8 lg:items-center lg:h-full lg:justify-center">

          {/* Visuals */}
          <div className="w-full lg:w-1/2">
            <VideoPlayerToggle media={currentPose.media} title={currentPose.portugueseName} />
          </div>

          {/* Info & Timer */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
            <h2 className="text-4xl font-light text-sage-900 mb-1">{currentPose.portugueseName}</h2>
            <p className="text-lg text-sage-600 italic mb-6">{currentPose.sanskritName}</p>

            {/* Timer Ring */}
            <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
              {isTransitioning && (
                <div className="absolute inset-0 bg-sage-50/90 rounded-full flex items-center justify-center z-10 animate-pulse">
                  <span className="text-xs font-bold text-sage-700 uppercase tracking-widest">Avançando...</span>
                </div>
              )}
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="#e3e8e3" strokeWidth="8" fill="none" />
                <circle
                  cx="80" cy="80" r="70"
                  stroke="#567556" strokeWidth="8" fill="none"
                  strokeDasharray="440"
                  strokeDashoffset={440 - (440 * timeProgress) / 100}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute text-3xl font-light text-stone-700 font-mono">
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </div>
            </div>

            <p className="text-stone-600 mb-6 max-w-md">{currentPose.description}</p>

            {/* Auto Advance Toggle */}
            <div className="flex items-center gap-3 mb-8 cursor-pointer group" onClick={() => setAutoAdvance(!autoAdvance)}>
              <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${autoAdvance ? 'bg-sage-600' : 'bg-stone-200'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${autoAdvance ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
              <span className={`text-sm font-medium transition-colors ${autoAdvance ? 'text-sage-700' : 'text-stone-400'}`}>
                Avanço Automático {autoAdvance ? 'Ligado' : 'Desligado'}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6">
              <button onClick={handlePrev} disabled={currentIndex === 0} className="p-4 rounded-full text-sage-600 hover:bg-sage-100 disabled:opacity-30 disabled:hover:bg-transparent">
                <SkipBack size={28} />
              </button>

              <button
                onClick={toggleTimer}
                className="w-20 h-20 rounded-full bg-sage-600 text-white flex items-center justify-center shadow-xl hover:scale-105 transition-transform hover:bg-sage-700"
              >
                {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
              </button>

              <button onClick={handleNext} className="p-4 rounded-full text-sage-600 hover:bg-sage-100">
                <SkipForward size={28} />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Up Next Preview */}
      <div className="h-20 bg-white border-t border-stone-100 px-6 flex items-center justify-between">
        {nextPose ? (
          <div className="flex items-center gap-4 cursor-pointer opacity-70 hover:opacity-100 transition-opacity" onClick={handleNext}>
            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">A seguir</span>
            <div className="flex items-center gap-3">
              <img src={nextPose.media.thumbnailUrl} className="w-12 h-12 rounded-lg object-cover bg-stone-100" />
              <div className="text-left">
                <p className="text-sm font-semibold text-stone-700">{nextPose.portugueseName}</p>
                <p className="text-xs text-stone-500">{Math.floor(nextPose.durationDefault / 60)}:{String(nextPose.durationDefault % 60).padStart(2, '0')}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sage-600">
            <CheckCircle size={20} />
            <span className="text-sm font-medium">Última postura</span>
          </div>
        )}

        {/* Reset/Exit for mobile mostly */}
        <button onClick={() => { setTimeLeft(currentPose.durationDefault); setIsActive(false); }} className="lg:hidden text-stone-400">
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
};