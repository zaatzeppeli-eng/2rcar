import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jveldjtakpniboajesyv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2ZWxkanRha3BuaWJvYWplc3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MDk0MzMsImV4cCI6MjA5NDA4NTQzM30.ptt5U27hgBtVsmSKE23b7ys6kehYzqiJMOlvZOPBD2k";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TAGS_AVAILABLE = ["automatico", "navigatore", "pelle", "tetto apribile", "sportiva", "SUV", "4x4", "compatta", "city car", "ibrida", "elettrica", "cambio manuale"];
const NAV_ITEMS = ["Home", "Vendita", "Noleggio", "Chi Siamo", "Contatti"];
const PLACEHOLDER = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80";

const EMPTY_FILTERS = {
  tag: null,
  fuel: "",
  yearFrom: "",
  yearTo: "",
  kmMax: "",
  priceMax: "",
  cambio: "",
};

function isExpired(car) {
  if (car.status !== "venduta") return false;
  if (!car.sold_at) return false;
  const soldAt = new Date(car.sold_at);
  const now = new Date();
  const diffDays = (now - soldAt) / (1000 * 60 * 60 * 24);
  return diffDays >= 7;
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
    if (error) { console.error("Upload error:", error.message); continue; }
    const { data } = supabase.storage.from("car-images").getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

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

  .page-wrapper {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    padding-top: var(--nav-h);
  }
  .page-content { flex: 1; }

  .nav-bar {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 200;
    background: rgba(26,26,46,0.97);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 2px 32px rgba(0,0,0,0.25);
    height: var(--nav-h);
    transition: transform 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease;
    will-change: transform;
  }
  .nav-bar.hidden { transform: translateY(-110%); }

  .nav-inner {
    max-width: 72rem;
    margin: 0 auto;
    padding: 0 1.5rem;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .hero {
    position: relative;
    height: clamp(380px, 55vh, 640px);
    background: url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80) center/cover no-repeat;
    display: flex;
    align-items: center;
  }
  .hero-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(130deg, rgba(26,26,46,0.88) 0%, rgba(26,26,46,0.35) 100%);
  }
  .hero-content {
    position: relative;
    max-width: 72rem;
    margin: 0 auto;
    padding: 0 1.5rem;
    width: 100%;
  }
  .hero-eyebrow {
    font-family: 'DM Sans', sans-serif;
    color: var(--gold);
    letter-spacing: 0.28em;
    font-size: 0.7rem;
    text-transform: uppercase;
    font-weight: 500;
    margin-bottom: 0.75rem;
  }
  .hero-title {
    font-family: 'Playfair Display', serif;
    color: #fff;
    font-size: clamp(2rem, 5vw, 3.6rem);
    font-weight: 900;
    line-height: 1.15;
    margin-bottom: 2rem;
    text-shadow: 0 2px 24px rgba(0,0,0,0.4);
    letter-spacing: -0.01em;
  }
  .hero-btns { display: flex; gap: 1rem; flex-wrap: wrap; }
  .hero-btn {
    background: var(--gold);
    border: none;
    color: var(--navy);
    padding: 0.85em 2.2em;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    border-radius: 3px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: background 0.2s, transform 0.15s;
  }
  .hero-btn:hover { background: var(--gold-light); transform: translateY(-1px); }
  .hero-btn-outline {
    background: transparent;
    border: 1.5px solid rgba(255,255,255,0.7);
    color: #fff;
  }
  .hero-btn-outline:hover { background: rgba(255,255,255,0.1); transform: translateY(-1px); }

  .section { max-width: 72rem; margin: 0 auto; padding: clamp(2.5rem, 6vw, 5rem) 1.5rem; }
  .section-header { text-align: center; margin-bottom: 2.5rem; }
  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.6rem, 3.5vw, 2.4rem);
    font-weight: 700;
    color: var(--navy);
    margin-bottom: 0.5rem;
    letter-spacing: -0.01em;
  }
  .section-sub { color: var(--muted); font-size: 0.95rem; }

  .grid-3 {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
    gap: 1.5rem;
  }

  .car-card {
    background: var(--white);
    border-radius: 0.75rem;
    overflow: hidden;
    cursor: pointer;
    box-shadow: var(--card-shadow);
    transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s ease;
    border: 1px solid var(--border);
  }
  .car-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.13); }
  .card-img-wrap { position: relative; height: 12.5rem; overflow: hidden; }
  .card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease, opacity 0.15s; display: block; }
  .car-card:hover .card-img { transform: scale(1.03); }
  .card-badge {
    position: absolute; top: 0.75rem; right: 0.75rem;
    color: #fff; font-size: 0.65rem; font-weight: 700;
    padding: 0.3em 0.75em; border-radius: 999px;
    letter-spacing: 0.08em; text-transform: uppercase;
    font-family: 'DM Sans', sans-serif;
  }
  .photo-dots { position: absolute; bottom: 0.6rem; left: 50%; transform: translateX(-50%); display: flex; gap: 0.3rem; }
  .photo-dot { width: 5px; height: 5px; border-radius: 50%; transition: background 0.2s; }
  .card-body { padding: 1.25rem; }
  .card-tags { display: flex; gap: 0.4rem; margin-bottom: 0.6rem; flex-wrap: wrap; }
  .card-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; color: var(--navy); margin-bottom: 0.3rem; }
  .card-sub { color: var(--muted); font-size: 0.8rem; margin-bottom: 0.75rem; }
  .card-price { font-family: 'Playfair Display', serif; font-size: 1.35rem; font-weight: 700; color: var(--gold); }
  .card-price-sub { font-size: 0.75rem; color: var(--muted); font-weight: 400; font-family: 'DM Sans', sans-serif; }

  .tag {
    background: #f0ede6;
    color: #666;
    font-size: 0.7rem;
    padding: 0.25em 0.65em;
    border-radius: 999px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    letter-spacing: 0.03em;
  }

  /* ── Advanced Filters ── */
  .filters-wrapper { margin-bottom: 1.75rem; }
  .filters-bar {
    display: flex; align-items: center; justify-content: space-between;
    background: var(--white); border: 1px solid var(--border);
    border-radius: 0.6rem; padding: 0.7rem 1rem; cursor: pointer;
    user-select: none; transition: border-color 0.18s;
  }
  .filters-bar:hover { border-color: var(--gold); }
  .filters-bar-left { display: flex; align-items: center; gap: 0.6rem; font-size: 0.88rem; font-weight: 600; color: var(--navy); }
  .filters-active-badge {
    background: var(--navy); color: var(--gold);
    font-size: 0.7rem; font-weight: 700;
    padding: 2px 8px; border-radius: 999px;
  }
  .filters-reset-btn {
    font-size: 0.75rem; color: #999; background: none;
    border: 1px solid var(--border); border-radius: 0.3rem;
    padding: 2px 8px; cursor: pointer; transition: background 0.15s;
  }
  .filters-reset-btn:hover { background: #f0ede6; }
  .filters-arrow { font-size: 0.8rem; color: #aaa; display: inline-block; transition: transform 0.2s; }
  .filters-panel {
    background: var(--white); border: 1px solid var(--border);
    border-top: none; border-radius: 0 0 0.6rem 0.6rem;
    padding: 1.1rem; display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 0.85rem 1rem;
  }
  .filter-group label {
    display: block; font-size: 0.68rem; font-weight: 700;
    color: #aaa; text-transform: uppercase;
    letter-spacing: 0.09em; margin-bottom: 0.35rem;
  }
  .filter-select {
    width: 100%; padding: 0.5em 0.7em; border-radius: 0.4rem;
    border: 1px solid var(--border); background: var(--cream);
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
    color: var(--text); outline: none; transition: border-color 0.18s;
    appearance: auto;
  }
  .filter-select:focus { border-color: var(--gold); }
  .filter-divider { grid-column: 1 / -1; border: none; border-top: 1px solid var(--border); margin: 0.2rem 0; }
  .filter-tags-area { grid-column: 1 / -1; }
  .filter-tags-label { font-size: 0.68rem; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.09em; margin-bottom: 0.5rem; display: block; }
  .filter-tags-row { display: flex; gap: 0.4rem; flex-wrap: wrap; }
  .filter-tag-btn {
    background: var(--white); border: 1px solid var(--border);
    color: #666; padding: 0.3em 0.85em; border-radius: 999px;
    cursor: pointer; font-size: 0.78rem; font-family: 'DM Sans', sans-serif;
    font-weight: 500; transition: all 0.15s;
  }
  .filter-tag-btn:hover { border-color: var(--gold); color: var(--navy); }
  .filter-tag-btn.active { background: var(--navy); border-color: var(--navy); color: var(--gold); }
  .filters-summary { font-size: 0.8rem; color: var(--muted); margin-top: 0.6rem; min-height: 1.2rem; }

  .cta-strip {
    background: var(--navy);
    padding: clamp(2rem, 5vw, 3.5rem) 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    flex-wrap: wrap;
  }
  .cta-inner { max-width: 72rem; margin: 0 auto; width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap; }
  .cta-title { font-family: 'Playfair Display', serif; color: #fff; font-size: clamp(1.1rem, 2.5vw, 1.5rem); font-weight: 700; margin-bottom: 0.3rem; }
  .cta-sub { color: rgba(255,255,255,0.55); font-size: 0.9rem; }
  .cta-button {
    background: var(--gold);
    border: none;
    color: var(--navy);
    padding: 0.85em 2em;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    border-radius: 3px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    white-space: nowrap;
    transition: background 0.2s, transform 0.15s;
    flex-shrink: 0;
  }
  .cta-button:hover { background: var(--gold-light); transform: translateY(-1px); }

  .contact-card {
    background: var(--white);
    border-radius: 0.75rem;
    padding: clamp(1.5rem, 4vw, 2.5rem);
    max-width: 32rem;
    margin: 0 auto;
    box-shadow: var(--card-shadow);
    border: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }
  .contact-item { display: flex; align-items: center; gap: 1rem; font-size: 1rem; line-height: 1.4; }
  .contact-icon { font-size: 1.4rem; width: 2rem; flex-shrink: 0; }

  .footer {
    background: #111;
    color: #555;
    text-align: center;
    padding: 2.5rem 1.5rem;
    margin-top: auto;
  }
  .footer-logo { font-family: 'Playfair Display', serif; font-size: 1.3rem; letter-spacing: 0.12em; margin-bottom: 0.5rem; }
  .footer-sub { font-size: 0.78rem; }

  .overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.65);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex; align-items: center; justify-content: center;
    padding: 1rem;
  }
  .modal {
    background: var(--white);
    border-radius: 1rem;
    width: 100%;
    max-width: 36rem;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 24px 80px rgba(0,0,0,0.3);
  }
  .modal-close {
    position: absolute; top: 1rem; right: 1rem;
    background: rgba(0,0,0,0.08); border: none; border-radius: 50%;
    width: 2rem; height: 2rem; cursor: pointer; z-index: 10;
    font-size: 0.85rem; display: flex; align-items: center; justify-content: center;
    transition: background 0.15s;
  }
  .modal-close:hover { background: rgba(0,0,0,0.15); }

  .modal-gallery {
    position: relative;
    height: 15rem;
    overflow: hidden;
    border-radius: 1rem 1rem 0 0;
    background: #111;
    user-select: none;
  }
  .modal-gallery-img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
    transition: opacity 0.2s;
  }
  .modal-gallery-nav {
    position: absolute; top: 50%; transform: translateY(-50%);
    background: rgba(0,0,0,0.45); border: none; color: #fff;
    border-radius: 50%; width: 2.2rem; height: 2.2rem;
    font-size: 1.4rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s;
    z-index: 5;
  }
  .modal-gallery-nav:hover { background: rgba(0,0,0,0.7); }
  .modal-gallery-counter {
    position: absolute; bottom: 0.6rem; right: 0.75rem;
    background: rgba(0,0,0,0.55); color: #fff; font-size: 0.72rem;
    padding: 0.25em 0.7em; border-radius: 999px; backdrop-filter: blur(4px);
  }
  .modal-gallery-dots {
    position: absolute; bottom: 0.65rem; left: 50%; transform: translateX(-50%);
    display: flex; gap: 0.3rem;
  }
  .modal-gallery-dot {
    width: 6px; height: 6px; border-radius: 50%;
    transition: background 0.2s, transform 0.2s;
    cursor: pointer;
  }
  .modal-gallery-zoom-hint {
    position: absolute; top: 0.6rem; left: 0.75rem;
    background: rgba(0,0,0,0.45); color: rgba(255,255,255,0.8);
    font-size: 0.65rem; padding: 0.2em 0.6em; border-radius: 999px;
    pointer-events: none;
  }

  .modal-body { padding: 1.75rem; }
  .modal-tags { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
  .modal-title { font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 700; color: var(--navy); margin-bottom: 0.3rem; }
  .modal-year { color: var(--muted); font-size: 0.88rem; margin-bottom: 1rem; }
  .modal-price { font-family: 'Playfair Display', serif; font-size: 1.9rem; font-weight: 700; color: var(--gold); margin-bottom: 0.75rem; }
  .modal-description { font-size: 0.9rem; color: #555; line-height: 1.7; margin-bottom: 1.25rem; }
  .contact-call-btn {
    display: block; background: var(--navy); color: var(--gold);
    text-align: center; padding: 0.9em; border-radius: 0.5rem;
    font-weight: 700; text-decoration: none; font-size: 1rem;
    letter-spacing: 0.04em; transition: background 0.18s;
  }
  .contact-call-btn:hover { background: #2a2a4e; }

  .sold-overlay {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.45);
    display: flex; align-items: center; justify-content: center;
    pointer-events: none;
  }
  .sold-stamp {
    border: 3px solid #e74c3c;
    color: #e74c3c;
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    font-weight: 900;
    padding: 0.2em 0.6em;
    border-radius: 4px;
    letter-spacing: 0.12em;
    transform: rotate(-12deg);
    background: rgba(0,0,0,0.2);
    text-shadow: 0 1px 4px rgba(0,0,0,0.4);
  }

  .gallery-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.95);
    z-index: 2000;
    display: flex; align-items: center; justify-content: center;
  }
  .gallery-box { position: relative; max-width: 56rem; width: 100%; padding: 3rem 1.5rem 1.5rem; }
  .gallery-close {
    position: absolute; top: 0.5rem; right: 0.75rem;
    background: rgba(255,255,255,0.1); border: none; color: #fff;
    border-radius: 50%; width: 2.25rem; height: 2.25rem;
    cursor: pointer; font-size: 1.1rem; z-index: 10;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s;
  }
  .gallery-close:hover { background: rgba(255,255,255,0.2); }
  .gallery-main { width: 100%; max-height: 65vh; object-fit: contain; border-radius: 0.5rem; display: block; margin: 0 auto; }
  .gallery-nav {
    position: absolute; top: 50%; transform: translateY(-50%);
    background: rgba(255,255,255,0.12); border: none; color: #fff;
    border-radius: 50%; width: 2.75rem; height: 2.75rem;
    font-size: 1.75rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s;
  }
  .gallery-nav:hover { background: rgba(255,255,255,0.22); }
  .gallery-thumbs { display: flex; gap: 0.5rem; justify-content: center; margin-top: 1rem; flex-wrap: wrap; }
  .gallery-thumb { width: 4rem; height: 3rem; object-fit: cover; border-radius: 0.25rem; cursor: pointer; opacity: 0.45; transition: opacity 0.2s; }
  .gallery-thumb.active { opacity: 1; outline: 2px solid var(--gold); }
  .gallery-counter { text-align: center; color: #666; font-size: 0.8rem; margin-top: 0.6rem; }

  .admin-login { padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 0.9rem; }
  .login-icon { font-size: 2.5rem; }
  .login-sub { color: var(--muted); font-size: 0.82rem; text-align: center; }
  .auth-error { background: #fdecea; color: #e74c3c; border-radius: 0.4rem; padding: 0.5em 0.75em; font-size: 0.82rem; text-align: center; width: 100%; }
  .admin-panel { padding: 1.75rem; }
  .admin-title { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 700; color: var(--navy); }
  .admin-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
  .admin-user-badge { color: #27ae60; font-size: 0.75rem; margin-top: 0.25rem; font-family: monospace; }
  .logout-btn {
    background: #f8f8f8; border: 1px solid var(--border); color: #666;
    padding: 0.4em 0.9em; border-radius: 0.4rem; cursor: pointer;
    font-size: 0.82rem; font-family: 'DM Sans', sans-serif; transition: background 0.15s;
  }
  .logout-btn:hover { background: #eee; }
  .admin-section-title { font-size: 0.75rem; font-weight: 700; color: #aaa; margin: 0 0 1rem; text-transform: uppercase; letter-spacing: 0.1em; }
  .admin-form { display: flex; flex-direction: column; gap: 0.75rem; }
  .form-row { display: flex; gap: 0.75rem; }
  .input, .select-field, .textarea-field {
    flex: 1; padding: 0.65em 0.9em; border-radius: 0.5rem;
    border: 1px solid var(--border); font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem; outline: none; background: var(--white);
    transition: border-color 0.18s, box-shadow 0.18s;
    min-width: 0;
  }
  .textarea-field { resize: vertical; min-height: 5rem; }
  .input:focus, .select-field:focus, .textarea-field:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,168,76,0.15); }
  .tag-picker { background: #f8f8f8; border-radius: 0.5rem; padding: 0.9rem; }
  .tag-picker-label { font-size: 0.72rem; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.6rem; display: block; }
  .tag-picker-grid { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .tag-picker-btn {
    background: var(--white); border: 1px solid var(--border);
    padding: 0.3em 0.75em; border-radius: 999px; cursor: pointer;
    font-size: 0.75rem; font-family: 'DM Sans', sans-serif; transition: all 0.15s;
  }
  .tag-picker-btn:hover { border-color: var(--gold); }
  .tag-picker-btn.active { background: var(--navy); border-color: var(--navy); color: var(--gold); }
  .dropzone {
    border: 2px dashed var(--border); border-radius: 0.6rem;
    padding: 1.5rem 1rem; text-align: center; cursor: pointer;
    background: #fafafa; transition: all 0.2s;
  }
  .dropzone.dragging { border-color: var(--gold); background: #fffbf0; }
  .dropzone-text { color: var(--muted); font-size: 0.88rem; line-height: 1.8; }
  .preview-grid { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.6rem; }
  .preview-item { position: relative; width: 5rem; height: 3.75rem; }
  .preview-img { width: 100%; height: 100%; object-fit: cover; border-radius: 0.4rem; display: block; }
  .preview-remove {
    position: absolute; top: -0.4rem; right: -0.4rem;
    background: #e74c3c; border: none; color: #fff;
    border-radius: 50%; width: 1.2rem; height: 1.2rem;
    font-size: 0.6rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }
  .preview-main { position: absolute; bottom: 0.1rem; left: 0.15rem; background: rgba(0,0,0,0.6); color: #fff; font-size: 0.55rem; padding: 0.1em 0.3em; border-radius: 0.2rem; }
  .check-label { font-size: 0.88rem; display: flex; align-items: center; cursor: pointer; gap: 0.4rem; }
  .submit-btn {
    background: var(--navy); color: var(--gold);
    border: none; padding: 0.8em;
    border-radius: 0.5rem; font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem; font-weight: 700; cursor: pointer;
    letter-spacing: 0.04em; transition: background 0.18s, opacity 0.18s;
  }
  .submit-btn:hover:not(:disabled) { background: #2a2a4e; }
  .admin-list { display: flex; flex-direction: column; gap: 0.6rem; max-height: 18rem; overflow-y: auto; }
  .admin-list-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.7rem 0.9rem; background: #f8f8f8;
    border-radius: 0.5rem; border: 1px solid var(--border);
  }
  .admin-list-info { display: flex; flex-direction: column; gap: 0.15rem; }
  .admin-list-sub { font-size: 0.75rem; color: var(--muted); }
  .admin-list-actions { display: flex; gap: 0.5rem; }
  .admin-action-btn { border: none; border-radius: 0.4rem; width: 2rem; height: 2rem; cursor: pointer; font-size: 0.9rem; transition: opacity 0.15s; display: flex; align-items: center; justify-content: center; }
  .admin-action-btn:hover { opacity: 0.8; }

  .loading-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 20rem; gap: 1rem; color: var(--muted); }
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner { width: 2.5rem; height: 2.5rem; border: 3px solid var(--border); border-top-color: var(--gold); border-radius: 50%; animation: spin 0.8s linear infinite; }

  .banner { background: #e67e22; color: #fff; text-align: center; padding: 0.65rem 1rem; font-size: 0.85rem; font-weight: 500; }

  .ornament { display: flex; align-items: center; justify-content: center; gap: 0.75rem; margin: 0 0 2rem; }
  .ornament-line { flex: 1; max-width: 4rem; height: 1px; background: var(--gold); opacity: 0.4; }
  .ornament-dot { width: 0.4rem; height: 0.4rem; background: var(--gold); border-radius: 50%; }

  .chisiamo-hero {
    background: var(--navy);
    padding: clamp(3rem, 7vw, 5rem) 1.5rem;
    text-align: center;
  }
  .chisiamo-hero-eyebrow {
    color: var(--gold);
    letter-spacing: 0.28em;
    font-size: 0.7rem;
    text-transform: uppercase;
    font-weight: 500;
    margin-bottom: 0.75rem;
  }
  .chisiamo-hero-title {
    font-family: 'Playfair Display', serif;
    color: #fff;
    font-size: clamp(1.8rem, 4vw, 2.8rem);
    font-weight: 700;
    margin-bottom: 1rem;
  }
  .chisiamo-hero-sub {
    color: rgba(255,255,255,0.6);
    font-size: 1rem;
    max-width: 36rem;
    margin: 0 auto;
    line-height: 1.7;
  }
  .stats-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0;
    background: var(--gold);
    max-width: 72rem;
    margin: 0 auto;
  }
  .stat-block {
    padding: 1.75rem 1rem;
    text-align: center;
    border-right: 1px solid rgba(26,26,46,0.15);
  }
  .stat-block:last-child { border-right: none; }
  .stat-num {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.8rem, 4vw, 2.6rem);
    font-weight: 900;
    color: var(--navy);
    display: block;
    line-height: 1;
    margin-bottom: 0.3rem;
  }
  .stat-label {
    font-size: 0.75rem;
    color: rgba(26,26,46,0.65);
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .values-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
    gap: 1.25rem;
    margin-top: 0.5rem;
  }
  .value-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    padding: 1.5rem 1.25rem;
    box-shadow: var(--card-shadow);
  }
  .value-icon { font-size: 1.8rem; margin-bottom: 0.75rem; display: block; }
  .value-title {
    font-family: 'Playfair Display', serif;
    font-size: 1rem;
    font-weight: 700;
    color: var(--navy);
    margin-bottom: 0.4rem;
  }
  .value-text { font-size: 0.85rem; color: #666; line-height: 1.65; }

  .trust-badges {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1.5rem;
    margin-top: 2rem;
  }
  .trust-badge {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 0.5em 1.2em;
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--navy);
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  .trust-badge-icon { font-size: 1.1rem; }

  @media (max-width: 640px) {
    .form-row { flex-direction: column; }
    .hero-btns { flex-direction: column; }
    .cta-inner { flex-direction: column; align-items: flex-start; }
    .stat-block { border-right: none; border-bottom: 1px solid rgba(26,26,46,0.15); }
    .stat-block:last-child { border-bottom: none; }
    .filters-panel { grid-template-columns: 1fr 1fr; }
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

function useNavHide() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      if (y < 60) { setHidden(false); }
      else if (y > lastY.current + 4) { setHidden(true); }
      else if (y < lastY.current - 4) { setHidden(false); }
      lastY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return hidden;
}

// ── Advanced Filters Component ──
function AdvancedFilters({ filters, onChange, allTags, type, resultCount }) {
  const [open, setOpen] = useState(false);

  const activeCount = Object.entries(filters).filter(([k, v]) =>
    k === "tag" ? v !== null : v !== ""
  ).length;

  function set(key, val) {
    onChange({ ...filters, [key]: key === "tag" ? (val || null) : (val || "") });
  }

  function resetAll(e) {
    e.stopPropagation();
    onChange({ ...EMPTY_FILTERS });
  }

  const PRICE_OPTIONS_VENDITA = [
    ["1000", "€ 1.000"], ["2000", "€ 2.000"], ["3000", "€ 3.000"],
    ["4000", "€ 4.000"], ["5000", "€ 5.000"], ["10000", "€ 10.000"], ["15000", "€ 15.000"],
  ];
  const PRICE_OPTIONS_NOLEGGIO = [
    ["30", "€ 30/g"], ["50", "€ 50/g"], ["80", "€ 80/g"],
    ["120", "€ 120/g"], ["200", "€ 200/g"],
  ];
  const priceOptions = type === "noleggio" ? PRICE_OPTIONS_NOLEGGIO : PRICE_OPTIONS_VENDITA;

  const summaryParts = [];
  if (filters.fuel) summaryParts.push(filters.fuel);
  if (filters.yearFrom || filters.yearTo) summaryParts.push(`${filters.yearFrom || "–"} → ${filters.yearTo || "–"}`);
  if (filters.kmMax) summaryParts.push(`max ${parseInt(filters.kmMax).toLocaleString("it")} km`);
  if (filters.priceMax) summaryParts.push(type === "noleggio" ? `max €${filters.priceMax}/g` : `max €${parseInt(filters.priceMax).toLocaleString("it")}`);
  if (filters.cambio) summaryParts.push(filters.cambio);
  if (filters.tag) summaryParts.push(filters.tag);

  return (
    <div className="filters-wrapper">
      <div className={`filters-bar${open ? " open" : ""}`} onClick={() => setOpen(o => !o)}
        style={{ borderRadius: open ? "0.6rem 0.6rem 0 0" : "0.6rem" }}>
        <div className="filters-bar-left">
          <span>🎛️ Filtri avanzati</span>
          {activeCount > 0 && <span className="filters-active-badge">{activeCount}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          {activeCount > 0 && (
            <button className="filters-reset-btn" onClick={resetAll}>Azzera tutto</button>
          )}
          <span className="filters-arrow" style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
        </div>
      </div>

      {open && (
        <div className="filters-panel">
          {/* Carburante */}
          <div className="filter-group">
            <label>Carburante</label>
            <select className="filter-select" value={filters.fuel} onChange={e => set("fuel", e.target.value)}>
              <option value="">Tutti</option>
              {["Benzina", "Diesel", "Ibrida", "Elettrica", "GPL"].map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Anno da */}
          <div className="filter-group">
            <label>Anno da</label>
            <select className="filter-select" value={filters.yearFrom} onChange={e => set("yearFrom", e.target.value)}>
              <option value="">Qualsiasi</option>
              {[2015,2016,2017,2018,2019,2020,2021,2022,2023,2024].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Anno a */}
          <div className="filter-group">
            <label>Anno a</label>
            <select className="filter-select" value={filters.yearTo} onChange={e => set("yearTo", e.target.value)}>
              <option value="">Qualsiasi</option>
              {[2016,2017,2018,2019,2020,2021,2022,2023,2024,2025].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Km massimi */}
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

          {/* Prezzo massimo */}
          <div className="filter-group">
            <label>{type === "noleggio" ? "Prezzo max/giorno" : "Prezzo massimo"}</label>
            <select className="filter-select" value={filters.priceMax} onChange={e => set("priceMax", e.target.value)}>
              <option value="">Qualsiasi</option>
              {priceOptions.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          {/* Cambio */}
          <div className="filter-group">
            <label>Cambio</label>
            <select className="filter-select" value={filters.cambio} onChange={e => set("cambio", e.target.value)}>
              <option value="">Tutti</option>
              <option value="automatico">Automatico</option>
              <option value="cambio manuale">Manuale</option>
            </select>
          </div>

          <hr className="filter-divider" />

          {/* Tag caratteristiche */}
          <div className="filter-tags-area">
            <span className="filter-tags-label">Caratteristiche</span>
            <div className="filter-tags-row">
              {allTags.map(t => (
                <button key={t} type="button"
                  className={`filter-tag-btn${filters.tag === t ? " active" : ""}`}
                  onClick={() => set("tag", filters.tag === t ? null : t)}>
                  {t}
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
        <input ref={inputRef} type="file" multiple accept="image/*" style={{ display: "none" }}
          onChange={e => handleFiles(e.target.files)} />
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

function CarCard({ car, onClick }) {
  const images = car.images?.length ? car.images : [PLACEHOLDER];
  const [imgIdx, setImgIdx] = useState(0);
  const intervalRef = useRef(null);
  const isSold = car.status === "venduta";

  function handleMouseEnter() {
    if (images.length <= 1 || isSold) return;
    let i = 0;
    intervalRef.current = setInterval(() => { i = (i + 1) % images.length; setImgIdx(i); }, 700);
  }
  function handleMouseLeave() { clearInterval(intervalRef.current); setImgIdx(0); }

  const badgeColor = isSold ? "#e74c3c" : car.type === "noleggio" ? "#e67e22" : "#1a1a2e";
  const badgeLabel = isSold ? "Venduta" : car.type === "noleggio" ? "Noleggio" : "Vendita";

  return (
    <div className="car-card" onClick={onClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
      style={{ opacity: isSold ? 0.82 : 1 }}>
      <div className="card-img-wrap">
        <img src={images[imgIdx]} alt={car.model} className="card-img" style={{ filter: isSold ? "grayscale(35%)" : "none" }} />
        <div className="card-badge" style={{ background: badgeColor }}>{badgeLabel}</div>
        {isSold && (
          <div className="sold-overlay">
            <div className="sold-stamp">VENDUTA</div>
          </div>
        )}
        {images.length > 1 && !isSold && (
          <div className="photo-dots">
            {images.map((_, i) => (
              <div key={i} className="photo-dot" style={{ background: i === imgIdx ? "#c9a84c" : "rgba(255,255,255,0.6)" }} />
            ))}
          </div>
        )}
      </div>
      <div className="card-body">
        <div className="card-tags">{(car.tags || []).slice(0, 2).map(t => <Tag key={t} label={t} />)}</div>
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
      </div>
    </div>
  );
}

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
        {[
          { num: "15+", label: "Anni di esperienza" },
          { num: "800+", label: "Auto vendute" },
          { num: "0%", label: "Stress" },
          { num: "100%", label: "Trasparenza" },
        ].map(s => (
          <div key={s.label} className="stat-block">
            <span className="stat-num">{s.num}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      <section className="section">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 22rem), 1fr))", gap: "3rem", alignItems: "center" }}>
          <div>
            <h2 className="section-title" style={{ textAlign: "left" }}>Una realtà di famiglia, qui a Roma</h2>
            <div className="ornament" style={{ justifyContent: "flex-start" }}>
              <div className="ornament-dot" />
              <div className="ornament-line" style={{ maxWidth: "6rem" }} />
            </div>
            <p style={{ color: "#555", lineHeight: 1.8, fontSize: "0.95rem", marginBottom: "1rem" }}>
              Siamo su Via Collatina, in questi anni abbiamo aiutato centinaia di famiglie romane a trovare l'auto giusta senza spendere troppo. Non lavoriamo con finanziamenti a tasso stellare né con auto dall'origine incerta.
            </p>
            <p style={{ color: "#555", lineHeight: 1.8, fontSize: "0.95rem", marginBottom: "1rem" }}>
              Ogni auto che entra nel nostro piazzale viene ispezionata, controllata nella storia e fotografata per bene. Se c'è qualcosa che non va, te lo diciamo prima — non dopo.
            </p>
            <p style={{ color: "#555", lineHeight: 1.8, fontSize: "0.95rem" }}>
              Trovi da noi utilitarie, berline, SUV e auto a noleggio per qualsiasi esigenza.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ background: "#f0ede6", borderRadius: "0.75rem", padding: "1.5rem", borderLeft: "4px solid var(--gold)" }}>
              <p style={{ fontSize: "0.9rem", color: "#444", lineHeight: 1.7, fontStyle: "italic" }}>
                "Ho comprato la mia Polo da 2Rcar nel 2021. Raffaele mi ha spiegato quello che volevo sapere senza fretta. Un anno dopo è ancora perfetta."
              </p>
              <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--navy)", marginTop: "0.6rem" }}>— Marco T., cliente dal 2021</p>
            </div>
            <div style={{ background: "#f0ede6", borderRadius: "0.75rem", padding: "1.5rem", borderLeft: "4px solid var(--navy)" }}>
              <p style={{ fontSize: "0.9rem", color: "#444", lineHeight: 1.7, fontStyle: "italic" }}>
                "Cercavo un'auto per lavoro, noleggio mensile. Mi hanno trovato la soluzione in mezza giornata. Professionali e disponibili."
              </p>
              <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--navy)", marginTop: "0.6rem" }}>— Giulia R., cliente dal 2022</p>
            </div>
          </div>
        </div>
      </section>

      <div style={{ background: "#f0ede6", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "clamp(2rem, 5vw, 3.5rem) 1.5rem" }}>
        <div className="section" style={{ padding: "0" }}>
          <div className="section-header">
            <h2 className="section-title">Come lavoriamo</h2>
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
      </div>

      <section className="section" style={{ paddingBottom: "1rem" }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h2 className="section-title">Perché sceglierci</h2>
          <div className="ornament"><div className="ornament-line" /><div className="ornament-dot" /><div className="ornament-line" /></div>
        </div>
        <div className="trust-badges">
          {[
            ["✅", "Attività regolare con P.IVA"],
            ["📍", "Sede fisica verificabile a Roma"],
            ["📞", "Risposta telefonica garantita"],
            ["⭐", "Oltre 15 anni di esperienza"],
            ["🗓️", "Aperti dal lunedì al sabato"],
          ].map(([icon, label]) => (
            <div key={label} className="trust-badge">
              <span className="trust-badge-icon">{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

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
  const [formPreviews, setFormPreviews] = useState([]);
  const [formFiles, setFormFiles] = useState([]);
  const [form, setForm] = useState({
    brand: "", model: "", year: "", price: "", km: "",
    fuel: "Benzina", type: "vendita", tags: [], featured: false, description: ""
  });

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

  async function toggleFeatured(id) {
    if (!adminUser) return;
    const car = cars.find(c => c.id === id);
    const currentFeatured = cars.filter(c => c.featured);
    let updates = [];
    if (!car.featured && currentFeatured.length >= 3) {
      updates = [{ id: currentFeatured[0].id, featured: false }, { id, featured: true }];
    } else { updates = [{ id, featured: !car.featured }]; }
    setCars(prev => prev.map(c => { const u = updates.find(x => x.id === c.id); return u ? { ...c, featured: u.featured } : c; }));
    if (dbConnected) for (const u of updates) await supabase.from("cars").update({ featured: u.featured }).eq("id", u.id);
  }

  async function toggleSold(id) {
    if (!adminUser) return;
    const car = cars.find(c => c.id === id);
    const isSold = car.status === "venduta";
    const newStatus = isSold ? car.type : "venduta";
    const soldAt = isSold ? null : new Date().toISOString();
    setCars(prev => prev.map(c => c.id === id ? { ...c, status: newStatus, sold_at: soldAt } : c));
    if (dbConnected) await supabase.from("cars").update({ status: newStatus, sold_at: soldAt }).eq("id", id);
  }

  async function handleAddCar(e) {
    e.preventDefault(); if (!adminUser) return;
    setSaving(true); setUploading(true);
    let imageUrls = [];
    if (formFiles.length > 0) imageUrls = await uploadImages(formFiles);
    setUploading(false);
    const newCar = {
      brand: form.brand, model: form.model, year: parseInt(form.year),
      price: parseFloat(form.price), km: parseInt(form.km),
      fuel: form.fuel, type: form.type, status: form.type,
      tags: form.tags, featured: form.featured,
      images: imageUrls.length ? imageUrls : [PLACEHOLDER],
      description: form.description,
      sold_at: null,
    };
    if (dbConnected) {
      const { data, error } = await supabase.from("cars").insert([newCar]).select().single();
      if (error) { alert("Errore DB: " + error.message); setSaving(false); return; }
      setCars(prev => [data, ...prev]);
    } else { setCars(prev => [{ ...newCar, id: Date.now() }, ...prev]); }
    setForm({ brand: "", model: "", year: "", price: "", km: "", fuel: "Benzina", type: "vendita", tags: [], featured: false, description: "" });
    setFormPreviews([]); setFormFiles([]);
    setSaving(false);
    alert("Annuncio aggiunto!");
  }

  async function deleteCar(id) {
    if (!adminUser) return;
    if (!confirm("Eliminare questo annuncio?")) return;
    setCars(prev => prev.filter(c => c.id !== id));
    if (dbConnected) await supabase.from("cars").delete().eq("id", id);
  }

  function toggleFormTag(tag) {
    setForm(f => ({ ...f, tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag] }));
  }

  // ── Logica di filtraggio avanzata ──
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

  const visibleCars = cars.filter(c => !isExpired(c));
  const featuredCars = visibleCars.filter(c => c.featured).slice(0, 3);
  const saleCars = visibleCars.filter(c => c.type === "vendita");
  const rentalCars = visibleCars.filter(c => c.type === "noleggio");
  const filteredSale = applyFilters(saleCars);
  const filteredRental = applyFilters(rentalCars);
  const allTags = [...new Set(visibleCars.flatMap(c => c.tags || []))];

  function navigateTo(newPage) {
    setPage(newPage);
    setFilters({ ...EMPTY_FILTERS });
  }

  function openCar(car) { setSelectedCar(car); setGalleryOpen(false); setGalleryStartIdx(0); }
  function openZoom(idx) { setGalleryStartIdx(idx); setGalleryOpen(true); }

  return (
    <div className="page-wrapper">
      <GlobalStyles />

      {!dbConnected && !loading && <div className="banner">⚠️ Modalità demo — Supabase non configurato</div>}

      <nav className={`nav-bar${navHidden ? " hidden" : ""}`}>
        <div className="nav-inner">
          <div style={{ cursor: "pointer", letterSpacing: "0.12em", fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.15em" }}
            onClick={() => navigateTo("Home")}>
            <span style={{ color: "#c9a84c", fontFamily: "'Playfair Display', serif", fontWeight: 900 }}>2R</span>
            <span style={{ color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 300, letterSpacing: "0.18em", fontSize: "0.85em" }}>CAR</span>
          </div>
          <div style={{ display: "flex", gap: "0.25rem", alignItems: "center", flexWrap: "wrap" }}>
            {NAV_ITEMS.map(item => (
              <button key={item}
                style={{
                  background: page === item ? "rgba(201,168,76,0.1)" : "none",
                  border: "none",
                  color: page === item ? "#c9a84c" : "#bbb",
                  cursor: "pointer", fontSize: "0.82rem",
                  padding: "0.5em 0.9em", borderRadius: "0.4rem",
                  letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif",
                  fontWeight: page === item ? 600 : 400,
                  transition: "color 0.15s, background 0.15s",
                }}
                onClick={() => navigateTo(item)}>{item}</button>
            ))}
            <button
              style={{
                background: "rgba(201,168,76,0.15)",
                border: "1px solid rgba(201,168,76,0.5)",
                color: "#c9a84c", cursor: "pointer",
                fontSize: "0.78rem", padding: "0.4em 0.9em",
                borderRadius: "0.4rem", fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600, letterSpacing: "0.04em",
                marginLeft: "0.5rem", transition: "background 0.15s",
              }}
              onClick={() => setAdminOpen(true)}>
              {adminUser ? "Admin ✓" : "Admin ⚙"}
            </button>
          </div>
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
                    ? <p style={{ textAlign: "center", color: "#aaa", padding: "2.5rem 0" }}>Nessuna auto in vetrina</p>
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

            {page === "Vendita" && (
              <section className="section">
                <div className="section-header">
                  <h2 className="section-title">Auto in Vendita</h2>
                  <div className="ornament"><div className="ornament-line" /><div className="ornament-dot" /><div className="ornament-line" /></div>
                </div>
                <AdvancedFilters
                  filters={filters}
                  onChange={setFilters}
                  allTags={allTags}
                  type="vendita"
                  resultCount={filteredSale.length}
                />
                {filteredSale.length === 0
                  ? <EmptyState text="Nessuna auto corrisponde ai filtri selezionati." />
                  : <div className="grid-3">{filteredSale.map(car => <CarCard key={car.id} car={car} onClick={() => openCar(car)} />)}</div>}
              </section>
            )}

            {page === "Noleggio" && (
              <section className="section">
                <div className="section-header">
                  <h2 className="section-title">Auto a Noleggio</h2>
                  <div className="ornament"><div className="ornament-line" /><div className="ornament-dot" /><div className="ornament-line" /></div>
                  <p className="section-sub">Prezzi al giorno — disponibilità immediata</p>
                </div>
                <AdvancedFilters
                  filters={filters}
                  onChange={setFilters}
                  allTags={allTags}
                  type="noleggio"
                  resultCount={filteredRental.length}
                />
                {filteredRental.length === 0
                  ? <EmptyState text="Nessuna auto corrisponde ai filtri selezionati." />
                  : <div className="grid-3">{filteredRental.map(car => <CarCard key={car.id} car={car} onClick={() => openCar(car)} />)}</div>}
              </section>
            )}

            {page === "Chi Siamo" && <ChiSiamo onContact={() => navigateTo("Contatti")} />}

            {page === "Contatti" && (
              <section className="section">
                <div className="section-header">
                  <h2 className="section-title">Contattaci</h2>
                  <div className="ornament"><div className="ornament-line" /><div className="ornament-dot" /><div className="ornament-line" /></div>
                  <p className="section-sub">Siamo a tua disposizione</p>
                </div>
                <div className="contact-card">
                  {[["📍", "Via Collatina 381, Roma (RM)"], ["📞", "393 000 8654 — 06 88922000"], ["✉️", "2erreprofessionalcar@libero.it"], ["🕐", "Lun–Sab: 9:00–19:00"]].map(([icon, text]) => (
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
        <p className="footer-logo"><span style={{ color: "#c9a84c" }}>2R</span> CAR</p>
        <p className="footer-sub">Via Collatina, 381 — Roma</p>
        {dbConnected && <p style={{ fontSize: "0.72rem", color: "#2ecc71", marginTop: "0.3rem" }}>● Database connesso</p>}
      </footer>

      {selectedCar && (
        <Modal onClose={() => { setSelectedCar(null); setGalleryOpen(false); }}>
          <ModalGallery images={selectedCar.images} onZoom={openZoom} />
          <div className="modal-body">
            <div className="modal-tags">
              {(selectedCar.tags || []).map(t => <Tag key={t} label={t} />)}
              <span className="tag" style={{
                background: selectedCar.status === "venduta" ? "#e74c3c" : selectedCar.type === "noleggio" ? "#e67e22" : "#27ae60",
                color: "#fff"
              }}>
                {selectedCar.status === "venduta" ? "Venduta" : selectedCar.type === "noleggio" ? "Noleggio" : "Vendita"}
              </span>
            </div>
            <h2 className="modal-title">{selectedCar.brand} {selectedCar.model}</h2>
            <p className="modal-year">{selectedCar.year} · {selectedCar.fuel} · {selectedCar.km?.toLocaleString()} km</p>
            {selectedCar.status !== "venduta" && (
              <p className="modal-price">
                {selectedCar.type === "noleggio" ? `€ ${selectedCar.price}/giorno` : `€ ${selectedCar.price?.toLocaleString()}`}
              </p>
            )}
            {selectedCar.description && (
              <p className="modal-description">{selectedCar.description}</p>
            )}
            {selectedCar.status !== "venduta"
              ? <a href="tel:+393000008654" className="contact-call-btn">📞 Chiama per info</a>
              : <div style={{ background: "#fdecea", color: "#e74c3c", borderRadius: "0.5rem", padding: "0.9em", textAlign: "center", fontWeight: 700 }}>Auto non più disponibile</div>
            }
          </div>
        </Modal>
      )}

      {selectedCar && galleryOpen && (
        <PhotoGallery images={selectedCar.images} startIdx={galleryStartIdx} onClose={() => setGalleryOpen(false)} />
      )}

      {adminOpen && (
        <Modal onClose={() => setAdminOpen(false)}>
          {!adminUser ? (
            <div className="admin-login">
              <div className="login-icon">🔐</div>
              <h2 className="admin-title" style={{ textAlign: "center" }}>Accesso Admin</h2>
              <p className="login-sub">Accesso protetto</p>
              <form onSubmit={handleAdminLogin} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <input type="email" placeholder="Email admin" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="input" autoComplete="username" />
                <input type="password" placeholder="Password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="input" autoComplete="current-password" />
                {authError && <p className="auth-error">{authError}</p>}
                <button type="submit" className="submit-btn" style={{ opacity: authLoading ? 0.6 : 1 }} disabled={authLoading}>
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

              <p className="admin-section-title">➕ Nuovo Annuncio</p>
              <form onSubmit={handleAddCar} className="admin-form">
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
                    {["Benzina", "Diesel", "Ibrida", "Elettrica", "GPL"].map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="select-field">
                  <option value="vendita">Vendita</option>
                  <option value="noleggio">Noleggio</option>
                </select>
                <textarea
                  placeholder="Descrizione (optional) — es: tagliando recente, gomme nuove, navigatore originale, un proprietario..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="textarea-field"
                />
                <div className="tag-picker">
                  <span className="tag-picker-label">Tag</span>
                  <div className="tag-picker-grid">
                    {TAGS_AVAILABLE.map(t => (
                      <button type="button" key={t} onClick={() => toggleFormTag(t)} className={`tag-picker-btn${form.tags.includes(t) ? " active" : ""}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <span className="tag-picker-label" style={{ marginBottom: "0.25rem" }}>Foto</span>
                <ImageUploader previews={formPreviews} setPreviews={setFormPreviews} setUploadedFiles={setFormFiles} uploading={uploading} />
                <label className="check-label">
                  <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} />
                  Metti in vetrina
                </label>
                <button type="submit" className="submit-btn" style={{ opacity: (saving || uploading) ? 0.6 : 1 }} disabled={saving || uploading}>
                  {saving ? "Salvataggio..." : "Aggiungi Annuncio"}
                </button>
              </form>

              <p className="admin-section-title" style={{ marginTop: "2rem" }}>📋 Gestisci Annunci ({cars.length})</p>
              <div className="admin-list">
                {cars.map(car => {
                  const expired = isExpired(car);
                  return (
                    <div key={car.id} className="admin-list-item" style={{ opacity: expired ? 0.5 : 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <img src={car.images?.[0] || PLACEHOLDER} alt="" style={{ width: "3.25rem", height: "2.4rem", objectFit: "cover", borderRadius: "0.3rem", flexShrink: 0 }} />
                        <div className="admin-list-info">
                          <strong style={{ fontSize: "0.88rem" }}>{car.brand} {car.model}</strong>
                          <span className="admin-list-sub">
                            {car.year} · {car.status === "venduta" ? <span style={{ color: "#e74c3c" }}>VENDUTA{expired ? " (scaduta)" : ""}</span> : car.type === "noleggio" ? `€${car.price}/g` : `€${car.price?.toLocaleString()}`} · {car.images?.length || 1} foto
                          </span>
                        </div>
                      </div>
                      <div className="admin-list-actions">
                        <button className="admin-action-btn"
                          style={{ background: car.featured ? "#f39c12" : "#ecf0f1", color: car.featured ? "#fff" : "#333" }}
                          onClick={() => toggleFeatured(car.id)} title="Vetrina">⭐</button>
                        <button className="admin-action-btn"
                          style={{ background: car.status === "venduta" ? "#e74c3c" : "#27ae60", color: "#fff", fontSize: "0.7rem", fontWeight: 700 }}
                          onClick={() => toggleSold(car.id)}
                          title={car.status === "venduta" ? "Segna come disponibile" : "Segna come venduta"}>
                          {car.status === "venduta" ? "✓V" : "VND"}
                        </button>
                        <button className="admin-action-btn" style={{ background: "#e74c3c", color: "#fff" }} onClick={() => deleteCar(car.id)}>✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

function Tag({ label }) { return <span className="tag">{label}</span>; }
function EmptyState({ text }) { return <p style={{ textAlign: "center", color: "#aaa", padding: "3.75rem 0", fontSize: "1rem" }}>{text}</p>; }

function Modal({ children, onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  );
}
