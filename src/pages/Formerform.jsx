import React, { useEffect, useState } from "react";
  import { useParams } from 'react-router-dom';
  import { useForm, FormProvider, Controller } from "react-hook-form";
  import { createFarmer, getFarmerById, updateFarmer } from "../api/apiService";
  import { useNavigate } from 'react-router-dom';
  import { yupResolver } from '@hookform/resolvers/yup';
  import Select from 'react-select';
  import axios from "axios";
  import * as yup from 'yup';
  import { parse, isValid, differenceInYears } from "date-fns";
  import farmImage from "../assets/farmImage.png";
  import "../styles/Farmerform.css";

 
 
    const stepSchemas = [
  // Step 0: Personal Information schema
     yup.object().shape({
     firstName: yup.string()
      .required("First Name is required")
      .matches(/^[A-Za-z]{2,26}$/, "First Name must be 2–26 letters only"),
     middleName: yup.string()
      .required("Middle Name is required")
      .matches(/^[A-Za-z]{1,26}$/, "Middle Name must contain only letters"),
     lastName: yup.string()
      .required("Last Name is required")
      .matches(/^[A-Za-z]{2,26}$/, "Last Name must be 2–26 letters only"),
     gender: yup.string().required("Gender is required"),
     salutation: yup.string()
      .required("Salutation is required")
      .oneOf(["Mr.", "Mrs.", "Ms.", "Miss.", "Dr."], "Select a valid salutation"),
     nationality: yup.mixed()
      .required("Nationality is required")
      .transform((value) =>
        typeof value === "object" && value?.value ? value.value : value
      )
      .test("is-string", "Nationality must be a string", (value) => typeof value === "string"),
     dateOfBirth: yup.string()
      .required("Date of Birth is required")
      .test("age-range", "Age must be between 18 and 90 years", function (value) {
      if (!value) return false;
       const dob = new Date(value);
       const today = new Date();
       const age = today.getFullYear() - dob.getFullYear();
       const m = today.getMonth() - dob.getMonth();
       const isBirthdayPassed = m > 0 || (m === 0 && today.getDate() >= dob.getDate());
 
       const actualAge = isBirthdayPassed ? age : age - 1;
       return actualAge >= 18 && actualAge <= 90;
       }),
 
     fatherName: yup.string()
      .nullable()
      .notRequired()
      .matches(/^[A-Za-z\s]{2,40}$/, "Father Name must contain only letters"),
     alternativeNumber: yup.string()
      .nullable()
      .transform((value, originalValue) => (originalValue.trim() === "" ? null : value))
      .matches(/^\d{10}$/, "Enter a valid 10-digit alternative number"),
     contactNumber: yup.string()
      .nullable()
      .transform((value, originalValue) => (originalValue.trim() === "" ? null : value))
      .matches(/^\d{10}$/, "Enter a valid 10-digit contact number"),
     alternativeType: yup.string()
      .oneOf(["Father", "Mother", "Brother", "Sister", "Son", "Daughter", "Spouse", "Other", ""], "Select a valid relation")
      .nullable()
      .notRequired(),
     photo: yup.mixed().nullable().notRequired(),
     }),
 
  // Step 1: Address
     yup.object().shape({
     country: yup.string().required("Country is required"),
     state: yup.string().required("State is required"),
     district: yup.string().required("District is required"),
     block: yup.string().required("Block is required"),
     village: yup.string().required("Village is required"),
     pincode: yup.string()
      .required("Pincode is required")
      .matches(/^\d{6}$/, "Enter a valid 6-digit pincode"),
     }),
 
  // Step 2: Professional Information
     yup.object().shape({
     education: yup.string().nullable(),
     experience: yup.string().nullable(),
     }),
 
  // Step 3: Current Crop Information schema
     yup.object().shape({
     currentSurveyNumber: yup.string().nullable(),
     currentLandHolding: yup.string().nullable(),
     currentGeoTag: yup.string().nullable(),
     currentCrop: yup.string().nullable(),
     currentNetIncome: yup.string().nullable(),
     currentSoilTest: yup.string().required("Soil test selection is required"),
     currentSoilTestCertificateFileName: yup.mixed().nullable().notRequired(),
     }),
 
  // Step 4: Proposed Crop Information
    yup.object().shape({
    surveyNumber: yup.string().nullable(),
    geoTag: yup.string().nullable(),
    cropType: yup.string().nullable(),
    totalLandHolding: yup.string().nullable(),
    netIncome: yup.string().nullable(),
    soilTest: yup.string().nullable(),
    soilTestCertificate: yup.mixed().nullable().notRequired(),
   }),
 
  // Step 5: Irrigation Details
    yup.object().shape({
    waterSource: yup.string().nullable(),
    borewellDischarge: yup.string().nullable(),
    summerDischarge: yup.string().nullable(),
    borewellLocation: yup.string().nullable(),
   }),
 
  // Step 6: Other Information (Bank)
    yup.object().shape({
    bankName: yup.string().nullable(),
    accountNumber: yup.string()
      .nullable()
      .matches(/^\d{9,18}$/, "Account Number must be 9-18 digits"),
    branchName: yup.string().nullable(),
    ifscCode: yup.string()
      .nullable()
      .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter valid IFSC code"),
    passbookFile: yup.mixed()
      .nullable()
      .test("fileSize", "File is too large", value => !value || value.size <= 5 * 1024 * 1024)
      .test("fileType", "Unsupported file format", value =>
        !value || ["image/jpeg", "image/png", "application/pdf"].includes(value.type)),
     }),
 
  // Step 7: Documents
    yup.object().shape({
    voterId: yup.string().nullable(),
    aadharNumber: yup.string()
      .nullable()
      .matches(/^\d{12}$/, "Aadhar must be 12 digits"),
    panNumber: yup.string()
      .nullable()
      .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Enter valid PAN number"),
    ppbNumber: yup.string().nullable(),
    passbookPhoto: yup.mixed()
      .nullable()
      .test("fileSize", "File too large", value => !value || value.size <= 10 * 1024 * 1024),
     }),
  ];
 
    const steps = ["Personal Information", "Address","Professional Information","Current Crop Information",
                  "Proposed Crop Information",  "Irrigation Details","Other Information", "Documents",];
 
                  const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
                  const FarmerForm = ({ currentStep, setCurrentStep, isEditMode }) => {
                  const [selectedCountry, setSelectedCountry] = useState("");
                  const [countries, setCountries] = useState([]);
                  const [selectedIrrigationTab, setSelectedIrrigationTab] = useState("current");
                  const [selectedState, setSelectedState] = useState("");
                  const [states, setStates] = useState([]);
                   const [selectedDoc, setSelectedDoc] = useState("");
                 
                  const [farmer, setFarmer] = useState(null);
                 
                  const [selectedDistrict, setSelectedDistrict] = useState("");
                  const [districts, setDistricts] = useState([]);
                 
                  const [selectedMandal, setSelectedMandal] = useState("");
                  const [mandals, setMandals] = useState([]);
                 
                  const [villages, setVillages] = useState([]);
                 
                  const [countryOptions, setCountryOptions] = useState([]);
                  const [districtOptions, setDistrictOptions] = useState([]);
                  const [mandalOptions, setMandalOptions] = useState([]);
                  const [villageOptions, setVillageOptions] = useState([]);
                 
                    const totalSteps = steps.length;
                    const [photoPreviewStep0, setPhotoPreviewStep0] = useState(null);
                    const [photoPreviewStep3, setPhotoPreviewStep3] = useState(null);
                    const [farmerData, setFarmerData] = useState(null);
                 
                    const navigate = useNavigate();
                    const { farmerId } = useParams();
                    const [waterSourceCategory, setWaterSourceCategory] = useState("");
                    const waterSourceOptions = ["Borewell", "Open Well", "Canal", "Tank", "River", "Drip"];
                    const [photoPreview, setPhotoPreview] = useState(null);
                    const [cropCategory, setCropCategory] = useState("");
                    const [cropCategoryStep3, setCropCategoryStep3] = useState("");
                    const [cropCategoryStep4, setCropCategoryStep4] = useState("");
                    const [passbookPreview, setPassbookPreview] = useState(null);
                    const [documentPreview, setDocumentPreview] = useState(null);
                    const [selectedPhotoName, setSelectedPhotoName] = useState("");

                    const methods = useForm({
                      resolver: yupResolver(stepSchemas[currentStep]),
                       mode: "onChange",
                    });
                    const { register, handleSubmit, control, formState: { errors }, setValue, watch, reset, trigger,} = useForm({
                      resolver: yupResolver(stepSchemas[currentStep]),
                      mode: "onChange",
                    });
                 
                      const cropOptions = {
                      Grains: [ "Paddy", "Maize", "Red Gram", "Black Gram", "Bengal Gram", "Groundnut", "Green Gram", "Sweet Corn", ],
                      Vegetables: [ "Dry Chilli", "Mirchi", "Tomato", "Ladies Finger", "Ridge Gourd", "Broad Beans", "Brinjal",
                                "Cluster Beans", "Bitter Gourd", "Bottle Gourd", ],
                      Cotton: ["Cotton"],
                    };
                 
                 const handleFileChange = (e, field, setPreview) => {
                    const file = e.target.files[0];
                    if (file) {
                      setValue(field, file);
                      setPreview(URL.createObjectURL(file));
                    }
                  };
                 
                 
                 
                const handlePhotoChangeStep0 = (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setValue("photo", file);
                    setPhotoPreviewStep0(URL.createObjectURL(file));
                  }
                };
                 
                const handlePhotoChangeStep3 = (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setValue("photo", file);
                    setPhotoPreviewStep3(URL.createObjectURL(file));
                  }
                };
                 
                 
                useEffect(() => {
                  const fetchFarmer = async () => {
                    if (!isEditMode || !farmerId) return;
                    const token = localStorage.getItem("token");
                    if (!token) {
                      alert("Please login first!");
                      window.location.href = "/login";
                      return;
                    }
                    try {
                      const response = await axios.get(
                        `http://localhost:8080/api/farmers/${farmerId}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                      );
                 
                                            const data = response.data;
                      setFarmerData(data);
                      
                      // Map the data to form fields properly
                      const formData = {
                        ...data,
                        // Map step-specific fields
                        currentSurveyNumber: data.surveyNumber || "",
                        currentLandHolding: data.totalLandHolding || "",
                        currentGeoTag: data.geoTag || "",
                        currentCrop: data.selectCrop || "",
                        currentNetIncome: data.netIncome || "",
                        currentSoilTest: data.soilTest || "",
                        cropType: data.cropType || "",
                        waterSource: data.waterSource || "",
                        borewellDischarge: data.borewellDischarge || "",
                        summerDischarge: data.summerDischarge || "",
                        borewellLocation: data.borewellLocation || "",
                        // Document fields
                        aadharNumber: data.aadharNumber || "",
                        panNumber: data.panNumber || "",
                        voterId: data.voterId || "",
                        ppbNumber: data.ppbNumber || "",
                        // Alternative fields with multiple field name support
                        alternativeType: data.alternativeType || data.alternativeRelationType || "",
                        alternativeNumber: data.alternativeContactNumber || data.alternativeNumber || ""
                      };
                      
                      reset(formData);
 
                      // Set photo previews with multiple field name support
                      if (data.photoFileName || data.photoUrl || data.photo) {
                        const photoUrl = data.photoFileName 
                          ? `${BASE_URL}/${data.photoFileName}`
                          : data.photoUrl 
                            ? `${BASE_URL}${data.photoUrl}`
                            : data.photo;
                        setPhotoPreview(photoUrl);
                      }
                 
                    } catch (err) {
                      console.error("❌ Failed to fetch farmer", err);
                      
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
                    }
                  };
                 
                  fetchFarmer();
                }, [isEditMode, farmerId]);
                 
                 
                // When preparing the data for submission, map the generic fields to the DTO fields
                const prepareFarmerDTO = (formData) => {
                  return {
                    ...formData,
                    // Current Crop Info
                    currentSurveyNumber: formData.currentSurveyNumber || formData.surveyNumber || '',
                    currentLandHolding: formData.currentLandHolding || formData.totalLandHolding || '',
                    currentGeoTag: formData.currentGeoTag || formData.geoTag || '',
                    currentCrop: formData.currentCrop || formData.selectCrop || '',
                    currentNetIncome: formData.currentNetIncome || formData.netIncome || '',
                    currentSoilTest: formData.currentSoilTest !== undefined ? formData.currentSoilTest : formData.soilTest,
                    // Proposed Crop Info
                    proposedSurveyNumber: formData.proposedSurveyNumber || formData.surveyNumber2 || '',
                    proposedLandHolding: formData.proposedLandHolding || formData.totalLandHolding2 || '',
                    proposedGeoTag: formData.proposedGeoTag || formData.geoTag2 || '',
                    proposedCrop: formData.proposedCrop || formData.selectCrop2 || '',
                    proposedNetIncome: formData.proposedNetIncome || formData.netIncome2 || '',
                    proposedSoilTest: formData.proposedSoilTest !== undefined ? formData.proposedSoilTest : formData.soilTest2,
                    proposedSoilTestCertificate: formData.proposedSoilTestCertificate || '',
                  };
                };
                 
                const onSubmit = async (data) => {
                  console.log("Form submission data:", data);
                  console.log("Photo file:", data.photo);
                  console.log("Soil test certificate:", data.soilTestCertificate);
                  
                  const formData = new FormData();
                  const payload = {
                    // Map all FarmerDTO fields
                    id: data.id,
                    salutation: data.salutation,
                    firstName: data.firstName,
                    middleName: data.middleName,
                    lastName: data.lastName,
                    dateOfBirth: data.dateOfBirth,
                    gender: data.gender,
                    fatherName: data.fatherName,
                    contactNumber: data.contactNumber,
                    alternativeRelationType: data.alternativeType,
                    alternativeContactNumber: data.alternativeNumber,
                    nationality: data.nationality,
                    country: data.country,
                    state: data.state,
                    district: data.district,
                    block: data.block,
                    village: data.village,
                    pincode: data.pincode,
                    education: data.education,
                    experience: data.experience,
                    cropPhoto: data.cropPhoto,
                    // Current crop/land/irrigation fields
                    currentSurveyNumber: data.currentSurveyNumber || data.surveyNumber,
                    currentLandHolding: data.currentLandHolding || data.totalLandHolding,
                    currentGeoTag: data.currentGeoTag || data.geoTag,
                    currentCrop: data.currentCrop || data.selectCrop,
                    currentNetIncome: data.currentNetIncome || data.netIncome,
                    currentSoilTest: data.currentSoilTest || data.soilTest,
                    // Proposed crop/land/irrigation fields
                    proposedSurveyNumber: data.proposedSurveyNumber || data.surveyNumber,
                    proposedLandHolding: data.proposedLandHolding || data.totalLandHolding,
                    proposedGeoTag: data.proposedGeoTag || data.geoTag,
                    proposedCrop: data.proposedCrop || data.selectCrop,
                    proposedNetIncome: data.proposedNetIncome || data.netIncome,
                    proposedSoilTest: data.proposedSoilTest || data.soilTest,
                    proposedSoilTestCertificate: data.proposedSoilTestCertificate || data.soilTestCertificateFileName,
                    // Irrigation fields
                    currentWaterSource: data.currentWaterSource,
                    currentDischargeLPH: data.currentDischargeLPH,
                    currentSummerDischarge: data.currentSummerDischarge,
                    currentBorewellLocation: data.currentBorewellLocation,
                    proposedWaterSource: data.proposedWaterSource,
                    proposedDischargeLPH: data.proposedDischargeLPH,
                    proposedSummerDischarge: data.proposedSummerDischarge,
                    proposedBorewellLocation: data.proposedBorewellLocation,
                    // Bank
                    bankName: data.bankName,
                    accountNumber: data.accountNumber,
                    branchName: data.branchName,
                    ifscCode: data.ifscCode,
                    // Document
                    documentType: data.documentType,
                    documentNumber: data.documentNumber,
                    // Portal
                    portalRole: data.portalRole,
                    portalAccess: data.portalAccess,
                  };
                 
                  // Remove file fields from JSON if uploading files
                  if (data.photo) delete payload.photoFileName;
                  if (data.passbookFile) delete payload.passbookFileName;
                  if (data.documentFileName) delete payload.documentFileName;
                  if (data.currentSoilTestCertificateFileName) delete payload.currentSoilTestCertificateFileName;
                  if (data.proposedSoilTestCertificate) delete payload.proposedSoilTestCertificate;

                  formData.append(
                    "farmerDto",
                    new Blob([JSON.stringify(payload)], { type: "application/json" })
                  );
                 
                  // Append files conditionally
                  if (data.photo) formData.append("photo", data.photo);
                  if (data.passbookFile) formData.append("passbookFile", data.passbookFile);
                  if (data.documentFileName && typeof data.documentFileName !== 'string') formData.append("documentFile", data.documentFileName);
                  if (data.currentSoilTestCertificateFileName && typeof data.currentSoilTestCertificateFileName !== 'string') formData.append("currentSoilTestCertificate", data.currentSoilTestCertificateFileName);
                  if (data.proposedSoilTestCertificate && typeof data.proposedSoilTestCertificate !== 'string') formData.append("proposedSoilTestCertificate", data.proposedSoilTestCertificate);
                 
                  const token = localStorage.getItem("token");
                  if (!token) {
                    alert("You are not logged in. Please log in to continue.");
                    return;
                  }
                 
                  try {
                    let response;
                 
                    if (isEditMode) {
                      response = await axios.put(
                        `http://localhost:8080/api/farmers/${farmerId}`,
                        formData,
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "multipart/form-data",
                          },
                        }
                      );
                    } else {
                      response = await axios.post(
                        "http://localhost:8080/api/farmers",
                        formData,
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "multipart/form-data",
                          },
                        }
                      );
                    }
                 
                    alert("✅ Farmer form submitted successfully!");
                    const id = response.data.id || farmerId;
                    navigate(`/view-farmer/${id}`);
                  } catch (error) {
                    console.error("❌ Submit Error:", error.response?.data || error.message);
                    
                    // Enhanced error handling with specific messages
                    let errorMessage = "❌ Failed to submit. Please try again.";
                    
                    if (error.response) {
                      const status = error.response.status;
                      const data = error.response.data;
                      
                      switch (status) {
                        case 401:
                          errorMessage = "❌ Authentication failed. Please log in again.";
                          // Redirect to login after showing message
                          setTimeout(() => {
                            window.location.href = "/login";
                          }, 2000);
                          break;
                        case 403:
                          errorMessage = "❌ Access denied. You don't have permission to perform this action.";
                          break;
                        case 404:
                          errorMessage = "❌ Resource not found. Please check your request.";
                          break;
                        case 422:
                          errorMessage = "❌ Validation error. Please check your form data and try again.";
                          break;
                        case 500:
                          errorMessage = "❌ Server error. Please try again later or contact support.";
                          break;
                        default:
                          if (data && data.message) {
                            errorMessage = `❌ ${data.message}`;
                          } else {
                            errorMessage = `❌ Error ${status}: ${data || 'Unknown error occurred'}`;
                          }
                      }
                    } else if (error.request) {
                      errorMessage = "❌ Network error. Please check your internet connection and try again.";
                    } else {
                      errorMessage = `❌ Error: ${error.message}`;
                    }
                    
                    alert(errorMessage);
                  }
                };
                 
                  // Edit mode fetch
                  useEffect(() => {
                    const fetchFarmer = async () => {
                      if (!isEditMode || !farmerId) return;
                      const token = localStorage.getItem("token");
                 
                      try {
                        const { data } = await axios.get(`${BASE_URL}/api/farmers/${farmerId}`, {
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        
                        console.log("Form - Farmer Data:", data);
                        console.log("Form - Photo fields:", {
                          photoFileName: data.photoFileName,
                          photoUrl: data.photoUrl,
                          photo: data.photo
                        });
                        console.log("Form - Alternative fields:", {
                          alternativeType: data.alternativeType,
                          alternativeRelationType: data.alternativeRelationType,
                          alternativeContactNumber: data.alternativeContactNumber,
                          alternativeNumber: data.alternativeNumber
                        });
                 
                        Object.entries(data).forEach(([key, value]) => {
                          if (typeof value !== "object") {
                            setValue(key, value);
                          }
                        });
                 
                        if (data.photoFileName) {
                          setPhotoPreview(`${BASE_URL}/${data.photoFileName}`);
                        }
                        if (data.passbookFileName) {
                          setPassbookPreview(`${BASE_URL}/${data.passbookFileName}`);
                        }
                        if (data.documentFileName) {
                          setDocumentPreview(`${BASE_URL}/${data.documentFileName}`);
                        }
                      } catch (err) {
                        console.error("❌ Failed to fetch farmer:", err);
                      }
                    };
                    fetchFarmer();
                  }, [farmerId, isEditMode, setValue]);
                 
                 
                 useEffect(() => {
                  axios.get("http://localhost:8080/api/auth/countries")
                    .then((res) => {
                      const formatted = res.data.map(c => ({ label: c.name, value: c.code }));
                      setCountryOptions(formatted);
                    })
                    .catch((err) => console.error("Failed to fetch countries:", err));
                }, []);
                 
                useEffect(() => {
                  if (selectedCountry) {
                    axios.get(`http://localhost:8080/api/auth/states/${selectedCountry}`)
                      .then((res) => {
                        const formatted = res.data.map(s => ({ label: s.name, value: s.code }));
                        setStates(formatted);
                      });
                  } else {
                    setStates([]);
                  }
                }, [selectedCountry]);
                 
                useEffect(() => {
                  if (selectedState) {
                    axios.get(`/api/districts?state=${selectedState}`)
                      .then((res) => {
                        const formatted = res.data.map(d => ({ label: d.name, value: d.code }));
                        setDistrictOptions(formatted);
                      });
                  } else {
                    setDistrictOptions([]);
                  }
                }, [selectedState]);
                 
                useEffect(() => {
                  if (selectedDistrict) {
                    axios.get(`/api/mandals?district=${selectedDistrict}`)
                      .then((res) => {
                        const formatted = res.data.map(m => ({ label: m.name, value: m.code }));
                        setMandalOptions(formatted);
                      });
                  } else {
                    setMandalOptions([]);
                  }
                }, [selectedDistrict]);
                 
                useEffect(() => {
                  if (selectedMandal) {
                    axios.get(`/api/villages?mandal=${selectedMandal}`)
                      .then((res) => {
                        const formatted = res.data.map(v => ({ label: v.name, value: v.code }));
                        setVillages(formatted);
                      });
                  } else {
                    setVillages([]);
                  }
                }, [selectedMandal]);
 
 
   
  return (
   
    <div className="farmer-wrapper">
           <div className="form-full">
        <FormProvider {...methods}>
           <form onSubmit={methods.handleSubmit(onSubmit)} className="farmer">
         
           {currentStep === 0 && (
  <div className="form-grid">
    <div className="field-left">
      {/* Photo Upload */}
     <div className="form-group photo-group">
  <label>
    Photo <span className="optional">*</span>
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
          alt="Farmer Photo"
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
    {...register("photo", {
      required: "Photo is required"
    })}
    onChange={(e) => {
      const file = e.target.files[0];
      if (file) {
        setPhotoPreviewStep0(URL.createObjectURL(file));
        setValue("photo", file, { shouldValidate: true }); // Register value for RHF
        setSelectedPhotoName(file.name); // Track selected file name
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
      <div className="form-right" style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
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
          aria-label="Close and go to dashboard"
        >
          ×
        </button>
        <img src={farmImage} alt="Farm Field" className="form-image" />
      </div>
    </div>
    

  );
};
  export default FarmerForm;