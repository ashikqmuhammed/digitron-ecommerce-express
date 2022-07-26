const Product=require('../../models/product')




const activeProduct=(catName,renderDatas)=>{
  return new Promise(async(resolve,reject)=>{
  try {
  
    const aggregateArray=[
      {
        '$match': {
          'blocked': false
        }
      }, {
        '$lookup': {
          'from': 'categories', 
          'localField': 'category', 
          'foreignField': '_id', 
          'as': 'categoryLookup'
        }
      }, {
        '$unwind': {
          'path': '$categoryLookup'
        }
      }, {
        '$match': {
          'categoryLookup.blocked': false
        }
      }, {
        '$lookup': {
          'from': 'users', 
          'localField': 'createdBy', 
          'foreignField': '_id', 
          'as': 'vendorLookup'
        }
      }, {
        '$unwind': {
          'path': '$vendorLookup'
        }
      }, {
        '$match': {
          'vendorLookup.blocked': false, 
        }
      }, {
        '$match': { 
          'categoryLookup.name': catName
        }
      }
    ]

    if(catName===null){
      aggregateArray.pop()
    }

    const productData=await Product.aggregate(aggregateArray)
    if(productData.length===0){
      renderDatas.noActiveProducts=true
    }
    if(productData!=0){
      renderDatas.productData=productData
    }
    resolve(renderDatas)
    
  } catch (error) {
    reject(error)
  }
  
   
  })
}

const mostWished=()=>{
  return Product.aggregate(
    [
      {
        '$match': {
          'blocked': false
        }
      }, {
        '$lookup': {
          'from': 'categories', 
          'localField': 'category', 
          'foreignField': '_id', 
          'as': 'categoryLookup'
        }
      }, {
        '$unwind': {
          'path': '$categoryLookup'
        }
      }, {
        '$match': {
          'categoryLookup.blocked': false
        }
      }, {
        '$lookup': {
          'from': 'users', 
          'localField': 'createdBy', 
          'foreignField': '_id', 
          'as': 'vendorLookup'
        }
      }, {
        '$unwind': {
          'path': '$vendorLookup'
        }
      }, {
        '$match': {
          'vendorLookup.blocked': false
        }
      }, {
        '$match': {
          'outOfStock': false
        }
      }, {
        '$addFields': {
          'wishLength': {
            '$size': '$wishedBy'
          }
        }
      }, {
        '$sort': {
          'wishLength': -1
        }
      }, {
        '$limit': 8
      }
    ]
  )
}

module.exports={activeProduct,mostWished}