const { response } = require("../../app");

function addToCart(proID) {
  $.ajax({
    url: "/add-to-cart/",
    method: "get",
    data: { proID: proID },
    success: (response) => {
      if (response.status) {
        let Count = $("#cart-count").html();
        Count = parseInt(Count) + 1;
        $("#cart-count").html(Count);
      }
    },
  });
}

function changeQuantity(cartId, prodId, count) {
  $.ajax({
    url: "/change-product-quantity",
    method: "post",
    data: { cart: cartId, product: prodId, count: count },
    success: (response) => {        
        if (response.status) { 
          let quantityCount =  parseInt( $("#"+prodId).html())
          let newQuantityCount = quantityCount + count;
          $("#"+prodId).html(newQuantityCount)
        //   }
        }
    },
  });
}

$("#checkout-form").submit((e) => {
  e.preventDefault();
  alert("sui")
  $.ajax({
    url:'/place-orders',
    method:'post',
    data:$("#checkout-form").serialize(),
    success:(response)=>{ 
      console.log("respo",response);
      alert(response)
      if(response.status){
        location.href = '/order-success';
      }
    },
    error: (err) => {
      console.error("AJAX Error:", err);
      alert("Something went wrong!");
    }
  })
})
