# Excel Product Import Template

This document describes the Excel template format for importing products into the system.

## Download Template

You can download the latest Excel template with real-time attribute codes by using the API endpoint:
- **Endpoint**: `GET /publicProducts/downloadExcelTemplate`
- **Authentication**: Not required (public access)
- **Response**: Base64 encoded Excel file with current attribute codes

**Note**: The downloaded file is in XLSX format with multiple sheets. Make sure your frontend handles the base64 data correctly to preserve the XLSX format.

The downloaded template includes:
- **Template** sheet: Sample data with proper column headers
- **Attribute Codes** sheet: All available attributes and their values (real-time)
- **Instructions** sheet: Detailed usage instructions

## Column Headers

### Basic Product Information
- **Name**: Product name (required)
- **SKU**: Stock Keeping Unit (optional, but recommended)
- **Description**: Product description (optional)
- **Status**: Product status - `active`, `inactive`, `discontinued`, `draft` (optional, defaults to `draft`)
- **Is Active**: Whether product is active - `true`/`false`, `1`/`0`, `yes`/`no` (optional, defaults to `true`)
- **Is Featured**: Whether product is featured - `true`/`false`, `1`/`0`, `yes`/`no` (optional, defaults to `false`)
- **Brand ID**: Brand identifier (UUID or brand name)
- **Category IDs**: Comma-separated category IDs (UUIDs)
- **Tags**: Comma-separated tag names

### Product Images
- **Product Image**: Comma-separated URLs of product images (will be reuploaded to active storage)
- **Product Images**: Alternative column name for product images

### Variant Information
- **Variant Name**: Name of the product variant (optional, defaults to product name)
- **Variant SKU**: SKU for the specific variant (optional)
- **Variant Barcode**: Barcode for the variant (optional)
- **Price**: Selling price (required for variants)
- **Compare At Price**: Original/compare price (optional)
- **Cost Price**: Cost price (optional)
- **Stock Quantity**: Available stock quantity (optional, defaults to 0)
- **Low Stock Threshold**: Low stock alert threshold (optional)
- **Track Inventory**: Whether to track inventory - `true`/`false` (optional, defaults to `true`)
- **Allow Backorders**: Whether to allow backorders - `true`/`false` (optional, defaults to `false`)
- **Variant Image**: URL of variant image (will be reuploaded to active storage)
- **Variant Image URL**: Alternative column name for variant image
- **Variant Is Active**: Whether variant is active - `true`/`false` (optional, defaults to `true`)
- **Variant Sort Order**: Sort order for variant (optional)

### Variant Attributes
For variant attributes, use column headers in the format:
- `Variant Attribute: {attribute_code}` - e.g., `Variant Attribute: color`, `Variant Attribute: size`
- `Variant Attr: {attribute_code}` - alternative format
- `Variant Option: {attribute_code}` - alternative format

The system will match attributes by:
1. Attribute code (recommended)
2. Attribute name (normalized)
3. Display name (normalized)
4. Attribute ID

## Supported Attribute Codes

The system includes these predefined attributes:

### Color (code: `color`)
Values: Red, Blue, Green, Black, White, Yellow, Purple, Orange, Pink, Gray

### Size (code: `size`)
Values: XS, S, M, L, XL, XXL, 3XL

### Material (code: `material`)
Values: Cotton, Polyester, Wool, Silk, Linen, Leather, Synthetic, Blend

### Style (code: `style`)
Values: Casual, Formal, Sport, Vintage, Modern, Classic

### Pattern (code: `pattern`)
Values: Solid, Striped, Plaid, Floral, Polka Dot, Geometric

## Template Structure

The downloadable Excel template includes three sheets:

### Sheet 1: Template
Contains sample data with all required columns. Use this as a starting point for your import.

### Sheet 2: Attribute Codes
Contains all available attributes and their values. Use this sheet to:
- Find valid attribute codes for column headers
- See available values for each attribute
- Ensure your data matches the system values

**Columns in Attribute Codes sheet:**
- **Attribute Code**: The code to use in column headers (e.g., `color`, `size`)
- **Attribute Name**: Human-readable name
- **Value Code**: The value to enter in your data
- **Value Name**: Same as Value Code
- **Display Value**: Alternative display name (if different)

### Sheet 3: Instructions
Detailed usage instructions and field descriptions.

## Example Column Headers

```
Name, SKU, Description, Status, Is Active, Product Images, Variant Name, Variant SKU, Price, Stock Quantity, Variant Attribute: color, Variant Attribute: size
```

## Example Data Rows

| Name          | SKU    | Description      | Status | Is Active | Product Images | Variant Name | Variant SKU | Price | Stock Quantity | Variant Attribute: color | Variant Attribute: size |
|---------------|--------|------------------|--------|-----------|----------------|--------------|-------------|-------|----------------|--------------------------|------------------------|
| T-Shirt       | TSHIRT001 | Cotton T-Shirt | active | true     | https://example.com/image1.jpg | Red Medium | TSHIRT001-RED-M | 25.99 | 100           | Red                     | M                      |
| T-Shirt       | TSHIRT002 | Cotton T-Shirt | active | true     | https://example.com/image2.jpg | Blue Large | TSHIRT002-BLUE-L | 25.99 | 50            | Blue                    | L                      |

## Important Notes

1. **Image URLs**: All image URLs will be automatically downloaded and reuploaded to the active storage configuration (S3, local, etc.)

2. **Grouping**: Products are grouped by SKU or name. Rows with the same SKU/name are treated as variants of the same product.

3. **Required Fields**:
   - Name (per row)
   - Price (for each variant)

4. **Attribute Values**: Can be specified as:
   - UUID (direct ID)
   - Value text (will be matched against existing attribute values)
   - Display value (will be matched against existing display values)

5. **Data Validation**: The import process includes validation and will skip invalid rows with error messages.

6. **Dry Run**: Use the `dryRun` option to validate data without actually importing.

## Error Messages

Common error messages you might encounter:
- "Invalid value 'X' for attribute 'Y'" - The attribute value doesn't exist in the system
- "Unknown variant attribute 'X'" - The attribute code/name doesn't exist in the system

To resolve these:
1. Download the latest template to get current attribute codes
2. Check the "Attribute Codes" sheet for valid attribute codes and values
3. Ensure your column headers use the correct format: "Variant Attribute: {attribute_code}"
4. Make sure your values match exactly what's in the Attribute Codes sheet