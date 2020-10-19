'use strict'

/* Foodie Farmer javascript for the account page */

let signedIn = false

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

function showFarmTabs() {
  if ($('#pills-stock-tab').css('display') == 'none') {
    // Show the stock and group purchases tabs if not shown already
    $('#pills-stock-tab').css('display', '')
    $('#pills-group-tab').css('display', '')

    $.get('/api/farmer/get_farm_stock', stocks => {
      stocks.forEach(stock => {
        $(`<tr>
            <td><img src="${stock.picture}" width="64px"/></td>
            <td>${stock.name}</td>
            <td>${stock.description}</td>
            <td>${stock.stockType}</td>
            <td>${stock.quantity}</td>
          </tr>`).appendTo('.my-account-stock tbody')
      })
    })
  }
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

// Sign out of account
function signout() {
  let auth2 = gapi.auth2.getAuthInstance()

  auth2.signOut().then(() => {
    $.get('/api/signout', data => {
      location.reload()
    })
  })
}