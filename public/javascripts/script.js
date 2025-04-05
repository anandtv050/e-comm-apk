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
        console.log("respo",response);
        
        if (response.status) { 
          let quantityCount =  parseInt( $("#"+prodId).html())
        //   if(quantityCount == 1){
        //     $("#decreseQuantity").hide();
        //   }else{
          let newQuantityCount = quantityCount + count;
          $("#"+prodId).html(newQuantityCount)
        //   }
        }
    },
  });
}
