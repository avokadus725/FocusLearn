// src/hooks/useAssignments.js
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import assignmentService from '../api/assignmentService';

export const useAssignments = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Основні стани
  const [allAssignments, setAllAssignments] = useState([]);
  const [myAssignments, setMyAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Стани вкладок
  const [activeTab, setActiveTab] = useState('available');
  const [activeSubTab, setActiveSubTab] = useState('inProgress');

  // Стани модальних вікон
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Завантаження завдань
  const loadAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (user?.role === 'Admin') {
        const [adminData, myData] = await Promise.all([
          assignmentService.getAllAssignmentsForAdmin(),
          assignmentService.getMyAssignments()
        ]);

        setAllAssignments(adminData);
        setMyAssignments(adminData);
      } else {
        const [allData, myData] = await Promise.all([
          assignmentService.getAllAssignments(),
          assignmentService.getMyAssignments()
        ]);

        setAllAssignments(allData);
        setMyAssignments(myData);
      }
    } catch (err) {
      console.error('Error loading assignments:', err);
      setError(t('assignments.errors.loadError'));
    } finally {
      setLoading(false);
    }
  }, [user?.role, t]);

  // Показ повідомлення
  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 3000);
  }, []);

  // Ініціалізація активної вкладки на основі ролі
  useEffect(() => {
    if (user?.role === 'Student') {
      setActiveTab('available');
    } else if (user?.role === 'Tutor') {
      setActiveTab('my');
    } else if (user?.role === 'Admin') {
      setActiveTab('all');
    }
  }, [user]);

  // Завантаження при ініціалізації
  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  // Фільтрація завдань відповідно до активної вкладки
  const getFilteredAssignments = useCallback(() => {
    switch (activeTab) {
      case 'available':
        const availableAssignments = assignmentService.filterAssignments.availableAssignments(allAssignments);
        return availableAssignments;

      case 'my':
        if (user?.role === 'Student') {
          switch (activeSubTab) {
            case 'inProgress':
              return assignmentService.filterAssignments.myInProgress(myAssignments, user.userId);
            case 'pending':
              return assignmentService.filterAssignments.myPending(myAssignments, user.userId);
            case 'completed':
              return assignmentService.filterAssignments.myCompleted(myAssignments, user.userId);
            default:
              return [];
          }
        } else {
          if (user?.role === 'Admin') {
            return myAssignments;
          } else {
            return assignmentService.filterAssignments.tutorAssignments(allAssignments, user.userId);
          }
        }

      case 'pending':
        return assignmentService.filterAssignments.tutorPendingAssignments(myAssignments, user.userId);

      default:
        return [];
    }
  }, [activeTab, activeSubTab, allAssignments, myAssignments, user]);

  // Обробка дій з завданнями
  const handleAssignmentAction = useCallback(async (action, assignmentId, additionalData = {}) => {
    try {
      setMessage({ type: '', text: '' });

      switch (action) {
        case 'take':
          await assignmentService.takeAssignment(assignmentId);
          showMessage('success', t('assignments.messages.takeSuccess'));
          break;

        case 'submit':
          await assignmentService.submitAssignment(assignmentId, additionalData.fileLink);
          showMessage('success', t('assignments.messages.submitSuccess'));
          break;

        case 'complete':
          await assignmentService.completeAssignment(assignmentId);
          showMessage('success', t('assignments.messages.completeSuccess'));
          break;

        case 'grade':
          await assignmentService.gradeAssignment(assignmentId, additionalData.rating);
          showMessage('success', t('assignments.messages.gradeSuccess'));
          break;

        case 'delete':
          await assignmentService.deleteAssignment(assignmentId);
          showMessage('success', t('assignments.messages.deleteSuccess'));
          break;

        case 'update':
          await assignmentService.updateAssignment(assignmentId, additionalData);
          showMessage('success', t('assignments.messages.updateSuccess'));
          break;

        case 'details':
          const assignment = allAssignments.find(a => a.assignmentId === assignmentId) ||
                            myAssignments.find(a => a.assignmentId === assignmentId);
          setSelectedAssignment(assignment);
          setShowDetailsModal(true);
          return;

        default:
          throw new Error('Unknown action');
      }

      // Перезавантажуємо завдання після дії
      await loadAssignments();
    } catch (err) {
      console.error('Error performing assignment action:', err);
      showMessage('error', t('assignments.errors.actionError'));
    }
  }, [allAssignments, myAssignments, loadAssignments, showMessage, t]);

  // Створення нового завдання
  const handleCreateAssignment = useCallback(async (assignmentData) => {
    try {
      setMessage({ type: '', text: '' });
      
      await assignmentService.createAssignment(assignmentData);
      
      showMessage('success', t('assignments.messages.createSuccess'));
      setShowCreateModal(false);
      await loadAssignments();
    } catch (err) {
      console.error('Error creating assignment:', err);
      showMessage('error', t('assignments.errors.createError'));
    }
  }, [loadAssignments, showMessage, t]);

  // Модальні вікна
  const openCreateModal = useCallback(() => {
    if (user?.role !== 'Tutor' && user?.role !== 'Admin') {
      showMessage('error', t('assignments.errors.onlyTutorsCanCreate'));
      return;
    }
    setShowCreateModal(true);
  }, [user?.role, showMessage, t]);

  const closeCreateModal = useCallback(() => {
    setShowCreateModal(false);
  }, []);

  const closeDetailsModal = useCallback(() => {
    setShowDetailsModal(false);
    setSelectedAssignment(null);
  }, []);

  const handleModalAction = useCallback(async (action, additionalData = {}) => {
    await handleAssignmentAction(action, selectedAssignment.assignmentId, additionalData);
    closeDetailsModal();
  }, [handleAssignmentAction, selectedAssignment, closeDetailsModal]);

  // Конфігурація вкладок для поточного користувача
  const getTabsConfig = useCallback(() => {
    if (user?.role === 'Student') {
      return [
        { id: 'available', label: t('assignments.tabs.availableAssignments'), icon: 'search' },
        { id: 'my', label: t('assignments.tabs.myAssignments'), icon: 'tasks' }
      ];
    } else if (user?.role === 'Tutor') {
      return [
        { id: 'my', label: t('assignments.tabs.myAssignments'), icon: 'tasks' },
        { id: 'pending', label: t('assignments.tabs.pendingReview'), icon: 'clock' }
      ];
    } else if (user?.role === 'Admin') {
      return [
        { id: 'my', label: t('assignments.tabs.allAssignments', 'Усі завдання'), icon: 'list' }
      ];
    }
    return [];
  }, [user?.role, t]);

  // Обробка зміни вкладок
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  const handleSubTabChange = useCallback((subTabId) => {
    setActiveSubTab(subTabId);
  }, []);

  // Перезавантаження
  const retryLoading = useCallback(() => {
    loadAssignments();
  }, [loadAssignments]);

  return {
    // Стани
    loading,
    error,
    message,
    activeTab,
    activeSubTab,
    
    // Дані
    filteredAssignments: getFilteredAssignments(),
    allAssignments,
    myAssignments,
    
    // Модальні вікна
    selectedAssignment,
    showDetailsModal,
    showCreateModal,
    
    // Дії
    handleAssignmentAction,
    handleCreateAssignment,
    handleTabChange,
    handleSubTabChange,
    openCreateModal,
    closeCreateModal,
    closeDetailsModal,
    handleModalAction,
    retryLoading,
    
    // Конфігурація
    tabsConfig: getTabsConfig(),
    
    // Користувач
    user
  };
};