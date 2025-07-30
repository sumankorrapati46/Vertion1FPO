import React, { useState } from "react";
import logo1 from "../assets/leftlogo.png";
import logo2 from "../assets/rightlogo.png";
import Select from 'react-select';
import "../styles/Fpo.css";


const AddFPOForm = () => {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    country: "",
    state: "",
    district: "",
    fpoName: "",
    registrationNumber: "",
    ceoName: "",
    mobile: "",
    email: "",
    totalMembers: "",
    acres: "",
    address: {
      hno: "",
      village: "",
      addressState: "",
      pincode: "",
    },
    service: [],
  });

  const options = [
     { value: "Soil Test", label: "Soil Test" },
     { value: "Water Test", label: "Water Test" },
     { value: "Farm Equipment", label: "Farm Equipment" },
     { value: "Drones", label: "Drones" },
     { value: "Cold Storage", label: "Cold Storage" },
     { value: "Warehouse", label: "Warehouse" },
     { value: "Pesticides", label: "Pesticides" },
     { value: "Seeds", label: "Seeds" },
     { value: "Fertilizers", label: "Fertilizers" },
     { value: "Market Linkage", label: "Market Linkage" },
     { value: "Alternative Wetting & Drying (AWD)", label: "Alternative Wetting & Drying (AWD)" },
     { value: "Agriculture Infrastructure Fund (AIF)", label: "Agriculture Infrastructure Fund (AIF)" },
     { value: "Others", label: "Others" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (["hno", "village", "addressState", "pincode"].includes(name)) {
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [name]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleServiceChange = (selected) => {
    setFormData({ ...formData, service: selected });
  };

  const handleNext = () => {
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Data:", formData);
    alert("FPO Submitted Successfully!");
  };

  return (
    <div className="fpo-container">
      <div className="fpo-header">
        <img src={logo1} alt="Digital Agristack Logo" className="infologo-left" />
        <img src={logo2} alt="DATE Logo" className="infologo-right" />
      </div>

      <div className="fpo-middle-bar">
        <div className="header-left">Add FPO</div>
        <div className="header-right">Administrator</div>
      </div>

      {step === 1 ? (
        <form className="fpo-form">
    <h2>Registration – Farmer Producer Organization (FPO)</h2>

  <div className="fpo-grid">
    <div className="left">
    <label>Country <span style={{ color: 'red' }}>*</span></label>
    <input name="country" placeholder="Country" onChange={handleInputChange} />

    <label>State <span style={{ color: 'red' }}>*</span></label>
    <input name="state" placeholder="State" onChange={handleInputChange} />

    <label>District <span style={{ color: 'red' }}>*</span></label>
    <input name="district" placeholder="District" onChange={handleInputChange} />

    <label>FPO Name <span style={{ color: 'red' }}>*</span></label>
    <input name="fpoName" placeholder="FPO Name" onChange={handleInputChange} />

    <label>FPO Registration Number <span style={{ color: 'red' }}>*</span></label>
    <input name="registrationNumber" placeholder="Registration Number" onChange={handleInputChange} />
     </div>
     <div className="right">
    <label>FPO CEO Name <span style={{ color: 'red' }}>*</span></label>
    <input name="ceoName" placeholder="CEO Name" onChange={handleInputChange} />

    <label>Mobile <span style={{ color: 'red' }}>*</span></label>
    <input name="mobile" placeholder="📞 Mobile" onChange={handleInputChange} />

    <label>Email <span style={{ color: 'red' }}>*</span></label>
    <input name="email" placeholder="Email" onChange={handleInputChange} />

    <label>Total Members <span style={{ color: 'red' }}>*</span></label>
    <input name="totalMembers" placeholder="Total Members" onChange={handleInputChange} />

    <label>No. of Acres <span style={{ color: 'red' }}>*</span></label>
    <input name="acres" placeholder="No. of Acres" onChange={handleInputChange} />
  </div>
  </div>
   <div className="fpo-address">
  <div className="fpo-addressleft">
    <label>H.No</label>
    <input name="hno" placeholder="H.No" onChange={handleInputChange} />

    <label>Village / Mandal</label>
    <input name="village" placeholder="Village / Mandal" onChange={handleInputChange} />
    </div>
   <div className="fpo-addressright">
    <label>State</label>
    <input name="addressState" placeholder="State" onChange={handleInputChange} />

    <label>Pincode</label>
    <input name="pincode" placeholder="Pincode" onChange={handleInputChange} />
  </div>
  </div>

  <button type="button" className="fpo-button submit" onClick={handleNext}>
    Next
  </button>
</form>

      ) : (
        <form className="fpo-service" onSubmit={handleSubmit}>
          <h2 className="success">Congratulations..!</h2>
          <p>Proceed to choose services</p>
          <label><h3>What kind of service would you like?</h3></label>

          <Select 
            options={options}
            isMulti
            placeholder="Select Access"
            value={formData.service}
            onChange={handleServiceChange}
          />
           
          <button type="submit" className="fpo-button submit">Submit Request</button>
        </form>
      )}
    </div>
  );
};

export default AddFPOForm;
