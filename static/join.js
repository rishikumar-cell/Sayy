const joinForm = document.getElementById('joinForm');

    joinForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const username = document.getElementById('username').value.trim();
      const room = document.getElementById('room').value.trim();

      if (!username || !room) {
        alert('Please fill in both your name and room name.');
        return;
      }

      // Redirect or initiate the video chat join logic
      // For example, redirect to /room.html?username=xxx&room=yyy
      const params = new URLSearchParams({ username, room });
      window.location.href = 'room.html?' + params.toString();
    });