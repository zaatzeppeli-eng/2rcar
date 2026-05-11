import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jveldjtakpniboajesyv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2ZWxkanRha3BuaWJvYWplc3l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MDk0MzMsImV4cCI6MjA5NDA4NTQzM30.ptt5U27hgBtVsmSKE23b7ys6kehYzqiJMOlvZOPBD2k";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TAGS_AVAILABLE = ["automatico", "navigatore", "pelle", "tetto apribile", "sportiva", "SUV", "4x4", "compatta", "city car", "ibrida", "elettrica", "cambio manuale"];
const NAV_ITEMS = ["Home", "Vendita", "Noleggio", "Contatti"];
const PLACEHOLDER = "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80";

const FALLBACK_CARS = [
  { id: 1, brand: "Mercedes-Benz", model: "Classe E", year: 2019, price: 24900, km: 87000, fuel: "Diesel", type: "vendita", tags: ["automatico", "navigatore", "pelle"], featured: true, images: ["https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80"] },
  { id: 2, brand: "BMW", model: "Serie 3 Touring", year: 2020, price: 28500, km: 62000, fuel: "Diesel", type: "vendita", tags: ["automatico", "tetto apribile", "sportiva"], featured: true, images: ["https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80"] },
  { id: 3, brand: "Volkswagen", model: "Tiguan R-Line", year: 2021, price: 120, km: 45000, fuel: "Benzina", type: "noleggio", tags: ["SUV", "automatico", "4x4"], featured: true, images: ["https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80"] },
];

// ── Upload foto su Supabase Storage ──
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

// ── Card con hover gallery ──
function CarCard({ car, onClick }) {
  const images = car.images?.length ? car.images : [PLACEHOLDER];
  const [imgIdx, setImgIdx] = useState(0);
  const intervalRef = useRef(null);

  function handleMouseEnter() {
    if (images.length <= 1) return;
    let i = 0;
    intervalRef.current = setInterval(() => {
      i = (i + 1) % images.length;
      setImgIdx(i);
    }, 600);
  }

  function handleMouseLeave() {
    clearInterval(intervalRef.current);
    setImgIdx(0);
  }

  return (
    <div style={styles.card} onClick={onClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div style={styles.cardImgWrap}>
        <img src={images[imgIdx]} alt={car.model} style={styles.cardImg} />
        <div style={{ ...styles.cardBadge, background: car.type === "noleggio" ? "#e67e22" : "#1a1a2e" }}>
          {car.type === "noleggio" ? "Noleggio" : "Vendita"}
        </div>
        {images.length > 1 && (
          <div style={styles.photoDots}>
            {images.map((_, i) => (
              <div key={i} style={{ ...styles.photoDot, background: i === imgIdx ? "#c9a84c" : "rgba(255,255,255,0.6)" }} />
            ))}
          </div>
        )}
      </div>
      <div style={styles.cardBody}>
        <div style={styles.cardTags}>{(car.tags || []).slice(0, 2).map(t => <Tag key={t} label={t} />)}</div>
        <h3 style={styles.cardTitle}>{car.brand} {car.model}</h3>
        <p style={styles.cardSub}>{car.year} · {car.fuel} · {car.km?.toLocaleString()} km</p>
        <p style={styles.cardPrice}>
          {car.type === "noleggio" ? <>€ {car.price}<span style={styles.cardPriceSub}>/giorno</span></> : `€ ${car.price?.toLocaleString()}`}
        </p>
      </div>
    </div>
  );
}

// ── Drag & Drop uploader ──
function ImageUploader({ images, setImages, uploading, setUploading }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  async function handleFiles(files) {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (!imageFiles.length) return;
    setUploading(true);
    const urls = await uploadImages(imageFiles);
    setImages(prev => [...prev, ...urls]);
    setUploading(false);
  }

  return (
    <div>
      <div
        style={{ ...styles.dropzone, ...(dragging ? styles.dropzoneActive : {}) }}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current.click()}
      >
        <input ref={inputRef} type="file" multiple accept="image/*" style={{ display: "none" }}
          onChange={e => handleFiles(e.target.files)} />
        {uploading
          ? <p style={styles.dropzoneText}>⏳ Caricamento in corso...</p>
          : <p style={styles.dropzoneText}>📷 Trascina le foto qui oppure clicca per selezionarle<br /><span style={{ fontSize: 12, color: "#aaa" }}>Puoi caricare più foto alla volta</span></p>
        }
      </div>
      {images.length > 0 && (
        <div style={styles.previewGrid}>
          {images.map((url, i) => (
            <div key={i} style={styles.previewItem}>
              <img src={url} alt="" style={styles.previewImg} />
              <button style={styles.previewRemove} onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}>✕</button>
              {i === 0 && <span style={styles.previewMain}>Copertina</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Modal galleria foto ──
function PhotoGallery({ images, onClose }) {
  const [idx, setIdx] = useState(0);
  const imgs = images?.length ? images : [PLACEHOLDER];

  return (
    <div style={styles.galleryOverlay} onClick={onClose}>
      <div style={styles.galleryBox} onClick={e => e.stopPropagation()}>
        <button style={styles.galleryClose} onClick={onClose}>✕</button>
        <img src={imgs[idx]} alt="" style={styles.galleryMain} />
        {imgs.length > 1 && (
          <>
            <button style={{ ...styles.galleryNav, left: 12 }} onClick={() => setIdx((idx - 1 + imgs.length) % imgs.length)}>‹</button>
            <button style={{ ...styles.galleryNav, right: 12 }} onClick={() => setIdx((idx + 1) % imgs.length)}>›</button>
            <div style={styles.galleryThumbs}>
              {imgs.map((url, i) => (
                <img key={i} src={url} alt="" onClick={() => setIdx(i)}
                  style={{ ...styles.galleryThumb, ...(i === idx ? styles.galleryThumbActive : {}) }} />
              ))}
            </div>
            <p style={styles.galleryCounter}>{idx + 1} / {imgs.length}</p>
          </>
        )}
      </div>
    </div>
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
  const [filterTag, setFilterTag] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formImages, setFormImages] = useState([]);
  const [form, setForm] = useState({ brand: "", model: "", year: "", price: "", km: "", fuel: "Benzina", type: "vendita", tags: [], featured: false });

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
    } catch (e) {
      setCars(FALLBACK_CARS);
      setDbConnected(false);
    }
    setLoading(false);
  }

  async function handleAdminLogin(e) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (error) setAuthError("Credenziali errate. Riprova.");
    else { setLoginEmail(""); setLoginPassword(""); }
    setAuthLoading(false);
  }

  async function handleAdminLogout() {
    await supabase.auth.signOut();
    setAdminOpen(false);
  }

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

  async function handleAddCar(e) {
    e.preventDefault();
    if (!adminUser) return;
    setSaving(true);
    const newCar = {
      brand: form.brand, model: form.model,
      year: parseInt(form.year), price: parseFloat(form.price), km: parseInt(form.km),
      fuel: form.fuel, type: form.type, tags: form.tags, featured: form.featured,
      images: formImages.length ? formImages : [PLACEHOLDER],
    };
    if (dbConnected) {
      const { data, error } = await supabase.from("cars").insert([newCar]).select().single();
      if (error) { alert("Errore: " + error.message); setSaving(false); return; }
      setCars(prev => [data, ...prev]);
    } else {
      setCars(prev => [{ ...newCar, id: Date.now() }, ...prev]);
    }
    setForm({ brand: "", model: "", year: "", price: "", km: "", fuel: "Benzina", type: "vendita", tags: [], featured: false });
    setFormImages([]);
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

  const featuredCars = cars.filter(c => c.featured).slice(0, 3);
  const saleCars = cars.filter(c => c.type === "vendita");
  const rentalCars = cars.filter(c => c.type === "noleggio");
  const filteredSale = filterTag ? saleCars.filter(c => c.tags?.includes(filterTag)) : saleCars;
  const filteredRental = filterTag ? rentalCars.filter(c => c.tags?.includes(filterTag)) : rentalCars;
  const allTags = [...new Set(cars.flatMap(c => c.tags || []))];

  const s = styles;

  return (
    <div style={s.root}>
      {!dbConnected && !loading && (
        <div style={s.banner}>⚠️ Modalità demo — Supabase non configurato</div>
      )}

      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.logo} onClick={() => { setPage("Home"); setFilterTag(null); }}>
            <span style={s.logoAccent}>2R</span><span style={s.logoText}> CAR</span>
          </div>
          <div style={s.navLinks}>
            {NAV_ITEMS.map(item => (
              <button key={item} style={{ ...s.navBtn, ...(page === item ? s.navBtnActive : {}) }} onClick={() => { setPage(item); setFilterTag(null); }}>{item}</button>
            ))}
            <button style={s.adminBtn} onClick={() => setAdminOpen(true)}>{adminUser ? "Admin ✓" : "Admin ⚙"}</button>
          </div>
        </div>
      </nav>

      {loading && <div style={s.loadingScreen}><div style={s.spinner} /><p style={{ color: "#888", marginTop: 16 }}>Caricamento...</p></div>}

      {!loading && (
        <>
          {page === "Home" && (
            <>
              <div style={s.hero}>
                <div style={s.heroOverlay} />
                <div style={s.heroContent}>
                  <p style={s.heroEyebrow}>Vendita & Noleggio Auto</p>
                  <h1 style={s.heroTitle}>La tua prossima auto<br />ti aspetta qui.</h1>
                  <div style={s.heroBtns}>
                    <button style={s.heroBtn} onClick={() => setPage("Vendita")}>Acquista</button>
                    <button style={{ ...s.heroBtn, ...s.heroBtnOutline }} onClick={() => setPage("Noleggio")}>Noleggia</button>
                  </div>
                </div>
              </div>
              <section style={s.section}>
                <div style={s.sectionHeader}>
                  <h2 style={s.sectionTitle}>In Vetrina</h2>
                  <p style={s.sectionSub}>Le auto del momento selezionate per te</p>
                </div>
                {featuredCars.length === 0
                  ? <p style={{ textAlign: "center", color: "#aaa", padding: "40px 0" }}>Nessuna auto in vetrina</p>
                  : <div style={s.grid3}>{featuredCars.map(car => <CarCard key={car.id} car={car} onClick={() => { setSelectedCar(car); setGalleryOpen(false); }} />)}</div>
                }
              </section>
              <div style={s.ctaStrip}>
                <div style={s.ctaLeft}>
                  <h3 style={s.ctaTitle}>Hai bisogno di un'auto per qualche giorno?</h3>
                  <p style={s.ctaSub}>Noleggio flessibile, disponibile subito.</p>
                </div>
                <button style={s.ctaButton} onClick={() => setPage("Noleggio")}>Vedi il noleggio →</button>
              </div>
            </>
          )}

          {page === "Vendita" && (
            <section style={s.section}>
              <div style={s.sectionHeader}>
                <h2 style={s.sectionTitle}>Auto in Vendita</h2>
                <p style={s.sectionSub}>{filteredSale.length} annunci disponibili</p>
              </div>
              <TagFilter tags={allTags} active={filterTag} onSelect={setFilterTag} />
              {filteredSale.length === 0 ? <EmptyState text="Nessuna auto in vendita al momento." /> : <div style={s.grid3}>{filteredSale.map(car => <CarCard key={car.id} car={car} onClick={() => { setSelectedCar(car); setGalleryOpen(false); }} />)}</div>}
            </section>
          )}

          {page === "Noleggio" && (
            <section style={s.section}>
              <div style={s.sectionHeader}>
                <h2 style={s.sectionTitle}>Auto a Noleggio</h2>
                <p style={s.sectionSub}>Prezzi al giorno — disponibilità immediata</p>
              </div>
              <TagFilter tags={allTags} active={filterTag} onSelect={setFilterTag} />
              {filteredRental.length === 0 ? <EmptyState text="Nessuna auto a noleggio al momento." /> : <div style={s.grid3}>{filteredRental.map(car => <CarCard key={car.id} car={car} onClick={() => { setSelectedCar(car); setGalleryOpen(false); }} />)}</div>}
            </section>
          )}

          {page === "Contatti" && (
            <section style={s.section}>
              <div style={s.sectionHeader}>
                <h2 style={s.sectionTitle}>Contattaci</h2>
                <p style={s.sectionSub}>Siamo a tua disposizione</p>
              </div>
              <div style={s.contactCard}>
                {[["📍", "Via Collatina 381, Roma (RM)"], ["📞", "393 000 8654 — 06 88922000"], ["✉️", "2erreprofessionalcar@libero.it"], ["🕐", "Lun–Sab: 9:00–19:00"]].map(([icon, text]) => (
                  <div key={text} style={s.contactItem}><span style={s.contactIcon}>{icon}</span><span>{text}</span></div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <footer style={s.footer}>
        <p style={s.footerLogo}><span style={s.logoAccent}>2R</span> CAR</p>
        <p style={s.footerSub}>Via Collatina, 381 — Roma</p>
        {dbConnected && <p style={{ ...s.footerSub, color: "#2ecc71", marginTop: 4 }}>● Database connesso</p>}
      </footer>

      {/* MODAL DETTAGLIO AUTO */}
      {selectedCar && (
        <Modal onClose={() => setSelectedCar(null)}>
          <div style={s.modalImg} onClick={() => setGalleryOpen(true)}>
            <img src={selectedCar.images?.[0] || PLACEHOLDER} alt={selectedCar.model} style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "zoom-in" }} />
            {selectedCar.images?.length > 1 && (
              <div style={s.modalPhotoCount}>📷 {selectedCar.images.length} foto — clicca per vedere tutte</div>
            )}
          </div>
          <div style={s.modalBody}>
            <div style={s.modalTags}>
              {(selectedCar.tags || []).map(t => <Tag key={t} label={t} />)}
              <span style={{ ...s.tag, background: selectedCar.type === "noleggio" ? "#e67e22" : "#27ae60", color: "#fff" }}>
                {selectedCar.type === "noleggio" ? "Noleggio" : "Vendita"}
              </span>
            </div>
            <h2 style={s.modalTitle}>{selectedCar.brand} {selectedCar.model}</h2>
            <p style={s.modalYear}>{selectedCar.year} · {selectedCar.fuel} · {selectedCar.km?.toLocaleString()} km</p>
            <p style={s.modalPrice}>{selectedCar.type === "noleggio" ? `€ ${selectedCar.price}/giorno` : `€ ${selectedCar.price?.toLocaleString()}`}</p>
            <a href="tel:+393000008654" style={s.contactCallBtn}>📞 Chiama per info</a>
          </div>
        </Modal>
      )}

      {/* GALLERIA FOTO */}
      {selectedCar && galleryOpen && (
        <PhotoGallery images={selectedCar.images} onClose={() => setGalleryOpen(false)} />
      )}

      {/* ADMIN MODAL */}
      {adminOpen && (
        <Modal onClose={() => setAdminOpen(false)}>
          {!adminUser ? (
            <div style={s.adminLogin}>
              <div style={s.loginIcon}>🔐</div>
              <h2 style={s.adminTitle}>Accesso Admin</h2>
              <p style={s.loginSub}>Accesso protetto</p>
              <form onSubmit={handleAdminLogin} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
                <input type="email" placeholder="Email admin" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} style={s.input} autoComplete="username" />
                <input type="password" placeholder="Password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} style={s.input} autoComplete="current-password" />
                {authError && <p style={s.authError}>{authError}</p>}
                <button type="submit" style={{ ...s.submitBtn, opacity: authLoading ? 0.6 : 1 }} disabled={authLoading}>
                  {authLoading ? "Accesso in corso..." : "Entra"}
                </button>
              </form>
            </div>
          ) : (
            <div style={s.adminPanel}>
              <div style={s.adminHeader}>
                <div>
                  <h2 style={{ ...s.adminTitle, margin: 0 }}>Pannello Admin</h2>
                  <p style={s.adminUserBadge}>✓ {adminUser.email}</p>
                </div>
                <button style={s.logoutBtn} onClick={handleAdminLogout}>Esci</button>
              </div>

              <h3 style={s.adminSectionTitle}>➕ Nuovo Annuncio</h3>
              <form onSubmit={handleAddCar} style={s.adminForm}>
                <div style={s.formRow}>
                  <input required placeholder="Marca" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} style={s.input} />
                  <input required placeholder="Modello" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} style={s.input} />
                </div>
                <div style={s.formRow}>
                  <input required type="number" placeholder="Anno" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} style={s.input} />
                  <input required type="number" placeholder={form.type === "noleggio" ? "€/giorno" : "Prezzo €"} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} style={s.input} />
                </div>
                <div style={s.formRow}>
                  <input required type="number" placeholder="Km" value={form.km} onChange={e => setForm({ ...form, km: e.target.value })} style={s.input} />
                  <select value={form.fuel} onChange={e => setForm({ ...form, fuel: e.target.value })} style={s.select}>
                    {["Benzina", "Diesel", "Ibrida", "Elettrica", "GPL"].map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={s.select}>
                  <option value="vendita">Vendita</option>
                  <option value="noleggio">Noleggio</option>
                </select>

                <div style={s.tagPicker}>
                  <p style={s.tagPickerLabel}>Tag:</p>
                  <div style={s.tagPickerGrid}>
                    {TAGS_AVAILABLE.map(t => (
                      <button type="button" key={t} onClick={() => toggleFormTag(t)}
                        style={{ ...s.tagPickerBtn, ...(form.tags.includes(t) ? s.tagPickerBtnActive : {}) }}>{t}</button>
                    ))}
                  </div>
                </div>

                <p style={s.tagPickerLabel}>Foto:</p>
                <ImageUploader images={formImages} setImages={setFormImages} uploading={uploading} setUploading={setUploading} />

                <label style={s.checkLabel}>
                  <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} />
                  &nbsp; Metti in vetrina
                </label>
                <button type="submit" style={{ ...s.submitBtn, opacity: (saving || uploading) ? 0.6 : 1 }} disabled={saving || uploading}>
                  {saving ? "Salvataggio..." : uploading ? "Attendi upload foto..." : "Aggiungi Annuncio"}
                </button>
              </form>

              <h3 style={{ ...s.adminSectionTitle, marginTop: 32 }}>📋 Gestisci Annunci ({cars.length})</h3>
              <div style={s.adminList}>
                {cars.map(car => (
                  <div key={car.id} style={s.adminListItem}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <img src={car.images?.[0] || PLACEHOLDER} alt="" style={{ width: 48, height: 36, objectFit: "cover", borderRadius: 4 }} />
                      <div style={s.adminListInfo}>
                        <strong>{car.brand} {car.model}</strong>
                        <span style={s.adminListSub}>{car.year} · {car.type === "noleggio" ? `€${car.price}/g` : `€${car.price?.toLocaleString()}`} · {car.images?.length || 1} foto</span>
                      </div>
                    </div>
                    <div style={s.adminListActions}>
                      <button style={{ ...s.adminActionBtn, background: car.featured ? "#f39c12" : "#ecf0f1", color: car.featured ? "#fff" : "#333" }}
                        onClick={() => toggleFeatured(car.id)} title="Vetrina">⭐</button>
                      <button style={{ ...s.adminActionBtn, background: "#e74c3c", color: "#fff" }} onClick={() => deleteCar(car.id)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

function Tag({ label }) { return <span style={styles.tag}>{label}</span>; }
function EmptyState({ text }) { return <p style={{ textAlign: "center", color: "#aaa", padding: "60px 0", fontSize: 16 }}>{text}</p>; }
function TagFilter({ tags, active, onSelect }) {
  return (
    <div style={styles.tagFilter}>
      <button style={{ ...styles.tagFilterBtn, ...(active === null ? styles.tagFilterBtnActive : {}) }} onClick={() => onSelect(null)}>Tutti</button>
      {tags.map(t => <button key={t} style={{ ...styles.tagFilterBtn, ...(active === t ? styles.tagFilterBtnActive : {}) }} onClick={() => onSelect(t)}>{t}</button>)}
    </div>
  );
}
function Modal({ children, onClose }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <button style={styles.modalClose} onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  );
}

const styles = {
  root: { fontFamily: "'Georgia', serif", background: "#f5f4f0", minHeight: "100vh", color: "#1a1a1a" },
  banner: { background: "#e67e22", color: "#fff", textAlign: "center", padding: "10px 16px", fontSize: 14 },
  nav: { background: "#1a1a2e", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 20px rgba(0,0,0,0.3)" },
  navInner: { maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 },
  logo: { cursor: "pointer", letterSpacing: 2, fontSize: 22 },
  logoAccent: { color: "#c9a84c", fontWeight: 900 },
  logoText: { color: "#fff", fontWeight: 300 },
  navLinks: { display: "flex", gap: 8, alignItems: "center" },
  navBtn: { background: "none", border: "none", color: "#ccc", cursor: "pointer", fontSize: 14, padding: "8px 14px", borderRadius: 6, letterSpacing: 0.5 },
  navBtnActive: { color: "#c9a84c", background: "rgba(201,168,76,0.1)" },
  adminBtn: { background: "rgba(201,168,76,0.2)", border: "1px solid #c9a84c", color: "#c9a84c", cursor: "pointer", fontSize: 13, padding: "6px 14px", borderRadius: 6 },
  loadingScreen: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300 },
  spinner: { width: 40, height: 40, border: "3px solid #eee", borderTop: "3px solid #c9a84c", borderRadius: "50%" },
  hero: { position: "relative", height: 500, background: "url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1400&q=80) center/cover", display: "flex", alignItems: "center" },
  heroOverlay: { position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(26,26,46,0.85) 0%, rgba(26,26,46,0.4) 100%)" },
  heroContent: { position: "relative", maxWidth: 1100, margin: "0 auto", padding: "0 24px", width: "100%" },
  heroEyebrow: { color: "#c9a84c", letterSpacing: 4, fontSize: 13, textTransform: "uppercase", marginBottom: 12 },
  heroTitle: { color: "#fff", fontSize: 48, fontWeight: 700, lineHeight: 1.2, margin: "0 0 32px", textShadow: "0 2px 20px rgba(0,0,0,0.5)" },
  heroBtns: { display: "flex", gap: 16 },
  heroBtn: { background: "#c9a84c", border: "none", color: "#1a1a2e", padding: "14px 32px", fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer", borderRadius: 4, letterSpacing: 1 },
  heroBtnOutline: { background: "transparent", border: "2px solid #fff", color: "#fff" },
  section: { maxWidth: 1100, margin: "0 auto", padding: "60px 24px" },
  sectionHeader: { textAlign: "center", marginBottom: 40 },
  sectionTitle: { fontSize: 32, fontWeight: 700, margin: "0 0 8px", color: "#1a1a2e" },
  sectionSub: { color: "#888", fontSize: 16, margin: 0 },
  grid3: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 },
  card: { background: "#fff", borderRadius: 12, overflow: "hidden", cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", transition: "transform .2s, box-shadow .2s" },
  cardImgWrap: { position: "relative", height: 200, overflow: "hidden" },
  cardImg: { width: "100%", height: "100%", objectFit: "cover", transition: "opacity .15s" },
  cardBadge: { position: "absolute", top: 12, right: 12, color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, letterSpacing: 0.5, textTransform: "uppercase" },
  photoDots: { position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 4 },
  photoDot: { width: 6, height: 6, borderRadius: "50%", transition: "background .2s" },
  cardBody: { padding: 20 },
  cardTags: { display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" },
  cardTitle: { fontSize: 18, fontWeight: 700, margin: "0 0 6px", color: "#1a1a2e" },
  cardSub: { color: "#888", fontSize: 13, margin: "0 0 12px" },
  cardPrice: { fontSize: 22, fontWeight: 700, color: "#c9a84c", margin: 0 },
  cardPriceSub: { fontSize: 13, color: "#888", fontWeight: 400 },
  tag: { background: "#f0ede6", color: "#555", fontSize: 11, padding: "3px 9px", borderRadius: 20, fontFamily: "sans-serif" },
  tagFilter: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 },
  tagFilterBtn: { background: "#fff", border: "1px solid #ddd", color: "#555", padding: "6px 16px", borderRadius: 20, cursor: "pointer", fontSize: 13, fontFamily: "inherit" },
  tagFilterBtnActive: { background: "#1a1a2e", border: "1px solid #1a1a2e", color: "#c9a84c" },
  ctaStrip: { background: "#1a1a2e", padding: "48px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" },
  ctaLeft: { maxWidth: 600, paddingLeft: "calc(max(24px, (100% - 1100px)/2))" },
  ctaTitle: { color: "#fff", fontSize: 22, fontWeight: 700, margin: "0 0 8px" },
  ctaSub: { color: "#aaa", margin: 0 },
  ctaButton: { background: "#c9a84c", border: "none", color: "#1a1a2e", padding: "14px 32px", fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer", borderRadius: 4, marginRight: "calc(max(24px, (100% - 1100px)/2))", whiteSpace: "nowrap" },
  contactCard: { background: "#fff", borderRadius: 12, padding: 40, maxWidth: 500, margin: "0 auto", boxShadow: "0 2px 20px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: 20 },
  contactItem: { display: "flex", alignItems: "center", gap: 16, fontSize: 17 },
  contactIcon: { fontSize: 24, width: 32 },
  footer: { background: "#111", color: "#666", textAlign: "center", padding: "32px 24px" },
  footerLogo: { fontSize: 20, letterSpacing: 2, marginBottom: 8 },
  footerSub: { fontSize: 12, margin: 0 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  modal: { background: "#fff", borderRadius: 16, width: "100%", maxWidth: 580, maxHeight: "90vh", overflowY: "auto", position: "relative" },
  modalClose: { position: "absolute", top: 16, right: 16, background: "rgba(0,0,0,0.1)", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", zIndex: 10, fontSize: 14 },
  modalImg: { height: 240, overflow: "hidden", borderRadius: "16px 16px 0 0", position: "relative" },
  modalPhotoCount: { position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 12, padding: "4px 12px", borderRadius: 20 },
  modalBody: { padding: 28 },
  modalTags: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 },
  modalTitle: { fontSize: 26, fontWeight: 700, margin: "0 0 6px", color: "#1a1a2e" },
  modalYear: { color: "#888", fontSize: 14, margin: "0 0 16px" },
  modalPrice: { fontSize: 30, fontWeight: 700, color: "#c9a84c", margin: "0 0 24px" },
  contactCallBtn: { display: "block", background: "#1a1a2e", color: "#c9a84c", textAlign: "center", padding: "14px", borderRadius: 8, fontWeight: 700, textDecoration: "none", fontSize: 16, letterSpacing: 0.5 },
  // Gallery
  galleryOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center" },
  galleryBox: { position: "relative", maxWidth: 900, width: "100%", padding: 20 },
  galleryClose: { position: "absolute", top: -10, right: 10, background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", fontSize: 18, zIndex: 10 },
  galleryMain: { width: "100%", maxHeight: "65vh", objectFit: "contain", borderRadius: 8 },
  galleryNav: { position: "absolute", top: "40%", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: "50%", width: 44, height: 44, fontSize: 24, cursor: "pointer" },
  galleryThumbs: { display: "flex", gap: 8, justifyContent: "center", marginTop: 12, flexWrap: "wrap" },
  galleryThumb: { width: 64, height: 48, objectFit: "cover", borderRadius: 4, cursor: "pointer", opacity: 0.5 },
  galleryThumbActive: { opacity: 1, outline: "2px solid #c9a84c" },
  galleryCounter: { textAlign: "center", color: "#888", fontSize: 13, marginTop: 8 },
  // Admin
  adminLogin: { padding: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 },
  loginIcon: { fontSize: 40 },
  loginSub: { color: "#888", fontSize: 13, margin: 0, textAlign: "center" },
  authError: { background: "#fdecea", color: "#e74c3c", borderRadius: 6, padding: "8px 12px", fontSize: 13, margin: 0, textAlign: "center" },
  adminHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 },
  adminUserBadge: { color: "#27ae60", fontSize: 12, margin: "4px 0 0", fontFamily: "monospace" },
  logoutBtn: { background: "#f8f8f8", border: "1px solid #ddd", color: "#666", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontFamily: "inherit" },
  adminPanel: { padding: 28 },
  adminTitle: { fontSize: 22, fontWeight: 700, margin: "0 0 4px", color: "#1a1a2e" },
  adminSectionTitle: { fontSize: 13, fontWeight: 700, color: "#888", margin: "0 0 16px", textTransform: "uppercase", letterSpacing: 1 },
  adminForm: { display: "flex", flexDirection: "column", gap: 12 },
  formRow: { display: "flex", gap: 12 },
  input: { flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", fontFamily: "inherit", fontSize: 14, outline: "none" },
  select: { flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid #ddd", fontFamily: "inherit", fontSize: 14, background: "#fff" },
  tagPicker: { background: "#f8f8f8", borderRadius: 8, padding: 14 },
  tagPickerLabel: { fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 10px" },
  tagPickerGrid: { display: "flex", gap: 8, flexWrap: "wrap" },
  tagPickerBtn: { background: "#fff", border: "1px solid #ddd", padding: "5px 12px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontFamily: "inherit" },
  tagPickerBtnActive: { background: "#1a1a2e", border: "1px solid #1a1a2e", color: "#c9a84c" },
  dropzone: { border: "2px dashed #ddd", borderRadius: 10, padding: "28px 16px", textAlign: "center", cursor: "pointer", background: "#fafafa", transition: "all .2s" },
  dropzoneActive: { border: "2px dashed #c9a84c", background: "#fffbf0" },
  dropzoneText: { color: "#888", fontSize: 14, margin: 0, lineHeight: 1.8 },
  previewGrid: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 },
  previewItem: { position: "relative", width: 80, height: 60 },
  previewImg: { width: "100%", height: "100%", objectFit: "cover", borderRadius: 6 },
  previewRemove: { position: "absolute", top: -6, right: -6, background: "#e74c3c", border: "none", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  previewMain: { position: "absolute", bottom: 2, left: 2, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 9, padding: "1px 4px", borderRadius: 3 },
  checkLabel: { fontSize: 14, display: "flex", alignItems: "center", cursor: "pointer" },
  submitBtn: { background: "#1a1a2e", color: "#c9a84c", border: "none", padding: "12px", borderRadius: 8, fontFamily: "inherit", fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5 },
  adminList: { display: "flex", flexDirection: "column", gap: 10, maxHeight: 280, overflowY: "auto" },
  adminListItem: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#f8f8f8", borderRadius: 8 },
  adminListInfo: { display: "flex", flexDirection: "column", gap: 2 },
  adminListSub: { fontSize: 12, color: "#888" },
  adminListActions: { display: "flex", gap: 8 },
  adminActionBtn: { border: "none", borderRadius: 6, width: 32, height: 32, cursor: "pointer", fontSize: 14 },
};
