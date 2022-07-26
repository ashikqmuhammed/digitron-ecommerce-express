const UserAddress=require('../../models/address')
const ObjectId= require('bson-objectid')
const User=require('../../models/user')





const saveAddress=(body,_id)=>{
  return new Promise(async(resolve,reject)=>{
  try {
    const userAddressExists=await UserAddress.findOne({customer:_id})
    if(!userAddressExists){
      await UserAddress.create
      (
        {
          customer:_id,
          address:[body]
        }

      )
      resolve()
    }
    if(userAddressExists){
      await UserAddress.updateOne
      (
        {customer:_id},
        {$push:{address:body}}
      )
      resolve()
    }
    } catch (error) {
    reject(error)
  }

  })
}



const getAddress=(_id,renderDatas)=>{
  return new Promise(async(resolve,reject)=>{
  try {
    const addressData=await UserAddress.aggregate
    (
      [
        {
          '$match': {
            'customer':ObjectId(_id)
          }
        }
      ]
    )
    console.log(addressData);
    if(addressData.length==0){
      resolve(renderDatas)
    }
    if(addressData){
      renderDatas.addressData=addressData[0].address
      resolve(renderDatas)
    }

    } catch (error) {
    reject(error)
  }

  })
}


const activeCustomers=()=>{
  return User.aggregate(
    [
      {
        '$match': {
          'role': 'customer', 
          'blocked': false
        }
      }
    ]
  )
}


const blockedCustomers=()=>{
  return User.aggregate(
    [
      {
        '$match': {
          'role': 'customer', 
          'blocked': true
        }
      }
    ]
  )
}









module.exports={
  saveAddress,
  getAddress,
  activeCustomers,
  blockedCustomers
}