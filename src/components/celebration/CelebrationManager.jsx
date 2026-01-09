import React, { useState, useEffect, useRef } from 'react';
import { useThemeStore } from '../../state/themeStore.jsx';

import ConfettiBurst from '../celebration/ConfettiBurst.jsx';
import SparkleGlow from '../celebration/SparkleGlow.jsx';
import Fireworks from '../celebration/Fireworks.jsx';
import RibbonBurst from '../celebration/RibbonBurst.jsx';
import GlowPulse from '../celebration/GlowPulse.jsx';
import CelebrationSpawner from '../celebration/CelebrationSpawner.jsx';

const COOLDOWN_MS = 3000; // 3 seconds cooldown
const ANIMATION_DURATION_MS = 6000; // Main animation duration

export default function CelebrationManager({ allDone }) {
  const { theme, setThemeVar } = useThemeStore();
  const mode = theme['completion-animation'];

  const [play, setPlay] = useState(false);

  // Track previous allDone to detect completion
  const prevAllDoneRef = useRef(null);
  
  // Track previous mode to detect when user enables celebration after completing tasks
  const prevModeRef = useRef(mode);

  // Track last celebration timestamp for cooldown
  const lastCelebrationRef = useRef(0);

  // Track if we've initialized from storage
  const initializedRef = useRef(false);

  // Store timeout ID so we can clear it
  const timeoutIdRef = useRef(null);

  // Initialize lastCelebrationRef from theme storage on mount
  if (!initializedRef.current) {
    if (theme['last-celebrated-timestamp']) {
      const timestamp = new Date(theme['last-celebrated-timestamp']).getTime();
      if (!isNaN(timestamp)) {
        lastCelebrationRef.current = timestamp;

      }
    }
    initializedRef.current = true;
  }

  // Handle celebration triggering
  useEffect(() => {

    

    // Detect transition from not done -> all done
    const justCompleted = allDone && prevAllDoneRef.current === false;
    
    // Detect mode change from 'none' to something else while tasks are complete
    const modeEnabledWhileComplete = allDone && 
                                     prevModeRef.current === 'none' && 
                                     mode !== 'none';
    
    const shouldCelebrate = justCompleted || modeEnabledWhileComplete;


    // Update previous states AFTER checking
    prevAllDoneRef.current = allDone;
    prevModeRef.current = mode;

    // Early returns if we shouldn't celebrate
    if (!shouldCelebrate) {
      return;
    }
    
    if (mode === 'none') {
      return;
    }
    
    // Check if celebration is already playing
    if (play) {
      return;
    }

    const now = Date.now();

    // Check cooldown
    const timeSinceLastCelebration = now - lastCelebrationRef.current;
    
    if (timeSinceLastCelebration < COOLDOWN_MS) {
      return;
    }

    // All checks passed - trigger celebration!
    
    lastCelebrationRef.current = now;
    setPlay(true);

    // Persist to theme store (use setTimeout to avoid affecting this render cycle)
    setTimeout(() => {
      setThemeVar('last-celebrated-timestamp', new Date(now).toISOString());
    }, 0);

    // Clean up after animation completes
    // Clear any existing timeout first
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    
    timeoutIdRef.current = setTimeout(() => {
      setPlay(false);
      timeoutIdRef.current = null;
    }, ANIMATION_DURATION_MS);

  }, [allDone, mode, play]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);


  // Don't render anything if not playing
  if (!play) return null;

  return (
    <>
      {/* Main celebration animation based on mode */}
      {mode === 'confetti' && <ConfettiBurst />}
      {mode === 'sparkle' && <SparkleGlow />}
      {mode === 'fireworks' && <Fireworks />}
      {mode === 'ribbon' && <RibbonBurst />}
      {mode === 'glow' && <GlowPulse />}
      {mode === 'party' && <ConfettiBurst />} {/* Fallback for 'party' mode */}

      {/* Additional spawned effects during celebration */}
      <CelebrationSpawner duration={10000} />
    </>
  );
}