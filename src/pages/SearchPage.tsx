import React from "react";
import {useState, useEffect} from "react";
import axios from "axios";
import { Link } from "react-router-dom";

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

    const handleBreedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const breed = e.target.value;
        setSelectedBreeds((prevSelectedBreeds) => {
            if (prevSelectedBreeds.includes(breed)) {
                // If the breed is already selected, remove it
                return prevSelectedBreeds.filter((b) => b !== breed);
            } else {
                // Otherwise, add it to the list of selected breeds
                return [...prevSelectedBreeds, breed];
            }
        })
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

            alert(`Your match is: ${matchedDog.name} 🐾`);
            window.open(`/dog/${matchedDogId}`, `_blank`, "noopener, noreferrer");
        } catch (error) {
            console.error("Error generating match", error);
        }
    }

    return (
        <div>
            <h1>Search Dogs</h1>
            <h3>Select Breeds</h3>
            <div>
                {breeds.map((breed) => (
                    <div key={breed}>
                        <input
                            type="checkbox"
                            id={breed}
                            value={breed}
                            checked={selectedBreeds.includes(breed)}
                            onChange={(e) => handleBreedChange(e)}
                        />
                        <label htmlFor={breed}>{breed}</label>
                    </div>
                ))}
            </div>
            <button onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}>
                Sort by breed: {sortDirection === "asc" ? "Ascending" : "Descending"}
            </button>

            <div>
                <button onClick={handlePrevPage} disabled={!prevPageQuery}>
                    Previous
                </button>
                <button onClick={handleNextPage} disabled={!nextPageQuery}>
                    Next
                </button>
            </div>

            <div>
                <button onClick={generateMatch} disabled={favorites.length === 0}>
                    Generate Match
                </button>
            </div>

            <div>
                <h2>Results</h2>
                <ul>
                    {dogs.map((dog) => (
                        <li key={dog.id}>
                            <Link
                                to={`/dog/${dog.name.replace(/\s+/g, '-').toLowerCase()}/${dog.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img src={dog.img} alt={dog.name} style={{width: "150px"}}/>
                                <p><strong>Name:</strong> {dog.name}</p>
                                <p><strong>Age:</strong> {dog.age}</p>
                                <p><strong>Zip Code:</strong> {dog.zip_code}</p>
                                <p><strong>Breed:</strong> {dog.breed}</p>
                            </Link>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={favorites.includes(dog.id)}
                                    onChange={() => toggleFavorite(dog.id)}
                                />
                                Favorite
                            </label>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default SearchPage;