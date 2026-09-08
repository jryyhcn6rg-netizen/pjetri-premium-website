(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------
     Footer year
     --------------------------------------------------------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------------
     Mobile nav toggle
     --------------------------------------------------------------------- */
  var navToggle = document.getElementById("nav-toggle");
  var mainNav = document.getElementById("main-nav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      mainNav.classList.toggle("is-open", !isOpen);
      navToggle.setAttribute("aria-label", isOpen ? "Menü öffnen" : "Menü schließen");
    });

    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navToggle.setAttribute("aria-expanded", "false");
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-label", "Menü öffnen");
      });
    });
  }

  /* ---------------------------------------------------------------------
     Before / After compare slider
     --------------------------------------------------------------------- */
  document.querySelectorAll(".compare").forEach(function (compareEl) {
  var compareFrame = compareEl.querySelector(".compare-frame");
  var compareBeforeWrap = compareEl.querySelector(".compare-before-wrap");
  var compareDivider = compareEl.querySelector(".compare-divider");
  var compareHandle = compareEl.querySelector(".compare-handle");
  var stepBack = compareEl.querySelector(".compare-step-back");
  var stepFwd = compareEl.querySelector(".compare-step-fwd");

  if (compareFrame && compareBeforeWrap && compareDivider && compareHandle) {
    var pct = 50;

    function setCompare(newPct) {
      pct = Math.max(0, Math.min(100, newPct));
      compareBeforeWrap.style.clipPath = "inset(0 " + (100 - pct) + "% 0 0)";
      compareDivider.style.left = pct + "%";
      compareHandle.setAttribute("aria-valuenow", String(Math.round(pct)));
      compareHandle.setAttribute("aria-valuetext", Math.round(pct) + " Prozent");
    }

    function pctFromClientX(clientX) {
      var rect = compareFrame.getBoundingClientRect();
      var x = clientX - rect.left;
      return (x / rect.width) * 100;
    }

    var dragging = false;

    function onPointerMove(e) {
      if (!dragging) return;
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      setCompare(pctFromClientX(clientX));
    }
    function stopDrag() {
      dragging = false;
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", stopDrag);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", stopDrag);
    }
    function startDrag(e) {
      dragging = true;
      window.addEventListener("mousemove", onPointerMove);
      window.addEventListener("mouseup", stopDrag);
      window.addEventListener("touchmove", onPointerMove, { passive: true });
      window.addEventListener("touchend", stopDrag);
    }

    compareHandle.addEventListener("mousedown", startDrag);
    compareHandle.addEventListener("touchstart", startDrag, { passive: true });

    compareFrame.addEventListener("click", function (e) {
      if (e.target === compareHandle) return;
      setCompare(pctFromClientX(e.clientX));
    });

    compareHandle.addEventListener("keydown", function (e) {
      var step = 5;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        setCompare(pct - step);
        e.preventDefault();
      } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        setCompare(pct + step);
        e.preventDefault();
      } else if (e.key === "Home") {
        setCompare(0);
        e.preventDefault();
      } else if (e.key === "End") {
        setCompare(100);
        e.preventDefault();
      }
    });

    if (stepBack) stepBack.addEventListener("click", function () { setCompare(pct - 10); compareHandle.focus(); });
    if (stepFwd) stepFwd.addEventListener("click", function () { setCompare(pct + 10); compareHandle.focus(); });

    setCompare(50);
  }
  });

  /* ---------------------------------------------------------------------
     Testimonial carousel
     --------------------------------------------------------------------- */
  var track = document.getElementById("testimonial-track");
  var dotsWrap = document.getElementById("testimonial-dots");
  var prevBtn = document.getElementById("testimonial-prev");
  var nextBtn = document.getElementById("testimonial-next");
  var carouselRoot = document.getElementById("testimonial-carousel");

  if (track && dotsWrap && prevBtn && nextBtn && carouselRoot) {
    var slides = Array.prototype.slice.call(track.children);
    var current = 0;
    var autoplayId = null;

    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", "Zur Bewertung " + (i + 1) + " springen");
      if (i === 0) dot.setAttribute("aria-current", "true");
      dot.addEventListener("click", function () { goTo(i); resetAutoplay(); });
      dotsWrap.appendChild(dot);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = "translateX(-" + (current * 100) + "%)";
      dots.forEach(function (d, i) {
        if (i === current) d.setAttribute("aria-current", "true");
        else d.removeAttribute("aria-current");
      });
      slides.forEach(function (s, i) {
        if (i === current) s.setAttribute("aria-current", "true");
        else s.removeAttribute("aria-current");
      });
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    prevBtn.addEventListener("click", function () { prev(); resetAutoplay(); });
    nextBtn.addEventListener("click", function () { next(); resetAutoplay(); });

    function startAutoplay() {
      if (prefersReducedMotion || slides.length < 2) return;
      autoplayId = window.setInterval(next, 6000);
    }
    function stopAutoplay() {
      if (autoplayId) { window.clearInterval(autoplayId); autoplayId = null; }
    }
    function resetAutoplay() { stopAutoplay(); startAutoplay(); }

    carouselRoot.addEventListener("mouseenter", stopAutoplay);
    carouselRoot.addEventListener("mouseleave", startAutoplay);
    carouselRoot.addEventListener("focusin", stopAutoplay);
    carouselRoot.addEventListener("focusout", startAutoplay);

    goTo(0);
    startAutoplay();
  }
})();
