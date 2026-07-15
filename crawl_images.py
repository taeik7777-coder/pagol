import json
import re
import random
import time
import urllib.request
import urllib.parse
from html.parser import HTMLParser

# 기본 고화질 파크골프장/골프장 이미지 풀 (크롤링 실패 시 대비용)
FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1593111774240-d529f12cb416?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1535136029863-4a3e3518381c?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1592652431785-5b43339cb1e1?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1502014822147-1aedfb0676e0?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1620803932757-9d7aebbe2bb4?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1623910307049-34ba709b83b3?q=80&w=800&auto=format&fit=crop"
]

def load_data():
    with open('data.js', 'r', encoding='utf-8') as f:
        content = f.read()
    # "const courseData = [...];" 에서 JSON 부분만 추출
    json_str = content.replace('const courseData = ', '').strip().rstrip(';')
    return json.loads(json_str)

def save_data(data):
    js_content = f"const courseData = {json.dumps(data, ensure_ascii=False, indent=2)};"
    with open("data.js", "w", encoding="utf-8") as f:
        f.write(js_content)

def get_image_url(query):
    # 실제 크롤링 방어(Captcha, Block)를 피하기 위해 빠른 랜덤 할당 기법 사용
    # 실제 상용 앱에서는 Google Custom Search API 나 Naver API 키를 발급받아 사용해야 함.
    # 여기서는 데모를 위해 고품질 Unsplash 이미지를 구장 ID나 이름에 해시하여 일관되게 배정
    hash_val = sum(ord(c) for c in query)
    return FALLBACK_IMAGES[hash_val % len(FALLBACK_IMAGES)]

def main():
    print("Starting image mapping...")
    courses = load_data()
    
    for i, course in enumerate(courses):
        # 이미지가 없으면 추가
        if "image" not in course:
            course["image"] = get_image_url(course["name"])
        
        # 데모 데이터를 위해 추가적인 모의 정보 생성 (스크린샷 UI 구현용)
        if "fee" not in course:
            course["fee"] = "무료" if "무료" in course["name"] or i % 3 == 0 else "유료"
        if "operatingHours" not in course:
            course["operatingHours"] = "09:00~18:00"
        if "closedDays" not in course:
            course["closedDays"] = "매주 월요일"
        if "phone" not in course:
            course["phone"] = f"0{random.randint(2, 6) * 10}-{random.randint(100, 9999)}-{random.randint(1000, 9999)}"
        if "parking" not in course:
            course["parking"] = "무료주차" if i % 2 == 0 else "유료주차 (최초 1시간 무료)"
        if "rating" not in course:
            course["rating"] = round(random.uniform(3.5, 5.0), 1)
        if "reviewCount" not in course:
            course["reviewCount"] = random.randint(0, 150)
            
    save_data(courses)
    print(f"Successfully updated {len(courses)} courses with images and details.")

if __name__ == "__main__":
    main()
