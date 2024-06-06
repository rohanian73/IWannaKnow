import "../styles.css";
import react, { useRef, useEffect, useState } from "react";
import axios from "axios";
import emailjs, { send } from "@emailjs/browser";

export default function ForgotPassword(props) {
  const email = useRef();
  const form = useRef();

  const validateEmail = () => {
    let emailValid = false;

    // Empty email
    if (email.current.validity.valueMissing) {
      alert("Enter email");
      return emailValid;
    }

    let emailValue = email.current.value;

    // Invalid email (1/2)
    if (
      emailValue.length < 5 ||
      emailValue.match("[0-9a-zA-Z]+")[0].length == emailValue.length
    ) {
      alert("Enter a valid email");
      return emailValid;
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
      return emailValid;
    }

    // Email is valid
    emailValid = true;
    return emailValid;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (validateEmail()) {
      console.log("Data is ready to be sent");

      axios({
        method: "post",
        url: `http://localhost:8080/user/findByEmail?email=${email.current.value}`,
      })
        .then((response) => {
          console.log(response);

          if (response.status == 200) {
            if (response.data == "Found") {
              console.log("User is found");

              axios({
                method: "get",
                url: `http://localhost:8080/user/forgotPassword?email=${email.current.value}`,
              })
                .then((res) => {
                  console.log(res);
                  const jwtToken = res.headers.password_recovery_token;
                  // console.log(jwtToken);

                  axios({
                    method: "post",
                    url: `http://localhost:8080/user/findIdByEmail?email=${email.current.value}`,
                  })
                    .then((resId) => {
                      console.log(resId.data);
                      const userId = resId.data;

                      const url = `http://localhost:3000/resetPassword/${userId}/${jwtToken}`;
                      // console.log(url);
                      // sendLink(event);

                      // Sending the link to user's email
                      const SERVICE_ID = "service_i7kfcvv";
                      const TEMPLATE_ID = "template_9ljxaok";
                      const PUBLIC_KEY = "VVsGqTAgMG6IXL4dl";

                      const resetUrl = document.getElementById("resetUrl");
                      resetUrl.value = url;

                      emailjs
                        .sendForm(
                          SERVICE_ID,
                          TEMPLATE_ID,
                          form.current,
                          PUBLIC_KEY
                        )
                        .then((response) => {
                          console.log("Email is sent", response);
                        })
                        .catch((error) => {
                          console.log(error);
                        });
                    })
                    .catch((errId) => {
                      console.log(errId);
                    });
                })
                .catch((err) => {
                  console.log(err);
                });
            } else {
              console.log("No such user");
              alert("No such user. Please, enter another email.");
            }
          } else {
            alert("Error!");
          }
        })
        .catch((error) => {
          alert("Login error!");
          console.log(error);
        });
    }
  };

  return (
    <div>
      <form
        className="login-form forgot-password-form"
        ref={form}
        onSubmit={handleSubmit}
      >
        <div className="login-container forgot-password-container">
          <p className="login-title__main forgot-password-title">
            Forgot Password?
          </p>

          <div className="login-email forgot-password-email">
            <input
              className="login-input forgot-password-input"
              id="forgotPasswordEmail"
              type="text"
              name="user_email"
              ref={email}
              autoComplete="off"
              required
            />
            <label
              className="login-label forgot-password-label"
              htmlFor="email"
            >
              Email
            </label>
          </div>

          <input className="reset-url" id="resetUrl" name="url"/>

          <button
            className="login-btn forgot-password-btn"
            id="forgotPasswordBtn"
            onClick={handleSubmit}
          >
            Send a recovery link
          </button>

        </div>
      </form>
    </div>
  );
}