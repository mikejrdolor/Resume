
let users = JSON.parse(localStorage.getItem("users")) || [
  {username:"user1",password:"123",role:"user",enabled:true},
  {username:"user2",password:"123",role:"user",enabled:true},
  {username:"user3",password:"123",role:"user",enabled:true},
  {username:"admin",password:"admin123",role:"admin",enabled:true}
];

let logs = JSON.parse(localStorage.getItem("loginLogs")) || [];
let activeUsers = JSON.parse(localStorage.getItem("activeUsers")) || {};
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

// User assignments
let userAssignments = { user1:"SSS", user2:"Pag-IBIG", user3:"PhilHealth" };

function openModal(id){document.getElementById(id).style.display="flex";}
function closeModal(id){document.getElementById(id).style.display="none";}
function switchModal(from,to){ closeModal(from); openModal(to); }

// User Login
function loginUser(){
  const username = document.getElementById("user-username").value.trim();
  const password = document.getElementById("user-password").value.trim();
  const user = users.find(u=>u.username===username && u.password===password && u.role==="user");
  const time = new Date().toLocaleString();
  if(user){
    if(!user.enabled){ alert("⛔ Account disabled. Contact Admin."); return; }
    currentUser = user;
    localStorage.setItem("currentUser",JSON.stringify({username:user.username,role:"user"}));
    activeUsers[user.username] = {lastLogin:time,status:"Online"};
    localStorage.setItem("activeUsers",JSON.stringify(activeUsers));
    logs.push({username:user.username,status:"✅ Success",time});
    localStorage.setItem("loginLogs",JSON.stringify(logs));

    document.getElementById("user-dashboard").style.display="block";
    document.getElementById("active-user").textContent=user.username;
    document.getElementById("last-login").textContent=time;

    // Show user assignment
    const assignmentText = userAssignments[user.username] || "No assignment";
    document.getElementById("user-assignment").textContent = "Your Assignment: " + assignmentText;

    updateUserActivity(user.username);
  } else {
    logs.push({username:username || "Unknown",status:"❌ Failed",time});
    localStorage.setItem("loginLogs",JSON.stringify(logs));
    document.getElementById("user-login-error").style.display="block";
  }
}

// Admin Login
function loginAdmin(){
  const username=document.getElementById("admin-username").value.trim();
  const password=document.getElementById("admin-password").value.trim();
  const admin=users.find(u=>u.username===username && u.password===password && u.role==="admin");
  const time=new Date().toLocaleString();
  if(admin){
    currentUser=admin;
    localStorage.setItem("currentUser",JSON.stringify({username:admin.username,role:"admin"}));
    activeUsers[admin.username]={lastLogin:time,status:"Online"};
    localStorage.setItem("activeUsers",JSON.stringify(activeUsers));
    logs.push({username:admin.username,status:"✅ Success",time});
    localStorage.setItem("loginLogs",JSON.stringify(logs));
    document.getElementById("admin-dashboard").style.display="block";
    updateAdminPanel();
  } else {
    logs.push({username:username || "Unknown",status:"❌ Failed",time});
    localStorage.setItem("loginLogs",JSON.stringify(logs));
    document.getElementById("admin-login-error").style.display="block";
  }
}

function logout(){
  if(currentUser && activeUsers[currentUser.username]) activeUsers[currentUser.username].status="Offline";
  localStorage.setItem("activeUsers",JSON.stringify(activeUsers));
  currentUser=null;
  localStorage.removeItem("currentUser");
  document.getElementById("user-dashboard").style.display="none";
  document.getElementById("admin-dashboard").style.display="none";
}

// Update user activity log
function updateUserActivity(username){
  const list=document.getElementById("user-activity-log");
  list.innerHTML="";
  logs.filter(l=>l.username===username).forEach(log=>{
    const li=document.createElement("li");
    li.textContent=`${log.time}: ${log.status}`;
    list.appendChild(li);
  });
}

// Admin Panel
function updateAdminPanel(){
  // Active Users
  let table=document.getElementById("active-users-table");
  table.innerHTML="<tr><th>Username</th><th>Last Login</th><th>Status</th></tr>";
  for(let u in activeUsers){
    table.innerHTML+=`<tr><td>${u}</td><td>${activeUsers[u].lastLogin}</td><td>${activeUsers[u].status}</td></tr>`;
  }

  // Logs
  let logsTable=document.getElementById("logs-table");
  logsTable.innerHTML="<tr><th>Username</th><th>Status</th><th>Time</th></tr>";
  logs.forEach(l=>{
    logsTable.innerHTML+=`<tr><td>${l.username}</td><td>${l.status}</td><td>${l.time}</td></tr>`;
  });

  // Manage Users
  let usersTable=document.getElementById("users-table");
  usersTable.innerHTML="<tr><th>Username</th><th>Role</th><th>Status</th><th>Actions</th></tr>";
  users.forEach((u,i)=>{
    usersTable.innerHTML+=`<tr>
      <td>${u.username}</td>
      <td>${u.role}</td>
      <td>${u.enabled?"Enabled":"Disabled"}</td>
      <td>
        <button onclick="deleteUser(${i})">Delete</button>
        <button onclick="editUser(${i})">Edit</button>
        <button onclick="resetPassword(${i})">Reset PW</button>
        <button onclick="toggleUser(${i})">${u.enabled?"Disable":"Enable"}</button>
      </td>
    </tr>`;
  });

  // Add Reset Logs button for Admin
  document.getElementById("reset-logs-btn").onclick = resetAllLogs;
}

// Reset Logs (Admin)
function resetAllLogs(){
  if(confirm("⚠️ Are you sure you want to reset ALL logs?")){
    logs = [];
    localStorage.setItem("loginLogs",JSON.stringify(logs));
    updateAdminPanel();
    alert("✅ All logs have been reset by Admin.");
  }
}

// Reset Logs (User)
function resetUserLogs(){
  if(confirm("⚠️ Are you sure you want to reset YOUR logs?")){
    logs = logs.filter(l => l.username !== currentUser.username);
    localStorage.setItem("loginLogs",JSON.stringify(logs));
    updateUserActivity(currentUser.username);
    alert("✅ Your logs have been reset.");
  }
}

// Admin actions
function addUser(){
  const username=document.getElementById("new-username").value.trim();
  const password=document.getElementById("new-password").value.trim();
  const role=document.getElementById("new-role").value;
  if(username && password){
    users.push({username,password,role,enabled:true});
    localStorage.setItem("users",JSON.stringify(users));
    updateAdminPanel();
  }
}

function deleteUser(i){ users.splice(i,1); localStorage.setItem("users",JSON.stringify(users)); updateAdminPanel(); }

function editUser(i){
  const newUsername=prompt("Enter new username",users[i].username);
  const newRole=prompt("Enter role (user/admin)",users[i].role);
  if(newUsername && newRole){
    users[i].username=newUsername;
    users[i].role=newRole;
    localStorage.setItem("users",JSON.stringify(users));
    updateAdminPanel();
  }
}

function resetPassword(i){
  const newPW=prompt("Enter new password","");
  if(newPW){ users[i].password=newPW; localStorage.setItem("users",JSON.stringify(users)); alert("Password reset successful."); updateAdminPanel(); }
}

function toggleUser(i){ users[i].enabled=!users[i].enabled; localStorage.setItem("users",JSON.stringify(users)); updateAdminPanel(); }


// Auto logout after 10 minutes of inactivity
let inactivityTimer;

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    alert("⚠️ Session expired due to inactivity. You will be logged out.");
    logout();
  }, 10 * 60 * 1000); // 10 minutes = 600000 ms
}

// Track activity (mouse, keyboard, touch)
window.onload = resetInactivityTimer;
document.onmousemove = resetInactivityTimer;
document.onkeypress = resetInactivityTimer;
document.ontouchstart = resetInactivityTimer;
document.onclick = resetInactivityTimer;



