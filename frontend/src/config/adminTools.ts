export type ToolGroup = 'Explore' | 'Review' | 'Content' | 'Locations' | 'People' | 'Contribute';
export interface AdminTool {
  id: string;
  title: string;
  path: string;
  group: ToolGroup;
  description: string;
  tags: string[];
  roles?: string[];
  icon: 'map' | 'review' | 'content' | 'people' | 'survey' | 'data' | 'home';
}
const managers = ['super_admin', 'admin', 'moderator'];
const superAdmin = ['super_admin'];
export const toolGroups: ToolGroup[] = ['Review', 'Content', 'Locations', 'People', 'Contribute', 'Explore'];

// Visibility follows the existing route AND backend access requirements.
// Placeholder pages stay routed, but are deliberately not advertised as tools.
export const adminTools: AdminTool[] = [
  { id: 'location-api', title: 'Location API', path: '/admins?view=api', group: 'Locations', icon: 'data', roles: superAdmin, tags: ['API', 'Keys', 'GN', 'Integration'], description: 'Share GN codes and location hierarchy with other projects using expiring, read-only API keys.' },
  { id: 'map', title: 'Village map', path: '/gnpage', group: 'Explore', icon: 'map', tags: ['Map', 'Census'], description: 'Explore GN boundaries, population, housing and available village data.' },
  { id: 'category-review', title: 'Category approvals', path: '/approvals', group: 'Review', icon: 'review', roles: managers, tags: ['Review', 'Responses'], description: 'Inspect category submissions and approve or reject responses.' },
  { id: 'places-review', title: 'Place submissions', path: '/user-submissions', group: 'Review', icon: 'review', roles: superAdmin, tags: ['Review', 'Places'], description: 'Review new places and proposed updates to imported records.' },
  { id: 'gn-review', title: 'GN answer approvals', path: '/admin/rapid-fire-approvals', group: 'Review', icon: 'review', roles: managers, tags: ['Review', 'GN'], description: 'Review rapid-fire village answers by GN and contributor.' },
  { id: 'industry-review', title: 'Industry survey records', path: '/admin/industry-surveys', group: 'Review', icon: 'survey', roles: superAdmin, tags: ['Review', 'Industry'], description: 'Browse survey details, filter locations and approve submitted surveys.' },
  { id: 'categories', title: 'Category structure', path: '/categories', group: 'Content', icon: 'content', roles: managers, tags: ['Categories', 'Browse'], description: 'Explore the category hierarchy, subcategories and their survey forms.' },
  { id: 'questions', title: 'Category questions', path: '/questions', group: 'Content', icon: 'survey', roles: managers, tags: ['Questions', 'Edit'], description: 'Manage multilingual questions, explanations and input types.' },
  { id: 'industry-builder', title: 'Industry survey builder', path: '/admin/industry-survey-questions', group: 'Content', icon: 'survey', roles: superAdmin, tags: ['Questions', 'Industry'], description: 'Manage industry form fields, guidance, order and active questions.' },
  { id: 'bulk', title: 'Category records', path: '/bulk-data', group: 'Content', icon: 'data', roles: superAdmin, tags: ['Import', 'Records'], description: 'Browse category records, upload data and manage existing entries.' },
  { id: 'gns', title: 'GN divisions', path: '/grama-niladharis', group: 'Locations', icon: 'map', roles: managers, tags: ['GN', 'Browse'], description: 'View GN names, administrative codes and location hierarchy.' },
  { id: 'police', title: 'Police mapping', path: '/police-connections', group: 'Locations', icon: 'map', roles: managers, tags: ['Mapping', 'Police'], description: 'Review and maintain GN-to-police-station connections.' },
  { id: 'post', title: 'Post office mapping', path: '/post-office-connections', group: 'Locations', icon: 'map', roles: managers, tags: ['Mapping', 'Postal'], description: 'Manage post-office connections by district and division.' },
  { id: 'health', title: 'Health mapping', path: '/phi-connections', group: 'Locations', icon: 'map', roles: managers, tags: ['Mapping', 'Health'], description: 'Manage Public Health Inspector area connections.' },
  { id: 'telecom', title: 'Telecom mapping', path: '/trs-connections', group: 'Locations', icon: 'map', roles: managers, tags: ['Mapping', 'Telecom'], description: 'Manage telecom service-area connections for GN divisions.' },
  { id: 'districts', title: 'District & province mapping', path: '/district-province-connections', group: 'Locations', icon: 'map', roles: managers, tags: ['Mapping', 'Hierarchy'], description: 'Review district and province relationships.' },
  { id: 'admins', title: 'Administrator accounts', path: '/admins?view=accounts', group: 'People', icon: 'people', roles: superAdmin, tags: ['Accounts', 'Roles'], description: 'Register administrators, update roles and manage active status.' },
  { id: 'registration', title: 'Register user', path: '/registration', group: 'People', icon: 'people', roles: superAdmin, tags: ['Accounts', 'Registration'], description: 'Open the existing user registration form.' },
  { id: 'contribute', title: 'Add village data', path: '/user', group: 'Contribute', icon: 'content', tags: ['Form', 'Categories'], description: 'Choose a village and category to contribute information.' },
  { id: 'rapid-fire', title: 'Rapid-fire questions', path: '/user/rapid-fire', group: 'Contribute', icon: 'survey', tags: ['Form', 'GN'], description: 'Answer short questions about a selected village.' },
  { id: 'industry-form', title: 'Industry survey form', path: '/industry-survey', group: 'Contribute', icon: 'survey', tags: ['Form', 'Industry'], description: 'Complete an industry survey, save drafts and submit after verification.' },
  { id: 'contributions', title: 'My contributions', path: '/user/contributions', group: 'Contribute', icon: 'content', tags: ['Personal', 'History'], description: 'View your contributions and their review status.' },
  { id: 'my-dashboard', title: 'My dashboard', path: '/mydashboard', group: 'Contribute', icon: 'home', tags: ['Personal', 'Progress'], description: 'Open your contributor dashboard and survey progress.' },
];

export const visibleAdminTools = (roles: string[]) => adminTools.filter(tool => !tool.roles || roles.some(role => tool.roles!.includes(role)));

export const matchesAdminTool = (tool: AdminTool, search: string, group = 'All') =>
  (group === 'All' || tool.group === group) &&
  `${tool.title} ${tool.description} ${tool.tags.join(' ')} ${tool.group}`.toLowerCase().includes(search.trim().toLowerCase());

export const matchesToolLocation = (toolPath: string, pathname: string, search = '') => {
  const [path, query = ''] = toolPath.split('?');
  if (path === '/admins') {
    return pathname === path &&
      (new URLSearchParams(search).get('view') || 'overview') ===
      (new URLSearchParams(query).get('view') || 'overview');
  }
  return pathname === path || pathname.startsWith(path + '/');
};

export const unavailableAdminModules = [
  { title: 'User directory', reason: 'The existing Users page is a placeholder. User registration is available.' },
  { title: 'Reports & analytics', reason: 'The existing Reports page has no reporting tools yet.' },
];
