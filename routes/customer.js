const express = require('express');
const router = express.Router();
const customerController=require('../controllers/customerController')
const verifyLogin=require('../helpers/middleware/verify-login')




router.get
    (
        '/',
        customerController.getHome
    )

router.get
    (
        '/store/:id',
        customerController.getStore
    )

router.get
    (
        '/products',
        customerController.getProducts
    )

router.get
    (
        '/single-view/:id',
        customerController.singleView
    )

router.get
    (
        '/category/:catName',
        customerController.getCategoryPage
    )

router.get
    (
        '/profile',
        verifyLogin.verifyCustomerLogin,
        customerController.getProfile
    )

router.get
    (
        '/cart',
        verifyLogin.verifyCustomerLogin,
        customerController.getCart
    )    

router.get
    (
        '/cart/:action/:id',
        // verifyLogin.verifyCustomerLogin,
        customerController.cartAction
    )

router.get
    (
        '/wishlist/:id',
        verifyLogin.verifyCustomerLogin,
        customerController.wishlistAction
    )

router.get
    (
        '/wishlist',
        verifyLogin.verifyCustomerLogin,
        customerController.wishlist
    )

router.get
    (
        '/filter',
        customerController.filter
    )

router.get
    (
        '/address',
        verifyLogin.verifyCustomerLogin,
        customerController.getAddressPage
    )

router.post
    (
        '/address',
        verifyLogin.verifyCustomerLogin,
        customerController.postAddress
    )

router.get
    (
        '/checkout',
        verifyLogin.verifyCustomerLogin,
        customerController.getSelectAddress
    )

router.post
    (
        '/order',
        verifyLogin.verifyCustomerLogin,
        customerController.placeOrder
    )

router.post
    (
        '/verify-payment',
        verifyLogin.verifyCustomerLogin,
        customerController.verifyPayment
    )

router.get
    (
        '/orders',
        verifyLogin.verifyCustomerLogin,
        customerController.orders
    )

router.get
    (
        '/order-success',
        verifyLogin.verifyCustomerLogin,
        customerController.orderSuccess
    )

router.get
    (
        '/invoice/:orderId/:productId/:addressId',
        verifyLogin.verifyCustomerLogin,
        customerController.invoice
    )



module.exports = router;
