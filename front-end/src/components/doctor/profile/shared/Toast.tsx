export const showToast = (
  message: string,
  type: "success" | "error" = "success"
) => {
  const toast = document.createElement("div");
  toast.className = `fixed top-4 right-4 p-4 rounded-lg text-white ${
    type === "success" ? "bg-green-500" : "bg-red-500"
  } z-50 shadow-lg`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
  }, 3000);
};