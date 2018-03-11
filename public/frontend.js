//Jquery button handlers

//Login Modal Handler
$('#login').on('click', function(event) {
	event.preventDefault();
	$('.login-modal').fadeIn('slow');
});

//keep focus on login modal
$('#login button').submit(function(event) {
	event.preventDefault();
	$('#user').focus();
	$('.login-modal').fadeOut('slow');
});

//Hamburger Menu Handler (mobile)
$("#nav-toggle").click(function(){
  $('nav').slideToggle('300');
  $('nav a').on('click', function(event) {
  	$('nav').slideUp('300');
  });
});

//Emotion-Activity Buttons
$('.new-mood label').click(function(){
    $(this).addClass('selected').siblings().removeClass('selected');
});

$('.new-mood input').click(function(){
    $(this).attr('checked', true);
});

$('.new-activity label').click(function(){
    $(this).addClass('selected').siblings().removeClass('selected');
});

$('.new-activity input').click(function(){
    $(this).attr('checked', true);
});

//CSS TRICKS Smooth scroll
  // Select all links with hashes
  $('a[href*="#"]')
    // Remove links that don't actually link to anything
    .not('[href="#"]')
    .not('[href="#0"]')
    .click(function(event) {
      // On-page links
      if (
        location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') 
        && 
        location.hostname == this.hostname
      ) {
        // Figure out element to scroll to
        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
        // Does a scroll target exist?
        if (target.length) {
          // Only prevent default if animation is actually gonna happen
          event.preventDefault();
          $('html, body').animate({
            scrollTop: target.offset().top - 50
          }, 1000, function() {
            // Callback after animation
            // Must change focus!
            var $target = $(target);
            $target.focus();
            if ($target.is(":focus")) { // Checking if the target was focused
              return false;
            } else {
              $target.attr('tabindex','-1'); // Adding tabindex for elements not focusable
              $target.focus(); // Set focus again
            };
          });
        }
      }
    });