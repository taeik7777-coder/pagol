// DOM이 완전히 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. 추천 태그 클릭 시 검색창에 입력
    const tagButtons = document.querySelectorAll('.tag-btn');
    const searchInput = document.getElementById('main-search');

    tagButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tagText = e.target.getAttribute('data-tag');
            searchInput.value = tagText;
            searchInput.focus();
            
            // 약간의 애니메이션 효과 (선택적)
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = 'translateY(-1px)';
            }, 100);
        });
    });

    // 2. 검색 버튼 클릭 또는 엔터 키 입력 시 동작 (임시 Alert)
    const searchBtn = document.querySelector('.search-btn');
    
    const performSearch = () => {
        const query = searchInput.value.trim();
        if(query) {
            alert(`"${query}" (으)로 검색을 수행합니다.\n(추후 백엔드/API 연동 필요)`);
        } else {
            searchInput.focus();
        }
    };

    searchBtn.addEventListener('click', performSearch);
    
    searchInput.addEventListener('keydown', (e) => {
        if(e.key === 'Enter') {
            performSearch();
        }
    });

    // 3. 북마크 버튼 토글
    const bookmarkBtns = document.querySelectorAll('.bookmark-btn');
    
    bookmarkBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); // a 태그의 기본 이동 방지
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
                
                // 북마크 추가 애니메이션 효과
                btn.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    btn.style.transform = '';
                }, 200);
            }
        });
    });

    // 4. 하단 네비게이션 활성화 처리 (퍼블리싱용 임시)
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            // 모든 항목에서 active 제거
            navItems.forEach(nav => nav.classList.remove('active'));
            // 클릭된 항목에 active 추가
            item.classList.add('active');
        });
    });

});
