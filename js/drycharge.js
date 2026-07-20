// 1. GLOBAL SCOPE
let currentBatteryId = null;
let compareFirstId = null;
let compareSelectingFirst = false;
let lastFiltered = [];
let catalogPageIndex = 0;
let catalogPageCount = 0;

function normalizeUses(uses) {
  if (!uses) return [];
  if (Array.isArray(uses)) return uses.filter(Boolean);
  return String(uses)
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);
}

// Format the stage title for mobile: force a break before 'Lead-Acid' when narrow
function formatStageTitle(text) {
  if (!text) return "";
  try {
    // Normalize variants like "Lead Acid", "Lead-Acid", "lead acid" etc.
    const regex = /\bLead[\s-]*Acid\b/i;
    if (window.innerWidth <= 640 && regex.test(text)) {
      // Replace first match with a standardized break + capitalization
      return text.replace(regex, function (match) {
        return "<br>Lead-Acid";
      });
    }
    // As a fallback on small screens, allow a soft break before "Battery" if present
    if (window.innerWidth <= 640 && /\bBattery\b/i.test(text) && !regex.test(text)) {
      return text.replace(/\bBattery\b/i, "<br>Battery");
    }
  } catch (e) {
    return text;
  }
  return text;
}

function getUsesText(uses) {
  const list = normalizeUses(uses);
  return list.join(", ");
}

function formatDimensions(dimensions) {
  if (!dimensions) return "";
  if (typeof dimensions === "string") return dimensions.trim();

  const length = dimensions.l ?? dimensions.length;
  const width = dimensions.w ?? dimensions.width;
  const height = dimensions.h ?? dimensions.height;
  const unitRaw = dimensions.unit || "";
  const unit = unitRaw ? ` ${unitRaw}` : "";
  const isInches = ["in", "inch", "inches"].includes(String(unitRaw).toLowerCase());

  if ([length, width, height].some((v) => v === undefined || v === null || v === "")) {
    return "";
  }

  const base = `L: ${length} x W: ${width} x H: ${height}`;
  if (isInches) {
    return base;
  }

  return `${base}${unit}`;
}

function getBatterySearchText(battery) {
  const usesText = getUsesText(battery.uses);
  const dimensionsText = formatDimensions(battery.dimensions);
  const categoriesText = Array.isArray(battery.categories) ? battery.categories.join(" ") : "";
  const boxSize = battery.boxSize || "";
  const warranty = battery.warranty || "";
  const weightKg = battery.weightKg || "";
  const power = battery.p || "";

  return `${battery.model} ${battery.tech} ${battery.ah} ${battery.plates} ${boxSize} ${warranty} ${weightKg} ${power} ${categoriesText} ${usesText} ${dimensionsText}`.toLowerCase();
}

// Define updateStage globally so it's ready before DOMContentLoaded triggers
window.updateStage = function (id, shouldScroll = false) {
  currentBatteryId = id;
  const battery = batteryData.find((b) => b.id === id);
  if (!battery) return;

  // UI Updates
  const stageName = document.getElementById("stage-name");
  const stageTech = document.getElementById("stage-tech");
  const stagePlates = document.getElementById("stage-plates");
  const stagePower = document.getElementById("stage-power");
  const stageAh = document.getElementById("stage-ah");
  const stageWarranty = document.getElementById("stage-warranty");
  const stageUses = document.getElementById("stage-uses");
  const stageImage = document.getElementById("stage-image");
  const tagsContainer = document.getElementById("stage-tags");

  if (stageName) stageName.innerHTML = formatStageTitle(battery.model);
  if (stageTech) stageTech.innerHTML = formatStageTitle(battery.tech);
  if (stagePlates) stagePlates.innerText = battery.plates;
  if (stagePower) stagePower.innerText = battery.p + "V";
  if (stageAh) stageAh.innerText = battery.ah + " AH";
  if (stageWarranty) {
    const rawWarranty = battery.warranty;
    const normalized = String(rawWarranty ?? "")
      .trim()
      .toLowerCase();
    const noWarrantyValues = new Set(["", "0", "0 month", "0 months", "0 yr", "0 year", "0 years", "n/a", "na", "none", "no", "no warranty"]);
    const isZeroNumber = normalized !== "" && !Number.isNaN(Number(normalized)) && Number(normalized) === 0;
    const hasWarranty = !(noWarrantyValues.has(normalized) || isZeroNumber);
    stageWarranty.innerText = rawWarranty ?? "";

    const warrantyBlock = stageWarranty.parentElement;
    if (warrantyBlock) {
      warrantyBlock.style.display = hasWarranty ? "" : "none";
    }
  }

  if (stageUses) {
    const usesText = getUsesText(battery.uses);
    stageUses.innerText = usesText || "--";
  }

  if (stageImage) stageImage.src = battery.image;

  if (tagsContainer) {
    tagsContainer.innerHTML = battery.categories.map((tag) => `<span class="bg-gray-100 px-3 py-1 text-[100%] font-black uppercase rounded-md">${tag}</span>`).join("");
  }

  // Populate details section with box size, dimensions, and weight
  const detailsContent = document.getElementById("stage-details");
  if (detailsContent) {
    const detailsLines = [];
    if (battery.boxSize) detailsLines.push(`<div><strong>Battery Box Size (Japanese Industrial Standard):</strong> ${battery.boxSize}</div>`);
    if (battery.dimensions) {
      const unitRaw = battery.dimensions.unit || "";
      const isInches = ["in", "inch", "inches"].includes(String(unitRaw).toLowerCase());
      if (isInches) {
        detailsLines.push(`<div><strong>Dimensions (inches):</strong> ${formatDimensions(battery.dimensions)}</div>`);
      } else {
        detailsLines.push(`<div><strong>Dimensions:</strong> ${formatDimensions(battery.dimensions)}</div>`);
      }
    }
    if (battery.weightKg !== undefined && battery.weightKg !== null) detailsLines.push(`<div><strong>Dry Weight:</strong> ${battery.weightKg} kg</div>`);

    detailsContent.innerHTML = detailsLines.length ? detailsLines.join("") : "<div>No details available</div>";

    // Reset button icon to plus
    const detailsBtn = document.getElementById("stage-details-btn");
    const detailsLabel = document.getElementById("stage-details-label");
    if (detailsBtn) {
      const icon = detailsBtn.querySelector("i");
      if (icon) {
        icon.classList.remove("fa-minus");
        icon.classList.add("fa-plus");
      }
    }
    if (detailsLabel) {
      detailsLabel.innerText = "More Details";
    }

    // Hide details initially
    detailsContent.classList.add("hidden");
  }

  if (shouldScroll) {
    const target = document.getElementById("details-anchor") || document.getElementById("product-stage") || document.getElementById("search-section");
    if (target) {
      const offset = 20; // small gap from top
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("batterySearch");
  const clearBtn = document.getElementById("clearSearch");
  const suggestionsBox = document.getElementById("search-suggestions");
  const thumbGrid = document.getElementById("thumb-grid");

  // --- AUTO-SELECT CATEGORY FROM URL HASH ---
  const hash = window.location.hash.substring(1);
  if (hash && ["Automotive", "Solar", "Industrial"].includes(hash)) {
    const targetBtn = document.querySelector(`.filter-btn[data-cat="${hash}"]`);
    if (targetBtn) {
      document.querySelector(".filter-btn.active")?.classList.remove("active");
      targetBtn.classList.add("active");
      // If arriving with a category hash (from homepage), make sure the hero reflects it
      if (typeof updateHero === "function") {
        // Defer to the next tick so DOM-initialized constants (like `heroImg`) exist
        setTimeout(() => {
          try {
            updateHero(hash);
          } catch (e) {
            /* noop */
          }
        }, 0);
      }
      // Also apply filters so the grid reflects the chosen category
      if (typeof applyFilters === "function") {
        setTimeout(() => {
          try {
            applyFilters();
          } catch (e) {
            /* noop */
          }
        }, 0);
      }
    }
  }

  // --- DETAILS BUTTON - EXPAND/COLLAPSE ---
  const detailsBtn = document.getElementById("stage-details-btn");
  const detailsLabel = document.getElementById("stage-details-label");
  if (detailsBtn) {
    detailsBtn.addEventListener("click", () => {
      const detailsContent = document.getElementById("stage-details");
      const icon = detailsBtn.querySelector("i");

      if (detailsContent) {
        const isHidden = detailsContent.classList.contains("hidden");
        if (isHidden) {
          detailsContent.classList.remove("hidden");
          icon.classList.remove("fa-plus");
          icon.classList.add("fa-minus");
          if (detailsLabel) detailsLabel.innerText = "Less Details";
        } else {
          detailsContent.classList.add("hidden");
          icon.classList.remove("fa-minus");
          icon.classList.add("fa-plus");
          if (detailsLabel) detailsLabel.innerText = "More Details";
        }
      }
    });
  }
  if (detailsLabel && detailsBtn) {
    detailsLabel.addEventListener("click", () => detailsBtn.click());
  }

  // --- 2. DRAG TO SCROLL LOGIC (Fixed) ---
  if (thumbGrid) {
    let isDown = false;
    let startX;
    let scrollLeft;

    thumbGrid.addEventListener("mousedown", (e) => {
      isDown = true;
      thumbGrid.classList.add("active");
      startX = e.pageX - thumbGrid.offsetLeft;
      scrollLeft = thumbGrid.scrollLeft;
    });

    thumbGrid.addEventListener("mouseleave", () => {
      isDown = false;
      thumbGrid.classList.remove("active");
    });

    thumbGrid.addEventListener("mouseup", () => {
      isDown = false;
      thumbGrid.classList.remove("active");
    });

    thumbGrid.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - thumbGrid.offsetLeft;
      const walk = (x - startX) * 2; // Scroll-fast speed
      thumbGrid.scrollLeft = scrollLeft - walk;
    });
  }

  // --- SEARCH & CLEAR LOGIC ---
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const term = searchInput.value.toLowerCase().trim();
      if (clearBtn) clearBtn.classList.toggle("hidden", term.length === 0);
      applyFilters();
      updateSuggestions(term);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      searchInput.value = "";
      clearBtn.classList.add("hidden");
      if (suggestionsBox) suggestionsBox.classList.add("hidden");
      applyFilters();
      searchInput.focus();
    });
  }

  // --- CATEGORY FILTERING ---
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      document.querySelector(".filter-btn.active")?.classList.remove("active");
      this.classList.add("active");
      applyFilters();
    });
  });

  // Apply filters on page load (in case hash was set)
  applyFilters();

  // --- FIX: UPDATED APPLY FILTERS ---
  function applyFilters() {
    const term = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const activeCat = document.querySelector(".filter-btn.active")?.getAttribute("data-cat") || "All";

    const filtered = batteryData.filter((b) => {
      let matchesSearch = true;

      if (term) {
        // Check if search is specifically for plates (e.g., "9 plates", "11 plate")
        const platesMatch = term.match(/^(\d+)\s+plates?$/i);
        if (platesMatch) {
          // Search specifically for that exact number of plates when "plates" keyword is used
          const plateNumber = parseInt(platesMatch[1]);
          matchesSearch = b.plates === plateNumber;
        } else if (/^\d{1,2}$/.test(term)) {
          // If it's just a 1-2 digit number, check if it matches plates OR search generally
          const num = parseInt(term);
          // Common plate counts are odd numbers from 7 to 21
          if (num >= 7 && num <= 25) {
            // Check if it matches plates exactly OR appears in other attributes
            const searchStr = getBatterySearchText(b);
            matchesSearch = b.plates === num || searchStr.includes(term);
          } else {
            // For other numbers, just do general search
            const searchStr = getBatterySearchText(b);
            matchesSearch = searchStr.includes(term);
          }
        } else {
          // General search across all battery properties
          const searchStr = getBatterySearchText(b);
          matchesSearch = searchStr.includes(term);
        }
      }

      const matchesCat = activeCat === "All" || b.categories.includes(activeCat);
      return matchesSearch && matchesCat;
    });

    // Sort batteries by model number (ascending) BEFORE updating stage
    const sortedFiltered = [...filtered].sort((a, b) => {
      const numA = parseInt(a.model.match(/\d+/)?.[0] || 0);
      const numB = parseInt(b.model.match(/\d+/)?.[0] || 0);
      return numA - numB;
    });

    lastFiltered = sortedFiltered;

    // Update the main stage with the first sorted battery
    if (sortedFiltered.length > 0) {
      window.updateStage(sortedFiltered[0].id, false);
    }

    // Ensure hero/banner matches the active category when filters are applied
    // Defer hero/banner update so it doesn't run before banner elements are initialized
    if (typeof updateHero === "function") {
      setTimeout(() => {
        try {
          updateHero(activeCat);
        } catch (e) {
          /* ignore if updateHero is not available yet */
        }
      }, 0);
    }

    renderThumbnails(sortedFiltered);
  }

  function renderThumbnails(data) {
    renderGrid(data);
  }

  // Gallery modal functions
  window.openGalleryModal = function (data) {
    const modal = document.getElementById("gallery-modal");
    const grid = document.getElementById("gallery-grid");
    if (!modal || !grid) return;
    const list = Array.isArray(data) ? data : lastFiltered.length ? lastFiltered : batteryData;
    renderGalleryGrid(list);
    modal.classList.add("active");
    setTimeout(() => {
      modal.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 10);
    document.body.style.overflow = "hidden";
  };

  window.closeGalleryModal = function () {
    const modal = document.getElementById("gallery-modal");
    if (!modal) return;
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
  };

  // Close modal when clicking outside (on the backdrop)
  document.addEventListener("DOMContentLoaded", function () {
    const backdrop = document.getElementById("gallery-modal-backdrop");
    const modal = document.getElementById("gallery-modal");
    const modalContent = document.getElementById("gallery-modal-content");

    if (backdrop && modal && modalContent) {
      backdrop.addEventListener("click", function (e) {
        if (e.target === backdrop) {
          window.closeGalleryModal();
        }
      });
    }
  });

  function renderGalleryGrid(list) {
    const grid = document.getElementById("gallery-grid");
    if (!grid) return;
    if (!list || list.length === 0) {
      grid.innerHTML = `<div class="text-gray-400 p-4">No results.</div>`;
      return;
    }

    grid.innerHTML = list
      .map(
        (b) => `
          <div onclick="(function(){window.updateStage('${b.id}', true); window.closeGalleryModal();})()" class="bg-white border border-gray-100 p-4 rounded-md cursor-pointer hover:shadow-lg transition-all">
            <div class="h-40 flex items-center justify-center mb-3">
              <img src="${b.image}" class="h-full w-auto object-contain pointer-events-none" />
            </div>
            <h4 class="font-black uppercase text-[90%] text-center">${b.model}</h4>
            <p class="text-[80%] text-gray-400 text-center mt-1">${b.plates} Plates | ${b.ah} AH</p>
          </div>`,
      )
      .join("");
  }

  // Wire the View All button if present
  const viewAllBtn = document.getElementById("view-all-btn");
  if (viewAllBtn) {
    viewAllBtn.addEventListener("click", () => openGalleryModal(lastFiltered.length ? lastFiltered : batteryData));
  }

  // --- SUGGESTIONS LOGIC ---
  window.updateSuggestions = function (term) {
    if (!suggestionsBox) return;
    if (term.length < 1) {
      suggestionsBox.classList.add("hidden");
      return;
    }

    const matches = batteryData.filter((b) => getBatterySearchText(b).includes(term)).slice(0, 6);

    if (matches.length > 0) {
      suggestionsBox.innerHTML = matches
        .map(
          (m) => `
                <div onclick="selectSuggestion('${m.model}')" class="p-4 hover:bg-gray-50 cursor-pointer flex justify-between border-b border-gray-100">
                    <div class="flex flex-col">
                        <span class="font-black text-[100%] uppercase">${m.model}</span>
                        <span class="text-[80%] text-gray-400 font-bold uppercase">${m.plates} Plates</span>
                    </div>
                    <span class="text-[100%] text-[#c00d1e] font-black">${m.ah} AH</span>
                </div>`,
        )
        .join("");
      suggestionsBox.classList.remove("hidden");
    } else {
      suggestionsBox.classList.add("hidden");
    }
  };

  window.selectSuggestion = function (name) {
    const searchInput = document.getElementById("batterySearch");
    const suggestionsBox = document.getElementById("search-suggestions");
    const clearBtn = document.getElementById("clearSearch");

    if (searchInput) searchInput.value = name;
    if (suggestionsBox) suggestionsBox.classList.add("hidden");
    if (clearBtn) clearBtn.classList.remove("hidden");

    const selectedBattery = batteryData.find((b) => b.model === name);

    if (selectedBattery) {
      window.updateStage(selectedBattery.id, true);
    }
    applyFilters();
  };

  // Setup Stage Compare Button
  const stageBtn = document.getElementById("stage-compare-btn");
  if (stageBtn) {
    stageBtn.onclick = () => {
      if (currentBatteryId) window.openCompareSelection(currentBatteryId);
    };
  }

  // Initial Render — ensure we render using the same filtered/sorted logic
  applyFilters();
  // Find the battery with the lowest numeric model number to display first
  const firstBySort = [...batteryData].sort((a, b) => {
    const numA = parseInt(a.model.match(/\d+/)?.[0] || 0);
    const numB = parseInt(b.model.match(/\d+/)?.[0] || 0);
    return numA - numB;
  })[0];
  if (firstBySort) {
    window.updateStage(firstBySort.id);
  }

  // --- BANNER CAROUSEL ---
  const heroCarousel = document.querySelector(".hero-carousel");
  const heroTrack = document.getElementById("hero-carousel-track");
  const textBox = document.getElementById("hero-text-box");
  const filterButtons = document.querySelectorAll(".filter-btn");

  const contentMap = {
    All: {
      img: "assets/solutions/solutions-hero.webp",
      mobile_img: "assets/solutions/mobile/solutions-hero-mobile.webp",
      title: 'Dry <span class="text-[#c00d1e]">Charge</span>',
    },
    Automotive: {
      img: "assets/solutions/automotive.webp",
      mobile_img: "assets/solutions/mobile/automotive-mobile.webp",
      title: "Automotive",
    },
    Solar: {
      img: "assets/solutions/solar.webp",
      mobile_img: "assets/solutions/mobile/solar-mobile.webp",
      title: "Solar",
    },
    Industrial: {
      img: "assets/solutions/industrial.webp",
      mobile_img: "assets/solutions/mobile/industrial-mobile.webp",
      title: "Industrial",
    },
    "Deep-Cycle": {
      img: "assets/solutions/deep-cycle.webp",
      mobile_img: "assets/solutions/mobile/deep-cycle-mobile.webp",
      title: "Deep Cycle",
    },
  };

  const heroCategories = ["All", "Automotive", "Solar", "Industrial", "Deep-Cycle"];
  const heroSlides = heroCategories.map((category) => ({ category, ...contentMap[category] }));
  let autoScrollInterval = null;
  let currentIndex = 0;
  let slideCount = heroSlides.length;
  let autoScrollEnabled = true;

  function triggerAnimations() {
    // Animation removed - keeping simple and clean
  }

  function renderHeroCarousel() {
    if (!heroTrack) return;

    const slides = [...heroSlides, heroSlides[0]];
    heroTrack.innerHTML = slides
      .map((slide, index) => {
        const containClass = slide.category === "Deep-Cycle" ? "hero-slide--contain" : "";
        const imgClass = slide.category === "Deep-Cycle" ? "object-contain" : "object-cover";
        const isMobile = window.innerWidth <= 640;
        const src = isMobile ? slide.mobile_img || slide.img : slide.img;
        const firstImageId = index === 0 ? ' id="hero-banner-img"' : "";

        return `
          <article class="hero-slide ${containClass}" data-category="${slide.category}">
            <img${firstImageId} src="${src}" data-desktop="${slide.img}" data-mobile="${slide.mobile_img}" alt="${slide.category} banner" class="hero-slide-img ${imgClass}" />
          </article>
        `;
      })
      .join("");

    slideCount = heroSlides.length;
  }

  function syncHeroTitle(cat) {
    const data = contentMap[cat] || contentMap.All;
    const heroTitle = document.getElementById("hero-title");
    if (heroTitle) heroTitle.innerHTML = data.title;

    if (textBox) {
      textBox.classList.toggle("hero-text-box--contain", cat === "Deep-Cycle");
    }
  }

  function updateHeroPosition(index, animate = true) {
    if (!heroTrack || !slideCount) return;

    currentIndex = index;
    heroTrack.style.transition = animate ? "transform 700ms ease-in-out" : "none";
    heroTrack.style.transform = `translateX(-${index * 100}%)`;

    const activeCategory = heroSlides[index % heroSlides.length]?.category || "All";
    syncHeroTitle(activeCategory);

    if (!animate) {
      heroTrack.offsetHeight;
    }
  }

  function stopAutoScroll() {
    autoScrollEnabled = false;
    if (heroCarousel) heroCarousel.classList.add("is-paused");
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      autoScrollInterval = null;
    }
  }

  function startAutoScroll() {
    autoScrollEnabled = true;
    if (heroCarousel) heroCarousel.classList.remove("is-paused");

    if (autoScrollInterval) clearInterval(autoScrollInterval);
    autoScrollInterval = setInterval(() => {
      if (!autoScrollEnabled) return;
      updateHeroPosition(currentIndex + 1, true);
    }, 3200);
  }

  function updateHero(cat) {
    const category = contentMap[cat] ? cat : "All";
    const targetIndex = heroCategories.indexOf(category);

    if (targetIndex >= 0) {
      updateHeroPosition(targetIndex, true);
      syncHeroTitle(category);
    }

    if (category === "All") {
      startAutoScroll();
    } else {
      stopAutoScroll();
    }
  }

  if (heroTrack) {
    heroTrack.addEventListener("transitionend", () => {
      if (currentIndex === slideCount) {
        updateHeroPosition(0, false);
      }
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const category = this.getAttribute("data-cat");
      updateHero(category);
      applyFilters();
    });
  });

  renderHeroCarousel();

  const initialHash = window.location.hash ? window.location.hash.substring(1) : "";
  if (initialHash && contentMap[initialHash]) {
    document.querySelector(".filter-btn.active")?.classList.remove("active");
    const targetBtn = document.querySelector(`.filter-btn[data-cat="${initialHash}"]`);
    if (targetBtn) targetBtn.classList.add("active");

    try {
      updateHero(initialHash);
    } catch (e) {}
    try {
      applyFilters();
    } catch (e) {}
  } else {
    startAutoScroll();
    updateHeroPosition(0, false);
  }

  // Start UI
  triggerAnimations();
});

// --- MODAL & COMPARISON LOGIC ---

window.openCompareSelection = function (firstId) {
  compareSelectingFirst = false;
  compareFirstId = firstId;
  const firstBattery = batteryData.find((b) => b.id === firstId);
  const modal = document.getElementById("compare-modal");

  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    document.getElementById("compare-render-area").innerHTML = `
        <div class="max-w-5xl mx-auto">
          <h3 class="text-lg sm:text-xl md:text-2xl font-black uppercase mb-4 sm:mb-6 tracking-tight text-black">Compare Batteries</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-6">
            <div class="bg-gray-50 border border-gray-200 rounded-md p-3 sm:p-4">
              <p class="text-[10px] sm:text-xs md:text-sm font-black uppercase text-black mb-2">Compare With</p>
              <div class="relative">
                <input type="text" id="modalSearchFirst" value="${firstBattery.model}" oninput="compareSelectingFirst = true; filterModalList();"
                  onfocus="compareSelectingFirst = true;" placeholder="Enter model name" autofocus
                  class="w-full bg-white border border-gray-200 rounded-md py-2 sm:py-3 px-3 sm:pl-4 pr-10 font-bold text-xs sm:text-sm uppercase text-black focus:ring-2 focus:ring-[#c00d1e] outline-none" />
                <button type="button" onclick="clearCompareSearch('first')"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-[#c00d1e]">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
              <p class="text-[9px] sm:text-[10px] text-black italic mt-2">Edit to change selected model</p>
            </div>
            <div class="bg-gray-50 border border-gray-200 rounded-md p-3 sm:p-4">
              <p class="text-[10px] sm:text-xs md:text-sm font-black uppercase text-black mb-2">Compare With</p>
              <div class="relative">
                <input type="text" id="modalSearchSecond" oninput="compareSelectingFirst = false; filterModalList();" onfocus="compareSelectingFirst = false;"
                  placeholder="Enter model name to compare"
                  class="w-full bg-white border border-gray-200 rounded-md py-2 sm:py-3 px-3 sm:pl-4 pr-10 font-bold text-xs sm:text-sm uppercase focus:ring-2 focus:ring-[#c00d1e] outline-none" />
                <button type="button" onclick="clearCompareSearch('second')"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-[#c00d1e]">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
              <p class="text-[9px] sm:text-[10px] text-black italic mt-2">Please enter model name to compare</p>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <div class="bg-white border border-gray-200 rounded-md p-3 sm:p-6 text-center">
              <p class="text-xs sm:text-sm md:text-base font-black uppercase text-black mb-2 sm:mb-3">${firstBattery.model}</p>
              <img src="${firstBattery.image}" class="h-24 sm:h-40 md:h-52 mx-auto object-contain" alt="${firstBattery.model}">
            </div>
            <div class="bg-white border border-gray-200 rounded-md p-3 sm:p-6 text-center">
              <p class="text-xs sm:text-sm md:text-base font-black uppercase text-black mb-2 sm:mb-3">Select to compare</p>
              <div class="h-24 sm:h-40 md:h-52 mx-auto border border-dashed border-gray-300 rounded-md flex items-center justify-center text-[10px] sm:text-xs uppercase text-black">
                Waiting for selection
              </div>
            </div>
          </div>
          <div id="modal-list-results" class="space-y-2 max-h-[40vh] overflow-y-auto pr-1"></div>
        </div>
      `;
    filterModalList();
  }
};

window.filterModalList = function () {
  const inputId = compareSelectingFirst ? "modalSearchFirst" : "modalSearchSecond";
  const term = document.getElementById(inputId)?.value.toLowerCase().trim() || "";
  const listArea = document.getElementById("modal-list-results");
  if (!listArea) return;

  const matches = compareSelectingFirst
    ? batteryData.filter((b) => getBatterySearchText(b).includes(term))
    : batteryData.filter((b) => b.id !== compareFirstId && getBatterySearchText(b).includes(term));

  listArea.innerHTML = matches
    .map(
      (b) => `
        <div onclick="${compareSelectingFirst ? `selectFirstForCompare('${b.id}')` : `executeComparison('${b.id}')`}" class="flex items-center justify-between p-2 sm:p-3 bg-white border border-gray-100 rounded-md cursor-pointer hover:border-[#c00d1e] transition-all group">
            <div class="flex items-center gap-2 sm:gap-3">
                <img src="${b.image}" class="h-6 sm:h-8 w-auto object-contain pointer-events-none">
                <div>
                    <p class="font-black text-xs sm:text-sm uppercase leading-tight">${b.model}</p>
              <p class="text-[10px] sm:text-xs text-black font-bold uppercase">${b.plates} Plates</p>
                </div>
            </div>
          <span class="text-xs sm:text-sm font-black text-black group-hover:text-[#c00d1e]">${b.ah} AH</span>
        </div>
    `,
    )
    .join("");
};

window.clearCompareSearch = function (which) {
  const isFirst = which === "first";
  compareSelectingFirst = isFirst;
  const inputId = isFirst ? "modalSearchFirst" : "modalSearchSecond";
  const input = document.getElementById(inputId);
  if (input) {
    input.value = "";
    input.focus();
  }
  filterModalList();
};

window.selectFirstForCompare = function (firstId) {
  compareSelectingFirst = false;
  window.openCompareSelection(firstId);
};

window.executeComparison = function (secondId) {
  const b1 = batteryData.find((x) => x.id === compareFirstId);
  const b2 = batteryData.find((x) => x.id === secondId);

  // Helper function to format dimensions
  const formatDimensions = (b) => {
    if (b.dimensions) {
      const d = b.dimensions;
      return `${d.l} × ${d.w} × ${d.h} ${d.unit}`;
    }
    return "--";
  };

  // Helper function to format weight
  const formatWeight = (b) => {
    return b.weightKg ? `${b.weightKg} kg` : "--";
  };

  const specs = [
    { l: "Plates", k: "plates" },
    { l: "Voltage", k: "p", s: "V" },
    { l: "Ampere", k: "ah", s: " AH" },
    { l: "Warranty", k: "warranty" },
    { l: "Battery Box Size (JIS)", k: "boxSize" },
    { l: "Dimensions (L×W×H)", v: formatDimensions },
    { l: "Weight", v: formatWeight },
    { l: "Uses", v: (b) => getUsesText(b.uses) },
  ];

  document.getElementById("compare-render-area").innerHTML = `
      <div class="max-w-6xl mx-auto">
        <button onclick="openCompareSelection('${compareFirstId}')" class="mb-4 sm:mb-6 text-xs sm:text-sm font-black uppercase text-black hover:text-[#c00d1e] flex items-center gap-2 transition-colors">
          <i class="fa-solid fa-arrow-left"></i> Change Selection
        </button>
        
        <h3 class="text-lg sm:text-2xl font-black uppercase mb-2 text-center">Battery Comparison</h3>

        <!-- Two Column Layout: Battery Images -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10em;" class="battery-compare-grid sm:gap-2 md:gap-8">
          <!-- Battery 1 -->
          <div style="text-align: center; background: white;">
            <div style="display: flex; align-items: center; justify-content: center; height: 250px;" class="sm:h-60 md:h-80">
              <img src="${b1.image}" class="object-contain" style="max-height: 100%; max-width: 100%;" alt="${b1.model}">
            </div>
          </div>

          <!-- Battery 2 -->
          <div style="text-align: center; background: white;">
            <div style="display: flex; align-items: center; justify-content: center; height: 250px;" class="sm:h-60 md:h-80">
              <img src="${b2.image}" class="object-contain" style="max-height: 100%; max-width: 100%;" alt="${b2.model}">
            </div>
          </div>
        </div>

        <!-- Specs Table -->
        <div style="border: 1px solid #e5e7eb; border-radius: 0.5rem; overflow: hidden; width:100%; margin:0;" class="battery-compare-specs">
          <!-- Header Row -->
          <div style="display: grid; grid-template-columns: 1fr 0.5fr 1fr; background-color: #c00d1e; border-bottom: 2px solid #e5e7eb;" class="specs-grid specs-header">
            <div style="padding: 0.5rem; display:flex; align-items:center; justify-content:center;" class="sm:padding: 0.75rem;">
              <h4 class="text-xs sm:text-lg font-bold uppercase text-white">${b1.model}</h4>
            </div>
            <div style="padding: 0.5rem; display:flex; align-items:center; justify-content:center;" class="sm:padding: 0.75rem;">
              <p class="text-xs sm:text-lg font-bold uppercase text-white">Specs</p>
            </div>
            <div style="padding: 0.5rem; display:flex; align-items:center; justify-content:center;" class="sm:padding: 0.75rem;">
              <h4 class="text-xs sm:text-lg font-bold uppercase text-white">${b2.model}</h4>
            </div>
          </div>

          <!-- Specs Rows -->
          ${specs
            .map((s, i) => {
              const val1 = s.v ? s.v(b1) : b1[s.k];
              const val2 = s.v ? s.v(b2) : b2[s.k];
              const displayVal1 = val1 === undefined || val1 === null || val1 === "" ? "--" : `${val1}${s.s || ""}`;
              const displayVal2 = val2 === undefined || val2 === null || val2 === "" ? "--" : `${val2}${s.s || ""}`;
              const bgColor = i % 2 === 0 ? "white" : "#f3f4f6";
              const borderBottom = "1px solid #e5e7eb";
              return `
              <div style="display: grid; grid-template-columns: 1fr 0.5fr 1fr; background-color: ${bgColor}; border-bottom: ${borderBottom};" class="specs-grid">
                <div style="padding: 0.5rem; display:flex; align-items:center; justify-content:center;" class="sm:padding: 0.75rem;">
                  <span class="text-xs sm:text-sm font-normal text-gray-500">${displayVal1}</span>
                </div>
                <div style="padding: 0.5rem; display:flex; align-items:center; justify-content:center;" class="sm:padding: 0.75rem;">
                  <span class="text-xs sm:text-xs font-semibold uppercase text-gray-600">${s.l}</span>
                </div>
                <div style="padding: 0.5rem; display:flex; align-items:center; justify-content:center;" class="sm:padding: 0.75rem;">
                  <span class="text-xs sm:text-sm font-normal text-gray-500">${displayVal2}</span>
                </div>
              </div>`;
            })
            .join("")}
        </div>

        <!-- Compare modal divider/wrapping styles -->
        <style>
          /* Desktop: draw single vertical dividers using the first and third cell borders to avoid double lines */
          .battery-compare-specs .specs-grid > div { box-sizing: border-box; }
          .battery-compare-specs .specs-grid > div:nth-child(1) { border-right: 1px solid #e5e7eb; }
          .battery-compare-specs .specs-grid > div:nth-child(2) { border-left: none; border-right: none; }
          .battery-compare-specs .specs-grid > div:nth-child(3) { border-left: 1px solid #e5e7eb; }

          /* Ensure each row draws its bottom line consistently */
          .battery-compare-specs .specs-grid { border-bottom: 1px solid #e5e7eb; }

          /* Typography: allow wrapping and center alignment; use responsive sizing */
          .battery-compare-specs .specs-grid span,
          .battery-compare-specs .specs-grid p,
          .battery-compare-specs .specs-grid h4 {
            word-break: break-word;
            overflow-wrap: anywhere;
            white-space: normal;
            text-align: center;
            line-height: 1.2;
          }

          /* Mobile adjustments: reduce padding and font sizes on very small screens */
          @media (max-width: 480px) {
            .battery-compare-grid { grid-template-columns: 1fr 1fr !important; gap: 0.25rem !important; }
            .specs-grid { grid-template-columns: 1fr 1fr 1fr !important; }
            .battery-compare-specs .specs-grid > div { border-left: none !important; border-right: none !important; padding: 0.25rem !important; }
            .battery-compare-specs .specs-grid > div:nth-child(2) { border-left: 1px solid #e5e7eb !important; border-right: 1px solid #e5e7eb !important; }
            .battery-compare-specs { padding: 0.125rem; }
            .battery-compare-specs .specs-grid span,
            .battery-compare-specs .specs-grid p,
            .battery-compare-specs .specs-grid h4 { font-size: 0.7rem !important; line-height: 1.1; }
          }

          /* Tablet adjustments */
          @media (min-width: 481px) and (max-width: 768px) {
            .battery-compare-grid { grid-template-columns: 1fr 1fr !important; gap: 0.5rem !important; }
            .specs-grid { grid-template-columns: 1fr 1fr 1fr !important; }
            .battery-compare-specs .specs-grid > div { border-left: none !important; border-right: none !important; }
            .battery-compare-specs .specs-grid > div:nth-child(2) { border-left: 1px solid #e5e7eb !important; border-right: 1px solid #e5e7eb !important; }
            .battery-compare-specs { padding-left: 0.25rem; padding-right: 0.25rem; }
          }

          /* Desktop: standard sizing */
          @media (min-width: 769px) {
            .battery-compare-specs .specs-grid span,
            .battery-compare-specs .specs-grid p,
            .battery-compare-specs .specs-grid h4 { font-size: 0.95rem; }
            .battery-compare-specs .specs-grid h4 { font-size: 1.05rem; }
          }
        </style>
        </div>
      </div>
    `;
};

window.closeCompareModal = () => {
  const modal = document.getElementById("compare-modal");
  if (modal) modal.classList.remove("active");
  document.body.style.overflow = "auto";
};

// FIX: CLICK OUTSIDE MODAL TO CLOSE
window.addEventListener("click", (e) => {
  const compareModal = document.getElementById("compare-modal");
  if (compareModal && compareModal.classList.contains("active") && e.target === compareModal.firstElementChild) {
    window.closeCompareModal();
  }
});

window.scrollCatalog = function (direction) {
  setCatalogPage(catalogPageIndex + direction, true);
};

function setCatalogPage(nextIndex, animate = true) {
  const grid = document.getElementById("thumb-grid");
  if (!grid || catalogPageCount === 0) return;

  const normalizedIndex = ((nextIndex % catalogPageCount) + catalogPageCount) % catalogPageCount;
  catalogPageIndex = normalizedIndex;
  grid.style.transition = animate ? "transform 600ms ease" : "none";
  grid.style.transform = `translateX(-${catalogPageIndex * 100}%)`;

  const prevBtn = document.getElementById("catalog-prev");
  const nextBtn = document.getElementById("catalog-next");
  if (prevBtn) prevBtn.disabled = catalogPageCount <= 1;
  if (nextBtn) nextBtn.disabled = catalogPageCount <= 1;

  if (!animate) {
    grid.offsetHeight;
  }
}

function chunkProducts(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

// Function to render the catalog grid
function renderGrid(products) {
  const grid = document.getElementById("thumb-grid");
  if (!grid) return;

  const pages = chunkProducts(products, 8);
  catalogPageCount = Math.max(pages.length, 1);
  catalogPageIndex = 0;

  grid.innerHTML = pages
    .map((page) => {
      return `
        <div class="catalog-page">
          ${page
            .map(
              (product) => `
                <article class="catalog-card group" data-id="${product.id}">
                  <button type="button" class="catalog-card__button" onclick="window.updateStage('${product.id}', true)">
                    <div class="catalog-card__media">
                      <img src="${product.image}" alt="${product.model}" class="catalog-card__image">
                    </div>
                    <h4 class="catalog-card__title">${product.model}</h4>
                    <p class="catalog-card__meta">${product.ah} AH</p>
                  </button>
                </article>
              `,
            )
            .join("")}
        </div>
      `;
    })
    .join("");

  setCatalogPage(0, false);
}

// THE INITIALIZER
function initDryCharge() {
  // 1. Use 'batteryData' (matching your data.js)
  if (typeof batteryData !== "undefined") {
    // 2. Since your data doesn't have a "series" field yet,
    // let's show all batteries for now to get the grid working.
    const dryChargeModels = batteryData;

    renderGrid(dryChargeModels);

    // 3. Update the Stage with the first battery
    if (dryChargeModels.length > 0) {
      updateStage(dryChargeModels[0]);
    }

    console.log("Grid initialized with", dryChargeModels.length, "models.");
  } else {
    console.error("batteryData is missing from data.js");
  }
}
// Run after a short delay to allow component injection
window.addEventListener("load", () => {
  setTimeout(initDryCharge, 300);
});
