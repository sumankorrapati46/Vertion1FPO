import React, { useEffect, useState } from 'react';
import '../styles/ViewFarmerDetails.css';

const ViewEmployeeDetails = ({ employeeData, onClose, onSave }) => {
	const [isEditMode, setIsEditMode] = useState(false);
	const [formData, setFormData] = useState({});

	// ESC to close
	useEffect(() => {
		const onKeyDown = (e) => e.key === 'Escape' && onClose?.();
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [onClose]);

	// Initialize form data when employeeData changes
	useEffect(() => {
		if (employeeData) {
			setFormData({
				firstName: employeeData.firstName || '',
				lastName: employeeData.lastName || '',
				email: employeeData.email || '',
				phone: employeeData.phone || employeeData.contactNumber || '',
				dateOfBirth: employeeData.dateOfBirth || employeeData.dob || '',
				gender: employeeData.gender || '',
				role: employeeData.role || '',
				designation: employeeData.designation || '',
				status: employeeData.status || employeeData.accessStatus || 'ACTIVE',
				city: employeeData.city || employeeData.district || '',
				state: employeeData.state || '',
				pincode: employeeData.pincode || employeeData.zipcode || '',
				address: employeeData.address || ''
			});
		}
	}, [employeeData]);

	const firstValue = (src, ...keys) => {
		for (const key of keys) {
			const v = src?.[key];
			if (v !== undefined && v !== null && String(v).trim() !== '') return v;
		}
		return undefined;
	};

	const normalized = (() => {
		const src = employeeData || {};
		const name = firstValue(src, 'name') || [firstValue(src, 'firstName'), firstValue(src, 'middleName'), firstValue(src, 'lastName')].filter(Boolean).join(' ');
		const parts = (firstValue(src, 'name') || '').split(' ');
		return {
			name,
			firstName: firstValue(src, 'firstName') || parts[0] || '',
			lastName: firstValue(src, 'lastName') || parts.slice(1).join(' ') || '',
			email: firstValue(src, 'email'),
			phone: firstValue(src, 'contactNumber', 'phone', 'phoneNumber'),
			dateOfBirth: firstValue(src, 'dateOfBirth', 'dob'),
			gender: firstValue(src, 'gender'),
			address: firstValue(src, 'address'),
			city: firstValue(src, 'city', 'district'),
			state: firstValue(src, 'state'),
			pincode: firstValue(src, 'pincode', 'zipcode'),
			status: firstValue(src, 'status', 'accessStatus'),
			role: firstValue(src, 'role'),
			designation: firstValue(src, 'designation') || 'KYC Officer'
		};
	})();

	const safe = (v, fallback = 'Not provided') => {
		if (v === null || v === undefined) return fallback;
		const s = String(v).trim();
		return s === '' ? fallback : s;
	};

	const formatDate = (d) => {
		if (!d) return 'Not provided';
		try {
			const date = typeof d === 'string' && !d.includes('T') ? new Date(`${d}T00:00:00`) : new Date(d);
			return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleDateString();
		} catch {
			return 'Invalid date';
		}
	};

	const handleInputChange = (field, value) => {
		setFormData(prev => ({
			...prev,
			[field]: value
		}));
	};

	const handleSave = async () => {
		try {
			if (onSave) {
				await onSave(formData);
				setIsEditMode(false);
			}
		} catch (error) {
			console.error('Error saving employee:', error);
			alert('Failed to save employee data');
		}
	};

	const handleCancel = () => {
		setIsEditMode(false);
		// Reset form data to original values
		if (employeeData) {
			setFormData({
				firstName: employeeData.firstName || '',
				lastName: employeeData.lastName || '',
				email: employeeData.email || '',
				phone: employeeData.phone || employeeData.contactNumber || '',
				dateOfBirth: employeeData.dateOfBirth || employeeData.dob || '',
				gender: employeeData.gender || '',
				role: employeeData.role || '',
				designation: employeeData.designation || '',
				status: employeeData.status || employeeData.accessStatus || 'ACTIVE',
				city: employeeData.city || employeeData.district || '',
				state: employeeData.state || '',
				pincode: employeeData.pincode || employeeData.zipcode || '',
				address: employeeData.address || ''
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
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content view-farmer-modal" onClick={(e) => e.stopPropagation()}>
				<div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
					<button className="back-btn" onClick={onClose} style={{
						background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', color: '#111827'
					}}>← Back</button>
					<h2 style={{ margin: 0, flex: 1, textAlign: 'center' }}>Employee Details</h2>
					<div style={{ display: 'flex', gap: '8px' }}>
						{!isEditMode ? (
							<button 
								onClick={() => setIsEditMode(true)}
								style={{
									background: '#10b981',
									color: 'white',
									border: 'none',
									borderRadius: '6px',
									padding: '6px 12px',
									cursor: 'pointer',
									fontSize: '14px'
								}}
							>
								Edit
							</button>
						) : (
							<>
								<button 
									onClick={handleSave}
									style={{
										background: '#10b981',
										color: 'white',
										border: 'none',
										borderRadius: '6px',
										padding: '6px 12px',
										cursor: 'pointer',
										fontSize: '14px'
									}}
								>
									Save
								</button>
								<button 
									onClick={handleCancel}
									style={{
										background: '#6b7280',
										color: 'white',
										border: 'none',
										borderRadius: '6px',
										padding: '6px 12px',
										cursor: 'pointer',
										fontSize: '14px'
									}}
								>
									Cancel
								</button>
							</>
						)}
						<button className="close-btn" onClick={onClose}>×</button>
					</div>
				</div>

				<div className="modal-body">
					<div className="farmer-details-container">
						<div className="detail-section">
							<h3>Personal Information</h3>
							<div className="detail-grid">
								<div className="detail-item">
									<label>First Name:</label>
									{renderField('First Name', 'firstName')}
								</div>
								<div className="detail-item">
									<label>Last Name:</label>
									{renderField('Last Name', 'lastName')}
								</div>
								<div className="detail-item">
									<label>Email:</label>
									{renderField('Email', 'email')}
								</div>
								<div className="detail-item">
									<label>Phone:</label>
									{renderField('Phone', 'phone')}
								</div>
								<div className="detail-item">
									<label>Date of Birth:</label>
									{renderField('Date of Birth', 'dateOfBirth', 'date')}
								</div>
								<div className="detail-item">
									<label>Gender:</label>
									{renderField('Gender', 'gender', 'select', [
										{ value: '', label: 'Select Gender' },
										{ value: 'Male', label: 'Male' },
										{ value: 'Female', label: 'Female' },
										{ value: 'Other', label: 'Other' }
									])}
								</div>
							</div>
						</div>

						<div className="detail-section">
							<h3>Employment</h3>
							<div className="detail-grid">
								<div className="detail-item">
									<label>Role:</label>
									{renderField('Role', 'role', 'select', [
										{ value: '', label: 'Select Role' },
										{ value: 'employee', label: 'Employee' },
										{ value: 'admin', label: 'Admin' },
										{ value: 'super_admin', label: 'Super Admin' }
									])}
								</div>
								<div className="detail-item">
									<label>Designation:</label>
									{renderField('Designation', 'designation')}
								</div>
								<div className="detail-item">
									<label>Status:</label>
									{renderField('Status', 'status', 'select', [
										{ value: 'ACTIVE', label: 'Active' },
										{ value: 'INACTIVE', label: 'Inactive' },
										{ value: 'PENDING', label: 'Pending' }
									])}
								</div>
							</div>
						</div>

						<div className="detail-section">
							<h3>Address</h3>
							<div className="detail-grid">
								<div className="detail-item">
									<label>City:</label>
									{renderField('City', 'city')}
								</div>
								<div className="detail-item">
									<label>State:</label>
									{renderField('State', 'state')}
								</div>
								<div className="detail-item">
									<label>Pincode:</label>
									{renderField('Pincode', 'pincode')}
								</div>
								<div className="detail-item full-width">
									<label>Complete Address:</label>
									{renderField('Address', 'address', 'textarea')}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ViewEmployeeDetails;


