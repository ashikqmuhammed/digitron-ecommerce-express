const Product=require('../../models/product')
const ObjectId=require('bson-objectid')




const filter=(reqQuery,renderDatas,userId)=>{
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
      }, 
    ]

    if(userId===undefined){
      console.log('no session');
    }
    if(userId){
      aggregateArray.push(
        {
          '$addFields': {
            'wishedBy': {
              '$cond': {
                'if': {
                  '$ne': [
                    {
                      '$type': '$wishedBy'
                    }, 'array'
                  ]
                }, 
                'then': [], 
                'else': '$wishedBy'
              }
            }
          }
        }
      )
      aggregateArray.push(
        {
          '$addFields': {
            'isWished': {
              '$cond': [
                {
                  '$in': [
                    ObjectId(userId), '$wishedBy'
                  ]
                }, true, false
              ]
            }
          }
        }
      )
    }
    if(renderDatas.wishlist===undefined){
      console.log('not wishlist');
    }
    if(userId&&renderDatas.wishlist){
      aggregateArray.splice(0,1)
      aggregateArray.splice(1,1)
      aggregateArray.splice(5,1)
      aggregateArray.push(
        {
          '$match': {
            'isWished': true
          }
        }
      )
      console.log(aggregateArray);
    }

const{categ,brand}=reqQuery
//categ filter
const categFilter=reqQuery.categ
if(categFilter===undefined){
 console.log('home loading categ'); 
}
if(categFilter!=undefined){
  if(categFilter.length<=2){
    console.log('no filter');
  }
  if(categFilter.length>2){
    aggregateArray.push
            (
              {
                '$match': {
                  'categoryLookup.name': {$in:categ}
                }
              }
            )
  }
  
}

//brand filter
const brandFilter=reqQuery.brand
if(brandFilter===undefined){
  console.log('home loading brand'); 
}
if(brandFilter!=undefined){
  if(brandFilter.length<=2){
    console.log('no filter');
  }
  if(brandFilter.length>2){
    aggregateArray.push
            (
              {
                '$match': {
                  'brandName': {$in:brand}
                }
              }
            )
  }
}



//out of stock
if(!reqQuery.stock){
  aggregateArray.push
          (
            {
              '$match': {
                'outOfStock': false
              }
            }
          )
}
if(reqQuery.stock){
  aggregateArray.push
          (
            {
              '$match': {
                'outOfStock': {$in:[true,false]}
              }
            }
          )
}    

//sorting
if(!reqQuery.sorting){
  console.log('no sorting');
}
if(reqQuery.sorting==='ascending'){
  aggregateArray.push
          (
            {
              '$sort': {
                'price': 1
              }
            }
          )
}
if(reqQuery.sorting==='descending'){
  aggregateArray.push
          (
            {
              '$sort': {
                'price': -1
              }
            }
          )
}

    

    const productData=await Product.aggregate(aggregateArray)
    
    if(categFilter===undefined&&brandFilter===undefined||categFilter.length<=2&&brandFilter.length<=2){
      renderDatas.productData=productData
      renderDatas.filter=false
      resolve(renderDatas)
    }
    if(categFilter||brandFilter){
      renderDatas.filterData=productData
      renderDatas.filter=true
      resolve(renderDatas)
    }
    


      
  } catch (error) {
    if(reqQuery===null){
      reject(error)
    }
    if(reqQuery){
      renderDatas.filter=false
      resolve(renderDatas)
    }
  }
  
   
  })
}

module.exports={filter}