import { z } from 'zod';

export const TimeSchema = z.string().regex(/^\d{2}:\d{2}$/).optional();
export const AMPMSchema = z.enum(['AM', 'PM']).optional();
export const IntExtSchema = z.enum(['INT', 'EXT', '']).optional();
export const DayNightSchema = z.enum(['DAY', 'NIGHT', '']).optional();

export const SceneRowSchema = z.object({
  sceneNo: z.string().optional(),
  slNo: z.string().optional(),
  sceneDescription: z.string().optional(),
  characters: z.string().optional(),
  intExt: IntExtSchema,
  dayNight: DayNightSchema,
  location: z.string().optional(),
});

export const CastRowSchema = z.object({
  srNo: z.string().optional(),
  artist: z.string().optional(),
  character: z.string().optional(),
  onLocation: z.string().optional(),
  hairMakeup: z.string().optional(),
  onSet: z.string().optional(),
});

export const FeatureJuniorRowSchema = z.object({
  srNo: z.string().optional(),
  featureJuniorCount: z.string().optional(),
  onLocation: z.string().optional(),
  wardrobe: z.string().optional(),
  hairMakeup: z.string().optional(),
  onSet: z.string().optional(),
});

export const CallSheetSchema = z.object({
  // Header Information
  callSheet: z.string().optional(),
  productionHouseName: z.string().optional(),
  titleOfFilm: z.string().optional(),
  productionHouseAddress: z.string().optional(),
  shootDate: z.string().optional(),
  shootDay: z.string().optional(),
  crewCallTime: TimeSchema,
  crewCallAMPM: AMPMSchema,
  day: z.string().optional(),
  shootLocation: z.string().optional(),
  mapPin: z.string().optional(),
  
  // Schedule
  shootCallTime: TimeSchema,
  shootCallAMPM: AMPMSchema,
  shiftStartTime: TimeSchema,
  shiftStartAMPM: AMPMSchema,
  shiftEndTime: TimeSchema,
  shiftEndAMPM: AMPMSchema,
  lunchDinner: z.string().optional(),
  sunriseSunset: z.string().optional(),
  weather: z.string().optional(),
  breakfast: z.string().optional(),
  
  // Crew
  director: z.string().optional(),
  dop: z.string().optional(),
  producer: z.string().optional(),
  coDirector: z.string().optional(),
  directionDepartment: z.string().optional(),
  executiveProducer: z.string().optional(),
  lineProducer: z.string().optional(),
  productionAccountant: z.string().optional(),
  productionDesigner: z.string().optional(),
  productionTeam: z.string().optional(),
  artDirector: z.string().optional(),
  assistantArtDirector: z.string().optional(),
  artTeam: z.string().optional(),
  onSetEditor: z.string().optional(),
  gaffer: z.string().optional(),
  wardrobe: z.string().optional(),
  makeupHair: z.string().optional(),
  firstAC: z.string().optional(),
  focusPuller1: z.string().optional(),
  focusPuller2: z.string().optional(),
  actionDirector: z.string().optional(),
  
  // Tables
  scenes: z.array(SceneRowSchema),
  cast: z.array(CastRowSchema),
  featureJunior: z.array(FeatureJuniorRowSchema),
  advanceSchedule: z.array(SceneRowSchema),
  
  // Requirements
  propsTime: TimeSchema,
  propsAMPM: AMPMSchema,
  artDeptTime: TimeSchema,
  artDeptAMPM: AMPMSchema,
  wardrobeReqTime: TimeSchema,
  wardrobeReqAMPM: AMPMSchema,
  actionTeamTime: TimeSchema,
  actionTeamAMPM: AMPMSchema,
  armsTime: TimeSchema,
  armsAMPM: AMPMSchema,
  camerasTime: TimeSchema,
  camerasAMPM: AMPMSchema,
  lightsTime: TimeSchema,
  lightsAMPM: AMPMSchema,
  soundTime: TimeSchema,
  soundAMPM: AMPMSchema,
  specialReqTime: TimeSchema,
  specialReqAMPM: AMPMSchema,
  generatorsTime: TimeSchema,
  generatorsAMPM: AMPMSchema,
  generatorsReadyTime: TimeSchema,
  generatorsReadyAMPM: AMPMSchema,
  securitiesTime: TimeSchema,
  securitiesAMPM: AMPMSchema,
  paSystemTime: TimeSchema,
  paSystemAMPM: AMPMSchema,
  productionLocationTime: TimeSchema,
  productionLocationAMPM: AMPMSchema,
  vehiclesTime: TimeSchema,
  vehiclesAMPM: AMPMSchema,
  
  // Footer
  walkieChannels: z.string().optional(),
  vanityVansTime: TimeSchema,
  vanityVansAMPM: AMPMSchema,
  filmQuote: z.string().optional(),
});

export type CallSheetData = z.infer<typeof CallSheetSchema>;

export const createEmptyCallSheet = (): CallSheetData => ({
  callSheet: 'CALL SHEET',
  scenes: [{}],
  cast: [{}],
  featureJunior: [{}],
  advanceSchedule: [{}],
});
