import matplotlib.pyplot as plt
import matplotlib.patches as patches
import os

os.makedirs('docs/diagrams', exist_ok=True)

# Set clean, crisp typography
plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'Helvetica']
plt.rcParams['font.family'] = 'sans-serif'

def create_card(ax, x, y, w, h, title, subtitle, points, header_color, bg_color='#ffffff', border_color='#cbd5e1'):
    # Main box with shadow-like clean border
    box = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.08,rounding_size=0.15",
                                 facecolor=bg_color, edgecolor=border_color, linewidth=1.5)
    ax.add_patch(box)
    
    # Header bar
    header = patches.FancyBboxPatch((x, y + h - 0.7), w, 0.7, boxstyle="round,pad=0.08,rounding_size=0.15",
                                    facecolor=header_color, edgecolor=header_color, linewidth=1)
    ax.add_patch(header)
    
    # Title
    ax.text(x + w/2, y + h - 0.35, title, ha='center', va='center', color='#ffffff', fontsize=11, fontweight='bold')
    
    # Subtitle
    if subtitle:
        ax.text(x + w/2, y + h - 0.95, subtitle, ha='center', va='center', color='#475569', fontsize=8.5, fontweight='semibold')
    
    # Content Points
    start_y = y + h - 1.35 if subtitle else y + h - 1.05
    for i, pt in enumerate(points):
        ax.text(x + 0.25, start_y - (i * 0.36), f"• {pt}", color='#1e293b', fontsize=8.5, va='center')

def draw_clean_arrow(ax, x1, y1, x2, y2, text='', color='#0284c7'):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="->,head_width=0.35,head_length=0.4", color=color, lw=2))
    if text:
        mid_x, mid_y = (x1 + x2) / 2, (y1 + y2) / 2
        ax.text(mid_x, mid_y + 0.18, text, ha='center', va='bottom', color=color, fontsize=8, fontweight='bold',
                bbox=dict(boxstyle='round,pad=0.2', facecolor='#ffffff', edgecolor='#e2e8f0', alpha=0.9))

# ─────────────────────────────────────────────────────────────
# 1. SIMPLE SYSTEM OVERVIEW DIAGRAM
# ─────────────────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(16, 9), dpi=300)
ax.set_facecolor('#f8fafc')
fig.patch.set_facecolor('#f8fafc')
ax.set_xlim(0, 16)
ax.set_ylim(0, 9)
ax.axis('off')

# Main Header
ax.text(8, 8.5, "CEYLONICA SYSTEM ARCHITECTURE — SIMPLIFIED OVERVIEW", 
        ha='center', va='center', color='#0f172a', fontsize=16, fontweight='bold')
ax.text(8, 8.1, "How the Web Frontend, Security, API Backend, Cache, and Database Work Together", 
        ha='center', va='center', color='#64748b', fontsize=10.5)

# 1. User & Frontend
create_card(ax, 0.8, 4.3, 3.2, 3.2, "1. USER INTERFACE", "React 18 Web App",
            ["Accessible on Mobile & PC", "Trilingual (EN / SI / TA)", "Interactive Maps & Charts", "Dynamic Survey Forms", "Apollo GraphQL Client"],
            '#0284c7', '#ffffff', '#93c5fd')

# 2. Keycloak Login
create_card(ax, 5.0, 4.3, 3.2, 3.2, "2. LOGIN & SECURITY", "Keycloak 24 IAM",
            ["Secure Single Sign-On", "Super Admin & User Roles", "SMS OTP Mobile Auth", "Protects All Private Data", "Token Based (JWT)"],
            '#d97706', '#ffffff', '#fcd34d')

# 3. Laravel API Backend
create_card(ax, 9.2, 4.3, 3.4, 3.2, "3. API & LOGIC ENGINE", "Laravel 11 Backend",
            ["Processes GraphQL & REST", "Auto GPS Geocoding", "Category Data Manager", "Auto Reg Number Generator", "Coordinates Approvals"],
            '#16a34a', '#ffffff', '#86efac')

# 4. Redis Cache
create_card(ax, 13.0, 4.3, 2.4, 3.2, "4. SPEED CACHE", "Redis In-Memory",
            ["Instant Page Loads", "Caches Demographics", "Throttles Spam", "Caches Categories"],
            '#dc2626', '#ffffff', '#fca5a5')

# 5. Database (Bottom Full Width)
box_db = patches.FancyBboxPatch((0.8, 0.6), 14.6, 2.8, boxstyle="round,pad=0.08,rounding_size=0.15",
                                facecolor='#ffffff', edgecolor='#7c3aed', linewidth=1.5)
ax.add_patch(box_db)
header_db = patches.FancyBboxPatch((0.8, 2.7), 14.6, 0.7, boxstyle="round,pad=0.08,rounding_size=0.15",
                                   facecolor='#7c3aed', edgecolor='#7c3aed', linewidth=1)
ax.add_patch(header_db)
ax.text(8.1, 3.05, "5. POSTGRESQL DATABASE (CENTRAL DATA REPOSITORY)", ha='center', va='center', color='#ffffff', fontsize=11, fontweight='bold')

db_items = [
    ("Spatial Data", "14,022 Grama Niladhari Polygons & GPS Boundaries"),
    ("Census 2024", "12 Demographic Matrices (Age, Houses, Roofs, Water, Toilets)"),
    ("Public Infrastructure", "Police Stations, Post Offices, PHI Areas, TRS Centers"),
    ("Dynamic Surveys", "Live Category Tables (category_data_*) & Submitted Answers")
]

for idx, (head, desc) in enumerate(db_items):
    col_x = 1.2 + (idx * 3.6)
    box_sub = patches.FancyBboxPatch((col_x, 0.9), 3.3, 1.5, boxstyle="round,pad=0.06,rounding_size=0.1",
                                     facecolor='#f8fafc', edgecolor='#cbd5e1', linewidth=1)
    ax.add_patch(box_sub)
    ax.text(col_x + 1.65, 2.0, head, ha='center', va='center', color='#7c3aed', fontsize=9.5, fontweight='bold')
    ax.text(col_x + 1.65, 1.4, desc, ha='center', va='center', color='#334155', fontsize=8, multialignment='center')

# Connecting Arrows
draw_clean_arrow(ax, 4.0, 5.9, 5.0, 5.9, "1. Login")
draw_clean_arrow(ax, 8.2, 5.9, 9.2, 5.9, "2. Request + Token")
draw_clean_arrow(ax, 12.6, 5.9, 13.0, 5.9, "3. Fast Cache")
draw_clean_arrow(ax, 10.9, 4.3, 10.9, 3.4, "4. Fetch & Save Data", '#7c3aed')

plt.tight_layout()
plt.savefig('docs/diagrams/1_system_architecture_topology.jpg', dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
plt.close()
print("Saved clean Diagram 1")


# ─────────────────────────────────────────────────────────────
# 2. SRI LANKA GEOGRAPHY HIERARCHY
# ─────────────────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(16, 9), dpi=300)
ax.set_facecolor('#f8fafc')
fig.patch.set_facecolor('#f8fafc')
ax.set_xlim(0, 16)
ax.set_ylim(0, 9)
ax.axis('off')

ax.text(8, 8.5, "SRI LANKA ADMINISTRATIVE & GEOGRAPHICAL STRUCTURE", 
        ha='center', va='center', color='#0f172a', fontsize=16, fontweight='bold')
ax.text(8, 8.1, "How Ceylonica Organizes Data from National Level Down to Every Village (GN)", 
        ha='center', va='center', color='#64748b', fontsize=10.5)

geo_levels = [
    ("NATIONAL", "p_srilankas", ["1 Country (Sri Lanka)", "Country Code: LK", "Total Population"], '#0284c7', 0.8),
    ("PROVINCE", "p_provinces", ["9 Provinces", "Codes: LK-1 to LK-9", "Western, Central, etc."], '#0d9488', 3.8),
    ("DISTRICT", "p_districts", ["25 Districts", "Colombo, Kandy, etc.", "District Demographics"], '#d97706', 6.8),
    ("DS DIVISION", "p_ds_divisions", ["331 DS Divisions", "Local Secretariats", "Regional Planning"], '#7c3aed', 9.8),
    ("GN DIVISION", "grama_niladharis", ["14,022 GN Villages", "Smallest Admin Unit", "Unique CCODE Key"], '#db2777', 12.8)
]

for title, table, items, col, x in geo_levels:
    create_card(ax, x, 4.5, 2.4, 3.0, title, table, items, col, '#ffffff', col)

for i in range(len(geo_levels)-1):
    x1 = geo_levels[i][4] + 2.4
    x2 = geo_levels[i+1][4]
    draw_clean_arrow(ax, x1, 6.0, x2, 6.0, "Contains", '#64748b')

# Bottom Section: What is Connected to Every GN Village
box_gn_connect = patches.FancyBboxPatch((0.8, 0.6), 14.4, 3.2, boxstyle="round,pad=0.08,rounding_size=0.15",
                                       facecolor='#ffffff', edgecolor='#db2777', linewidth=1.5)
ax.add_patch(box_gn_connect)
header_gn = patches.FancyBboxPatch((0.8, 3.1), 14.4, 0.7, boxstyle="round,pad=0.08,rounding_size=0.15",
                                  facecolor='#db2777', edgecolor='#db2777', linewidth=1)
ax.add_patch(header_gn)
ax.text(8.0, 3.45, "WHAT DATA IS ATTACHED TO EACH GRAMA NILADHARI (GN) DIVISION?", ha='center', va='center', color='#ffffff', fontsize=11, fontweight='bold')

gn_attached = [
    ("GPS Boundary Polygon", ["Full GPS coordinate boundaries", "Automatic GPS pin locator", "No Google Maps API costs"], '#0284c7', 1.2),
    ("2024 National Census", ["Age & Gender Distribution", "Housing & Roof Materials", "Water, Toilets & Waste Data"], '#16a34a', 4.8),
    ("Police & Post Offices", ["Nearest Police & Distance (km)", "Post Office Name & Postcode", "Contact phone numbers"], '#d97706', 8.4),
    ("Health & Agrarian Areas", ["Public Health Inspector (PHI)", "Agrarian / TRS Center Code", "Local Community Services"], '#7c3aed', 12.0)
]

for title, items, col, x in gn_attached:
    box_sub = patches.FancyBboxPatch((x, 0.9), 3.1, 1.9, boxstyle="round,pad=0.06,rounding_size=0.1",
                                     facecolor='#f8fafc', edgecolor='#cbd5e1', linewidth=1)
    ax.add_patch(box_sub)
    ax.text(x + 1.55, 2.4, title, ha='center', va='center', color=col, fontsize=9.5, fontweight='bold')
    for i, it in enumerate(items):
        ax.text(x + 0.15, 1.9 - (i * 0.4), f"• {it}", color='#334155', fontsize=8, va='center')

draw_clean_arrow(ax, 14.0, 4.5, 14.0, 3.8, "", '#db2777')

plt.tight_layout()
plt.savefig('docs/diagrams/2_spatial_administrative_hierarchy.jpg', dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
plt.close()
print("Saved clean Diagram 2")


# ─────────────────────────────────────────────────────────────
# 3. DYNAMIC SURVEY & APPROVAL WORKFLOW
# ─────────────────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(16, 9), dpi=300)
ax.set_facecolor('#f8fafc')
fig.patch.set_facecolor('#f8fafc')
ax.set_xlim(0, 16)
ax.set_ylim(0, 9)
ax.axis('off')

ax.text(8, 8.5, "FIELD SURVEY SUBMISSION & APPROVAL WORKFLOW", 
        ha='center', va='center', color='#0f172a', fontsize=16, fontweight='bold')
ax.text(8, 8.1, "Simple 5-Step Process from Citizen Submission to Official Public Listing", 
        ha='center', va='center', color='#64748b', fontsize=10.5)

workflow_steps = [
    ("STEP 1: FILL FORM", "Public Survey Page", ["User selects category", "Fills English/Sinhala/Tamil", "Adds repeaters & photos"], '#0284c7', 0.8),
    ("STEP 2: AUTO GPS", "Location Engine", ["Captures device GPS", "Auto-finds GN Village", "Flags GPS mismatches"], '#0d9488', 3.8),
    ("STEP 3: SMS OTP", "Mobile Verification", ["Sends 6-digit SMS code", "Verifies real person", "Prevents spam submissions"], '#d97706', 6.8),
    ("STEP 4: MODERATION", "Admin Approvals", ["Stored as 'Pending'", "Super Admin inspects data", "Compares GPS on Map"], '#7c3aed', 9.8),
    ("STEP 5: RESULT", "Publish / Reject", ["Approved: Given Reg ID", "Live on Public Portal", "Rejected: Kept in log"], '#16a34a', 12.8)
]

for title, sub, items, col, x in workflow_steps:
    create_card(ax, x, 4.5, 2.4, 3.2, title, sub, items, col, '#ffffff', col)

for i in range(len(workflow_steps)-1):
    x1 = workflow_steps[i][4] + 2.4
    x2 = workflow_steps[i+1][4]
    draw_clean_arrow(ax, x1, 6.1, x2, 6.1, "Next", '#64748b')

# Bottom Outcome Cards
# Approved Outcome
box_app = patches.FancyBboxPatch((1.0, 0.8), 6.5, 2.8, boxstyle="round,pad=0.08,rounding_size=0.15",
                                 facecolor='#ffffff', edgecolor='#16a34a', linewidth=2)
ax.add_patch(box_app)
hdr_app = patches.FancyBboxPatch((1.0, 2.9), 6.5, 0.7, boxstyle="round,pad=0.08,rounding_size=0.15",
                                 facecolor='#16a34a', edgecolor='#16a34a', linewidth=1)
ax.add_patch(hdr_app)
ax.text(4.25, 3.25, "OUTCOME A: APPROVED BY ADMIN", ha='center', va='center', color='#ffffff', fontsize=11, fontweight='bold')
ax.text(4.25, 2.3, "1. Generates Official Reg Number (e.g. LK-WP-COL-00124)\n2. Immediately visible to public on GN Page\n3. Added to National Statistics & Category Database\n4. Fast Redis Cache updated automatically", 
        ha='center', va='center', color='#14532d', fontsize=8.5, multialignment='left')

# Rejected Outcome
box_rej = patches.FancyBboxPatch((8.5, 0.8), 6.5, 2.8, boxstyle="round,pad=0.08,rounding_size=0.15",
                                 facecolor='#ffffff', edgecolor='#dc2626', linewidth=2)
ax.add_patch(box_rej)
hdr_rej = patches.FancyBboxPatch((8.5, 2.9), 6.5, 0.7, boxstyle="round,pad=0.08,rounding_size=0.15",
                                 facecolor='#dc2626', edgecolor='#dc2626', linewidth=1)
ax.add_patch(hdr_rej)
ax.text(11.75, 3.25, "OUTCOME B: REJECTED / NEEDS EDIT", ha='center', va='center', color='#ffffff', fontsize=11, fontweight='bold')
ax.text(11.75, 2.3, "1. Marked as 'Rejected' with reason logged\n2. Hidden from public website\n3. Admin can edit incorrect details & re-verify\n4. Preserves data integrity across Sri Lanka", 
        ha='center', va='center', color='#7f1d1d', fontsize=8.5, multialignment='left')

draw_clean_arrow(ax, 14.0, 4.5, 4.25, 3.6, "If Approved", '#16a34a')
draw_clean_arrow(ax, 14.0, 4.5, 11.75, 3.6, "If Rejected", '#dc2626')

plt.tight_layout()
plt.savefig('docs/diagrams/3_survey_and_category_lifecycle.jpg', dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
plt.close()
print("Saved clean Diagram 3")


# ─────────────────────────────────────────────────────────────
# 4. USER ROLES & PERMISSIONS
# ─────────────────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(16, 9), dpi=300)
ax.set_facecolor('#f8fafc')
fig.patch.set_facecolor('#f8fafc')
ax.set_xlim(0, 16)
ax.set_ylim(0, 9)
ax.axis('off')

ax.text(8, 8.5, "USER ROLES & PERMISSION LEVELS (RBAC)", 
        ha='center', va='center', color='#0f172a', fontsize=16, fontweight='bold')
ax.text(8, 8.1, "Who Can Do What in the Ceylonica Platform", 
        ha='center', va='center', color='#64748b', fontsize=10.5)

roles = [
    ("SUPER ADMIN", "System Owners", ["Full System Control", "Manage Admin Accounts", "Upload / Clean Bulk CSVs", "Approve & Edit All Surveys", "Edit Questions & Schema"], '#7c3aed', 0.8),
    ("ADMIN", "Regional Managers", ["Approve / Reject Surveys", "View & Edit Category Data", "View All GN Demographics", "View User Submissions", "Cannot delete core admins"], '#0284c7', 4.5),
    ("MODERATOR", "Data Reviewers", ["Inspect Survey Answers", "Verify GPS Coordinates", "Review Question Forms", "Read-Only System Config", "Assists Admins"], '#0d9488', 8.2),
    ("PUBLIC CITIZEN", "General Public", ["Browse All GN Villages", "View 2024 Census Charts", "Submit Surveys (with SMS OTP)", "Search Police & Post Offices", "100% Free Public Portal"], '#16a34a', 11.9)
]

for title, sub, items, col, x in roles:
    create_card(ax, x, 3.8, 3.3, 3.8, title, sub, items, col, '#ffffff', col)

# Comparison Summary Table below
box_matrix = patches.FancyBboxPatch((0.8, 0.6), 14.4, 2.6, boxstyle="round,pad=0.08,rounding_size=0.15",
                                   facecolor='#ffffff', edgecolor='#cbd5e1', linewidth=1.5)
ax.add_patch(box_matrix)

header_matrix = patches.FancyBboxPatch((0.8, 2.6), 14.4, 0.6, boxstyle="round,pad=0.08,rounding_size=0.15",
                                      facecolor='#0f172a', edgecolor='#0f172a', linewidth=1)
ax.add_patch(header_matrix)
ax.text(8.0, 2.9, "QUICK ACCESS COMPARISON TABLE", ha='center', va='center', color='#ffffff', fontsize=10.5, fontweight='bold')

features = [
    ("Feature / Action", "Super Admin", "Admin", "Moderator", "Public Citizen"),
    ("View Public GN Page & Census", "YES", "YES", "YES", "YES"),
    ("Submit Survey with SMS OTP", "YES", "YES", "YES", "YES"),
    ("Approve / Reject Submissions", "YES", "YES", "NO", "NO"),
    ("Bulk CSV Data Upload", "YES", "NO", "NO", "NO"),
    ("Create / Edit Admins & Users", "YES", "NO", "NO", "NO")
]

for row_idx, row in enumerate(features):
    y_pos = 2.2 - (row_idx * 0.32)
    bg_row = '#f8fafc' if row_idx % 2 == 0 else '#ffffff'
    ax.text(1.2, y_pos, row[0], color='#0f172a', fontsize=8, fontweight='bold' if row_idx==0 else 'normal')
    ax.text(6.0, y_pos, row[1], color='#16a34a' if row[1]=='YES' else '#dc2626', fontsize=8, fontweight='bold')
    ax.text(8.8, y_pos, row[2], color='#16a34a' if row[2]=='YES' else '#dc2626', fontsize=8, fontweight='bold')
    ax.text(11.5, y_pos, row[3], color='#16a34a' if row[3]=='YES' else '#dc2626', fontsize=8, fontweight='bold')
    ax.text(14.0, y_pos, row[4], color='#16a34a' if row[4]=='YES' else '#dc2626', fontsize=8, fontweight='bold')

plt.tight_layout()
plt.savefig('docs/diagrams/4_auth_security_flow.jpg', dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
plt.close()
print("Saved clean Diagram 4")


# ─────────────────────────────────────────────────────────────
# 5. 12-FACTOR DEMOGRAPHIC DATA ENGINE
# ─────────────────────────────────────────────────────────────
fig, ax = plt.subplots(figsize=(16, 9), dpi=300)
ax.set_facecolor('#f8fafc')
fig.patch.set_facecolor('#f8fafc')
ax.set_xlim(0, 16)
ax.set_ylim(0, 9)
ax.axis('off')

ax.text(8, 8.5, "12-DIMENSIONAL CENSUS DEMOGRAPHICS PER VILLAGE", 
        ha='center', va='center', color='#0f172a', fontsize=16, fontweight='bold')
ax.text(8, 8.1, "Every Grama Niladhari Division Contains These 12 Official 2024 Census Datasets", 
        ha='center', va='center', color='#64748b', fontsize=10.5)

census_groups = [
    ("1. Age Groups", "0-14, 15-59, 60-64, 65+", '#0284c7', 0.8, 5.5),
    ("2. Gender Population", "Male, Female, Total", '#0d9488', 4.5, 5.5),
    ("3. Housing Unit Types", "Permanent, Semi, Improvised", '#16a34a', 8.2, 5.5),
    ("4. Wall Materials", "Brick, Block, Cabook, Mud", '#d97706', 11.9, 5.5),

    ("5. Roof Materials", "Tile, Asbestos, Concrete, Sheet", '#7c3aed', 0.8, 3.0),
    ("6. Room Capacity", "1 Room up to 10+ Rooms", '#db2777', 4.5, 3.0),
    ("7. Water Sources", "Protected Well, Tap, Bowser", '#0284c7', 8.2, 3.0),
    ("8. Sanitation", "Water Seal, Pour Flush, Pit", '#0d9488', 11.9, 3.0),

    ("9. Waste Disposal", "Local Authority, Burn, Bury", '#16a34a', 0.8, 0.5),
    ("10. Religion", "Buddhist, Hindu, Islam, Christian", '#d97706', 4.5, 0.5),
    ("11. Household Head", "Head, Spouse, Child, Relative", '#7c3aed', 8.2, 0.5),
    ("12. Economic Activity", "Employed, Unemployed, Inactive", '#db2777', 11.9, 0.5)
]

for title, desc, col, x, y in census_groups:
    box = patches.FancyBboxPatch((x, y), 3.3, 2.0, boxstyle="round,pad=0.06,rounding_size=0.1",
                                 facecolor='#ffffff', edgecolor=col, linewidth=1.5)
    ax.add_patch(box)
    hdr = patches.FancyBboxPatch((x, y + 1.45), 3.3, 0.55, boxstyle="round,pad=0.06,rounding_size=0.1",
                                 facecolor=col, edgecolor=col, linewidth=1)
    ax.add_patch(hdr)
    ax.text(x + 1.65, y + 1.72, title, ha='center', va='center', color='#ffffff', fontsize=9.5, fontweight='bold')
    ax.text(x + 1.65, y + 0.7, desc, ha='center', va='center', color='#334155', fontsize=8.5, multialignment='center')

plt.tight_layout()
plt.savefig('docs/diagrams/5_demographic_census_matrix.jpg', dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
plt.close()
print("Saved clean Diagram 5")
