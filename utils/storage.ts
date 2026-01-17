import { PrintJob, ProjectState } from '../types';

const STORAGE_KEY = 'locket_history';
const MAX_HISTORY_ENTRIES = 10; // Keep only the last 10 projects to manage storage

/**
 * Save the current project state to history
 */
export const saveProjectState = (images: any[], selectedIndex: number): PrintJob => {
  const newJob: PrintJob = {
    id: Date.now().toString(),
    timestamp: Date.now(),
    imagesCount: images.length,
    projectState: {
      images,
      selectedIndex,
    },
  };

  try {
    const history = loadHistory();
    // Keep only the last MAX_HISTORY_ENTRIES to prevent quota exceeded errors
    const updatedHistory = [newJob, ...history].slice(0, MAX_HISTORY_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      // If storage is full, clear old entries more aggressively
      try {
        const history = loadHistory();
        const updatedHistory = [newJob, ...history].slice(0, Math.ceil(MAX_HISTORY_ENTRIES / 2));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
        console.warn('Storage quota exceeded. Cleared older history entries.');
      } catch (retryError) {
        console.error('Failed to save project state even after clearing history:', retryError);
      }
    } else {
      throw error;
    }
  }

  return newJob;
};

/**
 * Load all history records from localStorage
 */
export const loadHistory = (): PrintJob[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

/**
 * Restore a project state from history by ID
 */
export const restoreProjectState = (jobId: string): ProjectState | null => {
  const history = loadHistory();
  const job = history.find(j => j.id === jobId);
  return job?.projectState || null;
};

/**
 * Clear all history
 */
export const clearHistory = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Delete a specific history record
 */
export const deleteHistoryRecord = (jobId: string): void => {
  const history = loadHistory();
  const updated = history.filter(job => job.id !== jobId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};
