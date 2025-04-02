import { google } from "googleapis"
import { Order, OrderItem } from "@prisma/client"
import path from 'path'
import fs from 'fs'

interface OrderWithItems extends Order {
  items: (OrderItem & {
    product: {
      name: string;
    };
  })[];
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
      console.log("Creating 'Orders' sheet...");
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
      
      // Add headers to the new sheet
      await sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: 'Orders!A1:M1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [['Order ID', 'Customer Name', 'Email', 'Address', 'City', 'State', 'Zip Code', 'Country', 'Phone', 'Status', 'Total', 'Items', 'Created At']]
        }
      });
      
      console.log("'Orders' sheet created successfully with headers");
    }
  } catch (error) {
    console.error("Error ensuring sheet exists:", error);
    throw error;
  }
}

export async function addOrderToGoogleSheet(order: OrderWithItems): Promise<void> {
  if (!SPREADSHEET_ID) {
    console.warn("Google Sheets ID not configured, skipping sheet update");
    return;
  }

  try {
    const auth = await getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Make sure the Orders sheet exists before proceeding
    await ensureSheetExists(sheets, SPREADSHEET_ID);
    
    console.log(order);
    // Format order items
    const items = order.items.map(item => 
      `${item.product.name} (${item.quantity}x) - $${item.price.toFixed(2)}`
    ).join(', ');

    const values = [
      [
        order.id,
        order.customerName,
        order.customerEmail,
        order.address,
        order.city,
        order.state,
        order.zipCode,
        order.country,
        order.phone,
        order.status,
        order.total.toFixed(2),
        items,
        new Date().toISOString()
      ]
    ];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Orders!A2',  // Start appending after the header row
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: values,
      }
    });

    if (response.data.updates?.updatedRange) {
      const range = response.data.updates.updatedRange;
      const rowId = range.split("!")[1].split(":")[0].replace(/[A-Z]/g, "");
      orderRowMap.set(order.id, rowId);
      console.log(`Order ${order.id} added to Google Sheet at row ${rowId}`);
    }
  } catch (error) {
    console.error("Error adding order to Google Sheet:", error);
    throw error; // Re-throw to allow the caller to handle it
  }
}

export async function updateOrderInGoogleSheet(order: OrderWithItems): Promise<void> {
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

    // Update only the status column (column J - index 9)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Orders!J${rowId}`,
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