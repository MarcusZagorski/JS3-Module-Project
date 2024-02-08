const currentState = {
  showsFetched: false,
  episodesFetched: false,
  allShows: null,
  showSelected: null,
  allEpisodes: null,
  showsID: "",
};

const showDropDown = document.querySelector("#series__dropdown");
const displayingFilterResults = createElement("p", "");
let layoutSelector = document.querySelector(".layout");

// Fetch API function to fetch data upon call
async function fetchAPI(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not fetch data from ${url}`);
  }
  return response.json();
}

function addCardLayout() {
  layoutSelector.classList.add("layout__for__cards");
  searchField.classList.add("test");
}

function removeCardLayout() {
  layoutSelector.classList.remove("layout__for__cards");
}

// Fetches shows data via API
async function getAllShows() {
  try {
    if (!currentState.showsFetched) {
      currentState.allShows = await fetchAPI("https://api.tvmaze.com/shows");
      currentState.showsFetched = true;
    }
    return currentState.allShows;
  } catch (error) {
    console.error(error);
  }
}

async function getAllEpisodes() {
  try {
    if (!currentState.episodesFetched) {
      currentState.allEpisodes = await fetchAPI(
        `https://api.tvmaze.com/shows/${currentState.showsID}/episodes`
      );
      currentState.episodesFetched = true;
    }
    return currentState.allEpisodes;
  } catch (error) {
    console.error(error);
  }
}

// // Creating cards

// // Creates element and adds class if required
function createElement(tag, className) {
  const element = document.createElement(tag);
  if (className) {
    element.classList.add(className);
  }
  return element;
}

// Adds padding to the start of season and episode
// Example --- S1E4 = S01E04
function formatSeasonAndEpisode(season, episodeNumber) {
  return `S${String(season).padStart(2, "0")}E${String(episodeNumber).padStart(
    2,
    "0"
  )}`;
}

// Creates card component
function createShowCard(show) {
  const cardDiv = createElement("section", "card");

  const layoutSelector = document.querySelector(".layout");

  const seasonAndEpisodeWithPadding = formatSeasonAndEpisode(
    show.season,
    show.number
  );

  const filmTitleElement = createElement("h1", "card__title");
  filmTitleElement.textContent = `${show.name}`;
  if (show.season) {
    filmTitleElement.textContent = `${show.name} - ${seasonAndEpisodeWithPadding}`;
  }
  cardDiv.appendChild(filmTitleElement);

  const wrapImageAndSummary = createElement("div", "img__summary");

  const filmImgElement = createElement("img", "card__img");
  filmImgElement.setAttribute("src", show.image.original);
  wrapImageAndSummary.appendChild(filmImgElement);

  const filmSummaryElement = createElement("p", "card__summary");
  filmSummaryElement.innerHTML = show.summary;
  wrapImageAndSummary.appendChild(filmSummaryElement);
  cardDiv.appendChild(wrapImageAndSummary);

  const additionalDetails = createElement("div", "additionaldetails");
  const rating = createElement("p", "additionaldetails__text");
  rating.innerHTML = `Rating: ${show.rating.average} <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 star__rating">
  <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
  </svg>`;

  const genres = createElement("p", "additionaldetails__text");
  if (show.genres.length > 1) {
    const episodeGenres = String(show.genres);
    const episodeGenresWithoutCommas = episodeGenres.replaceAll(",", " | ");
    genres.textContent = `Genres: ${episodeGenresWithoutCommas}`;
  } else {
    genres.textContent = `Genres: ${show.genres}`;
  }

  const airingOrEnded = createElement("p", "additionaldetails__text");
  airingOrEnded.textContent = `Status: ${show.status}`;

  const runtime = createElement("p", "additionaldetails__text");
  runtime.textContent = `Runtime: ${show.runtime}`;

  additionalDetails.appendChild(rating);
  additionalDetails.appendChild(genres);
  additionalDetails.appendChild(airingOrEnded);
  additionalDetails.appendChild(runtime);
  cardDiv.appendChild(additionalDetails);

  layoutSelector.appendChild(cardDiv);
  return cardDiv;
}

function createEpisodeCard(episode) {
  const layoutSelector = document.querySelector(".layout");

  const linkCardsToTVMaze = createElement("a", "");
  linkCardsToTVMaze.setAttribute("href", episode.url);
  linkCardsToTVMaze.setAttribute("target", "_blank");

  const cardDiv = createElement("section", "episode__card");

  const seasonAndEpisodeWithPadding = formatSeasonAndEpisode(
    episode.season,
    episode.number
  );
  const filmTitleElement = createElement("h1", "episode__card__title");
  filmTitleElement.textContent = `${episode.name}`;
  if (episode.season) {
    filmTitleElement.textContent = `${episode.name} - ${seasonAndEpisodeWithPadding}`;
  }

  const filmImgElement = createElement("img", "episode__card__img");
  if (episode.image && episode.image.original) {
    filmImgElement.setAttribute("src", episode.image.original);
  } else {
    filmImgElement.setAttribute("src", "images/no-img-available.jpeg");
    filmImgElement.classList.add("no_img_available");
  }

  const filmSummaryElement = createElement("p", "card__summary");
  filmSummaryElement.innerHTML = episode.summary;

  layoutSelector.appendChild(linkCardsToTVMaze);
  linkCardsToTVMaze.appendChild(cardDiv);
  cardDiv.appendChild(filmTitleElement);
  cardDiv.appendChild(filmImgElement);
  cardDiv.appendChild(filmSummaryElement);

  return linkCardsToTVMaze;
}

async function searchShowsDropDown() {
  try {
    const showsData = await getAllShows();
    const defaultOptionShow = document.createElement("option");
    defaultOptionShow.textContent = "Select show...";
    defaultOptionShow.setAttribute("value", "default");
    showDropDown.appendChild(defaultOptionShow);

    showsData.forEach((show) => {
      const listOfShows = document.createElement("option");
      listOfShows.textContent = `${show.name}`;
      showDropDown.appendChild(listOfShows);
    });

    showDropDown.addEventListener("change", async function (event) {
      if (event.target.value === "default") {
        searchField.setAttribute("placeholder", "Search for show/s...");
        searchField.removeEventListener("input", searchFilterEpisodes);
        searchField.addEventListener("input", searchFilterShows);
        searchField.value = "";
        displayingFilterResults.textContent = "";
        removeCardLayout();
        clearCards();
        render();
        return;
      } else {
        searchField.setAttribute("placeholder", "Search for episode/s...");
        const findID = showsData.find(
          (show) => show.name === event.target.value
        );
        currentState.showsID = findID.id;
        currentState.allEpisodes = await getAllEpisodes();
        addCardLayout();
        clearCards();
        makePageForEpisodes(currentState.allEpisodes);
        currentState.episodesFetched = false;
      }
    });
  } catch (error) {
    console.error(error);
  }
}

function dropDownAfterSearch(currentShows) {
  showDropDown.innerHTML = "";
  currentShows.forEach((show) => {
    const option = createElement("option", "");
    option.textContent = show.name;
    showDropDown.appendChild(option);
  });
}

const searchField = document.querySelector("#search__field");

if (searchField.getAttribute("placeholder") === "Search for show/s...") {
  searchField.addEventListener("input", searchFilterShows);
} else if (
  searchField.getAttribute("placeholder") === "Search for episode/s..."
) {
  searchField.addEventListener("input", searchFilterEpisodes);
}

async function searchFilterShows() {
  const showsData = await getAllShows();
  const showsFilter = showsData.filter(
    (show) =>
      show.name.toLowerCase().includes(searchField.value.toLowerCase()) ||
      show.summary.toLowerCase().includes(searchField.value.toLowerCase())
  );

  if (searchField.value.length > 0) {
    console.log("filtering shows");
    displayingFilterResults.textContent = `Found ${showsFilter.length} shows`;
    removeCardLayout();
    clearCards();
    makePageForShows(showsFilter);
  } else {
    displayingFilterResults.textContent = "";
    removeCardLayout();
    clearCards();
    render();
    showDropDown.value = "default";
  }

  searchField.removeEventListener("input", searchFilterEpisodes);
  searchField.addEventListener("input", searchFilterShows);
  const searchLayout = document.querySelector(".search__layout");
  searchLayout.appendChild(displayingFilterResults);
}

async function searchFilterEpisodes() {
  searchField.innerHTML = "";
  const episodeData = await getAllEpisodes();
  const episodeFilter = episodeData.filter(
    (episode) =>
      episode.name.toLowerCase().includes(searchField.value.toLowerCase()) ||
      episode.summary.toLowerCase().includes(searchField.value.toLowerCase())
  );

  if (searchField.value.length > 0) {
    displayingFilterResults.textContent = `Found ${episodeFilter.length} episodes`;
    removeCardLayout();
    clearCards();
    makePageForEpisodes(episodeFilter);
  } else {
    searchField.removeEventListener("input", searchFilterEpisodes);
    searchField.addEventListener("input", searchFilterShows);
    showDropDown.value = "default";
    removeCardLayout();
    displayingFilterResults.textContent = "";
    clearCards();
    render();
  }

  const searchLayout = document.querySelector(".search__layout");
  searchLayout.appendChild(displayingFilterResults);
}

async function makePageForShows(episodeList) {
  const layoutSelector = document.querySelector(".layout");
  layoutSelector.innerHTML = "";
  // Creates a card for each episode
  episodeList.forEach((episode) => {
    const filmCard = createShowCard(episode);
    layoutSelector.appendChild(filmCard);

    filmCard.addEventListener("click", async function () {
      searchField.value = "";
      searchField.setAttribute("placeholder", "Search for episode/s...");
      displayingFilterResults.textContent = "";
      currentState.showsID = episode.id;
      currentState.showSelected = episode;
      const episodeData = await getAllEpisodes();
      const selectedShow = [...showDropDown].find(
        (show) => show.value === episode.name
      );
      selectedShow.selected = true;
      currentState.episodesFetched = false;
      scrollTo(top);
      addCardLayout();
      clearCards();
      makePageForEpisodes(episodeData);
      searchField.removeEventListener("input", searchFilterShows);
      searchField.addEventListener("input", searchFilterEpisodes);
    });
  });
}

async function makePageForEpisodes(episodeCard) {
  const layoutSelector = document.querySelector(".layout");
  addCardLayout();
  layoutSelector.innerHTML = "";
  episodeCard.forEach((episode) => {
    const filmCard = createEpisodeCard(episode);
    layoutSelector.appendChild(filmCard);
  });
}

// Creates footer
function createFooter() {
  const footerElement = createElement("footer", "footer");
  const layoutSelector = document.querySelector(".layout");

  footerElement.innerHTML = `Data originally sourced by
        <a href="https://www.tvmaze.com/" id="tv-maze-link">TVMaze.com</a>`;
  layoutSelector.insertAdjacentElement("afterend", footerElement);
}

function clearCards() {
  const layoutSelector = document.querySelector(".layout");
  layoutSelector.innerHTML = "";
}

async function render() {
  try {
    await getAllShows().then((allEpisodes) => {
      makePageForShows(allEpisodes);
    });
    await searchShowsDropDown();
  } catch (error) {
    console.error(error);
  }
}

window.onload = render;
createFooter();
