import React, { useState } from "react";
import AuthImg from "../assets/AuthImg.png";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import logo from "../assets/logo.png";
import {Link, useNavigate} from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1); // Tracks the current step
  const [formData, setFormData] = useState({}); // Stores form data
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle changes in the input fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value }); // Update the formData state
  };

  // Validate step 1 (Consent and Email)
  const validateStep1 = () => {
    setError('');
    
    if (formData.consent !== 'agree') {
      setError('You must agree to the terms to continue');
      return false;
    }
    
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
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
    
    if (!formData.age || formData.age <= 0) {
      setError('Please enter a valid age');
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

  // Handle form submission
  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Prepare user data for registration
      const userData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        age: formData.age,
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
        <label className="block mb-2 text-gray-700">Do you agree?</label>
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
      <input
        type="email"
        name="email"
        placeholder="Enter your email"
        className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-violet-700 mb-4"
        onChange={handleInputChange}
        value={formData.email || ''}
        required
      />
    </div>
  )}

  {step === 2 && (
    <div>
      {/* Step 2: Personal Details */}
      <h1 className="text-xl font-bold mb-4">Personal Details</h1>
      <input
        type="text"
        name="firstName"
        placeholder="First Name"
        className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-violet-700 mb-4"
        onChange={handleInputChange}
        value={formData.firstName || ''}
        required
      />
      <input
        type="text"
        name="middleName"
        placeholder="Middle Name"
        className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-violet-700 mb-4"
        onChange={handleInputChange}
        value={formData.middleName || ''}
      />
      <input
        type="text"
        name="lastName"
        placeholder="Last Name"
        className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-violet-700 mb-4"
        onChange={handleInputChange}
        value={formData.lastName || ''}
        required
      />
      <input
        type="number"
        name="age"
        placeholder="Age"
        className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-violet-700 mb-4"
        onChange={handleInputChange}
        value={formData.age || ''}
        required
      />
      <input
        type="date"
        name="birthday"
        placeholder="Birthday"
        className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 placeholder-gray-500 text-sm text-gray-500 focus:outline-none focus:border-violet-700 mb-4"
        onChange={handleInputChange}
        value={formData.birthday || ''}
      />
    </div>
  )}

  {step === 3 && (
    <div>
      {/* Step 3: Organization Details */}
      <h1 className="text-xl font-bold mb-4">Organization Membership</h1>
      <label className="block mb-2 text-gray-700">Are you a member of any other organization?</label>
      <div className="flex items-center space-x-4 mb-4">
        <label className="flex items-center">
          <input
            type="radio"
            name="memberOrg"
            value="yes"
            className="mr-2 accent-gray-400 focus:accent-violet-700"
            onChange={handleInputChange}
            checked={formData.memberOrg === 'yes'}
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
        <input
          type="text"
          name="organization"
          placeholder="Organization Name"
          className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-violet-700 mb-4"
          onChange={handleInputChange}
          value={formData.organization || ''}
          required
        />
      )}
    </div>
  )}

  {step === 4 && (
    <div>
      {/* Step 4: Committee Selection */}
      <h1 className="text-xl font-bold mb-4">Contribute to a Committee</h1>
      <label className="block mb-4">
        <strong>Which committee do you think you can contribute the most?</strong>
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
      <input
        type="text"
        name="username"
        placeholder="Username"
        className="w-full px-4 py-2 rounded-lg bg-gray-100 border border-gray-300 placeholder-gray-500 text-sm focus:outline-none focus:border-violet-700 mb-4"
        onChange={handleInputChange}
        value={formData.username || ''}
        required
      />
      
      <div className="relative mb-4">
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
      
      <div className="relative mb-4">
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