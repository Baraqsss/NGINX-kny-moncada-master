import React, { useState } from "react";
import AuthImg from "../assets/AuthImg.png";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import logo from "../assets/logo.png";
import {Link, useNavigate} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getEmailConfirmationTemplate } from "../services/emailTemplates";
import { emailAPI } from "../services/api";

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1); // Tracks the current step
  const [formData, setFormData] = useState({}); // Stores form data
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false); // State to track if email was sent

  // Handle changes in the input fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value }); // Update the formData state
  };

  // Add this function after handleInputChange
  const calculateAge = (birthday) => {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Validate step 1 (Consent and Email)
  const validateStep1 = () => {
    setError('');
    
    if (formData.consent !== 'agree') {
      setError('You must agree to the terms to continue');
      return false;
    }
    
    // Enhanced email validation to check for valid domain formats
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // Validate email format with proper domain
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email with proper domain (e.g., @gmail.com, @yahoo.com)');
      return false;
    }
    
    const domain = formData.email.split('@')[1];
    // Check if the domain is among common mail providers or has a valid format
    const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com', 'mail.com'];
    const validDomainFormat = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;
    
    if (!commonDomains.includes(domain) && !validDomainFormat.test(domain)) {
      setError('Please use a valid email domain like @gmail.com, @yahoo.com, @hotmail.com, or other valid email services');
      return false;
    }
    
    return true;
  };

  // Validate step 2 (Personal Details)
  const validateStep2 = () => {
    setError('');
    
    if (!formData.firstName || formData.firstName.trim() === '') {
      setError('First name is required');
      return false;
    }
    
    if (!formData.lastName || formData.lastName.trim() === '') {
      setError('Last name is required');
      return false;
    }
    
    if (!formData.birthday) {
      setError('Birthday is required');
      return false;
    }

    const age = calculateAge(formData.birthday);
    
    if (age < 14) {
      setError('You must be at least 14 years old to register');
      return false;
    }
    
    return true;
  };

  // Validate step 3 (Organization)
  const validateStep3 = () => {
    setError('');
    
    if (formData.memberOrg === 'yes' && (!formData.organization || formData.organization.trim() === '')) {
      setError('Please enter your organization name');
      return false;
    }
    
    return true;
  };

  // Validate step 4 (Committee)
  const validateStep4 = () => {
    setError('');
    
    if (!formData.committee) {
      setError('Please select a committee');
      return false;
    }
    
    return true;
  };

  // Validate step 5 (Username and Password)
  const validateStep5 = () => {
    setError('');
    
    if (!formData.username || formData.username.trim() === '') {
      setError('Username is required');
      return false;
    }
    
    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  // Handle next step logic with validation
  const handleNextStep = () => {
    let isValid = false;
    
    switch(step) {
      case 1:
        isValid = validateStep1();
        if (isValid) {
          // Send confirmation email when user successfully completes step 1
          sendConfirmationEmail(formData.email);
        }
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        break;
      case 5:
        isValid = validateStep5();
        if (isValid) {
          handleSubmit();
          return;
        }
        break;
      default:
        isValid = true;
    }
    
    if (isValid) {
      setStep(step + 1);
    }
  };

  // Function to send confirmation email
  const sendConfirmationEmail = async (email) => {
    try {
      // Show a toast or notification that email is being sent
      console.log(`Sending confirmation email to: ${email}`);
      
      // Create email data
      const emailData = {
        email: email,
        registrationDate: new Date().toLocaleDateString(),
        websiteName: 'Kaya Natin Youth - Moncada'
      };
      
      // Get HTML content from template
      const htmlContent = getEmailConfirmationTemplate(emailData);
      
      // Send email using the API service
      const response = await emailAPI.sendConfirmationEmail({
        to: email,
        subject: 'Welcome to Kaya Natin Youth - Moncada!',
        html: htmlContent,
        text: `Thank you for registering with Kaya Natin Youth - Moncada! We've received your email address (${email}) and you're on your way to becoming a member.`
      });
      
      if (response.success) {
        console.log('Confirmation email sent successfully:', response.message);
        setEmailSent(true); // Update state to show notification
        
        // Auto-hide the email notification after 5 seconds
        setTimeout(() => {
          setEmailSent(false);
        }, 5000);
      } else {
        console.warn('Failed to send confirmation email, but continuing registration');
      }
    } catch (error) {
      // Log the error but continue with registration
      console.error('Error sending confirmation email:', error);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Calculate age from birthday
      const age = calculateAge(formData.birthday);
      
      // Prepare user data for registration
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        age: age, // Use calculated age
        birthday: formData.birthday,
        organization: formData.organization,
        committee: formData.committee,
        memberOrg: formData.memberOrg
      };

      // Register the user
      await register(userData);
      
      // Redirect to home page on successful registration
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-100 text-gray-900 flex justify-center items-center overflow-hidden">
      <div className="lg:w-2/3 xl:w-8/12 max-w-screen-xl bg-white shadow sm:rounded-lg flex">
        {/* Left side with Background Image */}
        <div className=" rounded-l-lg lg:w-1/2 xl:w-8/12 p-6 sm:p-12 bg-gradient-to-br from-purple-600 via-blue-400 via-green-300 to-yellow-300">
          <div
            className="w-full bg-contain bg-center bg-no-repeat h-full "
            style={{
              backgroundImage: `url(${logo})`,
            }}
          ></div>
        </div>

        {/* Right side with Form */}
        <div className="lg:w-1/2 xl:w-8/12 p-6 sm:p-12 flex flex-col justify-center">
          {/* Header Section */}
          <div className="flex items-center mb-8">
            <img
              src={logo}
              alt="User"
              className="w-14 h-14 rounded-full mr-4"
            />
            <div>
              <h2 className="text-lg font-bold text-gray-900">KNY MONCADA</h2>
              <h3 className="text-sm text-gray-600">Become a Member</h3>
            </div>
          </div>

          {/* Email sent notification */}
          {emailSent && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex justify-between items-center">
              <span>
                <strong>Email sent!</strong> Please check your inbox for a confirmation email.
              </span>
              <button
                type="button"
                className="text-green-700"
                onClick={() => setEmailSent(false)}
              >
                ✕
              </button>
            </div>
          )}

          {/* Step Indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((stepNumber) => (
                <React.Fragment key={stepNumber}>
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      stepNumber === step 
                        ? 'bg-violet-700 text-white' 
                        : stepNumber < step 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {stepNumber < step ? '✓' : stepNumber}
                  </div>
                  {stepNumber < 5 && (
                    <div 
                      className={`w-10 h-1 ${
                        stepNumber < step ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    ></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Step-based Form Sections */}
          <form className="w-full max-w-md mx-auto">
  {step === 1 && (
    <div>
      {/* Step 1: Informed Consent */}
      <h1 className="text-xl font-bold mb-4">Informed Consent</h1>
      <p className="text-sm text-gray-600 text-justify mb-4">
        I hereby authorize Kaya Natin! Youth- Moncada to collect and process all
        the data indicated. I understand that all my personal information is protected
        by RA 10173, Data Privacy Act of 2012, and I agree to provide truthful information.
      </p>
      <div className="mb-4">
        <label className="block mb-2 text-gray-700">
          Do you agree? <span className="text-red-500">*</span>
        </label>
        <div className="flex justify-center items-center space-x-20 w-full">
          <label className="flex items-center">
            <input
              type="radio"
              name="consent"
              value="agree"
              className="mr-2 accent-gray-400 focus:accent-violet-700"
              onChange={handleInputChange}
              checked={formData.consent === 'agree'}
              required
            />
            <span className="text-gray-700">Agree</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="consent"
              value="disagree"
              className="mr-2 accent-gray-400 focus:accent-violet-700"
              onChange={handleInputChange}
              checked={formData.consent === 'disagree'}
            />
            <span className="text-gray-700">Disagree</span>
          </label>
        </div>
      </div>
      <label className="block mb-1 text-gray-700">
        Email <span className="text-red-500">*</span>
      </label>
      <input
        type="email"
        name="email"
        placeholder="Enter your email"
        className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-violet-700 mb-1"
        onChange={handleInputChange}
        value={formData.email || ''}
        required
      />
      <p className="text-xs text-gray-500 mb-4">
        Please use a valid email address with a correct domain (e.g., username@gmail.com, username@yahoo.com)
      </p>
    </div>
  )}

  {step === 2 && (
    <div>
      {/* Step 2: Personal Details */}
      <h1 className="text-xl font-bold mb-4">Personal Details</h1>
      <div className="mb-4">
        <label className="block mb-1 text-gray-700">
          First Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-violet-700"
          onChange={handleInputChange}
          value={formData.firstName || ''}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 text-gray-700">
          Middle Name
        </label>
        <input
          type="text"
          name="middleName"
          placeholder="Middle Name"
          className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-violet-700"
          onChange={handleInputChange}
          value={formData.middleName || ''}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 text-gray-700">
          Last Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-violet-700"
          onChange={handleInputChange}
          value={formData.lastName || ''}
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Birthday <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="birthday"
          className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 placeholder-gray-500 text-sm text-gray-500 focus:outline-none focus:border-violet-700"
          onChange={handleInputChange}
          value={formData.birthday || ''}
          max={new Date().toISOString().split('T')[0]}
          required
        />
        {formData.birthday && (
          <p className="mt-1 text-sm text-gray-500">
            Age: {calculateAge(formData.birthday)} years old
            {calculateAge(formData.birthday) < 14 && (
              <span className="text-red-500 ml-2">
                (Must be at least 14 years old to register)
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  )}

  {step === 3 && (
    <div>
      {/* Step 3: Organization Details */}
      <h1 className="text-xl font-bold mb-4">Organization Membership</h1>
      <label className="block mb-2 text-gray-700">
        Are you a member of any other organization? <span className="text-red-500">*</span>
      </label>
      <div className="flex items-center space-x-4 mb-4">
        <label className="flex items-center">
          <input
            type="radio"
            name="memberOrg"
            value="yes"
            className="mr-2 accent-gray-400 focus:accent-violet-700"
            onChange={handleInputChange}
            checked={formData.memberOrg === 'yes'}
            required
          />
          <span className="text-gray-700">Yes</span>
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="memberOrg"
            value="no"
            className="mr-2 accent-gray-400 focus:accent-violet-700"
            onChange={handleInputChange}
            checked={formData.memberOrg === 'no'}
          />
          <span className="text-gray-700">No</span>
        </label>
      </div>
      {formData.memberOrg === 'yes' && (
        <div>
          <label className="block mb-1 text-gray-700">
            Organization Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="organization"
            placeholder="Organization Name"
            className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-violet-700 mb-4"
            onChange={handleInputChange}
            value={formData.organization || ''}
            required
          />
        </div>
      )}
    </div>
  )}

  {step === 4 && (
    <div>
      {/* Step 4: Committee Selection */}
      <h1 className="text-xl font-bold mb-4">Contribute to a Committee</h1>
      <label className="block mb-4">
        <strong>Which committee do you think you can contribute the most? <span className="text-red-500">*</span></strong>
      </label>
      <div className="space-y-2">
        {[
          "Campaign and Advocacy",
          "Programs and Events",
          "Social Media and Communications",
          "Finance",
          "Membership",
        ].map((committee) => (
          <label
            key={committee}
            className={`block px-4 py-2 rounded-lg bg-gray-100 border cursor-pointer ${
              formData.committee === committee ? "border-violet-700" : "border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="committee"
              value={committee}
              className="mr-2 accent-gray-400 focus:accent-violet-700"
              onChange={handleInputChange}
              checked={formData.committee === committee}
              required
            />
            {committee}
          </label>
        ))}
      </div>
    </div>
  )}

  {step === 5 && (
    <div>
      {/* Step 5: Account Credentials */}
      <h1 className="text-xl font-bold mb-4">Create Your Account</h1>
      <div className="mb-4">
        <label className="block mb-1 text-gray-700">
          Username <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="username"
          placeholder="Username"
          className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-violet-700"
          onChange={handleInputChange}
          value={formData.username || ''}
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block mb-1 text-gray-700">
          Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-violet-700"
            onChange={handleInputChange}
            value={formData.password || ''}
            required
          />
          <button
            type="button"
            className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-violet-700 focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5"/>
            ) : (
              <EyeIcon className="h-5 w-5"/>
            )}
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block mb-1 text-gray-700">
          Confirm Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-violet-700"
            onChange={handleInputChange}
            value={formData.confirmPassword || ''}
            required
          />
          <button
            type="button"
            className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-violet-700 focus:outline-none"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="h-5 w-5"/>
            ) : (
              <EyeIcon className="h-5 w-5"/>
            )}
          </button>
        </div>
      </div>
      
      <p className="text-xs text-gray-600 mb-4">
        Password must be at least 8 characters long.
      </p>
    </div>
  )}

  {/* Navigation Button */}
  <div className={`flex ${step === 1 ? "justify-end" : "justify-between"} mt-6`}>

  {/* Back Button - Shown only on Steps 2-5 */}
  {step > 1 && (
    <button
      type="button"
      onClick={() => setStep(step - 1)}
      className="py-2 px-4 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400"
      disabled={isLoading}
    >
      Back
    </button>
  )}

  {/* Next/Submit Button */}
  <button
    type="button"
    onClick={handleNextStep}
    disabled={isLoading}
    className={`py-2 px-4 rounded-lg ${
      isLoading 
      ? "bg-gray-400 cursor-not-allowed" 
      : step === 5
        ? "bg-green-700 hover:bg-green-600"
        : "bg-violet-700 hover:bg-violet-600"
    } text-white`}
  >
    {isLoading 
      ? "Processing..." 
      : step === 5 
        ? "Create Account" 
        : "Next"}
  </button>
</div>

{/* Login Link */}
{step === 1 && (
  <p className="text-center mt-4 text-sm">
    Already have an account?{" "}
    <Link to="/login" className="text-violet-700 hover:underline">
      Login here
    </Link>
  </p>
)}
</form>
        </div>
      </div>
    </div>
  );
};

export default Signup;