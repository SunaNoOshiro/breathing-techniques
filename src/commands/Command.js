/**
 * Command Pattern Implementation
 * Provides command interface and invoker following Command Pattern
 */

import { AppError, ERROR_CODES } from '../errors/AppError.js';
import Logger from '../utils/Logger.js';

/**
 * Base Command interface
 */
export class Command {
  /**
   * Execute the command
   * @param {object} context - Execution context
   * @returns {Promise<any>} - Command result
   */
  async execute(context) {
    throw new Error('execute method must be implemented by command');
  }

  /**
   * Undo the command
   * @param {object} context - Execution context
   * @returns {Promise<any>} - Undo result
   */
  async undo(context) {
    throw new Error('undo method must be implemented by command');
  }

  /**
   * Get command name
   * @returns {string} - Command name
   */
  getName() {
    throw new Error('getName method must be implemented by command');
  }

  /**
   * Get command description
   * @returns {string} - Command description
   */
  getDescription() {
    return '';
  }

  /**
   * Check if command can be undone
   * @returns {boolean} - True if undoable
   */
  isUndoable() {
    return false;
  }

  /**
   * Validate command parameters
   * @param {object} params - Command parameters
   * @returns {boolean} - True if valid
   */
  validate(params) {
    return true;
  }
}

/**
 * Start Breathing Command
 */
export class StartBreathingCommand extends Command {
  constructor(techniqueId, technique) {
    super();
    this.techniqueId = techniqueId;
    this.technique = technique;
    this.executedAt = null;
    this.previousState = null;
  }

  /**
   * Execute start breathing command
   * @param {object} context - Execution context
   * @returns {Promise<any>} - Command result
   */
  async execute(context) {
    try {
      Logger.debug("command", 'StartBreathingCommand: Executing with technique:', this.technique?.getId());
      
      // Validate technique
      if (!this.technique) {
        throw new AppError(
          'Cannot start session without technique',
          ERROR_CODES.COMMAND_EXECUTION_FAILED,
          { techniqueId: this.techniqueId }
        );
      }
      
      // Store previous state for undo
      this.previousState = {
        isRunning: context.sessionState?.state.isRunning || false,
        isPaused: context.sessionState?.state.isPaused || false,
        currentTechniqueId: context.sessionState?.state.currentTechniqueId || null
      };

      // Ensure technique is set in timer service before starting
      if (context.timerService) {
        Logger.debug("command", 'StartBreathingCommand: Setting technique in timer service');
        context.timerService.setTechnique(this.technique);
      }

      // Get initial phase
      const initialPhase = this.technique.getCurrentPhase(0);
      Logger.debug("command", 'StartBreathingCommand: Initial phase:', initialPhase);

      // Start session with initial phase
      if (context.sessionState) {
        // First update the session state with the technique and initial phase
        context.sessionState.setState({
          currentTechniqueId: this.techniqueId,
          technique: this.technique,
          currentPhase: initialPhase,
          phaseIndex: 0,
          timeInPhase: 0,
          timeLeft: initialPhase?.duration || 0
        });
        
        // Then start the session
        context.sessionState.startSession(this.techniqueId, this.technique);
      }

      // Start timer
      if (context.timerService) {
        Logger.debug("command", 'StartBreathingCommand: Starting timer');
        await context.timerService.start();
      }

      this.executedAt = Date.now();
      
      Logger.debug("command", 'StartBreathingCommand: Session started successfully');

      return {
        success: true,
        techniqueId: this.techniqueId,
        executedAt: this.executedAt
      };
    } catch (error) {
      Logger.error("command", 'StartBreathingCommand: Failed to execute:', error);
      throw new AppError(
        'Failed to start breathing session',
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { command: this.getName(), originalError: error.message }
      );
    }
  }

  /**
   * Undo start breathing command
   * @param {object} context - Execution context
   * @returns {Promise<any>} - Undo result
   */
  async undo(context) {
    if (!this.previousState) {
      throw new AppError(
        'Cannot undo command without previous state',
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { command: this.getName() }
      );
    }

    try {
      // Stop session
      if (context.sessionState) {
        context.sessionState.stopSession();
      }

      // Stop timer
      if (context.timerService) {
        context.timerService.stop();
      }

      return {
        success: true,
        restoredState: this.previousState
      };
    } catch (error) {
      throw new AppError(
        'Failed to undo start breathing command',
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { command: this.getName(), originalError: error.message }
      );
    }
  }

  /**
   * Get command name
   * @returns {string} - Command name
   */
  getName() {
    return 'StartBreathing';
  }

  /**
   * Get command description
   * @returns {string} - Command description
   */
  getDescription() {
    return `Start breathing session with technique: ${this.techniqueId}`;
  }

  /**
   * Check if command can be undone
   * @returns {boolean} - True if undoable
   */
  isUndoable() {
    return true;
  }

  /**
   * Validate command parameters
   * @param {object} params - Command parameters
   * @returns {boolean} - True if valid
   */
  validate(params) {
    return this.techniqueId && this.technique;
  }
}

/**
 * Pause Breathing Command
 */
export class PauseBreathingCommand extends Command {
  constructor(action = 'pause') {
    super();
    this.action = action; // 'pause' or 'resume'
    this.executedAt = null;
    this.previousState = null;
  }

  /**
   * Execute pause/resume breathing command
   * @param {object} context - Execution context
   * @returns {Promise<any>} - Command result
   */
  async execute(context) {
    try {
      // Store previous state for undo
      this.previousState = {
        isRunning: context.sessionState?.state.isRunning || false,
        isPaused: context.sessionState?.state.isPaused || false
      };

      if (this.action === 'pause') {
        // Pause session
        if (context.sessionState) {
          context.sessionState.pauseSession();
        }

        // Pause timer
        if (context.timerService) {
          context.timerService.pause();
        }
      } else {
        // Resume session
        if (context.sessionState) {
          context.sessionState.resumeSession();
        }

        // Resume timer
        if (context.timerService) {
          context.timerService.resume();
        }
      }

      this.executedAt = Date.now();

      return {
        success: true,
        action: this.action,
        executedAt: this.executedAt
      };
    } catch (error) {
      throw new AppError(
        `Failed to ${this.action} breathing session`,
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { command: this.getName(), originalError: error.message }
      );
    }
  }

  /**
   * Undo pause/resume breathing command
   * @param {object} context - Execution context
   * @returns {Promise<any>} - Undo result
   */
  async undo(context) {
    if (!this.previousState) {
      throw new AppError(
        'Cannot undo command without previous state',
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { command: this.getName() }
      );
    }

    try {
      // Restore previous state
      if (context.sessionState) {
        if (this.previousState.isRunning && !this.previousState.isPaused) {
          context.sessionState.resumeSession();
        } else if (!this.previousState.isRunning && this.previousState.isPaused) {
          context.sessionState.pauseSession();
        }
      }

      // Restore timer state
      if (context.timerService) {
        if (this.previousState.isRunning && !this.previousState.isPaused) {
          context.timerService.resume();
        } else if (!this.previousState.isRunning && this.previousState.isPaused) {
          context.timerService.pause();
        }
      }

      return {
        success: true,
        restoredState: this.previousState
      };
    } catch (error) {
      throw new AppError(
        `Failed to undo ${this.action} breathing command`,
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { command: this.getName(), originalError: error.message }
      );
    }
  }

  /**
   * Get command name
   * @returns {string} - Command name
   */
  getName() {
    return this.action === 'pause' ? 'PauseBreathing' : 'ResumeBreathing';
  }

  /**
   * Get command description
   * @returns {string} - Command description
   */
  getDescription() {
    return `${this.action.charAt(0).toUpperCase() + this.action.slice(1)} breathing session`;
  }

  /**
   * Check if command can be undone
   * @returns {boolean} - True if undoable
   */
  isUndoable() {
    return true;
  }
}

/**
 * Change Technique Command
 */
export class ChangeTechniqueCommand extends Command {
  constructor(newTechniqueId, newTechnique) {
    super();
    this.newTechniqueId = newTechniqueId;
    this.newTechnique = newTechnique;
    this.executedAt = null;
    this.previousState = null;
  }

  /**
   * Execute change technique command
   * @param {object} context - Execution context
   * @returns {Promise<any>} - Command result
   */
  async execute(context) {
    try {
      // Store previous state for undo
      this.previousState = {
        currentTechniqueId: context.sessionState?.state.currentTechniqueId || null,
        technique: context.sessionState?.state.technique || null,
        elapsedSeconds: context.sessionState?.state.elapsedSeconds || 0,
        cyclesCompleted: context.sessionState?.state.cyclesCompleted || 0
      };

      // Change technique
      if (context.sessionState) {
        context.sessionState.changeTechnique(this.newTechniqueId, this.newTechnique);
      }

      // Reset timer if running
      if (context.timerService && context.timerService.isCurrentlyRunning()) {
        context.timerService.stop();
        context.timerService.setTechnique(this.newTechnique);
        context.timerService.start();
      } else if (context.timerService) {
        context.timerService.setTechnique(this.newTechnique);
      }

      this.executedAt = Date.now();

      return {
        success: true,
        newTechniqueId: this.newTechniqueId,
        executedAt: this.executedAt
      };
    } catch (error) {
      throw new AppError(
        'Failed to change technique',
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { command: this.getName(), originalError: error.message }
      );
    }
  }

  /**
   * Undo change technique command
   * @param {object} context - Execution context
   * @returns {Promise<any>} - Undo result
   */
  async undo(context) {
    if (!this.previousState) {
      throw new AppError(
        'Cannot undo command without previous state',
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { command: this.getName() }
      );
    }

    try {
      // Restore previous technique
      if (context.sessionState) {
        context.sessionState.changeTechnique(
          this.previousState.currentTechniqueId,
          this.previousState.technique
        );
      }

      // Restore timer technique
      if (context.timerService) {
        context.timerService.setTechnique(this.previousState.technique);
      }

      return {
        success: true,
        restoredTechniqueId: this.previousState.currentTechniqueId
      };
    } catch (error) {
      throw new AppError(
        'Failed to undo change technique command',
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { command: this.getName(), originalError: error.message }
      );
    }
  }

  /**
   * Get command name
   * @returns {string} - Command name
   */
  getName() {
    return 'ChangeTechnique';
  }

  /**
   * Get command description
   * @returns {string} - Command description
   */
  getDescription() {
    return `Change technique to: ${this.newTechniqueId}`;
  }

  /**
   * Check if command can be undone
   * @returns {boolean} - True if undoable
   */
  isUndoable() {
    return true;
  }

  /**
   * Validate command parameters
   * @param {object} params - Command parameters
   * @returns {boolean} - True if valid
   */
  validate(params) {
    return this.newTechniqueId && this.newTechnique;
  }
}

/**
 * Change Theme Command
 */
export class ChangeThemeCommand extends Command {
  constructor(newTheme) {
    super();
    this.newTheme = newTheme;
    this.executedAt = null;
    this.previousTheme = null;
  }

  /**
   * Execute change theme command
   * @param {object} context - Execution context
   * @returns {Promise<any>} - Command result
   */
  async execute(context) {
    try {
      // Store previous theme for undo
      this.previousTheme = context.preferencesState?.state.currentTheme || 'dark';

      // Change theme
      if (context.preferencesState) {
        context.preferencesState.setCurrentTheme(this.newTheme);
      }

      // Apply theme using theme service
      if (context.themeService) {
        await context.themeService.setCurrentTheme(this.newTheme);
      }

      this.executedAt = Date.now();

      return {
        success: true,
        newTheme: this.newTheme,
        executedAt: this.executedAt
      };
    } catch (error) {
      throw new AppError(
        'Failed to change theme',
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { command: this.getName(), originalError: error.message }
      );
    }
  }

  /**
   * Undo change theme command
   * @param {object} context - Execution context
   * @returns {Promise<any>} - Undo result
   */
  async undo(context) {
    if (!this.previousTheme) {
      throw new AppError(
        'Cannot undo command without previous theme',
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { command: this.getName() }
      );
    }

    try {
      // Restore previous theme
      if (context.preferencesState) {
        context.preferencesState.setCurrentTheme(this.previousTheme);
      }

      // Apply previous theme
      if (context.themeService) {
        await context.themeService.setCurrentTheme(this.previousTheme);
      }

      return {
        success: true,
        restoredTheme: this.previousTheme
      };
    } catch (error) {
      throw new AppError(
        'Failed to undo change theme command',
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { command: this.getName(), originalError: error.message }
      );
    }
  }

  /**
   * Get command name
   * @returns {string} - Command name
   */
  getName() {
    return 'ChangeTheme';
  }

  /**
   * Get command description
   * @returns {string} - Command description
   */
  getDescription() {
    return `Change theme to: ${this.newTheme}`;
  }

  /**
   * Check if command can be undone
   * @returns {boolean} - True if undoable
   */
  isUndoable() {
    return true;
  }

  /**
   * Validate command parameters
   * @param {object} params - Command parameters
   * @returns {boolean} - True if valid
   */
  validate(params) {
    return this.newTheme && typeof this.newTheme === 'string';
  }
}

/**
 * Command Invoker
 * Manages command execution, history, and undo/redo functionality
 */
export class CommandInvoker {
  constructor() {
    this.history = [];
    this.currentIndex = -1;
    this.maxHistorySize = 50;
    this.isExecuting = false;
  }

  /**
   * Execute a command
   * @param {Command} command - Command to execute
   * @param {object} context - Execution context
   * @returns {Promise<any>} - Command result
   */
  async executeCommand(command, context) {
    if (this.isExecuting) {
      throw new AppError(
        'Command execution already in progress',
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { command: command.getName() }
      );
    }

    if (!(command instanceof Command)) {
      throw new AppError(
        'Command must extend Command class',
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { command }
      );
    }

    this.isExecuting = true;

    try {
      // Validate command
      if (!command.validate()) {
        throw new AppError(
          'Command validation failed',
          ERROR_CODES.COMMAND_EXECUTION_FAILED,
          { command: command.getName() }
        );
      }

      // Execute command
      const result = await command.execute(context);

      // Add to history
      this.addToHistory(command);

      return result;
    } catch (error) {
      throw error;
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * Undo last command
   * @param {object} context - Execution context
   * @returns {Promise<any>} - Undo result
   */
  async undo(context) {
    if (this.currentIndex < 0) {
      throw new AppError(
        'No commands to undo',
        ERROR_CODES.COMMAND_EXECUTION_FAILED
      );
    }

    const command = this.history[this.currentIndex];
    
    if (!command.isUndoable()) {
      throw new AppError(
        `Command '${command.getName()}' is not undoable`,
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { command: command.getName() }
      );
    }

    try {
      const result = await command.undo(context);
      this.currentIndex--;
      return result;
    } catch (error) {
      throw new AppError(
        'Failed to undo command',
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { command: command.getName(), originalError: error.message }
      );
    }
  }

  /**
   * Redo last undone command
   * @param {object} context - Execution context
   * @returns {Promise<any>} - Redo result
   */
  async redo(context) {
    if (this.currentIndex >= this.history.length - 1) {
      throw new AppError(
        'No commands to redo',
        ERROR_CODES.COMMAND_EXECUTION_FAILED
      );
    }

    this.currentIndex++;
    const command = this.history[this.currentIndex];

    try {
      const result = await command.execute(context);
      return result;
    } catch (error) {
      // Rollback index on failure
      this.currentIndex--;
      throw new AppError(
        'Failed to redo command',
        ERROR_CODES.COMMAND_EXECUTION_FAILED,
        { command: command.getName(), originalError: error.message }
      );
    }
  }

  /**
   * Add command to history
   * @param {Command} command - Command to add
   */
  addToHistory(command) {
    // Remove any commands after current index (when new command is executed after undo)
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    // Add new command
    this.history.push(command);
    this.currentIndex++;

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  /**
   * Clear command history
   */
  clearHistory() {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Get command history
   * @returns {Array} - Command history
   */
  getHistory() {
    return this.history.map((command, index) => ({
      index,
      name: command.getName(),
      description: command.getDescription(),
      executed: index <= this.currentIndex,
      undoable: command.isUndoable()
    }));
  }

  /**
   * Check if undo is available
   * @returns {boolean} - True if undo is available
   */
  canUndo() {
    return this.currentIndex >= 0 && 
           this.history[this.currentIndex]?.isUndoable();
  }

  /**
   * Check if redo is available
   * @returns {boolean} - True if redo is available
   */
  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get current command
   * @returns {Command|null} - Current command or null
   */
  getCurrentCommand() {
    return this.currentIndex >= 0 ? this.history[this.currentIndex] : null;
  }

  /**
   * Get command invoker capabilities
   * @returns {object} - Capabilities
   */
  getCapabilities() {
    return {
      historySize: this.history.length,
      currentIndex: this.currentIndex,
      maxHistorySize: this.maxHistorySize,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      isExecuting: this.isExecuting
    };
  }
}

// Create and export singleton instance
export const commandInvoker = new CommandInvoker();
