const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const filesToUpdate = [
  'pages/catalog/MaterialsPage.jsx',
  'pages/catalog/ModelsPage.jsx',
  'pages/catalog/ToolsPage.jsx',
  'pages/catalog/CollectionsPage.jsx',
  'pages/campaigns/EditArticlePage.jsx',
  'pages/campaigns/DiscountsPage.jsx'
];

filesToUpdate.forEach(file => {
  const fullPath = path.join(srcDir, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Add import if not exists
    if (!content.includes('import { useRBAC }')) {
      content = content.replace(/import \{ useAuthStore \} from "@store\/authStore";/g, 'import { useAuthStore } from "@store/authStore";\nimport { useRBAC } from "@hooks/useRBAC";');
    }
    
    // Pattern 1: validJsonString ... JSON.parse ...
    content = content.replace(/const isAdmin = user\?\.role === "ADMIN";\s*const validJsonString = user\?\.permission\?\.replace\([^)]+\);\s*const permission = validJsonString \? JSON\.parse\(validJsonString\) : {};\s*const canCreate = isAdmin \|\| permission\.create;\s*const canUpdate = isAdmin \|\| permission\.update;\s*const canDelete = isAdmin \|\| permission\.del;/g, 
      'const { isAdmin, canCreate, canUpdate, canDelete, permissions: permission } = useRBAC();');

    // Pattern 2: CollectionsPage.jsx
    content = content.replace(/const isAdmin = user\?\.role === "ADMIN";\s*const permission = \(\(\) => \{[^}]+\}\)\(\);\s*const canCreate = isAdmin \|\| permission\.create;\s*const canUpdate = isAdmin \|\| permission\.update;\s*const canDelete = isAdmin \|\| permission\.del;/g,
      'const { isAdmin, canCreate, canUpdate, canDelete, permissions: permission } = useRBAC();');

    // Pattern 3: EditArticlePage.jsx
    content = content.replace(/const isAdmin = user\?\.role === "ADMIN";\s*const permission = useMemo\(\(\) => \{[^}]+\}, \[user\]\);\s*const canUpdate = isAdmin \|\| permission\.update;/g,
      'const { isAdmin, canUpdate, permissions: permission } = useRBAC();');

    // Pattern 4: DiscountsPage.jsx
    content = content.replace(/const isAdmin = user\?\.role === "ADMIN";\s*const permission = useMemo\(\(\) => \{[^}]+\}, \[user\]\);\s*const canCreate = isAdmin \|\| permission\.create;\s*const canUpdate = isAdmin \|\| permission\.update;\s*const canDelete = isAdmin \|\| permission\.del;/g,
      'const { isAdmin, canCreate, canUpdate, canDelete, permissions: permission } = useRBAC();');

    // Just to make sure we don't have unused imports, we keep `const { user } = useAuthStore();` as it is often used for other things.

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
