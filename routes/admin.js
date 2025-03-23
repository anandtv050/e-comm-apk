var express = require("express");
var router = express.Router();
var productHelper = require("../helpers/product-helpers");

/* GET users listing. */
router.get("/", function (req, res, next) {
  // let products = [
  //   {
  //     name: "i phone11",
  //     category: "mobile",
  //     decription: "This is a phone",
  //     image:
  //       "https://mobitez.in/wp-content/uploads/2024/04/Apple-iPhone-11-White-ps1.webp",
  //   },
  //   {
  //     name: "oppo f11",
  //     category: "mobile",
  //     decription: "This is a phone",
  //     image:
  //       "https://i.gadgets360cdn.com/products/large/oppoa11-db-627x800-1571136530.jpg",
  //   },
  //   {
  //     name: "samsung s24",
  //     category: "mobile",
  //     decription: "This is a phone",
  //     image:
  //       "https://m.media-amazon.com/images/I/71ez69tPl4L._AC_UF1000,1000_QL80_.jpg",
  //   },
  //   {
  //     name: "realme",
  //     category: "mobile",
  //     decription: "This is a phone",
  //     image:
  //       "https://m.media-amazon.com/images/I/61B2t2Ul9zL._AC_UF1000,1000_QL80_.jpg",
  //   },
  // ];
  productHelper.getAllProducts().then((products)=>{
console.log(products);

    res.render("admin/view-products", { products, admin: true });
  })
});

router.get("/add-product", function (req, res) {
  //ith add product click cheythaal -> after clicking add product oru form varanam for add new product

  res.render("admin/add-product");
});

router.post("/add-product", (req, res) => {
  productHelper.addProduct(req.body, (id) => {
    console.log(req.body);
    // let image = req.files.Image;
    // image.mv('../public/product-images/'+id+'.jpg',(err,done)=>{
    //   if(!err) {
    //     res.render("admin/add-product")
    //   }
    // })
  });
});

router.get("/delete-product",(req,res)=>{
   let productid=req.query.id;
   console.log(productid);
   productHelper.deletProduct(productid)
   res.redirect('/admin/')
   
})

module.exports = router;
