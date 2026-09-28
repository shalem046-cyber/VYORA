"use strict";

/* =========================================================
   VYORA
   Travel Beyond the Ordinary.
   Frontend Product Engine
========================================================= */


/* =========================================================
   CONFIG
========================================================= */

const VYORA_API =
  "http://localhost:5000/api/auth";

const VYORA_TRIPS_API =
  "http://localhost:5000/api/trips";

let currentUser = null;


/* =========================================================
   GLOBAL STATE
========================================================= */

let currentJourney = {

  tripId: null,

  destination: "",

  startDate: "",

  endDate: "",

  days: 0,

  budget: 0,

  interests: []

};


let toastTimer = null;


/* =========================================================
   DOM HELPERS
========================================================= */

const $ = (selector) => {

  return document.querySelector(
    selector
  );

};


const $$ = (selector) => {

  return [
    ...document.querySelectorAll(
      selector
    )
  ];

};


function escapeHTML(value) {

  const div =
    document.createElement(
      "div"
    );

  div.textContent =
    value ?? "";

  return div.innerHTML;

}


function formatCurrency(value) {

  const amount =
    Number(value) || 0;

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }
  ).format(amount);

}


/* =========================================================
   DATE HELPERS
========================================================= */

function parseLocalDate(value) {

  if (!value) {
    return null;
  }

  const normalized =
    String(value).slice(
      0,
      10
    );

  const date =
    new Date(
      `${normalized}T00:00:00`
    );

  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;

}


function calculateTripDays(
  startDate,
  endDate
) {

  const start =
    parseLocalDate(
      startDate
    );

  const end =
    parseLocalDate(
      endDate
    );

  if (!start || !end) {

    return 0;

  }

  const difference =
    end.getTime() -
    start.getTime();

  if (difference < 0) {

    return 0;

  }

  return (
    Math.floor(
      difference /
      (1000 * 60 * 60 * 24)
    ) + 1
  );

}


function getDateAfter(
  startDate,
  offset
) {

  const date =
    parseLocalDate(
      startDate
    );

  if (!date) {

    return "";

  }

  date.setDate(
    date.getDate() + offset
  );

  return date
    .toISOString()
    .split("T")[0];

}


function formatDate(value) {

  const date =
    parseLocalDate(
      value
    );

  if (!date) {

    return "";

  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );

}


/* =========================================================
   DESTINATION DATABASE
========================================================= */

const destinationDatabase = {

  Goa: {

    country: "India",

    vibe:
      "Beach · Social · Nightlife",

    description:
      "Slow mornings, coastal drives, local food and evenings that stay awake.",

    highlights:
      "Beaches · Cafés · Water sports · Nightlife",

    bestFor:
      "Friends, couples, solo travellers and first-time explorers.",

    image:
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1400&q=90"

  },

  Kerala: {

    country: "India",

    vibe:
      "Nature · Slow Travel · Escape",

    description:
      "Backwaters, misty hills, local flavours and a slower way to travel.",

    highlights:
      "Backwaters · Hills · Local food · Wellness",

    bestFor:
      "Nature lovers, slow travellers and peaceful escapes.",

    image:
      "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1400&q=90"

  },

  Rajasthan: {

    country: "India",

    vibe:
      "Heritage · Culture · Story",

    description:
      "Palaces, old cities, desert landscapes and centuries of stories.",

    highlights:
      "Forts · Palaces · Markets · Culture",

    bestFor:
      "Culture seekers, photographers and heritage explorers.",

    image:
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1400&q=90"

  },

  Hyderabad: {

    country: "India",

    vibe:
      "Food · Heritage · City",

    description:
      "Historic architecture, iconic food and a city where old meets new.",

    highlights:
      "Charminar · Food · Markets · Heritage",

    bestFor:
      "Food lovers and short city escapes.",

    image:
      "https://images.unsplash.com/photo-1572449043416-55f4685c9bb7?auto=format&fit=crop&w=1400&q=90"

  },

  Vizag: {

    country: "India",

    vibe:
      "Coast · Nature · City",

    description:
      "Clifftop views, beaches, hills and a relaxed coastal rhythm.",

    highlights:
      "Beaches · Hills · Views · Food",

    bestFor:
      "Weekend trips and coastal explorers.",

    image:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1400&q=90"

  },

  "New Delhi": {

    country: "India",

    vibe:
      "History · Food · Urban",

    description:
      "Monuments, markets and a constantly moving capital.",

    highlights:
      "Monuments · Food · Markets · Culture",

    bestFor:
      "First-time visitors and city explorers.",

    image:
      "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1400&q=90"

  },

  Mumbai: {

    country: "India",

    vibe:
      "City · Coast · Culture",

    description:
      "A fast-moving coastal city filled with food, design and stories.",

    highlights:
      "Marine Drive · Food · Art · Nightlife",

    bestFor:
      "Urban explorers and food lovers.",

    image:
      "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1400&q=90"

  },

  Tokyo: {

    country: "Japan",

    vibe:
      "Future · Culture · Food",

    description:
      "A collision of technology, tradition, food and endless city energy.",

    highlights:
      "Shibuya · Temples · Food · Design",

    bestFor:
      "First-time international travellers and city lovers.",

    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1400&q=90"

  },

  Paris: {

    country: "France",

    vibe:
      "Art · Food · Romance",

    description:
      "Architecture, museums, cafés and neighbourhoods made for wandering.",

    highlights:
      "Museums · Cafés · Architecture · Fashion",

    bestFor:
      "Art, food and culture focused travellers.",

    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=90"

  },

  Singapore: {

    country: "Singapore",

    vibe:
      "Modern · Food · Explorer",

    description:
      "A compact city where futuristic architecture meets incredible food.",

    highlights:
      "Gardens · Food · Skyline · Shopping",

    bestFor:
      "Short international trips and modern-city explorers.",

    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1400&q=90"

  }

};


/* =========================================================
   ACTIVITY LIBRARY
========================================================= */

const activityLibrary = {

  morning: [

    {
      name: "Local breakfast",
      description:
        "Start with a regional breakfast and a feel for the neighbourhood.",
      cost: 300,
      time: "08:30",
      travel: "10 min"
    },

    {
      name: "Scenic viewpoint",
      description:
        "Start the day with a panoramic introduction to the destination.",
      cost: 450,
      time: "09:00",
      travel: "20 min"
    },

    {
      name: "Heritage walk",
      description:
        "Explore architecture, stories and the character of the city.",
      cost: 350,
      time: "09:30",
      travel: "15 min"
    }

  ],

  afternoon: [

    {
      name: "Curated local experience",
      description:
        "A destination activity matched to your selected interests.",
      cost: 900,
      time: "13:00",
      travel: "25 min"
    },

    {
      name: "Hidden gem",
      description:
        "A quieter experience beyond the obvious tourist route.",
      cost: 650,
      time: "14:00",
      travel: "30 min"
    },

    {
      name: "Regional food trail",
      description:
        "Taste signature dishes and explore local food culture.",
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
        "Explore crafts, street life and neighbourhood energy.",
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


function getActivity(
  period,
  index
) {

  const list =
    activityLibrary[period];

  return list[
    index % list.length
  ];

}


/* =========================================================
   NAVIGATION
========================================================= */

function scrollToPlanner() {

  $("#planner")?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


function scrollToExplore() {

  $("#explore")?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


function toggleMenu() {

  const menu =
    $("#mobileMenu");

  const button =
    $("#menuBtn");

  if (!menu) {

    return;

  }

  const open =
    menu.classList.toggle(
      "open"
    );

  button?.setAttribute(
    "aria-expanded",
    String(open)
  );

}


function closeMobileMenu() {

  $("#mobileMenu")
    ?.classList.remove(
      "open"
    );

  $("#menuBtn")
    ?.setAttribute(
      "aria-expanded",
      "false"
    );

}


function updateActiveNav() {

  const sections = [

    "explore",

    "planner",

    "itinerary",

    "myJourneys",

    "hotels",

    "experiences"

  ];

  const position =
    window.scrollY + 180;

  let active =
    "explore";


  sections.forEach(
    (id) => {

      const section =
        document.getElementById(
          id
        );

      if (
        section &&
        !section.hidden &&
        position >=
          section.offsetTop
      ) {

        active =
          id;

      }

    }
  );


  $$(".nav-link")
    .forEach(
      (link) => {

        link.classList.toggle(
          "active",
          link.getAttribute("href") ===
            `#${active}`
        );

      }
    );

}


window.addEventListener(
  "scroll",
  updateActiveNav,
  {
    passive: true
  }
);


/* =========================================================
   INTERESTS
========================================================= */

function toggleInterest(
  button
) {

  if (!button) {

    return;

  }

  button.classList.toggle(
    "active"
  );

}


function getSelectedInterests() {

  return $$(".interest.active")
    .map(
      (button) =>
        button.dataset.interest
    );

}


/* =========================================================
   DESTINATION FLOW
========================================================= */

function findDestination(
  query
) {

  if (!query) {

    return null;

  }

  const normalized =
    query
      .trim()
      .toLowerCase();


  const exact =
    Object.keys(
      destinationDatabase
    ).find(
      (key) =>
        key.toLowerCase() ===
        normalized
    );


  if (exact) {

    return exact;

  }


  const partial =
    Object.keys(
      destinationDatabase
    ).find(
      (key) =>
        key
          .toLowerCase()
          .includes(
            normalized
          )
    );


  return partial || null;

}


function prefillDestination(
  destination
) {

  const topInput =
    $("#destinationInput");

  const plannerInput =
    $("#plannerDestination");


  if (topInput) {

    topInput.value =
      destination;

  }


  if (plannerInput) {

    plannerInput.value =
      destination;

  }


  const data =
    destinationDatabase[
      destination
    ];


  scrollToPlanner();


  if (data) {

    showToast(
      `${destination} selected`,
      `${data.vibe}`
    );

  } else {

    showToast(
      "Destination selected",
      `${destination} has been added to your journey.`
    );

  }

}


function showDestinationDetails(
  destination
) {

  const data =
    destinationDatabase[
      destination
    ];


  if (!data) {

    prefillDestination(
      destination
    );

    return;

  }


  openModal(
    destination,
    `${data.description} ${data.highlights}. ${data.bestFor}`
  );

}


function showDestinations() {

  openModal(
    "Explore beyond the obvious",
    "Choose Goa, Kerala or Rajasthan from the destination cards, or type any destination directly into the VYORA planner."
  );

}


/* =========================================================
   DATE SYSTEM
========================================================= */

function setupDateInputs() {

  const today =
    new Date()
      .toISOString()
      .split("T")[0];


  const fields = [

    "quickStartDate",

    "quickEndDate",

    "plannerStartDate",

    "plannerEndDate"

  ];


  fields.forEach(
    (id) => {

      const field =
        document.getElementById(
          id
        );

      if (field) {

        field.min =
          today;

      }

    }
  );


  const plannerStart =
    $("#plannerStartDate");

  const plannerEnd =
    $("#plannerEndDate");

  const quickStart =
    $("#quickStartDate");

  const quickEnd =
    $("#quickEndDate");


  plannerStart?.addEventListener(
    "change",
    () => {

      if (
        plannerEnd &&
        plannerStart.value
      ) {

        plannerEnd.min =
          plannerStart.value;

      }

      updatePlannerDuration();

    }
  );


  plannerEnd?.addEventListener(
    "change",
    updatePlannerDuration
  );


  quickStart?.addEventListener(
    "change",
    () => {

      if (
        quickEnd &&
        quickStart.value
      ) {

        quickEnd.min =
          quickStart.value;

      }

      syncQuickDays();

    }
  );


  quickEnd?.addEventListener(
    "change",
    syncQuickDays
  );


  updatePlannerDuration();

}


function updatePlannerDuration() {

  const start =
    $("#plannerStartDate")?.value;

  const end =
    $("#plannerEndDate")?.value;

  const duration =
    $("#plannerDuration");

  const hidden =
    $("#plannerDays");


  const days =
    calculateTripDays(
      start,
      end
    );


  if (!duration) {

    return;

  }


  if (!start || !end) {

    duration.textContent =
      "Choose dates";

    if (hidden) {

      hidden.value =
        "1";

    }

    return;

  }


  if (days <= 0) {

    duration.textContent =
      "Check your dates";

    if (hidden) {

      hidden.value =
        "1";

    }

    return;

  }


  duration.textContent =
    `${days} day${
      days === 1
        ? ""
        : "s"
    }`;


  if (hidden) {

    hidden.value =
      String(days);

  }

}


function syncQuickDays() {

  const start =
    $("#quickStartDate")?.value;

  const end =
    $("#quickEndDate")?.value;

  const hidden =
    $("#daysInput");


  const days =
    calculateTripDays(
      start,
      end
    );


  if (hidden) {

    hidden.value =
      days > 0
        ? String(days)
        : "1";

  }

}


/* =========================================================
   QUICK SEARCH
========================================================= */

function generateTrip() {

  const destination =
    $("#destinationInput")
      ?.value
      .trim();

  const startDate =
    $("#quickStartDate")
      ?.value;

  const endDate =
    $("#quickEndDate")
      ?.value;

  const budget =
    Number(
      $("#budgetInput")
        ?.value || 0
    );


  if (!destination) {

    showToast(
      "Destination needed",
      "Tell VYORA where you want to go first."
    );

    $("#destinationInput")
      ?.focus();

    return;

  }


  if (!startDate || !endDate) {

    showToast(
      "Dates needed",
      "Choose your start and end dates."
    );

    $("#quickStartDate")
      ?.focus();

    return;

  }


  const days =
    calculateTripDays(
      startDate,
      endDate
    );


  if (days <= 0) {

    showToast(
      "Invalid dates",
      "Your end date must be after your start date."
    );

    return;

  }


  if (
    !Number.isFinite(budget) ||
    budget <= 0
  ) {

    showToast(
      "Budget needed",
      "Enter any amount you want to spend."
    );

    $("#budgetInput")
      ?.focus();

    return;

  }


  $("#plannerDestination")
    .value =
    destination;

  $("#plannerStartDate")
    .value =
    startDate;

  $("#plannerEndDate")
    .value =
    endDate;

  $("#plannerBudget")
    .value =
    budget;

  $("#plannerDays")
    .value =
    days;


  updatePlannerDuration();

  scrollToPlanner();


  setTimeout(
    generatePlanner,
    350
  );

}


/* =========================================================
   PLANNER
========================================================= */

function generatePlanner() {

  const destination =
    $("#plannerDestination")
      ?.value
      .trim();

  const startDate =
    $("#plannerStartDate")
      ?.value;

  const endDate =
    $("#plannerEndDate")
      ?.value;

  const budget =
    Number(
      $("#plannerBudget")
        ?.value || 0
    );

  const interests =
    getSelectedInterests();


  if (!destination) {

    showToast(
      "Destination needed",
      "Tell VYORA where you're going."
    );

    $("#plannerDestination")
      ?.focus();

    return;

  }


  if (!startDate || !endDate) {

    showToast(
      "Travel dates needed",
      "Choose your start and end dates."
    );

    $("#plannerStartDate")
      ?.focus();

    return;

  }


  const days =
    calculateTripDays(
      startDate,
      endDate
    );


  if (days <= 0) {

    showToast(
      "Invalid dates",
      "Your end date must be on or after the start date."
    );

    return;

  }


  if (
    !Number.isFinite(budget) ||
    budget <= 0
  ) {

    showToast(
      "Budget needed",
      "Enter your own travel budget."
    );

    $("#plannerBudget")
      ?.focus();

    return;

  }


  currentJourney = {

    tripId:
      currentJourney.tripId || null,

    destination,

    startDate,

    endDate,

    days,

    budget,

    interests

  };


  const button =
    $("#generateBtn");

  const result =
    $("#plannerResult");


  if (button) {

    button.disabled =
      true;

    button.classList.add(
      "loading"
    );

    button.innerHTML = `

      <span>✦</span>

      <span>
        VYORA is thinking...
      </span>

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
            Designing your journey...
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


  const messages = [

    "Reading your dates...",

    "Understanding your vibe...",

    "Finding experiences...",

    "Optimizing your route...",

    "Balancing your budget...",

    "Your journey is almost ready..."

  ];


  let step = 0;


  const interval =
    setInterval(
      () => {

        if (
          result &&
          step <
            messages.length
        ) {

          result.innerHTML = `

            <div class="thinking">

              <span>✦</span>

              <div>

                <strong>
                  ${messages[step]}
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

      },
      420
    );


  setTimeout(
    () => {

      clearInterval(
        interval
      );


      if (result) {

        result.innerHTML = `

          <div class="journey-ready">

            <span>
              ✦
            </span>

            <div>

              <strong>
                Your journey is ready.
              </strong>

              <p>

                ${escapeHTML(
                  destination
                )}

                ·

                ${formatDate(
                  startDate
                )}

                →

                ${formatDate(
                  endDate
                )}

                ·

                ${days}
                day${
                  days === 1
                    ? ""
                    : "s"
                }

              </p>

              <small>

                ${
                  interests.length
                    ? escapeHTML(
                        interests
                          .slice(
                            0,
                            4
                          )
                          .join(
                            " · "
                          )
                      )
                    : "Balanced exploration"
                }

              </small>

            </div>

          </div>

        `;

      }


      if (button) {

        button.disabled =
          false;

        button.classList.remove(
          "loading"
        );

        button.innerHTML = `

          <span>✦</span>

          <span>
            Regenerate my journey
          </span>

          <span>→</span>

        `;

      }


      renderItinerary();

      updateJourneyHeader();

      updateBudget();


      $("#itinerary")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });


      showToast(
        "Journey ready",
        `${destination} has been shaped around your choices.`
      );


    },
    2900
  );

}


/* =========================================================
   ITINERARY
========================================================= */

function createActivityHTML(
  period,
  activity
) {

  return `

    <div class="activity">

      <div class="activity-time">

        <strong>
          ${escapeHTML(period)}
        </strong>

        <span>
          ${escapeHTML(activity.time)}
        </span>

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
          ${formatCurrency(activity.cost)}
        </strong>

        <span>
          ${escapeHTML(activity.travel)}
        </span>

      </div>

    </div>

  `;

}


function renderItinerary() {

  const timeline =
    $("#itineraryTimeline");


  if (!timeline) {

    return;

  }


  if (
    !currentJourney.destination ||
    !currentJourney.startDate ||
    !currentJourney.days
  ) {

    timeline.innerHTML = `

      <div class="empty-itinerary">

        <div>✦</div>

        <strong>
          Your itinerary will appear here.
        </strong>

        <p>
          Pick your destination,
          dates and vibe to begin.
        </p>

      </div>

    `;

    return;

  }


  let html =
    "";


  for (
    let day = 1;
    day <= currentJourney.days;
    day++
  ) {

    const morning =
      getActivity(
        "morning",
        day - 1
      );


    const afternoon =
      getActivity(
        "afternoon",
        day - 1
      );


    const evening =
      getActivity(
        "evening",
        day - 1
      );


    const actualDate =
      getDateAfter(
        currentJourney.startDate,
        day - 1
      );


    html += `

      <article
        class="day-card reveal visible"
      >

        <div class="day-header">

          <div>

            <strong>
              DAY
              ${String(day)
                .padStart(
                  2,
                  "0"
                )}
            </strong>

            <small
              class="itinerary-calendar-date"
            >
              ${formatDate(actualDate)}
            </small>

          </div>


          <span>
            ${escapeHTML(
              currentJourney.destination
            )}
          </span>

        </div>


        ${createActivityHTML(
          "Morning",
          morning
        )}


        ${createActivityHTML(
          "Afternoon",
          afternoon
        )}


        ${createActivityHTML(
          "Evening",
          evening
        )}

      </article>

    `;

  }


  timeline.innerHTML =
    html;

}


/* =========================================================
   JOURNEY HEADER
========================================================= */

function updateJourneyHeader() {

  const title =
    $("#journeyTitle");

  const meta =
    $("#journeyMeta");

  const score =
    $("#journeyScore");


  if (title) {

    title.textContent =
      currentJourney.destination

        ? `${currentJourney.destination}, your way.`

        : "Your next adventure.";

  }


  if (meta) {

    if (
      currentJourney.destination &&
      currentJourney.startDate &&
      currentJourney.endDate
    ) {

      const vibe =
        currentJourney
          .interests.length

          ? currentJourney
              .interests
              .slice(
                0,
                3
              )
              .join(
                " · "
              )

          : "Balanced exploration";


      meta.textContent =
        `${formatDate(
          currentJourney.startDate
        )} → ${formatDate(
          currentJourney.endDate
        )} · ${
          currentJourney.days
        } days · ${
          formatCurrency(
            currentJourney.budget
          )
        } budget · ${vibe}`;

    } else {

      meta.textContent =
        "Choose your destination and dates to begin.";

    }

  }


  if (score) {

    if (
      !currentJourney.destination
    ) {

      score.textContent =
        "—";

      return;

    }


    const calculatedScore =
      Math.min(
        88 +
        currentJourney
          .interests
          .length *
          2 +
        (
          currentJourney.days >=
          3
            ? 3
            : 0
        ),
        98
      );


    score.textContent =
      `${calculatedScore}%`;

  }

}


/* =========================================================
   BUDGET
========================================================= */

function updateBudget() {

  const budget =
    Number(
      currentJourney.budget
    ) || 0;


  if (budget <= 0) {

    resetBudgetUI();

    return;

  }


  const hotel =
    Math.round(
      budget * 0.34
    );


  const food =
    Math.round(
      budget * 0.20
    );


  const transport =
    Math.round(
      budget * 0.18
    );


  const activities =
    Math.round(
      budget * 0.17
    );


  const total =
    hotel +
    food +
    transport +
    activities;


  const reserve =
    Math.max(
      budget - total,
      0
    );


  if ($("#budgetTotal")) {

    $("#budgetTotal")
      .textContent =
      formatCurrency(total);

  }


  if ($("#budgetHotel")) {

    $("#budgetHotel")
      .textContent =
      formatCurrency(hotel);

  }


  if ($("#budgetFood")) {

    $("#budgetFood")
      .textContent =
      formatCurrency(food);

  }


  if ($("#budgetTransport")) {

    $("#budgetTransport")
      .textContent =
      formatCurrency(transport);

  }


  if ($("#budgetActivities")) {

    $("#budgetActivities")
      .textContent =
      formatCurrency(activities);

  }


  updateProgress(
    "hotelProgress",
    hotel / budget * 100
  );


  updateProgress(
    "foodProgress",
    food / budget * 100
  );


  updateProgress(
    "transportProgress",
    transport / budget * 100
  );


  updateProgress(
    "activitiesProgress",
    activities / budget * 100
  );


  const percentage =
    Math.min(
      Math.round(
        total / budget * 100
      ),
      100
    );


  if ($("#budgetPercent")) {

    $("#budgetPercent")
      .textContent =
      `${percentage}%`;

  }


  const ring =
    $("#budgetRing");


  if (ring) {

    const degrees =
      percentage * 3.6;


    ring.style.background = `

      radial-gradient(
        circle,
        white 57%,
        transparent 58%
      ),

      conic-gradient(
        var(--accent)
        ${degrees}deg,

        #e6e8df
        ${degrees}deg
      )

    `;

  }


  const note =
    $("#budgetNote");


  if (note) {

    note.textContent =
      reserve > 0

        ? `${formatCurrency(
            reserve
          )} remains as a flexible travel buffer.`

        : "Your full budget is allocated across the journey.";

  }

}


function updateProgress(
  id,
  value
) {

  const element =
    document.getElementById(
      id
    );


  if (!element) {

    return;

  }


  requestAnimationFrame(
    () => {

      element.style.width =
        `${Math.max(
          0,
          Math.min(
            Number(value) || 0,
            100
          )
        )}%`;

    }
  );

}


function resetBudgetUI() {

  const fields = [

    "budgetTotal",

    "budgetHotel",

    "budgetFood",

    "budgetTransport",

    "budgetActivities"

  ];


  fields.forEach(
    (id) => {

      const element =
        document.getElementById(
          id
        );


      if (element) {

        element.textContent =
          formatCurrency(0);

      }

    }
  );


  [
    "hotelProgress",
    "foodProgress",
    "transportProgress",
    "activitiesProgress"

  ].forEach(
    (id) => {

      const element =
        document.getElementById(
          id
        );


      if (element) {

        element.style.width =
          "0%";

      }

    }
  );


  const percent =
    $("#budgetPercent");


  if (percent) {

    percent.textContent =
      "0%";

  }


  const note =
    $("#budgetNote");


  if (note) {

    note.textContent =
      "Enter your budget to see VYORA's cost breakdown.";

  }

}


/* =========================================================
   LOCAL FALLBACK SAVE / LOAD
========================================================= */

function saveTripLocally() {

  if (
    !currentJourney.destination
  ) {

    return;

  }


  localStorage.setItem(
    "vyoraSavedTrip",
    JSON.stringify(
      currentJourney
    )
  );

}


function loadSavedTrip() {

  const saved =
    localStorage.getItem(
      "vyoraSavedTrip"
    );


  if (!saved) {

    return;

  }


  try {

    const data =
      JSON.parse(
        saved
      );


    if (
      !data ||
      !data.destination
    ) {

      return;

    }


    currentJourney = {

      tripId:
        data.tripId ||
        null,

      destination:
        data.destination ||
        "",

      startDate:
        data.startDate ||
        "",

      endDate:
        data.endDate ||
        "",

      days:
        Number(
          data.days
        ) || 0,

      budget:
        Number(
          data.budget
        ) || 0,

      interests:
        Array.isArray(
          data.interests
        )
          ? data.interests
          : []

    };


    restoreJourneyToForm();


  } catch (error) {

    console.error(
      "Saved journey error:",
      error
    );

  }

}


function restoreJourneyToForm() {

  const destination =
    $("#plannerDestination");

  const start =
    $("#plannerStartDate");

  const end =
    $("#plannerEndDate");

  const budget =
    $("#plannerBudget");

  const days =
    $("#plannerDays");


  if (destination) {

    destination.value =
      currentJourney.destination;

  }


  if (start) {

    start.value =
      String(
        currentJourney.startDate
      ).slice(
        0,
        10
      );

  }


  if (end) {

    end.value =
      String(
        currentJourney.endDate
      ).slice(
        0,
        10
      );

  }


  if (budget) {

    budget.value =
      currentJourney.budget;

  }


  if (days) {

    days.value =
      currentJourney.days;

  }


  $$(".interest")
    .forEach(
      button => {

        button.classList.toggle(
          "active",
          currentJourney
            .interests
            .includes(
              button.dataset.interest
            )
        );

      }
    );


  updatePlannerDuration();

  renderItinerary();

  updateJourneyHeader();

  updateBudget();

}


/* =========================================================
   BUILD ITINERARY DATA FOR BACKEND
========================================================= */

function buildItineraryData() {

  if (
    !currentJourney.destination ||
    !currentJourney.startDate ||
    !currentJourney.days
  ) {

    return [];

  }


  const itinerary = [];


  for (
    let day = 1;
    day <= currentJourney.days;
    day++
  ) {

    const morning =
      getActivity(
        "morning",
        day - 1
      );


    const afternoon =
      getActivity(
        "afternoon",
        day - 1
      );


    const evening =
      getActivity(
        "evening",
        day - 1
      );


    itinerary.push({

      day,

      date:
        getDateAfter(
          currentJourney.startDate,
          day - 1
        ),

      destination:
        currentJourney.destination,

      activities: [

        {
          period: "Morning",
          name: morning.name,
          description: morning.description,
          cost: morning.cost,
          time: morning.time,
          travel: morning.travel
        },

        {
          period: "Afternoon",
          name: afternoon.name,
          description: afternoon.description,
          cost: afternoon.cost,
          time: afternoon.time,
          travel: afternoon.travel
        },

        {
          period: "Evening",
          name: evening.name,
          description: evening.description,
          cost: evening.cost,
          time: evening.time,
          travel: evening.travel
        }

      ]

    });

  }


  return itinerary;

}


/* =========================================================
   SAVE TRIP — POSTGRESQL
========================================================= */

async function saveTrip() {

  const user =
    getLoggedInUser();


  if (!user) {

    showToast(
      "Sign in required",
      "Please sign in before saving a journey."
    );

    openAuthModal(
      "login"
    );

    return;

  }


  if (
    !currentJourney.destination
  ) {

    showToast(
      "Nothing to save",
      "Generate a journey first."
    );

    return;

  }


  try {

    showToast(
      currentJourney.tripId
        ? "Updating journey"
        : "Saving journey",

      "Connecting to your VYORA account..."
    );


    const hasExistingTrip =
      Boolean(
        currentJourney.tripId
      );


    const url =
      hasExistingTrip
        ? `${VYORA_TRIPS_API}/${currentJourney.tripId}`
        : VYORA_TRIPS_API;


    const response =
      await fetch(
        url,
        {

          method:
            hasExistingTrip
              ? "PATCH"
              : "POST",

          credentials:
            "include",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({

              destination:
                currentJourney.destination,

              startDate:
                currentJourney.startDate,

              endDate:
                currentJourney.endDate,

              budget:
                currentJourney.budget,

              interests:
                currentJourney.interests,

              itinerary:
                buildItineraryData()

            })

        }
      );


    let data = {};


    try {

      data =
        await response.json();

    } catch {

      data = {};

    }


    if (
      response.status ===
      401
    ) {

      currentUser = null;

      localStorage.removeItem(
        "vyoraUser"
      );

      updateAuthUI();

      showToast(
        "Session expired",
        "Please sign in again."
      );

      openAuthModal(
        "login"
      );

      return;

    }


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Unable to save journey."
      );

    }


    if (
      data.trip
    ) {

      currentJourney.tripId =
        data.trip.id;

    }


    saveTripLocally();

    await refreshMyJourneys(
      false
    );


    showToast(
      hasExistingTrip
        ? "Journey updated"
        : "Journey saved",

      hasExistingTrip
        ? "Your VYORA journey has been updated."
        : "Your journey is now stored in VYORA."
    );


    console.log(
      "VYORA saved trip:",
      data.trip
    );


  } catch (error) {

    console.error(
      "VYORA save trip error:",
      error
    );


    showToast(
      "Save failed",
      error.message ||
        "Unable to save your journey."
    );

  }

}


/* =========================================================
   GET MY TRIPS
========================================================= */

async function getMyTrips() {

  const user =
    getLoggedInUser();


  if (!user) {

    return [];

  }


  try {

    const response =
      await fetch(
        VYORA_TRIPS_API,
        {

          method:
            "GET",

          credentials:
            "include",

          cache:
            "no-store"

        }
      );


    if (
      response.status ===
      401
    ) {

      currentUser = null;

      localStorage.removeItem(
        "vyoraUser"
      );

      updateAuthUI();

      return [];

    }


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Unable to load journeys."
      );

    }


    return Array.isArray(
      data.trips
    )
      ? data.trips
      : [];


  } catch (error) {

    console.error(
      "VYORA get trips error:",
      error
    );

    return [];

  }

}


/* =========================================================
   GET SINGLE TRIP
========================================================= */

async function getTrip(
  tripId
) {

  if (!tripId) {

    return null;

  }


  try {

    const response =
      await fetch(
        `${VYORA_TRIPS_API}/${tripId}`,
        {

          method:
            "GET",

          credentials:
            "include",

          cache:
            "no-store"

        }
      );


    const data =
      await response.json();


    if (
      response.status ===
      401
    ) {

      currentUser = null;

      localStorage.removeItem(
        "vyoraUser"
      );

      updateAuthUI();

      return null;

    }


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Unable to load journey."
      );

    }


    return data.trip ||
      null;


  } catch (error) {

    console.error(
      "VYORA get trip error:",
      error
    );

    return null;

  }

}


/* =========================================================
   DELETE TRIP
========================================================= */

async function deleteTrip(
  tripId
) {

  if (!tripId) {

    return false;

  }


  try {

    const response =
      await fetch(
        `${VYORA_TRIPS_API}/${tripId}`,
        {

          method:
            "DELETE",

          credentials:
            "include"

        }
      );


    const data =
      await response.json();


    if (
      response.status ===
      401
    ) {

      currentUser = null;

      localStorage.removeItem(
        "vyoraUser"
      );

      updateAuthUI();

      showToast(
        "Session expired",
        "Please sign in again."
      );

      return false;

    }


    if (!response.ok) {

      throw new Error(
        data.message ||
        "Unable to delete journey."
      );

    }


    if (
      String(
        currentJourney.tripId
      ) ===
      String(
        tripId
      )
    ) {

      currentJourney.tripId =
        null;

      saveTripLocally();

    }


    showToast(
      "Journey deleted",
      "The journey has been removed from VYORA."
    );


    return true;


  } catch (error) {

    console.error(
      "VYORA delete trip error:",
      error
    );


    showToast(
      "Delete failed",
      error.message ||
        "Unable to delete journey."
    );


    return false;

  }

}


/* =========================================================
   MY JOURNEYS UI
========================================================= */

function getJourneyDestinationData(
  destination
) {

  const match =
    findDestination(
      destination
    );


  return match
    ? destinationDatabase[match]
    : null;

}


function getJourneyImage(
  destination
) {

  const data =
    getJourneyDestinationData(
      destination
    );


  return data?.image ||
    "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1000&q=85";

}


function journeyDateRange(
  trip
) {

  const start =
    String(
      trip.start_date ||
      trip.startDate ||
      ""
    ).slice(
      0,
      10
    );


  const end =
    String(
      trip.end_date ||
      trip.endDate ||
      ""
    ).slice(
      0,
      10
    );


  if (
    start &&
    end
  ) {

    return `${formatDate(start)} → ${formatDate(end)}`;

  }


  return "Flexible dates";

}


function renderMyJourneys(
  trips
) {

  const grid =
    $("#myJourneysGrid");

  const empty =
    $("#myJourneysEmpty");


  if (!grid || !empty) {

    return;

  }


  grid.innerHTML = "";


  if (
    !Array.isArray(trips) ||
    trips.length === 0
  ) {

    grid.hidden =
      true;

    empty.hidden =
      false;

    return;

  }


  grid.hidden =
    false;

  empty.hidden =
    true;


  trips.forEach(
    (trip, index) => {

      const destination =
        trip.destination ||
        "Your journey";


      const tripId =
        trip.id;


      const interests =
        Array.isArray(
          trip.interests
        )
          ? trip.interests
          : [];


      const days =
        Number(
          trip.days
        ) || calculateTripDays(
          trip.start_date,
          trip.end_date
        );


      const budget =
        Number(
          trip.budget
        ) || 0;


      const article =
        document.createElement(
          "article"
        );


      article.className =
        "my-journey-card reveal visible";


      article.innerHTML = `

        <div
          class="my-journey-image"
          style="background-image:
            url('${escapeHTML(
              getJourneyImage(
                destination
              )
            )}')"
        >

          <span class="my-journey-index">
            JOURNEY ${
              String(
                index + 1
              ).padStart(
                2,
                "0"
              )
            }
          </span>


          <span class="my-journey-date">

            ${escapeHTML(
              journeyDateRange(
                trip
              )
            )}

          </span>

        </div>


        <div class="my-journey-body">

          <span class="journey-location">

            VYORA SAVED JOURNEY

          </span>


          <h3>
            ${escapeHTML(
              destination
            )}
          </h3>


          <div class="my-journey-meta">

            <span>
              ${days}
              day${days === 1 ? "" : "s"}
            </span>


            <span>
              ${formatCurrency(
                budget
              )}
            </span>


            ${
              interests.length
                ? `
                  <span>
                    ${escapeHTML(
                      interests
                        .slice(
                          0,
                          2
                        )
                        .join(
                          " · "
                        )
                    )}
                  </span>
                `
                : ""
            }

          </div>


          <div class="my-journey-actions">

            <button
              class="my-journey-open"
              type="button"
              data-action="open"
              data-trip-id="${escapeHTML(
                String(tripId)
              )}"
            >
            <div class="my-journey-actions">

  <button
    class="my-journey-open"
    type="button"
    data-action="open"
    data-trip-id="${escapeHTML(
      String(tripId)
    )}"
  >
    Open journey →
  </button>

  <button
    class="my-journey-edit"
    type="button"
    data-action="edit"
    data-trip-id="${escapeHTML(
      String(tripId)
    )}"
  >
    Edit
  </button>

  <button
    class="my-journey-delete"
    type="button"
    data-action="delete"
    data-trip-id="${escapeHTML(
      String(tripId)
    )}"
  >
    Delete
  </button>

</div>
              type="button"
              data-action="delete"
              data-trip-id="${escapeHTML(
                String(tripId)
              )}"
            >
              Delete
            </button>

          </div>

        </div>

      `;


      grid.appendChild(
        article
      );

    }
  );


  updateActiveNav();

}


async function refreshMyJourneys(
  showLoading = true
) {

  const user =
    getLoggedInUser();


  const section =
    $("#myJourneys");


  const loading =
    $("#myJourneysLoading");


  if (!section) {

    return [];

  }


  if (!user) {

    section.hidden =
      true;

    if (loading) {

      loading.hidden =
        true;

    }

    updateActiveNav();

    return [];

  }


  section.hidden =
    false;


  if (loading) {

    loading.hidden =
      !showLoading;

  }


  const trips =
    await getMyTrips();


  renderMyJourneys(
    trips
  );


  if (loading) {

    loading.hidden =
      true;

  }


  updateActiveNav();


  return trips;

}

/* =========================================================
   RENDER SAVED TRIP ITINERARY
========================================================= */

function renderSavedTripItinerary(
  itinerary
) {

  const timeline =
    $("#itineraryTimeline");


  if (!timeline) {

    return;

  }


  if (
    !Array.isArray(itinerary) ||
    itinerary.length === 0
  ) {

    renderItinerary();

    return;

  }


  let html =
    "";


  itinerary.forEach(
    (dayData, index) => {

      const dayNumber =
        Number(
          dayData.day
        ) ||
        index + 1;


      const date =
        dayData.date ||
        getDateAfter(
          currentJourney.startDate,
          dayNumber - 1
        );


      const destination =
        dayData.destination ||
        currentJourney.destination;


      const activities =
        Array.isArray(
          dayData.activities
        )
          ? dayData.activities
          : [];


      html += `

        <article
          class="day-card reveal visible saved-day-card"
        >

          <div class="day-header">

            <div>

              <strong>
                DAY
                ${String(
                  dayNumber
                ).padStart(
                  2,
                  "0"
                )}
              </strong>

              <small
                class="itinerary-calendar-date"
              >
                ${escapeHTML(
                  formatDate(
                    date
                  )
                )}
              </small>

            </div>

            <span>
              ${escapeHTML(
                destination
              )}
            </span>

          </div>


          ${
            activities.length
              ? activities
                  .map(
                    (activity) =>
                      createActivityHTML(
                        activity.period ||
                          "Experience",
                        {
                          name:
                            activity.name ||
                            "VYORA Experience",

                          description:
                            activity.description ||
                            "A saved journey experience.",

                          cost:
                            Number(
                              activity.cost
                            ) || 0,

                          time:
                            activity.time ||
                            "Flexible",

                          travel:
                            activity.travel ||
                            "—"
                        }
                      )
                  )
                  .join("")
              : `
                <div class="empty-itinerary">

                  <div>
                    ✦
                  </div>

                  <strong>
                    No activities saved for this day.
                  </strong>

                  <p>
                    VYORA can rebuild this journey
                    from the planner.
                  </p>

                </div>
              `
          }

        </article>

      `;

    }
  );


  timeline.innerHTML =
    html;

}


/* =========================================================
   SAVED TRIP DETAILS
========================================================= */

function renderSavedTripDetails(
  trip
) {

  const section =
    $("#itinerary");

  const timeline =
    $("#itineraryTimeline");


  if (
    !section ||
    !timeline ||
    !trip
  ) {

    return;

  }


  let panel =
    $("#savedTripDetails");


  /*
    Create the details panel only once.
  */

  if (!panel) {

    panel =
      document.createElement(
        "div"
      );


    panel.id =
      "savedTripDetails";


    panel.className =
      "saved-trip-details";


    timeline.parentNode.insertBefore(
      panel,
      timeline
    );

  }


  const interests =
    Array.isArray(
      trip.interests
    )
      ? trip.interests
      : [];


  const startDate =
    String(
      trip.start_date ||
      trip.startDate ||
      ""
    ).slice(
      0,
      10
    );


  const endDate =
    String(
      trip.end_date ||
      trip.endDate ||
      ""
    ).slice(
      0,
      10
    );


  const days =
    Number(
      trip.days
    ) ||
    calculateTripDays(
      startDate,
      endDate
    );


  const budget =
    Number(
      trip.budget
    ) || 0;


  const destination =
    trip.destination ||
    currentJourney.destination ||
    "Your journey";


  panel.innerHTML = `

    <div class="saved-trip-details-header">

      <div>

        <span class="saved-trip-eyebrow">
          SAVED JOURNEY
        </span>

        <h3>
          ${escapeHTML(
            destination
          )}
        </h3>

        <p>
          Your saved VYORA journey,
          synced from your account.
        </p>

      </div>


      <div class="saved-trip-status">

        <span></span>

        SAVED

      </div>

    </div>


    <div class="saved-trip-details-grid">

      <div class="saved-trip-detail">

        <span class="saved-trip-detail-label">
          TRAVEL DATES
        </span>

        <strong>

          ${
            startDate &&
            endDate

              ? `${escapeHTML(
                  formatDate(
                    startDate
                  )
                )} → ${escapeHTML(
                  formatDate(
                    endDate
                  )
                )}`

              : "Flexible dates"
          }

        </strong>

      </div>


      <div class="saved-trip-detail">

        <span class="saved-trip-detail-label">
          DURATION
        </span>

        <strong>

          ${days}

          day${
            days === 1
              ? ""
              : "s"
          }

        </strong>

      </div>


      <div class="saved-trip-detail">

        <span class="saved-trip-detail-label">
          BUDGET
        </span>

        <strong>

          ${formatCurrency(
            budget
          )}

        </strong>

      </div>


      <div class="saved-trip-detail">

        <span class="saved-trip-detail-label">
          INTERESTS
        </span>

        <strong>

          ${
            interests.length

              ? escapeHTML(
                  interests
                    .slice(
                      0,
                      3
                    )
                    .join(
                      " · "
                    )
                )

              : "Balanced exploration"
          }

        </strong>

      </div>

    </div>

  `;

}
async function openSavedTrip(
  tripId
) {

  /* -------------------------------------------------------
     Get the actual saved trip from PostgreSQL
     ------------------------------------------------------- */

  const trip =
    await getTrip(
      tripId
    );


  if (!trip) {

    showToast(
      "Journey unavailable",
      "VYORA could not load this saved journey."
    );

    return;

  }


  /* -------------------------------------------------------
     Normalize saved trip data
     ------------------------------------------------------- */

  const interests =
    Array.isArray(
      trip.interests
    )
      ? trip.interests
      : [];


  const itinerary =
    Array.isArray(
      trip.itinerary
    )
      ? trip.itinerary
      : [];


  const startDate =
    String(
      trip.start_date ||
      trip.startDate ||
      ""
    ).slice(
      0,
      10
    );


  const endDate =
    String(
      trip.end_date ||
      trip.endDate ||
      ""
    ).slice(
      0,
      10
    );


  const days =
    Number(
      trip.days
    ) ||
    calculateTripDays(
      startDate,
      endDate
    );


  const budget =
    Number(
      trip.budget
    ) || 0;


  /* -------------------------------------------------------
     Restore the saved journey into global state
     ------------------------------------------------------- */

  currentJourney = {

    tripId:
      trip.id,

    destination:
      trip.destination ||
      "",

    startDate,

    endDate,

    days,

    budget,

    interests

  };


  /* -------------------------------------------------------
     Restore planner controls
     ------------------------------------------------------- */

  restoreJourneyToForm();


  /* -------------------------------------------------------
     Render actual saved trip details
     ------------------------------------------------------- */

  renderSavedTripDetails(
    trip
  );


  /* -------------------------------------------------------
     Render actual saved PostgreSQL itinerary
     ------------------------------------------------------- */

  if (
    itinerary.length
  ) {

    renderSavedTripItinerary(
      itinerary
    );

  } else {

    renderItinerary();

  }


  /* -------------------------------------------------------
     Refresh journey summary
     ------------------------------------------------------- */

  updateJourneyHeader();

  updateBudget();


  /* -------------------------------------------------------
     Keep local fallback in sync
     ------------------------------------------------------- */

  saveTripLocally();


  /* -------------------------------------------------------
     User feedback
     ------------------------------------------------------- */

  showToast(
    "Journey loaded",
    `${currentJourney.destination} is ready to explore again.`
  );


  /* -------------------------------------------------------
     Scroll directly to the opened journey
     ------------------------------------------------------- */

  $("#itinerary")
    ?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });


  /* -------------------------------------------------------
     Debug confirmation
     ------------------------------------------------------- */

  console.log(
    "VYORA opened saved trip:",
    trip
  );

}

async function handleJourneyDelete(
  tripId
) {

  const deleted =
    await deleteTrip(
      tripId
    );


  if (!deleted) {

    return;

  }


  await refreshMyJourneys(
    false
  );

}


/* =========================================================
   SHARE
========================================================= */

async function shareTrip() {

  if (
    !currentJourney.destination
  ) {

    showToast(
      "Nothing to share",
      "Generate a journey first."
    );

    return;

  }


  let text =
    `My VYORA journey: ${currentJourney.destination}`;


  if (
    currentJourney.startDate &&
    currentJourney.endDate
  ) {

    text +=
      ` · ${formatDate(
        currentJourney.startDate
      )} → ${formatDate(
        currentJourney.endDate
      )}`;

  }


  text +=
    ` · ${formatCurrency(
      currentJourney.budget
    )} budget.`;


  try {

    if (
      navigator.share
    ) {

      await navigator.share({

        title:
          "My VYORA Journey",

        text,

        url:
          window.location.href

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

    if (
      error.name !==
      "AbortError"
    ) {

      showToast(
        "Share unavailable",
        "Your browser could not complete the share."
      );

    }

  }

}


/* =========================================================
   HOTELS
========================================================= */

function toggleFavorite(
  button
) {

  if (!button) {

    return;

  }


  const active =
    button.classList.toggle(
      "favorite"
    );


  button.textContent =
    active
      ? "♥"
      : "♡";


  showToast(
    active
      ? "Saved"
      : "Removed",

    active
      ? "Hotel added to your saved places."
      : "Hotel removed from saved places."
  );

}


function showHotelDemo(
  hotelName
) {

  openModal(
    hotelName,
    "This is VYORA prototype hotel data. Live availability, room selection, booking and dynamic pricing can be connected through secure APIs."
  );

}


/* =========================================================
   EXPERIENCES
========================================================= */

const experiences = {

  "Local food": {

    title:
      "Follow the flavour.",

    text:
      "Discover local dishes, regional cafés, street food and signature food trails."

  },

  Culture: {

    title:
      "See the culture.",

    text:
      "Explore traditions, museums, crafts, festivals and local stories."

  },

  Markets: {

    title:
      "Walk the market.",

    text:
      "Find neighbourhood markets, local products, crafts and evening street life."

  },

  "Hidden places": {

    title:
      "Go beyond the obvious.",

    text:
      "Discover quieter places and alternative experiences away from the standard route."

  },

  Adventure: {

    title:
      "Make it memorable.",

    text:
      "VYORA can adapt activities around your preferred pace and interests."

  }

};


function showExperience(
  type
) {

  const data =
    experiences[type];


  if (!data) {

    return;

  }


  if ($("#experienceTitle")) {

    $("#experienceTitle")
      .textContent =
      data.title;

  }


  if ($("#experienceText")) {

    $("#experienceText")
      .textContent =
      data.text;

  }

}


/* =========================================================
   MAP
========================================================= */

function mapPin(
  type
) {

  showToast(
    `${type} selected`,
    `VYORA selected a prototype ${type.toLowerCase()} location.`
  );

}


/* =========================================================
   AI ASSISTANT
========================================================= */

function openAssistant() {

  const chat =
    $("#chatWindow");


  if (!chat) {

    return;

  }


  chat.classList.add(
    "open"
  );


  setTimeout(
    () => {

      $("#chatInput")
        ?.focus();

    },
    150
  );

}


function closeAssistant() {

  $("#chatWindow")
    ?.classList.remove(
      "open"
    );

}


function sendSuggestedMessage(
  message
) {

  const input =
    $("#chatInput");


  if (!input) {

    return;

  }


  input.value =
    message;


  sendMessage();

}


function addMessage(
  content,
  type
) {

  const messages =
    $("#chatMessages");


  if (!messages) {

    return;

  }


  if (
    type ===
    "user"
  ) {

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

          <span class="message-avatar">
            ✦
          </span>

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


function getAssistantResponse(
  message
) {

  const text =
    message
      .toLowerCase()
      .trim();


  if (
    text.includes("goa") ||
    text.includes("beach")
  ) {

    return `

      Goa is a strong match for
      beaches, food, coastal experiences
      and nightlife.

      <br><br>

      Tell me your dates and budget,
      and VYORA can shape the route.

      <br><br>

      <small>
        Prototype travel intelligence.
      </small>

    `;

  }


  if (
    text.includes("kerala") ||
    text.includes("nature") ||
    text.includes("backwater")
  ) {

    return `

      Kerala can be built around
      backwaters, hills, local food,
      nature and slower travel.

      <br><br>

      VYORA can balance Kochi,
      Munnar and Alleppey-style
      experiences around your dates.

      <br><br>

      <small>
        Prototype travel intelligence.
      </small>

    `;

  }


  if (
    text.includes("rajasthan") ||
    text.includes("history") ||
    text.includes("culture")
  ) {

    return `

      Rajasthan can be shaped around
      forts, palaces, markets,
      food and heritage experiences.

      <br><br>

      <small>
        Prototype travel intelligence.
      </small>

    `;

  }


  if (
    text.includes("cheap") ||
    text.includes("cheaper") ||
    text.includes("budget")
  ) {

    return `

      VYORA would look at the complete
      journey instead of cutting one thing.

      Accommodation, route distance,
      activities and food can all be
      balanced around your budget.

      <br><br>

      <small>
        Prototype optimization logic.
      </small>

    `;

  }


  if (
    text.includes("hidden") ||
    text.includes("gem")
  ) {

    return `

      Go beyond the obvious.

      VYORA can prioritize quieter
      neighbourhoods, local markets,
      food spots and alternative experiences.

      <br><br>

      <small>
        Prototype discovery logic.
      </small>

    `;

  }


  return `

    I'm currently in VYORA prototype mode.

    Try asking me about Goa, Kerala,
    Rajasthan, budgets or hidden gems.

  `;

}


function sendMessage() {

  const input =
    $("#chatInput");

  const messages =
    $("#chatMessages");


  if (
    !input ||
    !messages
  ) {

    return;

  }


  const message =
    input.value.trim();


  if (!message) {

    return;

  }


  addMessage(
    escapeHTML(message),
    "user"
  );


  input.value =
    "";


  const typingId =
    `typing-${Date.now()}`;


  messages.insertAdjacentHTML(
    "beforeend",
    `

      <div
        class="bot-message"
        id="${typingId}"
      >

        <span class="message-avatar">
          ✦
        </span>

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


  setTimeout(
    () => {

      document
        .getElementById(
          typingId
        )
        ?.remove();


      addMessage(
        getAssistantResponse(
          message
        ),
        "bot"
      );

    },
    800
  );

}


/* =========================================================
   GENERAL MODAL
========================================================= */

function openModal(
  title,
  text
) {

  const backdrop =
    $("#modalBackdrop");


  if (!backdrop) {

    return;

  }


  if ($("#modalTitle")) {

    $("#modalTitle")
      .textContent =
      title;

  }


  if ($("#modalText")) {

    $("#modalText")
      .textContent =
      text;

  }


  backdrop.classList.add(
    "open"
  );

}


function closeModal() {

  $("#modalBackdrop")
    ?.classList.remove(
      "open"
    );

}


function showPrototypeNotice() {

  openModal(
    "VYORA prototype",
    "This section demonstrates the VYORA product experience. Live availability, booking, maps, pricing and external AI services can be integrated through the backend."
  );

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
  title,
  text
) {

  const toast =
    $("#toast");


  if (!toast) {

    return;

  }


  const titleElement =
    $("#toastTitle");

  const textElement =
    $("#toastText");


  if (titleElement) {

    titleElement
      .textContent =
      title;

  }


  if (textElement) {

    textElement
      .textContent =
      text;

  }


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      3500
    );

}


/* =========================================================
   AUTH MODAL
========================================================= */

function openAuthModal(
  mode = "login"
) {

  const backdrop =
    $("#authBackdrop");


  if (!backdrop) {

    return;

  }


  backdrop.classList.add(
    "open"
  );


  backdrop.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.classList.add(
    "no-scroll"
  );


  switchAuthMode(
    mode
  );


  setTimeout(
    () => {

      if (
        mode ===
        "register"
      ) {

        $("#registerUsername")
          ?.focus();

      } else {

        $("#loginEmail")
          ?.focus();

      }

    },
    180
  );

}


function closeAuthModal() {

  const backdrop =
    $("#authBackdrop");


  if (!backdrop) {

    return;

  }


  backdrop.classList.remove(
    "open"
  );


  backdrop.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.classList.remove(
    "no-scroll"
  );


  setAuthMessage(
    ""
  );

}


function switchAuthMode(
  mode
) {

  const loginForm =
    $("#loginForm");

  const registerForm =
    $("#registerForm");

  const label =
    $("#authModeLabel");

  const title =
    $("#authTitle");

  const subtitle =
    $("#authSubtitle");

  const switchBox =
    $("#authSwitch");


  if (
    !loginForm ||
    !registerForm
  ) {

    return;

  }


  if (
    mode ===
    "register"
  ) {

    loginForm.hidden =
      true;

    registerForm.hidden =
      false;


    if (label) {

      label.textContent =
        "START YOUR JOURNEY";

    }


    if (title) {

      title.textContent =
        "Create your VYORA.";

    }


    if (subtitle) {

      subtitle.textContent =
        "One account. Your journeys, your way.";

    }


    if (switchBox) {

      switchBox.innerHTML = `

        <span>
          Already have an account?
        </span>

        <button
          type="button"
          onclick="switchAuthMode('login')"
        >
          Sign in
        </button>

      `;

    }

  } else {

    loginForm.hidden =
      false;

    registerForm.hidden =
      true;


    if (label) {

      label.textContent =
        "WELCOME BACK";

    }


    if (title) {

      title.textContent =
        "Sign in to VYORA.";

    }


    if (subtitle) {

      subtitle.textContent =
        "Your next journey starts here.";

    }


    if (switchBox) {

      switchBox.innerHTML = `

        <span>
          Don't have an account?
        </span>

        <button
          type="button"
          onclick="switchAuthMode('register')"
        >
          Create account
        </button>

      `;

    }

  }


  setAuthMessage(
    ""
  );

}


function setAuthMessage(
  message,
  type = ""
) {

  const element =
    $("#authMessage");


  if (!element) {

    return;

  }


  element.textContent =
    message;


  element.className =
    `auth-message ${type}`;

}


/* =========================================================
   AUTH — LOGIN
========================================================= */

async function handleLogin(
  event
) {

  event.preventDefault();


  const email =
    $("#loginEmail")
      ?.value
      .trim()
      .toLowerCase();

  const password =
    $("#loginPassword")
      ?.value;

  const button =
    $("#loginSubmit");


  if (
    !email ||
    !password
  ) {

    setAuthMessage(
      "Enter your email and password.",
      "error"
    );

    return;

  }


  if (button) {

    button.disabled =
      true;

    button.innerHTML = `
      <span>
        Signing in...
      </span>
      <strong>•</strong>
    `;

  }


  setAuthMessage(
    "Connecting to VYORA...",
    "loading"
  );


  try {

    const response =
      await fetch(
        `${VYORA_API}/login`,
        {

          method:
            "POST",

          credentials:
            "include",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({
              email,
              password
            })

        }
      );


    let data = {};


    try {

      data =
        await response.json();

    } catch {

      data = {};

    }


    if (!response.ok) {

      throw new Error(
        data.message ||
        data.error ||
        "Login failed."
      );

    }


    const user =
      data.user || {

        username:
          data.username ||
          email.split("@")[0],

        email:
          data.email ||
          email

      };


    currentUser =
      user;


    localStorage.setItem(
      "vyoraUser",
      JSON.stringify(
        user
      )
    );


    updateAuthUI();


    closeAuthModal();


    showToast(
      "Welcome back",
      `Good to see you, ${
        user.username ||
        "traveller"
      }.`
    );


    await refreshMyJourneys(
      true
    );


    console.log(
      "VYORA login successful:",
      data
    );


  } catch (error) {

    console.error(
      "VYORA login error:",
      error
    );


    setAuthMessage(
      error.message ||
      "Unable to connect to VYORA backend.",
      "error"
    );


  } finally {

    if (button) {

      button.disabled =
        false;

      button.innerHTML = `

        <span>
          Sign in securely
        </span>

        <strong>
          →
        </strong>

      `;

    }

  }

}


/* =========================================================
   AUTH — REGISTER
========================================================= */

async function handleRegister(
  event
) {

  event.preventDefault();


  const username =
    $("#registerUsername")
      ?.value
      .trim();

  const email =
    $("#registerEmail")
      ?.value
      .trim()
      .toLowerCase();

  const phone =
    $("#registerPhone")
      ?.value
      .trim();

  const password =
    $("#registerPassword")
      ?.value;

  const button =
    $("#registerSubmit");


  if (
    !username ||
    !email ||
    !password
  ) {

    setAuthMessage(
      "Complete all required fields.",
      "error"
    );

    return;

  }


  if (
    username.length <
    3
  ) {

    setAuthMessage(
      "Username must contain at least 3 characters.",
      "error"
    );

    return;

  }


  if (
    password.length <
    8
  ) {

    setAuthMessage(
      "Password must contain at least 8 characters.",
      "error"
    );

    return;

  }


  if (
    phone &&
    !/^\d{10}$/.test(
      phone
    )
  ) {

    setAuthMessage(
      "Enter a valid 10-digit phone number.",
      "error"
    );

    return;

  }


  if (button) {

    button.disabled =
      true;

    button.innerHTML = `
      <span>
        Creating account...
      </span>
      <strong>•</strong>
    `;

  }


  setAuthMessage(
    "Creating your VYORA account...",
    "loading"
  );


  try {

    const response =
      await fetch(
        `${VYORA_API}/register`,
        {

          method:
            "POST",

          credentials:
            "include",

          headers: {
            "Content-Type":
              "application/json"
          },

          body:
            JSON.stringify({

              username,

              email,

              phone:
                phone ||
                null,

              password

            })

        }
      );


    let data = {};


    try {

      data =
        await response.json();

    } catch {

      data = {};

    }


    if (!response.ok) {

      throw new Error(
        data.message ||
        data.error ||
        "Registration failed."
      );

    }


    console.log(
      "VYORA registration successful:",
      data
    );


    if (
      data.user
    ) {

      currentUser =
        data.user;


      localStorage.setItem(
        "vyoraUser",
        JSON.stringify(
          data.user
        )
      );


      updateAuthUI();


      $("#registerForm")
        ?.reset();


      closeAuthModal();


      showToast(
        "Account created",
        `Welcome to VYORA, ${
          data.user.username ||
          username
        }.`
      );


      await refreshMyJourneys(
        true
      );


      return;

    }


    $("#registerForm")
      ?.reset();


    switchAuthMode(
      "login"
    );


    const loginEmail =
      $("#loginEmail");


    if (loginEmail) {

      loginEmail.value =
        email;

    }


    setAuthMessage(
      "Account created successfully. Sign in to continue.",
      "success"
    );


  } catch (error) {

    console.error(
      "VYORA registration error:",
      error
    );


    setAuthMessage(
      error.message ||
      "Unable to create your VYORA account.",
      "error"
    );


  } finally {

    if (button) {

      button.disabled =
        false;

      button.innerHTML = `

        <span>
          Create my VYORA account
        </span>

        <strong>
          →
        </strong>

      `;

    }

  }

}


/* =========================================================
   AUTH — SESSION
========================================================= */

function getLoggedInUser() {

  const saved =
    localStorage.getItem(
      "vyoraUser"
    );


  if (!saved) {

    return null;

  }


  try {

    const user =
      JSON.parse(
        saved
      );


    if (
      !user ||
      typeof user !==
        "object"
    ) {

      throw new Error(
        "Invalid user session"
      );

    }


    return user;


  } catch (error) {

    console.error(
      "VYORA session error:",
      error
    );


    currentUser =
      null;


    localStorage.removeItem(
      "vyoraUser"
    );


    return null;

  }

}


/* =========================================================
   VERIFY REAL BACKEND SESSION
========================================================= */

async function syncAuthSession() {

  try {

    const response =
      await fetch(
        `${VYORA_API}/me`,
        {

          method:
            "GET",

          credentials:
            "include",

          cache:
            "no-store"

        }
      );


    if (!response.ok) {

      /*
        Only remove the local user when
        the backend explicitly says the
        session is invalid.
      */

      if (
        response.status ===
        401
      ) {

        currentUser =
          null;

        localStorage.removeItem(
          "vyoraUser"
        );

        updateAuthUI();

      }

      return null;

    }


    const data =
      await response.json();


    if (
      data.user
    ) {

      currentUser =
        data.user;


      localStorage.setItem(
        "vyoraUser",
        JSON.stringify(
          data.user
        )
      );


      updateAuthUI();


      return data.user;

    }


    return null;


  } catch (error) {

    console.warn(
      "VYORA session check failed:",
      error.message
    );


    /*
      Keep the locally stored session when
      the backend is temporarily unreachable.
      This prevents a network issue from
      immediately destroying the UI state.
    */

    return currentUser;

  }

}


/* =========================================================
   AUTH UI
========================================================= */

function updateAuthUI() {

  const isLoggedIn =
    !!currentUser;


  /* -------------------------------------------------------
     Existing Login / Register buttons
  ------------------------------------------------------- */

  document
    .querySelectorAll(
      ".login-btn, .nav-cta"
    )
    .forEach(
      (button) => {

        button.style.display =
          isLoggedIn
            ? "none"
            : "";

      }
    );


  /* -------------------------------------------------------
     User container
  ------------------------------------------------------- */

  let navUser =
    document.getElementById(
      "navUser"
    );

  let navUsername =
    document.getElementById(
      "navUsername"
    );


  /* -------------------------------------------------------
     Find a suitable navbar container
  ------------------------------------------------------- */

  const navContainer =
    document.querySelector(
      ".nav-actions"
    ) ||
    document.querySelector(
      ".nav-right"
    ) ||
    document.querySelector(
      ".navbar"
    );


  /* -------------------------------------------------------
     Create user area if it doesn't exist
  ------------------------------------------------------- */

  if (
    !navUser &&
    navContainer
  ) {

    navUser =
      document.createElement(
        "div"
      );

    navUser.id =
      "navUser";

    navUser.style.display =
      "none";

    navUser.style.alignItems =
      "center";

    navUser.style.gap =
      "10px";


    navUsername =
      document.createElement(
        "span"
      );

    navUsername.id =
      "navUsername";


    navUser.appendChild(
      navUsername
    );


    navContainer.appendChild(
      navUser
    );

  }


  /* -------------------------------------------------------
     Create Logout button if missing
  ------------------------------------------------------- */

  if (
    navUser &&
    !navUser.querySelector(
      ".logout-btn"
    )
  ) {

    const logoutButton =
      document.createElement(
        "button"
      );


    logoutButton.type =
      "button";


    logoutButton.className =
      "logout-btn";


    logoutButton.textContent =
      "Logout";


    logoutButton.style.cursor =
      "pointer";


    logoutButton.addEventListener(
      "click",
      handleVyoraLogout
    );


    navUser.appendChild(
      logoutButton
    );

  }


  /* -------------------------------------------------------
     Update user visibility
  ------------------------------------------------------- */

  if (navUser) {

    navUser.style.display =
      isLoggedIn
        ? "flex"
        : "none";

  }


  /* -------------------------------------------------------
     Update username
  ------------------------------------------------------- */

  if (navUsername) {

    navUsername.textContent =
      currentUser?.username ||
      currentUser?.name ||
      currentUser?.email ||
      "Traveler";

  }


  /* -------------------------------------------------------
     My Journeys visibility
  ------------------------------------------------------- */

  document
    .querySelectorAll(
      "#myJourneysLink, .my-journeys-link"
    )
    .forEach(
      (link) => {

        link.style.display =
          isLoggedIn
            ? ""
            : "none";

      }
    );

}


async function handleVyoraLogout() {

  try {

    await fetch(
      `${VYORA_API}/logout`,
      {
        method:
          "POST",
        credentials:
          "include"
      }
    );

  } catch (error) {

    console.warn(
      "VYORA logout request failed:",
      error
    );

  }


  currentUser =
    null;


  localStorage.removeItem(
    "vyoraUser"
  );


  currentJourney = {

    tripId: null,

    destination: "",

    startDate: "",

    endDate: "",

    days: 0,

    budget: 0,

    interests: []

  };


  updateAuthUI();


  if (
    typeof refreshMyJourneys ===
    "function"
  ) {

    refreshMyJourneys(
      true
    );

  }


  if (
    typeof showToast ===
    "function"
  ) {

    showToast(
      "Logged out successfully.",
      "Your VYORA session has been closed."
    );

  }

}


/* =========================================================
   MODALS
========================================================= */

function setupModals() {

  $("#authBackdrop")
    ?.addEventListener(
      "click",
      (event) => {

        if (
          event.target ===
          $("#authBackdrop")
        ) {

          closeAuthModal();

        }

      }
    );


  $("#modalBackdrop")
    ?.addEventListener(
      "click",
      (event) => {

        if (
          event.target ===
          $("#modalBackdrop")
        ) {

          closeModal();

        }

      }
    );


  $("#myJourneysGrid")
    ?.addEventListener(
      "click",
      async (event) => {

        const button =
          event.target.closest(
            "button[data-action]"
          );


        if (!button) {

          return;

        }


        const action =
          button.dataset.action;

        const tripId =
          button.dataset.tripId;


       if (
  action ===
  "open"
) {

  await openSavedTrip(
    tripId
  );

}


if (
  action ===
  "edit"
) {

  await editSavedTrip(
    tripId
  );

}


if (
  action ===
  "delete"
) {

  await handleJourneyDelete(
    tripId
  );

}

      }
    );


  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key ===
        "Escape"
      ) {

        closeAuthModal();

        closeModal();

        closeAssistant();

        closeMobileMenu();

      }

    }
  );

}


/* =========================================================
   FORM UX
========================================================= */

function setupFormUX() {

  const numericInputs = [

    "#budgetInput",

    "#plannerBudget"

  ];


  numericInputs.forEach(
    (selector) => {

      $(selector)
        ?.addEventListener(
          "input",
          (event) => {

            if (
              Number(
                event.target.value
              ) < 0
            ) {

              event.target.value =
                "";

            }

          }
        );

    }
  );


  $("#registerPhone")
    ?.addEventListener(
      "input",
      (event) => {

        event.target.value =
          event.target.value
            .replace(
              /\D/g,
              ""
            )
            .slice(
              0,
              10
            );

      }
    );

}


/* =========================================================
   KERALA IMAGE FALLBACK
========================================================= */

function setupImageFallback() {

  const kerala =
    $(".bg-kerala");


  if (!kerala) {

    return;

  }


  const primary =
    "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1400&q=90";


  const fallback =
    "https://wanderon-images.gumlet.io/blogs/new/2024/03/kerala-backwaters.jpg";


  const image =
    new Image();


  image.onload =
    () => {

      kerala.style.backgroundImage = `

        linear-gradient(
          transparent 30%,
          rgba(0,0,0,.78)
        ),

        url("${primary}")

      `;

    };


  image.onerror =
    () => {

      kerala.style.backgroundImage = `

        linear-gradient(
          transparent,
          rgba(0,0,0,.76)
        ),

        url("${fallback}")

      `;

    };


  image.src =
    primary;

}


/* =========================================================
   RIPPLE
========================================================= */

function setupRipple() {

  document.addEventListener(
    "click",
    (event) => {

      const button =
        event.target.closest(
          "button"
        );


      if (!button) {

        return;

      }


      const rect =
        button.getBoundingClientRect();


      const ripple =
        document.createElement(
          "span"
        );


      ripple.className =
        "vyora-ripple";


      ripple.style.left =
        `${event.clientX -
          rect.left}px`;


      ripple.style.top =
        `${event.clientY -
          rect.top}px`;


      button.appendChild(
        ripple
      );


      setTimeout(
        () => {

          ripple.remove();

        },
        500
      );

    }
  );

}


/* =========================================================
   AUTOCOMPLETE — DESTINATIONS
========================================================= */

function setupDestinationSearch() {

  const inputs = [

    $("#destinationInput"),

    $("#plannerDestination")

  ];


  inputs.forEach(
    (input) => {

      if (!input) {

        return;

      }


      input.addEventListener(
        "input",
        () => {

          const value =
            input.value
              .trim()
              .toLowerCase();


          if (!value) {

            input.removeAttribute(
              "data-suggestions"
            );

            return;

          }


          const matches =
            Object.keys(
              destinationDatabase
            )
            .filter(
              (destination) =>
                destination
                  .toLowerCase()
                  .includes(
                    value
                  )
            )
            .slice(
              0,
              4
            );


          if (
            matches.length &&
            value.length >=
              2
          ) {

            input.setAttribute(
              "data-suggestions",
              matches.join(
                " • "
              )
            );

          } else {

            input.removeAttribute(
              "data-suggestions"
            );

          }

        }
      );

    }
  );

}


/* =========================================================
   REVEAL ANIMATIONS
========================================================= */

function setupReveal() {

  const elements =
    document.querySelectorAll(
      ".reveal, [data-reveal], .fade-in, .animate-on-scroll"
    );


  if (!elements.length) {

    return;

  }


  const observer =
    new IntersectionObserver(
      (entries) => {

        entries.forEach(
          (entry) => {

            if (
              entry.isIntersecting
            ) {

              entry.target.classList.add(
                "visible",
                "revealed"
              );


              observer.unobserve(
                entry.target
              );

            }

          }
        );

      },
      {
        threshold:
          0.1
      }
    );


  elements.forEach(
    (element) => {

      observer.observe(
        element
      );

    }
  );

}


/* =========================================================
   COUNTER ANIMATIONS
========================================================= */

function setupCounters() {

  const counters =
    document.querySelectorAll(
      "[data-count], .counter, .stat-number"
    );


  if (!counters.length) {

    return;

  }


  const animateCounter =
    (element) => {

      const targetText =
        element.getAttribute(
          "data-count"
        ) ||
        element.textContent;


      const target =
        parseInt(
          targetText.replace(
            /[^\d]/g,
            ""
          ),
          10
        );


      if (
        isNaN(
          target
        )
      ) {

        return;

      }


      const duration =
        1200;


      const startTime =
        performance.now();


      const update =
        (currentTime) => {

          const progress =
            Math.min(
              (
                currentTime -
                startTime
              ) /
              duration,
              1
            );


          const eased =
            1 -
            Math.pow(
              1 -
                progress,
              3
            );


          element.textContent =
            Math.floor(
              target *
              eased
            );


          if (
            progress <
            1
          ) {

            requestAnimationFrame(
              update
            );

          } else {

            element.textContent =
              target;

          }

        };


      requestAnimationFrame(
        update
      );

    };


  const observer =
    new IntersectionObserver(
      (entries, obs) => {

        entries.forEach(
          (entry) => {

            if (
              entry.isIntersecting
            ) {

              animateCounter(
                entry.target
              );


              obs.unobserve(
                entry.target
              );

            }

          }
        );

      },
      {
        threshold:
          0.2
      }
    );


  counters.forEach(
    (counter) => {

      observer.observe(
        counter
      );

    }
  );

}


/* =========================================================
   TILT INTERACTION
========================================================= */

function setupTilt() {

  const elements =
    document.querySelectorAll(
      "[data-tilt], .tilt-card, .destination-card"
    );


  if (!elements.length) {

    return;

  }


  elements.forEach(
    (element) => {

      element.addEventListener(
        "mousemove",
        (event) => {

          const rect =
            element.getBoundingClientRect();


          const x =
            event.clientX -
            rect.left;


          const y =
            event.clientY -
            rect.top;


          const rotateX =
            (
              (y / rect.height) -
              0.5
            ) *
            -6;


          const rotateY =
            (
              (x / rect.width) -
              0.5
            ) *
            6;


          element.style.transform =
            `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

        }
      );


      element.addEventListener(
        "mouseleave",
        () => {

          element.style.transform =
            "perspective(900px) rotateX(0deg) rotateY(0deg)";

        }
      );

    }
  );

}


/* =========================================================
   HERO PARALLAX
========================================================= */

function setupHeroParallax() {

  const hero =
    document.querySelector(
      ".hero, .hero-section, [data-hero-parallax]"
    );


  if (!hero) {

    return;

  }


  const updateParallax =
    () => {

      const scrollY =
        window.scrollY;


      const offset =
        Math.min(
          scrollY *
            0.15,
          100
        );


      hero.style.transform =
        `translateY(${offset}px)`;

    };


  window.addEventListener(
    "scroll",
    updateParallax,
    {
      passive: true
    }
  );

}


/* =========================================================
   MAGNETIC INTERACTION
========================================================= */

function setupMagnetic() {

  const elements =
    document.querySelectorAll(
      "[data-magnetic], .magnetic"
    );


  if (!elements.length) {

    return;

  }


  elements.forEach(
    (element) => {

      const strength =
        Number(
          element.dataset
            .magneticStrength
        ) ||
        12;


      element.addEventListener(
        "mousemove",
        (event) => {

          const rect =
            element.getBoundingClientRect();


          const x =
            event.clientX -
            rect.left;


          const y =
            event.clientY -
            rect.top;


          const moveX =
            (
              (x / rect.width) -
              0.5
            ) *
            strength;


          const moveY =
            (
              (y / rect.height) -
              0.5
            ) *
            strength;


          element.style.transform =
            `translate3d(${moveX}px, ${moveY}px, 0)`;

        }
      );


      element.addEventListener(
        "mouseleave",
        () => {

          element.style.transform =
            "";

        }
      );

    }
  );

}


/* =========================================================
   CHAT INITIALIZATION
========================================================= */

function setupChat() {

  const form =
    $("#chatForm");

  const input =
    $("#chatInput");

  const sendButton =
    $("#chatSend");


  if (form) {

    form.addEventListener(
      "submit",
      (event) => {

        event.preventDefault();

        sendMessage();

      }
    );

  } else if (
    sendButton
  ) {

    sendButton.addEventListener(
      "click",
      (event) => {

        event.preventDefault();

        sendMessage();

      }
    );

  }


  if (input) {

    input.addEventListener(
      "keydown",
      (event) => {

        if (
          event.key ===
            "Enter" &&
          !event.shiftKey
        ) {

          event.preventDefault();

          sendMessage();

        }

      }
    );

  }

}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    /*
      -------------------------------------------------------
      Restore the locally persisted user immediately.
      This allows the interface to render the correct
      authentication state while backend verification
      happens below.
      -------------------------------------------------------
    */

    currentUser =
      getLoggedInUser();


    /*
      -------------------------------------------------------
      Initialize visual systems
      -------------------------------------------------------
    */

    setupReveal();

    setupCounters();

    setupTilt();

    setupHeroParallax();

    setupMagnetic();

    setupChat();

    setupModals();

    setupFormUX();

    setupRipple();

    setupDateInputs();

    setupDestinationSearch();

    setupImageFallback();


    /*
      -------------------------------------------------------
      Initialize navigation and existing journey state
      -------------------------------------------------------
    */

    updateActiveNav();

    updateAuthUI();

    loadSavedTrip();

    updateJourneyHeader();

    resetBudgetUI();


    /*
      -------------------------------------------------------
      Verify the real backend session.
      -------------------------------------------------------
    */

    const user =
      await syncAuthSession();


    /*
      -------------------------------------------------------
      Update UI again after backend verification.
      -------------------------------------------------------
    */

    if (user) {

      currentUser =
        user;

      updateAuthUI();


      await refreshMyJourneys(
        true
      );

    } else {

      currentUser =
        getLoggedInUser();

      updateAuthUI();

    }

  }
);
