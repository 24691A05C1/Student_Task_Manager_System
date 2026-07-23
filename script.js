const API = "https://student-task-manager-system.onrender.com";
let allTasks = [];

let reminderAudio = new Audio("sound/notification.mp3");
reminderAudio.preload = "auto";

document.addEventListener("click", () => {
    reminderAudio.play().then(() => {
        reminderAudio.pause();
        reminderAudio.currentTime = 0;
    }).catch(() => {});
}, { once: true });

function playReminderSound() {
    reminderAudio.currentTime = 0;
    reminderAudio.play();
}// Register
function register() {
const name = document.getElementById("name").value.trim();
const email = document.getElementById("email").value.trim();
const password = document.getElementById("password").value.trim();

if (name === "" || email === "" || password === "") {
    Swal.fire({
        title: "Missing Information",
        text: "Please fill in all the required fields.",
        icon: "warning",
        confirmButtonText: "OK",
        confirmButtonColor: "#F48FB1",
        background: "#FFF8FC",
        color: "#5B4B8A"
    });
    return;
}
    let data = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    fetch(API + "/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(data => {

        document.getElementById("message").innerHTML =
        "🌸 Account Created Successfully!";

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);

    });

}

// Login
function login(){
const email = document.getElementById("email").value.trim();
const password = document.getElementById("password").value.trim();

if (email === "" || password === "") {
    Swal.fire({
        title: "Missing Information",
        text: "Please enter your email and password.",
        icon: "warning",
        confirmButtonText: "OK",
        confirmButtonColor: "#F48FB1",
        background: "#FFF8FC",
        color: "#5B4B8A"
    });
    return;
}
    let data = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    fetch(API + "/auth/login",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(data)
    })
    .then(res => res.json())
    .then(data => {

        console.log(data);
if(data.token){

    localStorage.setItem("token", data.token);
    localStorage.setItem("userName", data.name);

    Swal.fire({
        title: "Login Successful",
        text: "Welcome back!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: "#FFF8FC",
        color: "#5B4B8A"
    }).then(() => {
        window.location.href = "dashboard.html";
    });

}else{

    Swal.fire({
        title: "Login Failed",
        text:"Invalid mail or password",
        icon: "error",
        confirmButtonColor: "#F48FB1",
        background: "#FFF8FC",
        color: "#5B4B8A"
    });

}

});

}
// Add Task
function addTask(){

    if(document.getElementById("taskBtn").innerHTML === "Update Task"){
        updateEditedTask();
        return;
    }

    let token = localStorage.getItem("token");
    const title = document.getElementById("title").value.trim();
const description = document.getElementById("description").value.trim();
const dueDate = document.getElementById("due_date").value;

if (title === "" || description === "" || dueDate === "") {
    Swal.fire({
        title: "Missing Information",
        text: "Please fill in all the required fields.",
        icon: "warning",
        confirmButtonText: "OK",
        confirmButtonColor: "#F48FB1",
        background: "#FFF8FC",
        color: "#5B4B8A"
    });
    return;
}
    let data = {
        task_title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        priority: document.getElementById("priority").value,
        due_date: document.getElementById("due_date").value
    };

    fetch(API+"/task/add",{

        method:"POST",

        headers:{
            "Content-Type":"application/json",
            "Authorization":"Bearer "+token
        },

        body:JSON.stringify(data)

    })

    .then(res=>res.json())

    .then(data=>{
Swal.fire({
    title: "✨ Task Added",
    text: "Your task has been added successfully.",
    icon: "success",
    timer: 1800,
    showConfirmButton: false,
    background: "#FFF8FC",
    color: "#5B4B8A",
    iconColor: "#66BB6A"
});
getTasks();
clearForm();
    });

}
function clearForm() {
    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    document.getElementById("priority").value = "High";
    document.getElementById("due_date").value = "";
    document.getElementById("taskId").value = "";
    document.getElementById("taskBtn").innerHTML = "Add Task";
}
// Get Tasks
function getTasks(){
    let token = localStorage.getItem("token");
    console.log("TOKEN IN GETTASKS:", token);

    fetch(API + "/task/all", {

        method: "GET",

        headers: {
            "Authorization": "Bearer " + token
        }

    })

    .then(res => {
        console.log("Status:", res.status);
        return res.json();
    })

    .then(tasks => {
     allTasks = [...tasks];
        console.log(JSON.stringify(tasks, null, 2));

        if(!Array.isArray(tasks)){
            console.log(tasks);
            return;
        }

        let list = document.getElementById("taskList");
        list.innerHTML = "";
if (tasks.length === 0) {
    list.innerHTML = `
        <div class="empty-state">
            <h3>📋 No Tasks Yet</h3>
            <p>Add your first task to get started!</p>
        </div>
    `;
    return;
}

        let total = tasks.length;
let completed = tasks.filter(task => task.status === "Completed").length;
let pending = total - completed;
let favorites = tasks.filter(task => task.favorite).length;

        document.getElementById("totalTasks").innerText = total;
        document.getElementById("pendingTasks").innerText = pending;
        document.getElementById("completedTasks").innerText = completed;
        document.getElementById("streakCount").innerText = completed;
        if (completed === total && total > 0) {
    document.getElementById("motivationText").innerText =
        "🎉 Amazing! You've completed all your tasks!";
} else if (completed > 0) {
    document.getElementById("motivationText").innerText =
        "💪 Great job! Keep completing your remaining tasks.";
} else {
    document.getElementById("motivationText").innerText =
        "🚀 Start by completing your first task today!";
}
        // Progress Bar
let progress = total === 0 ? 0 : Math.round((completed / total) * 100);

document.getElementById("progressFill").style.width = progress + "%";
document.getElementById("progressText").innerText = progress + "%";
updateChart(completed, pending);
updatePriorityChart(tasks);
displayTasks(tasks);
loadCalendar(tasks);
});

}
function sortTasks() {

    let sortBy = document.getElementById("sortTasks").value;

    if (sortBy === "priority") {

        const order = {
            "High": 1,
            "Medium": 2,
            "Low": 3
        };

        allTasks.sort((a, b) => order[a.priority] - order[b.priority]);

    }
    else if (sortBy === "due") {

        allTasks.sort((a, b) =>
            new Date(a.due_date) - new Date(b.due_date)
        );

    }
    else if (sortBy === "title") {

        allTasks.sort((a, b) =>
            a.task_title.localeCompare(b.task_title)
        );

    }
    else {
        getTasks();
        return;
    }

    displayTasks(allTasks);

}

function displayTasks(tasks){

    let list = document.getElementById("taskList");
    list.innerHTML = "";

    tasks.forEach(task => {

        list.innerHTML += `
<div class="task-card">

    <div class="task-header">

    <h3>${task.task_title}</h3>

    <div class="top-actions">

        <button
class="favorite-top ${task.favorite ? 'active' : ''}"
onclick="favoriteTask('${task._id}')">

${task.favorite ? "⭐" : "☆"}

</button>

        <span class="${task.status === 'Completed' ? 'completed' : 'pending'}">
            ${task.status === 'Completed'
                ? '✅ Completed'
                : '🟡 Pending'}
        </span>

    </div>

</div>

    <p class="task-description">${task.description}</p>

    <p class="priority ${task.priority.toLowerCase()}">
        <span class="priority-icon">
            ${task.priority === "High" ? "❖" :
              task.priority === "Medium" ? "◆" : "◇"}
        </span>
        ${task.priority} Priority
    </p>

    <p class="due-date">🗓️ Due: ${task.due_date}</p>
    <p>🕒 Created: ${new Date(task.created_at.$date || task.created_at).toLocaleString()}</p>
    <p class="due-status" id="due-${task._id}"></p>

    <div class="task-buttons">

        <button class="edit-btn" onclick="editTask('${task._id}')">
            ✏️ Edit
        </button>
        <button
            class="complete-btn"
            onclick="updateTask('${task._id}')"
            ${task.status === "Completed" ? "disabled" : ""}>
            ${task.status === "Completed" ? "✅ Completed" : "✅ Complete"}
        </button>

        <button class="delete-btn" onclick="deleteTask('${task._id}')">
            🗑️ Delete
        </button>

    </div>

</div>
`;
let today = new Date();
today.setHours(0,0,0,0);

let due = new Date(task.due_date);
due.setHours(0,0,0,0);

let dueElement = document.getElementById(`due-${task._id}`);

if (due < today) {
    dueElement.innerHTML = "🔴 Overdue";
    dueElement.className = "due-status overdue";
}
else if (due.getTime() === today.getTime()) {
    dueElement.innerHTML = "🟡 Due Today";
    dueElement.className = "due-status today";
}
else {
    dueElement.innerHTML = "🟢 Upcoming";
    dueElement.className = "due-status upcoming";
}
    });

}

function filterTasks(status){

    if(status === "All"){
        displayTasks(allTasks);
        return;
    }

    let filtered = allTasks.filter(task => task.status === status);

    displayTasks(filtered);

}
function filterFavorites(){

    let favoriteTasks = allTasks.filter(task => task.favorite);

    if(favoriteTasks.length === 0){
        document.getElementById("taskList").innerHTML = `
        <div class="empty-state">
            <h3>⭐ No Favorite Tasks</h3>
            <p>Mark some tasks as favorite.</p>
        </div>`;
        return;
    }

    displayTasks(favoriteTasks);

}
function setActive(button){

    document.querySelectorAll(".filter-btn").forEach(btn=>{
        btn.classList.remove("active");
    });

    button.classList.add("active");

}
// Edit Task
function editTask(id){

    let token = localStorage.getItem("token");

    fetch(API + "/task/all", {
        headers:{
            "Authorization":"Bearer " + token
        }
    })

    .then(res => res.json())

    .then(tasks => {

        let task = tasks.find(t => t._id == id);

        console.log(task);

        document.getElementById("title").value = task.task_title;
document.getElementById("description").value = task.description;
document.getElementById("due_date").value = task.due_date;
document.getElementById("taskId").value = task._id;
document.getElementById("title").removeAttribute("disabled");
document.getElementById("description").removeAttribute("disabled");
document.getElementById("priority").value = task.priority;
document.getElementById("due_date").removeAttribute("disabled");
document.getElementById("taskBtn").innerHTML = "Update Task";

document.getElementById("title").focus();

    });
}



// Update Task
function updateTask(id){
Swal.fire({
    title: "🌸 Complete Task",
    text: "Are you sure you want to mark this task as completed?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "✅ Yes, Complete",
    cancelButtonText: "💗 Cancel",
    confirmButtonColor: "#81C784",
    cancelButtonColor: "#B39DDB",
    background: "#FFF8FC",
    color: "#5B4B8A",
    borderRadius: "20px"
}).then((result)=>{

        if(result.isConfirmed){

            let token = localStorage.getItem("token");

            fetch(API + "/task/update/" + id, {
    method: "PUT",
    headers: {
        "Authorization": "Bearer " + token
    }
})

            .then(res=>res.json())

            .then(data=>{

                Swal.fire({
                    title: "Completed!",
                    text: "Task marked as completed.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton:false
                });

                getTasks();
            });

        }

    });

}

// Delete Task
// Delete Task
function deleteTask(id){
Swal.fire({
    title: "🗑️ Delete Task",
    text: "Are you sure you want to delete this task?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "🗑️ Yes, Delete",
    cancelButtonText: "💗 Cancel",
    confirmButtonColor: "#F48FB1",
    cancelButtonColor: "#B39DDB",
    background: "#FFF8FC",
    color: "#5B4B8A",
    borderRadius: "20px"
}).then((result) => {

        if(result.isConfirmed){

            let token = localStorage.getItem("token");

            fetch(API + "/task/delete/" + id,{

                method:"DELETE",

                headers:{
                    "Authorization":"Bearer " + token
                }

            })

            .then(res=>res.json())

            .then(data=>{

                Swal.fire({
                    title: "Deleted!",
                    text: "Task deleted successfully.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });

                getTasks();

            });

        }

    });

}
function favoriteTask(id) {

    console.log("Favorite clicked:", id);

    let token = localStorage.getItem("token");

    fetch(API + "/task/favorite/" + id, {
        method: "PUT",
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => {
        console.log("Status:", res.status);
        return res.json();
    })
    .then(data => {
        console.log(data);
        getTasks();
    })
    .catch(err => console.log(err));
}
function updateEditedTask(){

    let token = localStorage.getItem("token");

    let data = {
    task_title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    priority: document.getElementById("priority").value,
    due_date: document.getElementById("due_date").value
};

    fetch(API + "/task/edit/" + document.getElementById("taskId").value, {

        method:"PUT",

        headers:{
            "Content-Type":"application/json",
            "Authorization":"Bearer " + token
        },

        body: JSON.stringify(data)

    })

    .then(res=>res.json())

    .then(data=>{

        Swal.fire({
    title: "🌸 Updated!",
    text: "Your task has been updated successfully.",
    icon: "success",
    timer: 1500,
    showConfirmButton: false,
    background: "#FFF8FC",
    color: "#5B4B8A",
    iconColor: "#81C784"
});
        document.getElementById("taskBtn").innerHTML = "Add Task";

        getTasks();
        clearForm();
    });

}

// Logout
function logout(){

    Swal.fire({
    title: "🌸 Logout",
    text: "Are you sure you want to leave your Student Task Manager?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "🌷 Yes, Logout",
    cancelButtonText: "💗 Stay Here",
    confirmButtonColor: "#F48FB1",
    cancelButtonColor: "#B39DDB",
    background: "#FFF8FC",
    color: "#5B4B8A",
    borderRadius: "20px"
}).then((result) => {

    if(result.isConfirmed){

        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        window.location.href = "login.html";

    }

});
}
// Show welcome message
if (window.location.pathname.includes("dashboard.html")) {

    let name = localStorage.getItem("userName");

    if (name) {
        document.getElementById("welcomeUser").innerHTML =
            `👋 Welcome, ${name}!`;
    }

}
const today = new Date();

const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
};

const todayDate = document.getElementById("todayDate");

if (todayDate) {
    todayDate.innerHTML =
        "📅 " + today.toLocaleDateString("en-US", options);
}

function searchTasks() {

    let input = document.getElementById("searchTask").value.toLowerCase();

    let filtered = allTasks.filter(task => {

        if (input === "favorite" || input === "star") {
            return task.favorite === true;
        }

        return (
            task.task_title.toLowerCase().includes(input) ||
            task.description.toLowerCase().includes(input) ||
            task.priority.toLowerCase().includes(input) ||
            task.status.toLowerCase().includes(input)
        );

    });

    // No favorite tasks message
    if ((input === "favorite" || input === "star") && filtered.length === 0) {

        document.getElementById("taskList").innerHTML = `
            <div class="empty-state">
                <h3>⭐ No Favorite Tasks</h3>
                <p>You haven't marked any task as favorite yet.</p>
            </div>
        `;
        return;
    }

    // No search result message
    if (filtered.length === 0) {

        document.getElementById("taskList").innerHTML = `
            <div class="empty-state">
                <h3>🔍 No Tasks Found</h3>
                <p>No tasks match your search.</p>
            </div>
        `;
        return;
    }

    displayTasks(filtered);
}
function checkDueNotifications(tasks) {
    console.log("checkDueNotifications called");
    let dueToday = tasks.filter(task => {
        let today = new Date();
        today.setHours(0,0,0,0);

        let due = new Date(task.due_date);
        due.setHours(0,0,0,0);

        return due.getTime() === today.getTime() &&
               task.status !== "Completed";
    });

    let overdue = tasks.filter(task => {
        let today = new Date();
        today.setHours(0,0,0,0);

        let due = new Date(task.due_date);
        due.setHours(0,0,0,0);

        return due < today &&
               task.status !== "Completed";
    });
console.log("Overdue:", overdue.length);
console.log("Due Today:", dueToday.length);
    if (overdue.length > 0) {

        playReminderSound();

        Swal.fire({
    title: "🔴 Overdue Tasks",
    text: `You have ${overdue.length} overdue task(s)!`,
    icon: "warning",
    confirmButtonColor: "#F48FB1"
}).then(() => {
    playReminderSound();
});

    } else if (dueToday.length > 0) {

        playReminderSound();

        Swal.fire({
    title: "🟡 Due Today",
    text: `You have ${dueToday.length} task(s) due today!`,
    icon: "info",
    confirmButtonColor: "#B39DDB"
}).then(() => {
    playReminderSound();
});
    }
}
let taskChart;
function updateChart(completed, pending) {

    const ctx = document.getElementById("taskChart").getContext("2d");

    if (taskChart instanceof Chart) {
    taskChart.destroy();
}
    taskChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Completed", "Pending"],
            datasets: [{
                data: [completed, pending],
                backgroundColor: [
                    "#9BCF53",
                    "#B8A8D9"
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });

}
let priorityChart;

function updatePriorityChart(tasks){

    let high = tasks.filter(task => task.priority === "High").length;
    let medium = tasks.filter(task => task.priority === "Medium").length;
    let low = tasks.filter(task => task.priority === "Low").length;

    const ctx = document.getElementById("priorityChart").getContext("2d");

    if(priorityChart){
        priorityChart.destroy();
    }

    priorityChart = new Chart(ctx,{
        type: "bar",
        data: {
            labels: ["High", "Medium", "Low"],
            datasets: [{
                label: "Tasks",
                data: [high, medium, low],
                backgroundColor: [
    "#F4A7B9", // High - soft pink
    "#B8D8F8", // Medium - pastel blue
    "#CDE7BE"  // Low - pastel green
],
                    
                borderRadius: 10
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

}
async function downloadPDF() {

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Student Task Manager", 20, 20);

    doc.setFontSize(12);

    let y = 35;

    allTasks.forEach((task, index) => {

        doc.text(`${index + 1}. ${task.task_title}`, 20, y);
        y += 8;

        doc.text(`Description: ${task.description}`, 25, y);
        y += 8;

        doc.text(`Priority: ${task.priority}`, 25, y);
        y += 8;

        doc.text(`Due Date: ${task.due_date}`, 25, y);
        y += 8;

        doc.text(`Status: ${task.status}`, 25, y);
        y += 12;

        if (y > 270) {
            doc.addPage();
            y = 20;
        }

    });

    doc.save("Student_Tasks.pdf");
}
let calendar;

function loadCalendar(tasks){

    const calendarEl = document.getElementById("calendar");

    if(calendar){
        calendar.destroy();
    }

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        height: "auto",

        events: tasks.map(task => ({
            title: task.task_title,
            start: task.due_date,
            color: task.status === "Completed" ? "#81C784" : "#F48FB1",

            extendedProps: {
                description: task.description,
                priority: task.priority,
                status: task.status,
                dueDate: task.due_date
            }
        })),

        eventClick: function(info){

            Swal.fire({
                title: "📝 " + info.event.title,
                html: `
                    <p><b>Description:</b> ${info.event.extendedProps.description}</p>
                    <p><b>⭐ Priority:</b> ${info.event.extendedProps.priority}</p>
                    <p><b>📅 Due Date:</b> ${info.event.extendedProps.dueDate}</p>
                    <p><b>📌 Status:</b> ${info.event.extendedProps.status}</p>
                `,
                icon: "info",
                confirmButtonText: "Close",
                confirmButtonColor: "#F48FB1",
                background: "#FFF8FC",
                color: "#5B4B8A"
            });

        }

    });

    calendar.render();

}

function toggleDarkMode(){

    document.body.classList.toggle("dark-mode");

    if(document.body.classList.contains("dark-mode")){
        localStorage.setItem("theme","dark");
        document.querySelector(".dark-btn").innerHTML = "☀️";
    }else{
        localStorage.setItem("theme","light");
        document.querySelector(".dark-btn").innerHTML = "🌙";
    }

}
if (localStorage.getItem("theme") === "dark") {

    document.body.classList.add("dark-mode");

    const darkBtn = document.querySelector(".dark-btn");

    if (darkBtn) {
        darkBtn.innerHTML = "☀️";
    }
}
if (window.location.pathname.includes("dashboard.html")) {
    getTasks();

    setTimeout(() => {
        checkDueNotifications(allTasks);
    }, 1000);
}
