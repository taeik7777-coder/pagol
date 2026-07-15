import json
import re

def load_data():
    with open('data.js', 'r', encoding='utf-8') as f:
        content = f.read()
    json_str = content.replace('const courseData = ', '').strip().rstrip(';')
    return json.loads(json_str)

def save_data(data):
    js_content = f"const courseData = {json.dumps(data, ensure_ascii=False, indent=2)};"
    with open("data.js", "w", encoding="utf-8") as f:
        f.write(js_content)

def main():
    courses = load_data()
    for i, course in enumerate(courses):
        # Use picsum seed for stable, working placeholder images
        course["image"] = f"https://picsum.photos/seed/pagol{i}/400/300"
    save_data(courses)
    print("Fixed image URLs in data.js")

if __name__ == "__main__":
    main()
