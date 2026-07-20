/* ==========================================================================
   WebP Converter — client-side conversion engine
   100% in-browser. No upload, no server, no tracking of file contents.
   ========================================================================== */
(function () {
  "use strict";

  // ---- Config -------------------------------------------------------------
  var MAX_FILES = 100;
  var MAX_SIZE = 50 * 1024 * 1024; // 50 MB per file
  // Output format is configurable via data-output on #converter (default WebP).
  var converterEl = document.getElementById("converter");
  var OUT_MIME = (converterEl && converterEl.getAttribute("data-output")) || "image/webp";
  var OUT_EXT = { "image/webp": "webp", "image/png": "png", "image/jpeg": "jpg" }[OUT_MIME] || "webp";
  // Formats the browser can decode natively via <img>:
  var NATIVE = ["image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp", "image/svg+xml", "image/avif"];
  // Formats we decode via lazy-loaded libraries:
  var HEIC = ["image/heic", "image/heif"];
  var TIFF = ["image/tiff"];

  // ---- DOM ----------------------------------------------------------------
  var $ = function (id) { return document.getElementById(id); };
  var dropZone = $("dropZone"), fileInput = $("fileInput"), grid = $("grid"),
      imageSection = $("imageSection"), countBadge = $("countBadge"),
      convertAllBtn = $("convertAllBtn"), downloadAllBtn = $("downloadAllBtn"),
      clearBtn = $("clearBtn"), qualitySlider = $("quality"), qualityVal = $("qualityVal"),
      canvas = $("canvas"), ctx = canvas.getContext("2d"),
      globalProgress = $("globalProgress"), globalProgressFill = $("globalProgressFill"),
      progressInfo = $("progressInfo"), liveRegion = $("liveRegion"), savings = $("savings");

  // ---- State --------------------------------------------------------------
  var items = [], nextId = 0;

  // ---- Lightweight analytics hook (no PII; only counts) -------------------
  function track(name, params) {
    try { if (typeof window.gtag === "function") window.gtag("event", name, params || {}); } catch (e) {}
    try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: name }, params)); } catch (e) {}
  }
  function announce(msg) { if (liveRegion) liveRegion.textContent = msg; }

  // ---- Quality slider -----------------------------------------------------
  qualitySlider.addEventListener("input", function () {
    qualityVal.textContent = qualitySlider.value;
    qualitySlider.setAttribute("aria-valuenow", qualitySlider.value);
  });

  // ---- Drag & drop + keyboard --------------------------------------------
  ["dragenter", "dragover"].forEach(function (ev) {
    dropZone.addEventListener(ev, function (e) { e.preventDefault(); dropZone.classList.add("drag-over"); });
  });
  ["dragleave", "drop"].forEach(function (ev) {
    dropZone.addEventListener(ev, function (e) { e.preventDefault(); dropZone.classList.remove("drag-over"); });
  });
  dropZone.addEventListener("drop", function (e) {
    addFiles(toArray(e.dataTransfer.files));
  });
  fileInput.addEventListener("change", function () {
    addFiles(toArray(fileInput.files));
    fileInput.value = "";
  });
  // Keyboard: Enter/Space on the labelled drop zone opens the picker
  dropZone.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); }
  });

  function toArray(list) { return Array.prototype.slice.call(list); }

  // ---- Input validation ---------------------------------------------------
  function isSupported(file) {
    var t = (file.type || "").toLowerCase();
    var name = file.name.toLowerCase();
    if (NATIVE.indexOf(t) > -1 || HEIC.indexOf(t) > -1 || TIFF.indexOf(t) > -1) return true;
    // Some browsers report empty type for HEIC/TIFF — fall back to extension.
    return /\.(jpe?g|png|gif|bmp|webp|svg|avif|heic|heif|tiff?)$/i.test(name);
  }

  function addFiles(files) {
    var added = 0, rejected = 0;
    files.forEach(function (file) {
      if (items.length >= MAX_FILES) { rejected++; return; }
      if (!file.type.startsWith("image/") && !isSupported(file)) { rejected++; return; }
      if (file.size > MAX_SIZE) { rejected++; return; }
      var item = { id: nextId++, file: file, name: file.name, originalSize: file.size, webpBlob: null, status: "pending" };
      items.push(item);
      renderCard(item);
      added++;
    });
    if (added) { track("upload", { count: added }); announce(added + " image" + (added !== 1 ? "s" : "") + " added"); }
    if (rejected) announce(rejected + " file" + (rejected !== 1 ? "s" : "") + " skipped (unsupported or over " + (MAX_SIZE / 1048576) + "MB)");
    updateUI();
  }

  // ---- Card rendering -----------------------------------------------------
  function renderCard(item) {
    var card = document.createElement("div");
    card.className = "card";
    card.id = "card-" + item.id;
    var ext = (item.name.split(".").pop() || "").toUpperCase();
    var shortName = item.name.length > 24 ? item.name.slice(0, 21) + "…" : item.name;

    card.innerHTML =
      '<div class="card-thumb-ph skeleton" aria-hidden="true"></div>' +
      '<div class="card-body">' +
        '<div class="card-name" title="' + escapeHtml(item.name) + '">' + escapeHtml(shortName) + "</div>" +
        '<div class="card-meta"><span>' + escapeHtml(ext) + "</span><span>" + formatBytes(item.originalSize) + "</span>" +
          '<span class="after" id="after-' + item.id + '" hidden></span></div>' +
        '<span class="badge badge-pending" id="badge-' + item.id + '">Pending</span>' +
        '<div class="card-actions">' +
          '<button class="btn btn-ghost btn-sm" id="cv-' + item.id + '" data-act="convert" data-id="' + item.id + '">Convert</button>' +
          '<button class="btn btn-primary btn-sm" id="dl-' + item.id + '" data-act="download" data-id="' + item.id + '" disabled>Download</button>' +
          '<button class="btn btn-danger btn-sm" data-act="remove" data-id="' + item.id + '" aria-label="Remove ' + escapeHtml(item.name) + '">✕</button>' +
        "</div></div>";
    grid.appendChild(card);

    // Async thumbnail (skip giant SVGs gracefully)
    var url = URL.createObjectURL(item.file);
    var img = new Image();
    img.onload = function () {
      var ph = card.querySelector(".card-thumb-ph");
      if (ph) {
        var el = document.createElement("img");
        el.className = "card-thumb"; el.src = url; el.alt = ""; el.loading = "lazy";
        ph.replaceWith(el);
      }
    };
    img.onerror = function () { URL.revokeObjectURL(url); };
    img.src = url;
  }

  // Event delegation for card buttons
  grid.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-act]");
    if (!btn) return;
    var id = parseInt(btn.getAttribute("data-id"), 10);
    var act = btn.getAttribute("data-act");
    if (act === "convert") convertOne(id);
    else if (act === "download") downloadOne(id);
    else if (act === "remove") removeItem(id);
  });

  function updateUI() {
    var count = items.length;
    imageSection.hidden = count === 0;
    countBadge.textContent = count + " file" + (count !== 1 ? "s" : "");
    convertAllBtn.disabled = count === 0;
    var done = items.filter(function (i) { return i.status === "done"; });
    downloadAllBtn.disabled = done.length === 0;
    // Cumulative savings
    if (done.length) {
      var before = 0, after = 0;
      done.forEach(function (i) { before += i.originalSize; after += i.webpBlob.size; });
      var pct = before ? Math.round((1 - after / before) * 100) : 0;
      savings.hidden = false;
      savings.textContent = "Saved " + formatBytes(before - after) + " (" + pct + "% smaller) across " + done.length + " image" + (done.length !== 1 ? "s" : "");
    } else {
      savings.hidden = true;
    }
  }

  // ---- Conversion ---------------------------------------------------------
  function convertOne(id) {
    var item = find(id);
    if (!item || item.status === "converting") return Promise.resolve();
    setBadge(id, "converting", "Converting…");
    setDisabled("cv-" + id, true);

    return fileToWebP(item.file, qualitySlider.value / 100)
      .then(function (blob) {
        item.webpBlob = blob; item.status = "done";
        setBadge(id, "done", "Ready ✓");
        setDisabled("dl-" + id, false);
        var cv = $("cv-" + id); if (cv) { cv.textContent = "Re-convert"; cv.disabled = false; }
        var after = $("after-" + id);
        if (after) {
          var save = item.originalSize ? Math.round((1 - blob.size / item.originalSize) * 100) : 0;
          after.hidden = false;
          after.textContent = "→ " + formatBytes(blob.size) + (save > 0 ? " (-" + save + "%)" : "");
        }
        track("convert", { quality: Number(qualitySlider.value) });
        updateUI();
      })
      .catch(function (err) {
        item.status = "error";
        setBadge(id, "error", "Failed");
        setDisabled("cv-" + id, false);
        announce("Could not convert " + item.name);
        if (window.console) console.error(err);
        updateUI();
      });
  }

  convertAllBtn.addEventListener("click", function () {
    var pending = items.filter(function (i) { return i.status !== "done" && i.status !== "converting"; });
    if (!pending.length) return;
    globalProgress.hidden = false;
    var done = 0;
    (function next() {
      if (!pending.length) {
        announce("All images converted");
        setTimeout(function () { globalProgress.hidden = true; }, 800);
        return;
      }
      var item = pending.shift();
      convertOne(item.id).then(function () {
        done++;
        var total = done + pending.length;
        globalProgressFill.style.width = Math.round((done / total) * 100) + "%";
        progressInfo.textContent = done + " / " + total + " converted";
        next();
      });
    })();
  });

  // ---- Download -----------------------------------------------------------
  function downloadOne(id) {
    var item = find(id);
    if (!item || !item.webpBlob) return;
    saveBlob(item.webpBlob, item.name.replace(/\.[^.]+$/, "") + "." + OUT_EXT);
    track("download", { type: "single" });
  }

  downloadAllBtn.addEventListener("click", function () {
    var done = items.filter(function (i) { return i.status === "done" && i.webpBlob; });
    if (!done.length) return;
    if (done.length === 1) { downloadOne(done[0].id); return; }
    track("download", { type: "zip", count: done.length });
    loadScript("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js")
      .then(function () {
        var zip = new JSZip();
        done.forEach(function (i) { zip.file(i.name.replace(/\.[^.]+$/, "") + "." + OUT_EXT, i.webpBlob); });
        return zip.generateAsync({ type: "blob" });
      })
      .then(function (blob) { saveBlob(blob, "converted-" + OUT_EXT + ".zip"); })
      .catch(function () { done.forEach(function (i, idx) { setTimeout(function () { downloadOne(i.id); }, idx * 300); }); });
  });

  function saveBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  // ---- Remove / clear -----------------------------------------------------
  function removeItem(id) {
    items = items.filter(function (i) { return i.id !== id; });
    var el = $("card-" + id); if (el) el.remove();
    updateUI();
  }
  clearBtn.addEventListener("click", function () {
    items = []; grid.innerHTML = ""; progressInfo.textContent = ""; globalProgress.hidden = true;
    updateUI(); announce("Cleared all images");
  });

  // ---- Core: file -> WebP blob -------------------------------------------
  function fileToWebP(file, quality) {
    var type = (file.type || "").toLowerCase();
    var name = file.name.toLowerCase();
    if (HEIC.indexOf(type) > -1 || /\.(heic|heif)$/.test(name)) return heicToWebP(file, quality);
    if (TIFF.indexOf(type) > -1 || /\.tiff?$/.test(name)) return tiffToWebP(file, quality);
    return drawToWebP(URL.createObjectURL(file), quality, true);
  }

  function encodeCanvas(quality) {
    return new Promise(function (resolve, reject) {
      // JPEG has no alpha: flatten onto white first.
      if (OUT_MIME === "image/jpeg") {
        var tmp = ctx.getImageData(0, 0, canvas.width, canvas.height);
        ctx.save(); ctx.globalCompositeOperation = "destination-over";
        ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.restore();
        void tmp;
      }
      canvas.toBlob(function (b) { b ? resolve(b) : reject(new Error("encode failed")); }, OUT_MIME, quality);
    });
  }

  function drawToWebP(src, quality, revoke) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        canvas.width = img.naturalWidth || 1;
        canvas.height = img.naturalHeight || 1;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        if (revoke) URL.revokeObjectURL(src);
        encodeCanvas(quality).then(resolve, reject);
      };
      img.onerror = function () { if (revoke) URL.revokeObjectURL(src); reject(new Error("decode failed")); };
      img.src = src;
    });
  }

  // HEIC/HEIF via heic2any (lazy-loaded only when needed)
  function heicToWebP(file, quality) {
    return loadScript("https://cdnjs.cloudflare.com/ajax/libs/heic2any/0.0.4/heic2any.min.js")
      .then(function () { return window.heic2any({ blob: file, toType: "image/png" }); })
      .then(function (png) { return drawToWebP(URL.createObjectURL(png), quality, true); });
  }

  // TIFF via UTIF (lazy-loaded)
  function tiffToWebP(file, quality) {
    return loadScript("https://cdnjs.cloudflare.com/ajax/libs/UTIF/3.1.0/UTIF.min.js")
      .then(function () { return file.arrayBuffer(); })
      .then(function (buf) {
        var ifds = UTIF.decode(buf); UTIF.decodeImage(buf, ifds[0]);
        var rgba = UTIF.toRGBA8(ifds[0]);
        canvas.width = ifds[0].width; canvas.height = ifds[0].height;
        var imageData = ctx.createImageData(canvas.width, canvas.height);
        imageData.data.set(rgba); ctx.putImageData(imageData, 0, 0);
        return encodeCanvas(quality);
      });
  }

  // ---- Utilities ----------------------------------------------------------
  var scriptCache = {};
  function loadScript(src) {
    if (scriptCache[src]) return scriptCache[src];
    scriptCache[src] = new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src; s.async = true; s.crossOrigin = "anonymous";
      s.onload = resolve; s.onerror = function () { reject(new Error("Failed to load " + src)); };
      document.head.appendChild(s);
    });
    return scriptCache[src];
  }
  function find(id) { return items.filter(function (i) { return i.id === id; })[0]; }
  function setBadge(id, type, text) { var el = $("badge-" + id); if (el) { el.className = "badge badge-" + type; el.textContent = text; } }
  function setDisabled(id, v) { var el = $(id); if (el) el.disabled = v; }
  function formatBytes(b) {
    if (b < 1024) return b + " B";
    if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
    return (b / 1048576).toFixed(2) + " MB";
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  }); }

  // ---- Mobile nav toggle --------------------------------------------------
  var navToggle = $("navToggle"), navLinks = $("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // ---- Copy-link share ----------------------------------------------------
  document.querySelectorAll("[data-copy-link]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      navigator.clipboard && navigator.clipboard.writeText(location.href).then(function () {
        var t = btn.textContent; btn.textContent = "Copied!";
        setTimeout(function () { btn.textContent = t; }, 1500);
      });
    });
  });

  updateUI();
})();
