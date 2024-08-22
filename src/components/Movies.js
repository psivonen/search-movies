import React, { useEffect, useState, Fragment } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Input,
  Button,
} from "@headlessui/react";
import {
  CheckIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import axios from "axios";
import clsx from "clsx";

export default function Movies() {
  const [theatres, setTheatres] = useState([]);
  // eslint-disable-next-line
  const [shows, setShows] = useState([]);
  const [events, setEvents] = useState([]);
  const [filteredShows, setFilteredShows] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedTheatre, setSelectedTheatre] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false); // Track if the form has been submitted
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const genres = [
    { id: 1, genre: "Sci-fi" },
    { id: 2, genre: "Kauhu" },
    { id: 3, genre: "Komedia" },
    { id: 4, genre: "Toiminta" },
    { id: 5, genre: "Marvel" },
    { id: 6, genre: "Draama" },
    { id: 7, genre: "Perhe-elokuva" },
    { id: 8, genre: "Animaatio" },
    { id: 9, genre: "Kriitikoiden suosikki" },
    { id: 10, genre: "Jännitys" },
  ];

  // Fetch Theatre Areas
  useEffect(() => {
    setIsLoading(true);
    fetch("https://www.finnkino.fi/xml/TheatreAreas/")
      .then((response) => response.text())
      .then((str) => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(str, "text/xml");
        const items = xml.getElementsByTagName("TheatreArea");
        const areas = Array.from(items).map((area) => ({
          id: area.getElementsByTagName("ID")[0].textContent,
          name: area.getElementsByTagName("Name")[0].textContent,
        }));
        setTheatres(areas);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching theatres:", error);
        setIsLoading(false);
      });
  }, []);

  // Fetch Events
  useEffect(() => {
    setIsLoading(true);
    fetch("https://www.finnkino.fi/xml/Events/")
      .then((response) => response.text())
      .then((str) => {
        const parser = new DOMParser();
        const xml = parser.parseFromString(str, "text/xml");
        const items = xml.getElementsByTagName("Event");
        const events = Array.from(items).map((event) => ({
          id: event.getElementsByTagName("ID")[0].textContent,
          synopsis: event.getElementsByTagName("ShortSynopsis")[0].textContent,
        }));
        setEvents(events);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching events", error);
        setIsLoading(false);
      });
  }, []);

  // Fetch shows based on selected theatre or search query when the form is submitted
  const fetchShows = async (
    theatreId = "",
    searchQuery = "",
    selectedGenres = []
  ) => {
    try {
      setIsLoading(true);
      const response = await axios.get("https://www.finnkino.fi/xml/Schedule", {
        params: { area: theatreId },
      });

      // Parse the XML response
      const parser = new DOMParser();
      const xml = parser.parseFromString(response.data, "text/xml");
      const items = xml.getElementsByTagName("Show");
      const shows = Array.from(items).map((show) => ({
        id: show.getElementsByTagName("ID")[0].textContent,
        eventId: show.getElementsByTagName("EventID")[0].textContent,
        title: show.getElementsByTagName("Title")[0].textContent,
        theatre: show.getElementsByTagName("Theatre")[0].textContent,
        dateTime: show.getElementsByTagName("dtAccounting")[0].textContent,
        startTime: show.getElementsByTagName("dttmShowStart")[0].textContent,
        showGenres: show.getElementsByTagName("Genres")[0]?.textContent || "",
        imageUrl:
          show.getElementsByTagName("EventMediumImagePortrait")[0]
            ?.textContent || "",
      }));

      // Filter the shows based on the search query and selected genres
      const filtered = shows.filter((show) => {
        // Check if the show's title matches the search query (if any)
        const matchesQuery = searchQuery
          ? show.title.toLowerCase().includes(searchQuery.toLowerCase())
          : true;

        const showGenres = show.showGenres
          .split(",")
          .map((genre) => genre.trim().toLowerCase());

        // Check if the show matches any of the selected genres (if any are selected)
        const matchesGenres =
          selectedGenres.length > 0
            ? selectedGenres.some((genreId) => {
                const selectedGenre = genres.find(
                  (genre) => genre.id === genreId
                );
                // Ensure the selected genre exists, then check if it's in the show's genre list
                return (
                  selectedGenre?.genre.toLowerCase() &&
                  showGenres.includes(selectedGenre.genre.toLowerCase())
                );
              })
            : true;

        return matchesQuery && matchesGenres;
      });

      // Update state
      setShows(shows);
      setFilteredShows(filtered);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching shows:", error);
    }
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true); // Set form as submitted
    fetchShows(selectedTheatre, query, selectedGenres); // Fetch shows based on query and selected theatre
  };

  const handleGenreChange = (genreId) => {
    // Update the state of selected genres
    setSelectedGenres((prevSelectedGenres) => {
      // Check if the genreId is already in the selected genres list
      if (prevSelectedGenres.includes(genreId)) {
        // If it is already selected, remove it by filtering out the genreId from the list
        return prevSelectedGenres.filter((id) => id !== genreId);
      } else {
        // If it is not selected, add the genreId to the list by spreading the existing genres and appending the new one
        return [...prevSelectedGenres, genreId];
      }
    });
  };

  // Format date to dd/mm/yyyy
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  return (
    <div className="flex flex-col gap-10 justify-center items-center w-full">
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-col sm:flex-row gap-4 m-5 w-full"
      >
        {/* Search bar */}
        <Input
          id="search"
          name="search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Etsi elokuvia..."
          className={clsx(
            "block w-full rounded-lg border-none bg-gray-800 p-3 text-sm/6 text-white",
            "focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25"
          )}
        />

        {/* Theatre area dropdown with headlessui Listbox */}
        <Listbox value={selectedTheatre} onChange={setSelectedTheatre}>
          <div className="relative w-full">
            <ListboxButton className="flex justify-between items-center w-full rounded-lg bg-gray-800 p-3 text-sm/6 text-white">
              {selectedTheatre
                ? theatres.find((theatre) => theatre.id === selectedTheatre)
                    ?.name
                : "Valitse alue/teatteri"}
              <ChevronDownIcon className="size-4" aria-hidden="true" />
            </ListboxButton>
            <ListboxOptions className="p-2 z-20 absolute mt-3 w-full rounded-xl bg-gray-800 max-h-60 py-1text-left text-sm/6 text-white overflow-auto">
              {theatres.slice(1).map((area) => (
                <ListboxOption key={area.id} value={area.id} as={Fragment}>
                  {({ selected }) => (
                    <div
                      className={clsx(
                        "relative inset-y-0 left-0 flex items-center py-3 pl-3 rounded-lg hover:bg-white/5 hover:text-white cursor-pointer",
                        selected && "text-white bg-white/10"
                      )}
                    >
                      <CheckIcon
                        className={clsx(
                          "size-4 mr-2",
                          !selected && "invisible"
                        )}
                      />
                      {area.name}
                    </div>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>
        {/* Multi-select Genre Listbox */}
        <Listbox value={selectedGenres} onChange={handleGenreChange}>
          <div className="relative w-full">
            <ListboxButton className="flex justify-between items-center w-full rounded-lg bg-gray-800 p-3 text-sm/6 text-white">
              {selectedGenres.length > 0
                ? selectedGenres
                    .map(
                      (genreId) =>
                        genres.find((genre) => genre.id === genreId)?.genre
                    )
                    .join(", ")
                : "Valitse lajityyppi"}
              <ChevronDownIcon className="size-4" aria-hidden="true" />
            </ListboxButton>
            <ListboxOptions className="absolute z-10 mt-1 w-full text-white bg-gray-800 shadow-lg max-h-60 rounded-md py-1 text-sm/6 ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
              {genres.map((genre) => (
                <ListboxOption key={genre.id} value={genre.id} as={Fragment}>
                  {({ selected }) => (
                    <div
                      className={clsx(
                        "select-none relative inset-y-0 left-0 flex items-center py-3 pl-3 hover:bg-white/5 cursor-pointer",
                        selected && "text-white"
                      )}
                    >
                      {selectedGenres.includes(genre.id) && (
                        <XMarkIcon className={clsx("size-4 mr-2")} />
                      )}
                      {genre.genre}
                    </div>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>
        {/* Submit button */}
        <Button
          type="submit"
          className="rounded-md bg-gray-700 py-3 px-10 text-sm/6 font-semibold text-white"
        >
          Etsi
        </Button>
      </form>

      <div className="w-full">
        {isLoading ? (
          <span className="loader"></span>
        ) : (
          <>
            {/* Display the list of shows if available and form has been submitted */}
            {isSubmitted && filteredShows.length === 0 ? (
              <p>Elokuvia ei löydy.</p>
            ) : (
              <ul className="flex flex-col gap-10">
                {filteredShows.map((show) => {
                  // Find the event that matches the eventId of the show
                  const event = events.find(
                    (event) => event.id === show.eventId
                  );

                  return (
                    <li
                      key={show.id}
                      className="flex flex-col sm:flex-row gap-10 items-center rounded border-b border-b-white/10 pb-10"
                    >
                      {show.imageUrl && (
                        <img
                          src={show.imageUrl}
                          alt={show.title}
                          className="w-full lg:w-64 h-auto"
                        />
                      )}
                      <div className="flex flex-col">
                        <p className="text-gray-500 text-sm">
                          {formatDate(show.dateTime)}
                        </p>
                        <h2 className="text-2xl sm:text-4xl font-bold">
                          {show.title}
                        </h2>
                        <p className="text-xl sm:text-3xl font-bold">
                          klo:{" "}
                          {new Date(show.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-gray-500 text-sm">{show.theatre}</p>
                        {/* Display synopsis if available */}
                        {event?.synopsis && (
                          <p className="text-sm sm:text-base mt-5 text-gray-500">{event.synopsis}</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
