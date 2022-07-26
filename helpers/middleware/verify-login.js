const User=require('../../models/user')



const verifyAdminLogin=(req,res,next)=>{
    if(!req.session.userData){
        res.redirect('/auth')
    }
    if(req.session.userData){
        const {role}=req.session.userData
        if(role==='admin'){
            next()
        }else{
            res.redirect('/auth')
        }
    }
}

const verifyVendorLogin=async(req,res,next)=>{
    if(!req.session.userData){
        res.redirect('/auth')
    }
    
    const {_id}=req.session.userData
    const vendorData=await User.findOne({_id:_id})

    if(vendorData.blocked){
        req.session.destroy()
        res.redirect('/auth')
    }
    if(req.session.userData){
        const {role}=req.session.userData
        if(role==='vendor'){
            next()
        }else{
            res.redirect('/auth')
        }
    }
}
const verifyCustomerLogin=async(req,res,next)=>{
    if(!req.session.userData){
        res.redirect('/auth')
    }

    const {_id}=req.session.userData
    const customerData=await User.findOne({_id:_id})

    if(customerData.blocked){
        req.session.destroy()
        res.redirect('/auth')
    }

    if(req.session.userData){
        const{role}=req.session.userData
        if(role==='admin'||role==='vendor'||role==='customer'){
            next()
        }else{
            res.redirect('/auth')
        }
    }
}





module.exports={verifyAdminLogin,verifyVendorLogin,verifyCustomerLogin}


