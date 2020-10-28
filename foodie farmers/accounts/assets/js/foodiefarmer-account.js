'use strict'

/* Foodie Farmer javascript for the account page */

let signedIn = false

// Map of stock id to stock of the farmer
const stockMap = {}

// Map of group purchase id to the group purchase of the farmer
const groupPurchaseMap = {}

// Move to the selected tab
if (location.hash.length > 1) {
  $(`[href$="${location.hash}"]`).click()
}

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

    loadOrders()

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

// Load the customers orders
function loadOrders() {
  $.get('/api/customer/list_orders', orders => {
    orders.forEach(order => {
      $(`<tr>
        <td><img src="${order.picture}" title="${order.name}" width="64px"/></td>
        <td>${order.name}</td>
        <td>${new Date(order.date).toLocaleDateString()}</td>
        <td>${order.status}</td>
        <td>${order.quantity}</td>
        <td>$${order.quantity * order.price}</td>
      </tr>`).appendTo('.my-account-order tbody')
    })
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

    $.get('/api/farmer/get_farm_group_purchases', groupPurchases => {
      groupPurchases.forEach(groupPurchase => {
        appendGroupPurchase(groupPurchase)
      })
    })

    loadStockTypes()
  }
}

// Append a stock item to the list of stocks, removing it first if it already exists
function appendStock(stock) {
  stockMap[stock.id] = stock

  // Add it to the list, removing it if it already exists
  $(`#stock-${stock.id}`).remove()
  $(`<tr id="stock-${stock.id}">
    <td><img src="${stock.picture}" title="${stock.name}" width="64px"/></td>
    <td>${stock.name}</td>
    <td>${stock.description}</td>
    <td>${stock.stockType}</td>
    <td>${stock.quantity}</td>
    <td><a class="box-btn" href="#" onclick="editStock(${stock.id})"><i class="far fa-edit"></i></a></td>
  </tr>`).appendTo('.my-account-stock tbody')

  // Add it to the group purchase stock options, removing it if it already exists
  $(`#groupPurchaseStock-${stock.id}`).remove()
  $(`<option id= "groupPurchaseStock-${stock.id}" value="${stock.id}">${stock.name} ($${stock.price})</option>`)
        .appendTo('#groupPurchaseStock')
}

// Append a group purchase to the list of group purchases, removing it first if it already exists
function appendGroupPurchase(groupPurchase) {
  groupPurchaseMap[groupPurchase.id] = groupPurchase

  $(`#stock-${groupPurchase.id}`).remove()
  $(`<tr id="stock-${groupPurchase.id}">
    <td><img src="${groupPurchase.picture}" title="${groupPurchase.name}" width="64px"/></td>
    <td>${new Date(groupPurchase.endTime).toLocaleString()}</td>
    <td>${groupPurchase.totalQuantity} / ${groupPurchase.capacity}</td>
    <td>$${groupPurchase.maxDiscount}</td>
    <td><a class="box-btn" href="#" onclick="editGroupPurchase(${groupPurchase.id})"><i class="far fa-edit"></i></a></td>
  </tr>`).appendTo('.my-account-group tbody')
}

// Load a stock from memory into the input fields on the stock tab
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

// Load a group purchase from memory into the input fields on the group purchase tab
function editGroupPurchase(groupPurchaseId) {
  const groupPurchase = groupPurchaseMap[groupPurchaseId]

  $('#groupPurchaseId').val(groupPurchase.id)
  $('#groupPurchaseStock').val(groupPurchase.stockId)
  $('#groupPurchaseEndTime').prop('valueAsNumber', new Date(groupPurchase.endTime) - new Date().getTimezoneOffset()*1000*60)
  $('#groupPurchaseCapacity').val(groupPurchase.capacity)
  $('#groupPurchaseMaxDiscount').val(groupPurchase.maxDiscount)

  $('#saveGroupPurchaseButton').text('Save Edits')

  $('#groupPurchaseEndTime').focus()
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

// Save details on the payment tab to the server
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

// Save details on the address tab to the server
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

// Save details on the farm tab to the server
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

// Save details on the stock tab to the server
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

// Save details on the group purchase tab to the server
function saveGroupPurchase(button) {
  $(button).text('Saving...')

  let id = $('#groupPurchaseId').val()
  let stockId = $('#groupPurchaseStock').val()
  let endTime = $('#groupPurchaseEndTime').val()
  let capacity = $('#groupPurchaseCapacity').val()
  let maxDiscount = $('#groupPurchaseMaxDiscount').val()
  
  $.post('/api/farmer/add_group_purchase',
    `id=${id}&stockId=${stockId}&endTime=${endTime}&capacity=${capacity}&maxDiscount=${maxDiscount}`,
    groupPurchase => {
      $(button).text('Saved')
      setTimeout(() => $(button).text('Add Group Purchase'), 2000)

      $('#groupPurchaseId').val('')
      $('#groupPurchaseStock').val('')
      $('#groupPurchaseEndTime').val('')
      $('#groupPurchaseCapacity').val('')
      $('#groupPurchaseMaxDiscount').val('')

      appendGroupPurchase(groupPurchase)
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