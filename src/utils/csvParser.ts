/**
 * CSV Parser Utility
 * This file contains functions to parse CSV data
 */

/**
 * Parse CSV string into an array of objects
 * @param csvString The CSV string to parse
 * @returns An array of objects with keys from the header row
 */
export const parseCSV = (csvString: string): Record<string, string>[] => {
  // Split by lines
  const lines = csvString.split('\n');
  
  // Extract headers (first line)
  const headers = lines[0].split(',').map(header => header.trim());
  
  // Parse data rows
  const data = lines.slice(1).map(line => {
    // Skip empty lines
    if (!line.trim()) return null;
    
    const values = line.split(',');
    const obj: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      obj[header] = values[index]?.trim() || '';
    });
    
    return obj;
  }).filter(Boolean) as Record<string, string>[];
  
  return data;
};

/**
 * Convert CSV data to Participant objects
 * @param csvData Array of objects parsed from CSV
 * @returns Array of Participant objects
 */
export const convertCSVToParticipants = (csvData: Record<string, string>[]) => {
  return csvData.map((row, index) => ({
    id: (index + 1).toString(),
    startNumber: row.NOMOR_START || '',
    name: row.NAME || '',
    nik: row.NIK || '',
    city: row.KOTA || '',
    province: row.PROVINSI || '',
    team: row.TEAM || '',
    className: row.NAMA_CLASS || '',
    vehicleBrand: row.MERK_KENDARAAN || '',
    vehicleType: row.TYPE || '',
    vehicleColor: row.WARNA || '',
    chassisNumber: row['NO RANGKA'] || '',
    engineNumber: row['NO MESIN'] || '',
    pos: row.POS || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
};
