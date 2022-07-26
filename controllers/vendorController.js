require('../config/connection')
const Category = require("../models/category");
const Product = require("../models/product");
const User = require("../models/user");
const slugify = require("slugify");
const ObjectId=require('bson-objectid')
const orderDb=require('../helpers/dbqueries/db-order');
const categoryDb=require('../helpers/dbqueries/db-categories');





const getVendor = async(req,res,next) => {
  try {
    const {fullName}=req.session.userData
    res.render("vendor/vendor", { layout:'vendor-layout',title:'Vendor Dashboard',fullName});
  } catch (error) {
    next(error)
  }
  
}

let catUpReq=false
let newCatReq=false
const manageProducts = async (req,res,next) => {
  try {
  const renderDatas={}
  const {_id}=req.session.userData

  const[activeCatData,inactiveCatData]=await Promise.all(
    [categoryDb.vendorActiveCat(_id),
    categoryDb.vendorInactiveCat(_id)])
    console.log(activeCatData);

    renderDatas.activeCatData=activeCatData
    renderDatas.inactiveCatData=inactiveCatData
    renderDatas.title='Electron Digital|Admin Panel'
    renderDatas.layout='vendor-layout'
    renderDatas.categoryExist=categoryExist
    renderDatas.catUpReq=catUpReq
    renderDatas.newCatReq=newCatReq

  res.render("vendor/manage-products",renderDatas);
  categoryExist = false;
  catUpReq=false
  newCatReq=false
  } catch (error) {
    next(error)
  }
}


const addCategory = async (req,res,next) => {
  try {
    const { _id } = req.session.userData
    console.log(_id);
    const exists = await Category.exists({ name: req.body.category });
    if (exists) {
      categoryExist = true;
      res.redirect("/vendor/manage-products");
    } else {
      const categoryObj = {
        name: req.body.category,
        slug: slugify(req.body.category),
        requestedBy:_id
      };

      if (req.body.parentId) {
        categoryObj.parentId = req.body.parentId;
      }
      const newCategory = await new Category(categoryObj);
      newCategory.save().then(() => {
        newCatReq=true
        res.redirect("/vendor/manage-products");
      });
    }
  } catch (error) {
    next(error)
  }
  
}

//category update request
var categoryExist = false;
const updateCatReq = async (req,res,next) => {
  try {
  const id = req.params.id
  const editTo = req.body.editTo;
  var exists = await Category.exists({ name: editTo });
  if (exists) {
    categoryExist = true;
    res.redirect("/vendor/manage-products");
  } else {
    await Category.updateOne(
      { name: id },
      { $set: { editTo: editTo, edit: true } }
    );
    catUpReq=true
    res.redirect("/vendor/manage-products");
  }
  } catch (error) {
    next(error)
  }
}

const viewProducts = async function (req, res,next) {
  try {
    const id = req.params.id;
    const categoryData = await Category.findOne({ name: id });
    const name = categoryData.name;
    const user=req.session.userData
    const userData=await User.findOne({email:user.email})
    const userId=userData._id
    const productData = await Product.aggregate([{ $match: { category:categoryData._id,blocked:false,createdBy:userId} }]);
  
    if(productData){
  
      res.render("vendor/view-products", {
        layout:'vendor-layout',
        name,
        id,
        productData,
    });
  
    }else{
  
      res.render("vendor/view-products", {
        layout:'vendor-layout',
        name,
        id,
        productData,
    
    
      });
  
    }
  } catch (error) {
    next(error)
  }
}

const addProductPage = function name(req, res) {
  const id = req.params.id;
  res.render("vendor/add-product", { layout:'vendor-layout', id });
};

const addProduct = async function(req,res,next) {
  try {
  let id = req.params.id;
  const user=req.session.userData
  const userData=await User.findOne({email:user.email})
  const userId=userData._id
  const files = req.files;

  const productObj = {
    name: req.body.name,
    slug: slugify(req.body.name),
    price: req.body.price,
    quantity: req.body.quantity,
    description: req.body.description,
    brandName:req.body.brandName,
    productPictures: files,
    createdBy:userId
  };

  if(req.params.id==='new'){
    
    const catData=await Category.findOne({name:req.body.category})
    const catId=catData._id
    console.log(catId);
    id=catId
    productObj.category=catId
  }else{
    productObj.category=id
  }
  console.log(productObj);

  const newProduct = await new Product(productObj);
  newProduct.save().then(
    () => {
      console.log("success");
      res.redirect("/vendor/view-products/" + id);
    },
    () => {
      console.log("failed");
      res.redirect("/vendor/view-products/" + id);
    }
  );

  } catch (error) {
    next(error)
  }
  
  };

  const pdtAddingPage = async function name(req,res,next) {
    try {
    const renderDatas={}
    renderDatas.layout='vendor-layout'
    const categoryData=await Category.aggregate([{$match:{}}])
    renderDatas.categoryData=categoryData
    res.render("vendor/new-pdt",renderDatas);
    } catch (error) {
      next(error)
    }
  };

  const updateProductPage=async(req,res,next)=>{
    try {
      const prodId=req.params.id
      const renderDatas={}
      renderDatas.layout='vendor-layout'
      const productData=await Product.aggregate([{$match:{_id:ObjectId(prodId)}}])
      renderDatas.productData=productData
      console.log(renderDatas.productData);
      res.render('vendor/update-product',renderDatas)
    } catch (error) {
      next(error)
    }
  }


  const updateProduct=async (req,res,next)=>{
    try {
      const prodId=req.params.id;
      console.log(prodId);
      const files=req.files;

      const productObj = {
        name: req.body.name,
        slug: slugify(req.body.name),
        price: req.body.price,
        quantity: req.body.quantity,
        description: req.body.description,
        brandName:req.body.brandName,
        productPictures: files
      };
      const updatedData=await Product.updateOne
      (
        {_id:ObjectId(prodId)},
        {$set:productObj}
      )
      res.redirect('/single-view/'+updatedData._id)
    
    } catch (error) {
      next(error)
    }
  }

  const blockProduct=function (req,res,next) {
    try {
    const id=req.params.id
    const catId=req.params.catId
    // console.log(id);
    // console.log(catId);
    Product.updateOne({_id:id},{$set:{blocked:true}}).then((data)=>{
      console.log('success');
      res.redirect('/vendor/view-products/'+ catId)
    },(error)=>{
      console.log('errorrere');
    })
    } catch (error) {
      next(error)
    }
  }

  const blockedProducts=async function (req,res,next) {
    try {
    const user=req.session.userData
    const userData=await User.findOne({email:user.email})
    const userId=userData._id
    console.log(userId);
    const blockedProdsTable=Product.aggregate([
      {
        '$match': {
          'blocked': true,
          'createdBy':ObjectId(userId)
        }
      }, {
        '$lookup': {
          'from': 'categories', 
          'localField': 'category', 
          'foreignField': '_id', 
          'pipeline': [
            {
              '$project': {
                '_id': 0, 
                'name': 1, 
                'blocked': 1
              }
            }
          ], 
          'as': 'results'
        }
      }, {
        '$unwind': {
          'path': '$results'
        }
      }, {
        '$match': {
          'results.blocked': false
        }
      }, {
        '$group': {
          '_id': {
            'name': '$results.name'
          }
        }
      }
    ])

   

    blockedProdsTable.then((blockedProdCat)=>{
      console.log(blockedProdCat);
      
      const data=blockedProdCat.map(async(objects)=>{
         const reqCat= objects._id.name
         const catObj=await Category.findOne({name:reqCat})
         console.log(catObj);
        
      })
    })
    } catch (error) {
      next(error)
    }
  }

  const orders=async(req,res,next)=>{
    try {
    const {_id,fullName}=req.session.userData
    const renderDatas={}
    renderDatas.layout='vendor-layout'
    renderDatas.fullName=fullName

    await orderDb.vendorOrders(_id,renderDatas)
    res.render('vendor/orders',renderDatas)
    } catch (error) {
      next(error)
    }
  }


  const orderUpdation=async(req,res,next)=>{
    try {
    const action=req.params.action
    const orderId=req.params.orderId
    const prodId=req.params.prodId
    const updation=await orderDb.orderUpdation(action,orderId,prodId)
    res.json({updation})
    } catch (error) {
      next(error)
    }
  }



module.exports = {
  getVendor,
  manageProducts,
  addCategory,
  updateCatReq,
  addProductPage,
  updateProduct,
  updateProductPage,
  pdtAddingPage,
  viewProducts,
  addProduct,
  blockProduct,
  blockedProducts,
  orders,
  orderUpdation
};
