import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import '../styles/FarmerRegistration.css';

const FarmerRegistrationForm = ({ isInDashboard = false, editData = null, onClose }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [photoPreviewStep0, setPhotoPreviewStep0] = useState(null);
  const [photoPreviewStep3, setPhotoPreviewStep3] = useState(null);
  const [selectedPhotoName, setSelectedPhotoName] = useState('');
  const [selectedDoc, setSelectedDoc] = useState('');
  const [cropCategoryStep3, setCropCategoryStep3] = useState('');
  const [cropCategoryStep4, setCropCategoryStep4] = useState('');
  const [selectedIrrigationTab, setSelectedIrrigationTab] = useState('Current');
  const [farmerData] = useState(editData);
  const [photoPreview] = useState(editData?.photo || null);

  // Initialize photo name if editing
  useEffect(() => {
    if (editData?.photoFileName) {
      setSelectedPhotoName(editData.photoFileName);
    }
  }, [editData]);

  const totalSteps = 8;

  const methods = useForm({
    defaultValues: {
      // Step 0 - Personal Details
      salutation: editData?.salutation || '',
      firstName: editData?.firstName || '',
      middleName: editData?.middleName || '',
      lastName: editData?.lastName || '',
      gender: editData?.gender || '',
      nationality: editData?.nationality || '',
      dateOfBirth: editData?.dateOfBirth || '',
      contactNumber: editData?.contactNumber || '',
      fatherName: editData?.fatherName || '',
      alternativeType: editData?.alternativeType || '',
      alternativeNumber: editData?.alternativeNumber || '',
      photo: editData?.photo || null,

      // Step 1 - Address
      country: editData?.country || 'India',
      state: editData?.state || '',
      district: editData?.district || '',
      block: editData?.block || '',
      village: editData?.village || '',
      pincode: editData?.pincode || '',

      // Step 2 - Professional Details
      education: editData?.education || '',
      experience: editData?.experience || '',

      // Step 3 - Current Crop Details
      currentSurveyNumber: editData?.currentSurveyNumber || '',
      currentLandHolding: editData?.currentLandHolding || '',
      currentGeoTag: editData?.currentGeoTag || '',
      currentCrop: editData?.currentCrop || '',
      currentNetIncome: editData?.currentNetIncome || '',
      currentSoilTest: editData?.currentSoilTest || '',
      currentSoilTestCertificateFileName: editData?.currentSoilTestCertificateFileName || null,

      // Step 4 - Proposed Crop Details
      proposedSurveyNumber: editData?.proposedSurveyNumber || '',
      proposedLandHolding: editData?.proposedLandHolding || '',
      proposedGeoTag: editData?.proposedGeoTag || '',
      cropType: editData?.cropType || '',
      netIncome: editData?.netIncome || '',
      proposedSoilTest: editData?.proposedSoilTest || '',
      soilTestCertificate: editData?.soilTestCertificate || null,

      // Step 5 - Irrigation Details
      currentWaterSource: editData?.currentWaterSource || '',
      currentDischargeLPH: editData?.currentDischargeLPH || '',
      currentSummerDischarge: editData?.currentSummerDischarge || '',
      currentBorewellLocation: editData?.currentBorewellLocation || '',
      proposedWaterSource: editData?.proposedWaterSource || '',
      proposedDischargeLPH: editData?.proposedDischargeLPH || '',
      proposedSummerDischarge: editData?.proposedSummerDischarge || '',
      proposedBorewellLocation: editData?.proposedBorewellLocation || '',

      // Step 6 - Bank Details
      bankName: editData?.bankName || '',
      accountNumber: editData?.accountNumber || '',
      branchName: editData?.branchName || '',
      ifscCode: editData?.ifscCode || '',
      passbookFile: editData?.passbookFile || null,

      // Step 7 - Documents
      documentType: editData?.documentType || '',
      documentNumber: editData?.documentNumber || '',
      documentFileName: editData?.documentFileName || null,
    }
  });

  const { register, handleSubmit, watch, setValue, trigger, clearErrors, formState: { errors } } = methods;

  const cropOptions = {
    'Cereals': ['Rice', 'Wheat', 'Maize', 'Sorghum', 'Pearl Millet', 'Finger Millet'],
    'Pulses': ['Chickpea', 'Pigeon Pea', 'Lentil', 'Mung Bean', 'Urad Bean', 'Cowpea'],
    'Oilseeds': ['Groundnut', 'Soybean', 'Sunflower', 'Sesame', 'Mustard', 'Safflower'],
    'Vegetables': ['Tomato', 'Onion', 'Potato', 'Brinjal', 'Cabbage', 'Cauliflower'],
    'Fruits': ['Mango', 'Banana', 'Orange', 'Apple', 'Grape', 'Pomegranate'],
    'Cash Crops': ['Cotton', 'Sugarcane', 'Tobacco', 'Jute', 'Tea', 'Coffee']
  };

  const waterSourceOptions = [
    'Borewell',
    'Open Well',
    'Canal',
    'River',
    'Pond',
    'Rainfed',
    'Drip Irrigation',
    'Sprinkler Irrigation'
  ];

  const onSubmit = async (data) => {
    try {
      console.log('Form submitted with data:', data);
      
      // Here you would typically send the data to your backend
      // For now, we'll just log it and show a success message
      
      if (isInDashboard) {
        // If in dashboard mode, close the form
        onClose && onClose();
      } else {
        // If standalone, navigate to dashboard
        navigate('/admin/dashboard');
      }
      
      alert('Farmer registration completed successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
    }
  };

  return (
    <div className={isInDashboard ? "farmer-wrapper dashboard-mode" : "farmer-wrapper"}>
      <div className="form-full">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="farmer">
         
           {currentStep === 0 && (
  <div className="form-grid">
    <div className="field-left">
      {/* Photo Upload */}
     <div className="form-group photo-group">
  <label>
    Photo <span className="optional">(Optional)</span>
  </label>

  {/* Preview box */}
  <div className="photo-box">
    {photoPreviewStep0 ? (
      <img
        src={photoPreviewStep0}
        alt="Preview"
        className="photo-preview"
      />
    ) : photoPreview ? (
      <>
        {console.log("👨‍🌾 Fetched photo URL:", photoPreview)}
                 <img
           src={photoPreview}
           alt="Farmer"
           className="photo-preview"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "block";
            console.log("❌ Failed to load fetched photo:", photoPreview);
          }}
        />
        <span style={{ display: "none", color: "#666" }}>Photo not available</span>
      </>
    ) : (
      <span className="photo-placeholder">No photo selected</span>
    )}
  </div>

  {/* File input */}
  <input
    type="file"
    accept="image/*"
    className="photo-input"
    {...register("photo")}
    onChange={(e) => {
      const file = e.target.files[0];
      if (file) {
        setPhotoPreviewStep0(URL.createObjectURL(file));
        setValue("photo", file, { shouldValidate: true }); // Register value for RHF
        setSelectedPhotoName(file.name); // Track selected file name
        // Clear any existing photo error
        clearErrors("photo");
      }
    }}
  />
  {/* Show file name if selected or from backend */}
  <div style={{ marginTop: "6px", fontSize: "0.95em", color: "#444" }}>
    {selectedPhotoName
      ? `Selected: ${selectedPhotoName}`
      : photoPreview && farmerData && farmerData.photoFileName
        ? `Current: ${farmerData.photoFileName}`
        : null}
  </div>

  {/* Validation error message */}
  {errors.photo && (
    <p className="error-text">{errors.photo.message}</p>
  )}
</div>

 
          <label className="label">Salutation<span className="required">*</span></label>
      <select
        className="input"
        {...register("salutation", { required: "Salutation is required" })}
      >
        <option value="">Select</option>
        <option value="Mr.">Mr.</option>
        <option value="Mrs.">Mrs.</option>
        <option value="Ms.">Ms.</option>
        <option value="Miss.">Miss.</option>
        <option value="Dr.">Dr.</option>
      </select>
      {errors.salutation && <p className="error">{errors.salutation.message}</p>}
   
      <label className="label">First Name<span className="required">*</span></label>
      <input
        className="input"
        placeholder="First Name"
        {...register("firstName", { required: "First Name is required" })}
      />
      {errors.firstName && <p className="error">{errors.firstName.message}</p>}
 
     <label className="label">Middle Name<span className="required">*</span></label>
      <input
        className="input"
        placeholder="Middle Name"
        {...register("middleName", { required: "Middle Name is required" })}
      />
      {errors.middleName && <p className="error">{errors.middleName.message}</p>}
 
      <label className="label">Last Name<span className="required">*</span></label>
      <input
        className="input"
        placeholder="Last Name"
        {...register("lastName", { required: "Last Name is required" })}
      />
      {errors.lastName && <p className="error">{errors.lastName.message}</p>}
     </div>
 
    <div className="field-right">
     
       <label className="label">Gender<span className="required">*</span></label>
      <select
        className="input"
        {...register("gender", { required: "Gender is required" })}
      >
        <option value="">Select</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Transgender">Transgender</option>
      </select>
      {errors.gender && <p className="error">{errors.gender.message}</p>}
 
     <label className="label">Nationality<span className="required">*</span></label>
      <select
        className="input"
        {...register("nationality", { required: "Nationality is required" })}
      >
        <option value="">Select</option>
        <option value="Indian">Indian</option>
      </select>
      {errors.nationality && <p className="error">{errors.nationality.message}</p>}
 
         <label>Date of Birth  <span className="required">*</span></label>
                <input
                  type="date"
                  placeholder="YYYY-MM-DD"
                  {...register("dateOfBirth")}
                />
                <p className="reg-error">{errors.dateOfBirth?.message}</p>
 
         <label>
        Contact Number <span className="optional"></span>
        <input type="tel" maxLength={10} {...register("contactNumber")} placeholder="10-digit number" />
      </label>
      <p className="error">{errors.contactNumber?.message}</p>
      <label>
 
        Father Name <span className="optional"></span>
        <input type="text" {...register("fatherName")} placeholder="Enter father's name" />
      </label>
      <p className="error">{errors.fatherName?.message}</p>
 
      <label>
        Alternative Type <span className="optional"></span>
        <select {...register("alternativeType")}>
          <option value="">Select Relation</option>
          <option value="Father">Father</option>
          <option value="Mother">Mother</option>
          <option value="Brother">Brother</option>
          <option value="Sister">Sister</option>
          <option value="Son">Son</option>
          <option value="Daughter">Daughter</option>
          <option value="Spouse">Spouse</option>
          <option value="Other">Other</option>
        </select>
      </label>
      <p className="error">{errors.alternativeType?.message}</p>
 
      <label>
        Alternative Number <span className="optional"></span>
        <input type="tel" maxLength={10} {...register("alternativeNumber")} placeholder="10-digit number" />
      </label>
      <p className="error">{errors.alternativeNumber?.message}</p>
     
    </div>
  </div>
)}
 
 
      {currentStep === 1 && (
  <div className="address-field">
    {/* Country */}
<label>
 
  Country <span className="required">*</span>
</label>
<input
 
  type="text"
 
  {...register("country", { required: "Country is required" })}
 
  placeholder="Enter your country"
 
/>
<p className="error">{errors.country?.message}</p>
 
{/* State */}
<label>
 
  State <span className="required">*</span>
</label>
<input
 
  type="text"
 
  {...register("state", { required: "State is required" })}
 
  placeholder="Enter your state"
 
/>
<p className="error">{errors.state?.message}</p>
 
 
   <label>
  District <span className="required">*</span>
</label>
<input
  type="text"
  {...register("district", { required: "District is required" })}
  placeholder="Enter your district"
/>
<p className="error">{errors.district?.message}</p>
 
{/* Mandal */}
<label>
  Mandal <span className="required">*</span>
</label>
<input
  type="text"
  {...register("block", { required: "block is required" })}
  placeholder="Enter your block"
/>
<p className="error">{errors.mandal?.message}</p>
 
{/* Village */}
<label>
  Village <span className="required">*</span>
</label>
<input
  type="text"
  {...register("village", { required: "Village is required" })}
  placeholder="Enter your village"
/>
<p className="error">{errors.village?.message}</p>
 
    {/* Pincode */}
    <label>Pincode <span className="required">*</span></label>
    <input
      type="text"
      {...register("pincode", { required: "Pincode is required" })}
      placeholder="e.g. 500001"
    />
    <p className="error">{errors.pincode?.message}</p>
  </div>
)}
 
 
{currentStep === 2 && (
                <>
              <div className="profes-field">
                <label>Education <span className="optional"></span></label>
                <select {...register("education")}>
                  <option value="">Select</option>
                  <option value="Illiterate">Illiterate</option>
                  <option value="Primary Schooling">Primary Schooling</option>
                  <option value="High School">High School</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Degree">Degree</option>
                 </select>
                <p>{errors.education?.message}</p>
 
                <label>Experience <span className="optional"></span>
                  <input {...register("experience")} placeholder="e.g. 15 Years" />
                </label>
                <p>{errors.experience?.message}</p>
              </div>
              </>
            )}
 
            {currentStep === 3 && (
  <>
    <div className="current-field">
      <div className="currentform-grid">
        <div className="cropform-columnleft">
          <div className="form-group photo-group">
            <label>Photo <span className="optional"></span></label>
            <div className="photo-box">
              {photoPreviewStep3 ? (
                <img src={photoPreviewStep3} alt="Preview" className="photo-preview" />
              ) : (
                <span className="photo-placeholder">No photo selected</span>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setPhotoPreviewStep3(URL.createObjectURL(file));
                  setValue("photoFileName", file, { shouldValidate: true });
                }
              }}
              className="photo-input"
            />
          </div>
          <label>Survey Numbers <span className="optional"></span>
            <input {...register("currentSurveyNumber")} />
          </label>
          <p>{errors.currentSurveyNumber?.message}</p>
          <label>Total Land Holding (In Acres Nos) <span className="optional">(Optional)</span>
            <input
              type="number"
              step="any"
              {...register("currentLandHolding", { valueAsNumber: true })}
            />
          </label>
          <p>{errors.currentLandHolding?.message}</p>
          <label>Geo-tag <span className="optional"></span>
            <input {...register("currentGeoTag")} />
          </label>
          <p>{errors.currentGeoTag?.message}</p>
        </div>
        <div className="cropform-columnright">
          <label>
            Select Crop Category <span className="optional"></span>
            <select
              value={cropCategoryStep3}
              onChange={(e) => {
                setCropCategoryStep3(e.target.value);
                setValue("currentCrop", "");
              }}
            >
              <option value="">Select</option>
              {Object.keys(cropOptions).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </label>
          {cropCategoryStep3 && (
            <label>
              Select Crop Name <span className="optional"></span>
              <select {...register("currentCrop")} defaultValue="">
                <option value="">Select</option>
                {cropOptions[cropCategoryStep3].map((crop) => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
              </select>
            </label>
          )}
          <p className="error">{errors.currentCrop?.message}</p>
          <label>Net Income (As per Current Crop/Yr) <span className="optional"></span>
            <input {...register("currentNetIncome")} />
          </label>
          <p>{errors.currentNetIncome?.message}</p>
          <label>Soil Test <span className="optional"></span>
            <select
              {...register("currentSoilTest")}
              onChange={e => setValue("currentSoilTest", e.target.value === "true")}
              value={typeof watch("currentSoilTest") === "boolean" ? String(watch("currentSoilTest")) : ""}
            >
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
          <p>{errors.currentSoilTest?.message}</p>
          <label>Soil Test Certificate
            <input type="file" {...register("currentSoilTestCertificateFileName")} />
            {errors.currentSoilTestCertificateFileName && (
              <p className="error">{errors.currentSoilTestCertificateFileName.message}</p>
            )}
          </label>
        </div>
      </div>
    </div>
  </>
)}
     {currentStep === 4 && (
              <div className="proposed-field">
                 <div className="proposedform-grid">
                 <div className="proposedform-columnleft">
                <label>Survey Numbers <span className="optional"></span>
                 <input {...register("proposedSurveyNumber")} />
                </label>
                <p>{errors.proposedSurveyNumber?.message}</p>
 
                <label>
                 Geo-tag <span className="optional">(Optional)</span>
                <input
                type="text"
                placeholder="Latitude, Longitude"
              {...register("proposedGeoTag", {
                pattern: {
                  value: /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/,
                 message: "Enter valid Latitude, Longitude (e.g., 17.123, 78.456)"
                }
                })}
               />
              </label>
              <p className="error">{errors.proposedGeoTag?.message}</p>
 
 
               <label>
               Select Crop Category <span className="optional"></span>
               <select
               value={cropCategoryStep4}
               onChange={(e) => {
               setCropCategoryStep4(e.target.value);
               setValue("cropType", ""); // unique field name
               }}
               >
              <option value="">Select</option>
              {Object.keys(cropOptions).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              </label>
 
               {cropCategoryStep4 && (
              <label>
               Select Crop Name <span className="optional"></span>
               <select {...register("cropType")} defaultValue="">
               <option value="">Select</option>
                {cropOptions[cropCategoryStep4].map((crop) => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}
               </select>
              </label>
               )}
               <p className="error">{errors.cropType?.message}</p>
 
 
                <label>Soil Test <span className="optional"></span>
                <select
                  {...register("proposedSoilTest")}
                  onChange={e => setValue("proposedSoilTest", e.target.value === "true")}
                  value={typeof watch("proposedSoilTest") === "boolean" ? String(watch("proposedSoilTest")) : ""}
                >
                  <option value="">Select</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
                </label>
                <p>{errors.proposedSoilTest?.message}</p>
                </div>
 
                <div className="proposedform-columnright">
                <label>Total Land Holding (In Acres) <span className="optional"></span>
                <input
                     type="number"
                     step="any"
                   {...register("proposedLandHolding", {
                     valueAsNumber: true,
                      })}
                        />
                </label>
                <p>{errors.proposedLandHolding?.message}</p>
 
                <label>Net Income (Per Crop/Yr) <span className="optional"></span>
                <input type="text" {...register("netIncome")} />
                </label>
                <p className="error">{errors.netIncome?.message}</p>
 
                <label>Soil Test Certificate
                 <input type="file" {...register("soilTestCertificate")} />
                   {errors.soilTestCertificate && (
                  <p className="error">{errors.soilTestCertificate.message}</p>
                   )}
                 </label>
                 </div>
                </div>
               </div>
      )}
         {currentStep === 5 && (
  <div className="irrigation-field">
    {/* Tabs Header */}
    <div className="tab-header">
      <span
        className={selectedIrrigationTab === "Current" ? "tab active" : "tab"}
        onClick={() => setSelectedIrrigationTab("Current")}
      >
        Current Crop Addition
      </span>
      <span
        className={selectedIrrigationTab === "Proposed" ? "tab active" : "tab"}
        onClick={() => setSelectedIrrigationTab("Proposed")}
      >
        Proposed Crop Addition
      </span>
    </div>
 
    {/* Current Crop Tab */}
    {selectedIrrigationTab === "Current" && (
      <div className="tab-content">
        <label>
          Water Source <span className="required">*</span>
          <select {...register("currentWaterSource")} defaultValue="">
            <option value="">Select</option>
            {waterSourceOptions.map((source) => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </label>
        <p className="error">{errors.currentWaterSource?.message}</p>
        <label>
          Borewell wise Discharge in LPH <span className="optional"></span>
          <input {...register("currentDischargeLPH")} />
        </label>
        <p className="error">{errors.currentDischargeLPH?.message}</p>
        <label>
          Discharge during summer months <span className="optional"></span>
          <input {...register("currentSummerDischarge")} />
        </label>
        <p className="error">{errors.currentSummerDischarge?.message}</p>
        <label>
          Borewell location <span className="optional"></span>
          <input {...register("currentBorewellLocation")} />
        </label>
        <p className="error">{errors.currentBorewellLocation?.message}</p>
      </div>
    )}
 
    {/* Proposed Crop Tab */}
    {selectedIrrigationTab === "Proposed" && (
      <div className="tab-content">
        <label>
          Water Source <span className="required">*</span>
          <select {...register("proposedWaterSource")} defaultValue="">
            <option value="">Select</option>
            {waterSourceOptions.map((source) => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </label>
        <p className="error">{errors.proposedWaterSource?.message}</p>
        <label>
          Borewell wise Discharge in LPH <span className="optional"></span>
          <input {...register("proposedDischargeLPH")} />
        </label>
        <p className="error">{errors.proposedDischargeLPH?.message}</p>
        <label>
          Discharge during summer months <span className="optional"></span>
          <input {...register("proposedSummerDischarge")} />
        </label>
        <p className="error">{errors.proposedSummerDischarge?.message}</p>
        <label>
          Borewell location <span className="optional"></span>
          <input {...register("proposedBorewellLocation")} />
        </label>
        <p className="error">{errors.proposedBorewellLocation?.message}</p>
      </div>
    )}
  </div>
)}
 
    {currentStep === 6 && (
                <div className="other-field">
                 <h3>Bank Details</h3>
 
                 <label>Bank Name <span className="optional"></span></label>
                <input type="text" {...register("bankName")} />
                <p className="error">{errors.bankName?.message}</p>
 
               <label>Account Number <span className="optional"></span></label>
                <input type="text" {...register("accountNumber")} />
                <p className="error">{errors.accountNumber?.message}</p>
 
               <label>Branch Name <span className="optional"></span></label>
                <input type="text" {...register("branchName")} />
              <p className="error">{errors.branchName?.message}</p>
     
              <label>IFSC Code <span className="optional"></span></label>
               <input type="text" {...register("ifscCode")} />
               <p className="error">{errors.ifscCode?.message}</p>
 
              <label>Passbook <span className="optional"></span></label>
             <input
             type="file"
             accept="image/*,application/pdf"
             onChange={(e) => {
             const file = e.target.files[0];
             setValue("passbookFile", file);
             trigger("passbookFile");
             }}
             />
             <p className="error">{errors.passbookFile?.message}</p>
             </div>
  )}
 
        {currentStep === 7 && (
  <div className="other-field">
    <label className="label">
      Add Document <span className="optional"></span>
    </label>

    <select
      className="docinput"
      {...register("documentType", { required: "Document Type is required" })}
      onChange={(e) => {
        setSelectedDoc(e.target.value);
        setValue("documentType", e.target.value); // sync with react-hook-form
      }}
    >
      <option value="">Select</option>
      <option value="voterId">ID/ Voter Card</option>
      <option value="aadharNumber">Aadhar Number</option>
      <option value="panNumber">Pan Number</option>
      <option value="ppbNumber">PPB Number</option>
    </select>
    <p className="error-text">{errors.documentType?.message}</p>
    {/* Document Number and File */}
    {selectedDoc && (
      <>
        <input
          type="text"
          placeholder={selectedDoc === "voterId" ? "Voter ID" : selectedDoc === "aadharNumber" ? "Aadhar Number" : selectedDoc === "panNumber" ? "PAN Number" : "PPB Number"}
          className="input"
          {...register("documentNumber", { required: `${selectedDoc === "voterId" ? "Voter ID" : selectedDoc === "aadharNumber" ? "Aadhar Number" : selectedDoc === "panNumber" ? "PAN Number" : "PPB Number"} is required` })}
        />
        <p className="error-text">{errors.documentNumber?.message}</p>
        <input
          type="file"
          accept="image/*,application/pdf"
          {...register("documentFileName", { required: `${selectedDoc === "voterId" ? "Voter ID" : selectedDoc === "aadharNumber" ? "Aadhar" : selectedDoc === "panNumber" ? "PAN" : "PPB"} File is required` })}
        />
        <p className="error-text">{errors.documentFileName?.message}</p>
      </>
    )}
  </div>
)}
             <div className="btn-group">
  {currentStep === 0 ? (
    <button
      type="button"
      onClick={async () => {
        const isValid = await trigger();
        if (isValid) setCurrentStep(currentStep + 1);
      }}
    >
      Next
    </button>
  ) : currentStep === totalSteps - 1 ? (
    <>
      <button type="button" onClick={() => setCurrentStep(currentStep - 1)}>
        Previous
      </button>
      <button
        type="button"
        onClick={async () => {
          const isValid = await trigger();
          if (isValid) {
            await handleSubmit(onSubmit)();
          }
        }}
      >
        Submit
      </button>
    </>
  ) : (
    <>
      <button type="button" onClick={() => setCurrentStep(currentStep - 1)}>
        Previous
      </button>
      <button
        type="button"
        onClick={async () => {
          const isValid = await trigger();
          if (isValid) setCurrentStep(currentStep + 1);
        }}
      >
        Next
      </button>
    </>
  )}
</div>
 
 
 
          </form>
        </FormProvider>
      </div>
      {!isInDashboard && (
        <div className="form-right" style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => {
              // Check if we're in the admin dashboard context
              if (isInDashboard) {
                // If in admin dashboard, don't navigate away
                // The dashboard will handle the close action
              } else {
                // Otherwise navigate to dashboard
                navigate('/dashboard');
              }
            }}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'rgba(0,0,0,0.45)',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 20,
              lineHeight: '32px',
              textAlign: 'center',
              zIndex: 2
            }}
            aria-label="Close and go back"
          >
            ×
          </button>  
        </div>
      )}
    </div>
  );
};

export default FarmerRegistrationForm; 