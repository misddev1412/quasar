# Product Management System Setup

This document explains how to set up and run the product management system that has been implemented.

## Database Migration

To create the product management tables in your database, run the migration:

```bash
# Navigate to the backend directory
cd apps/backend

# Run the migration
npm run migration:run
# or if using yarn
yarn migration:run
```

The migration will create the following tables:
- `brands` - Product brands
- `categories` - Hierarchical product categories
- `attributes` - Product attributes (color, size, etc.)
- `attribute_values` - Predefined attribute values
- `product_tags` - Tags for products
- `warranties` - Warranty information
- `products` - Main products table
- `product_variants` - Product variations
- `product_attributes` - Product-specific attributes
- `suppliers` - Vendor information
- `purchase_orders` - Purchase orders
- `purchase_order_items` - Purchase order line items
- `inventory_transactions` - Stock movement tracking
- `product_product_tags` - Many-to-many junction table

## Sample Data (Optional)

To populate the database with sample data, you can run the seeder:

```bash
# Create sample data script (add this to your package.json scripts)
npm run seed:products
```

The seeder will create:
- Sample brands (Apple, Samsung, Sony, Nike, Adidas)
- Product categories with subcategories
- Common attributes (color, size, material, screen_size)
- Attribute values (colors, sizes)
- Sample product tags
- Warranty templates
- Sample suppliers

## API Endpoints

Once the system is running, the following tRPC endpoints will be available:

### Products
- `adminProduct.products.getAll` - List products with pagination
- `adminProduct.products.getById` - Get single product
- `adminProduct.products.create` - Create new product
- `adminProduct.products.update` - Update product
- `adminProduct.products.delete` - Delete product

### Brands
- `adminProduct.brands.getAll` - List brands
- `adminProduct.brands.getById` - Get single brand
- `adminProduct.brands.create` - Create new brand
- `adminProduct.brands.update` - Update brand
- `adminProduct.brands.delete` - Delete brand

### Categories
- `adminProduct.categories.getAll` - List categories
- `adminProduct.categories.getTree` - Get hierarchical category tree
- `adminProduct.categories.create` - Create new category
- `adminProduct.categories.update` - Update category
- `adminProduct.categories.delete` - Delete category

### Suppliers
- `adminProduct.suppliers.getAll` - List suppliers
- `adminProduct.suppliers.getById` - Get single supplier
- `adminProduct.suppliers.create` - Create new supplier
- `adminProduct.suppliers.update` - Update supplier
- `adminProduct.suppliers.delete` - Delete supplier

### Inventory
- `adminProduct.inventory.getTransactions` - List inventory transactions
- `adminProduct.inventory.adjustStock` - Adjust stock levels
- `adminProduct.inventory.getTransactionsByVariant` - Get transactions for specific variant

## Admin Interface

The admin interface includes the following pages:

- `/products` - Products list and management
- `/products/brands` - Brand management
- `/products/categories` - Category management (hierarchical tree view)
- `/products/suppliers` - Supplier management

## Features

### Products
- Full product CRUD operations
- SKU management
- Status tracking (Draft, Active, Inactive, Discontinued)
- Brand and category associations
- Image management
- SEO metadata

### Brands
- Brand information with logos
- Website links
- Product count tracking
- Active/inactive status

### Categories
- Hierarchical category structure
- Unlimited nesting levels
- Sort ordering
- Image support
- Product count tracking

### Inventory
- Stock level tracking
- Transaction history
- Multiple transaction types (Purchase, Sale, Adjustment, Return, Damage)
- Automatic stock updates

### Purchase Orders
- Complete procurement workflow
- Supplier management
- Approval process
- Receiving workflow
- Automatic inventory updates

## Database Schema Highlights

- **Relationships**: Proper foreign keys and constraints
- **Indexes**: Performance optimized with strategic indexes
- **Data Types**: Appropriate data types for each field
- **Constraints**: Check constraints for enums and data validation
- **Soft Deletes**: Where appropriate for audit trails

## Next Steps

1. Run the migration to create tables
2. Optionally run the seeder for sample data
3. Access the admin interface at `/products`
4. Start creating products, brands, and categories

## Customization

The system is designed to be extensible. You can:
- Add more product attributes
- Create custom product types
- Extend the inventory system
- Add more supplier information fields
- Customize the admin interface

## Troubleshooting

If you encounter issues:

1. **Migration fails**: Check database connection and permissions
2. **Entity not found**: Ensure all entities are imported in the TypeORM configuration
3. **TypeScript errors**: Check that all dependencies are installed
4. **UI not loading**: Verify that translations are loaded properly

The system follows the existing codebase patterns and integrates seamlessly with your authentication, theming, and internationalization systems.