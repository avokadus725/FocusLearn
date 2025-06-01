// src/components/admin/AdminPanel.js
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAdminPanel } from '../../hooks/useAdminPanel';
import ConfirmationModal from '../common/ConfirmationModal';
import { getProxiedImageUrl, generateInitialsAvatar, isValidImageUrl } from '../../utils/imageConverter';
import './AdminPanel.css';

const AdminPanel = () => {
  const { t } = useTranslation();
  
  const {
    // Стани
    loading,
    message,
    
    // Користувачі
    filteredUsers,
    
    // Фільтри
    roleFilter,
    statusFilter,
    setRoleFilter,
    setStatusFilter,
    
    // Експорт/Імпорт
    exportTable,
    setExportTable,
    importTable,
    setImportTable,
    importFile,
    setImportFile,
    availableTables,
    
    // Модальні вікна
    showStatusModal,
    statusModalData,
    showBackupModal,
    showRestoreModal,
    
    // Дії
    handleStatusChange,
    confirmStatusChange,
    handleExport,
    handleImport,
    handleBackup,
    handleRestore,
    
    // Модальні дії
    closeStatusModal,
    openBackupModal,
    closeBackupModal,
    openRestoreModal,
    closeRestoreModal
  } = useAdminPanel();

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1 className="admin-title">
          {t('admin.title')}
        </h1>
        <p className="admin-subtitle">{t('admin.subtitle')}</p>
      </div>

      {/* Messages */}
      {message.text && (
        <div className={`admin-alert admin-alert-${message.type}`}>
          <FontAwesomeIcon icon={message.type === 'success' ? 'check-circle' : 'exclamation-triangle'} />
          {message.text}
        </div>
      )}

      <div className="admin-sections">
        
        {/* Users Management Section */}
        <section className="admin-section">
          <div className="admin-section-header">
            <h2 className="admin-section-title">
              {t('admin.sections.userManagement')}
            </h2>
            <p className="admin-section-subtitle">{t('admin.sections.userManagementDesc')}</p>
          </div>

          <div className="admin-section-content">
            {/* Filters */}
            <div className="admin-filters">
              <div className="filter-group">
                <label className="filter-label">{t('admin.filters.role')}</label>
                <select 
                  className="filter-select"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">{t('admin.filters.allRoles')}</option>
                  <option value="User">{t('profile.roles.Student')}</option>
                  <option value="Tutor">{t('profile.roles.Tutor')}</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label className="filter-label">{t('admin.filters.status')}</label>
                <select 
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">{t('admin.filters.allStatuses')}</option>
                  <option value="Active">{t('admin.statuses.Active')}</option>
                  <option value="Inactive">{t('admin.statuses.Inactive')}</option>
                </select>
              </div>
            </div>

            {/* Users List */}
            <div className="users-list">
              {loading ? (
                <div className="admin-loading">
                  <div className="admin-loading-spinner"></div>
                  <p>{t('common.loading')}</p>
                </div>
              ) : (
                <div className="users-grid">
                  {filteredUsers.map(user => (
                    <div key={user.userId} className="user-card">
                      <div className="user-avatar">
                        {isValidImageUrl(user.profilePhoto) ? (
                          <img 
                            src={getProxiedImageUrl(user.profilePhoto)} 
                            alt={user.userName} 
                          />
                        ) : (
                          <div className="avatar-placeholder">
                            {generateInitialsAvatar(user.userName, user.email)}
                          </div>
                        )}
                      </div>
                      
                      <div className="user-info">
                        <h3 className="user-name">{user.userName || user.email}</h3>
                        <p className="user-email">{user.email}</p>
                        <div className="user-meta">
                          <span className={`user-role role-${user.role.toLowerCase()}`}>
                            {t(`profile.roles.${user.role}`)}
                          </span>
                          <span className={`user-status status-${user.profileStatus.toLowerCase()}`}>
                            {t(`admin.statuses.${user.profileStatus}`)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="user-actions">
                        <button
                          className={`status-btn status-btn-${user.profileStatus.toLowerCase()}`}
                          onClick={() => handleStatusChange(user)}
                          title={t('admin.actions.changeStatus')}
                        >
                          {user.profileStatus === 'Active' ? t('admin.actions.deactivate') : t('admin.actions.activate')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Data Management Section */}
        <section className="admin-section">
          <div className="admin-section-header">
            <h2 className="admin-section-title">
              <FontAwesomeIcon icon="database" />
              {t('admin.sections.dataManagement')}
            </h2>
            <p className="admin-section-subtitle">{t('admin.sections.dataManagementDesc')}</p>
          </div>

          <div className="admin-section-content">
            <div className="data-management-grid">
              
              {/* Export Data */}
              <div className="data-card">
                <div className="data-card-header">
                  <FontAwesomeIcon icon="download" />
                  <h3>{t('admin.dataManagement.exportData')}</h3>
                </div>
                <div className="data-card-content">
                  <p>{t('admin.dataManagement.exportDesc')}</p>
                  <div className="export-form">
                    <select
                      className="admin-select"
                      value={exportTable}
                      onChange={(e) => setExportTable(e.target.value)}
                    >
                      <option value="">{t('admin.dataManagement.selectTable')}</option>
                      {availableTables.map(table => (
                        <option key={table.value} value={table.value}>
                          {table.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    className="admin-btn admin-btn-primary"
                    onClick={handleExport}
                    disabled={loading || !exportTable}
                  >
                    <FontAwesomeIcon icon="download" />
                    {t('admin.actions.export')}
                  </button>
                </div>
              </div>

              {/* Import Data */}
              <div className="data-card">
                <div className="data-card-header">
                  <FontAwesomeIcon icon="upload" />
                  <h3>{t('admin.dataManagement.importData')}</h3>
                </div>
                <div className="data-card-content">
                  <p>{t('admin.dataManagement.importDesc')}</p>
                  <div className="import-form">
                    <select
                      className="admin-select"
                      value={importTable}
                      onChange={(e) => setImportTable(e.target.value)}
                    >
                      <option value="">{t('admin.dataManagement.selectTable')}</option>
                      {availableTables.map(table => (
                        <option key={table.value} value={table.value}>
                          {table.label}
                        </option>
                      ))}
                    </select>
                    
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => setImportFile(e.target.files[0])}
                      className="admin-file-input"
                    />
                  </div>
                  <button
                    className="admin-btn admin-btn-primary"
                    onClick={handleImport}
                    disabled={loading || !importTable || !importFile}
                  >
                    <FontAwesomeIcon icon="upload" />
                    {t('admin.actions.import')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Database Management Section */}
        <section className="admin-section">
          <div className="admin-section-header">
            <h2 className="admin-section-title">
              <FontAwesomeIcon icon="server" />
              {t('admin.sections.databaseManagement')}
            </h2>
            <p className="admin-section-subtitle">{t('admin.sections.databaseManagementDesc')}</p>
          </div>

          <div className="admin-section-content">
            <div className="database-actions">
              <div className="database-card">
                <div className="database-card-header">
                  <FontAwesomeIcon icon="save" />
                  <h3>{t('admin.database.backup')}</h3>
                </div>
                <div className="database-card-content">
                  <p>{t('admin.database.backupDesc')}</p>
                  <button
                    className="admin-btn admin-btn-success"
                    onClick={openBackupModal}
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon="save" />
                    {t('admin.actions.createBackup')}
                  </button>
                </div>
              </div>

              <div className="database-card">
                <div className="database-card-header">
                  <FontAwesomeIcon icon="undo" />
                  <h3>{t('admin.database.restore')}</h3>
                </div>
                <div className="database-card-content">
                  <p>{t('admin.database.restoreDesc')}</p>
                  <button
                    className="admin-btn admin-btn-warning"
                    onClick={openRestoreModal}
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon="undo" />
                    {t('admin.actions.restoreDatabase')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Modals */}
      <ConfirmationModal
        isOpen={showStatusModal}
        onClose={closeStatusModal}
        onConfirm={confirmStatusChange}
        title={t('admin.modals.changeStatus.title')}
        message={t('admin.modals.changeStatus.message', { 
          user: statusModalData?.user?.userName || statusModalData?.user?.email,
          status: statusModalData?.newStatus 
        })}
        confirmText={t('admin.actions.confirm')}
        confirmVariant="warning"
        icon="user-edit"
        isLoading={loading}
      />

      <ConfirmationModal
        isOpen={showBackupModal}
        onClose={closeBackupModal}
        onConfirm={handleBackup}
        title={t('admin.modals.backup.title')}
        message={t('admin.modals.backup.message')}
        confirmText={t('admin.actions.createBackup')}
        confirmVariant="success"
        icon="save"
        isLoading={loading}
      />

      <ConfirmationModal
        isOpen={showRestoreModal}
        onClose={closeRestoreModal}
        onConfirm={handleRestore}
        title={t('admin.modals.restore.title')}
        message={t('admin.modals.restore.message')}
        confirmText={t('admin.actions.restoreDatabase')}
        confirmVariant="danger"
        icon="exclamation-triangle"
        isLoading={loading}
      />
    </div>
  );
};

export default AdminPanel;