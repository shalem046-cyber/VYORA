/* =========================================================
   VYORA — FRONTEND PROTOTYPE ENGINE
   Real APIs are NOT connected.
   All intelligence below is prototype/demo behavior.
========================================================= */

"use strict";

/* ================= BASIC HELPERS ================= */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value).replace("₹", "₹");
}

/* ================= SCROLL ================= */

function scrollToPlanner() {
  const planner = document.getElementById("planner");

  if (planner) {
    planner.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

function scrollToExplore() {
  const explore = document.getElementById("explore");

  if (explore) {
    explore.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

/* ================= NAVBAR ================= */

function updateNavbar() {
  const navbar = document.getElementById("navbar");

  if (!navbar) return;

  navbar.classList.toggle("scrolled", window.scrollY > 25);
}

window.addEventListener("scroll", updateNavbar);
updateNavbar();

/* ================= MOBILE MENU ================= */

function toggleMenu() {
  const menu = document.getElementById("mobileMenu");

  if (!menu) return;

  menu.classList.toggle("open");
}

function closeMobileMenu() {
  const menu = document.getElementById("mobileMenu");

  if (menu) {
    menu.classList.remove("open");
  }
}

/* ================= ACTIVE NAVIGATION ================= */

const navSections = [
  { id: "explore" },
  { id: "planner" },
  { id: "hotels" },
  { id: "experiences" }
];

function updateActiveNavigation() {
  const scrollPosition = window.scrollY + 180;

  let currentSection = "explore";

  navSections.forEach(section => {
    const element = document.getElementById(section.id);

    if (element && scrollPosition >= element.offsetTop) {
      currentSection = section.id;
    }
  });

  $$(".nav-link").forEach(link => {
    link.classList.toggle(
      "active",
      link.getAttribute("href") === `#${currentSection}`
    );
  });
}

window.addEventListener("scroll", updateActiveNavigation);
updateActiveNavigation();

/* ================= INTERESTS ================= */

function toggleInterest(button) {
  if (!button) return;

  button.classList.toggle("active");
}

/* ================= DESTINATION PREFILL ================= */

function prefillDestination(destination) {

  const searchInput = document.getElementById("destinationInput");
  const plannerInput = document.getElementById("plannerDestination");

  if (searchInput) {
    searchInput.value = destination;
  }

  if (plannerInput) {
    plannerInput.value = destination;
  }

  scrollToPlanner();

  showToast(
    "Destination selected",
    `${destination} has been added to your VYORA journey.`
  );
}

/* ================= TOP SEARCH ================= */

function generateTrip() {

  const destination =
    document.getElementById("destinationInput")?.value.trim();

  const days =
    document.getElementById("daysInput")?.value || "3";

  const budget =
    document.getElementById("budgetInput")?.value || "10000";

  if (!destination) {

    showToast(
      "Destination needed",
      "Tell VYORA where you want to go first."
    );

    document.getElementById("destinationInput")?.focus();

    return;
  }

  document.getElementById("plannerDestination").value = destination;
  document.getElementById("plannerDays").value = days;
  document.getElementById("plannerBudget").value = budget;

  scrollToPlanner();

  setTimeout(() => {
    generatePlanner();
  }, 550);
}

/* ================= AI PLANNER ================= */

let currentJourney = {
  destination: "",
  days: 3,
  budget: 10000,
  interests: []
};

function getSelectedInterests() {

  return $$(".interest.active").map(
    button => button.dataset.interest
  );

}

function generatePlanner() {

  const destination =
    document.getElementById("plannerDestination")?.value.trim();

  const days =
    Number(document.getElementById("plannerDays")?.value || 3);

  const budget =
    Number(document.getElementById("plannerBudget")?.value || 10000);

  const interests = getSelectedInterests();

  const result = document.getElementById("plannerResult");

  if (!destination) {

    showToast(
      "Destination needed",
      "Tell VYORA where you want to go first."
    );

    document.getElementById("plannerDestination")?.focus();

    return;
  }

  currentJourney = {
    destination,
    days,
    budget,
    interests
  };

  const generateButton = document.querySelector(".generate-btn");

  if (generateButton) {
    generateButton.classList.add("loading");

    generateButton.innerHTML = `
      <span>✦</span>
      <span>VYORA is thinking...</span>
      <span>•</span>
    `;
  }

  if (result) {

    result.className = "planner-result visible";

    result.innerHTML = `
      <div class="ai-thinking">
        <span>✦</span>
        <div>
          <strong>Understanding your preferences...</strong>
          <div class="thinking-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    `;

  }

  const processingSteps = [
    "Finding the best experiences...",
    "Optimizing your route...",
    "Balancing your budget...",
    "Creating your itinerary..."
  ];

  let step = 0;

  const processingInterval = setInterval(() => {

    if (!result) return;

    if (step < processingSteps.length) {

      result.innerHTML = `
        <div class="ai-thinking">
          <span>✦</span>
          <div>
            <strong>${processingSteps[step]}</strong>
            <div class="thinking-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      `;

      step++;

    }

  }, 650);

  setTimeout(() => {

    clearInterval(processingInterval);

    if (result) {

      const interestText =
        interests.length
          ? interests.slice(0, 3).join(" · ")
          : "balanced exploration";

      result.innerHTML = `
        <strong>✦ Your ${escapeHTML(destination)} journey is ready.</strong>
        <br><br>
        <span>
          ${days} days · ${formatCurrency(budget)} budget
          · ${escapeHTML(interestText)}
        </span>
        <br><br>
        <small>
          Prototype intelligence generated this journey from your selected preferences.
          Real AI integration can replace this layer later.
        </small>
      `;

    }

    if (generateButton) {

      generateButton.classList.remove("loading");

      generateButton.innerHTML = `
        <span>✦</span>
        <span>Regenerate my journey</span>
        <span>→</span>
      `;

    }

    renderItinerary(currentJourney);
    updateBudget(currentJourney);
    updateJourneyHeader(currentJourney);

    document
      .getElementById("itinerary")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    showToast(
      "Journey ready",
      `${destination} has been intelligently arranged for you.`
    );

  }, 3200);
}

/* ================= ITINERARY ENGINE ================= */

const activityLibrary = {
  morning: [
    {
      place: "Signature viewpoint",
      description: "Start the day with a scenic introduction to the destination.",
      cost: 450,
      time: "09:00",
      travel: "20 min"
    },
    {
      place: "Local breakfast",
      description: "A relaxed breakfast featuring regional flavours.",
      cost: 280,
      time: "08:30",
      travel: "10 min"
    },
    {
      place: "Heritage walk",
      description: "Explore architecture, stories and the destination's older streets.",
      cost: 350,
      time: "09:30",
      travel: "15 min"
    }
  ],

  afternoon: [
    {
      place: "Local experience",
      description: "A curated activity built around your selected interests.",
      cost: 900,
      time: "13:00",
      travel: "25 min"
    },
    {
      place: "Hidden gem",
      description: "A quieter stop away from the standard tourist route.",
      cost: 600,
      time: "14:00",
      travel: "30 min"
    },
    {
      place: "Regional food trail",
      description: "Taste a selection of local dishes and street favourites.",
      cost: 750,
      time: "13:30",
      travel: "15 min"
    }
  ],

  evening: [
    {
      place: "Golden-hour escape",
      description: "Slow down and experience the destination around sunset.",
      cost: 500,
      time: "17:30",
      travel: "20 min"
    },
    {
      place: "Local market",
      description: "Browse local products, crafts and evening street life.",
      cost: 400,
      time: "18:00",
      travel: "15 min"
    },
    {
      place: "Signature evening",
      description: "Finish the day with a memorable destination experience.",
      cost: 700,
      time: "19:30",
      travel: "25 min"
    }
  ]
};

function pickActivity(category, index) {

  const options = activityLibrary[category];

  if (!options) {
    return activityLibrary.morning[0];
  }

  return options[index % options.length];
}

function renderItinerary(journey) {

  const timeline = document.getElementById("itineraryTimeline");

  if (!timeline) return;

  const destination = journey.destination;
  const days = journey.days;

  let html = "";

  for (let day = 1; day <= days; day++) {

    const morning = pickActivity("morning", day - 1);
    const afternoon = pickActivity("afternoon", day - 1);
    const evening = pickActivity("evening", day - 1);

    html += `
      <article class="day-card" style="animation-delay:${(day - 1) * 90}ms">

        <div class="day-header">
          <strong>DAY ${String(day).padStart(2, "0")}</strong>
          <span>${escapeHTML(destination)}</span>
        </div>

        ${createActivityHTML("Morning", morning)}
        ${createActivityHTML("Afternoon", afternoon)}
        ${createActivityHTML("Evening", evening)}

      </article>
    `;
  }

  timeline.innerHTML = html;
}

function createActivityHTML(period, activity) {

  return `
    <div class="activity">

      <div class="activity-time">
        ${period}<br>
        ${activity.time}
      </div>

      <div class="activity-info">
        <strong>${escapeHTML(activity.place)}</strong>
        <p>${escapeHTML(activity.description)}</p>
      </div>

      <div class="activity-meta">
        <strong>₹${activity.cost.toLocaleString("en-IN")}</strong>
        <span>${activity.travel} travel</span>
      </div>

    </div>
  `;
}

/* ================= JOURNEY HEADER ================= */

function updateJourneyHeader(journey) {

  const title = document.getElementById("journeyTitle");
  const meta = document.getElementById("journeyMeta");
  const score = document.getElementById("journeyScore");

  if (title) {
    title.textContent = `${journey.destination}, your way.`;
  }

  if (meta) {

    const interests =
      journey.interests.length
        ? journey.interests.slice(0, 3).join(" · ")
        : "Balanced exploration";

    meta.textContent =
      `${journey.days} days · ${formatCurrency(journey.budget)} budget · ${interests}`;

  }

  if (score) {

    const base = 87;
    const interestBonus =
      Math.min(journey.interests.length * 2, 10);

    score.textContent =
      `${Math.min(base + interestBonus, 97)}%`;

  }
}

/* ================= BUDGET ================= */

function updateBudget(journey) {

  const days = journey.days;
  const selectedBudget = journey.budget;

  const hotel = Math.round(
    selectedBudget * (days >= 7 ? .36 : .34)
  );

  const food = Math.round(
    selectedBudget * .20
  );

  const transport = Math.round(
    selectedBudget * .18
  );

  const activities = Math.round(
    selectedBudget * .17
  );

  const total = hotel + food + transport + activities;

  const budgetTotal =
    document.getElementById("budgetTotal");

  const budgetHotel =
    document.getElementById("budgetHotel");

  const budgetFood =
    document.getElementById("budgetFood");

  const budgetTransport =
    document.getElementById("budgetTransport");

  const budgetActivities =
    document.getElementById("budgetActivities");

  if (budgetTotal) {
    budgetTotal.textContent =
      formatCurrency(total);
  }

  if (budgetHotel) {
    budgetHotel.textContent =
      formatCurrency(hotel);
  }

  if (budgetFood) {
    budgetFood.textContent =
      formatCurrency(food);
  }

  if (budgetTransport) {
    budgetTransport.textContent =
      formatCurrency(transport);
  }

  if (budgetActivities) {
    budgetActivities.textContent =
      formatCurrency(activities);
  }

  animateProgress(
    "hotelProgress",
    hotel / total * 100
  );

  animateProgress(
    "foodProgress",
    food / total * 100
  );

  animateProgress(
    "transportProgress",
    transport / total * 100
  );

  animateProgress(
    "activitiesProgress",
    activities / total * 100
  );

  const percent =
    Math.min(Math.round((total / selectedBudget) * 100), 100);

  const percentElement =
    document.getElementById("budgetPercent");

  if (percentElement) {
    percentElement.textContent =
      `${percent}%`;
  }

  const ring =
    document.getElementById("budgetRing");

  if (ring) {

    ring.style.background =
      `radial-gradient(circle at center, white 58%, transparent 59%),
       conic-gradient(var(--accent) ${percent * 3.6}deg, #e6e8df ${percent * 3.6}deg)`;

  }

  const budgetNote =
    document.getElementById("budgetNote");

  if (budgetNote) {

    if (total <= selectedBudget) {

      budgetNote.textContent =
        `VYORA estimates this journey can stay within your selected ${formatCurrency(selectedBudget)} budget.`;

    } else {

      budgetNote.textContent =
        `This route may exceed your selected budget. Reduce stays or activities to optimize it.`;

    }

  }
}

function animateProgress(id, value) {

  const element = document.getElementById(id);

  if (!element) return;

  setTimeout(() => {
    element.style.width = `${value}%`;
  }, 100);

}

/* ================= SAVE / SHARE ================= */

function saveTrip() {

  if (!currentJourney.destination) {

    showToast(
      "Nothing to save yet",
      "Generate your journey first."
    );

    return;
  }

  localStorage.setItem(
    "vyoraSavedTrip",
    JSON.stringify(currentJourney)
  );

  showToast(
    "Trip saved",
    `${currentJourney.destination} is saved in this browser.`
  );
}

async function shareTrip() {

  if (!currentJourney.destination) {

    showToast(
      "Nothing to share yet",
      "Generate a journey first."
    );

    return;
  }

  const shareData = {
    title: "My VYORA Journey",
    text:
      `I'm planning a ${currentJourney.days}-day trip to ${currentJourney.destination} with VYORA.`,
    url: window.location.href
  };

  try {

    if (navigator.share) {

      await navigator.share(shareData);

    } else {

      await navigator.clipboard.writeText(
        `${shareData.text} ${shareData.url}`
      );

      showToast(
        "Journey link copied",
        "Share text has been copied to your clipboard."
      );

    }

  } catch (error) {

    if (error.name !== "AbortError") {

      showToast(
        "Sharing unavailable",
        "Your browser does not support this sharing method."
      );

    }

  }
}

/* ================= HOTEL ACTIONS ================= */

function toggleFavorite(button) {

  button.classList.toggle("favorite");

  button.textContent =
    button.classList.contains("favorite")
      ? "♥"
      : "♡";

}

function showHotelDemo(hotelName) {

  openModal(
    hotelName,
    "This is a prototype hotel experience. Real availability, room selection, booking and live pricing will require a hotel/booking API."
  );

}

/* ================= EXPERIENCES ================= */

const experienceData = {

  "Local food": {
    title: "Follow the flavour.",
    text: "VYORA can prioritize local dishes, regional cafés, street food and food trails instead of generic restaurant lists."
  },

  "Culture": {
    title: "See the culture.",
    text: "VYORA can surface festivals, crafts, traditions, museums and local stories based on a traveller's interests."
  },

  "Markets": {
    title: "Walk the market.",
    text: "Discover neighbourhood markets, crafts, local shopping streets and evening food culture."
  },

  "Hidden places": {
    title: "Go beyond the obvious.",
    text: "VYORA can recommend less crowded places and alternative experiences that better match your travel style."
  },

  "Adventure": {
    title: "Make it memorable.",
    text: "From outdoor activities to curated experiences, VYORA can prioritize adventure based on your preferred pace."
  }

};

function showExperience(type) {

  const data = experienceData[type];

  if (!data) return;

  const title =
    document.getElementById("experienceTitle");

  const text =
    document.getElementById("experienceText");

  if (title) {
    title.textContent = data.title;
  }

  if (text) {
    text.textContent = data.text;
  }

}

/* ================= MAP ================= */

function mapPin(type) {

  const descriptions = {

    Hotel:
      "Hotel intelligence layer selected.",

    Attraction:
      "Attraction discovery layer selected.",

    Experience:
      "Local experience layer selected."

  };

  showToast(
    `${type} marker`,
    `${descriptions[type]} This demo map is ready for future live map integration.`
  );

}

/* ================= ASSISTANT ================= */

function openAssistant() {

  const chatWindow =
    document.getElementById("chatWindow");

  if (!chatWindow) return;

  chatWindow.classList.add("open");

  setTimeout(() => {
    document.getElementById("chatInput")?.focus();
  }, 100);

}

function closeAssistant() {

  const chatWindow =
    document.getElementById("chatWindow");

  if (!chatWindow) return;

  chatWindow.classList.remove("open");

}

function sendSuggestedMessage(message) {

  const input =
    document.getElementById("chatInput");

  if (!input) return;

  input.value = message;

  sendMessage();

}

function sendMessage() {

  const input =
    document.getElementById("chatInput");

  const messages =
    document.getElementById("chatMessages");

  if (!input || !messages) return;

  const message =
    input.value.trim();

  if (!message) return;

  addChatMessage(
    escapeHTML(message),
    "user"
  );

  input.value = "";

  const typingId =
    `typing-${Date.now()}`;

  messages.insertAdjacentHTML(
    "beforeend",
    `
      <div class="bot-message" id="${typingId}">
        <span class="message-avatar">✦</span>
        <div class="typing-message">
          <div class="thinking-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    `
  );

  messages.scrollTop =
    messages.scrollHeight;

  setTimeout(() => {

    const typing =
      document.getElementById(typingId);

    if (typing) {
      typing.remove();
    }

    const response =
      getAssistantResponse(message);

    addChatMessage(
      response,
      "bot"
    );

  }, 850);

}

function addChatMessage(content, type) {

  const messages =
    document.getElementById("chatMessages");

  if (!messages) return;

  if (type === "user") {

    messages.insertAdjacentHTML(
      "beforeend",
      `
        <div class="user-message">
          ${content}
        </div>
      `
    );

  } else {

    messages.insertAdjacentHTML(
      "beforeend",
      `
        <div class="bot-message">
          <span class="message-avatar">✦</span>
          <div>${content}</div>
        </div>
      `
    );

  }

  messages.scrollTop =
    messages.scrollHeight;

}

function getAssistantResponse(message) {

  const text =
    message.toLowerCase();

  if (
    text.includes("goa") ||
    text.includes("beach")
  ) {

    return `
      Goa is a strong fit for beaches, food and nightlife.
      Try a balanced 3-day route with a quieter coastal morning,
      a local food experience and a sunset-focused evening.
      <br><br>
      <small>Prototype response · Real AI integration not connected.</small>
    `;

  }

  if (
    text.includes("cheaper") ||
    text.includes("budget") ||
    text.includes("cheap")
  ) {

    return `
      To reduce trip cost, VYORA would first optimize accommodation,
      then transport distance, then paid activities — while protecting
      the experiences you marked as important.
      <br><br>
      <small>Prototype response · Real optimization engine not connected.</small>
    `;

  }

  if (
    text.includes("hidden") ||
    text.includes("gem")
  ) {

    return `
      Look beyond the headline attractions.
      VYORA can prioritize quieter neighbourhoods, local markets,
      regional food and less crowded experiences.
      <br><br>
      <small>Prototype response · Local discovery API not connected.</small>
    `;

  }

  if (
    text.includes("kerala") ||
    text.includes("nature")
  ) {

    return `
      Kerala is a strong match for nature, slower travel and backwaters.
      A route could combine Kochi, a hill destination and a relaxed
      backwater experience.
      <br><br>
      <small>Prototype response · No live destination database connected.</small>
    `;

  }

  if (
    text.includes("rajasthan") ||
    text.includes("history") ||
    text.includes("culture")
  ) {

    return `
      Rajasthan works well for heritage, architecture and culture.
      VYORA would balance major landmarks with local food,
      markets and quieter heritage experiences.
      <br><br>
      <small>Prototype response · Real AI destination reasoning not connected.</small>
    `;

  }

  return `
    I understand the request, but I'm currently running in
    VYORA prototype mode. Try asking me about Goa, Kerala,
    Rajasthan, budgets, cheaper trips or hidden gems.
    <br><br>
    <small>
      Prototype response · External AI API is not connected.
    </small>
  `;

}

/* ================= MODAL ================= */

function openModal(title, text) {

  const backdrop =
    document.getElementById("modalBackdrop");

  const modalTitle =
    document.getElementById("modalTitle");

  const modalText =
    document.getElementById("modalText");

  if (!backdrop) return;

  if (modalTitle) {
    modalTitle.textContent = title;
  }

  if (modalText) {
    modalText.textContent = text;
  }

  backdrop.classList.add("open");

}

function closeModal(event) {

  if (
    event &&
    event.target !== document.getElementById("modalBackdrop")
  ) {
    return;
  }

  document
    .getElementById("modalBackdrop")
    ?.classList.remove("open");

}

/* ================= PROTOTYPE NOTICE ================= */

function showPrototypeNotice() {

  openModal(
    "Prototype feature",
    "This interaction is intentionally represented as a frontend prototype. Real authentication, hotel availability, booking, payment, maps and live pricing should be connected through a secure backend."
  );

}

/* ================= ALL DESTINATIONS ================= */

function showDestinations() {

  showToast(
    "VYORA discovery",
    "The prototype currently showcases Goa, Kerala and Rajasthan. More destinations can be loaded from a future destination database."
  );

}

/* ================= TOAST ================= */

let toastTimeout;

function showToast(title, text) {

  const toast =
    document.getElementById("toast");

  const toastTitle =
    document.getElementById("toastTitle");

  const toastText =
    document.getElementById("toastText");

  if (!toast) return;

  toastTitle.textContent = title;
  toastText.textContent = text;

  toast.classList.add("show");

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {

    toast.classList.remove("show");

  }, 3500);

}

/* ================= SCROLL REVEAL ================= */

function setupRevealAnimations() {

  const elements =
    $$(".reveal");

  if (!("IntersectionObserver" in window)) {

    elements.forEach(
      element => element.classList.add("visible")
    );

    return;
  }

  const observer =
    new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (entry.isIntersecting) {

            entry.target.classList.add("visible");

            observer.unobserve(entry.target);

          }

        });

      },
      {
        threshold: .12,
        rootMargin: "0px 0px -45px 0px"
      }
    );

  elements.forEach(
    element => observer.observe(element)
  );

}

/* ================= COUNTERS ================= */

function setupCounters() {

  const counters =
    $$("[data-counter]");

  counters.forEach(counter => {

    const target =
      Number(counter.dataset.counter);

    let current = 0;

    const duration = 1100;
    const startTime = performance.now();

    function update(time) {

      const progress =
        Math.min(
          (time - startTime) / duration,
          1
        );

      const eased =
        1 - Math.pow(1 - progress, 3);

      current =
        Math.round(target * eased);

      counter.textContent =
        `${current}+`;

      if (progress < 1) {
        requestAnimationFrame(update);
      }

    }

    requestAnimationFrame(update);

  });

}

/* ================= 3D TILT ================= */

function setupTiltCards() {

  if (window.matchMedia("(pointer: coarse)").matches) {
    return;
  }

  $$(".tilt-card").forEach(card => {

    card.addEventListener("mousemove", event => {

      const rect =
        card.getBoundingClientRect();

      const x =
        event.clientX - rect.left;

      const y =
        event.clientY - rect.top;

      const rotateX =
        ((y / rect.height) - .5) * -5;

      const rotateY =
        ((x / rect.width) - .5) * 5;

      card.style.transform =
        `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;

    });

    card.addEventListener("mouseleave", () => {

      card.style.transform = "";

    });

  });

}

/* ================= HERO PARALLAX ================= */

function setupHeroParallax() {

  const card =
    document.getElementById("heroCard");

  if (!card) return;

  if (window.matchMedia("(pointer: coarse)").matches) {
    return;
  }

  window.addEventListener("mousemove", event => {

    const x =
      (event.clientX / window.innerWidth - .5);

    const y =
      (event.clientY / window.innerHeight - .5);

    card.style.transform =
      `
      perspective(1200px)
      rotateY(${x * -7}deg)
      rotateX(${y * 4}deg)
      translate3d(${x * 5}px, ${y * 5}px, 0)
      `;

  });

}

/* ================= MAGNETIC BUTTONS ================= */

function setupMagneticButtons() {

  if (window.matchMedia("(pointer: coarse)").matches) {
    return;
  }

  $$(".magnetic").forEach(button => {

    button.addEventListener("mousemove", event => {

      const rect =
        button.getBoundingClientRect();

      const x =
        event.clientX - rect.left - rect.width / 2;

      const y =
        event.clientY - rect.top - rect.height / 2;

      button.style.transform =
        `translate(${x * .08}px, ${y * .08}px)`;

    });

    button.addEventListener("mouseleave", () => {

      button.style.transform = "";

    });

  });

}

/* ================= CHAT KEYBOARD ================= */

function setupChatInput() {

  const input =
    document.getElementById("chatInput");

  if (!input) return;

  input.addEventListener(
    "keydown",
    event => {

      if (event.key === "Enter") {

        event.preventDefault();
        sendMessage();

      }

      if (event.key === "Escape") {
        closeAssistant();
      }

    }
  );

}

/* ================= ESCAPE HANDLER ================= */

document.addEventListener("keydown", event => {

  if (event.key === "Escape") {

    closeAssistant();

    document
      .getElementById("modalBackdrop")
      ?.classList.remove("open");

    closeMobileMenu();

  }

});

/* ================= LOAD SAVED TRIP ================= */

function loadSavedTrip() {

  try {

    const saved =
      localStorage.getItem("vyoraSavedTrip");

    if (!saved) return;

    const trip =
      JSON.parse(saved);

    if (!trip.destination) return;

    currentJourney = trip;

  } catch (error) {

    console.warn(
      "VYORA saved trip could not be loaded."
    );

  }

}

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", () => {

  setupRevealAnimations();

  setupCounters();

  setupTiltCards();

  setupHeroParallax();

  setupMagneticButtons();

  setupChatInput();

  loadSavedTrip();

  /* Keep planner/search fields synchronized. */

  const destinationInput =
    document.getElementById("destinationInput");

  const plannerDestination =
    document.getElementById("plannerDestination");

  if (destinationInput && plannerDestination) {

    destinationInput.addEventListener(
      "input",
      () => {

        if (
          destinationInput.value.trim() &&
          !plannerDestination.value.trim()
        ) {

          plannerDestination.value =
            destinationInput.value;

        }

      }
    );

  }

  /* Set a default discovery state. */

  showExperience("Local food");

});
