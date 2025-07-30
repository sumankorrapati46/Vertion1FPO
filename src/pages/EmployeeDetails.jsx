import React, { useState, useEffect } from "react";
import { useForm, FormProvider, } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import * as Yup from 'yup';
import employeeSchemas from "../validations/employeeSchemas";
import sampleImage from "../assets/tractor.png";
import logo1 from "../assets/leftlogo.png";
import logo2 from "../assets/rightlogo.png";
import "../styles/EmployeeDetails.css";

   function EmployeeDetails() {
  const { employeeId } = useParams(); 
  const navigate = useNavigate();
  const isEditMode = !!employeeId;

  // Step Titles
  const steps = [
    "🏛️ Employee Details",
    "🔍 Contact Details",
    "👨‍🌾 Other Details",
    "📌 Address",
    "👨‍🌾 Professional Details",
    "💧 Bank Details",
    "📄 Documents",
    "🛡️ Portal Access",
  ];
  const totalSteps = steps.length;

  // 🔁 State Hooks - declare before useForm
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDoc, setSelectedDoc] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // ✅ useForm must be defined AFTER currentStep
  const methods = useForm({
    mode: "onBlur",
    resolver: yupResolver(employeeSchemas[currentStep]),
  });

  // Destructure form methods
  const {
    register,
    handleSubmit,
    reset,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = methods;

  // Now safe to use watch values
  const photo = watch("photo");
  const resume = watch("resume");
  const aadhaarFile = watch("aadhaarFile");
  const panFile = watch("panFile");

  const [countries, setCountries] = useState([]);
 const states = [{ id: 1, name: 'Andrapradesh' }, { id: 2, name: 'Telangana' },{ id: 3, name: 'Karnataka' },{ id: 4, name: 'Tamilnadu' } ];
    const districts = [{ id: 1, name: "Adilabad" }, { id: 2, name: "Bhadradri Kothagudem" },{ id: 3, name: "Hyderabad"},
      { id: 4, name:  "Khammam"},{ id: 5, name: "Jayashankar Bhupalpally"},{ id: 6, name: "Jangaon"},{ id: 7, name: "Jagtial"},
      { id: 8, name: "Komaram Bheem Asifabad"},{ id: 9, name: "Karimnagar"},{ id: 10, name: "Kamareddy"},{ id: 11, name: "Jogulamba Gadwal"},
      { id: 12, name: "Mahabubabad"},{ id: 13, name: "Mahabubnagar"},{ id: 14, name: "Medchal–Malkajgiri"},{ id: 15, name: "Nizamabad"},
      { id: 16, name: "Mancherial"},{ id: 17, name: "Medak"},{ id: 18, name: "Mulugu"},{ id: 19, name: "Peddapalli"},
      { id: 20, name: "Nagarkurnool"},{ id: 21, name: "Nalgonda"},{ id: 22, name: "Nirmal"},{ id: 23, name: "Rajanna Sircilla"},
      { id: 24, name:"Ranga Reddy"},{ id: 25, name:  "Sangareddy"},{ id: 26, name: "Siddipet"},{ id: 27, name: "Suryapet"},
      { id: 28, name:  "Warangal Urban"},{ id: 29, name:  "Warangal Rural"},{ id: 30, name:  "Wanaparthy"},{ id: 31, name:  "Vikarabad"},
      { id: 32, name:  "Yadadri Bhuvanagiri"}];
    const blocks = [ { id: 1, districtId: 1, name: "Adilabad" }, { id: 2, districtId: 1, name: "Bela" },{ id: 3, districtId: 1, name: "Boath" },
      { id: 4, districtId: 1, name: "Gudihatnoor" }, { id: 5, districtId: 1, name: "Indervelly" },{ id: 6, districtId: 2, name: "Bhadrachalam" },
      { id: 7, districtId: 2, name: "Aswapuram" }, { id: 8, districtId: 2, name: "Burgampahad" },{ id: 9, districtId: 2, name: "Dummugudem" },
      { id: 10, districtId: 2, name: "Manuguru" }, { id: 11, districtId: 3, name: "Amberpet" },{ id: 12, districtId: 3, name: "Ameerpet" },
      { id: 13, districtId: 3, name: "Asifnagar" },{ id: 14, districtId: 3, name: "Bahadurpura" },{ id: 15, districtId: 3, name: "Bandlaguda" },
      { id: 16, districtId: 3, name: "Golconda" },  { id: 17, districtId: 4, name: "Khammam Urban" },{ id: 18, districtId: 4, name: "Khammam Rural" },
      { id: 19, districtId: 4, name: "Nelakondapally" },{ id: 20, districtId: 4, name: "Mudigonda" },{ id: 21, districtId: 4, name: "Raghunathapalem" },
      { id: 22, districtId: 5, name: "Bhupalpally" },{ id: 23, districtId: 5, name: "Chityal" }, { id: 24, districtId: 5, name: "Ghanpur" },
      { id: 25, districtId: 5, name: "Maha Mutharam" }, { id: 26, districtId: 5, name: "Mogullapalle" },{ id: 27, districtId: 6, name: "Jangaon" },
      { id: 28, districtId: 6, name: "Lingalaghanpur" },{ id: 29, districtId: 6, name: "Raghunathpalle" }, { id: 30, districtId: 6, name: "Gundala" },
      { id: 31, districtId: 6, name: "Narmetta" }, { id: 32, districtId: 7, name: "Jagtial" },{ id: 33, districtId: 7, name: "Gollapalli" },
      { id: 34, districtId: 7, name: "Pegadapalli" }, { id: 35, districtId: 7, name: "Mallial" },     { id: 36, districtId: 8, name: "Asifabad" },
      { id: 37, districtId: 8, name: "Kerameri" },{ id: 38, districtId: 8, name: "Jainoor" },{ id: 39, districtId: 8, name: "Sirpur (U)" },
      { id: 40, districtId: 9, name: "Karimnagar" },{ id: 41, districtId: 9, name: "Choppadandi" },{ id: 42, districtId: 9, name: "Gangadhara" },
      { id: 43, districtId: 10, name: "Kamareddy" }, { id: 44, districtId: 10, name: "Banswada" },{ id: 45, districtId: 10, name: "Bhiknoor" },
      { id: 46, districtId: 11, name: "Gadwal" },{ id: 47, districtId: 11, name: "Alampur" },{ id: 48, districtId: 11, name: "Itikyal" },
      { id: 49, districtId: 12, name: "Mahabubabad" },{ id: 50, districtId: 12, name: "Bayyaram" },{ id: 51, districtId: 12, name: "Maripeda" },
      { id: 52, districtId: 13, name: "Mahabubnagar" }, { id: 53, districtId: 13, name: "Bhoothpur" }, { id: 54, districtId: 13, name: "Ghanpur" },
      { id: 55, districtId: 14, name: "Alwal" }, { id: 56, districtId: 14, name: "Bachupally" },{ id: 57, districtId: 14, name: "Kukatpally" },
      { id: 58, districtId: 15, name: "Armur" },{ id: 59, districtId: 15, name: "Balkonda" }, { id: 60, districtId: 15, name: "Bheemgal" },
      { id: 61, districtId: 15, name: "Jakranpalle" },{ id: 62, districtId: 16, name: "Mancherial" },{ id: 63, districtId: 16, name: "Dandepalli" },
      { id: 64, districtId: 16, name: "Luxettipet" }, { id: 65, districtId: 17, name: "Medak" },{ id: 66, districtId: 17, name: "Havelighanpur" },
      { id: 67, districtId: 17, name: "Papannapet" },{ id: 68, districtId: 18, name: "Mulugu" },{ id: 69, districtId: 18, name: "Venkatapur" },
      { id: 70, districtId: 19, name: "Peddapalli" },{ id: 71, districtId: 19, name: "Manthani" },{ id: 72, districtId: 20, name: "Nagarkurnool" },
      { id: 73, districtId: 20, name: "Achampet" },{ id: 74, districtId: 21, name: "Nalgonda" },{ id: 75, districtId: 21, name: "Chityal" },
      { id: 76, districtId: 22, name: "Nirmal" },{ id: 77, districtId: 22, name: "Dilawarpur" },{ id: 78, districtId: 23, name: "Sircilla" }, 
      { id: 79, districtId: 23, name: "Vemulawada" }, { id: 80, districtId: 24, name: "Ibrahimpatnam" },{ id: 81, districtId: 24, name: "Chevella" },
      { id: 82, districtId: 25, name: "Sangareddy" }, { id: 83, districtId: 25, name: "Patancheru" }, { id: 84, districtId: 26, name: "Siddipet" },
      { id: 85, districtId: 26, name: "Dubbak" },{ id: 86, districtId: 27, name: "Suryapet" },{ id: 87, districtId: 27, name: "Kodad" },
      { id: 88, districtId: 28, name: "Hanamkonda" }, { id: 89, districtId: 28, name: "Kazipet" }, { id: 90, districtId: 29, name: "Wardhannapet" },
      { id: 91, districtId: 29, name: "Parvathagiri" },{ id: 92, districtId: 30, name: "Wanaparthy" }, { id: 93, districtId: 30, name: "Gopalpeta" },
      { id: 94, districtId: 31, name: "Vikarabad" },{ id: 95, districtId: 31, name: "Tandur" },{ id: 96, districtId: 32, name: "Bhuvanagiri" },
      { id: 97, districtId: 32, name: "Motakondur" }
     ];
    
    const villages = [
      { id: 1, districtId: 1, blockId: 1, name: "Adilabad Village" }, { id: 2, districtId: 1, blockId: 2, name: "Bela Village" },
      { id: 3, districtId: 1, blockId: 3, name: "Boath Village" }, { id: 4, districtId: 2, blockId: 6, name: "Bhadrachalam Village" },
      { id: 5, districtId: 2, blockId: 7, name: "Aswapuram Village" }, { id: 6, districtId: 2, blockId: 8, name: "Burgampahad Village" }, 
      { id: 7, districtId: 3, blockId: 11, name: "Amberpet Village" },{ id: 8, districtId: 3, blockId: 12, name: "Ameerpet Village" },
      { id: 9, districtId: 3, blockId: 13, name: "Asifnagar Village" }, { id: 10, districtId: 4, blockId: 17, name: "Khammam Urban Village" },
      { id: 11, districtId: 4, blockId: 18, name: "Khammam Rural Village" }, { id: 12, districtId: 4, blockId: 19, name: "Nelakondapally Village" },
      { id: 13, districtId: 5, blockId: 22, name: "Bhupalpally Village" },{ id: 14, districtId: 5, blockId: 23, name: "Chityal Village" },
      { id: 15, districtId: 5, blockId: 24, name: "Ghanpur Village" }, { id: 16, districtId: 6, blockId: 27, name: "Jangaon Village" },
      { id: 17, districtId: 6, blockId: 28, name: "Lingalaghanpur Village" }, { id: 18, districtId: 6, blockId: 29, name: "Raghunathpalle Village" },
      { id: 19, districtId: 7, blockId: 32, name: "Jagtial Village" }, { id: 20, districtId: 7, blockId: 33, name: "Gollapalli Village" },
      { id: 21, districtId: 7, blockId: 34, name: "Pegadapalli Village" }, { id: 22, districtId: 8, blockId: 36, name: "Asifabad Village" },
      { id: 23, districtId: 8, blockId: 37, name: "Kerameri Village" },{ id: 24, districtId: 8, blockId: 38, name: "Jainoor Village" },
      { id: 25, districtId: 9, blockId: 40, name: "Karimnagar Village" }, { id: 26, districtId: 9, blockId: 41, name: "Choppadandi Village" },
      { id: 27, districtId: 9, blockId: 42, name: "Gangadhara Village" },{ id: 28, districtId: 10, blockId: 43, name: "Kamareddy Village" },
      { id: 29, districtId: 10, blockId: 44, name: "Banswada Village" }, { id: 30, districtId: 10, blockId: 45, name: "Bhiknoor Village" },
      { id: 31, districtId: 11, blockId: 46, name: "Gadwal Village" }, { id: 32, districtId: 11, blockId: 47, name: "Alampur Village" },
      { id: 33, districtId: 11, blockId: 48, name: "Itikyal Village" }, { id: 34, districtId: 12, blockId: 49, name: "Mahabubabad Village" },
      { id: 35, districtId: 12, blockId: 50, name: "Bayyaram Village" },{ id: 36, districtId: 12, blockId: 51, name: "Maripeda Village" },
      { id: 37, districtId: 13, blockId: 52, name: "Mahabubnagar Village" },{ id: 38, districtId: 13, blockId: 53, name: "Bhoothpur Village" },
      { id: 39, districtId: 13, blockId: 54, name: "Ghanpur Village" },{ id: 40, districtId: 14, blockId: 55, name: "Alwal Village" },
      { id: 41, districtId: 14, blockId: 56, name: "Bachupally Village" },{ id: 42, districtId: 14, blockId: 57, name: "Kukatpally Village" },
      { id: 43, districtId: 15, blockId: 58, name: "Armur Village" },{ id: 44, districtId: 15, blockId: 59, name: "Balkonda Village" },
      { id: 45, districtId: 15, blockId: 60, name: "Bheemgal Village" }, { id: 46, districtId: 16, blockId: 62, name: "Mancherial Village" },
      { id: 47, districtId: 16, blockId: 63, name: "Dandepalli Village" },{ id: 48, districtId: 16, blockId: 64, name: "Luxettipet Village" },
      { id: 49, districtId: 17, blockId: 65, name: "Medak Village" },{ id: 50, districtId: 17, blockId: 66, name: "Havelighanpur Village" },
      { id: 51, districtId: 17, blockId: 67, name: "Papannapet Village" },{ id: 52, districtId: 18, blockId: 68, name: "Mulugu Village" },
      { id: 53, districtId: 18, blockId: 69, name: "Venkatapur Village" },{ id: 54, districtId: 19, blockId: 70, name: "Peddapalli Village" },
      { id: 55, districtId: 19, blockId: 71, name: "Manthani Village" },{ id: 56, districtId: 20, blockId: 72, name: "Nagarkurnool Village" },
      { id: 57, districtId: 20, blockId: 73, name: "Achampet Village" }, { id: 58, districtId: 21, blockId: 74, name: "Nalgonda Village" },
      { id: 59, districtId: 21, blockId: 75, name: "Chityal Village" },{ id: 60, districtId: 22, blockId: 76, name: "Nirmal Village" },
      { id: 61, districtId: 22, blockId: 77, name: "Dilawarpur Village" },{ id: 62, districtId: 23, blockId: 78, name: "Sircilla Village" },
      { id: 63, districtId: 23, blockId: 79, name: "Vemulawada Village" },{ id: 64, districtId: 24, blockId: 80, name: "Ibrahimpatnam Village" },
     
  ];


  // Load employee data in edit mode
  useEffect(() => {
    if (isEditMode) {
      axios
        .get(`http://localhost:8080/api/employees/${employeeId}`)
        .then((res) => {
          const data = res.data;
          Object.keys(data).forEach((key) => {
            setValue(key, data[key]);
          });
          setSelectedDoc(data.documentType);
          setLoading(false);
          setEmployeeData(data); // Store employee data for photo preview
        })
        .catch((err) => {
          console.error("Failed to fetch employee:", err);
          setLoading(false);
        });
    }
  }, [employeeId, isEditMode, setValue]);

  const documentType = watch("documentType");

  useEffect(() => {
    setSelectedDoc(documentType);
  }, [documentType]);

 const onSubmit = async (data) => {
  // Validate current step before submission
  const currentSchema = employeeSchemas[currentStep];
  try {
    await currentSchema.validate(data, { abortEarly: false });
  } catch (validationError) {
    console.error("Validation errors:", validationError.errors);
    alert("Please fill all required fields in the current step before submitting.");
    return;
  }

  const formData = new FormData();

  // Only submit data that has been collected (from completed steps)
  const stepFields = {
    0: ["salutation", "firstName", "middleName", "lastName", "gender", "nationality", "dob"],
    1: ["contactNumber", "email"],
    2: ["relationType", "relationName", "altNumber", "altNumberType"],
    3: ["country", "state", "district", "block", "village", "zipcode"],
    4: ["education", "experience"],
    5: ["bankName", "accountNumber", "branchName", "ifscCode"],
    6: ["documentType", "documentNumber"],
    7: ["role", "accessStatus"]
  };

  // Collect data from all completed steps
  for (let step = 0; step <= currentStep; step++) {
    const fields = stepFields[step];
    fields.forEach((field) => {
      if (data[field] && data[field] !== "") {
        formData.append(field, data[field]);
      }
    });
  }

  // Handle document number based on document type
  if (data.documentType === "voterId" && data.voterId) {
    formData.append("documentNumber", data.voterId);
  } else if (data.documentType === "aadharNumber" && data.aadharNumber) {
    formData.append("documentNumber", data.aadharNumber);
  } else if (data.documentType === "panNumber" && data.panNumber) {
    formData.append("documentNumber", data.panNumber);
  } else if (data.documentType === "ppbNumber" && data.ppbNumber) {
    formData.append("documentNumber", data.ppbNumber);
  }

  // Files
  if (data.photo?.[0]) formData.append("photo", data.photo[0]);
  if (data.ppbFile?.[0]) formData.append("passbook", data.ppbFile[0]);

  // Handle document files
  if (data.documentType === "aadharNumber" && data.aadhaarFile?.[0]) {
    formData.append("documentFile", data.aadhaarFile[0]);
  } else if (data.documentType === "panNumber" && data.panFile?.[0]) {
    formData.append("documentFile", data.panFile[0]);
  } else if (data.documentType === "voterId" && data.voterFile?.[0]) {
    formData.append("documentFile", data.voterFile[0]);
  }

  // Debug: Log what's being sent
  console.log("Form data being sent:", Object.fromEntries(formData.entries()));

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please log in again.");
    navigate("/login");
    return;
  }

  try {
    const response = await fetch(
      isEditMode 
        ? `http://localhost:8080/api/employees/${employeeId}`
        : `http://localhost:8080/api/employees`,
      {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    console.log("Response status:", response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log("Full response:", response);
    console.log("Response data:", responseData);
    
    // Try multiple possible ID field names from backend response
    const newEmployeeId = responseData?.id || 
                         responseData?.employeeId || 
                         responseData?.employee_id ||
                         responseData?.empId ||
                         employeeId;
    
    console.log("Extracted employee ID:", newEmployeeId);
    
    if (!newEmployeeId) {
      console.error("No employee ID received from server. Response data:", responseData);
      alert("✅ Employee form submitted successfully! However, could not retrieve employee ID for viewing.");
      navigate("/dashboard"); // Navigate to dashboard instead
      return;
    }

    alert("✅ Employee form submitted successfully!");
    navigate(`/view-employee/${newEmployeeId}`);
  } catch (error) {
    console.error("❌ Submit Error:", error.message);
    console.error("❌ Full error:", error);
    alert("❌ Failed to submit. Please check all required fields.");
  }
};




const handlePhotoChange = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    setPhotoPreview(URL.createObjectURL(file));
    setValue("photo", [file]); // ✅ set as array to match react-hook-form file input
  }
};

  return (
    <div className="employee-container">
      <header className="employeetop-bar">
        <img src={logo1} alt="Digital Agristack Logo" className="infologo-left" />
        <img src={logo2} alt="DATE Logo" className="infologo-right" />
      </header>

          <div className="employeemiddle-container">
      <nav className="employeenav-links">
        {steps.map((label, index) => (
          <div
            key={index}
            className={`employeenav-item ${index === currentStep ? "active" : ""}`}
            onClick={() => setCurrentStep(index)}
            style={{ cursor: "pointer" }}
          >
            {label}
          </div>
        ))}
      </nav>
    </div>
    <u><h2 className="form-title">
      {steps[currentStep].replace(/^[^\w]+/, "").trim()}
    </h2></u>
    <div className="main-content">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="employee-form">
            {currentStep === 0 && (
           <div className="employeeform-grid">
             {/* 1. Photo */}
           <div className="frame-photo">
           <label className="label">
          Photo <span className="optional">(Optional)</span>
           </label>
            <div className="photo-box">
           {photoPreview ? (
               <div style={{ position: 'relative', display: 'inline-block' }}>
                 <img src={photoPreview} alt="Preview" className="photo-preview" />
                 <button
                   type="button"
                   onClick={() => {
                     setPhotoPreview(null);
                     setValue("photo", null);
                     navigate('/dashboard');
                   }}
                   style={{
                     position: 'absolute',
                     top: 4,
                     right: 4,
                     background: 'rgba(0,0,0,0.5)',
                     color: '#fff',
                     border: 'none',
                     borderRadius: '50%',
                     width: 28,
                     height: 28,
                     cursor: 'pointer',
                     fontWeight: 700,
                     fontSize: 18,
                     lineHeight: '28px',
                     textAlign: 'center',
                     zIndex: 2
                   }}
                   aria-label="Remove photo"
                 >
                   ×
                 </button>
               </div>
          ) : employeeData && employeeData.photoFileName ? (
            <img
              src={`http://localhost:8080/uploads/${employeeData.photoFileName}`}
              alt="Employee Photo"
              className="photo-preview"
              onError={e => {
                e.target.style.display = "none";
                if (e.target.nextSibling) e.target.nextSibling.style.display = "block";
              }}
            />
          ) : (
           <span className="photo-placeholder">No photo selected</span>
           )}
          </div>
          {/* Show file name if selected or from backend */}
          <div style={{ marginTop: "6px", fontSize: "0.95em", color: "#444" }}>
            {photoPreview && photo && photo[0] && photo[0].name
              ? `Selected: ${photo[0].name}`
              : employeeData && employeeData.photoFileName
                ? `Current: ${employeeData.photoFileName}`
                : null}
          </div>
            <div>
               <input
            type="file"
             accept="image/*"
                {...register("photo")}
                  onChange={handlePhotoChange}
              />
          {errors.photo && <p className="error">{errors.photo.message}</p>}
       </div>
       </div>
        {/* 5. Last Name */}
          <div>
           <label className="label">
           Last Name<span className="required">*</span>
          </label>
          <input
           className="input"
           placeholder="Last Name"
           {...register("lastName", { required: "Last Name is required" })}
          />
           {errors.lastName && <p className="error">{errors.lastName.message}</p>}
          </div>
        
      {/* 2. Salutation */}
        <div>
         <label className="label">
          Salutation<span className="required">*</span>
           </label>
          <select
             className="input"
            {...register("salutation", { required: "Salutation is required" })}
          >
            <option value="">Select</option>
           <option value="Mr">Mr</option>
           <option value="Mrs.">Mrs.</option>
          <option value="Ms.">Ms.</option>
          <option value="Miss.">Miss.</option>
           <option value="Dr.">Dr.</option>
        </select>
          {errors.salutation && <p className="error">{errors.salutation.message}</p>}
           </div> 
            {/* 6. Gender */}
        <div>
          <label className="label">
           Gender<span className="required">*</span>
         </label>
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
         </div>
           
               {/* 3. First Name */}
         <div>
          <label className="label">
              First Name<span className="required">*</span>
          </label>
          <input
            className="input"
          placeholder="First Name"
           {...register("firstName", { required: "First Name is required" })}
         />
          {errors.firstName && <p className="error">{errors.firstName.message}</p>}
         </div>
         {/* 8. DOB */}
        <div>
           <label className="label">
          DOB<span className="required">*</span>
          </label>
         <input
          type="date"
          className="input"
           {...register("dob", { required: "Date of Birth is required" })}
         />
         {errors.dob && <p className="error">{errors.dob.message}</p>}
        </div>

                   {/* 4. Middle Name */}
          <div>
          <label className="label">
           Middle Name<span className="required">*</span>
         </label>
         <input
           className="input"
           placeholder="Middle Name"
           {...register("middleName", { required: "Middle Name is required" })}
           />
           {errors.middleName && <p className="error">{errors.middleName.message}</p>}
         </div>
          {/* 7. Nationality */}
      <div>
        <label className="label">
           Nationality<span className="required">*</span>
        </label>
        <select
          className="input"
         {...register("nationality", { required: "Nationality is required" })}
        >
          <option value="">Select</option>
          <option value="Indian">Indian</option>
         </select>
         {errors.nationality && <p className="error">{errors.nationality.message}</p>}
       </div>
           </div>

        )}
            {/* Step 1: Contact Details */}
            {currentStep === 1 && (
              <div className="emp-form-one">
                <div>
                <label className="label">Contact Number
                    <span className="required">*</span></label>
                  <input
                    type="text"
                     className="input"
                    {...register("contactNumber", {
                      required: "Contact Number is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Enter a valid 10-digit number",
                      },
                    })}
                    placeholder=""
                  />
                  <p className="error">{errors.contactNumber?.message}</p>
                </div>

                <div>
                <label className="label"> Email
                 <span className="required">*</span></label>
                  <input
                    type="email"
                    className="input"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+\.\S+$/,
                        message: "Invalid email address",
                      },
                    })}
                    placeholder=""
                  />
                  <p className="error">{errors.email?.message}</p>
                </div>
              </div>
            )}
       {currentStep === 2 && (
  <div className="emp-form-two">
    {/* Relation */}
    <div>
      <label className="label" htmlFor="relationType">
        Select <span className="required">*</span>
      </label>
      <select
        id="relationType"
        className="input"
        {...register("relationType", { required: "Please select a relation" })}
      >
        <option value="">-- Select --</option>
        <option value="do">D/O</option>
        <option value="so">S/O</option>
        <option value="wo">W/O</option>
      </select>
      {errors.relationType && <p className="error">{errors.relationType.message}</p>}
    </div>

    {/* Relation Name */}
    <div>
      <label className="label">Relation Name <span className="required">*</span></label>
      <input
        type="text"
        placeholder="Krishna Kumar"
        className="input"
        {...register("relationName", { required: "Relation Name is required" })}
      />
      {errors.relationName && <p className="error">{errors.relationName.message}</p>}
    </div>

    {/* Alternative Number */}
    <div>
      <label className="label">Alternative Number</label>
      <input
        type="text"
        placeholder="91-987xxxxxx16"
        className="input"
        {...register("altNumber", {
          pattern: {
            value: /^\d{10}$/,
            message: "Must be 10 digits",
          },
        })}
      />
      {errors.altNumber && <p className="error">{errors.altNumber.message}</p>}
    </div>

    {/* Alternative Type */}
    <div>
      <label className="label" htmlFor="altNumberType">
        Alternative Type <span className="required">*</span>
      </label>
      <select
        id="altNumberType"
        className="input"
        {...register("altNumberType", { required: "Please select an alternative type" })}
      >
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
      {errors.altNumberType && <p className="error">{errors.altNumberType.message}</p>}
    </div>
  </div>
)}


{currentStep === 3 && (
        <div className="emp-form-three">
        <div>
  <label className="label">
    Country <span className="required">*</span>
  </label>
  <select
    className="input"
    {...register("country", { required: "Country is required" })}
  >
    <option value="">Select Country</option>
    <option value="India">India</option>
    <option value="USA">USA</option>
    <option value="UK">UK</option>
    <option value="Canada">Canada</option>
  </select>
  {errors.country && (
    <p className="error">{errors.country?.message}</p>
  )}
</div>


          <div>
            <label className="label">State <span className="required">*</span></label>
            <select {...register("state")} className="input">
              <option value="">Select State</option>
              {states.map((state) => ( <option key={state.id} value={state.name}> {state.name}  </option> ))}
            </select>
            <p className="error">{errors.state?.message}</p>
          </div>

          <div>
            <label className="label">District <span className="required">*</span></label>
            <select {...register("district")} className="input">
              <option value="">Select District</option>
              {districts.map((districts) => ( <option key={districts.id} value={districts.name}> {districts.name}  </option> ))}
            </select>
            <p className="error">{errors.district?.message}</p>
          </div>

          <div>
            <label className="label">Block (mandal) <span className="required">*</span></label>
            <select {...register("block")} className="input">
              <option value="">Select Block</option>
              {blocks.map((blocks) => ( <option key={blocks.id} value={blocks.name}> {blocks.name}  </option> ))}
            </select>
            <p className="error">{errors.block?.message}</p>
          </div>

          <div>
            <label className="label">Village <span className="required">*</span></label>
            <select {...register("village")} className="input">
              <option value="">Select Village</option>
              {villages.map((villages) => ( <option key={villages.id} value={villages.name}> {villages.name}  </option> ))}
            </select>
            <p className="error">{errors.village?.message}</p>
          </div>

          <div>
            <label className="label">Zipcode <span className="required">*</span></label>
            <input
              type="text"
              placeholder="56xxxx"
              className="input"
              {...register("zipcode")}
            />
            <p className="error">{errors.zipcode?.message}</p>
          </div>
        </div>
      )}


{currentStep === 4 && (
  <div className="emp-form-four">
    {/* Education Field */}
    <div>
      <label className="label">Education <span className="required">*</span></label>
      <select className="input" {...register("professional.education")}>
        <option value="">Select</option>
        <option value="Primary Schooling">Primary Schooling</option>
        <option value="High School">High School</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Degree">Degree</option>
        <option value="Graduate">Graduate</option>
        <option value="Post-Graduate">Post-Graduate</option>
      </select>
      {errors.professional?.education && (
        <p className="error">{errors.education?.message}</p>
      )}
    </div>

    {/* Experience Field */}
    <div>
      <label className="label">Experience <span className="required">*</span></label>
      <input
        type="text"
        placeholder="15 Years"
        className="input"
        {...register("professional.experience")}
      />
      {errors.professional?.experience && (
        <p className="error">{errors.experience?.message}</p>
      )}
    </div>
  </div>
)}

{currentStep === 5 && (
  <div className="emp-form-five">
    {/* Bank Name */}
    <div>
      <label className="label">Bank Name <span className="required">*</span></label>
      <input
        type="text"
        placeholder="HDFC Bank"
        className="input"
        {...register("bank.bankName")}
      />
      {errors.bank?.bankName && <p className="error">{errors.bankName?.message}</p>}
    </div>

    {/* Account Number */}
    <div>
      <label className="label">Account Number <span className="required">*</span></label>
      <input
        type="text"
        placeholder="281398301653"
        className="input"
        {...register("bank.accountNumber")}
      />
      {errors.bank?.accountNumber && <p className="error">{errors.accountNumber?.message}</p>}
    </div>

    {/* Branch Name */}
    <div>
      <label className="label">Branch name <span className="required">*</span></label>
      <input
        type="text"
        placeholder="Madhapur"
        className="input"
        {...register("bank.branchName")}
      />
      {errors.bank?.branchName && <p className="error">{errors.branchName?.message}</p>}
    </div>

    {/* IFSC Code */}
    <div>
      <label className="label">IFSC Code <span className="required">*</span></label>
      <input
        type="text"
        placeholder="HDFC0001234"
        className="input"
        {...register("bank.ifscCode")}
      />
      {errors.bank?.ifscCode && <p className="error">{errors.ifscCode?.message}</p>}
    </div>

    {/* Passbook */}
    <div>
      <label className="label">Passbook <span className="required">*</span></label>
      <input
        type="file"
        className="input"
        {...register("bank.passbook")}
      />
      {errors.bank?.passbook && <p className="error">{errors.passbook?.message}</p>}
    </div>
  </div>
)}


{currentStep === 6 && (
  <div className="emp-form-six">
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

    {/* Voter ID */}
    {selectedDoc === "voterId" && (
      <>
        <input
          type="text"
          placeholder="Voter ID"
          className="input"
          {...register("voterId", { required: "Voter ID is required" })}
        />
        <p className="error-text">{errors.voterId?.message}</p>

        <input
          type="file"
          accept="image/*,application/pdf"
          {...register("voterFile", { required: "Voter ID File is required" })}
        />
        <p className="error-text">{errors.voterFile?.message}</p>
      </>
    )}

    {/* Aadhar */}
    {selectedDoc === "aadharNumber" && (
      <>
        <input
          type="text"
          placeholder="Aadhar Number"
          className="input"
          {...register("aadharNumber", { required: "Aadhar Number is required" })}
        />
        <p className="error-text">{errors.aadharNumber?.message}</p>

        <input
          type="file"
          accept="image/*,application/pdf"
          {...register("aadharFile", { required: "Aadhar File is required" })}
        />
        <p className="error-text">{errors.aadharFile?.message}</p>
      </>
    )}

    {/* PAN */}
    {selectedDoc === "panNumber" && (
      <>
        <input
          type="text"
          placeholder="PAN Number"
          className="input"
          {...register("panNumber", { required: "PAN Number is required" })}
        />
        <p className="error-text">{errors.panNumber?.message}</p>

        <input
          type="file"
          accept="image/*,application/pdf"
          {...register("panFile", { required: "PAN File is required" })}
        />
        <p className="error-text">{errors.panFile?.message}</p>
      </>
    )}

    {/* PPB (Optional) */}
    {selectedDoc === "ppbNumber" && (
      <>
        <input
          type="text"
          placeholder="PPB Number"
          className="input"
          {...register("ppbNumber")}
        />
        <p className="error-text">{errors.ppbNumber?.message}</p>

        <input
          type="file"
          accept="image/*,application/pdf"
          {...register("ppbFile")}
        />
        <p className="error-text">{errors.ppbFile?.message}</p>
      </>
    )}
  </div>
)}

{currentStep === 7 && (
  <div className="emp-form-seven">
    <div>
      <label className="label">
        Role/Designation <span className="required">*</span>
      </label>
      <select className="input" {...register("role", { required: true })}>
        <option value="">Select</option>
        <option value="manager">Manager</option>
        <option value="employee">Employee</option>
      </select>
      {errors.role && (
        <p className="error">{errors.role.message}</p>
      )}
    </div>

    <div>
      <label className="label">
        Access <span className="required">*</span>
      </label>
      <select className="input" {...register("accessStatus", { required: true })}>
        <option value="">Select</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      {errors.accessStatus && (
        <p className="error">{errors.accessStatus.message}</p>
      )}
    </div>
  </div>
)}
               <div className="employee-btn">
            {currentStep === 0 ? (
              <button
                type="button"
                onClick={async () => {
                  const isValid = await trigger(Object.keys(employeeSchemas[currentStep]));
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
                <button type="submit">Submit</button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => setCurrentStep(currentStep - 1)}>
                  Previous
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const isValid = await trigger(Object.keys(employeeSchemas[currentStep]));
                    if (isValid) setCurrentStep(currentStep + 1);
                  }}
                >
                  Next
                </button>
              </>
            )}
          </div>

          {showSuccessPopup && (
            <div className="popup">
              <div className="popup-content">
                <h3>Success!</h3>
                Employee form submitted successfully.
                <button onClick={() => setShowSuccessPopup(false)}>OK</button>
              </div>
            </div>
          )}
        </form>
      </FormProvider>

        {/* Right: Image Section */}
        <div className="image-section">
          <img src={sampleImage} alt="Tractor" />
        </div>
      </div>
    </div>
  );
}

export default EmployeeDetails;
