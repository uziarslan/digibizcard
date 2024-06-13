function likePost(postId) {
    fetch(`/organization/like/${postId}`, {
      method: 'POST',
    })
      .then(response => {
        if (response.ok) {
          return response.json(); // Parse response body as JSON
        } else {
          throw new Error('Failed to update like count');
        }
      })
      .then(data => {
        // Update the like count displayed on the page
        const likeCountElement = document.getElementById(`likeCount_${postId}`);
        if (likeCountElement) {
          likeCountElement.textContent = data.likesCount;
        }
      })
      .catch(error => {
        console.error('Error:', error);
        // Handle error
      });
  }
  function savePost(postId) {
    // Send a POST request to the server to save the post
    fetch(`/organization/save/${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })
      .then(response => {
        if (response.ok) {
          // Handle success, update the saved count displayed on the page
          const savedCountElement = document.getElementById(`savedCount_${postId}`);
          if (savedCountElement) {
            // Increment the saved count
            savedCountElement.textContent = parseInt(savedCountElement.textContent) + 1;
          }
        } else {
          // Handle error
          console.error('Failed to save post');
        }
      })
      .catch(error => {
        console.error('Error saving post:', error);
      });
  }