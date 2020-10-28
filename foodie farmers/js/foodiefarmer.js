'use strict'

/* Foodie Farmer javascript */

let loginDialogShown = false
let signedIn = false

// On google sign in
function onSignIn(googleUser) {
  let profile = googleUser.getBasicProfile()

  $.post('/api/signin', 'idtoken=' + googleUser.getAuthResponse().id_token, data => {
    signedIn = true

    if (loginDialogShown) {
      location.reload()
    }
  })
}

// Check if user is signed in
/*$.get('/api/customer/get_profile').fail(jqXHR => {
  // The server returns a response code of 400 when not logged in
  if (jqXHR.status == 400) {
    showLoginDialog()
  }
})*/

// Show the login dialog
function showLoginDialog() {
  loginDialogShown = true
  $('.login-dialog').modal()
}

// Returns the price formatted in the local currency
//  eg $2.00 or 200￥
function formatPrice(price) {
  return '$' + price.toFixed(2)
}

// Set active navigation element
let filename = location.pathname.substr(location.pathname.lastIndexOf('/') + 1)
$(`nav a[href="${filename}"]`).parent().addClass('active')

// The item being shown on this shop-single or shop-group page
let itemOnPage = {}

// Load shop single item
if ($('.shop-single').length) {
  let id = new URLSearchParams(window.location.search).get('id')
  $.get(`/api/customer/get_produce?id=${id}`, items => {
    items.forEach(item => {
      itemOnPage = item
      itemOnPage.quickPurchase = true

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
      itemOnPage = item
      itemOnPage.groupPurchase = true
      
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
              <img src="${farm.image}" class="img-fluid">
            </div>
            <div class="col-md border">
              <h2 class="text-center text-dark mt-3">${farm.name}</h2>
              <p class="font-weight-normal text-justify text-dark">${farm.description}
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
  if (parent) {
    // Define the parent as the pages container
    $(parent).addClass('pages-container')
  }
  
  if (itemsPerPage) {
    // Set the items per page and filter it
    $('.pages-container').attr('items-per-page', itemsPerPage)
    return recalculateFilters()
  }

  if (!$('.pages-container').attr('items-per-page')) {
    // Items per page is either unset, or set to 0
    return console.error('items-per-page cannot be 0')
  }

  // Reset the pages
  $('.pages').empty()

  // Decrease page button
  $('<li class="page-decrease">&lt;</li>').appendTo('.pages')

  // Page number buttons
  for (let i = 0; i < getMaxPage(); i++) {
    $(`<li class="page-number">${i + 1}</li>`).click(() => selectPage(i)).appendTo('.pages')
  }

  // Increase page button
  $('<li class="page-increase">&gt;</li>').appendTo('.pages')

  // Arrow button click functions
  $('.page-decrease').click(() => selectPage(parseInt($(`.page-number.active`).text()) - 2))
  $('.page-increase').click(() => selectPage(parseInt($(`.page-number.active`).text())))

  // Select the first page
  selectPage(0)
}

// Returns the maxmimum page number
function getMaxPage() {
  return $('.pages-container').children(':not(.hidden-item)').length / $('.pages-container').attr('items-per-page')
}

// Select a page
function selectPage(i) {
  // Check page number is in range
  if (i < 0) i = 0
  if (i >= getMaxPage()) i = Math.ceil(getMaxPage()) - 1

  $(`.page-number`).removeClass('active')
  $(`.page-number`).slice(i, i + 1).addClass('active')

  // Hide all elements
  $('.pages-container').children(':not(.hidden-item)').css('display', 'none')

  // Show the elements on this page
  $('.pages-container').children(':not(.hidden-item)').slice(i * $('.pages-container').attr('items-per-page'), (i + 1) * $('.pages-container').attr('items-per-page')).css('display', '')
}

// Recalculate the filters on the items in the pages
function recalculateFilters() {
  // Reset hidden items
  $('.pages-container').children('.hidden-item').removeClass('hidden-item')

  $('.pages-container').children().each((index, child) => {
    if (!~$(child).text().toLowerCase().indexOf($('.search').val().toLowerCase())) {
      // Does not contain search query
      $(child).addClass('hidden-item')
    }
  })

  createPages()
}
$('.search').on('input', recalculateFilters)

// Fill search box
let query = new URLSearchParams(window.location.search).get('query')
if (query) {
  $('.search').val(query).trigger('input')
}

// The key for the cart to use in localStorage
const CART_KEY = 'foodie-farmer-cart'

// Get the cart data
function getCart() {
  if (localStorage.getItem(CART_KEY)) {
    return JSON.parse(localStorage.getItem(CART_KEY))
  }

  return {}
}

// Set the car data
function setCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
}

//add items to HTML5 storage
function AddItem() {
  const cart = getCart()

  let key = (itemOnPage.groupPurchase ? 'group_' : 'quick_') + itemOnPage.id
  itemOnPage.count = parseInt($('.count').val())

  if (cart[key]) {
    // Item is already in cart, combine the two
    cart[key].count += itemOnPage.count
  } else {
    // Item is not in cart yet, set it
    cart[key] = itemOnPage
  }

  setCart(cart)
}
  
function calculateCartTotals() {
  const cart = getCart()
  let total = 0
  
  // Sum the price * count for each item in the cart
  Object.keys(cart).forEach(key => {
    let item = cart[key]
    total += item.price * item.count
  })

  $('.total-price').text(formatPrice(total))
}

// Load cart
if ($('.cart').length) {
  const cart = getCart()
  
  // For each item in the cart...
  Object.keys(cart).forEach(key => {
    let item = cart[key]

    let row = $(`<tr cart-key="${key}">
      <td class="product-thumbnail">
        <img src="${item.picture}" alt="Image" class="img-fluid">
      </td>
      <td class="product-name">
        <h2 class="h5 text-black">${item.name}</h2>
      </td>
      <td>${formatPrice(item.price)}</td>
      <td>
        <div class="input-group mb-3" style="max-width: 120px">
          <div class="input-group-prepend">
            <button class="btn btn-outline-primary js-btn-minus" type="button">-</button>
          </div>
          <input type="text" class="form-control text-center" value="${item.count}" placeholder="" aria-label="Example text with button addon" aria-describedby="button-addon1">
          <div class="input-group-append">
            <button class="btn btn-outline-primary js-btn-plus" type="button">+</button>
          </div>
        </div>
      </td>
      <td class="total-item-price">${formatPrice(item.price * item.count)}</td>
      <td><button class="btn btn-primary btn-sm btn-remove">X</button></td>
    </tr>`).appendTo('.cart')

    // On count change
    row.find('.form-control').on('input', e => {
      const cart = getCart()
      let key = $(e.target).parents('tr').attr('cart-key')
      let item = cart[key]

      // Update and save count
      item.count = parseInt($(e.target).val())
      setCart(cart)

      // Update total price
      $(e.target).parents('tr').find('.total-item-price').text(formatPrice(item.price * item.count))
      calculateCartTotals()
    })

    // On item delete
    row.find('.btn-remove').on('click', e => {
      const cart = getCart()
      let key = $(e.target).parents('tr').attr('cart-key')

      // Delete the entry from the cart
      delete cart[key]
      setCart(cart)

      // Remove the row and update the total price
      $(e.target).parents('tr').remove()
      calculateCartTotals()
    })
  })

  calculateCartTotals()
}

// Place the order
function order(button) {
  $(button).text('Placing order...')

  if (!signedIn) {
    // Not signed in, show the login dialog
    showLoginDialog()

    // Try to order again later once they might be logged in
    return setTimeout(order.bind(button), 1000)
  }

  const cart = getCart()
  let orders = []

  // Generate orders to send to the server
  Object.keys(cart).forEach(key => {
    orders.push({
      id: cart[key].id,
      count: cart[key].count,
      groupPurchase: cart[key].groupPurchase
    })
  })

  $.ajax({
    type: 'post',
    url: '/api/customer/place_order',
    data: JSON.stringify(orders),
    contentType: 'application/json'
  }).done((data) => {
    console.log('Done')
    setCart({})
    window.location='accounts/index.html#pills-order'
  })
}