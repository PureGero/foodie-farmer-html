'use strict'

/* Foodie Farmer javascript for the account page */

let signedIn = false

// Map of stock id to stock of the farmer
const stockMap = {}

// On google sign in
function onSignIn(googleUser) {
  let profile = googleUser.getBasicProfile()

  loadProfile(googleUser.getAuthResponse().id_token)
}

function loadProfile(idtoken) {
  // Check if user is signed in
  $.get('/api/customer/get_profile', customer => {
    // Customer is signed in
    signedIn = true
    $('.welcome-dashboard').html(`
      <p>Hello, <strong>${customer.name}</strong> (If Not <strong>${customer.name} !</strong> <a
      href="#" onclick="signout()">Logout</a> )</p>`)

    $('#firstName').val(customer.name.split(' ')[0])
    $('#lastName').val(customer.name.split(' ')[1])
    $('#name').val(customer.name)
    $('#email').val(customer.userName)
    $('#profileIcon').attr('src', customer.picture)
    $('#googleAccountButton').click(e => open('https://myaccount.google.com/', '_blank'))

    $('#bsb').val(customer.bsb)
    $('#accountNumber').val(customer.accountNumber)
    $('#accountName').val(customer.accountName)

    $('#address').val(customer.address)
    $('#deliverToCollectionPoint').prop('checked', customer.deliverToCollectionPoint)

    $('#farmName').val(customer.farmName)
    $('#farmAddress').val(customer.farmAddress)

    if (customer.farmName) {
      // Show the farm tabs if we are a farm
      showFarmTabs()
    }

  }).fail(jqXHR => {
    if (jqXHR.status == 400) {
      // The server returns a response code of 400 when not logged in
      if (idtoken) {
        $.post('/api/signin', 'idtoken=' + idtoken, data => {
          loadProfile()
        })
      } else {
        $('.welcome-dashboard').html(`Failed to sign in`)
      }
    } else {
      // Another kind of error occured
      $('.welcome-dashboard').html(`Could not contact api server`)
    }
  })
}

// Show the tabs only visible to farmers
function showFarmTabs() {
  if ($('#pills-stock-tab').css('display') == 'none') {
    // Show the stock and group purchases tabs if not shown already
    $('#pills-stock-tab').css('display', '')
    $('#pills-group-tab').css('display', '')

    $.get('/api/farmer/get_farm_stock', stocks => {
      stocks.forEach(stock => {
        appendStock(stock)
      })
    })

    loadStockTypes()
  }
}

// Append a stock item to the list of stocks, removing it first if it already exists
function appendStock(stock) {
  stockMap[stock.id] = stock

  $(`#stock-${stock.id}`).remove()
  $(`<tr id="stock-${stock.id}">
    <td><img src="${stock.picture}" width="64px"/></td>
    <td>${stock.name}</td>
    <td>${stock.description}</td>
    <td>${stock.stockType}</td>
    <td>${stock.quantity}</td>
    <td><a class="box-btn" href="#" onclick="editStock(${stock.id})"><i class="far fa-edit"></i></a></td>
  </tr>`).appendTo('.my-account-stock tbody')
}

function editStock(stockId) {
  const stock = stockMap[stockId]

  $('#stockId').val(stock.id)
  $('#stockName').val(stock.name)
  $('#stockDescription').val(stock.description)
  $('#stockPicture').val(stock.picture)
  $('#stockQuantity').val(stock.quantity)
  $('#stockPrice').val(stock.price)
  $('#stockExpirationDate').prop('valueAsDate', new Date(stock.expirationDate))
  $('#stockType').val(stock.stockType)

  $('#saveStockButton').text('Save Edits')

  $('#stockName').focus()
}

// Load the types of stock for the stock type dropdown menu
function loadStockTypes() {
  $.get('/api/customer/list_stock_types', stockTypes => {
    $('#stockType').empty()

    stockTypes.forEach(stockType => {
      $(`<option value="${stockType.name}">${stockType.name}</option>`)
        .appendTo('#stockType')
    })
  })
}

function savePaymentMethod(button) {
  $(button).text('Saving...')

  let bsb = $('#bsb').val()
  let accountNumber = $('#accountNumber').val()
  let accountName = $('#accountName').val()
  
  $.post('/api/customer/edit_bankaccount',
    `bsb=${bsb}&accountNumber=${accountNumber}&accountName=${accountName}`,
    data => {
      $(button).text('Saved')
      setTimeout(() => $(button).text('Save Change'), 2000)
    }
  ).fail(jqXHR => {
    $(button).text(jqXHR.responseText)
  })
}

function saveAddress(button) {
  $(button).text('Saving...')

  let address = $('#address').val()
  let deliverToCollectionPoint = $('#deliverToCollectionPoint').prop('checked')
  
  $.post('/api/customer/edit_address',
    `address=${address}&deliverToCollectionPoint=${deliverToCollectionPoint}`,
    data => {
      $(button).text('Saved')
      setTimeout(() => $(button).text('Save Change'), 2000)
    }
  ).fail(jqXHR => {
    $(button).text(jqXHR.responseText)
  })
}

function saveFarm(button) {
  $(button).text('Saving...')

  let farmName = $('#farmName').val()
  let farmAddress = $('#farmAddress').val()
  
  $.post('/api/farmer/edit_farm',
    `farmName=${farmName}&farmAddress=${farmAddress}`,
    data => {
      $(button).text('Saved')
      setTimeout(() => $(button).text('Save Change'), 2000)

      // Show the farm tabs
      showFarmTabs()
    }
  ).fail(jqXHR => {
    $(button).text(jqXHR.responseText)
  })
}

function saveStock(button) {
  $(button).text('Saving...')

  let id = $('#stockId').val()
  let name = $('#stockName').val()
  let description = $('#stockDescription').val()
  let picture = $('#stockPicture').val()
  let quantity = $('#stockQuantity').val()
  let price = $('#stockPrice').val()
  let expirationDate = $('#stockExpirationDate').val()
  let stockType = $('#stockType').val()
  
  $.post('/api/farmer/add_stock',
    `id=${id}&name=${name}&description=${description}&picture=${picture}&quantity=${quantity}&price=${price}&expirationDate=${expirationDate}&stockType=${stockType}`,
    stock => {
      $(button).text('Saved')
      setTimeout(() => $(button).text('Add Stock'), 2000)

      $('#stockId').val('')
      $('#stockName').val('')
      $('#stockDescription').val('')
      $('#stockPicture').val('')
      $('#stockQuantity').val('')
      $('#stockPrice').val('')
      $('#stockExpirationDate').val('')
      $('#stockType').val('')

      appendStock(stock)
    }
  ).fail(jqXHR => {
    $(button).text(jqXHR.responseText)
  })
}

// Sign out of account
function signout() {
  let auth2 = gapi.auth2.getAuthInstance()

  auth2.signOut().then(() => {
    $.get('/api/signout', data => {
      location.reload()
    })
  })
}