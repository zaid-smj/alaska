// Blog data structure
const blogs = [
  {
    id: "choosing-guide",
    img: "assets/vault/blogs/best-battery-blog-1.webp",
    mobileImg: "assets/vault/blogs/mobile/best-battery-blog-1-mobile.webp",
    category: "Guide",
    title: "Best Battery for Vehicle or Solar",
  },
  {
    id: "eid-checklist",
    img: "assets/vault/blogs/eid-blog-2.webp",
    mobileImg: "assets/vault/blogs/mobile/eid-blog-2-mobile.webp",
    category: "Travel",
    title: "Eid Travel Readiness Checklist",
  },
  {
    id: "power-saving",
    img: "assets/vault/blogs/power-blog-3.webp",
    mobileImg: "assets/vault/blogs/mobile/power-blog-3-mobile.webp",
    category: "Maintenance",
    title: "5 Power-Saving Secrets",
  },
  {
    id: "ebike-accessories",
    img: "assets/vault/blogs/summer-blog-6.webp",
    mobileImg: "assets/vault/blogs/mobile/summer-blog-6-mobile.webp",
    category: "E-Bike Guide",
    title: "Battery Survival Guide for Pakistani Summers",
  },
  {
    id: "ebike-repairs",
    img: "assets/vault/blogs/storing-blog-4.webp",
    mobileImg: "assets/vault/blogs/mobile/storing-blog-4-mobile.webp",
    category: "E-Bike Repair",
    title: "Maximize Battery Life: Charging & Storage Guide",
  },
  {
    id: "ebike-charging",
    img: "assets/vault/blogs/recycle-blog-5.webp",
    mobileImg: "assets/vault/blogs/mobile/recycle-blog-5-mobile.webp",
    category: "Eco-friendly",
    title: "Battery Lifespan: Recycling & Responsible Disposal",
  },
];

let currentMobileBlogIndex = 0;
let filteredBlogs = [...blogs]; // Track filtered results

function updateMobileBlog() {
  const featureImg = document.getElementById("mobile-feature-blog-img");
  const leftImg = document.getElementById("mobile-left-blog-img");
  const rightImg = document.getElementById("mobile-right-blog-img");
  const featureCategory = document.getElementById("mobile-feature-category");
  const featureTitle = document.getElementById("mobile-feature-title");
  const dotsContainer = document.getElementById("mobile-blog-dots");

  const totalCount = filteredBlogs.length;

  if (!featureImg || !leftImg || !rightImg || totalCount === 0) return;

  // Set feature image with smooth fade
  featureImg.classList.add("is-fading");
  requestAnimationFrame(() => {
    const featureBlog = filteredBlogs[currentMobileBlogIndex];
    featureImg.src = featureBlog.mobileImg || featureBlog.img;
    featureImg.onerror = () => (featureImg.src = "https://placehold.co/600x800/111/fff?text=Image");
    featureImg.onload = () => featureImg.classList.remove("is-fading");
  });

  // Update text overlays
  if (featureTitle) {
    featureTitle.textContent = filteredBlogs[currentMobileBlogIndex].title;
  }

  // Set left/right images
  const prevIndex = (currentMobileBlogIndex - 1 + totalCount) % totalCount;
  const nextIndex = (currentMobileBlogIndex + 1) % totalCount;

  leftImg.classList.add("is-fading");
  rightImg.classList.add("is-fading");

  requestAnimationFrame(() => {
    const prevBlog = filteredBlogs[prevIndex];
    const nextBlog = filteredBlogs[nextIndex];
    leftImg.src = prevBlog.mobileImg || prevBlog.img;
    rightImg.src = nextBlog.mobileImg || nextBlog.img;

    leftImg.onerror = () => (leftImg.src = "https://placehold.co/400x600/111/fff?text=Image");
    rightImg.onerror = () => (rightImg.src = "https://placehold.co/400x600/111/fff?text=Image");

    leftImg.onload = () => leftImg.classList.remove("is-fading");
    rightImg.onload = () => rightImg.classList.remove("is-fading");
  });

  // Update dot indicators
  updateBlogDots();
}

function updateBlogDots() {
  const dotsContainer = document.getElementById("mobile-blog-dots");
  const totalCount = filteredBlogs.length;

  if (!dotsContainer) return;

  // Generate dots if not already created or if count changed
  if (dotsContainer.children.length !== totalCount) {
    dotsContainer.innerHTML = "";
    for (let i = 0; i < totalCount; i++) {
      const dot = document.createElement("div");
      dot.className = "w-2 h-2 rounded-full transition-all duration-300";
      dot.style.backgroundColor = i === currentMobileBlogIndex ? "#c00d1e" : "#d1d5db";
      dotsContainer.appendChild(dot);
    }
  } else {
    // Update existing dots
    Array.from(dotsContainer.children).forEach((dot, i) => {
      dot.style.backgroundColor = i === currentMobileBlogIndex ? "#c00d1e" : "#d1d5db";
      dot.style.transform = i === currentMobileBlogIndex ? "scale(1.3)" : "scale(1)";
    });
  }
}

function mobileNextBlog() {
  const totalCount = filteredBlogs.length;
  if (totalCount === 0) return;
  currentMobileBlogIndex = (currentMobileBlogIndex + 1) % totalCount;
  updateMobileBlog();
}

function mobilePrevBlog() {
  const totalCount = filteredBlogs.length;
  if (totalCount === 0) return;
  currentMobileBlogIndex = (currentMobileBlogIndex - 1 + totalCount) % totalCount;
  updateMobileBlog();
}

function handleMobileBlogClick(offset) {
  // Ignore click if it happened right after a swipe
  if (Date.now() - lastBlogSwipeTime < 300) {
    return;
  }

  const totalCount = filteredBlogs.length;
  if (totalCount === 0) return;
  let clickedIndex = currentMobileBlogIndex + offset;
  clickedIndex = ((clickedIndex % totalCount) + totalCount) % totalCount;

  // Open the blog modal for the clicked blog
  const blog = filteredBlogs[clickedIndex];
  openBlogModal(blog.id);
}

// Search/filter function for both mobile and desktop views
function filterBlogs() {
  const searchInput = document.getElementById("blog-search");
  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";

  // Filter blogs based on search term
  filteredBlogs = blogs.filter((blog) => {
    const categoryMatch = blog.category.toLowerCase().includes(searchTerm);
    const titleMatch = blog.title.toLowerCase().includes(searchTerm);
    return categoryMatch || titleMatch;
  });

  // Desktop: Show/hide blog cards
  const blogItems = document.querySelectorAll(".blog-item.original");
  blogItems.forEach((item) => {
    const blogText = item.textContent.toLowerCase();
    const category = Array.from(item.querySelectorAll(".category-tag"))
      .map((el) => el.textContent)
      .join(" ")
      .toLowerCase();
    const title = item.querySelector(".blog-title")?.textContent.toLowerCase() || "";
    const categoryMatch = category.includes(searchTerm);
    const titleMatch = title.includes(searchTerm);
    const matches = categoryMatch || titleMatch || blogText.includes(searchTerm);
    item.style.display = matches ? "" : "none";
  });

  // Mobile: Reset to first filtered result and update carousel
  if (filteredBlogs.length > 0) {
    currentMobileBlogIndex = 0;
    updateMobileBlog();
  } else {
    // Clear dots if no results
    const dotsContainer = document.getElementById("mobile-blog-dots");
    if (dotsContainer) dotsContainer.innerHTML = "";
  }
}

// Desktop blog scroll function
function scrollBlogs(direction) {
  const blogContainer = document.getElementById("blog-scroll-container");
  if (!blogContainer) return;

  const scrollAmount = 320; // Approximate width of one blog card + gap
  const newScrollPosition = blogContainer.scrollLeft + direction * scrollAmount;

  blogContainer.scrollTo({
    left: newScrollPosition,
    behavior: "smooth",
  });
}

/**
 * Mobile Blog Swipe Support
 */
let lastBlogSwipeTime = 0;

function initMobileBlogSwipe() {
  const featureContainer = document.getElementById("mobile-feature-blog");
  const leftContainer = document.getElementById("mobile-left-blog");
  const rightContainer = document.getElementById("mobile-right-blog");

  if (!featureContainer) return;

  // Helper function to add swipe listeners
  const addSwipeListeners = (container) => {
    let touchStartX = 0;
    let touchEndX = 0;
    let isSwiping = false;

    container.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
        isSwiping = false;
      },
      { passive: true },
    );

    container.addEventListener(
      "touchmove",
      (e) => {
        const touchCurrentX = e.changedTouches[0].screenX;
        const delta = Math.abs(touchStartX - touchCurrentX);

        // If moved more than 10px, consider it a swipe
        if (delta > 10) {
          isSwiping = true;
        }
      },
      { passive: true },
    );

    container.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const delta = touchStartX - touchEndX;

      // If it was a swipe (moved > 50px)
      if (isSwiping && Math.abs(delta) > 50) {
        e.preventDefault();
        e.stopPropagation();

        lastBlogSwipeTime = Date.now();

        if (delta > 0) {
          // Swiped left - go to next blog
          mobileNextBlog();
        } else {
          // Swiped right - go to previous blog
          mobilePrevBlog();
        }
      }
    });
  };

  // Add swipe to all three containers
  addSwipeListeners(featureContainer);
  if (leftContainer) addSwipeListeners(leftContainer);
  if (rightContainer) addSwipeListeners(rightContainer);
}

// Initialize mobile blog view on page load
document.addEventListener("DOMContentLoaded", () => {
  updateMobileBlog();
  initMobileBlogSwipe();
});
