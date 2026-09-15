"use strict";

/* ================= HELPERS ================= */

const $ = (selector) =>
  document.querySelector(selector);

const $$ = (selector) =>
  [...document.querySelectorAll(selector)];

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
  }).format(value);
}


/* ================= NAVBAR ================= */

function scrollToPlanner() {
  document
    .getElementById("planner")
    ?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
}

function scrollToExplore() {
  document
    .getElementById("explore")
    ?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
}

window.addEventListener("scroll", () => {
  const navbar = $("#navbar");

  if (!navbar) return;

  navbar.classList.toggle(
    "scrolled",
    window.scrollY > 25
  );
});


/* ================= MOBILE MENU ================= */

function toggleMenu() {
  $("#mobileMenu")?.classList.toggle("open");
}

function closeMobileMenu() {
  $("#mobileMenu")?.classList.remove("open");
}


/* ================= NAV ACTIVE STATE ================= */

function updateActiveNav() {

  const sections = [
    "explore",
    "planner",
    "hotels",
    "experiences"
  ];

  const position =
    window.scrollY + 180;

  let active = "explore";

  sections.forEach(id => {

    const section = document.getElementById(id);

    if (
      section &&
      position >= section.offsetTop
    ) {
      active = id;
    }

  });

  $$(".nav-link").forEach(link => {

    link.classList.toggle(
      "active",
      link.getAttribute("href") === `#${active}`
    );

  });

}

window.addEventListener(
  "scroll",
  updateActiveNav
);


/* ================= INTERESTS ================= */

function toggleInterest(button) {
  button?.classList.toggle("active");
}


/* ================= DESTINATION ================= */

function prefillDestination(destination) {

  const top =
    $("#destinationInput");

  const planner =
    $("#plannerDestination");

  if (top) {
    top.value = destination;
  }

  if (planner) {
    planner.value = destination;
  }

  scrollToPlanner();

  showToast(
    "Destination selected",
    `${destination} has been added to your journey.`
  );
}

function generateTrip() {

  const destination =
    $("#destinationInput")?.value.trim();

  const days =
    $("#daysInput")?.value || "3";

  const budget =
    $("#budgetInput")?.value || "10000";

  if (!destination) {

    showToast(
      "Destination needed",
      "Tell VYORA where you want to go first."
    );

    $("#destinationInput")?.focus();

    return;
  }

  $("#plannerDestination").value =
    destination;

  $("#plannerDays").value =
    days;

  $("#plannerBudget").value =
    budget;

  scrollToPlanner();

  setTimeout(
    generatePlanner,
    500
  );
}


/* ================= JOURNEY STATE ================= */

let currentJourney = {
  destination: "",
  days: 3,
  budget: 10000,
  interests: []
};


/* ================= PLANNER ================= */

function getSelectedInterests() {

  return $$(".interest.active")
    .map(button => button.dataset.interest);

}

function generatePlanner() {

  const destination =
    $("#plannerDestination")?.value.trim();

  const days =
    Number($("#plannerDays")?.value || 3);

  const budget =
    Number($("#plannerBudget")?.value || 10000);

  const interests =
    getSelectedInterests();

  const result =
    $("#plannerResult");

  const button =
    $("#generateBtn");

  if (!destination) {

    showToast(
      "Destination needed",
      "Tell VYORA where you want to go first."
    );

    $("#plannerDestination")?.focus();

    return;
  }

  currentJourney = {
    destination,
    days,
    budget,
    interests
  };


  button?.classList.add("loading");

  if (button) {

    button.innerHTML = `
      <span>✦</span>
      <span>VYORA is thinking...</span>
      <span>•</span>
    `;

  }


  if (result) {

    result.className =
      "planner-result visible";

    result.innerHTML = `
      <div class="thinking">
        <span>✦</span>

        <div>
          <strong>
            Understanding your preferences...
          </strong>

          <div class="dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    `;

  }


  const steps = [
    "Finding the best experiences...",
    "Optimizing your route...",
    "Balancing your budget...",
    "Creating your itinerary..."
  ];

  let step = 0;


  const interval =
    setInterval(() => {

      if (!result) return;

      if (step < steps.length) {

        result.innerHTML = `
          <div class="thinking">
            <span>✦</span>

            <div>
              <strong>
                ${steps[step]}
              </strong>

              <div class="dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        `;

        step++;

      }

    }, 600);


  setTimeout(() => {

    clearInterval(interval);

    const interestsText =
      interests.length
        ? interests.slice(0,3).join(" · ")
        : "balanced exploration";


    if (result) {

      result.innerHTML = `
        <strong>
          ✦ Your ${escapeHTML(destination)}
          journey is ready.
        </strong>

        <br><br>

        ${days} days ·
        ${formatCurrency(budget)} budget ·
        ${escapeHTML(interestsText)}

        <br><br>

        <small>
          Prototype intelligence generated this journey
          from your selected preferences.
          Real AI API integration is not connected.
        </small>
      `;

    }


    if (button) {

      button.classList.remove("loading");

      button.innerHTML = `
        <span>✦</span>
        <span>Regenerate my journey</span>
        <span>→</span>
      `;

    }


    renderItinerary();
    updateJourneyHeader();
    updateBudget();


    $("#itinerary")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });


    showToast(
      "Journey ready",
      `${destination} has been arranged by VYORA.`
    );

  }, 3000);

}


/* ================= ITINERARY ================= */

const activityLibrary = {

  morning: [
    {
      name: "Scenic viewpoint",
      description:
        "Start with a panoramic introduction to the destination.",
      cost: 450,
      time: "09:00",
      travel: "20 min"
    },

    {
      name: "Local breakfast",
      description:
        "Begin the morning with regional flavours and local atmosphere.",
      cost: 280,
      time: "08:30",
      travel: "10 min"
    },

    {
      name: "Heritage walk",
      description:
        "Explore older streets, architecture and local stories.",
      cost: 350,
      time: "09:30",
      travel: "15 min"
    }
  ],

  afternoon: [
    {
      name: "Curated local experience",
      description:
        "A destination activity matched to your interests.",
      cost: 900,
      time: "13:00",
      travel: "25 min"
    },

    {
      name: "Hidden gem",
      description:
        "A quieter experience beyond the standard tourist route.",
      cost: 600,
      time: "14:00",
      travel: "30 min"
    },

    {
      name: "Regional food trail",
      description:
        "Taste local favourites and signature regional dishes.",
      cost: 750,
      time: "13:30",
      travel: "15 min"
    }
  ],

  evening: [
    {
      name: "Golden-hour escape",
      description:
        "Slow down and experience the destination at sunset.",
      cost: 500,
      time: "17:30",
      travel: "20 min"
    },

    {
      name: "Local market",
      description:
        "Explore crafts, products and evening street life.",
      cost: 400,
      time: "18:00",
      travel: "15 min"
    },

    {
      name: "Signature evening",
      description:
        "Finish the day with a memorable destination experience.",
      cost: 700,
      time: "19:30",
      travel: "25 min"
    }
  ]

};

function getActivity(type, index) {

  const list =
    activityLibrary[type];

  return list[
    index % list.length
  ];
}

function createActivity(period, activity) {

  return `
    <div class="activity">

      <div class="activity-time">
        ${period}<br>
        ${activity.time}
      </div>

      <div class="activity-info">
        <strong>
          ${escapeHTML(activity.name)}
        </strong>

        <p>
          ${escapeHTML(activity.description)}
        </p>
      </div>

      <div class="activity-meta">
        <strong>
          ₹${activity.cost.toLocaleString("en-IN")}
        </strong>

        <span>
          ${activity.travel} travel
        </span>
      </div>

    </div>
  `;
}

function renderItinerary() {

  const timeline =
    $("#itineraryTimeline");

  if (!timeline) return;

  let html = "";

  for (
    let day = 1;
    day <= currentJourney.days;
    day++
  ) {

    const morning =
      getActivity("morning", day - 1);

    const afternoon =
      getActivity("afternoon", day - 1);

    const evening =
      getActivity("evening", day - 1);


    html += `
      <article class="day-card">

        <div class="day-header">
          <strong>
            DAY ${String(day).padStart(2,"0")}
          </strong>

          <span>
            ${escapeHTML(currentJourney.destination)}
          </span>
        </div>

        ${createActivity("Morning", morning)}

        ${createActivity("Afternoon", afternoon)}

        ${createActivity("Evening", evening)}

      </article>
    `;

  }

  timeline.innerHTML = html;
}


/* ================= JOURNEY HEADER ================= */

function updateJourneyHeader() {

  const title =
    $("#journeyTitle");

  const meta =
    $("#journeyMeta");

  const score =
    $("#journeyScore");


  if (title) {

    title.textContent =
      `${currentJourney.destination}, your way.`;

  }


  if (meta) {

    const interests =
      currentJourney.interests.length
        ? currentJourney.interests.slice(0,3).join(" · ")
        : "Balanced exploration";

    meta.textContent =
      `${currentJourney.days} days · ` +
      `${formatCurrency(currentJourney.budget)} budget · ` +
      interests;

  }


  if (score) {

    const scoreValue =
      Math.min(
        87 + currentJourney.interests.length * 2,
        97
      );

    score.textContent =
      `${scoreValue}%`;

  }

}


/* ================= BUDGET ================= */

function updateBudget() {

  const budget =
    currentJourney.budget;

  const hotel =
    Math.round(budget * .34);

  const food =
    Math.round(budget * .20);

  const transport =
    Math.round(budget * .18);

  const activities =
    Math.round(budget * .17);

  const total =
    hotel +
    food +
    transport +
    activities;


  $("#budgetTotal").textContent =
    formatCurrency(total);

  $("#budgetHotel").textContent =
    formatCurrency(hotel);

  $("#budgetFood").textContent =
    formatCurrency(food);

  $("#budgetTransport").textContent =
    formatCurrency(transport);

  $("#budgetActivities").textContent =
    formatCurrency(activities);


  updateProgress(
    "hotelProgress",
    hotel / total * 100
  );

  updateProgress(
    "foodProgress",
    food / total * 100
  );

  updateProgress(
    "transportProgress",
    transport / total * 100
  );

  updateProgress(
    "activitiesProgress",
    activities / total * 100
  );


  const percentage =
    Math.min(
      Math.round(total / budget * 100),
      100
    );


  $("#budgetPercent").textContent =
    `${percentage}%`;


  const degrees =
    percentage * 3.6;

  $("#budgetRing").style.background =
    `
      radial-gradient(
        circle,
        white 57%,
        transparent 58%
      ),
      conic-gradient(
        var(--accent) ${degrees}deg,
        #e6e8df ${degrees}deg
      )
    `;


  $("#budgetNote").textContent =
    total <= budget
      ? `VYORA estimates this journey can stay within your ${formatCurrency(budget)} budget.`
      : `This journey may exceed your budget. Reduce accommodation or activities.`;

}

function updateProgress(id, value) {

  const element =
    document.getElementById(id);

  if (!element) return;

  setTimeout(() => {

    element.style.width =
      `${value}%`;

  }, 100);

}


/* ================= SAVE ================= */

function saveTrip() {

  if (!currentJourney.destination) {

    showToast(
      "Nothing to save",
      "Generate a journey first."
    );

    return;
  }


  localStorage.setItem(
    "vyoraSavedTrip",
    JSON.stringify(currentJourney)
  );


  showToast(
    "Trip saved",
    "Your VYORA journey is saved in this browser."
  );

}


/* ================= SHARE ================= */

async function shareTrip() {

  if (!currentJourney.destination) {

    showToast(
      "Nothing to share",
      "Generate a journey first."
    );

    return;
  }


  const text =
    `I'm planning a ${currentJourney.days}-day trip to ${currentJourney.destination} with VYORA.`;

  try {

    if (navigator.share) {

      await navigator.share({
        title: "My VYORA Journey",
        text,
        url: window.location.href
      });

    } else {

      await navigator.clipboard.writeText(
        `${text} ${window.location.href}`
      );

      showToast(
        "Copied",
        "Journey details copied to your clipboard."
      );

    }

  } catch (error) {

    if (error.name !== "AbortError") {

      showToast(
        "Share unavailable",
        "Your browser does not support this option."
      );

    }

  }

}


/* ================= HOTELS ================= */

function toggleFavorite(button) {

  button.classList.toggle("favorite");

  button.textContent =
    button.classList.contains("favorite")
      ? "♥"
      : "♡";

}

function showHotelDemo(name) {

  openModal(
    name,
    "This is prototype hotel data. Real availability, room selection, booking and live pricing will require secure API integration."
  );

}


/* ================= EXPERIENCES ================= */

const experiences = {

  "Local food": {
    title: "Follow the flavour.",
    text:
      "VYORA can prioritize local dishes, regional cafés, street food and food trails."
  },

  "Culture": {
    title: "See the culture.",
    text:
      "VYORA can surface traditions, museums, crafts, festivals and local stories."
  },

  "Markets": {
    title: "Walk the market.",
    text:
      "Discover neighbourhood markets, local products, crafts and evening street life."
  },

  "Hidden places": {
    title: "Go beyond the obvious.",
    text:
      "VYORA can surface quieter places and alternative experiences."
  },

  "Adventure": {
    title: "Make it memorable.",
    text:
      "Adventure recommendations can be tailored to pace, interests and destination."
  }

};

function showExperience(type) {

  const data =
    experiences[type];

  if (!data) return;

  $("#experienceTitle").textContent =
    data.title;

  $("#experienceText").textContent =
    data.text;

}


/* ================= MAP ================= */

function mapPin(type) {

  showToast(
    `${type} marker`,
    `Prototype ${type.toLowerCase()} location selected.`
  );

}


/* ================= CHAT ================= */

function openAssistant() {

  $("#chatWindow")?.classList.add("open");

  setTimeout(() => {
    $("#chatInput")?.focus();
  }, 100);

}

function closeAssistant() {

  $("#chatWindow")?.classList.remove("open");

}

function sendSuggestedMessage(message) {

  const input =
    $("#chatInput");

  if (!input) return;

  input.value =
    message;

  sendMessage();

}

function addMessage(content, type) {

  const messages =
    $("#chatMessages");

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

          <div>
            ${content}
          </div>
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
      Goa is a strong match for beaches,
      food and nightlife. A balanced 3-day route
      could combine a coastal morning, local food
      and a sunset-focused evening.

      <br><br>

      <small>
        Prototype response · Real AI API not connected.
      </small>
    `;

  }


  if (
    text.includes("cheap") ||
    text.includes("cheaper") ||
    text.includes("budget")
  ) {

    return `
      To reduce cost, VYORA would first optimize
      accommodation, then transport distance,
      then paid activities while protecting
      the experiences you value most.

      <br><br>

      <small>
        Prototype response · Real optimization engine not connected.
      </small>
    `;

  }


  if (
    text.includes("hidden") ||
    text.includes("gem")
  ) {

    return `
      Try moving beyond headline attractions.
      VYORA can prioritize quieter neighbourhoods,
      markets, local food and alternative experiences.

      <br><br>

      <small>
        Prototype response · Local discovery API not connected.
      </small>
    `;

  }


  if (
    text.includes("kerala") ||
    text.includes("nature")
  ) {

    return `
      Kerala is a strong fit for nature,
      slower travel and backwaters.
      A route could combine a city experience,
      a hill destination and a relaxed backwater stay.

      <br><br>

      <small>
        Prototype response · Live destination data not connected.
      </small>
    `;

  }


  if (
    text.includes("rajasthan") ||
    text.includes("culture") ||
    text.includes("history")
  ) {

    return `
      Rajasthan works well for heritage,
      architecture, food and culture.
      VYORA could balance major landmarks
      with quieter local experiences.

      <br><br>

      <small>
        Prototype response · External AI not connected.
      </small>
    `;

  }


  return `
    I'm currently running in VYORA prototype mode.
    Try asking about Goa, Kerala, Rajasthan,
    budgets, cheaper trips or hidden gems.

    <br><br>

    <small>
      External AI API is not connected.
    </small>
  `;

}

function sendMessage() {

  const input =
    $("#chatInput");

  const messages =
    $("#chatMessages");

  if (!input || !messages) return;


  const message =
    input.value.trim();

  if (!message) return;


  addMessage(
    escapeHTML(message),
    "user"
  );


  input.value = "";


  const typingId =
    `typing-${Date.now()}`;


  messages.insertAdjacentHTML(
    "beforeend",
    `
      <div
        class="bot-message"
        id="${typingId}"
      >
        <span class="message-avatar">✦</span>

        <div class="dots">
          <span></span>
          <span></span>
          <span></span>
        </div>

      </div>
    `
  );


  messages.scrollTop =
    messages.scrollHeight;


  setTimeout(() => {

    document
      .getElementById(typingId)
      ?.remove();


    addMessage(
      getAssistantResponse(message),
      "bot"
    );

  }, 800);

}


/* ================= MODALS ================= */

function openModal(title, text) {

  $("#modalTitle").textContent =
    title;

  $("#modalText").textContent =
    text;

  $("#modalBackdrop")
    ?.classList.add("open");

}

function closeModal() {

  $("#modalBackdrop")
    ?.classList.remove("open");

}

function showPrototypeNotice() {

  openModal(
    "Prototype feature",
    "This frontend demonstrates the product experience. Real authentication, hotel availability, payments, live pricing and maps require a backend and external APIs."
  );

}

function showDestinations() {

  showToast(
    "VYORA Discovery",
    "Current showcase destinations are Goa, Kerala and Rajasthan."
  );

}


/* ================= TOAST ================= */

let toastTimer;

function showToast(title, text) {

  const toast =
    $("#toast");

  if (!toast) return;

  $("#toastTitle").textContent =
    title;

  $("#toastText").textContent =
    text;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer =
    setTimeout(() => {

      toast.classList.remove("show");

    }, 3500);

}


/* ================= SCROLL REVEAL ================= */

function setupReveal() {

  const elements =
    $$(".reveal");


  if (
    !("IntersectionObserver" in window)
  ) {

    elements.forEach(
      el => el.classList.add("visible")
    );

    return;
  }


  const observer =
    new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (entry.isIntersecting) {

            entry.target.classList.add(
              "visible"
            );

            observer.unobserve(
              entry.target
            );

          }

        });

      },
      {
        threshold: .12,
        rootMargin: "0px 0px -40px 0px"
      }
    );


  elements.forEach(
    el => observer.observe(el)
  );

}


/* ================= COUNTERS ================= */

function setupCounters() {

  $$(".hero-mini-stats [data-counter]")
    .forEach(counter => {

      const target =
        Number(counter.dataset.counter);

      let start = 0;

      const duration = 1000;
      const startTime =
        performance.now();


      function animate(time) {

        const progress =
          Math.min(
            (time - startTime) / duration,
            1
          );

        const eased =
          1 - Math.pow(1 - progress, 3);

        start =
          Math.round(target * eased);

        counter.textContent =
          `${start}+`;


        if (progress < 1) {

          requestAnimationFrame(
            animate
          );

        }

      }


      requestAnimationFrame(
        animate
      );

    });

}


/* ================= TILT ================= */

function setupTilt() {

  if (
    window.matchMedia("(pointer:coarse)")
      .matches
  ) {
    return;
  }


  $$(".tilt-card").forEach(card => {

    card.addEventListener(
      "mousemove",
      event => {

        const rect =
          card.getBoundingClientRect();

        const x =
          event.clientX - rect.left;

        const y =
          event.clientY - rect.top;

        const rotateX =
          ((y / rect.height) - .5) * -4;

        const rotateY =
          ((x / rect.width) - .5) * 4;

        card.style.transform =
          `
            perspective(900px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            translateY(-4px)
          `;

      }
    );


    card.addEventListener(
      "mouseleave",
      () => {

        card.style.transform = "";

      }
    );

  });

}


/* ================= HERO PARALLAX ================= */

function setupHeroParallax() {

  const card =
    $("#heroCard");

  if (!card) return;


  if (
    window.matchMedia("(pointer:coarse)")
      .matches
  ) {
    return;
  }


  window.addEventListener(
    "mousemove",
    event => {

      const x =
        event.clientX /
        window.innerWidth -
        .5;

      const y =
        event.clientY /
        window.innerHeight -
        .5;


      card.style.transform =
        `
          perspective(1200px)
          rotateY(${x * -5}deg)
          rotateX(${y * 3}deg)
        `;

    }
  );

}


/* ================= CHAT INPUT ================= */

function setupChat() {

  $("#chatInput")
    ?.addEventListener(
      "keydown",
      event => {

        if (event.key === "Enter") {

          event.preventDefault();

          sendMessage();

        }

      }
    );

}


/* ================= KERALA IMAGE FALLBACK ================= */

function setupImageFallback() {

  const test =
    new Image();

  const fallback =
    "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1000&q=90";


  test.onerror = () => {

    const kerala =
      $(".bg-kerala");

    if (!kerala) return;

    kerala.style.backgroundImage =
      `
        linear-gradient(
          transparent,
          rgba(0,0,0,.75)
        ),
        url("${fallback}")
      `;

  };


  test.src =
    "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1000&q=90";

}


/* ================= KEYBOARD ================= */

document.addEventListener(
  "keydown",
  event => {

    if (event.key === "Escape") {

      closeAssistant();
      closeModal();
      closeMobileMenu();

    }

  }
);


/* ================= INIT ================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupReveal();

    setupCounters();

    setupTilt();

    setupHeroParallax();

    setupChat();

    setupImageFallback();

    updateActiveNav();

  }
);
