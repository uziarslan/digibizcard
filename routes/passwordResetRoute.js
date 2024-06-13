const express = require("express");
const router = express.Router();

const User = require('../models/user');
const Organization = require('../models/organization');

const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

router.get("/forgetpassword", async (req, res) => {
  res.render('./user_pages/forgetPassword', { user: req.user });
});

// POST route for handling forgot password form submission
router.post("/reset/password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    const organization = await Organization.findOne({ email });

    // If neither a user nor an organization is found
    if (!user && !organization) {
      req.flash('error', 'No account found with that email. Please enter a valid email address.');
      return res.redirect('/forgetpassword');
    }
    
    const otp = generateOTP();
    // If a user is found, set the OTP for the user
    if (user) {
      user.resetPasswordOTP = otp;
      await user.save();
    }

    // If an organization is found, set the OTP for the organization
    if (organization) {
      organization.resetPasswordOTP = otp;
      await organization.save();
    }

    // Store the email in session to identify the entity in further steps
    req.session.resetPasswordEmail = email;

    // Send the password reset email with the OTP
    const request = mailjet.post("send", { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: "hired2@quantomex.com",
            Name: "Hireddd",
          },
          To: [
            {
              Email: email,
            },
          ],
          Subject: "Password Reset Link",
          HTMLPart: `<p>Your 4-digit OTP is: ${otp}</p><p>Click the following link to reset your password: <a href="http://localhost:3000/verifycode">Reset Password</a></p>`,
        },
      ],
    });
    // Send the email
    await request;
    req.flash('success', 'A password reset link with a 4-digit OTP has been sent to your email. Check your inbox.');
    res.redirect('/forgetpassword');
  } catch (error) {
    console.error('Error sending password reset link:', error);
    req.flash('error', 'Error sending password reset link. Please try again.');
    res.redirect('/forgetpassword');
  }
});
router.post("/verify-reset-code", async (req, res) => {
  try {
    const { verificationCode } = req.body;
    const userEmail = req.session.resetPasswordEmail;
    // Attempt to find both a user and an organization with the email
    const user = await User.findOne({ email: userEmail });
    const organization = await Organization.findOne({ email: userEmail });

    const entity = user || organization;
    if (!entity) {
      req.flash('error', 'Account not found. Please enter a valid email address.');
      return res.redirect('/forgetpassword');
    }
    if (entity.resetPasswordOTP === verificationCode) {
      res.redirect('/resetPassword');
    } else {
      req.flash('error', 'Incorrect verification code. Please try again.');
      res.redirect('/verifycode');
    }
  } catch (error) {
    console.error('Error verifying reset code:', error);
    req.flash('error', 'Error verifying reset code. Please try again.');
    res.redirect('/verifycode');
  }
});
router.get("/verifycode", async (req, res) => {
  res.render('./user_pages/forgotPasswordOtpPage' , { user: req.user });
});
router.get("/resetPassword", async (req, res) => {
  res.render('./user_pages/resetPasswordForm', { user: req.user });
});
router.post("/reset-password", async (req, res) => {
  try {
    const { newPassword } = req.body;
    const email = req.session.resetPasswordEmail;
    if (!email) {
      req.flash('error', 'Unauthorized access. Please request a password reset again.');
      return res.redirect('/forgetpassword');
    }

    // Attempt to find both a user and an organization with the email
    const user = await User.findOne({ email });
    const organization = await Organization.findOne({ email });

    if (user) {
      // Assuming setPassword is a method for setting a new password for User
      await user.setPassword(newPassword);
      user.resetPasswordOTP = undefined;
      await user.save();
    } else if (organization) {
      // Assuming setPassword is also implemented for Organization
      await organization.setPassword(newPassword);
      organization.resetPasswordOTP = undefined;
      await organization.save();
    } else {
      req.flash('error', 'Account not found. Please request a password reset again.');
      return res.redirect('/forgetpassword');
    }

    req.flash('success', 'Password has been reset successfully. You can now login with your new password.');
    res.redirect('/password-reset-success');
  } catch (error) {
    console.error('Error resetting password:', error);
    req.flash('error', 'Error resetting password. Please try again.');
    res.redirect('/reset-password');
  }
});
router.get('/password-reset-success', (req, res) => {
  res.render('./user_pages/passwordResetSuccess', { user: req.user });
});

module.exports = router;