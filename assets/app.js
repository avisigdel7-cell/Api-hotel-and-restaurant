(function () {
  "use strict";
  var WHATSAPP = "9779858085412";
  var BIZ = "Api Hotel & Restaurant";
  document.documentElement.classList.add("js");

  function $(id) { return document.getElementById(id); }
  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function fmt(n) { return "Rs " + Number(n).toLocaleString("en-IN"); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function icon(name) {
    var ns = "http://www.w3.org/2000/svg";
    var s = document.createElementNS(ns, "svg");
    s.setAttribute("aria-hidden", "true");
    s.setAttribute("focusable", "false");
    var u = document.createElementNS(ns, "use");
    u.setAttribute("href", "#i-" + name);
    s.appendChild(u);
    return s;
  }
  // Keeps typed text short and on one line before it goes into a WhatsApp message.
  function clean(s, max) { return String(s || "").replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max); }
  function openWhatsApp(message) {
    window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(message), "_blank", "noopener");
  }

  /* Reveal on scroll (content stays visible if anything here fails) */
  var reveals = all(".reveal");
  function showAll() { reveals.forEach(function (r) { r.classList.add("in"); }); }
  function sweep() {
    var h = window.innerHeight || 800;
    reveals.forEach(function (r) { if (r.getBoundingClientRect().top < h - 40) r.classList.add("in"); });
  }
  if (reveals.length) {
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
      }, { threshold: 0.12 });
      reveals.forEach(function (r) { io.observe(r); });
      window.addEventListener("scroll", sweep, { passive: true });
      setTimeout(sweep, 1200);
    } else { showAll(); }
  }

  /* Mobile menu */
  var menuBtn = $("menuBtn"), navLinks = $("navLinks");
  function setMenu(open) {
    navLinks.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", function () { setMenu(!navLinks.classList.contains("open")); });
    navLinks.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navLinks.classList.contains("open")) { setMenu(false); menuBtn.focus(); }
    });
  }

  /* WhatsApp links */
  all("[data-wa]").forEach(function (a) {
    var msg = a.getAttribute("data-wa");
    a.href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg);
    a.target = "_blank";
    a.rel = "noopener";
  });

  /* Opening announcement (home page, once per visit) */
  var ann = $("announce");
  if (ann) {
    var annCard = ann.querySelector(".announce-card"), annLast = null, annKey = "api-announce-closed";
    var seen = false;
    try { seen = sessionStorage.getItem(annKey) === "1"; } catch (e) {}
    var annFocusables = function () {
      return all("a[href], button", annCard).filter(function (e) { return e.offsetParent !== null; });
    };
    var annKeys = function (e) {
      if (e.key === "Escape") { closeAnn(); return; }
      if (e.key !== "Tab") return;
      var f = annFocusables(); if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    };
    var closeAnn = function () {
      if (ann.hidden) return;
      ann.classList.remove("show");
      document.removeEventListener("keydown", annKeys);
      document.body.style.overflow = "";
      try { sessionStorage.setItem(annKey, "1"); } catch (e) {}
      setTimeout(function () { ann.hidden = true; }, 450);
      if (annLast && annLast.focus) annLast.focus();
    };
    var openAnn = function () {
      annLast = document.activeElement;
      ann.hidden = false;
      document.body.style.overflow = "hidden";
      void ann.offsetWidth; // apply the hidden state first so the fade-in always runs
      ann.classList.add("show");
      document.addEventListener("keydown", annKeys);
      setTimeout(function () { annCard.focus(); }, 60);
    };
    all("[data-close]", ann).forEach(function (el) { el.addEventListener("click", closeAnn); });
    if (!seen && !location.hash) setTimeout(openAnn, 900);
  }

  /* Back to top */
  var toTop = $("toTop");
  if (toTop) {
    window.addEventListener("scroll", function () { toTop.hidden = window.scrollY < 700; }, { passive: true });
    toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  }

  /* Booking form */
  var bookForm = $("bookForm");
  if (bookForm) {
    var bDate = $("bDate"), bookStatus = $("bookStatus");
    var now = new Date();
    var today = now.getFullYear() + "-" + ("0" + (now.getMonth() + 1)).slice(-2) + "-" + ("0" + now.getDate()).slice(-2);
    bDate.min = today;
    all("[data-book]").forEach(function (a) {
      a.addEventListener("click", function () { $("bType").value = a.getAttribute("data-book"); });
    });
    bookForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = clean($("bName").value, 60), phone = clean($("bPhone").value, 20), date = bDate.value;
      var problem = "", field = null;
      if (!name) { problem = "Please enter your name."; field = $("bName"); }
      else if (!/^[0-9+ \-]{7,20}$/.test(phone)) { problem = "Please enter a phone number we can reach you on."; field = $("bPhone"); }
      else if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { problem = "Please choose a date."; field = bDate; }
      else if (date < today) { problem = "Please choose today or a later date."; field = bDate; }
      if (problem) { bookStatus.textContent = problem; field.focus(); return; }
      var d = new Date(date + "T00:00:00");
      var nice = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
      var lines = ["Namaste " + BIZ + "! I would like to make a booking.", "",
        "Type: " + $("bType").value, "Name: " + name, "Phone: " + phone, "Date: " + nice, "Guests: " + $("bGuests").value];
      var note = clean($("bNote").value, 200);
      if (note) lines.push("Note: " + note);
      openWhatsApp(lines.join("\n"));
      bookStatus.textContent = "WhatsApp is opening with your request. Press Send there to finish.";
    });
  }

  /* Menu page */
  var menuRoot = $("menuRoot"), MENU = window.API_MENU;
  if (!menuRoot || !Array.isArray(MENU)) return;

  var chips = $("chips"), q = $("q"), noResults = $("noResults"), live = $("live");
  var order = {};      // key -> { name, price, qty }
  var badges = {};     // dish name -> badge element
  var perDish = {};    // dish name -> keys

  var table = "";
  var m = /[?&]table=(\d{1,3})(?:&|$)/.exec(location.search);
  if (m) {
    table = m[1];
    var tn = $("tableNote");
    tn.textContent = "Ordering for table " + table;
    tn.hidden = false;
  }

  function addButton(key, dishName, label, price) {
    var b = el("button", "add");
    b.type = "button";
    if (label) b.appendChild(el("span", "", label));
    b.appendChild(el("b", "", fmt(price)));
    var plus = el("i", "", "+");
    plus.setAttribute("aria-hidden", "true");
    b.appendChild(plus);
    var full = label ? dishName + " (" + label + ")" : dishName;
    b.setAttribute("aria-label", "Add " + full + ", " + fmt(price) + ", to your order");
    b.addEventListener("click", function () { add(key, full, price, dishName); });
    (perDish[dishName] = perDish[dishName] || []).push(key);
    return b;
  }

  MENU.forEach(function (cat) {
    var chip = el("a", "", cat.name);
    chip.href = "#" + cat.id;
    chips.appendChild(chip);

    var sec = el("section", "cat");
    sec.id = cat.id;
    sec.setAttribute("aria-labelledby", "h-" + cat.id);
    var head = el("div", "cat-head");
    head.appendChild(icon(cat.icon));
    var h = el("h2", "", cat.name);
    h.id = "h-" + cat.id;
    head.appendChild(h);
    head.appendChild(el("span", "", cat.items.length + (cat.items.length === 1 ? " dish" : " dishes")));
    sec.appendChild(head);

    var list = el("div", "items");
    cat.items.forEach(function (it, i) {
      var row = el("div", "item");
      row.setAttribute("data-s", (it.n + " " + (it.d || "") + " " + cat.name).toLowerCase());
      var info = el("div");
      info.appendChild(el("h3", "", it.n));
      if (it.d) info.appendChild(el("p", "", it.d));
      var badge = el("span", "inorder");
      badge.hidden = true;
      info.appendChild(badge);
      var dishKey = cat.id + ":" + i;
      badges[dishKey] = badge;
      var acts = el("div", "acts");
      if (it.v) it.v.forEach(function (v, j) { acts.appendChild(addButton(dishKey + ":" + j, dishKey, v[0], v[1])); });
      else acts.appendChild(addButton(dishKey, dishKey, "", it.p));
      // buttons were labelled with the key; swap in the real dish name
      all(".add", acts).forEach(function (b, j) {
        var lab = it.v ? it.v[j][0] : "", pr = it.v ? it.v[j][1] : it.p;
        var full = lab ? it.n + " (" + lab + ")" : it.n;
        b.setAttribute("aria-label", "Add " + full + ", " + fmt(pr) + ", to your order");
      });
      row.appendChild(info);
      row.appendChild(acts);
      list.appendChild(row);
    });
    sec.appendChild(list);
    menuRoot.appendChild(sec);
  });

  // Real names for order lines, looked up by key.
  var names = {};
  MENU.forEach(function (cat) {
    cat.items.forEach(function (it, i) {
      var k = cat.id + ":" + i;
      if (it.v) it.v.forEach(function (v, j) { names[k + ":" + j] = it.n + " (" + v[0] + ")"; });
      else names[k] = it.n;
    });
  });

  /* Search */
  var sections = all(".cat", menuRoot);
  q.addEventListener("input", function () {
    var term = q.value.trim().toLowerCase(), shown = 0;
    sections.forEach(function (sec) {
      var any = false;
      all(".item", sec).forEach(function (row) {
        var hit = !term || row.getAttribute("data-s").indexOf(term) !== -1;
        row.hidden = !hit;
        if (hit) { any = true; shown++; }
      });
      sec.hidden = !any;
    });
    noResults.hidden = shown > 0;
    live.textContent = term ? (shown + (shown === 1 ? " dish found" : " dishes found")) : "";
  });

  /* Highlight the category being read */
  var chipLinks = all("a", chips);
  function spy() {
    var current = 0;
    sections.forEach(function (sec, i) { if (!sec.hidden && sec.getBoundingClientRect().top < 220) current = i; });
    chipLinks.forEach(function (c, i) {
      var on = i === current;
      if (on && !c.classList.contains("on")) {
        chips.scrollTo({ left: c.offsetLeft - chips.offsetLeft - 16, behavior: "auto" });
      }
      c.classList.toggle("on", on);
      if (on) c.setAttribute("aria-current", "true"); else c.removeAttribute("aria-current");
    });
  }
  window.addEventListener("scroll", spy, { passive: true });
  spy();

  function jump() {
    var id = decodeURIComponent(location.hash.slice(1));
    var target = id && document.getElementById(id);
    if (!target || !menuRoot.contains(target)) return;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 180, behavior: "instant" });
    spy();
  }
  window.addEventListener("hashchange", jump);
  if (location.hash) setTimeout(jump, 60);

  /* Order tray */
  var trayBtn = $("trayBtn"), tray = $("tray"), overlay = $("overlay"), trayList = $("trayList"), trayTotal = $("trayTotal");
  var orderForm = $("orderForm"), oType = $("oType"), oTable = $("oTable"), oAddr = $("oAddr"), orderStatus = $("orderStatus");
  var lastFocus = null;

  if (table) { oType.value = "Dine-in"; oTable.value = table; }
  function typeFields() {
    $("oTableField").hidden = oType.value !== "Dine-in";
    $("oAddrField").hidden = oType.value !== "Home delivery";
  }
  oType.addEventListener("change", typeFields);
  typeFields();

  function totals() {
    var count = 0, sum = 0;
    Object.keys(order).forEach(function (k) { count += order[k].qty; sum += order[k].qty * order[k].price; });
    return { count: count, sum: sum };
  }

  function add(key, _label, price, dishKey) {
    if (!order[key]) order[key] = { name: names[key], price: price, qty: 0, dish: dishKey };
    if (order[key].qty >= 50) return;
    order[key].qty++;
    render();
    live.textContent = names[key] + " added. " + totals().count + " in your order, " + fmt(totals().sum) + ".";
  }

  function render() {
    var t = totals();
    trayBtn.hidden = t.count === 0;
    trayBtn.textContent = "Your order · " + t.count + (t.count === 1 ? " item" : " items") + " · " + fmt(t.sum);
    document.body.classList.toggle("has-order", t.count > 0);
    trayTotal.textContent = fmt(t.sum);

    Object.keys(badges).forEach(function (d) {
      var n = 0;
      (perDish[d] || []).forEach(function (k) { if (order[k]) n += order[k].qty; });
      badges[d].hidden = n === 0;
      badges[d].textContent = n ? n + " in your order" : "";
    });

    trayList.textContent = "";
    var keys = Object.keys(order);
    if (!keys.length) { trayList.appendChild(el("p", "empty", "Your order is empty. Tap a price on the menu to add a dish.")); return; }
    keys.forEach(function (k) {
      var o = order[k];
      var line = el("div", "line");
      var nm = el("div", "nm", o.name);
      nm.appendChild(el("small", "", fmt(o.price) + " each"));
      var qty = el("div", "qty");
      var minus = el("button", "", "−"), plus = el("button", "", "+");
      minus.type = plus.type = "button";
      minus.setAttribute("aria-label", "Remove one " + o.name);
      plus.setAttribute("aria-label", "Add one more " + o.name);
      minus.addEventListener("click", function () { change(k, -1); });
      plus.addEventListener("click", function () { change(k, 1); });
      qty.appendChild(minus);
      qty.appendChild(el("span", "", String(o.qty)));
      qty.appendChild(plus);
      line.appendChild(nm);
      line.appendChild(qty);
      line.appendChild(el("b", "", fmt(o.qty * o.price)));
      trayList.appendChild(line);
    });
  }

  function change(k, by) {
    if (!order[k]) return;
    var name = order[k].name;
    order[k].qty = Math.min(50, order[k].qty + by);
    if (order[k].qty <= 0) delete order[k];
    render();
    live.textContent = name + (order[k] ? ": " + order[k].qty : " removed") + ". Total " + fmt(totals().sum) + ".";
    // the tray was rebuilt, so put focus back on a sensible control
    var btns = all(".qty button", trayList), want = (by > 0 ? "Add one more " : "Remove one ") + name;
    var again = btns.filter(function (b) { return b.getAttribute("aria-label") === want; })[0];
    (again || $("trayClose")).focus();
  }

  function focusables() {
    return all("button, select, input, textarea, a[href]", tray).filter(function (e) { return e.offsetParent !== null && !e.disabled; });
  }
  function openTray() {
    lastFocus = document.activeElement;
    tray.hidden = false;
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    $("trayClose").focus();
  }
  function closeTray() {
    tray.hidden = true;
    overlay.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus && !lastFocus.hidden) lastFocus.focus();
  }
  trayBtn.addEventListener("click", openTray);
  $("trayClose").addEventListener("click", closeTray);
  overlay.addEventListener("click", closeTray);
  document.addEventListener("keydown", function (e) {
    if (tray.hidden) return;
    if (e.key === "Escape") { closeTray(); return; }
    if (e.key !== "Tab") return;
    var f = focusables();
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  $("clearOrder").addEventListener("click", function () {
    order = {};
    render();
    orderStatus.textContent = "";
    live.textContent = "Your order was cleared.";
    closeTray();
    q.focus();
  });

  orderForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var t = totals();
    var name = clean($("oName").value, 60), type = oType.value;
    var tableNo = clean(oTable.value, 3), addr = clean(oAddr.value, 160);
    var problem = "", field = null;
    if (!t.count) { problem = "Your order is empty. Add a dish from the menu first."; field = $("trayClose"); }
    else if (type === "Dine-in" && !/^\d{1,3}$/.test(tableNo)) { problem = "Please enter your table number."; field = oTable; }
    else if (type === "Home delivery" && addr.length < 4) { problem = "Please enter your delivery address in Kohalpur."; field = oAddr; }
    else if (!name) { problem = "Please enter your name."; field = $("oName"); }
    if (problem) { orderStatus.textContent = problem; field.focus(); return; }

    var lines = ["Namaste " + BIZ + "! I would like to order:", ""];
    Object.keys(order).forEach(function (k) {
      var o = order[k];
      lines.push("• " + o.qty + " x " + o.name + " = " + fmt(o.qty * o.price));
    });
    lines.push("", "Total: " + fmt(t.sum), "Order type: " + type);
    if (type === "Dine-in") lines.push("Table: " + tableNo);
    if (type === "Home delivery") lines.push("Delivery address (Kohalpur): " + addr);
    lines.push("Name: " + name);
    openWhatsApp(lines.join("\n"));
    orderStatus.textContent = "WhatsApp is opening with your order. Press Send there to finish.";
  });

  render();
})();
