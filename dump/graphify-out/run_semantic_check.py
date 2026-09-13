import json
from graphify.cache import check_semantic_cache
from pathlib import Path

detect = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding="utf-8"))
all_files = [f for cat in ('document', 'paper', 'image') for f in detect['files'].get(cat, [])]

# Exclude images / binary assets or huge docs if needed
content_files = [f for f in all_files if Path(f).exists()]

Path('graphify-out/.graphify_semantic.json').write_text(json.dumps({'nodes':[],'edges':[],'hyperedges':[],'input_tokens':0,'output_tokens':0}), encoding='utf-8')
print(f'Content files for semantic pass: {len(content_files)}')
