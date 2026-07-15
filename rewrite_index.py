import re

def main():
    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()

    # Extract SVG
    svg_start = html.find('<svg viewBox="-5 -5 710 730" class="interactive-korea-map"')
    svg_end = html.find('</svg>', svg_start) + 6
    if svg_start == -1 or svg_end < 6:
        print("Could not find SVG")
        return
    svg_content = html[svg_start:svg_end]

    # Create new index.html content
    new_html = f'''<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>파크골프 커뮤니티 - PAGOL</title>
    
    <!-- Fonts & Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css" />
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="./style.css">
</head>
<body>

    <!-- Header -->
    <header class="glass-header">
        <div class="header-content">
            <a href="#" class="logo" id="logo-btn">
                <div class="logo-icon">
                    <i class="fas fa-golf-ball"></i>
                </div>
                <div class="logo-text">
                    <h1>PAGOL</h1>
                    <p>파크골프의 모든 것</p>
                </div>
            </a>
            <div class="header-actions">
                <button class="icon-btn" aria-label="알림" id="noti-btn">
                    <i class="far fa-bell"></i>
                    <span class="badge">N</span>
                </button>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="main-container">
        
        <!-- =======================
             TAB 1: HOME (Dashboard)
        ======================== -->
        <div id="tab-home" class="tab-content active">
            
            <div class="home-greeting">
                <h2>안녕하세요!<br>오늘은 <span>어디로 갈까요?</span></h2>
                <p>7월 15일 수요일, 날씨가 참 좋아요 ☀️</p>
            </div>

            <!-- Big Search Bar -->
            <div class="search-wrapper-big">
                <div class="search-box">
                    <input type="text" id="home-search-input" placeholder="구장명이나 지역을 입력하세요..." autocomplete="off">
                    <button class="mic-btn" id="voice-search-btn" aria-label="음성검색">
                        <i class="fas fa-microphone"></i>
                    </button>
                </div>
            </div>

            <!-- Huge Dashboard Grid -->
            <div class="dashboard-grid">
                <div class="grid-card blue" data-tab="tab-search">
                    <div class="grid-icon"><i class="fas fa-map-marked-alt"></i></div>
                    <h3>구장 찾기</h3>
                </div>
                <div class="grid-card orange" data-tab="tab-community">
                    <div class="grid-icon"><i class="fas fa-users"></i></div>
                    <h3>우리동네<br>동호회</h3>
                </div>
                <div class="grid-card pink" data-tab="tab-ranking">
                    <div class="grid-icon"><i class="fas fa-trophy"></i></div>
                    <h3>대회 소식</h3>
                </div>
                <div class="grid-card green" data-tab="tab-my">
                    <div class="grid-icon"><i class="fas fa-book-open"></i></div>
                    <h3>초보자 가이드</h3>
                </div>
            </div>

            <!-- Home Map Section -->
            <div class="home-map-section" style="padding: 0 20px 30px;">
                <div class="recommend-header" style="font-size:22px; font-weight:900; margin-bottom:4px; display:flex; align-items:center; gap:8px;">
                    <i class="fas fa-map-marked-alt" style="color:var(--color-primary)"></i> 파크골프 지도
                </div>
                <p style="font-size:14px; color:var(--text-secondary); margin-bottom:16px;">전국 570개 구장 · 지역을 클릭하세요</p>
                <div class="korea-map-container" style="background:#f8fafc; border-radius:var(--border-radius-md); padding:16px; border:1px solid #e5e7eb; position:relative;">
                    <div class="korea-map-grid-wrapper">
                        {svg_content.replace('id="kr-', 'id="home-kr-')}
                    </div>
                </div>
                
                <div class="search-results-info" style="margin-top: 24px; font-size: 16px; font-weight: 700;">
                    검색 결과: <strong id="home-course-count" style="color: var(--color-primary); font-size: 20px;">0</strong>개
                </div>
                
                <div class="course-list-container" id="home-course-list" style="padding: 16px 0; display:flex; flex-direction:column; gap:16px;">
                    <!-- JS will render max 4 items -->
                </div>
                
                <button id="btn-view-all" style="width:100%; padding:16px; background:var(--bg-surface); border:2px solid #e5e7eb; border-radius:12px; font-size:16px; font-weight:800; color:var(--text-secondary); cursor:pointer; margin-top:8px;">
                    전체보기 <i class="fas fa-chevron-right" style="margin-left:4px; font-size:14px;"></i>
                </button>
            </div>

        </div>

        <!-- =======================
             TAB 2: SEARCH (구장검색)
        ======================== -->
        <div id="tab-search" class="tab-content">
            <div class="search-tab-header">
                <h2 style="font-size: 22px; font-weight: 800; margin-bottom: 16px;">구장검색</h2>
                
                <div class="search-box" style="margin-bottom: 20px;">
                    <input type="text" id="course-search-input" placeholder="이름이나 주소로 검색..." autocomplete="off">
                    <button class="mic-btn" id="voice-search-btn-2" style="width: 44px; height: 44px; border-radius: 12px; font-size: 18px;">
                        <i class="fas fa-search"></i>
                    </button>
                </div>

                <div class="korea-map-container" style="background:#f8fafc; border-radius:var(--border-radius-md); padding:16px; border:1px solid #e5e7eb; margin-bottom: 20px; position:relative;">
                    <div class="korea-map-grid-wrapper">
                        {svg_content}
                    </div>
                </div>

                <!-- Swipeable Region Tiles -->
                <div class="region-scroll-x" id="search-region-tiles" style="display:flex; gap:10px; overflow-x:auto; padding-bottom:10px; scrollbar-width:none; -ms-overflow-style:none;">
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
                
                <!-- Big Pill Tags for Options -->
                <div class="pill-tags" id="quick-tags" style="margin-top: 16px;">
                    <button class="pill-btn" data-tag="무료">무료구장</button>
                    <button class="pill-btn" data-tag="36홀">36홀 이상</button>
                    <button class="pill-btn" data-tag="18홀">18홀</button>
                </div>
                
                <div class="search-results-info" style="margin-top: 10px; font-size: 15px; color: #4b5563; font-weight: 600;">
                    검색 결과: <strong id="course-count" style="color: #007dd7; font-size: 18px;">0</strong>개
                </div>
            </div>
            
            <div class="course-list-container" id="course-list" style="padding: 16px 20px 30px; display: flex; flex-direction: column; gap: 16px;">
                <!-- Javascript will render courses here -->
            </div>
        </div>

        <!-- Spacer for Bottom Nav -->
        <div class="bottom-nav-spacer"></div>
    </main>

    <!-- Bottom Navigation -->
    <nav class="bottom-nav">
        <a href="#" class="nav-item active" data-target="tab-home">
            <i class="fas fa-home"></i>
            <span>홈</span>
        </a>
        <a href="#" class="nav-item search-trigger" data-target="tab-search">
            <i class="fas fa-map-marked-alt"></i>
            <span>구장검색</span>
        </a>
        <a href="#" class="nav-item" data-target="tab-ranking">
            <i class="fas fa-camera"></i>
            <span>사진/영상</span>
        </a>
        <a href="#" class="nav-item" data-target="tab-community">
            <i class="fas fa-comments"></i>
            <span>게시판</span>
        </a>
        <a href="#" class="nav-item" data-target="tab-my">
            <i class="fas fa-user"></i>
            <span>내 정보</span>
        </a>
    </nav>

    <!-- =======================
         COURSE DETAIL MODAL
    ======================== -->
    <div id="course-modal" class="modal-overlay">
        <div class="modal-content">
            <!-- Modal Header (Close button & Image) -->
            <div class="modal-header-img">
                <img id="modal-img" src="" alt="구장 이미지">
                <button class="modal-close-btn" id="modal-close-btn"><i class="fas fa-arrow-left"></i></button>
                <div class="modal-badge-container">
                    <span class="modal-badge blue" id="modal-holes-badge">36홀</span>
                    <span class="modal-badge orange" id="modal-fee-badge">무료</span>
                </div>
            </div>

            <!-- Modal Body -->
            <div class="modal-body">
                <div class="modal-title-row">
                    <div>
                        <h2 id="modal-title">가평파크골프장</h2>
                        <p class="modal-address"><i class="fas fa-map-marker-alt"></i> <span id="modal-address">경기도 가평군</span></p>
                    </div>
                    <button class="favorite-btn"><i class="far fa-heart"></i><br><span>즐겨찾기</span></button>
                </div>

                <div class="rating-summary">
                    <div class="score" id="modal-score">4.3</div>
                    <div class="stars">
                        <i class="fas fa-star text-accent"></i>
                        <i class="fas fa-star text-accent"></i>
                        <i class="fas fa-star text-accent"></i>
                        <i class="fas fa-star text-accent"></i>
                        <i class="fas fa-star-half-alt text-accent"></i>
                    </div>
                    <div class="review-count">리뷰 <span id="modal-review-count">6</span>개</div>
                </div>

                <div class="modal-action-buttons">
                    <button class="action-btn outline"><i class="fas fa-map-marked-alt"></i> 길찾기</button>
                    <button class="action-btn outline"><i class="fas fa-share-alt"></i> 공유하기</button>
                    <button class="action-btn primary"><i class="fas fa-check-circle"></i> 체크인</button>
                </div>

                <!-- 4-Grid Information -->
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-icon"><i class="far fa-clock"></i></div>
                        <span class="info-label">운영시간</span>
                        <strong class="info-value" id="modal-hours">09:00~18:00</strong>
                    </div>
                    <div class="info-item">
                        <div class="info-icon"><i class="fas fa-won-sign"></i></div>
                        <span class="info-label">이용요금</span>
                        <strong class="info-value" id="modal-fee">유료</strong>
                    </div>
                    <div class="info-item">
                        <div class="info-icon"><i class="fas fa-golf-ball"></i></div>
                        <span class="info-label">코스</span>
                        <strong class="info-value" id="modal-holes">36홀</strong>
                    </div>
                    <div class="info-item">
                        <div class="info-icon"><i class="fas fa-phone-alt"></i></div>
                        <span class="info-label">전화</span>
                        <strong class="info-value" id="modal-phone">031-8078-8075</strong>
                    </div>
                </div>

                <!-- Additional Info Boxes -->
                <div class="info-box red-box">
                    <div class="box-icon"><i class="far fa-calendar-times"></i> 휴장일</div>
                    <div class="box-text" id="modal-closed">매주 월요일</div>
                </div>

                <div class="info-box blue-box">
                    <div class="box-icon"><i class="fas fa-parking"></i> 주차 안내</div>
                    <div class="box-text" id="modal-parking">무료주차</div>
                </div>

                <div class="info-box yellow-box">
                    <div class="box-icon"><i class="fas fa-info-circle"></i> 비고</div>
                    <div class="box-text">
                        [이용요금]<br>
                        평일 7천원, 공휴일 9천원 (경로우대자 30% 감경)
                    </div>
                </div>

                <!-- Reviews Section -->
                <div class="review-section">
                    <h3>구장 후기 (<span id="modal-review-count-2">6</span>)</h3>
                    
                    <div class="write-review-box">
                        <div class="write-stars" id="star-selector">
                            <i class="far fa-star" data-val="1"></i>
                            <i class="far fa-star" data-val="2"></i>
                            <i class="far fa-star" data-val="3"></i>
                            <i class="far fa-star" data-val="4"></i>
                            <i class="far fa-star" data-val="5"></i>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <input type="text" id="review-input" placeholder="구장 방문 후기를 남겨주세요!">
                            <button id="review-submit-btn">등록</button>
                        </div>
                    </div>

                    <div class="review-list" id="review-list">
                        <!-- Reviews will be populated by JS -->
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Data & Scripts -->
    <script src="./data.js"></script>
    <script src="./app.js"></script>
</body>
</html>'''

    with open("index.html", "w", encoding="utf-8") as f:
        f.write(new_html)
    print("Re-wrote index.html with new layout")

if __name__ == "__main__":
    main()
