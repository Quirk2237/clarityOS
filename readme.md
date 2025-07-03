# Expo Supabase Starter

![social-preview-dark](https://github.com/user-attachments/assets/9697a7da-10aa-4661-bb76-b5bc0dd611f0)

## Introduction

This repository serves as a comprehensive starter project for developing React Native and Expo applications with Supabase as the backend. It integrates various technologies such as Expo Router for navigation, Tailwind CSS for styling, React-Hook-Form for form handling, Zod for schema validation, and TypeScript for type safety. By leveraging these powerful tools, this starter template provides a robust foundation for building modern, scalable, and efficient mobile applications.

#### Disclaimer

This is not supposed to be a template, boilerplate or a framework. It is an opinionated guide that shows how to do some things in a certain way. You are not forced to do everything exactly as it is shown here, decide what works best for you and your team and stay consistent with your style.

## 🚀 Quick Start (Docker-Free)

### 🎯 Preferred Development Workflow
1. **Install Dependencies**: `pnpm install`
2. **Validate Environment**: `pnpm validate-env` 
3. **Configure Supabase**: Update `.env.local` with your project credentials
4. **Set API Keys**: Via Supabase Dashboard → Project Settings → Secrets
5. **Deploy Edge Functions**: `pnpm deploy-mcp` (uses MCP tools, no Docker required)
6. **Start Development**: `pnpm start`

### 🎯 Why Docker-Free?
- ✅ **Faster Setup**: No Docker Desktop installation required
- ✅ **Cross-Platform**: Works on all development environments  
- ✅ **Better Performance**: No container overhead
- ✅ **Simplified Workflow**: MCP tools handle deployment seamlessly

### 🔧 Available Scripts
- `pnpm deploy-mcp` - Deploy Edge Functions without Docker
- `pnpm verify-ai` - Check AI SDK configuration
- `pnpm validate-env` - Validate environment setup
- `pnpm setup` - Complete environment validation

## Table of Contents

- [💻 Application Overview](docs/application-overview.md)
- [⚙️ Project Configuration](docs/project-configuration.md)
- [🗄️ Project Structure](docs/project-structure.md)
- [🧱 Components And Styling](docs/components-and-styling.md)
- [🗃️ State Management](docs/state-management.md)

## Contributing

Contributions to this starter project are highly encouraged and welcome! If you have any suggestions, bug reports, or feature requests, please feel free to create an issue or submit a pull request. Let's work together to enhance the developer experience and make it easier for everyone to build exceptional Expo applications with Supabase.

## License

This repository is licensed under the MIT License. You are granted the freedom to use, modify, and distribute the code for personal or commercial purposes. For more details, please refer to the [LICENSE](https://github.com/FlemingVincent/supabase-starter/blob/main/LICENSE) file.
