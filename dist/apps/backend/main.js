/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("reflect-metadata");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const config_1 = __webpack_require__(6);
const typeorm_1 = __webpack_require__(7);
const nestjs_trpc_1 = __webpack_require__(8);
const app_controller_1 = __webpack_require__(9);
const app_service_1 = __webpack_require__(10);
const user_module_1 = __webpack_require__(11);
const translation_module_1 = __webpack_require__(74);
const auth_module_1 = __webpack_require__(63);
const context_1 = __webpack_require__(61);
const database_config_1 = tslib_1.__importDefault(__webpack_require__(81));
const user_entity_1 = __webpack_require__(12);
const user_profile_entity_1 = __webpack_require__(38);
const permission_entity_1 = __webpack_require__(42);
const role_entity_1 = __webpack_require__(40);
const user_role_entity_1 = __webpack_require__(39);
const role_permission_entity_1 = __webpack_require__(41);
const translation_entity_1 = __webpack_require__(75);
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
                useFactory: (configService) => ({
                    ...configService.get('database'),
                    entities: [
                        user_entity_1.User,
                        user_profile_entity_1.UserProfile,
                        permission_entity_1.Permission,
                        role_entity_1.Role,
                        user_role_entity_1.UserRole,
                        role_permission_entity_1.RolePermission,
                        translation_entity_1.Translation
                    ],
                    autoLoadEntities: true
                }),
            }),
            auth_module_1.AuthModule,
            nestjs_trpc_1.TRPCModule.forRoot({
                context: context_1.AppContext,
                trpcOptions: {
                    router: undefined, // Will be set by TRPCModule
                    createContext: undefined, // Will be set by TRPCModule
                    onError: ({ error, type, path, input, ctx, req }) => {
                        console.error(`[TRPC] Error in ${type} ${path}:`, error);
                    },
                },
                expressOptions: {
                    createHandler: {
                        responseMeta: ({ ctx, errors }) => {
                            const error = errors[0];
                            if (!error) {
                                return {};
                            }
                            const errorCause = error.cause;
                            const httpStatus = errorCause?.httpStatus || 500;
                            return {
                                status: httpStatus,
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                            };
                        },
                    },
                },
            }),
            user_module_1.UserModule,
            translation_module_1.TranslationModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, context_1.AppContext],
    })
], AppModule);


/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("@nestjs/typeorm");

/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("nestjs-trpc");

/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppController = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const app_service_1 = __webpack_require__(10);
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
/* 10 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
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
/* 11 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const typeorm_1 = __webpack_require__(7);
const user_entity_1 = __webpack_require__(12);
const user_profile_entity_1 = __webpack_require__(38);
const permission_entity_1 = __webpack_require__(42);
const role_entity_1 = __webpack_require__(40);
const user_role_entity_1 = __webpack_require__(39);
const role_permission_entity_1 = __webpack_require__(41);
const user_repository_1 = __webpack_require__(43);
const permission_repository_1 = __webpack_require__(44);
const admin_permission_service_1 = __webpack_require__(45);
const permission_checker_service_1 = __webpack_require__(46);
const admin_user_service_1 = __webpack_require__(47);
const client_user_service_1 = __webpack_require__(53);
const admin_user_router_1 = __webpack_require__(54);
const client_user_router_1 = __webpack_require__(59);
const admin_permission_router_1 = __webpack_require__(62);
const auth_module_1 = __webpack_require__(63);
const shared_module_1 = __webpack_require__(69);
let UserModule = class UserModule {
};
exports.UserModule = UserModule;
exports.UserModule = UserModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, user_profile_entity_1.UserProfile, permission_entity_1.Permission, role_entity_1.Role, user_role_entity_1.UserRole, role_permission_entity_1.RolePermission]),
            auth_module_1.AuthModule,
            shared_module_1.SharedModule,
        ],
        controllers: [],
        providers: [
            user_repository_1.UserRepository,
            permission_repository_1.PermissionRepository,
            permission_checker_service_1.PermissionCheckerService,
            admin_permission_service_1.AdminPermissionService,
            admin_user_service_1.AdminUserService,
            client_user_service_1.ClientUserService,
            admin_user_router_1.AdminUserRouter,
            client_user_router_1.ClientUserRouter,
            admin_permission_router_1.AdminPermissionRouter,
        ],
        exports: [
            user_repository_1.UserRepository,
            permission_repository_1.PermissionRepository,
            permission_checker_service_1.PermissionCheckerService,
            admin_permission_service_1.AdminPermissionService,
            admin_user_service_1.AdminUserService,
            client_user_service_1.ClientUserService,
            admin_user_router_1.AdminUserRouter,
            client_user_router_1.ClientUserRouter,
            admin_permission_router_1.AdminPermissionRouter,
        ],
    })
], UserModule);


/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.User = void 0;
const tslib_1 = __webpack_require__(5);
const typeorm_1 = __webpack_require__(13);
const _shared_1 = __webpack_require__(14);
const user_profile_entity_1 = __webpack_require__(38);
const user_role_entity_1 = __webpack_require__(39);
let User = class User extends _shared_1.BaseEntity {
};
exports.User = User;
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
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    tslib_1.__metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
tslib_1.__decorate([
    (0, typeorm_1.OneToOne)(() => user_profile_entity_1.UserProfile, profile => profile.user),
    tslib_1.__metadata("design:type", typeof (_a = typeof user_profile_entity_1.UserProfile !== "undefined" && user_profile_entity_1.UserProfile) === "function" ? _a : Object)
], User.prototype, "profile", void 0);
tslib_1.__decorate([
    (0, typeorm_1.OneToMany)(() => user_role_entity_1.UserRole, userRole => userRole.user),
    tslib_1.__metadata("design:type", Array)
], User.prototype, "userRoles", void 0);
exports.User = User = tslib_1.__decorate([
    (0, typeorm_1.Entity)('users')
], User);


/***/ }),
/* 13 */
/***/ ((module) => {

module.exports = require("typeorm");

/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(5);
// Base entities
tslib_1.__exportStar(__webpack_require__(15), exports);
// Repository interfaces and abstracts
tslib_1.__exportStar(__webpack_require__(16), exports);
tslib_1.__exportStar(__webpack_require__(17), exports);
// Types
tslib_1.__exportStar(__webpack_require__(19), exports);
tslib_1.__exportStar(__webpack_require__(20), exports);
tslib_1.__exportStar(__webpack_require__(21), exports);
tslib_1.__exportStar(__webpack_require__(22), exports);
tslib_1.__exportStar(__webpack_require__(23), exports);
tslib_1.__exportStar(__webpack_require__(24), exports);
tslib_1.__exportStar(__webpack_require__(25), exports);
// Enums (all enums from index)
tslib_1.__exportStar(__webpack_require__(26), exports);
// Classes
tslib_1.__exportStar(__webpack_require__(32), exports);
tslib_1.__exportStar(__webpack_require__(33), exports);
tslib_1.__exportStar(__webpack_require__(36), exports);
// Error Code System Types
tslib_1.__exportStar(__webpack_require__(37), exports);


/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SoftDeletableEntity = exports.BaseEntity = void 0;
const tslib_1 = __webpack_require__(5);
const typeorm_1 = __webpack_require__(13);
class BaseEntity {
    // Lifecycle hooks
    setCreatedAt() {
        const now = new Date();
        this.createdAt = now;
        this.updatedAt = now;
    }
    setUpdatedAt() {
        this.updatedAt = new Date();
    }
    // Helper methods
    isNew() {
        return !this.id;
    }
    getAge() {
        return Date.now() - this.createdAt.getTime();
    }
    wasRecentlyCreated(minutes = 5) {
        const ageInMinutes = this.getAge() / (1000 * 60);
        return ageInMinutes <= minutes;
    }
    wasRecentlyUpdated(minutes = 5) {
        const ageInMinutes = (Date.now() - this.updatedAt.getTime()) / (1000 * 60);
        return ageInMinutes <= minutes;
    }
    toJSON() {
        return {
            id: this.id,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            version: this.version,
            createdBy: this.createdBy,
            updatedBy: this.updatedBy,
        };
    }
}
exports.BaseEntity = BaseEntity;
tslib_1.__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    tslib_1.__metadata("design:type", String)
], BaseEntity.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.CreateDateColumn)({
        name: 'created_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    }),
    tslib_1.__metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], BaseEntity.prototype, "createdAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        name: 'updated_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    }),
    tslib_1.__metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], BaseEntity.prototype, "updatedAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.VersionColumn)({
        name: 'version',
        default: 1,
    }),
    tslib_1.__metadata("design:type", Number)
], BaseEntity.prototype, "version", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        name: 'created_by',
        type: 'uuid',
        nullable: true,
    }),
    tslib_1.__metadata("design:type", String)
], BaseEntity.prototype, "createdBy", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        name: 'updated_by',
        type: 'uuid',
        nullable: true,
    }),
    tslib_1.__metadata("design:type", String)
], BaseEntity.prototype, "updatedBy", void 0);
tslib_1.__decorate([
    (0, typeorm_1.BeforeInsert)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], BaseEntity.prototype, "setCreatedAt", null);
tslib_1.__decorate([
    (0, typeorm_1.BeforeUpdate)(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], BaseEntity.prototype, "setUpdatedAt", null);
class SoftDeletableEntity extends BaseEntity {
    // Soft delete methods
    softDelete(deletedBy) {
        this.deletedAt = new Date();
        this.deletedBy = deletedBy;
    }
    restore() {
        this.deletedAt = undefined;
        this.deletedBy = undefined;
    }
    isDeleted() {
        return !!this.deletedAt;
    }
    isActive() {
        return !this.isDeleted();
    }
    toJSON() {
        return {
            ...super.toJSON(),
            deletedAt: this.deletedAt,
            deletedBy: this.deletedBy,
        };
    }
}
exports.SoftDeletableEntity = SoftDeletableEntity;
tslib_1.__decorate([
    (0, typeorm_1.DeleteDateColumn)({
        name: 'deleted_at',
        type: 'timestamp',
        nullable: true,
    }),
    tslib_1.__metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], SoftDeletableEntity.prototype, "deletedAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        name: 'deleted_by',
        type: 'uuid',
        nullable: true,
    }),
    tslib_1.__metadata("design:type", String)
], SoftDeletableEntity.prototype, "deletedBy", void 0);


/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseRepository = void 0;
const base_entity_1 = __webpack_require__(15);
const common_enums_1 = __webpack_require__(18);
class BaseRepository {
    constructor(repository) {
        this.repository = repository;
    }
    // Basic CRUD operations
    create(entity) {
        return this.repository.create(entity);
    }
    async save(entity) {
        return await this.repository.save(entity);
    }
    async saveMultiple(entities) {
        return await this.repository.save(entities);
    }
    // Find operations
    async findById(id) {
        return await this.repository.findOne({ where: { id } });
    }
    async findByIds(ids) {
        return await this.repository.findByIds(ids);
    }
    async findOne(options) {
        return await this.repository.findOne(options);
    }
    async findAll(options) {
        return await this.repository.find(options);
    }
    async findWithPagination(options) {
        const { page = 1, limit = 10, sortBy, sortOrder = common_enums_1.SortOrder.ASC, ...findOptions } = options;
        const skip = (page - 1) * limit;
        const take = limit;
        let order = {};
        if (sortBy) {
            order[sortBy] = sortOrder;
        }
        else {
            order.createdAt = common_enums_1.SortOrder.DESC;
        }
        const [data, total] = await this.repository.findAndCount({
            ...findOptions,
            skip,
            take,
            order,
        });
        const totalPages = Math.ceil(total / limit);
        const hasNext = page < totalPages;
        const hasPrevious = page > 1;
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNext,
                hasPrevious,
            },
        };
    }
    // Update operations
    async update(id, updateData) {
        await this.repository.update(id, updateData);
        return await this.findById(id);
    }
    async updateMultiple(criteria, updateData) {
        const result = await this.repository.update(criteria, updateData);
        return result.affected || 0;
    }
    // Delete operations
    async delete(id) {
        const result = await this.repository.delete(id);
        return (result.affected || 0) > 0;
    }
    async deleteMultiple(ids) {
        const result = await this.repository.delete(ids);
        return result.affected || 0;
    }
    async softDelete(id) {
        // Check if entity supports soft delete
        const entity = await this.findById(id);
        if (!entity)
            return false;
        if (this.isSoftDeletable(entity)) {
            const result = await this.repository.softDelete(id);
            return (result.affected || 0) > 0;
        }
        else {
            // Fallback to hard delete if soft delete is not supported
            return await this.delete(id);
        }
    }
    async softDeleteMultiple(ids) {
        // Check if any entity supports soft delete
        const entities = await this.findByIds(ids);
        if (entities.length === 0)
            return 0;
        if (entities.some(entity => this.isSoftDeletable(entity))) {
            const result = await this.repository.softDelete(ids);
            return result.affected || 0;
        }
        else {
            // Fallback to hard delete if soft delete is not supported
            return await this.deleteMultiple(ids);
        }
    }
    async restore(id) {
        const result = await this.repository.restore(id);
        return (result.affected || 0) > 0;
    }
    async restoreMultiple(ids) {
        const result = await this.repository.restore(ids);
        return result.affected || 0;
    }
    // Query operations
    async count(options) {
        return await this.repository.count(options);
    }
    async exists(id) {
        const count = await this.repository.count({ where: { id } });
        return count > 0;
    }
    async existsByCondition(where) {
        const count = await this.repository.count({ where });
        return count > 0;
    }
    // Transaction support
    getQueryRunner() {
        return this.repository.manager.connection.createQueryRunner();
    }
    createQueryBuilder(alias) {
        return this.repository.createQueryBuilder(alias);
    }
    // Protected helper methods
    isSoftDeletable(entity) {
        return entity instanceof base_entity_1.SoftDeletableEntity || 'deletedAt' in entity;
    }
    getRepository() {
        return this.repository;
    }
}
exports.BaseRepository = BaseRepository;


/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Currency = exports.Language = exports.ImageExtension = exports.FileType = exports.DateFormat = exports.SortOrder = exports.Environment = void 0;
/**
 * Environment enumeration
 * Defines different deployment environments
 */
var Environment;
(function (Environment) {
    Environment["DEVELOPMENT"] = "development";
    Environment["STAGING"] = "staging";
    Environment["TESTING"] = "testing";
    Environment["PRODUCTION"] = "production";
})(Environment || (exports.Environment = Environment = {}));
/**
 * Sort order enumeration
 * Defines sorting directions for queries
 */
var SortOrder;
(function (SortOrder) {
    SortOrder["ASC"] = "ASC";
    SortOrder["DESC"] = "DESC";
})(SortOrder || (exports.SortOrder = SortOrder = {}));
/**
 * Date format enumeration
 * Defines standard date formats used in the application
 */
var DateFormat;
(function (DateFormat) {
    DateFormat["ISO"] = "YYYY-MM-DDTHH:mm:ss.sssZ";
    DateFormat["DATE_ONLY"] = "YYYY-MM-DD";
    DateFormat["TIME_ONLY"] = "HH:mm:ss";
    DateFormat["DATETIME"] = "YYYY-MM-DD HH:mm:ss";
    DateFormat["READABLE"] = "MMM DD, YYYY";
    DateFormat["FULL"] = "dddd, MMMM DD, YYYY";
})(DateFormat || (exports.DateFormat = DateFormat = {}));
/**
 * File type enumeration
 * Defines supported file types for uploads
 */
var FileType;
(function (FileType) {
    FileType["IMAGE"] = "image";
    FileType["DOCUMENT"] = "document";
    FileType["VIDEO"] = "video";
    FileType["AUDIO"] = "audio";
    FileType["ARCHIVE"] = "archive";
    FileType["OTHER"] = "other";
})(FileType || (exports.FileType = FileType = {}));
/**
 * File extension enumeration for images
 */
var ImageExtension;
(function (ImageExtension) {
    ImageExtension["JPEG"] = "jpeg";
    ImageExtension["JPG"] = "jpg";
    ImageExtension["PNG"] = "png";
    ImageExtension["GIF"] = "gif";
    ImageExtension["WEBP"] = "webp";
    ImageExtension["SVG"] = "svg";
})(ImageExtension || (exports.ImageExtension = ImageExtension = {}));
/**
 * Language enumeration
 * Defines supported languages for internationalization
 */
var Language;
(function (Language) {
    Language["ENGLISH"] = "en";
    Language["VIETNAMESE"] = "vi";
    Language["SPANISH"] = "es";
    Language["FRENCH"] = "fr";
    Language["GERMAN"] = "de";
    Language["CHINESE"] = "zh";
    Language["JAPANESE"] = "ja";
})(Language || (exports.Language = Language = {}));
/**
 * Currency enumeration
 * Defines supported currencies
 */
var Currency;
(function (Currency) {
    Currency["USD"] = "USD";
    Currency["EUR"] = "EUR";
    Currency["VND"] = "VND";
    Currency["GBP"] = "GBP";
    Currency["JPY"] = "JPY";
    Currency["CNY"] = "CNY";
})(Currency || (exports.Currency = Currency = {}));


/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 20 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HttpStatusCode = void 0;
/**
 * HTTP status codes
 */
var HttpStatusCode;
(function (HttpStatusCode) {
    // Success
    HttpStatusCode[HttpStatusCode["OK"] = 200] = "OK";
    HttpStatusCode[HttpStatusCode["CREATED"] = 201] = "CREATED";
    HttpStatusCode[HttpStatusCode["ACCEPTED"] = 202] = "ACCEPTED";
    HttpStatusCode[HttpStatusCode["NO_CONTENT"] = 204] = "NO_CONTENT";
    // Client Error
    HttpStatusCode[HttpStatusCode["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HttpStatusCode[HttpStatusCode["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    HttpStatusCode[HttpStatusCode["FORBIDDEN"] = 403] = "FORBIDDEN";
    HttpStatusCode[HttpStatusCode["NOT_FOUND"] = 404] = "NOT_FOUND";
    HttpStatusCode[HttpStatusCode["METHOD_NOT_ALLOWED"] = 405] = "METHOD_NOT_ALLOWED";
    HttpStatusCode[HttpStatusCode["CONFLICT"] = 409] = "CONFLICT";
    HttpStatusCode[HttpStatusCode["UNPROCESSABLE_ENTITY"] = 422] = "UNPROCESSABLE_ENTITY";
    HttpStatusCode[HttpStatusCode["TOO_MANY_REQUESTS"] = 429] = "TOO_MANY_REQUESTS";
    // Server Error
    HttpStatusCode[HttpStatusCode["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    HttpStatusCode[HttpStatusCode["BAD_GATEWAY"] = 502] = "BAD_GATEWAY";
    HttpStatusCode[HttpStatusCode["SERVICE_UNAVAILABLE"] = 503] = "SERVICE_UNAVAILABLE";
    HttpStatusCode[HttpStatusCode["GATEWAY_TIMEOUT"] = 504] = "GATEWAY_TIMEOUT";
})(HttpStatusCode || (exports.HttpStatusCode = HttpStatusCode = {}));


/***/ }),
/* 21 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 22 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 23 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 24 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 25 */
/***/ ((__unused_webpack_module, exports) => {


/**
 * API Design Guide compliant response interfaces
 * Based on industry standards and best practices
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiErrorReasons = exports.ApiStatusCodes = void 0;
/**
 * Standard API status codes
 */
var ApiStatusCodes;
(function (ApiStatusCodes) {
    // Success codes
    ApiStatusCodes[ApiStatusCodes["OK"] = 200] = "OK";
    ApiStatusCodes[ApiStatusCodes["CREATED"] = 201] = "CREATED";
    ApiStatusCodes[ApiStatusCodes["ACCEPTED"] = 202] = "ACCEPTED";
    ApiStatusCodes[ApiStatusCodes["NO_CONTENT"] = 204] = "NO_CONTENT";
    // Client error codes
    ApiStatusCodes[ApiStatusCodes["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    ApiStatusCodes[ApiStatusCodes["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    ApiStatusCodes[ApiStatusCodes["FORBIDDEN"] = 403] = "FORBIDDEN";
    ApiStatusCodes[ApiStatusCodes["NOT_FOUND"] = 404] = "NOT_FOUND";
    ApiStatusCodes[ApiStatusCodes["METHOD_NOT_ALLOWED"] = 405] = "METHOD_NOT_ALLOWED";
    ApiStatusCodes[ApiStatusCodes["CONFLICT"] = 409] = "CONFLICT";
    ApiStatusCodes[ApiStatusCodes["UNPROCESSABLE_ENTITY"] = 422] = "UNPROCESSABLE_ENTITY";
    ApiStatusCodes[ApiStatusCodes["TOO_MANY_REQUESTS"] = 429] = "TOO_MANY_REQUESTS";
    // Server error codes
    ApiStatusCodes[ApiStatusCodes["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    ApiStatusCodes[ApiStatusCodes["NOT_IMPLEMENTED"] = 501] = "NOT_IMPLEMENTED";
    ApiStatusCodes[ApiStatusCodes["BAD_GATEWAY"] = 502] = "BAD_GATEWAY";
    ApiStatusCodes[ApiStatusCodes["SERVICE_UNAVAILABLE"] = 503] = "SERVICE_UNAVAILABLE";
    ApiStatusCodes[ApiStatusCodes["GATEWAY_TIMEOUT"] = 504] = "GATEWAY_TIMEOUT";
})(ApiStatusCodes || (exports.ApiStatusCodes = ApiStatusCodes = {}));
/**
 * Standard API error reasons
 */
var ApiErrorReasons;
(function (ApiErrorReasons) {
    // Authentication & Authorization
    ApiErrorReasons["UNAUTHENTICATED"] = "UNAUTHENTICATED";
    ApiErrorReasons["PERMISSION_DENIED"] = "PERMISSION_DENIED";
    ApiErrorReasons["INVALID_TOKEN"] = "INVALID_TOKEN";
    ApiErrorReasons["TOKEN_EXPIRED"] = "TOKEN_EXPIRED";
    // Validation
    ApiErrorReasons["INVALID_REQUEST"] = "INVALID_REQUEST";
    ApiErrorReasons["FIELD_VALIDATION_FAILED"] = "FIELD_VALIDATION_FAILED";
    ApiErrorReasons["RESOURCE_NOT_FOUND"] = "RESOURCE_NOT_FOUND";
    ApiErrorReasons["RESOURCE_ALREADY_EXISTS"] = "RESOURCE_ALREADY_EXISTS";
    // Business Logic
    ApiErrorReasons["BUSINESS_RULE_VIOLATION"] = "BUSINESS_RULE_VIOLATION";
    ApiErrorReasons["PRECONDITION_FAILED"] = "PRECONDITION_FAILED";
    ApiErrorReasons["INVALID_STATE"] = "INVALID_STATE";
    // System
    ApiErrorReasons["INTERNAL_ERROR"] = "INTERNAL_ERROR";
    ApiErrorReasons["SERVICE_UNAVAILABLE"] = "SERVICE_UNAVAILABLE";
    ApiErrorReasons["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    ApiErrorReasons["UNSUPPORTED_MEDIA_TYPE"] = "UNSUPPORTED_MEDIA_TYPE";
})(ApiErrorReasons || (exports.ApiErrorReasons = ApiErrorReasons = {}));


/***/ }),
/* 26 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(5);
// User and Role related enums
tslib_1.__exportStar(__webpack_require__(27), exports);
// Permission related enums
tslib_1.__exportStar(__webpack_require__(28), exports);
// Common application enums
tslib_1.__exportStar(__webpack_require__(18), exports);
// Status and state enums
tslib_1.__exportStar(__webpack_require__(29), exports);
// Error and message code enums
tslib_1.__exportStar(__webpack_require__(30), exports);
tslib_1.__exportStar(__webpack_require__(31), exports);


/***/ }),
/* 27 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserGender = exports.UserVerificationStatus = exports.UserAccountType = exports.UserStatus = exports.UserRole = void 0;
/**
 * User role enumeration
 * Defines the different levels of access in the system
 */
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["ADMIN"] = "admin";
    UserRole["MANAGER"] = "manager";
    UserRole["USER"] = "user";
    UserRole["GUEST"] = "guest";
})(UserRole || (exports.UserRole = UserRole = {}));
/**
 * User status enumeration
 * Defines the different states a user account can be in
 */
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "active";
    UserStatus["INACTIVE"] = "inactive";
    UserStatus["PENDING"] = "pending";
    UserStatus["SUSPENDED"] = "suspended";
    UserStatus["BANNED"] = "banned";
    UserStatus["DELETED"] = "deleted";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
/**
 * User account type enumeration
 * Defines different types of user accounts
 */
var UserAccountType;
(function (UserAccountType) {
    UserAccountType["INDIVIDUAL"] = "individual";
    UserAccountType["BUSINESS"] = "business";
    UserAccountType["ENTERPRISE"] = "enterprise";
    UserAccountType["TRIAL"] = "trial";
})(UserAccountType || (exports.UserAccountType = UserAccountType = {}));
/**
 * User verification status
 * Tracks verification state of user accounts
 */
var UserVerificationStatus;
(function (UserVerificationStatus) {
    UserVerificationStatus["UNVERIFIED"] = "unverified";
    UserVerificationStatus["EMAIL_VERIFIED"] = "email_verified";
    UserVerificationStatus["PHONE_VERIFIED"] = "phone_verified";
    UserVerificationStatus["FULLY_VERIFIED"] = "fully_verified";
})(UserVerificationStatus || (exports.UserVerificationStatus = UserVerificationStatus = {}));
/**
 * User gender enumeration
 */
var UserGender;
(function (UserGender) {
    UserGender["MALE"] = "male";
    UserGender["FEMALE"] = "female";
    UserGender["OTHER"] = "other";
    UserGender["PREFER_NOT_TO_SAY"] = "prefer_not_to_say";
})(UserGender || (exports.UserGender = UserGender = {}));


/***/ }),
/* 28 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PermissionType = exports.PermissionResource = exports.PermissionScope = exports.PermissionAction = void 0;
/**
 * Permission action enumeration
 * Defines the different actions that can be performed on resources
 */
var PermissionAction;
(function (PermissionAction) {
    PermissionAction["CREATE"] = "create";
    PermissionAction["READ"] = "read";
    PermissionAction["UPDATE"] = "update";
    PermissionAction["DELETE"] = "delete";
    PermissionAction["EXECUTE"] = "execute";
    PermissionAction["APPROVE"] = "approve";
    PermissionAction["REJECT"] = "reject";
    PermissionAction["PUBLISH"] = "publish";
    PermissionAction["ARCHIVE"] = "archive";
})(PermissionAction || (exports.PermissionAction = PermissionAction = {}));
/**
 * Permission scope enumeration
 * Defines the scope of permissions (own resources vs any resources)
 */
var PermissionScope;
(function (PermissionScope) {
    PermissionScope["OWN"] = "own";
    PermissionScope["DEPARTMENT"] = "department";
    PermissionScope["ORGANIZATION"] = "organization";
    PermissionScope["ANY"] = "any";
})(PermissionScope || (exports.PermissionScope = PermissionScope = {}));
/**
 * Permission resource enumeration
 * Defines the different resources in the system
 */
var PermissionResource;
(function (PermissionResource) {
    PermissionResource["USER"] = "user";
    PermissionResource["PROFILE"] = "profile";
    PermissionResource["ROLE"] = "role";
    PermissionResource["PERMISSION"] = "permission";
    PermissionResource["ORGANIZATION"] = "organization";
    PermissionResource["DEPARTMENT"] = "department";
    PermissionResource["PROJECT"] = "project";
    PermissionResource["REPORT"] = "report";
    PermissionResource["SETTING"] = "setting";
    PermissionResource["AUDIT_LOG"] = "audit_log";
})(PermissionResource || (exports.PermissionResource = PermissionResource = {}));
/**
 * Permission type enumeration
 * Categorizes permissions by their nature
 */
var PermissionType;
(function (PermissionType) {
    PermissionType["SYSTEM"] = "system";
    PermissionType["BUSINESS"] = "business";
    PermissionType["FUNCTIONAL"] = "functional";
    PermissionType["DATA"] = "data";
})(PermissionType || (exports.PermissionType = PermissionType = {}));


/***/ }),
/* 29 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RecordState = exports.ApprovalStatus = exports.Priority = exports.RequestStatus = exports.TaskStatus = exports.Status = void 0;
/**
 * General status enumeration
 * Can be used for any entity that needs basic status tracking
 */
var Status;
(function (Status) {
    Status["ACTIVE"] = "active";
    Status["INACTIVE"] = "inactive";
    Status["PENDING"] = "pending";
    Status["DRAFT"] = "draft";
    Status["PUBLISHED"] = "published";
    Status["ARCHIVED"] = "archived";
})(Status || (exports.Status = Status = {}));
/**
 * Task status enumeration
 * For tracking task/job progress
 */
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "pending";
    TaskStatus["IN_PROGRESS"] = "in_progress";
    TaskStatus["COMPLETED"] = "completed";
    TaskStatus["FAILED"] = "failed";
    TaskStatus["CANCELLED"] = "cancelled";
    TaskStatus["PAUSED"] = "paused";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
/**
 * Request status enumeration
 * For tracking API requests, form submissions, etc.
 */
var RequestStatus;
(function (RequestStatus) {
    RequestStatus["SUBMITTED"] = "submitted";
    RequestStatus["PROCESSING"] = "processing";
    RequestStatus["APPROVED"] = "approved";
    RequestStatus["REJECTED"] = "rejected";
    RequestStatus["CANCELLED"] = "cancelled";
    RequestStatus["EXPIRED"] = "expired";
})(RequestStatus || (exports.RequestStatus = RequestStatus = {}));
/**
 * Priority enumeration
 * For prioritizing tasks, tickets, etc.
 */
var Priority;
(function (Priority) {
    Priority["LOW"] = "low";
    Priority["MEDIUM"] = "medium";
    Priority["HIGH"] = "high";
    Priority["URGENT"] = "urgent";
    Priority["CRITICAL"] = "critical";
})(Priority || (exports.Priority = Priority = {}));
/**
 * Approval status enumeration
 * For workflows requiring approval
 */
var ApprovalStatus;
(function (ApprovalStatus) {
    ApprovalStatus["PENDING_APPROVAL"] = "pending_approval";
    ApprovalStatus["APPROVED"] = "approved";
    ApprovalStatus["REJECTED"] = "rejected";
    ApprovalStatus["REQUIRES_CHANGES"] = "requires_changes";
    ApprovalStatus["CANCELLED"] = "cancelled";
})(ApprovalStatus || (exports.ApprovalStatus = ApprovalStatus = {}));
/**
 * Record state enumeration
 * For tracking record lifecycle
 */
var RecordState;
(function (RecordState) {
    RecordState["CREATED"] = "created";
    RecordState["UPDATED"] = "updated";
    RecordState["DELETED"] = "deleted";
    RecordState["RESTORED"] = "restored";
    RecordState["LOCKED"] = "locked";
    RecordState["UNLOCKED"] = "unlocked";
})(RecordState || (exports.RecordState = RecordState = {}));


/***/ }),
/* 30 */
/***/ ((__unused_webpack_module, exports) => {


/**
 * Error Code System for SaaS Platform
 *
 * Formula: XXYYZZ
 * - XX: Module Code (10-99)
 * - YY: Operation Code (01-99)
 * - ZZ: Error Level Code (01-99)
 *
 * Example: 201001 = Product (20) + Create (01) + Validation Error (01)
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommonErrorCodes = exports.ErrorCodeGenerator = exports.ErrorLevelCode = exports.OperationCode = exports.ModuleCode = void 0;
/**
 * Module Codes (XX) - Range: 10-99
 * Defines which module/domain the error belongs to
 */
var ModuleCode;
(function (ModuleCode) {
    // Core System (10-19)
    ModuleCode[ModuleCode["USER"] = 10] = "USER";
    ModuleCode[ModuleCode["AUTH"] = 11] = "AUTH";
    ModuleCode[ModuleCode["PERMISSION"] = 12] = "PERMISSION";
    ModuleCode[ModuleCode["TRANSLATION"] = 13] = "TRANSLATION";
    // E-commerce (20-29)
    ModuleCode[ModuleCode["PRODUCT"] = 20] = "PRODUCT";
    ModuleCode[ModuleCode["CATEGORY"] = 21] = "CATEGORY";
    ModuleCode[ModuleCode["CART"] = 22] = "CART";
    ModuleCode[ModuleCode["ORDER"] = 23] = "ORDER";
    ModuleCode[ModuleCode["INVENTORY"] = 24] = "INVENTORY";
    // Content Management (30-39)
    ModuleCode[ModuleCode["NEWS"] = 30] = "NEWS";
    ModuleCode[ModuleCode["ARTICLE"] = 31] = "ARTICLE";
    ModuleCode[ModuleCode["COMMENT"] = 32] = "COMMENT";
    ModuleCode[ModuleCode["TAG"] = 33] = "TAG";
    // Subscription & Billing (40-49)
    ModuleCode[ModuleCode["SUBSCRIPTION"] = 40] = "SUBSCRIPTION";
    ModuleCode[ModuleCode["PLAN"] = 41] = "PLAN";
    ModuleCode[ModuleCode["BILLING"] = 42] = "BILLING";
    ModuleCode[ModuleCode["INVOICE"] = 43] = "INVOICE";
    // Payment System (50-59)
    ModuleCode[ModuleCode["PAYMENT"] = 50] = "PAYMENT";
    ModuleCode[ModuleCode["GATEWAY"] = 51] = "GATEWAY";
    ModuleCode[ModuleCode["TRANSACTION"] = 52] = "TRANSACTION";
    ModuleCode[ModuleCode["REFUND"] = 53] = "REFUND";
    // Communication (60-69)
    ModuleCode[ModuleCode["NOTIFICATION"] = 60] = "NOTIFICATION";
    ModuleCode[ModuleCode["EMAIL"] = 61] = "EMAIL";
    ModuleCode[ModuleCode["SMS"] = 62] = "SMS";
    // File & Media (70-79)
    ModuleCode[ModuleCode["FILE"] = 70] = "FILE";
    ModuleCode[ModuleCode["MEDIA"] = 71] = "MEDIA";
    ModuleCode[ModuleCode["UPLOAD"] = 72] = "UPLOAD";
    // Analytics & Reporting (80-89)
    ModuleCode[ModuleCode["ANALYTICS"] = 80] = "ANALYTICS";
    ModuleCode[ModuleCode["REPORT"] = 81] = "REPORT";
    ModuleCode[ModuleCode["DASHBOARD"] = 82] = "DASHBOARD";
    // System Management (90-99)
    ModuleCode[ModuleCode["SYSTEM"] = 90] = "SYSTEM";
    ModuleCode[ModuleCode["CONFIG"] = 91] = "CONFIG";
    ModuleCode[ModuleCode["AUDIT"] = 92] = "AUDIT";
})(ModuleCode || (exports.ModuleCode = ModuleCode = {}));
/**
 * Operation Codes (YY) - Range: 01-99
 * Defines what operation was being performed when the error occurred
 */
var OperationCode;
(function (OperationCode) {
    // Basic CRUD Operations (01-09)
    OperationCode[OperationCode["CREATE"] = 1] = "CREATE";
    OperationCode[OperationCode["READ"] = 2] = "READ";
    OperationCode[OperationCode["UPDATE"] = 3] = "UPDATE";
    OperationCode[OperationCode["DELETE"] = 4] = "DELETE";
    // Authentication Operations (05-09)
    OperationCode[OperationCode["LOGIN"] = 5] = "LOGIN";
    OperationCode[OperationCode["REGISTER"] = 6] = "REGISTER";
    OperationCode[OperationCode["LOGOUT"] = 7] = "LOGOUT";
    OperationCode[OperationCode["REFRESH"] = 8] = "REFRESH";
    OperationCode[OperationCode["VERIFY"] = 9] = "VERIFY";
    // Status Operations (10-19)
    OperationCode[OperationCode["ACTIVATE"] = 10] = "ACTIVATE";
    OperationCode[OperationCode["DEACTIVATE"] = 11] = "DEACTIVATE";
    OperationCode[OperationCode["APPROVE"] = 12] = "APPROVE";
    OperationCode[OperationCode["REJECT"] = 13] = "REJECT";
    OperationCode[OperationCode["PUBLISH"] = 14] = "PUBLISH";
    OperationCode[OperationCode["ARCHIVE"] = 15] = "ARCHIVE";
    OperationCode[OperationCode["RESTORE"] = 16] = "RESTORE";
    // Data Operations (17-29)
    OperationCode[OperationCode["SEARCH"] = 17] = "SEARCH";
    OperationCode[OperationCode["FILTER"] = 18] = "FILTER";
    OperationCode[OperationCode["SORT"] = 19] = "SORT";
    OperationCode[OperationCode["EXPORT"] = 20] = "EXPORT";
    OperationCode[OperationCode["IMPORT"] = 21] = "IMPORT";
    // Subscription Operations (22-29)
    OperationCode[OperationCode["SUBSCRIBE"] = 22] = "SUBSCRIBE";
    OperationCode[OperationCode["UNSUBSCRIBE"] = 23] = "UNSUBSCRIBE";
    // Commerce Operations (24-29)
    OperationCode[OperationCode["PURCHASE"] = 24] = "PURCHASE";
    OperationCode[OperationCode["REFUND"] = 25] = "REFUND";
    OperationCode[OperationCode["CANCEL"] = 26] = "CANCEL";
    // Processing Operations (27-35)
    OperationCode[OperationCode["PROCESS"] = 27] = "PROCESS";
    OperationCode[OperationCode["VALIDATE"] = 28] = "VALIDATE";
    OperationCode[OperationCode["SEND"] = 29] = "SEND";
    OperationCode[OperationCode["RECEIVE"] = 30] = "RECEIVE";
    // File Operations (31-35)
    OperationCode[OperationCode["UPLOAD"] = 31] = "UPLOAD";
    OperationCode[OperationCode["DOWNLOAD"] = 32] = "DOWNLOAD";
    OperationCode[OperationCode["BACKUP"] = 33] = "BACKUP";
    OperationCode[OperationCode["RESTORE_DATA"] = 34] = "RESTORE_DATA";
    OperationCode[OperationCode["SYNC"] = 35] = "SYNC";
})(OperationCode || (exports.OperationCode = OperationCode = {}));
/**
 * Error Level Codes (ZZ) - Range: 01-99
 * Defines the type/severity of the error
 */
var ErrorLevelCode;
(function (ErrorLevelCode) {
    // Client Errors (01-09)
    ErrorLevelCode[ErrorLevelCode["VALIDATION"] = 1] = "VALIDATION";
    ErrorLevelCode[ErrorLevelCode["AUTHORIZATION"] = 2] = "AUTHORIZATION";
    ErrorLevelCode[ErrorLevelCode["FORBIDDEN"] = 3] = "FORBIDDEN";
    ErrorLevelCode[ErrorLevelCode["NOT_FOUND"] = 4] = "NOT_FOUND";
    ErrorLevelCode[ErrorLevelCode["CONFLICT"] = 5] = "CONFLICT";
    ErrorLevelCode[ErrorLevelCode["RATE_LIMIT"] = 6] = "RATE_LIMIT";
    // Server Errors (10-19)
    ErrorLevelCode[ErrorLevelCode["SERVER_ERROR"] = 10] = "SERVER_ERROR";
    ErrorLevelCode[ErrorLevelCode["DATABASE_ERROR"] = 11] = "DATABASE_ERROR";
    ErrorLevelCode[ErrorLevelCode["NETWORK_ERROR"] = 12] = "NETWORK_ERROR";
    ErrorLevelCode[ErrorLevelCode["TIMEOUT_ERROR"] = 13] = "TIMEOUT_ERROR";
    // External Service Errors (20-29)
    ErrorLevelCode[ErrorLevelCode["EXTERNAL_API_ERROR"] = 20] = "EXTERNAL_API_ERROR";
    ErrorLevelCode[ErrorLevelCode["PAYMENT_ERROR"] = 21] = "PAYMENT_ERROR";
    ErrorLevelCode[ErrorLevelCode["EMAIL_ERROR"] = 22] = "EMAIL_ERROR";
    ErrorLevelCode[ErrorLevelCode["SMS_ERROR"] = 23] = "SMS_ERROR";
    ErrorLevelCode[ErrorLevelCode["STORAGE_ERROR"] = 24] = "STORAGE_ERROR";
    // Business Logic Errors (30-39)
    ErrorLevelCode[ErrorLevelCode["BUSINESS_LOGIC_ERROR"] = 30] = "BUSINESS_LOGIC_ERROR";
    ErrorLevelCode[ErrorLevelCode["SUBSCRIPTION_ERROR"] = 31] = "SUBSCRIPTION_ERROR";
    ErrorLevelCode[ErrorLevelCode["INVENTORY_ERROR"] = 32] = "INVENTORY_ERROR";
    ErrorLevelCode[ErrorLevelCode["PRICING_ERROR"] = 33] = "PRICING_ERROR";
    // Security Errors (40-49)
    ErrorLevelCode[ErrorLevelCode["SECURITY_ERROR"] = 40] = "SECURITY_ERROR";
    ErrorLevelCode[ErrorLevelCode["AUTHENTICATION_ERROR"] = 41] = "AUTHENTICATION_ERROR";
    ErrorLevelCode[ErrorLevelCode["TOKEN_ERROR"] = 42] = "TOKEN_ERROR";
    ErrorLevelCode[ErrorLevelCode["ENCRYPTION_ERROR"] = 43] = "ENCRYPTION_ERROR";
    // Configuration Errors (50-59)
    ErrorLevelCode[ErrorLevelCode["CONFIG_ERROR"] = 50] = "CONFIG_ERROR";
    ErrorLevelCode[ErrorLevelCode["ENVIRONMENT_ERROR"] = 51] = "ENVIRONMENT_ERROR";
    ErrorLevelCode[ErrorLevelCode["DEPENDENCY_ERROR"] = 52] = "DEPENDENCY_ERROR";
})(ErrorLevelCode || (exports.ErrorLevelCode = ErrorLevelCode = {}));
/**
 * Error Code Generator Utility
 * Generates standardized error codes using the XXYYZZ format
 */
class ErrorCodeGenerator {
    /**
     * Generate error code using XXYYZZ format
     * @param moduleCode - Module where error occurred
     * @param operationCode - Operation being performed
     * @param errorLevelCode - Type of error
     * @returns Formatted error code as string
     */
    static generate(moduleCode, operationCode, errorLevelCode) {
        const module = moduleCode.toString().padStart(2, '0');
        const operation = operationCode.toString().padStart(2, '0');
        const errorLevel = errorLevelCode.toString().padStart(2, '0');
        return `${module}${operation}${errorLevel}`;
    }
    /**
     * Parse error code back to its components
     * @param errorCode - 6-digit error code
     * @returns Object with module, operation, and error level codes
     */
    static parse(errorCode) {
        if (errorCode.length !== 6) {
            throw new Error('Error code must be exactly 6 digits');
        }
        return {
            moduleCode: parseInt(errorCode.substring(0, 2)),
            operationCode: parseInt(errorCode.substring(2, 4)),
            errorLevelCode: parseInt(errorCode.substring(4, 6))
        };
    }
}
exports.ErrorCodeGenerator = ErrorCodeGenerator;
/**
 * Common Error Code Combinations
 * Pre-defined error codes for frequently used scenarios
 */
exports.CommonErrorCodes = {
    // User Module Errors
    USER_NOT_FOUND: ErrorCodeGenerator.generate(ModuleCode.USER, OperationCode.READ, ErrorLevelCode.NOT_FOUND),
    USER_VALIDATION_ERROR: ErrorCodeGenerator.generate(ModuleCode.USER, OperationCode.CREATE, ErrorLevelCode.VALIDATION),
    USER_UNAUTHORIZED: ErrorCodeGenerator.generate(ModuleCode.USER, OperationCode.READ, ErrorLevelCode.AUTHORIZATION),
    // Auth Module Errors
    LOGIN_FAILED: ErrorCodeGenerator.generate(ModuleCode.AUTH, OperationCode.LOGIN, ErrorLevelCode.AUTHENTICATION_ERROR),
    REGISTER_CONFLICT: ErrorCodeGenerator.generate(ModuleCode.AUTH, OperationCode.REGISTER, ErrorLevelCode.CONFLICT),
    TOKEN_EXPIRED: ErrorCodeGenerator.generate(ModuleCode.AUTH, OperationCode.REFRESH, ErrorLevelCode.TOKEN_ERROR),
    // Product Module Errors
    PRODUCT_NOT_FOUND: ErrorCodeGenerator.generate(ModuleCode.PRODUCT, OperationCode.READ, ErrorLevelCode.NOT_FOUND),
    PRODUCT_OUT_OF_STOCK: ErrorCodeGenerator.generate(ModuleCode.PRODUCT, OperationCode.PURCHASE, ErrorLevelCode.INVENTORY_ERROR),
    // Payment Module Errors
    PAYMENT_FAILED: ErrorCodeGenerator.generate(ModuleCode.PAYMENT, OperationCode.PROCESS, ErrorLevelCode.PAYMENT_ERROR),
    PAYMENT_GATEWAY_ERROR: ErrorCodeGenerator.generate(ModuleCode.GATEWAY, OperationCode.PROCESS, ErrorLevelCode.EXTERNAL_API_ERROR),
    // System Errors
    INTERNAL_ERROR: ErrorCodeGenerator.generate(ModuleCode.SYSTEM, OperationCode.PROCESS, ErrorLevelCode.SERVER_ERROR),
    DATABASE_CONNECTION_ERROR: ErrorCodeGenerator.generate(ModuleCode.SYSTEM, OperationCode.PROCESS, ErrorLevelCode.DATABASE_ERROR),
};


/***/ }),
/* 31 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * Message Code System for Success/Info Messages
 *
 * Formula: XXYYZZ (same as error codes)
 * - XX: Module Code (10-99) - same as error codes
 * - YY: Operation Code (01-99) - same as error codes
 * - ZZ: Message Level Code (01-99) - different from error codes
 *
 * Example: 200101 = Product (20) + Create (01) + Success (01)
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CommonMessageCodes = exports.MessageCodeGenerator = exports.MessageLevelCode = void 0;
const error_codes_enums_1 = __webpack_require__(30);
/**
 * Message Level Codes (ZZ) - Range: 01-99
 * Defines the type of success/info message
 */
var MessageLevelCode;
(function (MessageLevelCode) {
    // Success Messages (01-09)
    MessageLevelCode[MessageLevelCode["SUCCESS"] = 1] = "SUCCESS";
    MessageLevelCode[MessageLevelCode["CREATED"] = 2] = "CREATED";
    MessageLevelCode[MessageLevelCode["UPDATED"] = 3] = "UPDATED";
    MessageLevelCode[MessageLevelCode["DELETED"] = 4] = "DELETED";
    MessageLevelCode[MessageLevelCode["PROCESSED"] = 5] = "PROCESSED";
    MessageLevelCode[MessageLevelCode["COMPLETED"] = 6] = "COMPLETED";
    MessageLevelCode[MessageLevelCode["SENT"] = 7] = "SENT";
    MessageLevelCode[MessageLevelCode["RECEIVED"] = 8] = "RECEIVED";
    MessageLevelCode[MessageLevelCode["SYNCHRONIZED"] = 9] = "SYNCHRONIZED";
    // Info Messages (10-19)
    MessageLevelCode[MessageLevelCode["INFO"] = 10] = "INFO";
    MessageLevelCode[MessageLevelCode["WARNING"] = 11] = "WARNING";
    MessageLevelCode[MessageLevelCode["NOTIFICATION"] = 12] = "NOTIFICATION";
    MessageLevelCode[MessageLevelCode["REMINDER"] = 13] = "REMINDER";
    MessageLevelCode[MessageLevelCode["CONFIRMATION"] = 14] = "CONFIRMATION";
    MessageLevelCode[MessageLevelCode["PROGRESS"] = 15] = "PROGRESS";
    MessageLevelCode[MessageLevelCode["STATUS_CHANGE"] = 16] = "STATUS_CHANGE";
    MessageLevelCode[MessageLevelCode["MAINTENANCE"] = 17] = "MAINTENANCE";
    // Process Messages (20-29)
    MessageLevelCode[MessageLevelCode["PENDING"] = 20] = "PENDING";
    MessageLevelCode[MessageLevelCode["IN_PROGRESS"] = 21] = "IN_PROGRESS";
    MessageLevelCode[MessageLevelCode["QUEUED"] = 22] = "QUEUED";
    MessageLevelCode[MessageLevelCode["SCHEDULED"] = 23] = "SCHEDULED";
    MessageLevelCode[MessageLevelCode["RETRY"] = 24] = "RETRY";
    MessageLevelCode[MessageLevelCode["CANCELLED"] = 25] = "CANCELLED";
    MessageLevelCode[MessageLevelCode["PAUSED"] = 26] = "PAUSED";
    MessageLevelCode[MessageLevelCode["RESUMED"] = 27] = "RESUMED";
    // Authentication Messages (30-39)
    MessageLevelCode[MessageLevelCode["LOGGED_IN"] = 30] = "LOGGED_IN";
    MessageLevelCode[MessageLevelCode["LOGGED_OUT"] = 31] = "LOGGED_OUT";
    MessageLevelCode[MessageLevelCode["REGISTERED"] = 32] = "REGISTERED";
    MessageLevelCode[MessageLevelCode["VERIFIED"] = 33] = "VERIFIED";
    MessageLevelCode[MessageLevelCode["PASSWORD_RESET"] = 34] = "PASSWORD_RESET";
    MessageLevelCode[MessageLevelCode["TOKEN_REFRESHED"] = 35] = "TOKEN_REFRESHED";
    // Business Logic Messages (40-49)
    MessageLevelCode[MessageLevelCode["APPROVED"] = 40] = "APPROVED";
    MessageLevelCode[MessageLevelCode["REJECTED"] = 41] = "REJECTED";
    MessageLevelCode[MessageLevelCode["PUBLISHED"] = 42] = "PUBLISHED";
    MessageLevelCode[MessageLevelCode["ARCHIVED"] = 43] = "ARCHIVED";
    MessageLevelCode[MessageLevelCode["ACTIVATED"] = 44] = "ACTIVATED";
    MessageLevelCode[MessageLevelCode["DEACTIVATED"] = 45] = "DEACTIVATED";
    // Payment Messages (50-59)
    MessageLevelCode[MessageLevelCode["PAYMENT_SUCCESS"] = 50] = "PAYMENT_SUCCESS";
    MessageLevelCode[MessageLevelCode["REFUND_PROCESSED"] = 51] = "REFUND_PROCESSED";
    MessageLevelCode[MessageLevelCode["INVOICE_GENERATED"] = 52] = "INVOICE_GENERATED";
    MessageLevelCode[MessageLevelCode["SUBSCRIPTION_ACTIVE"] = 53] = "SUBSCRIPTION_ACTIVE";
    MessageLevelCode[MessageLevelCode["SUBSCRIPTION_EXPIRED"] = 54] = "SUBSCRIPTION_EXPIRED";
    // System Messages (60-69)
    MessageLevelCode[MessageLevelCode["SYSTEM_HEALTHY"] = 60] = "SYSTEM_HEALTHY";
    MessageLevelCode[MessageLevelCode["BACKUP_COMPLETED"] = 61] = "BACKUP_COMPLETED";
    MessageLevelCode[MessageLevelCode["RESTORE_COMPLETED"] = 62] = "RESTORE_COMPLETED";
    MessageLevelCode[MessageLevelCode["MIGRATION_COMPLETED"] = 63] = "MIGRATION_COMPLETED";
    MessageLevelCode[MessageLevelCode["SYNC_COMPLETED"] = 64] = "SYNC_COMPLETED";
    // Email/SMS Messages (70-79)
    MessageLevelCode[MessageLevelCode["EMAIL_SENT"] = 70] = "EMAIL_SENT";
    MessageLevelCode[MessageLevelCode["SMS_SENT"] = 71] = "SMS_SENT";
    MessageLevelCode[MessageLevelCode["NOTIFICATION_SENT"] = 72] = "NOTIFICATION_SENT";
    // File/Upload Messages (80-89)
    MessageLevelCode[MessageLevelCode["FILE_UPLOADED"] = 80] = "FILE_UPLOADED";
    MessageLevelCode[MessageLevelCode["FILE_DELETED"] = 81] = "FILE_DELETED";
    MessageLevelCode[MessageLevelCode["FILE_PROCESSED"] = 82] = "FILE_PROCESSED";
    MessageLevelCode[MessageLevelCode["EXPORT_COMPLETED"] = 83] = "EXPORT_COMPLETED";
    MessageLevelCode[MessageLevelCode["IMPORT_COMPLETED"] = 84] = "IMPORT_COMPLETED";
})(MessageLevelCode || (exports.MessageLevelCode = MessageLevelCode = {}));
/**
 * Message Code Generator Utility
 * Generates standardized message codes using the XXYYZZ format
 */
class MessageCodeGenerator {
    /**
     * Generate message code using XXYYZZ format
     * @param moduleCode - Module where message occurred
     * @param operationCode - Operation being performed
     * @param messageLevelCode - Type of message
     * @returns Formatted message code as string
     */
    static generate(moduleCode, operationCode, messageLevelCode) {
        const module = moduleCode.toString().padStart(2, '0');
        const operation = operationCode.toString().padStart(2, '0');
        const messageLevel = messageLevelCode.toString().padStart(2, '0');
        return `${module}${operation}${messageLevel}`;
    }
    /**
     * Parse message code back to its components
     * @param messageCode - 6-digit message code
     * @returns Object with module, operation, and message level codes
     */
    static parse(messageCode) {
        if (messageCode.length !== 6) {
            throw new Error('Message code must be exactly 6 digits');
        }
        return {
            moduleCode: parseInt(messageCode.substring(0, 2)),
            operationCode: parseInt(messageCode.substring(2, 4)),
            messageLevelCode: parseInt(messageCode.substring(4, 6))
        };
    }
}
exports.MessageCodeGenerator = MessageCodeGenerator;
/**
 * Common Message Code Combinations
 * Pre-defined message codes for frequently used scenarios
 */
exports.CommonMessageCodes = {
    // User Module Messages
    USER_CREATED: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.USER, error_codes_enums_1.OperationCode.CREATE, MessageLevelCode.CREATED),
    USER_UPDATED: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.USER, error_codes_enums_1.OperationCode.UPDATE, MessageLevelCode.UPDATED),
    USER_DELETED: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.USER, error_codes_enums_1.OperationCode.DELETE, MessageLevelCode.DELETED),
    USER_ACTIVATED: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.USER, error_codes_enums_1.OperationCode.ACTIVATE, MessageLevelCode.ACTIVATED),
    // Auth Module Messages
    LOGIN_SUCCESS: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.AUTH, error_codes_enums_1.OperationCode.LOGIN, MessageLevelCode.LOGGED_IN),
    LOGOUT_SUCCESS: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.AUTH, error_codes_enums_1.OperationCode.LOGOUT, MessageLevelCode.LOGGED_OUT),
    REGISTER_SUCCESS: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.AUTH, error_codes_enums_1.OperationCode.REGISTER, MessageLevelCode.REGISTERED),
    TOKEN_REFRESHED: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.AUTH, error_codes_enums_1.OperationCode.REFRESH, MessageLevelCode.TOKEN_REFRESHED),
    EMAIL_VERIFIED: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.AUTH, error_codes_enums_1.OperationCode.VERIFY, MessageLevelCode.VERIFIED),
    // Product Module Messages
    PRODUCT_CREATED: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.PRODUCT, error_codes_enums_1.OperationCode.CREATE, MessageLevelCode.CREATED),
    PRODUCT_UPDATED: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.PRODUCT, error_codes_enums_1.OperationCode.UPDATE, MessageLevelCode.UPDATED),
    PRODUCT_DELETED: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.PRODUCT, error_codes_enums_1.OperationCode.DELETE, MessageLevelCode.DELETED),
    PRODUCT_PUBLISHED: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.PRODUCT, error_codes_enums_1.OperationCode.PUBLISH, MessageLevelCode.PUBLISHED),
    // Order Module Messages
    ORDER_CREATED: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.ORDER, error_codes_enums_1.OperationCode.CREATE, MessageLevelCode.CREATED),
    ORDER_UPDATED: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.ORDER, error_codes_enums_1.OperationCode.UPDATE, MessageLevelCode.UPDATED),
    ORDER_PROCESSED: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.ORDER, error_codes_enums_1.OperationCode.PROCESS, MessageLevelCode.PROCESSED),
    ORDER_CANCELLED: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.ORDER, error_codes_enums_1.OperationCode.CANCEL, MessageLevelCode.CANCELLED),
    // Payment Module Messages
    PAYMENT_SUCCESS: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.PAYMENT, error_codes_enums_1.OperationCode.PROCESS, MessageLevelCode.PAYMENT_SUCCESS),
    REFUND_PROCESSED: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.REFUND, error_codes_enums_1.OperationCode.PROCESS, MessageLevelCode.REFUND_PROCESSED),
    // Subscription Module Messages
    SUBSCRIPTION_CREATED: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.SUBSCRIPTION, error_codes_enums_1.OperationCode.CREATE, MessageLevelCode.CREATED),
    SUBSCRIPTION_ACTIVATED: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.SUBSCRIPTION, error_codes_enums_1.OperationCode.ACTIVATE, MessageLevelCode.SUBSCRIPTION_ACTIVE),
    SUBSCRIPTION_CANCELLED: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.SUBSCRIPTION, error_codes_enums_1.OperationCode.CANCEL, MessageLevelCode.CANCELLED),
    // News Module Messages
    ARTICLE_PUBLISHED: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.ARTICLE, error_codes_enums_1.OperationCode.PUBLISH, MessageLevelCode.PUBLISHED),
    ARTICLE_ARCHIVED: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.ARTICLE, error_codes_enums_1.OperationCode.ARCHIVE, MessageLevelCode.ARCHIVED),
    COMMENT_APPROVED: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.COMMENT, error_codes_enums_1.OperationCode.APPROVE, MessageLevelCode.APPROVED),
    // File Module Messages
    FILE_UPLOADED: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.FILE, error_codes_enums_1.OperationCode.UPLOAD, MessageLevelCode.FILE_UPLOADED),
    FILE_DELETED: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.FILE, error_codes_enums_1.OperationCode.DELETE, MessageLevelCode.FILE_DELETED),
    EXPORT_COMPLETED: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.SYSTEM, error_codes_enums_1.OperationCode.EXPORT, MessageLevelCode.EXPORT_COMPLETED),
    IMPORT_COMPLETED: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.SYSTEM, error_codes_enums_1.OperationCode.IMPORT, MessageLevelCode.IMPORT_COMPLETED),
    // System Messages
    SYSTEM_HEALTHY: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.SYSTEM, error_codes_enums_1.OperationCode.PROCESS, MessageLevelCode.SYSTEM_HEALTHY),
    BACKUP_COMPLETED: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.SYSTEM, error_codes_enums_1.OperationCode.BACKUP, MessageLevelCode.BACKUP_COMPLETED),
    SYNC_COMPLETED: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.SYSTEM, error_codes_enums_1.OperationCode.SYNC, MessageLevelCode.SYNC_COMPLETED),
    // Email/Notification Messages
    EMAIL_SENT: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.EMAIL, error_codes_enums_1.OperationCode.SEND, MessageLevelCode.EMAIL_SENT),
    SMS_SENT: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.SMS, error_codes_enums_1.OperationCode.SEND, MessageLevelCode.SMS_SENT),
    NOTIFICATION_SENT: MessageCodeGenerator.generate(error_codes_enums_1.ModuleCode.NOTIFICATION, error_codes_enums_1.OperationCode.SEND, MessageLevelCode.NOTIFICATION_SENT),
};


/***/ }),
/* 32 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiResponse = void 0;
const common_1 = __webpack_require__(2);
class ApiResponse {
    constructor(success, message, statusCode = common_1.HttpStatus.OK, data, error, path, meta) {
        this.success = success;
        this.message = message;
        this.statusCode = statusCode;
        this.data = data;
        this.error = error;
        this.path = path;
        this.meta = meta;
        this.timestamp = new Date().toISOString();
    }
    // Static factory methods for common response patterns
    static success(data, message = 'Operation completed successfully', statusCode = common_1.HttpStatus.OK, meta) {
        return new ApiResponse(true, message, statusCode, data, undefined, undefined, meta);
    }
    static error(message, statusCode = common_1.HttpStatus.INTERNAL_SERVER_ERROR, error, path, meta) {
        return new ApiResponse(false, message, statusCode, null, error, path, meta);
    }
    static created(data, message = 'Resource created successfully', meta) {
        return new ApiResponse(true, message, common_1.HttpStatus.CREATED, data, undefined, undefined, meta);
    }
    static noContent(message = 'Operation completed successfully') {
        return new ApiResponse(true, message, common_1.HttpStatus.NO_CONTENT);
    }
    static badRequest(message = 'Bad request', error, path) {
        return new ApiResponse(false, message, common_1.HttpStatus.BAD_REQUEST, null, error, path);
    }
    static unauthorized(message = 'Unauthorized access', error, path) {
        return new ApiResponse(false, message, common_1.HttpStatus.UNAUTHORIZED, null, error, path);
    }
    static forbidden(message = 'Access forbidden', error, path) {
        return new ApiResponse(false, message, common_1.HttpStatus.FORBIDDEN, null, error, path);
    }
    static notFound(message = 'Resource not found', error, path) {
        return new ApiResponse(false, message, common_1.HttpStatus.NOT_FOUND, null, error, path);
    }
    static conflict(message = 'Resource already exists', error, path) {
        return new ApiResponse(false, message, common_1.HttpStatus.CONFLICT, null, error, path);
    }
    static validationError(message = 'Validation failed', error, path) {
        return new ApiResponse(false, message, common_1.HttpStatus.UNPROCESSABLE_ENTITY, null, error, path);
    }
    // Helper methods
    setPath(path) {
        this.path = path;
        return this;
    }
    addMeta(key, value) {
        if (!this.meta) {
            this.meta = {};
        }
        this.meta[key] = value;
        return this;
    }
    setRequestId(requestId) {
        return this.addMeta('requestId', requestId);
    }
    setVersion(version) {
        return this.addMeta('version', version);
    }
    // Convert to plain object for serialization
    toJSON() {
        return {
            success: this.success,
            message: this.message,
            data: this.data,
            error: this.error,
            timestamp: this.timestamp,
            path: this.path,
            statusCode: this.statusCode,
            meta: this.meta,
        };
    }
}
exports.ApiResponse = ApiResponse;


/***/ }),
/* 33 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PaginatedResponseDto = exports.PaginationMetaDto = exports.FilterPaginationDto = exports.DateRangePaginationDto = exports.SearchPaginationDto = exports.PaginationDto = void 0;
const tslib_1 = __webpack_require__(5);
const class_transformer_1 = __webpack_require__(34);
const class_validator_1 = __webpack_require__(35);
const common_enums_1 = __webpack_require__(18);
class PaginationDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
        this.sortOrder = common_enums_1.SortOrder.ASC;
    }
    // Calculate skip value for database queries
    get skip() {
        return ((this.page || 1) - 1) * (this.limit || 10);
    }
    // Get offset for pagination
    get offset() {
        return this.skip;
    }
    // Get take value for database queries
    get take() {
        return this.limit || 10;
    }
}
exports.PaginationDto = PaginationDto;
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'Page must be an integer' }),
    (0, class_validator_1.Min)(1, { message: 'Page must be greater than 0' }),
    tslib_1.__metadata("design:type", Number)
], PaginationDto.prototype, "page", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'Limit must be an integer' }),
    (0, class_validator_1.Min)(1, { message: 'Limit must be greater than 0' }),
    (0, class_validator_1.Max)(100, { message: 'Limit cannot exceed 100' }),
    tslib_1.__metadata("design:type", Number)
], PaginationDto.prototype, "limit", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Sort field must be a string' }),
    tslib_1.__metadata("design:type", String)
], PaginationDto.prototype, "sortBy", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(common_enums_1.SortOrder, { message: 'Sort order must be ASC or DESC' }),
    tslib_1.__metadata("design:type", typeof (_a = typeof common_enums_1.SortOrder !== "undefined" && common_enums_1.SortOrder) === "function" ? _a : Object)
], PaginationDto.prototype, "sortOrder", void 0);
class SearchPaginationDto extends PaginationDto {
}
exports.SearchPaginationDto = SearchPaginationDto;
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Search query must be a string' }),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    tslib_1.__metadata("design:type", String)
], SearchPaginationDto.prototype, "search", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Search field must be a string' }),
    tslib_1.__metadata("design:type", String)
], SearchPaginationDto.prototype, "searchField", void 0);
class DateRangePaginationDto extends PaginationDto {
}
exports.DateRangePaginationDto = DateRangePaginationDto;
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    tslib_1.__metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], DateRangePaginationDto.prototype, "startDate", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    tslib_1.__metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], DateRangePaginationDto.prototype, "endDate", void 0);
class FilterPaginationDto extends PaginationDto {
    constructor() {
        super(...arguments);
        this.filters = {};
    }
}
exports.FilterPaginationDto = FilterPaginationDto;
tslib_1.__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            }
            catch {
                return {};
            }
        }
        return value || {};
    }),
    tslib_1.__metadata("design:type", typeof (_d = typeof Record !== "undefined" && Record) === "function" ? _d : Object)
], FilterPaginationDto.prototype, "filters", void 0);
// Response DTOs
class PaginationMetaDto {
    constructor(total, page, limit) {
        this.total = total;
        this.page = page;
        this.limit = limit;
        this.totalPages = Math.ceil(total / limit);
        this.hasNext = page < this.totalPages;
        this.hasPrevious = page > 1;
    }
}
exports.PaginationMetaDto = PaginationMetaDto;
class PaginatedResponseDto {
    constructor(data, meta) {
        this.data = data;
        this.meta = meta;
    }
    static create(data, total, page, limit) {
        const meta = new PaginationMetaDto(total, page, limit);
        return new PaginatedResponseDto(data, meta);
    }
}
exports.PaginatedResponseDto = PaginatedResponseDto;


/***/ }),
/* 34 */
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),
/* 35 */
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),
/* 36 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseService = void 0;
const common_1 = __webpack_require__(2);
class BaseService {
    constructor(repository, context) {
        this.repository = repository;
        this.logger = new common_1.Logger(context);
    }
    // Create operations
    async create(createData) {
        try {
            this.logger.debug(`Creating new entity with data: ${JSON.stringify(createData)}`);
            const entity = this.repository.create(createData);
            const savedEntity = await this.repository.save(entity);
            this.logger.debug(`Successfully created entity with ID: ${savedEntity.id}`);
            return savedEntity;
        }
        catch (error) {
            this.logger.error(`Failed to create entity: ${error.message}`, error.stack);
            throw error;
        }
    }
    async createMultiple(createDataArray) {
        try {
            this.logger.debug(`Creating ${createDataArray.length} entities`);
            const entities = createDataArray.map(data => this.repository.create(data));
            const savedEntities = await this.repository.saveMultiple(entities);
            this.logger.debug(`Successfully created ${savedEntities.length} entities`);
            return savedEntities;
        }
        catch (error) {
            this.logger.error(`Failed to create multiple entities: ${error.message}`, error.stack);
            throw error;
        }
    }
    // Read operations
    async findById(id) {
        try {
            this.logger.debug(`Finding entity by ID: ${id}`);
            const entity = await this.repository.findById(id);
            if (!entity) {
                this.logger.debug(`Entity with ID ${id} not found`);
            }
            return entity;
        }
        catch (error) {
            this.logger.error(`Failed to find entity by ID ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findByIdOrFail(id) {
        const entity = await this.findById(id);
        if (!entity) {
            const error = new Error(`Entity with ID ${id} not found`);
            this.logger.error(error.message);
            throw error;
        }
        return entity;
    }
    async findAll(options) {
        try {
            this.logger.debug('Finding all entities with options:', JSON.stringify(options));
            const entities = await this.repository.findAll(options);
            this.logger.debug(`Found ${entities.length} entities`);
            return entities;
        }
        catch (error) {
            this.logger.error(`Failed to find all entities: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findOne(options) {
        try {
            this.logger.debug('Finding one entity with options:', JSON.stringify(options));
            return await this.repository.findOne(options);
        }
        catch (error) {
            this.logger.error(`Failed to find one entity: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findWithPagination(options) {
        try {
            this.logger.debug('Finding entities with pagination:', JSON.stringify(options));
            const result = await this.repository.findWithPagination(options);
            this.logger.debug(`Found ${result.data.length} entities out of ${result.meta.total} total`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to find entities with pagination: ${error.message}`, error.stack);
            throw error;
        }
    }
    // Update operations
    async update(id, updateData) {
        try {
            this.logger.debug(`Updating entity ${id} with data:`, JSON.stringify(updateData));
            const entity = await this.repository.update(id, updateData);
            if (entity) {
                this.logger.debug(`Successfully updated entity with ID: ${id}`);
            }
            else {
                this.logger.warn(`Entity with ID ${id} not found for update`);
            }
            return entity;
        }
        catch (error) {
            this.logger.error(`Failed to update entity ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async updateOrFail(id, updateData) {
        const entity = await this.update(id, updateData);
        if (!entity) {
            const error = new Error(`Entity with ID ${id} not found for update`);
            this.logger.error(error.message);
            throw error;
        }
        return entity;
    }
    // Delete operations
    async delete(id) {
        try {
            this.logger.debug(`Deleting entity with ID: ${id}`);
            const deleted = await this.repository.delete(id);
            if (deleted) {
                this.logger.debug(`Successfully deleted entity with ID: ${id}`);
            }
            else {
                this.logger.warn(`Entity with ID ${id} not found for deletion`);
            }
            return deleted;
        }
        catch (error) {
            this.logger.error(`Failed to delete entity ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async softDelete(id) {
        try {
            this.logger.debug(`Soft deleting entity with ID: ${id}`);
            const deleted = await this.repository.softDelete(id);
            if (deleted) {
                this.logger.debug(`Successfully soft deleted entity with ID: ${id}`);
            }
            else {
                this.logger.warn(`Entity with ID ${id} not found for soft deletion`);
            }
            return deleted;
        }
        catch (error) {
            this.logger.error(`Failed to soft delete entity ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async restore(id) {
        try {
            this.logger.debug(`Restoring entity with ID: ${id}`);
            const restored = await this.repository.restore(id);
            if (restored) {
                this.logger.debug(`Successfully restored entity with ID: ${id}`);
            }
            else {
                this.logger.warn(`Entity with ID ${id} not found for restoration`);
            }
            return restored;
        }
        catch (error) {
            this.logger.error(`Failed to restore entity ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    // Utility operations
    async exists(id) {
        try {
            return await this.repository.exists(id);
        }
        catch (error) {
            this.logger.error(`Failed to check if entity ${id} exists: ${error.message}`, error.stack);
            throw error;
        }
    }
    async count(options) {
        try {
            const count = await this.repository.count(options);
            this.logger.debug(`Counted ${count} entities`);
            return count;
        }
        catch (error) {
            this.logger.error(`Failed to count entities: ${error.message}`, error.stack);
            throw error;
        }
    }
    // Protected helper methods for subclasses
    logOperation(operation, data) {
        this.logger.debug(`${operation}:`, data ? JSON.stringify(data) : '');
    }
    logError(operation, error) {
        this.logger.error(`${operation} failed: ${error.message}`, error.stack);
    }
}
exports.BaseService = BaseService;


/***/ }),
/* 37 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 38 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserProfile = void 0;
const tslib_1 = __webpack_require__(5);
const typeorm_1 = __webpack_require__(13);
const _shared_1 = __webpack_require__(14);
const user_entity_1 = __webpack_require__(12);
let UserProfile = class UserProfile extends _shared_1.BaseEntity {
};
exports.UserProfile = UserProfile;
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
    (0, typeorm_1.Column)({ name: 'user_id' }),
    tslib_1.__metadata("design:type", String)
], UserProfile.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, user => user.profile),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    tslib_1.__metadata("design:type", typeof (_b = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _b : Object)
], UserProfile.prototype, "user", void 0);
exports.UserProfile = UserProfile = tslib_1.__decorate([
    (0, typeorm_1.Entity)('user_profiles')
], UserProfile);


/***/ }),
/* 39 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserRole = void 0;
const tslib_1 = __webpack_require__(5);
const typeorm_1 = __webpack_require__(13);
const _shared_1 = __webpack_require__(14);
const user_entity_1 = __webpack_require__(12);
const role_entity_1 = __webpack_require__(40);
let UserRole = class UserRole extends _shared_1.BaseEntity {
};
exports.UserRole = UserRole;
tslib_1.__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    tslib_1.__metadata("design:type", String)
], UserRole.prototype, "userId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ name: 'role_id' }),
    tslib_1.__metadata("design:type", String)
], UserRole.prototype, "roleId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    tslib_1.__metadata("design:type", Boolean)
], UserRole.prototype, "isActive", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    tslib_1.__metadata("design:type", typeof (_a = typeof Date !== "undefined" && Date) === "function" ? _a : Object)
], UserRole.prototype, "assignedAt", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_by', nullable: true }),
    tslib_1.__metadata("design:type", String)
], UserRole.prototype, "assignedBy", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.userRoles),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    tslib_1.__metadata("design:type", typeof (_b = typeof user_entity_1.User !== "undefined" && user_entity_1.User) === "function" ? _b : Object)
], UserRole.prototype, "user", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => role_entity_1.Role, role => role.userRoles),
    (0, typeorm_1.JoinColumn)({ name: 'role_id' }),
    tslib_1.__metadata("design:type", typeof (_c = typeof role_entity_1.Role !== "undefined" && role_entity_1.Role) === "function" ? _c : Object)
], UserRole.prototype, "role", void 0);
exports.UserRole = UserRole = tslib_1.__decorate([
    (0, typeorm_1.Entity)('user_roles'),
    (0, typeorm_1.Index)(['userId', 'roleId'], { unique: true })
], UserRole);


/***/ }),
/* 40 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Role = void 0;
const tslib_1 = __webpack_require__(5);
const typeorm_1 = __webpack_require__(13);
const _shared_1 = __webpack_require__(14);
const role_permission_entity_1 = __webpack_require__(41);
const user_role_entity_1 = __webpack_require__(39);
let Role = class Role extends _shared_1.BaseEntity {
};
exports.Role = Role;
tslib_1.__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    tslib_1.__metadata("design:type", String)
], Role.prototype, "name", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: _shared_1.UserRole,
        unique: true
    }),
    tslib_1.__metadata("design:type", typeof (_a = typeof _shared_1.UserRole !== "undefined" && _shared_1.UserRole) === "function" ? _a : Object)
], Role.prototype, "code", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], Role.prototype, "description", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    tslib_1.__metadata("design:type", Boolean)
], Role.prototype, "isActive", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ name: 'is_default', default: false }),
    tslib_1.__metadata("design:type", Boolean)
], Role.prototype, "isDefault", void 0);
tslib_1.__decorate([
    (0, typeorm_1.OneToMany)(() => role_permission_entity_1.RolePermission, rolePermission => rolePermission.role),
    tslib_1.__metadata("design:type", Array)
], Role.prototype, "rolePermissions", void 0);
tslib_1.__decorate([
    (0, typeorm_1.OneToMany)(() => user_role_entity_1.UserRole, userRole => userRole.role),
    tslib_1.__metadata("design:type", Array)
], Role.prototype, "userRoles", void 0);
exports.Role = Role = tslib_1.__decorate([
    (0, typeorm_1.Entity)('roles')
], Role);


/***/ }),
/* 41 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RolePermission = void 0;
const tslib_1 = __webpack_require__(5);
const typeorm_1 = __webpack_require__(13);
const _shared_1 = __webpack_require__(14);
const permission_entity_1 = __webpack_require__(42);
const role_entity_1 = __webpack_require__(40);
let RolePermission = class RolePermission extends _shared_1.BaseEntity {
};
exports.RolePermission = RolePermission;
tslib_1.__decorate([
    (0, typeorm_1.Column)({ name: 'role_id' }),
    tslib_1.__metadata("design:type", String)
], RolePermission.prototype, "roleId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ name: 'permission_id' }),
    tslib_1.__metadata("design:type", String)
], RolePermission.prototype, "permissionId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    tslib_1.__metadata("design:type", Boolean)
], RolePermission.prototype, "isActive", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => role_entity_1.Role, role => role.rolePermissions),
    (0, typeorm_1.JoinColumn)({ name: 'role_id' }),
    tslib_1.__metadata("design:type", typeof (_a = typeof role_entity_1.Role !== "undefined" && role_entity_1.Role) === "function" ? _a : Object)
], RolePermission.prototype, "role", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => permission_entity_1.Permission, permission => permission.rolePermissions),
    (0, typeorm_1.JoinColumn)({ name: 'permission_id' }),
    tslib_1.__metadata("design:type", typeof (_b = typeof permission_entity_1.Permission !== "undefined" && permission_entity_1.Permission) === "function" ? _b : Object)
], RolePermission.prototype, "permission", void 0);
exports.RolePermission = RolePermission = tslib_1.__decorate([
    (0, typeorm_1.Entity)('role_permissions'),
    (0, typeorm_1.Index)(['roleId', 'permissionId'], { unique: true })
], RolePermission);


/***/ }),
/* 42 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Permission = void 0;
const tslib_1 = __webpack_require__(5);
const typeorm_1 = __webpack_require__(13);
const _shared_1 = __webpack_require__(14);
const role_permission_entity_1 = __webpack_require__(41);
let Permission = class Permission extends _shared_1.BaseEntity {
};
exports.Permission = Permission;
tslib_1.__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    tslib_1.__metadata("design:type", String)
], Permission.prototype, "name", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], Permission.prototype, "resource", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: _shared_1.PermissionAction
    }),
    tslib_1.__metadata("design:type", typeof (_a = typeof _shared_1.PermissionAction !== "undefined" && _shared_1.PermissionAction) === "function" ? _a : Object)
], Permission.prototype, "action", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: _shared_1.PermissionScope
    }),
    tslib_1.__metadata("design:type", typeof (_b = typeof _shared_1.PermissionScope !== "undefined" && _shared_1.PermissionScope) === "function" ? _b : Object)
], Permission.prototype, "scope", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], Permission.prototype, "description", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, default: ['*'] }),
    tslib_1.__metadata("design:type", Array)
], Permission.prototype, "attributes", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    tslib_1.__metadata("design:type", Boolean)
], Permission.prototype, "isActive", void 0);
tslib_1.__decorate([
    (0, typeorm_1.OneToMany)(() => role_permission_entity_1.RolePermission, rolePermission => rolePermission.permission),
    tslib_1.__metadata("design:type", Array)
], Permission.prototype, "rolePermissions", void 0);
exports.Permission = Permission = tslib_1.__decorate([
    (0, typeorm_1.Entity)('permissions')
], Permission);


/***/ }),
/* 43 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserRepository = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const typeorm_1 = __webpack_require__(7);
const typeorm_2 = __webpack_require__(13);
const _shared_1 = __webpack_require__(14);
const user_entity_1 = __webpack_require__(12);
const user_profile_entity_1 = __webpack_require__(38);
let UserRepository = class UserRepository extends _shared_1.BaseRepository {
    constructor(userRepository, userProfileRepository) {
        super(userRepository);
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
    }
    async createUser(createUserDto) {
        const { firstName, lastName, phoneNumber, role, ...userData } = createUserDto;
        // Create user first
        const userToCreate = {
            ...userData,
            role: role ? role : _shared_1.UserRole.USER
        };
        const user = this.repository.create(userToCreate);
        const savedUser = await this.repository.save(user);
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
        return await this.repository.find({
            relations: ['profile']
        });
    }
    async findByEmail(email) {
        return await this.repository.findOne({
            where: { email }
        });
    }
    async findByUsername(username) {
        return await this.repository.findOne({
            where: { username }
        });
    }
    async findWithProfile(id) {
        return await this.repository.findOne({
            where: { id },
            relations: ['profile']
        });
    }
    async findWithRoles(id) {
        return await this.repository.findOne({
            where: { id },
            relations: ['userRoles', 'userRoles.role']
        });
    }
    async update(id, updateUserDto) {
        const updateData = {
            ...updateUserDto,
            ...(updateUserDto.role && { role: updateUserDto.role })
        };
        await this.repository.update(id, updateData);
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
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    tslib_1.__param(1, (0, typeorm_1.InjectRepository)(user_profile_entity_1.UserProfile)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object])
], UserRepository);


/***/ }),
/* 44 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PermissionRepository = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const typeorm_1 = __webpack_require__(7);
const typeorm_2 = __webpack_require__(13);
const _shared_1 = __webpack_require__(14);
const permission_entity_1 = __webpack_require__(42);
const role_permission_entity_1 = __webpack_require__(41);
let PermissionRepository = class PermissionRepository extends _shared_1.BaseRepository {
    constructor(permissionRepository, rolePermissionRepository) {
        super(permissionRepository);
        this.permissionRepository = permissionRepository;
        this.rolePermissionRepository = rolePermissionRepository;
    }
    // Permission CRUD
    async createPermission(createPermissionDto) {
        const permission = this.repository.create({
            ...createPermissionDto,
            attributes: createPermissionDto.attributes || ['*']
        });
        return await this.repository.save(permission);
    }
    async findAllPermissions(filter) {
        const queryBuilder = this.repository.createQueryBuilder('permission');
        if (filter?.resource) {
            queryBuilder.andWhere('permission.resource = :resource', { resource: filter.resource });
        }
        if (filter?.action) {
            queryBuilder.andWhere('permission.action = :action', { action: filter.action });
        }
        if (filter?.scope) {
            queryBuilder.andWhere('permission.scope = :scope', { scope: filter.scope });
        }
        if (filter?.isActive !== undefined) {
            queryBuilder.andWhere('permission.isActive = :isActive', { isActive: filter.isActive });
        }
        return await queryBuilder.getMany();
    }
    async findPermissionById(id) {
        return await this.repository.findOne({
            where: { id }
        });
    }
    async findPermissionByName(name) {
        return await this.repository.findOne({
            where: { name }
        });
    }
    async updatePermission(id, updatePermissionDto) {
        await this.repository.update(id, updatePermissionDto);
        return await this.findPermissionById(id);
    }
    async deletePermission(id) {
        const result = await this.repository.delete(id);
        return result.affected > 0;
    }
    // Role Permission management
    async assignPermissionToRole(createRolePermissionDto) {
        // Check if the role-permission relationship already exists
        const existing = await this.rolePermissionRepository.findOne({
            where: {
                roleId: createRolePermissionDto.roleId,
                permissionId: createRolePermissionDto.permissionId
            }
        });
        if (existing) {
            // If it exists but is inactive, reactivate it
            if (!existing.isActive) {
                existing.isActive = true;
                return await this.rolePermissionRepository.save(existing);
            }
            return existing;
        }
        const rolePermission = this.rolePermissionRepository.create(createRolePermissionDto);
        return await this.rolePermissionRepository.save(rolePermission);
    }
    async removePermissionFromRole(roleId, permissionId) {
        const result = await this.rolePermissionRepository.delete({
            roleId,
            permissionId
        });
        return result.affected > 0;
    }
    async findPermissionsByRole(roleId) {
        const rolePermissions = await this.rolePermissionRepository.find({
            where: {
                roleId,
                isActive: true
            },
            relations: ['permission']
        });
        return rolePermissions
            .map(rp => rp.permission)
            .filter(permission => permission.isActive);
    }
    async findRolePermissions(roleId) {
        return await this.rolePermissionRepository.find({
            where: {
                roleId,
                isActive: true
            },
            relations: ['permission']
        });
    }
    // Permission checking
    async hasPermission(roleId, resource, action, scope) {
        const permission = await this.getPermission(roleId, resource, action, scope);
        return permission !== null;
    }
    async getPermission(roleId, resource, action, scope) {
        const rolePermission = await this.rolePermissionRepository
            .createQueryBuilder('rp')
            .innerJoin('rp.permission', 'permission')
            .where('rp.roleId = :roleId', { roleId })
            .andWhere('rp.isActive = :isActive', { isActive: true })
            .andWhere('permission.resource = :resource', { resource })
            .andWhere('permission.action = :action', { action })
            .andWhere('permission.scope = :scope', { scope })
            .andWhere('permission.isActive = :permissionActive', { permissionActive: true })
            .select(['rp', 'permission'])
            .getOne();
        return rolePermission?.permission || null;
    }
};
exports.PermissionRepository = PermissionRepository;
exports.PermissionRepository = PermissionRepository = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    tslib_1.__param(1, (0, typeorm_1.InjectRepository)(role_permission_entity_1.RolePermission)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object])
], PermissionRepository);


/***/ }),
/* 45 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminPermissionService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const typeorm_1 = __webpack_require__(7);
const typeorm_2 = __webpack_require__(13);
const permission_repository_1 = __webpack_require__(44);
const role_entity_1 = __webpack_require__(40);
const permission_checker_service_1 = __webpack_require__(46);
let AdminPermissionService = class AdminPermissionService {
    constructor(permissionRepository, permissionChecker, roleRepository) {
        this.permissionRepository = permissionRepository;
        this.permissionChecker = permissionChecker;
        this.roleRepository = roleRepository;
    }
    /**
     * Convert UserRole enum to Role entity ID
     */
    async getRoleIdByCode(roleCode) {
        const role = await this.roleRepository.findOne({
            where: { code: roleCode }
        });
        if (!role) {
            throw new common_1.NotFoundException(`Role with code '${roleCode}' not found`);
        }
        return role.id;
    }
    /**
     * Convert Role entity ID back to UserRole enum
     */
    async getRoleCodeById(roleId) {
        const role = await this.roleRepository.findOne({
            where: { id: roleId }
        });
        if (!role) {
            throw new common_1.NotFoundException(`Role with ID '${roleId}' not found`);
        }
        return role.code;
    }
    // Permission CRUD operations
    async createPermission(createPermissionDto) {
        const existingPermission = await this.permissionRepository.findPermissionByName(createPermissionDto.name);
        if (existingPermission) {
            throw new common_1.ConflictException(`Permission with name '${createPermissionDto.name}' already exists`);
        }
        return await this.permissionRepository.createPermission(createPermissionDto);
    }
    async getAllPermissions(filter) {
        return await this.permissionRepository.findAllPermissions(filter);
    }
    async getPermissionById(id) {
        const permission = await this.permissionRepository.findPermissionById(id);
        if (!permission) {
            throw new common_1.NotFoundException('Permission not found');
        }
        return permission;
    }
    async updatePermission(id, updatePermissionDto) {
        const permission = await this.getPermissionById(id);
        // Check if name is being changed and if new name already exists
        if (updatePermissionDto.name && updatePermissionDto.name !== permission.name) {
            const existingPermission = await this.permissionRepository.findPermissionByName(updatePermissionDto.name);
            if (existingPermission) {
                throw new common_1.ConflictException(`Permission with name '${updatePermissionDto.name}' already exists`);
            }
        }
        const updatedPermission = await this.permissionRepository.updatePermission(id, updatePermissionDto);
        if (!updatedPermission) {
            throw new common_1.NotFoundException('Permission not found');
        }
        return updatedPermission;
    }
    async deletePermission(id) {
        const permission = await this.getPermissionById(id);
        const deleted = await this.permissionRepository.deletePermission(id);
        if (!deleted) {
            throw new common_1.NotFoundException('Permission not found');
        }
    }
    // Role Permission management
    async assignPermissionToRole(role, permissionId) {
        const permission = await this.getPermissionById(permissionId);
        const roleId = await this.getRoleIdByCode(role);
        const createRolePermissionDto = {
            roleId,
            permissionId
        };
        return await this.permissionRepository.assignPermissionToRole(createRolePermissionDto);
    }
    async removePermissionFromRole(role, permissionId) {
        const roleId = await this.getRoleIdByCode(role);
        const removed = await this.permissionRepository.removePermissionFromRole(roleId, permissionId);
        if (!removed) {
            throw new common_1.NotFoundException('Role permission assignment not found');
        }
    }
    async getRolePermissions(role) {
        const roleId = await this.getRoleIdByCode(role);
        return await this.permissionRepository.findPermissionsByRole(roleId);
    }
    // Permission checking (AccessControl-style API)
    can(role) {
        return this.permissionChecker.can(role);
    }
    // Grant permissions in AccessControl style
    async grant(grants) {
        for (const grant of grants) {
            try {
                // Create permission if it doesn't exist
                const permissionName = `${grant.action}:${grant.scope}:${grant.resource}`;
                let permission = await this.permissionRepository.findPermissionByName(permissionName);
                if (!permission) {
                    const createPermissionDto = {
                        name: permissionName,
                        resource: grant.resource,
                        action: grant.action,
                        scope: grant.scope,
                        attributes: grant.attributes || ['*'],
                    };
                    permission = await this.permissionRepository.createPermission(createPermissionDto);
                    console.log(`   📋 Created permission: ${permissionName}`);
                }
                // Get role ID from UserRole enum
                const roleId = await this.getRoleIdByCode(grant.role);
                // Assign permission to role
                await this.permissionRepository.assignPermissionToRole({
                    roleId,
                    permissionId: permission.id
                });
                console.log(`   🔗 Assigned permission '${permissionName}' to role '${grant.role}'`);
            }
            catch (error) {
                // Log but don't fail if permission already exists
                if (error instanceof common_1.ConflictException) {
                    console.log(`   ℹ️  Permission '${grant.action}:${grant.scope}:${grant.resource}' already assigned to role '${grant.role}'`);
                }
                else {
                    console.error(`   ❌ Failed to grant permission to role '${grant.role}':`, error.message);
                    throw error;
                }
            }
        }
    }
    // Filter data based on permission attributes
    filterAttributes(data, attributes) {
        return this.permissionChecker.filterAttributes(data, attributes);
    }
};
exports.AdminPermissionService = AdminPermissionService;
exports.AdminPermissionService = AdminPermissionService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(2, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof permission_repository_1.PermissionRepository !== "undefined" && permission_repository_1.PermissionRepository) === "function" ? _a : Object, typeof (_b = typeof permission_checker_service_1.PermissionCheckerService !== "undefined" && permission_checker_service_1.PermissionCheckerService) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object])
], AdminPermissionService);


/***/ }),
/* 46 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PermissionChecker = exports.PermissionCheckerService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const typeorm_1 = __webpack_require__(7);
const typeorm_2 = __webpack_require__(13);
const permission_repository_1 = __webpack_require__(44);
const role_entity_1 = __webpack_require__(40);
const _shared_1 = __webpack_require__(14);
let PermissionCheckerService = class PermissionCheckerService {
    constructor(permissionRepository, roleRepository) {
        this.permissionRepository = permissionRepository;
        this.roleRepository = roleRepository;
    }
    /**
     * Convert UserRole enum to Role entity ID
     */
    async getRoleIdByCode(roleCode) {
        const role = await this.roleRepository.findOne({
            where: { code: roleCode }
        });
        if (!role) {
            throw new common_1.NotFoundException(`Role with code '${roleCode}' not found`);
        }
        return role.id;
    }
    // Permission checking (AccessControl-style API)
    can(role) {
        return new PermissionChecker(role, this.permissionRepository, this.roleRepository);
    }
    // Filter data based on permission attributes
    filterAttributes(data, attributes) {
        if (!data || !attributes || attributes.includes('*')) {
            return data;
        }
        const result = { ...data };
        const deniedAttributes = attributes.filter(attr => attr.startsWith('!'));
        for (const denied of deniedAttributes) {
            const field = denied.substring(1); // Remove '!' prefix
            if (field.includes('.')) {
                // Handle nested attributes like '!record.id'
                const parts = field.split('.');
                let current = result;
                for (let i = 0; i < parts.length - 1; i++) {
                    if (current[parts[i]]) {
                        current = current[parts[i]];
                    }
                }
                if (current) {
                    delete current[parts[parts.length - 1]];
                }
            }
            else {
                delete result[field];
            }
        }
        return result;
    }
};
exports.PermissionCheckerService = PermissionCheckerService;
exports.PermissionCheckerService = PermissionCheckerService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof permission_repository_1.PermissionRepository !== "undefined" && permission_repository_1.PermissionRepository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object])
], PermissionCheckerService);
// AccessControl-style permission checker
class PermissionChecker {
    constructor(role, permissionRepository, roleRepository) {
        this.role = role;
        this.permissionRepository = permissionRepository;
        this.roleRepository = roleRepository;
    }
    /**
     * Convert UserRole enum to Role entity ID
     */
    async getRoleIdByCode(roleCode) {
        const role = await this.roleRepository.findOne({
            where: { code: roleCode }
        });
        if (!role) {
            throw new common_1.NotFoundException(`Role with code '${roleCode}' not found`);
        }
        return role.id;
    }
    async createOwn(resource) {
        return this.checkPermission(resource, _shared_1.PermissionAction.CREATE, _shared_1.PermissionScope.OWN);
    }
    async createAny(resource) {
        return this.checkPermission(resource, _shared_1.PermissionAction.CREATE, _shared_1.PermissionScope.ANY);
    }
    async readOwn(resource) {
        return this.checkPermission(resource, _shared_1.PermissionAction.READ, _shared_1.PermissionScope.OWN);
    }
    async readAny(resource) {
        return this.checkPermission(resource, _shared_1.PermissionAction.READ, _shared_1.PermissionScope.ANY);
    }
    async updateOwn(resource) {
        return this.checkPermission(resource, _shared_1.PermissionAction.UPDATE, _shared_1.PermissionScope.OWN);
    }
    async updateAny(resource) {
        return this.checkPermission(resource, _shared_1.PermissionAction.UPDATE, _shared_1.PermissionScope.ANY);
    }
    async deleteOwn(resource) {
        return this.checkPermission(resource, _shared_1.PermissionAction.DELETE, _shared_1.PermissionScope.OWN);
    }
    async deleteAny(resource) {
        return this.checkPermission(resource, _shared_1.PermissionAction.DELETE, _shared_1.PermissionScope.ANY);
    }
    async checkPermission(resource, action, scope) {
        const roleId = await this.getRoleIdByCode(this.role);
        const permission = await this.permissionRepository.getPermission(roleId, resource, action, scope);
        return {
            granted: permission !== null,
            permission: permission || undefined,
            attributes: permission?.attributes || []
        };
    }
}
exports.PermissionChecker = PermissionChecker;


/***/ }),
/* 47 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminUserService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const user_repository_1 = __webpack_require__(43);
const auth_service_1 = __webpack_require__(48);
const response_service_1 = __webpack_require__(51);
const _shared_1 = __webpack_require__(14);
let AdminUserService = class AdminUserService {
    constructor(userRepository, authService, responseHandler) {
        this.userRepository = userRepository;
        this.authService = authService;
        this.responseHandler = responseHandler;
    }
    async createUser(createUserDto) {
        const existingUser = await this.userRepository.findByEmail(createUserDto.email);
        if (existingUser) {
            throw this.responseHandler.createError(_shared_1.ApiStatusCodes.CONFLICT, 'User with this email already exists', 'CONFLICT');
        }
        try {
            const hashedPassword = await this.authService.hashPassword(createUserDto.password);
            const userData = {
                ...createUserDto,
                password: hashedPassword,
                // TODO: Handle role assignment through UserRole entity
                // role: createUserDto.role || UserRole.USER,
            };
            const user = await this.userRepository.createUser(userData);
            // Get the user with profile after creation
            const userWithProfile = await this.userRepository.findWithProfile(user.id);
            return this.toAdminUserResponse(userWithProfile || user);
        }
        catch (error) {
            if (error.code && error.code.includes('10')) {
                throw error; // Re-throw our structured errors
            }
            throw this.responseHandler.createError(_shared_1.ApiStatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create user', 'INTERNAL_SERVER_ERROR');
        }
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
        // TODO: Implement role filtering with UserRole entity
        // if (filters.role) {
        //   filteredUsers = filteredUsers.filter(user => user.role === filters.role);
        // }
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
            throw this.responseHandler.createError(_shared_1.ApiStatusCodes.NOT_FOUND, 'User not found', 'NOT_FOUND');
        }
        return this.toAdminUserResponse(user);
    }
    async updateUser(id, updateUserDto) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw this.responseHandler.createError(_shared_1.ApiStatusCodes.NOT_FOUND, 'User not found', 'NOT_FOUND');
        }
        try {
            const updatedUser = await this.userRepository.update(id, updateUserDto);
            if (!updatedUser) {
                throw this.responseHandler.createError(_shared_1.ApiStatusCodes.NOT_FOUND, 'User not found', 'NOT_FOUND');
            }
            // Get user with profile after update
            const userWithProfile = await this.userRepository.findWithProfile(id);
            return this.toAdminUserResponse(userWithProfile || updatedUser);
        }
        catch (error) {
            if (error.code && error.code.includes('10')) {
                throw error; // Re-throw our structured errors
            }
            throw this.responseHandler.createError(_shared_1.ApiStatusCodes.INTERNAL_SERVER_ERROR, 'Failed to update user', 'INTERNAL_SERVER_ERROR');
        }
    }
    async deleteUser(id) {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw this.responseHandler.createError(_shared_1.ApiStatusCodes.NOT_FOUND, 'User not found', 'NOT_FOUND');
        }
        try {
            const deleted = await this.userRepository.delete(id);
            if (!deleted) {
                throw this.responseHandler.createError(_shared_1.ApiStatusCodes.NOT_FOUND, 'User not found', 'NOT_FOUND');
            }
        }
        catch (error) {
            if (error.code && error.code.includes('10')) {
                throw error; // Re-throw our structured errors
            }
            throw this.responseHandler.createError(_shared_1.ApiStatusCodes.INTERNAL_SERVER_ERROR, 'Failed to delete user', 'INTERNAL_SERVER_ERROR');
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
            role: _shared_1.UserRole.USER, // TODO: Get role from UserRole entity
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
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof user_repository_1.UserRepository !== "undefined" && user_repository_1.UserRepository) === "function" ? _a : Object, typeof (_b = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _b : Object, typeof (_c = typeof response_service_1.ResponseService !== "undefined" && response_service_1.ResponseService) === "function" ? _c : Object])
], AdminUserService);


/***/ }),
/* 48 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const jwt_1 = __webpack_require__(49);
const user_repository_1 = __webpack_require__(43);
const _shared_1 = __webpack_require__(14);
const bcrypt = tslib_1.__importStar(__webpack_require__(50));
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
        // Get user with roles
        const userWithRoles = await this.userRepository.findWithRoles(user.id);
        // Get primary role (first active role or default to USER)
        const primaryRole = userWithRoles?.userRoles?.find(ur => ur.isActive)?.role?.code || _shared_1.UserRole.USER;
        const payload = {
            email: user.email,
            sub: user.id,
            role: primaryRole
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
/* 49 */
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),
/* 50 */
/***/ ((module) => {

module.exports = require("bcryptjs");

/***/ }),
/* 51 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var ResponseService_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ResponseService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const server_1 = __webpack_require__(52);
const _shared_1 = __webpack_require__(14);
const error_codes_enums_1 = __webpack_require__(30);
/**
 * Response Service
 * Simple service to handle API success and error responses
 */
let ResponseService = ResponseService_1 = class ResponseService {
    constructor() {
        this.logger = new common_1.Logger(ResponseService_1.name);
        this.domain = 'quasar.com'; // Domain for error responses
    }
    // ================================================================
    // tRPC RESPONSE METHODS
    // ================================================================
    /**
     * Create a standardized tRPC API response
     */
    createTrpcResponse(code, status, data, errors) {
        return {
            code,
            status,
            data,
            errors,
            timestamp: new Date().toISOString(),
        };
    }
    /**
     * Create a standardized tRPC success response
     */
    createTrpcSuccess(data) {
        return this.createTrpcResponse(_shared_1.ApiStatusCodes.OK, 'OK', data);
    }
    /**
     * Create a standardized tRPC error response
     */
    createTrpcError(code, status, message, errorReason = _shared_1.ApiErrorReasons.INTERNAL_ERROR) {
        const errorInfo = {
            '@type': 'ErrorInfo',
            reason: errorReason,
            domain: this.domain
        };
        this.logger.error(`API Error [${code}]: ${message}`, {
            code,
            status,
            errorInfo
        });
        return this.createTrpcResponse(code, status, undefined, [errorInfo]);
    }
    // ================================================================
    // SUCCESS RESPONSE METHODS
    // ================================================================
    /**
     * Create success response for single resource
     */
    createSuccess(data, options) {
        return {
            data,
            metadata: {
                timestamp: new Date().toISOString(),
                requestId: options?.requestId,
                version: options?.version || '1.0'
            }
        };
    }
    /**
     * Create success response for collections with pagination
     */
    createList(data, pagination, options) {
        return {
            data,
            pagination,
            metadata: {
                timestamp: new Date().toISOString(),
                requestId: options?.requestId,
                version: options?.version || '1.0'
            }
        };
    }
    // ================================================================
    // ERROR RESPONSE METHODS
    // ================================================================
    /**
     * Create error response
     */
    createError(code, message, status, details, options) {
        this.logger.error(`API Error [${code}]: ${message}`, {
            code,
            status,
            details,
            requestId: options?.requestId
        });
        return {
            error: {
                code,
                message,
                status,
                details
            }
        };
    }
    /**
     * Create validation error response
     */
    createValidationError(fieldErrors, options) {
        const badRequest = {
            '@type': 'BadRequest',
            fieldViolations: fieldErrors.map(({ field, message }) => ({
                field,
                description: message
            }))
        };
        return this.createError(_shared_1.ApiStatusCodes.BAD_REQUEST, 'Validation failed', 'BAD_REQUEST', [badRequest], options);
    }
    // ================================================================
    // CONVENIENCE ERROR METHODS
    // ================================================================
    /**
     * Create not found error
     */
    createNotFound(message = 'Resource not found') {
        const errorInfo = {
            '@type': 'ErrorInfo',
            reason: _shared_1.ApiErrorReasons.RESOURCE_NOT_FOUND,
            domain: this.domain
        };
        return this.createError(_shared_1.ApiStatusCodes.NOT_FOUND, message, 'NOT_FOUND', [errorInfo]);
    }
    /**
     * Create forbidden error
     */
    createForbidden(message = 'Access forbidden') {
        const errorInfo = {
            '@type': 'ErrorInfo',
            reason: _shared_1.ApiErrorReasons.PERMISSION_DENIED,
            domain: this.domain
        };
        return this.createError(_shared_1.ApiStatusCodes.FORBIDDEN, message, 'FORBIDDEN', [errorInfo]);
    }
    /**
     * Create internal server error
     */
    createInternalError(message = 'Internal server error') {
        const errorInfo = {
            '@type': 'ErrorInfo',
            reason: _shared_1.ApiErrorReasons.INTERNAL_ERROR,
            domain: this.domain
        };
        return this.createError(_shared_1.ApiStatusCodes.INTERNAL_SERVER_ERROR, message, 'INTERNAL_SERVER_ERROR', [errorInfo]);
    }
    // ================================================================
    // TRPC ERROR HELPERS
    // ================================================================
    /**
     * Create a TRPC error
     */
    createTRPCError(moduleCode, operationCode, errorLevelCode, message) {
        // Map error level to HTTP status
        let httpStatus = 500;
        let code = 'INTERNAL_SERVER_ERROR';
        if (errorLevelCode === error_codes_enums_1.ErrorLevelCode.NOT_FOUND) {
            httpStatus = 404;
            code = 'NOT_FOUND';
        }
        else if (errorLevelCode === error_codes_enums_1.ErrorLevelCode.VALIDATION) {
            httpStatus = 400;
            code = 'BAD_REQUEST';
        }
        else if (errorLevelCode === error_codes_enums_1.ErrorLevelCode.AUTHORIZATION) {
            httpStatus = 403;
            code = 'FORBIDDEN';
        }
        else if (errorLevelCode === error_codes_enums_1.ErrorLevelCode.AUTHENTICATION_ERROR) {
            httpStatus = 401;
            code = 'UNAUTHORIZED';
        }
        else if (errorLevelCode === error_codes_enums_1.ErrorLevelCode.BUSINESS_LOGIC_ERROR) {
            httpStatus = 422;
            code = 'UNPROCESSABLE_CONTENT';
        }
        else if (errorLevelCode === error_codes_enums_1.ErrorLevelCode.TOKEN_ERROR) {
            httpStatus = 401;
            code = 'UNAUTHORIZED';
        }
        this.logger.error(`TRPC Error [${httpStatus}]: ${message}`, {
            moduleCode,
            operationCode,
            errorLevelCode
        });
        // Prepare our standardized error format that will be used by the errorFormatter
        const errorData = {
            code: httpStatus,
            status: code,
            message: message,
            errors: [{
                    '@type': 'ErrorInfo',
                    reason: code,
                    domain: this.domain
                }],
            timestamp: new Date().toISOString()
        };
        return new server_1.TRPCError({
            code: code,
            message,
            cause: { httpStatus, errorData }
        });
    }
    /**
     * Create a TRPC error with standardized error codes
     */
    createTRPCErrorWithCodes(moduleCode, operationCode, errorLevelCode, message) {
        return this.createTRPCError(moduleCode, operationCode, errorLevelCode, message);
    }
    // ================================================================
    // SUCCESS RESPONSE METHODS FOR CRUD OPERATIONS (BACKWARD COMPATIBLE)
    // ================================================================
    /**
     * Create success response for CREATE operations - backward compatible
     */
    createCreatedResponse(moduleCode, resource, data, context) {
        return this.createTrpcSuccess(data);
    }
    /**
     * Create success response for READ operations - backward compatible
     */
    createReadResponse(moduleCode, resource, data, context) {
        return this.createTrpcSuccess(data);
    }
    /**
     * Create success response for UPDATE operations - backward compatible
     */
    createUpdatedResponse(moduleCode, resource, data, context) {
        return this.createTrpcSuccess(data);
    }
    /**
     * Create success response for DELETE operations - backward compatible
     */
    createDeletedResponse(moduleCode, resource, context) {
        return this.createTrpcResponse(_shared_1.ApiStatusCodes.OK, 'OK', { deleted: true });
    }
    /**
     * Create success response for general operations - backward compatible
     */
    createSuccessResponse(moduleCode, operationCode, messageLevelCode, message, data, context) {
        return this.createTrpcSuccess(data);
    }
};
exports.ResponseService = ResponseService;
exports.ResponseService = ResponseService = ResponseService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)()
], ResponseService);


/***/ }),
/* 52 */
/***/ ((module) => {

module.exports = require("@trpc/server");

/***/ }),
/* 53 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClientUserService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const user_repository_1 = __webpack_require__(43);
const auth_service_1 = __webpack_require__(48);
const response_service_1 = __webpack_require__(51);
const _shared_1 = __webpack_require__(14);
const error_codes_enums_1 = __webpack_require__(30);
let ClientUserService = class ClientUserService {
    constructor(userRepository, authService, responseHandler) {
        this.userRepository = userRepository;
        this.authService = authService;
        this.responseHandler = responseHandler;
    }
    async register(registerDto) {
        const existingUser = await this.userRepository.findByEmail(registerDto.email);
        if (existingUser) {
            throw this.responseHandler.createError(_shared_1.ApiStatusCodes.CONFLICT, 'User with this email already exists', 'CONFLICT');
        }
        try {
            const hashedPassword = await this.authService.hashPassword(registerDto.password);
            const userData = {
                ...registerDto,
                password: hashedPassword,
                role: _shared_1.UserRole.USER, // Client users are always regular users
            };
            const user = await this.userRepository.createUser(userData);
            const userWithProfile = await this.userRepository.findWithProfile(user.id);
            const tokens = await this.authService.login(user);
            return {
                user: this.toClientUserResponse(userWithProfile || user),
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            };
        }
        catch (error) {
            if (error.code && error.code.includes('10')) {
                throw error; // Re-throw our structured errors
            }
            throw this.responseHandler.createError(_shared_1.ApiStatusCodes.INTERNAL_SERVER_ERROR, 'Failed to register', 'INTERNAL_SERVER_ERROR');
        }
    }
    async login(loginDto) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw this.responseHandler.createError(_shared_1.ApiStatusCodes.UNAUTHORIZED, 'Invalid credentials', 'UNAUTHORIZED');
        }
        if (!user.isActive) {
            throw this.responseHandler.createTRPCErrorWithCodes(null, // moduleCode not needed
            null, // operationCode not needed
            error_codes_enums_1.ErrorLevelCode.BUSINESS_LOGIC_ERROR, 'Account is inactive');
        }
        try {
            const userWithProfile = await this.userRepository.findWithProfile(user.id);
            const tokens = await this.authService.login(user);
            return {
                user: this.toClientUserResponse(userWithProfile || user),
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            };
        }
        catch (error) {
            if (error.code && error.code.includes('10')) {
                throw error; // Re-throw our structured errors
            }
            throw this.responseHandler.createError(_shared_1.ApiStatusCodes.INTERNAL_SERVER_ERROR, 'Failed to login', 'INTERNAL_SERVER_ERROR');
        }
    }
    async getProfile(userId) {
        const user = await this.userRepository.findWithProfile(userId);
        if (!user) {
            throw this.responseHandler.createError(_shared_1.ApiStatusCodes.NOT_FOUND, 'User not found', 'NOT_FOUND');
        }
        return this.toClientUserResponse(user);
    }
    async updateProfile(userId, updateProfileDto) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw this.responseHandler.createError(_shared_1.ApiStatusCodes.NOT_FOUND, 'User not found', 'NOT_FOUND');
        }
        try {
            // Convert string dateOfBirth to Date if provided
            const profileData = {
                ...updateProfileDto,
                dateOfBirth: updateProfileDto.dateOfBirth ? new Date(updateProfileDto.dateOfBirth) : undefined,
            };
            // Update the user profile using the profile update method
            const updatedProfile = await this.userRepository.updateProfile(userId, profileData);
            if (!updatedProfile) {
                throw this.responseHandler.createError(_shared_1.ApiStatusCodes.NOT_FOUND, 'User profile not found', 'NOT_FOUND');
            }
            // Get the updated user with profile
            const userWithProfile = await this.userRepository.findWithProfile(userId);
            return this.toClientUserResponse(userWithProfile || user);
        }
        catch (error) {
            if (error.code && error.code.includes('10')) {
                throw error; // Re-throw our structured errors
            }
            throw this.responseHandler.createError(_shared_1.ApiStatusCodes.INTERNAL_SERVER_ERROR, 'Failed to update profile', 'INTERNAL_SERVER_ERROR');
        }
    }
    async refreshToken(refreshToken) {
        try {
            const tokens = await this.authService.refreshToken(refreshToken);
            const payload = await this.authService.verifyToken(tokens.accessToken);
            const user = await this.userRepository.findWithProfile(payload.sub);
            if (!user) {
                throw this.responseHandler.createError(_shared_1.ApiStatusCodes.NOT_FOUND, 'User not found', 'NOT_FOUND');
            }
            return {
                user: this.toClientUserResponse(user),
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            };
        }
        catch (error) {
            if (error.code && error.code.includes('10')) {
                throw error; // Re-throw our structured errors
            }
            throw this.responseHandler.createTRPCErrorWithCodes(null, // moduleCode not needed
            null, // operationCode not needed
            error_codes_enums_1.ErrorLevelCode.TOKEN_ERROR, 'Invalid refresh token');
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
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof user_repository_1.UserRepository !== "undefined" && user_repository_1.UserRepository) === "function" ? _a : Object, typeof (_b = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _b : Object, typeof (_c = typeof response_service_1.ResponseService !== "undefined" && response_service_1.ResponseService) === "function" ? _c : Object])
], ClientUserService);


/***/ }),
/* 54 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminUserRouter = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const nestjs_trpc_1 = __webpack_require__(8);
const zod_1 = __webpack_require__(55);
const admin_user_service_1 = __webpack_require__(47);
const response_service_1 = __webpack_require__(51);
const auth_middleware_1 = __webpack_require__(56);
const admin_role_middleware_1 = __webpack_require__(57);
const _shared_1 = __webpack_require__(14);
const response_schemas_1 = __webpack_require__(58);
// Zod schemas for validation
const userRoleSchema = zod_1.z.enum([
    _shared_1.UserRole.SUPER_ADMIN,
    _shared_1.UserRole.ADMIN,
    _shared_1.UserRole.MANAGER,
    _shared_1.UserRole.USER,
    _shared_1.UserRole.GUEST
]);
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
    constructor(adminUserService, responseHandler) {
        this.adminUserService = adminUserService;
        this.responseHandler = responseHandler;
    }
    async createUser(createUserDto) {
        try {
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
            const user = await this.adminUserService.createUser(adminCreateDto);
            return this.responseHandler.createTrpcSuccess(user);
        }
        catch (error) {
            throw this.responseHandler.createTRPCError(10, // ModuleCode.USER
            1, // OperationCode.CREATE
            30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
            error.message || 'Failed to create user');
        }
    }
    async getAllUsers(query) {
        try {
            // Ensure required fields are present for AdminUserFilters
            const filters = {
                page: query.page || 1,
                limit: query.limit || 10,
                search: query.search,
                role: query.role,
                isActive: query.isActive,
            };
            const result = await this.adminUserService.getAllUsers(filters);
            return this.responseHandler.createTrpcResponse(200, 'OK', result);
        }
        catch (error) {
            throw this.responseHandler.createTRPCError(10, // ModuleCode.USER
            2, // OperationCode.READ
            10, // ErrorLevelCode.SERVER_ERROR
            error.message || 'Failed to retrieve users');
        }
    }
    async getUserById(input) {
        try {
            const user = await this.adminUserService.getUserById(input.id);
            return this.responseHandler.createTrpcSuccess(user);
        }
        catch (error) {
            throw this.responseHandler.createTRPCError(10, // ModuleCode.USER
            2, // OperationCode.READ
            4, // ErrorLevelCode.NOT_FOUND
            error.message || 'User not found');
        }
    }
    async updateUser(input) {
        try {
            const { id, ...updateDto } = input;
            const user = await this.adminUserService.updateUser(id, updateDto);
            return this.responseHandler.createTrpcSuccess(user);
        }
        catch (error) {
            throw this.responseHandler.createTRPCError(10, // ModuleCode.USER
            3, // OperationCode.UPDATE
            30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
            error.message || 'Failed to update user');
        }
    }
    async deleteUser(input) {
        try {
            await this.adminUserService.deleteUser(input.id);
            return this.responseHandler.createTrpcResponse(200, 'OK', { deleted: true });
        }
        catch (error) {
            throw this.responseHandler.createTRPCError(10, // ModuleCode.USER
            4, // OperationCode.DELETE
            30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
            error.message || 'Failed to delete user');
        }
    }
    async updateUserStatus(input) {
        try {
            const user = await this.adminUserService.updateUserStatus(input.id, input.isActive);
            return this.responseHandler.createTrpcSuccess(user);
        }
        catch (error) {
            throw this.responseHandler.createTRPCError(10, // ModuleCode.USER
            3, // OperationCode.UPDATE
            30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
            error.message || 'Failed to update user status');
        }
    }
};
exports.AdminUserRouter = AdminUserRouter;
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Mutation)({
        input: adminCreateUserSchema,
        output: response_schemas_1.apiResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_c = typeof zod_1.z !== "undefined" && zod_1.z.infer) === "function" ? _c : Object]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], AdminUserRouter.prototype, "createUser", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Query)({
        input: getAllUsersQuerySchema,
        output: response_schemas_1.paginatedResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_e = typeof zod_1.z !== "undefined" && zod_1.z.infer) === "function" ? _e : Object]),
    tslib_1.__metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], AdminUserRouter.prototype, "getAllUsers", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Query)({
        input: zod_1.z.object({ id: zod_1.z.string() }),
        output: response_schemas_1.apiResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], AdminUserRouter.prototype, "getUserById", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Mutation)({
        input: zod_1.z.object({ id: zod_1.z.string() }).merge(adminUpdateUserSchema),
        output: response_schemas_1.apiResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], AdminUserRouter.prototype, "updateUser", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Mutation)({
        input: zod_1.z.object({ id: zod_1.z.string() }),
        output: response_schemas_1.apiResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], AdminUserRouter.prototype, "deleteUser", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Mutation)({
        input: zod_1.z.object({
            id: zod_1.z.string(),
            isActive: zod_1.z.boolean(),
        }),
        output: response_schemas_1.apiResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], AdminUserRouter.prototype, "updateUserStatus", null);
exports.AdminUserRouter = AdminUserRouter = tslib_1.__decorate([
    (0, nestjs_trpc_1.Router)({ alias: 'adminUser' }),
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, common_1.Inject)(admin_user_service_1.AdminUserService)),
    tslib_1.__param(1, (0, common_1.Inject)(response_service_1.ResponseService)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof admin_user_service_1.AdminUserService !== "undefined" && admin_user_service_1.AdminUserService) === "function" ? _a : Object, typeof (_b = typeof response_service_1.ResponseService !== "undefined" && response_service_1.ResponseService) === "function" ? _b : Object])
], AdminUserRouter);


/***/ }),
/* 55 */
/***/ ((module) => {

module.exports = require("zod");

/***/ }),
/* 56 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthMiddleware = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const server_1 = __webpack_require__(52);
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
/* 57 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminRoleMiddleware = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const server_1 = __webpack_require__(52);
const _shared_1 = __webpack_require__(14);
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
        if (ctx.user.role !== _shared_1.UserRole.ADMIN && ctx.user.role !== _shared_1.UserRole.SUPER_ADMIN) {
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
/* 58 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.voidResponseSchema = exports.authResponseSchema = exports.paginatedResponseSchema = exports.apiResponseSchema = void 0;
const zod_1 = __webpack_require__(55);
/**
 * Standard API response schema for all tRPC endpoints
 * Provides consistent response structure across the application
 */
exports.apiResponseSchema = zod_1.z.object({
    code: zod_1.z.number(),
    status: zod_1.z.string(),
    data: zod_1.z.any().optional(),
    errors: zod_1.z.array(zod_1.z.object({
        '@type': zod_1.z.string(),
        reason: zod_1.z.string(),
        domain: zod_1.z.string(),
        metadata: zod_1.z.record(zod_1.z.string()).optional(),
    })).optional(),
    timestamp: zod_1.z.string(),
});
/**
 * Paginated response schema for list endpoints
 */
exports.paginatedResponseSchema = zod_1.z.object({
    code: zod_1.z.number(),
    status: zod_1.z.string(),
    data: zod_1.z.object({
        items: zod_1.z.array(zod_1.z.any()),
        total: zod_1.z.number(),
        page: zod_1.z.number(),
        limit: zod_1.z.number(),
        totalPages: zod_1.z.number(),
    }),
    errors: zod_1.z.array(zod_1.z.object({
        '@type': zod_1.z.string(),
        reason: zod_1.z.string(),
        domain: zod_1.z.string(),
        metadata: zod_1.z.record(zod_1.z.string()).optional(),
    })).optional(),
    timestamp: zod_1.z.string(),
});
/**
 * Response schema for authentication endpoints
 */
exports.authResponseSchema = zod_1.z.object({
    code: zod_1.z.number(),
    status: zod_1.z.string(),
    data: zod_1.z.object({
        user: zod_1.z.any(),
        accessToken: zod_1.z.string(),
        refreshToken: zod_1.z.string().optional(),
        expiresIn: zod_1.z.number().optional(),
    }),
    errors: zod_1.z.array(zod_1.z.object({
        '@type': zod_1.z.string(),
        reason: zod_1.z.string(),
        domain: zod_1.z.string(),
        metadata: zod_1.z.record(zod_1.z.string()).optional(),
    })).optional(),
    timestamp: zod_1.z.string(),
});
/**
 * Response schema for endpoints that don't return data
 */
exports.voidResponseSchema = zod_1.z.object({
    code: zod_1.z.number(),
    status: zod_1.z.string(),
    errors: zod_1.z.array(zod_1.z.object({
        '@type': zod_1.z.string(),
        reason: zod_1.z.string(),
        domain: zod_1.z.string(),
        metadata: zod_1.z.record(zod_1.z.string()).optional(),
    })).optional(),
    timestamp: zod_1.z.string(),
});


/***/ }),
/* 59 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClientUserRouter = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const nestjs_trpc_1 = __webpack_require__(8);
const zod_1 = __webpack_require__(55);
const client_user_service_1 = __webpack_require__(53);
const response_service_1 = __webpack_require__(51);
const auth_middleware_1 = __webpack_require__(56);
const user_injection_middleware_1 = __webpack_require__(60);
const response_schemas_1 = __webpack_require__(58);
const context_1 = __webpack_require__(61);
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
    constructor(clientUserService, responseHandler) {
        this.clientUserService = clientUserService;
        this.responseHandler = responseHandler;
    }
    async register(registerDto) {
        try {
            // Ensure required fields are present for ClientRegisterDto
            const clientRegisterDto = {
                email: registerDto.email,
                username: registerDto.username,
                firstName: registerDto.firstName,
                lastName: registerDto.lastName,
                password: registerDto.password,
                phoneNumber: registerDto.phoneNumber,
            };
            const result = await this.clientUserService.register(clientRegisterDto);
            return this.responseHandler.createTrpcSuccess(result);
        }
        catch (error) {
            throw this.responseHandler.createTRPCError(10, // ModuleCode.USER
            6, // OperationCode.REGISTER
            1, // ErrorLevelCode.VALIDATION
            error.message || 'Failed to register user');
        }
    }
    async login(loginDto) {
        try {
            // Ensure required fields are present for ClientLoginDto
            const clientLoginDto = {
                email: loginDto.email,
                password: loginDto.password,
            };
            const result = await this.clientUserService.login(clientLoginDto);
            return this.responseHandler.createTrpcSuccess(result);
        }
        catch (error) {
            // Use proper error codes for consistent formatting
            throw this.responseHandler.createTRPCError(10, // ModuleCode.USER
            5, // OperationCode.LOGIN
            41, // ErrorLevelCode.AUTHENTICATION_ERROR
            error.message || 'Login failed');
        }
    }
    async getProfile({ user }) {
        try {
            if (!user?.id) {
                throw new Error('User not authenticated');
            }
            const profile = await this.clientUserService.getProfile(user.id);
            return this.responseHandler.createTrpcSuccess(profile);
        }
        catch (error) {
            throw this.responseHandler.createTRPCError(10, // ModuleCode.USER
            2, // OperationCode.READ
            4, // ErrorLevelCode.NOT_FOUND
            error.message || 'Failed to retrieve profile');
        }
    }
    async updateProfile(updateProfileDto, userId) {
        try {
            const result = await this.clientUserService.updateProfile(userId, updateProfileDto);
            return this.responseHandler.createTrpcSuccess(result);
        }
        catch (error) {
            throw this.responseHandler.createTRPCError(10, // ModuleCode.USER
            3, // OperationCode.UPDATE
            30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
            error.message || 'Failed to update profile');
        }
    }
    async refreshToken(input) {
        try {
            const result = await this.clientUserService.refreshToken(input.refreshToken);
            return this.responseHandler.createTrpcSuccess(result);
        }
        catch (error) {
            throw this.responseHandler.createTRPCError(11, // ModuleCode.AUTH
            7, // OperationCode.REFRESH
            42, // ErrorLevelCode.TOKEN_ERROR
            error.message || 'Token refresh failed');
        }
    }
};
exports.ClientUserRouter = ClientUserRouter;
tslib_1.__decorate([
    (0, nestjs_trpc_1.Mutation)({
        input: clientRegisterSchema,
        output: response_schemas_1.apiResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_c = typeof zod_1.z !== "undefined" && zod_1.z.infer) === "function" ? _c : Object]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], ClientUserRouter.prototype, "register", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.Mutation)({
        input: clientLoginSchema,
        output: response_schemas_1.apiResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_e = typeof zod_1.z !== "undefined" && zod_1.z.infer) === "function" ? _e : Object]),
    tslib_1.__metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], ClientUserRouter.prototype, "login", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware),
    (0, nestjs_trpc_1.Query)({
        output: response_schemas_1.apiResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Ctx)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_g = typeof context_1.AuthenticatedContext !== "undefined" && context_1.AuthenticatedContext) === "function" ? _g : Object]),
    tslib_1.__metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], ClientUserRouter.prototype, "getProfile", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, user_injection_middleware_1.UserInjectionMiddleware),
    (0, nestjs_trpc_1.Mutation)({
        input: clientUpdateProfileSchema,
        output: response_schemas_1.apiResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__param(1, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_j = typeof zod_1.z !== "undefined" && zod_1.z.infer) === "function" ? _j : Object, String]),
    tslib_1.__metadata("design:returntype", typeof (_k = typeof Promise !== "undefined" && Promise) === "function" ? _k : Object)
], ClientUserRouter.prototype, "updateProfile", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.Mutation)({
        input: refreshTokenSchema,
        output: response_schemas_1.apiResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_l = typeof zod_1.z !== "undefined" && zod_1.z.infer) === "function" ? _l : Object]),
    tslib_1.__metadata("design:returntype", typeof (_m = typeof Promise !== "undefined" && Promise) === "function" ? _m : Object)
], ClientUserRouter.prototype, "refreshToken", null);
exports.ClientUserRouter = ClientUserRouter = tslib_1.__decorate([
    (0, nestjs_trpc_1.Router)({ alias: 'clientUser' }),
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, common_1.Inject)(client_user_service_1.ClientUserService)),
    tslib_1.__param(1, (0, common_1.Inject)(response_service_1.ResponseService)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof client_user_service_1.ClientUserService !== "undefined" && client_user_service_1.ClientUserService) === "function" ? _a : Object, typeof (_b = typeof response_service_1.ResponseService !== "undefined" && response_service_1.ResponseService) === "function" ? _b : Object])
], ClientUserRouter);


/***/ }),
/* 60 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserInjectionMiddleware = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const server_1 = __webpack_require__(52);
/**
 * Middleware that injects authenticated user information into procedure parameters
 * Must be used after AuthMiddleware
 */
let UserInjectionMiddleware = class UserInjectionMiddleware {
    async use(opts) {
        const { ctx, next } = opts;
        // This middleware should be used after AuthMiddleware, so user should exist
        if (!ctx.user) {
            throw new server_1.TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Authentication required',
            });
        }
        return next({
            ctx: {
                ...ctx,
                user: ctx.user,
                // Add additional user info to context for easy access
                userId: ctx.user.id,
                userRole: ctx.user.role,
                userEmail: ctx.user.email,
            },
        });
    }
};
exports.UserInjectionMiddleware = UserInjectionMiddleware;
exports.UserInjectionMiddleware = UserInjectionMiddleware = tslib_1.__decorate([
    (0, common_1.Injectable)()
], UserInjectionMiddleware);


/***/ }),
/* 61 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppContext = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const jwt_1 = __webpack_require__(49);
const permission_repository_1 = __webpack_require__(44);
let AppContext = class AppContext {
    constructor(jwtService, permissionRepository) {
        this.jwtService = jwtService;
        this.permissionRepository = permissionRepository;
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
                // Load user permissions based on role
                const permissions = await this.permissionRepository.findPermissionsByRole(payload.role);
                // Create user object from JWT payload with permissions
                user = {
                    id: payload.sub,
                    email: payload.email,
                    username: payload.username,
                    role: payload.role,
                    isActive: payload.isActive,
                    permissions,
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
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _a : Object, typeof (_b = typeof permission_repository_1.PermissionRepository !== "undefined" && permission_repository_1.PermissionRepository) === "function" ? _b : Object])
], AppContext);


/***/ }),
/* 62 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminPermissionRouter = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const nestjs_trpc_1 = __webpack_require__(8);
const zod_1 = __webpack_require__(55);
const admin_permission_service_1 = __webpack_require__(45);
const response_service_1 = __webpack_require__(51);
const auth_middleware_1 = __webpack_require__(56);
const admin_role_middleware_1 = __webpack_require__(57);
const _shared_1 = __webpack_require__(14);
const error_codes_enums_1 = __webpack_require__(30);
const message_codes_enums_1 = __webpack_require__(31);
const response_schemas_1 = __webpack_require__(58);
// Zod schemas for validation
const permissionActionSchema = zod_1.z.enum([
    _shared_1.PermissionAction.CREATE,
    _shared_1.PermissionAction.READ,
    _shared_1.PermissionAction.UPDATE,
    _shared_1.PermissionAction.DELETE,
    _shared_1.PermissionAction.EXECUTE,
    _shared_1.PermissionAction.APPROVE,
    _shared_1.PermissionAction.REJECT,
    _shared_1.PermissionAction.PUBLISH,
    _shared_1.PermissionAction.ARCHIVE
]);
const permissionScopeSchema = zod_1.z.enum([
    _shared_1.PermissionScope.OWN,
    _shared_1.PermissionScope.DEPARTMENT,
    _shared_1.PermissionScope.ORGANIZATION,
    _shared_1.PermissionScope.ANY
]);
const userRoleSchema = zod_1.z.enum([
    _shared_1.UserRole.SUPER_ADMIN,
    _shared_1.UserRole.ADMIN,
    _shared_1.UserRole.MANAGER,
    _shared_1.UserRole.USER,
    _shared_1.UserRole.GUEST
]);
const createPermissionSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    resource: zod_1.z.string().min(1),
    action: permissionActionSchema,
    scope: permissionScopeSchema,
    description: zod_1.z.string().optional(),
    attributes: zod_1.z.array(zod_1.z.string()).optional(),
});
const updatePermissionSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    resource: zod_1.z.string().optional(),
    action: permissionActionSchema.optional(),
    scope: permissionScopeSchema.optional(),
    description: zod_1.z.string().optional(),
    attributes: zod_1.z.array(zod_1.z.string()).optional(),
    isActive: zod_1.z.boolean().optional(),
});
const permissionFilterSchema = zod_1.z.object({
    resource: zod_1.z.string().optional(),
    action: permissionActionSchema.optional(),
    scope: permissionScopeSchema.optional(),
    isActive: zod_1.z.boolean().optional(),
});
const permissionResponseSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    resource: zod_1.z.string(),
    action: permissionActionSchema,
    scope: permissionScopeSchema,
    description: zod_1.z.string().optional(),
    attributes: zod_1.z.array(zod_1.z.string()),
    isActive: zod_1.z.boolean(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date(),
});
const assignPermissionToRoleSchema = zod_1.z.object({
    role: userRoleSchema,
    permissionId: zod_1.z.string(),
});
const removePermissionFromRoleSchema = zod_1.z.object({
    role: userRoleSchema,
    permissionId: zod_1.z.string(),
});
const permissionGrantSchema = zod_1.z.object({
    role: userRoleSchema,
    resource: zod_1.z.string().min(1),
    action: permissionActionSchema,
    scope: permissionScopeSchema,
    attributes: zod_1.z.array(zod_1.z.string()).optional(),
});
let AdminPermissionRouter = class AdminPermissionRouter {
    constructor(permissionService, responseHandler) {
        this.permissionService = permissionService;
        this.responseHandler = responseHandler;
    }
    // Permission CRUD operations
    async createPermission(createPermissionDto) {
        try {
            // Ensure all required fields are present for CreatePermissionDto
            const permissionData = {
                name: createPermissionDto.name,
                resource: createPermissionDto.resource,
                action: createPermissionDto.action,
                scope: createPermissionDto.scope,
                description: createPermissionDto.description,
                attributes: createPermissionDto.attributes,
            };
            const permission = await this.permissionService.createPermission(permissionData);
            return this.responseHandler.createTrpcSuccess(permission);
        }
        catch (error) {
            throw this.responseHandler.createTRPCError(error_codes_enums_1.ModuleCode.PERMISSION, error_codes_enums_1.OperationCode.CREATE, error_codes_enums_1.ErrorLevelCode.BUSINESS_LOGIC_ERROR, error.message || 'Failed to create permission');
        }
    }
    async getAllPermissions(filter) {
        try {
            const permissions = await this.permissionService.getAllPermissions(filter);
            return this.responseHandler.createTrpcSuccess(permissions);
        }
        catch (error) {
            throw this.responseHandler.createTRPCError(error_codes_enums_1.ModuleCode.PERMISSION, error_codes_enums_1.OperationCode.READ, error_codes_enums_1.ErrorLevelCode.BUSINESS_LOGIC_ERROR, error.message || 'Failed to retrieve permissions');
        }
    }
    async getPermissionById(input) {
        try {
            const permission = await this.permissionService.getPermissionById(input.id);
            return this.responseHandler.createTrpcSuccess(permission);
        }
        catch (error) {
            throw this.responseHandler.createTRPCError(error_codes_enums_1.ModuleCode.PERMISSION, error_codes_enums_1.OperationCode.READ, error_codes_enums_1.ErrorLevelCode.NOT_FOUND, error.message || 'Permission not found');
        }
    }
    async updatePermission(input) {
        try {
            const { id, ...updateDto } = input;
            const permission = await this.permissionService.updatePermission(id, updateDto);
            return this.responseHandler.createTrpcSuccess(permission);
        }
        catch (error) {
            throw this.responseHandler.createTRPCError(error_codes_enums_1.ModuleCode.PERMISSION, error_codes_enums_1.OperationCode.UPDATE, error_codes_enums_1.ErrorLevelCode.BUSINESS_LOGIC_ERROR, error.message || 'Failed to update permission');
        }
    }
    async deletePermission(input) {
        try {
            await this.permissionService.deletePermission(input.id);
            return this.responseHandler.createTrpcResponse(200, 'OK', { deleted: true });
        }
        catch (error) {
            throw this.responseHandler.createTRPCError(error_codes_enums_1.ModuleCode.PERMISSION, error_codes_enums_1.OperationCode.DELETE, error_codes_enums_1.ErrorLevelCode.BUSINESS_LOGIC_ERROR, error.message || 'Failed to delete permission');
        }
    }
    // Role Permission management
    async assignPermissionToRole(input) {
        try {
            const result = await this.permissionService.assignPermissionToRole(input.role, input.permissionId);
            return this.responseHandler.createTrpcSuccess(result);
        }
        catch (error) {
            throw this.responseHandler.createTRPCError(error_codes_enums_1.ModuleCode.PERMISSION, error_codes_enums_1.OperationCode.CREATE, error_codes_enums_1.ErrorLevelCode.BUSINESS_LOGIC_ERROR, error.message || 'Failed to assign permission to role');
        }
    }
    async removePermissionFromRole(input) {
        try {
            await this.permissionService.removePermissionFromRole(input.role, input.permissionId);
            return this.responseHandler.createDeletedResponse(error_codes_enums_1.ModuleCode.PERMISSION, 'role permission');
        }
        catch (error) {
            throw this.responseHandler.createTRPCError(error_codes_enums_1.ModuleCode.PERMISSION, error_codes_enums_1.OperationCode.DELETE, error_codes_enums_1.ErrorLevelCode.BUSINESS_LOGIC_ERROR, error.message || 'Failed to remove permission from role');
        }
    }
    async getRolePermissions(input) {
        try {
            const permissions = await this.permissionService.getRolePermissions(input.role);
            return this.responseHandler.createReadResponse(error_codes_enums_1.ModuleCode.PERMISSION, 'role permissions', permissions);
        }
        catch (error) {
            throw this.responseHandler.createTRPCError(error_codes_enums_1.ModuleCode.PERMISSION, error_codes_enums_1.OperationCode.READ, error_codes_enums_1.ErrorLevelCode.BUSINESS_LOGIC_ERROR, error.message || 'Failed to retrieve role permissions');
        }
    }
    // Grant permissions in AccessControl style
    async grantPermissions(input) {
        try {
            // Ensure all required fields are present for PermissionGrant
            const grants = input.grants.map(grant => ({
                role: grant.role,
                resource: grant.resource,
                action: grant.action,
                scope: grant.scope,
                attributes: grant.attributes,
            }));
            await this.permissionService.grant(grants);
            return this.responseHandler.createSuccessResponse(error_codes_enums_1.ModuleCode.PERMISSION, error_codes_enums_1.OperationCode.CREATE, message_codes_enums_1.MessageLevelCode.SUCCESS, 'Permissions granted successfully');
        }
        catch (error) {
            throw this.responseHandler.createTRPCError(error_codes_enums_1.ModuleCode.PERMISSION, error_codes_enums_1.OperationCode.CREATE, error_codes_enums_1.ErrorLevelCode.BUSINESS_LOGIC_ERROR, error.message || 'Failed to grant permissions');
        }
    }
    // Utility: Check if a role has a specific permission
    async checkPermission(input) {
        try {
            const checker = this.permissionService.can(input.role);
            let permissionCheck;
            if (input.action === _shared_1.PermissionAction.CREATE && input.scope === _shared_1.PermissionScope.OWN) {
                permissionCheck = await checker.createOwn(input.resource);
            }
            else if (input.action === _shared_1.PermissionAction.CREATE && input.scope === _shared_1.PermissionScope.ANY) {
                permissionCheck = await checker.createAny(input.resource);
            }
            else if (input.action === _shared_1.PermissionAction.READ && input.scope === _shared_1.PermissionScope.OWN) {
                permissionCheck = await checker.readOwn(input.resource);
            }
            else if (input.action === _shared_1.PermissionAction.READ && input.scope === _shared_1.PermissionScope.ANY) {
                permissionCheck = await checker.readAny(input.resource);
            }
            else if (input.action === _shared_1.PermissionAction.UPDATE && input.scope === _shared_1.PermissionScope.OWN) {
                permissionCheck = await checker.updateOwn(input.resource);
            }
            else if (input.action === _shared_1.PermissionAction.UPDATE && input.scope === _shared_1.PermissionScope.ANY) {
                permissionCheck = await checker.updateAny(input.resource);
            }
            else if (input.action === _shared_1.PermissionAction.DELETE && input.scope === _shared_1.PermissionScope.OWN) {
                permissionCheck = await checker.deleteOwn(input.resource);
            }
            else if (input.action === _shared_1.PermissionAction.DELETE && input.scope === _shared_1.PermissionScope.ANY) {
                permissionCheck = await checker.deleteAny(input.resource);
            }
            else {
                throw new Error('Invalid permission action or scope');
            }
            const result = {
                granted: permissionCheck.granted,
                attributes: permissionCheck.attributes,
                permission: permissionCheck.permission,
            };
            return this.responseHandler.createReadResponse(error_codes_enums_1.ModuleCode.PERMISSION, 'permission check', result);
        }
        catch (error) {
            throw this.responseHandler.createTRPCError(error_codes_enums_1.ModuleCode.PERMISSION, error_codes_enums_1.OperationCode.READ, error_codes_enums_1.ErrorLevelCode.BUSINESS_LOGIC_ERROR, error.message || 'Failed to check permission');
        }
    }
};
exports.AdminPermissionRouter = AdminPermissionRouter;
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Mutation)({
        input: createPermissionSchema,
        output: response_schemas_1.apiResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_c = typeof zod_1.z !== "undefined" && zod_1.z.infer) === "function" ? _c : Object]),
    tslib_1.__metadata("design:returntype", typeof (_d = typeof Promise !== "undefined" && Promise) === "function" ? _d : Object)
], AdminPermissionRouter.prototype, "createPermission", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Query)({
        input: permissionFilterSchema,
        output: response_schemas_1.apiResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_e = typeof zod_1.z !== "undefined" && zod_1.z.infer) === "function" ? _e : Object]),
    tslib_1.__metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], AdminPermissionRouter.prototype, "getAllPermissions", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Query)({
        input: zod_1.z.object({ id: zod_1.z.string() }),
        output: response_schemas_1.apiResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], AdminPermissionRouter.prototype, "getPermissionById", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Mutation)({
        input: zod_1.z.object({ id: zod_1.z.string() }).merge(updatePermissionSchema),
        output: response_schemas_1.apiResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", typeof (_h = typeof Promise !== "undefined" && Promise) === "function" ? _h : Object)
], AdminPermissionRouter.prototype, "updatePermission", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Mutation)({
        input: zod_1.z.object({ id: zod_1.z.string() }),
        output: response_schemas_1.apiResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], AdminPermissionRouter.prototype, "deletePermission", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Mutation)({
        input: assignPermissionToRoleSchema,
        output: response_schemas_1.apiResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_k = typeof zod_1.z !== "undefined" && zod_1.z.infer) === "function" ? _k : Object]),
    tslib_1.__metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], AdminPermissionRouter.prototype, "assignPermissionToRole", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Mutation)({
        input: removePermissionFromRoleSchema,
        output: response_schemas_1.apiResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_m = typeof zod_1.z !== "undefined" && zod_1.z.infer) === "function" ? _m : Object]),
    tslib_1.__metadata("design:returntype", typeof (_o = typeof Promise !== "undefined" && Promise) === "function" ? _o : Object)
], AdminPermissionRouter.prototype, "removePermissionFromRole", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Query)({
        input: zod_1.z.object({ role: userRoleSchema }),
        output: response_schemas_1.apiResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", typeof (_p = typeof Promise !== "undefined" && Promise) === "function" ? _p : Object)
], AdminPermissionRouter.prototype, "getRolePermissions", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Mutation)({
        input: zod_1.z.object({
            grants: zod_1.z.array(permissionGrantSchema),
        }),
        output: response_schemas_1.apiResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", typeof (_q = typeof Promise !== "undefined" && Promise) === "function" ? _q : Object)
], AdminPermissionRouter.prototype, "grantPermissions", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Query)({
        input: zod_1.z.object({
            role: userRoleSchema,
            resource: zod_1.z.string(),
            action: permissionActionSchema,
            scope: permissionScopeSchema,
        }),
        output: response_schemas_1.apiResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", typeof (_r = typeof Promise !== "undefined" && Promise) === "function" ? _r : Object)
], AdminPermissionRouter.prototype, "checkPermission", null);
exports.AdminPermissionRouter = AdminPermissionRouter = tslib_1.__decorate([
    (0, nestjs_trpc_1.Router)({ alias: 'adminPermission' }),
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, common_1.Inject)(admin_permission_service_1.AdminPermissionService)),
    tslib_1.__param(1, (0, common_1.Inject)(response_service_1.ResponseService)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof admin_permission_service_1.AdminPermissionService !== "undefined" && admin_permission_service_1.AdminPermissionService) === "function" ? _a : Object, typeof (_b = typeof response_service_1.ResponseService !== "undefined" && response_service_1.ResponseService) === "function" ? _b : Object])
], AdminPermissionRouter);


/***/ }),
/* 63 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const jwt_1 = __webpack_require__(49);
const config_1 = __webpack_require__(6);
const typeorm_1 = __webpack_require__(7);
const passport_1 = __webpack_require__(64);
const user_entity_1 = __webpack_require__(12);
const user_profile_entity_1 = __webpack_require__(38);
const permission_entity_1 = __webpack_require__(42);
const role_entity_1 = __webpack_require__(40);
const user_role_entity_1 = __webpack_require__(39);
const role_permission_entity_1 = __webpack_require__(41);
const user_repository_1 = __webpack_require__(43);
const permission_repository_1 = __webpack_require__(44);
const auth_service_1 = __webpack_require__(48);
const jwt_strategy_1 = __webpack_require__(65);
const roles_guard_1 = __webpack_require__(67);
const jwt_auth_guard_1 = __webpack_require__(68);
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
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, user_profile_entity_1.UserProfile, permission_entity_1.Permission, role_entity_1.Role, user_role_entity_1.UserRole, role_permission_entity_1.RolePermission]),
            passport_1.PassportModule,
            jwtModule,
        ],
        providers: [
            auth_service_1.AuthService,
            user_repository_1.UserRepository,
            permission_repository_1.PermissionRepository,
            jwt_strategy_1.JwtStrategy,
            roles_guard_1.RolesGuard,
            jwt_auth_guard_1.JwtAuthGuard,
        ],
        exports: [auth_service_1.AuthService, user_repository_1.UserRepository, permission_repository_1.PermissionRepository, jwtModule, jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard],
    })
], AuthModule);


/***/ }),
/* 64 */
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),
/* 65 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtStrategy = void 0;
const tslib_1 = __webpack_require__(5);
const passport_jwt_1 = __webpack_require__(66);
const passport_1 = __webpack_require__(64);
const common_1 = __webpack_require__(2);
const config_1 = __webpack_require__(6);
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
/* 66 */
/***/ ((module) => {

module.exports = require("passport-jwt");

/***/ }),
/* 67 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Roles = exports.RolesGuard = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const core_1 = __webpack_require__(3);
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
const common_2 = __webpack_require__(2);
const Roles = (...roles) => (0, common_2.SetMetadata)('roles', roles);
exports.Roles = Roles;


/***/ }),
/* 68 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtAuthGuard = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const passport_1 = __webpack_require__(64);
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = tslib_1.__decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);


/***/ }),
/* 69 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SharedModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const typeorm_1 = __webpack_require__(7);
const auth_middleware_1 = __webpack_require__(56);
const admin_role_middleware_1 = __webpack_require__(57);
const user_injection_middleware_1 = __webpack_require__(60);
const permission_middleware_1 = __webpack_require__(70);
const auth_module_1 = __webpack_require__(63);
const permission_checker_service_1 = __webpack_require__(46);
const response_service_1 = __webpack_require__(51);
const error_registry_service_1 = __webpack_require__(71);
const permission_repository_1 = __webpack_require__(44);
const permission_entity_1 = __webpack_require__(42);
const role_permission_entity_1 = __webpack_require__(41);
const role_entity_1 = __webpack_require__(40);
const global_exception_filter_1 = __webpack_require__(73);
let SharedModule = class SharedModule {
};
exports.SharedModule = SharedModule;
exports.SharedModule = SharedModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([permission_entity_1.Permission, role_permission_entity_1.RolePermission, role_entity_1.Role]),
            auth_module_1.AuthModule
        ],
        providers: [
            auth_middleware_1.AuthMiddleware,
            admin_role_middleware_1.AdminRoleMiddleware,
            user_injection_middleware_1.UserInjectionMiddleware,
            permission_repository_1.PermissionRepository,
            permission_checker_service_1.PermissionCheckerService,
            response_service_1.ResponseService,
            error_registry_service_1.ErrorRegistryService,
            permission_middleware_1.CanCreateOwn,
            permission_middleware_1.CanCreateAny,
            permission_middleware_1.CanReadAny,
            global_exception_filter_1.GlobalExceptionFilter,
        ],
        exports: [
            auth_middleware_1.AuthMiddleware,
            admin_role_middleware_1.AdminRoleMiddleware,
            user_injection_middleware_1.UserInjectionMiddleware,
            permission_checker_service_1.PermissionCheckerService,
            response_service_1.ResponseService,
            error_registry_service_1.ErrorRegistryService,
            permission_middleware_1.CanCreateOwn,
            permission_middleware_1.CanCreateAny,
            permission_middleware_1.CanReadAny,
            global_exception_filter_1.GlobalExceptionFilter,
        ],
    })
], SharedModule);


/***/ }),
/* 70 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CanDeleteAny = exports.CanUpdateOwn = exports.CanReadAny = exports.CanCreateAny = exports.CanCreateOwn = void 0;
exports.RequirePermission = RequirePermission;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const server_1 = __webpack_require__(52);
const _shared_1 = __webpack_require__(14);
const permission_checker_service_1 = __webpack_require__(46);
function RequirePermission(permission) {
    var _a;
    let PermissionMiddleware = class PermissionMiddleware {
        constructor(permissionChecker) {
            this.permissionChecker = permissionChecker;
        }
        async use(opts) {
            const { ctx, next } = opts;
            // This middleware should be used after AuthMiddleware, so user should exist
            if (!ctx.user) {
                throw new server_1.TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required',
                });
            }
            // Check if user has the required permission
            const checker = this.permissionChecker.can(ctx.user.role);
            let permissionCheck;
            if (permission.action === _shared_1.PermissionAction.CREATE && permission.scope === _shared_1.PermissionScope.OWN) {
                permissionCheck = await checker.createOwn(permission.resource);
            }
            else if (permission.action === _shared_1.PermissionAction.CREATE && permission.scope === _shared_1.PermissionScope.ANY) {
                permissionCheck = await checker.createAny(permission.resource);
            }
            else if (permission.action === _shared_1.PermissionAction.READ && permission.scope === _shared_1.PermissionScope.OWN) {
                permissionCheck = await checker.readOwn(permission.resource);
            }
            else if (permission.action === _shared_1.PermissionAction.READ && permission.scope === _shared_1.PermissionScope.ANY) {
                permissionCheck = await checker.readAny(permission.resource);
            }
            else if (permission.action === _shared_1.PermissionAction.UPDATE && permission.scope === _shared_1.PermissionScope.OWN) {
                permissionCheck = await checker.updateOwn(permission.resource);
            }
            else if (permission.action === _shared_1.PermissionAction.UPDATE && permission.scope === _shared_1.PermissionScope.ANY) {
                permissionCheck = await checker.updateAny(permission.resource);
            }
            else if (permission.action === _shared_1.PermissionAction.DELETE && permission.scope === _shared_1.PermissionScope.OWN) {
                permissionCheck = await checker.deleteOwn(permission.resource);
            }
            else if (permission.action === _shared_1.PermissionAction.DELETE && permission.scope === _shared_1.PermissionScope.ANY) {
                permissionCheck = await checker.deleteAny(permission.resource);
            }
            else {
                throw new server_1.TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'Invalid permission action or scope',
                });
            }
            if (!permissionCheck.granted) {
                throw new server_1.TRPCError({
                    code: 'FORBIDDEN',
                    message: `Insufficient permissions. Required: ${permission.action}:${permission.scope}:${permission.resource}`,
                });
            }
            return next({
                ctx: {
                    ...ctx,
                    user: ctx.user,
                    permission: permissionCheck, // Add permission info to context
                },
            });
        }
    };
    PermissionMiddleware = tslib_1.__decorate([
        (0, common_1.Injectable)(),
        tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof permission_checker_service_1.PermissionCheckerService !== "undefined" && permission_checker_service_1.PermissionCheckerService) === "function" ? _a : Object])
    ], PermissionMiddleware);
    return PermissionMiddleware;
}
// Convenient permission middleware for common use cases
let CanCreateOwn = class CanCreateOwn {
    constructor(permissionChecker) {
        this.permissionChecker = permissionChecker;
    }
    setResource(resource) {
        this.resource = resource;
        return this;
    }
    async use(opts) {
        const { ctx, next } = opts;
        if (!ctx.user) {
            throw new server_1.TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Authentication required',
            });
        }
        const permissionCheck = await this.permissionChecker
            .can(ctx.user.role)
            .createOwn(this.resource);
        if (!permissionCheck.granted) {
            throw new server_1.TRPCError({
                code: 'FORBIDDEN',
                message: `Cannot create own ${this.resource}`,
            });
        }
        return next({
            ctx: {
                ...ctx,
                user: ctx.user,
                permission: permissionCheck,
            },
        });
    }
};
exports.CanCreateOwn = CanCreateOwn;
exports.CanCreateOwn = CanCreateOwn = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof permission_checker_service_1.PermissionCheckerService !== "undefined" && permission_checker_service_1.PermissionCheckerService) === "function" ? _a : Object])
], CanCreateOwn);
let CanCreateAny = class CanCreateAny {
    constructor(permissionChecker) {
        this.permissionChecker = permissionChecker;
    }
    setResource(resource) {
        this.resource = resource;
        return this;
    }
    async use(opts) {
        const { ctx, next } = opts;
        if (!ctx.user) {
            throw new server_1.TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Authentication required',
            });
        }
        const permissionCheck = await this.permissionChecker
            .can(ctx.user.role)
            .createAny(this.resource);
        if (!permissionCheck.granted) {
            throw new server_1.TRPCError({
                code: 'FORBIDDEN',
                message: `Cannot create any ${this.resource}`,
            });
        }
        return next({
            ctx: {
                ...ctx,
                user: ctx.user,
                permission: permissionCheck,
            },
        });
    }
};
exports.CanCreateAny = CanCreateAny;
exports.CanCreateAny = CanCreateAny = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof permission_checker_service_1.PermissionCheckerService !== "undefined" && permission_checker_service_1.PermissionCheckerService) === "function" ? _b : Object])
], CanCreateAny);
let CanReadAny = class CanReadAny {
    constructor(permissionChecker) {
        this.permissionChecker = permissionChecker;
    }
    setResource(resource) {
        this.resource = resource;
        return this;
    }
    async use(opts) {
        const { ctx, next } = opts;
        if (!ctx.user) {
            throw new server_1.TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Authentication required',
            });
        }
        const permissionCheck = await this.permissionChecker
            .can(ctx.user.role)
            .readAny(this.resource);
        if (!permissionCheck.granted) {
            throw new server_1.TRPCError({
                code: 'FORBIDDEN',
                message: `Cannot read any ${this.resource}`,
            });
        }
        return next({
            ctx: {
                ...ctx,
                user: ctx.user,
                permission: permissionCheck,
            },
        });
    }
};
exports.CanReadAny = CanReadAny;
exports.CanReadAny = CanReadAny = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_c = typeof permission_checker_service_1.PermissionCheckerService !== "undefined" && permission_checker_service_1.PermissionCheckerService) === "function" ? _c : Object])
], CanReadAny);
let CanUpdateOwn = class CanUpdateOwn {
    constructor(permissionChecker) {
        this.permissionChecker = permissionChecker;
    }
    setResource(resource) {
        this.resource = resource;
        return this;
    }
    async use(opts) {
        const { ctx, next } = opts;
        if (!ctx.user) {
            throw new server_1.TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Authentication required',
            });
        }
        const permissionCheck = await this.permissionChecker
            .can(ctx.user.role)
            .updateOwn(this.resource);
        if (!permissionCheck.granted) {
            throw new server_1.TRPCError({
                code: 'FORBIDDEN',
                message: `Cannot update own ${this.resource}`,
            });
        }
        return next({
            ctx: {
                ...ctx,
                user: ctx.user,
                permission: permissionCheck,
            },
        });
    }
};
exports.CanUpdateOwn = CanUpdateOwn;
exports.CanUpdateOwn = CanUpdateOwn = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_d = typeof permission_checker_service_1.PermissionCheckerService !== "undefined" && permission_checker_service_1.PermissionCheckerService) === "function" ? _d : Object])
], CanUpdateOwn);
let CanDeleteAny = class CanDeleteAny {
    constructor(permissionChecker) {
        this.permissionChecker = permissionChecker;
    }
    setResource(resource) {
        this.resource = resource;
        return this;
    }
    async use(opts) {
        const { ctx, next } = opts;
        if (!ctx.user) {
            throw new server_1.TRPCError({
                code: 'UNAUTHORIZED',
                message: 'Authentication required',
            });
        }
        const permissionCheck = await this.permissionChecker
            .can(ctx.user.role)
            .deleteAny(this.resource);
        if (!permissionCheck.granted) {
            throw new server_1.TRPCError({
                code: 'FORBIDDEN',
                message: `Cannot delete any ${this.resource}`,
            });
        }
        return next({
            ctx: {
                ...ctx,
                user: ctx.user,
                permission: permissionCheck,
            },
        });
    }
};
exports.CanDeleteAny = CanDeleteAny;
exports.CanDeleteAny = CanDeleteAny = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_e = typeof permission_checker_service_1.PermissionCheckerService !== "undefined" && permission_checker_service_1.PermissionCheckerService) === "function" ? _e : Object])
], CanDeleteAny);


/***/ }),
/* 71 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ErrorRegistryService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const error_registry_1 = __webpack_require__(72);
/**
 * Error Registry Service
 * NestJS service wrapper for error registry
 */
let ErrorRegistryService = class ErrorRegistryService {
    /**
     * Get error entry by code
     */
    getError(code) {
        return error_registry_1.errorRegistry.getError(code);
    }
    /**
     * Get all errors for a module
     */
    getErrorsByModule(moduleCode) {
        return error_registry_1.errorRegistry.getErrorsByModule(moduleCode);
    }
    /**
     * Get all errors for an operation
     */
    getErrorsByOperation(operationCode) {
        return error_registry_1.errorRegistry.getErrorsByOperation(operationCode);
    }
    /**
     * Get all errors by error level
     */
    getErrorsByLevel(errorLevelCode) {
        return error_registry_1.errorRegistry.getErrorsByLevel(errorLevelCode);
    }
    /**
     * Get all registered errors
     */
    getAllErrors() {
        return error_registry_1.errorRegistry.getAllErrors();
    }
    /**
     * Search errors by title or description
     */
    searchErrors(query) {
        return error_registry_1.errorRegistry.searchErrors(query);
    }
    /**
     * Validate if error code exists
     */
    validateErrorCode(code) {
        return error_registry_1.errorRegistry.validateErrorCode(code);
    }
    /**
     * Get error statistics
     */
    getStatistics() {
        return error_registry_1.errorRegistry.getStatistics();
    }
    /**
     * Generate error documentation
     */
    generateDocumentation() {
        return error_registry_1.errorRegistry.generateDocumentation();
    }
    /**
     * Get error info for debugging
     */
    getErrorInfo(code) {
        const entry = this.getError(code);
        const exists = entry !== undefined;
        if (!exists) {
            // Find similar error codes
            const allErrors = this.getAllErrors();
            const suggestions = allErrors
                .filter(e => e.code.includes(code.substring(0, 3))) // Same module
                .map(e => e.code)
                .slice(0, 5);
            return { exists, suggestions };
        }
        return { exists, entry };
    }
    /**
     * Get error codes for module and operation
     */
    getErrorCodesForOperation(moduleCode, operationCode) {
        return error_registry_1.errorRegistry
            .getAllErrors()
            .filter(error => error.moduleCode === moduleCode && error.operationCode === operationCode)
            .map(error => error.code);
    }
    /**
     * Check if error code is valid for context
     */
    isValidErrorForContext(code, moduleCode, operationCode) {
        const entry = this.getError(code);
        if (!entry)
            return false;
        return entry.moduleCode === moduleCode && entry.operationCode === operationCode;
    }
    /**
     * Get recommended error codes for context
     */
    getRecommendedErrorCodes(moduleCode, operationCode) {
        return error_registry_1.errorRegistry
            .getAllErrors()
            .filter(error => error.moduleCode === moduleCode && error.operationCode === operationCode)
            .sort((a, b) => a.title.localeCompare(b.title));
    }
};
exports.ErrorRegistryService = ErrorRegistryService;
exports.ErrorRegistryService = ErrorRegistryService = tslib_1.__decorate([
    (0, common_1.Injectable)()
], ErrorRegistryService);


/***/ }),
/* 72 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.errorRegistry = exports.ErrorRegistry = void 0;
const error_codes_enums_1 = __webpack_require__(30);
/**
 * Error registry database
 * Central registry for all application error codes
 */
class ErrorRegistry {
    constructor() {
        this.registry = new Map();
        this.initializeRegistry();
    }
    static getInstance() {
        if (!ErrorRegistry.instance) {
            ErrorRegistry.instance = new ErrorRegistry();
        }
        return ErrorRegistry.instance;
    }
    /**
     * Initialize registry with predefined error codes
     */
    initializeRegistry() {
        // User Module Errors
        this.registerError({
            moduleCode: error_codes_enums_1.ModuleCode.USER,
            operationCode: error_codes_enums_1.OperationCode.CREATE,
            errorLevelCode: error_codes_enums_1.ErrorLevelCode.VALIDATION,
            title: 'User Creation Validation Error',
            description: 'Input validation failed during user creation',
            commonCauses: ['Invalid email format', 'Password too weak', 'Username too short'],
            solutions: ['Validate email format', 'Use stronger password', 'Use longer username'],
            examples: ['Invalid email: "not-an-email"', 'Password: "123" (too short)']
        });
        this.registerError({
            moduleCode: error_codes_enums_1.ModuleCode.USER,
            operationCode: error_codes_enums_1.OperationCode.CREATE,
            errorLevelCode: error_codes_enums_1.ErrorLevelCode.CONFLICT,
            title: 'User Already Exists',
            description: 'User with provided email or username already exists',
            commonCauses: ['Duplicate email', 'Duplicate username'],
            solutions: ['Use different email', 'Use different username'],
            examples: ['Email: "user@example.com already exists"']
        });
        this.registerError({
            moduleCode: error_codes_enums_1.ModuleCode.USER,
            operationCode: error_codes_enums_1.OperationCode.READ,
            errorLevelCode: error_codes_enums_1.ErrorLevelCode.NOT_FOUND,
            title: 'User Not Found',
            description: 'User with specified ID does not exist',
            commonCauses: ['Invalid user ID', 'User was deleted', 'User never existed'],
            solutions: ['Verify user ID', 'Check if user exists', 'Use valid user ID'],
            examples: ['User ID: "123e4567-e89b-12d3-a456-426614174000" not found']
        });
        this.registerError({
            moduleCode: error_codes_enums_1.ModuleCode.USER,
            operationCode: error_codes_enums_1.OperationCode.UPDATE,
            errorLevelCode: error_codes_enums_1.ErrorLevelCode.FORBIDDEN,
            title: 'User Update Forbidden',
            description: 'User does not have permission to update this resource',
            commonCauses: ['Insufficient permissions', 'Not owner of resource'],
            solutions: ['Request appropriate permissions', 'Update own resources only'],
            examples: ['User trying to update another user\'s profile']
        });
        this.registerError({
            moduleCode: error_codes_enums_1.ModuleCode.USER,
            operationCode: error_codes_enums_1.OperationCode.DELETE,
            errorLevelCode: error_codes_enums_1.ErrorLevelCode.BUSINESS_LOGIC_ERROR,
            title: 'User Deletion Not Allowed',
            description: 'User cannot be deleted due to business rules',
            commonCauses: ['User has active orders', 'User is admin', 'User has dependencies'],
            solutions: ['Complete/cancel orders first', 'Transfer admin rights', 'Remove dependencies'],
            examples: ['Cannot delete user with pending orders']
        });
        this.registerError({
            moduleCode: error_codes_enums_1.ModuleCode.USER,
            operationCode: error_codes_enums_1.OperationCode.LOGIN,
            errorLevelCode: error_codes_enums_1.ErrorLevelCode.AUTHORIZATION,
            title: 'Login Failed',
            description: 'User authentication failed',
            commonCauses: ['Invalid credentials', 'Account locked', 'Account inactive'],
            solutions: ['Check credentials', 'Unlock account', 'Activate account'],
            examples: ['Wrong password', 'Account locked after 5 failed attempts']
        });
        this.registerError({
            moduleCode: error_codes_enums_1.ModuleCode.USER,
            operationCode: error_codes_enums_1.OperationCode.REGISTER,
            errorLevelCode: error_codes_enums_1.ErrorLevelCode.BUSINESS_LOGIC_ERROR,
            title: 'Registration Failed',
            description: 'User registration failed due to business rules',
            commonCauses: ['Registration closed', 'Invalid invitation code', 'Email domain blocked'],
            solutions: ['Wait for registration to open', 'Use valid invitation', 'Use different email domain'],
            examples: ['Registration only available during business hours']
        });
        this.registerError({
            moduleCode: error_codes_enums_1.ModuleCode.USER,
            operationCode: error_codes_enums_1.OperationCode.REFRESH,
            errorLevelCode: error_codes_enums_1.ErrorLevelCode.TOKEN_ERROR,
            title: 'Token Refresh Failed',
            description: 'Unable to refresh authentication token',
            commonCauses: ['Token expired', 'Invalid token', 'Token revoked'],
            solutions: ['Login again', 'Use valid token', 'Request new token'],
            examples: ['Refresh token expired after 30 days']
        });
        // Permission Module Errors
        this.registerError({
            moduleCode: error_codes_enums_1.ModuleCode.PERMISSION,
            operationCode: error_codes_enums_1.OperationCode.CREATE,
            errorLevelCode: error_codes_enums_1.ErrorLevelCode.CONFLICT,
            title: 'Permission Already Exists',
            description: 'Permission with same name and resource already exists',
            commonCauses: ['Duplicate permission name', 'Same resource-action combination'],
            solutions: ['Use different permission name', 'Modify existing permission'],
            examples: ['Permission "users:create" already exists']
        });
        this.registerError({
            moduleCode: error_codes_enums_1.ModuleCode.PERMISSION,
            operationCode: error_codes_enums_1.OperationCode.READ,
            errorLevelCode: error_codes_enums_1.ErrorLevelCode.NOT_FOUND,
            title: 'Permission Not Found',
            description: 'Permission with specified ID does not exist',
            commonCauses: ['Invalid permission ID', 'Permission was deleted'],
            solutions: ['Verify permission ID', 'Check if permission exists'],
            examples: ['Permission ID: "perm_123" not found']
        });
        this.registerError({
            moduleCode: error_codes_enums_1.ModuleCode.PERMISSION,
            operationCode: error_codes_enums_1.OperationCode.DELETE,
            errorLevelCode: error_codes_enums_1.ErrorLevelCode.BUSINESS_LOGIC_ERROR,
            title: 'Permission Deletion Not Allowed',
            description: 'Permission cannot be deleted due to dependencies',
            commonCauses: ['Permission assigned to roles', 'System permission'],
            solutions: ['Remove from roles first', 'Cannot delete system permissions'],
            examples: ['Cannot delete permission assigned to ADMIN role']
        });
        // Translation Module Errors
        this.registerError({
            moduleCode: error_codes_enums_1.ModuleCode.TRANSLATION,
            operationCode: error_codes_enums_1.OperationCode.READ,
            errorLevelCode: error_codes_enums_1.ErrorLevelCode.NOT_FOUND,
            title: 'Translation Not Found',
            description: 'Translation for specified key and locale not found',
            commonCauses: ['Invalid translation key', 'Unsupported locale'],
            solutions: ['Use valid translation key', 'Use supported locale'],
            examples: ['Key: "welcome.message" not found for locale "fr"']
        });
        // Auth Module Errors
        this.registerError({
            moduleCode: error_codes_enums_1.ModuleCode.AUTH,
            operationCode: error_codes_enums_1.OperationCode.READ,
            errorLevelCode: error_codes_enums_1.ErrorLevelCode.AUTHORIZATION,
            title: 'Authentication Required',
            description: 'Endpoint requires authentication',
            commonCauses: ['Missing token', 'Invalid token', 'Token expired'],
            solutions: ['Provide valid token', 'Login again', 'Refresh token'],
            examples: ['Authorization header missing']
        });
        this.registerError({
            moduleCode: error_codes_enums_1.ModuleCode.AUTH,
            operationCode: error_codes_enums_1.OperationCode.READ,
            errorLevelCode: error_codes_enums_1.ErrorLevelCode.FORBIDDEN,
            title: 'Insufficient Permissions',
            description: 'User does not have required permissions',
            commonCauses: ['Missing role', 'Insufficient privileges'],
            solutions: ['Request appropriate role', 'Contact administrator'],
            examples: ['User role required: ADMIN, current: USER']
        });
    }
    /**
     * Register a new error code
     */
    registerError(entry) {
        const code = error_codes_enums_1.ErrorCodeGenerator.generate(entry.moduleCode, entry.operationCode, entry.errorLevelCode);
        const fullEntry = {
            ...entry,
            code,
            httpStatus: this.getHttpStatus(entry.errorLevelCode),
            trpcCode: this.getTRPCCode(entry.errorLevelCode),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.registry.set(code, fullEntry);
    }
    /**
     * Get error entry by code
     */
    getError(code) {
        return this.registry.get(code);
    }
    /**
     * Get all errors for a module
     */
    getErrorsByModule(moduleCode) {
        return Array.from(this.registry.values()).filter(entry => entry.moduleCode === moduleCode);
    }
    /**
     * Get all errors for an operation
     */
    getErrorsByOperation(operationCode) {
        return Array.from(this.registry.values()).filter(entry => entry.operationCode === operationCode);
    }
    /**
     * Get all errors by error level
     */
    getErrorsByLevel(errorLevelCode) {
        return Array.from(this.registry.values()).filter(entry => entry.errorLevelCode === errorLevelCode);
    }
    /**
     * Get all registered errors
     */
    getAllErrors() {
        return Array.from(this.registry.values());
    }
    /**
     * Search errors by title or description
     */
    searchErrors(query) {
        const lowercaseQuery = query.toLowerCase();
        return Array.from(this.registry.values()).filter(entry => entry.title.toLowerCase().includes(lowercaseQuery) ||
            entry.description.toLowerCase().includes(lowercaseQuery));
    }
    /**
     * Validate if error code exists
     */
    validateErrorCode(code) {
        return this.registry.has(code);
    }
    /**
     * Get error statistics
     */
    getStatistics() {
        const errors = this.getAllErrors();
        return {
            totalErrors: errors.length,
            errorsByModule: this.groupByField(errors, 'moduleCode'),
            errorsByOperation: this.groupByField(errors, 'operationCode'),
            errorsByLevel: this.groupByField(errors, 'errorLevelCode')
        };
    }
    /**
     * Generate error documentation
     */
    generateDocumentation() {
        const errors = this.getAllErrors();
        let doc = '# Error Code Documentation\n\n';
        // Group by module
        const moduleGroups = this.groupErrors(errors, 'moduleCode');
        Object.entries(moduleGroups).forEach(([moduleCode, moduleErrors]) => {
            doc += `## ${this.getModuleName(Number(moduleCode))} Module\n\n`;
            moduleErrors.forEach(error => {
                doc += `### ${error.code} - ${error.title}\n\n`;
                doc += `**Description:** ${error.description}\n\n`;
                doc += `**HTTP Status:** ${error.httpStatus}\n\n`;
                doc += `**tRPC Code:** ${error.trpcCode}\n\n`;
                if (error.commonCauses?.length) {
                    doc += `**Common Causes:**\n`;
                    error.commonCauses.forEach(cause => doc += `- ${cause}\n`);
                    doc += '\n';
                }
                if (error.solutions?.length) {
                    doc += `**Solutions:**\n`;
                    error.solutions.forEach(solution => doc += `- ${solution}\n`);
                    doc += '\n';
                }
                if (error.examples?.length) {
                    doc += `**Examples:**\n`;
                    error.examples.forEach(example => doc += `- ${example}\n`);
                    doc += '\n';
                }
                doc += '---\n\n';
            });
        });
        return doc;
    }
    /**
     * Helper methods
     */
    groupByField(errors, field) {
        return errors.reduce((acc, error) => {
            const key = String(error[field]);
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
    }
    groupErrors(errors, field) {
        return errors.reduce((acc, error) => {
            const key = String(error[field]);
            if (!acc[key])
                acc[key] = [];
            acc[key].push(error);
            return acc;
        }, {});
    }
    getHttpStatus(errorLevelCode) {
        const statusMap = {
            [error_codes_enums_1.ErrorLevelCode.VALIDATION]: 400,
            [error_codes_enums_1.ErrorLevelCode.AUTHORIZATION]: 401,
            [error_codes_enums_1.ErrorLevelCode.FORBIDDEN]: 403,
            [error_codes_enums_1.ErrorLevelCode.NOT_FOUND]: 404,
            [error_codes_enums_1.ErrorLevelCode.CONFLICT]: 409,
            [error_codes_enums_1.ErrorLevelCode.RATE_LIMIT]: 429,
            [error_codes_enums_1.ErrorLevelCode.SERVER_ERROR]: 500,
            [error_codes_enums_1.ErrorLevelCode.DATABASE_ERROR]: 500,
            [error_codes_enums_1.ErrorLevelCode.NETWORK_ERROR]: 502,
            [error_codes_enums_1.ErrorLevelCode.TIMEOUT_ERROR]: 504,
            [error_codes_enums_1.ErrorLevelCode.EXTERNAL_API_ERROR]: 502,
            [error_codes_enums_1.ErrorLevelCode.PAYMENT_ERROR]: 402,
            [error_codes_enums_1.ErrorLevelCode.EMAIL_ERROR]: 500,
            [error_codes_enums_1.ErrorLevelCode.SMS_ERROR]: 500,
            [error_codes_enums_1.ErrorLevelCode.STORAGE_ERROR]: 500,
            [error_codes_enums_1.ErrorLevelCode.BUSINESS_LOGIC_ERROR]: 400,
            [error_codes_enums_1.ErrorLevelCode.SUBSCRIPTION_ERROR]: 400,
            [error_codes_enums_1.ErrorLevelCode.INVENTORY_ERROR]: 409,
            [error_codes_enums_1.ErrorLevelCode.PRICING_ERROR]: 400,
            [error_codes_enums_1.ErrorLevelCode.SECURITY_ERROR]: 403,
            [error_codes_enums_1.ErrorLevelCode.AUTHENTICATION_ERROR]: 401,
            [error_codes_enums_1.ErrorLevelCode.TOKEN_ERROR]: 401,
            [error_codes_enums_1.ErrorLevelCode.ENCRYPTION_ERROR]: 500,
            [error_codes_enums_1.ErrorLevelCode.CONFIG_ERROR]: 500,
            [error_codes_enums_1.ErrorLevelCode.ENVIRONMENT_ERROR]: 500,
            [error_codes_enums_1.ErrorLevelCode.DEPENDENCY_ERROR]: 500,
        };
        return statusMap[errorLevelCode] || 500;
    }
    getTRPCCode(errorLevelCode) {
        const trpcCodeMap = {
            [error_codes_enums_1.ErrorLevelCode.VALIDATION]: 'BAD_REQUEST',
            [error_codes_enums_1.ErrorLevelCode.AUTHORIZATION]: 'UNAUTHORIZED',
            [error_codes_enums_1.ErrorLevelCode.FORBIDDEN]: 'FORBIDDEN',
            [error_codes_enums_1.ErrorLevelCode.NOT_FOUND]: 'NOT_FOUND',
            [error_codes_enums_1.ErrorLevelCode.CONFLICT]: 'CONFLICT',
            [error_codes_enums_1.ErrorLevelCode.RATE_LIMIT]: 'TOO_MANY_REQUESTS',
            [error_codes_enums_1.ErrorLevelCode.SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
            [error_codes_enums_1.ErrorLevelCode.DATABASE_ERROR]: 'INTERNAL_SERVER_ERROR',
            [error_codes_enums_1.ErrorLevelCode.NETWORK_ERROR]: 'INTERNAL_SERVER_ERROR',
            [error_codes_enums_1.ErrorLevelCode.TIMEOUT_ERROR]: 'TIMEOUT',
            [error_codes_enums_1.ErrorLevelCode.EXTERNAL_API_ERROR]: 'INTERNAL_SERVER_ERROR',
            [error_codes_enums_1.ErrorLevelCode.PAYMENT_ERROR]: 'PAYMENT_REQUIRED',
            [error_codes_enums_1.ErrorLevelCode.EMAIL_ERROR]: 'INTERNAL_SERVER_ERROR',
            [error_codes_enums_1.ErrorLevelCode.SMS_ERROR]: 'INTERNAL_SERVER_ERROR',
            [error_codes_enums_1.ErrorLevelCode.STORAGE_ERROR]: 'INTERNAL_SERVER_ERROR',
            [error_codes_enums_1.ErrorLevelCode.BUSINESS_LOGIC_ERROR]: 'BAD_REQUEST',
            [error_codes_enums_1.ErrorLevelCode.SUBSCRIPTION_ERROR]: 'BAD_REQUEST',
            [error_codes_enums_1.ErrorLevelCode.INVENTORY_ERROR]: 'CONFLICT',
            [error_codes_enums_1.ErrorLevelCode.PRICING_ERROR]: 'BAD_REQUEST',
            [error_codes_enums_1.ErrorLevelCode.SECURITY_ERROR]: 'FORBIDDEN',
            [error_codes_enums_1.ErrorLevelCode.AUTHENTICATION_ERROR]: 'UNAUTHORIZED',
            [error_codes_enums_1.ErrorLevelCode.TOKEN_ERROR]: 'UNAUTHORIZED',
            [error_codes_enums_1.ErrorLevelCode.ENCRYPTION_ERROR]: 'INTERNAL_SERVER_ERROR',
            [error_codes_enums_1.ErrorLevelCode.CONFIG_ERROR]: 'INTERNAL_SERVER_ERROR',
            [error_codes_enums_1.ErrorLevelCode.ENVIRONMENT_ERROR]: 'INTERNAL_SERVER_ERROR',
            [error_codes_enums_1.ErrorLevelCode.DEPENDENCY_ERROR]: 'INTERNAL_SERVER_ERROR',
        };
        return trpcCodeMap[errorLevelCode] || 'INTERNAL_SERVER_ERROR';
    }
    getModuleName(moduleCode) {
        const moduleNames = {
            // Core System (10-19)
            [error_codes_enums_1.ModuleCode.USER]: 'User',
            [error_codes_enums_1.ModuleCode.AUTH]: 'Authentication',
            [error_codes_enums_1.ModuleCode.PERMISSION]: 'Permission',
            [error_codes_enums_1.ModuleCode.TRANSLATION]: 'Translation',
            // E-commerce (20-29)
            [error_codes_enums_1.ModuleCode.PRODUCT]: 'Product',
            [error_codes_enums_1.ModuleCode.CATEGORY]: 'Category',
            [error_codes_enums_1.ModuleCode.CART]: 'Cart',
            [error_codes_enums_1.ModuleCode.ORDER]: 'Order',
            [error_codes_enums_1.ModuleCode.INVENTORY]: 'Inventory',
            // Content Management (30-39)
            [error_codes_enums_1.ModuleCode.NEWS]: 'News',
            [error_codes_enums_1.ModuleCode.ARTICLE]: 'Article',
            [error_codes_enums_1.ModuleCode.COMMENT]: 'Comment',
            [error_codes_enums_1.ModuleCode.TAG]: 'Tag',
            // Subscription & Billing (40-49)
            [error_codes_enums_1.ModuleCode.SUBSCRIPTION]: 'Subscription',
            [error_codes_enums_1.ModuleCode.PLAN]: 'Plan',
            [error_codes_enums_1.ModuleCode.BILLING]: 'Billing',
            [error_codes_enums_1.ModuleCode.INVOICE]: 'Invoice',
            // Payment System (50-59)
            [error_codes_enums_1.ModuleCode.PAYMENT]: 'Payment',
            [error_codes_enums_1.ModuleCode.GATEWAY]: 'Gateway',
            [error_codes_enums_1.ModuleCode.TRANSACTION]: 'Transaction',
            [error_codes_enums_1.ModuleCode.REFUND]: 'Refund',
            // Communication (60-69)
            [error_codes_enums_1.ModuleCode.NOTIFICATION]: 'Notification',
            [error_codes_enums_1.ModuleCode.EMAIL]: 'Email',
            [error_codes_enums_1.ModuleCode.SMS]: 'SMS',
            // File & Media (70-79)
            [error_codes_enums_1.ModuleCode.FILE]: 'File',
            [error_codes_enums_1.ModuleCode.MEDIA]: 'Media',
            [error_codes_enums_1.ModuleCode.UPLOAD]: 'Upload',
            // Analytics & Reporting (80-89)
            [error_codes_enums_1.ModuleCode.ANALYTICS]: 'Analytics',
            [error_codes_enums_1.ModuleCode.REPORT]: 'Report',
            [error_codes_enums_1.ModuleCode.DASHBOARD]: 'Dashboard',
            // System Management (90-99)
            [error_codes_enums_1.ModuleCode.SYSTEM]: 'System',
            [error_codes_enums_1.ModuleCode.CONFIG]: 'Configuration',
            [error_codes_enums_1.ModuleCode.AUDIT]: 'Audit',
        };
        return moduleNames[moduleCode] || 'Unknown';
    }
}
exports.ErrorRegistry = ErrorRegistry;
// Export singleton instance
exports.errorRegistry = ErrorRegistry.getInstance();


/***/ }),
/* 73 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GlobalExceptionFilter = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const server_1 = __webpack_require__(52);
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        // Default status and error info
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let errorCode = 'INTERNAL_SERVER_ERROR';
        let message = 'Internal server error';
        // Extract error details based on exception type
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const errorResponse = exception.getResponse();
            message = typeof errorResponse === 'object' && 'message' in errorResponse
                ? String(errorResponse['message'])
                : String(errorResponse);
            errorCode = this.mapHttpStatusToErrorCode(status);
        }
        else if (exception instanceof server_1.TRPCError) {
            // Handle TRPC errors
            const cause = exception.cause || {};
            status = cause.httpStatus || this.mapTRPCErrorCodeToStatus(exception.code);
            message = exception.message;
            errorCode = exception.code;
            // If we have pre-formatted error data from our ResponseService, use it
            if (cause.errorData) {
                const errorData = cause.errorData;
                return response.status(status).json({
                    code: errorData.code || status,
                    status: errorData.status || errorCode,
                    message: message,
                    errors: errorData.errors || [{
                            '@type': 'ErrorInfo',
                            reason: errorCode,
                            domain: 'quasar.com',
                        }],
                    timestamp: new Date().toISOString(),
                    ...(process.env.NODE_ENV !== 'production' && { stack: exception.stack }),
                });
            }
        }
        else if (exception instanceof Error) {
            message = exception.message;
        }
        // Log the error
        this.logger.error(`Exception: ${message}`, exception instanceof Error ? exception.stack : undefined);
        // Return standardized error response
        response.status(status).json({
            code: status,
            status: errorCode,
            message: message,
            errors: [{
                    '@type': 'ErrorInfo',
                    reason: errorCode,
                    domain: 'quasar.com',
                }],
            timestamp: new Date().toISOString(),
            ...(process.env.NODE_ENV !== 'production' && {
                stack: exception instanceof Error ? exception.stack : undefined
            }),
        });
    }
    mapHttpStatusToErrorCode(status) {
        switch (status) {
            case common_1.HttpStatus.BAD_REQUEST: return 'BAD_REQUEST';
            case common_1.HttpStatus.UNAUTHORIZED: return 'UNAUTHORIZED';
            case common_1.HttpStatus.FORBIDDEN: return 'FORBIDDEN';
            case common_1.HttpStatus.NOT_FOUND: return 'NOT_FOUND';
            case common_1.HttpStatus.CONFLICT: return 'CONFLICT';
            case common_1.HttpStatus.UNPROCESSABLE_ENTITY: return 'UNPROCESSABLE_ENTITY';
            case common_1.HttpStatus.TOO_MANY_REQUESTS: return 'TOO_MANY_REQUESTS';
            case common_1.HttpStatus.INTERNAL_SERVER_ERROR: return 'INTERNAL_SERVER_ERROR';
            case common_1.HttpStatus.BAD_GATEWAY: return 'BAD_GATEWAY';
            case common_1.HttpStatus.SERVICE_UNAVAILABLE: return 'SERVICE_UNAVAILABLE';
            case common_1.HttpStatus.GATEWAY_TIMEOUT: return 'GATEWAY_TIMEOUT';
            default: return 'INTERNAL_SERVER_ERROR';
        }
    }
    mapTRPCErrorCodeToStatus(code) {
        switch (code) {
            case 'BAD_REQUEST': return common_1.HttpStatus.BAD_REQUEST;
            case 'UNAUTHORIZED': return common_1.HttpStatus.UNAUTHORIZED;
            case 'FORBIDDEN': return common_1.HttpStatus.FORBIDDEN;
            case 'NOT_FOUND': return common_1.HttpStatus.NOT_FOUND;
            case 'TIMEOUT': return common_1.HttpStatus.GATEWAY_TIMEOUT;
            case 'CONFLICT': return common_1.HttpStatus.CONFLICT;
            case 'PRECONDITION_FAILED': return common_1.HttpStatus.PRECONDITION_FAILED;
            case 'PAYLOAD_TOO_LARGE': return common_1.HttpStatus.PAYLOAD_TOO_LARGE;
            case 'METHOD_NOT_SUPPORTED': return common_1.HttpStatus.METHOD_NOT_ALLOWED;
            case 'UNPROCESSABLE_CONTENT': return common_1.HttpStatus.UNPROCESSABLE_ENTITY;
            case 'INTERNAL_SERVER_ERROR':
            default: return common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = tslib_1.__decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);


/***/ }),
/* 74 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TranslationModule = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const typeorm_1 = __webpack_require__(7);
const translation_entity_1 = __webpack_require__(75);
const translation_repository_1 = __webpack_require__(76);
const translation_service_1 = __webpack_require__(77);
const translation_router_1 = __webpack_require__(80);
const shared_module_1 = __webpack_require__(69);
let TranslationModule = class TranslationModule {
};
exports.TranslationModule = TranslationModule;
exports.TranslationModule = TranslationModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([translation_entity_1.Translation]),
            shared_module_1.SharedModule
        ],
        providers: [
            translation_repository_1.TranslationRepository,
            translation_service_1.TranslationService,
            translation_router_1.TranslationRouter
        ],
        exports: [
            translation_service_1.TranslationService,
            translation_repository_1.TranslationRepository,
            translation_router_1.TranslationRouter
        ]
    })
], TranslationModule);


/***/ }),
/* 75 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Translation = void 0;
const tslib_1 = __webpack_require__(5);
const typeorm_1 = __webpack_require__(13);
const _shared_1 = __webpack_require__(14);
let Translation = class Translation extends _shared_1.BaseEntity {
};
exports.Translation = Translation;
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], Translation.prototype, "key", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ length: 5 }),
    tslib_1.__metadata("design:type", String)
], Translation.prototype, "locale", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)('text'),
    tslib_1.__metadata("design:type", String)
], Translation.prototype, "value", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    tslib_1.__metadata("design:type", String)
], Translation.prototype, "namespace", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    tslib_1.__metadata("design:type", Boolean)
], Translation.prototype, "isActive", void 0);
exports.Translation = Translation = tslib_1.__decorate([
    (0, typeorm_1.Entity)('translations'),
    (0, typeorm_1.Index)(['key', 'locale'], { unique: true })
], Translation);


/***/ }),
/* 76 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TranslationRepository = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const typeorm_1 = __webpack_require__(7);
const typeorm_2 = __webpack_require__(13);
const _shared_1 = __webpack_require__(14);
const translation_entity_1 = __webpack_require__(75);
let TranslationRepository = class TranslationRepository extends _shared_1.BaseRepository {
    constructor(repository) {
        super(repository);
        this.repository = repository;
    }
    async findByKeyAndLocale(key, locale) {
        return this.repository.findOne({
            where: { key, locale, isActive: true }
        });
    }
    async findByLocale(locale) {
        return this.repository.find({
            where: { locale, isActive: true },
            order: { key: 'ASC' }
        });
    }
    async findByNamespace(namespace) {
        return this.repository.find({
            where: { namespace, isActive: true },
            order: { key: 'ASC' }
        });
    }
    async findActiveByLocale(locale) {
        return this.repository.find({
            where: { locale, isActive: true },
            order: { key: 'ASC' }
        });
    }
    async findAllGroupedByLocale() {
        const translations = await this.repository.find({
            where: { isActive: true },
            order: { locale: 'ASC', key: 'ASC' }
        });
        return translations.reduce((acc, translation) => {
            if (!acc[translation.locale]) {
                acc[translation.locale] = [];
            }
            acc[translation.locale].push(translation);
            return acc;
        }, {});
    }
};
exports.TranslationRepository = TranslationRepository;
exports.TranslationRepository = TranslationRepository = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, typeorm_1.InjectRepository)(translation_entity_1.Translation)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], TranslationRepository);


/***/ }),
/* 77 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var TranslationService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TranslationService = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const fs_1 = __webpack_require__(78);
const path_1 = __webpack_require__(79);
const translation_repository_1 = __webpack_require__(76);
let TranslationService = TranslationService_1 = class TranslationService {
    constructor(translationRepository) {
        this.translationRepository = translationRepository;
        this.logger = new common_1.Logger(TranslationService_1.name);
        this.translationCache = new Map();
        this.cacheExpiry = 1000 * 60 * 5; // 5 minutes
        this.cacheTimestamp = 0;
    }
    async getTranslations(locale) {
        try {
            // Try to get from cache first
            const cachedTranslations = this.getCachedTranslations();
            if (cachedTranslations && cachedTranslations[locale]) {
                return cachedTranslations[locale];
            }
            // Get from database
            const dbTranslations = await this.getTranslationsFromDatabase(locale);
            // Get fallback from files
            const fileTranslations = this.getTranslationsFromFile(locale);
            // Merge database translations with file fallbacks
            const merged = this.mergeTranslations(dbTranslations, fileTranslations);
            // Update cache
            this.updateCache(locale, merged);
            return merged;
        }
        catch (error) {
            this.logger.error(`Failed to get translations for locale ${locale}:`, error);
            // Fallback to file translations only
            return this.getTranslationsFromFile(locale);
        }
    }
    async getTranslation(key, locale, defaultValue) {
        try {
            // Try database first
            const dbTranslation = await this.translationRepository.findByKeyAndLocale(key, locale);
            if (dbTranslation) {
                return dbTranslation.value;
            }
            // Fallback to file translations
            const fileTranslations = this.getTranslationsFromFile(locale);
            const value = this.getNestedValue(fileTranslations, key);
            if (value) {
                return value;
            }
            // Fallback to English if not Vietnamese
            if (locale !== 'en') {
                const enTranslations = this.getTranslationsFromFile('en');
                const enValue = this.getNestedValue(enTranslations, key);
                if (enValue) {
                    return enValue;
                }
            }
            return defaultValue || key;
        }
        catch (error) {
            this.logger.error(`Failed to get translation for key ${key}:`, error);
            return defaultValue || key;
        }
    }
    async getTranslationsFromDatabase(locale) {
        const translations = await this.translationRepository.findActiveByLocale(locale);
        const result = {};
        translations.forEach(translation => {
            this.setNestedValue(result, translation.key, translation.value);
        });
        return result;
    }
    getTranslationsFromFile(locale) {
        try {
            const filePath = (0, path_1.join)(process.cwd(), 'src', 'assets', 'i18n', `${locale}.json`);
            if (!(0, fs_1.existsSync)(filePath)) {
                this.logger.warn(`Translation file not found: ${filePath}`);
                return {};
            }
            const fileContent = (0, fs_1.readFileSync)(filePath, 'utf8');
            return JSON.parse(fileContent);
        }
        catch (error) {
            this.logger.error(`Failed to load translation file for locale ${locale}:`, error);
            return {};
        }
    }
    mergeTranslations(dbTranslations, fileTranslations) {
        // Database translations take priority
        return { ...fileTranslations, ...dbTranslations };
    }
    getCachedTranslations() {
        const now = Date.now();
        if (now - this.cacheTimestamp > this.cacheExpiry) {
            this.translationCache.clear();
            return null;
        }
        const cached = this.translationCache.get('all');
        return cached || null;
    }
    updateCache(locale, translations) {
        const existing = this.translationCache.get('all') || {};
        existing[locale] = translations;
        this.translationCache.set('all', existing);
        this.cacheTimestamp = Date.now();
    }
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        let current = obj;
        for (const key of keys) {
            if (!(key in current)) {
                current[key] = {};
            }
            current = current[key];
        }
        current[lastKey] = value;
    }
    async createOrUpdateTranslation(key, locale, value, namespace) {
        const existing = await this.translationRepository.findByKeyAndLocale(key, locale);
        if (existing) {
            return this.translationRepository.update(existing.id, { value });
        }
        const newTranslation = this.translationRepository.create({
            key,
            locale,
            value,
            namespace
        });
        return this.translationRepository.save(newTranslation);
    }
    async deleteTranslation(key, locale) {
        const translation = await this.translationRepository.findByKeyAndLocale(key, locale);
        if (!translation) {
            return false;
        }
        return this.translationRepository.delete(translation.id);
    }
    clearCache() {
        this.translationCache.clear();
        this.cacheTimestamp = 0;
    }
};
exports.TranslationService = TranslationService;
exports.TranslationService = TranslationService = TranslationService_1 = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof translation_repository_1.TranslationRepository !== "undefined" && translation_repository_1.TranslationRepository) === "function" ? _a : Object])
], TranslationService);


/***/ }),
/* 78 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 79 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 80 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TranslationRouter = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const nestjs_trpc_1 = __webpack_require__(8);
const zod_1 = __webpack_require__(55);
const translation_service_1 = __webpack_require__(77);
const response_service_1 = __webpack_require__(51);
const auth_middleware_1 = __webpack_require__(56);
const admin_role_middleware_1 = __webpack_require__(57);
const _shared_1 = __webpack_require__(14);
const error_codes_enums_1 = __webpack_require__(30);
const response_schemas_1 = __webpack_require__(58);
// Zod schemas for validation
const supportedLocalesSchema = zod_1.z.enum(['vi', 'en']);
const getTranslationsSchema = zod_1.z.object({
    locale: supportedLocalesSchema,
});
const getTranslationSchema = zod_1.z.object({
    key: zod_1.z.string(),
    locale: supportedLocalesSchema,
    defaultValue: zod_1.z.string().optional(),
});
const createTranslationSchema = zod_1.z.object({
    key: zod_1.z.string(),
    locale: supportedLocalesSchema,
    value: zod_1.z.string(),
    namespace: zod_1.z.string().optional(),
});
const updateTranslationSchema = zod_1.z.object({
    key: zod_1.z.string(),
    locale: supportedLocalesSchema,
    value: zod_1.z.string(),
    namespace: zod_1.z.string().optional(),
});
const deleteTranslationSchema = zod_1.z.object({
    key: zod_1.z.string(),
    locale: supportedLocalesSchema,
});
let TranslationRouter = class TranslationRouter {
    constructor(translationService, responseHandler) {
        this.translationService = translationService;
        this.responseHandler = responseHandler;
    }
    async getLocaleConfig() {
        try {
            const config = {
                defaultLocale: 'vi',
                supportedLocales: ['vi', 'en'],
            };
            return this.responseHandler.createSuccessResponse(error_codes_enums_1.ModuleCode.TRANSLATION, error_codes_enums_1.OperationCode.READ, _shared_1.MessageLevelCode.SUCCESS, 'Locale configuration retrieved successfully', config);
        }
        catch (error) {
            throw this.responseHandler.createTRPCError(error_codes_enums_1.ModuleCode.TRANSLATION, error_codes_enums_1.OperationCode.READ, error_codes_enums_1.ErrorLevelCode.SERVER_ERROR, error.message || 'Failed to get locale configuration');
        }
    }
    async getTranslations(input) {
        try {
            const translations = await this.translationService.getTranslations(input.locale);
            const result = {
                locale: input.locale,
                translations,
            };
            return this.responseHandler.createSuccessResponse(error_codes_enums_1.ModuleCode.TRANSLATION, error_codes_enums_1.OperationCode.READ, _shared_1.MessageLevelCode.SUCCESS, 'Translations retrieved successfully', result);
        }
        catch (error) {
            throw this.responseHandler.createTRPCError(error_codes_enums_1.ModuleCode.TRANSLATION, error_codes_enums_1.OperationCode.READ, error_codes_enums_1.ErrorLevelCode.SERVER_ERROR, error.message || 'Failed to get translations');
        }
    }
    async getTranslation(input) {
        try {
            const translation = await this.translationService.getTranslation(input.key, input.locale, input.defaultValue);
            return this.responseHandler.createSuccessResponse(error_codes_enums_1.ModuleCode.TRANSLATION, error_codes_enums_1.OperationCode.READ, _shared_1.MessageLevelCode.SUCCESS, 'Translation retrieved successfully', { key: input.key, value: translation });
        }
        catch (error) {
            throw this.responseHandler.createTRPCError(error_codes_enums_1.ModuleCode.TRANSLATION, error_codes_enums_1.OperationCode.READ, error_codes_enums_1.ErrorLevelCode.SERVER_ERROR, error.message || 'Failed to get translation');
        }
    }
    async createTranslation(input) {
        try {
            const translation = await this.translationService.createOrUpdateTranslation(input.key, input.locale, input.value, input.namespace);
            return this.responseHandler.createCreatedResponse(error_codes_enums_1.ModuleCode.TRANSLATION, 'translation', translation);
        }
        catch (error) {
            throw this.responseHandler.createTRPCError(error_codes_enums_1.ModuleCode.TRANSLATION, error_codes_enums_1.OperationCode.CREATE, error_codes_enums_1.ErrorLevelCode.BUSINESS_LOGIC_ERROR, error.message || 'Failed to create translation');
        }
    }
    async updateTranslation(input) {
        try {
            const translation = await this.translationService.createOrUpdateTranslation(input.key, input.locale, input.value, input.namespace);
            return this.responseHandler.createUpdatedResponse(error_codes_enums_1.ModuleCode.TRANSLATION, 'translation', translation);
        }
        catch (error) {
            throw this.responseHandler.createTRPCError(error_codes_enums_1.ModuleCode.TRANSLATION, error_codes_enums_1.OperationCode.UPDATE, error_codes_enums_1.ErrorLevelCode.BUSINESS_LOGIC_ERROR, error.message || 'Failed to update translation');
        }
    }
    async deleteTranslation(input) {
        try {
            const success = await this.translationService.deleteTranslation(input.key, input.locale);
            if (!success) {
                throw this.responseHandler.createError(_shared_1.ApiStatusCodes.NOT_FOUND, 'Translation not found', 'NOT_FOUND');
            }
            return this.responseHandler.createDeletedResponse(error_codes_enums_1.ModuleCode.TRANSLATION, 'translation');
        }
        catch (error) {
            throw this.responseHandler.createTRPCError(error_codes_enums_1.ModuleCode.TRANSLATION, error_codes_enums_1.OperationCode.DELETE, error_codes_enums_1.ErrorLevelCode.BUSINESS_LOGIC_ERROR, error.message || 'Failed to delete translation');
        }
    }
    async clearCache() {
        try {
            this.translationService.clearCache();
            return this.responseHandler.createSuccessResponse(error_codes_enums_1.ModuleCode.TRANSLATION, error_codes_enums_1.OperationCode.UPDATE, _shared_1.MessageLevelCode.SUCCESS, 'Translation cache cleared successfully');
        }
        catch (error) {
            throw this.responseHandler.createTRPCError(error_codes_enums_1.ModuleCode.TRANSLATION, error_codes_enums_1.OperationCode.UPDATE, error_codes_enums_1.ErrorLevelCode.SERVER_ERROR, error.message || 'Failed to clear translation cache');
        }
    }
};
exports.TranslationRouter = TranslationRouter;
tslib_1.__decorate([
    (0, nestjs_trpc_1.Query)({
        output: response_schemas_1.apiResponseSchema,
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], TranslationRouter.prototype, "getLocaleConfig", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.Query)({
        input: getTranslationsSchema,
        output: response_schemas_1.apiResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_d = typeof zod_1.z !== "undefined" && zod_1.z.infer) === "function" ? _d : Object]),
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], TranslationRouter.prototype, "getTranslations", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.Query)({
        input: getTranslationSchema,
        output: response_schemas_1.apiResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_f = typeof zod_1.z !== "undefined" && zod_1.z.infer) === "function" ? _f : Object]),
    tslib_1.__metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], TranslationRouter.prototype, "getTranslation", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Mutation)({
        input: createTranslationSchema,
        output: response_schemas_1.apiResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_h = typeof zod_1.z !== "undefined" && zod_1.z.infer) === "function" ? _h : Object]),
    tslib_1.__metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], TranslationRouter.prototype, "createTranslation", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Mutation)({
        input: updateTranslationSchema,
        output: response_schemas_1.apiResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_k = typeof zod_1.z !== "undefined" && zod_1.z.infer) === "function" ? _k : Object]),
    tslib_1.__metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], TranslationRouter.prototype, "updateTranslation", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Mutation)({
        input: deleteTranslationSchema,
        output: response_schemas_1.apiResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_m = typeof zod_1.z !== "undefined" && zod_1.z.infer) === "function" ? _m : Object]),
    tslib_1.__metadata("design:returntype", typeof (_o = typeof Promise !== "undefined" && Promise) === "function" ? _o : Object)
], TranslationRouter.prototype, "deleteTranslation", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Mutation)({
        output: response_schemas_1.apiResponseSchema,
    }),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", typeof (_p = typeof Promise !== "undefined" && Promise) === "function" ? _p : Object)
], TranslationRouter.prototype, "clearCache", null);
exports.TranslationRouter = TranslationRouter = tslib_1.__decorate([
    (0, nestjs_trpc_1.Router)({ alias: 'translation' }),
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, common_1.Inject)(translation_service_1.TranslationService)),
    tslib_1.__param(1, (0, common_1.Inject)(response_service_1.ResponseService)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof translation_service_1.TranslationService !== "undefined" && translation_service_1.TranslationService) === "function" ? _a : Object, typeof (_b = typeof response_service_1.ResponseService !== "undefined" && response_service_1.ResponseService) === "function" ? _b : Object])
], TranslationRouter);


/***/ }),
/* 81 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const config_1 = __webpack_require__(6);
exports["default"] = (0, config_1.registerAs)('database', () => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'quasar_db',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false, // Always false for production safety
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    migrationsTableName: 'migrations',
    migrationsRun: false,
    logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
}));


/***/ }),
/* 82 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TrpcRouter = void 0;
const tslib_1 = __webpack_require__(5);
const common_1 = __webpack_require__(2);
const trpcExpress = tslib_1.__importStar(__webpack_require__(83));
const trpc_1 = __webpack_require__(84);
const admin_user_router_1 = __webpack_require__(54);
const client_user_router_1 = __webpack_require__(59);
const admin_permission_router_1 = __webpack_require__(62);
const translation_router_1 = __webpack_require__(80);
let TrpcRouter = class TrpcRouter {
    constructor() {
        // Merge all routers
        this.appRouter = (0, trpc_1.router)({
            adminUser: admin_user_router_1.adminUserRouter,
            clientUser: client_user_router_1.clientUserRouter,
            adminPermission: admin_permission_router_1.adminPermissionRouter,
            translation: translation_router_1.translationRouter
        });
    }
    // Apply middleware to expose the tRPC API
    async applyMiddleware(app) {
        app.use('/trpc', trpcExpress.createExpressMiddleware({
            router: this.appRouter,
            createContext: ({ req, res }) => ({ req, res })
        }));
    }
};
exports.TrpcRouter = TrpcRouter;
exports.TrpcRouter = TrpcRouter = tslib_1.__decorate([
    (0, common_1.Injectable)()
], TrpcRouter);


/***/ }),
/* 83 */
/***/ ((module) => {

module.exports = require("@trpc/server/adapters/express");

/***/ }),
/* 84 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.protectedProcedure = exports.procedure = exports.router = void 0;
const server_1 = __webpack_require__(52);
// Initialize tRPC with context
const t = server_1.initTRPC.context().create({
    errorFormatter: ({ shape, error }) => {
        // Get the error data from the cause if available (from our ResponseService)
        const errorCause = error.cause;
        // Default values
        let code = errorCause?.httpStatus || 500;
        let status = error.code || 'INTERNAL_SERVER_ERROR';
        let errors = [{
                '@type': 'ErrorInfo',
                reason: error.code || 'INTERNAL_SERVER_ERROR',
                domain: 'quasar.com',
                metadata: shape.data || {}
            }];
        // If we have pre-formatted error data from our ResponseService, use it
        if (errorCause?.errorData) {
            const errorData = errorCause.errorData;
            code = errorData.code || code;
            status = errorData.status || status;
            errors = errorData.errors || errors;
        }
        // Return standardized format
        return {
            code,
            status,
            message: error.message,
            errors,
            timestamp: new Date().toISOString(),
            ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
        };
    },
});
// Export router and procedure helpers
exports.router = t.router;
exports.procedure = t.procedure;
// Protected procedure that requires authentication
exports.protectedProcedure = t.procedure.use(({ ctx, next }) => {
    if (!ctx.user) {
        throw new server_1.TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to access this resource',
        });
    }
    return next({
        ctx: {
            ...ctx,
            user: ctx.user, // user is guaranteed to be defined
        },
    });
});


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
__webpack_require__(1);
const common_1 = __webpack_require__(2);
const core_1 = __webpack_require__(3);
const app_module_1 = __webpack_require__(4);
const global_exception_filter_1 = __webpack_require__(73);
const trpc_router_1 = __webpack_require__(82);
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
    // Add middleware to handle content-type for tRPC requests
    app.use('/api/trpc', (req, res, next) => {
        // If no content-type is set and it's a POST request, set it to application/json
        if (!req.headers['content-type'] && req.method === 'POST') {
            req.headers['content-type'] = 'application/json';
        }
        next();
    });
    // Apply global filters and pipes
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    app.useGlobalPipes(new common_1.ValidationPipe({ transform: true }));
    // Apply TRPC middleware
    const trpc = app.get(trpc_router_1.TrpcRouter);
    await trpc.applyMiddleware(app);
    const port = process.env.PORT || 3001;
    await app.listen(port);
    common_1.Logger.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();

})();

/******/ })()
;
//# sourceMappingURL=main.js.map