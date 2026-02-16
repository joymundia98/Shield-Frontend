INSERT INTO permissions (name, path, method, description) VALUES
('View Branch Directory', '/HQ/branchDirectory', 'GET', 'Access and view the branch directory under HQ, including branch details and contact information.'),
('View HQ Reports', '/HQ/GeneralReport', 'GET', 'Access and view general reports available under the HQ section.'),
('Manage Organization Profile', '/Organization/edittableProfile', 'GET', 'Access and manage the organization profile details including updates and configuration.'),
('Access Organization Lobby', '/Organization/orgLobby', 'GET', 'Access the organization lobby area providing overview and navigation options.'),
('Manage Organization Accounts', '/Organization/ListedAccounts', 'GET', 'View and manage organization user accounts including creation, updates, and status control.'),
('Manage Roles', '/Organization/roles', 'GET', 'View and manage role definitions and role configurations within the organization.'),
('Manage Permissions', '/Organization/permissions', 'GET', 'View and manage permission assignments and permission configurations within the organization.'),
('Manage Organization Admins', '/Organization/orgAdminAccounts', 'GET', 'View and manage organization administrator accounts and their access rights.');
