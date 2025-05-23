 // Simple client-side chat logic (demo only)
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');

    // For demo, we assign a static username
    const username = new URLSearchParams(window.location.search).get('username') || 'Guest';

    // Helper: format time as HH:MM
    function formatTime(date) {
      return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    function addMessage(sender, text, time) {
      const msgDiv = document.createElement('div');
      msgDiv.classList.add('message');

      const senderDiv = document.createElement('div');
      senderDiv.classList.add('sender');
      senderDiv.textContent = sender;

      const textDiv = document.createElement('div');
      textDiv.classList.add('text');
      textDiv.textContent = text;

      const timeDiv = document.createElement('div');
      timeDiv.classList.add('time');
      timeDiv.textContent = time;

      msgDiv.appendChild(senderDiv);
      msgDiv.appendChild(textDiv);
      msgDiv.appendChild(timeDiv);

      chatMessages.appendChild(msgDiv);

      // Scroll to bottom
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = chatInput.value.trim();
      if (msg.length === 0) return;

      // Add user message
      addMessage(username, msg, formatTime(new Date()));

      // Clear input
      chatInput.value = '';

      // TODO: Here you would send the message to your signaling server or peer(s)
      // For demo, let's simulate a reply after 1.5 seconds:
      setTimeout(() => {
        addMessage('Support Bot', "Thanks for your message: " + msg, formatTime(new Date()));
      }, 1500);
    });

 // Fullscreen toggle logic
  document.querySelectorAll('.fullscreen-btn').forEach(button => {
    button.addEventListener('click', e => {
      e.stopPropagation();
      const container = button.closest('.video-container');
      if (!container.classList.contains('fullscreen')) {
        container.classList.add('fullscreen');
        // Optionally disable scrolling when fullscreen active
        document.body.style.overflow = 'hidden';
      } else {
        container.classList.remove('fullscreen');
        document.body.style.overflow = '';
      }
    });
  });

  // Optional: exit fullscreen on Escape key
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.video-container.fullscreen').forEach(container => {
        container.classList.remove('fullscreen');
      });
      document.body.style.overflow = '';
    }
  });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /*
    ✅ Explanation:
This line of code creates a new client instance using the Agora Web SDK. The client is the main object used to manage and control communication within a session.

AgoraRTC.createClient() Method:
Purpose:

Creates a new Client object that handles the core functionalities of a video/audio call, such as joining/leaving channels, publishing/unpublishing streams, and managing remote users.

Parameters:
It takes a configuration object with two properties:

mode:

"rtc" (Real-Time Communication): Used for real-time communication with lower latency and more reliability, suitable for live video calling.

"live": Used for live broadcasting, where one or more hosts interact with a larger audience.

codec:

Specifies the video codec to be used. Common values are:

"vp8": Open-source video codec supported by most browsers. It is widely used for real-time video communications.

"h264": Advanced video codec with better compression but may have licensing concerns.

Example Breakdown:
Mode: "rtc"

This is used for real-time video/audio calling with low latency and minimal packet loss.

Codec: "vp8"

VP8 is chosen here as the video codec. It is suitable for most browsers and provides good performance for real-time communication.

✅ Why VP8 and Not H264?
VP8:

Open-source, no licensing fees.

Widely supported by browsers like Chrome and Firefox.

Optimized for real-time communication.

H264:

Better compression efficiency, but may have licensing fees.

Supported by older devices and certain hardware decoders.

 */

// Provide your Agora credentials
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
const APP_ID = "b6fb6db28ea14b70baf5cd6a448e1f61";
const CHANNEL = sessionStorage.getItem('room')
const TOKEN = sessionStorage.getItem('token')
const UID = Number(sessionStorage.getItem('UID'))
const USERNAME = sessionStorage.getItem('username')
// Update usernames map with own username & uid

let localTracks = [];
let remoteUsers = {};

// Initialize Agora client
const joinAndDisplayLocalStream = async () => {
  document.getElementById("room-name").innerText = CHANNEL;

  client.on('user-published', handleJoin);
  client.on('user-left', handleleft);

  try {
    await client.join(APP_ID, CHANNEL, TOKEN, UID);
  } catch (error) {
    console.error("Error joining channel:", error);
    window.open('/', '_self');
  }

  localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

  let member = await createMember()
  // Create video container with fullscreen button
  const playerHTML = `
    <div class="video-container" id="container-${UID}">
      <div class="video-player" id="user-${UID}"></div>
      <div class="username-wrapper">
        <div class="icon"></div>
        <div class="username">${member.name}</div>
      </div>
      <button class="fullscreen-btn" data-uid="${UID}" aria-label="Toggle fullscreen">⛶</button>
    </div>
  `;

  document.getElementById("videoSection").insertAdjacentHTML("beforeend", playerHTML);

  localTracks[1].play(`user-${UID}`);
  await client.publish([localTracks[0], localTracks[1]]);
  console.log("Local stream published successfully");

  // Fullscreen functionality
  const container = document.getElementById(`container-${UID}`);
  const fullscreenBtn = container.querySelector('.fullscreen-btn');

  fullscreenBtn.addEventListener('click', () => {
    container.classList.toggle('fullscreen');
    document.body.style.overflow = container.classList.contains('fullscreen') ? 'hidden' : '';
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      container.classList.remove('fullscreen');
      document.body.style.overflow = '';
    }
  });
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let handleJoin = async (user, mediaType) => {
  remoteUsers[user.uid] = user;
  await client.subscribe(user, mediaType);

  if (mediaType === 'video') {
    let existingPlayer = document.getElementById(`container-${user.uid}`);
    if (existingPlayer) {
      existingPlayer.remove();
    }

    let member = await getMember(user)
    const playerHTML = `
      <div class="video-container" id="container-${user.uid}">
        <div class="video-player" id="user-${user.uid}"></div>
        <div class="username-wrapper">
          <div class="icon"></div>
          <div class="username">${member.name}</div>
        </div>
        <button class="fullscreen-btn" data-uid="${user.uid}" aria-label="Toggle fullscreen">⛶</button>
      </div>
    `;

    document.getElementById("videoSection").insertAdjacentHTML("beforeend", playerHTML);

    user.videoTrack.play(`user-${user.uid}`);

    // Attach fullscreen event listener after insertion
    const container = document.getElementById(`container-${user.uid}`);
    const fullscreenBtn = container.querySelector('.fullscreen-btn');

    fullscreenBtn.addEventListener('click', () => {
      container.classList.toggle('fullscreen');
      document.body.style.overflow = container.classList.contains('fullscreen') ? 'hidden' : '';
    });

    // Escape key exits fullscreen
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        container.classList.remove('fullscreen');
        document.body.style.overflow = '';
      }
    });
  }

  if (mediaType === 'audio') {
    user.audioTrack.play();
  }
};

let handleleft = async (user) => {
  delete remoteUsers[user.uid];
  document.getElementById(`user-container-${user.uid}`).remove();
  console.log("User left the channel:", user.uid);
  
}

const controlBtns = document.getElementById("controlBtns");

const leaveAndRemoveLocalStream = async () => {
  console.log("Leave button clicked");

  for (let track of localTracks) {
    track.close();
  }

  await client.leave();
  deleteMember()
  console.log("Left the channel");

  const userContainer = document.getElementById(`user-container-${UID}`);
  if (userContainer) userContainer.remove();

  window.open('/', '_self');
};


const toggleCamera = async (btn) => {
  console.log("Camera button function triggered");

  if (!localTracks[1]) {
    console.warn("Video track not initialized");
    return;
  }

  const isMuted = localTracks[1].muted;
  console.log("Current Camera State:", isMuted);

  await localTracks[1].setMuted(!isMuted);

  const icon = btn.querySelector("i");
  console.log("Camera icon before change:", icon.className);

  if (isMuted) {
    icon.classList.replace("bi-camera-video-off", "bi-camera-video");
    btn.classList.replace("btn-danger", "btn-secondary");
  } else {
    icon.classList.replace("bi-camera-video", "bi-camera-video-off");
    btn.classList.replace("btn-secondary", "btn-danger");
  }

  console.log("Camera icon after change:", icon.className);
};




const toggleMute = async (btn) => {
  console.log("Mute button function triggered");

  if (!localTracks[0]) {
    console.warn("Audio track not initialized");
    return;
  }

  const isMuted = localTracks[0].muted;
  console.log("Current Mute State:", isMuted);

  await localTracks[0].setMuted(!isMuted);

  const icon = btn.querySelector("i");
  console.log("Mute icon before change:", icon.className);

  if (isMuted) {
    icon.classList.replace("bi-mic-mute", "bi-mic");
    btn.classList.replace("btn-danger", "btn-secondary");
  } else {
    icon.classList.replace("bi-mic", "bi-mic-mute");
    btn.classList.replace("btn-secondary", "btn-danger");
  }

  console.log("Mute icon after change:", icon.className);
};



// Event Delegation with Debugging
controlBtns.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  console.log("Button Clicked:", btn); // Debugging log
  
  if (!btn) {
    console.warn("Click event not on a button.");
    return;
  }

  const action = btn.dataset.action;
  console.log("Action detected:", action); // Debugging log

  switch (action) {
    case "mute":
      console.log("Mute Button Clicked");
      toggleMute(btn);
      break;
    case "camera":
      console.log("Camera Button Clicked");
      toggleCamera(btn);
      break;
    case "leave":
      console.log("Leave Button Clicked");
      leaveAndRemoveLocalStream();
      break;
    default:
      console.warn("Unknown action:", action);
  }
});

let createMember = async () =>{
  let response = await fetch('/create_member/', {
    method:'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body:JSON.stringify({'name':USERNAME, 'room_name':CHANNEL,'UID':UID})
  })
  let member = await response.json()
  return member
}

let deleteMember = async () =>{
  let response = await fetch('/delete_member/', {
    method:'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body:JSON.stringify({'name':USERNAME, 'room_name':CHANNEL,'UID':UID})
  })
  let member = await response.json()
}

let getMember = async (user) =>{
  let response = await fetch(`/get_member/?UID=${user.uid}&room_name=${CHANNEL}`)
  let member = await response.json()
  return member
}

 // Call the function to join and display the local stream
joinAndDisplayLocalStream();

window.addEventListener("beforeunload", function (event) {
  // Perform cleanup actions here
  leaveAndRemoveLocalStream();
  deleteMember()
});