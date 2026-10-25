import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

async function load(relative) {
  const result = await build({ entryPoints: [fileURLToPath(new URL(relative, import.meta.url))], bundle: true, write: false, format: 'esm', platform: 'node' });
  return import('data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64'));
}
const steps = await load('../src/components/survey/surveySteps.ts');
assert.equal(steps.SURVEY_STEPS.length, 16);
assert.equal(steps.MAX_STEP_INDEX, 15);
for (let i = 2; i <= 15; i++) {
  for (const lang of ['en', 'si', 'ta']) assert.ok(steps.DYNAMIC_STEP_TITLES[i][lang]);
}
const { cleanMojibake, sanitizeObject } = await load('../src/utils/mojibake.ts');
assert.equal(cleanMojibake('α╢Üα╖£α╖àα╢╣'), 'කොළඹ');
for (const text of ['α', 'Γ', '«Village»', 'ඔත්තප්පුව', 'கிராமம்', 'Ottappuwa']) assert.equal(cleanMojibake(text), text);
assert.deepEqual(sanitizeObject({ name: 'α╢Üα╖£α╖àα╢╣', values: [3, 'Γ'] }), { name: 'කොළඹ', values: [3, 'Γ'] });
console.log('PASS: shared survey steps and multilingual text recovery without corrupting valid text.');
