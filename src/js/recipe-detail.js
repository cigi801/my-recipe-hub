import { loadFromStorage, saveToStorage } from "./storage.mjs";
import { getRecipeDetails } from "./api.mjs";

// Get URL parameters
function getURLParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    console.log('Current URL:', window.location.href); // Debug
    console.log('URL Search params:', window.location.search); // Debug
    console.log(`Looking for parameter '${name}':`, urlParams.get(name)); // Debug
    return urlParams.get(name);
}

// Initialize the recipe detail page
async function initRecipeDetail() {
    console.log('initRecipeDetail called'); // Debug
    const recipeId = getURLParameter('id');
    console.log('Recipe ID from URL:', recipeId); // Debug
    
    if (!recipeId) {
        document.getElementById('recipeDetailContainer').innerHTML = 
            '<div class="error">No recipe ID provided. <a href="/my-recipes">Return to My Recipes</a></div>';
        return;
    }
    
    await loadRecipeDetail(recipeId);
    setupEventListeners();
}

// Load and display recipe details
async function loadRecipeDetail(recipeId) {
    const container = document.getElementById('recipeDetailContainer');
    
    try {
        // First, try to load from localStorage (saved recipes)
        const savedRecipes = loadFromStorage('myRecipes') || [];
        let recipe = savedRecipes.find(r => r.id == recipeId);
        
        if (recipe) {
            // Found in saved recipes
            renderRecipeDetail(recipe);
            return;
        }
        
        // If not found in saved recipes, try loading from API
        recipe = await getRecipeDetails(recipeId);
        
        if (!recipe) {
            container.innerHTML = '<div class="error">Recipe not found.</div>';
            return;
        }
        
        // Convert API format
        recipe = {
            id: recipe.id,
            name: recipe.title,
            ingredients: recipe.extendedIngredients?.map(i => i.original) || [],
            instructions: recipe.instructions || recipe.analyzedInstructions || 'No instructions available',
            image: recipe.image,
            readyInMinutes: recipe.readyInMinutes,
            servings: recipe.servings,
            summary: recipe.summary
        };
        
        renderRecipeDetail(recipe);
        
    } catch (error) {
        console.error('Error loading recipe:', error);
        container.innerHTML = '<div class="error">Error loading recipe details.</div>';
    }
}

// Render the recipe detail
function renderRecipeDetail(recipe) {
    const container = document.getElementById('recipeDetailContainer');
    
    const prepTime = recipe.readyInMinutes ? `${recipe.readyInMinutes} minutes` : 'Time not specified';
    const servings = recipe.servings ? `${recipe.servings} servings` : '';
    
    container.innerHTML = `
        <div class="recipe-detail">
            <div class="recipe-header">
                <h2>${recipe.name}</h2>
                <div class="recipe-meta">
                    <span class="prep-time">⏱️ ${prepTime}</span>
                    ${servings ? `<span class="servings">👥 ${servings}</span>` : ''}
                </div>
            </div>
            
            ${recipe.image ? `
                <div class="recipe-image">
                    <img src="${recipe.image}" alt="${recipe.name}" />
                </div>
            ` : ''}
            
            ${recipe.summary ? `
                <div class="recipe-summary">
                    <h3>About This Recipe</h3>
                    <div class="summary-content">${recipe.summary}</div>
                </div>
            ` : ''}
            
            <div class="recipe-ingredients">
                <h3>Ingredients</h3>
                <ul>
                    ${recipe.ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                </ul>
            </div>
            
            ${recipe.instructions ? `
                <div class="recipe-instructions">
                    <h3>Instructions</h3>
                    <div class="instructions-content">${formatInstructions(recipe.instructions)}</div>
                </div>
            ` : ''}
            
            <div class="recipe-actions">
                <label for="daySelect">Add to week plan:</label>
                <select id="daySelect">
                    <option value="">-- Select Day --</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                </select>
                <button id="assignToDay" data-id="${recipe.id}">Assign to Day</button>
            </div>
        </div>
    `;
    
    // Show the add to week button
    document.getElementById('addToWeekBtn').style.display = 'inline-block';
}

// Format instructions (same as in my-recipes.mjs)
function formatInstructions(instructions) {
    if (typeof instructions === 'string') {
        return `<div class="instruction-text">${instructions}</div>`;
    } else if (Array.isArray(instructions) && instructions.length > 0) {
        let formattedInstructions = '<ol class="instruction-list">';
        instructions.forEach(instructionGroup => {
            if (instructionGroup.steps && Array.isArray(instructionGroup.steps)) {
                instructionGroup.steps.forEach(step => {
                    formattedInstructions += `<li>${step.step}</li>`;
                });
            }
        });
        formattedInstructions += '</ol>';
        return formattedInstructions;
    }
    return '<p>No instructions available</p>';
}

// Setup event listeners
function setupEventListeners() {
    // Back button
    document.getElementById('backToRecipes').addEventListener('click', () => {
        window.location.href = '/my-recipes';
    });
    
    // Assign to day functionality
    document.addEventListener('click', (e) => {
        if (e.target.id === 'assignToDay') {
            const recipeId = e.target.dataset.id;
            const selectedDay = document.getElementById('daySelect').value;
            
            if (selectedDay) {
                assignRecipeToDay(recipeId, selectedDay);
            } else {
                alert('Please select a day first.');
            }
        }
    });
}

// Assign recipe to a day in the week plan
function assignRecipeToDay(recipeId, day) {
    const weekPlan = loadFromStorage('weekPlan') || {};
    weekPlan[day] = Number(recipeId);
    saveToStorage('weekPlan', weekPlan);
    alert(`Recipe assigned to ${day}!`);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initRecipeDetail);