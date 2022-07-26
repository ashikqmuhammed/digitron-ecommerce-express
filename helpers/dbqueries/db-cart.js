
const Cart=require('../../models/cart')
// const Wishlist=require('../models/wishlist')
const ObjectId=require('bson-objectid')

const cartUpdation=(_id,prodId,action)=>{
  return new Promise(async(resolve,reject)=>{
    try {
      //wishlist to cart
      if(action==='wAdd'){
        await Wishlist.updateOne({
          customer: _id
        },
        {
          "$pull": {
            wishlistItems: {
              product: prodId
            }
          }
        })
      
        
      }
      //direct to cart
      const cartData= await Cart.findOne({customer:_id})
      if(cartData===null){
        const cartObj={
          customer:_id,
          cartItems:[{product:prodId}]
        }
        await Cart.create
        (
          cartObj
        )
        const response={demoQty:'new'}
        resolve(response)
      }
      //checking weather product exist
      const productExist=cartData.cartItems.find(c=>c.product==prodId)
      //if no product exist and cart exist
      if(cartData&&!productExist){
        
      await Cart.updateOne
        (
          {customer:_id},
          {$push:{cartItems:{product:prodId}}}
        )
        
        const response={demoQty:'new'}
        resolve(response)
        
      }
      //if product and cart exist
      if(cartData&&productExist){
      //quantity at one
      if(action==='remove'&&productExist.quantity==1||action==='delete'){
        await Cart.updateOne({
          customer: _id
        },
        {
          "$pull": {
            cartItems: {
              product: prodId
            }
          }
        })
        const response={demoQty:'deleted'}
        resolve(response)
      }
      //add existing product
      if(action==='add' ||action==='wAdd'){
        await Cart.updateOne
        (
          {"customer":_id,"cartItems.product":prodId},
          {
            "$set":{"cartItems.$.quantity":productExist.quantity+1}
          }
        )
        const response={demoQty:'existingAdded'}
        resolve(response)
      }
      //remove existing product
      if(action==='remove'&&productExist.quantity!=1){
        await Cart.updateOne
        (
          {"customer":_id,"cartItems.product":prodId},
          {
            "$set":{"cartItems.$.quantity":productExist.quantity-1}
          }
        )
        const response={demoQty:'existingRemoved'}
        resolve(response)
      }  
      
      }
   
     
      
    } catch (error) {
      reject(error)
    }
    
     
    })


 
  

    // const cart=await Cart.create({customer:_id,cartItems:[{product:prodId}]})
    // resolve(cart)
    // try {
    //   console.log(_id);
    //   console.log('abc');
    //   console.log(prodId);
    //   const cartData=await Cart.findOne({customer:ObjectId(_id)})
    // if(cartData){
    //  await Cart.updateOne
    //   (
    //     {customer:_id},
    //     {cartItems:
    //       {
    //         $push:{product:ObjectId(prodId)}
    //       }
    //     }
    //   )
    //   resolve()
    // }else{
    
    //   const cartObj=
    //               {
    //                 customer:_id,
    //                 cartItems:[ObjectId(prodId)]
    //               }
    //   const cartData=await Cart.create(cartObj)
    //   resolve(cartData)
    // }
    // } catch (error) {
    //   reject()
    // }
    
  
    
}




const counter=(userId,renderDatas)=>{
  return new Promise(async(resolve,reject)=>{
    try {
      const cart=await Cart.findOne({customer:userId})
      if(cart===null){
        const count=0
        renderDatas.count=count
      }
      if(cart){
        const count =cart.cartItems.length
        renderDatas.count=count
      }
      
      resolve(renderDatas)
    } catch (error) {
      reject(error)
    }
   
  })
}


const getCartPromise=(_id,renderDatas)=>{
  return new Promise(async(resolve,reject)=>{
    try {
      let cartData=await Cart.aggregate
      (
        [
          {
            '$match': {
              'customer': ObjectId(_id)
            }
          }, {
            '$unwind': {
              'path': '$cartItems'
            }
          }, {
            '$lookup': {
              'from': 'products', 
              'localField': 'cartItems.product', 
              'foreignField': '_id', 
              'as': 'productLookup'
            }
          }, {
            '$unwind': {
              'path': '$productLookup'
            }
          }, {
            '$lookup': {
              'from': 'users', 
              'localField': 'productLookup.createdBy', 
              'foreignField': '_id', 
              'as': 'vendorLookup'
            }
          }, {
            '$unwind': {
              'path': '$vendorLookup'
            }
          }, {
            '$lookup': {
              'from': 'categories', 
              'localField': 'productLookup.category', 
              'foreignField': '_id', 
              'as': 'categoryLookup'
            }
          }, {
            '$unwind': {
              'path': '$categoryLookup'
            }
          }, {
            '$addFields': {
              'total': {
                '$multiply': [
                  '$cartItems.quantity', '$productLookup.price'
                ]
              }
            }
          }, {
            '$project': {
              'cartItems': 1, 
              'total': 1, 
              'productLookup': 1, 
              'vendorLookup': 1,
              'categoryLookup': 1,
              '_id': 0
            }
          }
        ]
      )
      const qtyChecking=cartData.filter((item)=>{
        if(item.cartItems.quantity>item.productLookup.quantity){
          return item.productLookup._id
      }
      })
      
      
      console.log(qtyChecking);
      if(qtyChecking.length===0){
        renderDatas.cartData=cartData
        renderDatas.updated=false
        resolve(renderDatas) 
      }
      if(qtyChecking.length>0){
        qtyChecking.forEach(async(item)=>{
          await Cart.updateOne
          (
            {"customer":_id,"cartItems.product":item.productLookup._id},
            {
              "$set":{"cartItems.$.quantity":item.productLookup.quantity}
            }
          )
          renderDatas.updated=true
          item.cartItems.quantity=item.productLookup.quantity
        })

        const cartUpdatedData=await Cart.aggregate
        (
        [
          {
            '$match': {
              'customer': ObjectId(_id)
            }
          }, {
            '$unwind': {
              'path': '$cartItems'
            }
          }, {
            '$lookup': {
              'from': 'products', 
              'localField': 'cartItems.product', 
              'foreignField': '_id', 
              'as': 'productLookup'
            }
          }, {
            '$unwind': {
              'path': '$productLookup'
            }
          }, {
            '$lookup': {
              'from': 'users', 
              'localField': 'productLookup.createdBy', 
              'foreignField': '_id', 
              'as': 'vendorLookup'
            }
          }, {
            '$unwind': {
              'path': '$vendorLookup'
            }
          }, {
            '$lookup': {
              'from': 'categories', 
              'localField': 'productLookup.category', 
              'foreignField': '_id', 
              'as': 'categoryLookup'
            }
          }, {
            '$unwind': {
              'path': '$categoryLookup'
            }
          }, {
            '$addFields': {
              'total': {
                '$multiply': [
                  '$cartItems.quantity', '$productLookup.price'
                ]
              }
            }
          }, {
            '$project': {
              'cartItems': 1, 
              'total': 1, 
              'productLookup': 1, 
              'vendorLookup': 1,
              'categoryLookup': 1,
              '_id': 0
            }
          }
        ]
        )
      renderDatas.cartData=cartUpdatedData
      resolve(renderDatas)  
      }


    } catch (error) {
      reject(error)
    }
    
  })
}


const subTotal=(_id,renderDatas)=>{
  return new Promise(async(resolve,reject)=>{
    try {
      const cartSubTotal=await Cart.aggregate
      (
        [
            {
              '$match': {
                'customer': new ObjectId(_id)
              }
            }, {
              '$unwind': {
                'path': '$cartItems'
              }
            }, {
              '$lookup': {
                'from': 'products', 
                'localField': 'cartItems.product', 
                'foreignField': '_id', 
                'as': 'productLookup'
              }
            }, {
              '$unwind': {
                'path': '$productLookup'
              }
            }, {
              '$lookup': {
                'from': 'users', 
                'localField': 'productLookup.createdBy', 
                'foreignField': '_id', 
                'as': 'vendorLookup'
              }
            }, {
              '$unwind': {
                'path': '$vendorLookup'
              }
            }, {
              '$lookup': {
                'from': 'categories', 
                'localField': 'productLookup.category', 
                'foreignField': '_id', 
                'as': 'categoryLookup'
              }
            }, {
              '$unwind': {
                'path': '$categoryLookup'
              }
            }, {
              '$match': {
                'productLookup.blocked': false, 
                'vendorLookup.blocked': false, 
                'categoryLookup.blocked': false, 
                'productLookup.outOfStock': false
              }
            
            }, {
              '$addFields': {
                'total': {
                  '$multiply': [
                    '$cartItems.quantity', '$productLookup.price'
                  ]
                }
              }
            }, {
              '$group': {
                '_id': null, 
                'subTotal': {
                  '$sum': '$total'
                }
              }
            }, {
              '$addFields': {
                'totalAmount': {
                  '$add': [
                    '$subTotal', 40
                  ]
                }
              }
            }
          ]
      )
    
      renderDatas.cartSubTotal=cartSubTotal
      resolve(renderDatas)
    } catch (error) {
      reject(error)
    }
    
  })
}

const cartActives=(_id,renderDatas)=>{
  return new Promise(async(resolve,reject)=>{
    try {
      const items=await Cart.aggregate
      (
        [
          {
            '$match': {
              'customer': new ObjectId(_id)
            }
          }, {
            '$unwind': {
              'path': '$cartItems'
            }
          }, {
            '$lookup': {
              'from': 'products', 
              'localField': 'cartItems.product', 
              'foreignField': '_id', 
              'as': 'productLookup'
            }
          }, {
            '$unwind': {
              'path': '$productLookup'
            }
          }, {
            '$lookup': {
              'from': 'users', 
              'localField': 'productLookup.createdBy', 
              'foreignField': '_id', 
              'as': 'vendorLookup'
            }
          }, {
            '$unwind': {
              'path': '$vendorLookup'
            }
          }, {
            '$lookup': {
              'from': 'categories', 
              'localField': 'productLookup.category', 
              'foreignField': '_id', 
              'as': 'categoryLookup'
            }
          }, {
            '$unwind': {
              'path': '$categoryLookup'
            }
          }, {
            '$match': {
              'productLookup.blocked': false, 
              'vendorLookup.blocked': false, 
              'categoryLookup.blocked': false, 
              'productLookup.outOfStock': false
            }
          }, {
            '$addFields': {
              'productId': '$productLookup._id'
            }
          }, {
            '$addFields': {
              'payablePrice': {
                '$multiply': [
                  '$cartItems.quantity', '$productLookup.price'
                ]
              }
            }
          }, {
            '$addFields': {
              'purchasedQty': '$cartItems.quantity'
            }
          }, {
            '$project': {
              '_id': 0, 
              'productId': 1, 
              'payablePrice': 1, 
              'purchasedQty': 1,
              'customer': 1
            }
          }
        ]
      )
    
      renderDatas.items=items
      resolve(renderDatas)
    } catch (error) {
      reject(error)
    }
    
  })
}


module.exports={
                cartUpdation,
                counter,
                getCartPromise,
                subTotal,
                cartActives
              }