import re
with open('frontend/src/pages/UserDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

new_content = re.sub(
    r"borderColor: 'rgba\(255,255,255,0\.3\)',",
    r"borderColor: 'rgba(255,255,255,0.3)',\n                            fontWeight: 'bold',\n                            textShadow: '0px 2px 10px rgba(0,0,0,0.8), 0px 0px 5px rgba(0,0,0,0.5)',",
    content
)

with open('frontend/src/pages/UserDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)
print('Done!')
