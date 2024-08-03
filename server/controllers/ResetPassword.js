const User = require("../models/User");
const mailsender = require("../utils/mailSender");
const bcrypt=require("bcrypt");
const crypto=require("crypto"); 
const dotenv=require("dotenv");
dotenv.config();
const FRONTEND_URL=process.env.FRONTEND_URL;

// reset password
exports.resetPasswordToken = async (req, res) => {
    try {
        // get email from body
        const email = req.body.email;
        // check user for this email, email validation
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.json({
                success: false,
                message: 'Your Email is not registered with us.',
            }); 
        }
        // generate token
		const token = crypto.randomBytes(20).toString("hex");
        
        // update user by adding token and expiration time 
        const updatedDetails = await User.findOneAndUpdate({ email: email },
            {
                token: token,
                resetPasswordExpires: Date.now() + 5 * 60 * 1000,
            },
            { new: true });
                
        // create url
        const url = `${FRONTEND_URL}/update-password/${token}`;
        // send mail containing the url
        await mailsender(email,
            'Password reset Link',
            `Password reset Link: ${url}`
        )
        // return response
        return res.json({
            success: true,
            message: 'Email sent successfully, Please check email and update password'
        })
    } catch (error) {
        return res.json({
            success: false,
            message: "something went wrong,while reset password",
        })

    }

}

// reset password
exports.resetPassword = async (req, res) => {
    try {
        // fetch data
        const {password,confirmPassword,token}=req.body;
        // validation
        if(password!== confirmPassword){
            return res.json({
                success:false,
                message:'Password not matching',
            });
        }
        // get userdetails from db using token
        const userDetails=await User.findOne({token:token});
        // if no entry- invalid token
        if(!userDetails){
            return res.json({
                success:false,
                message:"token is invalid "
            })
        }
        // token time check
        if(userDetails.resetPasswordExpires <Date.now()){
            return res.json({
                success:false,
                message:'token is expired, plese regenerate .',
            })
        }
        // hash pwd
        const hashedPassword=await bcrypt.hash(password ,10);
        // password update
        await User.findOneAndUpdate({token:token},{password:hashedPassword},{new:true});
        // return respose
        return res.status(200).json({
            success:true,
            message:"Password reset successfully. "
        })
    } catch (error) {
         return res.status(400).json({
            success:false,
            message:"failed to reset password",
         });
    }

}
