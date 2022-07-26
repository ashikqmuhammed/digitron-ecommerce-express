const multer=require('multer');





//set storage
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null,'./public/uploads/' )
    },
    filename: function (req, file, cb) {
        var ext=file.originalname.substring(file.originalname.lastIndexOf('.'))
      cb(null, file.fieldname+'-'+Date.now()+ext) 
    }
})


module.exports=store=multer({storage:storage})