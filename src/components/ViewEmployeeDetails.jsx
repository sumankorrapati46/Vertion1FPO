import React, { useEffect } from 'react';
import '../styles/ViewFarmerDetails.css';

const ViewEmployeeDetails = ({ employeeData, onClose }) => {
	// ESC to close
	useEffect(() => {
		const onKeyDown = (e) => e.key === 'Escape' && onClose?.();
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [onClose]);

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

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content view-farmer-modal" onClick={(e) => e.stopPropagation()}>
				<div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
					<button className="back-btn" onClick={onClose} style={{
						background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', color: '#111827'
					}}>← Back</button>
					<h2 style={{ margin: 0, flex: 1, textAlign: 'center' }}>Employee Details</h2>
					<button className="close-btn" onClick={onClose}>×</button>
				</div>

				<div className="modal-body">
					<div className="farmer-details-container">
						<div className="detail-section">
							<h3>Personal Information</h3>
							<div className="detail-grid">
								<div className="detail-item"><label>First Name:</label><span>{safe(normalized.firstName)}</span></div>
								<div className="detail-item"><label>Last Name:</label><span>{safe(normalized.lastName)}</span></div>
								<div className="detail-item"><label>Email:</label><span>{safe(normalized.email, 'Not available')}</span></div>
								<div className="detail-item"><label>Phone:</label><span>{safe(normalized.phone)}</span></div>
								<div className="detail-item"><label>Date of Birth:</label><span>{formatDate(normalized.dateOfBirth)}</span></div>
								<div className="detail-item"><label>Gender:</label><span>{safe(normalized.gender)}</span></div>
							</div>
						</div>

						<div className="detail-section">
							<h3>Employment</h3>
							<div className="detail-grid">
								<div className="detail-item"><label>Role:</label><span>{safe(normalized.role)}</span></div>
								<div className="detail-item"><label>Designation:</label><span>{safe(normalized.designation)}</span></div>
								<div className="detail-item"><label>Status:</label><span>{safe(normalized.status, 'ACTIVE')}</span></div>
							</div>
						</div>

						<div className="detail-section">
							<h3>Address</h3>
							<div className="detail-grid">
								<div className="detail-item"><label>City:</label><span>{safe(normalized.city)}</span></div>
								<div className="detail-item"><label>State:</label><span>{safe(normalized.state)}</span></div>
								<div className="detail-item"><label>Pincode:</label><span>{safe(normalized.pincode)}</span></div>
								<div className="detail-item full-width"><label>Complete Address:</label><span>{[normalized.city, normalized.state, normalized.pincode].map((v)=>safe(v)).filter(v=>v!=='Not provided').join(', ')}</span></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ViewEmployeeDetails;


