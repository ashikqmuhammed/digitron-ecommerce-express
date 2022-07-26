const Category=require('../../models/category')
const Product=require('../../models/product')
const ObjectId=require('bson-objectid')




const activeCategory=(renderDatas)=>{
  return new Promise(async(resolve,reject)=>{
  try {
    const categoryData=await Category.aggregate
    (
        [
            {
              '$match': {
                'blocked': false
              }
            }, {
              '$lookup': {
                'from': 'products', 
                'localField': '_id', 
                'foreignField': 'category', 
                'as': 'productLookup'
              }
            }, {
              '$unwind': {
                'path': '$productLookup'
              }
            }, {
              '$match': {
                'productLookup.blocked': false
              }
            }, {
              '$lookup': {
                'from': 'users', 
                'localField': 'productLookup.createdBy', 
                'foreignField': '_id', 
                'as': 'vendorLookup'
              }
            }, {
              '$match': {
                'vendorLookup.blocked': false
              }
            }, {
              '$group': {
                '_id': '$name'
              }
            }
          ]
    )

    if(categoryData.length===0){
      renderDatas.noActiveCat=true
    }
    if(categoryData!=0){
      renderDatas.categoryData=categoryData
    }
    resolve(renderDatas)
  } catch (error) {
    reject(error)
  }
  
   
  })
}

const vendorActiveCat=(_id)=>{
 return Product.aggregate(
  [
    {
      '$match': {
        'createdBy': ObjectId(_id)
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
      '$group': {
        '_id': '$categoryLookup.name'
      }
    }
  ]
 )
}
const vendorInactiveCat=(_id)=>{
  return Product.aggregate(
    [
      {
        '$match': {
          'createdBy': ObjectId(_id)
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
          'categoryLookup.blocked': true
        }
      }, {
        '$group': {
          '_id': '$categoryLookup.name'
        }
      }
    ]
   )
}

module.exports={
  activeCategory,
  vendorActiveCat,
  vendorInactiveCat
}