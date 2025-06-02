const API_KEY = import.meta.env.VITE_SPOONACULAR_KEY;
const BASE_URL = "https://api.spoonacular.com";

export async function searchRecipes(query = "chicken") {
  const url = `${BASE_URL}/recipes/complexSearch?query=${encodeURIComponent(query)}&number=5&apiKey=${API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("API Error");
    const data = await res.json();
    return data.results; // array of recipes
  } catch (err) {
    console.error("Error fetching from Spoonacular:", err);
    return [];
  }
}

export async function fetchAPIRecipes() {
    return [
        {
            name: "Spaghetti",
            ingredients: ["pasta", "tomato sauce", "parmesan"]
        },
        {
            name: "Taco Bowl",
            ingredients: ["rice", "beans", "lettuce", "salsa"]
        },
        {
            name: "Grilled Cheese",
            ingredients: ["bread", "cheddar", "butter"]
        }
    ];
}