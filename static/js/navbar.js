const ERROR_USERNAME_OR_PASSWORD_WRONG = -1;
const ERROR_USERNAME_ALREADY_EXISTS = -2;
const ERROR_USERNAME_HAS_INVALID_CHARACTERS = -3;
const ERROR_INVALID_PASSWORD = -4;
const ERROR_NOT_LOGGED_IN = -5;
const ERROR_NO_STATISTICS_AVAILABLE = -6;
const SUCCESS_REGISTRATION = 1;
const SUCCESS_LOGOUT = 2;

function main()
{
}

// ---TEST--- //

function test() {
    console.log("test started");
    fetch('test')
        .then((response) => response.json())
        .then((variable) => handleTest(variable));
    console.log("test sent");
}

function handleTest(response) {
    console.log("test received");
    console.log(response);
}

// ---TEST--- //

function submitLogin()
{
    let form = new FormData();
    form.set("username", document.getElementById('login-modal-username').value);
    form.set("password", document.getElementById('login-modal-password').value);
    fetch(
        `/login/`,
        {
            method: "POST",
            body: form
        }
        )
        .then((response) => response.json())
        .then((variable) => handleLogin(variable));
}

function handleLogin( response ) {
    if (response === ERROR_USERNAME_OR_PASSWORD_WRONG) {
        document.getElementById('login-modal-error').innerText = "Invalid username or password";
        document.getElementById('login-modal-error').classList.add('alert-danger')
    } else if (typeof response === "object") {
        document.getElementById('navbar-username').innerText = `Logged in as ${response.username.toString()}`;
        document.getElementById('login-info').dataset.username = response.username.toString();
        document.getElementById('login-modal-username').value = "";
        document.getElementById('login-modal-password').value = "";
        $('#loginModal').modal('hide');
        $('#successful-login').modal();
    }
}

function submitRegister()
{
    let form = new FormData();
    form.set("username", document.getElementById('register-modal-username').value);
    form.set("password", document.getElementById('register-modal-password').value);
    form.set("login", document.getElementById('register-modal-auto-login').checked);
    fetch(
        `/register/`,
        {
            method: "POST",
            body: form
        }
        )
        .then((response) => response.json())
        .then((variable) => handleRegister(variable));
}

function handleRegister( response ) {
    if (response === ERROR_USERNAME_ALREADY_EXISTS) {
        document.getElementById('register-modal-error').innerText = "Username already in use";
        document.getElementById('register-modal-error').classList.add('alert-danger')
    } else if (response === ERROR_USERNAME_HAS_INVALID_CHARACTERS) {
        document.getElementById('register-modal-error').innerText = "Invalid or missing username. Username may only contain letters, numbers and underscores";
        document.getElementById('register-modal-error').classList.add('alert-danger')
    } else if (response === ERROR_INVALID_PASSWORD) {
        document.getElementById('register-modal-error').innerText = "Invalid or missing password. Password may only contain, letters, numbers and punctuations";
        document.getElementById('register-modal-error').classList.add('alert-danger')
    } else if (response === SUCCESS_REGISTRATION) {
        document.getElementById('register-modal-username').value = "";
        document.getElementById('register-modal-password').value = "";
        $('#registerModal').modal('hide');
        $('#successful-registration').modal();
    } else if (typeof response === "object") {
        document.getElementById('navbar-username').innerText = `Logged in as ${response.username.toString()}`;
        document.getElementById('login-info').dataset.username = response.username.toString();
        $('#registerModal').modal('hide');
        $('#successful-login').modal();
    }
}

function logout() {
    fetch('/logout/')
        .then((response) => response.json())
        .then((variable) => handleLogout(variable));
}

function handleLogout( response ) {
    if (response === SUCCESS_LOGOUT) {
        document.getElementById('navbar-username').innerText = "Not logged in";
        let loginInfo = document.getElementById('login-info');
        loginInfo.removeAttribute("data-username");
        loginInfo.removeAttribute("data-user-id");
        loginInfo.dataset.loggedIn = JSON.stringify(false);
        $('#successful-logout').modal();
    } else if (response === ERROR_NOT_LOGGED_IN) {
        alert("Not currently logged in")
    }
}

function getVoteStatistics() {
    fetch('/vote-statistics/')
        .then((response) => response.json())
        .then((variable) => handleVoteStatistics(variable))
}

function handleVoteStatistics( response ) {
    clearVoteStatistics();
    if (response === ERROR_NO_STATISTICS_AVAILABLE) {
        console.log("No vote statistics available");
    } else if (typeof response === "object") {
        let voteStatisticsList = document.getElementById('vote-statistics-list');
        let secondaryRow = true;
        for (let planet of response) {
            let row = document.createElement('div');
            row.classList.add('row');
            row.classList.add('vote-row');
            if (secondaryRow) row.classList.add('bg-secondary');
            secondaryRow = !secondaryRow;
            row.appendChild(constructTextColumn(planet.name,0,'sm'));
            row.appendChild(constructTextColumn(planet.vote_count, 0,'sm'));
            voteStatisticsList.appendChild(row);
        }
    }
    $('#votesModal').modal();
}

function clearVoteStatistics() {
    let voteRows = document.getElementsByClassName('vote-row')
}

main();