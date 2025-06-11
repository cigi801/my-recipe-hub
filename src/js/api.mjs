

export async function searchRecipes(cuisine = "", diet = "", offset = 0, number = 5) {

  const API_KEY = import.meta.env.VITE_SPOONACULAR_KEY;
  const BASE_URL = "https://api.spoonacular.com";

  const url = `${BASE_URL}/recipes/complexSearch?cuisine=${encodeURIComponent(cuisine)}&diet=${encodeURIComponent(diet)}&type=main%20course&number=${number}&offset=${offset}&apiKey=${API_KEY}`;

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