const socket = io();

let localStream;
const constraints = { video: true, audio: true };

navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
        localStream = stream;
    // Display local video feed
        const localVideo = document.getElementById('local-video');
        localVideo.srcObject = stream;
    })
    .catch((error) => {
        console.error('Error accessing media devices:', error);
    });

// Offer to start video call
document.getElementById('start-call').addEventListener('click', () => {
    const peerConnection = new RTCPeerConnection();

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.createOffer()
    .then((offer) => {
        return peerConnection.setLocalDescription(offer);
    })
    .then(() => {
        socket.emit('offer', peerConnection.localDescription, RECEIVER_ID);
    })
    .catch((error) => {
        console.error('Error creating offer:', error);
    });

  // Handle remote stream and ICE candidates
    peerConnection.ontrack = (event) => {
        const remoteVideo = document.getElementById('remote-video');
        remoteVideo.srcObject = event.streams[1];
        
    };

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
        socket.emit('ice-candidate', event.candidate, RECEIVER_ID);
    }
    };
});

// Handle receiving offer and sending answer
socket.on('offer', (offer, senderId) => {
    const peerConnection = new RTCPeerConnection();

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.setRemoteDescription(offer)
    .then(() => {
        return peerConnection.createAnswer();
    })
    .then((answer) => {
        return peerConnection.setLocalDescription(answer);
    })
    .then(() => {
        socket.emit('answer', peerConnection.localDescription, senderId);
    })
    .catch((error) => {
        console.error('Error creating answer:', error);
    });

  // Handle remote stream and ICE candidates
    peerConnection.ontrack = (event) => {
    const remoteVideo = document.getElementById('remote-video');
    remoteVideo.srcObject = event.streams[0];
    };

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', event.candidate, senderId);
        }
    };
});

// Handle receiving answer
socket.on('answer', (answer) => {
    peerConnection.setRemoteDescription(answer)
    .catch((error) => {
        console.error('Error setting remote description:', error);
    });
});

// Handle receiving ICE candidates
socket.on('ice-candidate', (candidate) => {
  peerConnection.addIceCandidate(candidate)
    .catch((error) => {
      console.error('Error adding ICE candidate:', error);
    });
});
