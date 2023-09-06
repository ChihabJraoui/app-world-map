import './App.css';
import GeoMap from "./components/GeoMap";
import {worldMapData} from "./data";

function App() {
  return (
    <div className="App">

      <GeoMap data={worldMapData} height={"500px"} />
    </div>
  );
}

export default App;
