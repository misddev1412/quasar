# Database Seeders

Tất cả các seeders cho hệ thống được quản lý tại đây với flag-based commands.

## 🚀 Quick Start

```bash
# Seed an toàn (chỉ khi database empty) - Default
yarn seed

# Xem tất cả options
yarn seed:help
```

## 🏷️ Available Flags

### Core Flags
```bash
yarn seed --permissions      # Seed permissions (safe)
yarn seed --roles           # Seed roles only  
yarn seed --all             # Run all seeders
```

### Action Flags
```bash
yarn seed --force           # Force seed (có thể tạo duplicates)
yarn seed --clear           # Clear all data và reseed (DESTRUCTIVE!)
yarn seed --reseed          # Reseed data (có thể tạo duplicates)
yarn seed --safe            # Safe seed - explicit (default behavior)
```

### Combined Examples
```bash
# Safe permission seeding (default)
yarn seed --permissions

# Force permission seeding
yarn seed --permissions --force

# Reseed permissions
yarn seed --permissions --reseed

# Destructive clear & reseed
yarn seed --clear

# Seed roles only
yarn seed --roles
```

## 🎯 Short Flags

```bash
yarn seed -p              # --permissions
yarn seed -r              # --roles
yarn seed -a              # --all
yarn seed -f              # --force
yarn seed -c              # --clear
yarn seed -s              # --safe
yarn seed -h              # --help
```

## 🏗️ Architecture

```
seeders/
├── main.seeder.ts       # 🚀 Main entry point với flag parsing
├── permission.seeder.ts # 📋 Permission & role seeding
├── seeder.module.ts     # 🔧 NestJS module
├── index.ts             # 📦 Exports
└── README.md           # 📚 Documentation
```

## 📝 How to Add New Seeders

1. Tạo seeder class trong thư mục này
2. Add vào `SeederModule` providers
3. Import seeder trong `main.seeder.ts`
4. Thêm flag parsing trong `parseFlags()`
5. Thêm logic trong `bootstrap()` function
6. Update help text trong `showHelp()`

## 🔧 Development & Advanced Usage

### Direct Commands
```bash
# Chạy direct với ts-node
npx ts-node --project tsconfig.scripts.json src/database/seeders/main.seeder.ts [flags]

# Examples:
npx ts-node --project tsconfig.scripts.json src/database/seeders/main.seeder.ts --permissions --force
npx ts-node --project tsconfig.scripts.json src/database/seeders/main.seeder.ts --clear
npx ts-node --project tsconfig.scripts.json src/database/seeders/main.seeder.ts --help
```

### Nx Commands (Alternative)
```bash
# Nx-based commands still available
nx run backend:seed
nx run backend:seed:all
nx run backend:seed:clear
```

## ⚠️ Important Notes

- **Default**: `yarn seed` chạy safe seeding (chỉ khi database empty)
- **`--clear`**: Destructive operation - xóa tất cả data trước khi seed
- **`--force` & `--reseed`**: Có thể tạo duplicates
- **Help**: Luôn có sẵn với `yarn seed:help` hoặc `yarn seed --help`
- **Flags có thể combine**: `yarn seed --permissions --force`

## 🎉 Flag Benefits

✅ **Flexible**: Combine multiple flags  
✅ **Intuitive**: Self-documenting commands  
✅ **Scalable**: Easy to add new entities  
✅ **Safe**: Default behavior is always safe  
✅ **Short options**: `-p`, `-r`, `-f`, etc. 