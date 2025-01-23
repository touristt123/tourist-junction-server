const { user, customer, agency, admin } = require("../models/user")
const driver = require("../models/driver")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const employee = require("../models/employee")
const { sendSms } = require("../utils/sms")
// const data = require("../data")



async function handleSignUp(req, res) {
    try {
        const { userName, companyName, mobileNumber, whatsappNumber, state, city, email, password, type } = req.body
        if (!userName || !mobileNumber || !email || !password || !type) {
            return res.status(400).json({
                success: false,
                message: "Please provide all the fields"
            })
        }
        if (!email.includes("@")) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid email"
            })
        }
        if (mobileNumber.length < 10 || mobileNumber.length > 12) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid mobile NUmber"
            })
        }
        if (whatsappNumber && (whatsappNumber.length < 10 || whatsappNumber.length > 12)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid whatsapp NUmber"
            })
        }
        if (password.length < 5) {
            return res.status(400).json({
                success: false,
                message: "Password must contain atleast 5 characters"
            })
        }
        if (!["ADMIN", "AGENCY", "CUSTOMER"].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Provide a valid user type"
            })
        }
        if (type === "AGENCY") {
            const alreadyUserWithThisUserName = await agency.findOne({ userName })
            const alreadyUserWithThisMobileNumber = await agency.findOne({ mobileNumber })
            if (alreadyUserWithThisUserName) {
                return res.status(400).json({
                    success: false,
                    message: "This username is taken"
                })
            }
            if (alreadyUserWithThisMobileNumber) {
                return res.status(400).json({
                    success: false,
                    message: "This mobile number is already in use"
                })
            }
        } else if (type === "ADMIN") {
            const alreadyUserWithThisUserName = await admin.findOne({ userName })
            const alreadyUserWithThisMobileNumber = await admin.findOne({ mobileNumber })
            if (alreadyUserWithThisUserName) {
                return res.status(400).json({
                    success: false,
                    message: "This username is taken"
                })
            }
            if (alreadyUserWithThisMobileNumber) {
                return res.status(400).json({
                    success: false,
                    message: "This mobile number is already in use"
                })
            }
        } else if (type === "CUSTOMER") {
            const alreadyUserWithThisUserName = await customer.findOne({ userName })
            const alreadyUserWithThisMobileNumber = await customer.findOne({ mobileNumber })
            if (alreadyUserWithThisUserName) {
                return res.status(400).json({
                    success: false,
                    message: "This username is taken"
                })
            }
            if (alreadyUserWithThisMobileNumber) {
                return res.status(400).json({
                    success: false,
                    message: "This mobile number is already in use"
                })
            }

        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString()
        const hashedPassword = await bcrypt.hash(password, 10)
        const createdUser = await user.create({ userName, companyName, mobileNumber, whatsappNumber, state, city, email, password: hashedPassword, type, verificationOtp: otp, isVerified: false })

        createdUser.verificationOtp = undefined

        // handleSendOtp(mobileNumber, otp)
        const response = await sendSms(mobileNumber, `Your OTP for mobile number verification for Tourist Junction is ${otp}. Do not share it with any other person.`, process.env.DLT_VERIFY_SIGNUP_TEMPLATE_ID)
        // if(response.ErrorMessage !== "Success"){
        //     return res.status(400).json(response)
        // }

        return res.status(201).json({
            success: true,
            data: createdUser,
            smsResponse: response
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function handleVerifyOtp(req, res) {
    try {
        const { mobileNumber, otp } = req.body
        if (!mobileNumber || !otp) {
            return res.status(400).json({
                success: false,
                message: "Please Provide all the fields"
            })
        }
        const foundUser = await user.findOne({ mobileNumber, verificationOtp : otp })
        // if (!foundUser) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "Provide a valid phone number"
        //     })
        // }
        // const isOtpCorrect = foundUser.verificationOtp === otp
        if (!foundUser) {
            return res.status(400).json({
                success: false,
                message: "Check your otp or your phone number"
            })
        }
        const currentDate = new Date();
        foundUser.isVerified = true;
        foundUser.verificationOtp = undefined;
        foundUser.trialValidTill = new Date(currentDate.setDate(currentDate.getDate() + 3));

        
        await foundUser.save()
        const payload = {
            _id: foundUser._id,
            role: foundUser.type
        }
        
        const authToken = jwt.sign(payload, process.env.JWT_SECRET)
        if (foundUser.type === "AGENCY") {
            await sendSms(foundUser.mobileNumber, `Registration Successful! Dear ${foundUser.userName}, You are now a part of the Tourist Junction family! Your registration has been successfully completed. What’s next? Choose Your Subscription: Select a plan that suits your business needs and begin your journey with us. Add Your Vehicles (My Vehicle): Easily add all your fleet vehicles to the platform. Add Drivers: Update details of your drivers and take full advantage of all the advanced features. Tourist Junction’s features are designed to make your work easier and more productive. Start now and move forward with us! Warm regards, Team Tourist Junction.`, process.env.DLT_SUCCESSFULL_AGENCY_REGISTRATION_TEMPLATE_ID)
        } else if (foundUser.type === "CUSTOMER") {
            await sendSms(foundUser.mobileNumber, `Dear ${foundUser.userName}, Aapka Tourist Junction par swagat hai! Aapka registration safal ho gaya hai. Ab aap hamare platform ke sabhi exclusive features ka faayda utha sakte hain. Tourist Junction ke Features: 1.Bus Tickets Booking: Travel agencies aur tour operators ke dwara add ki hui buses ka ticket asaani se book karein. 2.Vehicle on Rent: Buses, cars, aur trucks kiraye par lein aur sabhi vehicle details ko easily access karein. 3.Driver for Emergency: Apni private car ke liye emergency situation me experienced driver find karein. 4.Vehicle Buying: Aap apni zarurat ke hisaab se naye ya purane vehicles buy kar sakte hain. Ab aapka account ready hai aur aap hamare platform par yeh sabhi features ka upyog kar sakte hain. Shuru karein aur apne convenience ke hisaab se planning karein! Aapke safar ko aur asaan aur sukhad banane ki koshish me, Team Tourist Junction`, process.env.DLT_SUCCESSFULL_CUSTOMER_REGISTRATION_TEMPLATE_ID)
        }

        return res.status(200).json({
            success: true,
            data: foundUser,
            // smsResponse,
            authToken
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function handleSendOtpForResetPassword(req, res) {
    try {
        const { mobileNumber } = req.body
        if (!mobileNumber) {
            return res.status(400).json({
                success: false,
                message: "Provide all the fields"
            })
        }
        const foundUser = await user.findOne({ mobileNumber })
        if (!foundUser) {
            return res.status(400).json({
                success: false,
                message: "Provide a valid mobile number"
            })
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString()
        foundUser.resetPasswordOtp = otp
        foundUser.isResetPasswordOtpVerified = false
        foundUser.save()

        // handleSendOtp(foundUser.mobileNumber, otp)
        const response = await sendSms(foundUser.mobileNumber, `Yor OTP for reset password for Tourist Junction is ${otp}. Do not share it with any other person.`, process.env.DLT_RESET_PASSWORD_TEMPLATE_ID)
        // if(response.ErrorMessage !== "Success"){
        //     return res.status(400).json(response)
        // }


        return res.status(200).json({
            success: true,
            message: "Otp for password reset is sent",
            smsResponse: response
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function handleVerifyOtpForResetPassword(req, res) {
    try {
        const { mobileNumber, otp } = req.body
        if (!mobileNumber || !otp) {
            return res.status(400).json({
                success: false,
                message: "Please Provide all the fields"
            })
        }
        const foundUser = await user.findOne({ mobileNumber })
        if (!foundUser) {
            return res.status(400).json({
                success: false,
                message: "Provide a valid phone number"
            })
        }
        const isOtpCorrect = foundUser.resetPasswordOtp === otp
        if (!isOtpCorrect) {
            return res.status(400).json({
                success: false,
                message: "Incorrect otp"
            })
        }
        foundUser.resetPasswordOtp = undefined
        foundUser.isResetPasswordOtpVerified = true
        await foundUser.save()
        // const payload = {
        //     _id: foundUser._id,
        //     role: foundUser.type
        // }

        // const authToken = jwt.sign(payload, process.env.JWT_SECRET)
        return res.status(200).json({
            success: true,
            message: "OTP verified now you can change you password"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function handleResetPassword(req, res) {
    try {
        const { mobileNumber, newPassword } = req.body
        if (!mobileNumber || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Please Provide all the fields"
            })
        }
        const foundUser = await user.findOne({ mobileNumber })
        if (!foundUser) {
            return res.status(400).json({
                success: false,
                message: "Provide a valid phone number"
            })
        }

        if (!foundUser.isResetPasswordOtpVerified) {
            return res.status(400).json({
                success: false,
                message: "Verify your OTP first"
            })
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        foundUser.resetPasswordOtp = undefined
        foundUser.isResetPasswordOtpVerified = false
        foundUser.password = hashedPassword
        await foundUser.save()
        const payload = {
            _id: foundUser._id,
            role: foundUser.type
        }

        const authToken = jwt.sign(payload, process.env.JWT_SECRET)
        return res.status(200).json({
            success: true,
            data: foundUser
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function handleLogin(req, res) {
    try {
        const { userName, password, mobileNumber } = req.body
        if ((!userName && !mobileNumber) || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide all the fields"
            })
        }
        const foundUser = await admin.findOne({ userName })
        if (!foundUser) {
            const foundDriver = await driver.findOne({ mobileNumber, password })
            if (foundDriver) {
                const payload = {
                    _id: foundDriver._id,
                    role: "DRIVER"
                }

                const authToken = jwt.sign(payload, process.env.JWT_SECRET)


                return res.status(200).json({
                    success: true,
                    data: foundDriver,
                    authToken
                })
            }

            const foundEmployee = await employee.findOne({ mobileNumber, password })
            if (!foundEmployee) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Creds"
                })
            }
            const foundAgency = await user.findOne({ employees: foundEmployee._id })
            if (foundEmployee && (foundEmployee.employeeType === ("MANAGER" || "OFFICE-BOY" || "ADMINISTRATOR" || "HR" || "BPO" || "SALES-EXECUTIVE" || "DIGITAL-MARKETER" || "MARKETING-EXECUTIVE"))) {
                const payload = {
                    _id: foundAgency._id,
                    employeeId: foundEmployee._id,
                    role: foundEmployee.employeeType
                }

                const authToken = jwt.sign(payload, process.env.JWT_SECRET)


                return res.status(200).json({
                    success: true,
                    data: foundEmployee,
                    authToken
                })
            }

            return res.status(400).json({
                success: false,
                message: "Please provide correct creds"
            })
        }
        if (!foundUser.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Your account is not verified yet"
            })
        }
        const isPasswordCorrect = await bcrypt.compare(password, foundUser.password)
        if (!isPasswordCorrect) {
            return res.status(400).json({
                success: false,
                message: "Please provide correct creds"
            })
        }


        const payload = {
            _id: foundUser._id,
            role: foundUser.type
        }

        const authToken = jwt.sign(payload, process.env.JWT_SECRET)
        return res.status(200).json({
            success: true,
            data: foundUser,
            authToken
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }

}

async function handleCustomerLogin(req, res) {
    try {
        const { password, mobileNumber } = req.body
        if (!mobileNumber || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide all the fields"
            })
        }
        const foundUser = await customer.findOne({ mobileNumber })
        if (!foundUser) {
            return res.status(400).json({
                success: false,
                message: "Invalid Creds"
            })
        }
        if (!foundUser.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Your account is not verified yet"
            })
        }
        const isPasswordCorrect = await bcrypt.compare(password, foundUser.password)
        if (!isPasswordCorrect) {
            return res.status(400).json({
                success: false,
                message: "Please provide correct creds"
            })
        }
        const payload = {
            _id: foundUser._id,
            role: foundUser.type
        }

        const authToken = jwt.sign(payload, process.env.JWT_SECRET)
        return res.status(200).json({
            success: true,
            data: foundUser,
            authToken
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function handleAgencyLogin(req, res) {
    try {
        const { password, userName, mobileNumber } = req.body
        if ((!userName && !mobileNumber) || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide all the fields"
            })
        }
        const foundUser = await agency.findOne({ userName })
        if (!foundUser) {
            const foundEmployee = await employee.findOne({ mobileNumber, password })
            if (!foundEmployee) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Creds"
                })
            }
            const foundAgency = await user.findOne({ employees: foundEmployee._id })
            if (foundEmployee && (foundEmployee.employeeType === ("MANAGER" || "OFFICE-BOY" || "ADMINISTRATOR" || "HR" || "BPO" || "SALES-EXECUTIVE" || "DIGITAL-MARKETER" || "MARKETING-EXECUTIVE"))) {
                const payload = {
                    _id: foundAgency._id,
                    employeeId: foundEmployee._id,
                    role: foundEmployee.employeeType
                }

                const authToken = jwt.sign(payload, process.env.JWT_SECRET)


                return res.status(200).json({
                    success: true,
                    data: foundEmployee,
                    authToken
                })
            }

            return res.status(400).json({
                success: false,
                message: "Please provide correct creds"
            })
        }
        if (!foundUser.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Your account is not verified yet"
            })
        }
        const isPasswordCorrect = await bcrypt.compare(password, foundUser.password)
        if (!isPasswordCorrect) {
            return res.status(400).json({
                success: false,
                message: "Please provide correct creds"
            })
        }
        const payload = {
            _id: foundUser._id,
            role: foundUser.type
        }

        const authToken = jwt.sign(payload, process.env.JWT_SECRET)
        return res.status(200).json({
            success: true,
            data: foundUser,
            authToken
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function handleGetUserById(req, res) {
    try {
        if (!req.data._id) {
            return res.status(400).json({
                success: false,
                message: "Login with correct creds"
            })
        }
        if (req.data._id && !req.data.employeeId) {
            const userId = req.data._id
            const foundUser = await user.findById(userId)
            if (foundUser) {
                return res.status(200).json({
                    success: true,
                    data: foundUser
                })
            }
        }
        const employeeId = req.data.employeeId
        const foundEmployee = await employee.findById(employeeId)
        const foundAgency = await user.findById(req.data._id)
        if (foundEmployee) {
            return res.status(200).json({
                success: true,
                data: {
                    ...foundEmployee.toObject(),
                    isSubsciptionValid: foundAgency.isSubsciptionValid,
                    subscription: foundAgency.subscription.toString(),
                    trialValidTill: foundAgency?.trialValidTill
                }
            })
        }
        return res.status(400).json({
            success: false,
            message: "Login with correct creds"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}
async function handleUpdateUser(req, res) {
    try {
        if (!req.data._id) {
            return res.status(400).json({
                success: false,
                message: "Login with correct creds"
            })
        }
        const userId = req.data._id
        const updatedUser = await user.findByIdAndUpdate(userId, req.body, { new: true })
        if (!updatedUser) {
            res.status(400).json({
                success: false,
                message: "Login with correct creds"
            })
        }
        return res.status(200).json({
            success: true,
            data: updatedUser
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

async function handleGetUserByType(req, res) {
    try {
        const { userType } = req.params
        if (!userType) {
            return res.status(400).json({
                success: false,
                message: "Provide the user type you want to get"
            })
        }
        const foundUsers = await user.find({ type: userType })

        return res.status(200).json({
            success: true,
            data: foundUsers
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

async function handleDeleteUser(req, res) {
    try {
        const { userName, password } = req.body
        if (!userName || !password) {
            return res.status(400).json({
                success: false,
                message: "Provide all the fields"
            })
        }
        const foundAgency = await agency.findOne({ userName })
        const isPasswordCorrect = await bcrypt.compare(password, foundAgency.password)
        if (!isPasswordCorrect) {
            return res.status(400).json({
                success: false,
                message: "Please provide correct creds"
            })
        }
        await agency.findByIdAndDelete(foundAgency._id)
        return res.status(200).json({
            success: true,
            message: "Your account has been deleted"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


module.exports = {
    handleSignUp,
    handleLogin,
    handleGetUserById,
    handleUpdateUser,
    handleGetUserByType,
    handleVerifyOtp,
    handleSendOtpForResetPassword,
    handleVerifyOtpForResetPassword,
    handleResetPassword,
    handleDeleteUser,
    handleCustomerLogin,
    handleAgencyLogin
}