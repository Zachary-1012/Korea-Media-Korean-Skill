from pathlib import Path

from mcp.server.fastmcp import FastMCP

ROOT = Path(__file__).resolve().parents[1]
COURSE = ROOT / "index.html"
COURSE_URL = "https://zachary-1012.github.io/Korea-Media-Korean-Skill/"

mcp = FastMCP("Korea Media Korean Skill")


@mcp.resource("korean://course")
def course_html() -> str:
    """Return the complete interactive Korean course HTML."""
    return COURSE.read_text(encoding="utf-8")


@mcp.tool()
def get_course_url() -> str:
    """Return the public GitHub Pages URL."""
    return COURSE_URL


@mcp.tool()
def build_study_plan(
    degree: str = "master",
    months: int = 9,
    hours_per_week: int = 12,
    topik_target: int = 5,
) -> dict:
    """Build a compact study-plan profile for the selected admissions level."""
    degree = degree.lower().strip()
    profiles = {
        "undergrad": {
            "label": "本科 · 학부 / 학사과정",
            "focus": [
                "TOPIK foundation",
                "academic Korean basics",
                "major motivation",
                "campus communication",
                "undergraduate application materials",
            ],
        },
        "master": {
            "label": "硕士 · 석사과정",
            "focus": [
                "TOPIK 5/6",
                "research interest",
                "study/research plan",
                "graduate interview",
                "media/advertising/PR academic Korean",
                "research methods",
            ],
        },
        "phd": {
            "label": "博士 · 박사과정",
            "focus": [
                "literature review",
                "research contribution",
                "methodology",
                "professor fit",
                "research ethics",
                "research proposal and PhD interview",
            ],
        },
    }
    profile = profiles.get(degree, profiles["master"])
    weeks = round(max(1, months) * 4.3)
    hours = weeks * max(1, hours_per_week)
    return {
        "degree": profile["label"],
        "weeks": weeks,
        "estimated_hours": hours,
        "topik_target": max(1, min(6, topik_target)),
        "focus": profile["focus"],
        "course_url": COURSE_URL,
    }


if __name__ == "__main__":
    mcp.run()
