import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
const result = await build({ entryPoints: [fileURLToPath(new URL('../src/utils/locationOptions.ts', import.meta.url))], bundle: true, write: false, format: 'esm', platform: 'node' });
const { filterLocationOptions } = await import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64'));
const cities = [{ dsEn: 'Nochchiyagama', dsSi: 'නොච්චියාගම', dsTa: 'நொச்சியாகம', divisionalSecretariatCode: '7127' }, { dsEn: 'Colombo' }];
for (const inputValue of ['Nochchiyagama', ' NOCHCHI ', 'නොච්චියාගම', 'நொச்சியாகம', '7127']) {
  assert.deepEqual(filterLocationOptions(cities, { inputValue }), [cities[0]]);
}
assert.deepEqual(filterLocationOptions(cities, { inputValue: 'missing place' }), []);
assert.equal(filterLocationOptions(cities, { inputValue: '  ' }), cities);
assert.equal(filterLocationOptions([{ nameEn: 'Ottappuwa', CCODE: 'RAYOT' }], { inputValue: 'rayot' }).length, 1);
assert.equal(filterLocationOptions([{ admin2NameEn: 'Anuradhapura', admin2NameSi: 'අනුරාධපුර' }], { inputValue: 'anuradhapura' }).length, 1);
console.log('PASS: district, DS and GN search across English, Sinhala, Tamil and codes.');
