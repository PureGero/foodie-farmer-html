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
    createPages('.produce-items', 6)
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
    createPages('.group-items', 6)
  })
}

// Load farms
if ($('.farms-list').length) {
  $.get('/api/customer/list_farms', farms => {
    farms.forEach(farm => {
      $(`<div class="row mb-5">
        <div class="container text-center border">
          <div class="row">
            <div class="col border px-0">
              <img src="images/farm_1.jpg" class="img-fluid">
            </div>
            <div class="col-md border">
              <h2 class="text-center text-dark mt-3">${farm.name}</h2>
              <p class="font-weight-normal text-justify text-dark">Corrupti quos dolores et quas molestias excepturi sint occaecati.
                Non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.
              </p>
              <ul class="list-group list-group-flush">
                <li class="list-group-item font-weight-normal text-dark">${farm.address}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>`).appendTo('.farms-list')
    })
    createPages('.farms-list', 2)
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

// Create pages of items
function createPages(parent, itemsPerPage) {
  // Define the parent as the pages container and set its items per page value
  $(parent).addClass('pages-container').attr('items-per-page', itemsPerPage)

  // Decrease page button
  $('<li class="page-decrease">&lt;</li>').appendTo('.pages')

  // Page number buttons
  for (let i = 0; i < getMaxPage(); i++) {
    $(`<li class="page-number">${i + 1}</li>`).click(() => selectPage(i)).appendTo('.pages')
  }

  // Increase page button
  $('<li class="page-increase">&gt;</li>').appendTo('.pages')

  // Select the first page
  selectPage(0)
}

// Returns the maxmimum page number
function getMaxPage() {
  return $('.pages-container').children().length / $('.pages-container').attr('items-per-page')
}

// Select a page
function selectPage(i) {
  // Check page number is in range
  if (i < 0) i = 0
  if (i >= getMaxPage()) i = Math.ceil(getMaxPage()) - 1

  // Update the arrow buttons
  $('.page-decrease').click(() => selectPage(i - 1))
  $('.page-increase').click(() => selectPage(i + 1))

  $(`.page-number`).removeClass('active')
  $(`.page-number`).slice(i, i + 1).addClass('active')

  // Hide all elements
  $('.pages-container').children().css('display', 'none')

  // Show the elements on this page
  $('.pages-container').children().slice(i * $('.pages-container').attr('items-per-page'), (i + 1) * $('.pages-container').attr('items-per-page')).css('display', '')
}

//add items to HTML5 storage
function AddItem() {

  var name = document.getElementsByClassName("text-black item-name")[0].innerHTML
  var quanitity = document.getElementsByClassName("form-control text-center")[0].innerHTML
  localStorage.setItem(name, quanitity);
}

function BrowserCheck() {
	return ('localStorage' in window && window['localStorage'] !== null)
}
    
function DisplayItems() {
	if (BrowserCheck()) {
		var key = "";
		var list = "<tr><th>Item</th><th>Value</th></tr>\n";
    var i = 0;
    
		for (i = 0; i <= localStorage.length-1; i++) {
			key = localStorage.key(i);
			list += "<tr><td>" + key + "</td>\n<td>"
					+ localStorage.getItem(key) + "</td></tr>\n";
		}
		//no items in the table
		if (list == "<tr><th>Item</th><th>Value</th></tr>\n") {
			list += "<tr><td><i>empty</i></td>\n<td><i>empty</i></td></tr>\n";
    }
	} else {
		alert('Cannot save shopping list as your browser does not support HTML 5');
	}
}