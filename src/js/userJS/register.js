import { el, state, luuUsers } from "./core.js";

const phoneRegex = /^[0-9]{10}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

// Hàm dùng chung để hiển thị trạng thái
const showError = (input, errorElement, message) => {
  input.classList.remove("border-green-500");
  input.classList.add("border-red-500");
  errorElement.textContent = message;
  errorElement.classList.remove("hidden");
};

const showSuccess = (input, errorElement) => {
  input.classList.remove("border-red-500");
  input.classList.add("border-green-500");
  errorElement.textContent = "";
  errorElement.classList.add("hidden");
};

// Hàm kiểm tra logic chung cho các input
const validate = (value, input, errorElement, regex, message) => {
  if (value === "") {
    showError(input, errorElement, "Không được để trống!");
    return false;
  }
  if (regex && !regex.test(value)) {
    showError(input, errorElement, message);
    return false;
  }
  showSuccess(input, errorElement);
  return true;
};

if (el.registerForm) {
  el.registerForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const phoneValue = el.registerPhone.value.trim();
    const emailValue = el.registerEmail.value.trim();
    const usernameValue = el.registerUsername.value.trim();
    const passwordValue = el.registerPassword.value.trim();

    // Thực hiện kiểm tra định dạng
    let isValid = true;
    isValid &= validate(phoneValue, el.registerPhone, el.registerPhoneError, phoneRegex, "Số điện thoại không đúng!");
    isValid &= validate(emailValue, el.registerEmail, el.registerEmailError, emailRegex, "Email sai định dạng!");
    isValid &= validate(usernameValue, el.registerUsername, el.registerUsernameError, null, "");
    isValid &= validate(passwordValue, el.registerPassword, el.registerPasswordError, passwordRegex, "Mật khẩu yếu!");

    if (!isValid) return;

    // Kiểm tra trùng lặp
    if (state.users.some(u => u.username.toLowerCase() === usernameValue.toLowerCase())) {
      showError(el.registerUsername, el.registerUsernameError, "Tên đăng nhập đã tồn tại!");
      return;
    }

    if (state.users.some(u => u.email.toLowerCase() === emailValue.toLowerCase())) {
      showError(el.registerEmail, el.registerEmailError, "Email đã tồn tại!");
      return;
    }

    // Lưu dữ liệu
    state.users.push({
      id: Date.now(),
      username: usernameValue,
      password: passwordValue,
      phone: phoneValue,
      email: emailValue,
      role: "user",
      status: "active",
      createdAt: new Date().toLocaleString("vi-VN"),
    });

    luuUsers();
    alert("Đăng kí tài khoản thành công!");
    window.location.href = "./login.html";
  });
}