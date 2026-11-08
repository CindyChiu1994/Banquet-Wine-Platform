// Records observed MCP results; it never runs a browser or invents passing evidence.
import fs from 'node:fs';
import path from 'node:path';

const id = process.argv[2];
if (!/^E2E-\d{3}$/.test(id)) throw new Error('Expected E2E case ID');
const root = 'openspec/changes/improve-banquet-request-inputs';
const result = JSON.parse(fs.readFileSync(`${root}/e2e-evidence/${id}-result.json`, 'utf8'));
if (result.case !== id || !['PASS', 'FAIL'].includes(result.status)) throw new Error('Invalid result');
if (result.status === 'PASS') {
  if (!result.screenshots.length || result.browserErrors.length) throw new Error('Incomplete passing evidence');
  for (const image of result.screenshots) {
    if (!fs.statSync(path.join(root, 'e2e-evidence', image)).size) throw new Error('Empty screenshot');
  }
}
const filename = `${root}/e2e-testing.md`;
const text = fs.readFileSync(filename, 'utf8');
const pattern = new RegExp(`^- \\[[ x]\\] ${id} [\\s\\S]*?(?=^- \\[[ x]\\] E2E-|^## |$(?![\\s\\S]))`, 'm');
const old = text.match(pattern)?.[0];
if (!old) throw new Error('Missing checklist case');
const stamp = new Intl.DateTimeFormat('sv-SE', {timeZone:'Asia/Taipei', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hour12:false}).format(new Date());
let next = old.replace(/^- \[[ x]\]/, result.status === 'PASS' ? '- [x]' : '- [ ]')
  .replace(/^  - \*\*(Last run|Failure|Screenshot evidence|Observed evidence):\*\*.*\r?\n/gm, '');
const fields = [
  `  - **Last run:** \`${stamp} Asia/Taipei\` — ${result.status}`,
  ...(result.status === 'FAIL' ? [`  - **Failure:** ${result.error.replace(/\s+/g, ' ')}`] : []),
  `  - **Screenshot evidence:** ${result.screenshots.map(s => '[' + s + '](e2e-evidence/' + s + ')').join('、')}`,
  `  - **Observed evidence:** [實測結果](e2e-evidence/${id}-result.json)；${result.observations.length} 項檢查，console/page error ${result.browserErrors.length}；原始網路紀錄及存在時的本機防護軟體 CDP initiator 一併保留。`,
].join('\n');
next = next.replace(/(  - \*\*Evidence:\*\*.*)(\r?\n)/, (_, line, nl) => line + nl + fields + '\n');
fs.writeFileSync(filename, text.replace(old, next));
console.log(JSON.stringify({case:id,status:result.status,screenshots:result.screenshots.length,checks:result.observations.length}));
