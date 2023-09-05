document.addEventListener("DOMContentLoaded", function() {

    // Info button event listener
    const infoButtons = document.querySelectorAll(".info-button");

    infoButtons.forEach((button) => {
        button.addEventListener("click", function() {
        const gameTitle = button.getAttribute("data-game-id");
        window.location.href = `/${gameTitle}`;
        });
    });


    // Expand/Collapse button event listener
    const expandButtons = document.querySelectorAll(".expand-button");

    expandButtons.forEach((button) => {
        button.addEventListener("click", function() {
            const dealsContainer = button.closest(".deals-container");
            const hiddenDeals = dealsContainer.querySelectorAll(".deal-card.hidden");
            const allDeals = dealsContainer.querySelectorAll(".deal-card");

            hiddenDeals.forEach((deal) => {
                deal.classList.remove("hidden");
            });

            if (hiddenDeals.length > 0) {
                button.textContent = "Show Less";
            } else {
                allDeals.forEach((deal, index) => {
                    if (index !== 0) {
                        deal.classList.add("hidden");
                    }
                });
                button.textContent = "Show More";
            }
        });
    });
});


