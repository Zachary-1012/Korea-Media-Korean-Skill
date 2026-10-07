from pathlib import Path
from urllib.request import urlopen
from jsonschema import Draft202012Validator
import json
root=Path.cwd()
for fname in ('plugin.json','mcp.json'):
    data=json.loads((root/fname).read_text(encoding='utf-8'))
    url=data['$schema']
    with urlopen(url,timeout=18) as reply:
        schema=json.load(reply)
    Draft202012Validator.check_schema(schema)
    issues=list(Draft202012Validator(schema).iter_errors(data))
    if issues:
        for issue in issues:
            print(fname,"FAIL",list(issue.path),issue.message)
        raise SystemExit(1)
    print(fname,"OFFICIAL_JSON_SCHEMA_PASS",url)
