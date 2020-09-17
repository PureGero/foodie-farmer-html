'use strict'

if ($('.group-purchase').length) {
  $.get('/api/customer/list_group_purchases', data => {
    data.forEach(item => {
      $(`<div class="item">
        <div class="block-4 text-center">
          <figure class="block-4-image">
            <img src="${item.image}" alt="Image placeholder" class="img-fluid">
          </figure>
          <div class="block-4-text p-4">
            <h3><a href="#">${item.name}</a></h3>
            <p class="mb-0">${item.farm}</p>
            <p class="text-primary font-weight-bold">$${item.cost}</p>
          </div>
        </div>
      </div>`).appendTo('.group-purchase')
    })
  })
}
