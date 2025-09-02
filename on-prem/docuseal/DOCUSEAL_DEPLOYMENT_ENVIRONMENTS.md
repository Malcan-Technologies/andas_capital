# DocuSeal Environment Deployment Guide

## 🏗️ **Environment Management System**

This system provides consistent configuration management for DocuSeal across different environments.

## 📁 **File Structure**

```
docuseal-onprem/
├── env.development        # Development environment config
├── env.production         # Production environment config  
├── scripts/
│   └── deploy-env.sh      # Environment deployment script
└── docker-compose.yml     # Uses environment variables
```

## 🚀 **Quick Deployment**

### **Development Environment**
```bash
cd docuseal-onprem
./scripts/deploy-env.sh development
```

### **Production Environment**
```bash
cd docuseal-onprem
./scripts/deploy-env.sh production
```

## ⚙️ **Environment Configurations**

### **Development (`env.development`)**
- **DocuSeal Host**: `192.168.0.100:3001`
- **Webhook URL**: `http://192.168.0.88:4001/api/docuseal/webhook`
- **SSL**: Disabled
- **Target**: Local development with laptop backend

### **Production (`env.production`)**
- **DocuSeal Host**: `sign.kredit.my`
- **Webhook URL**: `https://api.kredit.my/api/docuseal/webhook`
- **SSL**: Enabled
- **Target**: Production cloud deployment

## 🔧 **Configuration Details**

### **Webhook URLs by Environment**

| Environment | Webhook URL | Target |
|-------------|-------------|---------|
| Development | `http://192.168.0.88:4001/api/docuseal/webhook` | Your laptop backend |
| Production | `https://api.kredit.my/api/docuseal/webhook` | Cloud backend server |

### **DocuSeal App URLs by Environment**

| Environment | App URL | Access Method |
|-------------|---------|---------------|
| Development | `http://192.168.0.100:3001` | Direct container access |
| Production | `https://sign.kredit.my` | Domain with SSL |

## 📋 **Deployment Checklist**

### **Development Setup**
1. ✅ Run `./scripts/deploy-env.sh development`
2. ✅ Ensure your laptop backend is running on `192.168.0.88:4001`
3. ✅ Access DocuSeal at `http://192.168.0.100`
4. ✅ Set App URL in DocuSeal Settings to `http://192.168.0.100:3001`
5. ✅ Test webhook connectivity

### **Production Setup**
1. ✅ Update `env.production` with real credentials
2. ✅ Run `./scripts/deploy-env.sh production`
3. ✅ Configure SSL certificates for `sign.kredit.my`
4. ✅ Ensure cloud backend is accessible at `api.kredit.my`
5. ✅ Set App URL in DocuSeal Settings to `https://sign.kredit.my`
6. ✅ Test webhook connectivity

## 🔍 **Troubleshooting**

### **Webhook Connection Failed**
1. **Check network connectivity**:
   ```bash
   # From on-prem server, test backend connectivity
   curl -X POST http://192.168.0.88:4001/api/docuseal/webhook \
        -H "Content-Type: application/json" \
        -d '{"test": "webhook"}'
   ```

2. **Verify backend is running**:
   ```bash
   # Check if backend is accessible
   curl http://192.168.0.88:4001/health
   ```

3. **Check firewall settings**:
   - Ensure port 4001 is open on your laptop
   - Check network firewall between servers

### **Wrong URLs in Documents**
1. **Update App URL in DocuSeal Settings**:
   - Go to DocuSeal → Settings → Configuration
   - Set "App URL" to match your environment
   - Development: `http://192.168.0.100:3001`
   - Production: `https://sign.kredit.my`

2. **Restart DocuSeal after changes**:
   ```bash
   docker-compose restart docuseal
   ```

## 🔄 **Switching Environments**

```bash
# Switch to development
./scripts/deploy-env.sh development

# Switch to production  
./scripts/deploy-env.sh production
```

## 📝 **Environment Variable Reference**

### **Key Variables**
- `DEFAULT_URL_HOST`: Host used for URL generation
- `DEFAULT_URL_PORT`: Port used for URL generation
- `WEBHOOK_URL`: Backend webhook endpoint
- `FORCE_SSL`: Enable/disable SSL requirements

### **Network Configuration**
- **Development**: Direct IP addresses for local network
- **Production**: Domain names with SSL/HTTPS
