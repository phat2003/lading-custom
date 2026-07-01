// Mock data cho Admin Dashboard — thay bằng API thật khi backend sẵn sàng.

export const stats = [
  { label: 'Total Users', value: '1,286', delta: '↑ +24 this week', valueClass: 'text-white' },
  { label: 'Projects', value: '1,296', delta: '↑ +12 this week', valueClass: 'text-blue-400' },
  { label: 'Total Sections', value: '147', delta: 'Across all templates', valueClass: 'text-teal-400' },
  { label: 'AI Generated Pages', value: '812', delta: '↑ +53 this month', valueClass: 'text-purple-400' },
]

export const recentUsers = [
  { id: 1, name: 'Bac Tuan', email: 'bactuan@mail.com', plan: 'Pro', status: 'Active' },
  { id: 2, name: 'Duy Pham', email: 'duypham@mail.com', plan: 'Free', status: 'Inactive' },
  { id: 3, name: 'Linh Nguyen', email: 'linh.ng@mail.com', plan: 'Subscriber', status: 'Active' },
  { id: 4, name: 'Minh Tran', email: 'minhtran@mail.com', plan: 'Pro', status: 'Active' },
  { id: 5, name: 'Thu Hoang', email: 'thuhoang@mail.com', plan: 'Free', status: 'Inactive' },
]

export const aiLogs = [
  { id: 1, prompt: 'create a SaaS landing with pricing table', status: 'Done', time: '10:24 AM' },
  { id: 2, prompt: 'minimalistic portfolio for photographer', status: 'Done', time: '09:15 AM' },
  { id: 3, prompt: 'e-commerce homepage with hero banner', status: 'Using', time: '08:55 AM' },
  { id: 4, prompt: 'agency homepage with team section', status: 'Using', time: '08:30 AM' },
]

export const workspaceProjects = [
  { id: 1, name: 'SaaS Landing Pro', domain: 'saas-landing.amazingtech.io', status: 'Published', updated: 'Cập nhật 2 giờ trước' },
  { id: 2, name: 'Portfolio Studio', domain: 'portfolio.amazingtech.io', status: 'Draft', updated: 'Cập nhật 1 ngày trước' },
  { id: 3, name: 'Agency Showcase', domain: 'agency.amazingtech.io', status: 'Published', updated: 'Cập nhật 3 ngày trước' },
  { id: 4, name: 'Smart Studio Site', domain: 'studio.amazingtech.io', status: 'Draft', updated: 'Cập nhật 5 ngày trước' },
]
