// src/hooks/useAdminPanel.js
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import adminService from '../api/adminService';

export const useAdminPanel = () => {
  const { t } = useTranslation();
  
  // Основні стани
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Фільтри
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Експорт/Імпорт
  const [exportTable, setExportTable] = useState('');
  const [importTable, setImportTable] = useState('');
  const [importFile, setImportFile] = useState(null);
  
  // Модальні вікна
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusModalData, setStatusModalData] = useState(null);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  
  // Доступні таблиці
  const availableTables = [
    { value: 'users', label: t('admin.tables.users') },
    { value: 'assignments', label: t('admin.tables.assignments') },
    { value: 'learningmaterials', label: t('admin.tables.learningmaterials') },
    { value: 'iotsessions', label: t('admin.tables.iotsessions') }
  ];

  // Завантаження користувачів
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsers();
      setUsers(response.data || response);
    } catch (error) {
      showMessage('error', t('admin.messages.usersLoadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Фільтрація користувачів
  const filterUsers = useCallback(() => {
    let filtered = [...users];
    
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role !== 'Admin');
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.profileStatus === statusFilter);
    }
    
    setFilteredUsers(filtered);
  }, [users, roleFilter, statusFilter]);

  // Показ повідомлення
  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  }, []);

  // Зміна статусу користувача
  const handleStatusChange = useCallback((user) => {
    const newStatus = user.profileStatus === 'Active' ? 'Inactive' : 'Active';
    setStatusModalData({ user, newStatus });
    setShowStatusModal(true);
  }, []);

  const confirmStatusChange = useCallback(async () => {
    try {
      const { user, newStatus } = statusModalData;
      await adminService.changeUserStatus(user.userId, newStatus);
      showMessage('success', t('admin.messages.statusChangeSuccess'));
      loadUsers();
    } catch (error) {
      showMessage('error', t('admin.messages.statusChangeError'));
    } finally {
      setShowStatusModal(false);
      setStatusModalData(null);
    }
  }, [statusModalData, showMessage, loadUsers, t]);

  // Експорт даних
  const handleExport = useCallback(async () => {
    if (!exportTable) {
      showMessage('error', t('admin.messages.selectTableError'));
      return;
    }

    try {
      setLoading(true);
      const response = await adminService.exportData([exportTable]);
      showMessage('success', t('admin.messages.exportSuccess'));
    } catch (error) {
      showMessage('error', t('admin.messages.exportError'));
    } finally {
      setLoading(false);
    }
  }, [exportTable, showMessage, t]);

  // Імпорт даних
  const handleImport = useCallback(async () => {
    if (!importTable || !importFile) {
      showMessage('error', t('admin.messages.importValidationError'));
      return;
    }

    try {
      setLoading(true);
      await adminService.importData(importTable, importFile);
      showMessage('success', t('admin.messages.importSuccess'));
      setImportTable('');
      setImportFile(null);
      if (importTable === 'users') {
        loadUsers();
      }
    } catch (error) {
      showMessage('error', t('admin.messages.importError'));
    } finally {
      setLoading(false);
    }
  }, [importTable, importFile, showMessage, loadUsers, t]);

  // Резервне копіювання
  const handleBackup = useCallback(async () => {
    try {
      setLoading(true);
      await adminService.backupDatabase();
      showMessage('success', t('admin.messages.backupSuccess'));
    } catch (error) {
      showMessage('error', t('admin.messages.backupError'));
    } finally {
      setLoading(false);
      setShowBackupModal(false);
    }
  }, [showMessage, t]);

  // Відновлення бази даних
  const handleRestore = useCallback(async () => {
    try {
      setLoading(true);
      await adminService.restoreDatabase();
      showMessage('success', t('admin.messages.restoreSuccess'));
    } catch (error) {
      showMessage('error', t('admin.messages.restoreError'));
    } finally {
      setLoading(false);
      setShowRestoreModal(false);
    }
  }, [showMessage, t]);

  // Модальні вікна
  const closeStatusModal = useCallback(() => {
    setShowStatusModal(false);
    setStatusModalData(null);
  }, []);

  const openBackupModal = useCallback(() => {
    setShowBackupModal(true);
  }, []);

  const closeBackupModal = useCallback(() => {
    setShowBackupModal(false);
  }, []);

  const openRestoreModal = useCallback(() => {
    setShowRestoreModal(true);
  }, []);

  const closeRestoreModal = useCallback(() => {
    setShowRestoreModal(false);
  }, []);

  // Ініціалізація
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Фільтрація при зміні фільтрів
  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  return {
    // Стани
    loading,
    message,
    
    // Користувачі
    users,
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
    loadUsers,
    
    // Модальні дії
    closeStatusModal,
    openBackupModal,
    closeBackupModal,
    openRestoreModal,
    closeRestoreModal
  };
};