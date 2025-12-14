
import { poseStore } from './poseStore';
import { Pose, UserPreferences, Routine } from '../types';

// Helper to get ALL poses from store instead of constants
const getAvailablePoses = () => poseStore.getAll();

export const generateRoutine = (prefs: UserPreferences): Routine => {
  const ALL_POSES = getAvailablePoses();

  // 1. Filter Poses based on Difficulty
  let availablePoses = ALL_POSES;
  
  if (prefs.level === 'Iniciante') {
    availablePoses = ALL_POSES.filter(p => p.difficulty === 'Iniciante');
  } else if (prefs.level === 'Intermediário') {
    availablePoses = ALL_POSES.filter(p => p.difficulty !== 'Avançado');
  }
  // Advanced users get everything

  // 2. Score Poses based on Goal AND Discomforts
  const scoredPoses = availablePoses.map(pose => {
    let score = 0;
    // Base score
    score += 1;
    
    // Benefit matching for GOAL
    const goalMap: Record<string, string[]> = {
      'Flexibilidade': ['Flexibilidade', 'Alongamento', 'Abertura'],
      'Força': ['Força', 'Core', 'Resistência', 'Energia'],
      'Relaxamento': ['Calma', 'Relaxamento', 'Paz', 'Restaurativa'],
      'Alívio de Dor': ['Alívio', 'Coluna', 'Pescoço']
    };

    const goalKeywords = goalMap[prefs.goal] || [];
    const goalMatches = pose.benefits.some(b => goalKeywords.some(k => b.includes(k)));
    if (goalMatches) score += 5;

    // Benefit matching for DISCOMFORTS
    const discomfortMap: Record<string, string[]> = {
        'Lombar': ['Coluna', 'Costas', 'Alívio de Dor'],
        'Pescoço/Ombros': ['Pescoço', 'Ombros', 'Tensão'],
        'Joelhos': [], // In a real app, we would exclude heavy knee poses. Here we just don't boost them.
        'Punhos': [],
        'Nenhum': []
    };

    if (prefs.discomforts && prefs.discomforts.length > 0) {
        prefs.discomforts.forEach(d => {
            const reliefKeywords = discomfortMap[d];
            if (reliefKeywords) {
                const helpsDiscomfort = pose.benefits.some(b => reliefKeywords.some(k => b.includes(k)));
                if (helpsDiscomfort) score += 3; // Boost poses that help the pain
            }
        });
    }

    return { pose, score };
  });

  // Sort by score descending
  scoredPoses.sort((a, b) => b.score - a.score);

  // 3. Select Poses by Structure (The Yoga Wave)
  // Structure: Warmup -> Active/Focus -> Cooldown -> Savasana
  
  // Helper to pick top N from a category
  const pick = (category: string | string[], count: number, excludeIds: Set<string>): Pose[] => {
    const cats = Array.isArray(category) ? category : [category];
    const candidates = scoredPoses
      .filter(sp => cats.includes(sp.pose.category) && !excludeIds.has(sp.pose.id))
      .map(sp => sp.pose); // Already sorted by relevance
    
    const selected = candidates.slice(0, count);
    selected.forEach(p => excludeIds.add(p.id));
    return selected;
  };

  const usedIds = new Set<string>();
  const routinePoses: Pose[] = [];

  // Determine counts based on duration (approximate)
  // 15min ~ 7-8 poses
  // 30min ~ 12-14 poses
  // 45min ~ 18-20 poses
  let activeCount = 3;
  if (prefs.duration === 30) activeCount = 7;
  if (prefs.duration === 45) activeCount = 12;

  // A. Warmup (2 poses)
  const warmups = pick(['Aquecimento'], 2, usedIds);
  routinePoses.push(...warmups);

  // B. Active Phase (Main Body)
  // Mix of Standing, Core, Seated based on goal, but prioritize Standing for flow
  const active = pick(['Pé', 'Core', 'Inversão', 'Sentado'], activeCount, usedIds);
  routinePoses.push(...active);

  // C. Cool Down (Restorative) (2-3 poses)
  const cooldown = pick(['Restaurativa', 'Sentado', 'Inversão'], 2, usedIds);
  routinePoses.push(...cooldown);

  // D. Savasana (Always last)
  const savasana = ALL_POSES.find(p => p.sanskritName === 'Savasana');
  if (savasana && !usedIds.has(savasana.id)) {
    routinePoses.push(savasana);
  }

  // Calculate total real duration
  const totalDuration = routinePoses.reduce((acc, curr) => acc + curr.durationDefault, 0);

  return {
    id: Date.now().toString(),
    name: `Fluxo de ${prefs.goal}`,
    poses: routinePoses,
    totalDuration,
    createdAt: new Date()
  };
};
