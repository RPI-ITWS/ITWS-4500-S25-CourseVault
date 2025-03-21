document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch(`${window.location.origin}/courses/spring`);
        if (!response.ok) {
            throw new Error("Failed to fetch course data");
        }

        const data = await response.json();
        const classContainer = document.getElementById("class-container");
        const departmentFilter = document.getElementById("departmentFilter");

        const departments = new Set();

        Object.entries(data.courses).forEach(([courseID, details]) => {
            const department = courseID.split("-")[0]; 
            departments.add(department);

            const courseBox = document.createElement("div");
            courseBox.classList.add("class-box");
            courseBox.setAttribute("data-class", courseID);
            courseBox.setAttribute("data-department", department);
            courseBox.setAttribute("data-description", details.courseName);
            courseBox.setAttribute("data-details", details.Professor);
            courseBox.setAttribute("data-link", "#"); 

            courseBox.innerHTML = `
                <h1>${courseID}</h1>
                <h2>${details.courseName}</h2>
                <h3>${details.Professor}</h3>
            `;

            courseBox.addEventListener("click", () => {
                localStorage.setItem('courseID', courseID);
                console.log(`Course ID: ${localStorage.getItem('courseID')}`);
                window.location.href = `${window.location.origin}/course`;
              });

            classContainer.appendChild(courseBox);
        });

        departments.forEach(dept => {
            const option = document.createElement("option");
            option.value = dept;
            option.textContent = dept;
            departmentFilter.appendChild(option);
        });

        departmentFilter.addEventListener("change", () => {
            const selectedDepartment = departmentFilter.value;
            document.querySelectorAll(".class-box").forEach(box => {
                if (selectedDepartment === "all" || box.getAttribute("data-department") === selectedDepartment) {
                    box.style.display = "flex";
                } else {
                    box.style.display = "none";
                }
            });
        });

    } catch (error) {
        console.error("Error fetching or displaying courses:", error);
    }
});
