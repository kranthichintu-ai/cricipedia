(() => {
    const config = window.CRICKET_SUPABASE_CONFIG || {};
    const url = typeof config.url === 'string' ? config.url.trim() : '';
    const anonKey = typeof config.anonKey === 'string' ? config.anonKey.trim() : '';
    const sdk = window.supabase;
    const ready = Boolean(url && anonKey && sdk && typeof sdk.createClient === 'function');

    window.crikipediaBackend = Object.freeze({
        configured: ready,
        client: ready ? sdk.createClient(url, anonKey, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            }
        }) : null
    });
})();
