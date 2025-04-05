var express = require("express");
const productHelpers = require("../helpers/product-helpers");
const userHelper = require("../helpers/user-helper");
const { response } = require("../app");
var router = express.Router();

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};
/* GET home page. */
router.get("/", async function (req, res, next) {
  let user = req.session.user;

  // let user={name:'anand'}
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
 let  CartCount =0;
  
   if (req.session.user && req.session.user._id) {
     CartCount = await  userHelper.getCartCount(req.session.user._id);
  }
  
  productHelpers.getAllProducts().then((products) => {
    res.render("user/view-product", { products, admin: false, user,CartCount });
  });
});

router.get("/login", (req, res) => {
  if (req.session.user) {
    res.redirect("/");
  } else {
    res.render("user/login", { "loginError:res": req.session.LoginError });
    req.session.LoginError = false;
  }
});

router.get("/sign-up", (req, res) => {
  res.render("user/signup");
});

router.post("/sign-up", (req, res) => {
  userHelper.doSignup(req.body).then((response) => {
    console.log(response);
  });
});

router.post("/doLogin", (req, res) => {
  userHelper.doLogin(req.body).then((result) => {
    if (result.status) {
      req.session.loggedIn = true;
      req.session.user = result.user;
      res.redirect("/");
    } else {
      res.session.LoginError = true;
      res.redirect("/login");
    }
  });
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

router.get("/cart", verifyLogin, async (req, res) => {  
  let productList = await userHelper.getCarts(req.session.user._id);
  console.log("product list ", productList);
  res.render("user/cart", { productList });
});

router.get("/add-to-cart", verifyLogin, (req, res) => {
  const proID = req.query.proID;   
  userHelper.addToCart(proID, req.session.user._id).then(() => {
    res.json({status:true})
    // res.redirect("/");
  });
});

router.post("/change-product-quantity", (req, res) => {
  userHelper.changeProductQuantity(req.body).then((response) => {    
      res.json({status:true,objresponse:response,action:req.body});
  }).catch((err) => {
      console.error("Error:", err);
      res.status(500).send("Error updating product quantity");
  });
});

module.exports = router;
