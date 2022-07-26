require('dotenv').config()
const Order=require('../../models/order')
const Cart=require('../../models/cart')
const Product=require('../../models/product')
const Address=require('../../models/address')
const ObjectId=require('bson-objectid')
const cartDb=require('./db-cart')
const Razorpay=require('razorpay')





const createOrder=(body,_id)=>{
    return new Promise(async(resolve,reject)=>{
        try {
            const paymentMode=body.payment
            const addressId=body.addressId
        
            const renderDatas={}
            await Promise.all([
                cartDb.cartActives(_id,renderDatas),
                cartDb.subTotal(_id,renderDatas)
            ])
    
            renderDatas.items.forEach(item => {
                item.orderStatus=[]
                if(paymentMode==='cod'){
                    item.orderStatus.push({
                        type:'placed',
                        date:new Date(),
                        isCompleted:false
                    })
                }
                if(paymentMode==='online'){
                    item.orderStatus.push({
                        type:'pending',
                        date:new Date(),
                        isCompleted:false
                    })
                }

            });
            
            const orderObj={
                customer:_id,
                addressId:addressId,
                totalAmount:renderDatas.cartSubTotal[0].totalAmount,
                items:renderDatas.items
            }
          
        
            if(!paymentMode){
                throw  console.error();
            }
            if(paymentMode==='cod'){
                orderObj.paymentStatus='completed'
                orderObj.paymentType='cod'
            }
            if(paymentMode==='online'){
                orderObj.paymentStatus='pending'
                orderObj.paymentType='online'
            }
        
            const newOrder=await Order.create(orderObj)

            if(paymentMode==='cod'){
                await Cart.deleteOne({customer:_id})
                renderDatas.items.forEach(async(item)=>{
                  const productData= await Product.findOneAndUpdate({_id:item.productId},{$inc:{quantity:-item.purchasedQty}})
                  console.log(productData);
                  if(productData.quantity-item.purchasedQty===0){
                    await Product.updateOne({_id:item.productId},{$set:{outOfStock:true}})
                  }
                })
            }
            renderDatas.newOrder=newOrder
            resolve(renderDatas)

        } catch (error) {
           reject() 
        }
    })
    
}


const generateRazorpay=(newOrder)=>{
    return new Promise(async(resolve,reject)=>{
        try {
            const instance=new Razorpay({
                key_id:process.env.KEY_ID,
                key_secret:process.env.KEY_SECRET
            })
            const options={
                amount: newOrder.totalAmount*100,
                currency: "INR",
                receipt:''+newOrder._id
              }
            const order=await instance.orders.create(options)
            resolve(order)

        } catch (error) {
            reject(error)
        }
        
    }
)
}




const verifyPayment=(body,renderDatas,_id,items)=>{
    return new Promise(async(resolve,reject)=>{
        try {
            const crypto=require('crypto')
            let hmac=crypto.createHmac('sha256',process.env.KEY_SECRET)
            hmac.update(body['payment[razorpay_order_id]']+'|'+body['payment[razorpay_payment_id]'])
            hmac=hmac.digest('hex')
            if(hmac==body['payment[razorpay_signature]']){
                const orderId=body['rpOrder[receipt]']
                const statusUpdate={
                    type:'placed',
                    date:new Date(),
                    isCompleted:false
                }
                
                await Promise
                .all([
                    Order.updateOne
                    ({_id:orderId},
                    {$set:{paymentStatus:'completed'} }),
                    Order.updateOne
                    ({_id:orderId,'items.$[].customer':_id},
                    {$push:{'items.$[].orderStatus':statusUpdate} }),
                    Cart.deleteOne({customer:_id})
                ]) 
                await Cart.deleteOne({customer:_id})
                items.forEach(async(item)=>{
                  const productData= await Product.findOneAndUpdate({_id:item.productId},{$inc:{quantity:-item.purchasedQty}})
                  if(productData.quantity-item.purchasedQty===0){
                    await Product.updateOne({_id:item.productId},{$set:{outOfStock:true}})
                  }
                })
                renderDatas.verification=true
                resolve(renderDatas)
            }else{
                renderDatas.verification=false
                reject(renderDatas)
            }

        } catch (error) {
            reject(error)
        }
        
    }
)
}



const orders=(_id,renderDatas)=>{
    return new Promise(async(resolve,reject)=>{
        try {
          const ordersData=await Order.aggregate(
            [
                {
                  '$match': {
                    'customer':ObjectId(_id)
                  }
                }, {
                  '$unwind': {
                    'path': '$items'
                  }
                }, {
                  '$lookup': {
                    'from': 'products', 
                    'localField': 'items.productId', 
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
                  '$addFields': {
                    'currentStatus': {
                      '$last': '$items.orderStatus'
                    }
                  }
                }, {
                  '$addFields': {
                    'pending': {
                      '$cond': [
                        {
                          '$eq': [
                            'pending', '$currentStatus.type'
                          ]
                        }, true, false
                      ]
                    }
                  }
                }, {
                  '$addFields': {
                    'placed': {
                      '$cond': [
                        {
                          '$eq': [
                            'placed', '$currentStatus.type'
                          ]
                        }, true, false
                      ]
                    }
                  }
                }, {
                  '$addFields': {
                    'packed': {
                      '$cond': [
                        {
                          '$eq': [
                            'packed', '$currentStatus.type'
                          ]
                        }, true, false
                      ]
                    }
                  }
                }, {
                  '$addFields': {
                    'shipped': {
                      '$cond': [
                        {
                          '$eq': [
                            'shipped', '$currentStatus.type'
                          ]
                        }, true, false
                      ]
                    }
                  }
                }, {
                  '$addFields': {
                    'delivered': {
                      '$cond': [
                        {
                          '$eq': [
                            'delivered', '$currentStatus.type'
                          ]
                        }, true, false
                      ]
                    }
                  }
                }, {
                  '$addFields': {
                    'cancelled': {
                      '$cond': [
                        {
                          '$eq': [
                            'cancelled', '$currentStatus.type'
                          ]
                        }, true, false
                      ]
                    }
                  }
                }
              ]
            )  

          renderDatas.ordersData=ordersData
          resolve(renderDatas)
        } catch (error) {
            reject(error)
        }
    })
}



const vendorOrders=(_id,renderDatas)=>{
  return new Promise(async(resolve,reject)=>{
    try {

      const aggregateNewOrders=[
        {
          '$unwind': {
            'path': '$address'
          }
        }, {
          '$lookup': {
            'from': 'orders', 
            'localField': 'address._id', 
            'foreignField': 'addressId', 
            'as': 'orderLookup'
          }
        }, {
          '$unwind': {
            'path': '$orderLookup'
          }
        }, {
          '$unwind': {
            'path': '$orderLookup.items'
          }
        }, {
          '$lookup': {
            'from': 'products', 
            'localField': 'orderLookup.items.productId', 
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
          '$match': {
            'vendorLookup._id':ObjectId(_id)
          }
        }, {
          '$lookup': {
            'from': 'users', 
            'localField': 'customer', 
            'foreignField': '_id', 
            'as': 'customerLookup'
          }
        }, {
          '$unwind': {
            'path': '$customerLookup'
          }
        }, {
          '$addFields': {
            'currentStatus': {
              '$last': '$orderLookup.items.orderStatus'
            }
          }
        }, {
          '$match': {
            'currentStatus.type': {
              '$ne': 'pending'
            }
          }
        }, {
          '$addFields': {
            'placed': {
              '$cond': [
                {
                  '$eq': [
                    'placed', '$currentStatus.type'
                  ]
                }, true, false
              ]
            }
          }
        }, {
          '$addFields': {
            'packed': {
              '$cond': [
                {
                  '$eq': [
                    'packed', '$currentStatus.type'
                  ]
                }, true, false
              ]
            }
          }
        }, {
          '$addFields': {
            'shipped': {
              '$cond': [
                {
                  '$eq': [
                    'shipped', '$currentStatus.type'
                  ]
                }, true, false
              ]
            }
          }
        }, {
          '$addFields': {
            'delivered': {
              '$cond': [
                {
                  '$eq': [
                    'delivered', '$currentStatus.type'
                  ]
                }, true, false
              ]
            }
          }
        }, {
          '$addFields': {
            'cancelled': {
              '$cond': [
                {
                  '$eq': [
                    'cancelled', '$currentStatus.type'
                  ]
                }, true, false
              ]
            }
          }
        }, {
          '$match': {
            'placed': true
          }
        }
      ]

      const aggregatePackedOrders=[
        {
          '$unwind': {
            'path': '$address'
          }
        }, {
          '$lookup': {
            'from': 'orders', 
            'localField': 'address._id', 
            'foreignField': 'addressId', 
            'as': 'orderLookup'
          }
        }, {
          '$unwind': {
            'path': '$orderLookup'
          }
        }, {
          '$unwind': {
            'path': '$orderLookup.items'
          }
        }, {
          '$lookup': {
            'from': 'products', 
            'localField': 'orderLookup.items.productId', 
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
          '$match': {
            'vendorLookup._id': ObjectId(_id)
          }
        }, {
          '$lookup': {
            'from': 'users', 
            'localField': 'customer', 
            'foreignField': '_id', 
            'as': 'customerLookup'
          }
        }, {
          '$unwind': {
            'path': '$customerLookup'
          }
        }, {
          '$addFields': {
            'currentStatus': {
              '$last': '$orderLookup.items.orderStatus'
            }
          }
        }, {
          '$match': {
            'currentStatus.type': {
              '$ne': 'pending'
            }
          }
        }, {
          '$addFields': {
            'placed': {
              '$cond': [
                {
                  '$eq': [
                    'placed', '$currentStatus.type'
                  ]
                }, true, false
              ]
            }
          }
        }, {
          '$addFields': {
            'packed': {
              '$cond': [
                {
                  '$eq': [
                    'packed', '$currentStatus.type'
                  ]
                }, true, false
              ]
            }
          }
        }, {
          '$addFields': {
            'shipped': {
              '$cond': [
                {
                  '$eq': [
                    'shipped', '$currentStatus.type'
                  ]
                }, true, false
              ]
            }
          }
        }, {
          '$addFields': {
            'delivered': {
              '$cond': [
                {
                  '$eq': [
                    'delivered', '$currentStatus.type'
                  ]
                }, true, false
              ]
            }
          }
        }, {
          '$addFields': {
            'cancelled': {
              '$cond': [
                {
                  '$eq': [
                    'cancelled', '$currentStatus.type'
                  ]
                }, true, false
              ]
            }
          }
        }, {
          '$match': {
            'packed': true
          }
        }
      ]

      const aggregateShippedOrders=[
        {
          '$unwind': {
            'path': '$address'
          }
        }, {
          '$lookup': {
            'from': 'orders', 
            'localField': 'address._id', 
            'foreignField': 'addressId', 
            'as': 'orderLookup'
          }
        }, {
          '$unwind': {
            'path': '$orderLookup'
          }
        }, {
          '$unwind': {
            'path': '$orderLookup.items'
          }
        }, {
          '$lookup': {
            'from': 'products', 
            'localField': 'orderLookup.items.productId', 
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
          '$match': {
            'vendorLookup._id':ObjectId(_id)
          }
        }, {
          '$lookup': {
            'from': 'users', 
            'localField': 'customer', 
            'foreignField': '_id', 
            'as': 'customerLookup'
          }
        }, {
          '$unwind': {
            'path': '$customerLookup'
          }
        }, {
          '$addFields': {
            'currentStatus': {
              '$last': '$orderLookup.items.orderStatus'
            }
          }
        }, {
          '$match': {
            'currentStatus.type': {
              '$ne': 'pending'
            }
          }
        }, {
          '$addFields': {
            'placed': {
              '$cond': [
                {
                  '$eq': [
                    'placed', '$currentStatus.type'
                  ]
                }, true, false
              ]
            }
          }
        }, {
          '$addFields': {
            'packed': {
              '$cond': [
                {
                  '$eq': [
                    'packed', '$currentStatus.type'
                  ]
                }, true, false
              ]
            }
          }
        }, {
          '$addFields': {
            'shipped': {
              '$cond': [
                {
                  '$eq': [
                    'shipped', '$currentStatus.type'
                  ]
                }, true, false
              ]
            }
          }
        }, {
          '$addFields': {
            'delivered': {
              '$cond': [
                {
                  '$eq': [
                    'delivered', '$currentStatus.type'
                  ]
                }, true, false
              ]
            }
          }
        }, {
          '$addFields': {
            'cancelled': {
              '$cond': [
                {
                  '$eq': [
                    'cancelled', '$currentStatus.type'
                  ]
                }, true, false
              ]
            }
          }
        }, {
          '$match': {
            'shipped': true
          }
        }
      ]

      const aggregateDeliveredOrders=[
        {
          '$unwind': {
            'path': '$address'
          }
        }, {
          '$lookup': {
            'from': 'orders', 
            'localField': 'address._id', 
            'foreignField': 'addressId', 
            'as': 'orderLookup'
          }
        }, {
          '$unwind': {
            'path': '$orderLookup'
          }
        }, {
          '$unwind': {
            'path': '$orderLookup.items'
          }
        }, {
          '$lookup': {
            'from': 'products', 
            'localField': 'orderLookup.items.productId', 
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
          '$match': {
            'vendorLookup._id': ObjectId(_id)
          }
        }, {
          '$lookup': {
            'from': 'users', 
            'localField': 'customer', 
            'foreignField': '_id', 
            'as': 'customerLookup'
          }
        }, {
          '$unwind': {
            'path': '$customerLookup'
          }
        }, {
          '$addFields': {
            'currentStatus': {
              '$last': '$orderLookup.items.orderStatus'
            }
          }
        }, {
          '$match': {
            'currentStatus.type': {
              '$ne': 'pending'
            }
          }
        }, {
          '$addFields': {
            'placed': {
              '$cond': [
                {
                  '$eq': [
                    'placed', '$currentStatus.type'
                  ]
                }, true, false
              ]
            }
          }
        }, {
          '$addFields': {
            'packed': {
              '$cond': [
                {
                  '$eq': [
                    'packed', '$currentStatus.type'
                  ]
                }, true, false
              ]
            }
          }
        }, {
          '$addFields': {
            'shipped': {
              '$cond': [
                {
                  '$eq': [
                    'shipped', '$currentStatus.type'
                  ]
                }, true, false
              ]
            }
          }
        }, {
          '$addFields': {
            'delivered': {
              '$cond': [
                {
                  '$eq': [
                    'delivered', '$currentStatus.type'
                  ]
                }, true, false
              ]
            }
          }
        }, {
          '$addFields': {
            'cancelled': {
              '$cond': [
                {
                  '$eq': [
                    'cancelled', '$currentStatus.type'
                  ]
                }, true, false
              ]
            }
          }
        }, {
          '$match': {
            'delivered': true
          }
        }
      ]

      const aggregateCancelledOrders=[
        {
          '$unwind': {
            'path': '$address'
          }
        }, {
          '$lookup': {
            'from': 'orders', 
            'localField': 'address._id', 
            'foreignField': 'addressId', 
            'as': 'orderLookup'
          }
        }, {
          '$unwind': {
            'path': '$orderLookup'
          }
        }, {
          '$unwind': {
            'path': '$orderLookup.items'
          }
        }, {
          '$lookup': {
            'from': 'products', 
            'localField': 'orderLookup.items.productId', 
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
          '$match': {
            'vendorLookup._id': ObjectId(_id)
          }
        }, {
          '$lookup': {
            'from': 'users', 
            'localField': 'customer', 
            'foreignField': '_id', 
            'as': 'customerLookup'
          }
        }, {
          '$unwind': {
            'path': '$customerLookup'
          }
        }, {
          '$addFields': {
            'currentStatus': {
              '$last': '$orderLookup.items.orderStatus'
            }
          }
        }, {
          '$match': {
            'currentStatus.type': {
              '$ne': 'pending'
            }
          }
        }, {
          '$addFields': {
            'placed': {
              '$cond': [
                {
                  '$eq': [
                    'placed', '$currentStatus.type'
                  ]
                }, true, false
              ]
            }
          }
        }, {
          '$addFields': {
            'packed': {
              '$cond': [
                {
                  '$eq': [
                    'packed', '$currentStatus.type'
                  ]
                }, true, false
              ]
            }
          }
        }, {
          '$addFields': {
            'shipped': {
              '$cond': [
                {
                  '$eq': [
                    'shipped', '$currentStatus.type'
                  ]
                }, true, false
              ]
            }
          }
        }, {
          '$addFields': {
            'delivered': {
              '$cond': [
                {
                  '$eq': [
                    'delivered', '$currentStatus.type'
                  ]
                }, true, false
              ]
            }
          }
        }, {
          '$addFields': {
            'cancelled': {
              '$cond': [
                {
                  '$eq': [
                    'cancelled', '$currentStatus.type'
                  ]
                }, true, false
              ]
            }
          }
        }, {
          '$match': {
            'cancelled': true
          }
        }
      ]

      if(_id===null){
        aggregateNewOrders.splice(8,1)
        aggregatePackedOrders.splice(8,1)
        aggregateShippedOrders.splice(8,1)
        aggregateDeliveredOrders.splice(8,1)
        aggregateCancelledOrders.splice(8,1)
      }

      const
      [
        newOrders,
        packedOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders
      ]
      =
      await Promise.all([
        Address.aggregate(aggregateNewOrders),
        Address.aggregate(aggregatePackedOrders),
        Address.aggregate(aggregateShippedOrders),
        Address.aggregate(aggregateDeliveredOrders),
        Address.aggregate(aggregateCancelledOrders)
        ]) 
      
      renderDatas.newOrders=newOrders
      renderDatas.packedOrders=packedOrders
      renderDatas.shippedOrders=shippedOrders
      renderDatas.deliveredOrders=deliveredOrders
      renderDatas.cancelledOrders=cancelledOrders
      
      console.log(packedOrders);

      resolve(renderDatas)

    } catch (error) {
      reject(error)
    }
  })
}

const orderUpdation=(action,orderId,prodId)=>{

  return new Promise(async(resolve,reject)=>{
    try {
      let statusUpdate;

    if(action==='packed'){
      statusUpdate={
        type:'packed',
        date:new Date(),
        isCompleted:false
      }
    }
    if(action==='shipped'){
      statusUpdate={
        type:'shipped',
        date:new Date(),
        isCompleted:false
      }
    }
    if(action==='delivered'){
      statusUpdate={
        type:'delivered',
        date:new Date(),
        isCompleted:true
      }
    }
    if(action==='cancelled'){
      statusUpdate={
        type:'cancelled',
        date:new Date(),
        isCompleted:false
      }
    }

    await Order.updateOne
          ({_id:orderId,'items.productId':prodId},
          {$push:{'items.$.orderStatus':statusUpdate} })
    const updation=true
    resolve(updation)
    } catch (error) {
      reject(error)
    }
    
  })

}



module.exports={
    createOrder,
    generateRazorpay,
    verifyPayment,
    orders,
    vendorOrders,
    orderUpdation
}