// Replace these with your actual Supabase project credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let globalData = [];
let currentView = 'grid-3';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize date
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
        dateEl.innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    // Theme Toggle Listener
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
        
        // Load saved theme preference
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // Fetch initial data
    fetchArticlesFromSupabase();
    
    // Auto-refresh feed every 30 minutes
    setInterval(fetchArticlesFromSupabase, 30 * 60 * 1000);
});

async function fetchArticlesFromSupabase() {
    try {
        const { data, error } = await supabaseClient
            .from('news_articles')
            .select('*')
            .order('published_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        
        globalData = data || [];
        renderArticles(globalData);
    } catch (err) {
        console.error('Error fetching articles from Supabase:', err);
    }
}

function renderArticles(articles) {
    const feed = document.getElementById('news-feed');
    if (!feed) return;

    feed.innerHTML = '';
    
    if (articles.length === 0) {
        feed.innerHTML = '<p>No articles found.</p>';
        return;
    }

    articles.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        
        const imageUrl = item.image_url ? `<img src="${item.image_url}" alt="News Image">` : '';
        
        card.innerHTML = `
            ${imageUrl}
            <div class="card-content">
                <h3><a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.title}</a></h3>
                <p>${item.summary || ''}</p>
                <div class="meta"><small>${item.source_name || 'Unknown Source'}</small></div>
            </div>
        `;
        feed.appendChild(card);
    });
}

// Modal helper
window.toggleModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
    }
};

// Back to top scroll listener
window.addEventListener('scroll', () => {
    const btp = document.getElementById('back-to-top');
    if (btp) {
        btp.style.display = window.scrollY > 400 ? 'flex' : 'none';
    }
});

function applyView(view) {
    currentView = view;
    const feed = document.getElementById('news-feed');
    if (!feed) return;
    
    // Update grid column layouts based on view state
    if (view === 'grid-1') feed.style.gridTemplateColumns = '1fr';
    else if (view === 'grid-2') feed.style.gridTemplateColumns = 'repeat(2, 1fr)';
    else if (view === 'grid-3') feed.style.gridTemplateColumns = 'repeat(3, 1fr)';
    else if (view === 'grid-4') feed.style.gridTemplateColumns = 'repeat(4, 1fr)';
    else feed.style.gridTemplateColumns = '1fr';
}
