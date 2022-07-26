function wishlistAction(prodId,isWished,wishlist){
    console.log(wishlist);   
    $.ajax({
          url:'/wishlist/'+prodId,
          method:'get',
          success:(response)=>{
            if(!response.wishList || response.wishList==='failed'){
              console.log('error');
            }
            if(isWished==='true'&&response.wishList==='removed'){
              if(wishlist==='false'){
                document.getElementById(prodId).className="ti-heart ml-3"
              }
              if(wishlist==='true'){
                

                const Toast = Swal.mixin({
                  toast: true,
                  position: 'top-end',
                  showConfirmButton: false,
                  timer: 3000,
                  timerProgressBar: true,
                  didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer)
                    toast.addEventListener('mouseleave', Swal.resumeTimer)
                  }
                })
                
                Toast.fire({
                  icon: 'success',
                  title: 'Removed from wishlist successfully'
                })
                function reload(){
                  location.reload()
                }
                setTimeout(reload,4000)
                // $('#rlHere').load(location.href + " #rlHere").hide().fadeIn('slow')
              }
            }
            if(isWished==='true'&&response.wishList==='added'){
              document.getElementById(prodId).className="fa fa-heart ml-3"
            }
            if(isWished==='false'&&response.wishList==='removed'){
              document.getElementById(prodId).className="ti-heart ml-3"
            }
            if(isWished==='false'&&response.wishList==='added'){
              document.getElementById(prodId).className="fa fa-heart ml-3"
            }
          
          }
      })

      return false
} 