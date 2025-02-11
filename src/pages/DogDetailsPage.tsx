import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

interface Dog {
    id: string;
    img: string;
    name: string;
    age: number;
    zip_code: string;
    breed: string;
}

interface Location {
    zip_code: string;
    latitude: number;
    longitude: number;
    city: string;
    state: string;
    county: string;
}

function DogDetailsPage() {
    const { dogId, dogName } = useParams<{ dogId: string; dogName: string }>();
    const [dog, setDog] = useState<Dog | null>(null);
    const [location, setLocation] = useState<Location | null>(null);

    useEffect(() => {
        (async () => {
            try {
                // Fetch dog details
                const dogResponse = await axios.post(
                    "https://frontend-take-home-service.fetch.com/dogs",
                    [dogId],
                    { withCredentials: true }
                );
                setDog(dogResponse.data[0]);

                // Fetch location details
                const zipCode = dogResponse.data[0].zip_code;
                const locationResponse = await axios.post(
                    "https://frontend-take-home-service.fetch.com/locations",
                    [zipCode],
                    { withCredentials: true }
                );
                setLocation(locationResponse.data[0]);
            } catch (error) {
                console.error("Error fetching dog details or location", error);
            }
        })();
    }, [dogId]);

    return (
        <div>
            {dog && (
                <>
                    <h1>{dogName}</h1>
                    <img src={dog.img} alt={dog?.name} />
                    <p><strong>Breed:</strong> {dog.breed}</p>
                    <p><strong>Age:</strong> {dog.age}</p>
                    <p><strong>Zip Code:</strong> {dog.zip_code}</p>
                </>
            )}

            {location && (
                <>
                    <h2>Location Details</h2>
                    <p><strong>City:</strong> {location.city}</p>
                    <p><strong>State:</strong> {location.state}</p>
                    <p><strong>County:</strong> {location.county}</p>
                </>
            )}
        </div>
    );
}

export default DogDetailsPage;