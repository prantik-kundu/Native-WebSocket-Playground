const serverUrl = document.getElementById("serverUrl");
const username = document.getElementById("username");
const connectBtn = document.getElementById("connectBtn");
const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const logs = document.getElementById("logs");
const clearLogsBtn = document.getElementById("clearLogsBtn");
const autoScrollBtn = document.getElementById("autoScrollBtn");
const statusBadge = document.getElementById("connectionStatus");
const protocol = document.getElementById("protocol");
const sentCount = document.getElementById("sentCount");
const receivedCount = document.getElementById("receivedCount");

let socket = null;
let autoScroll = true;
let sent = 0;
let received = 0;
let clientId = null;

const EVENTS = {
    JOIN: "join",
    JOINED: "joined",
    CONNECTED: "connected",
    MESSAGE: "message",
    DISCONNECTED: "disconnected",
    ERROR: "error"
};

const getCurrentTime = () => new Date().toLocaleTimeString();

function updateStatus(text, statusClass) {
    statusBadge.textContent = text;
    statusBadge.className = `badge ${statusClass}`;
}

function getDefaultServerUrl() {
    const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
    return `${protocol}${window.location.host}`;
}

function toggleControls(connected) {
    serverUrl.disabled = connected;
    username.disabled = connected;
    sendBtn.disabled = !connected;
    connectBtn.textContent = connected ? "Disconnect" : "Connect";
}

function createLog(type, message) {
    const row = document.createElement("div");
    row.className = `log ${type}`;
    const time = document.createElement("span");
    time.className = "time";
    time.textContent = `[${getCurrentTime()}]`;
    const tag = document.createElement("span");
    tag.className = "tag";
    switch (type) {
        case "system":
            tag.textContent = "[SYSTEM]";
            break;
        case "connected-log":
            tag.textContent = "[CONNECTED]";
            break;
        case "disconnected-log":
            tag.textContent = "[DISCONNECTED]";
            break;
        case "sent":
            tag.textContent = "[SENT]";
            break;
        case "received":
            tag.textContent = "[RECEIVED]";
            break;
        case "error":
            tag.textContent = "[ERROR]";
            break;
        default:
            tag.textContent = "[INFO]";
    }
    const msg = document.createElement("span");
    msg.className = "message";
    if (message.includes("<span")) {
        msg.innerHTML = message;
    } else {
        msg.textContent = message;
    }
    row.append(time, tag, msg);
    logs.appendChild(row);
    if (autoScroll) logs.scrollTop = logs.scrollHeight;
}

serverUrl.value = getDefaultServerUrl();

connectBtn.addEventListener("click", () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
        return;
    }
    const url = (serverUrl.value.trim() || getDefaultServerUrl()).trim();
    const name = username.value.trim();
    if (!url) {
        alert("Please enter the WebSocket URL.");
        return;
    }
    if (!name) {
        alert("Please enter a username.");
        return;
    }
    updateStatus("Connecting...", "connecting");
    createLog("system", `Connecting to ${url}`);

    socket = new WebSocket(url);

    socket.addEventListener("open", () => {
        protocol.textContent = "ws";
        socket.send(JSON.stringify({
            type: EVENTS.JOIN,
            username: name
        }));
    });

    socket.addEventListener("message", (event) => {
        received++;
        receivedCount.textContent = received;
        let data;
        try {
            data = JSON.parse(event.data);
        }
        catch {
            createLog("error", "Received malformed JSON.");
            return;
        }
        switch (data.type) {

            case EVENTS.JOINED:
                clientId = data.clientId;
                updateStatus("Connected", "connected");
                toggleControls(true);
                messageInput.focus();
                createLog("connected-log", `Welcome ${data.username}! (${data.clientId})`);
                break;

            case EVENTS.CONNECTED:
                createLog("connected-log", `${data.username} joined (${data.clientId})`);
                break;

            case EVENTS.MESSAGE:
                createLog("received", `<span class="sender">${data.username}</span> <span class="client-id">${data.clientId}</span> <span class="separator">•</span> <span class="message-text">${data.message}</span>`);
                break;

            case EVENTS.DISCONNECTED:
                createLog("disconnected-log", `${data.username} left (${data.clientId})`);
                break;

            case EVENTS.ERROR:
                createLog("error", data.message);
                break;

            default:
                createLog("system", "Unknown event received.");
        }
    });

    socket.addEventListener("close", () => {
        updateStatus("Disconnected", "disconnected");
        protocol.textContent = "—";
        toggleControls(false);
        createLog("disconnected-log", "Connection closed.");
    });

    socket.addEventListener("error", () => {
        createLog("error", "A WebSocket error occurred.");
    });

});

function sendMessage() {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    const message = messageInput.value.trim();
    const name = username.value.trim();
    if (!message) return;
    socket.send(JSON.stringify({
        type: EVENTS.MESSAGE,
        message
    }));
    sent++;
    sentCount.textContent = sent;
    createLog("sent", `<span class="sender">${name}</span> <span class="client-id">${clientId || "(unknown)"}</span> <span class="separator">•</span> <span class="message-text">${message}</span>`);
    messageInput.value = "";
    messageInput.focus();
}

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
});

clearLogsBtn.addEventListener("click", () => {
    logs.innerHTML = "";
    createLog("system", "Console cleared.");
});

autoScrollBtn.addEventListener("click", () => {
    autoScroll = !autoScroll;
    autoScrollBtn.textContent = autoScroll
        ? "Auto Scroll ✓"
        : "Auto Scroll ✕";
});

window.addEventListener("beforeunload", () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
    }
});

createLog("system", "Ready. Click Connect to begin.");
