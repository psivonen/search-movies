import "./App.css";
import Movies from "./components/Movies";
import Footer from "./components/Footer";

function App() {
  return (
    <main className="main">
      <div className="flex gap-5 flex-col items-center w-full">
        <h1 className="text-5xl">Etsi elokuvia</h1>
        <p className="text-sm sm:text-base text-center">
          Etsi elokuvia Finnkinon tarjonnasta hakusanan ja/tai valitsemalla
          alueen tai teatterin.
        </p>
        <Movies />
      </div>
      <Footer />
    </main>
  );
}

export default App;
