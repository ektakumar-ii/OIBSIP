const mainDisplay = document.getElementById("main-display");
const previousDisplay = document.getElementById("previous-display");
const themeToggleBtn = document.getElementById("theme-toggle");
const themeIcon = themeToggleBtn.querySelector(".theme-icon");

let currentInput = "0";
let previousInput = "";
let operator = "";
let shouldResetDisplay = false;

function initTheme() {
    const savedTheme = localStorage.getItem("calculator-theme");
    if (savedTheme) {
        document.documentElement.setAttribute("data-theme", savedTheme);
        themeIcon.textContent = savedTheme === "dark" ? "☀" : "☾";
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.setAttribute("data-theme", "dark");
        themeIcon.textContent = "☀";
    }
}

themeToggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("calculator-theme", newTheme);
    themeIcon.textContent = newTheme === "dark" ? "☀" : "☾";
});

function updateDisplay() {
    mainDisplay.textContent = currentInput;
    if (operator && previousInput) {
        previousDisplay.textContent = `${previousInput} ${operator}`;
    } else {
        previousDisplay.textContent = "";
    }
}

function clearAll() {
    currentInput = "0";
    previousInput = "";
    operator = "";
    shouldResetDisplay = false;
    mainDisplay.classList.remove("error-state");
    clearActiveOperator();
    updateDisplay();
}

function deleteDigit() {
    if (mainDisplay.classList.contains("error-state")) {
        clearAll();
        return;
    }
    if (shouldResetDisplay) return;

    if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = "0";
    }
    updateDisplay();
}

function appendNumber(num) {
    if (mainDisplay.classList.contains("error-state")) {
        clearAll();
    }

    if (shouldResetDisplay) {
        currentInput = num;
        shouldResetDisplay = false;
    } else if (currentInput === "0") {
        currentInput = num;
    } else {
        currentInput += num;
    }
    updateDisplay();
}

function appendDecimal() {
    if (mainDisplay.classList.contains("error-state")) {
        clearAll();
    }

    if (shouldResetDisplay) {
        currentInput = "0.";
        shouldResetDisplay = false;
        updateDisplay();
        return;
    }

    if (!currentInput.includes(".")) {
        currentInput += ".";
        updateDisplay();
    }
}

function handleOperator(op) {
    if (mainDisplay.classList.contains("error-state")) return;

    if (operator && !shouldResetDisplay) {
        calculate();
    }

    previousInput = currentInput;
    operator = op;
    shouldResetDisplay = true;
    updateDisplay();
}

function calculate() {
    if (!operator || !previousInput || mainDisplay.classList.contains("error-state")) return;

    const prev = parseFloat(previousInput);
    const curr = parseFloat(currentInput);
    let result = 0;

    if (isNaN(prev) || isNaN(curr)) return;

    switch (operator) {
        case "+":
            result = prev + curr;
            break;
        case "−":
            result = prev - curr;
            break;
        case "×":
            result = prev * curr;
            break;
        case "÷":
            if (curr === 0) {
                showError("Cannot divide by zero");
                return;
            }
            result = prev / curr;
            break;
        default:
            return;
    }

    result = Math.round(result * 1e10) / 1e10;

    previousDisplay.textContent = `${previousInput} ${operator} ${currentInput} =`;
    currentInput = String(result);
    operator = "";
    previousInput = "";
    shouldResetDisplay = true;
    clearActiveOperator();
    
    mainDisplay.textContent = currentInput;
}

function showError(message) {
    currentInput = message;
    previousInput = "";
    operator = "";
    shouldResetDisplay = true;
    mainDisplay.textContent = message;
    previousDisplay.textContent = "";
    mainDisplay.classList.add("error-state");
    clearActiveOperator();
}

function clearActiveOperator() {
    document.querySelectorAll(".btn-operator").forEach(btn => btn.classList.remove("active-operator"));
}

document.querySelectorAll(".btn").forEach(button => {
    button.addEventListener("click", () => {
        const action = button.dataset.action;
        const value = button.dataset.value;

        if (!action) {
            if (value === ".") {
                appendDecimal();
            } else {
                appendNumber(value);
            }
        } else if (action === "operator") {
            clearActiveOperator();
            button.classList.add("active-operator");
            handleOperator(value);
        } else if (action === "equals") {
            calculate();
        } else if (action === "clear") {
            clearAll();
        } else if (action === "delete") {
            deleteDigit();
        }
    });
});

document.addEventListener("keydown", (e) => {
    if (e.key >= "0" && e.key <= "9") appendNumber(e.key);
    if (e.key === ".") appendDecimal();
    if (e.key === "+") handleOperator("+");
    if (e.key === "-") handleOperator("−");
    if (e.key === "*") handleOperator("×");
    if (e.key === "/") {
        e.preventDefault();
        handleOperator("÷");
    }
    if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        calculate();
    }
    if (e.key === "Backspace") deleteDigit();
    if (e.key === "Escape") clearAll();
});

initTheme();