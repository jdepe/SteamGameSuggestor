document.addEventListener("DOMContentLoaded", function() {

    // Info button event listener
    const infoButtons = document.querySelectorAll(".info-button");

    infoButtons.forEach((button) => {
        button.addEventListener("click", function() {
        const gameTitle = button.getAttribute("data-game-id");
        window.location.href = `/${gameTitle}`;
        });
    });
});

function showDeals(button) {
    const dealsContainer = button.parentElement.parentElement.nextElementSibling;

    if (dealsContainer.classList.contains('hidden')) {
        dealsContainer.classList.remove('hidden');
        let height = dealsContainer.scrollHeight;
        dealsContainer.style.transition = "max-height 0.5s ease-in-out";
        dealsContainer.style.maxHeight = 0;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                dealsContainer.style.maxHeight = height + "px";
            });
        });
    } else {
        dealsContainer.style.maxHeight = 0;
        setTimeout(() => {
            dealsContainer.classList.add('hidden');
            dealsContainer.style.maxHeight = null;
            dealsContainer.style.transition = null;
        }, 500);  // Adjust this time to match the transition duration
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    const gameAndDealsContainers = document.querySelectorAll('.game-and-deals-container');
    
    gameAndDealsContainers.forEach(container => {
        const dealsContainer = container.querySelector('.deals-container');
        const dealCards = dealsContainer.querySelectorAll('.deal-card');
        const seeDealsButton = container.querySelector('.expand-button');

        if (dealCards.length < 1) {
            seeDealsButton.style.display = 'none';
        }
    });
});


