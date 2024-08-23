import { FilmIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  return (
    <div className="w-full left-0 top-0 z-20 h-24 text-sm fixed lg:text-base bg-[#131c2b]">
      <div className="max-w-screen-lg 0 mx-auto px-8 h-full flex justify-between items-center text-gray-500">
        <div className="flex justify-center items-center gap-2">
            <FilmIcon className="w-5 text-white"/>
            <p className="text-white font-bold text-sm">Elokuvien haku</p>
        </div>
        <a
          href="https://www.finnkino.fi/"
          target="_blank"
          rel="noreferrer"
          className="hover:text-white transition-all duration-300"
        >
          Finnkino
        </a>
      </div>
    </div>
  );
}
