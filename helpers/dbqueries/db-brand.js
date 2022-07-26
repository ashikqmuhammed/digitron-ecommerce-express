const Product=require('../../models/product')




const activeBrand=(renderDatas)=>{
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
        '$group': { 
          _id: '$brandName'
        }
      }
    ]

  

    const brandData=await Product.aggregate(aggregateArray)
    if(brandData.length===0){
      renderDatas.noActiveBrands=true
    }
    if(brandData.length!=0){
      renderDatas.brandData=brandData
    }
    resolve(renderDatas)
    
  } catch (error) {
    reject(error)
  }
  
   
  })
}

module.exports={activeBrand}