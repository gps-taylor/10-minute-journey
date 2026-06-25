/* =========================================================================
   The 10 Minute Journey to You — shared site script
   =========================================================================
   BACKEND WIRE-UP (do this later):
   Everything funnels through submitEmail() below. Replace the body of that
   one function with your form service call (Formspree, Mailchimp, etc.) and
   every form + the popup will work. Nothing else needs to change.
   ========================================================================= */

/* ---- CONFIG: edit these two values ---- */
const WORKBOOK_PDF_URL = "workbook.pdf";   // drop your PDF in the site root with this name
const POPUP_DELAY_MS    = 8000;            // popup appears after 8 seconds
const POPUP_COOLDOWN_DAYS = 7;             // don't re-show for this many days after close/submit

/* ---- The single integration point ----
   Wire this to your email service later. It must return a Promise.
   Resolve on success, reject on failure. Right now it just simulates a
   network call so the UI is fully functional for testing. */
async function submitEmail({ first, last, email, source }) {
  // ---------------------------------------------------------------------
  // EXAMPLE — Formspree (uncomment and set your endpoint):
  //
  // const res = await fetch("https://formspree.io/f/YOUR_ID", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json", "Accept": "application/json" },
  //   body: JSON.stringify({ first, last, email, source })
  // });
  // if (!res.ok) throw new Error("Submission failed");
  // return true;
  // ---------------------------------------------------------------------

  // Placeholder so the UI works before wiring a backend:
  console.log("[submitEmail] captured:", { first, last, email, source });
  await new Promise(r => setTimeout(r, 800));
  return true;
}

/* ---------- nav: scroll state + mobile menu ---------- */
(function () {
  const nav = document.getElementById("nav");
  if (nav && !nav.classList.contains("solid")) {
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
    addEventListener("scroll", onScroll); onScroll();
  }
  const burger = document.getElementById("burger");
  const links = document.getElementById("navlinks");
  if (burger && links) {
    // scrim behind the panel
    let scrim = document.querySelector(".nav-scrim");
    if (!scrim) {
      scrim = document.createElement("div");
      scrim.className = "nav-scrim";
      document.body.appendChild(scrim);
    }
    const setMenu = (open) => {
      links.classList.toggle("open", open);
      burger.classList.toggle("open", open);
      scrim.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    };
    burger.setAttribute("aria-label", "Menu");
    burger.setAttribute("aria-expanded", "false");
    burger.addEventListener("click", () => setMenu(!links.classList.contains("open")));
    scrim.addEventListener("click", () => setMenu(false));
    links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));
    addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
    // close menu if resized up to desktop
    addEventListener("resize", () => { if (window.innerWidth > 860) setMenu(false); });
  }
})();

/* ---------- scroll reveal ---------- */
(function () {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.16 });
  els.forEach(el => io.observe(el));
})();

/* ---------- email forms (page forms + popup share this) ---------- */
function wireForm(form) {
  if (!form || form.dataset.wired) return;
  form.dataset.wired = "1";
  const success = form.parentElement.querySelector(".form-success");
  const dlLink  = success ? success.querySelector(".dl-link") : null;
  if (dlLink) dlLink.setAttribute("href", WORKBOOK_PDF_URL);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const emailEl = form.querySelector('input[type="email"]');
    const firstEl = form.querySelector('input[name="first"]');
    const lastEl  = form.querySelector('input[name="last"]');
    const btn     = form.querySelector("button[type=submit], .btn");

    // light validation
    let ok = true;
    [emailEl, firstEl].forEach(el => { if (el) el.classList.remove("field-error"); });
    if (firstEl && !firstEl.value.trim()) { firstEl.classList.add("field-error"); ok = false; }
    const emailVal = emailEl ? emailEl.value.trim() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) { emailEl.classList.add("field-error"); ok = false; }
    if (!ok) return;

    const original = btn.textContent;
    btn.textContent = "Sending…"; btn.style.opacity = ".7"; btn.disabled = true;

    try {
      await submitEmail({
        first: firstEl ? firstEl.value.trim() : "",
        last:  lastEl ? lastEl.value.trim() : "",
        email: emailVal,
        source: form.dataset.source || "site"
      });
      if (success) { form.style.display = "none"; success.classList.add("show"); }
      else { btn.textContent = "Welcome ✓"; }
      setPopupCooldown(); // any successful capture suppresses the popup
    } catch (err) {
      btn.textContent = "Try again";
      setTimeout(() => { btn.textContent = original; btn.style.opacity = "1"; btn.disabled = false; }, 1800);
    }
  });
}
document.querySelectorAll("form.eform").forEach(wireForm);

/* ---------- timed workbook popup ---------- */
(function () {
  const overlay = document.getElementById("workbookModal");
  if (!overlay) return;

  const COOLDOWN_KEY = "tmj_popup_seen";
  function suppressed() {
    try {
      const t = localStorage.getItem(COOLDOWN_KEY);
      if (!t) return false;
      return (Date.now() - parseInt(t, 10)) < POPUP_COOLDOWN_DAYS * 864e5;
    } catch { return false; }
  }
  window.setPopupCooldown = function () {
    try { localStorage.setItem(COOLDOWN_KEY, String(Date.now())); } catch {}
  };

  let opened = false;
  function open() {
    if (opened || suppressed()) return;
    opened = true;
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    const f = overlay.querySelector("input"); if (f) setTimeout(() => f.focus(), 600);
  }
  function close() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
    setPopupCooldown();
  }

  if (!suppressed()) setTimeout(open, POPUP_DELAY_MS);

  overlay.querySelector(".modal-close").addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && overlay.classList.contains("open")) close(); });

  // expose a manual trigger for "get the workbook" buttons
  window.openWorkbookPopup = function () { opened = false; open(); };
})();
