import matplotlib.pyplot as plt
import matplotlib.patches as patches
from PIL import Image
import os

os.makedirs('docs/diagrams', exist_ok=True)

# Set global style
plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['font.family'] = 'sans-serif'

# ─────────────────────────────────────────────────────────────
# DIAGRAM 1: SYSTEM ARCHITECTURE TOPOLOGY
# ─────────────────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(16, 10), dpi=300)
ax.set_facecolor('#0f172a')
fig.patch.set_facecolor('#0f172a')
ax.set_xlim(0, 16)
ax.set_ylim(0, 10)
ax.axis('off')

# Title
ax.text(8, 9.5, "CEYLONICA SYSTEM ARCHITECTURE & CONTAINER TOPOLOGY", 
        ha='center', va='center', color='#38bdf8', fontsize=18, fontweight='bold')
ax.text(8, 9.1, "Enterprise GIS, Demographic Census & Dynamic Survey Platform", 
        ha='center', va='center', color='#94a3b8', fontsize=11)

# Tier Boxes
def draw_box(ax, x, y, w, h, title, subtitle, items, bg_color, border_color, title_color='#ffffff'):
    box = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.1,rounding_size=0.2",
                                 facecolor=bg_color, edgecolor=border_color, linewidth=2)
    ax.add_patch(box)
    ax.text(x + w/2, y + h - 0.35, title, ha='center', va='center', color=title_color, fontsize=11, fontweight='bold')
    if subtitle:
        ax.text(x + w/2, y + h - 0.65, subtitle, ha='center', va='center', color='#94a3b8', fontsize=8.5, style='italic')
    
    start_y = y + h - 1.05
    for i, item in enumerate(items):
        ax.text(x + 0.3, start_y - (i * 0.38), f"• {item}", color='#e2e8f0', fontsize=8.5, va='center')

# Client Tier
draw_box(ax, 0.8, 5.0, 3.6, 3.5, "CLIENT LAYER", "Web & Mobile Browser Clients", 
         ["React 18 + TypeScript SPA", "Vite High-Speed Bundler", "Material-UI (MUI v5) Theme", "Apollo Client 3.x (GraphQL)", "Leaflet & Canvas 3D Maps", "Trilingual UI (EN / SI / TA)"],
         '#1e293b', '#3b82f6', '#60a5fa')

# API & Gateway Tier
draw_box(ax, 5.2, 5.0, 4.4, 3.5, "APPLICATION / API LAYER", "Laravel 11 PHP 8.2 Engine",
         ["Lighthouse GraphQL Engine (v6)", "Keycloak Admin & OIDC Guards", "REST APIs (Bulk Upload, Surveys)", "Reverse Geocoding / Point-in-Polygon", "Dynamic Form & Category Resolver", "Auto-Registration Number Generator"],
         '#1e293b', '#10b981', '#34d399')

# Auth & Identity Tier
draw_box(ax, 10.4, 5.0, 4.8, 3.5, "IDENTITY & AUTH (IAM)", "Keycloak 24.0.3 Service",
         ["Realm: ceylonica-admin", "OAuth2 / OpenID Connect (OIDC)", "RBAC: SuperAdmin, Admin, Moderator, User", "Custom Ceylonica Theme & Login", "JWT Token Signing & Validation", "Direct Keycloak Admin API Client"],
         '#1e293b', '#f59e0b', '#fbbf24')

# Data & Persistence Tier
draw_box(ax, 0.8, 0.6, 4.2, 3.6, "PRIMARY DATA STORE", "PostgreSQL 16 Engine",
         ["14,022 GN Divisions & Polygons", "2024 National Census (12 Datasets)", "Dynamic Category Tables (category_data_*)", "Administrative Master (Provinces, Districts)", "Civic (Police, Post, PHI, TRS)", "User Submissions & Question Bank"],
         '#1e293b', '#8b5cf6', '#a78bfa')

# Caching & Queue Tier
draw_box(ax, 5.8, 0.6, 3.8, 3.6, "CACHE & HIGH SPEED LAYER", "Redis Alpine In-Memory",
         ["GraphQL Query Caching (maxAge 3600s)", "Category Tree Version Invalidation", "Session Store & Rate Throttling", "Guest Token Cache (24hr Expiry)", "Fast Bounding Box Spatial Filtering", "High-Throughput Read Acceleration"],
         '#1e293b', '#ef4444', '#f87171')

# External Services
draw_box(ax, 10.4, 0.6, 4.8, 3.6, "INTEGRATIONS & PERIPHERALS", "External Services & Storage",
         ["Textware SMS Gateway (OTP Verification)", "Keycloak PostgreSQL Database (Port 5432)", "Docker Compose Isolated Bridge Network", "Docker Volumes (Uploads, DB, Storage)", "Nginx Reverse Proxy Deployment", "Automated Backup & Seeder Scripts"],
         '#1e293b', '#06b6d4', '#22d3ee')

# Connection Arrows
def draw_arrow(ax, x1, y1, x2, y2, label="", color='#38bdf8'):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="->", color=color, lw=2, shrinkA=5, shrinkB=5))
    if label:
        ax.text((x1+x2)/2, (y1+y2)/2 + 0.15, label, color=color, fontsize=8, ha='center', va='bottom', fontweight='bold')

draw_arrow(ax, 4.4, 6.75, 5.2, 6.75, "GraphQL / REST (Bearer JWT)", '#38bdf8')
draw_arrow(ax, 4.4, 7.8, 10.4, 7.8, "OIDC Auth / Token Exchange", '#f59e0b')
draw_arrow(ax, 9.6, 6.75, 10.4, 6.75, "Admin API / User Sync", '#10b981')
draw_arrow(ax, 7.4, 5.0, 3.0, 4.2, "Eloquent / DB Queries", '#8b5cf6')
draw_arrow(ax, 7.4, 5.0, 7.4, 4.2, "Cache Put / Get / Flush", '#ef4444')
draw_arrow(ax, 9.6, 5.0, 12.0, 4.2, "SMS OTP / Storage", '#06b6d4')

plt.tight_layout()
plt.savefig('docs/diagrams/1_system_architecture_topology.jpg', dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
plt.close()
print("Saved Diagram 1")

# ─────────────────────────────────────────────────────────────
# DIAGRAM 2: SPATIAL & ADMINISTRATIVE HIERARCHY
# ─────────────────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(16, 9), dpi=300)
ax.set_facecolor('#0f172a')
fig.patch.set_facecolor('#0f172a')
ax.set_xlim(0, 16)
ax.set_ylim(0, 9)
ax.axis('off')

ax.text(8, 8.5, "SRI LANKA GIS & ADMINISTRATIVE DATA HIERARCHY", 
        ha='center', va='center', color='#38bdf8', fontsize=18, fontweight='bold')
ax.text(8, 8.1, "Multi-tiered Geopolitical Structure & Infrastructure Relationships", 
        ha='center', va='center', color='#94a3b8', fontsize=11)

# Horizontal hierarchy chain
levels = [
    ("NATIONAL TIER", "p_srilankas", "Country Level\nLK Identifier", '#3b82f6', 1.0),
    ("PROVINCE TIER", "p_provinces", "9 Provinces\n(PCCODE: LK-1 to LK-9)\nPopulation: Male/Fem/Both", '#10b981', 4.0),
    ("DISTRICT TIER", "p_districts", "25 Districts\n(DCCODE: LK-11..LK-92)\nRegional Census Data", '#f59e0b', 7.0),
    ("DS DIVISION", "p_ds_divisions", "331 DS Divisions\n(DSCCODE: Regional)\nDivisional Secretariats", '#8b5cf6', 10.0),
    ("GRAMA NILADHARI", "grama_niladharis", "14,022 GN Divisions\n(CCODE: Unique Key)\nBase Geographic Unit", '#ec4899', 13.0)
]

for title, table, desc, color, x in levels:
    box = patches.FancyBboxPatch((x-1.1, 5.0), 2.2, 2.4, boxstyle="round,pad=0.08,rounding_size=0.15",
                                 facecolor='#1e293b', edgecolor=color, linewidth=2)
    ax.add_patch(box)
    ax.text(x, 7.0, title, ha='center', va='center', color=color, fontsize=10, fontweight='bold')
    ax.text(x, 6.5, table, ha='center', va='center', color='#93c5fd', fontsize=8.5, style='italic')
    ax.text(x, 5.7, desc, ha='center', va='center', color='#cbd5e1', fontsize=8, multialignment='center')

# Draw links between tiers
for i in range(len(levels)-1):
    x1 = levels[i][4] + 1.1
    x2 = levels[i+1][4] - 1.1
    draw_arrow(ax, x1, 6.2, x2, 6.2, "1 : N", '#94a3b8')

# Attached Infrastructure & Demographic modules to GN Unit
modules = [
    ("Spatial Boundary (Polygon)", "min/max lat/lng bbox\nRay-casting Point-in-Polygon", '#06b6d4', 1.5, 1.2),
    ("Demographics & Housing", "2024 Census (12 Matrices)\nAge, Religion, Roof, Water", '#10b981', 5.0, 1.2),
    ("Police Jurisdiction", "Police Stations & Contact\nDistance to Station (km)", '#f59e0b', 8.5, 1.2),
    ("Postal & Health Services", "Post Offices & Postal Code\nPHI & TRS Area Codes", '#a855f7', 12.0, 1.2),
]

for title, desc, color, x, y in modules:
    box = patches.FancyBboxPatch((x-1.3, y), 2.6, 2.0, boxstyle="round,pad=0.08,rounding_size=0.15",
                                 facecolor='#1e293b', edgecolor=color, linewidth=1.5)
    ax.add_patch(box)
    ax.text(x, y + 1.6, title, ha='center', va='center', color=color, fontsize=9.5, fontweight='bold')
    ax.text(x, y + 0.9, desc, ha='center', va='center', color='#cbd5e1', fontsize=8, multialignment='center')
    draw_arrow(ax, 13.0, 5.0, x, y + 2.0, "", color)

plt.tight_layout()
plt.savefig('docs/diagrams/2_spatial_administrative_hierarchy.jpg', dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
plt.close()
print("Saved Diagram 2")

# ─────────────────────────────────────────────────────────────
# DIAGRAM 3: DYNAMIC SURVEY & APPROVAL WORKFLOW
# ─────────────────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(16, 9), dpi=300)
ax.set_facecolor('#0f172a')
fig.patch.set_facecolor('#0f172a')
ax.set_xlim(0, 16)
ax.set_ylim(0, 9)
ax.axis('off')

ax.text(8, 8.5, "DYNAMIC CATEGORY SURVEY & SUBMISSION LIFECYCLE", 
        ha='center', va='center', color='#38bdf8', fontsize=18, fontweight='bold')
ax.text(8, 8.1, "End-to-End Field Data Collection, Validation, Approval & Publication Pipeline", 
        ha='center', va='center', color='#94a3b8', fontsize=11)

steps = [
    ("1. Form Initialization", "Dynamic Schema Fetch\n• Category Tree Lookup\n• Multilingual Questions\n• Repeater Fields Setup", '#3b82f6', 1.0, 4.5),
    ("2. GPS & Geocoding", "Spatial Verification\n• Device Lat/Lng Capture\n• BBox + Point-in-Polygon\n• Auto GN Division Resolve", '#06b6d4', 4.0, 4.5),
    ("3. Mobile OTP Auth", "Fraud Prevention\n• Mobile Number Entry\n• Textware SMS Dispatch\n• OTP Code Verification", '#10b981', 7.0, 4.5),
    ("4. Data Staging", "Pending Submissions\n• category_data_{slug}\n• Image Upload & Storage\n• Mismatch Flagging", '#f59e0b', 10.0, 4.5),
    ("5. Admin Review", "Super Admin Portal\n• Compare Proposed vs DB\n• Side-by-Side Review\n• Approve / Reject Action", '#8b5cf6', 13.0, 4.5),
]

for title, desc, color, x, y in steps:
    box = patches.FancyBboxPatch((x-1.1, y-1.0), 2.2, 2.5, boxstyle="round,pad=0.08,rounding_size=0.15",
                                 facecolor='#1e293b', edgecolor=color, linewidth=2)
    ax.add_patch(box)
    ax.text(x, y + 1.1, title, ha='center', va='center', color=color, fontsize=10, fontweight='bold')
    ax.text(x, y + 0.0, desc, ha='center', va='center', color='#cbd5e1', fontsize=8, multialignment='center')

# Arrows across steps
for i in range(len(steps)-1):
    x1 = steps[i][3] + 1.1
    x2 = steps[i+1][3] - 1.1
    draw_arrow(ax, x1, 4.75, x2, 4.75, "Next", '#38bdf8')

# Final outcomes from Step 5
# Approved Box
app_box = patches.FancyBboxPatch((11.8, 0.8), 3.4, 2.0, boxstyle="round,pad=0.08,rounding_size=0.15",
                                 facecolor='#14532d', edgecolor='#22c55e', linewidth=2)
ax.add_patch(app_box)
ax.text(13.5, 2.3, "APPROVED STATUS", ha='center', va='center', color='#4ade80', fontsize=11, fontweight='bold')
ax.text(13.5, 1.4, "• Unique Reg Number Generated\n  (e.g., LK-WP-COL-00124)\n• Merged into Master Dataset\n• Live on Public GN Portal\n• Redis Cache Invalidation",
        ha='center', va='center', color='#dcfce7', fontsize=8, multialignment='center')

# Rejected Box
rej_box = patches.FancyBboxPatch((7.0, 0.8), 3.4, 2.0, boxstyle="round,pad=0.08,rounding_size=0.15",
                                 facecolor='#7f1d1d', edgecolor='#ef4444', linewidth=2)
ax.add_patch(rej_box)
ax.text(8.7, 2.3, "REJECTED STATUS", ha='center', va='center', color='#f87171', fontsize=11, fontweight='bold')
ax.text(8.7, 1.4, "• Status marked as 'rejected'\n• Excluded from Public GN Page\n• Retained in Audit Logs\n• Re-submission allowed",
        ha='center', va='center', color='#fee2e2', fontsize=8, multialignment='center')

draw_arrow(ax, 13.0, 3.5, 13.5, 2.8, "Approved", '#22c55e')
draw_arrow(ax, 13.0, 3.5, 9.5, 2.8, "Rejected", '#ef4444')

plt.tight_layout()
plt.savefig('docs/diagrams/3_survey_and_category_lifecycle.jpg', dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
plt.close()
print("Saved Diagram 3")

# ─────────────────────────────────────────────────────────────
# DIAGRAM 4: AUTHENTICATION & RBAC SECURITY ARCHITECTURE
# ─────────────────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(16, 9), dpi=300)
ax.set_facecolor('#0f172a')
fig.patch.set_facecolor('#0f172a')
ax.set_xlim(0, 16)
ax.set_ylim(0, 9)
ax.axis('off')

ax.text(8, 8.5, "AUTHENTICATION, OIDC & ROLE-BASED ACCESS CONTROL (RBAC)", 
        ha='center', va='center', color='#38bdf8', fontsize=18, fontweight='bold')
ax.text(8, 8.1, "Enterprise IAM with Keycloak OpenID Connect & Laravel Security Middleware", 
        ha='center', va='center', color='#94a3b8', fontsize=11)

# Actors & Flows
draw_box(ax, 0.8, 4.2, 3.2, 3.2, "AUTHENTICATION ACTORS", "User Personas",
         ["Super Administrator", "System Administrator", "Data Moderator", "Registered Field User", "Anonymous Public Visitor"],
         '#1e293b', '#3b82f6', '#60a5fa')

draw_box(ax, 5.0, 4.2, 4.5, 3.2, "KEYCLOAK 24 IAM ENGINE", "Realm: ceylonica-admin",
         ["OAuth 2.0 / OpenID Connect Core", "RSA256 JWT Signed Access Tokens", "Client: ceylonica-frontend (Public)", "Client: admin-cli (Confidential)", "Custom Login Theme: 'ceylonica'", "Brute-force & Password Policies"],
         '#1e293b', '#f59e0b', '#fbbf24')

draw_box(ax, 10.5, 4.2, 4.7, 3.2, "LARAVEL SECURITY GUARDS", "Middleware & Policy Stack",
         ["KeycloakJwtMiddleware (Verify Signature)", "keycloak.admin & super_admin Guards", "Rate Limiter (throttle:60,1 / throttle:20,1)", "First-time User Onboarding Interceptor", "CORS & CSRF Protection Layer", "GraphQL Field-Level Authorization"],
         '#1e293b', '#10b981', '#34d399')

# Permissions Matrix Box
perm_box = patches.FancyBboxPatch((0.8, 0.6), 14.4, 2.8, boxstyle="round,pad=0.1,rounding_size=0.15",
                                  facecolor='#1e293b', edgecolor='#8b5cf6', linewidth=2)
ax.add_patch(perm_box)
ax.text(8.0, 3.0, "ROLE-BASED PERMISSION MATRIX (RBAC)", ha='center', va='center', color='#a78bfa', fontsize=12, fontweight='bold')

ax.text(1.2, 2.4, "SUPER ADMIN", color='#38bdf8', fontweight='bold', fontsize=8.5)
ax.text(3.5, 2.4, "Full Access", color='#4ade80', fontsize=8.5)
ax.text(5.5, 2.4, "Full Access", color='#4ade80', fontsize=8.5)
ax.text(7.5, 2.4, "Approve/Reject/Edit", color='#4ade80', fontsize=8.5)
ax.text(9.5, 2.4, "CRUD Operations", color='#4ade80', fontsize=8.5)
ax.text(11.5, 2.4, "Upload & Clear CSV", color='#4ade80', fontsize=8.5)
ax.text(13.8, 2.4, "Full Control", color='#4ade80', fontsize=8.5)

ax.text(1.2, 1.8, "ADMIN", color='#fbbf24', fontweight='bold', fontsize=8.5)
ax.text(3.5, 1.8, "Full Access", color='#4ade80', fontsize=8.5)
ax.text(5.5, 1.8, "Full Access", color='#4ade80', fontsize=8.5)
ax.text(7.5, 1.8, "Approve/Reject", color='#4ade80', fontsize=8.5)
ax.text(9.5, 1.8, "View / Edit", color='#4ade80', fontsize=8.5)
ax.text(11.5, 1.8, "View Only", color='#fbbf24', fontsize=8.5)
ax.text(13.8, 1.8, "No Access", color='#f87171', fontsize=8.5)

ax.text(1.2, 1.2, "MODERATOR / USER", color='#94a3b8', fontweight='bold', fontsize=8.5)
ax.text(3.5, 1.2, "Full Access", color='#4ade80', fontsize=8.5)
ax.text(5.5, 1.2, "Submit with OTP", color='#4ade80', fontsize=8.5)
ax.text(7.5, 1.2, "View Own", color='#fbbf24', fontsize=8.5)
ax.text(9.5, 1.2, "No Access", color='#f87171', fontsize=8.5)
ax.text(11.5, 1.2, "No Access", color='#f87171', fontsize=8.5)
ax.text(13.8, 1.2, "No Access", color='#f87171', fontsize=8.5)

draw_arrow(ax, 4.0, 5.8, 5.0, 5.8, "Credentials", '#38bdf8')
draw_arrow(ax, 9.5, 5.8, 10.5, 5.8, "Bearer JWT", '#10b981')

plt.tight_layout()
plt.savefig('docs/diagrams/4_auth_security_flow.jpg', dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
plt.close()
print("Saved Diagram 4")

# ─────────────────────────────────────────────────────────────
# DIAGRAM 5: 12-FACTOR DEMOGRAPHIC DATA ENGINE
# ─────────────────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(16, 9), dpi=300)
ax.set_facecolor('#0f172a')
fig.patch.set_facecolor('#0f172a')
ax.set_xlim(0, 16)
ax.set_ylim(0, 9)
ax.axis('off')

ax.text(8, 8.5, "12-DIMENSIONAL DEMOGRAPHIC & CENSUS 2024 ARCHITECTURE", 
        ha='center', va='center', color='#38bdf8', fontsize=18, fontweight='bold')
ax.text(8, 8.1, "Micro-Demographic Datasets Aggregated at Grama Niladhari CCODE Resolution", 
        ha='center', va='center', color='#94a3b8', fontsize=11)

# Central Node: Grama Niladhari Master
center_box = patches.FancyBboxPatch((6.0, 3.5), 4.0, 2.0, boxstyle="round,pad=0.1,rounding_size=0.2",
                                    facecolor='#1e293b', edgecolor='#38bdf8', linewidth=3)
ax.add_patch(center_box)
ax.text(8.0, 4.7, "GRAMA NILADHARI MASTER", ha='center', va='center', color='#38bdf8', fontsize=11, fontweight='bold')
ax.text(8.0, 4.3, "table: grama_niladharis", ha='center', va='center', color='#93c5fd', fontsize=8.5, style='italic')
ax.text(8.0, 3.9, "Primary Key: id / CCODE (LK...)\n14,022 Administrative Divisions", 
        ha='center', va='center', color='#e2e8f0', fontsize=8, multialignment='center')

demo_tables = [
    # Top Row
    ("1. Age Demographics", "p_gns\n0-14, 15-59, 60-64, 65+", '#3b82f6', 1.8, 6.4),
    ("2. Gender & Population", "p_gns\nMale, Female, Total", '#10b981', 5.5, 6.4),
    ("3. Housing Unit Types", "housing_unit_types\nPermanent, Semi, Improvised", '#f59e0b', 10.5, 6.4),
    ("4. Wall Materials", "housing_wall_types\nBrick, Block, Cabook, Mud", '#ec4899', 14.2, 6.4),
    # Middle Sides
    ("5. Roof Materials", "housing_roof_types\nTile, Asbestos, Concrete, Sheet", '#8b5cf6', 1.8, 3.8),
    ("6. Room Count", "rooms_in_housing_units\n1 Room to 10+ Rooms", '#06b6d4', 14.2, 3.8),
    # Bottom Row
    ("7. Water Sources", "drinking_water_sources\nProtected Well, Tap, Bowser", '#14b8a6', 1.8, 1.2),
    ("8. Sanitation Facilities", "toilet_facilities\nWater Seal, Pour Flush, Pit", '#eab308', 5.5, 1.2),
    ("9. Solid Waste", "solid_waste_disposals\nLocal Authority, Burn, Bury", '#f97316', 10.5, 1.2),
    ("10. Religious Affiliation", "religious_affiliations\nBuddhist, Hindu, Islam, Catholic", '#ef4444', 14.2, 1.2),
]

for title, desc, color, x, y in demo_tables:
    box = patches.FancyBboxPatch((x-1.3, y-0.8), 2.6, 1.6, boxstyle="round,pad=0.08,rounding_size=0.15",
                                 facecolor='#1e293b', edgecolor=color, linewidth=1.5)
    ax.add_patch(box)
    ax.text(x, y + 0.5, title, ha='center', va='center', color=color, fontsize=8.5, fontweight='bold')
    ax.text(x, y - 0.2, desc, ha='center', va='center', color='#cbd5e1', fontsize=7.5, multialignment='center')
    draw_arrow(ax, 8.0, 4.5, x, y, "", color)

plt.tight_layout()
plt.savefig('docs/diagrams/5_demographic_census_matrix.jpg', dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
plt.close()
print("Saved Diagram 5")
