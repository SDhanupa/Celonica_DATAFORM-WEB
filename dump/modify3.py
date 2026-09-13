import re
with open('frontend/src/pages/UserDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace mobile-forced white colors with standard themeColors text colors
# For chart legends
content = content.replace("isMobileView ? 'rgba(255,255,255,0.7)' : themeColors.textDark", "themeColors.textDark")
content = content.replace("isMobileView ? '#ffffff' : themeColors.textDark", "themeColors.textDark")
content = content.replace("isMobileView ? 'rgba(255,255,255,0.7)' : 'text.secondary'", "'text.secondary'")

# Also check for exact strings that might use double quotes or different spacing
content = re.sub(r"isMobileView\s*\?\s*'rgba\(255,255,255,0\.7\)'\s*:\s*themeColors\.textDark", "themeColors.textDark", content)
content = re.sub(r"isMobileView\s*\?\s*'#ffffff'\s*:\s*themeColors\.textDark", "themeColors.textDark", content)
content = re.sub(r"isMobileView\s*\?\s*'rgba\(255,255,255,0\.7\)'\s*:\s*'text\.secondary'", "'text.secondary'", content)
content = re.sub(r"isMobileView\s*\?\s*'#ffffff'\s*:\s*'text\.primary'", "'text.primary'", content)

with open('frontend/src/pages/UserDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
