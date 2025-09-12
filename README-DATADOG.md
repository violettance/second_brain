# Datadog Integration Guide

## 🚀 Setup Instructions

### 1. Cursor Extension Installation
1. Open Extensions view: `Shift + Cmd/Ctrl + X`
2. Search for "datadog"
3. Install the official Datadog extension

### 2. MCP Server Activation
1. Open Cursor Settings: `Shift + Cmd/Ctrl + J`
2. Go to **MCP Tools** tab
3. Find **Datadog server** and enable it
4. Available tools will be displayed

### 3. Environment Variables
Create `.env.local` file:
```bash
# Datadog Configuration
VITE_DATADOG_ENABLED=true
VITE_DATADOG_APP_ID=your_app_id_here
VITE_DATADOG_CLIENT_TOKEN=your_client_token_here
VITE_DATADOG_SITE=datadoghq.eu

# App Configuration
VITE_APP_NAME=second-brain-web
VITE_APP_VERSION=0.1.0
```

### 4. Source Code Integration
1. Upload source maps to Datadog:
   ```bash
   bun run build
   # Source maps will be generated in dist/assets/
   ```

2. Configure repository in Datadog:
   - Go to **APM > Settings > Source Code Integration**
   - Add your repository URL
   - Upload source maps

## 🔧 Features Enabled

### ✅ Log Annotations
- See log volume directly in code
- Click annotations to view logs in Datadog
- Search logs from IDE: Right-click text → **Datadog > Search Logs**

### ✅ Code Insights
- Runtime errors from Error Tracking
- Security vulnerabilities from Code Security
- Flaky tests from Test Optimization
- View in **Code Insights** sidebar

### ✅ Static Code Analysis
- Security and quality checks
- Real-time analysis as you code
- Configuration in `static-analysis.datadog.yml`

### ✅ Exception Replay
- Inspect production stack traces
- View variable values at runtime
- Navigate through production code

### ✅ View in IDE
- Direct links from Datadog to source files
- Jump to specific lines from error traces

## 🛠️ Available MCP Tools

Once MCP server is enabled, you'll have access to:

- **Log Search**: Search Datadog logs from Cursor
- **Error Tracking**: View and analyze errors
- **Performance Monitoring**: Check app performance
- **Security Insights**: Review security findings
- **Test Results**: Analyze test performance

## 📊 Monitoring Features

### Real User Monitoring (RUM)
- User interactions tracking
- Page load performance
- Session replay (20% sampling)
- Error tracking with source maps

### Log Management
- Centralized logging with PII masking
- Console logs forwarded to Datadog
- Error logs with context

### Error Tracking
- JavaScript errors with stack traces
- Source code integration
- Exception replay capability

## 🔍 Debugging Workflow

1. **Error occurs in production**
2. **View in Datadog** → Click "View in Cursor"
3. **Exception Replay** → Inspect variable values
4. **Code Insights** → See related issues
5. **Fix in Chat** → Generate AI prompts for fixes

## 📝 Configuration Files

- `static-analysis.datadog.yml` - Static analysis rules
- `.datadog/sourcemap.json` - Source map configuration
- `src/monitoring.ts` - Datadog initialization
- `src/lib/logger.ts` - Centralized logging

## 🚨 Security Notes

- PII masking enabled in logger
- User input masked in session replay
- Secrets redacted from logs
- Console logs stripped in production

## 📞 Support

- Datadog Extension Issues: [GitHub Repository](https://github.com/datadog/datadog-vscode-extension)
- Email: team-ide-integration@datadoghq.com
- Documentation: [Datadog IDE Plugins](https://docs.datadoghq.com/developers/ide_plugins/vscode/?tab=cursor)

