import { cleanMojibake } from './mojibake';

const searchFields = [
  'admin2NameEn', 'admin2NameSi', 'admin2NameTa', 'admin2Pcode',
  'dsEn', 'dsSi', 'dsTa', 'divisionalSecretariatCode',
  'nameEn', 'nameSi', 'nameTa', 'CCODE', 'ccode', 'code',
] as const;
const normalize = (value: string) => cleanMojibake(value).normalize('NFKC').toLocaleLowerCase().trim();

// Search every available name, regardless of the language used to display the option.
export function filterLocationOptions<T extends Record<string, unknown>>(
  options: T[], { inputValue }: { inputValue: string },
): T[] {
  const terms = normalize(inputValue).split(/\s+/).filter(Boolean);
  if (!terms.length) return options;
  return options.filter(option => {
    const names = searchFields.map(key => normalize(String(option[key] ?? ''))).join(' ');
    return terms.every(term => names.includes(term));
  });
}
