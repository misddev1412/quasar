/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(5);
const typeorm_1 = __webpack_require__(6);
const nestjs_trpc_1 = __webpack_require__(7);
const app_controller_1 = __webpack_require__(8);
const app_service_1 = __webpack_require__(9);
const user_module_1 = __webpack_require__(10);
const admin_module_1 = __webpack_require__(15);
const client_module_1 = __webpack_require__(31);
const auth_module_1 = __webpack_require__(25);
const context_1 = __webpack_require__(34);
const database_config_1 = tslib_1.__importDefault(__webpack_require__(35));
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [database_config_1.default],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => configService.get('database'),
            }),
            auth_module_1.AuthModule,
            nestjs_trpc_1.TRPCModule.forRoot({
                autoSchemaFile: './src/@generated',
                context: context_1.AppContext,
            }),
            user_module_1.UserModule,
            admin_module_1.AdminModule,
            client_module_1.ClientModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, context_1.AppContext],
    })
], AppModule);


/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("@nestjs/typeorm");

/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("nestjs-trpc");

/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const app_service_1 = __webpack_require__(9);
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    getData() {
        return this.appService.getData();
    }
};
exports.AppController = AppController;
tslib_1.__decorate([
    (0, common_1.Get)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], AppController.prototype, "getData", null);
exports.AppController = AppController = tslib_1.__decorate([
    (0, common_1.Controller)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof app_service_1.AppService !== "undefined" && app_service_1.AppService) === "function" ? _a : Object])
], AppController);


/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
let AppService = class AppService {
    getData() {
        return { message: 'Hello API' };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], AppService);


/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(6);
const user_entity_1 = __webpack_require__(11);
const user_profile_entity_1 = __webpack_require__(13);
const user_repository_1 = __webpack_require__(14);
let UserModule = class UserModule {
};
exports.UserModule = UserModule;
exports.UserModule = UserModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, user_profile_entity_1.UserProfile])],
        controllers: [],
        providers: [user_repository_1.UserRepository],
        exports: [user_repository_1.UserRepository],
    })
], UserModule);


/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.User = exports.UserRole = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
const user_profile_entity_1 = __webpack_require__(13);
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["ADMIN"] = "admin";
    UserRole["USER"] = "user";
})(UserRole || (exports.UserRole = UserRole = {}));
let User = class User {
};
exports.User = User;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], User.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "email", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "username", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], User.prototype, "password", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER
    }),
    tslib_1.__metadata("design:type", String)
], User.prototype, "role", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    tslib_1.__metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    tslib_1.__metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], User.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    tslib_1.__metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], User.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.OneToOne)(() => user_profile_entity_1.UserProfile, profile => profile.user),
    tslib_1.__metadata("design:type", typeof (_c = typeof user_profile_entity_1.UserProfile !== "undefined" && user_profile_entity_1.UserProfile) === "function" ? _c : Object)
], User.prototype, "profile", void 0);
exports.User = User = tslib_1.__decorate([
    (0, typeorm_1.Entity)('users')
], User);


/***/ }),
/* 12 */
/***/ ((module) => {

module.exports = require("typeorm");

/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserProfile = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
const user_entity_1 = __webpack_require__(11);
let UserProfile = class UserProfile {
};
exports.UserProfile = UserProfile;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], UserProfile.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ name: 'first_name' }),
    tslib_1.__metadata("design:type", String)
], UserProfile.prototype, "firstName", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ name: 'last_name' }),
    tslib_1.__metadata("design:type", String)
], UserProfile.prototype, "lastName", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ name: 'phone_number', nullable: true }),
    tslib_1.__metadata("design:type", String)
], UserProfile.prototype, "phoneNumber", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ name: 'date_of_birth', type: 'date', nullable: true }),
    tslib_1.__metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], UserProfile.prototype, "dateOfBirth", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], UserProfile.prototype, "avatar", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], UserProfile.prototype, "bio", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], UserProfile.prototype, "address", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], UserProfile.prototype, "city", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], UserProfile.prototype, "country", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ name: 'postal_code', nullable: true }),
    tslib_1.__metadata("design:type", String)
], UserProfile.prototype, "postalCode", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    tslib_1.__metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], UserProfile.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    tslib_1.__metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], UserProfile.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    tslib_1.__metadata("design:type", String)
], UserProfile.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, user => user.profile),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    tslib_1.__metadata("design:type", typeof (_d = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _d : Object)
], UserProfile.prototype, "user", void 0);
exports.UserProfile = UserProfile = tslib_1.__decorate([
    (0, typeorm_1.Entity)('user_profiles')
], UserProfile);


/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserRepository = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(6);
const typeorm_2 = __webpack_require__(12);
const user_entity_1 = __webpack_require__(11);
const user_profile_entity_1 = __webpack_require__(13);
let UserRepository = class UserRepository {
    constructor(userRepository, userProfileRepository) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
    }
    async create(createUserDto) {
        const { firstName, lastName, phoneNumber, role, ...userData } = createUserDto;
        // Create user first
        const userToCreate = {
            ...userData,
            role: role ? role : user_entity_1.UserRole.USER
        };
        const user = this.userRepository.create(userToCreate);
        const savedUser = await this.userRepository.save(user);
        // Create profile
        const profile = this.userProfileRepository.create({
            userId: savedUser.id,
            firstName,
            lastName,
            phoneNumber,
        });
        await this.userProfileRepository.save(profile);
        return savedUser;
    }
    async findAll() {
        return await this.userRepository.find({
            relations: ['profile']
        });
    }
    async findById(id) {
        return await this.userRepository.findOne({
            where: { id }
        });
    }
    async findByEmail(email) {
        return await this.userRepository.findOne({
            where: { email }
        });
    }
    async findByUsername(username) {
        return await this.userRepository.findOne({
            where: { username }
        });
    }
    async findWithProfile(id) {
        return await this.userRepository.findOne({
            where: { id },
            relations: ['profile']
        });
    }
    async update(id, updateUserDto) {
        const updateData = {
            ...updateUserDto,
            ...(updateUserDto.role && { role: updateUserDto.role })
        };
        await this.userRepository.update(id, updateData);
        return await this.findById(id);
    }
    async updateProfile(userId, updateProfileDto) {
        const profile = await this.userProfileRepository.findOne({
            where: { userId }
        });
        if (!profile) {
            return null;
        }
        await this.userProfileRepository.update(profile.id, updateProfileDto);
        return await this.userProfileRepository.findOne({
            where: { userId }
        });
    }
    async delete(id) {
        const result = await this.userRepository.delete(id);
        return result.affected > 0;
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    tslib_1.__param(1, (0, typeorm_1.InjectRepository)(user_profile_entity_1.UserProfile)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object])
], UserRepository);


/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(6);
const user_entity_1 = __webpack_require__(11);
const user_profile_entity_1 = __webpack_require__(13);
const admin_user_router_1 = __webpack_require__(16);
const admin_user_service_1 = __webpack_require__(18);
const auth_module_1 = __webpack_require__(25);
const auth_middleware_1 = __webpack_require__(22);
const admin_role_middleware_1 = __webpack_require__(24);
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, user_profile_entity_1.UserProfile]),
            auth_module_1.AuthModule,
        ],
        controllers: [],
        providers: [
            admin_user_service_1.AdminUserService,
            admin_user_router_1.AdminUserRouter,
            auth_middleware_1.AuthMiddleware,
            admin_role_middleware_1.AdminRoleMiddleware,
        ],
        exports: [admin_user_service_1.AdminUserService],
    })
], AdminModule);


/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminUserRouter = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const nestjs_trpc_1 = __webpack_require__(7);
const zod_1 = __webpack_require__(17);
const admin_user_service_1 = __webpack_require__(18);
const auth_middleware_1 = __webpack_require__(22);
const admin_role_middleware_1 = __webpack_require__(24);
const user_entity_1 = __webpack_require__(11);
// Zod schemas for validation
const userRoleSchema = zod_1.z.enum([user_entity_1.UserRole.USER, user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.SUPER_ADMIN]);
const adminCreateUserSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    username: zod_1.z.string().min(3),
    firstName: zod_1.z.string().min(2),
    lastName: zod_1.z.string().min(2),
    password: zod_1.z.string().min(8),
    phoneNumber: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
    role: userRoleSchema.optional(),
});
const adminUpdateUserSchema = zod_1.z.object({
    email: zod_1.z.string().email().optional(),
    username: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
    role: userRoleSchema.optional(),
});
const userProfileSchema = zod_1.z.object({
    id: zod_1.z.string(),
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string(),
    phoneNumber: zod_1.z.string().optional(),
    dateOfBirth: zod_1.z.date().optional(),
    avatar: zod_1.z.string().optional(),
    bio: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    postalCode: zod_1.z.string().optional(),
});
const adminUserResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    email: zod_1.z.string(),
    username: zod_1.z.string(),
    isActive: zod_1.z.boolean(),
    role: userRoleSchema,
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    profile: userProfileSchema.optional(),
});
const getAllUsersQuerySchema = zod_1.z.object({
    page: zod_1.z.number().min(1).default(1),
    limit: zod_1.z.number().min(1).max(100).default(10),
    search: zod_1.z.string().optional(),
    role: userRoleSchema.optional(),
    isActive: zod_1.z.boolean().optional(),
});
const getUsersResponseSchema = zod_1.z.object({
    users: zod_1.z.array(adminUserResponseSchema),
    total: zod_1.z.number(),
    page: zod_1.z.number(),
    limit: zod_1.z.number(),
});
let AdminUserRouter = class AdminUserRouter {
    constructor(adminUserService) {
        this.adminUserService = adminUserService;
    }
    async createUser(createUserDto) {
        // Ensure required fields are present for AdminCreateUserDto
        const adminCreateDto = {
            email: createUserDto.email,
            username: createUserDto.username,
            firstName: createUserDto.firstName,
            lastName: createUserDto.lastName,
            password: createUserDto.password,
            phoneNumber: createUserDto.phoneNumber,
            isActive: createUserDto.isActive,
            role: createUserDto.role,
        };
        return await this.adminUserService.createUser(adminCreateDto);
    }
    async getAllUsers(query) {
        // Ensure required fields are present for AdminUserFilters
        const filters = {
            page: query.page || 1,
            limit: query.limit || 10,
            search: query.search,
            role: query.role,
            isActive: query.isActive,
        };
        return await this.adminUserService.getAllUsers(filters);
    }
    async getUserById(input) {
        return await this.adminUserService.getUserById(input.id);
    }
    async updateUser(input) {
        const { id, ...updateDto } = input;
        return await this.adminUserService.updateUser(id, updateDto);
    }
    async deleteUser(input) {
        await this.adminUserService.deleteUser(input.id);
    }
    async updateUserStatus(input) {
        return await this.adminUserService.updateUserStatus(input.id, input.isActive);
    }
};
exports.AdminUserRouter = AdminUserRouter;
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Mutation)({
        input: adminCreateUserSchema,
        output: adminUserResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof zod_1.z !== "undefined" && zod_1.z.infer) === "function" ? _b : Object]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], AdminUserRouter.prototype, "createUser", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Query)({
        input: getAllUsersQuerySchema,
        output: getUsersResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_d = typeof zod_1.z !== "undefined" && zod_1.z.infer) === "function" ? _d : Object]),
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], AdminUserRouter.prototype, "getAllUsers", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Query)({
        input: zod_1.z.object({ id: zod_1.z.string() }),
        output: adminUserResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], AdminUserRouter.prototype, "getUserById", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Mutation)({
        input: zod_1.z.object({ id: zod_1.z.string() }).merge(adminUpdateUserSchema),
        output: adminUserResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], AdminUserRouter.prototype, "updateUser", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Mutation)({
        input: zod_1.z.object({ id: zod_1.z.string() }),
        output: zod_1.z.void(),
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], AdminUserRouter.prototype, "deleteUser", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Mutation)({
        input: zod_1.z.object({
            id: zod_1.z.string(),
            isActive: zod_1.z.boolean(),
        }),
        output: adminUserResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], AdminUserRouter.prototype, "updateUserStatus", null);
exports.AdminUserRouter = AdminUserRouter = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, common_1.Inject)(admin_user_service_1.AdminUserService)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof admin_user_service_1.AdminUserService !== "undefined" && admin_user_service_1.AdminUserService) === "function" ? _a : Object])
], AdminUserRouter);


/***/ }),
/* 17 */
/***/ ((module) => {

module.exports = require("zod");

/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminUserService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const user_repository_1 = __webpack_require__(14);
const auth_service_1 = __webpack_require__(19);
const user_entity_1 = __webpack_require__(11);
let AdminUserService = class AdminUserService {
    constructor(userRepository, authService) {
        this.userRepository = userRepository;
        this.authService = authService;
    }
    async createUser(createUserDto) {
        const existingUser = await this.userRepository.findByEmail(createUserDto.email);
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const hashedPassword = await this.authService.hashPassword(createUserDto.password);
        const userData = {
            ...createUserDto,
            password: hashedPassword,
            role: createUserDto.role || user_entity_1.UserRole.USER,
        };
        const user = await this.userRepository.create(userData);
        // Get the user with profile after creation
        const userWithProfile = await this.userRepository.findWithProfile(user.id);
        return this.toAdminUserResponse(userWithProfile || user);
    }
    async getAllUsers(filters) {
        // This would typically use a more sophisticated query with pagination
        // For now, we'll use a simple approach
        const users = await this.userRepository.findAll();
        let filteredUsers = users;
        if (filters.search) {
            filteredUsers = filteredUsers.filter(user => {
                const searchLower = filters.search.toLowerCase();
                const emailMatch = user.email.toLowerCase().includes(searchLower);
                const usernameMatch = user.username.toLowerCase().includes(searchLower);
                // Only search in profile if it exists
                const profileMatch = user.profile ?
                    (user.profile.firstName?.toLowerCase().includes(searchLower) ||
                        user.profile.lastName?.toLowerCase().includes(searchLower)) : false;
                return emailMatch || usernameMatch || profileMatch;
            });
        }
        if (filters.role) {
            filteredUsers = filteredUsers.filter(user => user.role === filters.role);
        }
        if (filters.isActive !== undefined) {
            filteredUsers = filteredUsers.filter(user => user.isActive === filters.isActive);
        }
        const total = filteredUsers.length;
        const startIndex = (filters.page - 1) * filters.limit;
        const endIndex = startIndex + filters.limit;
        const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
        return {
            users: paginatedUsers.map(user => this.toAdminUserResponse(user)),
            total,
            page: filters.page,
            limit: filters.limit,
        };
    }
    async getUserById(id) {
        const user = await this.userRepository.findWithProfile(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.toAdminUserResponse(user);
    }
    async updateUser(id, updateUserDto) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const updatedUser = await this.userRepository.update(id, updateUserDto);
        if (!updatedUser) {
            throw new common_1.NotFoundException('User not found');
        }
        // Get user with profile after update
        const userWithProfile = await this.userRepository.findWithProfile(id);
        return this.toAdminUserResponse(userWithProfile || updatedUser);
    }
    async deleteUser(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const deleted = await this.userRepository.delete(id);
        if (!deleted) {
            throw new common_1.NotFoundException('User not found');
        }
    }
    async updateUserStatus(id, isActive) {
        return await this.updateUser(id, { isActive });
    }
    toAdminUserResponse(user) {
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            isActive: user.isActive,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            profile: user.profile ? {
                id: user.profile.id,
                firstName: user.profile.firstName,
                lastName: user.profile.lastName,
                phoneNumber: user.profile.phoneNumber,
                dateOfBirth: user.profile.dateOfBirth,
                avatar: user.profile.avatar,
                bio: user.profile.bio,
                address: user.profile.address,
                city: user.profile.city,
                country: user.profile.country,
                postalCode: user.profile.postalCode,
            } : undefined,
        };
    }
};
exports.AdminUserService = AdminUserService;
exports.AdminUserService = AdminUserService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof user_repository_1.UserRepository !== "undefined" && user_repository_1.UserRepository) === "function" ? _a : Object, typeof (_b = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _b : Object])
], AdminUserService);


/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const jwt_1 = __webpack_require__(20);
const user_repository_1 = __webpack_require__(14);
const bcrypt = tslib_1.__importStar(__webpack_require__(21));
let AuthService = class AuthService {
    constructor(jwtService, userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }
    async validateUser(email, pass) {
        const user = await this.userRepository.findByEmail(email);
        if (user && await bcrypt.compare(pass, user.password)) {
            return user;
        }
        return null;
    }
    async login(user) {
        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role
        };
        return {
            accessToken: this.jwtService.sign(payload),
            refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
        };
    }
    async hashPassword(password) {
        return bcrypt.hash(password, 12);
    }
    async verifyToken(token) {
        try {
            return this.jwtService.verify(token);
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const newPayload = {
                email: payload.email,
                sub: payload.sub,
                role: payload.role
            };
            return {
                accessToken: this.jwtService.sign(newPayload),
                refreshToken: this.jwtService.sign(newPayload, { expiresIn: '7d' }),
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _a : Object, typeof (_b = typeof user_repository_1.UserRepository !== "undefined" && user_repository_1.UserRepository) === "function" ? _b : Object])
], AuthService);


/***/ }),
/* 20 */
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),
/* 21 */
/***/ ((module) => {

module.exports = require("bcryptjs");

/***/ }),
/* 22 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthMiddleware = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const server_1 = __webpack_require__(23);
let AuthMiddleware = class AuthMiddleware {
    async use(opts) {
        const { ctx, next } = opts;
        if (!ctx.user) {
            throw new server_1.TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Authentication required',
            });
        }
        return next({
            ctx: {
                ...ctx,
                user: ctx.user, // Ensure user is non-nullable in subsequent procedures
            },
        });
    }
};
exports.AuthMiddleware = AuthMiddleware;
exports.AuthMiddleware = AuthMiddleware = tslib_1.__decorate([
    (0, common_1.Injectable)()
], AuthMiddleware);


/***/ }),
/* 23 */
/***/ ((module) => {

module.exports = require("@trpc/server");

/***/ }),
/* 24 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminRoleMiddleware = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const server_1 = __webpack_require__(23);
const user_entity_1 = __webpack_require__(11);
let AdminRoleMiddleware = class AdminRoleMiddleware {
    async use(opts) {
        const { ctx, next } = opts;
        // This middleware should be used after AuthMiddleware, so user should exist
        if (!ctx.user) {
            throw new server_1.TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Authentication required',
            });
        }
        // Check if user has admin privileges
        if (ctx.user.role !== user_entity_1.UserRole.ADMIN && ctx.user.role !== user_entity_1.UserRole.SUPER_ADMIN) {
            throw new server_1.TRPCError({
                code: 'FORBIDDEN',
                message: 'Admin access required',
            });
        }
        return next({
            ctx: {
                ...ctx,
                user: ctx.user,
            },
        });
    }
};
exports.AdminRoleMiddleware = AdminRoleMiddleware;
exports.AdminRoleMiddleware = AdminRoleMiddleware = tslib_1.__decorate([
    (0, common_1.Injectable)()
], AdminRoleMiddleware);


/***/ }),
/* 25 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const jwt_1 = __webpack_require__(20);
const config_1 = __webpack_require__(5);
const typeorm_1 = __webpack_require__(6);
const passport_1 = __webpack_require__(26);
const user_entity_1 = __webpack_require__(11);
const user_profile_entity_1 = __webpack_require__(13);
const user_repository_1 = __webpack_require__(14);
const auth_service_1 = __webpack_require__(19);
const jwt_strategy_1 = __webpack_require__(27);
const roles_guard_1 = __webpack_require__(29);
const jwt_auth_guard_1 = __webpack_require__(30);
const jwtModule = jwt_1.JwtModule.registerAsync({
    imports: [config_1.ConfigModule],
    useFactory: async (configService) => ({
        secret: configService.get('JWT_SECRET') || 'your-secret-key',
        signOptions: {
            expiresIn: configService.get('JWT_EXPIRES_IN') || '1h',
        },
    }),
    inject: [config_1.ConfigService],
});
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, user_profile_entity_1.UserProfile]),
            passport_1.PassportModule,
            jwtModule,
        ],
        providers: [
            auth_service_1.AuthService,
            user_repository_1.UserRepository,
            jwt_strategy_1.JwtStrategy,
            roles_guard_1.RolesGuard,
            jwt_auth_guard_1.JwtAuthGuard,
        ],
        exports: [auth_service_1.AuthService, user_repository_1.UserRepository, jwtModule, jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard],
    })
], AuthModule);


/***/ }),
/* 26 */
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),
/* 27 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtStrategy = void 0;
const tslib_1 = __webpack_require__(4);
const passport_jwt_1 = __webpack_require__(28);
const passport_1 = __webpack_require__(26);
const common_1 = __webpack_require__(1);
const config_1 = __webpack_require__(5);
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(configService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET') || 'your-secret-key',
        });
    }
    async validate(payload) {
        return {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], JwtStrategy);


/***/ }),
/* 28 */
/***/ ((module) => {

module.exports = require("passport-jwt");

/***/ }),
/* 29 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Roles = exports.RolesGuard = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(2);
let RolesGuard = class RolesGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride('roles', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        return requiredRoles.some((role) => user.role === role);
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof core_1.Reflector !== "undefined" && core_1.Reflector) === "function" ? _a : Object])
], RolesGuard);
// Decorator for setting required roles
const common_2 = __webpack_require__(1);
const Roles = (...roles) => (0, common_2.SetMetadata)('roles', roles);
exports.Roles = Roles;


/***/ }),
/* 30 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtAuthGuard = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const passport_1 = __webpack_require__(26);
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = tslib_1.__decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);


/***/ }),
/* 31 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClientModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(6);
const user_entity_1 = __webpack_require__(11);
const user_profile_entity_1 = __webpack_require__(13);
const client_user_router_1 = __webpack_require__(32);
const client_user_service_1 = __webpack_require__(33);
const auth_module_1 = __webpack_require__(25);
const auth_middleware_1 = __webpack_require__(22);
let ClientModule = class ClientModule {
};
exports.ClientModule = ClientModule;
exports.ClientModule = ClientModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, user_profile_entity_1.UserProfile]),
            auth_module_1.AuthModule,
        ],
        controllers: [],
        providers: [
            client_user_service_1.ClientUserService,
            client_user_router_1.ClientUserRouter,
            auth_middleware_1.AuthMiddleware,
        ],
        exports: [client_user_service_1.ClientUserService],
    })
], ClientModule);


/***/ }),
/* 32 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClientUserRouter = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const nestjs_trpc_1 = __webpack_require__(7);
const zod_1 = __webpack_require__(17);
const client_user_service_1 = __webpack_require__(33);
const auth_middleware_1 = __webpack_require__(22);
// Zod schemas for validation
const clientRegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    username: zod_1.z.string().min(3),
    firstName: zod_1.z.string().min(2),
    lastName: zod_1.z.string().min(2),
    password: zod_1.z.string().min(8),
    phoneNumber: zod_1.z.string().optional(),
});
const clientLoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
const clientUpdateProfileSchema = zod_1.z.object({
    firstName: zod_1.z.string().optional(),
    lastName: zod_1.z.string().optional(),
    phoneNumber: zod_1.z.string().optional(),
    dateOfBirth: zod_1.z.string().optional(),
    avatar: zod_1.z.string().optional(),
    bio: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    postalCode: zod_1.z.string().optional(),
});
const clientUserProfileSchema = zod_1.z.object({
    id: zod_1.z.string(),
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string(),
    phoneNumber: zod_1.z.string().optional(),
    dateOfBirth: zod_1.z.date().optional(),
    avatar: zod_1.z.string().optional(),
    bio: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    postalCode: zod_1.z.string().optional(),
});
const clientUserResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    email: zod_1.z.string(),
    username: zod_1.z.string(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
    profile: clientUserProfileSchema.optional(),
});
const clientAuthResponseSchema = zod_1.z.object({
    user: clientUserResponseSchema,
    accessToken: zod_1.z.string(),
    refreshToken: zod_1.z.string().optional(),
});
const refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string(),
});
let ClientUserRouter = class ClientUserRouter {
    constructor(clientUserService) {
        this.clientUserService = clientUserService;
    }
    async register(registerDto) {
        // Ensure required fields are present for ClientRegisterDto
        const clientRegisterDto = {
            email: registerDto.email,
            username: registerDto.username,
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            password: registerDto.password,
            phoneNumber: registerDto.phoneNumber,
        };
        return await this.clientUserService.register(clientRegisterDto);
    }
    async login(loginDto) {
        // Ensure required fields are present for ClientLoginDto
        const clientLoginDto = {
            email: loginDto.email,
            password: loginDto.password,
        };
        return await this.clientUserService.login(clientLoginDto);
    }
    async getProfile(
    // Context would be injected here in a real nestjs-trpc setup
    // For now, we'll need to get the user ID from the request context
    ) {
        // This would typically get the user ID from the authenticated context
        // For now, we'll throw an error indicating this needs proper context implementation
        throw new Error('Profile endpoint requires authenticated context implementation');
    }
    async updateProfile(updateProfileDto) {
        // This would typically get the user ID from the authenticated context
        // For now, we'll throw an error indicating this needs proper context implementation
        throw new Error('Update profile endpoint requires authenticated context implementation');
    }
    async refreshToken(input) {
        return await this.clientUserService.refreshToken(input.refreshToken);
    }
};
exports.ClientUserRouter = ClientUserRouter;
tslib_1.__decorate([
    (0, nestjs_trpc_1.Mutation)({
        input: clientRegisterSchema,
        output: clientAuthResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof zod_1.z !== "undefined" && zod_1.z.infer) === "function" ? _b : Object]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], ClientUserRouter.prototype, "register", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.Mutation)({
        input: clientLoginSchema,
        output: clientAuthResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_d = typeof zod_1.z !== "undefined" && zod_1.z.infer) === "function" ? _d : Object]),
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], ClientUserRouter.prototype, "login", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware),
    (0, nestjs_trpc_1.Query)({
        output: clientUserResponseSchema,
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], ClientUserRouter.prototype, "getProfile", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware),
    (0, nestjs_trpc_1.Mutation)({
        input: clientUpdateProfileSchema,
        output: clientUserResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_g = typeof zod_1.z !== "undefined" && zod_1.z.infer) === "function" ? _g : Object]),
    tslib_1.__metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], ClientUserRouter.prototype, "updateProfile", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.Mutation)({
        input: refreshTokenSchema,
        output: clientAuthResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_j = typeof zod_1.z !== "undefined" && zod_1.z.infer) === "function" ? _j : Object]),
    tslib_1.__metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], ClientUserRouter.prototype, "refreshToken", null);
exports.ClientUserRouter = ClientUserRouter = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, common_1.Inject)(client_user_service_1.ClientUserService)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof client_user_service_1.ClientUserService !== "undefined" && client_user_service_1.ClientUserService) === "function" ? _a : Object])
], ClientUserRouter);


/***/ }),
/* 33 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClientUserService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const user_repository_1 = __webpack_require__(14);
const auth_service_1 = __webpack_require__(19);
const user_entity_1 = __webpack_require__(11);
let ClientUserService = class ClientUserService {
    constructor(userRepository, authService) {
        this.userRepository = userRepository;
        this.authService = authService;
    }
    async register(registerDto) {
        const existingUser = await this.userRepository.findByEmail(registerDto.email);
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const hashedPassword = await this.authService.hashPassword(registerDto.password);
        const userData = {
            ...registerDto,
            password: hashedPassword,
            role: user_entity_1.UserRole.USER, // Client users are always regular users
        };
        const user = await this.userRepository.create(userData);
        const userWithProfile = await this.userRepository.findWithProfile(user.id);
        const tokens = await this.authService.login(user);
        return {
            user: this.toClientUserResponse(userWithProfile || user),
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }
    async login(loginDto) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is inactive');
        }
        const userWithProfile = await this.userRepository.findWithProfile(user.id);
        const tokens = await this.authService.login(user);
        return {
            user: this.toClientUserResponse(userWithProfile || user),
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }
    async getProfile(userId) {
        const user = await this.userRepository.findWithProfile(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return this.toClientUserResponse(user);
    }
    async updateProfile(userId, updateProfileDto) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        // Convert string dateOfBirth to Date if provided
        const profileData = {
            ...updateProfileDto,
            dateOfBirth: updateProfileDto.dateOfBirth ? new Date(updateProfileDto.dateOfBirth) : undefined,
        };
        // Update the user profile using the profile update method
        const updatedProfile = await this.userRepository.updateProfile(userId, profileData);
        if (!updatedProfile) {
            throw new common_1.NotFoundException('User profile not found');
        }
        // Get the updated user with profile
        const userWithProfile = await this.userRepository.findWithProfile(userId);
        return this.toClientUserResponse(userWithProfile || user);
    }
    async refreshToken(refreshToken) {
        try {
            const tokens = await this.authService.refreshToken(refreshToken);
            const payload = await this.authService.verifyToken(tokens.accessToken);
            const user = await this.userRepository.findWithProfile(payload.sub);
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            return {
                user: this.toClientUserResponse(user),
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    toClientUserResponse(user) {
        return {
            id: user.id,
            email: user.email,
            username: user.username,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            profile: user.profile ? {
                id: user.profile.id,
                firstName: user.profile.firstName,
                lastName: user.profile.lastName,
                phoneNumber: user.profile.phoneNumber,
                dateOfBirth: user.profile.dateOfBirth,
                avatar: user.profile.avatar,
                bio: user.profile.bio,
                address: user.profile.address,
                city: user.profile.city,
                country: user.profile.country,
                postalCode: user.profile.postalCode,
            } : undefined,
        };
    }
};
exports.ClientUserService = ClientUserService;
exports.ClientUserService = ClientUserService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof user_repository_1.UserRepository !== "undefined" && user_repository_1.UserRepository) === "function" ? _a : Object, typeof (_b = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _b : Object])
], ClientUserService);


/***/ }),
/* 34 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppContext = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const jwt_1 = __webpack_require__(20);
let AppContext = class AppContext {
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    async create(opts) {
        const { req, res } = opts;
        // Extract JWT token from Authorization header
        const authHeader = req.headers.authorization;
        let user;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.substring(7);
                const payload = await this.jwtService.verifyAsync(token);
                // Create user object from JWT payload
                user = {
                    id: payload.sub,
                    email: payload.email,
                    username: payload.username,
                    role: payload.role,
                    isActive: payload.isActive,
                };
            }
            catch (error) {
                // Invalid token - user remains undefined
                console.warn('Invalid JWT token:', error.message);
            }
        }
        return {
            user,
            req,
            res,
        };
    }
};
exports.AppContext = AppContext;
exports.AppContext = AppContext = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _a : Object])
], AppContext);


/***/ }),
/* 35 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const config_1 = __webpack_require__(5);
exports["default"] = (0, config_1.registerAs)('database', () => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'quasar_db',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: process.env.NODE_ENV === 'development',
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    migrationsTableName: 'migrations',
}));


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
const common_1 = __webpack_require__(1);
const core_1 = __webpack_require__(2);
const app_module_1 = __webpack_require__(3);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Enable CORS for frontend apps
    app.enableCors({
        origin: [
            'http://localhost:3000', // Client app
            'http://localhost:4200', // Admin app
            'http://localhost:4000', // Alternative ports
        ],
        credentials: true,
    });
    // Global validation pipe
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    common_1.Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}
bootstrap();

})();

/******/ })()
;
//# sourceMappingURL=main.js.map