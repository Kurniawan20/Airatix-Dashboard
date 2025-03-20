// Class options for participant registration
export type ClassOption = {
  value: string;
  label: string;
  category?: string;
}

// Categories
export const categoryClasses = [
  { value: 'KELAS BRACKET 201 M', label: 'KELAS BRACKET 201 M' },
  { value: 'KELAS SUPPORTING 201 M', label: 'KELAS SUPPORTING 201 M' },
  { value: 'KELAS BRACKET 402 M', label: 'KELAS BRACKET 402 M' },
  { value: 'KELAS SUPPORTING 402 M', label: 'KELAS SUPPORTING 402 M' },
  { value: 'KELAS EXIBITION NEW', label: 'KELAS EXIBITION NEW' },
  { value: 'FREE FOR ALL', label: 'FREE FOR ALL' }
];

// Class options with categories
export const classOptions: ClassOption[] = [
  // KELAS BRACKET 201 M
  { value: '1. ET BRACKET 8 DETIK (POINT)', label: 'ET BRACKET 8 DETIK (POINT)', category: 'KELAS BRACKET 201 M' },
  { value: '2. ET BRACKET 8,5 DETIK', label: 'ET BRACKET 8,5 DETIK', category: 'KELAS BRACKET 201 M' },
  { value: '3. ET BRACKET 9 DETIK (POINT)', label: 'ET BRACKET 9 DETIK (POINT)', category: 'KELAS BRACKET 201 M' },
  { value: '4. ET BRACKET 9,5 DETIK', label: 'ET BRACKET 9,5 DETIK', category: 'KELAS BRACKET 201 M' },
  { value: '5. ET BRACKET 10 DETIK (POINT)', label: 'ET BRACKET 10 DETIK (POINT)', category: 'KELAS BRACKET 201 M' },
  { value: '6. ET BRACKET 10,5 DETIK', label: 'ET BRACKET 10,5 DETIK', category: 'KELAS BRACKET 201 M' },
  { value: '7. ET BRACKET 11 DETIK (POINT)', label: 'ET BRACKET 11 DETIK (POINT)', category: 'KELAS BRACKET 201 M' },
  { value: '8. ET BRACKET 11,5 DETIK', label: 'ET BRACKET 11,5 DETIK', category: 'KELAS BRACKET 201 M' },
  { value: '9. ET BRACKET 12 DETIK', label: 'ET BRACKET 12 DETIK', category: 'KELAS BRACKET 201 M' },
  
  // KELAS SUPPORTING 201 M
  { value: '10. ET OMR BRIO', label: 'ET OMR BRIO', category: 'KELAS SUPPORTING 201 M' },
  { value: '11. ET ALL CARS MATIC 1800 CC NON TURBO', label: 'ET ALL CARS MATIC 1800 CC NON TURBO', category: 'KELAS SUPPORTING 201 M' },
  { value: '12. ET PRO STREET DIESEL 2700 CC', label: 'ET PRO STREET DIESEL 2700 CC', category: 'KELAS SUPPORTING 201 M' },
  { value: '13. ET PRO STREET DIESEL 2800 CC (REMAP ONLY)', label: 'ET PRO STREET DIESEL 2800 CC (REMAP ONLY)', category: 'KELAS SUPPORTING 201 M' },
  { value: '14. ET PRO MASTER DIESEL NON ENGINE SWAP', label: 'ET PRO MASTER DIESEL NON ENGINE SWAP', category: 'KELAS SUPPORTING 201 M' },
  { value: '15. ET SUPER DIESEL', label: 'ET SUPER DIESEL', category: 'KELAS SUPPORTING 201 M' },
  { value: '16. ET MONSTER DIESEL 3500 CC', label: 'ET MONSTER DIESEL 3500 CC', category: 'KELAS SUPPORTING 201 M' },
  { value: '17. ET FREE FOR ALL (FFA)', label: 'ET FREE FOR ALL (FFA)', category: 'KELAS SUPPORTING 201 M' },
  
  // KELAS BRACKET 402 M
  { value: '18. ET BRACKET 12 DETIK', label: 'ET BRACKET 12 DETIK', category: 'KELAS BRACKET 402 M' },
  { value: '19. ET BRACKET 13 DETIK (POINT)', label: 'ET BRACKET 13 DETIK (POINT)', category: 'KELAS BRACKET 402 M' },
  { value: '20. ET BRACKET 13,5 DETIK', label: 'ET BRACKET 13,5 DETIK', category: 'KELAS BRACKET 402 M' },
  { value: '21. ET BRACKET 14 DETIK (POINT)', label: 'ET BRACKET 14 DETIK (POINT)', category: 'KELAS BRACKET 402 M' },
  { value: '22. ET BRACKET 14,5 DETIK', label: 'ET BRACKET 14,5 DETIK', category: 'KELAS BRACKET 402 M' },
  { value: '23. ET BRACKET 15 DETIK (POINT)', label: 'ET BRACKET 15 DETIK (POINT)', category: 'KELAS BRACKET 402 M' },
  { value: '24. ET BRACKET 15,5 DETIK', label: 'ET BRACKET 15,5 DETIK', category: 'KELAS BRACKET 402 M' },
  { value: '25. ET BRACKET 16 DETIK (POINT)', label: 'ET BRACKET 16 DETIK (POINT)', category: 'KELAS BRACKET 402 M' },
  { value: '26. ET BRACKET 16,5 DETIK', label: 'ET BRACKET 16,5 DETIK', category: 'KELAS BRACKET 402 M' },
  { value: '27. ET BRACKET 17 DETIK (POINT)', label: 'ET BRACKET 17 DETIK (POINT)', category: 'KELAS BRACKET 402 M' },
  { value: '28. ET BRACKET 17,5 DETIK', label: 'ET BRACKET 17,5 DETIK', category: 'KELAS BRACKET 402 M' },
  { value: '29. ET BRACKET 18 DETIK', label: 'ET BRACKET 18 DETIK', category: 'KELAS BRACKET 402 M' },
  
  // KELAS SUPPORTING 402 M
  { value: '30. ET OMR BRIO', label: 'ET OMR BRIO', category: 'KELAS SUPPORTING 402 M' },
  { value: '31. ET ALL CARS MATIC 1800 CC NON TURBO', label: 'ET ALL CARS MATIC 1800 CC NON TURBO', category: 'KELAS SUPPORTING 402 M' },
  { value: '32. ET PRO STREET DIESEL 2700 CC', label: 'ET PRO STREET DIESEL 2700 CC', category: 'KELAS SUPPORTING 402 M' },
  { value: '33. ET PRO STREET DIESEL 2800 CC (REMAP ONLY)', label: 'ET PRO STREET DIESEL 2800 CC (REMAP ONLY)', category: 'KELAS SUPPORTING 402 M' },
  { value: '34. ET PRO MASTER DIESEL NON ENGINE SWAP', label: 'ET PRO MASTER DIESEL NON ENGINE SWAP', category: 'KELAS SUPPORTING 402 M' },
  { value: '35. ET SUPER DIESEL', label: 'ET SUPER DIESEL', category: 'KELAS SUPPORTING 402 M' },
  { value: '36. ET MONSTER DIESEL 3500 CC', label: 'ET MONSTER DIESEL 3500 CC', category: 'KELAS SUPPORTING 402 M' },
  { value: '37. ET FREE FOR ALL (FFA)', label: 'ET FREE FOR ALL (FFA)', category: 'KELAS SUPPORTING 402 M' },
  
  // KELAS EXIBITION NEW
  { value: '38. BEST FIGHTER', label: 'BEST FIGHTER', category: 'KELAS EXIBITION NEW' },
  { value: '39. BRACKET 9 BEST FIGHT', label: 'BRACKET 9 BEST FIGHT', category: 'KELAS EXIBITION NEW' },
  { value: '40. BRACKET 10 BEST FIGHT', label: 'BRACKET 10 BEST FIGHT', category: 'KELAS EXIBITION NEW' },
  
  // FREE FOR ALL
  { value: '41. FFA 201', label: 'FFA 201', category: 'FREE FOR ALL' },
  { value: '42. FFA 402', label: 'FFA 402', category: 'FREE FOR ALL' }
];
