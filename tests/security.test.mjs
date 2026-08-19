import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();

describe('Security Regression Tests', () => {
  describe('Firestore Security Rules', () => {
    const rulesPath = path.join(rootDir, 'firestore.rules');
    let rulesContent = '';

    test('firestore.rules file exists', () => {
      assert.strictEqual(fs.existsSync(rulesPath), true);
      rulesContent = fs.readFileSync(rulesPath, 'utf8');
    });

    test('Privilege escalation protection is active for users', () => {
      // Must prevent escalating 'role' or 'status'
      assert.match(rulesContent, /allow update: if request\.auth != null && request\.auth\.uid == userId &&\s*\(\!\('role' in request\.resource\.data\) \|\| request\.resource\.data\.role == resource\.data\.role\) &&\s*\(\!\('status' in request\.resource\.data\) \|\| request\.resource\.data\.status == resource\.data\.status\);/);
    });

    test('Admin role verification is restricted to database lookup', () => {
      // Must define isAdmin using a secure database lookup, not client-side claims
      assert.match(rulesContent, /function isAdmin\(\) \{\s*return request\.auth != null && get\(\/databases\/\$\(database\)\/documents\/users\/\$\(request\.auth\.uid\)\)\.data\.role == 'admin';\s*\}/);
    });
    
    test('User creation cannot assign admin role', () => {
      assert.match(rulesContent, /allow create: if request\.auth != null && request\.auth\.uid == userId &&\s*\(\!\('role' in request\.resource\.data\) \|\| request\.resource\.data\.role != 'admin'\);/);
    });
  });

  describe('Security Headers', () => {
    const configPath = path.join(rootDir, 'next.config.ts');
    let configContent = '';

    test('next.config.ts file exists', () => {
      assert.strictEqual(fs.existsSync(configPath), true);
      configContent = fs.readFileSync(configPath, 'utf8');
    });

    test('Required security headers are present', () => {
      const headers = [
        'Strict-Transport-Security',
        'X-Frame-Options',
        'X-Content-Type-Options',
        'Referrer-Policy',
        'Permissions-Policy',
        'Content-Security-Policy'
      ];
      
      for (const header of headers) {
        assert.ok(configContent.includes(header), `Missing header: ${header}`);
      }
    });

    test('Deprecated/dangerous headers are absent', () => {
      assert.strictEqual(configContent.includes('X-XSS-Protection'), false, 'X-XSS-Protection should not be used');
      assert.strictEqual(configContent.includes('unsafe-eval'), false, 'unsafe-eval should not be used');
    });
  });

  describe('Secrets and Credentials', () => {
    test('No hardcoded secrets in source files', () => {
      const sensitiveKeywords = [
        'NEXT_PUBLIC_GEMINI_API_KEY',
        'GEMINI_API_KEY="',
        'GEMINI_API_KEY=\'',
        'private_key="',
        'client_secret="'
      ];
      
      const checkDirectory = (dir) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          if (fs.statSync(fullPath).isDirectory()) {
            if (!['node_modules', '.git', '.next', 'tests'].includes(file)) {
              checkDirectory(fullPath);
            }
          } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            for (const keyword of sensitiveKeywords) {
              assert.strictEqual(content.includes(keyword), false, `Found sensitive keyword '${keyword}' in ${fullPath}`);
            }
          }
        }
      };
      
      checkDirectory(rootDir);
    });

    test('Environment variables are Git ignored', () => {
      const gitignorePath = path.join(rootDir, '.gitignore');
      if (fs.existsSync(gitignorePath)) {
        const gitignore = fs.readFileSync(gitignorePath, 'utf8');
        assert.match(gitignore, /\.env/);
      }
    });
  });

  describe('Rate Limiting', () => {
    const chatRoutePath = path.join(rootDir, 'src/app/api/chat/route.ts');
    const contactRoutePath = path.join(rootDir, 'src/app/api/contact/route.ts');
    
    test('Chat API has rate limiting', () => {
      assert.strictEqual(fs.existsSync(chatRoutePath), true);
      const content = fs.readFileSync(chatRoutePath, 'utf8');
      assert.match(content, /rate limit/i);
      assert.ok(content.includes('429'), 'Should return 429 status on limit');
    });

    test('Contact API has rate limiting', () => {
      assert.strictEqual(fs.existsSync(contactRoutePath), true);
      const content = fs.readFileSync(contactRoutePath, 'utf8');
      assert.match(content, /rate limit/i);
      assert.ok(content.includes('429'), 'Should return 429 status on limit');
    });
  });
  
  describe('Admin Authorization', () => {
    const authContextPath = path.join(rootDir, 'src/context/AuthContext.tsx');
    const adminPagePath = path.join(rootDir, 'src/app/admin/page.tsx');
    
    test('AuthContext securely evaluates admin status', () => {
      const content = fs.readFileSync(authContextPath, 'utf8');
      assert.match(content, /Role check from Firestore database ONLY \(secure boundary\)/);
      assert.match(content, /if \(data\.role === 'admin'\)/);
    });
    
    test('Admin page denies secondary/non-admin accounts clearly', () => {
      const content = fs.readFileSync(adminPagePath, 'utf8');
      // Verify redirect logic
      assert.match(content, /if \(!authLoading && !user\)/);
      // Verify non-admin denial UI
      assert.match(content, /if \(!isAdmin\)/);
      assert.match(content, /You don't have permission to access the admin dashboard\./);
    });
  });
});
