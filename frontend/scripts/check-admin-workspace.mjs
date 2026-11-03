import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../src/config/adminTools.ts', import.meta.url), 'utf8');
const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { adminTools, visibleAdminTools, matchesAdminTool, matchesToolLocation } = await import(`data:text/javascript;base64,${Buffer.from(output).toString('base64')}`);
const routes = fs.readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const paths = new Set([...routes.matchAll(/path="([^"]+)"/g)].map(match => match[1]));
assert.equal(new Set(adminTools.map(tool => tool.id)).size, adminTools.length, 'Tool identifiers must be unique');
assert.equal(new Set(adminTools.map(tool => tool.path)).size, adminTools.length, 'Do not duplicate working tools');
for (const tool of adminTools) {
  assert(paths.has(tool.path.split('?')[0]), `Unrouted tool: ${tool.title}`);
  assert(!['/users', '/reports', '/survey'].includes(tool.path), 'Do not advertise placeholders or missing routes');
}
const regular = visibleAdminTools(['admin']).map(tool => tool.id);
for (const restricted of ['admins', 'registration', 'industry-review', 'industry-builder', 'places-review', 'bulk', 'location-api']) {
  assert(!regular.includes(restricted), `Admin must not be advertised a super-admin-only operation: ${restricted}`);
}
assert(regular.includes('gns'), 'Existing GN browsing must remain discoverable');
assert(visibleAdminTools(['super_admin']).some(tool => tool.id === 'rapid-fire'), 'Preserve contributor tools');
assert(adminTools.some(tool => matchesAdminTool(tool, 'postal', 'Locations')), 'Tags must be searchable');
assert(!adminTools.some(tool => matchesAdminTool(tool, 'impossible-tool-name')), 'Empty search must stay empty');
assert(matchesToolLocation('/admins?view=accounts', '/admins', '?view=accounts'));
assert(!matchesToolLocation('/admins', '/admins', '?view=accounts'), 'Overview must not stay selected on account tab');
assert(matchesToolLocation('/categories', '/categories/location-1-1'));
console.log(`PASS: ${adminTools.length} tools resolve to existing routes; permissions, tags, placeholders and preserved contribution links checked.`);
