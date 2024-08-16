import './App.css';
import Movies from './components/Movies';

function App() {
  return (
    <main className="main">
      <h1 className='text-5xl'>
        Etsi elokuvia
      </h1>
      <Movies/>
    </main>
  );
}

export default App;
