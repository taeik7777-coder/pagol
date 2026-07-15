import re

def update_html():
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Extract SVG map block
    svg_match = re.search(r'(<div class="korea-map-grid-wrapper">.*?</svg>\n</div>)', html, re.DOTALL)
    if not svg_match:
        print("Could not find SVG map block")
        return
    svg_block = svg_match.group(1)

    # 2. Build Home Tab Map Section
    home_map_section = f'''
            <!-- Home Map Section -->
            <div class="home-map-section" style="padding: 0 20px 30px;">
                <div class="recommend-header">
                    <i class="fas fa-map-marked-alt" style="color: var(--color-primary);"></i> 파크골프 지도
                </div>
                <p style="font-size:14px; color:var(--text-secondary); margin-bottom:12px;">전국 570개 구장 · 지역을 클릭하세요</p>
                <div class="korea-map-container">
                    {svg_block.replace('id="kr-', 'id="home-kr-')} <!-- Prevent ID collision if needed, but not strictly necessary for classes -->
                </div>
                
                <div class="search-results-info" style="margin-top: 16px; font-size: 16px; font-weight: 700;">
                    검색 결과: <strong id="home-course-count" style="color: var(--color-primary); font-size: 20px;">0</strong>개
                </div>
                
                <div class="course-list-container" id="home-course-list" style="padding: 16px 0;">
                    <!-- JS will render max 4 items -->
                </div>
                
                <button id="btn-view-all" style="width:100%; padding:14px; background:var(--bg-surface); border:2px solid #e5e7eb; border-radius:12px; font-size:16px; font-weight:800; color:var(--text-secondary); cursor:pointer;">
                    전체보기
                </button>
            </div>
    '''

    # Replace recommend-section with home_map_section
    html = re.sub(r'<!-- Recommend Section -->.*?</div>\n\n        </div>', home_map_section + '\n        </div>', html, flags=re.DOTALL)

    # 3. Build Search Tab Section
    swipeable_tiles = '''
                <!-- Swipeable Region Tiles -->
                <div class="region-scroll-x" id="search-region-tiles">
                    <button class="pill-btn active" data-region="">전체</button>
                    <button class="pill-btn" data-region="서울">서울</button>
                    <button class="pill-btn" data-region="경기">경기</button>
                    <button class="pill-btn" data-region="인천">인천</button>
                    <button class="pill-btn" data-region="강원">강원</button>
                    <button class="pill-btn" data-region="충북">충북</button>
                    <button class="pill-btn" data-region="충남">충남</button>
                    <button class="pill-btn" data-region="대전">대전</button>
                    <button class="pill-btn" data-region="경북">경북</button>
                    <button class="pill-btn" data-region="전북">전북</button>
                    <button class="pill-btn" data-region="대구">대구</button>
                    <button class="pill-btn" data-region="광주">광주</button>
                    <button class="pill-btn" data-region="경남">경남</button>
                    <button class="pill-btn" data-region="전남">전남</button>
                    <button class="pill-btn" data-region="부산">부산</button>
                    <button class="pill-btn" data-region="제주">제주</button>
                    <button class="pill-btn" data-region="세종">세종</button>
                </div>
    '''

    # Rewrite Search Tab Header
    search_tab_header_new = f'''
            <div class="search-tab-header">
                <h2>구장검색</h2>
                
                <div class="search-box" style="margin-bottom: 20px;">
                    <input type="text" id="course-search-input" placeholder="이름이나 주소로 검색..." autocomplete="off">
                    <button class="mic-btn" id="voice-search-btn-2" style="width: 44px; height: 44px; border-radius: 12px; font-size: 18px;">
                        <i class="fas fa-search"></i>
                    </button>
                </div>

                <div class="korea-map-container" style="margin-bottom: 20px;">
                    {svg_block}
                </div>

                {swipeable_tiles}
                
                <!-- Big Pill Tags for Options -->
                <div class="pill-tags" id="quick-tags" style="margin-top: 16px;">
                    <button class="pill-btn active" data-tag="">전체보기</button>
                    <button class="pill-btn" data-tag="무료">무료구장</button>
                    <button class="pill-btn" data-tag="36홀">36홀 이상</button>
                    <button class="pill-btn" data-tag="18홀">18홀</button>
                </div>
                
                <div class="search-results-info" style="margin-top: 10px; font-size: 15px; color: #4b5563; font-weight: 600;">
                    검색 결과: <strong id="course-count" style="color: #007dd7; font-size: 18px;">0</strong>개
                </div>
            </div>
    '''

    html = re.sub(r'<div class="search-tab-header">.*?</div>\n            \n            <div class="course-list-container"', search_tab_header_new + '\n            <div class="course-list-container"', html, flags=re.DOTALL)

    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Updated index.html")

if __name__ == "__main__":
    update_html()
