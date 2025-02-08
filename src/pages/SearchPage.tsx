import { useState, useEffect } from "react";
import axios from "axios";

interface Dog {
    img: string;
    name: string;
    age: number;
    zip_code: string;
    breed: string;
}

function SearchPage() {
    const [dogs, setDogs] = useState<Dog[]>([]);
    const [breeds, setBreeds] = useState<string[]>([]);
    const [selectedBreed, setSelectedBreed] = useState<string>("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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
                        withCredentials: true,
                        params: {
                            sort: `breed:${sortDirection}`, // Sort alphabetically by breed
                            size: 25,          // Fetch 25 results
                        }
                    }
                );

                // Fetch details of each dog using the returned result IDs
                const dogIds = response.data.resultIds;
                if (dogIds.length) {
                    const dogDetailsResponse = await axios.post(
                        "https://frontend-take-home-service.fetch.com/dogs",
                        dogIds,
                        { withCredentials: true }
                    );
                    setDogs(dogDetailsResponse.data);
                }
            } catch (error) {
                console.error("Error fetching dogs", error);
            }
        })();
    }, [sortDirection]);

    const searchDogs = async () => {
        try {
            // Step 1: Fetch Dog IDs by Breed
            const searchResponse = await axios.get(
                "https://frontend-take-home-service.fetch.com/dogs/search",
                {
                    params: { breeds: [selectedBreed] },
                    withCredentials: true,
                }
            );
            const dogIds = searchResponse.data.resultIds;

            // Step 2: Fetch Full Dog Details by IDs
            if (dogIds.length > 0) {
                const dogResponse = await axios.post(
                    "https://frontend-take-home-service.fetch.com/dogs",
                    dogIds.slice(0, 10), // limit to 10 for demo purposes
                    { withCredentials: true }
                );
                setDogs(dogResponse.data);
            }
        } catch (error) {
            console.error("Error searching dogs", error);
        }
    };

    return (
        <div>
            <h1>Search Dogs</h1>
            <select
                value={selectedBreed}
                onChange={(e) => setSelectedBreed(e.target.value)}
            >
                <option value="">Select Breed</option>
                {breeds.map((breed) => (
                    <option key={breed} value={breed}>
                        {breed}
                    </option>
                ))}
            </select>
            <button onClick={searchDogs}>Search</button>
            <button onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}>
                Sort by breed: {sortDirection === "asc" ? "Ascending" : "Descending"}
            </button>

            <div>
                <h2>Results</h2>
                <ul>
                    {dogs.map((dog) => (
                        <li key={dog.name}>
                            <img src={dog.img} alt={dog.name} style={{ width: "150px" }} />
                            <p><strong>Name:</strong> {dog.name}</p>
                            <p><strong>Age:</strong> {dog.age}</p>
                            <p><strong>Zip Code:</strong> {dog.zip_code}</p>
                            <p><strong>Breed:</strong> {dog.breed}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default SearchPage;