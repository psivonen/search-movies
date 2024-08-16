import React, { useEffect, useState } from "react";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import axios from "axios";

export default function Movies() {
  const [theatres, setTheatres] = useState([]);
  // eslint-disable-next-line
  const [shows, setShows] = useState([]);
  const [filteredShows, setFilteredShows] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedTheatre, setSelectedTheatre] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false); // Track if the form has been submitted

  // Fetch Theatre Areas
  useEffect(() => {
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
      })
      .catch((error) => {
        console.error("Error fetching theatres:", error);
      });
  }, []);

  // Fetch shows based on selected theatre or search query when the form is submitted
  const fetchShows = async (theatreId = "", date = "", searchQuery = "") => {
    try {
      const response = await axios.get("https://www.finnkino.fi/xml/Schedule", {
        params: { area: theatreId, dt: date },
      });

      // Parse the XML response
      const parser = new DOMParser();
      const xml = parser.parseFromString(response.data, "text/xml");
      const items = xml.getElementsByTagName("Show");
      const shows = Array.from(items).map((show) => ({
        id: show.getElementsByTagName("ID")[0].textContent,
        title: show.getElementsByTagName("Title")[0].textContent,
        theatre: show.getElementsByTagName("Theatre")[0].textContent,
        dateTime: show.getElementsByTagName("dtAccounting")[0].textContent,
        startTime: show.getElementsByTagName("dttmShowStart")[0].textContent,
        lengthMinutes:
          show.getElementsByTagName("LengthInMinutes")[0].textContent,
        imageUrl:
          show.getElementsByTagName("EventMediumImagePortrait")[0]
            ?.textContent || "",
      }));

      // Filter based on search query
      const filtered = searchQuery
        ? shows.filter((show) =>
            show.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : shows;

      // Update state
      setShows(shows);
      setFilteredShows(filtered);
    } catch (error) {
      console.error("Error fetching shows:", error);
    }
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true); // Set form as submitted
    fetchShows(selectedTheatre, query); // Fetch shows based on query and selected theatre
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
    <div className="flex flex-col gap-10 p-4 w-full justify-center items-center">
      {/* Search bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-col sm:flex-row gap-4 m-5 w-full"
      >
        <div className="flex gap-1 flex-col">
          {/*<label htmlFor="search">Elokuvan nimi:</label>*/}
          <input
            id="search"
            name="search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Etsi elokuvia..."
            className="border p-2 sm:w-64"
          />
        </div>
        
        {/* Theatre area dropdown */}
        <div className="flex gap-1 flex-col sm:w-64">
          {/*<label htmlFor="select">Alue tai teatteri:</label>*/}
          {/* headlessui Listbox */}
          <Listbox value={selectedTheatre} onChange={setSelectedTheatre}>
            <div className="relative w-full">
              <ListboxButton className="border p-2 w-full text-left flex items-center justify-between">
                {selectedTheatre
                  ? theatres.find((theatre) => theatre.id === selectedTheatre)
                      ?.name
                  : "Valitse alue/teatteri"}
                <ChevronDownIcon className="w-3 h-3" aria-hidden="true" />
              </ListboxButton>
              <ListboxOptions className="absolute mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                {theatres.slice(1).map((area) => (
                  <ListboxOption
                    key={area.id}
                    className={({ selected }) =>
                      `select-none relative py-2 pl-10 pr-4 hover:bg-blue-100 hover:text-blue-900 cursor-pointer ${
                        selected
                          ? "text-blue-900 bg-blue-100 font-medium"
                          : "text-gray-900"
                      }`
                    }
                    value={area.id}
                  >
                    {({ selected }) => (
                      <>
                        {area.name}
                        {selected && (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <CheckIcon
                              className="w-3 h-3 text-blue-600"
                              aria-hidden="true"
                            />
                          </span>
                        )}
                      </>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-10 rounded"
        >
          Etsi
        </button>
      </form>

      {/* Display the list of shows if available and form has been submitted */}
      {isSubmitted && filteredShows.length > 0 && (
        <div className="w-full">
          <ul className="flex flex-col gap-10">
            {filteredShows.map((show) => (
              <li
                key={show.id}
                className="flex gap-10 items-center border p-4 rounded"
              >
                {show.imageUrl && (
                  <img
                    src={show.imageUrl}
                    alt={show.title}
                    className="w-32 lg:w-64 h-auto"
                  />
                )}
                <div className="flex flex-col">
                  <h2 className="text-2xl font-bold">{show.title}</h2>
                  <p>{formatDate(show.dateTime)}</p>
                  <p>Kesto: {show.lengthMinutes} min</p>
                  <p>
                    klo:{" "}
                    {new Date(show.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p>Teatteri: {show.theatre}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
