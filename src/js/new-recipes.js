import { loadFromStorage, saveToStorage } from "./storage.mjs";
import { searchRecipes, getRecipeDetails } from "./api.mjs";

export function initAddRecipes() {
    setupTabSwitching();
    setupSearchButton();
    setupAddRecipeModal();
    
    // Set default active tab
    setDefaultTab();
}

// Set the default active tab
function setDefaultTab() {
    const firstTab = document.querySelector('.tab-button');
    const firstContent = document.querySelector('.tab-content');
    
    if (firstTab && firstContent) {
        firstTab.classList.add('active');
        firstContent.classList.add('active');
    }
}

// Tab switching functionality
function setupTabSwitching() {
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            btn.classList.add('active');
            
            // Handle different tabs
            if (btn.dataset.tab === 'browse-recipes') {
                document.getElementById(btn.dataset.tab).classList.add('active');
                renderBrowseRecipes();
            } else if (btn.dataset.tab === 'my-recipes') {
                document.getElementById(btn.dataset.tab).classList.add('active');
                renderMyRecipes();
            } else if (btn.dataset.tab === 'add-custom-recipe') {
                // Open the modal instead of showing content
                openAddRecipeModal();
                // Keep Browse Recipes tab visually active
                btn.classList.remove('active');
                document.querySelector('[data-tab="browse-recipes"]').classList.add('active');
                document.getElementById('browse-recipes').classList.add('active');
            }
        });
    });
}

// Search button functionality
function setupSearchButton() {
    const searchBtn = document.getElementById("searchRecipesBtn");
    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
            console.log("Search button clicked!");
            const cuisine = document.getElementById("cuisineSelect").value;
            const diet = document.getElementById("dietSelect").value;
            const maxTime = document.getElementById("maxTimeSelect").value;
            
            console.log("Search params:", { cuisine, diet, maxTime });
            renderBrowseRecipes(cuisine, diet, maxTime);
        });
    } else {
        console.error("Search button not found!");
    }
}

// Render browse recipes section
async function renderBrowseRecipes(cuisine = "", diet = "", maxReadyTime = "") {
    const container = document.getElementById("browseRecipeList");
    
    if (!cuisine && !diet && !maxReadyTime) {
        container.innerHTML = `
            <div class="search-prompt">
                <div class="search-prompt-icon">🔍</div>
                <h3>Ready to discover new recipes?</h3>
                <p>Use the filters above to search for recipes that match your preferences.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Searching for delicious recipes...</p>
        </div>
    `;

    try {
        const recipes = await searchRecipes(cuisine, diet, maxReadyTime);

        if (!recipes.length) {
            container.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">😔</div>
                    <h3>No recipes found</h3>
                    <p>Try adjusting your search criteria or browse different cuisine types.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = "";
        
        // Get basic details for each recipe first to show prep time
        const recipePromises = recipes.map(async (recipe) => {
            const details = await getRecipeDetails(recipe.id);
            return { ...recipe, details };
        });
        
        const recipesWithDetails = await Promise.all(recipePromises);
        
        recipesWithDetails.forEach(recipe => {
            const card = document.createElement("div");
            card.className = "recipe-card browse";
            
            const prepTime = recipe.details?.readyInMinutes ? `${recipe.details.readyInMinutes} mins` : 'Time not available';
            const servings = recipe.details?.servings ? `${recipe.details.servings} servings` : '';
            
            card.innerHTML = `
                ${recipe.image ? `<img src="${recipe.image}" alt="${recipe.title}" />` : ""}
                <div class="card-content">
                    <h3>${recipe.title}</h3>
                    <div class="recipe-meta">
                        <span>⏱️ ${prepTime}</span>
                        ${servings ? `<span>👥 ${servings}</span>` : ''}
                    </div>
                    <button class="ingredients-toggle" data-id="${recipe.id}">View Ingredients ▼</button>
                    <div class="recipe-ingredients" id="ingredients-${recipe.id}">
                        <h4>Ingredients:</h4>
                        <ul>
                            ${recipe.details?.extendedIngredients?.map(ingredient => `<li>${ingredient.original}</li>`).join('') || '<li>Ingredients not available</li>'}
                        </ul>
                    </div>
                    <button class="add-recipe-btn" data-id="${recipe.id}">
                        <span class="btn-icon">➕</span>
                        Add to My Recipes
                    </button>
                </div>
            `;

            container.appendChild(card);
        });
        
        // Set up event delegation ONCE after all cards are created
        setupBrowseRecipeInteractions(recipesWithDetails);
        
    } catch (error) {
        console.error("Error loading recipes:", error);
        container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <h3>Search Error</h3>
                <p>Error loading recipes. Please check your API key and try again.</p>
                <button onclick="location.reload()" class="btn-secondary">Retry</button>
            </div>
        `;
    }
}

// Handle all interactions with event delegation
function setupBrowseRecipeInteractions(recipesWithDetails) {
    const container = document.getElementById("browseRecipeList");
    
    // Remove any existing listeners by cloning the container
    const newContainer = container.cloneNode(true);
    container.parentNode.replaceChild(newContainer, container);
    
    // Single event listener for the entire container
    newContainer.addEventListener("click", async (e) => {
        const recipeId = e.target.dataset.id;
        
        if (e.target.classList.contains("ingredients-toggle")) {
            // Handle ingredient toggle
            const ingredientsDiv = document.getElementById(`ingredients-${recipeId}`);
            const isShowing = ingredientsDiv.classList.contains('show');
            
            if (isShowing) {
                ingredientsDiv.classList.remove('show');
                e.target.textContent = 'View Ingredients ▼';
            } else {
                ingredientsDiv.classList.add('show');
                e.target.textContent = 'Hide Ingredients ▲';
            }
        } 
        else if (e.target.classList.contains("add-recipe-btn") || e.target.closest('.add-recipe-btn')) {
            // Prevent double-clicks
            const button = e.target.classList.contains("add-recipe-btn") ? e.target : e.target.closest('.add-recipe-btn');
            
            if (button.disabled) {
                console.log('Button already disabled, preventing double-click');
                return;
            }
            
            e.preventDefault();
            e.stopPropagation();
            
            await handleAddRecipe(recipeId, button, recipesWithDetails);
        }
    });
}

// Handle adding recipes
async function handleAddRecipe(recipeId, button, recipesWithDetails) {
    button.textContent = "Adding...";
    button.disabled = true;
    
    try {
        // Find the recipe from our already-loaded data
        const recipe = recipesWithDetails.find(r => r.id == recipeId);
        const fullDetails = recipe?.details;

        if (!fullDetails) {
            alert("Error loading recipe details.");
            button.textContent = "Add to My Recipes";
            button.disabled = false;
            return;
        }

        const ingredients = fullDetails.extendedIngredients?.map(i => i.original) || ["No ingredients listed"];
        const instructions = fullDetails.instructions || fullDetails.analyzedInstructions || "No instructions available";

        const saved = loadFromStorage("myRecipes") || [];
        
        // Check if recipe already exists
        const existingRecipe = saved.find(r => r.id === recipe.id);
        if (existingRecipe) {
            alert("Recipe already saved!");
            button.textContent = "Already Added";
            button.classList.add("added");
            return; // Don't re-enable button
        }

        // Save the recipe
        saved.push({
            id: recipe.id,
            name: fullDetails.title,
            ingredients: ingredients,
            instructions: instructions,
            image: fullDetails.image || recipe.image || null,
            readyInMinutes: fullDetails.readyInMinutes || null,
            servings: fullDetails.servings || null
        });

        saveToStorage("myRecipes", saved);
        alert("Recipe saved to My Recipes!");
        button.textContent = "Added!";
        button.classList.add("added");
        // Don't re-enable the button
        
    } catch (error) {
        console.error("Error saving recipe:", error);
        alert("Error saving recipe. Please try again.");
        button.textContent = "Add to My Recipes";
        button.disabled = false;
    }
}

// Modal functionality for custom recipes
function setupAddRecipeModal() {
    const modal = document.getElementById('addRecipeModal');
    const closeBtn = document.getElementById('closeAddRecipeModal');
    const cancelBtn = document.getElementById('cancelAddRecipe');
    const form = document.getElementById('addRecipeForm');
    const addIngredientBtn = document.getElementById('modalAddIngredientBtn');
    const ingredientInput = document.getElementById('modalIngredientInput');
    const ingredientsList = document.getElementById('modalIngredientList');

    // Close modal events
    if (closeBtn) {
        closeBtn.addEventListener('click', closeAddRecipeModal);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeAddRecipeModal);
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
            closeAddRecipeModal();
        }
    });

    // Add ingredient functionality
    if (addIngredientBtn && ingredientInput) {
        addIngredientBtn.addEventListener('click', addIngredient);
        ingredientInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addIngredient();
            }
        });
    }

    // Form submission
    if (form) {
        form.addEventListener('submit', handleAddRecipeSubmit);
    }

    function addIngredient() {
        const value = ingredientInput.value.trim();
        if (value) {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${value}</span>
                <button type="button" class="remove-ingredient" title="Remove ingredient">×</button>
            `;
            
            // Add remove functionality
            li.querySelector('.remove-ingredient').addEventListener('click', () => {
                li.remove();
            });
            
            ingredientsList.appendChild(li);
            ingredientInput.value = '';
            ingredientInput.focus();
        }
    }

    function handleAddRecipeSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const recipeName = formData.get('recipeName').trim();
        const assignDay = formData.get('assignDay');
        
        if (!recipeName) {
            alert('Please enter a recipe name');
            return;
        }

        // Get ingredients from the list
        const ingredients = Array.from(ingredientsList.children).map(li => 
            li.querySelector('span').textContent
        );

        if (ingredients.length === 0) {
            alert('Please add at least one ingredient');
            return;
        }

        // Create new recipe
        const newRecipe = {
            id: Date.now(),
            name: recipeName,
            ingredients: ingredients,
            readyInMinutes: null,
            image: null,
            instructions: null
        };

        // Save to storage
        const recipes = loadFromStorage("myRecipes") || [];
        recipes.push(newRecipe);
        saveToStorage("myRecipes", recipes);

        // Assign to day if selected
        if (assignDay) {
            const weekPlan = loadFromStorage("weekPlan") || {};
            weekPlan[assignDay] = newRecipe.id;
            saveToStorage("weekPlan", weekPlan);
        }

        // Show success animation
        form.classList.add('recipe-added');
        
        setTimeout(() => {
            form.classList.remove('recipe-added');
            showAddRecipeSuccessModal(recipeName);
        }, 600);
    }
}

function openAddRecipeModal() {
    const modal = document.getElementById('addRecipeModal');
    const nameInput = document.getElementById('modalRecipeName');
    
    if (modal) {
        modal.style.display = 'flex';
        // Focus on name input after animation
        setTimeout(() => {
            if (nameInput) nameInput.focus();
        }, 300);
    }
}

function closeAddRecipeModal() {
    const modal = document.getElementById('addRecipeModal');
    if (modal) {
        modal.style.display = 'none';
        clearAddRecipeForm();
        
        // Switch back to Browse Recipes tab
        document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        
        const browseTab = document.querySelector('[data-tab="browse-recipes"]');
        const browseContent = document.getElementById('browse-recipes');
        
        if (browseTab) browseTab.classList.add('active');
        if (browseContent) browseContent.classList.add('active');
    }
}

function clearAddRecipeForm() {
    const form = document.getElementById('addRecipeForm');
    const ingredientsList = document.getElementById('modalIngredientList');
    
    if (form) {
        form.reset();
    }
    if (ingredientsList) {
        ingredientsList.innerHTML = '';
    }
}

function showAddRecipeSuccessModal(recipeName) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content success-modal">
            <div class="modal-header" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">
                <h3>✅ Recipe Added!</h3>
            </div>
            <div class="modal-body" style="text-align: center; padding: 2rem;">
                <p><strong>"${recipeName}"</strong> has been added to your collection.</p>
                <p>Would you like to add another recipe?</p>
                <div class="modal-actions" style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
                    <button class="btn-secondary" id="viewRecipes">View My Recipes</button>
                    <button class="btn-primary" id="addAnother">Add Another Recipe</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('#addAnother').addEventListener('click', () => {
        modal.remove();
        clearAddRecipeForm();
        // Modal stays open for another recipe
    });
    
    modal.querySelector('#viewRecipes').addEventListener('click', () => {
        modal.remove();
        closeAddRecipeModal();
        window.location.href = '/my-recipes';
    });
}