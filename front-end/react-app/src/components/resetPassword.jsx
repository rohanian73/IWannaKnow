import "../styles.css";
import react, { useRef } from "react";
import axios from "axios";

export default function ResetPassword(props) {
  const newPassword = useRef();
  const confirmPassword = useRef();

  let emailValue;

  // Links
  console.log(window.location.href);

  const FE_link = window.location.href;
  const BE_link = FE_link.replace(
    "http://localhost:3000/",
    "http://localhost:8080/"
  );

  console.log(BE_link);

  const linkArr = FE_link.split("/");
  const id = linkArr[linkArr.length - 2];

  console.log(id);

  axios({
    method: "post",
    url: `http://localhost:8080/user/${id}`,
  })
    .then((resId) => {
      console.log(resId);

      if (resId.status == 200) {
        if (resId.data != null) {
          const email = resId.data.email;
          console.log(email);

          emailValue = email;

          axios({
            method: "get",
            url: `${BE_link}`,
            headers: {
              Username: email,
            },
          })
            .then((response) => {
              console.log(response);

              if (response.status == 200) {
                const tokenResult = response.headers.token_validity;

                if (tokenResult == "Valid Token") {
                  const resetPasswordForm =
                    document.getElementById("resetPasswordForm");
                  resetPasswordForm.style.display = "block";
                } else {
                  const resetPasswordPage =
                    document.getElementById("resetPasswordPage");

                  resetPasswordPage.innerHTML = `
                      <h1>Not Verified</h1>
                      `;
                }
              }
            })
            .catch((error) => {
              console.log(error);
            });
        } else {
          const resetPasswordPage =
            document.getElementById("resetPasswordPage");

          resetPasswordPage.innerHTML = `
            <h1>Not Verified</h1>
            `;
        }
      } else {
        console.log("Error!");
      }
    })
    .catch((errId) => {
      console.log(errId);
    });

  function toggleNewPassword() {
    const toggleBtnContent = document.getElementById("toggleBtnContent_np");

    if (newPassword.current.type == "password") {
      newPassword.current.type = "text";
      toggleBtnContent.style.backgroundColor = "#5e5e5e";
      toggleBtnContent.style.borderBottom = "0px";
    } else {
      newPassword.current.type = "password";
      toggleBtnContent.style.backgroundColor = "transparent";
      toggleBtnContent.style.borderBottom = "3px solid #5e5e5e";
    }
  }

  function toggleConfirmPassword() {
    const toggleBtnContent = document.getElementById("toggleBtnContent_cp");

    if (confirmPassword.current.type == "password") {
      confirmPassword.current.type = "text";
      toggleBtnContent.style.backgroundColor = "#5e5e5e";
      toggleBtnContent.style.borderBottom = "0px";
    } else {
      confirmPassword.current.type = "password";
      toggleBtnContent.style.backgroundColor = "transparent";
      toggleBtnContent.style.borderBottom = "3px solid #5e5e5e";
    }
  }

  function validatePassword() {
    let passwordValid = false;

    if (newPassword.current.validity.valueMissing) {
      alert("Enter new password");
      return passwordValid;
    }

    if (confirmPassword.current.validity.valueMissing) {
      alert("Confirm new password");
      return passwordValid;
    }

    const newPasswordValue = newPassword.current.value;

    let passwordUpper = false;
    let passwordLower = false;
    let passwordDigit = false;
    let passwordSymbol = false;

    for (let i = 0; i < newPasswordValue.length; i++) {
      if (newPasswordValue.charAt(i).match("[0-9a-zA-Z]") == null) {
        passwordSymbol = true;
        continue;
      }

      if (newPasswordValue.charAt(i).match("[0-9]") != null) {
        passwordDigit = true;
        continue;
      }

      if (
        newPasswordValue.charAt(i) == newPasswordValue.charAt(i).toUpperCase()
      ) {
        passwordUpper = true;
        continue;
      }

      if (
        newPasswordValue.charAt(i) == newPasswordValue.charAt(i).toLowerCase()
      ) {
        passwordLower = true;
      }
    }

    if (
      newPasswordValue.length < 8 ||
      passwordUpper == false ||
      passwordLower == false ||
      passwordDigit == false ||
      passwordSymbol == false
    ) {
      alert(
        "Password entered must pass requirements such as: \n" +
          "• the minimum length of 8 \n" +
          "• at least one lowercase \n" +
          "• at least one uppercase \n" +
          "• at least one digit \n" +
          "• at least one special character."
      );

      return passwordValid;
    }

    const confirmPasswordValue = confirmPassword.current.value;

    if (newPasswordValue != confirmPasswordValue) {
      alert("Passwords do not match");
      return passwordValid;
    }

    passwordValid = true;
    return passwordValid;
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    if (validatePassword()) {
      axios({
        method: "post",
        url: `http://localhost:8080/user/changePassword?email=${emailValue}&password=${newPassword.current.value}`,
      })
        .then((response) => {
          console.log(response);
          alert("Password is changed.")
          window.location = "http://localhost:3000";
        })
        .then(() => {
          newPassword.current.value = "";
          confirmPassword.current.value = "";
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  return (
    <div id="resetPasswordPage">
      <div class="login-form reset-password-form" id="resetPasswordForm">
        <div class="login-container reset-password-container">
          <p class="login-title__main reset-password-title">
            Create New Password
          </p>

          <div class="login-password reset-password-new-password">
            <input
              class="login-input reset-password-input"
              id="newPassword"
              type="password"
              ref={newPassword}
              autoComplete="off"
              required
            />
            <label class="login-label reset-password-label" htmlFor="password">
              Password
            </label>
          </div>

          <button
            class="login-password-toggle login-password-toggle_np"
            id="toggleBtn"
            onClick={toggleNewPassword}
          >
            <div id="toggleBtnContent_np"></div>
          </button>

          <div class="login-password reset-password-confirm-password">
            <input
              class="login-input reset-password-input"
              id="confirmPassword"
              type="password"
              ref={confirmPassword}
              autoComplete="off"
              required
            />
            <label class="login-label reset-password-label" htmlFor="password">
              Confirm Password
            </label>

            <button
              class="login-password-toggle login-password-toggle_cp"
              id="toggleBtn"
              onClick={toggleConfirmPassword}
            >
              <div id="toggleBtnContent_cp"></div>
            </button>

            <button
              className="login-btn reset-password-btn"
              id="resetPasswordBtn"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}