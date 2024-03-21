import "./App.css";

import Football from "./components/Football.jsx";

function App() {

  return (
    <div className="App">
      <header className="App-header">
        <Football
          lr1={0.01}
          lr2={0.01}
        />
      </header>
    </div>
  );
}

export default App;
