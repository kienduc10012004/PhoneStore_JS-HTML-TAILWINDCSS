import { el } from "./core.js";

/* ================= KEY LOCALSTORAGE ================= */
const USER_STORAGE_KEY = "HiKuPHONE_USERS";

/* ================= REGEX KIỂM TRA INPUT ================= */
const phoneRegex = /^[0-9]{10}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

/* ================= LẤY DANH SÁCH USER ================= */
const getUsers = () => {
  return JSON.parse(localStorage.getItem(USER_STORAGE_KEY)) || [];
};

/* ================= LƯU DANH SÁCH USER ================= */
const saveUsers = (users) => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
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

  errorElement.textContent = "";
  errorElement.classList.add("hidden");
};

/* ================= XỬ LÝ FORM QUÊN MẬT KHẨU ================= */
if (el.forgotForm) {
  el.forgotForm.addEventListener("submit", (event) => {
    event.preventDefault();

    let isValid = true;

    const usernameValue = el.forgotUsername.value.trim();
    const phoneValue = el.forgotPhone.value.trim();
    const newPasswordValue = el.forgotNewPassword.value.trim();
    const confirmPasswordValue = el.forgotConfirmPassword.value.trim();

    /* ================= KIỂM TRA TÊN ĐĂNG NHẬP ================= */
    if (usernameValue === "") {
      showError(
        el.forgotUsername,
        el.forgotUsernameError,
        "Không được để trống!"
      );

      isValid = false;
    } else {
      showSuccess(el.forgotUsername, el.forgotUsernameError);
    }

    /* ================= KIỂM TRA SỐ ĐIỆN THOẠI ================= */
    if (phoneValue === "") {
      showError(
        el.forgotPhone,
        el.forgotPhoneError,
        "Không được để trống!"
      );

      isValid = false;
    } else if (!phoneRegex.test(phoneValue)) {
      showError(
        el.forgotPhone,
        el.forgotPhoneError,
        "Số điện thoại ko đúng định dạng!"
      );

      isValid = false;
    } else {
      showSuccess(el.forgotPhone, el.forgotPhoneError);
    }

    /* ================= KIỂM TRA MẬT KHẨU MỚI ================= */
    if (newPasswordValue === "") {
      showError(
        el.forgotNewPassword,
        el.forgotNewPasswordError,
        "Không được để trống!"
      );

      isValid = false;
    } else if (!passwordRegex.test(newPasswordValue)) {
      showError(
        el.forgotNewPassword,
        el.forgotNewPasswordError,
        "Mật khẩu yếu!"
      );

      isValid = false;
    } else {
      showSuccess(el.forgotNewPassword, el.forgotNewPasswordError);
    }

    /* ================= KIỂM TRA XÁC NHẬN MẬT KHẨU ================= */
    if (confirmPasswordValue === "") {
      showError(
        el.forgotConfirmPassword,
        el.forgotConfirmPasswordError,
        "Không được để trống!"
      );

      isValid = false;
    } else if (confirmPasswordValue !== newPasswordValue) {
      showError(
        el.forgotConfirmPassword,
        el.forgotConfirmPasswordError,
        "Mật khẩu xác nhận không khớp!"
      );

      isValid = false;
    } else {
      showSuccess(el.forgotConfirmPassword, el.forgotConfirmPasswordError);
    }

    /* ================= DỪNG NẾU FORM KHÔNG HỢP LỆ ================= */
    if (!isValid) {
      return;
    }

    /* ================= TÌM USER THEO USERNAME / PASSWORD ================= */
    const users = getUsers();

    const userByUsername = users.find((user) => {
      return user.username === usernameValue;
    });

    const userByPassword = users.find((user) => {
      return user.password === newPasswordValue;
    });

    /* ================= CÓ USERNAME NHƯNG CHƯA CÓ PASSWORD MỚI ================= */
    if (userByUsername && !userByPassword) {
      userByUsername.password = newPasswordValue;
      userByUsername.phone = phoneValue;

      saveUsers(users);
      alert("Đã cập nhật lại mật khẩu cho tài khoản!");
      window.location.href = "./login.html";
      return;
    }

    /* ================= CÓ PASSWORD NHƯNG CHƯA CÓ USERNAME ================= */
    if (!userByUsername && userByPassword) {
      userByPassword.username = usernameValue;
      userByPassword.phone = phoneValue;

      saveUsers(users);
      alert("Đã cập nhật lại tên đăng nhập cho tài khoản!");
      window.location.href = "./login.html";
      return;
    }

    /* ================= USERNAME VÀ PASSWORD ĐÃ TỒN TẠI ================= */
    if (userByUsername && userByPassword) {
      alert("Tài khoản đã tồn tại, thông tin được giữ nguyên!");
      window.location.href = "./login.html";
      return;
    }

    /* ================= TẠO TÀI KHOẢN MỚI ================= */
    const newUser = {
      id: Date.now(),
      username: usernameValue,
      password: newPasswordValue,
      phone: phoneValue,
      email: "",
      role: "user",
      status: "active",
      createdAt: new Date().toLocaleString("vi-VN"),
    };

    users.push(newUser);
    saveUsers(users);
    alert("Đã tạo tài khoản mới thành công!");

    window.location.href = "./login.html";
  });
}