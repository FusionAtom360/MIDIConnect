document.addEventListener("DOMContentLoaded", () => {
  let socket;
  let sendMIDI = false;
  let receiveMIDI = false;
  let midiAccess = null;
  let selectedInputDevice = null;
  let selectedOutputDevice = null;
  let realtime = localStorage.getItem("realtime") === "true";
  let latency = 0;
  let latencySum = 0;
  let maxLatency = 0;
  let clockOffset = 0;
  let setDelay = 0;
  let numPings = 0;
  let virtualPlaybackEnabled = false;
  let userId = generateUserId();
  let loopback = false;

  const virtualInstrument = new VirtualInstrument();

  const playbackToggle = document.getElementById("virtualPlaybackToggle");
  playbackToggle.addEventListener("change", () => {
    virtualPlaybackEnabled = playbackToggle.checked;
  });

  const usernameField = document.getElementById("username");
  usernameField.placeholder = userId;
  if (localStorage.getItem("username") === "") {
    username = userId;
  } else {
    username = localStorage.getItem("username");
    usernameField.value = username;
  }

  const loopbackToggle = document.getElementById("loopbackToggle");
  loopbackToggle.addEventListener("change", () => {
    loopback = loopbackToggle.checked;
  });

  const realtimeToggle = document.getElementById("realtimeToggle");
  realtimeToggle.checked = realtime;
  realtimeToggle.addEventListener("change", () => {
    realtime = realtimeToggle.checked;
    localStorage.setItem("realtime", realtime);
    console.log(`Realtime: ${realtime}`);
  });

  document.getElementById("username").addEventListener("input", (event) => {
    if (event.target.value.trim() === "") {
      username = userId;
      localStorage.setItem("username", "");
    } else {
      username = event.target.value.trim();
      localStorage.setItem("username", username);
    }

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "updateUsername", userId, username }));
      console.log(username);
    }
  });

  setupWebSocket();

  document.getElementById("sendMIDI").addEventListener("change", (event) => {
    sendMIDI = event.target.checked;
    updateAppRole();
  });

  document.getElementById("receiveMIDI").addEventListener("change", (event) => {
    receiveMIDI = event.target.checked;
    updateAppRole();
  });

  function updateAppRole() {
    if (socket && socket.readyState === WebSocket.OPEN) {
      if (sendMIDI) {
        socket.send(
          JSON.stringify({ type: "subscribe", action: "send", userId: userId })
        );
      } else {
        socket.send(
          JSON.stringify({
            type: "unsubscribe",
            action: "send",
            userId: userId,
          })
        );
      }

      if (receiveMIDI) {
        socket.send(
          JSON.stringify({
            type: "subscribe",
            action: "receive",
            userId: userId,
          })
        );
      } else {
        socket.send(
          JSON.stringify({
            type: "unsubscribe",
            action: "receive",
            userId: userId,
          })
        );
      }
    }

    if (sendMIDI || receiveMIDI) {
      initializeApp();
    } else {
      console.log("No MIDI action selected.");
      document.getElementById("midiSettings").style.display = "none";
    }
  }

  function initializeApp() {
    console.log(
      "MIDI Action selected:",
      sendMIDI ? "Send MIDI" : "",
      receiveMIDI ? "Receive MIDI" : ""
    );

    setupMIDI();

    document.getElementById("midiSettings").style.display = "block";
    document.getElementById("midiInputDiv").style.display = sendMIDI
      ? "block"
      : "none";
    document.getElementById("midiOutputDiv").style.display = receiveMIDI
      ? "block"
      : "none";
  }

  function pingServer() {
    const currentTime = Date.now();
    numPings++;
    socket.send(JSON.stringify({ type: "ping", clientSendTime: currentTime }));
  }

  function getClockOffset(data) {
    let oneLatency = Math.floor(latency / 2);
    let systemSyncedTime = Date.now() + clockOffset;
    let serverSyncedTime = data.serverTime + oneLatency;
    console.log(
      `System est. time: ${systemSyncedTime}\nServer est. time: ${serverSyncedTime}\nDifference: ${
        serverSyncedTime - systemSyncedTime
      }\nClock Offset: ${clockOffset}`
    );
    clockOffset = data.serverTime - Date.now() + oneLatency;
  }

  function setupWebSocket() {
    //socket = new WebSocket("ws://192.168.68.144:8080");
    socket = new WebSocket("https://midiconnect.onrender.com");

    socket.onopen = () => {
      console.log(`Connected to ${socket.url}`);

      if (reconnectInterval) {
        clearInterval(reconnectInterval);
        reconnectInterval = null;
      }

      document.getElementById("connectionStatus").textContent = "Connected";
      document.getElementById("connectionStatus").style.color = "green";

      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({ type: "updateUsername", userId, username })
        );
        setTimeout(pingServer, 500);
        setInterval(pingServer, 5000);
      }

      updateAppRole();
    };

    socket.onmessage = (event) => {
      let data = JSON.parse(event.data);

      if (data.type === "participantCount") {
        document.getElementById("connectedUsers").textContent = data.count;
      } else if (data.type === "pingResponse") {
        latencySum += Date.now() - data.clientSendTime;
        latency = Math.floor(latencySum / numPings);
        getClockOffset(data);
        document.getElementById("latency").textContent = `${latency}ms`;
        if (latency > maxLatency) {
          maxLatency = latency;
          setDelay = maxLatency * 2;
          document.getElementById("latency").title = `Delay: ${setDelay}ms`;
        }
      } else if (data.type === "userData") {
        let usernames = Object.values(data.users).join(", ");
        document.getElementById("connectedUsers").title = usernames;
      } else if (data.type === "chatMessage") {
        addToChat(data.username, data.message);
      } else {
        handleIncomingMIDI(data);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
      retryConnection();
    };

    socket.onclose = () => {
      console.log("WebSocket Connection Closed");

      document.getElementById("connectionStatus").textContent = "Disconnected";
      document.getElementById("connectionStatus").style.color = "red";

      retryConnection();
    };
  }

  let reconnectInterval = null;

  function retryConnection() {
    if (reconnectInterval) return;
    console.log("Attempting to reconnect...");

    reconnectInterval = setInterval(() => {
      if (!socket || socket.readyState === WebSocket.CLOSED) {
        setupWebSocket();
      } else {
        clearInterval(reconnectInterval);
        reconnectInterval = null;
      }
    }, 5000);
  }

  function setupMIDI() {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    } else {
      console.error("WebMIDI API not supported in this browser.");
    }
  }

  function onMIDISuccess(midi) {
    midiAccess = midi;

    const midiInputDeviceSelect = document.getElementById(
      "midiInputDeviceSelect"
    );
    const midiOutputDeviceSelect = document.getElementById(
      "midiOutputDeviceSelect"
    );

    if (sendMIDI) {
      midiAccess.inputs.forEach((input) => {
        if (
          !midiInputDeviceSelect.querySelector(`option[value="${input.id}"]`)
        ) {
          const option = document.createElement("option");
          option.value = input.id;
          option.textContent = input.name;
          midiInputDeviceSelect.appendChild(option);
        }
      });
    }

    if (receiveMIDI) {
      midiAccess.outputs.forEach((output) => {
        if (
          !midiOutputDeviceSelect.querySelector(`option[value="${output.id}"]`)
        ) {
          const option = document.createElement("option");
          option.value = output.id;
          option.textContent = output.name;
          midiOutputDeviceSelect.appendChild(option);
        }
      });
    }

    midiInputDeviceSelect.removeEventListener(
      "change",
      inputDeviceChangeHandler
    );
    midiInputDeviceSelect.addEventListener("change", inputDeviceChangeHandler);

    midiOutputDeviceSelect.removeEventListener(
      "change",
      outputDeviceChangeHandler
    );
    midiOutputDeviceSelect.addEventListener(
      "change",
      outputDeviceChangeHandler
    );
  }

  function onMIDIFailure() {
    console.error("Could not access MIDI devices.");
  }

  function addToLog(message) {
    const logContent = document.getElementById("logContent");
    const newLogEntry = document.createElement("p");
    newLogEntry.textContent = message;
    logContent.insertBefore(newLogEntry, logContent.firstChild);
    logContent.scrollTop = 0;
  }

  function handleMIDIMessage(message) {
    if (!sendMIDI || !selectedInputDevice) return;

    const [command, note, velocity] = message.data;
    if (command === 254) return;

    const midiMessage = `MIDI from ${selectedInputDevice.name} - Command: ${command}, Note: ${note}, Velocity: ${velocity}`;
    //console.log(midiMessage);
    addToLog(midiMessage);

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "midi",
          command,
          note,
          velocity,
          userId,
          timestamp: Date.now() + clockOffset,
        })
      );
      console.log("MIDI message sent via WebSocket");
    } else {
      console.error("WebSocket is not open. Cannot send MIDI message.");
    }
  }

  function handleIncomingMIDI(data) {
    if (data.userId === userId && loopback === false) return;

    if (!receiveMIDI) return;

    if (selectedOutputDevice) {
      if (realtime) {
        selectedOutputDevice.send([data.command, data.note, data.velocity]);
        console.log("MIDI message sent to output device (realtime)");
      } else {
        let targetTime = data.timestamp;
        let singleDelay = targetTime - (Date.now() + clockOffset) + setDelay;
        setTimeout(() => {
          selectedOutputDevice.send([data.command, data.note, data.velocity]);
          console.log("MIDI message sent to output device (delayed)");
        }, singleDelay);
      }
      const midiMessage = `MIDI from ${data.username} to ${selectedOutputDevice.name} - Command: ${data.command}, Note: ${data.note}, Velocity: ${data.velocity}`;
      //console.log(midiMessage);
      addToLog(midiMessage);
    }

    if (virtualPlaybackEnabled) {
      virtualInstrument.handleMidiMessage(data);
      console.log("MIDI Message sent to VST");
      const midiMessage = `MIDI from ${data.username} to Virtual Playback - Command: ${data.command}, Note: ${data.note}, Velocity: ${data.velocity}`;
      console.log(midiMessage);
      addToLog(midiMessage);
    }
  }

  function inputDeviceChangeHandler(event) {
    const inputId = event.target.value;

    if (selectedInputDevice && selectedInputDevice.id !== inputId) {
      selectedInputDevice.onmidimessage = null;
      console.log(
        `Stopped listening for messages from ${selectedInputDevice.name}`
      );
    }

    selectedInputDevice = midiAccess.inputs.get(inputId);
    console.log(
      `Input Device selected: ${
        selectedInputDevice ? selectedInputDevice.name : "None"
      }`
    );

    if (selectedInputDevice && sendMIDI) {
      selectedInputDevice.onmidimessage = (message) =>
        handleMIDIMessage(message);
      console.log(`Listening for messages from ${selectedInputDevice.name}`);
    }
  }

  function outputDeviceChangeHandler(event) {
    const outputId = event.target.value;
    selectedOutputDevice = midiAccess.outputs.get(outputId);
    console.log(
      `Output Device selected: ${
        selectedOutputDevice ? selectedOutputDevice.name : "None"
      }`
    );
  }

  function generateUserId() {
    return `${Math.random().toString(36).substring(2, 5)}-${Date.now()}`;
  }

  const chatContainer = document.getElementById("chatContainer");
  const chatToggle = document.getElementById("chatToggle");

  chatToggle.addEventListener("change", () => {
    if (chatToggle.checked)
      chatContainer.style.display = "block";
    else chatContainer.style.display = "none";
  });

  const chatInput = document.getElementById("chatInput");
  const sendChatButton = document.getElementById("sendChatButton");

  sendChatButton.addEventListener("click", () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const message = chatInput.value.trim();
      if (message) {
        socket.send(JSON.stringify({ type: "chatMessage", userId, message }));
        chatInput.value = "";
      }
    }
  });

  chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      sendChatButton.click();
    }
  });

  function addToChat(username, message) {
    const chatContent = document.getElementById("chatContent");
    const newChatEntry = document.createElement("p");
    newChatEntry.textContent = `${username}: ${message}`;
    chatContent.appendChild(newChatEntry);
    chatContent.scrollTop = chatContent.scrollHeight;
  }
  






});
