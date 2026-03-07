const uri = 'api/todoitems';
let todos = [];
let awaitingTime = false; // Flag to track if we're waiting for time input
let taskName = ''; // Variable to store the name of the new item being added

// Fetch all tasks from the API
function getItems() {
  fetch(uri)
    .then(response => response.json())
    .then(data => {
      _displayItems(data);
      todos = data;
    })
    .catch(error => console.error('Unable to get items.', error));
}

// Add a new task
function addItem() {
  const addNameTextbox = document.getElementById('add-name');
  const value = addNameTextbox.value.trim();
  const errorText = document.getElementById('error-text');

  if (!awaitingTime && value === "") {
    errorText.textContent = "Please enter a name for the to-do item.";
    errorText.style.display = 'block';
    return;
  }

  if (!awaitingTime) {
    taskName = value;
    awaitingTime = true;

    errorText.style.display = "none";
    addNameTextbox.value = "";
    addNameTextbox.placeholder = "Enter due date & time (YYYY-MM-DD HH:MM)";
    addNameTextbox.type = "datetime-local";
    if (addNameTextbox.showPicker) addNameTextbox.showPicker();
    return;
  }

  if (awaitingTime && value === "") {
    errorText.textContent = "Please enter a due date/time for the to-do item.";
    errorText.style.display = 'block';
    return;
  }

  const dueTime = value.replace(" ", "T"); // normalize for ISO format

  const item = {
    isComplete: false,
    name: taskName,
    estimatedDueTime: dueTime
  };

  // Reset UI
  awaitingTime = false;
  taskName = "";
  addNameTextbox.value = "";
  addNameTextbox.placeholder = "Enter name";
  addNameTextbox.type = "text";
  errorText.style.display = "none";

  fetch(uri, {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  })
    .then(response => {
      if (!response.ok) throw new Error("Server error while adding item.");
      return response.json().catch(() => null);
    })
    .then(() => {getItems();
      setTimeout(setTaskReminder, 300); 
    })
    .catch(error => console.error('Unable to add item.', error));
}

// Delete a task
function deleteItem(id) {
  fetch(`${uri}/${id}`, { method: 'DELETE' })
    .then(() => getItems())
    .catch(error => console.error('Unable to delete item.', error));
}

// Show edit form
function displayEditForm(id) {
  const item = todos.find(item => item.id === id);
  if (!item) return;

  document.getElementById('edit-name').value = item.name;
  document.getElementById('edit-id').value = item.id;
  document.getElementById('edit-isComplete').checked = item.isComplete;
  document.getElementById('editForm').style.display = 'block';
}

// Update a task
function updateItem() {
  const itemId = parseInt(document.getElementById('edit-id').value, 10);
  const existingItem = todos.find(t => t.id === itemId);

  if (!existingItem) return;

  const item = {
    id: itemId,
    isComplete: document.getElementById('edit-isComplete').checked,
    name: document.getElementById('edit-name').value.trim(),
    estimatedDueTime: existingItem.estimatedDueTime
  };

  fetch(`${uri}/${itemId}`, {
    method: 'PUT',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(item)
  })
    .then(() => getItems())
    .catch(error => console.error('Unable to update item.', error));

  closeInput();
  return false;
}

// Close edit form
function closeInput() {
  document.getElementById('editForm').style.display = 'none';
}

// Display task count
function _displayCount(itemCount) {
  const name = itemCount === 1 ? 'to-do' : 'to-dos';
  document.getElementById('counter').innerText = `${itemCount} ${name}`;
}

// Display all tasks in the table
function _displayItems(data) {
  const tBody = document.getElementById('todos');
  tBody.innerHTML = '';

  _displayCount(data.length);

  const button = document.createElement('button');

  data.forEach(item => {
    // Checkbox
    const isCompleteCheckbox = document.createElement('input');
    isCompleteCheckbox.type = 'checkbox';
    isCompleteCheckbox.checked = item.isComplete;
    isCompleteCheckbox.onclick = () => toggleComplete(item);

    // Edit button
    const editButton = button.cloneNode(false);
    editButton.innerText = 'Edit';
    editButton.setAttribute('onclick', `displayEditForm(${item.id})`);
    if (item.isComplete) {
      editButton.disabled = true;
      editButton.style.opacity = "0.5";
      editButton.style.cursor = "not-allowed";
    }

    // Delete button
    const deleteButton = button.cloneNode(false);
    deleteButton.innerText = 'Delete';
    deleteButton.setAttribute('onclick', `deleteItem(${item.id})`);

    // Table row
    const tr = tBody.insertRow();
    tr.insertCell(0).appendChild(isCompleteCheckbox);
    tr.insertCell(1).appendChild(document.createTextNode(item.name));
    tr.insertCell(2).appendChild(editButton);
    tr.insertCell(3).appendChild(deleteButton);
    tr.insertCell(4).appendChild(document.createTextNode(item.createdAt ? item.createdAt.replace("T", " ").split(".")[0] : ""));
    tr.insertCell(5).textContent = item.estimatedDueTime ? new Date(item.estimatedDueTime).toLocaleString() : "";
  });

  todos = data;
}

// Toggle task completion
function toggleComplete(item) {
  const updatedItem = {
    id: item.id,
    name: item.name,
    estimatedDueTime: item.estimatedDueTime,
    isComplete: !item.isComplete
  };

  fetch(`${uri}/${item.id}`, {
    method: 'PUT',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedItem)
  })
    .then(() => getItems())
    .catch(error => console.error('Unable to update item.', error));
}


function setTaskReminder() {
  fetch(uri)
    .then(response => response.json())
    .then(data => {
      data.forEach((item, i) => {
        if (item.createdAt && item.estimatedDueTime) {
          const createdTime = item.createdAt.split("T")[1].split(".")[0].slice(0, 8); // "12:45"
          const dueTime = item.estimatedDueTime.split("T")[1].split(".")[0].slice(0, 8); // "17:30"

          const diff = getTimeDifference(createdTime, dueTime);

          //Schedule alert after the duration
          setTimeout(() => {
            alert(`Task "${item.title || i + 1}" expired!`);
          }, diff.milliseconds);
          
        }
      });
         alert(
            `Task ${item.name} → Duration: ${diff.hours}h ${diff.minutes}m, will alert in ${diff.milliseconds}ms`
           );
    })
    .catch(error => console.error('Unable to get items.', error));
}

function getTimeDifference(startTime, endTime) {

  const [startHour, startMin, startSec] = startTime.split(":").map(Number);
  const [endHour, endMin, endSec] = endTime.split(":").map(Number);

  // Convert both times to total seconds
  const startTotal = startHour * 3600 + startMin * 60 + startSec;
  const endTotal = endHour * 3600 + endMin * 60 + endSec;

  // Difference in seconds
  let diffSeconds = endTotal - startTotal;

  // Optional: handle negative difference (if end is next day)
  if (diffSeconds < 0) diffSeconds += 24 * 3600;

  const hours = Math.floor(diffSeconds / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  const seconds = diffSeconds % 60;

  // Return milliseconds too for setTimeout
  const milliseconds = diffSeconds * 1000;

  return { hours, minutes, seconds, milliseconds };

}

/////// ADVERT POP UP SECTION ///////
// function showModalxxxxxxxxxxxxxx() {
//     const modal = document.getElementById('task-modal');
//     if (modal) {
//       modal.style.display = 'block';
//     }
//   }

//   // Function to close the modal
//   function closeModal() {
//     const modal = document.getElementById('task-modal');
//     if (modal) {
//       modal.style.display = 'none';
//     }
//   }

//   // Show the modal every 2 minutes (120000 ms)
//   setInterval(showModal, 30000);
