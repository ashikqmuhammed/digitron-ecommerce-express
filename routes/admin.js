const express = require('express');
const router = express.Router();
const adminController=require('../controllers/adminController')
const verifyLogin=require('../helpers/middleware/verify-login')





router.get
    (
        '/',
        verifyLogin.verifyAdminLogin,
        adminController.getAdmin
    )

router.get
    (
        '/products',
        verifyLogin.verifyAdminLogin,
        adminController.getProducts
    )

router.get
    (
        '/orders',
        verifyLogin.verifyAdminLogin,
        adminController.orders
    )

router.get
    (
        '/customers',
        verifyLogin.verifyAdminLogin,
        adminController.customers
    )

router.get
    (
        '/customer-control/:action/:customerId',
        verifyLogin.verifyAdminLogin,
        adminController.customerControl
    )

router.get
    (
        '/upd-cat-req',
        verifyLogin.verifyAdminLogin,
        adminController.updCatReq
    )

router.get
    (
        '/upd-apr/:id/:newName',
        verifyLogin.verifyAdminLogin,
        adminController.aprUpd
    )

router.get
    (
        '/new-cat-req',
        verifyLogin.verifyAdminLogin,
        adminController.newCatReq
    )

router.get
    (
        '/give-access/:id/:reqId',
        verifyLogin.verifyAdminLogin,
        adminController.giveAccess
    )

router.get
    (
        '/hold-access/:id/:reqId',
        verifyLogin.verifyAdminLogin,
        adminController.holdAccess
    )

router.get
    (
        '/delete-new-cat/:id/:reqId',
        verifyLogin.verifyAdminLogin,
        adminController.deleteNewCat
    )

router.get
    (
        '/holded-cat',
        verifyLogin.verifyAdminLogin,
        adminController.holdedCat
    )

router.get
    (
        '/unhold-holded/:id',
        verifyLogin.verifyAdminLogin,
        adminController.unholdHolded
    )

router.get
    (
        '/delete-holded/:id',
        verifyLogin.verifyAdminLogin,
        adminController.deleteHolded
    )

router.get
    (
        '/blocked-cat',
        verifyLogin.verifyAdminLogin,
        adminController.blockedCat
    )

router.get
    (
        '/unblock-blocked/:id',
        verifyLogin.verifyAdminLogin,
        adminController.unblockBlocked
    )

router.get
    (
        '/active-cat',
        verifyLogin.verifyAdminLogin,
        adminController.activeCat
    )

router.get
    (
        '/block-active/:id',
        verifyLogin.verifyAdminLogin,
        adminController.blockActive
    )

router.get
    (
        '/new-vend-req',
        verifyLogin.verifyAdminLogin,
        adminController.newVendReq
    ) 

router.get
        (
            '/verify-vendor/:id',
            verifyLogin.verifyAdminLogin,
            adminController.vendorVerific
        )

router.get
        (
            '/reject-vendor/:id',
            verifyLogin.verifyAdminLogin,
            adminController.vendorReject
        )

router.get
        (
            '/active-vend',
            verifyLogin.verifyAdminLogin,
            adminController.activeVend
        )

router.get
        (
            '/block-vendor/:id',
            verifyLogin.verifyAdminLogin,
            adminController.blockVendor
        )

router.get
        (
            '/blocked-vend',
            verifyLogin.verifyAdminLogin,
            adminController.blockedVend
        )

router.get
        (
            '/unblock-vendor/:id',
            verifyLogin.verifyAdminLogin,
            adminController.unblockVend
        )




module.exports = router;