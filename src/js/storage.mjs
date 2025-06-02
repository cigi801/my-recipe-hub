
export function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

export function loadFromStorage(key) {
    return JSON.parse(localStorage.getItem(key)) || null;
}