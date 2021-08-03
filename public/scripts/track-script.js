
const togglePassword = document.querySelector('#togglePassword'); //tog
const password = document.querySelector('#password');// i/p

togglePassword.addEventListener('click', function () {
    // toggle the type attribute
    const type = password.getAttribute('type'); 

    password.setAttribute('type', type === 'password' ? 'text' : 'password');
    // toggle the eye / eye slash icon
    
});


