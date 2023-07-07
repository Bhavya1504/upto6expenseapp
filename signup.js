function signup(event) {
    event.preventDefault();
  
    const name = document.getElementsByName('name')[0].value;
    const email = document.getElementsByName('email')[0].value;
    const password = document.getElementsByName('password')[0].value;
  
    const signupDetails = {
      name: name,
      email: email,
      password: password
    };
  
    fetch('/user/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(signupDetails)
    })
      .then(response => {
        if (response.status === 201) {
          window.location.href = '../Login/login.html';
        } else if (response.status === 400) {
          throw new Error('Email already registered');
        } else {
          throw new Error('Failed to signup');
        }
      })
      .then(() => {
        document.querySelector('form').reset();
        showNotification('Signup successful', 2000);
      })
      .catch(error => {
        console.error(error);
        document.querySelector('form').reset();
        showNotification(error.message, 2000);
      });
  }
  
  function showNotification(message, duration) {
    const notificationElement = document.createElement('div');
    notificationElement.classList.add('notification');
    notificationElement.textContent = message;
    document.body.appendChild(notificationElement);
  
    setTimeout(() => {
      notificationElement.remove();
    }, duration);
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.querySelector('form');
    signupForm.addEventListener('submit', signup);
  });
  