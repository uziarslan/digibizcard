 // JavaScript for fetching and rendering user data in the modal
 $('#myModal').on('show.bs.modal', function(event) {
    var button = $(event.relatedTarget); 
    var userId = button.data('user-id'); 
    var modal = $(this);

    // AJAX request to fetch user data
    $.ajax({
      url: '/users/' + userId, 
      method: 'GET',
      success: function(userData) {
       
        var modalUserData = $('#modalUserData');
        modal.find('.personNamePost').text(userData.firstName + ' ' + userData.lastName);
        modal.find('.locationAdress').text(userData.location + ', Pakistan');
        modal.find('.innertext').text(userData.about);
        modal.find('.aboutPostPersonImg img').attr('src', userData.profilePicture);

        modal.find('#modalvideo').attr('src', userData.video);
        // Split skills string into an array
        var skills = userData.skills

        // Display skills
        var skillsHTML = '';
        skills.forEach(function(skill) {
          skillsHTML += '<div class="homeIndvidualTag">' + skill.trim() + '</div>'; 
        });
        modal.find('.fixtagBelowPost').html(skillsHTML);
        // Set recipient user ID as a data attribute on the message button
        var messageButton = modal.find('.messageButton');
        messageButton.attr('data-recipient-id', userData._id); 
      },
      error: function(xhr, status, error) {
        // Handle error
        console.error(error);
      }
    });
  });

