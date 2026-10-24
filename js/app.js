/* ═══════════════════════════════════════════
   SUPORTE MEGA – Bootstrap principal
   Conecta Supabase, inicia auth e realtime
   ═══════════════════════════════════════════ */

// ── Instância global do Supabase ──
const supa = supabase.createClient(SUPA_URL, SUPA_ANON);

// ── Carrega DB e assina realtime ──
async function initDb() {
  setLoading(true);
  try {
    await Promise.all([loadChamados(), loadEquipamentos()]);
    subscribeChamados();
    subscribeEquipamentos();
    initFormNovo();
    updateChamadosTableHeader();
  } catch (e) {
    const msg = e?.message || e?.details || e?.hint || JSON.stringify(e);
    console.error('initDb error:', msg, e);
    toast('Erro ao carregar dados: ' + msg, 'err');
  } finally {
    setLoading(false);
  }
}

// ── DOMContentLoaded ──
window.addEventListener('DOMContentLoaded', () => {
  // A UI é inicializada depois do login (showApp → initDb → initUI)
  // mas preparamos o tema e ouvintes desde já
  initAuth();   // auth.js — monitora sessão Supabase e chama showApp/hideApp
});
