document.addEventListener('DOMContentLoaded', () => {
    
    // ----------------------------------------
    // 1. Tab Navigation Logic
    // ----------------------------------------
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');

    function switchTab(targetId) {
        tabContents.forEach(tab => tab.classList.remove('active'));
        navItems.forEach(nav => nav.classList.remove('active'));

        const targetTab = document.getElementById(targetId);
        if (targetTab) targetTab.classList.add('active');
        
        const targetNav = document.querySelector(`.nav-item[data-target="${targetId}"]`);
        if(targetNav) targetNav.classList.add('active');

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            if(targetId) switchTab(targetId);
        });
    });

    document.getElementById('logo-btn').addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('tab-home');
    });

    const gridCards = document.querySelectorAll('.grid-card');
    gridCards.forEach(card => {
        card.addEventListener('click', () => {
            const target = card.getAttribute('data-tab');
            if(target) switchTab(target);
        });
    });

    document.getElementById('noti-btn').addEventListener('click', () => {
        alert("새로운 알림이 없습니다.");
    });

    // ----------------------------------------
    // 2. Voice Search Mocks
    // ----------------------------------------
    const voiceBtns = document.querySelectorAll('.mic-btn');
    voiceBtns.forEach(btn => {
        if(btn.id === 'voice-search-btn') {
            btn.addEventListener('click', () => {
                alert("🎤 마이크 권한을 허용해주세요! (음성 검색 기능은 추후 지원 예정입니다.)");
            });
        }
    });

    // ----------------------------------------
    // 3. Home Search Logic
    // ----------------------------------------
    const homeSearchInput = document.getElementById('home-search-input');
    
    homeSearchInput.addEventListener('keydown', (e) => {
        if(e.key === 'Enter') {
            const query = homeSearchInput.value.trim();
            switchTab('tab-search');
            searchInput.value = query;
            renderCourseList(query);
            updatePillTags(query);
            updateMapActive(query);
        }
    });

    // ----------------------------------------
    // 4. Search Tab Logic & Data Rendering
    // ----------------------------------------
    const courseListContainer = document.getElementById('course-list');
    const searchInput = document.getElementById('course-search-input');
    const courseCount = document.getElementById('course-count');
    const pillBtns = document.querySelectorAll('.pill-btn');
    const searchTabBtn = document.getElementById('voice-search-btn-2');
    const mapPaths = document.querySelectorAll('.map-svg-path');
    
    // Create a floating label for the map
    const mapContainer = document.querySelector('.korea-map-container');
    const floatingLabel = document.createElement('div');
    floatingLabel.className = 'region-label-overlay';
    if(mapContainer) mapContainer.appendChild(floatingLabel);

    let courses = typeof courseData !== 'undefined' ? courseData : [];

    function renderCourseList(query = '') {
        courseListContainer.innerHTML = '';
        
        let filteredCourses = courses;
        
        if (query) {
            const q = query.toLowerCase().replace(/\s+/g, '');
            filteredCourses = courses.filter(course => {
                const nameMatch = course.name.toLowerCase().replace(/\s+/g, '').includes(q);
                const addressMatch = course.address.toLowerCase().replace(/\s+/g, '').includes(q);
                
                if (q === '36홀') return course.holes >= 36;
                if (q === '18홀') return course.holes === 18;
                if (q === '무료') return course.name.includes('무료') || course.fee === '무료';
                
                return nameMatch || addressMatch;
            });
        }

        courseCount.textContent = filteredCourses.length;

        if (filteredCourses.length === 0) {
            courseListContainer.innerHTML = `
                <div style="text-align:center; padding: 60px 20px; color: #9ca3af;">
                    <i class="fas fa-exclamation-circle" style="font-size: 40px; margin-bottom: 16px; color:#d1d5db;"></i>
                    <p style="font-size: 18px;">검색 결과가 없습니다.</p>
                </div>
            `;
            return;
        }

        const fragment = document.createDocumentFragment();
        const limit = query ? filteredCourses.length : Math.min(filteredCourses.length, 100);

        for (let i = 0; i < limit; i++) {
            const course = filteredCourses[i];
            const div = document.createElement('div');
            div.className = 'list-item-card';
            // Click to open detail
            div.addEventListener('click', () => openDetailModal(course));
            
            const holesText = course.holes ? `${course.holes}홀` : '정보없음';
            const imgUrl = course.image || 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=400&auto=format&fit=crop';
            
            div.innerHTML = `
                <img class="list-item-img" src="${imgUrl}" alt="${course.name}" loading="lazy">
                <div class="list-item-content">
                    <div class="list-item-title">${course.name}</div>
                    <div>
                        <span class="list-item-holes">${holesText}</span>
                        <span style="font-size:13px; font-weight:700; color:#ff9800;">⭐ ${course.rating || 0}</span>
                    </div>
                    <div class="list-item-address">
                        <i class="fas fa-map-marker-alt"></i> ${course.address}
                    </div>
                </div>
            `;
            fragment.appendChild(div);
        }

        courseListContainer.appendChild(fragment);
    }

    function updatePillTags(activeTag) {
        pillBtns.forEach(btn => {
            if(btn.getAttribute('data-tag') === activeTag) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        if (!activeTag) pillBtns[0].classList.add('active');
    }

    function updateMapActive(region) {
        let regionFound = false;
        mapPaths.forEach(path => {
            const dataRegion = path.getAttribute('data-region');
            if(dataRegion && dataRegion === region) {
                path.classList.add('active');
                regionFound = true;
                
                // Show floating label
                floatingLabel.textContent = dataRegion;
                floatingLabel.classList.add('show');
            } else {
                path.classList.remove('active');
            }
        });
        
        if(!regionFound) {
            floatingLabel.classList.remove('show');
        }
    }

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        updatePillTags(null);
        updateMapActive(null);
        if (query === '') updatePillTags('');
        renderCourseList(query);
    });

    searchTabBtn.addEventListener('click', () => {
        renderCourseList(searchInput.value.trim());
    });

    pillBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tagText = e.target.getAttribute('data-tag');
            updatePillTags(tagText);
            updateMapActive(null); // Map selection off
            searchInput.value = tagText;
            renderCourseList(tagText);
        });
    });

    mapPaths.forEach(path => {
        path.addEventListener('click', (e) => {
            let region = e.target.getAttribute('data-region');
            if(!region) return;
            
            // Toggle off if already active
            if(e.target.classList.contains('active')) {
                region = '';
            }
            
            updateMapActive(region);
            updatePillTags(null);
            searchInput.value = region;
            renderCourseList(region);
        });
    });

    renderCourseList('');

    // ----------------------------------------
    // 5. Course Detail Modal & Reviews
    // ----------------------------------------
    const modal = document.getElementById('course-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    let currentCourseId = null;

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    function openDetailModal(course) {
        currentCourseId = course.id;
        
        // Populate modal data
        document.getElementById('modal-img').src = course.image || 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=800&auto=format&fit=crop';
        document.getElementById('modal-holes-badge').textContent = course.holes ? `${course.holes}홀` : '정보없음';
        document.getElementById('modal-fee-badge').textContent = course.fee || '정보없음';
        document.getElementById('modal-title').textContent = course.name;
        document.getElementById('modal-address').textContent = course.address;
        
        document.getElementById('modal-score').textContent = course.rating || '0.0';
        document.getElementById('modal-review-count').textContent = course.reviewCount || '0';
        document.getElementById('modal-review-count-2').textContent = course.reviewCount || '0';
        
        document.getElementById('modal-hours').textContent = course.operatingHours || '정보없음';
        document.getElementById('modal-fee').textContent = course.fee || '정보없음';
        document.getElementById('modal-holes').textContent = course.holes ? `${course.holes}홀` : '정보없음';
        document.getElementById('modal-phone').textContent = course.phone || '정보없음';
        
        document.getElementById('modal-closed').textContent = course.closedDays || '정보없음';
        document.getElementById('modal-parking').textContent = course.parking || '정보없음';

        loadReviews(course.id);
        
        // Show modal
        modal.classList.add('active');
        modal.scrollTo(0,0);
    }

    // Favorite Button toggle
    const favBtn = document.querySelector('.favorite-btn');
    favBtn.addEventListener('click', () => {
        const icon = favBtn.querySelector('i');
        favBtn.classList.toggle('active');
        if (favBtn.classList.contains('active')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
        }
    });

    // Review System (Local Storage)
    let selectedStars = 5;
    const starIcons = document.querySelectorAll('#star-selector i');
    
    starIcons.forEach(star => {
        star.addEventListener('click', (e) => {
            selectedStars = parseInt(e.target.getAttribute('data-val'));
            updateStarUI();
        });
    });

    function updateStarUI() {
        starIcons.forEach(star => {
            const val = parseInt(star.getAttribute('data-val'));
            if (val <= selectedStars) {
                star.classList.remove('far');
                star.classList.add('fas', 'active');
            } else {
                star.classList.remove('fas', 'active');
                star.classList.add('far');
            }
        });
    }
    updateStarUI();

    const reviewInput = document.getElementById('review-input');
    const reviewSubmitBtn = document.getElementById('review-submit-btn');

    reviewSubmitBtn.addEventListener('click', () => {
        const text = reviewInput.value.trim();
        if (!text) {
            alert("후기 내용을 입력해주세요.");
            return;
        }

        const newReview = {
            id: Date.now(),
            courseId: currentCourseId,
            user: "파크골퍼" + Math.floor(Math.random()*1000),
            stars: selectedStars,
            text: text,
            date: new Date().toLocaleDateString('ko-KR')
        };

        const existingReviews = JSON.parse(localStorage.getItem('pagol_reviews') || '[]');
        existingReviews.unshift(newReview);
        localStorage.setItem('pagol_reviews', JSON.stringify(existingReviews));

        reviewInput.value = '';
        selectedStars = 5;
        updateStarUI();
        
        // Update local review count logic (dummy)
        const rCount = parseInt(document.getElementById('modal-review-count').textContent) + 1;
        document.getElementById('modal-review-count').textContent = rCount;
        document.getElementById('modal-review-count-2').textContent = rCount;

        loadReviews(currentCourseId);
    });

    function loadReviews(courseId) {
        const reviewList = document.getElementById('review-list');
        const allReviews = JSON.parse(localStorage.getItem('pagol_reviews') || '[]');
        const courseReviews = allReviews.filter(r => r.courseId === courseId);
        
        if (courseReviews.length === 0) {
            reviewList.innerHTML = '<p style="text-align:center; padding: 20px; color:#9ca3af;">첫 번째 후기를 남겨주세요!</p>';
            return;
        }

        reviewList.innerHTML = courseReviews.map(r => `
            <div class="review-item">
                <div class="review-item-header">
                    <span class="review-user">${r.user}</span>
                    <span class="review-stars">${'⭐'.repeat(r.stars)}</span>
                    <span class="review-date">${r.date}</span>
                </div>
                <div class="review-text">${r.text}</div>
            </div>
        `).join('');
    }

});
