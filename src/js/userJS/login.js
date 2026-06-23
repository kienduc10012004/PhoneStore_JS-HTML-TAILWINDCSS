/* ================= IMPORT MODULES ================= */
import { el } from "./core.js";

/* ================= KEY LOCALSTORAGE ================= */
const ADMIN_STORAGE_KEY = "KIENPHONE_ADMIN";
const USER_STORAGE_KEY = "KIENPHONE_USERS";

/* ================= REGEX KIỂM TRA MẬT KHẨU ================= */
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

/* ================= LẤY TÀI KHOẢN ADMIN ================= */
const getAdminAccount = () => {
  const admin = JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY));

  if (admin) {
    return admin;
  }

  /* Tạo admin mặc định nếu chưa có */
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

/* ================= LẤY DANH SÁCH USER ================= */
const getUsers = () => {
  return JSON.parse(localStorage.getItem(USER_STORAGE_KEY)) || [];
};

/* ================= HIỂN THỊ LỖI INPUT ================= */
const showError = (input, errorElement, message) => {
  input.classList.remove("border-green-500");
  input.classList.add("border-red-500");

  errorElement.textContent = message;
  errorElement.classList.remove("hidden");
};

/* ================= HIỂN THỊ INPUT HỢP LỆ ================= */
const showSuccess = (input, errorElement) => {
  input.classList.remove("border-red-500");
  input.classList.add("border-green-500");

  errorElement.classList.add("hidden");
};

/* ================= XỬ LÝ FORM ĐĂNG NHẬP ================= */
if (el.form) {
  el.form.addEventListener("submit", (event) => {
    event.preventDefault();

    let isValid = true;

    const usernameValue = el.username.value.trim();
    const passwordValue = el.password.value.trim();

    /* ================= KIỂM TRA USERNAME ================= */
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

    /* ================= KIỂM TRA PASSWORD ================= */
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

    /* ================= DỪNG NẾU FORM KHÔNG HỢP LỆ ================= */
    if (!isValid) {
      return;
    }

    /* ================= ĐĂNG NHẬP ADMIN ================= */
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

    /* ================= ĐĂNG NHẬP USER ================= */
    const users = getUsers();

    const userFound = users.find((user) => {
      return (
        user.username === usernameValue &&
        user.password === passwordValue
      );
    });

    /* ================= USER CHƯA ĐĂNG KÝ ================= */
    if (!userFound) {
      alert("tài khoảng chưa được đăng kí");
      return;
    }

    /* ================= USER BỊ KHÓA ================= */
    if (userFound.status === "locked") {
      alert("Tài khoản của bạn đã bị khóa");
      return;
    }

    /* ================= LƯU TRẠNG THÁI ĐĂNG NHẬP USER ================= */
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("username", userFound.username);
    localStorage.setItem("role", userFound.role || "user");

    alert("Đăng nhập thành công!");

    window.location.href = "../index.html";
  });
}

/* ================= ĐĂNG NHẬP GOOGLE ================= */
window.dangNhapGoogle = () => {
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("username", "Google User");
  localStorage.setItem("role", "user");

  alert("Đăng nhập thành công bằng tài khoản Google");

  window.location.href = "../index.html";
};

/* ================= ĐĂNG NHẬP FACEBOOK ================= */
window.dangNhapFacebook = () => {
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("username", "Facebook User");
  localStorage.setItem("role", "user");

  alert("Đăng nhập thành công bằng tài khoản Facebook");

  window.location.href = "../index.html";
};