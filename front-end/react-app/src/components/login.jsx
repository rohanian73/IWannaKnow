import "../styles.css";
import react, { useRef, useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

import { useGoogleLogin, googleLogout } from "@react-oauth/google";

export default function Login(props) {

  const email = useRef();
  const password = useRef();

  function togglePassword() {
    const toggleBtnContent = document.getElementById("toggleBtnContent");

    if (password.current.type == "password") {
      password.current.type = "text";
      toggleBtnContent.style.backgroundColor = "#5e5e5e";
      toggleBtnContent.style.borderBottom = "0px";
    } else {
      password.current.type = "password";
      toggleBtnContent.style.backgroundColor = "transparent";
      toggleBtnContent.style.borderBottom = "3px solid #5e5e5e";
    }
  }

  const validateForm = () => {
    let formValid = false;

    // Empty email
    if (email.current.validity.valueMissing) {
      alert("Enter email");
      return formValid;
    }

    // Empty password
    if (password.current.validity.valueMissing) {
      alert("Enter password");
      return formValid;
    }

    let emailValue = email.current.value;

    // Invalid email (1/2)
    if (
      emailValue.length < 5 ||
      emailValue.match("[0-9a-zA-Z]+")[0].length == emailValue.length
    ) {
      alert("Enter a valid email");
      return formValid;
    }

    // Invalid email (2/2)
    let symbolsArr = [];

    // '@' and '.' cannot be placed in the beginning or end of email
    for (let i = 1; i < emailValue.length - 1; i++) {
      if (!emailValue.charAt(i).match("[0-9a-zA-Z]")) {
        symbolsArr.push(emailValue.charAt(i));

        // '@' and '.' cannot be placed together
        if (emailValue.charAt(i) == "@") {
          i++;
        }
      }
    }

    // Email must contain only 2 special symbols, first of which is '@' and second one is '.'
    if (
      symbolsArr.length != 2 ||
      symbolsArr[0] != "@" ||
      symbolsArr[1] != "."
    ) {
      alert("Enter a valid email");
      return formValid;
    }

    // Invalid password
    let passwordValue = password.current.value;

    let passwordUpper = false;
    let passwordLower = false;
    let passwordDigit = false;
    let passwordSymbol = false;

    for (let i = 0; i < passwordValue.length; i++) {
      if (passwordValue.charAt(i).match("[0-9a-zA-Z]") == null) {
        passwordSymbol = true;
        continue;
      }

      if (passwordValue.charAt(i).match("[0-9]") != null) {
        passwordDigit = true;
        continue;
      }

      if (passwordValue.charAt(i) == passwordValue.charAt(i).toUpperCase()) {
        passwordUpper = true;
        continue;
      }

      if (passwordValue.charAt(i) == passwordValue.charAt(i).toLowerCase()) {
        passwordLower = true;
      }
    }

    if (
      passwordValue.length < 8 ||
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

      return formValid;
    }

    // Form is valid
    formValid = true;
    return formValid;
  };

  // Manual Login
  const handleSubmit = (event) => {
    event.preventDefault();

    if (validateForm()) {
      const dataLogin = {
        username: email.current.value,
        password: password.current.value,
      };

      console.log(dataLogin);
      console.log("Data is ready to be sent");

      const rememberMeChecked = document.getElementById("loginCbox").checked;

      axios({
        method: "post",
        url: "http://localhost:8080/login",
        data: dataLogin,
        headers: {
          rememberMe: rememberMeChecked ? "true" : "false",
        },
      })
        .then((response) => {
          console.log(response);

          if (response.status == 200) {
            const authText = response.headers.authorization;

            if (authText == "Bad credentials") {
              axios({
                method: "post",
                url: `http://localhost:8080/user/findByEmail?email=${email.current.value}`,
              })
                .then((res) => {
                  if (res.data == "Found") {
                    console.log("Email and password do not match");
                    alert(
                      "Email and password do not match. Please, try again."
                    );
                  } else {
                    console.log("No such user");
                    alert("No such user. Please, register.");
                  }
                })
                .catch((err) => {
                  console.log(err);
                });
            } else {
              const jwtToken = response.headers.authorization.split(" ")[1];
              console.log("Access confirmed");
              // console.log(jwtToken);

              //Hiding Login
              const loginForm = document.getElementById("loginForm");
              const welcomeMessage = document.getElementById("welcomeMessage");
              const logoutBtn = document.getElementById("logoutBtn");

              loginForm.style.display = "none";
              welcomeMessage.style.display = "block";
              logoutBtn.style.display = "block";

              //Showing Login
              document
                .getElementById("logoutBtn")
                .addEventListener("click", () => {
                  loginForm.style.display = "block";
                  welcomeMessage.style.display = "none";
                  logoutBtn.style.display = "none";
                });
            }
          } else {
            alert("Error! (status is not 200)");
          }
        })
        .then(() => {
          email.current.value = "";
          password.current.value = "";
        })
        .catch((error) => {
          alert("Login error!");
          console.log(error);
        });
    }
  };

  // Get email from Google
  const login = useGoogleLogin({
    onSuccess: async (response) => {
      console.log(response);

      try {
        const res = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${response.access_token}`,
            },
          }
        );
        console.log(res);
        socialSubmit(res);
      } catch (err) {
        console.log(err);
      }
    },
  });

  // Social Login
  const socialSubmit = (res) => {
    const dataLogin = {
      email: res.data.email,
      firstname: res.data.given_name,
      lastname: res.data.family_name,
      password: "null",
    };

    axios({
      method: "post",
      url: "http://localhost:8080/user",
      data: dataLogin,
    })
      .then((response) => {
        console.log(response);

        if (response.status == 200 || response.status == 201) {
          const dataLogin = {
            username: res.data.email,
            password: "null",
          };

          const rememberMeChecked = document.getElementById("loginCbox").checked;

          axios({
            method: "post",
            url: "http://localhost:8080/login",
            data: dataLogin,
            headers: {
              rememberMe: rememberMeChecked ? "true" : "false",
            },
          })
            .then((res) => {
              console.log(res);

              if (res.status == 200) {
                const jwtToken = res.headers.authorization.split(" ")[1];
                // console.log(jwtToken);

                if (response.status == 200) {
                  console.log("Access confirmed");
                } else {
                  console.log("Access confirmed (account is created)");
                }

                //Hiding Login
                const loginForm = document.getElementById("loginForm");
                const welcomeMessage =
                  document.getElementById("welcomeMessage");
                const logoutBtn = document.getElementById("logoutBtn");

                loginForm.style.display = "none";
                welcomeMessage.style.display = "block";
                logoutBtn.style.display = "block";

                //Showing Login
                document
                  .getElementById("logoutBtn")
                  .addEventListener("click", () => {
                    loginForm.style.display = "block";
                    welcomeMessage.style.display = "none";
                    logoutBtn.style.display = "none";
                  });
              }
            })
            .catch((err) => {
              console.log(err);
            });
        }
      })
      .then(() => {
        email.current.value = "";
        password.current.value = "";
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // HTML
  return (
    <div className="App">
      <div className="login-form" id="loginForm">
        <div className="login-container">
          <p className="login-title__main">Have an account?</p>

          <div className="login-email">
            <input
              className="login-input"
              id="loginEmail"
              type="text"
              ref={email}
              autoComplete="off"
              required
            />
            <label className="login-label" htmlFor="email">
              Email
            </label>
          </div>

          <div className="login-password">
            <input
              className="login-input"
              id="loginPassword"
              type="password"
              ref={password}
              autoComplete="off"
              required
            />
            <label className="login-label" htmlFor="password">
              Password
            </label>

            <button
              className="login-password-toggle"
              id="toggleBtn"
              onClick={togglePassword}
            >
              <div id="toggleBtnContent"></div>
            </button>
          </div>

          <div className="login__remember-me">
            <input className="login-cbox" id="loginCbox" type="checkbox" />
            <span className="login-span">Remember Me</span>
          </div>

          <a className="login__password-recovery" href="/forgotPassword">
            Forgot password?
          </a>

          <button className="login-btn" id="loginBtn" onClick={handleSubmit}>
            Log In
          </button>

          <p className="login-title__social">— Or Sign In With —</p>

          <div className="login-socials">
            <a
              onClick={() => login()}
              href="#"
              className="login-social__google"
              id="google-btn"
            >
              <FontAwesomeIcon icon={faGoogle} />
            </a>
          </div>

          <div className="create-account">
            <span className="create-account-span">Do not have an account?</span>
            <a className="create-account-link" href="#">
              Register here.
            </a>
          </div>
        </div>
      </div>

      <h1 className="welcome-message" id="welcomeMessage">
        Welcome!
      </h1>
      <button className="logout-btn" id="logoutBtn">
        Logout
      </button>
    </div>
  );
}