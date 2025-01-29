document.addEventListener("DOMContentLoaded", () => {
    const moreButton = document.getElementById("moreButton");
    const dropdownMenu = document.getElementById("dropdownMenu");
    const navTabs = document.querySelectorAll(".nav-tab");

    let activeTab = null;

    const toggleDropdown = () => {
        if (moreButton.classList.contains("active")) {
            dropdownMenu.style.display = "flex";
            moreButton.style.backgroundColor = "#ff8c00";
        } else {
            dropdownMenu.style.display = "none";
            moreButton.style.backgroundColor = "#e6d5c0";
        }
    };

    navTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            if (activeTab !== tab) {
                if (activeTab) {
                    activeTab.classList.remove("active");
                    if (activeTab === moreButton) {
                        moreButton.style.backgroundColor = "#e6d5c0";
                    }
                }
                tab.classList.add("active");
                activeTab = tab;
                toggleDropdown();
                if (tab === moreButton) {
                    moreButton.style.backgroundColor = "#ac9f90";
                }
            } else {
                tab.classList.remove("active");
                activeTab = null;
                dropdownMenu.style.display = "none";
                if (tab === moreButton) {
                    moreButton.style.backgroundColor = "#e6d5c0";
                }
            }
        });
    });

    document.addEventListener("click", (e) => {
        if (!moreButton.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.style.display = "none";
            moreButton.classList.remove("active");
            moreButton.style.backgroundColor = "#e6d5c0";
        }
    });
});
