function login() {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const errorMsg = document.getElementById('error-msg');

      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      .then(res => {
        if (!res.ok) throw new Error('Invalid credentials');
        // Successful login → redirect to todo list page
        window.location.href = 'todos.html';
      })
      .catch(err => {
        errorMsg.textContent = err.message;
      });
    }