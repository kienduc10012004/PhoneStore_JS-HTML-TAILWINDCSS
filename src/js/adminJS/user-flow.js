import { dom, getElement } from "./core.js"

/* ================= KEY LOCALSTORAGE ================= */
const USER_STORAGE_KEY = "KIENPHONE_USERS";
const ADMIN_STORAGE_KEY = "KIENPHONE_ADMIN";

/* ================= STATE QUẢN LÝ USER ================= */
let users = [];
let selectedUserId = null;
let visiblePasswordIds = [];

/* ================= LẤY DANH SÁCH USER ================= */
const getUsers = () => {
  return JSON.parse(localStorage.getItem(USER_STORAGE_KEY)) || [];
};

/* ================= LƯU DANH SÁCH USER ================= */
const saveUsers = (users) => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
};

/* ================= LẤY TÀI KHOẢN ADMIN ================= */
const getAdminAccount = () => {
  const admin = JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY));

  if (admin) return admin;
  return {
    username: "admin",
    password: "Admin123@",
  };
};

/* ================= MỞ POPUP XEM MẬT KHẨU ================= */
const openPasswordPopup = (userId) => {
  selectedUserId = userId;

  dom.popupAdminUsername.value = "";
  dom.popupAdminPassword.value = "";

  dom.adminPasswordPopup.classList.remove("hidden");
};

/* ================= ĐÓNG POPUP XEM MẬT KHẨU ================= */
const closePasswordPopup = () => {
  selectedUserId = null;
  dom.adminPasswordPopup.classList.add("hidden");
};

/* ================= KIỂM TRA MẬT KHẨU ĐANG HIỂN THỊ ================= */
const isPasswordVisible = (userId) => {
  return visiblePasswordIds.includes(String(userId));
};

/* ================= HIỂN THỊ MẬT KHẨU USER ================= */
const showPassword = (userId) => {
  if (!visiblePasswordIds.includes(String(userId))) {
    visiblePasswordIds.push(String(userId));
  }

  renderUsers(users);
};

/* ================= ẨN MẬT KHẨU USER ================= */
const hidePassword = (userId) => {
  visiblePasswordIds = visiblePasswordIds.filter((id) => {
    return id !== String(userId);
  });

  renderUsers(users);
};

/* ================= RENDER DANH SÁCH USER ================= */
const renderUsers = (list) => {
  if (!dom.userTableBody) return;

  /* Không tìm thấy user */
  if (list.length === 0) {
    dom.userTableBody.innerHTML = `
        <tr>
          <td colspan="8" class="py-8 text-center text-slate-400 font-bold">
            Không tìm thấy người dùng
          </td>
        </tr>
      `;
    return;
  }

  dom.userTableBody.innerHTML = list.map((user) => {

    /* Trạng thái tài khoản */
    const statusText =
      user.status === "locked"
        ? "Đã khóa"
        : "Hoạt động";

    /* Text nút khóa / mở */
    const statusButtonText =
      user.status === "locked"
        ? "Mở"
        : "Khóa";

    /* Màu nút khóa / mở */
    const statusButtonClass =
      user.status === "locked"
        ? "bg-emerald-500 hover:bg-emerald-600"
        : "bg-amber-500 hover:bg-amber-600";

    /* Padding nút khóa / mở */
    const statusButtonPadding =
      statusButtonText === "Khóa"
        ? "px-4"
        : "px-6";

    /* Kiểm tra mật khẩu đang được hiện hay ẩn */
    const passwordIsVisible = isPasswordVisible(user.id);

    return `
        <tr class="border-b hover:bg-slate-50">
          <td class="py-4 px-4">
            <div class="relative group inline-block">
              <span class="font-bold">
                ${truncateText(user.username, 10)}
              </span>
              ${
                user.username.length > 10
                  ? `
                    <div class="pointer-events-none invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute bottom-full left-0 mt-2 z-50 bg-slate-900 text-white text-xs px-3 py-2 rounded-xl shadow-xl whitespace-nowrap transition-opacity duration-150">
                      ${user.username}
                    </div>
                  `
                  : ""
              }
            </div>
          </td>
          <td class="py-4 px-4">${user.email || "Chưa có"}</td>
          <td class="py-4 px-4">${user.phone || "Chưa có"}</td>
          <td class="py-4 px-4 text-center">${user.createdAt || "Chưa có"}</td>
          <td class="py-4 px-4 text-center">${user.role || "user"}</td>
          <td class="py-4 px-4 text-center">
            <div class="relative group inline-block">
              <span>
                ${
                  passwordIsVisible
                    ? truncateText(user.password, 10)
                    : "********"
                }
              </span>
              ${
                passwordIsVisible &&
                user.password.length > 10
                  ? `
                    <div class="pointer-events-none invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute bottom-full left-0 mt-2 z-50 bg-slate-900 text-white text-xs px-3 py-2 rounded-xl shadow-xl whitespace-nowrap transition-opacity duration-150">
                      ${user.password}
                    </div>
                  `
                  : ""
              }
            </div>

            <button
              onclick="toggleShowUserPassword('${user.id}')"
              class="ml-2 text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              <i class="${passwordIsVisible ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"}"></i>
            </button>
          </td>
          <td class="py-4 flex justify-center cursor-pointer duration-100 px-4 whitespace-nowrap">${statusText}</td>
          <td class="py-4 px-4">
            <div class="flex gap-2">
              <button
                onclick="toggleUserStatus('${user.id}')"
                class="${statusButtonClass} text-white ${statusButtonPadding} cursor-pointer duration-100 py-2 rounded-xl font-bold"
              >
                ${statusButtonText}
              </button>

              <button
                onclick="deleteUser('${user.id}')"
                class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 cursor-pointer rounded-xl font-bold"
              >
                Xóa
              </button>
            </div>
          </td>
        </tr>
      `;
  }).join("");
};

/* ================= TOGGLE HIỂN THỊ MẬT KHẨU ================= */
window.toggleShowUserPassword = (userId) => {
  if (isPasswordVisible(userId)) {
    hidePassword(userId);
    return;
  }

  openPasswordPopup(userId);
};

/* ================= KHÓA / MỞ KHÓA USER ================= */
window.toggleUserStatus = (id) => {
  users = users.map((user) => {
    if (String(user.id) === String(id)) {
      return {
        ...user,
        status:
          user.status === "locked"
            ? "active"
            : "locked",
      };
    }

    return user;
  });

  saveUsers(users);
  renderUsers(users);
};

/* ================= XÓA USER ================= */
window.deleteUser = (id) => {
  const user = users.find((item) => {
    return String(item.id) === String(id);
  });

  if (!user) return;

  const confirmDelete = confirm(
    `Bạn có chắc muốn xóa tài khoản "${user.username}" không?`
  );

  if (!confirmDelete) return;

  users = users.filter((item) => {
    return String(item.id) !== String(id);
  });

  visiblePasswordIds = visiblePasswordIds.filter((item) => {
    return item !== String(id);
  });

  saveUsers(users);
  renderUsers(users);
};

/* ================= KHỞI TẠO QUẢN LÝ USER ================= */
export const initManageUser = () => {
  users = getUsers();
  renderUsers(users);

  getElement("adminLoading")?.classList.remove("hidden");

  setTimeout(() => {
    users = getUsers();
    renderUsers(users);

    getElement("adminLoading")?.classList.add("hidden");
  }, 300);
  

  /* ================= TÌM KIẾM USER ================= */
  if (dom.userKeyword) {
    dom.userKeyword.addEventListener("input", () => {
      const keyword = dom.userKeyword.value.toLowerCase().trim();

      const filteredUsers = users.filter((user) => {
        return (
          String(user.username || "").toLowerCase().includes(keyword) ||
          String(user.email || "").toLowerCase().includes(keyword) ||
          String(user.phone || "").includes(keyword)
        );
      });

      renderUsers(filteredUsers);
    });
  }

  /* ================= XÁC THỰC ADMIN ĐỂ XEM MẬT KHẨU ================= */
  const handleConfirmShowPassword = () => {
    const adminAccount = getAdminAccount();

    const usernameValue = dom.popupAdminUsername.value.trim();

    const passwordValue = dom.popupAdminPassword.value.trim();

    if (
      usernameValue !== adminAccount.username ||
      passwordValue !== adminAccount.password
    ) {
      alert("Tài khoảng không đúng!");
      return;
    }

    showPassword(selectedUserId);
    closePasswordPopup();
  };

  /* ================= CLICK XÁC NHẬN POPUP ================= */
  dom.btnConfirmShowPassword?.addEventListener("click", handleConfirmShowPassword
  );

  /* ================= NHẤN ENTER ĐỂ XÁC NHẬN POPUP ================= */
  [dom.popupAdminUsername, dom.popupAdminPassword].forEach((input) => {
      input?.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          handleConfirmShowPassword();
        }
      });
    });

  /* ================= ĐÓNG POPUP XÁC THỰC ADMIN ================= */
  dom.btnClosePasswordPopup?.addEventListener("click", closePasswordPopup);
  dom.adminPasswordOverlay?.addEventListener("click", closePasswordPopup);
};

/* ================= RÚT GỌN TEXT DÀI ================= */
const truncateText = (text, maxLength = 10) => {
  if (!text) return "";

  return text.length > maxLength
    ? text.substring(0, maxLength) + "..."
    : text;
};
