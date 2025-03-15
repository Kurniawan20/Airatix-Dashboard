/**
 * Load Initial Data Utility
 * This file contains functions to load initial data for the application
 */

import fs from 'fs';
import path from 'path';
import { loadParticipantsFromCSV } from '@/services/participantService';

/**
 * Load initial participant data from CSV file
 * @returns Promise that resolves when data is loaded
 */
export const loadInitialParticipantData = async (): Promise<void> => {
  try {
    // Path to the CSV file
    const csvPath = path.join(process.cwd(), 'REKOR-DRAG_RACE_Lintas_Alumni_STM_Cokrominoto_Kotamobagu.csv');
    
    // Check if file exists
    if (fs.existsSync(csvPath)) {
      // Read the file
      const csvContent = fs.readFileSync(csvPath, 'utf8');
      
      // Load participants from CSV
      loadParticipantsFromCSV(csvContent);
      
      console.log('Initial participant data loaded successfully');
    } else {
      console.warn('CSV file not found:', csvPath);
    }
  } catch (error) {
    console.error('Error loading initial participant data:', error);
  }
};
