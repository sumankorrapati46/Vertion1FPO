import React, { useMemo, useState, useRef, useEffect } from 'react';
import '../styles/Dashboard.css';
import '../styles/Configurations.css';

const SectionHeader = ({ title, subtitle }) => (
  <div className="section-header">
    <h2 className="section-title">{title}</h2>
    {subtitle && <p className="section-subtitle">{subtitle}</p>}
  </div>
);

const InlineNote = ({ children }) => (
  <div className="inline-note">{children}</div>
);

const Divider = () => <div style={{ height: 16 }} />;

export default function Configurations({ role }) {
  const [activeTab, setActiveTab] = useState('users');
  const [modal, setModal] = useState(null); // { type, scope }
  const inlinePanelRef = useRef(null);
  const [usersView, setUsersView] = useState('list'); // 'list' | 'form'
  const [usersFormType, setUsersFormType] = useState('update'); // 'create' | 'update' | 'delete'
  const [templatesView, setTemplatesView] = useState('list'); // 'list' | 'form'
  const [templatesFormType, setTemplatesFormType] = useState('create'); // 'create' | 'update' | 'delete'

  const permissions = useMemo(() => {
    const normalized = (role || '').toUpperCase();
    const isSuperAdmin = normalized === 'SUPER_ADMIN';
    const isAdmin = normalized === 'ADMIN';
    return {
      isSuperAdmin,
      isAdmin,
      canCreate: isSuperAdmin || isAdmin,
      canUpdate: isSuperAdmin || isAdmin,
      canDelete: isSuperAdmin,
      settings: {
        canCreate: isSuperAdmin || isAdmin,
        canUpdate: isSuperAdmin || isAdmin,
        canDelete: isSuperAdmin
      },
      templates: {
        canCreate: isSuperAdmin || isAdmin,
        canUpdate: isSuperAdmin || isAdmin,
        canDelete: isSuperAdmin
      }
    };
  }, [role]);

  const openModal = (type, scope) => setModal({ type, scope });
  const closeModal = () => setModal(null);

  useEffect(() => {
    const isInline = String(modal?.type || '').includes('inline');
    if (isInline && inlinePanelRef.current) {
      try { inlinePanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch {}
    }
  }, [modal]);

  useEffect(() => {
    if (usersView === 'form' && inlinePanelRef.current) {
      try { inlinePanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch {}
    }
  }, [usersView]);

  useEffect(() => {
    if (templatesView === 'form' && inlinePanelRef.current) {
      try { inlinePanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch {}
    }
  }, [templatesView]);

  return (
    <div className="configurations-wrapper">
      <div className="config-rail">
        <div className="rail-title">Configurations</div>
        <div className="rail-subtitle">Manage global settings for DATE</div>
        <div className="rail-sep"></div>
        <div className="rail-list">
          <div className={`rail-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <i className="fas fa-users-cog"></i>
            <span>Users & Roles</span>
          </div>
          <div className={`rail-item ${activeTab === 'personalization' ? 'active' : ''}`} onClick={() => setActiveTab('personalization')}>
            <i className="fas fa-barcode"></i>
            <span>Personalization</span>
          </div>
          <div className={`rail-item ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => setActiveTab('templates')}>
            <i className="fas fa-envelope"></i>
            <span>Templates</span>
          </div>
          <div className={`rail-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <i className="fas fa-cog"></i>
            <span>Settings</span>
          </div>
          <div className={`rail-item ${activeTab === 'preferences' ? 'active' : ''}`} onClick={() => setActiveTab('preferences')}>
            <i className="fas fa-bell"></i>
            <span>Preferences</span>
          </div>
        </div>
      </div>

      <div className="config-content">
        <div className="config-header">
          <div className="config-title">
            {activeTab === 'users' && 'Users & Roles'}
            {activeTab === 'personalization' && 'Personalization'}
            {activeTab === 'templates' && 'Templates'}
            {activeTab === 'settings' && 'Settings'}
            {activeTab === 'preferences' && 'Preferences'}
          </div>
          <div className="config-subtitle">
            {activeTab === 'templates' && 'Mail & SMS with placeholders like {name} and {otp}'}
            {activeTab !== 'templates' && 'Configure system behaviour'}
          </div>
        </div>

        {activeTab === 'users' && usersView === 'list' && (
          <div>
            <SectionHeader title="Users & Roles" />
            <InlineNote>
              SuperAdmin can create/edit/delete roles and define module CRUD access. Admin can create/edit roles only.
            </InlineNote>
            <Divider />

            <div className="config-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Role Name</label>
                  <input className="form-control" placeholder="e.g. DataAuditor" />
                </div>
                <div className="form-group">
                  <label>Modules</label>
                  <select className="form-control" multiple>
                    <option>Employee</option>
                    <option>Farmer</option>
                    <option>FPO</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Access</label>
                  <div className="checkbox-row">
                    <label><input type="checkbox" defaultChecked /> Create</label>
                    <label><input type="checkbox" defaultChecked /> Read</label>
                    <label><input type="checkbox" defaultChecked /> Update</label>
                    <label><input type="checkbox" defaultChecked disabled={!permissions.canDelete} /> Delete</label>
                  </div>
                </div>
              </div>

              <div className="button-row">
                <button className="btn btn-primary" disabled={!permissions.canCreate} onClick={() => { setUsersFormType('create'); setUsersView('form'); }}>Open Panel</button>
                <button className="btn btn-secondary" disabled={!permissions.canUpdate} onClick={() => { setUsersFormType('update'); setUsersView('form'); }}>Update Role</button>
                <button className="btn btn-danger" disabled={!permissions.canDelete} onClick={() => { setUsersFormType('delete'); setUsersView('form'); }}>Delete Role</button>
              </div>

              <Divider />
              <SectionHeader title="User Management" subtitle="Add new users or map employees to roles" />
              <div className="form-row">
                <div className="form-group">
                  <label>User/Employee</label>
                  <input className="form-control" placeholder="Search by name or code" />
                </div>
                <div className="form-group">
                  <label>Assign Role</label>
                  <select className="form-control">
                    <option>Admin</option>
                    <option>Employee</option>
                  </select>
                </div>
              </div>
              <div className="button-row">
                <button className="btn btn-primary" disabled={!permissions.canUpdate} onClick={() => openModal('update', 'roles')}>Map Role</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && usersView === 'form' && (
          <div ref={inlinePanelRef}>
            <div className="inline-panel">
              <div className="inline-panel-head">
                <div className="inline-panel-title">
                  {usersFormType === 'create' && 'Create Role'}
                  {usersFormType === 'update' && 'Update Role'}
                  {usersFormType === 'delete' && 'Delete Role'}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary" onClick={() => setUsersView('list')}>Back</button>
                </div>
              </div>
              <div className="inline-panel-body">
                <div className="config-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Sample Field</label>
                      <input className="form-control" placeholder="Enter value" />
                    </div>
                    <div className="form-group">
                      <label>Sample Field 2</label>
                      <input className="form-control" placeholder="Enter value" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="inline-panel-actions">
                {usersFormType !== 'delete' && <button className="btn btn-primary" onClick={() => setUsersView('list')}>Save</button>}
                {usersFormType === 'delete' && <button className="btn btn-danger" onClick={() => setUsersView('list')}>Confirm Delete</button>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'personalization' && (
          <div>
            <SectionHeader title="Personalization" subtitle="Global code formats" />
            <InlineNote>Changes apply globally and auto-increment for new records.</InlineNote>
            <Divider />
            <div className="config-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Farmer Code Prefix</label>
                  <input className="form-control" placeholder="e.g. FARM" />
                </div>
                <div className="form-group">
                  <label>Farmer Starting Number</label>
                  <input className="form-control" placeholder="e.g. 1000" type="number" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Employee Code Prefix</label>
                  <input className="form-control" placeholder="e.g. EMP" />
                </div>
                <div className="form-group">
                  <label>Employee Starting Number</label>
                  <input className="form-control" placeholder="e.g. 500" type="number" />
                </div>
              </div>
              <div className="button-row">
                <button className="btn btn-primary" disabled={!permissions.canUpdate} onClick={() => openModal('update', 'personalization')}>Save Formats</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'templates' && templatesView === 'list' && (
          <div>
            <SectionHeader title="Templates" subtitle="Mail & SMS with placeholders like {name} and {otp}" />
            <Divider />
            <div className="config-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Module</label>
                  <select className="form-control">
                    <option>Farmer</option>
                    <option>Employee</option>
                    <option>FPO</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Template Type</label>
                  <select className="form-control">
                    <option>Email</option>
                    <option>SMS</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input className="form-control" placeholder="Subject (Email only)" />
              </div>
              <div className="form-group">
                <label>Body</label>
                <textarea className="form-control" rows={6} placeholder="Hello {name}, your OTP is {otp}" />
              </div>
              <div className="button-row">
                <button className="btn btn-primary" disabled={!permissions.templates.canCreate} onClick={() => { setTemplatesFormType('create'); setTemplatesView('form'); }}>Create</button>
                <button className="btn btn-secondary" disabled={!permissions.templates.canUpdate} onClick={() => { setTemplatesFormType('update'); setTemplatesView('form'); }}>Update</button>
                <button className="btn btn-danger" disabled={!permissions.templates.canDelete} onClick={() => { setTemplatesFormType('delete'); setTemplatesView('form'); }}>Delete</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'templates' && templatesView === 'form' && (
          <div ref={inlinePanelRef}>
            <div className="inline-panel">
              <div className="inline-panel-head">
                <div className="inline-panel-title">
                  {templatesFormType === 'create' && 'Create Template'}
                  {templatesFormType === 'update' && 'Update Template'}
                  {templatesFormType === 'delete' && 'Delete Template'}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary" onClick={() => setTemplatesView('list')}>Back</button>
                </div>
              </div>
              <div className="inline-panel-body">
                <div className="config-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Module</label>
                      <select className="form-control">
                        <option>Farmer</option>
                        <option>Employee</option>
                        <option>FPO</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Template Type</label>
                      <select className="form-control">
                        <option>Email</option>
                        <option>SMS</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Subject</label>
                    <input className="form-control" placeholder="Subject (Email only)" />
                  </div>
                  <div className="form-group">
                    <label>Body</label>
                    <textarea className="form-control" rows={8} placeholder="Hello {name}, your OTP is {otp}" />
                  </div>
                </div>
              </div>
              <div className="inline-panel-actions">
                {templatesFormType !== 'delete' && <button className="btn btn-primary" onClick={() => setTemplatesView('list')}>Save</button>}
                {templatesFormType === 'delete' && <button className="btn btn-danger" onClick={() => setTemplatesView('list')}>Confirm Delete</button>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <SectionHeader title="Settings" subtitle="Location, Global Area, Crop" />
            <Divider />
            <div className="config-form">
              <SectionHeader title="Location Hierarchy" />
              <div className="form-row">
                <div className="form-group"><label>Country</label><input className="form-control" placeholder="India" /></div>
                <div className="form-group"><label>State</label><input className="form-control" placeholder="Karnataka" /></div>
                <div className="form-group"><label>District</label><input className="form-control" placeholder="Bengaluru" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Block</label><input className="form-control" placeholder="Block" /></div>
                <div className="form-group"><label>Village</label><input className="form-control" placeholder="Village" /></div>
                <div className="form-group"><label>Zipcode</label><input className="form-control" placeholder="560001" /></div>
              </div>
              <div className="button-row">
                <button className="btn btn-primary" disabled={!permissions.settings.canCreate} onClick={() => openModal('create', 'settings')}>Add</button>
                <button className="btn btn-secondary" disabled={!permissions.settings.canUpdate} onClick={() => openModal('update', 'settings')}>Update</button>
                <button className="btn btn-danger" disabled={!permissions.settings.canDelete} onClick={() => openModal('delete', 'settings')}>Delete</button>
              </div>

              <Divider />
              <SectionHeader title="Global Area" />
              <div className="form-row">
                <div className="form-group"><label>Age Range</label><input className="form-control" placeholder="18-60" /></div>
                <div className="form-group"><label>Education Types</label><input className="form-control" placeholder="Primary, Secondary, Graduate" /></div>
              </div>
              <div className="form-group"><label>Education → Type mapping</label><input className="form-control" placeholder="Graduate -> BSc, BA, BCom" /></div>
              <div className="button-row">
                <button className="btn btn-primary" disabled={!permissions.settings.canUpdate} onClick={() => openModal('update', 'settings')}>Save Global Area</button>
              </div>

              <Divider />
              <SectionHeader title="Crop Settings" />
              <div className="form-row">
                <div className="form-group"><label>Crop</label><input className="form-control" placeholder="e.g. Paddy" /></div>
                <div className="form-group"><label>Feature</label><input className="form-control" placeholder="Rainfed / Irrigated" /></div>
                <div className="form-group"><label>Variety</label><input className="form-control" placeholder="IR64" /></div>
              </div>
              <div className="form-group">
                <label>Bulk Upload (CSV)</label>
                <input className="form-control" type="file" accept=".csv" />
              </div>
              <div className="button-row">
                <button className="btn btn-primary" disabled={!permissions.settings.canCreate} onClick={() => openModal('create', 'settings')}>Add Crop</button>
                <button className="btn btn-secondary" disabled={!permissions.settings.canUpdate} onClick={() => openModal('update', 'settings')}>Update Crop</button>
                <button className="btn btn-danger" disabled={!permissions.settings.canDelete} onClick={() => openModal('delete', 'settings')}>Delete Crop</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div>
            <SectionHeader title="Preferences" subtitle="System-wide notification toggles" />
            <Divider />
            <div className="config-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Email Notifications</label>
                  <select className="form-control">
                    <option>ON</option>
                    <option>OFF</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>SMS Notifications</label>
                  <select className="form-control">
                    <option>ON</option>
                    <option>OFF</option>
                  </select>
                </div>
              </div>
              <div className="button-row">
                <button className="btn btn-primary" disabled={!permissions.canUpdate} onClick={() => openModal('update', 'prefs')}>Save Preferences</button>
              </div>
            </div>
          </div>
        )}

        {!!modal && !String(modal?.type || '').includes('inline') && (
          <div className="modal-backdrop" onClick={closeModal}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <div className="modal-title">
                  {modal.type === 'create' && 'Create'}{modal.type === 'update' && 'Update'}{modal.type === 'delete' && 'Delete'}{' '}
                  {modal.scope === 'roles' && 'Role'}{modal.scope === 'templates' && 'Template'}{modal.scope === 'settings' && 'Setting'}{modal.scope === 'prefs' && 'Preferences'}{modal.scope === 'personalization' && 'Formats'}
                </div>
                <button className="btn btn-secondary" onClick={closeModal}>Close</button>
              </div>
              <div className="modal-body">
                <div className="config-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Sample Field</label>
                      <input className="form-control" placeholder="Enter value" />
                    </div>
                    <div className="form-group">
                      <label>Sample Field 2</label>
                      <input className="form-control" placeholder="Enter value" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                {modal.type !== 'delete' && <button className="btn btn-primary" onClick={closeModal}>Save</button>}
                {modal.type === 'delete' && <button className="btn btn-danger" onClick={closeModal}>Confirm Delete</button>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


