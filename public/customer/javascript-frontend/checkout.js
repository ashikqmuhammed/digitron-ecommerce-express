

$("#checkout").on("submit", function (e) {
    e.preventDefault();
    $.ajax({
      
        url:'/order',
        method:'post',
        data:$("form").serialize(),
        success:(response)=>{
            if(!response){
                console.error()
            }
            if(response.payment==='ok'){
                window.location.href="/order-success"
            }
            if(response.payment==='pending'){
                razorpayPayment(response.order)
            }
        }
})
});


const razorpayPayment=(rpOrder)=>{
    var options = {
        "key": "rzp_test_bltQxFA7qggq2f",
        "amount": rpOrder.amount*10000, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "DIGITRON",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": rpOrder.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response){
            
            verifyPayment(response,rpOrder)
        },
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9999999999"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };

    const rzp1 = new Razorpay(options);
    rzp1.open()

}



const verifyPayment=(payment,rpOrder)=>{
    $.ajax({
        url:'/verify-payment',
        data:{
            payment,
            rpOrder
        },
        method:'post',
        success:(response)=>{
            if(!response){
                console.error()
            }
            if(response.payment==='ok'){
                window.location.href="/order-success"
            }
        }
    })
}