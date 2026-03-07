function register() {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const errorMsg = document.getElementById('error-msg');

      fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      .then(res => {
        if (!res.ok) return res.json().then(e => { throw e; });
        alert('Registration successful. Please login.');
        window.location.href = 'login.html';
      })
      .catch(err => {
        errorMsg.textContent = err?.[0]?.description || 'Registration failed';
      });
    }