import {http} from './http'

export const ResumesAPI = {
  list: async () => (await http.get('/resumes')).data,
  create: async (title) => (await http.post('/resumes', {title})).data,
  get: async (id) => (await http.get(`/resumes/${id}`)).data,
  update: async (id, payload) => (await http.put(`/resumes/${id}`, payload)).data,
  remove: async (id) => (await http.delete(`/resumes/${id}`)).data,
}
