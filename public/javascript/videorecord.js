
document.addEventListener('DOMContentLoaded', () => {
  const startRecordingButton = document.getElementById('start-recording-button');
  const timerElement = document.getElementById('timer');
  const liveVideoFeed = document.getElementById('liveVideoFeed');
  const recordedVideo = document.getElementById('recorded-video');
  const reviewButton = document.getElementById('reviewButton');
  const uploadButton = document.getElementById('uploadButton');
  const recordingStatus = document.getElementById('recordingStatus');
  const videoForm = document.getElementById('videoForm');
  let mediaRecorder;
  let chunks = [];
  let countdown;
  let stream;

  async function startRecording() {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });

    // Display the live video feed
    liveVideoFeed.style.display = 'block';
    
    // Create a new video element for the live feed
    
    const liveVideoElement = document.createElement('video');
    liveVideoElement.autoplay = true;
    liveVideoElement.srcObject = stream;
    liveVideoElement.style.width = '100%';
  liveVideoElement.style.height = '100%';
  liveVideoElement.style.objectFit = 'cover';
    
    // Append the live video element to the liveVideoFeed div
    liveVideoFeed.innerHTML = '';
    liveVideoFeed.appendChild(liveVideoElement);
    liveVideoFeed.innerHTML = '';
    liveVideoFeed.appendChild(liveVideoElement);
    mediaRecorder = new MediaRecorder(stream);
    chunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(blob);
      recordedVideo.src = videoUrl;
      recordedVideo.style.display = 'block';
      
      // Stop the camera stream
      stopCamera();
      
      // Display recorded video in liveVideoFeed
      displayRecordedVideo();
      recordingStatus.textContent = 'Review';
      reviewButton.style.display = 'inline-block';
      uploadButton.style.display = 'inline-block';
      startRecordingButton.style.display="none"
    };

    mediaRecorder.start();

    // Set a timer for 1 minute
    let secondsRemaining = 60;
    countdown = setInterval(() => {
      secondsRemaining--;
      const minutes = Math.floor(secondsRemaining / 60);
      const seconds = secondsRemaining % 60;
      timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

      if (secondsRemaining <= 0) {
        stopRecording();
      }
    }, 1000);
  }

  function stopRecording() {
    clearInterval(countdown);
    mediaRecorder.stop();
  }

  function stopCamera() {
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
  }

  function displayRecordedVideo() {
    // Set properties to ensure the recorded video fits within liveVideoFeed
    recordedVideo.style.width = '100%';
    recordedVideo.style.height = '100%';
    recordedVideo.style.objectFit = 'cover';
    
    // Display recorded video in liveVideoFeed
    liveVideoFeed.innerHTML = '';
    liveVideoFeed.appendChild(recordedVideo);
  }

  startRecordingButton.addEventListener('click', startRecording);
 
  uploadButton.addEventListener('click', async () => {
    // Create a Blob from the recorded video source
    const blob = await fetch(recordedVideo.src).then(response => response.blob());
  
    // Create a FormData object and append the Blob
    const formData = new FormData();
    formData.append('video', blob, 'recorded-video.webm');

    // Send a POST request to the /save-video endpoint
    try {
      const response = await fetch('/save-video', {
        method: 'POST',
        body: formData,
        headers: {
          // 'Content-Type': 'multipart/form-data', // Keep this line
        },
      });

      if (response.ok) {
        console.log('Video uploaded successfully');
        window.location.href = '/video-success';
      } else {
        console.error('Error uploading video');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
    }
  });
});
  