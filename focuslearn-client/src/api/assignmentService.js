import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://localhost:7124/api';

const assignmentService = {
  // Отримати всі завдання поточного користувача
  getMyAssignments: async () => {
    try {
      const response = await axios.get(`${API_URL}/Assignments/my-assignments`);
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error fetching my assignments:', error);
      throw error;
    }
  },

  // Отримати завдання за ID
  getAssignmentById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/Assignments/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching assignment:', error);
      throw error;
    }
  },

  // Створити нове завдання (тільки для репетиторів)
  createAssignment: async (assignmentData) => {
    try {
      const response = await axios.post(`${API_URL}/Assignments`, assignmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  },

  // Оновити завдання
  updateAssignment: async (id, assignmentData) => {
    try {
      const response = await axios.put(`${API_URL}/Assignments/${id}`, assignmentData);
      return response.data;
    } catch (error) {
      console.error('Error updating assignment:', error);
      throw error;
    }
  },

  // Видалити завдання
  deleteAssignment: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/Assignments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
  },

  // Виконати завдання (взяти в роботу)
  takeAssignment: async (assignmentId) => {
    try {
      console.log('Taking assignment with ID:', assignmentId);
      
      if (!assignmentId) {
        throw new Error('Assignment ID is required');
      }

      const response = await axios.post(`${API_URL}/Assignments/${assignmentId}/take`);
      return response.data;
    } catch (error) {
      console.error('Error taking assignment:', error);
      throw error;
    }
  },

  // Відправити файл на перевірку
  submitAssignment: async (assignmentId, fileLink) => {
    try {
      console.log('Submitting assignment with ID:', assignmentId, 'File:', fileLink);
      
      if (!assignmentId) {
        throw new Error('Assignment ID is required');
      }

      const response = await axios.post(`${API_URL}/Assignments/${assignmentId}/submit`, {
        fileLink: fileLink
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting assignment:', error);
      throw error;
    }
  },

  // Завершити завдання (повернути в доступні)
  completeAssignment: async (assignmentId) => {
    try {
      console.log('Completing assignment with ID:', assignmentId);
      
      if (!assignmentId) {
        throw new Error('Assignment ID is required');
      }

      const response = await axios.post(`${API_URL}/Assignments/${assignmentId}/complete`);
      return response.data;
    } catch (error) {
      console.error('Error completing assignment:', error);
      throw error;
    }
  },

  // Поставити оцінку (викладач)
  gradeAssignment: async (assignmentId, rating) => {
    try {
      console.log('Grading assignment with ID:', assignmentId, 'Rating:', rating);
      
      if (!assignmentId) {
        throw new Error('Assignment ID is required');
      }

      const response = await axios.post(`${API_URL}/Assignments/${assignmentId}/grade`, {
        rating: rating
      });
      return response.data;
    } catch (error) {
      console.error('Error grading assignment:', error);
      throw error;
    }
  },

  // Перевірити протерміновані завдання
  checkOverdueAssignments: async () => {
    try {
      // Отримуємо завдання і перевіряємо локально
      const assignments = await assignmentService.getMyAssignments();
      const now = new Date();
      
      const overdueAssignments = assignments.filter(assignment => {
        if (assignment.status !== 'InProgress' || !assignment.dueDate || !assignment.studentId) {
          return false;
        }
        
        const dueDate = new Date(assignment.dueDate);
        return now > dueDate;
      });

      // Автоматично завершуємо протерміновані завдання (повертаємо в доступні)
      for (const assignment of overdueAssignments) {
        if (assignment.assignmentId) {
          await assignmentService.completeAssignment(assignment.assignmentId);
        }
      }

      return overdueAssignments;
    } catch (error) {
      console.error('Error checking overdue assignments:', error);
      throw error;
    }
  },

  // Фільтрація завдань для різних вкладок
  filterAssignments: {
    // Доступні завдання (для всіх студентів)
    availableAssignments: (assignments) => {
      return assignments.filter(assignment => 
        assignment.studentId === null && 
        assignment.status === 'InProgress'
      );
    },

    // Мої завдання - До виконання (InProgress + мій studentId + файл ще не завантажений)
    myInProgress: (assignments, userId) => {
      return assignments.filter(assignment => 
        assignment.studentId === userId && 
        assignment.status === 'InProgress' &&
        (assignment.fileLink === null || assignment.fileLink === '')
      );
    },

    // Мої завдання - На перевірці (Pending + мій studentId + файл завантажений)
    myPending: (assignments, userId) => {
      return assignments.filter(assignment => 
        assignment.studentId === userId && 
        assignment.status === 'Pending' &&
        assignment.fileLink !== null && assignment.fileLink !== ''
      );
    },

    // Мої завдання - Перевірені (Completed + мій studentId + є оцінка)
    myCompleted: (assignments, userId) => {
      return assignments.filter(assignment => 
        assignment.studentId === userId && 
        assignment.status === 'Completed' &&
        assignment.rating !== null
      );
    },

    // Для викладачів - усі мої завдання
    tutorAssignments: (assignments, userId) => {
      return assignments.filter(assignment => 
        assignment.tutorId === userId
      );
    },

    // Для викладачів - на перевірці (Pending + мій tutorId)
    tutorPendingAssignments: (assignments, userId) => {
      return assignments.filter(assignment => 
        assignment.tutorId === userId && 
        assignment.status === 'Pending' &&
        assignment.studentId !== null
      );
    }
  }
};

export default assignmentService;