require('../config/connection')
const Category=require('../models/category')
const User=require('../models/user')
const mailer=require('../helpers/functions/email')
const orderDb=require('../helpers/dbqueries/db-order')
const userDb=require('../helpers/dbqueries/db-user')






const getAdmin=async(req,res)=>{
    const renderDatas={}
        const count=await User.aggregate(
            [
                {
                  '$match': {
                    'role': 'vendor', 
                    'verified': false
                  }
                }, {
                  '$count': 'pendingCount'
                }
              ]
        )
        console.log(count);
        renderDatas.vendorRqCount=count
        renderDatas.layout='admin-layout'
        renderDatas.title='Admin | Digitron'

    res.render('admin/admin',renderDatas)
}

const getProducts=async(req,res)=>{
    const categoryData=await Category.aggregate
    ([{$project:{__v:0}}])

    res.render('admin/products',
    {
        title:'webStore Admin Panel',
        layout:'admin-layout',
        categoryData
    })
}






//update category request
const updCatReq=async(req,res)=>{
    const categoryData= await Category.aggregate([{$match:{edit:true}}])
    res.render('admin/upd-cat-req',{layout:'admin-layout',categoryData:categoryData})
}

//approve update request
const aprUpd=async function (req,res) {
    const id=req.params.id
    const newName=req.params.newName
    await Category.updateOne({_id:id},{$set:{edit:false,editTo:'default',name:newName}})
    res.redirect('/admin/upd-cat-req')
}








//new category request
const newCatReq=async function (req,res) {
    const categoryData=await Category.aggregate([{$match:{access:false,blocked:false}}])
    res.render('admin/new-cat-req',{layout:'admin-layout',categoryData})
}

//give access to new request
const giveAccess=async function (req,res) {
    const id=req.params.id
    const reqId=req.params.reqId
    const requestedBy=await User.findOne({_id:reqId})
    const {email}=requestedBy
    await Category.updateOne({_id:id},{$set:{access:true}})
    const subject='Category request approved'
    const content='You can now add product to your category'
    await mailer.sendEmail(email,subject,content)

    res.redirect('/admin/new-cat-req')
}

//hold access to a new category
const holdAccess=async function (req,res) {
    const id=req.params.id
    await Category.updateOne({_id:id},{$set:{blocked:true}})
    res.redirect('/admin/new-cat-req')
}

//delete similar cat req permenantly
const deleteNewCat=async function (req,res) {
    const id=req.params.id
    await Category.deleteOne({_id:id})
    res.redirect('/admin/new-cat-req')
}






//holded categories
const holdedCat=async function (req,res) {
    const categoryData=await Category.aggregate([{$match:{access:false,blocked:true}}])
    res.render('admin/holded-cat',{layout:'admin-layout',categoryData})
}

//unholded holded
const unholdHolded=async function (req,res) {
    const id=req.params.id
    await Category.updateOne({_id:id},{$set:{access:true,blocked:false}})
    res.redirect('/admin/holded-cat')
}

//delete holded
const deleteHolded=async function (req,res) {
    const id=req.params.id
    await Category.deleteOne({_id:id})
    res.redirect('/admin/holded-cat')
}





//blocked categories
const blockedCat=async function (req,res) {
    const categoryData=await Category.aggregate([{$match:{access:true,blocked:true}}])
    res.render('admin/blocked-cat',{layout:'admin-layout',categoryData})
}
//unblock blocked
const unblockBlocked=async function (req,res) {
    const id=req.params.id
    await Category.updateOne({_id:id},{blocked:false})
    res.redirect('/admin/blocked-cat')
}





//active categories
const activeCat=async function (req,res) {
    const categoryData=await Category.aggregate([{$match:{access:true,blocked:false}}])
    res.render('admin/active-cat',{layout:'admin-layout',categoryData})
}
//block active
const blockActive=async function (req,res) {
    try {
        const id=req.params.id
        await Category.updateOne({_id:id},{blocked:true})
        res.redirect('/admin/active-cat')
    } catch (error) {
        console.log(error);
    }
    
}





//new vendor requests
const newVendReq=async (req,res)=>{
    try {
        const vendorData=await User.aggregate
        ([{$match:{role:'vendor',verified:false}}])
        res.render
        (
            'admin/new-vend-req',
            {vendorData,layout:'admin-layout'},
        )
    } catch (error) {
        console.log(error);
    }
    
}






//vendor rejection
const vendorVerific=async(req,res)=>{
    try {
        id=req.params.id
        const vendorData=await User.findOneAndUpdate
        ({_id:id},{$set:{verified:true}})
        const subject='Vendor request approved'
        const content='You can now login using your credentials. Remember two-factor authentication required for login'
        await mailer.sendEmail(vendorData.email,subject,content)
        res.redirect('/admin/new-vend-req')
    } catch (error) {
        console.log(error);
    }
}





//vendor verification
const vendorReject=async(req,res)=>{
    try {
        id=req.params.id
        const vendorData=await User.findOne
        ({_id:id})
        await User.deleteOne({_id:id})
        const subject='Vendor request rejected'
        const content='You can try again with same credentials. Give sufficient information to our team during verification for successful registration'
        await mailer.sendEmail(vendorData.email,subject,content)
        res.redirect('/admin/new-vend-req')
    } catch (error) {
        console.log(error);
    }
}





//active vendors
const activeVend=async(req,res)=>{
    try {
        const vendorData=await User.aggregate
        ([{$match:{role:'vendor',verified:true,blocked:false}}])
        res.render
            (
                'admin/active-vend',
                {
                    layout:'admin-layout',
                    vendorData:vendorData
                }
            )
    } catch (error) {
        console.log(error);
    }
}





//block vendor
const blockVendor=async(req,res)=>{
    try {
        id=req.params.id
        const vendorData= await User.findOneAndUpdate({_id:id},{blocked:true})
        const subject='Your vendor Id blocked'
        const content='Your vendor Id blocked due to unethical practices. Contact our team for further information'
        await mailer.sendEmail(vendorData.email,subject,content)
        res.redirect('/admin/active-vend')
    } catch (error) {
        console.log(error);
    }
}





//blocked vendors
const blockedVend=async(req,res)=>{
    try {
        const vendorData=await User.aggregate
        ([{$match:{role:'vendor',verified:true,blocked:true}}])
        res.render
            (
                'admin/blocked-vend',
                {
                    layout:'admin-layout',
                    vendorData:vendorData
                }
            )
    } catch (error) {
        console.log(error);
    }
}





//unblock vendor
const unblockVend=async(req,res)=>{
    try {
        id=req.params.id
        const vendorData= await User.findOneAndUpdate({_id:id},{blocked:false})
        const subject='Vendor Id Unblocked'
        const content='As per the request from you, vendor Id unblocked '
        await mailer.sendEmail(vendorData.email,subject,content)
        res.redirect('/admin/blocked-vend')
    } catch (error) {
        console.log(error);
    }
}



const orders=async(req,res)=>{
    try {
       const renderDatas={}
       renderDatas.layout='admin-layout'
       await orderDb.vendorOrders(null,renderDatas)
       res.render('admin/orders',renderDatas)
    } catch (error) {
       console.log(error); 
    }
}

const customers=async(req,res)=>{
    try {
        const renderDatas={}
        renderDatas.layout='admin-layout'

        const [activeCustomerData,blockedCustomerData]
        =
        await Promise.all([
            userDb.activeCustomers(),
            userDb.blockedCustomers()
        ])
        console.log(blockedCustomerData);
        renderDatas.activeCustomerData=activeCustomerData
        renderDatas.blockedCustomerData=blockedCustomerData

        res.render('admin/customers',renderDatas)

    } catch (error) {
        console.log(error);
    }
}


const customerControl=async(req,res)=>{
    try {
        const {action,customerId}=req.params
        if(action==='block'){
            await User.updateOne({_id:customerId},{blocked:true})
            res.json({blocked:true})
        }
        
        if(action==='unblock'){
            await User.updateOne({_id:customerId},{blocked:false})
            res.json({blocked:false})
        }
        
    } catch (error) {
        console.log(error);
    }
}




module.exports=
    {
        getAdmin,
        getProducts,
        updCatReq,
        newCatReq,
        holdedCat,
        blockedCat,
        activeCat,
        giveAccess,
        holdAccess,
        deleteNewCat,
        unholdHolded,
        deleteHolded,
        blockActive,
        unblockBlocked,
        aprUpd,
        newVendReq,
        vendorVerific,
        vendorReject,
        activeVend,
        blockVendor,
        blockedVend,
        unblockVend,
        orders,
        customers,
        customerControl
    }