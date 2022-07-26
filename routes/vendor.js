var express = require('express');
var router = express.Router();
const vendorController=require('../controllers/vendorController')
const store=require('../helpers/middleware/multer');
const verifyLogin = require('../helpers/middleware/verify-login');



router.get
    (
    '/',
    verifyLogin.verifyVendorLogin,
    vendorController.getVendor
    )

    router.get
    (
    '/manage-products',
    verifyLogin.verifyVendorLogin,
    vendorController.manageProducts
    )

router.post
    (
    '/addcategory',
    verifyLogin.verifyVendorLogin,
    vendorController.addCategory
    )

router.post
    (
    '/update-cat-req/:id',
    verifyLogin.verifyVendorLogin,
    vendorController.updateCatReq
    )

router.get
    (
    '/view-products/:id',
    verifyLogin.verifyVendorLogin,
    vendorController.viewProducts
    )

router.get
    (
    '/block-product/:id/:catId',
    verifyLogin.verifyVendorLogin,
    vendorController.blockProduct
    )

router.get
    (
    '/add-product/:id',
    verifyLogin.verifyVendorLogin,
    vendorController.addProductPage
    )

router.get
    (
    '/add-products',
    verifyLogin.verifyVendorLogin,
    vendorController.pdtAddingPage
    )

router.post
    (
    '/add-product/:id',
    verifyLogin.verifyVendorLogin,
    store.array('images',4),
    vendorController.addProduct
    )

router.get
    (
    '/update-product/:id',
    verifyLogin.verifyVendorLogin,
    vendorController.updateProductPage
    )

router.post
    (
    '/update-product/:id',
    verifyLogin.verifyVendorLogin,
    store.array('images',4),
    vendorController.updateProduct
    )

router.get
    (
    '/blocked-products',
    verifyLogin.verifyVendorLogin,
    vendorController.blockedProducts
    )

router.get
    (
    '/orders',
    verifyLogin.verifyVendorLogin,
    vendorController.orders
    )

router.get
    (
    '/order-updation/:action/:orderId/:prodId',
    verifyLogin.verifyVendorLogin,
    vendorController.orderUpdation
    )


    


module.exports = router;

