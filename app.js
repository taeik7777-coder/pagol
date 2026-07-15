document.addEventListener('DOMContentLoaded', () => {
    
    // ----------------------------------------
    // 1. Tab Navigation Logic
    // ----------------------------------------
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');

    function switchTab(targetId) {
        // Hide all tabs
        tabContents.forEach(tab => tab.classList.remove('active'));
        // Deactivate all nav items
        navItems.forEach(nav => nav.classList.remove('active'));

        // Show target tab
        const targetTab = document.getElementById(targetId);
        if (targetTab) targetTab.classList.add('active');
        
        // Activate target nav item
        const targetNav = document.querySelector(`.nav-item[data-target="${targetId}"]`);
        if(targetNav) targetNav.classList.add('active');

        // Reset scroll position
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            if(targetId) {
                switchTab(targetId);
            }
        });
    });

    // Logo click goes to home
    document.getElementById('logo-btn').addEventListener('click', (e) => {
        e.preventDefault();
        switchTab('tab-home');
    });

    // Dashboard Grid routing
    const gridCards = document.querySelectorAll('.grid-card');
    gridCards.forEach(card => {
        card.addEventListener('click', () => {
            const target = card.getAttribute('data-tab');
            if(target) switchTab(target);
        });
    });

    // Notification Mock
    document.getElementById('noti-btn').addEventListener('click', () => {
        alert("새로운 알림이 없습니다.");
    });

    // ----------------------------------------
    // 2. Voice Search Mocks
    // ----------------------------------------
    const voiceBtns = document.querySelectorAll('.mic-btn');
    voiceBtns.forEach(btn => {
        // The one in the search tab acts as a normal search if it's the magnifying glass,
        // but let's handle the home mic specifically.
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
        }
    });

    // ----------------------------------------
    // 4. Search Tab Logic (Course Data Rendering)
    // ----------------------------------------
    const courseListContainer = document.getElementById('course-list');
    const searchInput = document.getElementById('course-search-input');
    const courseCount = document.getElementById('course-count');
    const pillBtns = document.querySelectorAll('.pill-btn');
    const searchTabBtn = document.getElementById('voice-search-btn-2');

    // Data from data.js (courseData array)
    let courses = typeof courseData !== 'undefined' ? courseData : [];

    function renderCourseList(query = '') {
        courseListContainer.innerHTML = '';
        
        let filteredCourses = courses;
        
        if (query) {
            const q = query.toLowerCase().replace(/\s+/g, '');
            filteredCourses = courses.filter(course => {
                const nameMatch = course.name.toLowerCase().replace(/\s+/g, '').includes(q);
                const addressMatch = course.address.toLowerCase().replace(/\s+/g, '').includes(q);
                
                // Specific hole logic
                if (q === '36홀') return course.holes >= 36;
                if (q === '18홀') return course.holes === 18;
                
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

        // For performance on mobile, just render top 100 if empty query, 
        // or all if filtered
        const limit = query ? filteredCourses.length : Math.min(filteredCourses.length, 100);

        for (let i = 0; i < limit; i++) {
            const course = filteredCourses[i];
            const div = document.createElement('div');
            div.className = 'list-item-card';
            
            const holesText = course.holes ? `${course.holes}홀` : '정보없음';
            
            div.innerHTML = `
                <div class="list-item-header">
                    <div class="list-item-title">${course.name}</div>
                    <div class="list-item-holes">${holesText}</div>
                </div>
                <div class="list-item-address">
                    <i class="fas fa-map-marker-alt"></i> ${course.address}
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
        
        // If not matching any tag, but string is empty, activate "전체보기"
        if (activeTag === '') {
            pillBtns[0].classList.add('active');
        }
    }

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        // Turn off all pills if user is typing custom text
        updatePillTags(null); 
        if (query === '') {
            updatePillTags('');
        }
        renderCourseList(query);
    });

    searchTabBtn.addEventListener('click', () => {
        renderCourseList(searchInput.value.trim());
    });

    pillBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tagText = e.target.getAttribute('data-tag');
            updatePillTags(tagText);
            
            if (tagText === "") {
                searchInput.value = "";
            } else {
                searchInput.value = tagText;
            }
            renderCourseList(tagText);
        });
    });

    // Initial render of search list
    renderCourseList('');
});
