import { el } from "./core.js";

const ADMIN_STORAGE_KEY = "KIENPHONE_ADMIN";
const USER_STORAGE_KEY = "KIENPHONE_USERS";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

const getAdminAccount = () => {
  const admin = JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY));

  if (admin) {
    return admin;
  }

  const defaultAdmin = {
    username: "admin",
    password: "Admin123@",
  };

  localStorage.setItem(
    ADMIN_STORAGE_KEY,
    JSON.stringify(defaultAdmin)
  );

  return defaultAdmin;
};

const getUsers = () => {
  return JSON.parse(localStorage.getItem(USER_STORAGE_KEY)) || [];
};

const showError = (input, errorElement, message) => {
  input.classList.remove("border-green-500");
  input.classList.add("border-red-500");

  errorElement.textContent = message;
  errorElement.classList.remove("hidden");
};

const showSuccess = (input, errorElement) => {
  input.classList.remove("border-red-500");
  input.classList.add("border-green-500");

  errorElement.classList.add("hidden");
};

if (el.form) {
  el.form.addEventListener("submit", (event) => {
    event.preventDefault();

    let isValid = true;

    const usernameValue = el.username.value.trim();
    const passwordValue = el.password.value.trim();

    if (usernameValue === "") {
      showError(
        el.username,
        el.usernameError,
        "Không được để trống!"
      );

      isValid = false;
    } else {
      showSuccess(el.username, el.usernameError);
    }

    if (passwordValue === "") {
      showError(
        el.password,
        el.passwordError,
        "Không được để trống!"
      );

      isValid = false;
    } else if (!passwordRegex.test(passwordValue)) {
      showError(
        el.password,
        el.passwordError,
        "Sai mật khẩu!"
      );

      isValid = false;
    } else {
      showSuccess(el.password, el.passwordError);
    }

    if (!isValid) {
      return;
    }

    const adminAccount = getAdminAccount();

    if (
      usernameValue === adminAccount.username &&
      passwordValue === adminAccount.password
    ) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("username", adminAccount.username);
      localStorage.setItem("role", "admin");

      alert("Đăng nhập admin thành công!");

      window.location.href = "../page-admin/dashboard.html";

      return;
    }

    const users = getUsers();

    const userFound = users.find((user) => {
      return (
        user.username === usernameValue &&
        user.password === passwordValue
      );
    });

    if (!userFound) {
      alert("tài khoảng chưa được đăng kí");
      return;
    }

    if (userFound.status === "locked") {
      alert("Tài khoản của bạn đã bị khóa");
      return;
    }

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("username", userFound.username);
    localStorage.setItem("role", userFound.role || "user");

    alert("Đăng nhập thành công!");

    window.location.href = "../index.html";

  });
}

window.dangNhapGoogle = () => {
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("username", "Google User");
  localStorage.setItem("role", "user");

  alert("Đăng nhập thành công bằng tài khoản Google");

  window.location.href = "../index.html";
};

window.dangNhapFacebook = () => {
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("username", "Facebook User");
  localStorage.setItem("role", "user");

  alert("Đăng nhập thành công bằng tài khoản Facebook");

  window.location.href = "../index.html";
};

