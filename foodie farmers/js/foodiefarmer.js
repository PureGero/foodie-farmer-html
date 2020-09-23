'use strict'

/* Foodie Farmer javascript */

let loginDialogShown = false

// On google sign in
function onSignIn(googleUser) {
  let profile = googleUser.getBasicProfile()

  $.post('/api/signin', 'idtoken=' + googleUser.getAuthResponse().id_token, data => {
    if (loginDialogShown) {
      location.reload()
    }
  })
}

// Check if user is signed in
$.get('/api/customer/get_profile').fail(jqXHR => {
  // The server returns a response code of 400 when not logged in
  if (jqXHR.status == 400) {
    loginDialogShown = true
    $('.login-dialog').modal()
  }
});

// Set active navigation element
let filename = location.pathname.substr(location.pathname.lastIndexOf('/') + 1)
$(`nav a[href="${filename}"]`).parent().addClass('active')

// Load recommended items
if ($('.recommend-items').length) {
  $.get('/api/customer/list_recommend', data => {
    data.forEach(item => {
      $(`<div class="col-sm-6 col-md-6 col-lg-4 mb-4 mb-lg-0" data-aos="fade" data-aos-delay="">
        <a class="block-2-item" href="#">
          <figure class="image" style="background-image: url('${item.image}')"></figure>
          <div class="text">
            <span class="text-uppercase">${item.farm}'s ${item.name}</span>
            <h3>$${item.cost}</h3>
          </div>
        </a>
      </div>`).appendTo('.recommend-items')
    })
  })
}

// Load group purchases
if ($('.group-purchase').length) {
  $.get('/api/customer/list_group_purchases', data => {
    data.forEach(item => {
      $(`<div class="item">
        <div class="block-4 text-center">
          <figure class="block-4-image" style="background-image: url('${item.image}')"></figure>
          <div class="block-4-text p-4">
            <h3><a href="#">${item.name}</a></h3>
            <p class="mb-0">${item.farm}</p>
            <p class="text-primary font-weight-bold">$${item.cost}</p>
          </div>
        </div>
      </div>`).appendTo('.group-purchase')
    })

    let slider = function() {
      $('.group-purchase').owlCarousel({
        center: false,
        items: 1,
        loop: false,
        stagePadding: 15,
        margin: 20,
        nav: true,
        navText: ['<span class="icon-arrow_back">', '<span class="icon-arrow_forward">'],
        responsive:{
          600:{
            margin: 20,
            items: 2
          },
          1000:{
            margin: 20,
            items: 3
          },
          1200:{
            margin: 20,
            items: 3
          }
        }
      })
    }
    slider()
  })
}
