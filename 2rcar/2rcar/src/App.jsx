import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
const SUPABASE_URL = "https://jveldjtakpniboajesyv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZconst supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// Caratteristiche disponibili (SOLO features, cambio è campo separato)
const FEATURES_AVAILABLE = ["Aria condizionata", "Navigatore", "Sensori parcheggio", "Bluetooth",
 "Telecamera retromarcia", "Cruise control", "Pelle", "Tetto apribile",
 "Cerchi in lega", "Fari LED", "Sedili riscaldati", "Android Auto o CarPlay",
 "4x4", "Ibrida", "Elettrica"];
const NAV_ITEMS = ["Home", "Vendita", "Noleggio", "Chi Siamo", "Contatti"];
const PLACEHOLDER = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80"const EMPTY_FILTERS = {
 features: [], // multi-select array
 fuel: "",
 cambio: "",
 yearFrom: "",
 yearTo: "",
 kmMax: "",
 priceMax: "",
};
const EMPTY_FORM = {
 brand: "", model: "", year: "", price: "", km: "",
 fuel: "Benzina", cambio: "manuale", type: "vendita",
 features: [], featured: false, description: "",
 status: "disponibile",
};
// Auto di fallback quando DB non raggiungibile
const FALLBACK_CARS = [
 { id: 1, brand: "Mercedes-Benz", model: "Classe E", year: 2019, price: 24900, km: 87000, fu { id: 2, brand: "BMW", model: "Serie 3 Touring", year: 2020, price: 28500, km: 62000, fuel: { id: 3, brand: "Volkswagen", model: "Tiguan R-Line", year: 2021, price: 120, km: 45000, fu];
async function uploadImages(files) {
 const urls = [];
 for (const file of files) {
 const ext = file.name.split(".").pop();
 const path = `cars/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
 const { error } = await supabase.storage.from("car-images").upload(path, file, { cacheCon if (error) { console.error("Upload error:", error.message); continue; }
 const { data } = supabase.storage.from("car-images").getPublicUrl(path);
 urls.push(data.publicUrl);
 }
 return urls;
}
// ─────────────────────────────────────────────────────────────
// GLOBAL CSS
// ─────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
 @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&fam *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
 :root {
 --navy: #1a1a2e;
 --gold: #c9a84c;
 --gold-light: #e8c96a;
 --cream: #f7f5f0;
 --white: #ffffff;
 --text: #1a1a1a;
 --muted: #888888;
 --border: #e8e4dc;
 --card-shadow: 0 4px 24px rgba(0,0,0,0.08);
 --nav-h: 4rem;
 }
 html { font-size: clamp(14px, 1.1vw, 17px); scroll-behavior: smooth; }
 body {
 font-family: 'DM Sans', sans-serif;
 background: var(--cream);
 color: var(--text);
 min-height: 100vh;
 -webkit-font-smoothing: antialiased;
 }
 ::-webkit-scrollbar { width: 6px; height: 6px; }
 ::-webkit-scrollbar-track { background: transparent; }
 ::-webkit-scrollbar-thumb {
 background: linear-gradient(180deg, var(--gold) 0%, var(--navy) 100%);
 border-radius: 99px;
 }
 ::-webkit-scrollbar-thumb:hover { background: var(--gold); }
 * { scrollbar-width: thin; scrollbar-color: var(--gold) transparent; }
 .page-wrapper { display: flex; flex-direction: column; min-height: 100vh; padding-top: var( .page-content { flex: 1; }
 .nav-bar {
 position: fixed; top: 0; left: 0; right: 0; z-index: 200;
 background: rgba(26,26,46,0.97);
 backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
 box-shadow: 0 2px 32px rgba(0,0,0,0.25);
 height: var(--nav-h);
 transition: transform 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease;
 will-change: transform;
 }
 .nav-bar.hidden { transform: translateY(-110%); }
 .nav-inner {
 max-width: 72rem; margin: 0 auto;
 padding: 0 1.5rem; height: 100%;
 display: flex; align-items: center; justify-content: space-between;
 }
 .hero {
 position: relative;
 height: clamp(380px, 55vh, 640px);
 background: url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80) display: flex; align-items: center;
 }
 .hero-overlay { position: absolute; inset: 0; background: linear-gradient(130deg, rgba(26,2 .hero-content { position: relative; max-width: 72rem; margin: 0 auto; padding: 0 1.5rem; wi .hero-eyebrow { font-family: 'DM Sans', sans-serif; color: var(--gold); letter-spacing: 0.2 .hero-title { font-family: 'Playfair Display', serif; color: #fff; font-size: clamp(2rem, 5 .hero-btns { display: flex; gap: 1rem; flex-wrap: wrap; }
 .hero-btn { background: var(--gold); border: none; color: var(--navy); padding: 0.85em 2.2e .hero-btn:hover { background: var(--gold-light); transform: translateY(-1px); }
 .hero-btn-outline { background: transparent; border: 1.5px solid rgba(255,255,255,0.7); col .hero-btn-outline:hover { background: rgba(255,255,255,0.1); transform: translateY(-1px); }
 .section { max-width: 72rem; margin: 0 auto; padding: clamp(2.5rem, 6vw, 5rem) 1.5rem; }
 .section-header { text-align: center; margin-bottom: 2.5rem; }
 .section-title { font-family: 'Playfair Display', serif; font-size: clamp(1.6rem, 3.5vw, 2. .section-sub { color: var(--muted); font-size: 0.95rem; }
 .grid-3 { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem),
 /* ── Car Card ── */
 .car-card { background: var(--white); border-radius: 0.75rem; overflow: hidden; cursor: poi .car-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.13); }
 .car-card.is-noleggiata { background: #f9f9f9; }
 .card-img-wrap { position: relative; height: 12.5rem; overflow: hidden; }
 .card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease,  .car-card:hover .card-img { transform: scale(1.03); }
 .card-badge { position: absolute; top: 0.75rem; right: 0.75rem; color: #fff; font-size: 0.6 .photo-dots { position: absolute; bottom: 0.6rem; left: 50%; transform: translateX(-50%); d .photo-dot { width: 5px; height: 5px; border-radius: 50%; transition: background 0.2s; }
 .card-body { padding: 1.25rem; }
 .card-tags { display: flex; gap: 0.4rem; margin-bottom: 0.6rem; flex-wrap: wrap; }
 .card-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700;  .card-sub { color: var(--muted); font-size: 0.8rem; margin-bottom: 0.75rem; }
 .card-price { font-family: 'Playfair Display', serif; font-size: 1.35rem; font-weight: 700; .card-price-sub { font-size: 0.75rem; color: var(--muted); font-weight: 400; font-family: ' .card-cambio-badge { display: inline-flex; align-items: center; gap: 0.3em; background: var /* ── Tags / Features ── */
 .tag { background: #f0ede6; color: #666; font-size: 0.7rem; padding: 0.25em 0.65em; border- /* ── Sold overlay ── */
 .sold-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.45); display: flex;  .sold-stamp { border: 3px solid #e74c3c; color: #e74c3c; font-family: 'Playfair Display', s .noleggiata-overlay { position: absolute; inset: 0; background: rgba(180,180,180,0.18); dis .noleggiata-stamp { border: 2.5px solid #7f8c8d; color: #7f8c8d; font-family: 'Playfair Dis /* ── Advanced Filters ── */
 .filters-wrapper { margin-bottom: 1.75rem; }
 .filters-bar { display: flex; align-items: center; justify-content: space-between; backgrou .filters-bar:hover { border-color: var(--gold); }
 .filters-bar-left { display: flex; align-items: center; gap: 0.6rem; font-size: 0.88rem; fo .filters-active-badge { background: var(--navy); color: var(--gold); font-size: 0.7rem; fon .filters-reset-btn { font-size: 0.75rem; color: #999; background: none; border: 1px solid v .filters-reset-btn:hover { background: #f0ede6; }
 .filters-arrow { font-size: 0.8rem; color: #aaa; display: inline-block; transition: transfo .filters-panel { background: var(--white); border: 1px solid var(--border); border-top: non .filter-group label { display: block; font-size: 0.68rem; font-weight: 700; color: #aaa; te .filter-select { width: 100%; padding: 0.5em 0.7em; border-radius: 0.4rem; border: 1px soli .filter-select:focus { border-color: var(--gold); }
 .filter-divider { grid-column: 1 / -1; border: none; border-top: 1px solid var(--border); m .filter-features-area { grid-column: 1 / -1; }
 .filter-features-label { font-size: 0.68rem; font-weight: 700; color: #aaa; text-transform: .filter-features-row { display: flex; gap: 0.4rem; flex-wrap: wrap; }
 .filter-tag-btn { background: var(--white); border: 1px solid var(--border); color: #666; p .filter-tag-btn:hover { border-color: var(--gold); color: var(--navy); }
 .filter-tag-btn.active { background: var(--navy); border-color: var(--navy); color: var(--g .filters-summary { font-size: 0.8rem; color: var(--muted); margin-top: 0.6rem; min-height:  /* ── CTA Strip ── */
 .cta-strip { background: var(--navy); padding: clamp(2rem, 5vw, 3.5rem) 1.5rem; display: fl .cta-inner { max-width: 72rem; margin: 0 auto; width: 100%; display: flex; align-items: cen .cta-title { font-family: 'Playfair Display', serif; color: #fff; font-size: clamp(1.1rem,  .cta-sub { color: rgba(255,255,255,0.55); font-size: 0.9rem; }
 .cta-button { background: var(--gold); border: none; color: var(--navy); padding: 0.85em 2e .cta-button:hover { background: var(--gold-light); transform: translateY(-1px); }
 /* ── Contatti ── */
 .contact-card { background: var(--white); border-radius: 0.75rem; padding: clamp(1.5rem, 4v .contact-item { display: flex; align-items: center; gap: 1rem; font-size: 1rem; line-height .contact-icon { font-size: 1.4rem; width: 2rem; flex-shrink: 0; }
 /* ── Footer ── */
 .footer { background: #111; color: #555; text-align: center; padding: 2.5rem 1.5rem; margin .footer-logo { font-family: 'Playfair Display', serif; font-size: 1.3rem; letter-spacing: 0 .footer-sub { font-size: 0.78rem; }
 /* ── Modal / Overlay ── */
 .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(4 .modal { background: var(--white); border-radius: 1rem; width: 100%; max-width: 36rem; max- .modal-close { position: absolute; top: 1rem; right: 1rem; background: rgba(0,0,0,0.08); bo .modal-close:hover { background: rgba(0,0,0,0.15); }
 .modal-gallery { position: relative; height: 15rem; overflow: hidden; border-radius: 1rem 1 .modal-gallery-img { width: 100%; height: 100%; object-fit: cover; display: block; transiti .modal-gallery-nav { position: absolute; top: 50%; transform: translateY(-50%); background: .modal-gallery-nav:hover { background: rgba(0,0,0,0.7); }
 .modal-gallery-counter { position: absolute; bottom: 0.6rem; right: 0.75rem; background: rg .modal-gallery-dots { position: absolute; bottom: 0.65rem; left: 50%; transform: translateX .modal-gallery-dot { width: 6px; height: 6px; border-radius: 50%; transition: background 0. .modal-gallery-zoom-hint { position: absolute; top: 0.6rem; left: 0.75rem; background: rgba .modal-body { padding: 1.75rem; }
 .modal-tags { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
 .modal-title { font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 700; .modal-year { color: var(--muted); font-size: 0.88rem; margin-bottom: 0.5rem; }
 .modal-cambio { font-size: 0.82rem; color: var(--navy); font-weight: 600; margin-bottom: 0. .modal-price { font-family: 'Playfair Display', serif; font-size: 1.9rem; font-weight: 700; .modal-description { font-size: 0.9rem; color: #555; line-height: 1.7; margin-bottom: 1.25r .modal-features-title { font-size: 0.72rem; font-weight: 700; color: #aaa; text-transform:  .modal-features-grid { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 1.25rem; .contact-call-btn { display: block; background: var(--navy); color: var(--gold); text-align .contact-call-btn:hover { background: #2a2a4e; }
 /* ── Gallery lightbox ── */
 .gallery-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 2000;  .gallery-box { position: relative; max-width: 56rem; width: 100%; padding: 3rem 1.5rem 1.5r .gallery-close { position: absolute; top: 0.5rem; right: 0.75rem; background: rgba(255,255, .gallery-close:hover { background: rgba(255,255,255,0.2); }
 .gallery-main { width: 100%; max-height: 65vh; object-fit: contain; border-radius: 0.5rem;  .gallery-nav { position: absolute; top: 50%; transform: translateY(-50%); background: rgba( .gallery-nav:hover { background: rgba(255,255,255,0.22); }
 .gallery-thumbs { display: flex; gap: 0.5rem; justify-content: center; margin-top: 1rem; fl .gallery-thumb { width: 4rem; height: 3rem; object-fit: cover; border-radius: 0.25rem; curs .gallery-thumb.active { opacity: 1; outline: 2px solid var(--gold); }
 .gallery-counter { text-align: center; color: #666; font-size: 0.8rem; margin-top: 0.6rem;  /* ── Admin ── */
 .admin-login { padding: 2rem; display: flex; flex-direction: column; align-items: center; g .login-icon { font-size: 2.5rem; }
 .login-sub { color: var(--muted); font-size: 0.82rem; text-align: center; }
 .auth-error { background: #fdecea; color: #e74c3c; border-radius: 0.4rem; padding: 0.5em 0. .admin-panel { padding: 1.75rem; }
 .admin-title { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 700; .admin-header { display: flex; align-items: flex-start; justify-content: space-between; mar .admin-user-badge { color: #27ae60; font-size: 0.75rem; margin-top: 0.25rem; font-family: m .logout-btn { background: #f8f8f8; border: 1px solid var(--border); color: #666; padding: 0 .logout-btn:hover { background: #eee; }
 .admin-section-title { font-size: 0.75rem; font-weight: 700; color: #aaa; margin: 0 0 1rem; .admin-form { display: flex; flex-direction: column; gap: 0.75rem; }
 .form-row { display: flex; gap: 0.75rem; }
 .input, .select-field, .textarea-field { flex: 1; padding: 0.65em 0.9em; border-radius: 0.5 .textarea-field { resize: vertical; min-height: 5rem; }
 .input:focus, .select-field:focus, .textarea-field:focus { border-color: var(--gold); box-s /* Feature picker */
 .feature-picker { background: #f8f8f8; border-radius: 0.5rem; padding: 0.9rem; }
 .feature-picker-label { font-size: 0.72rem; font-weight: 700; color: #aaa; text-transform:  .feature-picker-grid { display: flex; gap: 0.5rem; flex-wrap: wrap; }
 .feature-picker-btn { background: var(--white); border: 1px solid var(--border); padding: 0 .feature-picker-btn:hover { border-color: var(--gold); }
 .feature-picker-btn.active { background: var(--navy); border-color: var(--navy); color: var /* Image upload */
 .dropzone { border: 2px dashed var(--border); border-radius: 0.6rem; padding: 1.5rem 1rem;  .dropzone.dragging { border-color: var(--gold); background: #fffbf0; }
 .dropzone-text { color: var(--muted); font-size: 0.88rem; line-height: 1.8; }
 .preview-grid { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.6rem; }
 .preview-item { position: relative; width: 5rem; height: 3.75rem; }
 .preview-img { width: 100%; height: 100%; object-fit: cover; border-radius: 0.4rem; display
 .preview-remove { position: absolute; top: -0.4rem; right: -0.4rem; background: #e74c3c; bo .preview-main { position: absolute; bottom: 0.1rem; left: 0.15rem; background: rgba(0,0,0,0 .check-label { font-size: 0.88rem; display: flex; align-items: center; cursor: pointer; gap .submit-btn { background: var(--navy); color: var(--gold); border: none; padding: 0.8em; bo .submit-btn:hover:not(:disabled) { background: #2a2a4e; }
 .submit-btn-secondary { background: #f0ede6; color: var(--navy); border: 1px solid var(--bo .submit-btn-secondary:hover:not(:disabled) { background: #e8e4dc; }
 /* Admin list */
 .admin-list { display: flex; flex-direction: column; gap: 0.6rem; max-height: 20rem; overfl .admin-list-item { display: flex; align-items: center; justify-content: space-between; padd .admin-list-info { display: flex; flex-direction: column; gap: 0.15rem; }
 .admin-list-sub { font-size: 0.75rem; color: var(--muted); }
 .admin-list-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }
 .admin-action-btn { border: none; border-radius: 0.4rem; width: 2rem; height: 2rem; cursor: .admin-action-btn:hover { opacity: 0.8; }
 /* Edit modal */
 .edit-modal { background: var(--white); border-radius: 1rem; width: 100%; max-width: 40rem; /* Misc */
 .loading-screen { display: flex; flex-direction: column; align-items: center; justify-conte @keyframes spin { to { transform: rotate(360deg); } }
 .spinner { width: 2.5rem; height: 2.5rem; border: 3px solid var(--border); border-top-color .banner { background: #e67e22; color: #fff; text-align: center; padding: 0.65rem 1rem; font .ornament { display: flex; align-items: center; justify-content: center; gap: 0.75rem; marg .ornament-line { flex: 1; max-width: 4rem; height: 1px; background: var(--gold); opacity: 0 .ornament-dot { width: 0.4rem; height: 0.4rem; background: var(--gold); border-radius: 50%; /* Chi siamo */
 .chisiamo-hero { background: var(--navy); padding: clamp(3rem, 7vw, 5rem) 1.5rem; text-alig .chisiamo-hero-eyebrow { color: var(--gold); letter-spacing: 0.28em; font-size: 0.7rem; tex .chisiamo-hero-title { font-family: 'Playfair Display', serif; color: #fff; font-size: clam .chisiamo-hero-sub { color: rgba(255,255,255,0.6); font-size: 1rem; max-width: 36rem; margi .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); ga .stat-block { padding: 1.75rem 1rem; text-align: center; border-right: 1px solid rgba(26,26 .stat-block:last-child { border-right: none; }
 .stat-num { font-family: 'Playfair Display', serif; font-size: clamp(1.8rem, 4vw, 2.6rem);  .stat-label { font-size: 0.75rem; color: rgba(26,26,46,0.65); font-weight: 500; letter-spac .values-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 16r .value-card { background: var(--white); border: 1px solid var(--border); border-radius: 0.7 .value-icon { font-size: 1.8rem; margin-bottom: 0.75rem; display: block; }
 .value-title { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 700; c .value-text { font-size: 0.85rem; color: #666; line-height: 1.65; }
 .trust-badges { display: flex; flex-wrap: wrap; justify-content: center; gap: 1.5rem; margi .trust-badge { display: flex; align-items: center; gap: 0.6rem; background: var(--white); b
 .trust-badge-icon { font-size: 1.1rem; }
 /* WhatsApp FAB */
 .whatsapp-fab { display: none; }
 @media (max-width: 640px) {
 .form-row { flex-direction: column; }
 .hero-btns { flex-direction: column; }
 .cta-inner { flex-direction: column; align-items: flex-start; }
 .stat-block { border-right: none; border-bottom: 1px solid rgba(26,26,46,0.15); }
 .stat-block:last-child { border-bottom: none; }
 .filters-panel { grid-template-columns: 1fr 1fr; }
 }
 @media (max-width: 768px) {
 :root { --nav-h: 3.5rem; }
 .modal { max-height: 88vh; border-radius: 0.75rem; }
 .modal-body { padding: 1.25rem; }
 .modal-title { font-size: 1.3rem; }
 .modal-price { font-size: 1.6rem; }
 .modal-gallery { height: 12rem; }
 .admin-panel { padding: 1.25rem; }
 .admin-list { max-height: 15rem; }
 .contact-card { max-width: 100%; padding: 1.25rem; gap: 1rem; }
 .contact-item { font-size: 0.95rem; }
 .contact-icon { font-size: 1.6rem; }
 .chisiamo-hero { padding: 2.5rem 1rem; }
 .chisiamo-hero-sub { font-size: 0.9rem; }
 .stats-row { grid-template-columns: 1fr 1fr; }
 .stat-block { padding: 1.25rem 0.75rem; border-right: none; border-bottom: 1px solid rgba .stat-block:nth-child(odd) { border-right: 1px solid rgba(26,26,46,0.15); }
 .stat-block:nth-last-child(-n+2) { border-bottom: none; }
 .trust-badges { gap: 0.75rem; margin-top: 1.25rem; }
 .trust-badge { font-size: 0.78rem; padding: 0.45em 0.9em; }
 .gallery-nav { width: 3rem; height: 3rem; font-size: 2rem; }
 .gallery-close { width: 2.75rem; height: 2.75rem; font-size: 1.2rem; }
 .gallery-thumbs { gap: 0.35rem; }
 .gallery-thumb { width: 3rem; height: 2.25rem; }
 .footer { padding: 1.75rem 1rem 5.5rem; }
 .whatsapp-fab { display: flex; align-items: center; justify-content: center; gap: 0.6rem; .whatsapp-fab:active { transform: translateX(-50%) scale(0.96); box-shadow: 0 3px 14px rg .whatsapp-fab-icon { font-size: 1.3rem; line-height: 1; }
 .ornament { margin-bottom: 1.25rem; }
 .input, .select-field, .textarea-field { font-size: 1rem; padding: 0.75em 0.9em; }
 .admin-list-item { flex-wrap: wrap; gap: 0.5rem; }
 .admin-list-actions { margin-left: auto; }
 .admin-action-btn { width: 2.5rem; height: 2.5rem; font-size: 1rem; }
 .nav-mobile-actions { display: flex !important; }
 }
 .nav-mobile-actions { display: none; }
`;
function GlobalStyles() {
 useEffect(() => {
 const id = "2r-global-css";
 if (document.getElementById(id)) return;
 const style = document.createElement("style");
 style.id = id;
 style.textContent = GLOBAL_CSS;
 document.head.appendChild(style);
 return () => document.getElementById(id)?.remove();
 }, []);
 return null;
}
function useNavHide() {
 const [hidden, setHidden] = useState(false);
 const lastY = useRef(0);
 useEffect(() => {
 function onScroll() {
 const y = window.scrollY;
 if (y < 60) setHidden(false);
 else if (y > lastY.current + 4) setHidden(true);
 else if (y < lastY.current - 4) setHidden(false);
 lastY.current = y;
 }
 window.addEventListener("scroll", onScroll, { passive: true });
 return () => window.removeEventListener("scroll", onScroll);
 }, []);
 return hidden;
}
function IconWhatsApp() {
 return (
 <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
 <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197 </svg>
 );
}
// ─────────────────────────────────────────────────────────────
// ADVANCED FILTERS (features multi-select, cambio separato)
// ─────────────────────────────────────────────────────────────
function AdvancedFilters({ filters, onChange, type, resultCount }) {
 const [open, setOpen] = useState(false);
 const activeCount =
 (filters.fuel ? 1 : 0) +
 (filters.cambio ? 1 : 0) +
 (filters.yearFrom ? 1 : 0) +
 (filters.yearTo ? 1 : 0) +
 (filters.kmMax ? 1 : 0) +
 (filters.priceMax ? 1 : 0) +
 (filters.features?.length || 0);
 function set(key, val) {
 onChange({ ...filters, [key]: val });
 }
 function toggleFeature(f) {
 const current = filters.features || [];
 const next = current.includes(f) ? current.filter(x => x !== f) : [...current, f];
 onChange({ ...filters, features: next });
 }
 function resetAll(e) {
 e.stopPropagation();
 onChange({ ...EMPTY_FILTERS });
 }
 const PRICE_OPTIONS_VENDITA = [
 ["3000","€ 3.000"],["5000","€ 5.000"],["8000","€ 8.000"],
 ["10000","€ 10.000"],["15000","€ 15.000"],["20000","€ 20.000"],["30000","€ 30.000"],
 ];
 const PRICE_OPTIONS_NOLEGGIO = [
 ["30","€ 30/g"],["50","€ 50/g"],["80","€ 80/g"],["120","€ 120/g"],["200","€ 200/g"],
 ];
 const priceOptions = type === "noleggio" ? PRICE_OPTIONS_NOLEGGIO : PRICE_OPTIONS_VENDITA;
 const summaryParts = [];
 if (filters.fuel) summaryParts.push(filters.fuel);
 if (filters.cambio) summaryParts.push(filters.cambio);
 if (filters.yearFrom || filters.yearTo) summaryParts.push(`${filters.yearFrom || "–"} → ${f if (filters.kmMax) summaryParts.push(`max ${parseInt(filters.kmMax).toLocaleString("it")} k if (filters.priceMax) summaryParts.push(type === "noleggio" ? `max €${filters.priceMax}/g`  if (filters.features?.length) summaryParts.push(filters.features.join(", "));
 return (
 <div className="filters-wrapper">
 <div
 className="filters-bar"
 onClick={() => setOpen(o => !o)}
 style={{ borderRadius: open ? "0.6rem 0.6rem 0 0" : "0.6rem" }}
 >
 <div className="filters-bar-left">
 <span> Filtri avanzati</span>
 {activeCount > 0 && <span className="filters-active-badge">{activeCount}</span>}
 </div>
 <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
 {activeCount > 0 && <button className="filters-reset-btn" onClick={resetAll}>Azzera <span className="filters-arrow" style={{ transform: open ? "rotate(180deg)" : "rota </div>
 </div>
 {open && (
 <div className="filters-panel">
 <div className="filter-group">
 <label>Carburante</label>
 <select className="filter-select" value={filters.fuel} onChange={e => set("fuel", <option value="">Tutti</option>
 {["Benzina","Diesel","Ibrida","Elettrica","GPL"].map(f => <option key={f} value </select>
 </div>
 <div className="filter-group">
 <label>Cambio</label>
 <select className="filter-select" value={filters.cambio} onChange={e => set("camb <option value="">Tutti</option>
 <option value="manuale">Manuale</option>
 <option value="automatico">Automatico</option>
 </select>
 </div>
 <div className="filter-group">
 <label>Anno da</label>
 <select className="filter-select" value={filters.yearFrom} onChange={e => set("ye <option value="">Qualsiasi</option>
 {[2010,2012,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024].map(y => <o </select>
 </div>
 <div className="filter-group">
 <label>Anno a</label>
 <select className="filter-select" value={filters.yearTo} onChange={e => set("year <option value="">Qualsiasi</option>
 {[2012,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025].map(y => <o </select>
 </div>
 <div className="filter-group">
 <label>Km massimi</label>
 <select className="filter-select" value={filters.kmMax} onChange={e => set("kmMax <option value="">Qualsiasi</option>
 <option value="20000">20.000 km</option>
 <option value="30000">30.000 km</option>
 <option value="50000">50.000 km</option>
 <option value="80000">80.000 km</option>
 <option value="120000">120.000 km</option>
 <option value="150000">150.000 km</option>
 </select>
 </div>
 <div className="filter-group">
 <label>{type === "noleggio" ? "Prezzo max/giorno" : "Prezzo massimo"}</label>
 <select className="filter-select" value={filters.priceMax} onChange={e => set("pr <option value="">Qualsiasi</option>
 {priceOptions.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
 </select>
 </div>
 <hr className="filter-divider" />
 <div className="filter-features-area">
 <span className="filter-features-label">Caratteristiche</span>
 <div className="filter-features-row">
 {FEATURES_AVAILABLE.map(f => (
 <button key={f} type="button"
 className={`filter-tag-btn${(filters.features || []).includes(f) ? " active onClick={() => toggleFeature(f)}>
 {f}
 </button>
 ))}
 </div>
 </div>
 </div>
 )}
 <div className="filters-summary">
 {activeCount > 0
 ? <> {resultCount} risultat{resultCount === 1 ? "o" : "i"} · {summaryParts.join(" : <>{resultCount} annunci disponibili</>
 }
 </div>
 </div>
 );
}
// ─────────────────────────────────────────────────────────────
// IMAGE UPLOADER
// ─────────────────────────────────────────────────────────────
function ImageUploader({ previews, setPreviews, setUploadedFiles, uploading }) {
 const [dragging, setDragging] = useState(false);
 const inputRef = useRef();
 function handleFiles(files) {
 const imageFiles = Array.from(files).filter(f => f.type.startsWith("image/"));
 if (!imageFiles.length) return;
 const localUrls = imageFiles.map(f => ({ url: URL.createObjectURL(f), file: f }));
 setPreviews(prev => [...prev, ...localUrls]);
 setUploadedFiles(prev => [...prev, ...imageFiles]);
 }
 function removePreview(i) {
 setPreviews(prev => prev.filter((_, j) => j !== i));
 setUploadedFiles(prev => prev.filter((_, j) => j !== i));
 }
 return (
 <div>
 <div
 className={`dropzone${dragging ? " dragging" : ""}`}
 onDragOver={e => { e.preventDefault(); setDragging(true); }}
 onDragLeave={() => setDragging(false)}
 onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.fil onClick={() => inputRef.current.click()}
 >
 <input ref={inputRef} type="file" multiple accept="image/*" style={{ display: "none"  <p className="dropzone-text">
 {uploading ? " Upload in corso..." : <> Trascina le foto qui oppure clicca<br / </p>
 </div>
 {previews.length > 0 && (
 <div className="preview-grid">
 {previews.map((item, i) => (
 <div key={i} className="preview-item">
 <img src={item.url} alt="" className="preview-img" />
 <button type="button" className="preview-remove" onClick={() => removePreview(i {i === 0 && <span className="preview-main">Copertina</span>}
 </div>
 ))}
 </div>
 )}
 </div>
 );
}
// ─────────────────────────────────────────────────────────────
// ADMIN FORM (create + edit)
// ─────────────────────────────────────────────────────────────
function AdminCarForm({ initial, onSubmit, saving, uploading, title, submitLabel }) {
 const [form, setForm] = useState(initial || EMPTY_FORM);
 const [previews, setPreviews] = useState(
 (initial?.images || []).map(url => ({ url, file: null }))
 );
 const [newFiles, setNewFiles] = useState([]);
 // Sync quando initial cambia (edit mode)
 useEffect(() => {
 if (initial) {
 setForm(initial);
 setPreviews((initial.images || []).map(url => ({ url, file: null })));
 setNewFiles([]);
 }
 }, [initial?.id]);
 function toggleFeature(f) {
 setForm(prev => ({
 ...prev,
 features: prev.features.includes(f)
 ? prev.features.filter(x => x !== f)
 : [...prev.features, f],
 }));
 }
 async function handleSubmit(e) {
 e.preventDefault();
 // Separa URL esistenti da file nuovi
 const existingUrls = previews.filter(p => !p.file).map(p => p.url);
 await onSubmit(form, newFiles, existingUrls);
 }
 return (
 <div style={{ padding: "1.75rem" }}>
 <p className="admin-section-title">{title}</p>
 <form onSubmit={handleSubmit} className="admin-form">
 <div className="form-row">
 <input required placeholder="Marca" value={form.brand} onChange={e => setForm({ ... <input required placeholder="Modello" value={form.model} onChange={e => setForm({ . </div>
 <div className="form-row">
 <input required type="number" placeholder="Anno" value={form.year} onChange={e => s <input required type="number" placeholder={form.type === "noleggio" ? "€/giorno" :  </div>
 <div className="form-row">
 <input required type="number" placeholder="Km" value={form.km} onChange={e => setFo <select value={form.fuel} onChange={e => setForm({ ...form, fuel: e.target.value }) {["Benzina","Diesel","Ibrida","Elettrica","GPL"].map(f => <option key={f}>{f}</op </select>
 </div>
 <div className="form-row">
 {/* Cambio — campo obbligatorio separato */}
 <select required value={form.cambio} onChange={e => setForm({ ...form, cambio: e.ta <option value="">-- Tipo cambio (obbligatorio) --</option>
 <option value="manuale">Manuale</option>
 <option value="automatico">Automatico</option>
 </select>
 <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value }) <option value="vendita">Vendita</option>
 <option value="noleggio">Noleggio</option>
 </select>
 </div>
 {/* Status */}
 <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value  <option value="disponibile">Disponibile</option>
 <option value="venduta">Venduta</option>
 <option value="noleggiata">Noleggiata</option>
 </select>
 <textarea
 placeholder="Descrizione (opzionale) — es: tagliando recente, gomme nuove, un propr value={form.description}
 onChange={e => setForm({ ...form, description: e.target.value })}
 className="textarea-field"
 />
 {/* Caratteristiche */}
 <div className="feature-picker">
 <span className="feature-picker-label">Caratteristiche</span>
 <div className="feature-picker-grid">
 {FEATURES_AVAILABLE.map(f => (
 <button type="button" key={f}
 onClick={() => toggleFeature(f)}
 className={`feature-picker-btn${form.features.includes(f) ? " active" : ""}`} {f}
 </button>
 ))}
 </div>
 </div>
 {/* Foto */}
 <span className="feature-picker-label" style={{ marginBottom: "0.25rem" }}>Foto</span <ImageUploader
 previews={previews}
 setPreviews={setPreviews}
 setUploadedFiles={setNewFiles}
 uploading={uploading}
 />
 <label className="check-label">
 <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, fe Metti in vetrina
 </label>
 <button type="submit" className="submit-btn" style={{ opacity: (saving || uploading)  {saving ? "Salvataggio..." : submitLabel || "Salva"}
 </button>
 </form>
 </div>
 );
}
// ─────────────────────────────────────────────────────────────
// MODAL GALLERY
// ─────────────────────────────────────────────────────────────
function ModalGallery({ images, onZoom }) {
 const imgs = images?.length ? images : [PLACEHOLDER];
 const [idx, setIdx] = useState(0);
 function prev(e) { e.stopPropagation(); setIdx(i => (i - 1 + imgs.length) % imgs.length); }
 function next(e) { e.stopPropagation(); setIdx(i => (i + 1) % imgs.length); }
 return (
 <div className="modal-gallery" onClick={() => onZoom(idx)}>
 <img src={imgs[idx]} alt="" className="modal-gallery-img" />
 {imgs.length > 1 && (
 <>
 <button className="modal-gallery-nav" style={{ left: "0.5rem" }} onClick={prev}>‹</ <button className="modal-gallery-nav" style={{ right: "0.5rem" }} onClick={next}>›< <div className="modal-gallery-dots">
 {imgs.map((_, i) => (
 <div key={i} className="modal-gallery-dot"
 style={{ background: i === idx ? "#c9a84c" : "rgba(255,255,255,0.55)", transf onClick={e => { e.stopPropagation(); setIdx(i); }} />
 ))}
 </div>
 <div className="modal-gallery-counter">{idx + 1} / {imgs.length}</div>
 </>
 )}
 <div className="modal-gallery-zoom-hint"> clicca per ingrandire</div>
 </div>
 );
}
// ─────────────────────────────────────────────────────────────
// CAR CARD
// ─────────────────────────────────────────────────────────────
function CarCard({ car, onClick }) {
 const images = car.images?.length ? car.images : [PLACEHOLDER];
 const [imgIdx, setImgIdx] = useState(0);
 const intervalRef = useRef(null);
 const isSold = car.status === "venduta";
 const isNoleggiata = car.status === "noleggiata";
 const isAvailable = !isSold && !isNoleggiata;
 function handleMouseEnter() {
 if (images.length <= 1 || isSold) return;
 let i = 0;
 intervalRef.current = setInterval(() => { i = (i + 1) % images.length; setImgIdx(i); }, 7 }
 function handleMouseLeave() { clearInterval(intervalRef.current); setImgIdx(0); }
 const badgeColor = isSold ? "#e74c3c" : isNoleggiata ? "#7f8c8d" : car.type === "noleggio"  const badgeLabel = isSold ? "Venduta" : isNoleggiata ? "Noleggiata" : car.type === "noleggi const imgFilter = isSold ? "grayscale(100%)" : isNoleggiata ? "grayscale(25%) brightness(0. const cardOpacity = isSold ? 0.8 : 1;
 return (
 <div
 className={`car-card${isNoleggiata ? " is-noleggiata" : ""}`}
 onClick={onClick}
 onMouseEnter={handleMouseEnter}
 onMouseLeave={handleMouseLeave}
 style={{ opacity: cardOpacity }}
 >
 <div className="card-img-wrap">
 <img src={images[imgIdx]} alt={car.model} className="card-img" style={{ filter: imgFi <div className="card-badge" style={{ background: badgeColor }}>{badgeLabel}</div>
 {isSold && (
 <div className="sold-overlay">
 <div className="sold-stamp">VENDUTA</div>
 </div>
 )}
 {isNoleggiata && (
 <div className="noleggiata-overlay">
 <div className="noleggiata-stamp">NOLEGGIATA</div>
 </div>
 )}
 {images.length > 1 && isAvailable && (
 <div className="photo-dots">
 {images.map((_, i) => (
 <div key={i} className="photo-dot" style={{ background: i === imgIdx ? "#c9a84c ))}
 </div>
 )}
 </div>
 <div className="card-body">
 <div className="card-tags">
 <span className="card-cambio-badge">
 {car.cambio === "automatico" ? " Automatico" : " Manuale"}
 </span>
 {(car.features || []).slice(0, 2).map(f => <Tag key={f} label={f} />)}
 </div>
 <h3 className="card-title">{car.brand} {car.model}</h3>
 <p className="card-sub">{car.year} · {car.fuel} · {car.km?.toLocaleString()} km</p>
 {!isSold && (
 <p className="card-price">
 {car.type === "noleggio"
 ? <>€ {car.price}<span className="card-price-sub">/giorno</span></>
 : `€ ${car.price?.toLocaleString()}`}
 </p>
 )}
 {isSold && <p style={{ color: "#e74c3c", fontWeight: 700, fontSize: "0.9rem" }}>Auto  {isNoleggiata && !isSold && <p style={{ color: "#7f8c8d", fontWeight: 600, fontSize:  </div>
 </div>
 );
}
// ─────────────────────────────────────────────────────────────
// PHOTO GALLERY (lightbox)
// ─────────────────────────────────────────────────────────────
function PhotoGallery({ images, startIdx, onClose }) {
 const [idx, setIdx] = useState(startIdx || 0);
 const imgs = images?.length ? images : [PLACEHOLDER];
 useEffect(() => {
 function handleKey(e) {
 if (e.key === "ArrowRight") setIdx(i => (i + 1) % imgs.length);
 if (e.key === "ArrowLeft") setIdx(i => (i - 1 + imgs.length) % imgs.length);
 if (e.key === "Escape") onClose();
 }
 window.addEventListener("keydown", handleKey);
 return () => window.removeEventListener("keydown", handleKey);
 }, [imgs.length]);
 return (
 <div className="gallery-overlay" onClick={onClose}>
 <div className="gallery-box" onClick={e => e.stopPropagation()}>
 <button className="gallery-close" onClick={onClose}>✕</button>
 <img src={imgs[idx]} alt="" className="gallery-main" />
 {imgs.length > 1 && (
 <>
 <button className="gallery-nav" style={{ left: "0.75rem" }} onClick={() => setIdx <button className="gallery-nav" style={{ right: "0.75rem" }} onClick={() => setId <div className="gallery-thumbs">
 {imgs.map((url, i) => (
 <img key={i} src={url} alt="" onClick={() => setIdx(i)} className={`gallery-t ))}
 </div>
 <p className="gallery-counter">{idx + 1} / {imgs.length}</p>
 </>
 )}
 </div>
 </div>
 );
}
// ─────────────────────────────────────────────────────────────
// CHI SIAMO
// ─────────────────────────────────────────────────────────────
function ChiSiamo({ onContact }) {
 return (
 <>
 <div className="chisiamo-hero">
 <p className="chisiamo-hero-eyebrow">La nostra storia</p>
 <h1 className="chisiamo-hero-title">Chi siamo</h1>
 <p className="chisiamo-hero-sub">
 Siamo un autosalone indipendente a Roma, nato dalla passione per le auto e dal risp </p>
 </div>
 <div className="stats-row">
 {[{ num: "15+", label: "Anni di esperienza" },{ num: "800+", label: "Auto vendute" }, <div key={s.label} className="stat-block">
 <span className="stat-num">{s.num}</span>
 <span className="stat-label">{s.label}</span>
 </div>
 ))}
 </div>
 <div className="section">
 <div style={{ textAlign: "center", marginBottom: "2rem" }}>
 <h2 className="section-title">I nostri valori</h2>
 <div className="ornament"><div className="ornament-line" /><div className="ornament </div>
 <div className="values-grid">
 {[
 { icon: " ", title: "Controllo prima della vendita", text: "Ogni auto viene veri { icon: " ", title: "Trattativa senza pressione", text: "Non lavoriamo a provvig { icon: " ", title: "Prova prima di comprare", text: "Puoi fare un giro di prova ].map(v => (
 <div key={v.title} className="value-card">
 <span className="value-icon">{v.icon}</span>
 <p className="value-title">{v.title}</p>
 <p className="value-text">{v.text}</p>
 </div>
 ))}
 </div>
 </div>
 <div className="section" style={{ paddingBottom: "1rem" }}>
 <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
 <h2 className="section-title">Perché sceglierci</h2>
 <div className="ornament"><div className="ornament-line" /><div className="ornament </div>
 <div className="trust-badges">
 {[[" ","Attività regolare con P.IVA"],[" ","Sede fisica verificabile a Roma"],["  <div key={label} className="trust-badge">
 <span className="trust-badge-icon">{icon}</span>
 <span>{label}</span>
 </div>
 ))}
 </div>
 </div>
 <div className="cta-strip">
 <div className="cta-inner">
 <div>
 <h3 className="cta-title">Vieni a trovarci senza impegno</h3>
 <p className="cta-sub">Via Collatina 381, Roma — aperto lun–sab 9:00–19:00</p>
 </div>
 <button className="cta-button" onClick={onContact}>Contattaci →</button>
 </div>
 </div>
 </>
 );
}
// ─────────────────────────────────────────────────────────────
// MOBILE NAV
// ─────────────────────────────────────────────────────────────
function MobileNav({ page, navigateTo, adminUser, setAdminOpen }) {
 const [menuOpen, setMenuOpen] = useState(false);
 return (
 <>
 <div className="nav-mobile-actions" style={{ gap: "0.4rem", alignItems: "center" }}>
 <a href="tel:+393000008654" style={{ background:"rgba(201,168,76,0.15)",border:"1px s <button style={{ background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,2 {menuOpen ? "✕" : "☰"}
 </button>
 </div>
 {menuOpen && (
 <div style={{ position:"fixed",top:"var(--nav-h)",left:0,right:0,background:"rgba(22, {NAV_ITEMS.map(item => (
 <button key={item} style={{ background:page===item?"rgba(201,168,76,0.12)":"none" {item==="Home"&&" "}{item==="Vendita"&&" "}{item==="Noleggio"&&" "}{item </button>
 ))}
 <div style={{ height:"1px",background:"rgba(255,255,255,0.08)",margin:"0.5rem 0" }} <button style={{ background:"rgba(201,168,76,0.12)",border:"1px solid rgba(201,168, {adminUser ? "Admin ✓" : "Login"}
 </button>
 </div>
 )}
 </>
 );
}
// ─────────────────────────────────────────────────────────────
// HELPER COMPONENTS
// ─────────────────────────────────────────────────────────────
function Tag({ label }) { return <span className="tag">{label}</span>; }
function EmptyState({ text }) { return <p style={{ textAlign:"center",color:"#aaa",padding:"3function Modal({ children, onClose, wide }) {
 return (
 <div className="overlay" onClick={onClose}>
 <div className={wide ? "edit-modal" : "modal"} onClick={e => e.stopPropagation()}>
 <button className="modal-close" onClick={onClose}>✕</button>
 {children}
 </div>
 </div>
 );
}
// ─────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────
export default function App() {
 const [cars, setCars] = useState([]);
 const [loading, setLoading] = useState(true);
 const [dbConnected, setDbConnected] = useState(false);
 const [page, setPage] = useState("Home");
 const [adminOpen, setAdminOpen] = useState(false);
 const [adminUser, setAdminUser] = useState(null);
 const [authLoading, setAuthLoading] = useState(false);
 const [authError, setAuthError] = useState("");
 const [loginEmail, setLoginEmail] = useState("");
 const [loginPassword, setLoginPassword] = useState("");
 const [selectedCar, setSelectedCar] = useState(null);
 const [galleryOpen, setGalleryOpen] = useState(false);
 const [galleryStartIdx, setGalleryStartIdx] = useState(0);
 const [filters, setFilters] = useState({ ...EMPTY_FILTERS });
 const [saving, setSaving] = useState(false);
 const [uploading, setUploading] = useState(false);
 // Edit state
 const [editingCar, setEditingCar] = useState(null);
 const [editOpen, setEditOpen] = useState(false);
 const navHidden = useNavHide();
 useEffect(() => {
 loadCars();
 supabase.auth.getSession().then(({ data: { session } }) => setAdminUser(session?.user ??  const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setAd return () => subscription.unsubscribe();
 }, []);
 async function loadCars() {
 setLoading(true);
 try {
 const { data, error } = await supabase.from("cars").select("*").order("created_at", { a if (error) throw error;
 setCars(data || []);
 setDbConnected(true);
 } catch {
 setCars(FALLBACK_CARS);
 setDbConnected(false);
 }
 setLoading(false);
 }
 async function handleAdminLogin(e) {
 e.preventDefault();
 setAuthLoading(true); setAuthError("");
 const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: l if (error) setAuthError("Credenziali errate. Riprova.");
 else { setLoginEmail(""); setLoginPassword(""); }
 setAuthLoading(false);
 }
 async function handleAdminLogout() { await supabase.auth.signOut(); setAdminOpen(false); }
 // ── Aggiungi annuncio
 async function handleAddCar(form, newFiles, existingUrls) {
 if (!adminUser) return;
 setSaving(true); setUploading(true);
 let imageUrls = [...existingUrls];
 if (newFiles.length > 0) {
 const uploaded = await uploadImages(newFiles);
 imageUrls = [...imageUrls, ...uploaded];
 }
 setUploading(false);
 const newCar = {
 brand: form.brand, model: form.model,
 year: parseInt(form.year), price: parseFloat(form.price), km: parseInt(form.km),
 fuel: form.fuel, cambio: form.cambio, type: form.type,
 status: form.status || "disponibile",
 features: form.features,
 featured: form.featured,
 images: imageUrls.length ? imageUrls : [PLACEHOLDER],
 description: form.description,
 sold_at: form.status === "venduta" ? new Date().toISOString() : null,
 };
 if (dbConnected) {
 const { data, error } = await supabase.from("cars").insert([newCar]).select().single();
 if (error) { alert("Errore DB: " + error.message); setSaving(false); return; }
 setCars(prev => [data, ...prev]);
 } else {
 setCars(prev => [{ ...newCar, id: Date.now() }, ...prev]);
 }
 setSaving(false);
 alert("Annuncio aggiunto!");
 }
 // ── Modifica annuncio
 async function handleEditCar(form, newFiles, existingUrls) {
 if (!adminUser || !editingCar) return;
 setSaving(true); setUploading(true);
 let imageUrls = [...existingUrls];
 if (newFiles.length > 0) {
 const uploaded = await uploadImages(newFiles);
 imageUrls = [...imageUrls, ...uploaded];
 }
 setUploading(false);
 const updates = {
 brand: form.brand, model: form.model,
 year: parseInt(form.year), price: parseFloat(form.price), km: parseInt(form.km),
 fuel: form.fuel, cambio: form.cambio, type: form.type,
 status: form.status,
 features: form.features,
 featured: form.featured,
 images: imageUrls.length ? imageUrls : [PLACEHOLDER],
 description: form.description,
 sold_at: form.status === "venduta"
 ? (editingCar.sold_at || new Date().toISOString())
 : null,
 };
 if (dbConnected) {
 const { error } = await supabase.from("cars").update(updates).eq("id", editingCar.id);
 if (error) { alert("Errore aggiornamento: " + error.message); setSaving(false); return; }
 setCars(prev => prev.map(c => c.id === editingCar.id ? { ...c, ...updates } : c));
 setSaving(false);
 setEditOpen(false);
 setEditingCar(null);
 alert("Annuncio aggiornato!");
 }
 // ── Toggle vetrina
 async function toggleFeatured(id) {
 if (!adminUser) return;
 const car = cars.find(c => c.id === id);
 const currentFeatured = cars.filter(c => c.featured);
 let updates = [];
 if (!car.featured && currentFeatured.length >= 3) {
 updates = [{ id: currentFeatured[0].id, featured: false }, { id, featured: true }];
 } else {
 updates = [{ id, featured: !car.featured }];
 }
 setCars(prev => prev.map(c => { const u = updates.find(x => x.id === c.id); return u ? {  if (dbConnected) for (const u of updates) await supabase.from("cars").update({ featured:  }
 // ── Toggle stato venduta / disponibile
 async function toggleSold(id) {
 if (!adminUser) return;
 const car = cars.find(c => c.id === id);
 const newStatus = car.status === "venduta" ? "disponibile" : "venduta";
 const sold_at = newStatus === "venduta" ? new Date().toISOString() : null;
 setCars(prev => prev.map(c => c.id === id ? { ...c, status: newStatus, sold_at } : c));
 if (dbConnected) await supabase.from("cars").update({ status: newStatus, sold_at }).eq("i }
 // ── Toggle stato noleggiata / disponibile
 async function toggleNoleggiata(id) {
 if (!adminUser) return;
 const car = cars.find(c => c.id === id);
 const newStatus = car.status === "noleggiata" ? "disponibile" : "noleggiata";
 setCars(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
 if (dbConnected) await supabase.from("cars").update({ status: newStatus, sold_at: null }) }
 // ── Elimina (solo vendute)
 async function deleteCar(id) {
 if (!adminUser) return;
 const car = cars.find(c => c.id === id);
 if (car.status !== "venduta") {
 alert("Puoi eliminare solo le auto con stato VENDUTA.");
 return;
 }
 if (!confirm("Eliminare questo annuncio? L'operazione è irreversibile.")) return;
 setCars(prev => prev.filter(c => c.id !== id));
 if (dbConnected) await supabase.from("cars").delete().eq("id", id);
 }
 // ── Filtri
 function applyFilters(list) {
 return list.filter(car => {
 if (filters.fuel && car.fuel !== filters.fuel) return false;
 if (filters.cambio && car.cambio !== filters.cambio) return false;
 if (filters.yearFrom && car.year < parseInt(filters.yearFrom)) return false;
 if (filters.yearTo && car.year > parseInt(filters.yearTo)) return false;
 if (filters.kmMax && car.km > parseInt(filters.kmMax)) return false;
 if (filters.priceMax && car.price > parseInt(filters.priceMax)) return false;
 if (filters.features?.length > 0) {
 // AND logic: l'auto deve avere TUTTE le caratteristiche selezionate
 for (const f of filters.features) {
 if (!(car.features || []).includes(f)) return false;
 }
 }
 return true;
 });
 }
 function navigateTo(newPage) {
 setPage(newPage);
 setFilters({ ...EMPTY_FILTERS });
 }
 function openCar(car) { setSelectedCar(car); setGalleryOpen(false); setGalleryStartIdx(0);  function openZoom(idx) { setGalleryStartIdx(idx); setGalleryOpen(true); }
 const featuredCars = cars.filter(c => c.featured).slice(0, 3);
 const saleCars = cars.filter(c => c.type === "vendita");
 const rentalCars = cars.filter(c => c.type === "noleggio");
 const filteredSale = applyFilters(saleCars);
 const filteredRental = applyFilters(rentalCars);
 // Status label helper
 function statusLabel(car) {
 if (car.status === "venduta") return <span style={{ color: "#e74c3c" }}>VENDUTA</span>;
 if (car.status === "noleggiata") return <span style={{ color: "#7f8c8d" }}>NOLEGGIATA</sp return <span style={{ color: "#27ae60" }}>Disponibile</span>;
 }
 return (
 <div className="page-wrapper">
 <GlobalStyles />
 {!dbConnected && !loading && <div className="banner"> Modalità demo — Supabase non co {/* ── NAVBAR ── */}
 <nav className={`nav-bar${navHidden ? " hidden" : ""}`}>
 <div className="nav-inner">
 <div style={{ cursor:"pointer",letterSpacing:"0.12em",fontSize:"1.25rem",display:"f <span style={{ color:"#c9a84c",fontFamily:"'Playfair Display',serif",fontWeight:9 <span style={{ color:"#fff",fontFamily:"'DM Sans',sans-serif",fontWeight:300,lett </div>
 <div className="nav-items-desktop" style={{ display:"flex",gap:"0.25rem",alignItems
 {NAV_ITEMS.map(item => (
 <button key={item} style={{ background:page===item?"rgba(201,168,76,0.1)":"none ))}
 <button style={{ background:"rgba(201,168,76,0.15)",border:"1px solid rgba(201,16 {adminUser ? "Admin ✓" : "Login"}
 </button>
 </div>
 <MobileNav page={page} navigateTo={navigateTo} adminUser={adminUser} setAdminOpen={ </div>
 </nav>
 <div className="page-content">
 {loading && (
 <div className="loading-screen">
 <div className="spinner" />
 <p>Caricamento...</p>
 </div>
 )}
 {!loading && (
 <>
 {/* ── HOME ── */}
 {page === "Home" && (
 <>
 <div className="hero">
 <div className="hero-overlay" />
 <div className="hero-content">
 <p className="hero-eyebrow">Vendita &amp; Noleggio Auto · Roma</p>
 <h1 className="hero-title">La tua prossima auto<br />ti aspetta qui.</h1>
 <div className="hero-btns">
 <button className="hero-btn" onClick={() => navigateTo("Vendita")}>Acqu <button className="hero-btn hero-btn-outline" onClick={() => navigateTo </div>
 </div>
 </div>
 <section className="section">
 <div className="section-header">
 <h2 className="section-title">In Vetrina</h2>
 <div className="ornament"><div className="ornament-line" /><div className <p className="section-sub">Le auto del momento selezionate per te</p>
 </div>
 {featuredCars.length === 0
 ? <p style={{ textAlign:"center",color:"#aaa",padding:"2.5rem 0" }}>Nessu : <div className="grid-3">{featuredCars.map(car => <CarCard key={car.id}  }
 </section>
 <div className="cta-strip">
 <div className="cta-inner">
 <div>
 <h3 className="cta-title">Hai bisogno di un'auto per qualche giorno?</h <p className="cta-sub">Noleggio flessibile, disponibile subito.</p>
 </div>
 <button className="cta-button" onClick={() => navigateTo("Noleggio")}>Ved </div>
 </div>
 </>
 )}
 {/* ── VENDITA ── */}
 {page === "Vendita" && (
 <section className="section">
 <div className="section-header">
 <h2 className="section-title">Auto in Vendita</h2>
 <div className="ornament"><div className="ornament-line" /><div className=" </div>
 <AdvancedFilters filters={filters} onChange={setFilters} type="vendita" resul {filteredSale.length === 0
 ? <EmptyState text="Nessuna auto corrisponde ai filtri selezionati." />
 : <div className="grid-3">{filteredSale.map(car => <CarCard key={car.id} ca }
 </section>
 )}
 {/* ── NOLEGGIO ── */}
 {page === "Noleggio" && (
 <section className="section">
 <div className="section-header">
 <h2 className="section-title">Auto a Noleggio</h2>
 <div className="ornament"><div className="ornament-line" /><div className=" <p className="section-sub">Prezzi al giorno — disponibilità immediata</p>
 </div>
 <AdvancedFilters filters={filters} onChange={setFilters} type="noleggio" resu {filteredRental.length === 0
 ? <EmptyState text="Nessuna auto corrisponde ai filtri selezionati." />
 : <div className="grid-3">{filteredRental.map(car => <CarCard key={car.id}  }
 </section>
 )}
 {page === "Chi Siamo" && <ChiSiamo onContact={() => navigateTo("Contatti")} />}
 {/* ── CONTATTI ── */}
 {page === "Contatti" && (
 <section className="section">
 <div className="section-header">
 <h2 className="section-title">Contattaci</h2>
 <div className="ornament"><div className="ornament-line" /><div className=" <p className="section-sub">Siamo a tua disposizione</p>
 </div>
 <div className="contact-card">
 {[[" ","Via Collatina 381, Roma (RM)"],[" ","393 000 8654 — 06 88922000" <div key={text} className="contact-item">
 <span className="contact-icon">{icon}</span>
 <span>{text}</span>
 </div>
 ))}
 </div>
 </section>
 )}
 </>
 )}
 </div>
 <footer className="footer">
 <p className="footer-logo"><span style={{ color:"#c9a84c" }}>2R</span> CAR</p>
 <p className="footer-sub">Via Collatina, 381 — Roma</p>
 {dbConnected && <p style={{ fontSize:"0.72rem",color:"#2ecc71",marginTop:"0.3rem" }}> </footer>
 {/* WhatsApp FAB */}
 <a className="whatsapp-fab" href="https://wa.me/393930008654?text=Ciao%2C%20vi%20contat <span className="whatsapp-fab-icon"><IconWhatsApp /></span>
 Scrivici su WhatsApp
 </a>
 {/* ── MODAL AUTO ── */}
 {selectedCar && (
 <Modal onClose={() => { setSelectedCar(null); setGalleryOpen(false); }}>
 <ModalGallery images={selectedCar.images} onZoom={openZoom} />
 <div className="modal-body">
 <div className="modal-tags">
 {/* Badge stato */}
 <span className="tag" style={{
 background: selectedCar.status === "venduta" ? "#e74c3c" : selectedCar.status color: "#fff"
 }}>
 {selectedCar.status === "venduta" ? "Venduta" : selectedCar.status === "noleg </span>
 </div>
 <h2 className="modal-title">{selectedCar.brand} {selectedCar.model}</h2>
 <p className="modal-year">{selectedCar.year} · {selectedCar.fuel} · {selectedCar.
 <p className="modal-cambio">
 {selectedCar.cambio === "automatico" ? " Cambio Automatico" : " Cambio Manu </p>
 {/* Caratteristiche */}
 {(selectedCar.features || []).length > 0 && (
 <div style={{ marginBottom: "1rem" }}>
 <p className="modal-features-title">Caratteristiche</p>
 <div className="modal-features-grid">
 {(selectedCar.features || []).map(f => <Tag key={f} label={f} />)}
 </div>
 </div>
 )}
 {selectedCar.status !== "venduta" && (
 <p className="modal-price">
 {selectedCar.type === "noleggio"
 ? `€ ${selectedCar.price}/giorno`
 : `€ ${selectedCar.price?.toLocaleString()}`}
 </p>
 )}
 {selectedCar.description && <p className="modal-description">{selectedCar.descrip {selectedCar.status === "venduta" ? (
 <div style={{ background:"#fdecea",color:"#e74c3c",borderRadius:"0.5rem",paddin ) : selectedCar.status === "noleggiata" ? (
 <div style={{ background:"#f0f0f0",color:"#7f8c8d",borderRadius:"0.5rem",paddin ) : (
 <a href="tel:+393000008654" className="contact-call-btn"> Chiama per info</a>
 )}
 </div>
 </Modal>
 )}
 {selectedCar && galleryOpen && (
 <PhotoGallery images={selectedCar.images} startIdx={galleryStartIdx} onClose={() => s )}
 {/* ── EDIT MODAL ── */}
 {editOpen && editingCar && (
 <Modal onClose={() => { setEditOpen(false); setEditingCar(null); }} wide>
 <AdminCarForm
 initial={{
 ...editingCar,
 features: editingCar.features || [],
 year: String(editingCar.year),
 price: String(editingCar.price),
 km: String(editingCar.km),
 }}
 onSubmit={handleEditCar}
 saving={saving}
 uploading={uploading}
 title={` Modifica: ${editingCar.brand} ${editingCar.model}`}
 submitLabel="Aggiorna Annuncio"
 />
 </Modal>
 )}
 {/* ── ADMIN MODAL ── */}
 {adminOpen && (
 <Modal onClose={() => setAdminOpen(false)} wide>
 {!adminUser ? (
 <div className="admin-login">
 <div className="login-icon"> </div>
 <h2 className="admin-title" style={{ textAlign:"center" }}>Login</h2>
 <p className="login-sub">Inserisci le credenziali</p>
 <form onSubmit={handleAdminLogin} style={{ width:"100%",display:"flex",flexDire <input type="email" placeholder="Email" required value={loginEmail} onChange= <input type="password" placeholder="Password" required value={loginPassword}  {authError && <p className="auth-error">{authError}</p>}
 <button type="submit" className="submit-btn" style={{ opacity:authLoading?0.6 {authLoading ? "Accesso in corso..." : "Entra"}
 </button>
 </form>
 </div>
 ) : (
 <div className="admin-panel">
 <div className="admin-header">
 <div>
 <h2 className="admin-title">Pannello Admin</h2>
 <p className="admin-user-badge">✓ {adminUser.email}</p>
 </div>
 <button className="logout-btn" onClick={handleAdminLogout}>Esci</button>
 </div>
 {/* ── Nuovo annuncio ── */}
 <AdminCarForm
 initial={EMPTY_FORM}
 onSubmit={handleAddCar}
 saving={saving}
 uploading={uploading}
 title=" Nuovo Annuncio"
 submitLabel="Aggiungi Annuncio"
 />
 {/* ── Lista annunci ── */}
 <div style={{ padding: "0 1.75rem 1.75rem" }}>
 <p className="admin-section-title" style={{ marginTop:"2rem" }}> Gestisci A <div className="admin-list">
 {cars.map(car => (
 <div key={car.id} className="admin-list-item">
 <div style={{ display:"flex",alignItems:"center",gap:"0.75rem",minWidth <img src={car.images?.[0] || PLACEHOLDER} alt="" style={{ width:"3.25 <div className="admin-list-info" style={{ minWidth:0 }}>
 <strong style={{ fontSize:"0.88rem" }}>{car.brand} {car.model}</str <span className="admin-list-sub">
 {car.year} · {statusLabel(car)} · {car.cambio} · {car.images?.len </span>
 </div>
 </div>
 <div className="admin-list-actions">
 {/* Vetrina */}
 <button className="admin-action-btn" title="Vetrina"
 style={{ background:car.featured?"#f39c12":"#ecf0f1",color:car.feat onClick={() => toggleFeatured(car.id)}> </button>
 {/* Venduta */}
 <button className="admin-action-btn"
 style={{ background:car.status==="venduta"?"#e74c3c":"#ecf0f1",colo onClick={() => toggleSold(car.id)}
 title={car.status==="venduta"?"Segna come disponibile":"Segna come  {car.status==="venduta"?"✓V":"VND"}
 </button>
 {/* Noleggiata */}
 <button className="admin-action-btn"
 style={{ background:car.status==="noleggiata"?"#7f8c8d":"#ecf0f1",c onClick={() => toggleNoleggiata(car.id)}
 title={car.status==="noleggiata"?"Segna come disponibile":"Segna co {car.status==="noleggiata"?"✓N":"NLG"}
 </button>
 {/* Modifica */}
 <button className="admin-action-btn"
 style={{ background:"#3498db",color:"#fff" }}
 onClick={() => { setEditingCar(car); setEditOpen(true); setAdminOpe title="Modifica"> </button>
 {/* Elimina (solo vendute) */}
 <button className="admin-action-btn"
 style={{ background:car.status==="venduta"?"#e74c3c":"#ddd",color:c onClick={() => deleteCar(car.id)}
 title={car.status==="venduta"?"Elimina":"Solo le auto vendute posso </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 )}
 </Modal>
 )}
 </div>
 );
}
