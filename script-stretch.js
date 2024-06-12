// script-stretch.js

async function fetchAndDisplayContent() {
    try {
        const response = await fetch('stretches.json');
        const stretches = await response.json();
        displayContent(stretches);
    } catch (error) {
        console.error('Failed to fetch and display content:', error);
    }
}

function displayContent(stretches) {
    const stretchContainer = document.getElementById('stretch-container');
    if (!stretchContainer) return;

    const randomIndex = Math.floor(Math.random() * stretches.length);
    const randomStretch = stretches[randomIndex];

    // Ensure description is an array
    if (Array.isArray(randomStretch.description)) {
        let descriptionHtml = '';
        randomStretch.description.forEach((step, index) => {
            descriptionHtml += `<p>${index + 1}. ${step}</p>`;
        });

        stretchContainer.innerHTML = `
            <div id="stretch-image-wrapper">
            <img id="stretch-image" src="${randomStretch.image}" alt="${randomStretch.title}">
            </div>
            <div id="stretch-title">${randomStretch.title}</div>
            <div id="stretch-description">
            <div id="text-wrapper">
            ${descriptionHtml}
            </div>
            <div id ="button-container">
            <button id="done-button">できた！</button>
            <button id="skip-button">また今度</button>
            </div>
            </div>
        `;

        document.getElementById('done-button').addEventListener('click', () => {
            window.close();
        });

        document.getElementById('skip-button').addEventListener('click', () => {
            window.close();
        });
    } else {
        console.error('Description is not an array:', randomStretch.description);
    }
}


document.addEventListener('DOMContentLoaded', fetchAndDisplayContent);