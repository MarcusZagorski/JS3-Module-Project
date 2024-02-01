const currentState = {
  showsFetched: false,
  episodesFetched: false,
  allShows: null,
  showSelected: null,
  allEpisodes: null,
  showsID: "",
};

const showDropDown = document.querySelector("#series__dropdown");
const episodeDropDown = document.querySelector("#filter__dropdown");
const displayingFilterResults = document.createElement("p");

// Fetch API function to fetch data upon call
async function fetchAPI(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not fetch data from ${url}`);
  }
  return response.json();
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
function createEpisodeCard(episode) {
  const cardDiv = createElement("section", "card");

  const layoutSelector = document.querySelector(".layout");

  const seasonAndEpisodeWithPadding = formatSeasonAndEpisode(
    episode.season,
    episode.number
  );

  const filmTitleElement = createElement("h1", "card__title");
  filmTitleElement.textContent = `${episode.name}`;
  if (episode.season) {
    filmTitleElement.textContent = `${episode.name} - ${seasonAndEpisodeWithPadding}`;
  }
  cardDiv.appendChild(filmTitleElement);

  const filmImgElement = createElement("img", "card__img");
  if (episode.image && episode.image.original) {
    filmImgElement.setAttribute("src", episode.image.original);
  } else {
    filmImgElement.setAttribute(
      "src",
      "https://t3.ftcdn.net/jpg/04/34/72/82/360_F_434728286_OWQQvAFoXZLdGHlObozsolNeuSxhpr84.jpg"
    );
  }
  cardDiv.appendChild(filmImgElement);

  const filmSummaryElement = createElement("p", "card__summary");
  filmSummaryElement.innerHTML = episode.summary;
  cardDiv.appendChild(filmSummaryElement);

  layoutSelector.appendChild(cardDiv);

  return cardDiv;
}

async function searchShowsDropDown() {
  try {
    const showsData = await getAllShows();
    const defaultOptionShow = document.createElement("option");
    defaultOptionShow.textContent = "Select show...";
    showDropDown.appendChild(defaultOptionShow);

    showsData.forEach((show) => {
      const listOfShows = document.createElement("option");
      listOfShows.textContent = `${show.name}`;
      showDropDown.appendChild(listOfShows);
    });

    showDropDown.addEventListener("change", async function (event) {
      if (event.target.value === defaultOptionShow.textContent) {
        clearCards();
        render();
        episodeDropDown.innerHTML = "";
        return;
      }

      currentState.showSelected = showsData.find(
        (show) => show.name === event.target.value
      );
      currentState.showsID = currentState.showSelected.id;

      searchEpisodesDropDown();
    });
  } catch (error) {
    console.error(error);
  }
}

async function searchEpisodesDropDown() {
  let episodes = await getAllEpisodes();
  clearCards();
  await makePageForEpisodes(episodes);
  episodeDropDown.innerHTML = "";

  // Filtering episodes
  let defaultForEpisodes = document.createElement("option");
  defaultForEpisodes.textContent = "Select Episode...";
  episodeDropDown.appendChild(defaultForEpisodes);

  episodes.forEach((episode) => {
    let listOfEpisodes = document.createElement("option");
    listOfEpisodes.textContent = `${episode.name} - ${formatSeasonAndEpisode(
      episode.season,
      episode.number
    )}`;
    episodeDropDown.appendChild(listOfEpisodes);
  });

  episodeDropDown.addEventListener("change", async function (event) {
    const dash = event.target.value.indexOf("-");
    const selectedEpisode = event.target.value.slice(0, dash - 1);
    const filteredEpisode = episodes.filter(
      (episode) => episode.name === selectedEpisode
    );
    clearCards();
    await makePageForEpisodes(filteredEpisode);

    if (event.target.value === defaultForEpisodes.textContent) {
      clearCards();
      await makePageForEpisodes(episodes);
    }
  });

  currentState.episodesFetched = false;
}

const searchField = document.querySelector("#search__field");
searchField.addEventListener("input", searchFilterEpisodes);

async function searchFilterEpisodes() {
  const showsData = await getAllShows();
  const showsFilter = showsData.filter(
    (show) =>
      show.name.toLowerCase().includes(searchField.value.toLowerCase()) ||
      show.summary.toLowerCase().includes(searchField.value.toLowerCase())
  );

  if ((searchField.textContent = "")) {
    displayingFilterResults.textContent = "";
  } else {
    displayingFilterResults.textContent = `Displaying ${showsFilter.length}/${showsData.length} shows`;
  }

  const searchLayout = document.querySelector(".search__layout");
  searchLayout.appendChild(displayingFilterResults);

  clearCards();
  makePageForEpisodes(showsFilter);
}

searchFilterEpisodes();

async function makePageForEpisodes(episodeList) {
  const layoutSelector = document.querySelector(".layout");
  // Creates a card for each episode
  episodeList.forEach((episode) => {
    const filmCard = createEpisodeCard(episode);
    layoutSelector.appendChild(filmCard);

    filmCard.addEventListener("click", async function () {
      displayingFilterResults.textContent = "";
      currentState.showsID = episode.id;
      currentState.showSelected = episode;
      const episodeData = await getAllEpisodes();
      const selectedShow = [...showDropDown].find(
        (show) => show.textContent === currentState.showSelected.name
      );
      selectedShow.selected = true;
      clearCards();
      makePageForEpisodes(episodeData);
      episodeData.forEach((episode) => {
        let listOfEpisodes = document.createElement("option");
        listOfEpisodes.textContent = `${
          episode.name
        } - ${formatSeasonAndEpisode(episode.season, episode.number)}`;
        episodeDropDown.appendChild(listOfEpisodes);
      });

      episodeDropDown.addEventListener("change", async function (event) {
        const dash = event.target.value.indexOf("-");
        const selectedEpisode = event.target.value.slice(0, dash - 1);
        const filteredEpisode = episodeData.filter(
          (episode) => episode.name === selectedEpisode
        );
        clearCards();
        await makePageForEpisodes(filteredEpisode);
      });
    });
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
      makePageForEpisodes(allEpisodes);
    });
    await searchShowsDropDown();
    // await searchEpisodesDropDown();
    // createFooter();
  } catch (error) {
    console.error(error);
  }
}

window.onload = render;
