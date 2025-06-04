import { GameCanvas } from "./components/GameCanvas";

function App() {
  return (
    <div style={{ backgroundColor: "#000", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <GameCanvas />
    </div>
  );
}

export default App;
