import { auth } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


function setupAuthUI() {

  const login = document.querySelector('a[href="login.html"]');
  const signup = document.querySelector('a[href="signup.html"]');

  if (!login || !signup) return;


  onAuthStateChanged(auth, (user) => {

    if (user) {

      // Usuario conectado
      login.innerHTML =
        '<a href="index.html"><img src="assets/nav-login.png" alt=""> (user.email || "Account")</a>';

      login.href = "#";

      signup.innerHTML =
        '<a href="index.html"><img src="assets/nav-signin.png" alt=""> Log Out</a>';

      signup.href = "#";


      signup.onclick = async (event) => {

        event.preventDefault();

        try {

          await signOut(auth);

          location.reload();

        } catch (error) {

          console.error(error);

        }

      };


    } else {

      // Usuario desconectado

      login.innerHTML =
        '<img src="assets/nav-login.png" alt=""> Log In';

      login.href = "login.html";

      signup.innerHTML =
        '<img src="assets/nav-signup.png" alt=""> Sign Up';

      signup.href = "signup.html";

      signup.onclick = null;

    }

  });

}


setupAuthUI();
