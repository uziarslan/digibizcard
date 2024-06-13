function mute() {
    let isMuted = false;

    function toggleMute() {
      let vi = document.getElementById("modalvideo");
      isMuted = !isMuted; // Toggle the muted state
      vi.muted = isMuted;
    }

    function muteOrUnmute() {
      let vi = document.getElementById("modalvideo");

      if (vi.muted) {
        // If currently muted, unmute
        vi.muted = false;
        isMuted = false;
      } else {
        // If currently not muted, mute
        vi.muted = true;
        isMuted = true;
      }
    }

    // Example of usage (e.g., bind this function to a button click)
    muteOrUnmute();




  }
  let currentSelected;

  // Set the initial color for the first SVG
  document.getElementById("svg1").style.fill = "#5C47CD";
  currentSelected = "svg1";

  function changeColor(element) {
    const clickedId = element.querySelector('svg').id;

    if (currentSelected !== clickedId) {
      // Reset color for the previously selected SVG
      document.getElementById(currentSelected).style.fill = "#0E0D15";

      // Change color for the clicked SVG
      element.querySelector('svg').style.fill = "#5C47CD";
      currentSelected = clickedId;
    }
  }

  // to add tag

  document.addEventListener('DOMContentLoaded', function () {
    var dropDownContent = document.getElementById('dropdownContent');
    var homeTags = document.querySelector('.homeTags');

    document.getElementById('dropdownLabel').addEventListener('hover', function () {
      dropDownContent.style.display = (dropDownContent.style.display === 'block') ? 'none' : 'block';
    });

    dropDownContent.addEventListener('click', function (event) {
      if (event.target.tagName === 'P') {
        var tagName = event.target.textContent.trim();
        var newTag = document.createElement('div');
        newTag.className = 'homeIndvidualTag';
        newTag.textContent = tagName;
        homeTags.appendChild(newTag);
      }
    });
  });

  // 


  var video1 = document.getElementById('videoPlayer');
  var video2 = document.getElementById('videoPlayer2');
  var isPlaying1 = false;
  var isPlaying2 = false;

  // Set up Intersection Observer for videoPlayer 
  var observer1 = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        if (!isPlaying1) {
          video1.play();
          isPlaying1 = true;
        }
      } else {
        if (isPlaying1) {
          video1.pause();
          isPlaying1 = false;
        }
      }
    });
  }, { threshold: 0.5 });

  observer1.observe(video1);

  // Set up Intersection Observer for videoPlayer2
  var observer2 = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        if (!isPlaying2) {
          video2.play();
          isPlaying2 = true;
        }
      } else {
        if (isPlaying2) {
          video2.pause();
          isPlaying2 = false;
        }
      }
    });
  }, { threshold: 0.5 });

  observer2.observe(video2);

  // Toggle mute/unmute on videoPlayer click
  video1.addEventListener('click', function () {
    video1.muted = !video1.muted;
  });

  // Toggle mute/unmute on videoPlayer2 click
  video2.addEventListener('click', function () {
    video2.muted = !video2.muted;
  });




