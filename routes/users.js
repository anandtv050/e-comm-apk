var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  let products = [
    {
      name: "i phone11",
      category: "mobile",
      decription: "This is a phone",
      image:
        "https://mobitez.in/wp-content/uploads/2024/04/Apple-iPhone-11-White-ps1.webp",
    },
    {
      name: "oppo f11",
      category: "mobile",
      decription: "This is a phone",
      image:
        "https://i.gadgets360cdn.com/products/large/oppoa11-db-627x800-1571136530.jpg",
    },
    {
      name: "samsung s24",
      category: "mobile",
      decription: "This is a phone",
      image:
        "https://m.media-amazon.com/images/I/71ez69tPl4L._AC_UF1000,1000_QL80_.jpg",
    },
    {
      name: "realme",
      category: "mobile",
      decription: "This is a phone",
      image:
        "https://m.media-amazon.com/images/I/61B2t2Ul9zL._AC_UF1000,1000_QL80_.jpg",
    },
  ];
  res.render("index", { products, admin: false });
});

module.exports = router;
