import { z } from 'zod';

// Character row schema
export const CharacterRowSchema = z.object({
  character: z.string().optional(),
  castName: z.string().optional(),
  callTime: z.string().optional(),
  reportTime: z.string().optional(),
});

// Main daily production report schema
export const DailyProductionReportSchema = z.object({
  // Basic Information
  shootLocation: z.string().optional(),
  shootDate: z.string().optional(),
  dayNumber: z.string().optional(),
  sceneNumber: z.string().optional(),
  
  // Scene Status
  completed: z.enum(['Yes', 'No']).optional(),
  partCompleted: z.enum(['Yes', 'No']).optional(),
  toPickUp: z.enum(['Yes', 'No']).optional(),
  
  // Schedule Times
  callShootTime: z.string().optional(),
  breakfastOnLocation: z.string().optional(),
  firstShot: z.string().optional(),
  lunchBreak: z.string().optional(),
  firstShotPostLunch: z.string().optional(),
  eveningSnacks: z.string().optional(),
  wrap: z.string().optional(),
  
  // Production Details
  numberOfSetups: z.string().optional(),
  totalHours: z.string().optional(),
  extraAddEquipment: z.string().optional(),
  juniorsRequirement: z.string().optional(),
  actualCount: z.string().optional(),
  wrapTime: z.string().optional(),
  
  // Notes and Approval
  notes: z.string().optional(),
  approvedBy: z.string().optional(),
  firstAD: z.string().optional(),
  productionHOD: z.string().optional(),
  
  // Characters
  characters: z.array(CharacterRowSchema),
});

export type DailyProductionReportData = z.infer<typeof DailyProductionReportSchema>;
export type CharacterRow = z.infer<typeof CharacterRowSchema>;

export const createEmptyDailyProductionReport = (): DailyProductionReportData => ({
  shootLocation: '',
  shootDate: new Date().toLocaleDateString('en-GB'), // DD-MM-YYYY format
  dayNumber: new Date().getDate().toString(),
  sceneNumber: '08',
  completed: 'Yes',
  partCompleted: 'Yes',
  toPickUp: 'Yes',
  callShootTime: '',
  breakfastOnLocation: '',
  firstShot: '',
  lunchBreak: '',
  firstShotPostLunch: '',
  eveningSnacks: '',
  wrap: '',
  numberOfSetups: '',
  totalHours: '',
  extraAddEquipment: '',
  juniorsRequirement: '',
  actualCount: '',
  wrapTime: '',
  notes: '',
  approvedBy: '',
  firstAD: '',
  productionHOD: '',
  characters: [{ character: '', castName: '', callTime: '', reportTime: '' }],
});
