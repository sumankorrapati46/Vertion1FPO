import React, { useEffect, useState } from 'react';
import '../styles/ViewFarmerDetails.css';

const ViewEmployee = ({ employeeData, onBack, onSave }) => {
	const [isEditMode, setIsEditMode] = useState(false);
	const [formData, setFormData] = useState({});

	// Helper to get the first non-empty value from multiple possible field names
	const firstValue = (obj, ...keys) => {
		for (const key of keys) {
			const value = obj?.[key];
			if (value !== undefined && value !== null && String(value).trim() !== '') {
				return value;
			}
		}
		return undefined;
	};

	// Normalize employee data to handle different field names from backend
	const normalized = {
		firstName: firstValue(employeeData, 'firstName'),
		lastName: firstValue(employeeData, 'lastName'),
		middleName: firstValue(employeeData, 'middleName'),
		email: firstValue(employeeData, 'email'),
		contactNumber: firstValue(employeeData, 'contactNumber', 'phone'),
		dateOfBirth: firstValue(employeeData, 'dob', 'dateOfBirth'),
		gender: firstValue(employeeData, 'gender'),
		role: firstValue(employeeData, 'role'),
		designation: firstValue(employeeData, 'designation'),
		status: firstValue(employeeData, 'accessStatus', 'status'),
		state: firstValue(employeeData, 'state'),
		district: firstValue(employeeData, 'district'),
		zipcode: firstValue(employeeData, 'zipcode', 'pincode'),
		country: firstValue(employeeData, 'country'),
		block: firstValue(employeeData, 'block'),
		village: firstValue(employeeData, 'village'),
		nationality: firstValue(employeeData, 'nationality'),
		education: firstValue(employeeData, 'education'),
		experience: firstValue(employeeData, 'experience'),
		relationType: firstValue(employeeData, 'relationType'),
		relationName: firstValue(employeeData, 'relationName'),
		altNumber: firstValue(employeeData, 'altNumber'),
		altNumberType: firstValue(employeeData, 'altNumberType')
	};

	useEffect(() => {
		if (employeeData) {
			setFormData({
				firstName: normalized.firstName || '',
				lastName: normalized.lastName || '',
				middleName: normalized.middleName || '',
				email: normalized.email || '',
				contactNumber: normalized.contactNumber || '',
				dateOfBirth: normalized.dateOfBirth || '',
				gender: normalized.gender || '',
				role: normalized.role || '',
				designation: normalized.designation || '',
				status: normalized.status || 'ACTIVE',
				state: normalized.state || '',
				district: normalized.district || '',
				zipcode: normalized.zipcode || '',
				country: normalized.country || '',
				block: normalized.block || '',
				village: normalized.village || '',
				nationality: normalized.nationality || '',
				education: normalized.education || '',
				experience: normalized.experience || '',
				relationType: normalized.relationType || '',
				relationName: normalized.relationName || '',
				altNumber: normalized.altNumber || '',
				altNumberType: normalized.altNumberType || ''
			});
		}
	}, [employeeData]);

	const safe = (value, fallback = 'Not provided') => {
		if (value === null || value === undefined) return fallback;
		const str = String(value).trim();
		return str === '' ? fallback : str;
	};

	const formatDate = (dateString) => {
		if (!dateString) return 'Not provided';
		try {
			let date;
			if (typeof dateString === 'string') {
				if (dateString.includes('T') || dateString.includes('Z')) {
					date = new Date(dateString);
				} else {
					date = new Date(dateString + 'T00:00:00');
				}
			} else if (dateString instanceof Date) {
				date = dateString;
			} else {
				date = new Date(dateString);
			}
			
			if (isNaN(date.getTime())) {
				return 'Invalid date';
			}
			
			return date.toLocaleDateString();
		} catch (error) {
			return 'Invalid date';
		}
	};

	const handleInputChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleSave = async () => {
		try {
			await onSave?.(formData);
			setIsEditMode(false);
		} catch (e) {
			console.error('Error saving employee:', e);
			alert('Failed to save employee data');
		}
	};

	const handleCancel = () => {
		setIsEditMode(false);
		if (employeeData) {
			setFormData({
				firstName: normalized.firstName || '',
				lastName: normalized.lastName || '',
				middleName: normalized.middleName || '',
				email: normalized.email || '',
				contactNumber: normalized.contactNumber || '',
				dateOfBirth: normalized.dateOfBirth || '',
				gender: normalized.gender || '',
				role: normalized.role || '',
				designation: normalized.designation || '',
				status: normalized.status || 'ACTIVE',
				state: normalized.state || '',
				district: normalized.district || '',
				zipcode: normalized.zipcode || '',
				country: normalized.country || '',
				block: normalized.block || '',
				village: normalized.village || '',
				nationality: normalized.nationality || '',
				education: normalized.education || '',
				experience: normalized.experience || '',
				relationType: normalized.relationType || '',
				relationName: normalized.relationName || '',
				altNumber: normalized.altNumber || '',
				altNumberType: normalized.altNumberType || ''
			});
		}
	};

	const renderField = (label, field, type = 'text', options = []) => {
		if (isEditMode) {
			if (type === 'select') {
				return (
					<select
						value={formData[field] || ''}
						onChange={(e) => handleInputChange(field, e.target.value)}
						className="edit-input"
					>
						{options.map(option => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				);
			}
			if (type === 'textarea') {
				return (
					<textarea
						value={formData[field] || ''}
						onChange={(e) => handleInputChange(field, e.target.value)}
						className="edit-input"
					/>
				);
			}
			return (
				<input
					type={type}
					value={formData[field] || ''}
					onChange={(e) => handleInputChange(field, e.target.value)}
					className="edit-input"
				/>
			);
		}
		return <span>{safe(normalized[field])}</span>;
	};

	return (
		<div className="view-farmer-content">
			<div className="view-farmer-header">
				<button className="back-btn" onClick={onBack}>← Back to Employees</button>
				<h2 style={{ margin: 0, flex: 1, textAlign: 'center' }}>Employee Details</h2>
				<div style={{ display: 'flex', gap: '8px' }}>
					{!isEditMode ? (
						<button onClick={() => setIsEditMode(true)} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '14px' }}>Edit</button>
					) : (
						<>
							<button onClick={handleSave} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '14px' }}>Save</button>
							<button onClick={handleCancel} style={{ background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
						</>
					)}
				</div>
			</div>

			<div className="view-farmer-body">
				<div className="farmer-details-container">
					<div className="detail-section">
						<h3>Personal Information</h3>
						<div className="detail-grid">
							<div className="detail-item">
								<label>First Name:</label>
								{isEditMode ? (
									<input
										type="text"
										value={formData.firstName || ''}
										onChange={(e) => handleInputChange('firstName', e.target.value)}
										className="edit-input"
									/>
								) : (
									<span>{safe(normalized.firstName)}</span>
								)}
							</div>
							<div className="detail-item">
								<label>Middle Name:</label>
								{isEditMode ? (
									<input
										type="text"
										value={formData.middleName || ''}
										onChange={(e) => handleInputChange('middleName', e.target.value)}
										className="edit-input"
									/>
								) : (
									<span>{safe(normalized.middleName)}</span>
								)}
							</div>
							<div className="detail-item">
								<label>Last Name:</label>
								{isEditMode ? (
									<input
										type="text"
										value={formData.lastName || ''}
										onChange={(e) => handleInputChange('lastName', e.target.value)}
										className="edit-input"
									/>
								) : (
									<span>{safe(normalized.lastName)}</span>
								)}
							</div>
							<div className="detail-item">
								<label>Email:</label>
								{isEditMode ? (
									<input
										type="email"
										value={formData.email || ''}
										onChange={(e) => handleInputChange('email', e.target.value)}
										className="edit-input"
									/>
								) : (
									<span>{safe(normalized.email)}</span>
								)}
							</div>
							<div className="detail-item">
								<label>Contact Number:</label>
								{isEditMode ? (
									<input
										type="tel"
										value={formData.contactNumber || ''}
										onChange={(e) => handleInputChange('contactNumber', e.target.value)}
										className="edit-input"
									/>
								) : (
									<span>{safe(normalized.contactNumber)}</span>
								)}
							</div>
							<div className="detail-item">
								<label>Date of Birth:</label>
								{isEditMode ? (
									<input
										type="date"
										value={formData.dateOfBirth || ''}
										onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
										className="edit-input"
									/>
								) : (
									<span>{formatDate(normalized.dateOfBirth)}</span>
								)}
							</div>
							<div className="detail-item">
								<label>Gender:</label>
								{isEditMode ? (
									<select
										value={formData.gender || ''}
										onChange={(e) => handleInputChange('gender', e.target.value)}
										className="edit-input"
									>
										<option value="">Select Gender</option>
										<option value="Male">Male</option>
										<option value="Female">Female</option>
										<option value="Other">Other</option>
									</select>
								) : (
									<span>{safe(normalized.gender)}</span>
								)}
							</div>
							<div className="detail-item">
								<label>Nationality:</label>
								{isEditMode ? (
									<input
										type="text"
										value={formData.nationality || ''}
										onChange={(e) => handleInputChange('nationality', e.target.value)}
										className="edit-input"
									/>
								) : (
									<span>{safe(normalized.nationality)}</span>
								)}
							</div>
						</div>
					</div>

					<div className="detail-section">
						<h3>Employment</h3>
						<div className="detail-grid">
							<div className="detail-item">
								<label>Role:</label>
								{isEditMode ? (
									<select
										value={formData.role || ''}
										onChange={(e) => handleInputChange('role', e.target.value)}
										className="edit-input"
									>
										<option value="">Select Role</option>
										<option value="employee">Employee</option>
										<option value="admin">Admin</option>
										<option value="super_admin">Super Admin</option>
									</select>
								) : (
									<span>{safe(normalized.role)}</span>
								)}
							</div>
							<div className="detail-item">
								<label>Designation:</label>
								{isEditMode ? (
									<input
										type="text"
										value={formData.designation || ''}
										onChange={(e) => handleInputChange('designation', e.target.value)}
										className="edit-input"
									/>
								) : (
									<span>{safe(normalized.designation)}</span>
								)}
							</div>
							<div className="detail-item">
								<label>Status:</label>
								{isEditMode ? (
									<select
										value={formData.status || 'ACTIVE'}
										onChange={(e) => handleInputChange('status', e.target.value)}
										className="edit-input"
									>
										<option value="ACTIVE">Active</option>
										<option value="INACTIVE">Inactive</option>
										<option value="PENDING">Pending</option>
									</select>
								) : (
									<span>{safe(normalized.status)}</span>
								)}
							</div>
							<div className="detail-item">
								<label>Education:</label>
								{isEditMode ? (
									<input
										type="text"
										value={formData.education || ''}
										onChange={(e) => handleInputChange('education', e.target.value)}
										className="edit-input"
									/>
								) : (
									<span>{safe(normalized.education)}</span>
								)}
							</div>
							<div className="detail-item">
								<label>Experience:</label>
								{isEditMode ? (
									<input
										type="text"
										value={formData.experience || ''}
										onChange={(e) => handleInputChange('experience', e.target.value)}
										className="edit-input"
									/>
								) : (
									<span>{safe(normalized.experience)}</span>
								)}
							</div>
						</div>
					</div>

					<div className="detail-section">
						<h3>Address</h3>
						<div className="detail-grid">
							<div className="detail-item">
								<label>Country:</label>
								{isEditMode ? (
									<input
										type="text"
										value={formData.country || ''}
										onChange={(e) => handleInputChange('country', e.target.value)}
										className="edit-input"
									/>
								) : (
									<span>{safe(normalized.country)}</span>
								)}
							</div>
							<div className="detail-item">
								<label>State:</label>
								{isEditMode ? (
									<input
										type="text"
										value={formData.state || ''}
										onChange={(e) => handleInputChange('state', e.target.value)}
										className="edit-input"
									/>
								) : (
									<span>{safe(normalized.state)}</span>
								)}
							</div>
							<div className="detail-item">
								<label>District:</label>
								{isEditMode ? (
									<input
										type="text"
										value={formData.district || ''}
										onChange={(e) => handleInputChange('district', e.target.value)}
										className="edit-input"
									/>
								) : (
									<span>{safe(normalized.district)}</span>
								)}
							</div>
							<div className="detail-item">
								<label>Block:</label>
								{isEditMode ? (
									<input
										type="text"
										value={formData.block || ''}
										onChange={(e) => handleInputChange('block', e.target.value)}
										className="edit-input"
									/>
								) : (
									<span>{safe(normalized.block)}</span>
								)}
							</div>
							<div className="detail-item">
								<label>Village:</label>
								{isEditMode ? (
									<input
										type="text"
										value={formData.village || ''}
										onChange={(e) => handleInputChange('village', e.target.value)}
										className="edit-input"
									/>
								) : (
									<span>{safe(normalized.village)}</span>
								)}
							</div>
							<div className="detail-item">
								<label>Zipcode:</label>
								{isEditMode ? (
									<input
										type="text"
										value={formData.zipcode || ''}
										onChange={(e) => handleInputChange('zipcode', e.target.value)}
										className="edit-input"
									/>
								) : (
									<span>{safe(normalized.zipcode)}</span>
								)}
							</div>
						</div>
					</div>

					<div className="detail-section">
						<h3>Additional Information</h3>
						<div className="detail-grid">
							<div className="detail-item">
								<label>Relation Type:</label>
								{isEditMode ? (
									<input
										type="text"
										value={formData.relationType || ''}
										onChange={(e) => handleInputChange('relationType', e.target.value)}
										className="edit-input"
									/>
								) : (
									<span>{safe(normalized.relationType)}</span>
								)}
							</div>
							<div className="detail-item">
								<label>Relation Name:</label>
								{isEditMode ? (
									<input
										type="text"
										value={formData.relationName || ''}
										onChange={(e) => handleInputChange('relationName', e.target.value)}
										className="edit-input"
									/>
								) : (
									<span>{safe(normalized.relationName)}</span>
								)}
							</div>
							<div className="detail-item">
								<label>Alternative Number:</label>
								{isEditMode ? (
									<input
										type="tel"
										value={formData.altNumber || ''}
										onChange={(e) => handleInputChange('altNumber', e.target.value)}
										className="edit-input"
									/>
								) : (
									<span>{safe(normalized.altNumber)}</span>
								)}
							</div>
							<div className="detail-item">
								<label>Alternative Number Type:</label>
								{isEditMode ? (
									<input
										type="text"
										value={formData.altNumberType || ''}
										onChange={(e) => handleInputChange('altNumberType', e.target.value)}
										className="edit-input"
									/>
								) : (
									<span>{safe(normalized.altNumberType)}</span>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ViewEmployee;
