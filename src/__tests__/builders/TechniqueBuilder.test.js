/**
 * TechniqueBuilder Tests
 * Tests for the TechniqueBuilder class
 */

import { TechniqueBuilder } from '../../builders/TechniqueBuilder.js';
import { TestUtils, TestAssertions } from '../TestUtils.js';

describe('TechniqueBuilder', () => {
  let builder;

  beforeEach(() => {
    builder = new TechniqueBuilder();
  });

  describe('basic technique creation', () => {
    test('should build a basic technique', () => {
      const technique = builder
        .withBasicInfo('test-technique', 'Test Technique', 'A test technique', 'Reduces stress')
        .withPattern(
          [
            { key: 'inhale', name: 'Inhale' },
            { key: 'exhale', name: 'Exhale' }
          ],
          [4, 4],
          '4-4'
        )
        .build();

      TestAssertions.assertValidTechnique(technique);
      expect(technique.getId()).toBe('test-technique');
      expect(technique.getName()).toBe('Test Technique');
      expect(technique.getPattern()).toBe('4-4');
    });

    test('should validate required fields', () => {
      expect(() => {
        builder.build();
      }).toThrow('Required field');
    });

    test('should validate phases and durations match', () => {
      expect(() => {
        builder
          .withBasicInfo('test', 'Test', 'Test', 'Test')
          .withPattern(
            [{ key: 'inhale', name: 'Inhale' }],
            [4, 4], // Mismatched lengths
            '4-4'
          )
          .build();
      }).toThrow('Phases and durations must have the same length');
    });
  });

  describe('mixin integration', () => {
    test('should add visualization capabilities', () => {
      const technique = builder
        .withBasicInfo('test', 'Test', 'Test', 'Test')
        .withPattern(
          [{ key: 'inhale', name: 'Inhale' }],
          [4],
          '4'
        )
        .withVisualization()
        .build();

      expect(technique.getVisualizationPoints).toBeDefined();
      expect(technique.getLungScaling).toBeDefined();
      expect(technique.getDiaphragmOffset).toBeDefined();
    });

    test('should add color capabilities', () => {
      const technique = builder
        .withBasicInfo('test', 'Test', 'Test', 'Test')
        .withPattern(
          [{ key: 'inhale', name: 'Inhale' }],
          [4],
          '4'
        )
        .withColors()
        .build();

      expect(technique.getColorScheme).toBeDefined();
      expect(technique.getPhaseColors).toBeDefined();
    });

    test('should add instruction capabilities', () => {
      const technique = builder
        .withBasicInfo('test', 'Test', 'Test', 'Test')
        .withPattern(
          [{ key: 'inhale', name: 'Inhale' }],
          [4],
          '4'
        )
        .withInstructions()
        .build();

      expect(technique.getInstructions).toBeDefined();
      expect(technique.getTips).toBeDefined();
    });

    test('should add audio capabilities', () => {
      const technique = builder
        .withBasicInfo('test', 'Test', 'Test', 'Test')
        .withPattern(
          [{ key: 'inhale', name: 'Inhale' }],
          [4],
          '4'
        )
        .withAudio()
        .build();

      expect(technique.getAudioConfig).toBeDefined();
      expect(technique.getPhaseAudio).toBeDefined();
    });

    test('should combine multiple mixins', () => {
      const technique = builder
        .withBasicInfo('test', 'Test', 'Test', 'Test')
        .withPattern(
          [{ key: 'inhale', name: 'Inhale' }],
          [4],
          '4'
        )
        .withVisualization()
        .withColors()
        .withInstructions()
        .withAudio()
        .build();

      expect(technique.getVisualizationPoints).toBeDefined();
      expect(technique.getColorScheme).toBeDefined();
      expect(technique.getInstructions).toBeDefined();
      expect(technique.getAudioConfig).toBeDefined();
    });
  });

  describe('custom methods', () => {
    test('should add custom methods', () => {
      const customMethod = jest.fn(() => 'custom result');
      
      const technique = builder
        .withBasicInfo('test', 'Test', 'Test', 'Test')
        .withPattern(
          [{ key: 'inhale', name: 'Inhale' }],
          [4],
          '4'
        )
        .withCustomMethod('customMethod', customMethod)
        .build();

      expect(technique.customMethod).toBeDefined();
      expect(technique.customMethod()).toBe('custom result');
    });
  });

  describe('builder pattern', () => {
    test('should support fluent API', () => {
      const technique = builder
        .withBasicInfo('test', 'Test', 'Test', 'Test')
        .withPattern(
          [{ key: 'inhale', name: 'Inhale' }],
          [4],
          '4'
        )
        .withVisualization()
        .withColors()
        .build();

      expect(technique).toBeDefined();
    });

    test('should reset builder state', () => {
      builder
        .withBasicInfo('test', 'Test', 'Test', 'Test')
        .withPattern(
          [{ key: 'inhale', name: 'Inhale' }],
          [4],
          '4'
        );

      builder.reset();

      expect(() => {
        builder.build();
      }).toThrow('Required field');
    });
  });

  describe('error handling', () => {
    test('should handle invalid mixin', () => {
      expect(() => {
        builder
          .withBasicInfo('test', 'Test', 'Test', 'Test')
          .withPattern(
            [{ key: 'inhale', name: 'Inhale' }],
            [4],
            '4'
          )
          .withCustomMethod('invalidMethod', 'not a function')
          .build();
      }).not.toThrow();
    });
  });
});
