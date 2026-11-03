/** Missing census measurements must not become zero or sample figures. */
export const censusNumber = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

export const hasCensusValues = (record: any, fields: string[]): boolean =>
  fields.length > 0 && fields.every((field) => censusNumber(record?.[field]) !== null);

export const censusAgeGroups = (population: any) => [
  { label: '0-14', value: censusNumber(population?.age_0_14), color: '#3b82f6' },
  { label: '15-59', value: censusNumber(population?.age_15_59), color: '#10b981' },
  { label: '60-64', value: censusNumber(population?.age_60_64), color: '#8b5cf6' },
  { label: '65+', value: censusNumber(population?.age_65_above), color: '#ec4899' },
];
