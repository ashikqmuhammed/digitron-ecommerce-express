function customerControl(action,customerId){
       
    $.ajax({
          url:'/admin/customer-control/'+action+'/'+customerId,
          method:'get',
          success:(response)=>{
              if(response.blocked===undefined){
                  console.log(error);
              }
              if(response.blocked){
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Blocked successfully',
                  })
                $('#cus-control').load(location.href + " #cus-control").hide().fadeIn('slow')
              }
              if(!response.blocked){
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Unblocked successfully',
                  })
                $('#cus-control').load(location.href + " #cus-control").hide().fadeIn('slow')
              }
             
          }
      })

      return false
} 