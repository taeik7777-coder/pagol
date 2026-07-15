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
    // 4. Search & Map Logic & Data Rendering
    // ----------------------------------------
    const courseListContainer = document.getElementById('course-list');
    const homeCourseListContainer = document.getElementById('home-course-list');
    const searchInput = document.getElementById('course-search-input');
    const courseCount = document.getElementById('course-count');
    const homeCourseCount = document.getElementById('home-course-count');
    
    const pillBtns = document.querySelectorAll('.pill-btn'); // For both tags and region tiles
    const searchTabBtn = document.getElementById('voice-search-btn-2');
    const mapPaths = document.querySelectorAll('.map-svg-path');
    
    // View All Button
    document.getElementById('btn-view-all').addEventListener('click', () => {
        switchTab('tab-search');
    });

    // Create a floating label for both maps
    const mapContainers = document.querySelectorAll('.korea-map-container');
    const floatingLabels = [];
    mapContainers.forEach(container => {
        const label = document.createElement('div');
        label.className = 'region-label-overlay';
        container.appendChild(label);
        floatingLabels.push(label);
    });

    let courses = typeof courseData !== 'undefined' ? courseData : [];

    // Haversine distance formula
    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        var R = 6371;
        var dLat = deg2rad(lat2-lat1);
        var dLon = deg2rad(lon2-lon1); 
        var a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        return R * c; 
    }
    function deg2rad(deg) { return deg * (Math.PI/180); }

    const btnNearMe = document.getElementById('btn-near-me');
    if (btnNearMe) {
        btnNearMe.addEventListener('click', () => {
            if (navigator.geolocation) {
                btnNearMe.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 탐색중...';
                
                // Use a default coordinate if blocked, but typically asks permission
                navigator.geolocation.getCurrentPosition(position => {
                    const myLat = position.coords.latitude;
                    const myLng = position.coords.longitude;
                    
                    courses.forEach(c => {
                        c.distance = getDistanceFromLatLonInKm(myLat, myLng, c.lat, c.lng);
                    });
                    
                    courses.sort((a, b) => a.distance - b.distance);
                    
                    updateRegionTiles(null);
                    updateMapActive(null);
                    updatePillTags(null);
                    searchInput.value = '';
                    
                    document.querySelectorAll('#search-region-tiles .pill-btn').forEach(b => b.classList.remove('active'));
                    btnNearMe.classList.add('active');
                    btnNearMe.innerHTML = '<i class="fas fa-map-marker-alt"></i> 내 주변';
                    
                    renderCourseList('NEAR_ME');
                }, error => {
                    alert('위치 정보를 가져올 수 없습니다. 브라우저 설정을 확인해주세요.');
                    btnNearMe.innerHTML = '<i class="fas fa-map-marker-alt"></i> 내 주변';
                }, { timeout: 10000 });
            } else {
                alert('위치 정보를 지원하지 않는 브라우저입니다.');
            }
        });
    }

    function renderCourseList(query = '') {
        courseListContainer.innerHTML = '';
        homeCourseListContainer.innerHTML = '';
        
        let filteredCourses = [...courses];
        
        if (query === 'NEAR_ME') {
            // Already sorted by distance
        } else if (query) {
            const q = query.toLowerCase().replace(/\s+/g, '');
            const regionSynonyms = {
                '충북': ['충북', '충청북도'], '충남': ['충남', '충청남도'],
                '전북': ['전북', '전라북도'], '전남': ['전남', '전라남도'],
                '경북': ['경북', '경상북도'], '경남': ['경남', '경상남도'],
                '서울': ['서울', '서울특별시'], '부산': ['부산', '부산광역시'],
                '대구': ['대구', '대구광역시'], '인천': ['인천', '인천광역시'],
                '광주': ['광주', '광주광역시'], '대전': ['대전', '대전광역시'],
                '울산': ['울산', '울산광역시'], '세종': ['세종', '세종특별자치시'],
                '제주': ['제주', '제주특별자치도'], '경기': ['경기', '경기도'],
                '강원': ['강원', '강원특별자치도', '강원도']
            };
            
            const targetRegions = regionSynonyms[query] || [q];

            filteredCourses = courses.filter(course => {
                const nameMatch = course.name.toLowerCase().replace(/\s+/g, '').includes(q);
                let addressMatch = false;
                for (let r of targetRegions) {
                    if (course.address.toLowerCase().replace(/\s+/g, '').includes(r)) {
                        addressMatch = true;
                        break;
                    }
                }
                
                if (q === '36홀') return course.holes >= 36;
                if (q === '18홀') return course.holes === 18;
                if (q === '무료') return course.name.includes('무료') || course.fee === '무료';
                
                return nameMatch || addressMatch;
            });
        }

        courseCount.textContent = filteredCourses.length;
        homeCourseCount.textContent = filteredCourses.length;

        if (filteredCourses.length === 0) {
            const noDataHtml = `
                <div style="text-align:center; padding: 60px 20px; color: #9ca3af;">
                    <i class="fas fa-exclamation-circle" style="font-size: 40px; margin-bottom: 16px; color:#d1d5db;"></i>
                    <p style="font-size: 18px;">검색 결과가 없습니다.</p>
                </div>
            `;
            courseListContainer.innerHTML = noDataHtml;
            homeCourseListContainer.innerHTML = noDataHtml;
            return;
        }

        const fragmentSearch = document.createDocumentFragment();
        const fragmentHome = document.createDocumentFragment();
        
        const limitSearch = query ? filteredCourses.length : Math.min(filteredCourses.length, 100);
        const limitHome = Math.min(filteredCourses.length, 4); // Max 4 for Home

        for (let i = 0; i < limitSearch; i++) {
            const course = filteredCourses[i];
            
            const div = document.createElement('div');
            div.className = 'list-item-card';
            div.addEventListener('click', () => openDetailModal(course));
            
            const holesText = course.holes ? `${course.holes}홀` : '정보없음';
            const imgUrl = course.image || 'https://picsum.photos/seed/fallback/400/300';
            const distText = course.distance ? `<span style="color:#4caf50; font-weight:700; font-size:12px; margin-left:6px;"><i class="fas fa-location-arrow"></i> ${course.distance.toFixed(1)}km</span>` : '';
            
            div.innerHTML = `
                <img class="list-item-img" src="${imgUrl}" alt="${course.name}" loading="lazy">
                <div class="list-item-content">
                    <div class="list-item-title">${course.name}</div>
                    <div>
                        <span class="list-item-holes">${holesText}</span>
                        <span style="font-size:13px; font-weight:700; color:#ff9800;">⭐ ${course.rating || 0}</span>
                        ${distText}
                    </div>
                    <div class="list-item-address">
                        <i class="fas fa-map-marker-alt"></i> ${course.address}
                    </div>
                </div>
            `;
            
            fragmentSearch.appendChild(div);
            
            if (i < limitHome) {
                // Clone for home to avoid reference issues
                const divClone = div.cloneNode(true);
                divClone.addEventListener('click', () => openDetailModal(course));
                fragmentHome.appendChild(divClone);
            }
        }

        courseListContainer.appendChild(fragmentSearch);
        homeCourseListContainer.appendChild(fragmentHome);
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
            } else {
                path.classList.remove('active');
            }
        });
        
        floatingLabels.forEach(label => {
            if (regionFound && region) {
                label.textContent = region;
                label.classList.add('show');
            } else {
                label.classList.remove('show');
            }
        });
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

    function updateRegionTiles(region) {
        document.querySelectorAll('#search-region-tiles .pill-btn').forEach(btn => {
            if(btn.getAttribute('data-region') === (region || '')) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    pillBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tagText = e.target.getAttribute('data-tag');
            const regionText = e.target.getAttribute('data-region');
            
            if (tagText !== null) {
                updatePillTags(tagText);
                updateMapActive(null);
                updateRegionTiles(null);
                searchInput.value = tagText;
                renderCourseList(tagText);
            } else if (regionText !== null) {
                updateRegionTiles(regionText);
                updateMapActive(regionText);
                updatePillTags(null);
                searchInput.value = regionText;
                renderCourseList(regionText);
            }
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
            updateRegionTiles(region);
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
