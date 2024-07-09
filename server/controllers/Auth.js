const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");  
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const Profile=require("../models/Profile"); 
require("dotenv").config();


exports.sendotp = async (req, res) => {
    try {
        // fetch email from request body
        const { email } = req.body;

        // check if user already exist
        const checkUserPresent = await User.findOne({ email });

        // if user already exist, then return a response
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: 'User Already registered',

            })
        }

        // generate OTP
        // 6 digit otp
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        }
        );
        console.log("OTP generated: ", otp);

        // check unique OTP or not

        // this is not good thing to check unique OTP 
        // try using a module for unique otp
        let result = await OTP.findOne({ otp: otp });

        while (result) {
            otp = otpGenerator(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            result = await OTP.findOne({ otp: otp });
        }

        const otpPayload = { email, otp };

        // create an entry for OTP
        const otpBody = await OTP.create(otpPayload);
        console.log("otp Body : ",otpBody);

        // return response
        res.status(200).json({
            success: true,
            message: "OTP sent successfully. ",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }

};

exports.signup = async (req, res) => {
    try {
        //  data fetch from request body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp,
        } = req.body;
        // validate kro
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "All fields are required ",
            })
        }
        // 2 password match krlo
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Password and Confirm Password value does not match , Please try again ',
            })
        }
        // check user already exits or not
        const exitstingUser = await User.findOne({ email });
        if (exitstingUser) {
            return res.status(400).json({
                success: false,
                message: 'User is already registered ',
            });
        }
        // find most recent OTP for user
        const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        // sort({createdAt: -1}) => sort in decending order of createdAt.
        // limit(1) => for choosing only one value.
        console.log(recentOtp);
        // validate OTP
        if (recentOtp.length == 0) {
            // OTP not found
            return res.status(400).json({
                success: false,
                message: 'OTP Not Found',
            });
        }
        else if (otp !== recentOtp[0].otp) {
            // invalid otp
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }


        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);
        // here we specify 10 round for hashing the password.

        // entry create in DB
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType,
            additionalDetails: profileDetails,
            image: `https:api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });

        //  return res
        return res.status(200).json({
            success: true,
            message: 'User is registered Successfully',
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'User cannot be registered .Please try again ',
        })

    }
};



exports.login = async (req, res) => {
    try {
        // get data from req body
        const { email, password } = req.body;
        // validation data
        if (!email || !password) {
            return res.status(403).json({
                success: false,
                message: "All field are required, please try again",
            })
        }
        // user check exist or not 
        const user = await User.findOne({ email }).populate("additionalDetails");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered, Please signup first",
            })
        }
        // generate JWT , after password matching
        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType
                    : user.accountType,
            }

            // creating jwt token
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h",
            });
            user.token = token;
            user.password = undefined;

            // create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            }
            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "Logged In Successfully",
            })
        }
        else {
            return res.status(401).json({
                success: false,
                message: "Password is incorrect ",
            })
        }

        // create cookie and send response
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Login failure .Please try again ',
        })

    }
};


exports.changePassword = async (req, res) => {
    try {
        // Get user data from req.user
        const userDetails = await User.findById(req.user.id)

        // Get old password, new password, and confirm new password from req.body
        const { oldPassword, newPassword } = req.body

        // Validate old password
        const isPasswordMatch = await bcrypt.compare(
            oldPassword,
            userDetails.password
        )
        if (!isPasswordMatch) {
            // If old password does not match, return a 401 (Unauthorized) error
            return res
                .status(401)
                .json({ success: false, message: "The password is incorrect" })
        }

        // Update password
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id,
            { password: encryptedPassword },
            { new: true } 
        )

        // Send notification email
        try {
            const emailResponse = await mailSender(
                updatedUserDetails.email,
                "Password for your account has been updated",
                passwordUpdated(
                    updatedUserDetails.email,
                    `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            )
            console.log("Email sent successfully:", emailResponse.response)

            
        } catch (error) {

            // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
            console.error("Error occurred while sending email:", error)

            return res.status(500).json({
                success: false,
                message: "Error occurred while sending email",
                error: error.message,
            })
        }

        // Return success response
        return res
            .status(200)
            .json({ success: true, message: "Password updated successfully" })


    } catch (error) {

        // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
        console.error("Error occurred while updating password:", error)

        return res.status(500).json({
            success: false,
            message: "Error occurred while updating password",
            error: error.message,
        })
    }

};



// ml+web project
// dsa question