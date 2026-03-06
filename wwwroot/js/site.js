
const uri = 'api/todoitems';
let todos = [];
let awaitingTime = false; // Flag to track if we're waiting for time input
let taskName = ''; // Variable to store the name of the new item being added


function getItems() {
  fetch(uri)
    .then(response => response.json())
    .then(data => _displayItems(data))
    .catch(error => console.error('Unable to get items.', error));
}

function addItem() {
  const addNameTextbox = document.getElementById('add-name');
  const value = addNameTextbox.value;
  const trimmedValue = value.trim();
  const errorText = document.getElementById('error-text');

  // STEP 1 — Require name
  if (!awaitingTime && trimmedValue === "") {
    errorText.textContent = "Please enter a name for the to-do item.";
    errorText.style.display = 'block';
    return;
  }

  if (!awaitingTime) {
    taskName = trimmedValue;
    awaitingTime = true;

    errorText.style.display = "none";
    addNameTextbox.value = "";
    addNameTextbox.placeholder = "Enter Estimated time ";
    addNameTextbox.type = "time";  
    if (addNameTextbox.showPicker) {
      addNameTextbox.showPicker();
    }
    return;
  }

  // STEP 2 — Require timeTaken
  if (awaitingTime && trimmedValue === "") {
    errorText.textContent = "Please enter an estimated time for the to-do item.";
    errorText.style.display = 'block';
    return;
  }

  const timeTaken = trimmedValue;

  const item = {
    isComplete: false,
    name: taskName,
    completedAt: timeTaken + ":00" // Append seconds to match TimeSpan format (HH:MM:SS)
  };

  // Reset UI state
  awaitingTime = false;
  taskName = "";
  addNameTextbox.value = "";
  addNameTextbox.placeholder = "Enter name";
  addNameTextbox.type = "text";   
  errorText.style.display = "none";

  fetch(uri, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(item)
  })
    .then(response => {
      if (!response.ok) {
      throw new Error("Server error while adding item.");
      }
      return response.json().catch(() => null);
    })
    .then(() => {
      getItems();
      addNameTextbox.value = '';
    })
    .catch(error => console.error('Unable to add item.', error));
}


function deleteItem(id) {
  fetch(`${uri}/${id}`, {
    method: 'DELETE'
  })
  .then(() => getItems())
  .catch(error => console.error('Unable to delete item.', error));
}

function displayEditForm(id) {
  const item = todos.find(item => item.id === id);
  
  document.getElementById('edit-name').value = item.name;
  document.getElementById('edit-id').value = item.id;
  document.getElementById('edit-isComplete').checked = item.isComplete;
  document.getElementById('editForm').style.display = 'block';
}

function updateItem() {
  const itemId = document.getElementById('edit-id').value;
  const existingItem = todos.find(t => t.id === parseInt(itemId, 10));

  const item = {
    id: parseInt(itemId, 10),
    isComplete: document.getElementById('edit-isComplete').checked,
    name: document.getElementById('edit-name').value.trim(),
    completedAt: existingItem.completedAt // Preserve existing completedAt value
  };

  fetch(`${uri}/${itemId}`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(item)
  })
  .then(() => getItems())
  .catch(error => console.error('Unable to update item.', error));

  closeInput();

  return false;
}

function closeInput() {
  document.getElementById('editForm').style.display = 'none';
}

function _displayCount(itemCount) {
  const name = (itemCount === 1) ? 'to-do' : 'to-dos';

  document.getElementById('counter').innerText = `${itemCount} ${name}`;
}

function _displayItems(data) {
  const tBody = document.getElementById('todos');
  tBody.innerHTML = '';

  _displayCount(data.length);

  const button = document.createElement('button');

  data.forEach(item => {
    let isCompleteCheckbox = document.createElement('input');
    isCompleteCheckbox.type = 'checkbox';
    isCompleteCheckbox.checked = item.isComplete;
    isCompleteCheckbox.onclick = () => toggleComplete(item);

    let editButton = button.cloneNode(false);
    editButton.innerText = 'Edit';
    editButton.setAttribute('onclick', `displayEditForm(${item.id})`);

    // NEW: disable Edit button if item is complete 
    if (item.isComplete) 
    {   editButton.disabled = true; 
        editButton.style.opacity = "0.5"; // optional visual cue 
        editButton.style.cursor = "not-allowed"; 
    }
    
    let deleteButton = button.cloneNode(false);
    deleteButton.innerText = 'Delete';
    deleteButton.setAttribute('onclick', `deleteItem(${item.id})`);

    let tr = tBody.insertRow();
    
    let td1 = tr.insertCell(0);
    td1.appendChild(isCompleteCheckbox);

    let td2 = tr.insertCell(1);
    let textNode = document.createTextNode(item.name);
    td2.appendChild(textNode);

    let td3 = tr.insertCell(2);
    td3.appendChild(editButton);

    let td4 = tr.insertCell(3);
    td4.appendChild(deleteButton);

    //const timeFormat = item.createdAt || "";

    let td5 = tr.insertCell(4);
    td5.appendChild(document.createTextNode(item.createdAt ? item.createdAt.replace("T", " ").split(".")[0] : ""));

    let td6 = tr.insertCell(5);
    if (item.createdAt) {
      const d = new Date(item.createdAt);
      td6.textContent = ` ${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")} ${item.completedAt ?? ""}`;
    } else {
      td6.textContent = item.completedAt ?? "";
    }
  });

  todos = data;

}



// NEW FUNCTION — required for checkbox updates
function toggleComplete(item) {
  const updatedItem = {
    id: item.id,
    name: item.name,
    completedAt: item.completedAt,
    isComplete: !Boolean(item.isComplete)
  };

  fetch(`${uri}/${item.id}`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedItem)
  })
  .then(() => getItems())
  .catch(error => console.error('Unable to update item.', error));
}
