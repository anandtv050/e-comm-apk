var express = require("express");
const productHelpers = require("../helpers/product-helpers");
const userHelper = require("../helpers/user-helper");
const { response } = require("../app");
var router = express.Router();

const verifyLogin =(req,res,next)=>{
  console.log("session",req.session);
  
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}
/* GET home page. */
router.get("/", function (req, res, next) {
  let user = req.session.user;
  console.log('user from /',user);
  
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
  productHelpers.getAllProducts().then((products) => {
    res.render("user/view-product", { products, admin: false,user });
  });
});

router.get("/login", (req, res) => {
  if(req.session.user){
    res.redirect("/");
  }else{
    res.render("user/login",{"loginError:res":req.session.LoginError});
    req.session.LoginError=false
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
      res.session.LoginError=true;
      res.redirect("/login");
    }
  });
});

router.get("/logout",(req,res)=>{
  req.session.destroy();
  res.redirect('/');
})

router.get("/cart",verifyLogin,(req,res)=>{
  res.render('user/cart')
})

module.exports = router;
