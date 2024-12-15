const signUpButton = document.getElementById("signUp");
const signInButton = document.getElementById("signIn");
const container = document.getElementById("container");

signUpButton.addEventListener("click", () => {
    container.classList.add("right-panel-active");
});

signInButton.addEventListener("click", () => {
    container.classList.remove("right-panel-active");
});

document.getElementById("btnSignUp").addEventListener("click", doSignUp);
document.getElementById("btnSignIn").addEventListener("click", login);

function doSignUp() {
    var userData = {
        userName: document.getElementById("name").value,
        userStudentID: document.getElementById("student-id").value,
        userEmail: document.getElementById("email").value,
        userPhone: document.getElementById("phone").value,
        userPassword: document.getElementById("password").value
    };

    $.ajax({
        url: '/signup',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(userData),
        success: function(response) {
            isValid(response);
        }
    });
}

function login() {
    var userData = {
        studentid: document.querySelector("#signInForm input[name='studentid']").value,
        password: document.querySelector("#signInForm input[name='password']").value
    };

    $.ajax({
        url: '/login',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(userData),
        success: function(response) {
            console.log(response);
            if (response.success) {
                window.location.href = '/event';
            } else {
                document.getElementById("login-msg").textContent = response.message;
            }
        }
    });
}

function isValid(valid) {
    const message = document.getElementById("message");
    const container = document.getElementById("container");

    if (valid == "FALSE") {
        message.style.color = "#EA0000";
        message.textContent = "You already have an account!";
    } else if (valid == "Some field is empty.") {
        message.style.color = "#EA0000";
        message.textContent = "Please enter all fields";
    } else {
        message.style.color = "#00BB00";
        message.textContent = "Create an Account successfully!";

        // Wait 0.5 seconds
        setTimeout(function () {
            container.classList.remove("right-panel-active");
        }, 500); // 0.5 seconds delay
    }

    // Show the text
    message.classList.remove("hidden");
    message.classList.remove("fading-out"); // Ensure the text fades in properly
    message.classList.add("visible");

    // Wait 3 seconds, then start fading out the text
    setTimeout(function () {
        message.classList.remove("visible");
        message.classList.add("fading-out");
    }, 3000); // 3 seconds delay
}