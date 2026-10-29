/* =====================================================
   1. YOUR CONTENT (this is the only part you need to edit)

   To add a video:
   - copy one line, paste it below the others
   - id    = the part after "v=" in the YouTube link
             (https://www.youtube.com/watch?v=THIS_PART)
   - title = name shown on the tile
   - meta  = small text next to the title (year, band, ...)
   - h     = tile height in pixels
   ===================================================== */
const VIDEOS = {
  weddings: [
    { id: "GD1R-rWEhoA", title: "Anna & Bence",     meta: "2022", h: 640 },
    { id: "I8Kplsf1p5Q", title: "Réka & Dani",      meta: "2024", h: 240 },
    { id: "--h0tti6zg4", title: "Feri & Zümee",     meta: "2025", h: 380 },
    { id: "cAIV0wwR7EI", title: "Lilla & Marci",    meta: "2025", h: 500 },
    { id: "gaKiJE2C8Tk", title: "Nóra & Gergő",     meta: "2026", h: 500 },
    { id: "RQorrnJIc2Q", title: "Mariann & Carlos", meta: "2023", h: 380 },
    { id: "vtaDi_R6CII", title: "Carla & Thomas",   meta: "2025", h: 280 },
    { id: "jX4jySkP6FQ", title: "Mazsi & Pazsi",    meta: "2026", h: 300 },
    { id: "X5hPRvz_gUM", title: "Kuki & Pinas",     meta: "2023", h: 293 },
  ],

  musicvideos: [
    { id: "huXEOj1BBoU", title: "Magidom - Állandó Változás", h: 300,},
    { id: "8kePefatqBM", title: "Magidom - Van Az a Pénz", h: 300 },
    { id: "TAtm_aNAHqM", title: "Goodbye Darjeeling - No Idol", h: 300 },
    { id: "IDUgsByn1Ak", title: "Goodbye Darjeeling - Secret Rooms", h: 300 },
    { id: "xMntfG0gzNA", title: "Goodbye Darjeeling - Darwinien", h: 300 },
    { id: "A-pF38JtAH8", title: "Systemless - Departure", h: 300 },
    { id: "KivYRftLus0", title: "Magidom - Királydráma", h: 300 },
    { id: "la65Qmse9VY", title: "Magidom - NE LOPJ", h: 300 },
  ],
}

const motionVideos = document.querySelectorAll('.motion-video');

const isTouchDevice = window.matchMedia('(hover: none)').matches;


/* =====================================================
   2. SMALL HELPERS
   ===================================================== */

// Shortcut: find one element on the page, e.g. $("#nav")
function $(selector, parent = document) {
  return parent.querySelector(selector);
}

// Turn 3 into "03" (used for the "03 / 17" counter in the lightbox)
function twoDigits(number) {
  return String(number).padStart(2, "0");
}

// Build the YouTube player address for a video id
function youtubeEmbedUrl(id, extra = "") {
  return "https://www.youtube-nocookie.com/embed/" + id +
         "?rel=0&modestbranding=1&playsinline=1" + extra;
}


// /* =====================================================
//    3. FOOTER YEAR
//    ===================================================== */
// const yearSpan = $("#yr");
// if (yearSpan) {
//   yearSpan.textContent = new Date().getFullYear();
// }


/* =====================================================
   4. NAVBAR
   - turns solid after you scroll down a bit
   - burger button opens/closes the mobile menu
   ===================================================== */
const nav = $("#nav");
const menu = $("#menu");
const burger = $("#burger");

function updateNavbar() {
  const scrolledFarEnough = window.scrollY > window.innerHeight * 0.6;
  nav.classList.toggle("solid", scrolledFarEnough);
}
window.addEventListener("scroll", updateNavbar);
const hasHero = $(".hero, .page-banner");

function updateNavbar() {
  const scrolledFarEnough = window.scrollY > window.innerHeight * 0.6;
  nav.classList.toggle("solid", !hasHero || scrolledFarEnough);
}

function setMenuOpen(isOpen) {
  menu.classList.toggle("open", isOpen);
  burger.setAttribute("aria-expanded", isOpen);
}

burger.addEventListener("click", function () {
  setMenuOpen(!menu.classList.contains("open"));
});

// close the menu after tapping a link inside it
menu.addEventListener("click", function (event) {
  if (event.target.tagName === "A") {
    setMenuOpen(false);
  }
});


/* =====================================================
   5. VIDEO TILES
   For every video in VIDEOS, build a tile and add it to
   the matching <div class="vgrid" data-cat="...">
   ===================================================== */
function createTile(video, index, allVideosInGrid) {
  const tile = document.createElement("figure");
  tile.className = "tile rv";
  tile.tabIndex = 0; // lets keyboard users focus the tile

  // CSS reads these two values (--h = height, --d = animation delay)
  tile.style.setProperty("--h", video.h + "px");
  tile.style.setProperty("--d", (index % 3) * 0.12 + "s");

  tile.innerHTML = `
    <div class="pic">
      <img alt="${video.title}" loading="lazy">
      <i class="play">▶</i>
      <figcaption><b>${video.title}</b></figcaption>
    </div>`;

  // Thumbnail: try the sharp version first. If YouTube doesn't have
  // it, switch to the smaller one, which always exists.
  const image = $("img", tile);
  image.src = "https://i.ytimg.com/vi/" + video.id + "/maxresdefault.jpg";
  image.onerror = function () {
    image.onerror = null; // avoid looping forever
    image.src = "https://i.ytimg.com/vi/" + video.id + "/hqdefault.jpg";
  };

  // Clicking (or pressing Enter on) the tile opens the lightbox
  tile.addEventListener("click", function () {
    openLightbox(allVideosInGrid, index);
  });
  tile.addEventListener("keydown", function (event) {
    if (event.key === "Enter") openLightbox(allVideosInGrid, index);
  });

  return tile;
}

document.querySelectorAll(".vgrid").forEach(function (grid) {
  const videos = VIDEOS[grid.dataset.cat] || [];
  videos.forEach(function (video, index) {
    grid.appendChild(createTile(video, index, videos));
  });
});

document.querySelectorAll(".mgrid").forEach(function (grid) {
  const videos = VIDEOS[grid.dataset.cat] || [];
  videos.forEach(function (video, index) {
    grid.appendChild(createTile(video, index, videos));
  });
});

/* =====================================================
   6. LIGHTBOX (the pop-up video player with prev / next)
   ===================================================== */

// Create the lightbox once and keep it hidden at the end of <body>
const lightbox = document.createElement("div");
lightbox.id = "lb";
lightbox.innerHTML = `
  <button class="lb-x" aria-label="Close">✕</button>
  <button class="lb-p" aria-label="Previous">‹</button>
  <button class="lb-n" aria-label="Next">›</button>
  <div class="lb-body"></div>
  <div class="lb-i"><b></b><span></span></div>`;
document.body.appendChild(lightbox);

let currentList = []; // the videos we are flipping through
let currentIndex = 0; // which one is showing

function showCurrentVideo() {
  const video = currentList[currentIndex];

  $(".lb-body", lightbox).innerHTML =
    `<iframe src="${youtubeEmbedUrl(video.id, "&autoplay=1")}"
             allow="autoplay; fullscreen; picture-in-picture"
             allowfullscreen title="${video.title}"></iframe>`;

  $(".lb-i b", lightbox).textContent = video.title;
  $(".lb-i span", lightbox).textContent =
    twoDigits(currentIndex + 1) + " / " + twoDigits(currentList.length);

  // hide the arrows if there is only one video
  const showArrows = currentList.length > 1;
  $(".lb-p", lightbox).style.display = showArrows ? "" : "none";
  $(".lb-n", lightbox).style.display = showArrows ? "" : "none";
}

function openLightbox(list, index) {
  currentList = list;
  currentIndex = index;
  showCurrentVideo();
  lightbox.classList.add("show");
  document.body.style.overflow = "hidden"; // stop page scrolling behind it
}

function closeLightbox() {
  $(".lb-body", lightbox).innerHTML = ""; // removing the iframe stops the video
  lightbox.classList.remove("show");
  document.body.style.overflow = "";
}

function goToVideo(direction) { // direction: -1 = previous, 1 = next
  const total = currentList.length;
  currentIndex = (currentIndex + direction + total) % total; // wraps around
  showCurrentVideo();
}

// Mouse: close button, arrows, or clicking the dark background
lightbox.addEventListener("click", function (event) {
  const clicked = event.target.classList;
  if (event.target === lightbox || clicked.contains("lb-x")) closeLightbox();
  else if (clicked.contains("lb-p")) goToVideo(-1);
  else if (clicked.contains("lb-n")) goToVideo(1);
});

// Keyboard: Esc closes, left/right arrows switch video
window.addEventListener("keydown", function (event) {
  if (!lightbox.classList.contains("show")) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") goToVideo(-1);
  if (event.key === "ArrowRight") goToVideo(1);
});


/* =====================================================
   7. SCROLL ANIMATIONS
   Anything with class "rv" fades in when it scrolls into view.
   (The CSS does the animating; this just adds/removes the
   class "in".)
   ===================================================== */
const observer = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
      } else if (entry.boundingClientRect.top > 0) {
        // it left through the bottom: reset so it can animate again
        entry.target.classList.remove("in");
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
);

document.querySelectorAll(".rv").forEach(function (element) {
  observer.observe(element);
});

const shortTiles = document.querySelectorAll(".short");

function stopAllShorts() {
  document.querySelectorAll(".short.playing").forEach(function (tile) {
    tile.querySelector("iframe").remove();      // removing the iframe stops the video
    tile.classList.remove("playing");
  });
}

shortTiles.forEach(function (tile) {
  const id = tile.dataset.id;
  const img = tile.querySelector("img");

  // sharper thumbnail if YouTube has one, otherwise keep the one from the HTML
  const sharp = new Image();
  sharp.onload = function () { if (sharp.naturalWidth > 200) img.src = sharp.src; };
  sharp.src = "https://i.ytimg.com/vi/" + id + "/maxresdefault.jpg";

  function play() {
    if (tile.classList.contains("playing")) return;
    stopAllShorts();                            // only one plays at a time
    const frame = document.createElement("iframe");
    frame.src = "https://www.youtube-nocookie.com/embed/" + id +
                "?autoplay=1&playsinline=1&rel=0&loop=1&playlist=" + id;
    frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    frame.allowFullscreen = true;
    frame.title = img.alt;
    tile.appendChild(frame);
    tile.classList.add("playing");
  }

  tile.addEventListener("click", play);
  tile.addEventListener("keydown", function (event) {
    if (event.key === "Enter") play();
  });
});

motionVideos.forEach(video => {
  if (isTouchDevice) {
    video.play();
  } else {
    video.addEventListener('mouseenter', () => video.play());

    video.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0;
      video.load();
    });
  }
});