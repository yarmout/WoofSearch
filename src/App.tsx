import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SearchPage from "./pages/SearchPage";
import DogDetailsPage from "./pages/DogDetailsPage";

function App() {
  return (
    <Router>
        <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/dog/:dogName/:dogId" element={<DogDetailsPage />} />
        </Routes>
    </Router>
  )
}

export default App
