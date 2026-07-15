import sys
import fitz  # PyMuPDF
import json
import re

def parse_pdf():
    pdf_path = r"source\전국 파크골프장 리스트.pdf"
    doc = fitz.open(pdf_path)
    
    # 1. 1페이지 ~ 18페이지: 구장명과 주소 파싱
    courses = []
    text_info = ""
    for i in range(18):
        page = doc.load_page(i)
        text_info += page.get_text("text") + "\n"
        
    # 정규식을 통해 "숫자 구장명 주소" 추출
    # "1 관악 파크골프장 서울 관악구..."
    lines = text_info.split('\n')
    current_item = None
    
    for line in lines:
        line = line.strip()
        if not line: continue
        if line in ["연번", "구장명", "주소"]: continue
        
        # 시작이 숫자이고 그 뒤에 문자가 오면 새로운 항목으로 간주 (1~570)
        match = re.match(r'^(\d+)\s+(.+)$', line)
        if match:
            if current_item:
                courses.append(current_item)
            
            num = match.group(1)
            rest = match.group(2)
            
            # 첫 번째 공백을 기준으로 구장명과 주소를 분리 (대략적인 분리, 후처리 필요)
            parts = rest.split(' ', 1)
            name = parts[0]
            address = parts[1] if len(parts) > 1 else ""
            
            # "파크골프장" 등이 이름에 포함될 경우 띄어쓰기 보정
            if "파크골프장" in rest:
                idx = rest.find("파크골프장") + 5
                name = rest[:idx].strip()
                address = rest[idx:].strip()
                
            current_item = {
                "id": int(num),
                "name": name,
                "address": address,
                "holes": 0
            }
        else:
            if current_item:
                # 주소나 이름이 줄바꿈으로 이어진 경우
                current_item["address"] += " " + line

    if current_item:
        courses.append(current_item)
        
    # 2. 19페이지 ~ 끝까지: 홀 수 파싱
    holes_text = ""
    for i in range(18, len(doc)):
        page = doc.load_page(i)
        holes_text += page.get_text("text") + "\n"
        
    holes_lines = holes_text.split('\n')
    holes_data = []
    for line in holes_lines:
        line = line.strip()
        if line == "홀 수": continue
        # 숫자가 이어져 있는 경우 분리 (예: 9999 -> 9, 9, 9, 9)
        # 하지만 OCR 특성상 "18", "9", "36" 등이 개별 라인에 있거나 붙어있음.
        # 정규식으로 9, 18, 27, 36 등 숫자 단위 분리
        matches = re.findall(r'(18|27|36|45|54|72|81|87|90|13|14|16|12|9|6|2)', line)
        for m in matches:
            holes_data.append(int(m))
            
    print(f"Extracted {len(courses)} courses and {len(holes_data)} hole counts.")
    
    # 3. 매핑 (크기가 달라도 최대한 매핑)
    for i in range(min(len(courses), len(holes_data))):
        courses[i]["holes"] = holes_data[i]
        
    # 4. JS 파일로 저장
    js_content = f"const courseData = {json.dumps(courses, ensure_ascii=False, indent=2)};"
    with open("data.js", "w", encoding="utf-8") as f:
        f.write(js_content)
        
    print("Saved to data.js")

if __name__ == "__main__":
    parse_pdf()
