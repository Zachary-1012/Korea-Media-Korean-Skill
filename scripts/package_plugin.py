from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from urllib.parse import urlparse
import json, hashlib, struct, re, sys, os

ROOT = Path(__file__).resolve().parents[1]
plugin = json.loads((ROOT/"plugin.json").read_text(encoding="utf-8"))
mcp = json.loads((ROOT/"mcp.json").read_text(encoding="utf-8"))
openai = plugin["extensions"]["com.openai"]
interface = openai["interface"]
review = openai["review"]

def ensure(ok, msg):
    if not ok:
        raise AssertionError(msg)

ensure(plugin["$schema"]=="https://agent-plugins.org/schemas/1.0.0/plugin.schema.json","plugin schema")
ensure(mcp["$schema"]=="https://agent-plugins.org/schemas/1.0.0/mcp.schema.json","mcp schema")
ensure(plugin["name"]=="korea-media-korean","name")
ensure(plugin["license"]=="LicenseRef-Proprietary","license")
ensure(len(review["test_cases"]["positive"])==5,"five positive cases")
ensure(len(review["test_cases"]["negative"])==3,"three negative cases")
ensure(len(interface["defaultPrompt"])==3,"three starter prompts")
ensure(len(interface["shortDescription"])<=30,"short description limit")
ensure(len(interface["displayName"])<=30,"display name limit")
ensure(len(interface["longDescription"])<=4000,"long description limit")
ensure(len(interface["capabilities"])<=20,"capabilities limit")
ensure(interface["category"]=="Education & Research","category")
ensure(openai["onboardingSkill"]=="./skills/korea-media-korean/SKILL.md","skill route")
for label in ("websiteURL","supportURL","privacyPolicyURL","termsOfServiceURL"):
    url=interface[label]
    ensure(urlparse(url).scheme=="https" and len(url)<=1024, label+" URL")
server=mcp["mcpServers"]["korea-media-korean"]
ensure(server["type"]=="streamable-http" and server["url"].startswith("https://") and server["url"].endswith("/mcp"),"remote MCP URL")
for x in review["test_cases"]["positive"]:
    for field in ("description","prompt","tools_triggered","expected_behavior"):
        ensure(bool(x.get(field)),field)
for x in review["test_cases"]["negative"]:
    for field in ("description","prompt"):
        ensure(bool(x.get(field)),field)
if review.get("demo_recording_url"):
    ensure(review["demo_recording_url"].startswith("https://"),"video URL")
lic = (ROOT/"LICENSE").read_text(encoding="utf-8")
ensure("All Rights Reserved" in lic and "commercial" in lic.lower(),"license terms")

screen_paths = interface.get("screenshots",[])
ensure(len(screen_paths)==len(interface["defaultPrompt"]),"one screenshot per starter")
for rel in screen_paths:
    p=ROOT/rel.lstrip("./")
    raw=p.read_bytes()
    ensure(raw[:8]==b"\x89PNG\r\n\x1a\n","png format "+str(p))
    w,h=struct.unpack(">II",raw[16:24])
    ensure(w==706 and 400<=h<=860,"screenshot dimensions "+str(p)+" "+str((w,h)))

files = [
    "plugin.json",
    "mcp.json",
    "LICENSE",
    "COMMERCIAL-LICENSE.md",
    "README.md",
    "REVIEW-HANDOFF.md",
    "PUBLISHING.md",
    "skills/korea-media-korean/SKILL.md",
    "assets/icon.svg",
    "assets/icon-dark.svg",
    "assets/logo.svg",
    "assets/logo-dark.svg",
] + [s.lstrip("./") for s in screen_paths]

for name in files:
    ensure((ROOT/name).is_file(),"missing file "+name)

outdir=ROOT/"dist"
outdir.mkdir(exist_ok=True)
out=outdir/f"Korean-Media-Study-v{plugin['version']}.zip"
with ZipFile(out,"w",ZIP_DEFLATED,compresslevel=8) as z:
    for name in files:
        z.write(ROOT/name,arcname=name)

with ZipFile(out,"r") as z:
    ensure(z.testzip() is None,"ZIP integrity")
    ensure(set(z.namelist())==set(files),"ZIP contents")
print(json.dumps({
    "ok":True,
    "package":str(out),
    "size_bytes":out.stat().st_size,
    "sha256":hashlib.sha256(out.read_bytes()).hexdigest(),
    "files":len(files),
    "positive_cases":5,
    "negative_cases":3,
    "screenshots":len(screen_paths),
    "license":"LicenseRef-Proprietary",
},ensure_ascii=False,indent=2))
