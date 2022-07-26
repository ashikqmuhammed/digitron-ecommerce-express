const Product=require('../../models/product')
const ObjectId=require('bson-objectid')

const wishlistUpdation=(_id,prodId)=>{
  return new Promise(async(resolve,reject)=>{
    try {
      const wishlistData= await Product.findOne({_id:prodId},{wishedBy:1})
      const existingCustomer=wishlistData.wishedBy.find(c=>c==_id)
      
      if(existingCustomer===undefined){
        await Product.updateOne
        (
          {_id:prodId},
          {$push:{wishedBy:_id}}
        )
        const response={wishList:'added'}
        resolve(response)
      }

      if(existingCustomer){
        await Product.updateOne({
          _id: prodId
        },
        {
          $pull: {wishedBy:_id}
        })
        const response={wishList:'removed'}
        resolve(response)
      }

    } catch (error) {
      reject(error)
    }
    })
}



// const getWishlistPromise=(userId,renderDatas)=>{
//     return new Promise(async(resolve,reject)=>{
//       try {
//         const wishlistData=await Product.aggregate
//         (
//           [
//             {
//               '$lookup': {
//                 'from': 'categories', 
//                 'localField': 'category', 
//                 'foreignField': '_id', 
//                 'as': 'categoryLookup'
//               }
//             }, {
//               '$unwind': {
//                 'path': '$categoryLookup'
//               }
//             }, {
//               '$lookup': {
//                 'from': 'users', 
//                 'localField': 'createdBy', 
//                 'foreignField': '_id', 
//                 'as': 'vendorLookup'
//               }
//             }, {
//               '$unwind': {
//                 'path': '$vendorLookup'
//               }
//             },{
//               '$addFields': {
//                 'wishedBy': {
//                   '$cond': {
//                     'if': {
//                       '$ne': [
//                         {
//                           '$type': '$wishedBy'
//                         }, 'array'
//                       ]
//                     }, 
//                     'then': [], 
//                     'else': '$wishedBy'
//                   }
//                 }
//               }
//             },{
//               '$addFields': {
//                 'isWished': {
//                   '$cond': [
//                     {
//                       '$in': [
//                         ObjectId(userId), '$wishedBy'
//                       ]
//                     }, true, false
//                   ]
//                 }
//               }
//             },{
//               '$match': {
//                 'isWished': true
//               }
//             }
//           ]
//         )
//         renderDatas.wishlistData=wishlistData
//         resolve(renderDatas)
//       } catch (error) {
//         reject(error)
//       }
      
//     })
//   }

module.exports={wishlistUpdation}