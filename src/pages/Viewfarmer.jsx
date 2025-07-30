import React, { useEffect, useState } from "react";
 import { useFormContext } from "react-hook-form";
import "../styles/FarmerView.css";
import logo3 from "../assets/rightlogo.png";
import logo4 from "../assets/middle.png";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import stepSchemas from '../validations/stepSchemas';

 

  const ViewFarmer = () => {
  const navigate = useNavigate();
  const { farmerId } = useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [farmer, setFarmer] = useState({
  waterSource: "",
  borewellDischarge: "",
  summerDischarge: "",
  borewellLocation: "",
  voterId: "",
  aadharNumber: "",
  panNumber: "",
  ppbNumber: "",
  documentType: "",
  // add other fields as needed
});

 

 const {
    register,
    handleSubmit,
    setValue,
    trigger,
    watch,
    reset,
    formState: { errors },
  } = useForm();

const watchedFields = watch();

const [photoPreviewStep0, setPhotoPreviewStep0] = useState(null);
const [photoPreviewStep3, setPhotoPreviewStep3] = useState(null);
const [cropCategoryStep3, setCropCategoryStep3] = useState("");
const [waterSourceCategory, setWaterSourceCategory] = useState("");
const [selectedIrrigationTab, setSelectedIrrigationTab] = useState("Current");
const cropOptions = {
  Grains: ["Rice", "Wheat", "Maize"],
  Vegetables: ["Tomato", "Carrot", "Spinach"],
  Fruits: ["Mango", "Banana", "Papaya"]
};

const waterSourceOptions = ["Borewell", "Open Well", "Canal", "Tank", "River", "Drip"];

const handlePhotoChangeStep3 = (e) => {
  const file = e.target.files[0];
  if (file) {
    setValue("photo", file, { shouldValidate: true });
    setPhotoPreviewStep3(URL.createObjectURL(file));
  }
};

  const [farmerData, setFarmerData] = useState(null);

  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("You are not logged in.");
    return;
  }

  fetch(`http://localhost:8080/api/farmers/${farmerId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Farmer Data:", data);
      console.log("Photo fields:", {
        photoFileName: data.photoFileName,
        photoUrl: data.photoUrl,
        photo: data.photo
      });
      console.log("Alternative fields:", {
        alternativeType: data.alternativeType,
        alternativeRelationType: data.alternativeRelationType,
        alternativeContactNumber: data.alternativeContactNumber,
        alternativeNumber: data.alternativeNumber
      });
      setFarmerData(data);
      
      // Map the data to form fields properly
      const formData = {
        // Personal Information
        salutation: data.salutation || "",
        firstName: data.firstName || "",
        middleName: data.middleName || "",
        lastName: data.lastName || "",
        gender: data.gender || "",
        nationality: data.nationality || "",
        dateOfBirth: data.dateOfBirth || "",
        contactNumber: data.contactNumber || "",
        fatherName: data.fatherName || "",
        alternativeType: data.alternativeType || data.alternativeRelationType || "",
        alternativeNumber: data.alternativeContactNumber || data.alternativeNumber || "",
        
        // Address
        country: data.country || "",
        state: data.state || "",
        district: data.district || "",
        mandal: data.mandal || data.block || "",
        village: data.village || "",
        pincode: data.pincode || "",
        
        // Professional Information
        education: data.education || "",
        experience: data.experience || "",
        
        // Current Crop
        currentSurveyNumber: data.surveyNumber || "",
        currentLandHolding: data.totalLandHolding || "",
        currentGeoTag: data.geoTag || "",
        currentCrop: data.cropName || "",
        currentNetIncome: data.netIncome || "",
        currentSoilTest: data.soilTest || "",
        currentSoilTestCertificateFileName: data.soilTestCertificateFileName || null,
        cropCategory: data.cropCategory || "",
        
        // Proposed Crop
        proposedSurveyNumber: data.cropType || "",
        
        // Irrigation
        currentWaterSource: data.waterSource || "",
        currentDischargeLPH: data.borewellDischarge || "",
        currentSummerDischarge: data.summerDischarge || "",
        currentBorewellLocation: data.borewellLocation || "",
        
        // Bank
        bankName: data.bankName || "",
        accountNumber: data.accountNumber || "",
        branchName: data.branchName || "",
        ifscCode: data.ifscCode || "",
        
        // Documents
        aadharNumber: data.aadharNumber || "",
        panNumber: data.panNumber || "",
        voterId: data.voterId || "",
        ppbNumber: data.ppbNumber || "",
        passbookFile: data.passbookFileName || null
      };
      
      reset(formData);
      
      // Set photo previews if photo exists - check multiple possible field names
      if (data.photoFileName || data.photoUrl || data.photo) {
        const photoUrl = data.photoFileName 
          ? `http://localhost:8080/uploads/${data.photoFileName}`
          : data.photoUrl 
            ? `http://localhost:8080${data.photoUrl}`
            : data.photo;
        setPhotoPreviewStep0(photoUrl);
        setPhotoPreviewStep3(photoUrl);
      }
      
      // Set crop category for step 3
      if (data.cropCategory) {
        setCropCategoryStep3(data.cropCategory);
      }
    })
    .catch((err) => {
      console.error("❌ Failed to fetch farmer:", err);
      
      if (err.response) {
        const status = err.response.status;
        
        switch (status) {
          case 401:
            alert("❌ Authentication failed. Please log in again.");
            setTimeout(() => {
              window.location.href = "/login";
            }, 2000);
            break;
          case 403:
            alert("❌ Access denied. Please login again.");
            setTimeout(() => {
              window.location.href = "/login";
            }, 2000);
            break;
          case 404:
            alert("❌ Farmer not found. Please check the ID.");
            break;
          case 500:
            alert("❌ Server error. Please try again later.");
            break;
          default:
            alert(`❌ Error ${status}: Failed to load farmer data.`);
        }
      } else if (err.request) {
        alert("❌ Network error. Please check your internet connection.");
      } else {
        alert("❌ Error loading farmer data. Please try again.");
      }
    });
}, [farmerId, reset]);

// Add debug logs after farmerData is set
useEffect(() => {
  if (farmerData) {
    console.log("📷 farmerData.photoFileName:", farmerData.photoFileName);
    console.log("🌐 farmerData.photoUrl:", farmerData.photoUrl);
    console.log("🖼️ farmerData.photo:", farmerData.photo);
  }
}, [farmerData]);

// Utility function for robust photo URL selection
const getFarmerPhotoUrl = (farmerData) => {
  if (!farmerData) return null;
  if (farmerData.photoFileName) return `http://localhost:8080/uploads/${farmerData.photoFileName}`;
  if (farmerData.photoUrl) return `http://localhost:8080${farmerData.photoUrl}`;
  if (farmerData.photo) return farmerData.photo;
  return null;
};

const sidebarSteps = [
  "Personal Information",
  "Address",
  "Professional Information",
  "Current Crop",
  "Proposed Crop",
  "Irrigation",
  "Bank",
  "Documents"
];
 
  return (
   <div className="farmer-view-container">
     <div className="farmer-view-header">
  {/* Left Logo */}
   <img src={logo3} alt="DATE Logo" className="logo-img" />
  <div className="logo-section"onClick={() => setDropdownOpen(!dropdownOpen)}>  
  {photoPreviewStep0 ? (
    <img src={photoPreviewStep0} alt="User Icon" className="user-icon" />
  ) : (
    <span className="user-icon">User</span>
  )}
  <div className="one">{watch("firstName") || "Farmer Name"}</div>

  {/* 👇 Dropdown shown on click */}
  {dropdownOpen && (
    <div className="dropdown-menu">
      <div className="dropdown-item">{watch("firstName") || "User Name"}</div>
      <div className="dropdown-item">👤 My Profile</div>
      <div className="dropdown-item">⚙️ Account Settings</div>
      <div className="dropdown-item">❓ Need Help?</div>
      <div className="dropdown-item">📲 Sign Out</div>
    </div>
  )}

  </div>
  </div>
  {/* Background Image with Overlay */}
  <div className="header-background">
    <img src={logo4} alt="Field" className="bg-img" />

    {/* Center Card with Photo + ID + Name */}
    <div className="farmer-id-card">
       <div className="edit-photo-box">
            {photoPreviewStep0 ? (
             <img src={photoPreviewStep0} alt="Farmer Photo" className="farmer-photo-preview" />
            ) : (
                  <span className="farmer-photo-placeholder"> Farmer photo </span>
             )}
         </div>
         <div className="farmer-id-name">
      <div className="farmer-id">ID: <strong>{farmerData?.id || farmer?.id}</strong></div>
      <div className="one"> {watch("firstName") ? watch("firstName") : "Farmer Name"} </div> 
      </div>
    </div>
  </div> 

      <div className="body-content">
        {/* Sidebar */}
        <div className="sidebar">
          {sidebarSteps.map((item, index) => (
            <div
              key={index}
              className={`sidebar-item ${currentStep === index ? "active" : ""}`}
              onClick={() => {
                setCurrentStep(index);
                setIsEditMode(false);
              }}
            >
              {item}
            </div>
          ))}
           <div className="top-bar">
        <button
          className="go-dashboard-button"
          onClick={() => navigate("/dashboard")}
        >
          ⬅ Go to Dashboard
        </button>
      </div>
        </div>
 
    <form onSubmit={handleSubmit((data) => console.log("Submitted", data))} className="view-farmer-form">
     
    <div className="step-container">
      <h2>{sidebarSteps[currentStep]}</h2>
 
      {/* Step 0: Personal Information */}
    {currentStep === 0 && (
      <>
        {!isEditMode ? (
          <>
            <button type="button" onClick={() => setIsEditMode(true)} className="viwe-button">
              Edit
            </button>

            {/* ✅ View Mode Photo */}
            <div className="viewinfo-row">
              <strong>Photo:</strong>
              <div className="photo-box">
                {(() => {
                  const photoUrl = getFarmerPhotoUrl(farmerData);
                  console.log("[ViewFarmer] Photo URL:", photoUrl);
                  return photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Farmer Photo"
                      style={{ width: "200px", height: "200px", objectFit: "cover", borderRadius: "8px" }}
                      onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "block"; }}
                    />
                  ) : null;
                })()}
                <span style={{ display: getFarmerPhotoUrl(farmerData) ? "none" : "block", color: "#666" }}>No Photo Uploaded</span>
              </div>
              {/* Show file name if present */}
              <div style={{ marginTop: "6px", fontSize: "0.95em", color: "#444" }}>
                {farmerData && farmerData.photoFileName
                  ? `Current: ${farmerData.photoFileName}`
                  : null}
              </div>
            </div>

            {/* Remaining View Fields */}
            <div className="viewinfo-row">
              <div><strong>Salutation:</strong> {farmerData?.salutation || ""}</div>
              <div><strong>Gender:</strong> {farmerData?.gender || ""}</div>
            </div>
            <div className="viewinfo-row">
              <div><strong>First Name:</strong> {farmerData?.firstName || ""}</div>
              <div><strong>Last Name:</strong> {farmerData?.lastName || ""}</div>
            </div>
            <div className="viewinfo-row">
              <div><strong>Middle Name:</strong> {farmerData?.middleName || ""}</div>
              <div><strong>Date of Birth:</strong> {farmerData?.dateOfBirth || ""}</div>
            </div>
            <div className="viewinfo-row">
              <div><strong>Nationality:</strong> {farmerData?.nationality || ""}</div>
              <div><strong>Father Name:</strong> {farmerData?.fatherName || ""}</div>
            </div>
            <div className="viewinfo-row">
              <div><strong>Contact Number:</strong> {farmerData?.contactNumber || ""}</div>
              <div><strong>Alternative Number:</strong> {farmerData?.alternativeContactNumber || farmerData?.alternativeNumber || ""}</div>
            </div>
            <div className="viewinfo-row">
              <div><strong>Alternative Type:</strong> {farmerData?.alternativeRelationType || farmerData?.alternativeType || ""}</div>
            </div>
          </>
        ) : (
          <>
            <div className="edit-main form-grid">
              <div className="field-left">
                {/* ✅ Edit Mode Photo Upload */}
                <div className="viewform-row">
                  <label>Photo <span className="required">*</span></label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setValue("photo", file, { shouldValidate: true });
                        setPhotoPreviewStep0(URL.createObjectURL(file));
                      }
                    }}
                  />
                  {photoPreviewStep0 && (
                    <img
                      src={photoPreviewStep0}
                      alt="Preview"
                      className="edit-photo-preview"
                      style={{
                        width: "200px",
                        height: "auto",
                        marginTop: "10px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  )}
                  {errors.photo && <p className="error">{errors.photo.message}</p>}
                </div>

                {/* Left fields */}
                <label>Salutation <span className="required">*</span></label>
                <select {...register("salutation")} className="viweinput">
                  <option value="">Select</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Miss.">Miss.</option>
                  <option value="Dr.">Dr.</option>
                </select>
                {errors.salutation && <p className="error">{errors.salutation.message}</p>}

                <label>First Name <span className="required">*</span></label>
                <input {...register("firstName")} className="viweinput" />
                {errors.firstName && <p className="error">{errors.firstName.message}</p>}

                <label>Middle Name <span className="required">*</span></label>
                <input {...register("middleName")} className="viweinput" />
                {errors.middleName && <p className="error">{errors.middleName.message}</p>}

                <label>Last Name <span className="required">*</span></label>
                <input {...register("lastName")} className="viweinput" />
                {errors.lastName && <p className="error">{errors.lastName.message}</p>}
              </div>

              <div className="field-right">
                {/* Right fields */}
                <label>Gender <span className="required">*</span></label>
                <select {...register("gender")} className="viweinput">
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Transgender">Transgender</option>
                </select>
                {errors.gender && <p className="error">{errors.gender.message}</p>}

                <label>Nationality <span className="required">*</span></label>
                <select {...register("nationality")} className="viweinput">
                  <option value="">Select</option>
                  <option value="Indian">Indian</option>
                </select>
                {errors.nationality && <p className="error">{errors.nationality.message}</p>}

                <label>Date of Birth <span className="required">*</span></label>
                <input type="date" {...register("dateOfBirth")} className="viweinput" />
                {errors.dateOfBirth && <p className="error">{errors.dateOfBirth.message}</p>}

                <label>Contact Number <span className="required">*</span></label>
                <input type="tel" maxLength={10} {...register("contactNumber")} className="viweinput" />
                {errors.contactNumber && <p className="error">{errors.contactNumber.message}</p>}

                <label>Father Name <span className="required">*</span></label>
                <input {...register("fatherName")} className="viweinput" />
                {errors.fatherName && <p className="error">{errors.fatherName.message}</p>}

                <label>Alternative Type <span className="required">*</span></label>
                <select {...register("alternativeType")} className="viweinput">
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
                {errors.alternativeType && <p className="error">{errors.alternativeType.message}</p>}

                <label>Alternative Number <span className="required">*</span></label>
                <input type="tel" maxLength={10} {...register("alternativeNumber")} className="viweinput" />
                {errors.alternativeNumber && <p className="error">{errors.alternativeNumber.message}</p>}
              </div>
            </div>

            <div className="action-buttons">
              <button type="button" className="viwe-button" onClick={() => setIsEditMode(false)}>
                Save
              </button>
            </div>
          </>
        )}
      </>
    )}
 
      {currentStep === 1 && (
        <div className="address-container">
 
          {!isEditMode ? (
            <>
              <button onClick={() => setIsEditMode(true)} className="viwe-button">Edit</button>
 
              <div className="viewinfo-row">
                <div><strong>Country:</strong> {farmerData?.country || ""}</div>
                <div><strong>State:</strong> {farmerData?.state || ""}</div>
              </div>
              <div className="viewinfo-row">
                <div><strong>District:</strong> {farmerData?.district || ""}</div>
                <div><strong>Mandal:</strong> {farmerData?.block || ""}</div>
              </div>
              <div className="viewinfo-row">
                <div><strong>Village:</strong> {farmerData?.village || ""}</div>
                <div><strong>Pincode:</strong> {farmerData?.pincode || ""}</div>
              </div>
            </>
          ) : (
            <>
              <div className="edit-main">
                <div className="leftedit-grid">
                  <div className="viewform-row">
                    <label>Country:</label>
                    <input {...register("country")} placeholder="Country" />
                  </div>
                  <div className="viewform-row">
                    <label>State:</label>
                    <select {...register("state")}>
                      <option value="">Select your state</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                    </select>
                  </div>
                  <div className="viewform-row">
                    <label>District:</label>
                    <input {...register("district")} placeholder="District" />
                  </div>
                </div>
 
                <div className="rightedit-grid">
                  <div className="viewform-row">
                    <label>Mandal:</label>
                    <input {...register("mandal")} placeholder="Mandal" />
                  </div>
                  <div className="viewform-row">
                    <label>Village:</label>
                    <input {...register("village")} placeholder="Village" />
                  </div>
                  <div className="viewform-row">
                    <label>Pincode:</label>
                    <input {...register("pincode")} placeholder="Pincode" />
                  </div>
                </div>
              </div>
 
              <div className="action-buttons">
                <button type="button" className="viwe-button" onClick={() => setIsEditMode(false)}>Save</button>
              </div>
            </>
          )}
        </div>
      )}
      {currentStep === 2 && (
  <div className="professional-container">
 
    {!isEditMode ? (
      <>
        <button onClick={() => setIsEditMode(true)} className="viwe-button">Edit</button>
 
        <div className="viewinfo-row">
          <div><strong>Education:</strong> {farmerData?.education || ""}</div>
          <div><strong>Experience:</strong> {farmerData?.experience || ""}</div>
        </div>
      </>
    ) : (
      <>
        <div className="edit-main">
          <div className="leftedit-grid">
            <div className="viewform-row">
              <label>Education <span className="required">*</span></label>
              <select {...register("education")} className="input">
                <option value="">Select</option>
                <option value="Primary Schooling">Primary Schooling</option>
                <option value="High School">High School</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Degree">Degree</option>
                <option value="Graduate">Graduate</option>
                <option value="Post-Graduate">Post-Graduate</option>
              </select>
              {errors.education && <p className="error">{errors.education.message}</p>}
            </div>
          </div>
 
          <div className="rightedit-grid">
            <div className="viewform-row">
              <label>Experience <span className="required">*</span></label>
              <input
                {...register("experience")}
                placeholder="e.g. 15 Years"
                className="input"
              />
              {errors.experience && <p className="error">{errors.experience.message}</p>}
            </div>
          </div>
        </div>
 
        <div className="action-buttons">
          <button type="button" className="viwe-button" onClick={() => setIsEditMode(false)}>Save</button>
        </div>
      </>
    )}
  </div>
)}
 
 

   {currentStep === 3 && (
  <div className="current-container">
    {!isEditMode ? (
      <>
        <button onClick={() => setIsEditMode(true)} className="viwe-button">Edit</button>
 
        <div className="viewinfo-row">
          {(() => {
            const photoUrl = getFarmerPhotoUrl(farmerData);
            console.log("[ViewFarmer] Step 3 Photo URL:", photoUrl);
            return photoUrl ? (
              <div className="photo-box">
                <strong>Photo:</strong>
                <img
                  src={photoUrl}
                  alt="Farmer Photo"
                  className="photo-preview"
                  style={{ width: "200px", height: "200px", objectFit: "cover", borderRadius: "8px" }}
                  onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "block"; }}
                />
                <span style={{ display: "none", color: "#666" }}>Photo not available</span>
              </div>
            ) : null;
          })()}
          <div><strong>Survey Number:</strong> {farmerData?.currentSurveyNumber || ""}</div>
          <div><strong>Total Land Holding:</strong> {farmerData?.currentLandHolding || ""}</div>
          <div><strong>Geo-tag:</strong> {farmerData?.currentGeoTag || ""}</div>
          <div><strong>Crop Category:</strong> {farmerData?.cropCategory || ""}</div>
          <div><strong>Crop Name:</strong> {farmerData?.currentCrop || ""}</div>
          <div><strong>Net Income:</strong> {farmerData?.currentNetIncome || ""}</div>
          <div><strong>Soil Test:</strong> {typeof farmerData?.currentSoilTest === 'boolean' ? (farmerData.currentSoilTest ? 'Yes' : 'No') : ""}</div>
          {farmerData?.currentSoilTestCertificateFileName ? (
            <div><strong>Soil Test Certificate:</strong> <a href={`http://localhost:8080/uploads/${farmerData.currentSoilTestCertificateFileName}`} target="_blank" rel="noopener noreferrer">View Certificate</a></div>
          ) : (
            <div><strong>Soil Test Certificate:</strong> Not Uploaded</div>
          )}
        </div>
      </>
    ) : (
      <>
        <div className="edit-main currentform-grid">
          <div className="cropform-columnleft">
            <div className="viewform-row">
              <label>Photo <span className="optional"></span></label>
              <input type="file" accept="image/*" onChange={handlePhotoChangeStep3} />
              {photoPreviewStep3 && (
                <img src={photoPreviewStep3} alt="Preview" className="photo-preview" />
              )}
            </div>
 
            <div className="viewform-row">
              <label>Survey Number <span className="required">*</span></label>
              <input {...register("currentSurveyNumber")} className="viweinput" />
              {errors.surveyNumber && <p className="error">{errors.surveyNumber.message}</p>}
            </div>
 
            <div className="viewform-row">
              <label>Total Land Holding (In Acres Nos)</label>
              <input
                type="number"
                step="any"
                {...register("currentLandHolding", { valueAsNumber: true })}
                className="viweinput"
              />
              {errors.totalLandHolding && <p className="error">{errors.totalLandHolding.message}</p>}
            </div>
 
            <div className="viewform-row">
              <label>Geo-tag</label>
              <input {...register("currentGeoTag")} className="viweinput" />
              {errors.geoTag && <p className="error">{errors.geoTag.message}</p>}
            </div>
          </div>
 
          <div className="cropform-columnright">
            <div className="viewform-row">
              <label>Select Crop Category</label>
                              <select
                  value={cropCategoryStep3}
                  onChange={(e) => {
                    setCropCategoryStep3(e.target.value);
                    setValue("currentCrop", "");
                  }}
                  className="viweinput"
                >
                  <option value="">Select</option>
                  {Object.keys(cropOptions).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
 
              {cropCategoryStep3 && (
                <div className="viewform-row">
                  <label>Select Crop Name</label>
                  <select {...register("currentCrop")} className="viweinput">
                    <option value="">Select</option>
                    {cropOptions[cropCategoryStep3].map((crop) => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                  {errors.selectCrop && <p className="error">{errors.selectCrop.message}</p>}
                </div>
              )}
 
              <div className="viewform-row">
                <label>Net Income (As per Current Crop/Yr)</label>
                <input {...register("currentNetIncome")} className="viweinput" />
                {errors.netIncome && <p className="error">{errors.netIncome.message}</p>}
              </div>
 
              <div className="viewform-row">
                <label>Soil Test</label>
                <select {...register("currentSoilTest")} className="viweinput">
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {errors.soilTest && <p className="error">{errors.soilTest.message}</p>}
              </div>
 
              {watch("soilTest") === "Yes" && (
                <div className="viewform-row">
                  <label>Soil Test Certificate</label>
                  <input type="file" {...register("currentSoilTestCertificate")} />
                  {errors.soilTestCertificate && (
                    <p className="error">{errors.soilTestCertificate.message}</p>
                  )}
                </div>
              )}
          </div>
        </div>
 
        <div className="action-buttons">
          <button type="button" className="viwe-button" onClick={() => setIsEditMode(false)}>Save</button>
        </div>
      </>
    )}
  </div>
)}
 
 

   {currentStep === 4 && (
  <div className="proposed-container">
 
    {!isEditMode ? (
      <>
        <button onClick={() => setIsEditMode(true)} className="viwe-button">Edit</button>
        <div className="viewinfo-row">
          <div><strong>Survey Number:</strong> {farmerData?.proposedSurveyNumber || ""}</div>
          <div><strong>Geo-tag:</strong> {farmerData?.proposedGeoTag || ""}</div>
          <div><strong>Crop Name:</strong> {farmerData?.proposedCrop || ""}</div>
          <div><strong>Net Income:</strong> {farmerData?.proposedNetIncome || ""}</div>
          <div><strong>Soil Test:</strong> {typeof farmerData?.proposedSoilTest === 'boolean' ? (farmerData.proposedSoilTest ? 'Yes' : 'No') : ""}</div>
          <div><strong>Total Land Holding:</strong> {farmerData?.proposedLandHolding || ""}</div>
          <div><strong>Soil Test Certificate:</strong> {farmerData?.proposedSoilTestCertificate ? "Uploaded" : "Not Uploaded"}</div>
          <div><strong>Crop Category:</strong> {farmerData?.cropCategory || ""}</div>
        </div>
      </>
    ) : (
      <div className="edit-main proposedform-grid">
        <div className="proposedform-columnleft">
          <div className="viewform-row">
            <label>Survey Number <span className="required">*</span></label>
            <input {...register("proposedSurveyNumber")} className="viweinput" />
            {errors.proposedSurveyNumber && <p className="error">{errors.proposedSurveyNumber.message}</p>}
          </div>
          <div className="viewform-row">
            <label>Geo-tag <span className="required">*</span></label>
            <input {...register("proposedGeoTag")} placeholder="Latitude, Longitude" className="viweinput" />
            {errors.proposedGeoTag && <p className="error">{errors.proposedGeoTag.message}</p>}
          </div>
          <div className="viewform-row">
            <label>Crop Name <span className="required">*</span></label>
            <input {...register("proposedCrop")} className="viweinput" />
            {errors.proposedCrop && <p className="error">{errors.proposedCrop.message}</p>}
          </div>
          <div className="viewform-row">
            <label>Soil Test <span className="required">*</span></label>
            <select {...register("proposedSoilTest")} className="viweinput">
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {errors.proposedSoilTest && <p className="error">{errors.proposedSoilTest.message}</p>}
          </div>
        </div>
        <div className="proposedform-columnright">
          <div className="viewform-row">
            <label>Total Land Holding (In Acres) <span className="required">*</span></label>
            <input {...register("proposedLandHolding")} className="viweinput" />
            {errors.proposedLandHolding && <p className="error">{errors.proposedLandHolding.message}</p>}
          </div>
          <div className="viewform-row">
            <label>Net Income (Per Crop/Yr) <span className="required">*</span></label>
            <input {...register("proposedNetIncome")} className="viweinput" />
            {errors.proposedNetIncome && <p className="error">{errors.proposedNetIncome.message}</p>}
          </div>
          {watch("proposedSoilTest") === "Yes" && (
            <div className="viewform-row">
              <label>Soil Test Certificate</label>
              <input type="file" {...register("proposedSoilTestCertificate")} className="viweinput" />
              {errors.proposedSoilTestCertificate && (
                <p className="error">{errors.proposedSoilTestCertificate.message}</p>
              )}
            </div>
          )}
          <div className="action-buttons">
            <button type="button" className="viwe-button" onClick={() => setIsEditMode(false)}>
              Save
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
)}
 
  {currentStep === 5 && (
  <div className="view-irrigation-field">
    {!isEditMode ? (
      <>
        <button onClick={() => setIsEditMode(true)} className="viwe-button">
          Edit
        </button>
        <div className="viewinfo-row">
          <div>
            <strong>Water Source:</strong> {farmerData?.currentWaterSource || ""}
          </div>
          <div>
            <strong>Borewell Discharge (LPH):</strong> {farmerData?.currentDischargeLPH || ""}
          </div>
          <div>
            <strong>Summer Discharge:</strong> {farmerData?.currentSummerDischarge || ""}
          </div>
          <div>
            <strong>Borewell Location:</strong> {farmerData?.currentBorewellLocation || ""}
          </div>
          <div>
            <strong>Proposed Water Source:</strong> {farmerData?.proposedWaterSource || ""}
          </div>
          <div>
            <strong>Proposed Borewell Discharge (LPH):</strong> {farmerData?.proposedDischargeLPH || ""}
          </div>
          <div>
            <strong>Proposed Summer Discharge:</strong> {farmerData?.proposedSummerDischarge || ""}
          </div>
          <div>
            <strong>Proposed Borewell Location:</strong> {farmerData?.proposedBorewellLocation || ""}
          </div>
        </div>
      </>
    ) : (
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
                  <option key={source} value={source}>
                    {source}
                  </option>
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
                  <option key={source} value={source}>
                    {source}
                  </option>
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

        <div className="action-buttons">
          <button
            type="button"
            className="viwe-button"
            onClick={() => setIsEditMode(false)}
          >
            Save
          </button>
        </div>
      </div>
    )}
  </div>
)}


 
   {currentStep === 6 && (
  <div className="other-container">
    {!isEditMode ? (
      <>
        <button onClick={() => setIsEditMode(true)} className="viwe-button">Edit</button>
        <div className="viewinfo-row">
          <div><strong>Bank Name:</strong> {farmerData?.bankName || ""}</div>
          <div><strong>Account Number:</strong> {farmerData?.accountNumber || ""}</div>
          <div><strong>Branch Name:</strong> {farmerData?.branchName || ""}</div>
          <div><strong>IFSC Code:</strong> {farmerData?.ifscCode || ""}</div>
        </div>
        <div className="viewinfo-row">
          <div>
            <strong>Passbook File:</strong><br />
            {farmerData?.passbookFileName ? (
              <a
                href={`http://localhost:8080/uploads/${farmerData.passbookFileName}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#006838", textDecoration: "underline" }}
              >
                View Passbook
              </a>
            ) : (
              "No file uploaded"
            )}
          </div>
        </div>
      </>
    ) : (
      <div className="proposedform-grid">
        <div className="proposedform-columnleft">
          <div className="viewform-row">
            <label>Bank Name <span className="optional"></span></label>
            <input type="text" {...register("bankName")} className="viweinput" />
            <p className="error">{errors.bankName?.message}</p>
          </div>

          <div className="viewform-row">
            <label>Account Number <span className="optional"></span></label>
            <input type="text" {...register("accountNumber")} className="viweinput" />
            <p className="error">{errors.accountNumber?.message}</p>
          </div>
        </div>

        <div className="proposedform-columnright">
          <div className="viewform-row">
            <label>Branch Name <span className="optional"></span></label>
            <input type="text" {...register("branchName")} className="viweinput" />
            <p className="error">{errors.branchName?.message}</p>
          </div>

          <div className="viewform-row">
            <label>IFSC Code <span className="optional"></span></label>
            <input type="text" {...register("ifscCode")} className="viweinput" />
            <p className="error">{errors.ifscCode?.message}</p>
          </div>

          <div className="viewform-row">
            <label>Passbook <span className="optional"></span></label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => {
                const file = e.target.files[0];
                setValue("passbookFile", file);
                trigger("passbookFile");
              }}
              className="viweinput"
            />
            <p className="error">{errors.passbookFile?.message}</p>
          </div>

          <div className="action-buttons">
            <button type="button" className="viwe-button" onClick={() => setIsEditMode(false)}>
              Save
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
)}

   {currentStep === 7 && (
  <div className="document-container">
 
    {!isEditMode ? (
      <>
        <button onClick={() => setIsEditMode(true)} className="viwe-button">Edit</button>
        <div className="viewinfo-row">
          <div><strong>Document Type:</strong> {farmerData?.documentType || ""}</div>
          <div><strong>Document Number:</strong> {farmerData?.documentNumber || ""}</div>
          <div><strong>Document File:</strong> {farmerData?.documentFileName ? (
            <a href={`http://localhost:8080/uploads/${farmerData.documentFileName}`} target="_blank" rel="noopener noreferrer">View Document</a>
          ) : "Not Uploaded"}</div>
        </div>
      </>
    ) : (
      <div className="edit-main documentform-grid">
        <div className="left-column">
          <div className="viewform-row">
            <label>Document Type <span className="required">*</span></label>
            <input {...register("documentType")} className="viweinput" />
            {errors.documentType && <p className="error">{errors.documentType.message}</p>}
          </div>
          <div className="viewform-row">
            <label>Document Number <span className="required">*</span></label>
            <input {...register("documentNumber")} className="viweinput" />
            {errors.documentNumber && <p className="error">{errors.documentNumber.message}</p>}
          </div>
        </div>
        <div className="right-column">
          <div className="viewform-row">
            <label>Document Upload</label>
            <input type="file" {...register("documentFileName")} className="viweinput" />
            {errors.documentFileName && <p className="error">{errors.documentFileName.message}</p>}
          </div>
          <div className="action-buttons">
            <button type="button" className="viwe-button" onClick={() => setIsEditMode(false)}>
              Save
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
)}
 
    </div>
  </form>
 
      </div>
    </div>
  );
};
 
export default ViewFarmer; 