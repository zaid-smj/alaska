// Blog data structure
const blogs = Array.isArray(window.ALASKA_CONTENT?.articles) ? window.ALASKA_CONTENT.articles : [];

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

  const mobile = document.getElementById("mobile-blog-container");
  if (mobile) mobile.style.display = totalCount === 0 ? "none" : "";
  const empty = document.getElementById("articles-empty");
  if (empty) empty.hidden = totalCount !== 0;
  const controls = document.getElementById("blog-scroll-controls");
  if (controls) controls.style.display = totalCount === 0 ? "none" : "";
  if (!featureImg || !leftImg || !rightImg || totalCount === 0) return;

  // Set feature image with smooth fade
  const featureBlog = filteredBlogs[currentMobileBlogIndex];
  featureImg.classList.add("is-fading");
  requestAnimationFrame(() => {
    featureImg.src = featureBlog.mobileImg || featureBlog.img;
    featureImg.alt = featureBlog.alt || featureBlog.title;
    featureImg.onerror = () => (featureImg.src = "https://placehold.co/600x800/111/fff?text=Image");
    featureImg.onload = () => featureImg.classList.remove("is-fading");
  });

  // Update text overlays
  if (featureTitle) {
    featureTitle.textContent = filteredBlogs[currentMobileBlogIndex].title;
  }

  if (featureCategory) featureCategory.textContent = filteredBlogs[currentMobileBlogIndex].category;

  // Set left/right images
  const prevIndex = (currentMobileBlogIndex - 1 + totalCount) % totalCount;
  const nextIndex = (currentMobileBlogIndex + 1) % totalCount;

  leftImg.classList.add("is-fading");
  rightImg.classList.add("is-fading");

  const prevBlog = filteredBlogs[prevIndex];
  const nextBlog = filteredBlogs[nextIndex];
  requestAnimationFrame(() => {
    leftImg.src = prevBlog.mobileImg || prevBlog.img;
    leftImg.alt = prevBlog.alt || prevBlog.title;
    rightImg.src = nextBlog.mobileImg || nextBlog.img;
    rightImg.alt = nextBlog.alt || nextBlog.title;

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
    updateMobileBlog();
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
