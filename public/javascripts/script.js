function addToCart(proID) {
  $.ajax({
    url: "/add-to-cart/",
    method: "get",
    data:{ proID: proID },
    success: (response) => {
        if(response.status){
            let Count=$('#cart-count').html();
            Count  = parseInt(Count)+1;
            $("#cart-count").html(Count)
        }
    }
  });
}
