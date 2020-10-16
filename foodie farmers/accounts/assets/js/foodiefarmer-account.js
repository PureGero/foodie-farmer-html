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

    $('#bsb').val(customer.bsb)
    $('#accountNumber').val(customer.accountNumber)
    $('#accountName').val(customer.accountName)
    $('#address').val(customer.address)
    $('#deliverToCollectionPoint').prop('checked', customer.deliverToCollectionPoint)

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

// Sign out of account
function signout() {
  let auth2 = gapi.auth2.getAuthInstance()

  auth2.signOut().then(() => {
    $.get('/api/signout', data => {
      location.reload()
    })
  })
}