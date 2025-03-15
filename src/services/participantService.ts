// Import types
import { Participant } from '@/types/participant';
import { parseCSV, convertCSVToParticipants } from '@/utils/csvParser';

// Mock data store (in a real app, this would be replaced with API calls)
let participantsData: Participant[] = [];

/**
 * Load participants from a CSV file
 * @param csvContent The CSV content as a string
 * @returns Array of participants
 */
export const loadParticipantsFromCSV = (csvContent: string): Participant[] => {
  try {
    const parsedData = parseCSV(csvContent);
    participantsData = convertCSVToParticipants(parsedData);
    return participantsData;
  } catch (error) {
    console.error('Error loading participants from CSV:', error);
    return [];
  }
};

/**
 * Get all participants
 * @returns Promise that resolves to an array of participants
 */
export const getAllParticipants = async (): Promise<Participant[]> => {
  // In a real app, this would be an API call
  return Promise.resolve(participantsData);
};

/**
 * Get a participant by ID
 * @param id Participant ID
 * @returns Promise that resolves to a participant or undefined
 */
export const getParticipantById = async (id: string): Promise<Participant | undefined> => {
  // In a real app, this would be an API call
  return Promise.resolve(participantsData.find(p => p.id === id));
};

/**
 * Add a new participant
 * @param participant Participant data
 * @returns Promise that resolves to the added participant
 */
export const addParticipant = async (participant: Omit<Participant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Participant> => {
  // Generate a new ID
  const id = (participantsData.length + 1).toString();
  
  // Create a new participant with timestamps
  const newParticipant: Participant = {
    ...participant,
    id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Add to the data store
  participantsData.push(newParticipant);
  
  // In a real app, this would be an API call
  return Promise.resolve(newParticipant);
};

/**
 * Update a participant
 * @param id Participant ID
 * @param participant Updated participant data
 * @returns Promise that resolves to the updated participant
 */
export const updateParticipant = async (id: string, participant: Partial<Participant>): Promise<Participant | undefined> => {
  // Find the participant
  const index = participantsData.findIndex(p => p.id === id);
  if (index === -1) return undefined;
  
  // Update the participant
  participantsData[index] = {
    ...participantsData[index],
    ...participant,
    updatedAt: new Date().toISOString()
  };
  
  // In a real app, this would be an API call
  return Promise.resolve(participantsData[index]);
};

/**
 * Delete a participant
 * @param id Participant ID
 * @returns Promise that resolves to a boolean indicating success
 */
export const deleteParticipant = async (id: string): Promise<boolean> => {
  // Find the participant
  const index = participantsData.findIndex(p => p.id === id);
  if (index === -1) return false;
  
  // Remove the participant
  participantsData.splice(index, 1);
  
  // In a real app, this would be an API call
  return Promise.resolve(true);
};
