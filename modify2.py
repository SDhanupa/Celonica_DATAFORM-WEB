import re
with open('frontend/src/pages/UserDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the textShadow line
content = re.sub(r"\s*textShadow: '0px 2px 10px rgba\(0,0,0,0\.8\), 0px 0px 5px rgba\(0,0,0,0\.5\)',", "", content)

# Change the unselected text color to black (#000)
# e.g., color: activeMobileChart === 'pie' ? '#fff' : 'rgba(255,255,255,0.7)',
content = re.sub(
    r"(color:\s*activeMobileChart\s*===\s*'[^']+'\s*\?\s*'#fff'\s*:\s*)'rgba\(255,255,255,0\.7\)'",
    r"\1'#000000'",
    content
)

# Change the borderColor to black for unselected
# e.g., borderColor: 'rgba(255,255,255,0.3)',
# We'll make it conditionally based on activeMobileChart.
def border_replacer(match):
    # Find the activeMobileChart value for this button block.
    # The button block looks like:
    # color: activeMobileChart === 'pie' ? '#fff' : '#000000',
    # borderColor: 'rgba(255,255,255,0.3)',
    block = match.group(0)
    chart_val_match = re.search(r"activeMobileChart\s*===\s*'([^']+)'", block)
    if chart_val_match:
        chart_val = chart_val_match.group(1)
        # replace borderColor line
        new_block = re.sub(
            r"borderColor:\s*'rgba\(255,255,255,0\.3\)'",
            f"borderColor: activeMobileChart === '{chart_val}' ? 'transparent' : 'rgba(0,0,0,0.3)'",
            block
        )
        return new_block
    return block

# Apply to all buttons (from <Button to </Button>)
content = re.sub(r"<Button[\s\S]*?</Button>", border_replacer, content)

with open('frontend/src/pages/UserDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
