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
/*$.get('/api/customer/get_profile').fail(jqXHR => {
  // The server returns a response code of 400 when not logged in
  if (jqXHR.status == 400) {
    loginDialogShown = true
    $('.login-dialog').modal()
  }
})*/

// Returns the price formatted in the local currency
//  eg $2.00 or 200￥
function formatPrice(price) {
  return '$' + price.toFixed(2)
}

// Set active navigation element
let filename = location.pathname.substr(location.pathname.lastIndexOf('/') + 1)
$(`nav a[href="${filename}"]`).parent().addClass('active')

// Load shop single item
if ($('.shop-single').length) {
  let id = new URLSearchParams(window.location.search).get('id')
  $.get(`/api/customer/get_produce?id=${id}`, items => {
    items.forEach(item => {
      $('.item-name').text(item.name)
      $('.item-picture').css('background-image', `url('${item.picture}')`)
      $('.item-description').text(item.description)
      $('.item-price').text(formatPrice(item.price))
      $('.item-detail').text('$' + item.detail)
      $('.item-rating').text('$' + item.rating)
      $('.item-comment').text('$' + item.comment)
      $('.item-farm').text(item.farm + ', ' + item.location)
    })
  })
}

// Load shop group item
if ($('.shop-group').length) {
  let id = new URLSearchParams(window.location.search).get('id')
  $.get(`/api/customer/get_group_items?id=${id}`, items => {
    items.forEach(item => {
      $('.item-name').text(item.name)
      $('.item-picture').css('background-image', `url('${item.picture}')`)
      $('.item-description').text(item.description)
      $('.product__price-del').text(formatPrice(item.price))
      $('.product__price-reg').text(formatPrice(item.price - item.maxDiscount))
      $('.item-detail').text('$' + item.detail)
      $('.item-rating').text('$' + item.rating)
      $('.item-comment').text('$' + item.comment)
      $('.item-farm').text(item.farm + ', ' + item.location)
      $('.item-remaining').text(`${item.remaining} of ${item.capacity} remaining`)
      $('.product__tag--discount').text(`-${(item.maxDiscount/item.price*100).toFixed(0)}%`)
      countDownDate = new Date(item.endTime)
    })
  })
}

// Load recommended items
if ($('.recommend-items').length) {
  $.get('/api/customer/list_recommend', items => {
    items.forEach(item => {
      $(`<div class="col-sm-6 col-md-6 col-lg-4 mb-4 mb-lg-0" data-aos="fade" data-aos-delay="">
        <a class="block-2-item" href="shop-single.html?id=${item.id}">
          <figure class="image" style="background-image: url('${item.image}')"></figure>
          <div class="text">
            <span class="text-uppercase">${item.farm}'s ${item.name}</span>
            <h3>${formatPrice(item.price)}</h3>
          </div>
        </a>
      </div>`).appendTo('.recommend-items')
    })
  })
}



// Load produce items
if ($('.produce-items').length) {
  $.get('/api/customer/get_produce', items => {
    items.forEach(item => {
      $(`<div class="col-sm-6 col-lg-4 mb-4" data-aos="fade-up">
        <div class="block-4 text-center border">
          <figure class="block-4-image" style="background-image: url('${item.picture}')"></figure>
          <div class="block-4-text p-4">
            <h3><a href="shop-single.html?id=${item.id}">${item.name}</a></h3>
            <p class="mb-0">${item.description}</p>
            <p class="text-primary font-weight-bold">${formatPrice(item.price)}</p>
          </div>
        </div>
      </div> `).appendTo('.produce-items')
    })
  })
}

// Load group items
if ($('.group-items').length) {
  $.get('/api/customer/get_group_items', items => {
    items.forEach(item => {
      $(`<div class="col-sm-6 col-lg-4 mb-4" data-aos="fade-up">
        <div class="block-4 text-center border">
          <figure class="block-4-image" style="background-image: url('${item.picture}')"></figure>
          <div class="block-4-text p-4">
            <h3><a href="shop-group.html?id=${item.id}">${item.name}</a></h3>
            <p class="mb-0">${item.description}</p>
            <p class="text-primary font-weight-bold">
              <span class="product__price-del">${formatPrice(item.price)}</span>
              <span class="product__price-reg">${formatPrice(item.price - item.maxDiscount)}</span>
            </p>
          </div>
        </div>
      </div> `).appendTo('.group-items')
    })
  })
}

// Load group purchases
if ($('.group-purchase').length) {
  $.get('/api/customer/get_group_items?limit=6', items => {
    items.forEach(item => {
      $(`<div class="item">
        <div class="block-4 text-center">
          <figure class="block-4-image" style="background-image: url('${item.picture}')"></figure>
          <div class="block-4-text p-4">
            <h3><a href="shop-group.html?id=${item.id}">${item.name}</a></h3>
            <p class="mb-0">${item.farm}</p>
            <p class="text-primary font-weight-bold">
              <span class="product__price-del">${formatPrice(item.price)}</span>
              <span class="product__price-reg">${formatPrice(item.price - item.maxDiscount)}</span>
            </p>
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

// Load featured items
if ($('.featured-items').length) {
  $.get('/api/customer/list_recommend?count=6', items => {
    items.forEach(item => {
      $(`<div class="item">
          <div class="block-4 text-center">
            <figure class="block-4-image" style="background-image: url('${item.image}')"></figure>
            <div class="block-4-text p-4">
              <h3><a href="shop-single.html?id=${item.id}">${item.name}</a></h3>
              <small class="mb-0">${item.farm}, ${item.location}</small>
              <p class="mb-0">${item.description}</p>
              <p class="text-primary font-weight-bold">${formatPrice(item.price)}</p>
            </div>
          </div>
        </div>`).appendTo('.featured-items')
    })

    let slider = function() {
      $('.featured-items').owlCarousel({
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

//add items to HTML5 storage
function AddItem() {

  var name = document.getElementsByClassName("text-black item-name")[0].innerHTML
  var quanitity = document.getElementsByClassName("form-control text-center")[0].innerHTML
  localStorage.setItem(name, quanitity);
}