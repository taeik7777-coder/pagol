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
        document.getElementById(targetId).classList.add('active');
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

    // Header search icon goes to search tab
    document.querySelector('.search-trigger').addEventListener('click', () => {
        switchTab('tab-search');
        document.getElementById('course-search-input').focus();
    });

    // ----------------------------------------
    // 2. Home Tab Logic
    // ----------------------------------------
    const homeSearchBtn = document.querySelector('.search-btn');
    const homeSearchInput = document.getElementById('main-search');
    const tagButtons = document.querySelectorAll('.tag-btn');

    tagButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tagText = e.target.getAttribute('data-tag').replace('#', '');
            homeSearchInput.value = tagText;
            
            // Switch to search tab and perform search
            switchTab('tab-search');
            searchInput.value = tagText;
            renderCourseList(tagText);
        });
    });

    homeSearchBtn.addEventListener('click', () => {
        const query = homeSearchInput.value.trim();
        switchTab('tab-search');
        searchInput.value = query;
        renderCourseList(query);
    });

    homeSearchInput.addEventListener('keydown', (e) => {
        if(e.key === 'Enter') {
            const query = homeSearchInput.value.trim();
            switchTab('tab-search');
            searchInput.value = query;
            renderCourseList(query);
        }
    });

    // ----------------------------------------
    // 3. Search Tab Logic (Course Data Rendering)
    // ----------------------------------------
    const courseListContainer = document.getElementById('course-list');
    const searchInput = document.getElementById('course-search-input');
    const clearBtn = document.getElementById('clear-search');
    const courseCount = document.getElementById('course-count');

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
                return nameMatch || addressMatch;
            });
        }

        courseCount.textContent = filteredCourses.length;

        if (filteredCourses.length === 0) {
            courseListContainer.innerHTML = `
                <div style="text-align:center; padding: 40px 20px; color: #9ca3af;">
                    <i class="fas fa-exclamation-circle" style="font-size: 32px; margin-bottom: 12px; color:#d1d5db;"></i>
                    <p>검색 결과가 없습니다.</p>
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

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        if(query.length > 0) {
            clearBtn.style.display = 'block';
        } else {
            clearBtn.style.display = 'none';
        }
        // Debounce render if necessary, but array filter is fast enough for <1000 items
        renderCourseList(query);
    });

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        searchInput.focus();
        renderCourseList('');
    });

    // ----------------------------------------
    // 4. Utilities
    // ----------------------------------------
    const bookmarkBtns = document.querySelectorAll('.bookmark-btn');
    bookmarkBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); 
            e.stopPropagation();
            const icon = btn.querySelector('i');
            
            if (btn.classList.contains('active')) {
                btn.classList.remove('active');
                icon.classList.remove('fas');
                icon.classList.add('far');
            } else {
                btn.classList.add('active');
                icon.classList.remove('far');
                icon.classList.add('fas');
                btn.style.transform = 'scale(1.2)';
                setTimeout(() => { btn.style.transform = ''; }, 200);
            }
        });
    });

    // Initial render of search list
    renderCourseList('');
});
