import urllib.request
import re
import xml.etree.ElementTree as ET

url = "https://code.highcharts.com/mapdata/countries/kr/kr-all.svg"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        svg_content = response.read().decode('utf-8')
        print(f"Downloaded SVG: {len(svg_content)} bytes")
        
        svg_clean = re.sub(r'\sxmlns="[^"]+"', '', svg_content, count=1)
        root = ET.fromstring(svg_clean)
        
        for path in root.findall('.//path'):
            name = path.attrib.get('name', '')
            cls = path.attrib.get('class', '')
            if name:
                print(f"Found Region: {name}, Class: {cls}")
                
        with open("kr-all.svg", "w", encoding="utf-8") as f:
            f.write(svg_content)
except Exception as e:
    print("Error:", e)
