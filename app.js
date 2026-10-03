(() => {
    const backend = window.crikipediaBackend || { configured: false, client: null };
    const supabase = backend.client;
    const unavailable = 'N/A';
    const storageKey = 'crikipedia-favourites';
    const formats = ['Test', 'ODI', 'T20I'];
    const flags = { India: '🇮🇳' };
    const fallbackPlayers = [
        { id: 'sachin-tendulkar', name: 'Sachin Tendulkar', initials: 'ST', imagePage: 'Sachin_Tendulkar', search: 'sachin tendulkar master blaster batter mumbai india', role: 'Top-order batter', roleType: 'batter', country: 'India', birth: '24 April 1973', batting: 'Right-handed', bowling: 'Leg break, off break and medium pace', source: 'https://en.wikipedia.org/wiki/Sachin_Tendulkar', careerRuns: 34357, featured: [['100', 'International centuries'], ['34,357', 'International runs']], battingStats: { Test: { matches: 200, innings: 329, runs: 15921, highest: '248*', average: 53.78, strikeRate: 54.08, hundreds: 51, fifties: 68 }, ODI: { matches: 463, innings: 452, runs: 18426, highest: '200*', average: 44.83, strikeRate: 86.23, hundreds: 49, fifties: 96 }, T20I: { matches: 1, innings: 1, runs: 10, highest: '10', average: 10, strikeRate: 83.33, hundreds: 0, fifties: 0 } } },
        { id: 'virat-kohli', name: 'Virat Kohli', initials: 'VK', imagePage: 'Virat_Kohli', search: 'virat kohli batter captain delhi modern era india', role: 'Top-order batter', roleType: 'batter', country: 'India', birth: '5 November 1988', batting: 'Right-handed', bowling: 'Right-arm medium', asOf: '28 September 2026', source: 'https://en.wikipedia.org/wiki/Virat_Kohli', careerRuns: 28498, featured: [['86', 'International centuries'], ['28,498', 'International runs']], battingStats: { Test: { matches: 123, runs: 9230, highest: '254*', average: 46.85, hundreds: 30, fifties: 31 }, ODI: { matches: 315, runs: 15080, highest: '183', average: 59.13, hundreds: 55, fifties: 79 }, T20I: { matches: 125, runs: 4188, highest: '122*', average: 48.69, hundreds: 1, fifties: 38 } } },
        { id: 'ms-dhoni', name: 'MS Dhoni', initials: 'MS', imagePage: 'MS_Dhoni', search: 'ms dhoni mahendra singh wicketkeeper captain ranchi india', role: 'Wicketkeeper-batter', roleType: 'batter', country: 'India', batting: 'Right-handed', bowling: 'Right-arm medium', source: 'https://en.wikipedia.org/wiki/MS_Dhoni' },
        { id: 'mithali-raj', name: 'Mithali Raj', initials: 'MR', imagePage: 'Mithali_Raj', search: 'mithali raj batter captain womens cricket india', role: 'Batter', roleType: 'batter', country: 'India', batting: 'Right-handed', source: 'https://en.wikipedia.org/wiki/Mithali_Raj' },
        { id: 'jhulan-goswami', name: 'Jhulan Goswami', initials: 'JG', imagePage: 'Jhulan_Goswami', search: 'jhulan goswami fast bowler womens cricket india', role: 'Fast bowler', roleType: 'bowler', country: 'India', bowling: 'Right-arm medium-fast', source: 'https://en.wikipedia.org/wiki/Jhulan_Goswami' },
        { id: 'anil-kumble', name: 'Anil Kumble', initials: 'AK', imagePage: 'Anil_Kumble', search: 'anil kumble bowler spinner india', role: 'Bowler', roleType: 'bowler', country: 'India', birth: '17 October 1970', batting: 'Right-handed', bowling: 'Right-arm leg break', asOf: 'Career ended 2008', source: 'https://en.wikipedia.org/wiki/Anil_Kumble', careerWickets: 956, featured: [['956', 'International wickets'], ['10/74', 'Best Test innings']], bowlingStats: { Test: { matches: 132, runs: 2506, highest: '110*', average: 17.77, hundreds: 1, fifties: 5, wickets: 619, best: '10/74', bowlingAverage: 29.65, economy: 2.69, bowlingStrikeRate: 65.99, fiveWickets: 35, tenWickets: 8 }, ODI: { matches: 271, runs: 938, highest: '26', average: 10.53, wickets: 337, best: '6/12', bowlingAverage: 30.89, economy: 4.30, bowlingStrikeRate: 43.02, fiveWickets: 2, tenWickets: 0 } } },
        { id: 'kapil-dev', name: 'Kapil Dev', initials: 'KD', imagePage: 'Kapil_Dev', search: 'kapil dev all-rounder captain 1983 world cup india', role: 'All-rounder', roleType: 'allrounder', country: 'India', batting: 'Right-handed', bowling: 'Right-arm fast', source: 'https://en.wikipedia.org/wiki/Kapil_Dev' },
        { id: 'rohit-sharma', name: 'Rohit Sharma', initials: 'RS', imagePage: 'Rohit_Sharma', search: 'rohit sharma batter captain mumbai india', role: 'Opening batter', roleType: 'batter', country: 'India', batting: 'Right-handed', bowling: 'Right-arm off break', source: 'https://en.wikipedia.org/wiki/Rohit_Sharma' },
        { id: 'rahul-dravid', name: 'Rahul Dravid', initials: 'RD', imagePage: 'Rahul_Dravid', search: 'rahul dravid batter coach wall bengaluru india', role: 'Batter', roleType: 'batter', country: 'India', batting: 'Right-handed', source: 'https://en.wikipedia.org/wiki/Rahul_Dravid' },
        { id: 'smriti-mandhana', name: 'Smriti Mandhana', initials: 'SM', imagePage: 'Smriti_Mandhana', search: 'smriti mandhana batter womens cricket india', role: 'Opening batter', roleType: 'batter', country: 'India', batting: 'Left-handed', source: 'https://en.wikipedia.org/wiki/Smriti_Mandhana' }
    ];

    let players = [...fallbackPlayers];
    let currentSession = null;
    let currentProfile = null;
    let favoriteIds = readLocalFavorites();
    const playerBySlug = () => new Map(players.map((player) => [player.id, player]));
    const $ = (selector) => document.querySelector(selector);
    const playerGrid = $('#player-grid');
    const favoriteGrid = $('#favourite-grid');
    const noResults = $('#no-results');
    const profileDialog = $('#profile-dialog');
    const profileContent = $('#profile-content');
    const profileFavorite = $('#profile-favourite');
    const authDialog = $('#auth-dialog');
    const authMessage = $('#auth-message');
    const authForm = $('#auth-form');
    const profileForm = $('#profile-form');
    const authButton = $('#auth-button');
    const logoutButton = $('#logout-button');
    const adminLink = $('#admin-link');
    const countryFilter = $('#player-country');
    const roleFilter = $('#player-role');
    const sortFilter = $('#player-sort');
    const backendStatus = $('#backend-status');

    function readLocalFavorites() {
        try {
            const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
            return Array.isArray(stored) ? [...new Set(stored.filter((id) => typeof id === 'string'))] : [];
        } catch {
            return [];
        }
    }

    function saveLocalFavorites() {
        try {
            localStorage.setItem(storageKey, JSON.stringify(favoriteIds));
        } catch {
            showBackendStatus('Browser storage is unavailable; favourites will not persist after refresh.', true);
        }
    }

    function showBackendStatus(message, isError = false) {
        if (!backendStatus) return;
        backendStatus.textContent = message;
        backendStatus.hidden = !message;
        backendStatus.classList.toggle('is-error', isError);
    }

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
    }

    function renderFilters() {
        if (!countryFilter || !roleFilter) return;
        const countries = [...new Set(players.map((player) => player.country).filter(Boolean))].sort();
        const roles = [...new Set(players.map((player) => player.role).filter(Boolean))].sort();
        countryFilter.innerHTML = '<option value="">All countries</option>' + countries.map((country) => `<option value="${escapeHtml(country)}">${escapeHtml(country)}</option>`).join('');
        roleFilter.innerHTML = '<option value="">All roles</option>' + roles.map((role) => `<option value="${escapeHtml(role)}">${escapeHtml(role)}</option>`).join('');
    }

    function renderDirectory() {
        const query = ($('#player-search')?.value || '').trim().toLowerCase();
        const country = countryFilter?.value || '';
        const role = roleFilter?.value || '';
        const sort = sortFilter?.value || 'name';
        const visible = players.filter((player) => {
            const matchesQuery = `${player.name} ${player.country} ${player.role} ${player.batting || ''} ${player.bowling || ''}`.toLowerCase().includes(query);
            return matchesQuery && (!country || player.country === country) && (!role || player.role === role);
        });
        visible.sort((left, right) => {
            if (sort === 'runs') return (right.careerRuns ?? -1) - (left.careerRuns ?? -1) || left.name.localeCompare(right.name);
            if (sort === 'wickets') return (right.careerWickets ?? -1) - (left.careerWickets ?? -1) || left.name.localeCompare(right.name);
            return left.name.localeCompare(right.name);
        });
        playerGrid.innerHTML = visible.map((player) => `
            <article class="player" data-player-id="${escapeHtml(player.id)}">
                <div class="player-photo-frame"><span class="photo-fallback" aria-hidden="true">${escapeHtml(player.initials)}</span><img class="player-photo" data-image-page="${escapeHtml(player.imagePage || '')}" data-image-url="${escapeHtml(player.imageUrl || '')}" alt="${escapeHtml(player.name)}" style="--portrait-position:${escapeHtml(player.imagePosition || 'center 18%')}" loading="lazy"></div>
                <div class="player-info"><div class="player-info-copy"><h3>${escapeHtml(player.name)}</h3><p>${escapeHtml(player.flag || flags[player.country] || '')} ${escapeHtml(player.country || unavailable)} · ${escapeHtml(player.role || unavailable)}</p></div><button class="favourite-toggle" type="button" data-favourite-id="${escapeHtml(player.id)}" aria-label="Add ${escapeHtml(player.name)} to favourites" aria-pressed="false"><span aria-hidden="true">♡</span></button></div>
                <div class="player-actions"><button class="player-action" type="button" data-profile-id="${escapeHtml(player.id)}">View Profile</button><a class="player-action" href="${escapeHtml(player.source || '#sources')}" target="_blank" rel="noopener noreferrer">Biography ↗</a></div>
            </article>`).join('');
        noResults.style.display = visible.length ? 'none' : 'block';
        playerGrid.querySelectorAll('.player-photo-frame img').forEach(loadPlayerImage);
        syncFavoriteControls();
    }

    async function loadPlayerImage(image) {
        const finish = () => {
            image.classList.add('is-loaded');
            image.previousElementSibling?.setAttribute('hidden', '');
        };
        image.addEventListener('load', finish, { once: true });
        image.addEventListener('error', () => { image.hidden = true; }, { once: true });
        if (image.dataset.imageUrl) {
            image.src = image.dataset.imageUrl;
            return;
        }
        if (!image.dataset.imagePage) return;
        if (image.dataset.resolvedSrc) {
            image.src = image.dataset.resolvedSrc;
            return;
        }
        try {
            const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(image.dataset.imagePage)}&prop=pageimages&format=json&pithumbsize=800&origin=*`);
            if (!response.ok) throw new Error('Portrait request failed');
            const result = await response.json();
            const article = Object.values(result.query.pages || {})[0];
            const source = article?.thumbnail?.source;
            if (!source) return;
            image.dataset.resolvedSrc = source;
            image.src = source;
        } catch {
            image.hidden = true;
        }
    }

    function syncFavoriteControls() {
        document.querySelectorAll('[data-favourite-id]').forEach((button) => {
            const slug = button.dataset.favouriteId;
            const isFavorite = favoriteIds.includes(slug);
            button.setAttribute('aria-pressed', String(isFavorite));
            if (button.classList.contains('favourite-toggle')) {
                const player = playerBySlug().get(slug);
                button.setAttribute('aria-label', `${isFavorite ? 'Remove' : 'Add'} ${player?.name || 'player'} ${isFavorite ? 'from' : 'to'} favourites`);
                button.innerHTML = `<span aria-hidden="true">${isFavorite ? '♥' : '♡'}</span>`;
            } else {
                button.textContent = isFavorite ? 'Remove favourite' : 'Add favourite';
            }
        });
    }

    function renderFavorites() {
        const directory = playerBySlug();
        const favorites = favoriteIds.map((id) => directory.get(id)).filter(Boolean);
        favoriteGrid.dataset.count = String(favorites.length);
        if (!favorites.length) {
            favoriteGrid.innerHTML = '<div class="favourite-empty"><div class="empty-heart" aria-hidden="true">♡</div><h3>You haven\'t added any favourite cricketers yet.</h3><p>Choose a player from the directory to start your list.</p><button class="player-action" type="button" data-browse-players>Browse players</button></div>';
            return;
        }
        favoriteGrid.innerHTML = favorites.map((player) => `
            <article class="favourite-card" data-favourite-card="${escapeHtml(player.id)}">
                <div class="favourite-photo"><span class="photo-fallback" aria-hidden="true">${escapeHtml(player.initials)}</span><img data-image-page="${escapeHtml(player.imagePage || '')}" data-image-url="${escapeHtml(player.imageUrl || '')}" alt="${escapeHtml(player.name)}" style="--portrait-position:${escapeHtml(player.imagePosition || 'center 18%')}" loading="lazy"></div>
                <div class="favourite-details"><span class="favourite-role">${escapeHtml(player.flag || flags[player.country] || '')} ${escapeHtml(player.country || unavailable)} · ${escapeHtml(player.role || unavailable)}</span>
                    <div class="favourite-card-heading"><h3>${escapeHtml(player.name)}</h3><button class="favourite-toggle" type="button" data-favourite-id="${escapeHtml(player.id)}" aria-label="Remove ${escapeHtml(player.name)} from favourites" aria-pressed="true"><span aria-hidden="true">♥</span></button></div>
                    <p class="favourite-team">Batting: ${escapeHtml(player.batting || unavailable)}<br>Bowling: ${escapeHtml(player.bowling || unavailable)}</p>
                    ${featuredMarkup(player)}
                    <div class="player-actions"><button class="player-action" type="button" data-profile-id="${escapeHtml(player.id)}">View Profile</button><button class="player-action" type="button" data-favourite-id="${escapeHtml(player.id)}" aria-pressed="true">Remove Favourite</button></div>
                </div>
            </article>`).join('');
        favoriteGrid.querySelectorAll('.favourite-photo img').forEach(loadPlayerImage);
        syncFavoriteControls();
    }

    function featuredMarkup(player) {
        if (player.featured?.length) {
            return `<div class="record-grid">${player.featured.map(([value, label]) => `<div class="record"><strong>${escapeHtml(value)}</strong><span>${escapeHtml(label)}</span></div>`).join('')}</div>`;
        }
        const test = player.statistics?.Test;
        const keys = player.roleType === 'bowler' ? [['wickets', 'Test wickets'], ['best', 'Best Test figures']] : [['runs', 'Test runs'], ['highest', 'Highest Test score']];
        const values = keys.filter(([key]) => test?.[key] !== null && test?.[key] !== undefined);
        return values.length ? `<div class="record-grid">${values.map(([key, label]) => `<div class="record"><strong>${escapeHtml(test[key])}</strong><span>${escapeHtml(label)}</span></div>`).join('')}</div>` : '<p class="record-note">Career totals are not available in the database yet.</p>';
    }

    function formatStatistics(rows) {
        const result = {};
        for (const row of rows || []) {
            result[row.format] = {
                matches: row.matches, innings: row.innings, runs: row.runs,
                highest: row.highest_score, average: row.batting_average, strikeRate: row.strike_rate,
                hundreds: row.centuries, fifties: row.half_centuries, fours: row.fours, sixes: row.sixes,
                wickets: row.wickets, bowlingAverage: row.bowling_average, economy: row.economy,
                bowlingStrikeRate: row.bowling_strike_rate, best: row.best_bowling,
                fiveWickets: row.five_wicket_hauls, tenWickets: row.ten_wicket_hauls,
                sourceKind: row.source_kind, verifiedAt: row.verified_at
            };
        }
        return result;
    }

    function renderStatsTable(stats, kind) {
        const columns = kind === 'batting'
            ? [['matches','Matches'],['innings','Innings'],['runs','Runs'],['highest','High'],['average','Avg'],['strikeRate','SR'],['hundreds','100s'],['fifties','50s'],['fours','4s'],['sixes','6s']]
            : [['matches','Matches'],['innings','Innings'],['wickets','Wickets'],['best','Best'],['bowlingAverage','Avg'],['economy','Econ'],['bowlingStrikeRate','SR'],['fiveWickets','5WI'],['tenWickets','10WI']];
        return `<div class="profile-table-scroll"><table class="profile-table"><thead><tr><th scope="col">Format</th>${columns.map(([, label]) => `<th scope="col">${label}</th>`).join('')}</tr></thead><tbody>${formats.map((format) => `<tr><th scope="row">${format}</th>${columns.map(([key]) => `<td>${stats?.[format]?.[key] ?? unavailable}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    }

    function showPlayerProfile(id) {
        const player = playerBySlug().get(id);
        if (!player) return;
        $('#profile-title').textContent = player.name;
        const isFavorite = favoriteIds.includes(id);
        profileContent.innerHTML = `<div class="profile-overview"><div class="profile-photo"><span class="photo-fallback" aria-hidden="true">${escapeHtml(player.initials)}</span><img data-image-page="${escapeHtml(player.imagePage || '')}" data-image-url="${escapeHtml(player.imageUrl || '')}" alt="${escapeHtml(player.name)}" style="--portrait-position:${escapeHtml(player.imagePosition || 'center 18%')}" loading="lazy"></div><dl class="profile-facts"><div><dt>Country</dt><dd>${escapeHtml(player.flag || flags[player.country] || '')} ${escapeHtml(player.country || unavailable)}</dd></div><div><dt>Date of birth</dt><dd>${escapeHtml(player.birth || unavailable)}</dd></div><div><dt>Playing role</dt><dd>${escapeHtml(player.role || unavailable)}</dd></div><div><dt>Batting style</dt><dd>${escapeHtml(player.batting || unavailable)}</dd></div><div><dt>Bowling style</dt><dd>${escapeHtml(player.bowling || unavailable)}</dd></div><div><dt>Data source</dt><dd>${player.remote ? 'Supabase database' : 'Verified local profile'}</dd></div></dl></div>${player.roleType !== 'bowler' ? `<section class="profile-section"><h3>Batting</h3>${renderStatsTable(player.statistics || player.battingStats, 'batting')}</section>` : ''}${player.roleType !== 'batter' ? `<section class="profile-section"><h3>Bowling</h3>${renderStatsTable(player.statistics || player.bowlingStats, 'bowling')}</section>` : ''}<p class="profile-source">Unavailable values are shown as N/A. <a href="${escapeHtml(player.source || '#sources')}" target="_blank" rel="noopener noreferrer">Check player source ↗</a></p>`;
        profileFavorite.dataset.favouriteId = player.id;
        profileFavorite.hidden = false;
        syncFavoriteControls();
        profileContent.querySelectorAll('.profile-photo img').forEach(loadPlayerImage);
        profileDialog.showModal();
    }

    function updateAuthMessage(message, isError = false) {
        const target = authMessage || backendStatus;
        if (!target) return;
        target.textContent = message;
        target.hidden = !message;
        target.classList.toggle('is-error', isError);
    }

    function updateAccountUI() {
        if (!authButton) return;
        authButton.textContent = currentSession ? (currentProfile?.full_name || currentSession.user.email || 'My account') : 'Sign in';
        logoutButton.hidden = !currentSession;
        adminLink.hidden = currentProfile?.role !== 'admin';
        if (currentProfile) profileForm?.classList.remove('is-hidden');
        else profileForm?.classList.add('is-hidden');
    }

    async function syncCloudFavourites() {
        if (!supabase || !currentSession) return;
        const userId = currentSession.user.id;
        const local = readLocalFavorites();
        const remotePlayers = new Map((await supabase.from('players').select('id,slug').eq('is_active', true)).data?.map((player) => [player.slug, player.id]) || []);
        const mergeRows = local.map((slug) => remotePlayers.get(slug)).filter(Boolean).map((playerId) => ({ user_id: userId, player_id: playerId }));
        if (mergeRows.length) {
            const { error: mergeError } = await supabase.from('favourites').upsert(mergeRows, { onConflict: 'user_id,player_id', ignoreDuplicates: true });
            if (mergeError) updateAuthMessage(`Could not merge local favourites: ${mergeError.message}`, true);
        }
        const { data, error } = await supabase.from('favourites').select('player_id').eq('user_id', userId);
        if (error) {
            updateBackendStatus(`Could not load cloud favourites: ${error.message}`, true);
            return;
        }
        const slugById = new Map([...remotePlayers.entries()].map(([slug, playerId]) => [playerId, slug]));
        favoriteIds = (data || []).map((row) => slugById.get(row.player_id)).filter(Boolean);
        try { localStorage.removeItem(storageKey); } catch {}
        renderFavorites();
    }

    async function loadCloudPlayers() {
        if (!supabase) return;
        const { data: rows, error } = await supabase.from('players').select('id,slug,full_name,country,birth_date,playing_role,batting_style,bowling_style,image_url,biography,is_active').eq('is_active', true).order('full_name');
        if (error) {
            updateBackendStatus(`Could not load database players; showing the bundled index. ${error.message}`, true);
            return;
        }
        if (!rows?.length) {
            updateBackendStatus('The database is connected but has no active players yet; showing the bundled index.');
            return;
        }
        const { data: statRows, error: statError } = await supabase.from('player_statistics').select('player_id,format,matches,innings,runs,highest_score,batting_average,strike_rate,centuries,half_centuries,fours,sixes,wickets,bowling_average,economy,bowling_strike_rate,best_bowling,five_wicket_hauls,ten_wicket_hauls,source_kind,verified_at').in('player_id', rows.map((player) => player.id));
        if (statError) updateBackendStatus(`Player profiles loaded; some statistics could not be loaded. ${statError.message}`, true);
        const statsByPlayer = new Map();
        for (const row of statRows || []) {
            if (!statsByPlayer.has(row.player_id)) statsByPlayer.set(row.player_id, []);
            statsByPlayer.get(row.player_id).push(row);
        }
        players = rows.map((row) => {
            const slug = row.slug;
            const previous = fallbackPlayers.find((item) => item.id === slug);
            const role = row.playing_role || previous?.role || unavailable;
            const normalizedRole = role.toLowerCase();
            const roleType = normalizedRole.includes('all-round') ? 'allrounder' : normalizedRole.includes('bowler') || normalizedRole.includes('fast') ? 'bowler' : 'batter';
            return {
                ...previous,
                id: slug,
                databaseId: row.id,
                remote: true,
                name: row.full_name,
                country: row.country || unavailable,
                flag: flags[row.country] || '',
                birth: row.birth_date ? new Date(`${row.birth_date}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : previous?.birth,
                role,
                roleType,
                batting: row.batting_style || previous?.batting,
                bowling: row.bowling_style || previous?.bowling,
                imageUrl: row.image_url,
                source: row.biography || previous?.source,
                statistics: formatStatistics(statsByPlayer.get(row.id) || []),
                search: `${row.full_name} ${row.country} ${role} ${row.batting_style || ''} ${row.bowling_style || ''}`.toLowerCase()
            };
        });
        renderFilters();
        renderDirectory();
        renderFavorites();
        updateBackendStatus('Connected to the Crikipedia database.');
        if (currentSession) await syncCloudFavourites();
    }

    async function loadProfileAndFavorites() {
        if (!supabase || !currentSession) return;
        const { data, error } = await supabase.from('profiles').select('id,full_name,email,avatar_url,role').eq('id', currentSession.user.id).maybeSingle();
        if (error) updateAuthMessage(`Could not load your profile: ${error.message}`, true);
        currentProfile = data || { id: currentSession.user.id, email: currentSession.user.email, role: 'user' };
        if ($('#profile-full-name')) $('#profile-full-name').value = currentProfile.full_name || '';
        if ($('#profile-avatar-url')) $('#profile-avatar-url').value = currentProfile.avatar_url || '';
        updateAccountUI();
        await syncCloudFavourites();
    }

    async function handleFavoriteClick(slug) {
        const player = playerBySlug().get(slug);
        if (!player) return;
        if (!supabase || !currentSession || !player.databaseId) {
            favoriteIds = favoriteIds.includes(slug) ? favoriteIds.filter((id) => id !== slug) : [...favoriteIds, slug];
            saveLocalFavorites();
            syncFavoriteControls();
            renderFavorites();
            if (supabase && !currentSession) openAuth('signin', 'Sign in to sync favourites across devices. Your local selection will be merged after login.');
            return;
        }
        const userId = currentSession.user.id;
        if (favoriteIds.includes(slug)) {
            const { error } = await supabase.from('favourites').delete().eq('user_id', userId).eq('player_id', player.databaseId);
            if (error) return updateBackendStatus(`Could not remove favourite: ${error.message}`, true);
            favoriteIds = favoriteIds.filter((id) => id !== slug);
        } else {
            const { error } = await supabase.from('favourites').insert({ user_id: userId, player_id: player.databaseId });
            if (error && error.code !== '23505') return updateBackendStatus(`Could not save favourite: ${error.message}`, true);
            if (!favoriteIds.includes(slug)) favoriteIds = [...favoriteIds, slug];
        }
        updateBackendStatus('Favourites saved to your account.');
        syncFavoriteControls();
        renderFavorites();
    }

    function openAuth(mode = 'signin', message = '') {
        if (!authDialog) return;
        if (!supabase) {
            updateAuthMessage('Cloud features are not configured yet. Add the Supabase project URL and public anon key to supabase-config.js.');
        } else {
            updateAuthMessage(message);
        }
        setAuthMode(mode);
        authDialog.showModal();
    }

    function setAuthMode(mode) {
        if (!authForm) return;
        authForm.dataset.mode = mode;
        $('#auth-title').textContent = mode === 'signup' ? 'Create your account' : mode === 'reset' ? 'Reset your password' : 'Welcome back';
        $('#auth-submit').textContent = mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Sign in';
        $('#auth-full-name-row').hidden = mode !== 'signup';
        $('#auth-password-row').hidden = mode === 'reset';
        $('#auth-password').required = mode !== 'reset';
        $('#auth-switch').textContent = mode === 'signup' ? 'Already have an account? Sign in' : 'Create an account';
        $('#auth-switch').dataset.mode = mode === 'signup' ? 'signin' : 'signup';
    }

    function setupAuthentication() {
        if (!authButton) return;
        authButton.addEventListener('click', () => currentSession ? authDialog.showModal() : openAuth('signin'));
        logoutButton.addEventListener('click', async () => {
            if (!supabase) return;
            const { error } = await supabase.auth.signOut();
            if (error) updateAuthMessage(`Could not sign out: ${error.message}`, true);
            else updateBackendStatus('Signed out. Local preview favourites remain in this browser.');
        });
        authForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!supabase) return openAuth(authForm.dataset.mode);
            const mode = authForm.dataset.mode;
            const email = $('#auth-email').value.trim();
            const password = $('#auth-password').value;
            const submit = $('#auth-submit');
            submit.disabled = true;
            updateAuthMessage('Working…');
            let result;
            if (mode === 'signup') {
                result = await supabase.auth.signUp({ email, password, options: { data: { full_name: $('#auth-full-name').value.trim() } } });
                if (!result.error && !result.data.session) updateAuthMessage('Check your email to verify your account, then sign in.');
            } else if (mode === 'reset') {
                result = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}${location.pathname}` });
                if (!result.error) updateAuthMessage('If that email is registered, a password reset link has been sent.');
            } else {
                result = await supabase.auth.signInWithPassword({ email, password });
            }
            submit.disabled = false;
            if (result?.error) return updateAuthMessage(result.error.message, true);
            if (mode === 'signin' && result?.data?.session) {
                currentSession = result.data.session;
                await loadProfileAndFavorites();
                authDialog.close();
                updateBackendStatus('Signed in. Your favourites are synced to your account.');
            }
        });
        $('#auth-switch').addEventListener('click', () => setAuthMode($('#auth-switch').dataset.mode));
        $('#auth-reset').addEventListener('click', () => setAuthMode('reset'));
        $('#auth-close').addEventListener('click', () => authDialog.close());
        profileForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!supabase || !currentSession) return;
            const payload = { full_name: $('#profile-full-name').value.trim() || null, avatar_url: $('#profile-avatar-url').value.trim() || null };
            const { data, error } = await supabase.from('profiles').update(payload).eq('id', currentSession.user.id).select('id,full_name,email,avatar_url,role').single();
            if (error) return updateAuthMessage(`Could not update profile: ${error.message}`, true);
            currentProfile = data;
            updateAccountUI();
            updateAuthMessage('Profile saved.');
        });
        if (supabase) {
            supabase.auth.onAuthStateChange((_event, session) => {
                currentSession = session;
                updateAccountUI();
                if (session) setTimeout(() => loadProfileAndFavorites(), 0);
                else {
                    currentProfile = null;
                    favoriteIds = readLocalFavorites();
                    updateAccountUI();
                    renderFavorites();
                }
            });
        }
    }

    function setupDirectoryControls() {
        renderFilters();
        searchInput.addEventListener('input', renderDirectory);
        countryFilter?.addEventListener('change', renderDirectory);
        roleFilter?.addEventListener('change', renderDirectory);
        sortFilter?.addEventListener('change', renderDirectory);
    }

    function renderFilters() {
        if (!countryFilter || !roleFilter) return;
        const countries = [...new Set(players.map((player) => player.country).filter((country) => country && country !== unavailable))].sort();
        const roles = [...new Set(players.map((player) => player.role).filter((role) => role && role !== unavailable))].sort();
        const selectedCountry = countryFilter.value;
        const selectedRole = roleFilter.value;
        countryFilter.innerHTML = '<option value="">All countries</option>' + countries.map((country) => `<option value="${escapeHtml(country)}">${escapeHtml(country)}</option>`).join('');
        roleFilter.innerHTML = '<option value="">All roles</option>' + roles.map((role) => `<option value="${escapeHtml(role)}">${escapeHtml(role)}</option>`).join('');
        countryFilter.value = selectedCountry;
        roleFilter.value = selectedRole;
    }

    async function initialize() {
        document.querySelector('#footer-year').textContent = String(new Date().getFullYear());
        setupAuthentication();
        setupDirectoryControls();
        renderDirectory();
        renderFavorites();
        if (!supabase) {
            updateBackendStatus('Local preview mode: configure Supabase in supabase-config.js to enable accounts and cloud sync.');
            return;
        }
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) updateBackendStatus(`Authentication session could not be restored: ${sessionError.message}`, true);
        currentSession = sessionData?.session || null;
        updateAccountUI();
        if (currentSession) await loadProfileAndFavorites();
        await loadCloudPlayers();
    }

    initialize().catch((error) => {
        console.error('Crikipedia initialization failed', error);
        updateBackendStatus('The site started in local preview mode because initialization failed.', true);
    });
})();
