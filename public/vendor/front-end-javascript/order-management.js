function orderUpdate(action,orderId,prodId){
       
    $.ajax({
          url:'/vendor/order-updation/'+action+'/'+orderId+'/'+prodId,
          method:'get',
          success:(response)=>{
            location.reload()
          }
      })

      return false
} 