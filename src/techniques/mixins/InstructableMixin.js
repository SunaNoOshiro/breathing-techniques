/**
 * Instructable Mixin
 * Provides instruction functionality for techniques that need detailed guidance
 * Implements IInstructable interface
 */

import { IInstructable } from '../interfaces/ITechnique.js';

export class InstructableMixin extends IInstructable {
  constructor() {
    super();
  }

  /**
   * Get technique-specific instructions
   * @returns {string[]} - Array of instruction strings
   */
  getInstructions() {
    return [
      'Find a comfortable seated or lying position',
      'Close your eyes or focus on a fixed point',
      'Begin with the breathing pattern',
      'Focus on the rhythm and flow of your breath',
      'If your mind wanders, gently return to your breath',
      'Practice for the recommended duration'
    ];
  }

  /**
   * Get technique tips
   * @returns {string[]} - Array of tip strings
   */
  getTips() {
    return [
      'Start slowly and gradually increase duration',
      'Listen to your body and adjust as needed',
      'Practice regularly for best results',
      'Use this technique when feeling stressed or anxious',
      'Combine with meditation for enhanced benefits'
    ];
  }

  /**
   * Get phase-specific instructions
   * @param {string} phaseKey - Phase key
   * @returns {string} - Phase instruction
   */
  getPhaseInstruction(phaseKey) {
    const instructions = {
      inhale: 'Breathe in slowly and deeply through your nose',
      hold: 'Hold your breath gently, don\'t force it',
      exhale: 'Breathe out slowly and completely through your mouth',
      pause: 'Rest briefly before the next cycle'
    };
    
    return instructions[phaseKey] || 'Continue with the breathing pattern';
  }
}
