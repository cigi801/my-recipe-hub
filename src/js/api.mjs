

export async function searchRecipes(cuisine = "", diet = "", maxReadyTime = "", offset = 0, number = 5) {

  const API_KEY = import.meta.env.VITE_SPOONACULAR_KEY;
  const BASE_URL = "https://api.spoonacular.com";

  // Build URL with parameters
  let url = `${BASE_URL}/recipes/complexSearch?type=main%20course&number=${number}&offset=${offset}&instructionsRequired=true&apiKey=${API_KEY}`;
  
  // Add optional parameters if provided
  if (cuisine) url += `&cuisine=${encodeURIComponent(cuisine)}`;
  if (diet) url += `&diet=${encodeURIComponent(diet)}`;
  if (maxReadyTime) url += `&maxReadyTime=${maxReadyTime}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("API Error");
    const data = await res.json();
    return data.results;
  } catch (err) {
    console.error("Error fetching from Spoonacular:", err);
    return [];
  }
}

export async function getRecipeDetails(id) {
  const API_KEY = import.meta.env.VITE_SPOONACULAR_KEY;
  const BASE_URL = "https://api.spoonacular.com";
  const url = `${BASE_URL}/recipes/${id}/information?apiKey=${API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch recipe details");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching recipe details:", err);
    return null;
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