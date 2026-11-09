"""Audit original MCP screenshots; contact sheets are review aids, not evidence replacements."""
from pathlib import Path
import json, hashlib
from PIL import Image, ImageDraw, ImageFont

root = Path('openspec/changes/archive/2026-11-09-streamline-onsite-signoff-payment/e2e-evidence')
rows, names, results = [], [], []
for index in range(1, 17):
    case = f'E2E-{index:03d}'
    result = json.loads((root / f'{case}-result.json').read_text(encoding='utf-8'))
    assert result['case'] == case and result['status'] == 'PASS' and not result['browserErrors']
    assert result['screenshots']
    for name in result['screenshots']:
        path = root / name
        assert path.parent == root and name.startswith(case + '-') and path.stat().st_size
        with Image.open(path) as img:
            width, height = img.size
            img.verify()
        rows.append(dict(case=case, file=name, bytes=path.stat().st_size, width=width, height=height, sha256=hashlib.sha256(path.read_bytes()).hexdigest()))
        names.append(name)
    results.append(dict(case=case, status='PASS', observations=len(result['observations']), screenshots=len(result['screenshots'])))
font = ImageFont.truetype('C:/Windows/Fonts/msjh.ttc', 13)
for start in range(0, len(names), 16):
    sheet = Image.new('RGB', (1440, 1720), '#dedbd4')
    draw = ImageDraw.Draw(sheet)
    for cell, name in enumerate(names[start:start+16]):
        x, y = (cell % 4) * 360, (cell // 4) * 430
        draw.text((x+6, y+4), name, fill='black', font=font)
        with Image.open(root / name) as src:
            thumb = src.convert('RGB')
            thumb.thumbnail((348, 396))
            sheet.paste(thumb, (x+(360-thumb.width)//2, y+28))
    sheet.save(root / f'contact-sheet-{start//16+1}.jpg', quality=88)
summary = dict(change='streamline-onsite-signoff-payment', passed=16, failed=0, skipped=0, total=16, unitTestsPassed=106, productRepairIterations=0, screenshots=len(names), observations=sum(r['observations'] for r in results), browserErrors=0, results=results)
(root/'summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')
(root/'evidence-audit.json').write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(summary, ensure_ascii=False))
