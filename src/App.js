import "./App.css";
import Movies from "./components/Movies";
import Footer from "./components/Footer";

function App() {
  return (
    <main className="main">
      <div className="flex gap-8 mt-4 flex-col w-full">
        <div className="flex flex-col gap-5 pt-10">
          <h1 className="text-4xl lg:text-5xl font-bold text-white">
            Elokuvien haku
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
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
