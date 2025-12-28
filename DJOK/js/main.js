document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');

            // Hamburger animation
            const spans = menuToggle.querySelectorAll('span');
            // Check if active and animate (simple implementation for now)
        });

        // Close menu when clicking a link
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');
            });
        });
    }

    // Scroll Header Styling
    const header = document.querySelector('.site-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.5)';
        } else {
            header.style.boxShadow = 'none';
        }
    });

    // Google Sheets Integration (Antigravity Automation)
    const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1JKRXcBRaEZ49iyKoRO92WKUnviijkFLwMBY66mlPd1U/export?format=csv';

    const eventsList = document.querySelector('.events-list');

    async function fetchEvents() {
        if (!eventsList) return;

        eventsList.innerHTML = '<p style="text-align: center; width: 100%; color: var(--text-muted); padding: 2rem;">Načítám čerstvá data z kalendáře...</p>';

        try {
            // Add a timestamp to bypass browser cache
            const cacheBuster = `&t=${Date.now()}`;
            const response = await fetch(SHEET_URL + cacheBuster);
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

            const csvData = await response.text();
            if (!csvData || csvData.length < 10) throw new Error('Obdržená data jsou prázdná nebo neúplná.');

            const events = parseCSV(csvData);

            console.log('✅ Kalendář: Načteno ' + events.length + ' akcí z Google Sheets.');
            renderEvents(events);
        } catch (error) {
            console.error('❌ Chyba při načítání kalendáře:', error);

            let errorMessage = 'Nepovedlo se připojit k Google tabulce.';
            if (window.location.protocol === 'file:') {
                errorMessage = 'Prohlížeč blokuje načítání tabulky při otevírání souboru přímo z disku (CORS). Po nahrání na hosting to bude fungovat OK.';
            }

            if (window.calendarEvents) {
                console.log('🔄 Kalendář: Používám záložní data ze souboru.');
                renderEvents(window.calendarEvents);
            } else {
                eventsList.innerHTML = `
                    <div style="text-align: center; padding: 2rem; border: 1px dashed #ff3366; border-radius: 12px; grid-column: 1 / -1;">
                        <p style="color: #ff3366; font-weight: bold; margin-bottom: 2rem;">⚠️ Kalendář se nepodařilo načíst online</p>
                        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 2rem;">${errorMessage}</p>
                        <p style="font-size: 0.8rem; color: #777;">Detail chyby: ${error.message}</p>
                    </div>
                `;
            }
        }
    }

    function parseCSV(csv) {
        console.log('📄 Raw CSV Data:', csv);
        const lines = csv.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) return [];

        // Determine separator (comma or semicolon)
        const firstLine = lines[0];
        const separator = firstLine.includes(';') ? ';' : ',';
        console.log('🔍 Detected separator:', separator);

        const headers = firstLine.split(separator).map(h => h.trim().replace(/^"|"$/g, ''));

        return lines.slice(1).map(line => {
            const values = line.split(separator).map(v => v.trim().replace(/^"|"$/g, ''));
            const event = {};
            headers.forEach((header, i) => {
                if (header) event[header] = values[i] || '';
            });
            return event;
        });
    }

    function renderEvents(data) {
        if (!data || !Array.isArray(data)) return;

        const now = new Date();
        const upcoming = data.filter(e => e.isoDate && new Date(e.isoDate) >= now).sort((a, b) => new Date(a.isoDate) - new Date(b.isoDate));
        const past = data.filter(e => e.isoDate && new Date(e.isoDate) < now).sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate));

        let html = '';

        if (upcoming.length > 0) {
            html += '<h3 class="event-divider">Nadcházející</h3>';
            upcoming.forEach(event => html += createEventHTML(event));
        }

        if (past.length > 0) {
            html += '<h3 class="event-divider past">Archiv</h3>';
            past.slice(0, 3).forEach(event => html += createEventHTML(event, true));
        }

        if (html === '') {
            html = '<p style="text-align: center; width: 100%; color: var(--text-muted); padding: 2rem;">Žádné akce k zobrazení.</p>';
        }

        eventsList.innerHTML = html;
    }

    function createEventHTML(event, isPast = false) {
        return `
            <div class="event-item ${isPast ? 'archived' : ''}">
                <div class="event-date">
                    <span class="day">${event.day || '??'}</span>
                    <span class="month">${event.month || '...'}</span>
                </div>
                <div class="event-info">
                    <h3 class="event-name">${event.name || 'Neoznačená akce'}</h3>
                    <p class="event-venue">${event.venue || 'Místo neurčeno'}</p>
                </div>
                <div class="event-type">
                    <span class="status-tag ${event.status?.toLowerCase() || ''}">${event.type || 'Akce'}</span>
                </div>
            </div>
        `;
    }

    fetchEvents();

    // Profile Image Zoom Toggle
    const profileImage = document.querySelector('#profile-image');
    if (profileImage) {
        profileImage.style.cursor = 'pointer';

        profileImage.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event from bubbling to document
            profileImage.classList.toggle('zoomed');
        });

        // Close zoom when clicking outside the image
        document.addEventListener('click', (e) => {
            if (profileImage.classList.contains('zoomed') && !profileImage.contains(e.target)) {
                profileImage.classList.remove('zoomed');
            }
        });
    }

    // Media Facade Loader (Performance Optimization)
    const mediaItems = document.querySelectorAll('.media-item');
    mediaItems.forEach(item => {
        const link = item.querySelector('.media-link');
        if (link && link.href.includes('instagram.com')) {
            // Instagram is already a direct link, but we could make it an embed if needed
            // For now, let's just add a facade for a hypothetical SoundCloud item
        }
    });
});
