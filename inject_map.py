import xml.etree.ElementTree as ET
import re

# Mapping from Highcharts kr-all.svg IDs to Korean names used in the app
region_map = {
    'kr-so': '서울',
    'kr-kg': '경기',
    'kr-in': '인천',
    'kr-kw': '강원',
    'kr-gb': '충북',
    'kr-gn': '충남',
    'kr-tj': '대전',
    'kr-sj': '세종', # We can map to '충남' or just ignore if not used
    'kr-cb': '전북',
    'kr-2685': '전남',
    'kr-kj': '광주',
    'kr-2688': '경북',
    'kr-kn': '경남',
    'kr-tg': '대구',
    'kr-ul': '울산',
    'kr-pu': '부산',
    'kr-cj': '제주'
}

with open("kr-all.svg", "r", encoding="utf-8") as f:
    svg_content = f.read()

# Strip highcharts desc tags
svg_clean = re.sub(r'<desc.*?</desc>', '', svg_content, flags=re.DOTALL | re.IGNORECASE)
svg_clean = re.sub(r'<text.*?</text>', '', svg_clean, flags=re.DOTALL | re.IGNORECASE)

# Parse
svg_clean = re.sub(r'\sxmlns="[^"]+"', '', svg_clean, count=1)
root = ET.fromstring(svg_clean)

paths_html = []
for path in root.findall('.//path'):
    pid = path.attrib.get('id', '')
    d = path.attrib.get('d', '')
    korean_name = region_map.get(pid, '')
    
    # We add class 'map-svg-path' and data-region for interaction
    paths_html.append(f'<path id="{pid}" d="{d}" class="map-svg-path" data-region="{korean_name}" />')

# Create the final SVG block
svg_block = f'''
<svg viewBox="-5 -5 710 730" class="interactive-korea-map" xmlns="http://www.w3.org/2000/svg">
    <g stroke-width="2" fill="#d1e7dd" stroke="#ffffff">
        {chr(10).join(paths_html)}
    </g>
</svg>
'''

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Replace <div class="korea-map-grid">...</div> with the SVG
start_tag = '<div class="korea-map-grid">'
end_tag = '</div>\n                </div>'
start_idx = html.find(start_tag)
end_idx = html.find(end_tag, start_idx) + len(end_tag)

if start_idx != -1 and end_idx != -1:
    new_html = html[:start_idx] + f'<div class="korea-map-grid-wrapper">\n{svg_block}\n</div>' + html[end_idx-len(end_tag):]
    with open("index.html", "w", encoding="utf-8") as f:
        f.write(new_html)
    print("Successfully injected SVG map into index.html")
else:
    print("Could not find korea-map-grid in index.html")
