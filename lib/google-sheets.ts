import { google } from "googleapis"
import { Order, Product } from "@prisma/client"
import path from 'path'
import fs from 'fs'

// Order with product information for Google Sheets
interface OrderWithProduct extends Order {
  product: Product;
}

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
const CREDENTIALS_PATH = process.env.GOOGLE_SHEETS_CREDENTIALS

// Store order IDs and their corresponding row numbers
const orderRowMap = new Map<string, string>()

async function getGoogleAuth() {
  try {
    // Read credentials from the JSON file
    const credentialsPath = path.resolve(process.cwd(), CREDENTIALS_PATH || './secrets.json')
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'))

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    return auth;
  } catch (error) {
    console.error("Error initializing Google Auth:", error);
    throw error;
  }
}

// Function to ensure the Orders sheet exists
async function ensureSheetExists(sheets: any, spreadsheetId: string): Promise<void> {
  try {
    // Get all sheets in the spreadsheet
    const response = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId
    });
    
    const sheetExists = response.data.sheets.some(
      (sheet: any) => sheet.properties.title === 'Orders'
    );
    
    // If Orders sheet doesn't exist, create it
    if (!sheetExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: 'Orders',
                }
              }
            }
          ]
        }
      });
      
      // Initialize the sheet with headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: 'Orders!A1:N1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['Order ID', 'Customer Name', 'Email', 'City', 'Phone', 'Delivery Type', 'Quantity', 'Product', 'Product Price', 'Subtotal', 'Delivery Fee', 'Total', 'Status', 'Created At']]
        }
      });
    }
  } catch (error) {
    throw error;
  }
}

// Helper function to format price values
function formatPrice(price: number): string {
  return price.toFixed(2);
}

export async function addOrderToGoogleSheet(order: OrderWithProduct): Promise<void> {
  if (!SPREADSHEET_ID) {
    console.log("Google Sheets ID not configured, skipping adding order");
    return;
  }

  try {
    const auth = await getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Make sure the Orders sheet exists
    await ensureSheetExists(sheets, SPREADSHEET_ID);

    // Format the date
    const createdAt = new Date(order.createdAt).toLocaleString();
    
    // Calculate subtotal
    const subtotal = order.product.price * order.quantity;
    
    // Build the row data
    const rowData = [
      order.id, 
      order.customerName, 
      order.customerEmail, 
      order.city, 
      order.phone, 
      order.deliveryType, 
      order.quantity.toString(), 
      order.product.name, 
      formatPrice(order.product.price), 
      formatPrice(subtotal), 
      formatPrice(order.deliveryFee), 
      formatPrice(order.total), 
      order.status,
      createdAt
    ];

    // Append the order to the sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Orders!A:N',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowData]
      }
    });

    // Get the row number that was just added
    if (response.data.updates) {
      const updatedRange = response.data.updates.updatedRange;
      const match = updatedRange?.match(/Orders!A(\d+):/);
      if (match && match[1]) {
        const rowNumber = match[1];
        console.log(`Added order ${order.id} to Google Sheet at row ${rowNumber}`);
        orderRowMap.set(order.id, rowNumber);
      }
    }

    console.log(`Successfully added order ${order.id} to Google Sheet`);
  } catch (error) {
    console.error("Error adding order to Google Sheet:", error);
    throw error;
  }
}

export async function updateOrderInGoogleSheet(order: OrderWithProduct): Promise<void> {
  if (!SPREADSHEET_ID) {
    console.log("Google Sheets ID not configured, skipping update");
    return;
  }

  try {
    const auth = await getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Make sure the Orders sheet exists
    await ensureSheetExists(sheets, SPREADSHEET_ID);

    // First, find the order's row by searching for the order ID
    if (!orderRowMap.has(order.id)) {
      // If we don't have the row cached, search for it
      console.log(`Finding row for order ${order.id} in Google Sheet...`);
      
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: "Orders!A:A",
      });

      const rows = response.data.values || [];
      let rowNumber = -1;

      for (let i = 0; i < rows.length; i++) {
        if (rows[i][0] === order.id) {
          rowNumber = i + 1; // +1 because sheets are 1-indexed
          orderRowMap.set(order.id, rowNumber.toString());
          console.log(`Found order ${order.id} at row ${rowNumber}`);
          break;
        }
      }

      if (rowNumber === -1) {
        // Order not found in sheet, add it instead
        console.log(`Order ${order.id} not found in Google Sheet, adding it`);
        await addOrderToGoogleSheet(order);
        return;
      }
    }

    const rowId = orderRowMap.get(order.id);
    console.log(`Updating order ${order.id} status to "${order.status}" at row ${rowId}`);

    // Update only the status column (column M - index 13)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Orders!M${rowId}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[order.status]],
      },
    });

    console.log(`Successfully updated order ${order.id} status in Google Sheet`);
  } catch (error) {
    console.error("Error updating order in Google Sheet:", error);
    throw error;
  }
}