function qtyChecking(prodId,currentQty){
  const qty=parseInt(document.getElementById(`qty${prodId}`).innerHTML)
  console.log(qty); 
 if(qty>=currentQty){
  document.getElementById(`qty${prodId}`).innerHTML=currentQty.toString()
  document.getElementById(`add${prodId}`).disabled=true
  document.getElementById(`out${prodId}`).style.visibility='visible'
 }
}

function cartAction(action,prodId,totalQty){
       
    $.ajax({
          url:'/cart/'+action+'/'+prodId,
          method:'get',
          success:(response)=>{
          
              if(response.demoQty==='new'||response.demoQty==='wishadd'){
               let count=document.getElementById("countId").innerText
               count=parseInt(count)+1
               document.getElementById("countId").innerText=count

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
                title: 'Added to cart successfully'
              })
             

          
              
              }
              if(response.demoQty==='existingAdded'){
                if(document.getElementById(`remove${prodId}`).disabled===true){
                  document.getElementById(`remove${prodId}`).disabled=false
                }
                //taking values
                const qty=parseInt(document.getElementById(`qty${prodId}`).value)
                const price=parseInt(document.getElementById(`price${prodId}`).innerHTML)
                const subTotal=parseInt(document.getElementById('subTotal').innerHTML)
                const total=parseInt(document.getElementById('total').innerHTML)

                //math operations
                const singlePdt=price/qty
                const incPrice=price+singlePdt
                const incQty=qty+1
                const newSubTotal=subTotal+singlePdt
                const newTotal=total+singlePdt

                //putting values
                document.getElementById(`qty${prodId}`).value=incQty.toString()
                document.getElementById(`price${prodId}`).innerHTML=incPrice.toString()
                document.getElementById('subTotal').innerHTML=newSubTotal.toString()
                document.getElementById('total').innerHTML=newTotal.toString()


                if(incQty==totalQty){
                  document.getElementById(`add${prodId}`).disabled=true
                  document.getElementById(`out${prodId}`).style.visibility='visible'
                }

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
                  title: 'Added again'
                })
              }
              if(response.demoQty==='existingRemoved'){

                if(document.getElementById(`out${prodId}`).style.visibility==='visible'){
                  document.getElementById(`out${prodId}`).style.visibility='hidden'
                }
                if(document.getElementById(`add${prodId}`).disabled===true){
                  document.getElementById(`add${prodId}`).disabled=false
                }
                
                //taking values
                const qty=parseInt(document.getElementById(`qty${prodId}`).value)
                const price=parseInt(document.getElementById(`price${prodId}`).innerHTML)
                const subTotal=parseInt(document.getElementById('subTotal').innerHTML)
                const total=parseInt(document.getElementById('total').innerHTML)

                //math operation
                const singlePdt=price/qty
                const decPrice=price-singlePdt
                const decQty=qty-1
                const newSubTotal=subTotal-singlePdt
                const newTotal=total-singlePdt

                //putting values
                document.getElementById(`qty${prodId}`).value=decQty.toString()
                document.getElementById(`price${prodId}`).innerHTML=decPrice.toString()
                document.getElementById('subTotal').innerHTML=newSubTotal.toString()
                document.getElementById('total').innerHTML=newTotal.toString()
        
              }
              if(response.demoQty==='deleted'){

                let count=document.getElementById("countId").innerText
                count=parseInt(count)-1
                document.getElementById("countId").innerText=count

                const price=document.getElementById(`price${prodId}`).innerHTML
                const intPrice=parseInt(price)
                const subTotal=document.getElementById('subTotal').innerHTML
                const intSubTotal=parseInt(subTotal)
                const total=document.getElementById('total').innerHTML
                const intTotal=parseInt(total)

                const newSubTotal=intSubTotal-intPrice
                const newTotal=intTotal-intPrice

                document.getElementById('subTotal').innerHTML=newSubTotal.toString()
                document.getElementById('total').innerHTML=newTotal.toString()

                $(`#${prodId}`).remove()
                
                

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
                  title: 'Removed from cart successfully'
                })

              }
          }
      })

      return false
} 

function auth() {
  $.ajax({
    url:'/auth/',
    method:'get',
    success:()=>{console.log('auth');}
  })
}