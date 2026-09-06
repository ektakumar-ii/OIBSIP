async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "[]");
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function getSession() {
  return localStorage.getItem("currentUser");
}

function setSession(username) {
  localStorage.setItem("currentUser", username);
}

function clearSession() {
  localStorage.removeItem("currentUser");
}

function requireAuth() {
  const user = getSession();
  if (!user) {
    window.location.href = "login.html";
  }
  return user;
}

function showAlert(element, message, type = "error") {
  element.textContent = message;
  element.className = `alert alert-${type} show`;
}

function hideAlert(element) {
  element.className = "alert";
  element.textContent = "";
}