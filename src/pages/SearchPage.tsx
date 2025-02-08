import { useState, useEffect } from "react";
import axios from "axios";

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
    const [selectedBreed, setSelectedBreed] = useState<string>("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
    const [nextPageQuery, setNextPageQuery] = useState<string | null>(null);
    const [prevPageQuery, setPrevPageQuery] = useState<string | null>(null);

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
                        }
                    }
                );

                setNextPageQuery(response.data.next || null);
                setPrevPageQuery(response.data.prev || null);

                // Fetch details of each dog using the returned result IDs
                const dogIds = response.data.resultIds;
                await fetchDogsByIds(dogIds);

            } catch (error) {
                console.error("Error fetching dogs", error);
            }
        })();
    }, [sortDirection]);

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

    const searchDogs = async () => {
        try {
            const response = await axios.get(
                "https://frontend-take-home-service.fetch.com/dogs/search",
                {
                    params: { breeds: [selectedBreed] },
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
                <button onClick={handlePrevPage} disabled={!prevPageQuery}>
                    Previous
                </button>
                <button onClick={handleNextPage} disabled={!nextPageQuery}>
                    Next
                </button>
            </div>

            <div>
                <h2>Results</h2>
                <ul>
                    {dogs.map((dog) => (
                        <li key={dog.id}>
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