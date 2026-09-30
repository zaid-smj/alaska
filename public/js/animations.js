// ===== SCROLL ANIMATIONS =====
// global breakpoint used by banner + video swap logic
const MOBILE_BREAKPOINT = 640; // px — change if you prefer a different cutoff
document.addEventListener("DOMContentLoaded", function () {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all fade-in elements
  document.querySelectorAll(".fade-in, .slide-in-left, .slide-in-right").forEach((el) => {
    observer.observe(el);
  });

  // Page transition animation
  document.body.classList.add("page-transition");
});

// ===== BATTERY FINDER MODAL =====
function openBatteryFinder() {
  const modal = document.createElement("div");
  modal.id = "batteryFinderModal";
  modal.className = "fixed inset-0 bg-black/80 z-[999] flex items-center justify-center p-4 animate-fadeIn";

  modal.innerHTML = `
    <div class="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl p-8 animate-slideUp">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-black uppercase tracking-tighter">Find Your Perfect <span class="text-[#c00d1e]">Battery</span></h2>
        <button onclick="closeBatteryFinder()" class="text-gray-400 hover:text-black text-2xl">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      
      <div class="space-y-6">
        <div>
          <label class="block text-sm font-black uppercase mb-3 text-gray-700">What's Your Primary Use?</label>
          <div class="space-y-3">
            <button onclick="selectUse('automotive')" class="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#c00d1e] hover:bg-red-50 transition-all text-left flex items-start gap-4">
              <i class="fa-solid fa-car text-[#c00d1e] text-2xl flex-shrink-0 mt-1"></i>
              <div>
                <p class="font-bold uppercase text-lg">Automotive</p>
                <p class="text-base text-gray-500">Cars, Bikes, Trucks</p>
              </div>
            </button>
            <button onclick="selectUse('solar')" class="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#c00d1e] hover:bg-red-50 transition-all text-left flex items-start gap-4">
              <i class="fa-solid fa-sun text-[#c00d1e] text-2xl flex-shrink-0 mt-1"></i>
              <div>
                <p class="font-bold uppercase text-lg">Solar</p>
                <p class="text-base text-gray-500">Renewable Energy</p>
              </div>
            </button>
            <button onclick="selectUse('industrial')" class="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-[#c00d1e] hover:bg-red-50 transition-all text-left flex items-start gap-4">
              <i class="fa-solid fa-industry text-[#c00d1e] text-2xl flex-shrink-0 mt-1"></i>
              <div>
                <p class="font-bold uppercase text-lg">Industrial</p>
                <p class="text-base text-gray-500">UPS, Backup Systems</p>
              </div>
            </button>
            
          </div>
        </div>

        <div class="pt-6 border-t border-gray-200">
          
          <div class="flex gap-4">
            <button onclick="closeBatteryFinder()" class="flex-1 px-6 py-3 border-2 border-gray-200 font-bold uppercase text-sm rounded-lg hover:border-[#c00d1e] transition-all">Cancel</button>
            <a href="dry-charge.html" class="flex-1 px-6 py-3 bg-[#c00d1e] text-white font-bold uppercase text-sm rounded-lg hover:bg-black transition-all text-center">View All Batteries</a>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = "hidden";

  // Close on backdrop click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeBatteryFinder();
  });
}

function selectUse(type) {
  const typeMap = {
    automotive: "dry-charge.html#Automotive",
    solar: "dry-charge.html#Solar",
    industrial: "dry-charge.html#Industrial",
    other: "dry-charge.html",
  };
  window.location.href = typeMap[type];
}

function closeBatteryFinder() {
  const modal = document.getElementById("batteryFinderModal");
  if (modal) {
    modal.remove();
    document.body.style.overflow = "auto";
  }
}

// Update videos that include <source data-mobile="..."> for mobile-specific sources
function updateVideos() {
  document.querySelectorAll("video").forEach((video) => {
    const srcEl = video.querySelector("source[data-mobile]");
    if (!srcEl) return;

    if (!srcEl.dataset.desktop) srcEl.dataset.desktop = srcEl.getAttribute("src") || "";
    const mobileSrc = srcEl.dataset.mobile;
    const desktopSrc = srcEl.dataset.desktop;
    const useMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    const desired = useMobile ? mobileSrc : desktopSrc;
    if (!desired) return;

    const getFilename = (p) => {
      try {
        return p.split("/").pop();
      } catch (e) {
        return p || "";
      }
    };
    const current = video.currentSrc || video.src || "";
    if (getFilename(current) === getFilename(desired)) return; // already correct

    // More robust approach: replace the entire <video> element with a fresh one
    try {
      console.debug("Swapping video to", desired);
      const wasPlaying = !video.paused && !video.ended;

      // Build new video element
      const newVideo = document.createElement("video");
      // copy attributes
      for (let i = 0; i < video.attributes.length; i++) {
        const a = video.attributes[i];
        newVideo.setAttribute(a.name, a.value);
      }
      // ensure playsinline & muted for autoplay on mobile
      newVideo.setAttribute("playsinline", "");
      newVideo.setAttribute("webkit-playsinline", "");
      if (!newVideo.hasAttribute("muted")) newVideo.setAttribute("muted", "");

      // create source
      const newSource = document.createElement("source");
      newSource.setAttribute("src", desired);
      newSource.setAttribute("type", srcEl.getAttribute("type") || "video/mp4");
      newVideo.appendChild(newSource);

      // preserve id/class for styling and scripts
      if (video.id) newVideo.id = video.id;
      newVideo.className = video.className;

      // Replace in DOM
      video.parentNode.replaceChild(newVideo, video);

      // attempt to load/play with robust fallbacks for mobile autoplay
      newVideo.load();
      // ensure properties for autoplay on mobile
      try {
        newVideo.muted = true;
        newVideo.playsInline = true;
        newVideo.setAttribute("playsinline", "");
        newVideo.setAttribute("webkit-playsinline", "");
        if (!newVideo.hasAttribute("muted")) newVideo.setAttribute("muted", "");
      } catch (e) {
        /* ignore property set failures */
      }

      const tryPlay = () => {
        try {
          const p = newVideo.play();
          if (p && p.catch) p.catch((err) => console.debug("Autoplay blocked", err));
        } catch (e) {
          console.debug("Play attempt failed", e);
        }
      };

      // Try to play once the video is ready
      newVideo.addEventListener("canplay", tryPlay, { once: true });
      newVideo.addEventListener("loadeddata", tryPlay, { once: true });
      // Fallback: try shortly after replace
      setTimeout(tryPlay, 500);
    } catch (e) {
      console.warn("Video replace failed", e);
    }
  });
}

// ===== Responsive Banner Images (desktop/mobile) =====
(function () {
  const MOBILE_BREAKPOINT = 640; // px — change if you prefer a different cutoff

  function debounce(fn, wait) {
    let t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, wait);
    };
  }

  function updateBanners() {
    document.querySelectorAll("img[data-mobile]").forEach((img) => {
      // store original as data-desktop if not present
      //if (!img.dataset.desktop) img.dataset.desktop = img.getAttribute("src") || "";

      const mobileSrc = img.dataset.mobile;
      const desktopSrc = img.dataset.desktop;
      const useMobile = window.innerWidth <= MOBILE_BREAKPOINT;

      const desired = useMobile ? mobileSrc : desktopSrc;
      if (desired && img.src.indexOf(desired) === -1) {
        img.src = desired;
      }
    });
  }

  const debouncedUpdate = debounce(updateBanners, 120);
  // Compose a single debounced updater for banners + videos
  const debouncedAll = debounce(function () {
    updateBanners();
    updateVideos();
  }, 120);

  window.addEventListener("resize", debouncedAll);
  window.addEventListener("orientationchange", debouncedAll);
  // Also listen to a media-query change so swaps occur exactly when breakpoint crosses
  try {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    if (mq.addEventListener) {
      mq.addEventListener("change", debouncedAll);
    } else if (mq.addListener) {
      mq.addListener(debouncedAll);
    }
  } catch (e) {
    // ignore when matchMedia not available
  }
  // Run once after DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      updateBanners();
      updateVideos();
    });
  } else {
    updateBanners();
    updateVideos();
  }
})();
