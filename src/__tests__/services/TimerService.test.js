import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { TimerService } from '../../services/TimerService.js';

const createMockTechnique = () => ({
  getId: vi.fn(() => 'box4'),
  getTotalDuration: vi.fn(() => 12),
  getCurrentPhase: vi.fn((elapsedSeconds) => {
    const phases = [
      { key: 'inhale', name: 'Inhale', duration: 4 },
      { key: 'hold', name: 'Hold', duration: 4 },
      { key: 'exhale', name: 'Exhale', duration: 4 }
    ];

    const normalizedTime = elapsedSeconds % 12;
    const phaseIndex = normalizedTime < 4 ? 0 : normalizedTime < 8 ? 1 : 2;
    const phase = phases[phaseIndex];
    const phaseStart = phaseIndex * 4;
    const timeInPhase = normalizedTime - phaseStart;

    return {
      phaseIndex,
      phase,
      key: phase.key,
      duration: phase.duration,
      timeInPhase,
      timeLeft: phase.duration - timeInPhase
    };
  })
});

describe('TimerService', () => {
  let timerService;
  let technique;

  beforeEach(() => {
    vi.useFakeTimers();
    timerService = new TimerService();
    technique = createMockTechnique();
  });

  afterEach(() => {
    timerService.stop();
    vi.useRealTimers();
  });

  test('sets the technique and initializes state', () => {
    timerService.setTechnique(technique);

    expect(timerService.getState()).toMatchObject({
      totalDuration: 12,
      technique: 'box4',
      currentTime: 0
    });
    expect(timerService.getCurrentPhase()).toMatchObject({
      key: 'inhale'
    });
  });

  test('starts immediately and emits update events on each tick', async () => {
    const startListener = vi.fn();
    const updateListener = vi.fn();

    timerService.setTechnique(technique);
    timerService.addListener('start', startListener);
    timerService.addListener('update', updateListener);

    await timerService.start();

    expect(startListener).toHaveBeenCalledTimes(1);
    expect(updateListener).toHaveBeenCalledTimes(1);
    expect(timerService.getState()).toMatchObject({
      isRunning: true,
      isPaused: false,
      currentTime: 0
    });

    vi.advanceTimersByTime(1000);

    expect(updateListener).toHaveBeenCalledTimes(2);
    expect(timerService.getState().currentTime).toBe(1);
  });

  test('pauses, resumes, stops and resets correctly', async () => {
    timerService.setTechnique(technique);
    await timerService.start();

    timerService.pause();
    expect(timerService.getState()).toMatchObject({
      isRunning: true,
      isPaused: true
    });

    timerService.resume();
    expect(timerService.getState()).toMatchObject({
      isRunning: true,
      isPaused: false
    });

    timerService.stop();
    expect(timerService.getState()).toMatchObject({
      isRunning: false,
      isPaused: false
    });

    timerService.reset();
    expect(timerService.getState()).toMatchObject({
      currentTime: 0,
      isRunning: false,
      isPaused: false
    });
  });

  test('allows listeners to unsubscribe', async () => {
    const updateListener = vi.fn();

    timerService.setTechnique(technique);
    const unsubscribe = timerService.addListener('update', updateListener);
    unsubscribe();

    await timerService.start();
    vi.advanceTimersByTime(1000);

    expect(updateListener).not.toHaveBeenCalled();
  });

  test('emits cycleComplete after a full cycle', async () => {
    const cycleCompleteListener = vi.fn();

    timerService.setTechnique(technique);
    timerService.addListener('cycleComplete', cycleCompleteListener);
    await timerService.start();

    vi.advanceTimersByTime(12000);

    expect(cycleCompleteListener).toHaveBeenCalled();
  });

  test('rejects start when no technique is configured', async () => {
    await expect(timerService.start()).rejects.toThrow(/without technique/i);
  });
});
