import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jveldjtakpniboajesyv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2ZWxkanRha3BuaWJvYWplc3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MDk0MzMsImV4cCI6MjA5NDA4NTQzM30.ptt5U27hgBtVsmSKE23b7ys6kehYzqiJMOlvZOPBD2k";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Caratteristiche disponibili (SOLO features, cambio è campo separato)
const FEATURES_AVAILABLE = [
  "Aria condizionata", "Navigatore", "Sensori parcheggio", "Bluetooth",
  "Telecamera retromarcia", "Cruise control", "Pelle", "Tetto apribile",
  "Cerchi in lega", "Fari LED", "Sedili riscaldati", "Android Auto / CarPlay",
  "4x4", "Ibrida", "Elettrica",
];

const NAV_ITEMS = ["Home", "Vendita", "Noleggio", "Chi Siamo", "Contatti"];
const PLACEHOLDER = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80";

const EMPTY_FILTERS = {
  features: [],   // multi-select array
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
  { id: 1, brand: "Mercedes-Benz", model: "Classe E", year: 2019, price: 24900, km: 87000, fuel: "Diesel", type: "vendita", cambio: "automatico", status: "disponibile", features: ["Navigatore", "Pelle", "Sensori parcheggio"], featured: true, images: ["https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80"], description: "" },
  { id: 2, brand: "BMW", model: "Serie 3 Touring", year: 2020, price: 28500, km: 62000, fuel: "Diesel", type: "vendita", cambio: "automatico", status: "venduta", features: ["Tetto apribile", "Aria condizionata", "Bluetooth"], featured: true, images: ["https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80"], description: "" },
  { id: 3, brand: "Volkswagen", model: "Tiguan R-Line", year: 2021, price: 120, km: 45000, fuel: "Benzina", type: "noleggio", cambio: "automatico", status: "noleggiata", features: ["4x4", "Navigatore", "Sensori parcheggio", "Bluetooth"], featured: true, images: ["https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80"], description: "" },
];

async function uploadImages(files) {
  const urls = [];
  for (const file of files) {
    const ext = file.name.split(".").pop();
    const path = `cars/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("car-images").upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) { console.error("Upload error:", error.message); continue; }
    const { data } = supabase.storage.from("car-images").getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

// ─────────────────────────────────────────────────────────────
//  GLOBAL CSS
// ─────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

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

  .page-wrapper { display: flex; flex-direction: column; min-height: 100vh; padding-top: var(--nav-h); }
  .page-content { flex: 1; }

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
    background: url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80) center/cover no-repeat;
    display: flex; align-items: center;
  }
  .hero-overlay { position: absolute; inset: 0; background: linear-gradient(130deg, rgba(26,26,46,0.88) 0%, rgba(26,26,46,0.35) 100%); }
  .hero-content { position: relative; max-width: 72rem; margin: 0 auto; padding: 0 1.5rem; width: 100%; }
  .hero-eyebrow { font-family: 'DM Sans', sans-serif; color: var(--gold); letter-spacing: 0.28em; font-size: 0.7rem; text-transform: uppercase; font-weight: 500; margin-bottom: 0.75rem; }
  .hero-title { font-family: 'Playfair Display', serif; color: #fff; font-size: clamp(2rem, 5vw, 3.6rem); font-weight: 900; line-height: 1.15; margin-bottom: 2rem; text-shadow: 0 2px 24px rgba(0,0,0,0.4); letter-spacing: -0.01em; }
  .hero-btns { display: flex; gap: 1rem; flex-wrap: wrap; }
  .hero-btn { background: var(--gold); border: none; color: var(--navy); padding: 0.85em 2.2em; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 700; cursor: pointer; border-radius: 3px; letter-spacing: 0.06em; text-transform: uppercase; transition: background 0.2s, transform 0.15s; }
  .hero-btn:hover { background: var(--gold-light); transform: translateY(-1px); }
  .hero-btn-outline { background: transparent; border: 1.5px solid rgba(255,255,255,0.7); color: #fff; }
  .hero-btn-outline:hover { background: rgba(255,255,255,0.1); transform: translateY(-1px); }

  .section { max-width: 72rem; margin: 0 auto; padding: clamp(2.5rem, 6vw, 5rem) 1.5rem; }
  .section-header { text-align: center; margin-bottom: 2.5rem; }
  .section-title { font-family: 'Playfair Display', serif; font-size: clamp(1.6rem, 3.5vw, 2.4rem); font-weight: 700; color: var(--navy); margin-bottom: 0.5rem; letter-spacing: -0.01em; }
  .section-sub { color: var(--muted); font-size: 0.95rem; }

  .grid-3 { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr)); gap: 1.5rem; }

  /* ── Car Card ── */
  .car-card { background: var(--white); border-radius: 0.75rem; overflow: hidden; cursor: pointer; box-shadow: var(--card-shadow); transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease; border: 1px solid var(--border); }
  .car-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.13); }
  .car-card.is-noleggiata { background: #f9f9f9; }
  .card-img-wrap { position: relative; height: 12.5rem; overflow: hidden; }
  .card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease, filter 0.3s; display: block; }
  .car-card:hover .card-img { transform: scale(1.03); }
  .card-badge { position: absolute; top: 0.75rem; right: 0.75rem; color: #fff; font-size: 0.65rem; font-weight: 700; padding: 0.3em 0.75em; border-radius: 999px; letter-spacing: 0.08em; text-transform: uppercase; font-family: 'DM Sans', sans-serif; }
  .photo-dots { position: absolute; bottom: 0.6rem; left: 50%; transform: translateX(-50%); display: flex; gap: 0.3rem; }
  .photo-dot { width: 5px; height: 5px; border-radius: 50%; transition: background 0.2s; }
  .card-body { padding: 1.25rem; }
  .card-tags { display: flex; gap: 0.4rem; margin-bottom: 0.6rem; flex-wrap: wrap; }
  .card-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; color: var(--navy); margin-bottom: 0.3rem; }
  .card-sub { color: var(--muted); font-size: 0.8rem; margin-bottom: 0.75rem; }
  .card-price { font-family: 'Playfair Display', serif; font-size: 1.35rem; font-weight: 700; color: var(--gold); }
  .card-price-sub { font-size: 0.75rem; color: var(--muted); font-weight: 400; font-family: 'DM Sans', sans-serif; }
  .card-cambio-badge { display: inline-flex; align-items: center; gap: 0.3em; background: var(--navy); color: var(--gold); font-size: 0.62rem; font-weight: 700; padding: 0.25em 0.6em; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.06em; }

  /* ── Tags / Features ── */
  .tag { background: #f0ede6; color: #666; font-size: 0.7rem; padding: 0.25em 0.65em; border-radius: 999px; font-family: 'DM Sans', sans-serif; font-weight: 500; letter-spacing: 0.03em; }

  /* ── Sold overlay ── */
  .sold-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.45); display: flex; align-items: center; justify-content: center; pointer-events: none; }
  .sold-stamp { border: 3px solid #e74c3c; color: #e74c3c; font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 900; padding: 0.2em 0.6em; border-radius: 4px; letter-spacing: 0.12em; transform: rotate(-12deg); background: rgba(0,0,0,0.2); text-shadow: 0 1px 4px rgba(0,0,0,0.4); }
  .noleggiata-overlay { position: absolute; inset: 0; background: rgba(180,180,180,0.18); display: flex; align-items: center; justify-content: center; pointer-events: none; }
  .noleggiata-stamp { border: 2.5px solid #7f8c8d; color: #7f8c8d; font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 900; padding: 0.2em 0.6em; border-radius: 4px; letter-spacing: 0.1em; transform: rotate(-12deg); background: rgba(255,255,255,0.35); }

  /* ── Advanced Filters ── */
  .filters-wrapper { margin-bottom: 1.75rem; }
  .filters-bar { display: flex; align-items: center; justify-content: space-between; background: var(--white); border: 1px solid var(--border); border-radius: 0.6rem; padding: 0.7rem 1rem; cursor: pointer; user-select: none; transition: border-color 0.18s; }
  .filters-bar:hover { border-color: var(--gold); }
  .filters-bar-left { display: flex; align-items: center; gap: 0.6rem; font-size: 0.88rem; font-weight: 600; color: var(--navy); }
  .filters-active-badge { background: var(--navy); color: var(--gold); font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 999px; }
  .filters-reset-btn { font-size: 0.75rem; color: #999; background: none; border: 1px solid var(--border); border-radius: 0.3rem; padding: 2px 8px; cursor: pointer; transition: background 0.15s; }
  .filters-reset-btn:hover { background: #f0ede6; }
  .filters-arrow { font-size: 0.8rem; color: #aaa; display: inline-block; transition: transform 0.2s; }
  .filters-panel { background: var(--white); border: 1px solid var(--border); border-top: none; border-radius: 0 0 0.6rem 0.6rem; padding: 1.1rem; display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.85rem 1rem; }
  .filter-group label { display: block; font-size: 0.68rem; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.09em; margin-bottom: 0.35rem; }
  .filter-select { width: 100%; padding: 0.5em 0.7em; border-radius: 0.4rem; border: 1px solid var(--border); background: var(--cream); font-family: 'DM Sans', sans-serif; font-size: 0.85rem; color: var(--text); outline: none; transition: border-color 0.18s; appearance: auto; }
  .filter-select:focus { border-color: var(--gold); }
  .filter-divider { grid-column: 1 / -1; border: none; border-top: 1px solid var(--border); margin: 0.2rem 0; }
  .filter-features-area { grid-column: 1 / -1; }
  .filter-features-label { font-size: 0.68rem; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.09em; margin-bottom: 0.5rem; display: block; }
  .filter-features-row { display: flex; gap: 0.4rem; flex-wrap: wrap; }
  .filter-tag-btn { background: var(--white); border: 1px solid var(--border); color: #666; padding: 0.3em 0.85em; border-radius: 999px; cursor: pointer; font-size: 0.78rem; font-family: 'DM Sans', sans-serif; font-weight: 500; transition: all 0.15s; }
  .filter-tag-btn:hover { border-color: var(--gold); color: var(--navy); }
  .filter-tag-btn.active { background: var(--navy); border-color: var(--navy); color: var(--gold); }
  .filters-summary { font-size: 0.8rem; color: var(--muted); margin-top: 0.6rem; min-height: 1.2rem; }

  /* ── CTA Strip ── */
  .cta-strip { background: var(--navy); padding: clamp(2rem, 5vw, 3.5rem) 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap; }
  .cta-inner { max-width: 72rem; margin: 0 auto; width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap; }
  .cta-title { font-family: 'Playfair Display', serif; color: #fff; font-size: clamp(1.1rem, 2.5vw, 1.5rem); font-weight: 700; margin-bottom: 0.3rem; }
  .cta-sub { color: rgba(255,255,255,0.55); font-size: 0.9rem; }
  .cta-button { background: var(--gold); border: none; color: var(--navy); padding: 0.85em 2em; font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 700; cursor: pointer; border-radius: 3px; letter-spacing: 0.06em; text-transform: uppercase; white-space: nowrap; transition: background 0.2s, transform 0.15s; flex-shrink: 0; }
  .cta-button:hover { background: var(--gold-light); transform: translateY(-1px); }

  /* ── Contatti ── */
  .contact-card { background: var(--white); border-radius: 0.75rem; padding: clamp(1.5rem, 4vw, 2.5rem); max-width: 32rem; margin: 0 auto; box-shadow: var(--card-shadow); border: 1px solid var(--border); display: flex; flex-direction: column; gap: 1.25rem; }
  .contact-item { display: flex; align-items: center; gap: 1rem; font-size: 1rem; line-height: 1.4; }
  .contact-icon { font-size: 1.4rem; width: 2rem; flex-shrink: 0; }

  /* ── Footer ── */
  .footer { background: #111; color: #555; text-align: center; padding: 2.5rem 1.5rem; margin-top: auto; }
  .footer-logo { font-family: 'Playfair Display', serif; font-size: 1.3rem; letter-spacing: 0.12em; margin-bottom: 0.5rem; }
  .footer-sub { font-size: 0.78rem; }

  /* ── Modal / Overlay ── */
  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
  .modal { background: var(--white); border-radius: 1rem; width: 100%; max-width: 36rem; max-height: 90vh; overflow-y: auto; position: relative; box-shadow: 0 24px 80px rgba(0,0,0,0.3); }
  .modal-close { position: absolute; top: 1rem; right: 1rem; background: rgba(0,0,0,0.08); border: none; border-radius: 50%; width: 2rem; height: 2rem; cursor: pointer; z-index: 10; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
  .modal-close:hover { background: rgba(0,0,0,0.15); }

  .modal-gallery { position: relative; height: 15rem; overflow: hidden; border-radius: 1rem 1rem 0 0; background: #111; user-select: none; }
  .modal-gallery-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: opacity 0.2s; }
  .modal-gallery-nav { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.45); border: none; color: #fff; border-radius: 50%; width: 2.2rem; height: 2.2rem; font-size: 1.4rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; z-index: 5; }
  .modal-gallery-nav:hover { background: rgba(0,0,0,0.7); }
  .modal-gallery-counter { position: absolute; bottom: 0.6rem; right: 0.75rem; background: rgba(0,0,0,0.55); color: #fff; font-size: 0.72rem; padding: 0.25em 0.7em; border-radius: 999px; backdrop-filter: blur(4px); }
  .modal-gallery-dots { position: absolute; bottom: 0.65rem; left: 50%; transform: translateX(-50%); display: flex; gap: 0.3rem; }
  .modal-gallery-dot { width: 6px; height: 6px; border-radius: 50%; transition: background 0.2s, transform 0.2s; cursor: pointer; }
  .modal-gallery-zoom-hint { position: absolute; top: 0.6rem; left: 0.75rem; background: rgba(0,0,0,0.45); color: rgba(255,255,255,0.8); font-size: 0.65rem; padding: 0.2em 0.6em; border-radius: 999px; pointer-events: none; }

  .modal-body { padding: 1.75rem; }
  .modal-tags { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
  .modal-title { font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 700; color: var(--navy); margin-bottom: 0.3rem; }
  .modal-year { color: var(--muted); font-size: 0.88rem; margin-bottom: 0.5rem; }
  .modal-cambio { font-size: 0.82rem; color: var(--navy); font-weight: 600; margin-bottom: 0.75rem; }
  .modal-price { font-family: 'Playfair Display', serif; font-size: 1.9rem; font-weight: 700; color: var(--gold); margin-bottom: 0.75rem; }
  .modal-description { font-size: 0.9rem; color: #555; line-height: 1.7; margin-bottom: 1.25rem; }
  .modal-features-title { font-size: 0.72rem; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem; }
  .modal-features-grid { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
  .contact-call-btn { display: block; background: var(--navy); color: var(--gold); text-align: center; padding: 0.9em; border-radius: 0.5rem; font-weight: 700; text-decoration: none; font-size: 1rem; letter-spacing: 0.04em; transition: background 0.18s; }
  .contact-call-btn:hover { background: #2a2a4e; }

  /* ── Gallery lightbox ── */
  .gallery-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 2000; display: flex; align-items: center; justify-content: center; }
  .gallery-box { position: relative; max-width: 56rem; width: 100%; padding: 3rem 1.5rem 1.5rem; }
  .gallery-close { position: absolute; top: 0.5rem; right: 0.75rem; background: rgba(255,255,255,0.1); border: none; color: #fff; border-radius: 50%; width: 2.25rem; height: 2.25rem; cursor: pointer; font-size: 1.1rem; z-index: 10; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
  .gallery-close:hover { background: rgba(255,255,255,0.2); }
  .gallery-main { width: 100%; max-height: 65vh; object-fit: contain; border-radius: 0.5rem; display: block; margin: 0 auto; }
  .gallery-nav { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.12); border: none; color: #fff; border-radius: 50%; width: 2.75rem; height: 2.75rem; font-size: 1.75rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
  .gallery-nav:hover { background: rgba(255,255,255,0.22); }
  .gallery-thumbs { display: flex; gap: 0.5rem; justify-content: center; margin-top: 1rem; flex-wrap: wrap; }
  .gallery-thumb { width: 4rem; height: 3rem; object-fit: cover; border-radius: 0.25rem; cursor: pointer; opacity: 0.45; transition: opacity 0.2s; }
  .gallery-thumb.active { opacity: 1; outline: 2px solid var(--gold); }
  .gallery-counter { text-align: center; color: #666; font-size: 0.8rem; margin-top: 0.6rem; }

  /* ── Admin ── */
  .admin-login { padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 0.9rem; }
  .login-icon { font-size: 2.5rem; }
  .login-sub { color: var(--muted); font-size: 0.82rem; text-align: center; }
  .auth-error { background: #fdecea; color: #e74c3c; border-radius: 0.4rem; padding: 0.5em 0.75em; font-size: 0.82rem; text-align: center; width: 100%; }
  .admin-panel { padding: 1.75rem; }
  .admin-title { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 700; color: var(--navy); }
  .admin-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
  .admin-user-badge { color: #27ae60; font-size: 0.75rem; margin-top: 0.25rem; font-family: monospace; }
  .logout-btn { background: #f8f8f8; border: 1px solid var(--border); color: #666; padding: 0.4em 0.9em; border-radius: 0.4rem; cursor: pointer; font-size: 0.82rem; font-family: 'DM Sans', sans-serif; transition: background 0.15s; }
  .logout-btn:hover { background: #eee; }
  .admin-section-title { font-size: 0.75rem; font-weight: 700; color: #aaa; margin: 0 0 1rem; text-transform: uppercase; letter-spacing: 0.1em; }
  .admin-form { display: flex; flex-direction: column; gap: 0.75rem; }
  .form-row { display: flex; gap: 0.75rem; }
  .input, .select-field, .textarea-field { flex: 1; padding: 0.65em 0.9em; border-radius: 0.5rem; border: 1px solid var(--border); font-family: 'DM Sans', sans-serif; font-size: 0.88rem; outline: none; background: var(--white); transition: border-color 0.18s, box-shadow 0.18s; min-width: 0; }
  .textarea-field { resize: vertical; min-height: 5rem; }
  .input:focus, .select-field:focus, .textarea-field:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,168,76,0.15); }

  /* Feature picker */
  .feature-picker { background: #f8f8f8; border-radius: 0.5rem; padding: 0.9rem; }
  .feature-picker-label { font-size: 0.72rem; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.6rem; display: block; }
  .feature-picker-grid { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .feature-picker-btn { background: var(--white); border: 1px solid var(--border); padding: 0.3em 0.75em; border-radius: 999px; cursor: pointer; font-size: 0.75rem; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
  .feature-picker-btn:hover { border-color: var(--gold); }
  .feature-picker-btn.active { background: var(--navy); border-color: var(--navy); color: var(--gold); }

  /* Image upload */
  .dropzone { border: 2px dashed var(--border); border-radius: 0.6rem; padding: 1.5rem 1rem; text-align: center; cursor: pointer; background: #fafafa; transition: all 0.2s; }
  .dropzone.dragging { border-color: var(--gold); background: #fffbf0; }
  .dropzone-text { color: var(--muted); font-size: 0.88rem; line-height: 1.8; }
  .preview-grid { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.6rem; }
  .preview-item { position: relative; width: 5rem; height: 3.75rem; }
  .preview-img { width: 100%; height: 100%; object-fit: cover; border-radius: 0.4rem; display: block; }
  .preview-remove { position: absolute; top: -0.4rem; right: -0.4rem; background: #e74c3c; border: none; color: #fff; border-radius: 50%; width: 1.2rem; height: 1.2rem; font-size: 0.6rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }
  .preview-main { position: absolute; bottom: 0.1rem; left: 0.15rem; background: rgba(0,0,0,0.6); color: #fff; font-size: 0.55rem; padding: 0.1em 0.3em; border-radius: 0.2rem; }
  .check-label { font-size: 0.88rem; display: flex; align-items: center; cursor: pointer; gap: 0.4rem; }

  .submit-btn { background: var(--navy); color: var(--gold); border: none; padding: 0.8em; border-radius: 0.5rem; font-family: 'DM Sans', sans-serif; font-size: 0.95rem; font-weight: 700; cursor: pointer; letter-spacing: 0.04em; transition: background 0.18s, opacity 0.18s; }
  .submit-btn:hover:not(:disabled) { background: #2a2a4e; }
  .submit-btn-secondary { background: #f0ede6; color: var(--navy); border: 1px solid var(--border); }
  .submit-btn-secondary:hover:not(:disabled) { background: #e8e4dc; }

  /* Admin list */
  .admin-list { display: flex; flex-direction: column; gap: 0.6rem; max-height: 20rem; overflow-y: auto; }
  .admin-list-item { display: flex; align-items: center; justify-content: space-between; padding: 0.7rem 0.9rem; background: #f8f8f8; border-radius: 0.5rem; border: 1px solid var(--border); }
  .admin-list-info { display: flex; flex-direction: column; gap: 0.15rem; }
  .admin-list-sub { font-size: 0.75rem; color: var(--muted); }
  .admin-list-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }
  .admin-action-btn { border: none; border-radius: 0.4rem; width: 2rem; height: 2rem; cursor: pointer; font-size: 0.75rem; transition: opacity 0.15s; display: flex; align-items: center; justify-content: center; font-weight: 700; }
  .admin-action-btn:hover { opacity: 0.8; }

  /* Edit modal */
  .edit-modal { background: var(--white); border-radius: 1rem; width: 100%; max-width: 40rem; max-height: 92vh; overflow-y: auto; position: relative; box-shadow: 0 24px 80px rgba(0,0,0,0.3); }

  /* Misc */
  .loading-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 20rem; gap: 1rem; color: var(--muted); }
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner { width: 2.5rem; height: 2.5rem; border: 3px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: spin 0.8s linear infinite; }
  .banner { background: #e67e22; color: #fff; text-align: center; padding: 0.65rem 1rem; font-size: 0.85rem; font-weight: 500; }
  .ornament { display: flex; align-items: center; justify-content: center; gap: 0.75rem; margin: 0 0 2rem; }
  .ornament-line { flex: 1; max-width: 4rem; height: 1px; background: var(--gold); opacity: 0.4; }
  .ornament-dot { width: 0.4rem; height: 0.4rem; background: var(--gold); border-radius: 50%; }

  /* Chi siamo */
  .chisiamo-hero { background: var(--navy); padding: clamp(3rem, 7vw, 5rem) 1.5rem; text-align: center; }
  .chisiamo-hero-eyebrow { color: var(--gold); letter-spacing: 0.28em; font-size: 0.7rem; text-transform: uppercase; font-weight: 500; margin-bottom: 0.75rem; }
  .chisiamo-hero-title { font-family: 'Playfair Display', serif; color: #fff; font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 700; margin-bottom: 1rem; }
  .chisiamo-hero-sub { color: rgba(255,255,255,0.6); font-size: 1rem; max-width: 36rem; margin: 0 auto; line-height: 1.7; }
  .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0; background: var(--gold); max-width: 72rem; margin: 0 auto; }
  .stat-block { padding: 1.75rem 1rem; text-align: center; border-right: 1px solid rgba(26,26,46,0.15); }
  .stat-block:last-child { border-right: none; }
  .stat-num { font-family: 'Playfair Display', serif; font-size: clamp(1.8rem, 4vw, 2.6rem); font-weight: 900; color: var(--navy); display: block; line-height: 1; margin-bottom: 0.3rem; }
  .stat-label { font-size: 0.75rem; color: rgba(26,26,46,0.65); font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; }
  .values-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr)); gap: 1.25rem; margin-top: 0.5rem; }
  .value-card { background: var(--white); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1.5rem 1.25rem; box-shadow: var(--card-shadow); }
  .value-icon { font-size: 1.8rem; margin-bottom: 0.75rem; display: block; }
  .value-title { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 700; color: var(--navy); margin-bottom: 0.4rem; }
  .value-text { font-size: 0.85rem; color: #666; line-height: 1.65; }
  .trust-badges { display: flex; flex-wrap: wrap; justify-content: center; gap: 1.5rem; margin-top: 2rem; }
  .trust-badge { display: flex; align-items: center; gap: 0.6rem; background: var(--white); border: 1px solid var(--border); border-radius: 999px; padding: 0.5em 1.2em; font-size: 0.82rem; font-weight: 500; color: var(--navy); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
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
    .stat-block { padding: 1.25rem 0.75rem; border-right: none; border-bottom: 1px solid rgba(26,26,46,0.15); }
    .stat-block:nth-child(odd) { border-right: 1px solid rgba(26,26,46,0.15); }
    .stat-block:nth-last-child(-n+2) { border-bottom: none; }
    .trust-badges { gap: 0.75rem; margin-top: 1.25rem; }
    .trust-badge { font-size: 0.78rem; padding: 0.45em 0.9em; }
    .gallery-nav { width: 3rem; height: 3rem; font-size: 2rem; }
    .gallery-close { width: 2.75rem; height: 2.75rem; font-size: 1.2rem; }
    .gallery-thumbs { gap: 0.35rem; }
    .gallery-thumb { width: 3rem; height: 2.25rem; }
    .footer { padding: 1.75rem 1rem 5.5rem; }
    .whatsapp-fab { display: flex; align-items: center; justify-content: center; gap: 0.6rem; position: fixed; bottom: 1.25rem; left: 50%; transform: translateX(-50%); z-index: 500; background: #25d366; color: #fff; text-decoration: none; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 1rem; letter-spacing: 0.03em; padding: 0.85em 2em; border-radius: 999px; box-shadow: 0 6px 28px rgba(37,211,102,0.45), 0 2px 8px rgba(0,0,0,0.15); white-space: nowrap; transition: transform 0.2s, box-shadow 0.2s; -webkit-tap-highlight-color: transparent; }
    .whatsapp-fab:active { transform: translateX(-50%) scale(0.96); box-shadow: 0 3px 14px rgba(37,211,102,0.4); }
    .whatsapp-fab-icon { font-size: 1.3rem; line-height: 1; }
    .ornament { margin-bottom: 1.25rem; }
    .input, .select-field, .textarea-field { font-size: 1rem; padding: 0.75em 0.9em; }
    .admin-list-item { flex-wrap: wrap; gap: 0.5rem; }
    .admin-list-actions { margin-left: auto; }
    .admin-action-btn { width: 2.5rem; height: 2.5rem; font-size: 1rem; }
    .nav-mobile-actions { display: flex !important; }
  }

  .nav-mobile-actions { display: none; }
  .nav-items-desktop { display: flex; }
  @media (max-width: 768px) {
    .nav-items-desktop { display: none !important; }
  }

  /* ── INTRO SCREEN ── */
  #intro-screen {
    position: fixed; inset: 0; z-index: 99999;
    background: #04101f;
    display: flex; align-items: center; justify-content: center;
    will-change: opacity;
    transition: opacity 0.75s cubic-bezier(0.4,0,0.2,1);
    overflow: hidden;
  }
  #intro-screen.intro-hidden { opacity: 0; pointer-events: none; }

  .intro-bg { position: absolute; inset: 0; pointer-events: none; }
  .intro-bg-core {
    background: radial-gradient(ellipse 72% 55% at 50% 50%, rgba(10,28,68,0.72) 0%, transparent 72%);
    animation: intro-breathe 9s ease-in-out infinite;
  }
  .intro-bg-tl {
    background: radial-gradient(ellipse 38% 28% at 14% 17%, rgba(16,42,95,0.22) 0%, transparent 70%);
    animation: intro-drift 13s ease-in-out infinite alternate;
  }
  .intro-bg-br {
    background: radial-gradient(ellipse 32% 22% at 85% 81%, rgba(22,48,108,0.16) 0%, transparent 70%);
    animation: intro-drift 16s ease-in-out infinite alternate-reverse;
  }
  .intro-bg-vig {
    background: radial-gradient(ellipse 100% 100% at 50% 50%, transparent 36%, rgba(2,6,18,0.82) 100%);
  }

  .intro-halo {
    position: absolute; width: clamp(220px, 60vw, 340px); height: clamp(220px, 60vw, 340px); border-radius: 50%;
    background: radial-gradient(circle, rgba(201,168,76,0.1) 0%, rgba(201,168,76,0.035) 48%, transparent 68%);
    top: 50%; left: 50%; transform: translate(-50%,-50%);
    pointer-events: none;
    animation: intro-halo 4.5s ease-in-out 2.8s infinite;
  }

  .intro-logo-wrap {
    position: relative; z-index: 10;
    display: flex; flex-direction: column; align-items: center; gap: 20px;
    opacity: 0; transform: scale(0.90) translateY(12px); filter: blur(12px);
    will-change: opacity, transform, filter;
    animation: intro-emerge 2s cubic-bezier(0.22,1,0.36,1) 0.7s forwards;
  }

  .intro-mark { display: block; width: clamp(60px, 13vw, 84px); height: clamp(60px, 13vw, 84px); }

  .intro-wordmark { display: flex; flex-direction: column; align-items: center; gap: clamp(4px, 1.2vw, 6px); }
  .intro-wm-row { display: flex; align-items: baseline; line-height: 1; }
  .intro-wm-brand {
    font-family: 'Playfair Display', serif;
    font-size: clamp(30px, 9vw, 44px); font-weight: 900; letter-spacing: 0.02em;
    color: #c9a84c; line-height: 1;
  }
  .intro-wm-car {
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(13px, 3.5vw, 20px); font-weight: 300; letter-spacing: 0.35em;
    color: rgba(201,168,76,0.62); line-height: 1;
    padding-left: clamp(7px, 2vw, 12px); text-transform: uppercase;
    align-self: flex-end; margin-bottom: 2px;
  }
  .intro-wm-sub {
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(7.5px, 2vw, 9.5px); font-weight: 400; letter-spacing: 0.45em;
    color: rgba(201,168,76,0.25); text-transform: uppercase; line-height: 1;
  }

  .intro-sep {
    width: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(201,168,76,0.35), transparent);
    animation: intro-expand 1.1s cubic-bezier(0.22,1,0.36,1) 2.2s forwards;
  }
  .intro-eyebrow {
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(7px, 1.8vw, 9px); letter-spacing: 0.5em; font-weight: 400;
    color: rgba(201,168,76,0.22); text-transform: uppercase;
    opacity: 0; animation: intro-subfade 1.2s ease 2.6s forwards;
  }

  @keyframes intro-breathe { 0%,100%{transform:scale(1)} 50%{transform:scale(1.07)} }
  @keyframes intro-drift { 0%{transform:translate(0,0)} 100%{transform:translate(22px,16px)} }
  @keyframes intro-emerge {
    0%   { opacity:0; transform:scale(0.90) translateY(12px); filter:blur(12px); }
    58%  { opacity:1; filter:blur(0.6px); }
    100% { opacity:1; transform:scale(1) translateY(0); filter:blur(0); }
  }
  @keyframes intro-halo {
    0%,100% { opacity:0.5; transform:translate(-50%,-50%) scale(1); }
    50%     { opacity:1;   transform:translate(-50%,-50%) scale(1.14); }
  }
  @keyframes intro-expand { 0%{width:0} 100%{width:min(160px, 42vw)} }
  @keyframes intro-subfade { 0%{opacity:0} 100%{opacity:1} }

  @media (max-width: 480px) {
    .intro-halo { width: 220px; height: 220px; }
    .intro-logo-wrap { gap: 14px; }
    .intro-bg-core {
      background: radial-gradient(ellipse 95% 70% at 50% 50%, rgba(10,28,68,0.68) 0%, transparent 72%);
    }
  }

  @media (max-width: 360px) {
    .intro-halo { width: 180px; height: 180px; }
    .intro-wm-sub { letter-spacing: 0.3em; }
    .intro-eyebrow { letter-spacing: 0.32em; }
  }

  @media (max-height: 500px) and (orientation: landscape) {
    .intro-logo-wrap { gap: 10px; flex-direction: row; flex-wrap: wrap; justify-content: center; }
    .intro-mark { width: 48px; height: 48px; }
    .intro-wordmark { gap: 3px; }
    .intro-wm-brand { font-size: 26px; }
    .intro-wm-car { font-size: 13px; }
    .intro-sep, .intro-eyebrow { display: none; }
    .intro-halo { width: 160px; height: 160px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .intro-logo-wrap { animation:none; opacity:1; transform:none; filter:none; }
    .intro-sep       { animation:none; width:min(160px, 42vw); }
    .intro-eyebrow   { animation:none; opacity:1; }
    .intro-halo, .intro-bg-core, .intro-bg-tl, .intro-bg-br { animation:none; }
  }
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

// ─────────────────────────────────────────────────────────────
//  INTRO SCREEN — cinematic fullscreen brand animation
// ─────────────────────────────────────────────────────────────
function IntroScreen({ onDone }) {
  const ref = useRef(null);
  const noAnim = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const hold = noAnim ? 400 : 3800;
    const t1 = setTimeout(() => {
      if (ref.current) ref.current.classList.add("intro-hidden");
    }, hold);
    const t2 = setTimeout(() => {
      document.body.style.overflow = "";
      onDone();
    }, hold + 800);
    return () => { clearTimeout(t1); clearTimeout(t2); document.body.style.overflow = ""; };
  }, []);

  return (
    <div id="intro-screen" ref={ref} aria-hidden="true">
      <div className="intro-bg intro-bg-core" />
      <div className="intro-bg intro-bg-tl" />
      <div className="intro-bg intro-bg-br" />
      <div className="intro-bg intro-bg-vig" />

      <div className="intro-logo-wrap">
        <div className="intro-halo" />

        {/* Geometric mark */}
        <svg className="intro-mark" viewBox="0 0 84 84" fill="none" aria-hidden="true">
          <circle cx="42" cy="42" r="39" stroke="rgba(201,168,76,0.13)" strokeWidth="0.75"/>
          <circle cx="42" cy="42" r="29" stroke="rgba(201,168,76,0.2)" strokeWidth="0.5"/>
          <path d="M28 54 L42 31 L56 54" fill="none" stroke="rgba(201,168,76,0.16)" strokeWidth="0.75" strokeLinejoin="round"/>
          <path d="M30 52 L42 33 L54 52" fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
          <line x1="5"  y1="42" x2="15" y2="42" stroke="rgba(201,168,76,0.38)" strokeWidth="0.75"/>
          <line x1="69" y1="42" x2="79" y2="42" stroke="rgba(201,168,76,0.38)" strokeWidth="0.75"/>
          <line x1="42" y1="5"  x2="42" y2="15" stroke="rgba(201,168,76,0.28)" strokeWidth="0.75"/>
          <line x1="42" y1="69" x2="42" y2="79" stroke="rgba(201,168,76,0.28)" strokeWidth="0.75"/>
          <circle cx="42" cy="42" r="3.2" fill="#c9a84c"/>
        </svg>

        <div className="intro-wordmark">
          <div className="intro-wm-row">
            <span className="intro-wm-brand">2erre</span>
            <span className="intro-wm-car">Car</span>
          </div>
          <span className="intro-wm-sub">Vendita &amp; Noleggio · Roma</span>
        </div>

        <div className="intro-sep" />
        <span className="intro-eyebrow">Dal 2009</span>
      </div>
    </div>
  );
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
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
//  ADVANCED FILTERS (features multi-select, cambio separato)
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
  if (filters.yearFrom || filters.yearTo) summaryParts.push(`${filters.yearFrom || "–"} → ${filters.yearTo || "–"}`);
  if (filters.kmMax) summaryParts.push(`max ${parseInt(filters.kmMax).toLocaleString("it")} km`);
  if (filters.priceMax) summaryParts.push(type === "noleggio" ? `max €${filters.priceMax}/g` : `max €${parseInt(filters.priceMax).toLocaleString("it")}`);
  if (filters.features?.length) summaryParts.push(filters.features.join(", "));

  return (
    <div className="filters-wrapper">
      <div
        className="filters-bar"
        onClick={() => setOpen(o => !o)}
        style={{ borderRadius: open ? "0.6rem 0.6rem 0 0" : "0.6rem" }}
      >
        <div className="filters-bar-left">
          <span>🎛️ Filtri avanzati</span>
          {activeCount > 0 && <span className="filters-active-badge">{activeCount}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          {activeCount > 0 && <button className="filters-reset-btn" onClick={resetAll}>Azzera tutto</button>}
          <span className="filters-arrow" style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
        </div>
      </div>

      {open && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Carburante</label>
            <select className="filter-select" value={filters.fuel} onChange={e => set("fuel", e.target.value)}>
              <option value="">Tutti</option>
              {["Benzina","Diesel","Ibrida","Elettrica","GPL"].map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>Cambio</label>
            <select className="filter-select" value={filters.cambio} onChange={e => set("cambio", e.target.value)}>
              <option value="">Tutti</option>
              <option value="manuale">Manuale</option>
              <option value="automatico">Automatico</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Anno da</label>
            <select className="filter-select" value={filters.yearFrom} onChange={e => set("yearFrom", e.target.value)}>
              <option value="">Qualsiasi</option>
              {[2010,2012,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>Anno a</label>
            <select className="filter-select" value={filters.yearTo} onChange={e => set("yearTo", e.target.value)}>
              <option value="">Qualsiasi</option>
              {[2012,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>Km massimi</label>
            <select className="filter-select" value={filters.kmMax} onChange={e => set("kmMax", e.target.value)}>
              <option value="">Qualsiasi</option>
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
            <select className="filter-select" value={filters.priceMax} onChange={e => set("priceMax", e.target.value)}>
              <option value="">Qualsiasi</option>
              {priceOptions.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          <hr className="filter-divider" />

          <div className="filter-features-area">
            <span className="filter-features-label">Caratteristiche</span>
            <div className="filter-features-row">
              {FEATURES_AVAILABLE.map(f => (
                <button key={f} type="button"
                  className={`filter-tag-btn${(filters.features || []).includes(f) ? " active" : ""}`}
                  onClick={() => toggleFeature(f)}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="filters-summary">
        {activeCount > 0
          ? <>🔍 {resultCount} risultat{resultCount === 1 ? "o" : "i"} · {summaryParts.join(" · ")}</>
          : <>{resultCount} annunci disponibili</>
        }
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  IMAGE UPLOADER
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
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current.click()}
      >
        <input ref={inputRef} type="file" multiple accept="image/*" style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
        <p className="dropzone-text">
          {uploading ? "⏳ Upload in corso..." : <>📷 Trascina le foto qui oppure clicca<br /><span style={{ fontSize: "0.75rem", color: "#bbb" }}>Puoi caricare più foto alla volta</span></>}
        </p>
      </div>
      {previews.length > 0 && (
        <div className="preview-grid">
          {previews.map((item, i) => (
            <div key={i} className="preview-item">
              <img src={item.url} alt="" className="preview-img" />
              <button type="button" className="preview-remove" onClick={() => removePreview(i)}>✕</button>
              {i === 0 && <span className="preview-main">Copertina</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  ADMIN FORM (create + edit)
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
          <input required placeholder="Marca" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} className="input" />
          <input required placeholder="Modello" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} className="input" />
        </div>
        <div className="form-row">
          <input required type="number" placeholder="Anno" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} className="input" />
          <input required type="number" placeholder={form.type === "noleggio" ? "€/giorno" : "Prezzo €"} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input" />
        </div>
        <div className="form-row">
          <input required type="number" placeholder="Km" value={form.km} onChange={e => setForm({ ...form, km: e.target.value })} className="input" />
          <select value={form.fuel} onChange={e => setForm({ ...form, fuel: e.target.value })} className="select-field">
            {["Benzina","Diesel","Ibrida","Elettrica","GPL"].map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div className="form-row">
          {/* Cambio — campo obbligatorio separato */}
          <select required value={form.cambio} onChange={e => setForm({ ...form, cambio: e.target.value })} className="select-field">
            <option value="">-- Tipo cambio (obbligatorio) --</option>
            <option value="manuale">Manuale</option>
            <option value="automatico">Automatico</option>
          </select>
          <select value={form.type} onChange={e => {
            const newType = e.target.value;
            // If switching away from 'noleggio' and status is 'noleggiata', reset to 'disponibile'
            setForm(prev => ({
              ...prev,
              type: newType,
              status: (newType !== "noleggio" && prev.status === "noleggiata") ? "disponibile" : prev.status
            }));
          }} className="select-field">
            <option value="vendita">Vendita</option>
            <option value="noleggio">Noleggio</option>
          </select>
        </div>

        {/* Status */}
        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="select-field">
          <option value="disponibile">Disponibile</option>
          <option value="venduta">Venduta</option>
          {form.type === "noleggio" && <option value="noleggiata">Noleggiata</option>}
        </select>

        <textarea
          placeholder="Descrizione (opzionale) — es: tagliando recente, gomme nuove, un proprietario..."
          value={form.description}
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
                className={`feature-picker-btn${form.features.includes(f) ? " active" : ""}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Foto */}
        <span className="feature-picker-label" style={{ marginBottom: "0.25rem" }}>Foto</span>
        <ImageUploader
          previews={previews}
          setPreviews={setPreviews}
          setUploadedFiles={setNewFiles}
          uploading={uploading}
        />

        <label className="check-label">
          <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} />
          Metti in vetrina
        </label>

        <button type="submit" className="submit-btn" style={{ opacity: (saving || uploading) ? 0.6 : 1 }} disabled={saving || uploading}>
          {saving ? "Salvataggio..." : submitLabel || "Salva"}
        </button>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MODAL GALLERY
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
          <button className="modal-gallery-nav" style={{ left: "0.5rem" }} onClick={prev}>‹</button>
          <button className="modal-gallery-nav" style={{ right: "0.5rem" }} onClick={next}>›</button>
          <div className="modal-gallery-dots">
            {imgs.map((_, i) => (
              <div key={i} className="modal-gallery-dot"
                style={{ background: i === idx ? "#c9a84c" : "rgba(255,255,255,0.55)", transform: i === idx ? "scale(1.3)" : "scale(1)" }}
                onClick={e => { e.stopPropagation(); setIdx(i); }} />
            ))}
          </div>
          <div className="modal-gallery-counter">{idx + 1} / {imgs.length}</div>
        </>
      )}
      <div className="modal-gallery-zoom-hint">🔍 clicca per ingrandire</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  CAR CARD
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
    intervalRef.current = setInterval(() => { i = (i + 1) % images.length; setImgIdx(i); }, 700);
  }
  function handleMouseLeave() { clearInterval(intervalRef.current); setImgIdx(0); }

  const badgeColor = isSold ? "#e74c3c" : isNoleggiata ? "#7f8c8d" : car.type === "noleggio" ? "#e67e22" : "#1a1a2e";
  const badgeLabel = isSold ? "Venduta" : isNoleggiata ? "Noleggiata" : car.type === "noleggio" ? "Noleggio" : "Vendita";

  const imgFilter = isSold ? "grayscale(100%)" : isNoleggiata ? "grayscale(25%) brightness(0.96)" : "none";
  const cardOpacity = isSold ? 0.8 : 1;

  return (
    <div
      className={`car-card${isNoleggiata ? " is-noleggiata" : ""}`}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ opacity: cardOpacity }}
    >
      <div className="card-img-wrap">
        <img src={images[imgIdx]} alt={car.model} className="card-img" style={{ filter: imgFilter }} />
        <div className="card-badge" style={{ background: badgeColor }}>{badgeLabel}</div>
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
              <div key={i} className="photo-dot" style={{ background: i === imgIdx ? "#c9a84c" : "rgba(255,255,255,0.6)" }} />
            ))}
          </div>
        )}
      </div>
      <div className="card-body">
        <div className="card-tags">
          <span className="card-cambio-badge">
            {car.cambio === "automatico" ? "⚙️ Automatico" : "🔧 Manuale"}
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
        {isSold && <p style={{ color: "#e74c3c", fontWeight: 700, fontSize: "0.9rem" }}>Auto venduta</p>}
        {isNoleggiata && !isSold && <p style={{ color: "#7f8c8d", fontWeight: 600, fontSize: "0.85rem" }}>Attualmente noleggiata</p>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  PHOTO GALLERY (lightbox)
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
            <button className="gallery-nav" style={{ left: "0.75rem" }} onClick={() => setIdx((idx - 1 + imgs.length) % imgs.length)}>‹</button>
            <button className="gallery-nav" style={{ right: "0.75rem" }} onClick={() => setIdx((idx + 1) % imgs.length)}>›</button>
            <div className="gallery-thumbs">
              {imgs.map((url, i) => (
                <img key={i} src={url} alt="" onClick={() => setIdx(i)} className={`gallery-thumb${i === idx ? " active" : ""}`} />
              ))}
            </div>
            <p className="gallery-counter">{idx + 1} / {imgs.length}</p>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  CHI SIAMO
// ─────────────────────────────────────────────────────────────
function ChiSiamo({ onContact }) {
  return (
    <>
      <div className="chisiamo-hero">
        <p className="chisiamo-hero-eyebrow">La nostra storia</p>
        <h1 className="chisiamo-hero-title">Chi siamo</h1>
        <p className="chisiamo-hero-sub">
          Siamo un autosalone indipendente a Roma, nato dalla passione per le auto e dal rispetto per i clienti. Niente fronzoli, niente sorprese: solo auto controllate e prezzi chiari.
        </p>
      </div>
      <div className="stats-row">
        {[{ num: "15+", label: "Anni di esperienza" },{ num: "800+", label: "Auto vendute" },{ num: "0%", label: "Stress" },{ num: "100%", label: "Trasparenza" }].map(s => (
          <div key={s.label} className="stat-block">
            <span className="stat-num">{s.num}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>
      <div className="section">
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 className="section-title">I nostri valori</h2>
          <div className="ornament"><div className="ornament-line" /><div className="ornament-dot" /><div className="ornament-line" /></div>
        </div>
        <div className="values-grid">
          {[
            { icon: "🔍", title: "Controllo prima della vendita", text: "Ogni auto viene verificata meccanicamente e controllata nella storia chilometrica prima di essere esposta." },
            { icon: "🤝", title: "Trattativa senza pressione", text: "Non lavoriamo a provvigione aggressiva. Hai tutto il tempo che ti serve per decidere con calma." },
            { icon: "🚗", title: "Prova prima di comprare", text: "Puoi fare un giro di prova senza impegno, per valutare l'auto con la massima tranquillità." },
          ].map(v => (
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
          <div className="ornament"><div className="ornament-line" /><div className="ornament-dot" /><div className="ornament-line" /></div>
        </div>
        <div className="trust-badges">
          {[["✅","Attività regolare con P.IVA"],["📍","Sede fisica verificabile a Roma"],["📞","Risposta telefonica garantita"],["⭐","Oltre 15 anni di esperienza"],["🗓️","Aperti dal lunedì al sabato"]].map(([icon,label]) => (
            <div key={label} className="trust-badge">
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
//  MOBILE NAV
// ─────────────────────────────────────────────────────────────
function MobileNav({ page, navigateTo, adminUser, setAdminOpen }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <div className="nav-mobile-actions" style={{ gap: "0.4rem", alignItems: "center" }}>
        <button style={{ background:"rgba(201,168,76,0.15)",border:"1px solid rgba(201,168,76,0.5)",color:"#c9a84c",cursor:"pointer",fontSize:"0.78rem",padding:"0.4em 0.9em",borderRadius:"0.4rem",fontFamily:"'DM Sans',sans-serif",fontWeight:600,letterSpacing:"0.04em",lineHeight:1 }} onClick={() => setAdminOpen(true)}>
          {adminUser ? "Admin ✓" : "Login"}
        </button>
        <a href="tel:+393000008654" style={{ background:"rgba(201,168,76,0.15)",border:"1px solid rgba(201,168,76,0.4)",color:"#c9a84c",borderRadius:"0.4rem",padding:"0.45em 0.7em",fontSize:"1.1rem",lineHeight:1,textDecoration:"none",display:"flex",alignItems:"center" }} aria-label="Chiama">📞</a>
        <button style={{ background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.18)",color:"#fff",borderRadius:"0.4rem",padding:"0.45em 0.65em",fontSize:"1.1rem",cursor:"pointer",lineHeight:1,display:"flex",alignItems:"center" }} onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>
      {menuOpen && (
        <div style={{ position:"fixed",top:"var(--nav-h)",left:0,right:0,background:"rgba(22,22,38,0.98)",backdropFilter:"blur(12px)",zIndex:199,padding:"0.75rem 1rem 1.25rem",display:"flex",flexDirection:"column",gap:"0.25rem",boxShadow:"0 8px 32px rgba(0,0,0,0.4)" }}>
          {NAV_ITEMS.map(item => (
            <button key={item} style={{ background:page===item?"rgba(201,168,76,0.12)":"none",border:"none",borderLeft:page===item?"3px solid #c9a84c":"3px solid transparent",color:page===item?"#c9a84c":"#ccc",cursor:"pointer",fontSize:"1rem",padding:"0.85em 1em",borderRadius:"0 0.4rem 0.4rem 0",textAlign:"left",fontFamily:"'DM Sans',sans-serif",fontWeight:page===item?600:400,letterSpacing:"0.03em",transition:"all 0.15s" }} onClick={() => { navigateTo(item); setMenuOpen(false); }}>
              {item==="Home"&&"🏠 "}{item==="Vendita"&&"🚗 "}{item==="Noleggio"&&"🔑 "}{item==="Chi Siamo"&&"👋 "}{item==="Contatti"&&"📍 "}{item}
            </button>
          ))}

        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
//  HELPER COMPONENTS
// ─────────────────────────────────────────────────────────────
function Tag({ label }) { return <span className="tag">{label}</span>; }
function EmptyState({ text }) { return <p style={{ textAlign:"center",color:"#aaa",padding:"3.75rem 0",fontSize:"1rem" }}>{text}</p>; }
function Modal({ children, onClose, wide }) {
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
//  MAIN APP
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [introDone, setIntroDone] = useState(false);
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
    supabase.auth.getSession().then(({ data: { session } }) => setAdminUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setAdminUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  async function loadCars() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("cars").select("*").order("created_at", { ascending: false });
      if (error) throw error;
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
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (error) setAuthError("Credenziali errate. Riprova.");
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

    const sanitizedStatus = (form.status === "noleggiata" && form.type !== "noleggio") ? "disponibile" : (form.status || "disponibile");

    const newCar = {
      brand: form.brand, model: form.model,
      year: parseInt(form.year), price: parseFloat(form.price), km: parseInt(form.km),
      fuel: form.fuel, cambio: form.cambio, type: form.type,
      status: sanitizedStatus,
      features: form.features,
      featured: form.featured,
      images: imageUrls.length ? imageUrls : [PLACEHOLDER],
      description: form.description,
      sold_at: sanitizedStatus === "venduta" ? new Date().toISOString() : null,
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

    const sanitizedStatus = (form.status === "noleggiata" && form.type !== "noleggio") ? "disponibile" : form.status;

    const updates = {
      brand: form.brand, model: form.model,
      year: parseInt(form.year), price: parseFloat(form.price), km: parseInt(form.km),
      fuel: form.fuel, cambio: form.cambio, type: form.type,
      status: sanitizedStatus,
      features: form.features,
      featured: form.featured,
      images: imageUrls.length ? imageUrls : [PLACEHOLDER],
      description: form.description,
      sold_at: sanitizedStatus === "venduta"
        ? (editingCar.sold_at || new Date().toISOString())
        : null,
    };

    if (dbConnected) {
      const { error } = await supabase.from("cars").update(updates).eq("id", editingCar.id);
      if (error) { alert("Errore aggiornamento: " + error.message); setSaving(false); return; }
    }
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
    setCars(prev => prev.map(c => { const u = updates.find(x => x.id === c.id); return u ? { ...c, featured: u.featured } : c; }));
    if (dbConnected) for (const u of updates) await supabase.from("cars").update({ featured: u.featured }).eq("id", u.id);
  }

  // ── Toggle stato venduta / disponibile
  async function toggleSold(id) {
    if (!adminUser) return;
    const car = cars.find(c => c.id === id);
    const newStatus = car.status === "venduta" ? "disponibile" : "venduta";
    const sold_at = newStatus === "venduta" ? new Date().toISOString() : null;
    setCars(prev => prev.map(c => c.id === id ? { ...c, status: newStatus, sold_at } : c));
    if (dbConnected) await supabase.from("cars").update({ status: newStatus, sold_at }).eq("id", id);
  }

  // ── Toggle stato noleggiata / disponibile
  async function toggleNoleggiata(id) {
    if (!adminUser) return;
    const car = cars.find(c => c.id === id);

    // Only rental cars can be marked as noleggiata
    if (car.type !== "noleggio") {
      alert("Solo le auto di tipo NOLEGGIO possono essere marcate come noleggiata");
      return;
    }

    const newStatus = car.status === "noleggiata" ? "disponibile" : "noleggiata";
    setCars(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    if (dbConnected) await supabase.from("cars").update({ status: newStatus, sold_at: null }).eq("id", id);
  }

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

  function openCar(car) { setSelectedCar(car); setGalleryOpen(false); setGalleryStartIdx(0); }
  function openZoom(idx) { setGalleryStartIdx(idx); setGalleryOpen(true); }

  const featuredCars = cars.filter(c => c.featured).slice(0, 3);
  const saleCars = cars.filter(c => c.type === "vendita");
  const rentalCars = cars.filter(c => c.type === "noleggio");
  const filteredSale = applyFilters(saleCars);
  const filteredRental = applyFilters(rentalCars);

  // Status label helper
  function statusLabel(car) {
    if (car.status === "venduta") return <span style={{ color: "#e74c3c" }}>VENDUTA</span>;
    if (car.status === "noleggiata") return <span style={{ color: "#7f8c8d" }}>NOLEGGIATA</span>;
    return <span style={{ color: "#27ae60" }}>Disponibile</span>;
  }

  return (
    <div className="page-wrapper">
      <GlobalStyles />

      {!introDone && <IntroScreen onDone={() => setIntroDone(true)} />}

      {!dbConnected && !loading && <div className="banner">⚠️ Modalità demo — Supabase non configurato</div>}

      {/* ── NAVBAR ── */}
      <nav className={`nav-bar${navHidden ? " hidden" : ""}`}>
        <div className="nav-inner">
          <div style={{ cursor:"pointer",letterSpacing:"0.06em",fontSize:"1.25rem",display:"flex",alignItems:"baseline",gap:"0.1em" }} onClick={() => navigateTo("Home")}>
            <span style={{ color:"#c9a84c",fontFamily:"'Playfair Display',serif",fontWeight:900,letterSpacing:"0.02em" }}>2erre</span>
            <span style={{ color:"rgba(255,255,255,0.75)",fontFamily:"'DM Sans',sans-serif",fontWeight:300,letterSpacing:"0.28em",fontSize:"0.72em",paddingLeft:"0.35em",textTransform:"uppercase" }}>Car</span>
          </div>
          <div className="nav-items-desktop" style={{ display:"flex",gap:"0.25rem",alignItems:"center",flexWrap:"wrap" }}>
            {NAV_ITEMS.map(item => (
              <button key={item} style={{ background:page===item?"rgba(201,168,76,0.1)":"none",border:"none",color:page===item?"#c9a84c":"#bbb",cursor:"pointer",fontSize:"0.82rem",padding:"0.5em 0.9em",borderRadius:"0.4rem",letterSpacing:"0.04em",fontFamily:"'DM Sans',sans-serif",fontWeight:page===item?600:400,transition:"color 0.15s,background 0.15s" }} onClick={() => navigateTo(item)}>{item}</button>
            ))}
            <button style={{ background:"rgba(201,168,76,0.15)",border:"1px solid rgba(201,168,76,0.5)",color:"#c9a84c",cursor:"pointer",fontSize:"0.78rem",padding:"0.4em 0.9em",borderRadius:"0.4rem",fontFamily:"'DM Sans',sans-serif",fontWeight:600,letterSpacing:"0.04em",marginLeft:"0.5rem",transition:"background 0.15s" }} onClick={() => setAdminOpen(true)}>
              {adminUser ? "Admin ✓" : "Login"}
            </button>
          </div>
          <MobileNav page={page} navigateTo={navigateTo} adminUser={adminUser} setAdminOpen={setAdminOpen} />
        </div>
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
                      <button className="hero-btn" onClick={() => navigateTo("Vendita")}>Acquista</button>
                      <button className="hero-btn hero-btn-outline" onClick={() => navigateTo("Noleggio")}>Noleggia</button>
                    </div>
                  </div>
                </div>
                <section className="section">
                  <div className="section-header">
                    <h2 className="section-title">In Vetrina</h2>
                    <div className="ornament"><div className="ornament-line" /><div className="ornament-dot" /><div className="ornament-line" /></div>
                    <p className="section-sub">Le auto del momento selezionate per te</p>
                  </div>
                  {featuredCars.length === 0
                    ? <p style={{ textAlign:"center",color:"#aaa",padding:"2.5rem 0" }}>Nessuna auto in vetrina</p>
                    : <div className="grid-3">{featuredCars.map(car => <CarCard key={car.id} car={car} onClick={() => openCar(car)} />)}</div>
                  }
                </section>
                <div className="cta-strip">
                  <div className="cta-inner">
                    <div>
                      <h3 className="cta-title">Hai bisogno di un'auto per qualche giorno?</h3>
                      <p className="cta-sub">Noleggio flessibile, disponibile subito.</p>
                    </div>
                    <button className="cta-button" onClick={() => navigateTo("Noleggio")}>Vedi il noleggio →</button>
                  </div>
                </div>
              </>
            )}

            {/* ── VENDITA ── */}
            {page === "Vendita" && (
              <section className="section">
                <div className="section-header">
                  <h2 className="section-title">Auto in Vendita</h2>
                  <div className="ornament"><div className="ornament-line" /><div className="ornament-dot" /><div className="ornament-line" /></div>
                </div>
                <AdvancedFilters filters={filters} onChange={setFilters} type="vendita" resultCount={filteredSale.length} />
                {filteredSale.length === 0
                  ? <EmptyState text="Nessuna auto corrisponde ai filtri selezionati." />
                  : <div className="grid-3">{filteredSale.map(car => <CarCard key={car.id} car={car} onClick={() => openCar(car)} />)}</div>
                }
              </section>
            )}

            {/* ── NOLEGGIO ── */}
            {page === "Noleggio" && (
              <section className="section">
                <div className="section-header">
                  <h2 className="section-title">Auto a Noleggio</h2>
                  <div className="ornament"><div className="ornament-line" /><div className="ornament-dot" /><div className="ornament-line" /></div>
                  <p className="section-sub">Prezzi al giorno — disponibilità immediata</p>
                </div>
                <AdvancedFilters filters={filters} onChange={setFilters} type="noleggio" resultCount={filteredRental.length} />
                {filteredRental.length === 0
                  ? <EmptyState text="Nessuna auto corrisponde ai filtri selezionati." />
                  : <div className="grid-3">{filteredRental.map(car => <CarCard key={car.id} car={car} onClick={() => openCar(car)} />)}</div>
                }
              </section>
            )}

            {page === "Chi Siamo" && <ChiSiamo onContact={() => navigateTo("Contatti")} />}

            {/* ── CONTATTI ── */}
            {page === "Contatti" && (
              <section className="section">
                <div className="section-header">
                  <h2 className="section-title">Contattaci</h2>
                  <div className="ornament"><div className="ornament-line" /><div className="ornament-dot" /><div className="ornament-line" /></div>
                  <p className="section-sub">Siamo a tua disposizione</p>
                </div>
                <div className="contact-card">
                  {[["📍","Via Collatina 381, Roma (RM)"],["📞","393 000 8654 — 06 88922000"],["✉️","2erreprofessionalcar@libero.it"],["🕐","Lun–Sab: 9:00–19:00"]].map(([icon,text]) => (
                    <div key={text} className="contact-item">
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
        <p className="footer-logo"><span style={{ color:"#c9a84c",fontFamily:"'Playfair Display',serif",fontWeight:900 }}>2erre</span><span style={{ fontWeight:300,letterSpacing:"0.3em",fontSize:"0.75em",marginLeft:"0.4em",color:"#777" }}>CAR</span></p>
        <p className="footer-sub">Via Collatina, 381 — Roma</p>
        {dbConnected && <p style={{ fontSize:"0.72rem",color:"#2ecc71",marginTop:"0.3rem" }}>● Database connesso</p>}
      </footer>

      {/* WhatsApp FAB */}
      <a className="whatsapp-fab" href="https://wa.me/393930008654?text=Ciao%2C%20vi%20contatto%20dal%20sito%20per%20informazioni%20sulle%20auto" target="_blank" rel="noopener noreferrer" aria-label="Contattaci su WhatsApp">
        <span className="whatsapp-fab-icon"><IconWhatsApp /></span>
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
                background: selectedCar.status === "venduta" ? "#e74c3c" : selectedCar.status === "noleggiata" ? "#7f8c8d" : selectedCar.type === "noleggio" ? "#e67e22" : "#1a1a2e",
                color: "#fff"
              }}>
                {selectedCar.status === "venduta" ? "Venduta" : selectedCar.status === "noleggiata" ? "Noleggiata" : selectedCar.type === "noleggio" ? "Noleggio" : "Vendita"}
              </span>
            </div>
            <h2 className="modal-title">{selectedCar.brand} {selectedCar.model}</h2>
            <p className="modal-year">{selectedCar.year} · {selectedCar.fuel} · {selectedCar.km?.toLocaleString()} km</p>
            <p className="modal-cambio">
              {selectedCar.cambio === "automatico" ? "⚙️ Cambio Automatico" : "🔧 Cambio Manuale"}
            </p>

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
            {selectedCar.description && <p className="modal-description">{selectedCar.description}</p>}

            {selectedCar.status === "venduta" ? (
              <div style={{ background:"#fdecea",color:"#e74c3c",borderRadius:"0.5rem",padding:"0.9em",textAlign:"center",fontWeight:700 }}>Auto non più disponibile</div>
            ) : selectedCar.status === "noleggiata" ? (
              <div style={{ background:"#f0f0f0",color:"#7f8c8d",borderRadius:"0.5rem",padding:"0.9em",textAlign:"center",fontWeight:700 }}>Attualmente noleggiata — contattaci per disponibilità</div>
            ) : (
              <a href="tel:+393000008654" className="contact-call-btn">📞 Chiama per info</a>
            )}
          </div>
        </Modal>
      )}

      {selectedCar && galleryOpen && (
        <PhotoGallery images={selectedCar.images} startIdx={galleryStartIdx} onClose={() => setGalleryOpen(false)} />
      )}

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
            title={`✏️ Modifica: ${editingCar.brand} ${editingCar.model}`}
            submitLabel="Aggiorna Annuncio"
          />
        </Modal>
      )}

      {/* ── ADMIN MODAL ── */}
      {adminOpen && (
        <Modal onClose={() => setAdminOpen(false)} wide>
          {!adminUser ? (
            <div className="admin-login">
              <div className="login-icon">🔐</div>
              <h2 className="admin-title" style={{ textAlign:"center" }}>Login</h2>
              <p className="login-sub">Inserisci le credenziali</p>
              <form onSubmit={handleAdminLogin} style={{ width:"100%",display:"flex",flexDirection:"column",gap:"0.75rem" }}>
                <input type="email" placeholder="Email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="input" autoComplete="username" />
                <input type="password" placeholder="Password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="input" autoComplete="current-password" />
                {authError && <p className="auth-error">{authError}</p>}
                <button type="submit" className="submit-btn" style={{ opacity:authLoading?0.6:1 }} disabled={authLoading}>
                  {authLoading ? "Accesso in corso..." : "Entra"}
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
                title="➕ Nuovo Annuncio"
                submitLabel="Aggiungi Annuncio"
              />

              {/* ── Lista annunci ── */}
              <div style={{ padding: "0 1.75rem 1.75rem" }}>
                <p className="admin-section-title" style={{ marginTop:"2rem" }}>📋 Gestisci Annunci ({cars.length})</p>
                <div className="admin-list">
                  {cars.map(car => (
                    <div key={car.id} className="admin-list-item">
                      <div style={{ display:"flex",alignItems:"center",gap:"0.75rem",minWidth:0 }}>
                        <img src={car.images?.[0] || PLACEHOLDER} alt="" style={{ width:"3.25rem",height:"2.4rem",objectFit:"cover",borderRadius:"0.3rem",flexShrink:0 }} />
                        <div className="admin-list-info" style={{ minWidth:0 }}>
                          <strong style={{ fontSize:"0.88rem" }}>{car.brand} {car.model}</strong>
                          <span className="admin-list-sub">
                            {car.year} · {statusLabel(car)} · {car.cambio} · {car.images?.length || 1} foto
                          </span>
                        </div>
                      </div>
                      <div className="admin-list-actions">
                        {/* Vetrina */}
                        <button className="admin-action-btn" title="Vetrina"
                          style={{ background:car.featured?"#f39c12":"#ecf0f1",color:car.featured?"#fff":"#333" }}
                          onClick={() => toggleFeatured(car.id)}>⭐</button>
                        {/* Venduta */}
                        <button className="admin-action-btn"
                          style={{ background:car.status==="venduta"?"#e74c3c":"#ecf0f1",color:car.status==="venduta"?"#fff":"#333",fontSize:"0.65rem",fontWeight:700 }}
                          onClick={() => toggleSold(car.id)}
                          title={car.status==="venduta"?"Segna come disponibile":"Segna come venduta"}>
                          {car.status==="venduta"?"✓V":"VND"}
                        </button>
                        {/* Noleggiata (only enabled for type === "noleggio") */}
                        <button className="admin-action-btn"
                          style={{
                            background:car.status==="noleggiata"?"#7f8c8d":"#ecf0f1",
                            color:car.status==="noleggiata"?"#fff":"#333",
                            fontSize:"0.65rem",
                            fontWeight:700,
                            opacity: car.type === "noleggio" ? 1 : 0.45,
                            cursor: car.type === "noleggio" ? "pointer" : "not-allowed"
                          }}
                          onClick={() => { if (car.type === "noleggio") toggleNoleggiata(car.id); }}
                          title={car.type === "noleggio" ? (car.status==="noleggiata"?"Segna come disponibile":"Segna come noleggiata") : "Solo per auto a noleggio"}>
                          {car.status==="noleggiata"?"✓N":"NLG"}
                        </button>
                        {/* Modifica */}
                        <button className="admin-action-btn"
                          style={{ background:"#3498db",color:"#fff" }}
                          onClick={() => { setEditingCar(car); setEditOpen(true); setAdminOpen(false); }}
                          title="Modifica">✏️</button>
                        {/* Elimina (solo vendute) */}
                        <button className="admin-action-btn"
                          style={{ background:car.status==="venduta"?"#e74c3c":"#ddd",color:car.status==="venduta"?"#fff":"#aaa",cursor:car.status==="venduta"?"pointer":"not-allowed" }}
                          onClick={() => deleteCar(car.id)}
                          title={car.status==="venduta"?"Elimina":"Solo le auto vendute possono essere eliminate"}>✕</button>
                      </div>
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
