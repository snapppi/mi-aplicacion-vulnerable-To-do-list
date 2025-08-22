// Configuración de la API 
//const API_BASE_URL = 'http://localhost:3000/api'; // Para desarrollo local 
const API_BASE_URL = 'https://mi-aplicacion-vulnerable-tk04.onrender.com/api'; // Para producción 
 
// Variables globales 
let currentUser = null; 
 
// Función que se ejecuta cuando la página carga 
document.addEventListener('DOMContentLoaded', function() { 
    // Verificar si estamos en la página de tareas 
    if (window.location.pathname.includes('tasks.html')) { 
        checkAuthentication(); 
        loadTasks(); 
        setupTaskForm(); 
    } else { 
        // Estamos en la página de login 
        setupLoginForm(); 
        setupRegisterForm(); 
    } 
}); 
 
// FUNCIONES DE AUTENTICACIÓN 
 
function setupLoginForm() { 
    const loginForm = document.getElementById('loginFormElement'); 
    if (loginForm) { 
        loginForm.addEventListener('submit', async function(e) { 
            e.preventDefault(); // Evita que el formulario se envíe normalmente 
             
            const username = document.getElementById('loginUsername').value; 
            const password = document.getElementById('loginPassword').value; 
             
            try { 
                const response = await fetch(`${API_BASE_URL}/login`, { 
                    method: 'POST', 
                    headers: { 
                        'Content-Type': 'application/json', 
                    }, 
                    body: JSON.stringify({ username, password }) 
                }); 
                 
                const data = await response.json(); 
                 
                if (response.ok) { 
                    // Login exitoso 
                    localStorage.setItem('currentUser', JSON.stringify(data.user)); 
                    showMessage('Login exitoso', 'success'); 
                    // Redirigir a la página de tareas 
                    setTimeout(() => { 
                        window.location.href = 'tasks.html'; 
                    }, 1000); 
                } else { 
                    showMessage(data.error || 'Error en el login', 'error'); 
                } 
            } catch (error) { 
                showMessage('Error de conexión', 'error'); 
                console.error('Error:', error); 
            } 
        }); 
    } 
} 
 
function setupRegisterForm() { 
    const registerForm = document.getElementById('registerFormElement'); 
    if (registerForm) { 
        registerForm.addEventListener('submit', async function(e) { 
            e.preventDefault(); 
             
            const username = document.getElementById('registerUsername').value; 
            const password = document.getElementById('registerPassword').value; 
             
            try { 
                const response = await fetch(`${API_BASE_URL}/register`, { 
                    method: 'POST', 
                    headers: { 
                        'Content-Type': 'application/json', 
                    }, 
                    body: JSON.stringify({ username, password }) 
                }); 
                 
                const data = await response.json(); 
                 
                if (response.ok) { 
                    showMessage('Registro exitoso. Ahora puedes iniciar sesión.', 'success'); 
                    showLogin(); // Cambiar al formulario de login 
                } else { 
                    showMessage(data.error || 'Error en el registro', 'error'); 
                } 
            } catch (error) { 
                showMessage('Error de conexión', 'error'); 
                console.error('Error:', error); 
            } 
        }); 
    } 
} 
 
// FUNCIONES DE INTERFAZ 
 
function showLogin() { 
    document.getElementById('loginForm').style.display = 'block'; 
    document.getElementById('registerForm').style.display = 'none'; 
} 
 
function showRegister() { 
    document.getElementById('loginForm').style.display = 'none'; 
    document.getElementById('registerForm').style.display = 'block'; 
} 
 
function showMessage(message, type) { 
    const messageDiv = document.getElementById('message'); 
    if (messageDiv) { 
        messageDiv.textContent = message; 
        messageDiv.className = `message ${type}`; 
        messageDiv.style.display = 'block'; 
         
        // Ocultar el mensaje después de 5 segundos 
        setTimeout(() => { 
            messageDiv.style.display = 'none'; 
        }, 5000); 
    } 
} 
 
// FUNCIONES DE TAREAS 
 
function checkAuthentication() { 
    const userData = localStorage.getItem('currentUser'); 
    if (!userData) { 
        // No hay usuario logueado, redirigir al login 
        window.location.href = 'index.html'; 
        return; 
    } 
     
    currentUser = JSON.parse(userData); 
    const welcomeMessage = document.getElementById('welcomeMessage'); 
    if (welcomeMessage) { 
        welcomeMessage.textContent = `Bienvenido, ${currentUser.username}`; 
    } 
} 
 
function logout() { 
    localStorage.removeItem('currentUser'); 
    window.location.href = 'index.html'; 
} 
 
function setupTaskForm() { 
    const taskForm = document.getElementById('taskForm'); 
    if (taskForm) { 
        taskForm.addEventListener('submit', async function(e) { 
            e.preventDefault(); 
             
            const title = document.getElementById('taskTitle').value; 
            const description = document.getElementById('taskDescription').value; 
             
            try { 
                const response = await fetch(`${API_BASE_URL}/tasks`, { 
                    method: 'POST', 
                    headers: { 
                        'Content-Type': 'application/json', 
                    }, 
                    body: JSON.stringify({ 
                        title, 
                        description, 
                        user_id: currentUser.id 
                    }) 
                }); 
                 
                const data = await response.json(); 
                 
                if (response.ok) { 
                    showMessage('Tarea creada exitosamente', 'success'); 
                    document.getElementById('taskTitle').value = ''; 
                    document.getElementById('taskDescription').value = ''; 
                    loadTasks(); // Recargar la lista de tareas 
                } else { 
                    showMessage(data.error || 'Error al crear la tarea', 'error'); 
                } 
            } catch (error) { 
                showMessage('Error de conexión', 'error'); 
                console.error('Error:', error); 
            } 
        }); 
    } 
} 
 
async function loadTasks() { 
    if (!currentUser) return; 
     
    try { 
        const response = await fetch(`${API_BASE_URL}/tasks?user_id=${currentUser.id}`); 
        const data = await response.json(); 
         
        if (response.ok) { 
            displayTasks(data.tasks); 
        } else { 
            showMessage(data.error || 'Error al cargar las tareas', 'error'); 
        } 
    } catch (error) { 
        showMessage('Error de conexión', 'error'); 
        console.error('Error:', error); 
    } 
} 
 
function displayTasks(tasks) { 
    const tasksList = document.getElementById('tasksList'); 
    if (!tasksList) return; 
     
    if (tasks.length === 0) { 
        tasksList.innerHTML = '<p>No tienes tareas aún. ¡Crea tu primera tarea!</p>'; 
        return; 
    } 
     
    tasksList.innerHTML = tasks.map(task => ` 
        <div class="task-item ${task.completed ? 'completed' : ''}"> 
            <div class="task-title">${task.title}</div> 
            <div class="task-description">${task.description || 'Sin descripción'}</div> 
            <div class="task-actions"> 
                <button onclick="toggleTask(${task.id}, ${!task.completed})" class="complete-btn"> 
                    ${task.completed ? 'Marcar Pendiente' : 'Marcar Completada'} 
                </button> 
                <button onclick="deleteTask(${task.id})" class="delete-btn"> 
                    Eliminar 
                </button> 
            </div> 
        </div> 
    `).join(''); 
} 
 
async function toggleTask(taskId, completed) { 
    try { 
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, { 
            method: 'PUT', 
            headers: { 
                'Content-Type': 'application/json', 
            }, 
            body: JSON.stringify({ completed }) 
        }); 
         
        const data = await response.json(); 
         
        if (response.ok) { 
            showMessage('Tarea actualizada', 'success'); 
            loadTasks(); // Recargar la lista 
        } else { 
            showMessage(data.error || 'Error al actualizar la tarea', 'error'); 
        } 
    } catch (error) { 
        showMessage('Error de conexión', 'error'); 
        console.error('Error:', error); 
    } 
} 
 
async function deleteTask(taskId) { 
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) { 
        return; 
    } 
     
    try { 
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, { 
            method: 'DELETE' 
        }); 
         
        const data = await response.json(); 
         
        if (response.ok) { 
            showMessage('Tarea eliminada', 'success'); 
            loadTasks(); // Recargar la lista 
        } else { 
            showMessage(data.error || 'Error al eliminar la tarea', 'error'); 
        } 
    } catch (error) { 
        showMessage('Error de conexión', 'error'); 
        console.error('Error:', error); 
    } 
} 


