require('../config/connection')
const productDb=require('../helpers/dbqueries/db-products')
const categoryDb=require('../helpers/dbqueries/db-categories')
const cartDb=require('../helpers/dbqueries/db-cart')
const wishlistDb=require('../helpers/dbqueries/db-wishlist')
const filterDb=require('../helpers/dbqueries/db-filter')
const brandDb=require('../helpers/dbqueries/db-brand')
const userDb=require('../helpers/dbqueries/db-user')
const orderDb=require('../helpers/dbqueries/db-order')
const Product = require('../models/product')
const ObjectId=require('bson-objectid')









const getHome=async(req,res,next)=>{
  try {
    const renderDatas={}
    renderDatas.wishlist=false
    renderDatas.title='Digitron | Home'
    renderDatas.layout='customer-layout'
    const wishedData=await productDb.mostWished()
    renderDatas.wishedData=wishedData
    if(!req.session.userData){
      await categoryDb.activeCategory(renderDatas)
    }
   
    if(req.session.userData){
      const {_id}=req.session.userData
      await Promise.all([
        categoryDb.activeCategory(renderDatas),
        cartDb.counter(_id,renderDatas)
      ])
        renderDatas.customerLogin=true,
        renderDatas.customerData=req.session.userData
    }

    res.render('customer/index',renderDatas)
    
    
    
  } catch (error) {
    next(error)
  }
}



let filterRender={}

let apple=false
let samsung=false
let oneplus=false
let realme=false

let mobiles=false
let laptops=false
let tv=false
let tablets=false

const getProducts=async function(req,res,next) {
  try {
    const reqQuery=req.query
    console.log(req.query);
    const renderDatas={}
    renderDatas.wishlist=false

    renderDatas.apple=apple
    renderDatas.samsung=samsung
    renderDatas.oneplus=oneplus
    renderDatas.realme=realme

    renderDatas.mobiles=mobiles
    renderDatas.laptops=laptops
    renderDatas.tv=tv
    renderDatas.tablets=tablets

    renderDatas.title='Digitron | Products'
    renderDatas.layout='customer-layout'

    if(!req.session.userData){
      await Promise.all([
        categoryDb.activeCategory(renderDatas),
        brandDb.activeBrand(renderDatas),
        filterDb.filter(reqQuery,renderDatas)
      ])
      
    }
   
    if(req.session.userData){
      const {_id}=req.session.userData
      await Promise.all([
        categoryDb.activeCategory(renderDatas),
        brandDb.activeBrand(renderDatas),
        filterDb.filter(reqQuery,renderDatas,_id),
        cartDb.counter(_id,renderDatas)
      ])
        renderDatas.customerLogin=true,
        renderDatas.customerData=req.session.userData
    }
    if(!filterRender.filterData){
      filterRender={...renderDatas}
      res.render('customer/products',filterRender)
    }
    if(filterRender.filterData){
      filterRender={filterRender,...renderDatas}
      filterRender.productData=false
      res.render('customer/products',filterRender)
    }
    apple=false
    samsung=false
    oneplus=false
    realme=false

    mobiles=false
    laptops=false
    tv=false
    tablets=false
    
    
    
  } catch (error) {
    next(error)
  }
}


//single view

const singleView=async(req,res,next)=>{
  try {
    const renderDatas={}
    if(req.session.userData){
      const{_id}=req.session.userData
      renderDatas.customerData=req.session.userData
      renderDatas.customerLogin=true
      await cartDb.counter(_id,renderDatas)
      
    }
    const prodId=req.params.id
    const productData=await Product.aggregate(
      [
        {
          '$match': {
            _id:ObjectId(prodId)
          }
        },
        {
          '$lookup': {
            'from': 'categories', 
            'localField': 'category', 
            'foreignField': '_id', 
            'as': 'categoryLookup'
          }
        },
        {
          '$unwind': {
            'path':'$categoryLookup'
          }
        }
      ]
    )
    console.log(productData[0].productPictures[0].filename);
    renderDatas.productData=productData
    renderDatas.layout='customer-layout'
    res.render('customer/single-view',renderDatas)
  } catch (error) {
    next(error)
  }
}

//featured brands
const getStore=(req,res,next)=>{
  const store=req.params.id
  if(!store){
    next(error)
  }
  if(store==='apple'){
    apple=true
  }
  if(store==='samsung'){
    samsung=true
  }
  if(store==='oneplus'){
    oneplus=true
  }
  if(store==='realme'){
    realme=true
  }
  if(store==='mobiles'){
    mobiles=true
  }
  if(store==='laptops'){
    laptops=true
  }
  if(store==='tv'){
    tv=true
  }
  if(store==='tablets'){
    tablets=true
  }
  res.redirect('/products')
}


const filter=async(req,res,next)=>{
  try {
    const reqQuery=req.query
    const renderDatas={}
    renderDatas.wishlist=false
    if(!req.session.userData){
      await filterDb.filter(reqQuery,renderDatas)
    }
    if(req.session.userData){
      const {_id}=req.session.userData
      await filterDb.filter(reqQuery,renderDatas,_id)
    }
    filterRender={...renderDatas}
    if(renderDatas.filter){
      res.json({filter:true})
    }else{
      res.json({filter:false})
    }
  } catch (error) {
    next(error)
  }
}





const getCategoryPage=async(req,res,next)=>{
  try {
    const renderDatas={}

    await categoryDb.activeCategory(renderDatas)
    const catName=req.params.catName
    await productDb.activeProduct(catName,renderDatas)

        if(renderDatas.noActiveProducts){
          res.sendStatus(404)
        }

        renderDatas.layout='customer-layout'
        renderDatas.customerLogin=false

        if (req.session.userData){
          const {_id}=req.session.userData
          await cartDb.counter(_id,renderDatas)
          renderDatas.customerData=req.session.userData
          renderDatas.customerLogin=true
        }
       
       
    res.render('customer/category',renderDatas)
  } catch (error) {
    next(error)
  }
  
}


const getProfile=async(req,res,next)=>{
  try {
    const renderDatas={}
    renderDatas.title='Digitron | Profile'
    renderDatas.layout='customer-layout'
    renderDatas.customerData=req.session.userData
    const {_id}=req.session.userData
    await cartDb.counter(_id,renderDatas)
    res.render('customer/profile',renderDatas)
  
  } catch (error) {
    next(error)
  }
}



//get cart
const getCart=async(req,res,next)=>{
  try {
    const renderDatas={}
    renderDatas.title='ElectronDigital | Cart'
    const {_id}=req.session.userData
    await categoryDb.activeCategory(renderDatas)
    await cartDb.counter(_id,renderDatas)
    await cartDb.getCartPromise(_id,renderDatas)
    await cartDb.subTotal(_id,renderDatas)
    renderDatas.customerData=req.session.userData
    renderDatas.layout='customer-layout'
    res.render('customer/cart',renderDatas)
    } catch (error) {
    next(error)
  }
  
}


//cart action
const cartAction=async(req,res,next)=>{
  try {
    const action=req.params.action
    console.log(action);
    if(action==='add'||action==='remove'||action==='delete'||action==='wAdd'){
      const prodId=req.params.id
      const {_id}=req.session.userData
      const response=await cartDb.cartUpdation(_id,prodId,action)
      res.json({demoQty:response.demoQty})
      }

    } catch (error) {
    next(error)
  }
  

}



//get wishlist
const wishlist=async(req,res,next)=>{
  try {
    const reqQuery=req.query
    const renderDatas={}
    renderDatas.wishlist=true
    renderDatas.title='hexashop|home'
    renderDatas.layout='customer-layout'
    
    const {_id}=req.session.userData
      await Promise.all([
        categoryDb.activeCategory(renderDatas),
        
        cartDb.counter(_id,renderDatas)
      ])
      const data=await filterDb.filter(reqQuery,renderDatas,_id)
      console.log(data);

        renderDatas.customerLogin=true,
        renderDatas.customerData=req.session.userData
      
        res.render('customer/wishlist',renderDatas)
    
    
    
    
  } catch (error) {
    next(error)
  }
}





//wishlist action
const wishlistAction=async(req,res,next)=>{
  try {
    const {_id}=req.session.userData
    const prodId=req.params.id
    const response=await wishlistDb.wishlistUpdation(_id,prodId)
    console.log(response);
    res.json({wishList:response.wishList})
    } catch (error) {
    next(error)
  }
  

}



const getAddressPage=async(req,res,next)=>{
  try {
  const renderDatas={}
  renderDatas.title='hexashop|address'
  renderDatas.layout='customer-layout'
  const {_id}=req.session.userData
  await Promise.all([
    categoryDb.activeCategory(renderDatas),
    cartDb.counter(_id,renderDatas)
  ])
  renderDatas.customerLogin=true,
  renderDatas.customerData=req.session.userData
  res.render('customer/address',renderDatas)
  } catch (error) {
    next(error)
  } 
}



const postAddress=async(req,res,next)=>{
  try {
  const {_id}=req.session.userData
  console.log(req.body);
  console.log(_id);
  await userDb.saveAddress(req.body,_id)
  res.redirect('/checkout')
  } catch (error) {
    next(error)
  }
}



const getSelectAddress=async(req,res,next)=>{
  try {
  const renderDatas={}
  renderDatas.title='hexashop|address'
  renderDatas.layout='customer-layout'
  const {_id}=req.session.userData
  await Promise.all([
    categoryDb.activeCategory(renderDatas),
    cartDb.counter(_id,renderDatas),
    userDb.getAddress(_id,renderDatas),
    cartDb.subTotal(_id,renderDatas)
  ])

  renderDatas.customerLogin=true,
  renderDatas.customerData=req.session.userData
  res.render('customer/checkout',renderDatas)
  } catch (error) {
    next(error)
  }
}



const placeOrder=async(req,res,next)=>{
  try {
  const{_id}=req.session.userData
  const orderData=await orderDb.createOrder(req.body,_id,req)
  req.session.items=orderData.items
  if(!req.body.payment){
    throw  console.error();
  }
  if(req.body.payment==='online'){
    const order=await orderDb.generateRazorpay(orderData.newOrder)
    res.json({payment:'pending',order:order})
  }
  if(req.body.payment==='cod'){
    res.json({payment:'ok'})
  }
  } catch (error) {
    next(error)
  }
}



const verifyPayment=async(req,res,next)=>{
  try {
    const renderDatas={}
    renderDatas.title='hexashop|orders'
    renderDatas.layout='customer-layout'
    const {_id}=req.session.userData
  await Promise.all([
    categoryDb.activeCategory(renderDatas),
    cartDb.counter(_id,renderDatas),
    userDb.getAddress(_id,renderDatas),
    orderDb.verifyPayment(req.body,renderDatas,_id,req.session.items)
  ])

  renderDatas.customerLogin=true,
  renderDatas.customerData=req.session.userData

    if(renderDatas.verification){
      res.json({payment:'ok'})
    }else{

    }

  } catch (error) {
    next(error)
  }

}



const orders=async(req,res,next)=>{
  try {
    const renderDatas={}
    renderDatas.title='hexashop|orders'
    renderDatas.layout='customer-layout'
    const {_id}=req.session.userData
  await Promise.all([
    categoryDb.activeCategory(renderDatas),
    cartDb.counter(_id,renderDatas),
    userDb.getAddress(_id,renderDatas),
    orderDb.orders(_id,renderDatas)
  ])

  renderDatas.customerLogin=true,
  renderDatas.customerData=req.session.userData
  res.render('customer/orders',renderDatas)

  } catch (error) {
    next(error)
  }

}


const orderSuccess=async(req,res,next)=>{
  try {
  const renderDatas={}
  renderDatas.title='hexashop|orders'
  renderDatas.layout='customer-layout'
  const {_id}=req.session.userData
  await cartDb.counter(_id,renderDatas)
  renderDatas.customerLogin=true,
  renderDatas.customerData=req.session.userData
  res.render('customer/order-success',renderDatas)
  } catch (error) {
    next(error)
  }
}



const invoice=async(req,res,next)=>{
  try {
    const{orderId,productId,addressId}=req.params
    const renderDatas={}
    const invoiceFirst=orderId.slice(20,24)
    const invoiceSecond=productId.slice(20,24)
    const temp=`${invoiceFirst}${invoiceSecond}`
    const invoiceId=temp.toUpperCase()
    renderDatas.invoiceId=invoiceId
    const {_id}=req.session.userData
    const invoiceData=await orderDb.invoice(orderId,productId,addressId,_id)
    renderDatas.invoiceData=invoiceData
    renderDatas.layout='customer-layout'
    res.render('customer/invoice',renderDatas)
  } catch (error) {
    next(error)
  }
}



  


  module.exports=
    {
      getHome,
      getStore,
      getProducts,
      singleView,
      getCategoryPage,
      cartAction,
      getCart,
      wishlist,
      wishlistAction,
      getProfile,
      filter,
      getAddressPage,
      postAddress,
      getSelectAddress,
      placeOrder,
      verifyPayment,
      orders,
      orderSuccess,
      invoice
    }