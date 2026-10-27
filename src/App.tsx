import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import LiveMonitor from "./components/LiveMonitor";
import PipelineControls from "./components/PipelineControls";
import Evidence from "./components/Evidence";
import Footer from "./components/Footer";
import { TrackerProvider } from "./context/TrackerContext";

export default function App() {
  return (
    <TrackerProvider>
      <div className="carbon-bg min-h-screen">
        <Navbar />
        <Hero />
        <LiveMonitor />
        <PipelineControls />
        <Evidence />
        <Footer />
      </div>
    </TrackerProvider>
  );
}
