const socket = io();
const form = document.getElementById("message-form");
const chatBox = document.getElementById("chat-box");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = form.name.value.trim();
  const message = form.message.value.trim();

  if (!name || !message) return;

  socket.emit("sendMessage", { name, message });
  form.message.value = "";
});

socket.on("receiveMessage", ({ name, message, timestamp }) => {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("msg");
  msgDiv.innerHTML = `<strong>${name}</strong>: ${message}<br><span class="meta">${timestamp}</span>`;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
});
