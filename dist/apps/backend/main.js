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
const admin_module_1 = __webpack_require__(38);
const client_module_1 = __webpack_require__(55);
const translation_module_1 = __webpack_require__(58);
const auth_module_1 = __webpack_require__(49);
const context_1 = __webpack_require__(64);
const database_config_1 = tslib_1.__importDefault(__webpack_require__(65));
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
                context: context_1.AppContext,
            }),
            user_module_1.UserModule,
            admin_module_1.AdminModule,
            client_module_1.ClientModule,
            translation_module_1.TranslationModule,
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
const user_profile_entity_1 = __webpack_require__(32);
const permission_entity_1 = __webpack_require__(33);
const role_permission_entity_1 = __webpack_require__(34);
const user_repository_1 = __webpack_require__(35);
const permission_repository_1 = __webpack_require__(36);
const permission_service_1 = __webpack_require__(37);
let UserModule = class UserModule {
};
exports.UserModule = UserModule;
exports.UserModule = UserModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, user_profile_entity_1.UserProfile, permission_entity_1.Permission, role_permission_entity_1.RolePermission])],
        controllers: [],
        providers: [user_repository_1.UserRepository, permission_repository_1.PermissionRepository, permission_service_1.PermissionService],
        exports: [user_repository_1.UserRepository, permission_repository_1.PermissionRepository, permission_service_1.PermissionService],
    })
], UserModule);


/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.User = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
const shared_1 = __webpack_require__(13);
const user_profile_entity_1 = __webpack_require__(32);
let User = class User extends shared_1.BaseEntity {
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
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_1.UserRole,
        default: shared_1.UserRole.USER
    }),
    tslib_1.__metadata("design:type", typeof (_a = typeof shared_1.UserRole !== "undefined" && shared_1.UserRole) === "function" ? _a : Object)
], User.prototype, "role", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    tslib_1.__metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
tslib_1.__decorate([
    (0, typeorm_1.OneToOne)(() => user_profile_entity_1.UserProfile, profile => profile.user),
    tslib_1.__metadata("design:type", typeof (_b = typeof user_profile_entity_1.UserProfile !== "undefined" && user_profile_entity_1.UserProfile) === "function" ? _b : Object)
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


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(4);
// Base entities
tslib_1.__exportStar(__webpack_require__(14), exports);
// Repository interfaces and abstracts
tslib_1.__exportStar(__webpack_require__(15), exports);
tslib_1.__exportStar(__webpack_require__(16), exports);
// Types
tslib_1.__exportStar(__webpack_require__(18), exports);
tslib_1.__exportStar(__webpack_require__(19), exports);
tslib_1.__exportStar(__webpack_require__(20), exports);
tslib_1.__exportStar(__webpack_require__(21), exports);
tslib_1.__exportStar(__webpack_require__(22), exports);
tslib_1.__exportStar(__webpack_require__(23), exports);
// Enums
tslib_1.__exportStar(__webpack_require__(24), exports);
tslib_1.__exportStar(__webpack_require__(25), exports);
tslib_1.__exportStar(__webpack_require__(17), exports);
tslib_1.__exportStar(__webpack_require__(26), exports);
// Classes
tslib_1.__exportStar(__webpack_require__(27), exports);
tslib_1.__exportStar(__webpack_require__(28), exports);
tslib_1.__exportStar(__webpack_require__(31), exports);


/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SoftDeletableEntity = exports.BaseEntity = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
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
/* 15 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseRepository = void 0;
const base_entity_1 = __webpack_require__(14);
const common_enums_1 = __webpack_require__(17);
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
/* 17 */
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
/* 18 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 19 */
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
/* 20 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


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
/* 25 */
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
/* 26 */
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
/* 27 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ApiResponse = void 0;
const common_1 = __webpack_require__(1);
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
/* 28 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PaginatedResponseDto = exports.PaginationMetaDto = exports.FilterPaginationDto = exports.DateRangePaginationDto = exports.SearchPaginationDto = exports.PaginationDto = void 0;
const tslib_1 = __webpack_require__(4);
const class_transformer_1 = __webpack_require__(29);
const class_validator_1 = __webpack_require__(30);
const common_enums_1 = __webpack_require__(17);
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
/* 29 */
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),
/* 30 */
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),
/* 31 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BaseService = void 0;
const common_1 = __webpack_require__(1);
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
/* 32 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserProfile = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
const shared_1 = __webpack_require__(13);
const user_entity_1 = __webpack_require__(11);
let UserProfile = class UserProfile extends shared_1.BaseEntity {
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
/* 33 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Permission = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
const shared_1 = __webpack_require__(13);
const role_permission_entity_1 = __webpack_require__(34);
let Permission = class Permission extends shared_1.BaseEntity {
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
        enum: shared_1.PermissionAction
    }),
    tslib_1.__metadata("design:type", typeof (_a = typeof shared_1.PermissionAction !== "undefined" && shared_1.PermissionAction) === "function" ? _a : Object)
], Permission.prototype, "action", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_1.PermissionScope
    }),
    tslib_1.__metadata("design:type", typeof (_b = typeof shared_1.PermissionScope !== "undefined" && shared_1.PermissionScope) === "function" ? _b : Object)
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
    (0, typeorm_1.Column)({ default: true }),
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
/* 34 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RolePermission = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
const shared_1 = __webpack_require__(13);
const permission_entity_1 = __webpack_require__(33);
let RolePermission = class RolePermission extends shared_1.BaseEntity {
};
exports.RolePermission = RolePermission;
tslib_1.__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: shared_1.UserRole
    }),
    tslib_1.__metadata("design:type", typeof (_a = typeof shared_1.UserRole !== "undefined" && shared_1.UserRole) === "function" ? _a : Object)
], RolePermission.prototype, "role", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ name: 'permission_id' }),
    tslib_1.__metadata("design:type", String)
], RolePermission.prototype, "permissionId", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)({ default: true }),
    tslib_1.__metadata("design:type", Boolean)
], RolePermission.prototype, "isActive", void 0);
tslib_1.__decorate([
    (0, typeorm_1.ManyToOne)(() => permission_entity_1.Permission, permission => permission.rolePermissions),
    (0, typeorm_1.JoinColumn)({ name: 'permission_id' }),
    tslib_1.__metadata("design:type", typeof (_b = typeof permission_entity_1.Permission !== "undefined" && permission_entity_1.Permission) === "function" ? _b : Object)
], RolePermission.prototype, "permission", void 0);
exports.RolePermission = RolePermission = tslib_1.__decorate([
    (0, typeorm_1.Entity)('role_permissions'),
    (0, typeorm_1.Index)(['role', 'permissionId'], { unique: true })
], RolePermission);


/***/ }),
/* 35 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UserRepository = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(6);
const typeorm_2 = __webpack_require__(12);
const shared_1 = __webpack_require__(13);
const user_entity_1 = __webpack_require__(11);
const user_profile_entity_1 = __webpack_require__(32);
let UserRepository = class UserRepository extends shared_1.BaseRepository {
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
            role: role ? role : shared_1.UserRole.USER
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
/* 36 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PermissionRepository = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(6);
const typeorm_2 = __webpack_require__(12);
const shared_1 = __webpack_require__(13);
const permission_entity_1 = __webpack_require__(33);
const role_permission_entity_1 = __webpack_require__(34);
let PermissionRepository = class PermissionRepository extends shared_1.BaseRepository {
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
                role: createRolePermissionDto.role,
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
    async removePermissionFromRole(role, permissionId) {
        const result = await this.rolePermissionRepository.delete({
            role,
            permissionId
        });
        return result.affected > 0;
    }
    async findPermissionsByRole(role) {
        const rolePermissions = await this.rolePermissionRepository.find({
            where: {
                role,
                isActive: true
            },
            relations: ['permission']
        });
        return rolePermissions
            .map(rp => rp.permission)
            .filter(permission => permission.isActive);
    }
    async findRolePermissions(role) {
        return await this.rolePermissionRepository.find({
            where: {
                role,
                isActive: true
            },
            relations: ['permission']
        });
    }
    // Permission checking
    async hasPermission(role, resource, action, scope) {
        const permission = await this.getPermission(role, resource, action, scope);
        return permission !== null;
    }
    async getPermission(role, resource, action, scope) {
        const rolePermission = await this.rolePermissionRepository
            .createQueryBuilder('rp')
            .innerJoin('rp.permission', 'permission')
            .where('rp.role = :role', { role })
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
/* 37 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PermissionChecker = exports.PermissionService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const permission_repository_1 = __webpack_require__(36);
const shared_1 = __webpack_require__(13);
let PermissionService = class PermissionService {
    constructor(permissionRepository) {
        this.permissionRepository = permissionRepository;
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
        const createRolePermissionDto = {
            role,
            permissionId
        };
        return await this.permissionRepository.assignPermissionToRole(createRolePermissionDto);
    }
    async removePermissionFromRole(role, permissionId) {
        const removed = await this.permissionRepository.removePermissionFromRole(role, permissionId);
        if (!removed) {
            throw new common_1.NotFoundException('Role permission assignment not found');
        }
    }
    async getRolePermissions(role) {
        return await this.permissionRepository.findPermissionsByRole(role);
    }
    // Permission checking (AccessControl-style API)
    can(role) {
        return new PermissionChecker(role, this.permissionRepository);
    }
    // Grant permissions in AccessControl style
    async grant(grants) {
        for (const grant of grants) {
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
            }
            // Assign permission to role
            await this.permissionRepository.assignPermissionToRole({
                role: grant.role,
                permissionId: permission.id
            });
        }
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
exports.PermissionService = PermissionService;
exports.PermissionService = PermissionService = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof permission_repository_1.PermissionRepository !== "undefined" && permission_repository_1.PermissionRepository) === "function" ? _a : Object])
], PermissionService);
// AccessControl-style permission checker
class PermissionChecker {
    constructor(role, permissionRepository) {
        this.role = role;
        this.permissionRepository = permissionRepository;
    }
    async createOwn(resource) {
        return this.checkPermission(resource, shared_1.PermissionAction.CREATE, shared_1.PermissionScope.OWN);
    }
    async createAny(resource) {
        return this.checkPermission(resource, shared_1.PermissionAction.CREATE, shared_1.PermissionScope.ANY);
    }
    async readOwn(resource) {
        return this.checkPermission(resource, shared_1.PermissionAction.READ, shared_1.PermissionScope.OWN);
    }
    async readAny(resource) {
        return this.checkPermission(resource, shared_1.PermissionAction.READ, shared_1.PermissionScope.ANY);
    }
    async updateOwn(resource) {
        return this.checkPermission(resource, shared_1.PermissionAction.UPDATE, shared_1.PermissionScope.OWN);
    }
    async updateAny(resource) {
        return this.checkPermission(resource, shared_1.PermissionAction.UPDATE, shared_1.PermissionScope.ANY);
    }
    async deleteOwn(resource) {
        return this.checkPermission(resource, shared_1.PermissionAction.DELETE, shared_1.PermissionScope.OWN);
    }
    async deleteAny(resource) {
        return this.checkPermission(resource, shared_1.PermissionAction.DELETE, shared_1.PermissionScope.ANY);
    }
    async checkPermission(resource, action, scope) {
        const permission = await this.permissionRepository.getPermission(this.role, resource, action, scope);
        return {
            granted: permission !== null,
            permission: permission || undefined,
            attributes: permission?.attributes || []
        };
    }
}
exports.PermissionChecker = PermissionChecker;


/***/ }),
/* 38 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(6);
const user_entity_1 = __webpack_require__(11);
const user_profile_entity_1 = __webpack_require__(32);
const permission_entity_1 = __webpack_require__(33);
const role_permission_entity_1 = __webpack_require__(34);
const admin_user_router_1 = __webpack_require__(39);
const admin_permission_router_1 = __webpack_require__(48);
const admin_user_service_1 = __webpack_require__(41);
const auth_module_1 = __webpack_require__(49);
const user_module_1 = __webpack_require__(10);
const auth_middleware_1 = __webpack_require__(45);
const admin_role_middleware_1 = __webpack_require__(47);
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, user_profile_entity_1.UserProfile, permission_entity_1.Permission, role_permission_entity_1.RolePermission]),
            auth_module_1.AuthModule,
            user_module_1.UserModule,
        ],
        controllers: [],
        providers: [
            admin_user_service_1.AdminUserService,
            admin_user_router_1.AdminUserRouter,
            admin_permission_router_1.AdminPermissionRouter,
            auth_middleware_1.AuthMiddleware,
            admin_role_middleware_1.AdminRoleMiddleware,
        ],
        exports: [admin_user_service_1.AdminUserService],
    })
], AdminModule);


/***/ }),
/* 39 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h, _j;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminUserRouter = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const nestjs_trpc_1 = __webpack_require__(7);
const zod_1 = __webpack_require__(40);
const admin_user_service_1 = __webpack_require__(41);
const auth_middleware_1 = __webpack_require__(45);
const admin_role_middleware_1 = __webpack_require__(47);
const shared_1 = __webpack_require__(13);
// Zod schemas for validation
const userRoleSchema = zod_1.z.enum([
    shared_1.UserRole.SUPER_ADMIN,
    shared_1.UserRole.ADMIN,
    shared_1.UserRole.MANAGER,
    shared_1.UserRole.USER,
    shared_1.UserRole.GUEST
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
/* 40 */
/***/ ((module) => {

module.exports = require("zod");

/***/ }),
/* 41 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminUserService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const user_repository_1 = __webpack_require__(35);
const auth_service_1 = __webpack_require__(42);
const shared_1 = __webpack_require__(13);
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
            role: createUserDto.role || shared_1.UserRole.USER,
        };
        const user = await this.userRepository.createUser(userData);
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
/* 42 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const jwt_1 = __webpack_require__(43);
const user_repository_1 = __webpack_require__(35);
const bcrypt = tslib_1.__importStar(__webpack_require__(44));
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
/* 43 */
/***/ ((module) => {

module.exports = require("@nestjs/jwt");

/***/ }),
/* 44 */
/***/ ((module) => {

module.exports = require("bcryptjs");

/***/ }),
/* 45 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthMiddleware = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const server_1 = __webpack_require__(46);
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
/* 46 */
/***/ ((module) => {

module.exports = require("@trpc/server");

/***/ }),
/* 47 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminRoleMiddleware = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const server_1 = __webpack_require__(46);
const shared_1 = __webpack_require__(13);
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
        if (ctx.user.role !== shared_1.UserRole.ADMIN && ctx.user.role !== shared_1.UserRole.SUPER_ADMIN) {
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
/* 48 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AdminPermissionRouter = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const nestjs_trpc_1 = __webpack_require__(7);
const zod_1 = __webpack_require__(40);
const permission_service_1 = __webpack_require__(37);
const auth_middleware_1 = __webpack_require__(45);
const admin_role_middleware_1 = __webpack_require__(47);
const shared_1 = __webpack_require__(13);
// Zod schemas for validation
const permissionActionSchema = zod_1.z.enum([
    shared_1.PermissionAction.CREATE,
    shared_1.PermissionAction.READ,
    shared_1.PermissionAction.UPDATE,
    shared_1.PermissionAction.DELETE,
    shared_1.PermissionAction.EXECUTE,
    shared_1.PermissionAction.APPROVE,
    shared_1.PermissionAction.REJECT,
    shared_1.PermissionAction.PUBLISH,
    shared_1.PermissionAction.ARCHIVE
]);
const permissionScopeSchema = zod_1.z.enum([
    shared_1.PermissionScope.OWN,
    shared_1.PermissionScope.DEPARTMENT,
    shared_1.PermissionScope.ORGANIZATION,
    shared_1.PermissionScope.ANY
]);
const userRoleSchema = zod_1.z.enum([
    shared_1.UserRole.SUPER_ADMIN,
    shared_1.UserRole.ADMIN,
    shared_1.UserRole.MANAGER,
    shared_1.UserRole.USER,
    shared_1.UserRole.GUEST
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
    constructor(permissionService) {
        this.permissionService = permissionService;
    }
    // Permission CRUD operations
    async createPermission(createPermissionDto) {
        // Ensure all required fields are present for CreatePermissionDto
        const permissionData = {
            name: createPermissionDto.name,
            resource: createPermissionDto.resource,
            action: createPermissionDto.action,
            scope: createPermissionDto.scope,
            description: createPermissionDto.description,
            attributes: createPermissionDto.attributes,
        };
        return await this.permissionService.createPermission(permissionData);
    }
    async getAllPermissions(filter) {
        return await this.permissionService.getAllPermissions(filter);
    }
    async getPermissionById(input) {
        return await this.permissionService.getPermissionById(input.id);
    }
    async updatePermission(input) {
        const { id, ...updateDto } = input;
        return await this.permissionService.updatePermission(id, updateDto);
    }
    async deletePermission(input) {
        await this.permissionService.deletePermission(input.id);
    }
    // Role Permission management
    async assignPermissionToRole(input) {
        return await this.permissionService.assignPermissionToRole(input.role, input.permissionId);
    }
    async removePermissionFromRole(input) {
        await this.permissionService.removePermissionFromRole(input.role, input.permissionId);
    }
    async getRolePermissions(input) {
        return await this.permissionService.getRolePermissions(input.role);
    }
    // Grant permissions in AccessControl style
    async grantPermissions(input) {
        // Ensure all required fields are present for PermissionGrant
        const grants = input.grants.map(grant => ({
            role: grant.role,
            resource: grant.resource,
            action: grant.action,
            scope: grant.scope,
            attributes: grant.attributes,
        }));
        await this.permissionService.grant(grants);
    }
    // Utility: Check if a role has a specific permission
    async checkPermission(input) {
        const checker = this.permissionService.can(input.role);
        let permissionCheck;
        if (input.action === shared_1.PermissionAction.CREATE && input.scope === shared_1.PermissionScope.OWN) {
            permissionCheck = await checker.createOwn(input.resource);
        }
        else if (input.action === shared_1.PermissionAction.CREATE && input.scope === shared_1.PermissionScope.ANY) {
            permissionCheck = await checker.createAny(input.resource);
        }
        else if (input.action === shared_1.PermissionAction.READ && input.scope === shared_1.PermissionScope.OWN) {
            permissionCheck = await checker.readOwn(input.resource);
        }
        else if (input.action === shared_1.PermissionAction.READ && input.scope === shared_1.PermissionScope.ANY) {
            permissionCheck = await checker.readAny(input.resource);
        }
        else if (input.action === shared_1.PermissionAction.UPDATE && input.scope === shared_1.PermissionScope.OWN) {
            permissionCheck = await checker.updateOwn(input.resource);
        }
        else if (input.action === shared_1.PermissionAction.UPDATE && input.scope === shared_1.PermissionScope.ANY) {
            permissionCheck = await checker.updateAny(input.resource);
        }
        else if (input.action === shared_1.PermissionAction.DELETE && input.scope === shared_1.PermissionScope.OWN) {
            permissionCheck = await checker.deleteOwn(input.resource);
        }
        else if (input.action === shared_1.PermissionAction.DELETE && input.scope === shared_1.PermissionScope.ANY) {
            permissionCheck = await checker.deleteAny(input.resource);
        }
        else {
            throw new Error('Invalid permission action or scope');
        }
        return {
            granted: permissionCheck.granted,
            attributes: permissionCheck.attributes,
            permission: permissionCheck.permission,
        };
    }
};
exports.AdminPermissionRouter = AdminPermissionRouter;
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Mutation)({
        input: createPermissionSchema,
        output: permissionResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_b = typeof zod_1.z !== "undefined" && zod_1.z.infer) === "function" ? _b : Object]),
    tslib_1.__metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], AdminPermissionRouter.prototype, "createPermission", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Query)({
        input: permissionFilterSchema,
        output: zod_1.z.array(permissionResponseSchema),
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_d = typeof zod_1.z !== "undefined" && zod_1.z.infer) === "function" ? _d : Object]),
    tslib_1.__metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], AdminPermissionRouter.prototype, "getAllPermissions", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Query)({
        input: zod_1.z.object({ id: zod_1.z.string() }),
        output: permissionResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", typeof (_f = typeof Promise !== "undefined" && Promise) === "function" ? _f : Object)
], AdminPermissionRouter.prototype, "getPermissionById", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Mutation)({
        input: zod_1.z.object({ id: zod_1.z.string() }).merge(updatePermissionSchema),
        output: permissionResponseSchema,
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], AdminPermissionRouter.prototype, "updatePermission", null);
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
], AdminPermissionRouter.prototype, "deletePermission", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Mutation)({
        input: assignPermissionToRoleSchema,
        output: zod_1.z.object({
            id: zod_1.z.string(),
            role: userRoleSchema,
            permissionId: zod_1.z.string(),
            isActive: zod_1.z.boolean(),
            createdAt: zod_1.z.date(),
            updatedAt: zod_1.z.date(),
        }),
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_j = typeof zod_1.z !== "undefined" && zod_1.z.infer) === "function" ? _j : Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AdminPermissionRouter.prototype, "assignPermissionToRole", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Mutation)({
        input: removePermissionFromRoleSchema,
        output: zod_1.z.void(),
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [typeof (_k = typeof zod_1.z !== "undefined" && zod_1.z.infer) === "function" ? _k : Object]),
    tslib_1.__metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], AdminPermissionRouter.prototype, "removePermissionFromRole", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Query)({
        input: zod_1.z.object({ role: userRoleSchema }),
        output: zod_1.z.array(permissionResponseSchema),
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", typeof (_m = typeof Promise !== "undefined" && Promise) === "function" ? _m : Object)
], AdminPermissionRouter.prototype, "getRolePermissions", null);
tslib_1.__decorate([
    (0, nestjs_trpc_1.UseMiddlewares)(auth_middleware_1.AuthMiddleware, admin_role_middleware_1.AdminRoleMiddleware),
    (0, nestjs_trpc_1.Mutation)({
        input: zod_1.z.object({
            grants: zod_1.z.array(permissionGrantSchema),
        }),
        output: zod_1.z.void(),
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", typeof (_o = typeof Promise !== "undefined" && Promise) === "function" ? _o : Object)
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
        output: zod_1.z.object({
            granted: zod_1.z.boolean(),
            attributes: zod_1.z.array(zod_1.z.string()),
            permission: permissionResponseSchema.optional(),
        }),
    }),
    tslib_1.__param(0, (0, nestjs_trpc_1.Input)()),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], AdminPermissionRouter.prototype, "checkPermission", null);
exports.AdminPermissionRouter = AdminPermissionRouter = tslib_1.__decorate([
    (0, common_1.Injectable)(),
    tslib_1.__param(0, (0, common_1.Inject)(permission_service_1.PermissionService)),
    tslib_1.__metadata("design:paramtypes", [typeof (_a = typeof permission_service_1.PermissionService !== "undefined" && permission_service_1.PermissionService) === "function" ? _a : Object])
], AdminPermissionRouter);


/***/ }),
/* 49 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const jwt_1 = __webpack_require__(43);
const config_1 = __webpack_require__(5);
const typeorm_1 = __webpack_require__(6);
const passport_1 = __webpack_require__(50);
const user_entity_1 = __webpack_require__(11);
const user_profile_entity_1 = __webpack_require__(32);
const permission_entity_1 = __webpack_require__(33);
const role_permission_entity_1 = __webpack_require__(34);
const user_repository_1 = __webpack_require__(35);
const permission_repository_1 = __webpack_require__(36);
const auth_service_1 = __webpack_require__(42);
const jwt_strategy_1 = __webpack_require__(51);
const roles_guard_1 = __webpack_require__(53);
const jwt_auth_guard_1 = __webpack_require__(54);
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
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, user_profile_entity_1.UserProfile, permission_entity_1.Permission, role_permission_entity_1.RolePermission]),
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
/* 50 */
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),
/* 51 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtStrategy = void 0;
const tslib_1 = __webpack_require__(4);
const passport_jwt_1 = __webpack_require__(52);
const passport_1 = __webpack_require__(50);
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
/* 52 */
/***/ ((module) => {

module.exports = require("passport-jwt");

/***/ }),
/* 53 */
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
/* 54 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtAuthGuard = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const passport_1 = __webpack_require__(50);
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = tslib_1.__decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);


/***/ }),
/* 55 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClientModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(6);
const user_entity_1 = __webpack_require__(11);
const user_profile_entity_1 = __webpack_require__(32);
const client_user_router_1 = __webpack_require__(56);
const client_user_service_1 = __webpack_require__(57);
const auth_module_1 = __webpack_require__(49);
const auth_middleware_1 = __webpack_require__(45);
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
/* 56 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClientUserRouter = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const nestjs_trpc_1 = __webpack_require__(7);
const zod_1 = __webpack_require__(40);
const client_user_service_1 = __webpack_require__(57);
const auth_middleware_1 = __webpack_require__(45);
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
/* 57 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ClientUserService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const user_repository_1 = __webpack_require__(35);
const auth_service_1 = __webpack_require__(42);
const shared_1 = __webpack_require__(13);
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
            role: shared_1.UserRole.USER, // Client users are always regular users
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
/* 58 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TranslationModule = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(6);
const translation_entity_1 = __webpack_require__(59);
const translation_repository_1 = __webpack_require__(60);
const translation_service_1 = __webpack_require__(61);
let TranslationModule = class TranslationModule {
};
exports.TranslationModule = TranslationModule;
exports.TranslationModule = TranslationModule = tslib_1.__decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([translation_entity_1.Translation])
        ],
        providers: [
            translation_repository_1.TranslationRepository,
            translation_service_1.TranslationService
        ],
        exports: [
            translation_service_1.TranslationService,
            translation_repository_1.TranslationRepository
        ]
    })
], TranslationModule);


/***/ }),
/* 59 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Translation = void 0;
const tslib_1 = __webpack_require__(4);
const typeorm_1 = __webpack_require__(12);
const shared_1 = __webpack_require__(13);
let Translation = class Translation extends shared_1.BaseEntity {
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
/* 60 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TranslationRepository = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const typeorm_1 = __webpack_require__(6);
const typeorm_2 = __webpack_require__(12);
const shared_1 = __webpack_require__(13);
const translation_entity_1 = __webpack_require__(59);
let TranslationRepository = class TranslationRepository extends shared_1.BaseRepository {
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
/* 61 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var TranslationService_1;
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TranslationService = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const fs_1 = __webpack_require__(62);
const path_1 = __webpack_require__(63);
const translation_repository_1 = __webpack_require__(60);
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
/* 62 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 63 */
/***/ ((module) => {

module.exports = require("path");

/***/ }),
/* 64 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppContext = void 0;
const tslib_1 = __webpack_require__(4);
const common_1 = __webpack_require__(1);
const jwt_1 = __webpack_require__(43);
const permission_repository_1 = __webpack_require__(36);
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
/* 65 */
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