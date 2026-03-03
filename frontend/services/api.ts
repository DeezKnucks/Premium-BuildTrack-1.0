import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance } from 'axios';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: `${BACKEND_URL}/api`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests
    this.api.interceptors.request.use(async (config) => {
      if (!this.token) {
        this.token = await AsyncStorage.getItem('auth_token');
      }
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Handle errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await this.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  async setToken(token: string) {
    this.token = token;
    await AsyncStorage.setItem('auth_token', token);
  }

  async logout() {
    this.token = null;
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_data');
  }

  // Auth
  async register(email: string, password: string, full_name: string, role: string) {
    const response = await this.api.post('/auth/register', {
      email,
      password,
      full_name,
      role,
    });
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    if (response.data.access_token) {
      await this.setToken(response.data.access_token);
      await AsyncStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  // Projects
  async getProjects() {
    const response = await this.api.get('/projects');
    return response.data;
  }

  async getProject(projectId: string) {
    const response = await this.api.get(`/projects/${projectId}`);
    return response.data;
  }

  async createProject(data: any) {
    const response = await this.api.post('/projects', data);
    return response.data;
  }

  async updateProject(projectId: string, data: any) {
    const response = await this.api.put(`/projects/${projectId}`, data);
    return response.data;
  }

  async deleteProject(projectId: string) {
    const response = await this.api.delete(`/projects/${projectId}`);
    return response.data;
  }

  // Tasks
  async getTasks(projectId?: string) {
    const params = projectId ? { project_id: projectId } : {};
    const response = await this.api.get('/tasks', { params });
    return response.data;
  }

  async getTask(taskId: string) {
    const response = await this.api.get(`/tasks/${taskId}`);
    return response.data;
  }

  async createTask(data: any) {
    const response = await this.api.post('/tasks', data);
    return response.data;
  }

  async updateTask(taskId: string, data: any) {
    const response = await this.api.put(`/tasks/${taskId}`, data);
    return response.data;
  }

  async deleteTask(taskId: string) {
    const response = await this.api.delete(`/tasks/${taskId}`);
    return response.data;
  }

  // Media
  async getMedia(projectId?: string, taskId?: string) {
    const params: any = {};
    if (projectId) params.project_id = projectId;
    if (taskId) params.task_id = taskId;
    const response = await this.api.get('/media', { params });
    return response.data;
  }

  async uploadMedia(data: any) {
    const response = await this.api.post('/media', data);
    return response.data;
  }

  async deleteMedia(mediaId: string) {
    const response = await this.api.delete(`/media/${mediaId}`);
    return response.data;
  }

  // Budget
  async getBudget(projectId: string) {
    const response = await this.api.get(`/budgets/${projectId}`);
    return response.data;
  }

  async createOrUpdateBudget(projectId: string, data: any) {
    const response = await this.api.put(`/budgets/${projectId}`, data);
    return response.data;
  }

  // Vendors
  async getVendors(service?: string) {
    const params = service ? { service } : {};
    const response = await this.api.get('/vendors', { params });
    return response.data;
  }

  async createVendor(data: any) {
    const response = await this.api.post('/vendors', data);
    return response.data;
  }

  // Alerts
  async getAlerts(projectId?: string, unreadOnly?: boolean) {
    const params: any = {};
    if (projectId) params.project_id = projectId;
    if (unreadOnly) params.unread_only = true;
    const response = await this.api.get('/alerts', { params });
    return response.data;
  }

  async markAlertRead(alertId: string) {
    const response = await this.api.put(`/alerts/${alertId}/read`);
    return response.data;
  }

  // Chat
  async getChatRooms(projectId?: string) {
    const params = projectId ? { project_id: projectId } : {};
    const response = await this.api.get('/chat/rooms', { params });
    return response.data;
  }

  async createChatRoom(data: any) {
    const response = await this.api.post('/chat/rooms', data);
    return response.data;
  }

  async getMessages(roomId: string, limit = 100) {
    const response = await this.api.get(`/chat/messages/${roomId}`, {
      params: { limit },
    });
    return response.data;
  }

  async sendMessage(data: any) {
    const response = await this.api.post('/chat/messages', data);
    return response.data;
  }

  // AI Features
  async predictRisks(projectId: string) {
    const response = await this.api.post('/ai/risk-prediction', { project_id: projectId });
    return response.data;
  }

  async analyzeBudget(projectId: string) {
    const response = await this.api.post('/ai/budget-analysis', { project_id: projectId });
    return response.data;
  }

  async optimizeSchedule(projectId: string) {
    const response = await this.api.post('/ai/schedule-optimization', { project_id: projectId });
    return response.data;
  }

  async transcribeVoice(audioData: string) {
    const response = await this.api.post('/ai/transcribe', { audio_data: audioData });
    return response.data;
  }

  async checkCompliance(projectId: string) {
    const response = await this.api.post('/ai/compliance-check', { project_id: projectId });
    return response.data;
  }

  async scoutVendors(requirements: any) {
    const response = await this.api.post('/ai/vendor-scout', requirements);
    return response.data;
  }

  // Weather
  async getWeather(projectId: string) {
    const response = await this.api.get(`/weather/${projectId}`);
    return response.data;
  }

  // Dashboard
  async getDashboard() {
    const response = await this.api.get('/dashboard');
    return response.data;
  }

  // Reports
  async getBudgetReport(projectId: string) {
    const response = await this.api.get(`/reports/budget/${projectId}`);
    return response.data;
  }

  async getTimelineReport(projectId: string) {
    const response = await this.api.get(`/reports/timeline/${projectId}`);
    return response.data;
  }

  async getTeamReport(projectId: string) {
    const response = await this.api.get(`/reports/team/${projectId}`);
    return response.data;
  }

  async getMaterialsReport(projectId: string) {
    const response = await this.api.get(`/reports/materials/${projectId}`);
    return response.data;
  }

  async getSafetyReport(projectId: string) {
    const response = await this.api.get(`/reports/safety/${projectId}`);
    return response.data;
  }

  async getSustainabilityReport(projectId: string) {
    const response = await this.api.get(`/reports/sustainability/${projectId}`);
    return response.data;
  }

  // User Profile
  async getUserProfile() {
    const response = await this.api.get('/users/profile');
    return response.data;
  }

  async updateUserProfile(data: any) {
    const response = await this.api.put('/users/profile', data);
    return response.data;
  }

  // Chat - updated methods
  async getChatRooms(projectId?: string) {
    const response = await this.api.get('/chat/rooms', {
      params: projectId ? { project_id: projectId } : {},
    });
    return response.data;
  }

  async createChatRoom(data: any) {
    const response = await this.api.post('/chat/rooms', data);
    return response.data;
  }

  async sendMessage(roomId: string, content: string) {
    const response = await this.api.post('/chat/messages', {
      room_id: roomId,
      content: content,
    });
    return response.data;
  }
}

export default new ApiService();
