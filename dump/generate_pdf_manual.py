import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether, PageBreak, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            return  # Suppress on cover page
        
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor('#0284c7'))
        self.drawString(54, 792 - 36, "CEYLONICA PLATFORM")
        
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor('#64748b'))
        self.drawString(160, 792 - 36, "|   Complete System Architecture & User Manual")
        
        self.setStrokeColor(colors.HexColor('#e2e8f0'))
        self.setLineWidth(0.75)
        self.line(54, 792 - 42, 612 - 54, 792 - 42)
        
        # Footer
        self.line(54, 45, 612 - 54, 45)
        self.drawString(54, 32, "Ceylonica GIS, Demographic & Survey Platform  —  User & Engineering Guide")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(612 - 54, 32, page_text)
        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=30,
        textColor=colors.HexColor('#0f172a'),
        alignment=0
    )
    
    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#0284c7'),
        alignment=0
    )
    
    h1_style = ParagraphStyle(
        'Header1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Header2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=colors.HexColor('#0369a1'),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )
    
    h3_style = ParagraphStyle(
        'Header3',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#334155'),
        spaceBefore=6,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=colors.HexColor('#334155'),
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=body_style,
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=3
    )
    
    code_style = ParagraphStyle(
        'CodeSnippet',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=10.5,
        textColor=colors.HexColor('#0f172a'),
        backColor=colors.HexColor('#f8fafc'),
        borderPadding=5,
        spaceBefore=4,
        spaceAfter=4
    )

    callout_style = ParagraphStyle(
        'Callout',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=colors.HexColor('#0369a1'),
        backColor=colors.HexColor('#f0f9ff'),
        borderColor=colors.HexColor('#0284c7'),
        borderWidth=1,
        borderPadding=6,
        spaceBefore=5,
        spaceAfter=5
    )

    story = []

    # ─────────────────────────────────────────────────────────────
    # COVER PAGE
    # ─────────────────────────────────────────────────────────────
    story.append(Spacer(1, 30))
    story.append(Paragraph("<b>COMPLETE SYSTEM DOCUMENTATION & USER MANUAL</b>", ParagraphStyle(
        'CoverTag', fontName='Helvetica-Bold', fontSize=10, leading=12, textColor=colors.HexColor('#0284c7'), spaceAfter=8
    )))
    story.append(Paragraph("CEYLONICA PLATFORM", title_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("A Clear, Simple & Complete Guide to Architecture, Technologies, Features, and Operations", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=2.5, color=colors.HexColor('#0284c7'), spaceBefore=0, spaceAfter=15))

    cover_meta = [
        [Paragraph("<b>Project Name:</b>", body_style), Paragraph("Ceylonica (National GIS, Census & Dynamic Survey Platform)", body_style)],
        [Paragraph("<b>Purpose:</b>", body_style), Paragraph("Demographic analytics, administrative mapping & field data collection for Sri Lanka", body_style)],
        [Paragraph("<b>Coverage:</b>", body_style), Paragraph("14,022 Grama Niladhari (GN) Villages, 331 DS Divisions, 25 Districts, 9 Provinces", body_style)],
        [Paragraph("<b>Frontend:</b>", body_style), Paragraph("React 18, TypeScript, Vite, Material-UI v5, Apollo GraphQL, Leaflet Maps", body_style)],
        [Paragraph("<b>Backend:</b>", body_style), Paragraph("Laravel 11 (PHP 8.2), Lighthouse GraphQL v6, Redis Cache, PostgreSQL 16", body_style)],
        [Paragraph("<b>Security & Login:</b>", body_style), Paragraph("Keycloak 24 IAM (OpenID Connect / OAuth2) & Textware SMS OTP Gateway", body_style)],
        [Paragraph("<b>Version:</b>", body_style), Paragraph("2.4.0 Production Release (September 2026)", body_style)]
    ]
    t_meta = Table(cover_meta, colWidths=[120, 384])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#e2e8f0')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_meta)
    
    story.append(Spacer(1, 20))
    story.append(Paragraph(
        "<b>What is this document?</b><br/>"
        "This manual explains every part of the Ceylonica project in plain, easy-to-understand language. Whether you are a developer, system administrator, project manager, or user, this document guides you through how the system works, how data flows, how to use the survey system, and how to deploy and maintain the servers.",
        callout_style
    ))
    story.append(PageBreak())

    # ─────────────────────────────────────────────────────────────
    # SECTION 1: WHAT IS CEYLONICA?
    # ─────────────────────────────────────────────────────────────
    story.append(Paragraph("1. What is Ceylonica? (Project Overview)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0'), spaceBefore=2, spaceAfter=8))

    story.append(Paragraph(
        "<b>Ceylonica</b> is a web-based national data portal and surveying platform built specifically for Sri Lanka. It combines three powerful tools into one seamless system:",
        body_style
    ))
    story.append(Paragraph("1. <b>National Demographic Portal:</b> Anyone can look up any of the 14,022 Grama Niladhari (GN) villages in Sri Lanka and view official 2024 Census demographics (population by age and gender, house types, roof materials, drinking water sources, toilet facilities, waste disposal, and religions).", bullet_style))
    story.append(Paragraph("2. <b>Dynamic Field Survey Engine:</b> Administrators can create custom questionnaires (in English, Sinhala, and Tamil). Citizens or field workers can fill surveys on their phones with automatic GPS location tagging and SMS OTP verification.", bullet_style))
    story.append(Paragraph("3. <b>Administrative & Civic Infrastructure Map:</b> Links every village to its nearest Police Station (with distance in km), Post Office (with post code), Public Health Inspector (PHI) territory, and Agrarian (TRS) service area.", bullet_style))

    story.append(Spacer(1, 5))
    story.append(Paragraph("<b>Technology Stack at a Glance:</b>", h2_style))
    
    tech_table = [
        [Paragraph("<b>Layer</b>", body_style), Paragraph("<b>Technology</b>", body_style), Paragraph("<b>What it does in simple terms</b>", body_style)],
        [Paragraph("<b>Web App (Frontend)</b>", body_style), Paragraph("React 18 + TypeScript + Vite", body_style), Paragraph("The fast, interactive website that users see on their phones or computers.", body_style)],
        [Paragraph("<b>Design System</b>", body_style), Paragraph("Material-UI (MUI v5)", body_style), Paragraph("Provides clean, modern buttons, cards, forms, and responsive dialogs.", body_style)],
        [Paragraph("<b>API Layer</b>", body_style), Paragraph("GraphQL (Lighthouse) + REST", body_style), Paragraph("Sends exactly the data requested by the web app in milliseconds.", body_style)],
        [Paragraph("<b>Backend Engine</b>", body_style), Paragraph("Laravel 11 (PHP 8.2)", body_style), Paragraph("The core engine that runs business logic, checks GPS boundaries, and manages data.", body_style)],
        [Paragraph("<b>Security / Login</b>", body_style), Paragraph("Keycloak 24.0.3 (OIDC)", body_style), Paragraph("Handles logins, password security, and roles (Super Admin, Admin, Moderator, User).", body_style)],
        [Paragraph("<b>Speed Cache</b>", body_style), Paragraph("Redis In-Memory Cache", body_style), Paragraph("Makes repeat visits instant by caching census data and category trees.", body_style)],
        [Paragraph("<b>Database</b>", body_style), Paragraph("PostgreSQL 16", body_style), Paragraph("Stores all 14,022 GN divisions, 12 census tables, surveys, and infrastructure records.", body_style)],
        [Paragraph("<b>SMS Gateway</b>", body_style), Paragraph("Textware SMS API", body_style), Paragraph("Sends 6-digit verification codes to mobile phones during survey submissions.", body_style)]
    ]
    t_tech = Table(tech_table, colWidths=[110, 130, 264])
    t_tech.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_tech)

    story.append(PageBreak())

    # ─────────────────────────────────────────────────────────────
    # SECTION 2: SYSTEM ARCHITECTURE OVERVIEW
    # ─────────────────────────────────────────────────────────────
    story.append(Paragraph("2. System Architecture (How All Parts Connect)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0'), spaceBefore=2, spaceAfter=8))

    story.append(Paragraph(
        "The diagram below shows how a user interacts with Ceylonica. Every service is neatly packaged in Docker containers for high reliability and security.",
        body_style
    ))

    d1_path = 'docs/diagrams/1_system_architecture_topology.jpg'
    if os.path.exists(d1_path):
        story.append(Image(d1_path, width=504, height=283))
        story.append(Paragraph("<i>Figure 2.1: Simplified Architecture & Container Flow</i>", ParagraphStyle('Caption', fontName='Helvetica-Oblique', fontSize=8, textColor=colors.HexColor('#64748b'), alignment=1, spaceAfter=8)))

    story.append(Paragraph("Step-by-Step Request Flow:", h2_style))
    story.append(Paragraph("1. <b>User opens website:</b> The browser loads the React 18 frontend from Nginx (Port 3001 / 5173).", bullet_style))
    story.append(Paragraph("2. <b>User logs in:</b> If logging in as an Admin, Keycloak (Port 8081) verifies credentials and gives back a secure JWT token.", bullet_style))
    story.append(Paragraph("3. <b>Frontend asks for data:</b> React sends a GraphQL query (e.g. <code>GetGramaNiladhari</code>) with the JWT token to Laravel (Port 8000).", bullet_style))
    story.append(Paragraph("4. <b>Cache Check:</b> Laravel checks Redis. If the data was recently loaded, Redis returns it in less than 5 milliseconds.", bullet_style))
    story.append(Paragraph("5. <b>Database Query:</b> If not cached, Laravel queries PostgreSQL 16, formats the result, caches it in Redis for 1 hour, and returns it to the user.", bullet_style))

    story.append(PageBreak())

    # ─────────────────────────────────────────────────────────────
    # SECTION 3: SRI LANKA GEOGRAPHY & GIS ENGINE
    # ─────────────────────────────────────────────────────────────
    story.append(Paragraph("3. Sri Lanka Geography & GIS GPS Engine", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0'), spaceBefore=2, spaceAfter=8))

    story.append(Paragraph(
        "Ceylonica models the entire official 4-level administrative structure of Sri Lanka. Attached to each village (GN) are spatial GPS boundaries and public service connections.",
        body_style
    ))

    d2_path = 'docs/diagrams/2_spatial_administrative_hierarchy.jpg'
    if os.path.exists(d2_path):
        story.append(Image(d2_path, width=504, height=283))
        story.append(Paragraph("<i>Figure 3.1: Sri Lanka Administrative Structure & GN Data Attachments</i>", ParagraphStyle('Caption', fontName='Helvetica-Oblique', fontSize=8, textColor=colors.HexColor('#64748b'), alignment=1, spaceAfter=8)))

    story.append(Paragraph("How Automatic GPS Detection Works (No Google API Fees):", h2_style))
    story.append(Paragraph(
        "When a user allows location access on their phone, Ceylonica instantly identifies their exact Grama Niladhari village using a custom mathematical algorithm:",
        body_style
    ))
    story.append(Paragraph("• <b>Step A (Quick Box Filter):</b> Finds the 1-3 GN divisions whose bounding box contains the GPS point.", bullet_style))
    story.append(Paragraph("• <b>Step B (Ray-Casting Geometry):</b> Projects a test line across the exact village polygon. If it crosses an odd number of boundary edges, the user is verified to be inside that village.", bullet_style))
    story.append(Paragraph("• <b>Result:</b> The user's village, DS Division, District, and Province are filled automatically in under 10ms with 100% accuracy.", bullet_style))

    story.append(PageBreak())

    # ─────────────────────────────────────────────────────────────
    # SECTION 4: 12 CENSUS DEMOGRAPHIC DATASETS
    # ─────────────────────────────────────────────────────────────
    story.append(Paragraph("4. The 12 Census Demographic Datasets", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0'), spaceBefore=2, spaceAfter=8))

    story.append(Paragraph(
        "Every single one of the 14,022 Grama Niladhari divisions has direct access to official **2024 National Census** figures across 12 distinct categories:",
        body_style
    ))

    d5_path = 'docs/diagrams/5_demographic_census_matrix.jpg'
    if os.path.exists(d5_path):
        story.append(Image(d5_path, width=504, height=283))
        story.append(Paragraph("<i>Figure 4.1: The 12 Official Census Datasets Available per GN Village</i>", ParagraphStyle('Caption', fontName='Helvetica-Oblique', fontSize=8, textColor=colors.HexColor('#64748b'), alignment=1, spaceAfter=8)))

    story.append(Paragraph("Summary of the 12 Census Datasets:", h2_style))

    census_summary = [
        [Paragraph("<b>Census Category</b>", body_style), Paragraph("<b>What is measured in the village</b>", body_style)],
        [Paragraph("1. Age Groups", body_style), Paragraph("Children (0-14), Working Adults (15-59), Pre-seniors (60-64), Seniors (65+).", body_style)],
        [Paragraph("2. Gender Profile", body_style), Paragraph("Total Male population, Total Female population, Total Both.", body_style)],
        [Paragraph("3. Housing Unit Types", body_style), Paragraph("Permanent houses, Semi-Permanent houses, Improvised/temporary shacks.", body_style)],
        [Paragraph("4. Wall Materials", body_style), Paragraph("Brick, Cement block/stone, Cabook, Soil bricks, Mud walls, Cadjan/plank.", body_style)],
        [Paragraph("5. Roof Materials", body_style), Paragraph("Tile, Asbestos, Concrete slab, Zinc/Aluminium sheet, Metal sheet, Cadjan straw.", body_style)],
        [Paragraph("6. Room Capacity", body_style), Paragraph("Count of households with 1 room, 2, 3, 4, 5, 6, 7, 8, 9, or 10+ rooms.", body_style)],
        [Paragraph("7. Water Sources", body_style), Paragraph("Protected well (inside/outside), Tap water, Rural water scheme, Bowser, River.", body_style)],
        [Paragraph("8. Sanitation / Toilets", body_style), Paragraph("Water seal with sewer/septic tank, Pour flush, Direct pit, Not using.", body_style)],
        [Paragraph("9. Waste Disposal", body_style), Paragraph("Collected by local council, Burned, Buried, Composting, Thrown to nature.", body_style)],
        [Paragraph("10. Religions", body_style), Paragraph("Buddhist, Hindu, Islam, Roman Catholic, Other Christian, Other.", body_style)],
        [Paragraph("11. Household Head", body_style), Paragraph("Head of house, Wife/Husband, Son/Daughter, In-law, Grandchild, Boarder.", body_style)],
        [Paragraph("12. Economic Activity", body_style), Paragraph("Employed persons, Unemployed job seekers, Economically not active.", body_style)]
    ]
    t_cen = Table(census_summary, colWidths=[130, 374])
    t_cen.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_cen)

    story.append(PageBreak())

    # ─────────────────────────────────────────────────────────────
    # SECTION 5: DYNAMIC SURVEY & APPROVAL WORKFLOW
    # ─────────────────────────────────────────────────────────────
    story.append(Paragraph("5. Field Survey Submission & Approval Workflow", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0'), spaceBefore=2, spaceAfter=8))

    story.append(Paragraph(
        "Ceylonica includes an end-to-end field surveying pipeline with mobile SMS verification, automatic GPS coordinate checking, and an audited admin approval queue.",
        body_style
    ))

    d3_path = 'docs/diagrams/3_survey_and_category_lifecycle.jpg'
    if os.path.exists(d3_path):
        story.append(Image(d3_path, width=504, height=283))
        story.append(Paragraph("<i>Figure 5.1: 5-Step Survey Submission & Approval Workflow</i>", ParagraphStyle('Caption', fontName='Helvetica-Oblique', fontSize=8, textColor=colors.HexColor('#64748b'), alignment=1, spaceAfter=8)))

    story.append(Paragraph("How a Survey Moves from Citizen to Public Portal:", h2_style))
    story.append(Paragraph("• <b>Step 1 (Fill Form):</b> Citizen/Officer selects category and enters business details in English, Sinhala, or Tamil.", bullet_style))
    story.append(Paragraph("• <b>Step 2 (GPS Check):</b> Device coordinates are captured. If the GPS location does not match the chosen GN division, the submission is automatically flagged as <code>coordinate_mismatch = true</code>.", bullet_style))
    story.append(Paragraph("• <b>Step 3 (SMS OTP):</b> A 6-digit code is sent to the submitter's phone via Textware SMS to verify they are a genuine person.", bullet_style))
    story.append(Paragraph("• <b>Step 4 (Admin Review):</b> The submission enters the Admin queue as <code>pending</code>. Super Admins inspect the form and map.", bullet_style))
    story.append(Paragraph("• <b>Step 5 (Approval / Registration ID):</b> When approved, the system automatically assigns an official registration code (e.g. <code>LK-WP-COL-00124</code>) and publishes the record to the public GN page.", bullet_style))

    story.append(PageBreak())

    # ─────────────────────────────────────────────────────────────
    # SECTION 6: USER ROLES & SECURITY
    # ─────────────────────────────────────────────────────────────
    story.append(Paragraph("6. Security, Login & User Roles (RBAC)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0'), spaceBefore=2, spaceAfter=8))

    story.append(Paragraph(
        "Security is managed centrally by **Keycloak 24 IAM**. Access to features is strictly controlled based on user roles.",
        body_style
    ))

    d4_path = 'docs/diagrams/4_auth_security_flow.jpg'
    if os.path.exists(d4_path):
        story.append(Image(d4_path, width=504, height=283))
        story.append(Paragraph("<i>Figure 6.1: User Roles & Permission Matrix</i>", ParagraphStyle('Caption', fontName='Helvetica-Oblique', fontSize=8, textColor=colors.HexColor('#64748b'), alignment=1, spaceAfter=8)))

    story.append(Paragraph("Role Definitions:", h2_style))
    story.append(Paragraph("• <b>Super Admin:</b> Full control. Can create/delete admins, upload bulk CSV datasets, approve/reject surveys, edit questions, and modify system settings.", bullet_style))
    story.append(Paragraph("• <b>Admin:</b> Regional manager. Can approve/reject field surveys, edit category entries, and inspect demographic data.", bullet_style))
    story.append(Paragraph("• <b>Moderator:</b> Data verifier. Can inspect submitted answers, verify photos, and check GPS pins.", bullet_style))
    story.append(Paragraph("• <b>Public Citizen:</b> 100% free access. Can search any village, explore demographic charts, view police/post connections, and submit new surveys with SMS OTP.", bullet_style))

    story.append(PageBreak())

    # ─────────────────────────────────────────────────────────────
    # SECTION 7: OPERATIONS & HOW TO RUN
    # ─────────────────────────────────────────────────────────────
    story.append(Paragraph("7. Operations, How to Run & FAQ", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0'), spaceBefore=2, spaceAfter=8))

    story.append(Paragraph("How to Start the Entire Platform (Docker Compose):", h2_style))
    story.append(Paragraph("Open PowerShell in the project directory and run:", body_style))
    story.append(Paragraph("docker compose up -d", code_style))

    story.append(Paragraph("How to Run Database Migrations & Seed Data:", h2_style))
    story.append(Paragraph("cd backend\nphp artisan migrate\nphp artisan db:seed\nphp artisan db:seed --class=AdminSeeder", code_style))

    story.append(Paragraph("Standard URL Ports & Logins:", h2_style))
    
    ports_summary = [
        [Paragraph("<b>Portal / Service</b>", body_style), Paragraph("<b>URL / Port</b>", body_style), Paragraph("<b>Default Credentials / Purpose</b>", body_style)],
        [Paragraph("React Web App", body_style), Paragraph("<code>http://localhost:5173</code> / <code>3001</code>", body_style), Paragraph("Main public & admin web application.", body_style)],
        [Paragraph("Laravel GraphQL API", body_style), Paragraph("<code>http://localhost:8000/graphql</code>", body_style), Paragraph("Backend GraphQL playground and endpoints.", body_style)],
        [Paragraph("Keycloak Admin Console", body_style), Paragraph("<code>http://localhost:8080/admin</code>", body_style), Paragraph("<code>admin</code> / <code>admin123</code> (Realm: <code>ceylonica-admin</code>)", body_style)],
        [Paragraph("PostgreSQL Database", body_style), Paragraph("<code>localhost:5432</code> / <code>5434</code>", body_style), Paragraph("<code>celonica_user</code> / <code>celonica_pass</code> (DB: <code>celonica_db</code>)", body_style)],
        [Paragraph("Redis Cache", body_style), Paragraph("<code>localhost:6379</code>", body_style), Paragraph("High-speed response caching.", body_style)]
    ]
    t_ports = Table(ports_summary, colWidths=[130, 140, 234])
    t_ports.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_ports)

    story.append(Spacer(1, 10))
    story.append(Paragraph("Frequently Asked Questions (FAQ):", h2_style))
    story.append(Paragraph("<b>Q: How do I add a new question to the survey?</b><br/>Go to <code>/admin/industry-survey-questions</code> in the admin panel, click 'Add Question', enter English/Sinhala/Tamil texts, choose input type (Text, Dropdown, Radio, Number, File), and save. The public survey updates immediately.", body_style))
    story.append(Paragraph("<b>Q: What happens if a citizen enters an address in Colombo but their phone GPS says Kandy?</b><br/>The system detects that the GPS coordinates fall outside Colombo's polygon and automatically marks the submission with <code>coordinate_mismatch = true</code> so the Admin can inspect the map before approving.", body_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated clean PDF: {filename}")

if __name__ == '__main__':
    out_pdf = 'CEYLONICA_COMPLETE_PROJECT_MANUAL_AND_ARCHITECTURE_DOCUMENTATION.pdf'
    build_pdf(out_pdf)
    docs_pdf = os.path.join('docs', 'CEYLONICA_COMPLETE_PROJECT_MANUAL_AND_ARCHITECTURE_DOCUMENTATION.pdf')
    build_pdf(docs_pdf)
