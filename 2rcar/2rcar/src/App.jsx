import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jveldjtakpniboajesyv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2ZWxkanRha3BuaWJvYWplc3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MDk0MzMsImV4cCI6MjA5NDA4NTQzM30.ptt5U27hgBtVsmSKE23b7ys6kehYzqiJMOlvZOPBD2k";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TAGS_AVAILABLE = ["automatico", "navigatore", "pelle", "tetto apribile", "sportiva", "SUV", "4x4", "compatta", "city car", "ibrida", "elettrica", "cambio manuale"];
const PLACEHOLDER = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80";
const EMPTY_FILTERS = { tag: null, fuel: "", yearFrom: "", yearTo: "", kmMax: "", priceMax: "", cambio: "" };

function isExpired(car) {
  if (car.status !== "venduta") return false;
  if (!car.sold_at) return false;
  return (new Date() - new Date(car.sold_at)) / (1000 * 60 * 60 * 24) >= 7;
}

const FALLBACK_CARS = [
  { id: 1, brand: "Mercedes-Benz", model: "Classe E", year: 2019, price: 24900, km: 87000, fuel: "Diesel", type: "vendita", status: "vendita", tags: ["automatico", "navigatore", "pelle"], featured: true, images: ["https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80"], description: "" },
  { id: 2, brand: "BMW", model: "Serie 3 Touring", year: 2020, price: 28500, km: 62000, fuel: "Diesel", type: "vendita", status: "vendita", tags: ["automatico", "tetto apribile", "sportiva"], featured: true, images: ["https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80"], description: "" },
  { id: 3, brand: "Volkswagen", model: "Tiguan R-Line", year: 2021, price: 120, km: 45000, fuel: "Benzina", type: "noleggio", status: "noleggio", tags: ["SUV", "automatico", "4x4"], featured: true, images: ["https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80"], description: "" },
];

async function uploadImages(files) {
  const urls = [];
  for (const file of files) {
    const ext = file.name.split(".").pop();
    const path = `cars/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("car-images").upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) continue;
    const { data } = supabase.storage.from("car-images").getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy: #1a1a2e;
    --gold: #c9a84c;
    --gold-light: #e8c96a;
    --cream: #f7f5f0;
    --white: #ffffff;
    --text: #1a1a1a;
    --muted: #888;
    --border: #e8e4dc;
    --shadow: 0 2px 16px rgba(0,0,0,0.08);
    --radius: 14px;
    --nav-h: 56px;
    --tab-h: 60px;
  }

  html { font-size: 16px; scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--cream);
    color: var(--text);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    overscroll-behavior: none;
  }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: var(--gold); border-radius: 99px; }

  /* ── Layout ── */
  .app { display: flex; flex-direction: column; min-height: 100vh; }
  .page { flex: 1; padding-top: var(--nav-h); padding-bottom: calc(var(--tab-h) + env(safe-area-inset-bottom)); }

  /* ── Top Nav ── */
  .top-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 300;
    height: var(--nav-h);
    background: rgba(26,26,46,0.97);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 16px;
    border-bottom: 1px solid rgba(201,168,76,0.15);
    transition: transform 0.3s ease;
  }
  .top-nav.hidden { transform: translateY(-100%); }
  .nav-logo {
    font-family: 'Playfair Display', serif;
    font-size: 1.3rem; font-weight: 900;
    letter-spacing: 0.08em; cursor: pointer;
    display: flex; align-items: center; gap: 2px;
  }
  .nav-logo span:first-child { color: var(--gold); }
  .nav-logo span:last-child { color: #fff; font-weight: 300; font-size: 0.78em; letter-spacing: 0.2em; font-family: 'DM Sans', sans-serif; }
  .nav-actions { display: flex; gap: 8px; align-items: center; }
  .nav-btn {
    background: rgba(201,168,76,0.12); border: 1px solid rgba(201,168,76,0.4);
    color: var(--gold); font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem; font-weight: 600; padding: 6px 14px;
    border-radius: 999px; cursor: pointer; letter-spacing: 0.04em;
    -webkit-tap-highlight-color: transparent;
    transition: background 0.15s;
  }
  .nav-btn:active { background: rgba(201,168,76,0.25); }

  /* ── Bottom Tab Bar ── */
  .tab-bar {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 300;
    height: calc(var(--tab-h) + env(safe-area-inset-bottom));
    padding-bottom: env(safe-area-inset-bottom);
    background: rgba(26,26,46,0.98);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    display: flex; align-items: stretch;
    border-top: 1px solid rgba(201,168,76,0.12);
  }
  .tab-item {
    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 3px; cursor: pointer; border: none; background: none;
    -webkit-tap-highlight-color: transparent;
    color: rgba(255,255,255,0.35);
    font-family: 'DM Sans', sans-serif; font-size: 0.62rem; font-weight: 500;
    letter-spacing: 0.03em; padding: 6px 0;
    transition: color 0.15s;
    position: relative;
  }
  .tab-item.active { color: var(--gold); }
  .tab-item .tab-icon { font-size: 1.3rem; line-height: 1; }
  .tab-item.active::after {
    content: ''; position: absolute; top: 0; left: 25%; right: 25%;
    height: 2px; background: var(--gold); border-radius: 0 0 2px 2px;
  }

  /* ── Hero ── */
  .hero {
    position: relative;
    height: clamp(280px, 55vw, 380px);
    background: url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80) center/cover no-repeat;
    display: flex; align-items: flex-end; padding: 24px 16px;
  }
  .hero::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(160deg, rgba(26,26,46,0.5) 0%, rgba(26,26,46,0.85) 100%);
  }
  .hero-content { position: relative; z-index: 1; width: 100%; }
  .hero-eyebrow {
    color: var(--gold); font-size: 0.65rem; font-weight: 600;
    letter-spacing: 0.22em; text-transform: uppercase; margin-bottom: 6px;
    display: block;
  }
  .hero-title {
    font-family: 'Playfair Display', serif;
    color: #fff; font-size: clamp(1.7rem, 7vw, 2.2rem);
    font-weight: 900; line-height: 1.18; margin-bottom: 18px;
    text-shadow: 0 2px 16px rgba(0,0,0,0.4);
  }
  .hero-btns { display: flex; gap: 10px; }
  .hero-btn {
    flex: 1; padding: 13px 0;
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 700;
    border-radius: 10px; cursor: pointer; border: none;
    letter-spacing: 0.06em; text-transform: uppercase;
    -webkit-tap-highlight-color: transparent;
    transition: transform 0.12s, opacity 0.12s;
  }
  .hero-btn:active { transform: scale(0.97); opacity: 0.9; }
  .hero-btn-primary { background: var(--gold); color: var(--navy); }
  .hero-btn-outline { background: rgba(255,255,255,0.12); color: #fff; border: 1.5px solid rgba(255,255,255,0.5); }

  /* ── Section ── */
  .section { padding: 24px 16px; }
  .section-header { margin-bottom: 18px; }
  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.3rem; font-weight: 700; color: var(--navy);
    margin-bottom: 4px;
  }
  .section-sub { color: var(--muted); font-size: 0.82rem; }
  .section-divider { width: 36px; height: 2px; background: var(--gold); border-radius: 2px; margin: 8px 0 4px; }

  /* ── Horizontal Scroll Shelf ── */
  .shelf {
    display: flex; gap: 12px; overflow-x: auto;
    padding: 4px 16px 12px; margin: 0 -16px;
    scrollbar-width: none; -ms-overflow-style: none;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }
  .shelf::-webkit-scrollbar { display: none; }

  /* ── Car Card (vertical, full width) ── */
  .car-card {
    background: var(--white); border-radius: var(--radius);
    overflow: hidden; box-shadow: var(--shadow);
    border: 1px solid var(--border);
    cursor: pointer; -webkit-tap-highlight-color: transparent;
    transition: transform 0.15s;
    width: 100%;
  }
  .car-card:active { transform: scale(0.985); }

  /* ── Car Card (shelf/horizontal) ── */
  .car-card-shelf {
    min-width: 230px; max-width: 230px;
    scroll-snap-align: start;
    flex-shrink: 0;
  }

  .card-img-wrap { position: relative; }
  .card-img-wrap.full { height: 200px; }
  .card-img-wrap.shelf { height: 140px; }
  .card-img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .card-badge {
    position: absolute; top: 10px; left: 10px;
    color: #fff; font-size: 0.6rem; font-weight: 700;
    padding: 4px 10px; border-radius: 999px;
    letter-spacing: 0.08em; text-transform: uppercase;
    font-family: 'DM Sans', sans-serif;
    backdrop-filter: blur(6px);
  }
  .card-fav {
    position: absolute; top: 10px; right: 10px;
    width: 32px; height: 32px; border-radius: 50%;
    background: rgba(255,255,255,0.9); border: none;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.9rem; cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: transform 0.15s;
  }
  .card-fav:active { transform: scale(0.88); }
  .photo-pip-row {
    position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%);
    display: flex; gap: 4px;
  }
  .photo-pip {
    width: 5px; height: 5px; border-radius: 50%;
    background: rgba(255,255,255,0.5);
    transition: background 0.2s, width 0.2s;
  }
  .photo-pip.active { background: var(--gold); width: 14px; border-radius: 3px; }

  .sold-overlay {
    position: absolute; inset: 0; background: rgba(0,0,0,0.45);
    display: flex; align-items: center; justify-content: center;
    pointer-events: none;
  }
  .sold-stamp {
    border: 2.5px solid #e74c3c; color: #e74c3c;
    font-family: 'Playfair Display', serif; font-size: 1.25rem; font-weight: 900;
    padding: 3px 14px; border-radius: 4px; letter-spacing: 0.12em;
    transform: rotate(-12deg); background: rgba(0,0,0,0.2);
  }

  .card-body { padding: 12px 14px 14px; }
  .card-tags { display: flex; gap: 5px; margin-bottom: 7px; flex-wrap: wrap; }
  .tag {
    background: #f0ede6; color: #777;
    font-size: 0.63rem; padding: 3px 8px;
    border-radius: 999px; font-weight: 500;
    letter-spacing: 0.02em; white-space: nowrap;
  }
  .card-title-full { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 700; color: var(--navy); margin-bottom: 2px; }
  .card-title-shelf { font-family: 'Playfair Display', serif; font-size: 0.9rem; font-weight: 700; color: var(--navy); margin-bottom: 2px; line-height: 1.25; }
  .card-sub { color: var(--muted); font-size: 0.75rem; margin-bottom: 10px; }
  .card-sub-shelf { color: var(--muted); font-size: 0.7rem; margin-bottom: 8px; }
  .card-price { font-family: 'Playfair Display', serif; font-size: 1.25rem; font-weight: 700; color: var(--gold); }
  .card-price-shelf { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 700; color: var(--gold); }
  .card-price-sub { font-size: 0.72rem; color: var(--muted); font-weight: 400; font-family: 'DM Sans', sans-serif; }
  .card-sold-label { color: #e74c3c; font-weight: 700; font-size: 0.82rem; }

  .card-row { display: flex; align-items: center; justify-content: space-between; }
  .card-cta {
    background: var(--navy); color: var(--gold);
    border: none; font-family: 'DM Sans', sans-serif; font-size: 0.72rem;
    font-weight: 700; padding: 7px 14px; border-radius: 8px;
    cursor: pointer; letter-spacing: 0.04em;
    -webkit-tap-highlight-color: transparent;
  }

  /* ── Grid list ── */
  .car-list { display: flex; flex-direction: column; gap: 14px; }

  /* ── Filters ── */
  .filter-pill-row {
    display: flex; gap: 8px; overflow-x: auto;
    padding: 0 16px 2px; margin: 0 -16px 14px;
    scrollbar-width: none;
  }
  .filter-pill-row::-webkit-scrollbar { display: none; }
  .filter-pill {
    flex-shrink: 0; white-space: nowrap;
    padding: 7px 14px; border-radius: 999px;
    border: 1px solid var(--border); background: var(--white);
    color: var(--text); font-size: 0.78rem; font-weight: 500;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    -webkit-tap-highlight-color: transparent;
    transition: all 0.15s;
  }
  .filter-pill.active { background: var(--navy); border-color: var(--navy); color: var(--gold); }

  .filter-drawer {
    position: fixed; inset: 0; z-index: 500;
    display: flex; flex-direction: column; justify-content: flex-end;
  }
  .filter-backdrop {
    position: absolute; inset: 0; background: rgba(0,0,0,0.5);
    backdrop-filter: blur(4px);
  }
  .filter-sheet {
    position: relative; z-index: 1;
    background: var(--white);
    border-radius: 20px 20px 0 0;
    padding: 0 20px calc(24px + env(safe-area-inset-bottom));
    max-height: 82vh; overflow-y: auto;
    box-shadow: 0 -8px 40px rgba(0,0,0,0.2);
  }
  .filter-sheet-handle {
    width: 40px; height: 4px; background: #ddd; border-radius: 2px;
    margin: 12px auto 20px;
  }
  .filter-sheet-title {
    font-family: 'Playfair Display', serif; font-size: 1.1rem;
    font-weight: 700; color: var(--navy); margin-bottom: 20px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .filter-close {
    background: #f0ede6; border: none; border-radius: 50%;
    width: 30px; height: 30px; font-size: 0.75rem;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
  }
  .filter-group { margin-bottom: 20px; }
  .filter-group-label {
    font-size: 0.65rem; font-weight: 700; color: #aaa;
    text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; display: block;
  }
  .filter-options { display: flex; gap: 8px; flex-wrap: wrap; }
  .filter-opt {
    padding: 8px 14px; border-radius: 10px;
    border: 1px solid var(--border); background: #fafafa;
    font-size: 0.8rem; font-weight: 500; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    -webkit-tap-highlight-color: transparent;
    transition: all 0.12s;
  }
  .filter-opt.active { background: var(--navy); border-color: var(--navy); color: var(--gold); }
  .filter-select {
    width: 100%; padding: 11px 14px; border-radius: 10px;
    border: 1px solid var(--border); background: #fafafa;
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
    color: var(--text); outline: none; appearance: auto;
  }
  .filter-apply-btn {
    width: 100%; background: var(--navy); color: var(--gold);
    border: none; padding: 15px; border-radius: 12px;
    font-family: 'DM Sans', sans-serif; font-size: 0.95rem;
    font-weight: 700; cursor: pointer; letter-spacing: 0.04em;
    margin-top: 8px; -webkit-tap-highlight-color: transparent;
  }
  .filter-reset {
    width: 100%; background: #f0ede6; color: #666;
    border: none; padding: 12px; border-radius: 12px;
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
    font-weight: 600; cursor: pointer; margin-top: 10px;
    -webkit-tap-highlight-color: transparent;
  }
  .results-count {
    font-size: 0.8rem; color: var(--muted); margin-bottom: 14px;
  }
  .results-count strong { color: var(--navy); }

  /* ── Modal / Bottom Sheet ── */
  .overlay {
    position: fixed; inset: 0; z-index: 400;
    display: flex; flex-direction: column; justify-content: flex-end;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(6px);
  }
  .modal-sheet {
    background: var(--white);
    border-radius: 20px 20px 0 0;
    max-height: 92vh; overflow-y: auto;
    padding-bottom: calc(env(safe-area-inset-bottom) + 16px);
    box-shadow: 0 -8px 40px rgba(0,0,0,0.25);
    position: relative;
  }
  .sheet-handle { width: 40px; height: 4px; background: #ddd; border-radius: 2px; margin: 12px auto 0; }
  .modal-gallery { position: relative; height: 240px; background: #111; }
  .modal-gallery-img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .modal-gallery-nav {
    position: absolute; top: 50%; transform: translateY(-50%);
    background: rgba(0,0,0,0.4); border: none; color: #fff;
    width: 36px; height: 36px; border-radius: 50%; font-size: 1.2rem;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; -webkit-tap-highlight-color: transparent;
    backdrop-filter: blur(4px);
  }
  .modal-gallery-counter {
    position: absolute; bottom: 10px; right: 10px;
    background: rgba(0,0,0,0.55); color: #fff; font-size: 0.65rem;
    padding: 3px 10px; border-radius: 999px;
  }
  .modal-pip-row {
    position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%);
    display: flex; gap: 4px;
  }
  .modal-pip {
    width: 5px; height: 5px; border-radius: 50%; cursor: pointer;
    transition: all 0.2s;
  }
  .modal-body { padding: 20px 18px; }
  .modal-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
  .modal-type-badge {
    font-size: 0.62rem; font-weight: 700; padding: 4px 10px;
    border-radius: 999px; color: #fff; letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .modal-title { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: var(--navy); margin-bottom: 4px; }
  .modal-meta { color: var(--muted); font-size: 0.82rem; margin-bottom: 14px; }
  .modal-price { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 700; color: var(--gold); margin-bottom: 14px; }
  .modal-desc { font-size: 0.88rem; color: #555; line-height: 1.7; margin-bottom: 18px; }
  .modal-specs {
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
    background: #f7f5f0; border-radius: 12px; padding: 14px; margin-bottom: 18px;
  }
  .modal-spec { display: flex; flex-direction: column; gap: 2px; }
  .modal-spec-label { font-size: 0.62rem; font-weight: 700; color: #bbb; text-transform: uppercase; letter-spacing: 0.08em; }
  .modal-spec-val { font-size: 0.88rem; font-weight: 600; color: var(--navy); }
  .modal-cta-row { display: flex; gap: 10px; }
  .modal-cta-call {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
    background: var(--navy); color: var(--gold); text-decoration: none;
    font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 0.92rem;
    padding: 14px; border-radius: 12px; letter-spacing: 0.04em;
    -webkit-tap-highlight-color: transparent;
  }
  .modal-cta-wa {
    display: flex; align-items: center; justify-content: center;
    background: #25d366; color: #fff;
    width: 48px; height: 48px; border-radius: 12px; font-size: 1.3rem;
    text-decoration: none; flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
  }

  /* ── Gallery fullscreen ── */
  .gallery-overlay {
    position: fixed; inset: 0; z-index: 600;
    background: #000; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
  }
  .gallery-close-btn {
    position: absolute; top: calc(16px + env(safe-area-inset-top)); right: 16px;
    background: rgba(255,255,255,0.15); border: none; color: #fff;
    width: 36px; height: 36px; border-radius: 50%; font-size: 1rem;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; z-index: 10;
    -webkit-tap-highlight-color: transparent;
  }
  .gallery-main { width: 100%; max-height: 70vh; object-fit: contain; }
  .gallery-nav-row {
    position: absolute; left: 0; right: 0; top: 50%;
    transform: translateY(-50%); display: flex; justify-content: space-between; padding: 0 12px;
    pointer-events: none;
  }
  .gallery-nav-btn {
    background: rgba(255,255,255,0.15); border: none; color: #fff;
    width: 44px; height: 44px; border-radius: 50%; font-size: 1.5rem;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; pointer-events: all;
    -webkit-tap-highlight-color: transparent;
  }
  .gallery-thumbs {
    display: flex; gap: 8px; overflow-x: auto;
    padding: 12px 16px; scrollbar-width: none; width: 100%;
  }
  .gallery-thumbs::-webkit-scrollbar { display: none; }
  .gallery-thumb {
    width: 60px; height: 45px; border-radius: 6px; object-fit: cover;
    opacity: 0.4; flex-shrink: 0; cursor: pointer;
    transition: opacity 0.2s;
    -webkit-tap-highlight-color: transparent;
  }
  .gallery-thumb.active { opacity: 1; outline: 2px solid var(--gold); }
  .gallery-counter-txt { color: #777; font-size: 0.78rem; margin-top: 4px; }

  /* ── CTA Strip ── */
  .cta-strip { background: var(--navy); padding: 28px 20px; margin: 0 -16px; }
  .cta-title { font-family: 'Playfair Display', serif; color: #fff; font-size: 1.15rem; font-weight: 700; margin-bottom: 6px; }
  .cta-sub { color: rgba(255,255,255,0.5); font-size: 0.82rem; margin-bottom: 16px; }
  .cta-btn {
    display: block; width: 100%; background: var(--gold); color: var(--navy);
    border: none; padding: 14px; border-radius: 12px;
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 700;
    cursor: pointer; letter-spacing: 0.06em; text-transform: uppercase;
    text-align: center; text-decoration: none;
    -webkit-tap-highlight-color: transparent;
  }

  /* ── Contact ── */
  .contact-list { display: flex; flex-direction: column; gap: 0; border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border); background: var(--white); box-shadow: var(--shadow); }
  .contact-row {
    display: flex; align-items: center; gap: 14px;
    padding: 16px 18px;
    border-bottom: 1px solid var(--border);
    text-decoration: none; color: var(--text);
    transition: background 0.1s;
    -webkit-tap-highlight-color: transparent;
  }
  .contact-row:last-child { border-bottom: none; }
  .contact-row:active { background: #f7f5f0; }
  .contact-icon { font-size: 1.3rem; width: 28px; text-align: center; }
  .contact-label { font-size: 0.78rem; color: var(--muted); display: block; margin-bottom: 2px; font-weight: 500; }
  .contact-val { font-size: 0.9rem; font-weight: 600; color: var(--navy); }
  .contact-arr { margin-left: auto; color: #ccc; font-size: 1rem; }

  /* ── Map placeholder ── */
  .map-placeholder {
    border-radius: var(--radius); overflow: hidden;
    border: 1px solid var(--border); margin-top: 20px;
    background: #e8e4dc;
    display: flex; flex-direction: column;
  }
  .map-img { width: 100%; height: 160px; object-fit: cover; display: block; }
  .map-caption { padding: 12px 16px; font-size: 0.8rem; color: var(--muted); }
  .map-open-btn {
    display: block; margin: 12px 16px 16px;
    background: var(--navy); color: var(--gold); text-decoration: none;
    text-align: center; padding: 12px; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 0.85rem;
    letter-spacing: 0.04em;
    -webkit-tap-highlight-color: transparent;
  }

  /* ── Chi siamo ── */
  .chisiamo-hero {
    background: var(--navy); padding: 32px 20px 28px;
    margin: 0 -16px; text-align: center;
  }
  .chisiamo-eyebrow { color: var(--gold); font-size: 0.62rem; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; margin-bottom: 6px; display: block; }
  .chisiamo-title { font-family: 'Playfair Display', serif; color: #fff; font-size: 1.7rem; font-weight: 900; margin-bottom: 10px; }
  .chisiamo-sub { color: rgba(255,255,255,0.55); font-size: 0.88rem; line-height: 1.65; }
  .stats-row { display: grid; grid-template-columns: 1fr 1fr; background: var(--gold); margin: 0 -16px; }
  .stat-block { padding: 18px 12px; text-align: center; border-right: 1px solid rgba(26,26,46,0.15); border-bottom: 1px solid rgba(26,26,46,0.15); }
  .stat-block:nth-child(2) { border-right: none; }
  .stat-block:nth-child(3) { border-bottom: none; }
  .stat-block:nth-child(4) { border-right: none; border-bottom: none; }
  .stat-num { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 900; color: var(--navy); display: block; line-height: 1; margin-bottom: 4px; }
  .stat-label { font-size: 0.68rem; color: rgba(26,26,46,0.65); font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
  .review-card { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; box-shadow: var(--shadow); }
  .review-text { font-size: 0.88rem; color: #444; line-height: 1.7; font-style: italic; margin-bottom: 10px; }
  .review-author { font-size: 0.75rem; font-weight: 700; color: var(--navy); }
  .value-card { background: var(--white); border-radius: var(--radius); border: 1px solid var(--border); padding: 16px 14px; box-shadow: var(--shadow); }
  .value-icon { font-size: 1.6rem; margin-bottom: 8px; display: block; }
  .value-title { font-family: 'Playfair Display', serif; font-size: 0.95rem; font-weight: 700; color: var(--navy); margin-bottom: 5px; }
  .value-text { font-size: 0.8rem; color: #666; line-height: 1.6; }
  .trust-row { display: flex; flex-direction: column; gap: 10px; }
  .trust-badge { display: flex; align-items: center; gap: 10px; background: var(--white); border: 1px solid var(--border); border-radius: 12px; padding: 12px 16px; font-size: 0.85rem; font-weight: 500; color: var(--navy); box-shadow: var(--shadow); }

  /* ── Admin ── */
  .admin-sheet { background: var(--white); border-radius: 20px 20px 0 0; max-height: 94vh; overflow-y: auto; padding: 0 18px calc(24px + env(safe-area-inset-bottom)); }
  .admin-login { padding: 28px 0; display: flex; flex-direction: column; align-items: center; gap: 14px; }
  .login-icon { font-size: 2.5rem; }
  .login-title { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 700; color: var(--navy); }
  .input {
    width: 100%; padding: 13px 14px; border-radius: 12px;
    border: 1px solid var(--border); font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem; outline: none; background: #fafafa;
    transition: border-color 0.18s;
  }
  .input:focus { border-color: var(--gold); background: var(--white); }
  .select-field {
    width: 100%; padding: 13px 14px; border-radius: 12px;
    border: 1px solid var(--border); font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem; background: #fafafa; outline: none; appearance: auto;
  }
  .textarea-field {
    width: 100%; padding: 12px 14px; border-radius: 12px;
    border: 1px solid var(--border); font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem; outline: none; background: #fafafa;
    resize: vertical; min-height: 80px;
  }
  .submit-btn {
    width: 100%; background: var(--navy); color: var(--gold);
    border: none; padding: 14px; border-radius: 12px;
    font-family: 'DM Sans', sans-serif; font-size: 0.95rem; font-weight: 700;
    cursor: pointer; letter-spacing: 0.04em;
    -webkit-tap-highlight-color: transparent;
  }
  .auth-error { background: #fdecea; color: #e74c3c; border-radius: 10px; padding: 10px 14px; font-size: 0.82rem; width: 100%; text-align: center; }
  .admin-panel-header { padding: 16px 0 12px; display: flex; align-items: center; justify-content: space-between; }
  .admin-panel-title { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; color: var(--navy); }
  .logout-btn { background: #f0ede6; border: none; padding: 8px 16px; border-radius: 999px; font-size: 0.78rem; font-weight: 600; color: #666; cursor: pointer; font-family: 'DM Sans', sans-serif; }
  .admin-section-label { font-size: 0.65rem; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.1em; margin: 18px 0 10px; display: block; }
  .admin-form { display: flex; flex-direction: column; gap: 10px; }
  .tag-picker { background: #f7f5f0; border-radius: 12px; padding: 12px; }
  .tag-picker-label { font-size: 0.65rem; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; display: block; }
  .tag-picker-grid { display: flex; gap: 7px; flex-wrap: wrap; }
  .tag-picker-btn {
    background: var(--white); border: 1px solid var(--border);
    padding: 5px 12px; border-radius: 999px; cursor: pointer;
    font-size: 0.72rem; font-family: 'DM Sans', sans-serif; font-weight: 500;
    -webkit-tap-highlight-color: transparent; transition: all 0.12s;
  }
  .tag-picker-btn.active { background: var(--navy); border-color: var(--navy); color: var(--gold); }
  .check-label { font-size: 0.88rem; display: flex; align-items: center; cursor: pointer; gap: 8px; }
  .dropzone {
    border: 2px dashed var(--border); border-radius: 12px;
    padding: 20px 16px; text-align: center; cursor: pointer;
    background: #fafafa;
  }
  .dropzone-text { color: var(--muted); font-size: 0.85rem; line-height: 1.8; }
  .preview-grid { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
  .preview-item { position: relative; width: 72px; height: 54px; }
  .preview-img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; display: block; }
  .preview-remove {
    position: absolute; top: -4px; right: -4px;
    background: #e74c3c; border: none; color: #fff;
    border-radius: 50%; width: 18px; height: 18px; font-size: 0.6rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }
  .admin-list { display: flex; flex-direction: column; gap: 8px; max-height: 260px; overflow-y: auto; }
  .admin-list-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 12px; background: #f8f8f8; border-radius: 10px; border: 1px solid var(--border);
  }
  .admin-list-info { display: flex; flex-direction: column; gap: 2px; }
  .admin-list-sub { font-size: 0.72rem; color: var(--muted); }
  .admin-list-actions { display: flex; gap: 6px; }
  .admin-action-btn {
    border: none; border-radius: 8px; width: 32px; height: 32px;
    cursor: pointer; font-size: 0.82rem; display: flex; align-items: center; justify-content: center;
    -webkit-tap-highlight-color: transparent;
  }

  /* ── Loading ── */
  .loading-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 60vh; gap: 14px; color: var(--muted); }
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner { width: 36px; height: 36px; border: 3px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: spin 0.8s linear infinite; }

  /* ── Banner ── */
  .banner { background: #e67e22; color: #fff; text-align: center; padding: 10px 16px; font-size: 0.8rem; font-weight: 500; }

  /* ── Footer ── */
  .footer { background: #111; color: #555; text-align: center; padding: 24px 16px; }
  .footer-logo { font-family: 'Playfair Display', serif; font-size: 1.2rem; letter-spacing: 0.12em; margin-bottom: 4px; }
  .footer-sub { font-size: 0.72rem; }

  /* ── Empty ── */
  .empty-state { text-align: center; color: #aaa; padding: 48px 0; font-size: 0.95rem; }

  /* ── Swipe touch hint ── */
  .swipe-hint { display: flex; justify-content: flex-end; padding: 0 4px 6px; }
  .swipe-hint-txt { font-size: 0.7rem; color: #ccc; }
`;

function GlobalStyles() {
  useEffect(() => {
    const id = "2r-mobile-css";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id; s.textContent = CSS;
    document.head.appendChild(s);
    const meta = document.createElement("meta");
    meta.name = "viewport";
    meta.content = "width=device-width, initial-scale=1, viewport-fit=cover";
    if (!document.querySelector('meta[name="viewport"]')) document.head.appendChild(meta);
    return () => { document.getElementById(id)?.remove(); };
  }, []);
  return null;
}

function useNavHide() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      if (y < 60) { setHidden(false); }
      else if (y > lastY.current + 6) { setHidden(true); }
      else if (y < lastY.current - 6) { setHidden(false); }
      lastY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return hidden;
}

// ── Touch swipe hook ──
function useSwipe(onLeft, onRight) {
  const startX = useRef(null);
  return {
    onTouchStart: e => { startX.current = e.touches[0].clientX; },
    onTouchEnd: e => {
      if (startX.current === null) return;
      const diff = startX.current - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) diff > 0 ? onLeft() : onRight();
      startX.current = null;
    },
  };
}

function ImageUploader({ previews, setPreviews, setUploadedFiles, uploading }) {
  const inputRef = useRef();
  function handleFiles(files) {
    const imgs = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (!imgs.length) return;
    setPreviews(p => [...p, ...imgs.map(f => ({ url: URL.createObjectURL(f), file: f }))]);
    setUploadedFiles(p => [...p, ...imgs]);
  }
  function remove(i) { setPreviews(p => p.filter((_, j) => j !== i)); setUploadedFiles(p => p.filter((_, j) => j !== i)); }
  return (
    <div>
      <div className="dropzone" onClick={() => inputRef.current.click()}>
        <input ref={inputRef} type="file" multiple accept="image/*" style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
        <p className="dropzone-text">{uploading ? "⏳ Upload in corso..." : "📷 Tocca per aggiungere foto"}</p>
      </div>
      {previews.length > 0 && (
        <div className="preview-grid">
          {previews.map((item, i) => (
            <div key={i} className="preview-item">
              <img src={item.url} alt="" className="preview-img" />
              <button type="button" className="preview-remove" onClick={() => remove(i)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Car Card (vertical) ──
function CarCard({ car, onClick, shelf }) {
  const images = car.images?.length ? car.images : [PLACEHOLDER];
  const [imgIdx, setImgIdx] = useState(0);
  const isSold = car.status === "venduta";
  const badgeColor = isSold ? "#e74c3c" : car.type === "noleggio" ? "#e67e22" : "#1a1a2e";
  const badgeLabel = isSold ? "Venduta" : car.type === "noleggio" ? "Noleggio" : "Vendita";
  const swipe = useSwipe(
    () => setImgIdx(i => (i + 1) % images.length),
    () => setImgIdx(i => (i - 1 + images.length) % images.length)
  );

  return (
    <div className={`car-card${shelf ? " car-card-shelf" : ""}`} onClick={onClick}>
      <div className={`card-img-wrap ${shelf ? "shelf" : "full"}`} {...swipe}>
        <img src={images[imgIdx]} alt={car.model} className="card-img" style={{ filter: isSold ? "grayscale(30%)" : "none" }} />
        <div className="card-badge" style={{ background: badgeColor }}>{badgeLabel}</div>
        {isSold && <div className="sold-overlay"><div className="sold-stamp">VENDUTA</div></div>}
        {images.length > 1 && !isSold && (
          <div className="photo-pip-row">
            {images.map((_, i) => <div key={i} className={`photo-pip${i === imgIdx ? " active" : ""}`} />)}
          </div>
        )}
      </div>
      <div className="card-body">
        {(car.tags || []).length > 0 && (
          <div className="card-tags">{(car.tags || []).slice(0, shelf ? 1 : 2).map(t => <span key={t} className="tag">{t}</span>)}</div>
        )}
        <h3 className={shelf ? "card-title-shelf" : "card-title-full"}>{car.brand} {car.model}</h3>
        <p className={shelf ? "card-sub-shelf" : "card-sub"}>{car.year} · {car.fuel}{!shelf ? ` · ${car.km?.toLocaleString()} km` : ""}</p>
        {!isSold ? (
          <div className="card-row">
            <p className={shelf ? "card-price-shelf" : "card-price"}>
              {car.type === "noleggio" ? <>€ {car.price}<span className="card-price-sub">/g</span></> : `€ ${car.price?.toLocaleString()}`}
            </p>
            {!shelf && <button className="card-cta">Dettagli →</button>}
          </div>
        ) : <p className="card-sold-label">Auto venduta</p>}
      </div>
    </div>
  );
}

// ── Gallery fullscreen ──
function PhotoGallery({ images, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx || 0);
  const imgs = images?.length ? images : [PLACEHOLDER];
  const swipe = useSwipe(
    () => setIdx(i => (i + 1) % imgs.length),
    () => setIdx(i => (i - 1 + imgs.length) % imgs.length)
  );
  useEffect(() => {
    function k(e) { if (e.key === "ArrowRight") setIdx(i => (i + 1) % imgs.length); if (e.key === "ArrowLeft") setIdx(i => (i - 1 + imgs.length) % imgs.length); if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [imgs.length]);

  return (
    <div className="gallery-overlay" {...swipe}>
      <button className="gallery-close-btn" onClick={onClose}>✕</button>
      <img src={imgs[idx]} alt="" className="gallery-main" />
      {imgs.length > 1 && (
        <>
          <div className="gallery-nav-row">
            <button className="gallery-nav-btn" onClick={() => setIdx((idx - 1 + imgs.length) % imgs.length)}>‹</button>
            <button className="gallery-nav-btn" onClick={() => setIdx((idx + 1) % imgs.length)}>›</button>
          </div>
          <div className="gallery-thumbs">
            {imgs.map((url, i) => <img key={i} src={url} alt="" onClick={() => setIdx(i)} className={`gallery-thumb${i === idx ? " active" : ""}`} />)}
          </div>
          <p className="gallery-counter-txt">{idx + 1} / {imgs.length}</p>
        </>
      )}
    </div>
  );
}

// ── Car Detail Bottom Sheet ──
function CarModal({ car, onClose }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const imgs = car.images?.length ? car.images : [PLACEHOLDER];
  const isSold = car.status === "venduta";
  const swipe = useSwipe(
    () => setImgIdx(i => (i + 1) % imgs.length),
    () => setImgIdx(i => (i - 1 + imgs.length) % imgs.length)
  );

  return (
    <>
      <div className="overlay" onClick={onClose}>
        <div className="modal-sheet" onClick={e => e.stopPropagation()}>
          <div className="sheet-handle" />
          <div className="modal-gallery" {...swipe} onClick={() => setGalleryOpen(true)}>
            <img src={imgs[imgIdx]} alt="" className="modal-gallery-img" />
            {isSold && <div className="sold-overlay"><div className="sold-stamp">VENDUTA</div></div>}
            {imgs.length > 1 && (
              <>
                <button className="modal-gallery-nav" style={{ left: "8px" }} onClick={e => { e.stopPropagation(); setImgIdx(i => (i - 1 + imgs.length) % imgs.length); }}>‹</button>
                <button className="modal-gallery-nav" style={{ right: "8px" }} onClick={e => { e.stopPropagation(); setImgIdx(i => (i + 1) % imgs.length); }}>›</button>
                <div className="modal-pip-row">
                  {imgs.map((_, i) => <div key={i} className="modal-pip" style={{ background: i === imgIdx ? "#c9a84c" : "rgba(255,255,255,0.5)", width: i === imgIdx ? "14px" : "5px", borderRadius: "3px", height: "5px" }} onClick={e => { e.stopPropagation(); setImgIdx(i); }} />)}
                </div>
                <div className="modal-gallery-counter">{imgIdx + 1}/{imgs.length} 🔍</div>
              </>
            )}
          </div>
          <div className="modal-body">
            <div className="modal-tags">
              {(car.tags || []).map(t => <span key={t} className="tag">{t}</span>)}
              <span className="modal-type-badge" style={{ background: isSold ? "#e74c3c" : car.type === "noleggio" ? "#e67e22" : "#27ae60" }}>
                {isSold ? "Venduta" : car.type === "noleggio" ? "Noleggio" : "Disponibile"}
              </span>
            </div>
            <h2 className="modal-title">{car.brand} {car.model}</h2>
            <div className="modal-specs">
              <div className="modal-spec"><span className="modal-spec-label">Anno</span><span className="modal-spec-val">{car.year}</span></div>
              <div className="modal-spec"><span className="modal-spec-label">Carburante</span><span className="modal-spec-val">{car.fuel}</span></div>
              <div className="modal-spec"><span className="modal-spec-label">Chilometri</span><span className="modal-spec-val">{car.km?.toLocaleString()} km</span></div>
              <div className="modal-spec"><span className="modal-spec-label">Tipo</span><span className="modal-spec-val">{car.type === "noleggio" ? "Noleggio" : "Vendita"}</span></div>
            </div>
            {!isSold && (
              <p className="modal-price">
                {car.type === "noleggio" ? <>€ {car.price}<span style={{ fontSize: "1rem", color: "#aaa", fontWeight: 400, fontFamily: "'DM Sans',sans-serif" }}>/giorno</span></> : `€ ${car.price?.toLocaleString()}`}
              </p>
            )}
            {car.description && <p className="modal-desc">{car.description}</p>}
            {!isSold ? (
              <div className="modal-cta-row">
                <a href="tel:+393000008654" className="modal-cta-call">📞 Chiama ora</a>
                <a href="https://wa.me/393000008654" className="modal-cta-wa" target="_blank" rel="noreferrer">💬</a>
              </div>
            ) : (
              <div style={{ background: "#fdecea", color: "#e74c3c", borderRadius: "12px", padding: "14px", textAlign: "center", fontWeight: 700 }}>Auto non più disponibile</div>
            )}
          </div>
        </div>
      </div>
      {galleryOpen && <PhotoGallery images={car.images} startIdx={imgIdx} onClose={() => setGalleryOpen(false)} />}
    </>
  );
}

// ── Filter Sheet ──
function FilterSheet({ filters, onChange, onClose, type, resultCount }) {
  const [local, setLocal] = useState({ ...filters });
  function set(k, v) { setLocal(p => ({ ...p, [k]: v })); }
  function apply() { onChange(local); onClose(); }
  function reset() { setLocal({ ...EMPTY_FILTERS }); onChange({ ...EMPTY_FILTERS }); onClose(); }

  const FUELS = ["Benzina", "Diesel", "Ibrida", "Elettrica", "GPL"];
  const YEARS = [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025];
  const KM_OPTS = [["20000","20.000"],["50000","50.000"],["80000","80.000"],["120000","120.000"],["150000","150.000"]];

  return (
    <div className="filter-drawer">
      <div className="filter-backdrop" onClick={onClose} />
      <div className="filter-sheet">
        <div className="filter-sheet-handle" />
        <div className="filter-sheet-title">
          Filtri
          <button className="filter-close" onClick={onClose}>✕</button>
        </div>

        <div className="filter-group">
          <span className="filter-group-label">Carburante</span>
          <div className="filter-options">
            {FUELS.map(f => <button key={f} className={`filter-opt${local.fuel === f ? " active" : ""}`} onClick={() => set("fuel", local.fuel === f ? "" : f)}>{f}</button>)}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-group-label">Anno da</span>
          <select className="filter-select" value={local.yearFrom} onChange={e => set("yearFrom", e.target.value)}>
            <option value="">Qualsiasi</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <span className="filter-group-label">Anno a</span>
          <select className="filter-select" value={local.yearTo} onChange={e => set("yearTo", e.target.value)}>
            <option value="">Qualsiasi</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <span className="filter-group-label">Km massimi</span>
          <div className="filter-options">
            {KM_OPTS.map(([v, l]) => <button key={v} className={`filter-opt${local.kmMax === v ? " active" : ""}`} onClick={() => set("kmMax", local.kmMax === v ? "" : v)}>{l}</button>)}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-group-label">Cambio</span>
          <div className="filter-options">
            {[["automatico","Automatico"],["cambio manuale","Manuale"]].map(([v,l]) => (
              <button key={v} className={`filter-opt${local.cambio === v ? " active" : ""}`} onClick={() => set("cambio", local.cambio === v ? "" : v)}>{l}</button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <span className="filter-group-label">Caratteristiche</span>
          <div className="filter-options">
            {TAGS_AVAILABLE.map(t => (
              <button key={t} className={`filter-opt${local.tag === t ? " active" : ""}`} onClick={() => set("tag", local.tag === t ? null : t)}>{t}</button>
            ))}
          </div>
        </div>

        <button className="filter-apply-btn" onClick={apply}>Mostra {resultCount} risultati</button>
        <button className="filter-reset" onClick={reset}>Azzera filtri</button>
      </div>
    </div>
  );
}

// ── Admin Panel ──
function AdminPanel({ cars, dbConnected, adminUser, onLogin, onLogout, onAdd, onDelete, onToggleSold, onToggleFeatured, onClose }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [authErr, setAuthErr] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({ brand: "", model: "", year: "", price: "", km: "", fuel: "Benzina", type: "vendita", tags: [], featured: false, description: "" });

  async function login(e) {
    e.preventDefault(); setAuthLoading(true); setAuthErr("");
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) setAuthErr("Credenziali errate.");
    else { setEmail(""); setPass(""); }
    setAuthLoading(false);
  }

  async function addCar(e) {
    e.preventDefault(); setSaving(true); setUploading(true);
    let imageUrls = [];
    if (files.length) imageUrls = await uploadImages(files);
    setUploading(false);
    await onAdd({ ...form, year: parseInt(form.year), price: parseFloat(form.price), km: parseInt(form.km), images: imageUrls.length ? imageUrls : [PLACEHOLDER], status: form.type, sold_at: null });
    setForm({ brand: "", model: "", year: "", price: "", km: "", fuel: "Benzina", type: "vendita", tags: [], featured: false, description: "" });
    setPreviews([]); setFiles([]);
    setSaving(false);
  }

  function toggleTag(t) { setForm(f => ({ ...f, tags: f.tags.includes(t) ? f.tags.filter(x => x !== t) : [...f.tags, t] })); }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="admin-sheet" onClick={e => e.stopPropagation()}>
        <div className="filter-sheet-handle" />
        {!adminUser ? (
          <div className="admin-login">
            <div className="login-icon">🔐</div>
            <p className="login-title">Login Admin</p>
            <form onSubmit={login} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
              <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} className="input" autoComplete="username" />
              <input type="password" placeholder="Password" required value={pass} onChange={e => setPass(e.target.value)} className="input" autoComplete="current-password" />
              {authErr && <div className="auth-error">{authErr}</div>}
              <button type="submit" className="submit-btn" disabled={authLoading}>{authLoading ? "Accesso..." : "Entra"}</button>
            </form>
          </div>
        ) : (
          <>
            <div className="admin-panel-header">
              <div>
                <p className="admin-panel-title">Pannello Admin</p>
                <p style={{ fontSize: "0.72rem", color: "#27ae60", marginTop: "2px" }}>✓ {adminUser.email}</p>
              </div>
              <button className="logout-btn" onClick={onLogout}>Esci</button>
            </div>

            <span className="admin-section-label">➕ Nuovo Annuncio</span>
            <form onSubmit={addCar} className="admin-form">
              <input required placeholder="Marca" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} className="input" />
              <input required placeholder="Modello" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} className="input" />
              <div style={{ display: "flex", gap: "8px" }}>
                <input required type="number" placeholder="Anno" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} className="input" />
                <input required type="number" placeholder="Prezzo" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input" />
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <input required type="number" placeholder="Km" value={form.km} onChange={e => setForm({ ...form, km: e.target.value })} className="input" />
                <select value={form.fuel} onChange={e => setForm({ ...form, fuel: e.target.value })} className="select-field">
                  {["Benzina","Diesel","Ibrida","Elettrica","GPL"].map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="select-field">
                <option value="vendita">Vendita</option>
                <option value="noleggio">Noleggio</option>
              </select>
              <textarea placeholder="Descrizione (opzionale)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="textarea-field" />
              <div className="tag-picker">
                <span className="tag-picker-label">Tag</span>
                <div className="tag-picker-grid">
                  {TAGS_AVAILABLE.map(t => <button type="button" key={t} onClick={() => toggleTag(t)} className={`tag-picker-btn${form.tags.includes(t) ? " active" : ""}`}>{t}</button>)}
                </div>
              </div>
              <ImageUploader previews={previews} setPreviews={setPreviews} setUploadedFiles={setFiles} uploading={uploading} />
              <label className="check-label">
                <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} />
                Metti in vetrina
              </label>
              <button type="submit" className="submit-btn" disabled={saving || uploading}>{saving ? "Salvataggio..." : "Aggiungi Annuncio"}</button>
            </form>

            <span className="admin-section-label" style={{ marginTop: "20px" }}>📋 Annunci ({cars.length})</span>
            <div className="admin-list">
              {cars.map(car => (
                <div key={car.id} className="admin-list-item">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <img src={car.images?.[0] || PLACEHOLDER} alt="" style={{ width: "48px", height: "36px", objectFit: "cover", borderRadius: "6px" }} />
                    <div className="admin-list-info">
                      <strong style={{ fontSize: "0.82rem" }}>{car.brand} {car.model}</strong>
                      <span className="admin-list-sub">{car.year} · {car.status === "venduta" ? <span style={{ color: "#e74c3c" }}>VENDUTA</span> : `€${car.price}`}</span>
                    </div>
                  </div>
                  <div className="admin-list-actions">
                    <button className="admin-action-btn" style={{ background: car.featured ? "#f39c12" : "#ecf0f1" }} onClick={() => onToggleFeatured(car.id)}>⭐</button>
                    <button className="admin-action-btn" style={{ background: car.status === "venduta" ? "#e74c3c" : "#27ae60", color: "#fff", fontSize: "0.6rem", fontWeight: 700 }} onClick={() => onToggleSold(car.id)}>{car.status === "venduta" ? "✓V" : "VND"}</button>
                    <button className="admin-action-btn" style={{ background: "#fdecea", color: "#e74c3c" }} onClick={() => onDelete(car.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Chi Siamo ──
function ChiSiamo({ onContact }) {
  return (
    <>
      <div className="chisiamo-hero">
        <span className="chisiamo-eyebrow">La nostra storia</span>
        <h1 className="chisiamo-title">Chi siamo</h1>
        <p className="chisiamo-sub">Autosalone indipendente a Roma. Niente sorprese: solo auto controllate e prezzi chiari.</p>
      </div>
      <div className="stats-row">
        {[["15+","Anni"],["800+","Auto vendute"],["0%","Stress"],["100%","Trasparenza"]].map(([n,l]) => (
          <div key={l} className="stat-block"><span className="stat-num">{n}</span><span className="stat-label">{l}</span></div>
        ))}
      </div>
      <div className="section">
        <div className="section-header">
          <p className="section-title">Una realtà di famiglia</p>
          <div className="section-divider" />
          <p className="section-sub">Su Via Collatina, aiutiamo le famiglie romane a trovare l'auto giusta da oltre 15 anni.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            { text: "Ho comprato la mia Polo da 2Rcar nel 2021. Raffaele mi ha spiegato tutto senza fretta. Un anno dopo è ancora perfetta.", author: "Marco T., cliente dal 2021" },
            { text: "Cercavo un'auto per lavoro, noleggio mensile. Mi hanno trovato la soluzione in mezza giornata.", author: "Giulia R., cliente dal 2022" },
          ].map(r => (
            <div key={r.author} className="review-card">
              <p className="review-text">"{r.text}"</p>
              <p className="review-author">— {r.author}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "#f0ede6", padding: "0 0 4px", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="section">
          <div className="section-header">
            <p className="section-title">Come lavoriamo</p>
            <div className="section-divider" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { icon: "🔍", title: "Controllo prima della vendita", text: "Ogni auto viene verificata meccanicamente prima di essere esposta." },
              { icon: "🤝", title: "Trattativa senza pressione", text: "Hai tutto il tempo che ti serve per decidere con calma." },
              { icon: "🚗", title: "Prova prima di comprare", text: "Puoi fare un giro di prova senza impegno." },
            ].map(v => (
              <div key={v.title} className="value-card">
                <span className="value-icon">{v.icon}</span>
                <p className="value-title">{v.title}</p>
                <p className="value-text">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="section">
        <div className="section-header">
          <p className="section-title">Perché sceglierci</p>
          <div className="section-divider" />
        </div>
        <div className="trust-row">
          {[["✅","Attività regolare con P.IVA"],["📍","Sede fisica a Roma verificabile"],["📞","Risposta telefonica garantita"],["⭐","Oltre 15 anni di esperienza"],["🗓️","Aperti lun–sab 9:00–19:00"]].map(([icon,label]) => (
            <div key={label} className="trust-badge"><span>{icon}</span><span>{label}</span></div>
          ))}
        </div>
        <div style={{ marginTop: "24px" }}>
          <div className="cta-strip" style={{ margin: "0 -16px", borderRadius: 0 }}>
            <p className="cta-title">Vieni a trovarci</p>
            <p className="cta-sub" style={{ marginBottom: "14px" }}>Via Collatina 381 — lun–sab 9–19</p>
            <button className="cta-btn" onClick={onContact}>Contattaci →</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main App ──
export default function App() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  const [page, setPage] = useState("Home");
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS });
  const [filterOpen, setFilterOpen] = useState(false);
  const navHidden = useNavHide();

  useEffect(() => {
    loadCars();
    supabase.auth.getSession().then(({ data: { session } }) => setAdminUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setAdminUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  async function loadCars() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("cars").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setCars(data || []); setDbConnected(true);
    } catch { setCars(FALLBACK_CARS); setDbConnected(false); }
    setLoading(false);
  }

  async function handleAdd(carData) {
    if (dbConnected) {
      const { data, error } = await supabase.from("cars").insert([carData]).select().single();
      if (error) { alert("Errore: " + error.message); return; }
      setCars(p => [data, ...p]);
    } else { setCars(p => [{ ...carData, id: Date.now() }, ...p]); }
    alert("Annuncio aggiunto!");
  }

  async function handleDelete(id) {
    if (!confirm("Eliminare?")) return;
    setCars(p => p.filter(c => c.id !== id));
    if (dbConnected) await supabase.from("cars").delete().eq("id", id);
  }

  async function handleToggleSold(id) {
    const car = cars.find(c => c.id === id);
    const isSold = car.status === "venduta";
    const ns = isSold ? car.type : "venduta";
    const sa = isSold ? null : new Date().toISOString();
    setCars(p => p.map(c => c.id === id ? { ...c, status: ns, sold_at: sa } : c));
    if (dbConnected) await supabase.from("cars").update({ status: ns, sold_at: sa }).eq("id", id);
  }

  async function handleToggleFeatured(id) {
    const car = cars.find(c => c.id === id);
    const featured = cars.filter(c => c.featured);
    let updates = [];
    if (!car.featured && featured.length >= 3) updates = [{ id: featured[0].id, featured: false }, { id, featured: true }];
    else updates = [{ id, featured: !car.featured }];
    setCars(p => p.map(c => { const u = updates.find(x => x.id === c.id); return u ? { ...c, featured: u.featured } : c; }));
    if (dbConnected) for (const u of updates) await supabase.from("cars").update({ featured: u.featured }).eq("id", u.id);
  }

  async function handleLogout() { await supabase.auth.signOut(); setAdminOpen(false); }

  const visible = cars.filter(c => !isExpired(c));
  const featured = visible.filter(c => c.featured).slice(0, 3);
  const saleCars = visible.filter(c => c.type === "vendita");
  const rentalCars = visible.filter(c => c.type === "noleggio");

  function applyFilters(list) {
    return list.filter(car => {
      if (filters.tag && !car.tags?.includes(filters.tag)) return false;
      if (filters.fuel && car.fuel !== filters.fuel) return false;
      if (filters.yearFrom && car.year < parseInt(filters.yearFrom)) return false;
      if (filters.yearTo && car.year > parseInt(filters.yearTo)) return false;
      if (filters.kmMax && car.km > parseInt(filters.kmMax)) return false;
      if (filters.priceMax && car.price > parseInt(filters.priceMax)) return false;
      if (filters.cambio && !car.tags?.includes(filters.cambio)) return false;
      return true;
    });
  }

  const filteredSale = applyFilters(saleCars);
  const filteredRental = applyFilters(rentalCars);
  const activeFilterCount = Object.entries(filters).filter(([k, v]) => k === "tag" ? v !== null : v !== "").length;

  function navigate(p) { setPage(p); setFilters({ ...EMPTY_FILTERS }); window.scrollTo(0, 0); }

  const TABS = [
    { id: "Home", icon: "🏠", label: "Home" },
    { id: "Vendita", icon: "🚗", label: "Vendita" },
    { id: "Noleggio", icon: "🔑", label: "Noleggio" },
    { id: "Chi Siamo", icon: "ℹ️", label: "Chi siamo" },
    { id: "Contatti", icon: "📞", label: "Contatti" },
  ];

  return (
    <div className="app">
      <GlobalStyles />

      {!dbConnected && !loading && <div className="banner">⚠️ Modalità demo</div>}

      <nav className={`top-nav${navHidden ? " hidden" : ""}`}>
        <div className="nav-logo" onClick={() => navigate("Home")}>
          <span>2R</span>
          <span>CAR</span>
        </div>
        <div className="nav-actions">
          <button className="nav-btn" onClick={() => setAdminOpen(true)}>
            {adminUser ? "Admin ✓" : "Login"}
          </button>
        </div>
      </nav>

      <div className="page">
        {loading && <div className="loading-screen"><div className="spinner" /><p>Caricamento...</p></div>}

        {!loading && (
          <>
            {/* ── HOME ── */}
            {page === "Home" && (
              <>
                <div className="hero">
                  <div className="hero-content">
                    <span className="hero-eyebrow">Vendita &amp; Noleggio · Roma</span>
                    <h1 className="hero-title">La tua prossima auto<br />ti aspetta qui.</h1>
                    <div className="hero-btns">
                      <button className="hero-btn hero-btn-primary" onClick={() => navigate("Vendita")}>Acquista</button>
                      <button className="hero-btn hero-btn-outline" onClick={() => navigate("Noleggio")}>Noleggia</button>
                    </div>
                  </div>
                </div>

                <div style={{ padding: "24px 0 0" }}>
                  <div style={{ padding: "0 16px", marginBottom: "12px" }}>
                    <div className="section-header" style={{ marginBottom: "4px" }}>
                      <p className="section-title">In Vetrina</p>
                      <div className="section-divider" />
                      <p className="section-sub">Le auto selezionate per te</p>
                    </div>
                  </div>
                  {featured.length === 0
                    ? <div className="empty-state">Nessuna auto in vetrina</div>
                    : (
                      <>
                        <div className="shelf">
                          {featured.map(car => <CarCard key={car.id} car={car} onClick={() => setSelectedCar(car)} shelf />)}
                        </div>
                        {featured.length > 1 && <div className="swipe-hint"><span className="swipe-hint-txt">scorri →</span></div>}
                      </>
                    )
                  }
                </div>

                <div className="section">
                  <div className="cta-strip" style={{ borderRadius: "14px", margin: 0, padding: "22px 20px" }}>
                    <p className="cta-title">Auto per qualche giorno?</p>
                    <p className="cta-sub" style={{ marginBottom: "14px" }}>Noleggio flessibile, disponibile subito.</p>
                    <button className="cta-btn" onClick={() => navigate("Noleggio")}>Vedi il noleggio →</button>
                  </div>
                </div>
              </>
            )}

            {/* ── VENDITA ── */}
            {page === "Vendita" && (
              <div className="section">
                <div className="section-header">
                  <p className="section-title">Auto in Vendita</p>
                  <div className="section-divider" />
                </div>
                <div className="filter-pill-row">
                  <button className={`filter-pill${activeFilterCount > 0 ? " active" : ""}`} onClick={() => setFilterOpen(true)}>
                    🎛️ Filtri{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                  </button>
                  {["Benzina","Diesel","Ibrida","SUV","automatico"].map(f => {
                    const isTagFilter = TAGS_AVAILABLE.includes(f);
                    const active = isTagFilter ? filters.tag === f : filters.fuel === f;
                    return (
                      <button key={f} className={`filter-pill${active ? " active" : ""}`}
                        onClick={() => {
                          if (isTagFilter) setFilters(p => ({ ...p, tag: p.tag === f ? null : f }));
                          else setFilters(p => ({ ...p, fuel: p.fuel === f ? "" : f }));
                        }}>{f}</button>
                    );
                  })}
                </div>
                <p className="results-count"><strong>{filteredSale.length}</strong> annunci disponibili</p>
                {filteredSale.length === 0
                  ? <div className="empty-state">Nessuna auto con i filtri selezionati</div>
                  : <div className="car-list">{filteredSale.map(car => <CarCard key={car.id} car={car} onClick={() => setSelectedCar(car)} />)}</div>
                }
              </div>
            )}

            {/* ── NOLEGGIO ── */}
            {page === "Noleggio" && (
              <div className="section">
                <div className="section-header">
                  <p className="section-title">Auto a Noleggio</p>
                  <div className="section-divider" />
                  <p className="section-sub">Prezzi al giorno · disponibilità immediata</p>
                </div>
                <div className="filter-pill-row">
                  <button className={`filter-pill${activeFilterCount > 0 ? " active" : ""}`} onClick={() => setFilterOpen(true)}>
                    🎛️ Filtri{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                  </button>
                  {["Benzina","Diesel","SUV","automatico"].map(f => {
                    const isTag = TAGS_AVAILABLE.includes(f);
                    const active = isTag ? filters.tag === f : filters.fuel === f;
                    return (
                      <button key={f} className={`filter-pill${active ? " active" : ""}`}
                        onClick={() => { if (isTag) setFilters(p => ({ ...p, tag: p.tag === f ? null : f })); else setFilters(p => ({ ...p, fuel: p.fuel === f ? "" : f })); }}>
                        {f}
                      </button>
                    );
                  })}
                </div>
                <p className="results-count"><strong>{filteredRental.length}</strong> auto disponibili</p>
                {filteredRental.length === 0
                  ? <div className="empty-state">Nessuna auto con i filtri selezionati</div>
                  : <div className="car-list">{filteredRental.map(car => <CarCard key={car.id} car={car} onClick={() => setSelectedCar(car)} />)}</div>
                }
              </div>
            )}

            {/* ── CHI SIAMO ── */}
            {page === "Chi Siamo" && <ChiSiamo onContact={() => navigate("Contatti")} />}

            {/* ── CONTATTI ── */}
            {page === "Contatti" && (
              <div className="section">
                <div className="section-header">
                  <p className="section-title">Contattaci</p>
                  <div className="section-divider" />
                  <p className="section-sub">Siamo a tua disposizione</p>
                </div>
                <div className="contact-list">
                  <a href="tel:+393000008654" className="contact-row">
                    <span className="contact-icon">📞</span>
                    <div><span className="contact-label">Telefono</span><span className="contact-val">393 000 8654</span></div>
                    <span className="contact-arr">›</span>
                  </a>
                  <a href="tel:+390688922000" className="contact-row">
                    <span className="contact-icon">☎️</span>
                    <div><span className="contact-label">Telefono fisso</span><span className="contact-val">06 88922000</span></div>
                    <span className="contact-arr">›</span>
                  </a>
                  <a href="https://wa.me/393000008654" className="contact-row" target="_blank" rel="noreferrer">
                    <span className="contact-icon">💬</span>
                    <div><span className="contact-label">WhatsApp</span><span className="contact-val">Scrivici su WhatsApp</span></div>
                    <span className="contact-arr">›</span>
                  </a>
                  <a href="mailto:2erreprofessionalcar@libero.it" className="contact-row">
                    <span className="contact-icon">✉️</span>
                    <div><span className="contact-label">Email</span><span className="contact-val">2erreprofessionalcar@libero.it</span></div>
                    <span className="contact-arr">›</span>
                  </a>
                  <div className="contact-row">
                    <span className="contact-icon">🕐</span>
                    <div><span className="contact-label">Orari</span><span className="contact-val">Lun–Sab: 9:00–19:00</span></div>
                  </div>
                </div>

                <div className="map-placeholder">
                  <img src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80" alt="Roma" className="map-img" style={{ objectPosition: "center 60%" }} />
                  <p className="map-caption">📍 Via Collatina 381, Roma (RM)</p>
                  <a href="https://maps.google.com/?q=Via+Collatina+381+Roma" className="map-open-btn" target="_blank" rel="noreferrer">
                    Apri in Maps →
                  </a>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <footer className="footer">
        <p className="footer-logo"><span style={{ color: "#c9a84c" }}>2R</span> CAR</p>
        <p className="footer-sub">Via Collatina, 381 — Roma</p>
        {dbConnected && <p style={{ fontSize: "0.7rem", color: "#2ecc71", marginTop: "4px" }}>● Database connesso</p>}
      </footer>

      {/* Bottom Tab Bar */}
      <nav className="tab-bar">
        {TABS.map(t => (
          <button key={t.id} className={`tab-item${page === t.id ? " active" : ""}`} onClick={() => navigate(t.id)}>
            <span className="tab-icon">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      {/* Car detail modal */}
      {selectedCar && <CarModal car={selectedCar} onClose={() => setSelectedCar(null)} />}

      {/* Filter sheet */}
      {filterOpen && (
        <FilterSheet
          filters={filters}
          onChange={setFilters}
          onClose={() => setFilterOpen(false)}
          type={page === "Noleggio" ? "noleggio" : "vendita"}
          resultCount={page === "Noleggio" ? filteredRental.length : filteredSale.length}
        />
      )}

      {/* Admin panel */}
      {adminOpen && (
        <AdminPanel
          cars={cars} dbConnected={dbConnected} adminUser={adminUser}
          onLogin={() => {}} onLogout={handleLogout}
          onAdd={handleAdd} onDelete={handleDelete}
          onToggleSold={handleToggleSold} onToggleFeatured={handleToggleFeatured}
          onClose={() => setAdminOpen(false)}
        />
      )}
    </div>
  );
}
