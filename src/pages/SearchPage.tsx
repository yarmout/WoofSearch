import {useState, useEffect} from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./styles/SearchPage.css";

interface Dog {
    id: string;
    img: string;
    name: string;
    age: number;
    zip_code: string;
    breed: string;
}

function SearchPage() {
    const [dogs, setDogs] = useState<Dog[]>([]);
    const [breeds, setBreeds] = useState<string[]>([]);
    const [selectedBreeds, setSelectedBreeds] = useState<string[]>([]);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [nextPageQuery, setNextPageQuery] = useState<string | null>(null);
    const [prevPageQuery, setPrevPageQuery] = useState<string | null>(null);
    const [favorites, setFavorites] = useState<string[]>([]);

    // Fetch breeds
    useEffect(() => {
        (async () => {
            try {
                const response = await axios.get(
                    "https://frontend-take-home-service.fetch.com/dogs/breeds",
                    { withCredentials: true }
                );
                setBreeds(response.data);
            } catch (error) {
                console.error("Error fetching breeds", error);
            }
        })();
    }, []);

    // Fetch dogs
    useEffect(() => {
        (async () => {
            try {
                const response = await axios.get(
                    "https://frontend-take-home-service.fetch.com/dogs/search",
                    {
                        params: {
                            breeds: selectedBreeds.length ? selectedBreeds : [], // Send an empty array if no breeds are selected
                            sort: `breed:${sortDirection}`
                        },
                        withCredentials: true,
                    }
                );

                setNextPageQuery(response.data.next || null);
                setPrevPageQuery(response.data.prev || null);

                const dogIds = response.data.resultIds;
                await fetchDogsByIds(dogIds);
            } catch (error) {
                console.error("Error searching dogs", error);
            }
        })();
    }, [selectedBreeds, sortDirection]);

    const fetchDogsByIds = async (dogIds: string[]) => {
        if (!dogIds.length) return;
        try {
            const dogDetailsResponse = await axios.post(
                "https://frontend-take-home-service.fetch.com/dogs",
                dogIds,
                { withCredentials: true }
            );
            setDogs(dogDetailsResponse.data);
        } catch (error) {
            console.error("Error fetching dogs", error);
        }
    }

    // Handle pagination
    const handleNextPage = async () => {
        if (!nextPageQuery) return;

        try {
            const response = await axios.get(
                `https://frontend-take-home-service.fetch.com${nextPageQuery}`,
                { withCredentials: true }
            );

            setNextPageQuery(response.data.next || null);
            setPrevPageQuery(response.data.prev || null);

            const dogIds = response.data.resultIds;
            await fetchDogsByIds(dogIds);
        } catch (error) {
            console.error("Error fetching next page", error);
        }
    }

    const handlePrevPage = async () => {
        if (!prevPageQuery) return;

        try {
            const response = await axios.get(
                `https://frontend-take-home-service.fetch.com${prevPageQuery}`,
                { withCredentials: true }
            );

            setNextPageQuery(response.data.next || null);
            setPrevPageQuery(response.data.prev || null);

            const dogIds = response.data.resultIds;
            await fetchDogsByIds(dogIds);
        } catch (error) {
            console.error("Error fetching previous page", error);
        }
    }

    const toggleFavorite = (dogId: string) => {
        setFavorites((prevFavorites) =>
        prevFavorites.includes(dogId)
        ? prevFavorites.filter((id) => id !== dogId)
        : [...prevFavorites, dogId]
        );
    };

    const generateMatch = async () => {
        if (favorites.length === 0) {
            alert("Please select at least one favorite dog");
            return;
        }

        try {
            const response = await axios.post(
                "https://frontend-take-home-service.fetch.com/dogs/match",
                favorites,
                { withCredentials: true }
            );

            const matchedDogId = response.data.match;

            // Fetch details for the matched dog
            const dogDetailsResponse = await axios.post(
                "https://frontend-take-home-service.fetch.com/dogs",
                [matchedDogId],
                { withCredentials: true }
            );

            const matchedDog = dogDetailsResponse.data[0];

            window.open(
                `/dog/${matchedDog.name.replace(/\s+/g, '-').toLowerCase()}/${matchedDogId}`,
                `_blank`,
                "noopener, noreferrer"
            );
        } catch (error) {
            console.error("Error generating match", error);
        }
    }

    const handleBreedSelection = (selectedBreed: string) => {
        setSelectedBreeds((currentBreeds) => [...currentBreeds, selectedBreed]);
    }

    const removeSelectedBreed = (breedToRemove: string) => {
        setSelectedBreeds((currentBreeds) =>
            currentBreeds.filter((breed) => breed !== breedToRemove));
    }

    const clearAllSelectedBreeds = () => {
        setSelectedBreeds([]);
    }

    return (
        <div className="search-page">
            <h1 className="page-title">Find Your Perfect Dog</h1>
            <div className="filter-bar">
                <select
                    className="breed-selector"
                    onChange={(e) => {
                        const selectedBreed = e.target.value;
                        handleBreedSelection(selectedBreed);
                    }}
                >
                    <option value="">All Breeds</option>
                    {breeds.map((breed) => (
                        <option key={breed} value={breed}>
                            {breed}
                        </option>
                    ))}
                </select>

                <button
                    className="sort-button"
                    onClick={() =>
                        setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                    }
                >
                    Sort by breed: {sortDirection === "asc" ? "Ascending" : "Descending"}
                </button>

                {/* View/Remove selected breed filters */}
                {selectedBreeds.length > 0 && (
                    <div className="selected-filters">
                        {selectedBreeds.map((breed) => (
                            <div key={breed} className="selected-filter">
                                {breed}
                                <button
                                    className="remove-button"
                                    onClick={() =>
                                        removeSelectedBreed(breed)
                                    }>
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/*Remove all breed filters*/}
                {selectedBreeds.length > 0 && (
                    <div>
                        <button
                            className="clear-all-button"
                            onClick={clearAllSelectedBreeds}>Clear All</button>
                    </div>
                )}
            </div>

            <button
                className="generate-match-button"
                onClick={generateMatch} disabled={favorites.length === 0}>
                Generate Match
            </button>

            <div className="dog-grid">
                {dogs.map((dog) => (
                    <div className="dog-card" key={dog.id}>
                        <Link
                            to={`/dog/${dog.name.replace(/\s+/g, '-').toLowerCase()}/${dog.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img className="dog-image" src={dog.img} alt={dog.name} />
                            <div className="dog-info">
                                <h3 className="dog-name">{dog.name}</h3>
                                <p className="dog-breed">{dog.breed}</p>
                                <p className="dog-age">{dog.age} years old</p>
                                <p className="dog-location">Zip: {dog.zip_code}</p>
                            </div>
                        </Link>
                    <button
                        className={`favorite-button ${
                            favorites.includes(dog.id) ? "favorited" : ""
                        }`}
                        onClick={() => toggleFavorite(dog.id)}
                    >
                        {favorites.includes(dog.id) ? "❤️ Favorite" : "♡ Favorite"}
                    </button>
                </div>


                ))}
            </div>
            <div className="pagination-controls">
                <button
                    className="pagination-button"
                    onClick={handlePrevPage}
                    disabled={!prevPageQuery}
                >
                    Previous
                </button>
                <button
                    className="pagination-button"
                    onClick={handleNextPage}
                    disabled={!nextPageQuery}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default SearchPage;