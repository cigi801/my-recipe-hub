import { loadFromStorage, saveToStorage } from './storage.mjs';

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function initPlannerPage(containerId = "plannerContainer") {
  const plannerEl = document.getElementById(containerId);
  const myRecipes = loadFromStorage("myRecipes") || [];
  const weekPlan = loadFromStorage("weekPlan") || {};

  function renderPlanner() {
    plannerEl.innerHTML = "";
    days.forEach(day => {
      const assignedId = weekPlan[day];
      const assignedRecipe = myRecipes.find(r => r.id === assignedId);

      const card = document.createElement("div");
      card.className = "day-card";
      card.innerHTML = `
        <h3>${day}</h3>
        <p><strong>Meal:</strong> ${assignedRecipe ? assignedRecipe.name : "<em>Not assigned</em>"}</p>
        <select id="select-${day}">
          <option value="">-- Assign a recipe --</option>
          ${myRecipes.map(r => `
            <option value="${r.id}" ${assignedId === r.id ? "selected" : ""}>${r.name}</option>
          `).join("")}
        </select>
      `;

      const dropdown = card.querySelector("select");
      dropdown.addEventListener("change", () => {
        if (dropdown.value) {
          weekPlan[day] = Number(dropdown.value);
        } else {
          delete weekPlan[day];
        }
        saveToStorage("weekPlan", weekPlan);
        renderPlanner();
      });

      plannerEl.appendChild(card);
    });
       
  }

  renderPlanner();
}