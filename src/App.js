import "./App.css";
import Movies from "./components/Movies";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

function App() {
  return (
    <main className="main">
      <Navbar />
      <div className="flex gap-8 mt-20 flex-col w-full">
        <div className="flex flex-col gap-5 pt-10">
          <h1 className="text-4xl lg:text-5xl font-bold text-white">
            Elokuvien haku
          </h1>
          <p className="text-sm sm:text-base text-gray-500">
            Etsi elokuvia Finnkinon tarjonnasta hakusanan
            <br />
            ja/tai valitsemalla alueen tai teatterin.
          </p>
        </div>
        <Movies />
      </div>
      <Footer />
    </main>
  );
}

export default App;
