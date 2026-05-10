"""Build the Personal Hub demo PDF.

Drop screenshots into demo/screenshots/<slug>.png (the slugs below match each
feature). Re-run this script to regenerate demo/Personal-Hub-Demo.pdf.
Missing screenshots are rendered as a labelled placeholder box.
"""
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

ROOT = Path(__file__).resolve().parent
SHOTS = ROOT / "screenshots"
OUT = ROOT / "Personal-Hub-Demo.pdf"
PUBLIC_COPY = ROOT.parent / "frontend" / "public" / "Personal-Hub-Demo.pdf"

PAGE_W, PAGE_H = A4
MARGIN = 1.8 * cm

FEATURES = [
    {
        "slug": "auth",
        "icon": "🔐",
        "title": "Login, Register & Logout",
        "tagline": "Session-based auth with CSRF protection.",
        "bullets": [
            "Register a new account with username + password (email optional).",
            "Log in to land on your personalised home page.",
            "Logout button lives at the bottom of the sidebar.",
            "All feature pages are gated — anonymous visitors are redirected to /login.",
        ],
    },
    {
        "slug": "home",
        "icon": "🏠",
        "title": "Home",
        "tagline": "A personal welcome screen.",
        "bullets": [
            "Greets you by your username after login.",
            "Acts as the landing page once you sign in.",
        ],
    },
    {
        "slug": "todo",
        "icon": "✅",
        "title": "To Do",
        "tagline": "Plain, fast task list.",
        "bullets": [
            "Add tasks with a single input field.",
            "Tick the checkbox to mark a task done (strikethrough style).",
            "Inline edit and delete with confirmation.",
        ],
    },
    {
        "slug": "bucketlist",
        "icon": "🎯",
        "title": "Bucket List",
        "tagline": "Things you want to do, someday.",
        "bullets": [
            "Add bucket-list items, mark them complete when achieved.",
            "Edit and delete just like the To Do list.",
        ],
    },
    {
        "slug": "ideas",
        "icon": "💡",
        "title": "Ideas",
        "tagline": "Capture ideas with images and status.",
        "bullets": [
            "Each idea has a title, description, optional image, and status (New / In Progress / Done / Archived).",
            "Search box filters across title, description, and status.",
            "Inline status dropdown to move ideas through the pipeline.",
        ],
    },
    {
        "slug": "resume",
        "icon": "📄",
        "title": "Resume",
        "tagline": "Track job applications.",
        "bullets": [
            "Upload your resume file alongside each application.",
            "Statuses to track where each application stands (Applied, Interview, Offer, Rejected, etc.).",
            "Search and filter to keep your pipeline tidy.",
        ],
    },
    {
        "slug": "projects",
        "icon": "🚀",
        "title": "Projects",
        "tagline": "Your portfolio of builds.",
        "bullets": [
            "Track each project with description, status, and details.",
            "Sortable list view to spot what is shipping next.",
        ],
    },
    {
        "slug": "learning",
        "icon": "📚",
        "title": "Today's Learning",
        "tagline": "A daily log of what you learned.",
        "bullets": [
            "Jot down what you picked up each day.",
            "Browse history to see your progression over time.",
        ],
    },
    {
        "slug": "passwords",
        "icon": "🔒",
        "title": "Passwords",
        "tagline": "A private credentials vault.",
        "bullets": [
            "Store site, username, and password entries in one place.",
            "Gated behind login so only you can see them.",
        ],
    },
    {
        "slug": "drawing",
        "icon": "🎨",
        "title": "Drawing",
        "tagline": "A built-in sketchpad powered by Konva.",
        "bullets": [
            "Free-draw on a canvas with adjustable brush.",
            "Save sketches and revisit them later.",
        ],
    },
]


def draw_cover(c):
    c.setFillColor(colors.HexColor("#0f172a"))
    c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)

    c.setFillColor(colors.HexColor("#10b981"))
    c.rect(0, PAGE_H - 4 * cm, PAGE_W, 0.18 * cm, stroke=0, fill=1)

    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 36)
    c.drawString(MARGIN, PAGE_H - 6 * cm, "Personal Hub")

    c.setFillColor(colors.HexColor("#86efac"))
    c.setFont("Helvetica", 16)
    c.drawString(MARGIN, PAGE_H - 7 * cm, "A walkthrough of every feature")

    c.setFillColor(colors.HexColor("#cbd5e1"))
    c.setFont("Helvetica", 11)
    lines = [
        "Built with Next.js + Django REST Framework.",
        "Session auth + CSRF, every page gated behind login.",
        "Nine feature areas, all in one app.",
    ]
    y = PAGE_H - 9 * cm
    for line in lines:
        c.drawString(MARGIN, y, line)
        y -= 0.6 * cm

    c.setFillColor(colors.HexColor("#64748b"))
    c.setFont("Helvetica-Oblique", 9)
    c.drawString(MARGIN, MARGIN, "Demo PDF — generated by demo/build_demo.py")


def draw_header(c, feature):
    c.setFillColor(colors.HexColor("#0f172a"))
    c.setFont("Helvetica-Bold", 22)
    c.drawString(MARGIN, PAGE_H - MARGIN - 0.4 * cm,
                 f"{feature['icon']}  {feature['title']}")

    c.setFillColor(colors.HexColor("#10b981"))
    c.rect(MARGIN, PAGE_H - MARGIN - 1.0 * cm, 3 * cm, 0.08 * cm, stroke=0, fill=1)

    c.setFillColor(colors.HexColor("#475569"))
    c.setFont("Helvetica-Oblique", 12)
    c.drawString(MARGIN, PAGE_H - MARGIN - 1.7 * cm, feature["tagline"])


def draw_bullets(c, bullets, y_top):
    c.setFillColor(colors.HexColor("#1f2937"))
    c.setFont("Helvetica", 11)
    y = y_top
    for b in bullets:
        c.setFillColor(colors.HexColor("#10b981"))
        c.circle(MARGIN + 0.15 * cm, y + 0.12 * cm, 0.08 * cm, stroke=0, fill=1)
        c.setFillColor(colors.HexColor("#1f2937"))
        # naive text wrapping at ~95 chars
        max_chars = 95
        words = b.split()
        line, lines = "", []
        for w in words:
            candidate = (line + " " + w).strip()
            if len(candidate) > max_chars:
                lines.append(line)
                line = w
            else:
                line = candidate
        if line:
            lines.append(line)
        for i, ln in enumerate(lines):
            c.drawString(MARGIN + 0.55 * cm, y, ln)
            y -= 0.5 * cm
        y -= 0.15 * cm
    return y


def draw_screenshot(c, slug, y_top):
    box_x = MARGIN
    box_w = PAGE_W - 2 * MARGIN
    box_h = 11 * cm
    box_y = y_top - box_h

    img_path = SHOTS / f"{slug}.png"
    if img_path.exists():
        try:
            img = ImageReader(str(img_path))
            iw, ih = img.getSize()
            ratio = min(box_w / iw, box_h / ih)
            draw_w = iw * ratio
            draw_h = ih * ratio
            x = box_x + (box_w - draw_w) / 2
            y = box_y + (box_h - draw_h) / 2
            c.drawImage(img, x, y, draw_w, draw_h,
                        preserveAspectRatio=True, mask='auto')
            c.setStrokeColor(colors.HexColor("#cbd5e1"))
            c.setLineWidth(0.5)
            c.rect(box_x, box_y, box_w, box_h, stroke=1, fill=0)
            return box_y
        except Exception as e:
            print(f"  ! failed to embed {img_path.name}: {e}")

    c.setFillColor(colors.HexColor("#f1f5f9"))
    c.setStrokeColor(colors.HexColor("#cbd5e1"))
    c.setDash(4, 3)
    c.setLineWidth(1)
    c.rect(box_x, box_y, box_w, box_h, stroke=1, fill=1)
    c.setDash()

    c.setFillColor(colors.HexColor("#94a3b8"))
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(PAGE_W / 2, box_y + box_h / 2 + 0.3 * cm,
                        "screenshot placeholder")
    c.setFont("Helvetica", 10)
    c.drawCentredString(PAGE_W / 2, box_y + box_h / 2 - 0.3 * cm,
                        f"drop {slug}.png into demo/screenshots/")
    return box_y


def draw_footer(c, page_num, total):
    c.setFillColor(colors.HexColor("#94a3b8"))
    c.setFont("Helvetica", 9)
    c.drawRightString(PAGE_W - MARGIN, MARGIN - 0.4 * cm,
                      f"{page_num} / {total}")
    c.drawString(MARGIN, MARGIN - 0.4 * cm, "Personal Hub demo")


def build():
    SHOTS.mkdir(exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=A4)
    total_pages = len(FEATURES) + 1

    draw_cover(c)
    draw_footer(c, 1, total_pages)
    c.showPage()

    for idx, feat in enumerate(FEATURES, start=2):
        draw_header(c, feat)
        bullets_top = PAGE_H - MARGIN - 2.7 * cm
        y_after_bullets = draw_bullets(c, feat["bullets"], bullets_top)
        screenshot_top = y_after_bullets - 0.3 * cm
        draw_screenshot(c, feat["slug"], screenshot_top)
        draw_footer(c, idx, total_pages)
        c.showPage()

    c.save()
    print(f"wrote {OUT}")
    if PUBLIC_COPY.parent.exists():
        PUBLIC_COPY.write_bytes(OUT.read_bytes())
        print(f"copied to {PUBLIC_COPY}")
    missing = [f["slug"] for f in FEATURES if not (SHOTS / f"{f['slug']}.png").exists()]
    if missing:
        print(f"missing screenshots ({len(missing)}): {', '.join(missing)}")
        print(f"drop PNGs into {SHOTS} and rerun to embed them.")


if __name__ == "__main__":
    build()
