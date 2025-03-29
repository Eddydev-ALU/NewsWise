document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const newsContainer = document.getElementById('news-container');
    const loadingElement = document.getElementById('loading');
    const sectionTitle = document.getElementById('section-title');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const countrySelect = document.getElementById('country-select');
    const languageSelect = document.getElementById('language-select');
    const navButtons = document.querySelectorAll('.nav-btn');
    const topicLinks = document.querySelectorAll('.dropdown-content a');
    const topicsDropdown = document.querySelector('.dropdown');
    
    // App State
    let currentType = 'top-headlines';
    let currentTopic = 'Technology';
    let currentCountry = 'us';
    let currentLanguage = 'en';
    
    // Initialize
    loadNews();
    
    // Event Listeners
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => e.key === 'Enter' && handleSearch());
    
    countrySelect.addEventListener('change', () => {
        currentCountry = countrySelect.value;
        loadNews();
    });
    
    languageSelect.addEventListener('change', () => {
        currentLanguage = languageSelect.value;
        loadNews();
    });
    
    // Toggle dropdown visibility
    document.querySelector('[data-type="topic-headlines"]').addEventListener('click', (e) => {
        e.stopPropagation();
        topicsDropdown.querySelector('.dropdown-content').classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!topicsDropdown.contains(e.target)) {
            const dropdownContent = topicsDropdown.querySelector('.dropdown-content');
            if (dropdownContent.classList.contains('show')) {
                dropdownContent.classList.remove('show');
            }
        }
    });
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentType = this.dataset.type;
            if (currentType !== 'topic-headlines') currentTopic = '';
            sectionTitle.textContent = this.textContent.trim();
            loadNews();
        });
    });
    
    topicLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            currentTopic = this.dataset.topic;
            currentType = 'topic-headlines';
            sectionTitle.textContent = `${this.textContent} News`;
            topicsDropdown.querySelector('.dropdown-content').classList.remove('show');
            
            // Update active button
            navButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.type === 'topic-headlines') {
                    btn.classList.add('active');
                }
            });
            
            loadNews();
        });
    });
    
    // Functions
    function handleSearch() {
        const query = searchInput.value.trim();
        if (!query) return showError('Please enter a search term');
        currentType = 'search';
        sectionTitle.textContent = `Search: ${query}`;
        loadNews(query);
    }
    
    async function loadNews(query = '') {
        showLoading();
        
        try {
            const endpoint = getEndpoint();
            const params = new URLSearchParams({
                country: currentCountry,
                language: currentLanguage
            });
            
            if (currentType === 'search') params.append('q', encodeURIComponent(query));
            if (currentType === 'topic-headlines' && currentTopic) params.append('topic', currentTopic);
            
            //console.log('Fetching:', `${endpoint}?${params.toString()}`);            
            const response = await fetch(`${endpoint}?${params.toString()}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            //console.log('API response:', data);
            
            if (!data.articles || data.articles.length === 0) {
                showNoResults();
                return;
            }
            displayNews(data.articles);
        } catch (error) {
            console.error('Error:', error);
            showError(`Failed to load news: ${error.message}`);
        } finally {
            hideLoading();
        }
    }
    
    function getEndpoint() {
        const baseUrl = 'http://localhost:4000'; 
        switch (currentType) {
            case 'search': return `${baseUrl}/api/search`;
            case 'top-headlines': return `${baseUrl}/api/top-headlines`;
            case 'topic-headlines': return `${baseUrl}/api/topic-headlines`;
            default: return `${baseUrl}/api/top-headlines`;
        }
    }
    
    function displayNews(articles) {
        newsContainer.innerHTML = articles.map(article => `
            <div class="news-card">
                <img src="${article.thumbnail || 'https://via.placeholder.com/300x180?text=No+Image'}" 
     alt="${article.title || ''}" 
     class="news-image"
     onerror="this.src='https://via.placeholder.com/300x180?text=Image+Not+Available'">
                <div class="news-content">
                    <h3 class="news-title">${article.title || 'No title'}</h3>
                    <p class="news-description">${article.description || 'No description available'}</p>
                    <div class="news-meta">
                        <span class="news-source">${article.source?.name || 'Unknown source'}</span>
                        <span class="news-date">${formatDate(article.date)}</span>
                    </div>
                    <a href="${article.url || '#'}" target="_blank" class="read-more">Read More</a>
                </div>
            </div>
        `).join('');
    }
    
    function formatDate(dateString) {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return '';
        }
    }
    
    function showLoading() {
        loadingElement.style.display = 'block';
        newsContainer.innerHTML = '';
    }
    
    function hideLoading() {
        loadingElement.style.display = 'none';
    }
    
    function showError(message) {
        newsContainer.innerHTML = `
            <div class="error">
                <p>${message}</p>
                <button onclick="window.location.reload()">Try Again</button>
            </div>
        `;
    }
    
    function showNoResults() {
        newsContainer.innerHTML = '<p class="no-results">No articles found</p>';
    }
});