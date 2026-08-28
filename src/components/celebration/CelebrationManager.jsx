import React, { useState, useEffect, useRef } from 'react';
import { useThemeStore } from '../../state/themeStore.jsx';

import ConfettiBurst from '../celebration/ConfettiBurst.jsx';
import SparkleGlow from '../celebration/SparkleGlow.jsx';
import Fireworks from '../celebration/Fireworks.jsx';
import RibbonBurst from '../celebration/RibbonBurst.jsx';
import GlowPulse from '../celebration/GlowPulse.jsx';
import CelebrationSpawner from '../celebration/CelebrationSpawner.jsx';

const DAY_COOLDOWN_MS = 3000; // cooldown between day-completion celebrations
const DAY_ANIMATION_DURATION_MS = 6000; // big day-completion animation
const TASK_ANIMATION_DURATION_MS = 1200; // quick per-task blip

function AnimationForMode({ mode }) {
  if (mode === 'confetti') return <ConfettiBurst />;
  if (mode === 'sparkle') return <SparkleGlow />;
  if (mode === 'fireworks') return <Fireworks />;
  if (mode === 'ribbon') return <RibbonBurst />;
  if (mode === 'glow') return <GlowPulse />;
  if (mode === 'party') return <ConfettiBurst />; // fallback for 'party' mode
  return null;
}

/**
 * Plays a per-task animation when a single task is completed, and a bigger
 * day animation when the last task of the day is completed. If both are
 * configured (and non-'none'), the task animation plays first, then the day
 * animation starts right after it finishes.
 */
export default function CelebrationManager({ dateKey, allDone, completedCount }) {
  const { theme, setThemeVar } = useThemeStore();
  const taskMode = theme['task-completion-animation'] || 'none';
  const dayMode = theme['day-completion-animation'] || 'none';

  // Currently rendering animation: { kind: 'task' | 'day', mode } | null
  const [active, setActive] = useState(null);

  const prevDateKeyRef = useRef(dateKey);
  const prevAllDoneRef = useRef(allDone);
  const prevCompletedCountRef = useRef(completedCount);
  const prevDayModeRef = useRef(dayMode);
  const lastDayCelebrationRef = useRef(0);
  const activeTimeoutRef = useRef(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  function playDay(mode) {
    lastDayCelebrationRef.current = Date.now();
    setActive({ kind: 'day', mode });

    setTimeout(() => {
      setThemeVar('last-celebrated-timestamp', new Date().toISOString());
    }, 0);

    if (activeTimeoutRef.current) clearTimeout(activeTimeoutRef.current);
    activeTimeoutRef.current = setTimeout(() => {
      setActive(null);
      activeTimeoutRef.current = null;
    }, DAY_ANIMATION_DURATION_MS);
  }

  function playTask(mode, thenDayMode) {
    setActive({ kind: 'task', mode });

    if (activeTimeoutRef.current) clearTimeout(activeTimeoutRef.current);
    activeTimeoutRef.current = setTimeout(() => {
      activeTimeoutRef.current = null;
      if (thenDayMode) {
        playDay(thenDayMode);
      } else {
        setActive(null);
      }
    }, TASK_ANIMATION_DURATION_MS);
  }

  useEffect(() => {
    const dateChanged = dateKey !== prevDateKeyRef.current;

    const taskJustCompleted = !dateChanged && completedCount > prevCompletedCountRef.current;
    const dayJustCompleted = !dateChanged && allDone && prevAllDoneRef.current === false;
    const dayModeEnabledWhileComplete =
      !dateChanged && allDone && prevDayModeRef.current === 'none' && dayMode !== 'none';
    const dayShouldCelebrate = dayJustCompleted || dayModeEnabledWhileComplete;

    prevDateKeyRef.current = dateKey;
    prevAllDoneRef.current = allDone;
    prevCompletedCountRef.current = completedCount;
    prevDayModeRef.current = dayMode;

    if (dateChanged) return;
    if (activeRef.current) return; // one animation (or sequence) at a time

    if (dayShouldCelebrate && dayMode !== 'none') {
      const now = Date.now();
      if (now - lastDayCelebrationRef.current < DAY_COOLDOWN_MS) return;

      if (taskJustCompleted && taskMode !== 'none') {
        playTask(taskMode, dayMode);
      } else {
        playDay(dayMode);
      }
      return;
    }

    if (taskJustCompleted && taskMode !== 'none') {
      playTask(taskMode, null);
    }
  }, [dateKey, allDone, completedCount, taskMode, dayMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (activeTimeoutRef.current) clearTimeout(activeTimeoutRef.current);
    };
  }, []);

  if (!active) return null;

  return (
    <>
      <AnimationForMode mode={active.mode} />
      {/* Only the bigger day-completion celebration gets the extra spawned bursts */}
      {active.kind === 'day' && <CelebrationSpawner duration={10000} />}
    </>
  );
}
