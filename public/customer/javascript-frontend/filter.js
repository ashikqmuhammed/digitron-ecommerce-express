$('input[name=sorting]').change(function() {
   
  $.ajax({
      url: '/filter',  
      method: "get",
      data: $('form').serialize(),
      success: (filter) => {
        if (filter) {
            $('#rlFilter').load(location.href + " #rlFilter").hide().fadeIn('slow')
        }else{
          console.log('filter failed');
        }
      }
  })

});

$('input[name=categ]').change(function() {
   
  $.ajax({
      url: '/filter',  
      method: "get",
      data: $('form').serialize(),
      success: (filter) => {
          
          if (filter) {
              $('#rlFilter').load(location.href + " #rlFilter").hide().fadeIn('slow')
          }else{
            console.log('filter failed');
          }
      }
  })

});

$('input[name=brand]').change(function() {
   
  $.ajax({
      url: '/filter',  
      method: "get",
      data: $('form').serialize(),
      success: (filter) => {
          if (filter) {
            if (filter) {
                $('#rlFilter').load(location.href + " #rlFilter").hide().fadeIn('slow')
            }else{
              console.log('filter failed');
            }
          }
      }
  })

});


$('input[name=stock]').change(function() {
   
    $.ajax({
        url: '/filter',  
        method: "get",
        data: $('#filter').serialize(),
        success: (filter) => {
            if (filter) {
              if (filter) {
                  $('#rlFilter').load(location.href + " #rlFilter").hide().fadeIn('slow')
              }else{
                console.log('filter failed');
              }
            }
        }
    })
  
  });


$('input[name=pagination]').change(function() {
   
    $.ajax({
        url: '/filter',  
        method: "get",
        data: $('form').serialize(),
        success: (filter) => {
          if (filter) {
              $('#rlFilter').load(location.href + " #rlFilter").hide().fadeIn('slow')
          }else{
            console.log('filter failed');
          }
        }
    })
  
  });


// // $(document).ready(function () {
// //     $("form").submit(function (event) {
// //       event.preventDefault();
// //       $.ajax({
// //         url:'/',
// //         method:'get',
// //         success:(response)=>{
// //           $('#pdts').load(`${location.href} #pdts`)
// //         }
// //       })
      
// //     });
    
// //   });

// /* attach a submit handler to the form */
// $("#filterform").submit(function(event) {

//   /* stop form from submitting normally */
//   event.preventDefault();

//  /* get the action attribute from the <form action=""> element */
// //  const $form = $(this),
// //  url = $form.attr('action');

//   /* Send the data using post with element id name and name2*/
//   const getting = $.get( '/', function() {
//     console.log('request send');
//   })

//   /* Alerts the results */
//   getting.done(function() {
//     $('#pdts').load(`${location.href} #pdts`)
//   });
//   getting.fail(function() {
//     console.log('failed');
//   });
// // });